import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Trophy, Plus, UserPlus, Crown, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { LoadingCard } from '@/components/LoadingCard';

interface Team {
  id: string;
  name: string;
  description: string | null;
  total_points: number;
  max_members: number;
  created_by: string;
  member_count?: number;
  is_member?: boolean;
  user_role?: 'admin' | 'member';
}

export default function Teams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  
  useKeyboardShortcuts();

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      // Fetch all public teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('is_public', true)
        .order('total_points', { ascending: false });

      if (teamsError) throw teamsError;

      // Fetch user's team memberships
      const { data: membershipsData, error: membershipsError } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', user?.id);

      if (membershipsError) throw membershipsError;

      const membershipMap = new Map(
        membershipsData?.map(m => [m.team_id, m.role]) || []
      );

      // Fetch member counts for each team
      const enrichedTeams = await Promise.all(
        (teamsData || []).map(async (team) => {
          const { count } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id);

          return {
            ...team,
            member_count: count || 0,
            is_member: membershipMap.has(team.id),
            user_role: membershipMap.get(team.id) as 'admin' | 'member' | undefined,
          };
        })
      );

      const userTeams = enrichedTeams.filter(t => t.is_member);
      const otherTeams = enrichedTeams.filter(t => !t.is_member);

      setMyTeams(userTeams);
      setTeams(otherTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    if (!user || !newTeam.name.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    try {
      // Create team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: newTeam.name,
          description: newTeam.description || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamData.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      toast.success('Team created successfully! 🎉');
      setCreateDialogOpen(false);
      setNewTeam({ name: '', description: '' });
      fetchTeams();
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    }
  };

  const joinTeam = async (teamId: string, teamName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: user.id,
          role: 'member',
        });

      if (error) throw error;

      toast.success(`Joined ${teamName}! 🎉`);
      fetchTeams();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('You are already a member of this team');
      } else {
        console.error('Error joining team:', error);
        toast.error('Failed to join team');
      }
    }
  };

  const leaveTeam = async (teamId: string, teamName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(`Left ${teamName}`);
      fetchTeams();
    } catch (error) {
      console.error('Error leaving team:', error);
      toast.error('Failed to leave team');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg mb-4">
                Please log in to view and join teams.
              </p>
              <Button onClick={() => window.location.href = "/auth"}>
                Log In
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <h1 className="text-4xl font-bold mb-8">Teams</h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        </main>
      </div>
    );
  }

  const TeamCard = ({ team, isMember = false }: { team: Team; isMember?: boolean }) => (
    <Card className={`hover:shadow-lg transition-all ${isMember ? 'border-primary bg-primary/5' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              {team.name}
              {team.user_role === 'admin' && (
                <Crown className="h-5 w-5 text-gold" />
              )}
            </CardTitle>
            {team.description && (
              <CardDescription className="mt-2">{team.description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{team.member_count}/{team.max_members} members</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-primary">
            <Trophy className="h-4 w-4" />
            {team.total_points} pts
          </div>
        </div>

        {isMember ? (
          <Button
            onClick={() => leaveTeam(team.id, team.name)}
            variant="outline"
            className="w-full"
            disabled={team.user_role === 'admin'}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {team.user_role === 'admin' ? 'Team Admin' : 'Leave Team'}
          </Button>
        ) : (
          <Button
            onClick={() => joinTeam(team.id, team.name)}
            className="w-full"
            disabled={team.member_count >= team.max_members}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {team.member_count >= team.max_members ? 'Team Full' : 'Join Team'}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="h-10 w-10 text-primary" />
              Teams
            </h1>
            <p className="text-muted-foreground text-lg">
              Join a team to collaborate and compete together
            </p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Team</DialogTitle>
                <DialogDescription>
                  Build your climate action squad and compete together
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Team Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter team name"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What's your team about?"
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button onClick={createTeam} className="w-full">
                  Create Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* My Teams */}
        {myTeams.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">My Teams</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myTeams.map((team) => (
                <TeamCard key={team.id} team={team} isMember={true} />
              ))}
            </div>
          </div>
        )}

        {/* All Teams */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {myTeams.length > 0 ? 'Other Teams' : 'All Teams'}
          </h2>
          {teams.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-lg mb-2">
                  {myTeams.length > 0 ? 'No other teams available' : 'No teams yet'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Be the first to create a team!
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

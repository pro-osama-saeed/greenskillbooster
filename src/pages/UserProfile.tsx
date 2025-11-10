import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, MapPin, Calendar, Award, Flame, Target } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  created_at: string;
}

interface UserStats {
  total_actions: number;
  total_points: number;
  current_streak: number;
  longest_streak: number;
}

interface Achievement {
  achievement_name: string;
  achievement_description: string;
  achievement_icon: string;
  earned_at: string;
  points_awarded: number;
}

interface ClimateAction {
  id: string;
  category: string;
  story: string;
  city: string;
  country: string;
  created_at: string;
  photo_url: string;
}

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [actions, setActions] = useState<ClimateAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      toast.error('Failed to load profile');
      navigate('/');
      return;
    }

    // Fetch stats
    const { data: statsData } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch achievements
    const { data: achievementsData } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    // Fetch public actions
    const { data: actionsData } = await supabase
      .from('climate_actions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(10);

    setProfile(profileData);
    setStats(statsData);
    setAchievements(achievementsData || []);
    setActions(actionsData || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || !stats) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="md:col-span-3">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-3xl">
                  {profile.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{profile.username}</h1>
                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.total_actions}</div>
                    <div className="text-sm text-muted-foreground">Actions</div>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.total_points}</div>
                    <div className="text-sm text-muted-foreground">Points</div>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                      <Flame className="w-5 h-5" />
                      {stats.current_streak}
                    </div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <div className="text-2xl font-bold text-primary">{achievements.length}</div>
                    <div className="text-sm text-muted-foreground">Achievements</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="actions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="actions">Recent Actions</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-4">
          {actions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No public actions yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {actions.map((action) => (
                <Card key={action.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge>{action.category.replace('_', ' ')}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {action.photo_url && (
                      <img 
                        src={action.photo_url} 
                        alt="Action" 
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                    )}
                    <p className="text-sm mb-2">{action.story}</p>
                    {(action.city || action.country) && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {[action.city, action.country].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          {achievements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No achievements yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => (
                <Card key={achievement.achievement_name}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{achievement.achievement_icon}</span>
                      <div>
                        <CardTitle className="text-lg">{achievement.achievement_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {achievement.achievement_description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(achievement.earned_at), { addSuffix: true })}
                      </span>
                      <Badge variant="secondary">+{achievement.points_awarded} pts</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

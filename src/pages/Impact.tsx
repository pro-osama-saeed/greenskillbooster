import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Trophy, Zap, Target, TrendingUp, Trash2, ArrowLeft, BarChart3 } from 'lucide-react';
import { Header } from '@/components/Header';
import { PrivacySettings } from '@/components/PrivacySettings';
import { ProgressChart } from '@/components/ProgressChart';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { GoalCard } from '@/components/GoalCard';
import { SetGoalDialog } from '@/components/SetGoalDialog';
import { ComparativeAnalytics } from '@/components/ComparativeAnalytics';
import { toast } from 'sonner';

interface UserStats {
  total_actions: number;
  total_points: number;
  current_streak: number;
  longest_streak: number;
}

interface Action {
  id: string;
  category: string;
  story: string | null;
  photo_url: string | null;
  created_at: string;
  city: string | null;
  country: string | null;
  points_awarded: number;
}

interface Goal {
  id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  category?: string;
  period_start: string;
  period_end: string;
  completed: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  tree_planting: '🌳 Tree Planting',
  water_saving: '💧 Water Saving',
  energy_conservation: '⚡ Energy',
  teaching: '📚 Teaching',
  recycling: '♻️ Recycling',
  transportation: '🚲 Transport',
  other: '🌍 Other'
};

export default function Impact() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [communityAverage, setCommunityAverage] = useState({ actions: 0, points: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      // Fetch user stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (statsError) throw statsError;
      setStats(statsData);

      // Fetch user actions
      const { data: actionsData, error: actionsError } = await supabase
        .from('climate_actions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (actionsError) throw actionsError;
      setActions(actionsData || []);

      // Fetch user goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;
      setGoals(goalsData || []);

      // Fetch community averages
      const { data: avgData, error: avgError } = await supabase
        .from('user_stats')
        .select('total_actions, total_points, current_streak');

      if (!avgError && avgData) {
        const avgActions = avgData.reduce((sum, s) => sum + s.total_actions, 0) / avgData.length;
        const avgPoints = avgData.reduce((sum, s) => sum + s.total_points, 0) / avgData.length;
        const avgStreak = avgData.reduce((sum, s) => sum + s.current_streak, 0) / avgData.length;
        setCommunityAverage({
          actions: Math.round(avgActions),
          points: Math.round(avgPoints),
          streak: Math.round(avgStreak),
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load your impact data');
    } finally {
      setLoading(false);
    }
  };

  const deleteAction = async (actionId: string) => {
    if (!confirm('Are you sure you want to delete this action?')) return;

    try {
      const { error } = await supabase
        .from('climate_actions')
        .delete()
        .eq('id', actionId);

      if (error) throw error;
      
      toast.success('Action deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting action:', error);
      toast.error('Failed to delete action');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const progressData = actions
    .slice(0, 30)
    .reverse()
    .reduce((acc: any[], action) => {
      const date = new Date(action.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = acc.find((d) => d.date === date);
      if (existing) {
        existing.actions += 1;
        existing.points += action.points_awarded;
      } else {
        acc.push({ date, actions: 1, points: action.points_awarded });
      }
      return acc;
    }, []);

  const categoryData = Object.entries(
    actions.reduce((acc: Record<string, number>, action) => {
      const label = CATEGORY_LABELS[action.category] || action.category;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Your Impact Analytics
          </h1>
          <p className="text-muted-foreground">Comprehensive insights into your climate action journey</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="actions">Actions Log</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-card border-primary/10">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_actions}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-primary/10">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_points}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-primary/10">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.current_streak} days</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-primary/10">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.longest_streak} days</div>
                  </CardContent>
                </Card>
              </div>
            )}

            <PrivacySettings />

            {actions.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                <ProgressChart data={progressData} />
                <CategoryBreakdown data={categoryData} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {stats && (
              <ComparativeAnalytics
                userStats={{
                  actions: stats.total_actions,
                  points: stats.total_points,
                  streak: stats.current_streak,
                }}
                communityAverage={communityAverage}
              />
            )}

            {actions.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                <ProgressChart data={progressData} />
                <CategoryBreakdown data={categoryData} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Your Goals</h2>
                <p className="text-muted-foreground">Set and track your climate action goals</p>
              </div>
              <SetGoalDialog onGoalCreated={fetchData} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onDelete={fetchData} />
              ))}
            </div>

            {goals.length === 0 && (
              <Card className="bg-gradient-card border-primary/10">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No goals set yet</p>
                  <SetGoalDialog onGoalCreated={fetchData} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">Your Actions Log</h2>
              <p className="text-muted-foreground">Complete history of your climate actions</p>
            </div>

            <div className="grid gap-4">
              {actions.map((action) => (
                <Card key={action.id} className="bg-gradient-card border-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {action.photo_url && (
                        <img
                          src={action.photo_url}
                          alt="Action"
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">
                            {CATEGORY_LABELS[action.category]}
                          </Badge>
                          {action.city && action.country && (
                            <span className="text-sm text-muted-foreground">
                              {action.city}, {action.country}
                            </span>
                          )}
                        </div>
                        {action.story && (
                          <p className="text-sm mb-2">{action.story}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(action.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAction(action.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {actions.length === 0 && (
              <Card className="bg-gradient-card border-primary/10">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">
                    You haven't tracked any actions yet
                  </p>
                  <Button onClick={() => navigate('/track-action')}>
                    Track Your First Action
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

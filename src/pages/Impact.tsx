import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Trophy, Zap, Target, TrendingUp, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
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
          <h1 className="text-4xl font-bold mb-2">Your Impact</h1>
          <p className="text-muted-foreground">Track your climate action journey</p>
        </div>

        {stats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_actions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_points}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.current_streak} days</div>
              </CardContent>
            </Card>

            <Card>
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

        <div className="mb-4">
          <h2 className="text-2xl font-bold">Your Actions</h2>
        </div>

        <div className="grid gap-4">
          {actions.map((action) => (
            <Card key={action.id}>
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
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven't tracked any actions yet
            </p>
            <Button onClick={() => navigate('/track-action')}>
              Track Your First Action
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

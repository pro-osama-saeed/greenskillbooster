import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Clock, Target, CheckCircle2, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { LoadingCard } from '@/components/LoadingCard';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  points_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  expires_at: string;
  completed?: boolean;
}

const difficultyColors = {
  easy: 'bg-green-500/10 text-green-600 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  hard: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const difficultyIcons = {
  easy: '⭐',
  medium: '⭐⭐',
  hard: '⭐⭐⭐',
};

export default function Challenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState(0);
  
  useKeyboardShortcuts();

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user]);

  const fetchChallenges = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('active_date', today)
        .gt('expires_at', new Date().toISOString());

      if (challengesError) throw challengesError;

      // Fetch user's completions
      const { data: completionsData, error: completionsError } = await supabase
        .from('user_challenge_completions')
        .select('challenge_id')
        .eq('user_id', user?.id);

      if (completionsError) throw completionsError;

      const completedIds = new Set(completionsData?.map(c => c.challenge_id) || []);
      
      const enrichedChallenges = (challengesData || []).map(challenge => ({
        ...challenge,
        difficulty: challenge.difficulty as 'easy' | 'medium' | 'hard',
        completed: completedIds.has(challenge.id),
      }));

      setChallenges(enrichedChallenges);
      setCompletedToday(enrichedChallenges.filter(c => c.completed).length);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const completeChallenge = async (challengeId: string, points: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_challenge_completions')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
        });

      if (error) throw error;

      // Update user stats manually - increment total_points
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('total_points')
        .eq('user_id', user.id)
        .single();
      
      if (currentStats) {
        await supabase
          .from('user_stats')
          .update({ total_points: (currentStats.total_points || 0) + points })
          .eq('user_id', user.id);
      }

      toast.success(`Challenge completed! +${points} points 🎉`);
      fetchChallenges();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('You already completed this challenge!');
      } else {
        console.error('Error completing challenge:', error);
        toast.error('Failed to complete challenge');
      }
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg mb-4">
                Please log in to view daily challenges.
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
          <h1 className="text-4xl font-bold mb-8">Daily Challenges</h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        </main>
      </div>
    );
  }

  const totalChallenges = challenges.length;
  const progressPercentage = totalChallenges > 0 ? (completedToday / totalChallenges) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Flame className="h-10 w-10 text-accent" />
            Daily Challenges
          </h1>
          <p className="text-muted-foreground text-lg">
            Complete challenges to earn extra points and bonuses
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Today's Progress</span>
              <span className="text-2xl font-bold text-primary">
                {completedToday}/{totalChallenges}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">
              {completedToday === totalChallenges
                ? '🎉 All challenges completed! Come back tomorrow for more.'
                : `${totalChallenges - completedToday} challenge${totalChallenges - completedToday > 1 ? 's' : ''} remaining`}
            </p>
          </CardContent>
        </Card>

        {/* Challenges Grid */}
        {challenges.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {challenges.map((challenge) => (
              <Card
                key={challenge.id}
                className={`relative overflow-hidden transition-all ${
                  challenge.completed
                    ? 'border-success bg-success/5'
                    : 'hover:shadow-lg hover:border-primary/50'
                }`}
              >
                {challenge.completed && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={difficultyColors[challenge.difficulty]}>
                      {difficultyIcons[challenge.difficulty]} {challenge.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{challenge.title}</CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {getTimeRemaining(challenge.expires_at)}
                    </div>
                    <div className="flex items-center gap-2 font-bold text-primary">
                      <Trophy className="h-4 w-4" />
                      +{challenge.points_reward} pts
                    </div>
                  </div>

                  <Button
                    onClick={() => completeChallenge(challenge.id, challenge.points_reward)}
                    disabled={challenge.completed}
                    className="w-full"
                    variant={challenge.completed ? 'outline' : 'default'}
                  >
                    {challenge.completed ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Complete Challenge
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground text-lg mb-2">
                No challenges available today
              </p>
              <p className="text-sm text-muted-foreground">
                Check back tomorrow for new challenges!
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

import { Header } from "@/components/Header";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { BadgeDetailsModal } from "@/components/BadgeDetailsModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import { Download, Award, TrendingUp, Calendar, Zap, Trophy } from "lucide-react";
import { toast } from "sonner";
import { lessons } from "@/data/lessons";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Achievement {
  id: string;
  achievement_name: string;
  achievement_description: string;
  achievement_icon: string;
  achievement_type: string;
  points_awarded: number;
  earned_at: string;
}

const Badges = () => {
  const { t } = useLanguage();
  const { progress } = useProgress();
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAchievements();
      fetchUserStats();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user?.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setUserStats(data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleDownloadCertificate = () => {
    toast.success("Certificate downloaded", {
      description: "Your climate skills certificate has been saved!",
    });
  };

  const handleBadgeClick = (badge: Achievement) => {
    setSelectedBadge(badge);
    setIsModalOpen(true);
  };

  const allLessonsCompleted = progress.completedLessons.length === lessons.length;

  const categorizeAchievements = () => {
    return {
      streak: achievements.filter(a => a.achievement_type.startsWith('streak_')),
      action: achievements.filter(a => a.achievement_type.startsWith('actions_') || a.achievement_type === 'first_action'),
      category: achievements.filter(a => a.achievement_type.startsWith('category_')),
      special: achievements.filter(a => a.achievement_type.startsWith('event_') || a.achievement_type === 'early_adopter'),
    };
  };

  const categorized = categorizeAchievements();
  const totalPoints = achievements.reduce((sum, a) => sum + a.points_awarded, 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg mb-4">
                Please log in to view your badges and achievements.
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{t("badges")}</h1>
            <p className="text-muted-foreground text-lg">
              Your achievements, milestones, and certificates
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Badges</p>
                    <p className="text-3xl font-bold text-primary">{achievements.length}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                    <p className="text-3xl font-bold text-primary">{totalPoints}</p>
                  </div>
                  <Zap className="w-8 h-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <p className="text-3xl font-bold text-primary">{userStats?.current_streak || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Actions</p>
                    <p className="text-3xl font-bold text-primary">{userStats?.total_actions || 0}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {allLessonsCompleted && (
            <Card className="border-primary bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>🎓 Climate Skills Certificate</span>
                  <Button onClick={handleDownloadCertificate} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {t("downloadCertificate")}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Congratulations! You've completed all core lessons and earned your Climate Skills Certificate.
                </p>
              </CardContent>
            </Card>
          )}

          {achievements.length > 0 ? (
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All ({achievements.length})</TabsTrigger>
                <TabsTrigger value="streak">🔥 Streaks ({categorized.streak.length})</TabsTrigger>
                <TabsTrigger value="action">⚡ Actions ({categorized.action.length})</TabsTrigger>
                <TabsTrigger value="category">⭐ Categories ({categorized.category.length})</TabsTrigger>
                <TabsTrigger value="special">🎉 Special ({categorized.special.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} onClick={() => handleBadgeClick(achievement)}>
                      <BadgeDisplay
                        badge={{
                          id: achievement.id,
                          name: achievement.achievement_name,
                          description: achievement.achievement_description,
                          icon: achievement.achievement_icon,
                          earnedDate: achievement.earned_at,
                          type: achievement.points_awarded >= 200 ? 'gold' : achievement.points_awarded >= 50 ? 'silver' : 'bronze'
                        }}
                        onClick={() => handleBadgeClick(achievement)}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="streak" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorized.streak.map((achievement) => (
                    <div key={achievement.id}>
                      <BadgeDisplay
                        badge={{
                          id: achievement.id,
                          name: achievement.achievement_name,
                          description: achievement.achievement_description,
                          icon: achievement.achievement_icon,
                          earnedDate: achievement.earned_at,
                          type: 'gold'
                        }}
                        onClick={() => handleBadgeClick(achievement)}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="action" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorized.action.map((achievement) => (
                    <div key={achievement.id}>
                      <BadgeDisplay
                        badge={{
                          id: achievement.id,
                          name: achievement.achievement_name,
                          description: achievement.achievement_description,
                          icon: achievement.achievement_icon,
                          earnedDate: achievement.earned_at,
                          type: 'silver'
                        }}
                        onClick={() => handleBadgeClick(achievement)}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="category" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorized.category.map((achievement) => (
                    <div key={achievement.id}>
                      <BadgeDisplay
                        badge={{
                          id: achievement.id,
                          name: achievement.achievement_name,
                          description: achievement.achievement_description,
                          icon: achievement.achievement_icon,
                          earnedDate: achievement.earned_at,
                          type: 'gold'
                        }}
                        onClick={() => handleBadgeClick(achievement)}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="special" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorized.special.map((achievement) => (
                    <div key={achievement.id}>
                      <BadgeDisplay
                        badge={{
                          id: achievement.id,
                          name: achievement.achievement_name,
                          description: achievement.achievement_description,
                          icon: achievement.achievement_icon,
                          earnedDate: achievement.earned_at,
                          type: 'gold'
                        }}
                        onClick={() => handleBadgeClick(achievement)}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg mb-4">
                  You haven't earned any badges yet. Start taking climate actions to earn your first badge!
                </p>
                <Button onClick={() => window.location.href = "/track-action"}>
                  Track Your First Action
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                How to Earn More Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span>🔥</span> Streak Achievements
                </h3>
                <div className="space-y-2 ml-8">
                  <p className="text-sm text-muted-foreground">• Week Warrior - Maintain a 7-day streak (+50 pts)</p>
                  <p className="text-sm text-muted-foreground">• Month Master - Maintain a 30-day streak (+150 pts)</p>
                  <p className="text-sm text-muted-foreground">• Century Champion - Maintain a 100-day streak (+500 pts)</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span>⚡</span> Action Milestones
                </h3>
                <div className="space-y-2 ml-8">
                  <p className="text-sm text-muted-foreground">• First Steps - Complete your first action (+10 pts)</p>
                  <p className="text-sm text-muted-foreground">• Action Taker - Complete 10 actions (+50 pts)</p>
                  <p className="text-sm text-muted-foreground">• Eco Warrior - Complete 50 actions (+200 pts)</p>
                  <p className="text-sm text-muted-foreground">• Climate Hero - Complete 100 actions (+500 pts)</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span>⭐</span> Category Masters
                </h3>
                <div className="space-y-2 ml-8">
                  <p className="text-sm text-muted-foreground">
                    Complete 10+ actions in any category to earn a Category Master badge (+100 pts)
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span>🎉</span> Special Events
                </h3>
                <div className="space-y-2 ml-8">
                  <p className="text-sm text-muted-foreground">
                    Participate in special events like Earth Day to earn exclusive badges
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BadgeDetailsModal
        badge={selectedBadge}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userStats={userStats}
      />
    </div>
  );
};

export default Badges;

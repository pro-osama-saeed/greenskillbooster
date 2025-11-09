import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { 
  Trophy, Zap, Calendar, TrendingUp, Award, Target, 
  Activity, CheckCircle2, MapPin, Clock 
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  is_public: boolean;
}

interface UserStats {
  total_actions: number;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  last_action_date: string | null;
}

interface Achievement {
  id: string;
  achievement_name: string;
  achievement_description: string;
  achievement_icon: string;
  achievement_type: string;
  points_awarded: number;
  earned_at: string;
}

interface ClimateAction {
  id: string;
  category: string;
  story: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
  points_awarded: number;
}

interface UserProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
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

export const UserProfileModal = ({ userId, isOpen, onClose }: UserProfileModalProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [actions, setActions] = useState<ClimateAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && isOpen) {
      fetchUserData();
    }
  }, [userId, isOpen]);

  const fetchUserData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (statsError) throw statsError;
      setStats(statsData);

      // Fetch achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (achievementsError) throw achievementsError;
      setAchievements(achievementsData || []);

      // Fetch recent actions (public only)
      const { data: actionsData, error: actionsError } = await supabase
        .from('climate_actions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (actionsError) throw actionsError;
      setActions(actionsData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile || loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const categoryBreakdown = actions.reduce((acc, action) => {
    acc[action.category] = (acc[action.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const achievementsByType = {
    streak: achievements.filter(a => a.achievement_type.startsWith('streak_')),
    action: achievements.filter(a => a.achievement_type.startsWith('actions_') || a.achievement_type === 'first_action'),
    category: achievements.filter(a => a.achievement_type.startsWith('category_')),
    special: achievements.filter(a => a.achievement_type.startsWith('event_') || a.achievement_type === 'early_adopter'),
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{profile.username}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Climate Action Champion
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 pr-4">
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Points</p>
                        <p className="text-3xl font-bold text-primary">{stats?.total_points || 0}</p>
                      </div>
                      <Zap className="w-8 h-8 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Actions</p>
                        <p className="text-3xl font-bold text-primary">{stats?.total_actions || 0}</p>
                      </div>
                      <Activity className="w-8 h-8 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Streak</p>
                        <p className="text-3xl font-bold text-primary">{stats?.current_streak || 0}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Achievements</p>
                        <p className="text-3xl font-bold text-primary">{achievements.length}</p>
                      </div>
                      <Trophy className="w-8 h-8 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Longest Streak */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Longest Streak</span>
                    <span className="text-sm font-bold text-primary">{stats?.longest_streak || 0} days</span>
                  </div>
                  <Progress value={((stats?.current_streak || 0) / (stats?.longest_streak || 1)) * 100} className="h-2" />
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Action Categories
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(categoryBreakdown).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm">{CATEGORY_LABELS[category]}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                    {Object.keys(categoryBreakdown).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No public actions yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements Preview */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Recent Achievements
                  </h3>
                  <div className="space-y-2">
                    {achievements.slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg">
                        <span className="text-2xl">{achievement.achievement_icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{achievement.achievement_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(achievement.earned_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">+{achievement.points_awarded}</Badge>
                      </div>
                    ))}
                    {achievements.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No achievements yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4 mt-4">
              {/* Achievement Type Cards */}
              {Object.entries(achievementsByType).map(([type, typeAchievements]) => {
                if (typeAchievements.length === 0) return null;
                
                const icons = {
                  streak: '🔥',
                  action: '⚡',
                  category: '⭐',
                  special: '🎉'
                };
                
                const titles = {
                  streak: 'Streak Achievements',
                  action: 'Action Milestones',
                  category: 'Category Masters',
                  special: 'Special Events'
                };

                return (
                  <Card key={type}>
                    <CardContent className="pt-6 space-y-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <span className="text-xl">{icons[type as keyof typeof icons]}</span>
                        {titles[type as keyof typeof titles]}
                      </h3>
                      <div className="grid gap-3">
                        {typeAchievements.map((achievement) => (
                          <div key={achievement.id} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-colors">
                            <span className="text-3xl">{achievement.achievement_icon}</span>
                            <div className="flex-1">
                              <p className="font-semibold">{achievement.achievement_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {achievement.achievement_description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Earned {new Date(achievement.earned_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="font-bold">
                              +{achievement.points_awarded}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {achievements.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      This user hasn't earned any achievements yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Recent Climate Actions
                  </h3>
                  <div className="space-y-3">
                    {actions.map((action) => (
                      <div key={action.id} className="flex gap-3 p-3 bg-secondary/20 rounded-lg">
                        <div className="flex-shrink-0 pt-1">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {CATEGORY_LABELS[action.category]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              +{action.points_awarded} pts
                            </span>
                          </div>
                          {action.story && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {action.story}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {action.city && action.country && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {action.city}, {action.country}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(action.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {actions.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No public activities to display
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {stats?.last_action_date && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Last active:</span>
                      <span className="font-semibold">
                        {new Date(stats.last_action_date).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

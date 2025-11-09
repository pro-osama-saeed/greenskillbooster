import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfileModal } from "@/components/UserProfileModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Medal, Award, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_points: number;
  total_actions: number;
  achievement_count: number;
}

const Leaderboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      // Fetch top users with their stats and achievement counts
      const { data, error } = await supabase
        .from('user_stats')
        .select(`
          user_id,
          total_points,
          total_actions,
          profiles:user_id (
            username,
            avatar_url,
            is_public
          )
        `)
        .order('total_points', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch achievement counts for each user
      const enrichedData = await Promise.all(
        (data || []).map(async (entry) => {
          const { count } = await supabase
            .from('user_achievements')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', entry.user_id);

          return {
            user_id: entry.user_id,
            username: entry.profiles?.username || 'Anonymous',
            avatar_url: entry.profiles?.avatar_url || null,
            total_points: entry.total_points || 0,
            total_actions: entry.total_actions || 0,
            achievement_count: count || 0,
          };
        })
      );

      // Filter out users with no activity and sort by points
      const activeUsers = enrichedData
        .filter(entry => entry.total_points > 0)
        .sort((a, b) => b.total_points - a.total_points);

      setLeaderboard(activeUsers);

      // Find current user's rank
      if (user) {
        const userEntry = activeUsers.find(entry => entry.user_id === user.id);
        if (userEntry) {
          setUserRank(userEntry);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-gold" />;
    if (index === 1) return <Medal className="h-6 w-6 text-silver" />;
    if (index === 2) return <Award className="h-6 w-6 text-bronze" />;
    return <span className="text-muted-foreground font-bold">#{index + 1}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{t("leaderboard")}</h1>
            <p className="text-muted-foreground text-lg">
              Top climate action champions in the GreenSkill community
            </p>
          </div>

          {/* User's current rank */}
          {userRank && (
            <Card className="border-primary bg-primary/5">
              <CardContent className="p-6">
                <div 
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => handleProfileClick(userRank.user_id)}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={userRank.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userRank.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Your Rank</h3>
                    <p className="text-muted-foreground">
                      {userRank.total_points} points • {userRank.achievement_count} badges • {userRank.total_actions} actions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      #{leaderboard.findIndex(e => e.user_id === userRank.user_id) + 1}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard list */}
          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <Card 
                  key={entry.user_id} 
                  className="hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => handleProfileClick(entry.user_id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 flex justify-center">
                        {getRankIcon(index)}
                      </div>
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={entry.avatar_url || undefined} />
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {entry.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{entry.username}</h3>
                        <p className="text-sm text-muted-foreground">
                          {entry.achievement_count} badges • {entry.total_actions} actions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{entry.total_points}</p>
                        <p className="text-sm text-muted-foreground">points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-lg mb-2">
                  No leaderboard data yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Be the first to track climate actions and climb the leaderboard!
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6 text-center space-y-2">
              <p className="text-muted-foreground">
                Track climate actions and earn achievements to climb the leaderboard!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <UserProfileModal
        userId={selectedUserId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Leaderboard;

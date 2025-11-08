import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import { Trophy, Medal, Award } from "lucide-react";
import { LeaderboardEntry } from "@/types/lesson";

// Mock leaderboard data
const mockLeaderboard: LeaderboardEntry[] = [
  { id: "1", nickname: "EcoWarrior", points: 1200, badgeCount: 12, completedLessons: 15 },
  { id: "2", nickname: "GreenThumb", points: 1100, badgeCount: 11, completedLessons: 14 },
  { id: "3", nickname: "ClimateHero", points: 1000, badgeCount: 10, completedLessons: 13 },
  { id: "4", nickname: "TreeHugger", points: 900, badgeCount: 9, completedLessons: 12 },
  { id: "5", nickname: "SolarPower", points: 850, badgeCount: 8, completedLessons: 11 },
  { id: "6", nickname: "WaterSaver", points: 800, badgeCount: 8, completedLessons: 10 },
  { id: "7", nickname: "EarthGuardian", points: 750, badgeCount: 7, completedLessons: 9 },
  { id: "8", nickname: "GreenLearner", points: 700, badgeCount: 7, completedLessons: 8 },
];

const Leaderboard = () => {
  const { t } = useLanguage();
  const { progress } = useProgress();

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-gold" />;
    if (index === 1) return <Medal className="h-6 w-6 text-silver" />;
    if (index === 2) return <Award className="h-6 w-6 text-bronze" />;
    return <span className="text-muted-foreground font-bold">#{index + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{t("leaderboard")}</h1>
            <p className="text-muted-foreground text-lg">
              {t("topLearners")} in the GreenSkill community
            </p>
          </div>

          {/* User's current rank */}
          {progress.points > 0 && (
            <Card className="border-primary bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      You
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Your Rank</h3>
                    <p className="text-muted-foreground">
                      {progress.points} {t("points")} • {progress.badges.length} badges • {progress.completedLessons.length} lessons
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">#{mockLeaderboard.length + 1}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard list */}
          <div className="space-y-3">
            {mockLeaderboard.map((entry, index) => (
              <Card key={entry.id} className="hover:shadow-[var(--shadow-card)] transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex justify-center">
                      {getRankIcon(index)}
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {entry.nickname.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{entry.nickname}</h3>
                      <p className="text-sm text-muted-foreground">
                        {entry.badgeCount} badges • {entry.completedLessons} lessons
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">{entry.points}</p>
                      <p className="text-sm text-muted-foreground">{t("points")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-6 text-center space-y-2">
              <p className="text-muted-foreground">
                Complete more lessons and earn badges to climb the leaderboard!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;

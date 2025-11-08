import { Header } from "@/components/Header";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { lessons } from "@/data/lessons";

const Badges = () => {
  const { t } = useLanguage();
  const { progress } = useProgress();

  const handleDownloadCertificate = () => {
    toast.success("Certificate downloaded", {
      description: "Your climate skills certificate has been saved!",
    });
  };

  const allLessonsCompleted = progress.completedLessons.length === lessons.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{t("badges")}</h1>
            <p className="text-muted-foreground text-lg">
              Your achievements and certificates
            </p>
          </div>

          {allLessonsCompleted && (
            <Card className="border-gold bg-gold/5">
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

          {progress.badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {progress.badges.map((badge) => (
                <BadgeDisplay key={badge.id} badge={badge} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-lg mb-4">
                  You haven't earned any badges yet. Complete lessons to earn your first badge!
                </p>
                <Button onClick={() => window.location.href = "/lessons"}>
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>How to Earn Badges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🌱</div>
                <div>
                  <h3 className="font-bold">First Steps (Bronze)</h3>
                  <p className="text-muted-foreground">Complete your first lesson</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-3xl">🌿</div>
                <div>
                  <h3 className="font-bold">Getting Started (Silver)</h3>
                  <p className="text-muted-foreground">Complete 3 lessons</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-3xl">🏆</div>
                <div>
                  <h3 className="font-bold">Climate Champion (Gold)</h3>
                  <p className="text-muted-foreground">Complete all core lessons</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Badges;

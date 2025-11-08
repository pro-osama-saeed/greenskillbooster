import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import { ProgressBar } from "@/components/ProgressBar";
import { Award, BookOpen, Flame } from "lucide-react";
import heroImage from "@/assets/hero-climate.jpg";
import { lessons } from "@/data/lessons";

const Index = () => {
  const { t } = useLanguage();
  const { progress } = useProgress();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-90" />
        <img 
          src={heroImage} 
          alt="Climate education"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground">
              {t("appName")}
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90">
              {t("tagline")}
            </p>
            <Link to="/lessons">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                {t("startLearning")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Progress Overview */}
      {progress.completedLessons.length > 0 && (
        <section className="container py-12">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-foreground">{t("progress")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">{t("completedLessons")}</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    {progress.completedLessons.length}
                  </p>
                  <ProgressBar 
                    current={progress.completedLessons.length} 
                    total={lessons.length}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-gold" />
                    <span className="text-muted-foreground">{t("earnedBadges")}</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    {progress.badges.length}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-accent" />
                    <span className="text-muted-foreground">{t("currentStreak")}</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    {progress.streak}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Features Section */}
      <section className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl text-foreground">Bite-Sized Lessons</h3>
              <p className="text-muted-foreground">
                Learn essential climate skills in just 5-10 minutes per day
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                <Award className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-bold text-xl text-foreground">Earn Badges</h3>
              <p className="text-muted-foreground">
                Get recognized for your achievements with digital certificates
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                <Flame className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-bold text-xl text-foreground">Stay Motivated</h3>
              <p className="text-muted-foreground">
                Build streaks and compete on the leaderboard
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-12 pb-20">
        <Card className="bg-[var(--gradient-hero)] border-0">
          <CardContent className="p-12 text-center space-y-4">
            <h2 className="text-3xl font-bold text-primary-foreground">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Join thousands of learners building climate skills for a sustainable future
            </p>
            <Link to="/lessons">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                {t("startLearning")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;

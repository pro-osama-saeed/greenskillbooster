import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink, Github, Video, FileText, Mail } from "lucide-react";

const Resources = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{t("resources")}</h1>
            <p className="text-muted-foreground text-lg">
              Additional materials and ways to engage with GreenSkill Booster
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-6 w-6 text-primary" />
                Demo Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                <p className="text-muted-foreground">Demo video placeholder</p>
              </div>
              <p className="text-muted-foreground">
                Watch our platform demo to see how GreenSkill Booster helps learners 
                acquire essential climate skills through gamified micro-learning.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-6 w-6 text-foreground" />
                Open Source
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                GreenSkill Booster is open source! We believe in transparency and community 
                collaboration. Check out our code repository, contribute improvements, or 
                fork the project to create your own educational platform.
              </p>
              <Button variant="outline" className="gap-2">
                <Github className="h-4 w-4" />
                View on GitHub
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-accent" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground mb-1">For Educators</h4>
                <p className="text-muted-foreground text-sm">
                  Learn how to create effective micro-lessons and adapt content for your community
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">For Translators</h4>
                <p className="text-muted-foreground text-sm">
                  Guidelines for translating content while maintaining cultural relevance
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">For Developers</h4>
                <p className="text-muted-foreground text-sm">
                  Technical documentation for contributing to the codebase
                </p>
              </div>
              <Button variant="outline" className="mt-4">
                Access Documentation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-6 w-6 text-success" />
                External Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <a href="#" className="block p-4 rounded-lg border hover:bg-muted transition-colors">
                  <h4 className="font-semibold text-foreground">Climate Action Toolkit</h4>
                  <p className="text-sm text-muted-foreground">
                    Free resources for implementing climate solutions in your community
                  </p>
                </a>
                <a href="#" className="block p-4 rounded-lg border hover:bg-muted transition-colors">
                  <h4 className="font-semibold text-foreground">Renewable Energy Database</h4>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive information on solar, wind, and other renewable technologies
                  </p>
                </a>
                <a href="#" className="block p-4 rounded-lg border hover:bg-muted transition-colors">
                  <h4 className="font-semibold text-foreground">Green Jobs Portal</h4>
                  <p className="text-sm text-muted-foreground">
                    Find climate-related job opportunities and training programs
                  </p>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                Contact & Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We value your feedback! Whether you have suggestions for new lessons, 
                found a bug, or want to partner with us, we'd love to hear from you.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong className="text-foreground">General inquiries:</strong> <span className="text-muted-foreground">hello@greenskill.org</span></p>
                <p><strong className="text-foreground">Partnerships:</strong> <span className="text-muted-foreground">partners@greenskill.org</span></p>
                <p><strong className="text-foreground">Technical support:</strong> <span className="text-muted-foreground">support@greenskill.org</span></p>
              </div>
              <Button className="w-full sm:w-auto">
                Send Feedback
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Resources;

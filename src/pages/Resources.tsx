import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink, Github, Video, FileText, Mail, BookOpen, Languages, Code } from "lucide-react";
import { FeedbackForm } from "@/components/FeedbackForm";
import { EducatorDocs } from "@/components/EducatorDocs";
import { TranslatorDocs } from "@/components/TranslatorDocs";
import { DeveloperDocs } from "@/components/DeveloperDocs";

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
            <CardContent>
              <Tabs defaultValue="educators" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="educators" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Educators
                  </TabsTrigger>
                  <TabsTrigger value="translators" className="gap-2">
                    <Languages className="w-4 h-4" />
                    Translators
                  </TabsTrigger>
                  <TabsTrigger value="developers" className="gap-2">
                    <Code className="w-4 h-4" />
                    Developers
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="educators">
                  <EducatorDocs />
                </TabsContent>

                <TabsContent value="translators">
                  <TranslatorDocs />
                </TabsContent>

                <TabsContent value="developers">
                  <DeveloperDocs />
                </TabsContent>
              </Tabs>
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
                <a 
                  href="https://www.un.org/en/climatechange/net-zero-coalition" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <h4 className="font-semibold text-foreground">UN Climate Action</h4>
                  <p className="text-sm text-muted-foreground">
                    United Nations resources and initiatives for climate action and sustainability
                  </p>
                </a>
                <a 
                  href="https://www.ipcc.ch/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <h4 className="font-semibold text-foreground">IPCC Reports</h4>
                  <p className="text-sm text-muted-foreground">
                    Latest climate science reports and assessments from the Intergovernmental Panel on Climate Change
                  </p>
                </a>
                <a 
                  href="https://www.irena.org/Energy-Transition/Technology" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <h4 className="font-semibold text-foreground">Renewable Energy Database</h4>
                  <p className="text-sm text-muted-foreground">
                    IRENA's comprehensive information on solar, wind, and renewable energy technologies
                  </p>
                </a>
                <a 
                  href="https://www.climatejobs.com/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <h4 className="font-semibold text-foreground">Green Jobs Portal</h4>
                  <p className="text-sm text-muted-foreground">
                    Find climate-related job opportunities and training programs worldwide
                  </p>
                </a>
                <a 
                  href="https://drawdown.org/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <h4 className="font-semibold text-foreground">Project Drawdown</h4>
                  <p className="text-sm text-muted-foreground">
                    Research-based climate solutions and implementation strategies
                  </p>
                </a>
                <a 
                  href="https://www.greenpeace.org/international/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <h4 className="font-semibold text-foreground">Greenpeace International</h4>
                  <p className="text-sm text-muted-foreground">
                    Environmental campaigns and activism resources for climate action
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
                <p><strong className="text-foreground">General inquiries & Partnerships:</strong> <span className="text-muted-foreground">haliimaakhan@gmail.com</span></p>
                <p><strong className="text-foreground">Technical support:</strong> <span className="text-muted-foreground">osamas.bizz@gmail.com</span></p>
              </div>
              <FeedbackForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Resources;

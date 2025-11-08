import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, Users, Globe, Target } from "lucide-react";

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">{t("about")}</h1>
            <p className="text-xl text-muted-foreground">
              Empowering communities with climate skills for a sustainable future
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                GreenSkill Booster was created to address the urgent need for climate education and skills 
                in communities most affected by climate change. We believe that everyone deserves access 
                to quality education about renewable energy, water conservation, sustainable agriculture, 
                and other critical climate-related topics.
              </p>
              <p className="text-foreground">
                Our platform provides bite-sized, practical lessons that can be completed in minutes, 
                making learning accessible even for those with limited time or resources. By offering 
                content in multiple languages and optimizing for low-bandwidth environments, we ensure 
                that climate education reaches those who need it most.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-accent" />
                  Our Values
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Accessibility for all, regardless of location or resources</li>
                  <li>• Practical, actionable knowledge over theory</li>
                  <li>• Community-driven learning and support</li>
                  <li>• Cultural sensitivity and local adaptation</li>
                  <li>• Environmental justice and equity</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-success" />
                  Our Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We're a diverse team of educators, climate scientists, software developers, 
                  and community organizers united by a common goal: making climate education 
                  accessible to everyone.
                </p>
                <p className="text-muted-foreground">
                  Our team includes experts from various regions who ensure our content is 
                  culturally appropriate and locally relevant.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-primary" />
                Our Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-4xl font-bold text-primary">10K+</p>
                  <p className="text-sm text-muted-foreground">Active Learners</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-success">50+</p>
                  <p className="text-sm text-muted-foreground">Countries Reached</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-accent">15</p>
                  <p className="text-sm text-muted-foreground">Languages Supported</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-gold">100K+</p>
                  <p className="text-sm text-muted-foreground">Lessons Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Get Involved</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                GreenSkill Booster is a community project, and we welcome contributions from 
                educators, translators, climate experts, and anyone passionate about climate education.
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Educators:</strong> Help us create new lessons and improve existing content</p>
                <p><strong className="text-foreground">Translators:</strong> Make our lessons accessible in more languages</p>
                <p><strong className="text-foreground">Developers:</strong> Contribute to our open-source platform</p>
                <p><strong className="text-foreground">Partners:</strong> Collaborate with us to reach more communities</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default About;

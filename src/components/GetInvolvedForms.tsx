import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GraduationCap, Languages, Code, Handshake } from "lucide-react";

type FormType = "educator" | "translator" | "developer" | "partner" | null;

interface FormData {
  full_name: string;
  email: string;
  country: string;
  organization: string;
  experience: string;
  motivation: string;
  availability: string;
  skills: string;
  portfolio_url: string;
}

export const GetInvolvedForms = () => {
  const { user } = useAuth();
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    country: "",
    organization: "",
    experience: "",
    motivation: "",
    availability: "",
    skills: "",
    portfolio_url: ""
  });

  const roles = [
    {
      type: "educator" as const,
      title: "Educators",
      description: "Help us create new lessons and improve existing content",
      icon: <GraduationCap className="h-6 w-6 text-primary" />
    },
    {
      type: "translator" as const,
      title: "Translators",
      description: "Make our lessons accessible in more languages",
      icon: <Languages className="h-6 w-6 text-success" />
    },
    {
      type: "developer" as const,
      title: "Developers",
      description: "Contribute to our open-source platform",
      icon: <Code className="h-6 w-6 text-accent" />
    },
    {
      type: "partner" as const,
      title: "Partners",
      description: "Collaborate with us to reach more communities",
      icon: <Handshake className="h-6 w-6 text-gold" />
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to submit the form");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("involvement_forms")
        .insert({
          user_id: user.id,
          role_type: activeForm,
          ...formData
        });

      if (error) throw error;

      toast.success("Application submitted successfully!", {
        description: "We'll review your application and get back to you soon."
      });

      // Reset form
      setFormData({
        full_name: "",
        email: "",
        country: "",
        organization: "",
        experience: "",
        motivation: "",
        availability: "",
        skills: "",
        portfolio_url: ""
      });
      setActiveForm(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit application", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setLoading(false);
    }
  };

  if (activeForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {roles.find(r => r.type === activeForm)?.title} Application
          </CardTitle>
          <CardDescription>
            Fill out the form below to apply as a{activeForm === "educator" ? "n" : ""} {activeForm}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization (if applicable)</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">
                Relevant Experience *
              </Label>
              <Textarea
                id="experience"
                required
                rows={3}
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="Tell us about your relevant experience..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivation">
                Why do you want to join? *
              </Label>
              <Textarea
                id="motivation"
                required
                rows={3}
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                placeholder="Share your motivation..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Input
                id="availability"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                placeholder="e.g., 5 hours per week"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Relevant Skills</Label>
              <Textarea
                id="skills"
                rows={2}
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="List your relevant skills..."
              />
            </div>

            {activeForm === "developer" && (
              <div className="space-y-2">
                <Label htmlFor="portfolio_url">Portfolio/GitHub URL</Label>
                <Input
                  id="portfolio_url"
                  type="url"
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  placeholder="https://github.com/yourusername"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveForm(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {roles.map((role) => (
        <Card
          key={role.type}
          className="cursor-pointer hover-lift transition-all"
          onClick={() => setActiveForm(role.type)}
        >
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              {role.icon}
              <CardTitle>{role.title}</CardTitle>
            </div>
            <CardDescription>{role.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Apply Now
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
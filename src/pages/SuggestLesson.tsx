import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { z } from "zod";

const lessonSuggestionSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().trim().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  category: z.enum(['solar', 'water', 'trees', 'waste', 'community', 'communication', 'energy'], {
    errorMap: () => ({ message: "Please select a category" })
  })
});

const SuggestLesson = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to suggest lessons");
      navigate("/auth");
      return;
    }

    // Validate form data
    const validation = lessonSuggestionSchema.safeParse({
      title,
      description,
      category
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("lesson_suggestions").insert({
        user_id: user.id,
        ...validation.data
      } as any);

      if (error) throw error;

      toast.success("Suggestion submitted!", {
        description: "Thank you! Admins will review your suggestion soon.",
      });

      setTitle("");
      setDescription("");
      setCategory("");
      navigate("/lessons");
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      toast.error("Failed to submit suggestion", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/lessons")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Lessons
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-gold" />
              <CardTitle className="text-3xl">Suggest a New Lesson</CardTitle>
            </div>
            <p className="text-muted-foreground">
              Have an idea for a climate skills lesson? Share it with us!
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Lesson Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Urban Beekeeping Basics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solar">Solar & Energy</SelectItem>
                    <SelectItem value="water">Water Conservation</SelectItem>
                    <SelectItem value="trees">Trees & Nature</SelectItem>
                    <SelectItem value="waste">Waste & Recycling</SelectItem>
                    <SelectItem value="community">Community Action</SelectItem>
                    <SelectItem value="communication">Climate Communication</SelectItem>
                    <SelectItem value="energy">Energy Efficiency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this lesson should cover, who it's for, and why it's important..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-32"
                  maxLength={500}
                  required
                />
                <p className="text-xs text-muted-foreground text-right">
                  {description.length}/500
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-sm">💡 Tips for great suggestions:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Focus on practical, actionable skills</li>
                  <li>Consider your local context and challenges</li>
                  <li>Think about what would help you and your community</li>
                  <li>Suggest lessons that can be learned in 5-10 minutes</li>
                </ul>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Suggestion"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SuggestLesson;

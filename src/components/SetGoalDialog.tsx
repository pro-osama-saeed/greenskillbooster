import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SetGoalDialogProps {
  onGoalCreated: () => void;
}

export const SetGoalDialog = ({ onGoalCreated }: SetGoalDialogProps) => {
  const [open, setOpen] = useState(false);
  const [goalType, setGoalType] = useState<string>("weekly_actions");
  const [targetValue, setTargetValue] = useState<number>(10);
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to set goals");
      setLoading(false);
      return;
    }

    const now = new Date();
    let periodStart = new Date(now);
    let periodEnd = new Date(now);

    if (goalType.includes("weekly")) {
      periodStart.setDate(now.getDate() - now.getDay());
      periodEnd.setDate(periodStart.getDate() + 6);
    } else if (goalType.includes("monthly")) {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (goalType === "streak_target") {
      periodEnd.setMonth(now.getMonth() + 3);
    }

    const { error } = await supabase.from("user_goals").insert({
      user_id: user.id,
      goal_type: goalType,
      target_value: targetValue,
      category: goalType === "category_focus" ? category : null,
      period_start: periodStart.toISOString().split("T")[0],
      period_end: periodEnd.toISOString().split("T")[0],
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to create goal");
      return;
    }

    toast.success("Goal created successfully!");
    setOpen(false);
    onGoalCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Target className="h-4 w-4" />
          Set New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set a New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goalType">Goal Type</Label>
            <Select value={goalType} onValueChange={setGoalType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly_actions">Weekly Actions</SelectItem>
                <SelectItem value="monthly_actions">Monthly Actions</SelectItem>
                <SelectItem value="weekly_points">Weekly Points</SelectItem>
                <SelectItem value="monthly_points">Monthly Points</SelectItem>
                <SelectItem value="category_focus">Category Focus</SelectItem>
                <SelectItem value="streak_target">Streak Target</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {goalType === "category_focus" && (
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="waste">Waste</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="advocacy">Advocacy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="target">Target Value</Label>
            <Input
              id="target"
              type="number"
              min="1"
              value={targetValue}
              onChange={(e) => setTargetValue(parseInt(e.target.value))}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Trash2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Goal {
  id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  category?: string;
  period_start: string;
  period_end: string;
  completed: boolean;
}

interface GoalCardProps {
  goal: Goal;
  onDelete: () => void;
}

const GOAL_TYPE_LABELS: Record<string, string> = {
  weekly_actions: "Weekly Actions Goal",
  monthly_actions: "Monthly Actions Goal",
  weekly_points: "Weekly Points Goal",
  monthly_points: "Monthly Points Goal",
  category_focus: "Category Focus Goal",
  streak_target: "Streak Target",
};

export const GoalCard = ({ goal, onDelete }: GoalCardProps) => {
  const percentage = Math.min((goal.current_value / goal.target_value) * 100, 100);
  
  const handleDelete = async () => {
    const { error } = await supabase
      .from("user_goals")
      .delete()
      .eq("id", goal.id);

    if (error) {
      toast.error("Failed to delete goal");
      return;
    }

    toast.success("Goal deleted successfully");
    onDelete();
  };

  return (
    <Card className="bg-gradient-card border-primary/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          {GOAL_TYPE_LABELS[goal.goal_type]}
          {goal.category && ` - ${goal.category}`}
        </CardTitle>
        <div className="flex gap-2">
          {goal.completed && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">
              {goal.current_value} / {goal.target_value}
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{new Date(goal.period_start).toLocaleDateString()}</span>
            <span>{new Date(goal.period_end).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { ChecklistActivity as ChecklistActivityType } from "@/types/lesson";
import { toast } from "sonner";
import { Lightbulb } from "lucide-react";

interface Props {
  activity: ChecklistActivityType;
  onComplete: () => void;
}

export const ChecklistActivity = ({ activity, onComplete }: Props) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [showTips, setShowTips] = useState<Record<string, boolean>>({});

  const handleCheck = (itemId: string) => {
    const newChecked = { ...checkedItems, [itemId]: !checkedItems[itemId] };
    setCheckedItems(newChecked);

    if (!checkedItems[itemId]) {
      const item = activity.items.find((i) => i.id === itemId);
      if (item?.tip) {
        setShowTips({ ...showTips, [itemId]: true });
      }
    }
  };

  const allChecked = activity.items.every((item) => checkedItems[item.id]);

  const handleFinish = () => {
    if (allChecked) {
      toast.success("Checklist completed!", {
        description: "You've reviewed all the important practices!",
      });
      onComplete();
    } else {
      toast.info("Review all items", {
        description: "Check all items to complete this activity.",
      });
    }
  };

  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle>{activity.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{activity.instruction}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {activity.items.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <Checkbox
                  id={item.id}
                  checked={checkedItems[item.id] || false}
                  onCheckedChange={() => handleCheck(item.id)}
                  className="mt-1"
                />
                <label
                  htmlFor={item.id}
                  className="flex-1 text-sm cursor-pointer leading-relaxed"
                >
                  {item.text}
                </label>
              </div>
              
              {showTips[item.id] && item.tip && (
                <div className="ml-9 p-3 bg-gold/10 border border-gold/20 rounded-lg flex gap-2">
                  <Lightbulb className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{item.tip}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={handleFinish}
          className="w-full"
          size="lg"
          variant={allChecked ? "default" : "outline"}
        >
          {allChecked ? "Complete Activity" : "Check All Items to Continue"}
        </Button>
      </CardContent>
    </Card>
  );
};

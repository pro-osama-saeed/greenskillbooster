import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { DragDropActivity as DragDropActivityType } from "@/types/lesson";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  activity: DragDropActivityType;
  onComplete: () => void;
}

export const DragDropActivity = ({ activity, onComplete }: Props) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [placedItems, setPlacedItems] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDrop = (categoryId: string) => {
    if (!draggedItem) return;

    const item = activity.items.find((i) => i.id === draggedItem);
    if (!item) return;

    const isCorrect = item.correctCategory === categoryId;
    
    if (isCorrect) {
      setPlacedItems({ ...placedItems, [draggedItem]: categoryId });
      toast.success("Correct! Well done!", {
        description: "Keep going to complete the activity.",
      });
    } else {
      toast.error("Not quite right!", {
        description: "Try another category.",
      });
    }
    
    setDraggedItem(null);

    // Check if all items are placed correctly
    const newPlacedItems = isCorrect 
      ? { ...placedItems, [draggedItem]: categoryId }
      : placedItems;
    
    if (Object.keys(newPlacedItems).length === activity.items.length) {
      setIsComplete(true);
      toast.success("Activity completed!", {
        description: "Great job! You got everything right.",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const unplacedItems = activity.items.filter((item) => !placedItems[item.id]);

  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle>{activity.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{activity.instruction}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Unplaced items */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Drag these items:</h3>
          <div className="flex flex-wrap gap-2">
            {unplacedItems.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-move hover:bg-primary/90 transition-colors"
              >
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Drop zones */}
        <div className="grid gap-4 md:grid-cols-2">
          {activity.categories.map((category) => {
            const itemsInCategory = activity.items.filter(
              (item) => placedItems[item.id] === category.id
            );
            
            return (
              <div
                key={category.id}
                onDrop={() => handleDrop(category.id)}
                onDragOver={handleDragOver}
                className={cn(
                  "min-h-32 p-4 border-2 border-dashed rounded-lg transition-colors",
                  draggedItem
                    ? "border-primary bg-primary/5"
                    : "border-border"
                )}
              >
                <h3 className="font-semibold mb-2">{category.title}</h3>
                <div className="space-y-2">
                  {itemsInCategory.map((item) => (
                    <div
                      key={item.id}
                      className="px-3 py-2 bg-success/10 text-success-foreground rounded border border-success/20"
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {isComplete && (
          <Button onClick={onComplete} className="w-full" size="lg">
            Continue to Next Section
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

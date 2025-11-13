import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";
import { getDidYouKnowFact, DidYouKnowFact } from "@/services/asdiData";

export const DidYouKnowBox = () => {
  const [fact, setFact] = useState<DidYouKnowFact | null>(null);

  useEffect(() => {
    const loadFact = async () => {
      try {
        const data = await getDidYouKnowFact();
        setFact(data);
      } catch (error) {
        console.error("Failed to load fact:", error);
      }
    };

    loadFact();
  }, []);

  if (!fact) return null;

  return (
    <Card className="bg-gradient-to-br from-gold/20 to-accent/20 border-gold/30 hover-lift">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="p-2 rounded-full bg-gold/20">
              <Lightbulb className="h-5 w-5 text-gold" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-sm text-foreground">Did You Know?</p>
            <p className="text-sm text-foreground">{fact.fact}</p>
            <div className="pt-2 border-t border-gold/20">
              <p className="text-xs text-muted-foreground">
                📊 {fact.dataPoint} • {fact.source}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Powered by ASDI – Open AWS Data
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

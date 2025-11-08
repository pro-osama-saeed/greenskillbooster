import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { getDroughtData, DroughtData } from "@/services/asdiData";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

const getRiskColor = (risk: DroughtData['riskLevel']) => {
  switch (risk) {
    case 'low': return 'text-success';
    case 'moderate': return 'text-gold';
    case 'high': return 'text-accent';
    case 'severe': return 'text-destructive';
  }
};

const getRiskBackground = (risk: DroughtData['riskLevel']) => {
  switch (risk) {
    case 'low': return 'bg-success/10';
    case 'moderate': return 'bg-gold/10';
    case 'high': return 'bg-accent/10';
    case 'severe': return 'bg-destructive/10';
  }
};

export const DroughtAlerts = () => {
  const [drought, setDrought] = useState<DroughtData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDrought = async () => {
      try {
        const data = await getDroughtData();
        setDrought(data);
      } catch (error) {
        console.error("Failed to load drought data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDrought();
    const interval = setInterval(loadDrought, 600000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-card hover-lift border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5 text-primary" />
            Water & Drought Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!drought) return null;

  return (
    <Card className="bg-gradient-card hover-lift border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-primary" />
          Water & Drought Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`flex items-center gap-3 p-4 rounded-lg ${getRiskBackground(drought.riskLevel)}`}>
          <AlertTriangle className={`h-6 w-6 ${getRiskColor(drought.riskLevel)}`} />
          <div className="flex-1">
            <p className="font-semibold text-foreground capitalize">{drought.riskLevel} Drought Risk</p>
            <p className="text-sm text-muted-foreground">Current water stress level</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Water Stress</span>
              <span className="font-semibold text-foreground">{drought.waterStress.toFixed(0)}%</span>
            </div>
            <Progress value={drought.waterStress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <p className="text-sm text-muted-foreground">River Flow</p>
              <p className="text-xl font-bold text-foreground">{drought.riverFlow.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">m³/s</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/10">
              <p className="text-sm text-muted-foreground">Rainfall Deficit</p>
              <p className="text-xl font-bold text-foreground">{drought.rainfallDeficit.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">below avg</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            📍 {drought.location} • Powered by ASDI – Open AWS Data
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Source: SISSA Drought Monitoring
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

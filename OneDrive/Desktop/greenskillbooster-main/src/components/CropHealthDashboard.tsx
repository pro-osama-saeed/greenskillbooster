import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getCropHealthData, CropHealthData } from "@/services/asdiData";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "@/contexts/LocationContext";

const getHealthColor = (status: CropHealthData['healthStatus']) => {
  switch (status) {
    case 'excellent': return 'text-success';
    case 'good': return 'text-primary';
    case 'fair': return 'text-gold';
    case 'poor': return 'text-accent';
  }
};

const getHealthBackground = (status: CropHealthData['healthStatus']) => {
  switch (status) {
    case 'excellent': return 'bg-success/10';
    case 'good': return 'bg-primary/10';
    case 'fair': return 'bg-gold/10';
    case 'poor': return 'bg-accent/10';
  }
};

export const CropHealthDashboard = () => {
  const [cropHealth, setCropHealth] = useState<CropHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const { location } = useLocation();

  useEffect(() => {
    const loadCropHealth = async () => {
      try {
        const data = await getCropHealthData(location || undefined);
        setCropHealth(data);
      } catch (error) {
        console.error("Failed to load crop health data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCropHealth();
    const interval = setInterval(loadCropHealth, 600000);
    return () => clearInterval(interval);
  }, [location]);

  if (loading) {
    return (
      <Card className="bg-gradient-card hover-lift border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-success" />
            Vegetation Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!cropHealth) return null;

  return (
    <Card className="bg-gradient-card hover-lift border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sprout className="h-5 w-5 text-success" />
          Vegetation Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`flex items-center gap-3 p-4 rounded-lg ${getHealthBackground(cropHealth.healthStatus)}`}>
          <TrendingUp className={`h-6 w-6 ${getHealthColor(cropHealth.healthStatus)}`} />
          <div className="flex-1">
            <p className="font-semibold text-foreground capitalize">{cropHealth.healthStatus} Health</p>
            <p className="text-sm text-muted-foreground">{cropHealth.season}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Green Cover</span>
              <span className="font-semibold text-foreground">{cropHealth.greenCover.toFixed(1)}%</span>
            </div>
            <Progress value={cropHealth.greenCover} className="h-2" />
          </div>

          <div className="p-4 rounded-lg bg-success/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NDVI Index</p>
                <p className="text-xs text-muted-foreground mt-1">Vegetation density measure</p>
              </div>
              <div className="text-3xl font-bold text-success">
                {cropHealth.ndvi.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground mb-2">Satellite Analysis</p>
            <div className="h-24 bg-gradient-to-b from-success/20 to-primary/20 rounded flex items-end justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, hsl(var(--success)) 10px, hsl(var(--success)) 11px)'
              }} />
              <p className="text-xs text-foreground font-semibold mb-2 relative z-10">Sentinel-2 Imagery</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            📍 {cropHealth.location} • Powered by ASDI – Open AWS Data
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Source: Sentinel-2 Satellite Data
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

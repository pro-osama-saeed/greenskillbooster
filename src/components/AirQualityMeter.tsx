import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { getAirQualityData, AirQualityData } from "@/services/asdiData";
import { Skeleton } from "@/components/ui/skeleton";

const getAQIEmoji = (status: AirQualityData['status']) => {
  switch (status) {
    case 'good': return '😊';
    case 'moderate': return '😐';
    case 'unhealthy': return '😷';
    case 'hazardous': return '☠️';
  }
};

const getAQIColor = (status: AirQualityData['status']) => {
  switch (status) {
    case 'good': return 'text-success';
    case 'moderate': return 'text-gold';
    case 'unhealthy': return 'text-accent';
    case 'hazardous': return 'text-destructive';
  }
};

const getAQIBackground = (status: AirQualityData['status']) => {
  switch (status) {
    case 'good': return 'bg-success/10';
    case 'moderate': return 'bg-gold/10';
    case 'unhealthy': return 'bg-accent/10';
    case 'hazardous': return 'bg-destructive/10';
  }
};

export const AirQualityMeter = () => {
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAirQuality = async () => {
      try {
        const data = await getAirQualityData();
        setAirQuality(data);
      } catch (error) {
        console.error("Failed to load air quality data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAirQuality();
    const interval = setInterval(loadAirQuality, 600000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-card hover-lift border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-primary" />
            Air Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!airQuality) return null;

  return (
    <Card className="bg-gradient-card hover-lift border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-primary" />
          Air Quality Index
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`flex flex-col items-center justify-center p-6 rounded-lg ${getAQIBackground(airQuality.status)}`}>
          <div className="text-6xl mb-2">{getAQIEmoji(airQuality.status)}</div>
          <div className={`text-4xl font-bold ${getAQIColor(airQuality.status)}`}>
            {airQuality.aqi}
          </div>
          <div className="text-lg font-semibold text-foreground capitalize mt-2">
            {airQuality.status}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">PM2.5</p>
            <p className="text-xl font-bold text-foreground">{airQuality.pm25.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">µg/m³</p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">Ozone</p>
            <p className="text-xl font-bold text-foreground">{airQuality.ozone.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">ppb</p>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            📍 {airQuality.location} • Powered by ASDI – Open AWS Data
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Source: EPA Air Quality Data
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

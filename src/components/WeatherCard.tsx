import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Droplets, Wind, Thermometer } from "lucide-react";
import { useEffect, useState } from "react";
import { getWeatherData, WeatherData } from "@/services/asdiData";
import { Skeleton } from "@/components/ui/skeleton";

export const WeatherCard = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const data = await getWeatherData();
        setWeather(data);
      } catch (error) {
        console.error("Failed to load weather data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
    // Refresh every 10 minutes
    const interval = setInterval(loadWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-card hover-lift border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            Live Weather
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className="bg-gradient-card hover-lift border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          Live Weather
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
            <div className="p-2 rounded-full bg-accent/20">
              <Thermometer className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Temperature</p>
              <p className="text-2xl font-bold text-foreground">{weather.temperature.toFixed(1)}°C</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
            <div className="p-2 rounded-full bg-primary/20">
              <Droplets className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rainfall</p>
              <p className="text-2xl font-bold text-foreground">{weather.rainfall.toFixed(1)}mm</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
            <div className="p-2 rounded-full bg-secondary/50">
              <Wind className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wind Speed</p>
              <p className="text-2xl font-bold text-foreground">{weather.windSpeed.toFixed(1)} km/h</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <div className="p-2 rounded-full bg-muted-foreground/20">
              <Droplets className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Humidity</p>
              <p className="text-2xl font-bold text-foreground">{weather.humidity.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            📍 {weather.location} • Powered by ASDI – Open AWS Data
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Source: NOAA GFS / FourCastNet
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

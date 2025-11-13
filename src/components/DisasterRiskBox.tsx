import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CloudRain, Wind, Droplets, Sun, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { getDisasterAlerts, DisasterAlert } from "@/services/asdiData";
import { useLocation } from "@/contexts/LocationContext";

const getAlertIcon = (type: DisasterAlert['type']) => {
  switch (type) {
    case 'flood': return CloudRain;
    case 'hurricane': return Wind;
    case 'drought': return Droplets;
    case 'heatwave': return Sun;
    case 'wildfire': return Flame;
    default: return AlertTriangle;
  }
};

const getSeverityColor = (severity: DisasterAlert['severity']) => {
  switch (severity) {
    case 'high': return 'text-destructive';
    case 'moderate': return 'text-accent';
    case 'low': return 'text-gold';
  }
};

const getSeverityBackground = (severity: DisasterAlert['severity']) => {
  switch (severity) {
    case 'high': return 'bg-destructive/20';
    case 'moderate': return 'bg-accent/20';
    case 'low': return 'bg-gold/20';
  }
};

export const DisasterRiskBox = () => {
  const [alert, setAlert] = useState<DisasterAlert | null>(null);
  const { location } = useLocation();

  useEffect(() => {
    const loadAlert = async () => {
      try {
        const data = await getDisasterAlerts(location || undefined);
        setAlert(data);
      } catch (error) {
        console.error("Failed to load disaster alerts:", error);
      }
    };

    loadAlert();
    const interval = setInterval(loadAlert, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [location]);

  if (!alert || !alert.active) return null;

  const Icon = getAlertIcon(alert.type);

  return (
    <Card className={`border-2 ${alert.severity === 'high' ? 'border-destructive/50' : 'border-accent/50'} hover-lift`}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className={`flex-shrink-0 p-2 rounded-full ${getSeverityBackground(alert.severity)}`}>
            <Icon className={`h-5 w-5 ${getSeverityColor(alert.severity)}`} />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm text-foreground capitalize">
                {alert.type} Alert
              </p>
              <span className={`text-xs font-semibold ${getSeverityColor(alert.severity)} capitalize`}>
                {alert.severity}
              </span>
            </div>
            <p className="text-sm text-foreground">{alert.description}</p>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                📍 {alert.location} • 🚨 Live Alert • Powered by ASDI – Open AWS Data
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Source: NOAA Severe Weather Data
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

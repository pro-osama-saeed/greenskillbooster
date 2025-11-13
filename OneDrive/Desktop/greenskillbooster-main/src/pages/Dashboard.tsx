import { Header } from "@/components/Header";
import { WeatherCard } from "@/components/WeatherCard";
import { AirQualityMeter } from "@/components/AirQualityMeter";
import { DroughtAlerts } from "@/components/DroughtAlerts";
import { CropHealthDashboard } from "@/components/CropHealthDashboard";
import { DidYouKnowBox } from "@/components/DidYouKnowBox";
import { DisasterRiskBox } from "@/components/DisasterRiskBox";
import { InteractiveMap } from "@/components/InteractiveMap";
import { useLanguage } from "@/contexts/LanguageContext";
import { KeyboardShortcutsInfo } from "@/components/KeyboardShortcutsInfo";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

const Dashboard = () => {
  const { t } = useLanguage();
  
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="container px-4 py-6 md:py-10 bg-gradient-section">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-3 mb-6 md:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Environmental Dashboard
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Live climate and sustainability data for your region
            </p>
          </div>

          {/* Disaster Risk Alert - Full Width */}
          <DisasterRiskBox />

          {/* Interactive Map - Full Width with better mobile handling */}
          <div className="w-full overflow-hidden">
            <InteractiveMap />
          </div>

          {/* Stats Grid - Weather and Air Quality */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <WeatherCard />
            <AirQualityMeter />
          </div>

          {/* Secondary Grid - Drought and Crop Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <DroughtAlerts />
            <CropHealthDashboard />
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            <DidYouKnowBox />
            <KeyboardShortcutsInfo />
          </div>

          {/* Data Sources Section */}
          <div className="mt-6 md:mt-10 p-4 md:p-8 rounded-xl bg-gradient-card border border-primary/10 shadow-sm">
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-3 md:mb-4">
              About This Data
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 leading-relaxed">
              All environmental data on this dashboard is sourced from the Amazon Sustainability Data Initiative (ASDI), 
              which provides open access to large datasets for climate research and sustainability applications.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <p className="font-semibold text-foreground mb-1 text-sm md:text-base">Weather Data</p>
                <p className="text-xs md:text-sm text-muted-foreground">NOAA GFS, FourCastNet</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <p className="font-semibold text-foreground mb-1 text-sm md:text-base">Satellite Imagery</p>
                <p className="text-xs md:text-sm text-muted-foreground">Sentinel-2, Landsat</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50 sm:col-span-2 lg:col-span-1">
                <p className="font-semibold text-foreground mb-1 text-sm md:text-base">Drought Monitoring</p>
                <p className="text-xs md:text-sm text-muted-foreground">SISSA, River Flow Data</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

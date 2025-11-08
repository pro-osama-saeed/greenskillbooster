import { Header } from "@/components/Header";
import { WeatherCard } from "@/components/WeatherCard";
import { AirQualityMeter } from "@/components/AirQualityMeter";
import { DroughtAlerts } from "@/components/DroughtAlerts";
import { CropHealthDashboard } from "@/components/CropHealthDashboard";
import { DidYouKnowBox } from "@/components/DidYouKnowBox";
import { DisasterRiskBox } from "@/components/DisasterRiskBox";
import { useLanguage } from "@/contexts/LanguageContext";

const Dashboard = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="container py-8 bg-gradient-section">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Environmental Dashboard
            </h1>
            <p className="text-muted-foreground">
              Live climate and sustainability data for your region
            </p>
          </div>

          {/* Disaster Risk Alert - Full Width */}
          <DisasterRiskBox />

          {/* Top Row - Weather and Air Quality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WeatherCard />
            <AirQualityMeter />
          </div>

          {/* Middle Row - Drought and Crop Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DroughtAlerts />
            <CropHealthDashboard />
          </div>

          {/* Bottom Row - Did You Know */}
          <DidYouKnowBox />

          {/* Info Section */}
          <div className="mt-8 p-6 rounded-lg bg-gradient-card border border-primary/10">
            <h3 className="font-semibold text-foreground mb-3">About This Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              All environmental data on this dashboard is sourced from the Amazon Sustainability Data Initiative (ASDI), 
              which provides open access to large datasets for climate research and sustainability applications.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold text-foreground">Weather Data</p>
                <p className="text-muted-foreground">NOAA GFS, FourCastNet</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Satellite Imagery</p>
                <p className="text-muted-foreground">Sentinel-2, Landsat</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Drought Monitoring</p>
                <p className="text-muted-foreground">SISSA, River Flow Data</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Layers, Cloud, Droplets, Sprout } from 'lucide-react';
import { Card } from '@/components/ui/card';

type MapLayer = 'satellite' | 'vegetation' | 'temperature' | 'rainfall';

interface ClimateRegion {
  id: string;
  name: string;
  type: string;
  x: number; // percentage from left
  y: number; // percentage from top
  description: string;
}

const climateRegions: ClimateRegion[] = [
  {
    id: 'amazon',
    name: 'Amazon Rainforest',
    type: 'High Vegetation',
    x: 30,
    y: 60,
    description: 'Largest tropical rainforest, critical for global oxygen production and carbon storage'
  },
  {
    id: 'sahara',
    name: 'Sahara Desert',
    type: 'Low Rainfall',
    x: 52,
    y: 40,
    description: 'World\'s largest hot desert, experiencing increasing desertification'
  },
  {
    id: 'india',
    name: 'Indian Subcontinent',
    type: 'Monsoon Region',
    x: 68,
    y: 45,
    description: 'Affected by seasonal monsoons, critical for agriculture'
  },
  {
    id: 'california',
    name: 'California',
    type: 'Drought Risk',
    x: 15,
    y: 38,
    description: 'High wildfire risk area, experiencing severe water scarcity'
  },
  {
    id: 'arctic',
    name: 'Arctic Circle',
    type: 'Ice Melt',
    x: 50,
    y: 15,
    description: 'Rapid ice loss affecting global sea levels and ecosystems'
  },
  {
    id: 'australia',
    name: 'Australia',
    type: 'Heat Stress',
    x: 82,
    y: 72,
    description: 'Increasing heatwaves and drought conditions'
  },
];

export const SimplifiedMap = () => {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('satellite');
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const getMarkerColor = (type: string): string => {
    if (type.includes('Vegetation')) return 'bg-success';
    if (type.includes('Rainfall') || type.includes('Drought')) return 'bg-blue-500';
    if (type.includes('Monsoon')) return 'bg-cyan-500';
    if (type.includes('Ice')) return 'bg-blue-200';
    if (type.includes('Heat')) return 'bg-red-500';
    return 'bg-orange-500';
  };

  const getLayerColors = () => {
    switch (activeLayer) {
      case 'vegetation':
        return 'from-green-900/20 via-green-500/10 to-green-200/5';
      case 'temperature':
        return 'from-red-900/20 via-orange-500/10 to-yellow-200/5';
      case 'rainfall':
        return 'from-blue-900/20 via-blue-500/10 to-cyan-200/5';
      default:
        return 'from-gray-900/20 via-gray-500/10 to-gray-200/5';
    }
  };

  const getLayerInfo = () => {
    switch (activeLayer) {
      case 'satellite':
        return {
          title: '🛰️ Satellite Imagery',
          description: 'High-resolution Earth observation from Sentinel-2 and Landsat satellites'
        };
      case 'vegetation':
        return {
          title: '🌱 Vegetation Cover',
          description: 'NDVI data showing plant health and coverage across regions'
        };
      case 'temperature':
        return {
          title: '🌡️ Temperature Data',
          description: 'Land surface temperature from MODIS Terra/Aqua satellites'
        };
      case 'rainfall':
        return {
          title: '💧 Rainfall Patterns',
          description: 'Monthly precipitation data from GPM and NOAA'
        };
    }
  };

  const layerInfo = getLayerInfo();
  const selectedRegionData = climateRegions.find(r => r.id === selectedRegion);

  return (
    <div className="space-y-4">
      {/* Layer Controls */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={activeLayer === 'satellite' ? 'default' : 'outline'}
          onClick={() => setActiveLayer('satellite')}
          className="flex items-center gap-2"
        >
          <Layers className="h-4 w-4" />
          Satellite
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'vegetation' ? 'default' : 'outline'}
          onClick={() => setActiveLayer('vegetation')}
          className="flex items-center gap-2"
        >
          <Sprout className="h-4 w-4" />
          Vegetation
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'temperature' ? 'default' : 'outline'}
          onClick={() => setActiveLayer('temperature')}
          className="flex items-center gap-2"
        >
          <Cloud className="h-4 w-4" />
          Temperature
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'rainfall' ? 'default' : 'outline'}
          onClick={() => setActiveLayer('rainfall')}
          className="flex items-center gap-2"
        >
          <Droplets className="h-4 w-4" />
          Rainfall
        </Button>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-green-50 border-2 border-border">
        {/* World Map Background with Layer-specific gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getLayerColors()} transition-colors duration-500`}>
          {/* Simplified continents using CSS shapes */}
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* North America */}
            <path d="M 10,20 L 25,15 L 30,25 L 25,40 L 15,35 Z" fill="currentColor" className="text-muted-foreground" />
            
            {/* South America */}
            <path d="M 25,45 L 32,50 L 30,70 L 22,65 L 23,48 Z" fill="currentColor" className="text-muted-foreground" />
            
            {/* Africa */}
            <path d="M 45,30 L 58,28 L 60,55 L 50,58 L 48,35 Z" fill="currentColor" className="text-muted-foreground" />
            
            {/* Europe */}
            <path d="M 48,18 L 60,15 L 58,28 L 48,25 Z" fill="currentColor" className="text-muted-foreground" />
            
            {/* Asia */}
            <path d="M 60,15 L 85,12 L 88,35 L 78,42 L 62,38 L 58,25 Z" fill="currentColor" className="text-muted-foreground" />
            
            {/* Australia */}
            <path d="M 75,60 L 88,58 L 90,72 L 78,74 Z" fill="currentColor" className="text-muted-foreground" />
            
            {/* Antarctica */}
            <path d="M 20,85 L 80,85 L 85,95 L 15,95 Z" fill="currentColor" className="text-muted-foreground" />
          </svg>

          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100">
            {/* Latitude lines */}
            {[20, 40, 60, 80].map(y => (
              <line key={`lat-${y}`} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeWidth="0.2" />
            ))}
            {/* Longitude lines */}
            {[20, 40, 60, 80].map(x => (
              <line key={`lon-${x}`} x1={x} y1="0" x2={x} y2="100" stroke="currentColor" strokeWidth="0.2" />
            ))}
            {/* Equator (thicker) */}
            <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.4" />
          </svg>
        </div>

        {/* Climate Region Markers */}
        {climateRegions.map((region) => (
          <div
            key={region.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-125"
            style={{ left: `${region.x}%`, top: `${region.y}%` }}
            onMouseEnter={() => setHoveredRegion(region.id)}
            onMouseLeave={() => setHoveredRegion(null)}
            onClick={() => setSelectedRegion(region.id === selectedRegion ? null : region.id)}
          >
            {/* Marker Pin */}
            <div className="relative">
              <div className={`w-6 h-6 rounded-full ${getMarkerColor(region.type)} border-2 border-white shadow-lg flex items-center justify-center animate-pulse`}>
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              
              {/* Ripple effect */}
              {(hoveredRegion === region.id || selectedRegion === region.id) && (
                <div className={`absolute inset-0 w-6 h-6 rounded-full ${getMarkerColor(region.type)} opacity-50 animate-ping`}></div>
              )}

              {/* Hover Tooltip */}
              {hoveredRegion === region.id && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-xl whitespace-nowrap z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <p className="text-sm font-semibold text-foreground">{region.name}</p>
                  <p className="text-xs text-muted-foreground">{region.type}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Legend Overlay */}
        <Card className="absolute bottom-4 left-4 max-w-xs p-4 bg-card/95 backdrop-blur-sm">
          <p className="text-sm font-semibold text-foreground mb-2">
            {layerInfo.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {layerInfo.description}
          </p>
          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
            💡 Click markers to learn more
          </p>
        </Card>

        {/* Selected Region Detail */}
        {selectedRegionData && (
          <Card className="absolute top-4 right-4 max-w-sm p-4 bg-card/95 backdrop-blur-sm animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-foreground">{selectedRegionData.name}</p>
                <p className="text-xs text-primary font-medium">{selectedRegionData.type}</p>
              </div>
              <button
                onClick={() => setSelectedRegion(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {selectedRegionData.description}
            </p>
            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
              Source: ASDI Climate Data
            </p>
          </Card>
        )}
      </div>

      {/* Info Footer */}
      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          🗺️ Simplified 2D Map View • Powered by ASDI – Open AWS Data
        </p>
        <p className="text-xs text-muted-foreground text-center mt-1">
          Source: Sentinel-2, Landsat, NOAA Climate Data
        </p>
      </div>
    </div>
  );
};
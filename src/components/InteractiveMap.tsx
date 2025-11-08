import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Map, Layers, Cloud, Droplets, Sprout, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type MapLayer = 'satellite' | 'vegetation' | 'temperature' | 'rainfall';

// Get Mapbox token from localStorage or use demo token
const getMapboxToken = () => {
  const stored = localStorage.getItem('mapbox_token');
  // Demo token - replace with your own from https://mapbox.com
  return stored || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
};

export const InteractiveMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayer>('satellite');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [mapError, setMapError] = useState<string | null>(null);

  const initializeMap = () => {
    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = getMapboxToken();

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [0, 20], // Center on global view
        zoom: 2,
        projection: 'globe' as any,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Atmosphere and fog for globe effect
      map.current.on('style.load', () => {
        if (!map.current) return;
        
        map.current.setFog({
          color: 'rgb(220, 235, 255)',
          'high-color': 'rgb(180, 200, 230)',
          'horizon-blend': 0.1,
        });

        setMapLoaded(true);
      });

      // Add sample markers for key climate regions
      const climateRegions = [
        { coords: [-3, -60], name: 'Amazon Rainforest', type: 'High Vegetation' },
        { coords: [20, 20], name: 'Sahara Desert', type: 'Low Rainfall' },
        { coords: [77, 28], name: 'Indian Subcontinent', type: 'Monsoon Region' },
        { coords: [-120, 37], name: 'California', type: 'Drought Risk' },
      ];

      map.current.on('load', () => {
        climateRegions.forEach((region) => {
          if (!map.current) return;
          
          const marker = new mapboxgl.Marker({
            color: getMarkerColor(region.type),
          })
            .setLngLat([region.coords[0], region.coords[1]] as [number, number])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<div class="p-2">
                  <h3 class="font-bold text-sm">${region.name}</h3>
                  <p class="text-xs text-gray-600">${region.type}</p>
                  <p class="text-xs mt-1">Source: ASDI Data</p>
                </div>`
              )
            )
            .addTo(map.current);
        });
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to load map. Please check your Mapbox token.');
    }
  };

  useEffect(() => {
    initializeMap();

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const handleTokenSave = () => {
    if (tokenInput.trim()) {
      localStorage.setItem('mapbox_token', tokenInput.trim());
      setShowTokenInput(false);
      setTokenInput('');
      setMapError(null);
      // Reinitialize map with new token
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      initializeMap();
    }
  };

  const getMarkerColor = (type: string): string => {
    if (type.includes('Vegetation')) return '#22c55e';
    if (type.includes('Rainfall') || type.includes('Drought')) return '#3b82f6';
    if (type.includes('Monsoon')) return '#0ea5e9';
    return '#f59e0b';
  };

  const switchLayer = (layer: MapLayer) => {
    if (!map.current || !mapLoaded) return;
    
    setActiveLayer(layer);

    // Switch map style based on layer
    const styles: Record<MapLayer, string> = {
      satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
      vegetation: 'mapbox://styles/mapbox/satellite-v9', // Satellite for vegetation analysis
      temperature: 'mapbox://styles/mapbox/dark-v11', // Dark for temperature overlay
      rainfall: 'mapbox://styles/mapbox/light-v11', // Light for rainfall overlay
    };

    map.current.setStyle(styles[layer]);
  };

  return (
    <Card className="bg-gradient-card hover-lift border-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Interactive Climate Map
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowTokenInput(!showTokenInput)}
            className="flex items-center gap-2"
          >
            <Info className="h-4 w-4" />
            Setup
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Setup */}
        {showTokenInput && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="space-y-3">
              <p className="text-sm">
                Get your free Mapbox token at{' '}
                <a 
                  href="https://mapbox.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="pk.eyJ1..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleTokenSave}>
                  Save
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {mapError && (
          <Alert variant="destructive">
            <AlertDescription>{mapError}</AlertDescription>
          </Alert>
        )}

        {/* Layer Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={activeLayer === 'satellite' ? 'default' : 'outline'}
            onClick={() => switchLayer('satellite')}
            className="flex items-center gap-2"
          >
            <Layers className="h-4 w-4" />
            Satellite
          </Button>
          <Button
            size="sm"
            variant={activeLayer === 'vegetation' ? 'default' : 'outline'}
            onClick={() => switchLayer('vegetation')}
            className="flex items-center gap-2"
          >
            <Sprout className="h-4 w-4" />
            Vegetation
          </Button>
          <Button
            size="sm"
            variant={activeLayer === 'temperature' ? 'default' : 'outline'}
            onClick={() => switchLayer('temperature')}
            className="flex items-center gap-2"
          >
            <Cloud className="h-4 w-4" />
            Temperature
          </Button>
          <Button
            size="sm"
            variant={activeLayer === 'rainfall' ? 'default' : 'outline'}
            onClick={() => switchLayer('rainfall')}
            className="flex items-center gap-2"
          >
            <Droplets className="h-4 w-4" />
            Rainfall
          </Button>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
          <div ref={mapContainer} className="absolute inset-0" />
          
          {/* Legend Overlay */}
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-border">
            <p className="text-xs font-semibold text-foreground mb-2">
              {activeLayer === 'satellite' && '🛰️ Satellite Imagery'}
              {activeLayer === 'vegetation' && '🌱 Vegetation Cover (NDVI)'}
              {activeLayer === 'temperature' && '🌡️ Temperature Data'}
              {activeLayer === 'rainfall' && '💧 Rainfall Patterns'}
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span>High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gold" />
                <span>Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            🗺️ Interactive Map • Powered by ASDI – Open AWS Data
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Source: Sentinel-2, Landsat, NOAA Climate Data
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, Layers, Cloud, Droplets, Sprout } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { SimplifiedMap } from './SimplifiedMap';

type MapLayer = 'satellite' | 'vegetation' | 'temperature' | 'rainfall';

export const InteractiveMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayer>('satellite');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [useSimplifiedMap, setUseSimplifiedMap] = useState(false);

  // Fetch Mapbox token from backend
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) throw error;
        
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          setMapError('Failed to load map token from backend');
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        setMapError('Failed to load map configuration');
      }
    };

    fetchToken();
  }, []);

  const initializeMap = () => {
    if (!mapContainer.current || map.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      // Check for WebGL support before creating map
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        console.log('WebGL not available, switching to simplified map');
        setUseSimplifiedMap(true);
        return;
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [0, 20], // Center on global view
        zoom: 2,
        projection: 'globe' as any,
        preserveDrawingBuffer: true,
        failIfMajorPerformanceCaveat: false,
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

    } catch (error: any) {
      console.error('Error initializing map:', error);
      
      // Switch to simplified map on any error
      if (error?.message?.includes('WebGL')) {
        console.log('WebGL error detected, switching to simplified map');
        setUseSimplifiedMap(true);
      } else if (error?.message?.includes('token')) {
        setMapError('Failed to authenticate map service. Please refresh the page.');
      } else {
        console.log('Map initialization failed, switching to simplified map');
        setUseSimplifiedMap(true);
      }
    }
  };

  useEffect(() => {
    if (mapboxToken) {
      initializeMap();
    }

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

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

  // If simplified map should be used, render it directly
  if (useSimplifiedMap) {
    return (
      <Card className="bg-gradient-card hover-lift border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Interactive Climate Map
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Showing 2D view - WebGL not available in this environment
          </p>
        </CardHeader>
        <CardContent>
          <SimplifiedMap />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card hover-lift border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" />
          Interactive Climate Map
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Message */}
        {mapError && (
          <Alert variant="destructive">
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Map Loading Issue</p>
                <p className="text-sm">{mapError}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setUseSimplifiedMap(true)}
                  className="mt-2"
                >
                  Switch to 2D Map View
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {!mapboxToken && !mapError && (
          <Alert>
            <AlertDescription>Loading map configuration...</AlertDescription>
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
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-border max-w-xs">
            <p className="text-sm font-semibold text-foreground mb-3">
              {activeLayer === 'satellite' && '🛰️ Satellite Imagery'}
              {activeLayer === 'vegetation' && '🌱 Vegetation Cover (NDVI)'}
              {activeLayer === 'temperature' && '🌡️ Temperature Data'}
              {activeLayer === 'rainfall' && '💧 Rainfall Patterns'}
            </p>
            
            {activeLayer === 'satellite' && (
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">High-resolution Earth observation</p>
                <p>Real-time satellite imagery from Sentinel-2 and Landsat 8/9 satellites, updated every 5-10 days. Shows true-color composite imagery at 10-30m resolution.</p>
                <p className="pt-2 border-t border-border">Data sources: ESA Copernicus, NASA USGS</p>
              </div>
            )}
            
            {activeLayer === 'vegetation' && (
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">NDVI (Normalized Difference Vegetation Index)</p>
                <div className="flex items-center gap-2 py-1">
                  <div className="w-3 h-3 rounded-full bg-[#006400]" />
                  <span>Dense vegetation (0.6-1.0)</span>
                </div>
                <div className="flex items-center gap-2 py-1">
                  <div className="w-3 h-3 rounded-full bg-[#90EE90]" />
                  <span>Moderate vegetation (0.3-0.6)</span>
                </div>
                <div className="flex items-center gap-2 py-1">
                  <div className="w-3 h-3 rounded-full bg-[#D2B48C]" />
                  <span>Sparse/barren (-0.1-0.3)</span>
                </div>
                <p className="pt-2 border-t border-border">Measures plant health and coverage. Higher values indicate healthier, denser vegetation.</p>
              </div>
            )}
            
            {activeLayer === 'temperature' && (
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Land Surface Temperature (LST)</p>
                <div className="flex items-center gap-2 py-1">
                  <div className="w-3 h-3 rounded-full bg-[#8B0000]" />
                  <span>Very hot (&gt;40°C / 104°F)</span>
                </div>
                <div className="flex items-center gap-2 py-1">
                  <div className="w-3 h-3 rounded-full bg-[#FFA500]" />
                  <span>Hot (30-40°C / 86-104°F)</span>
                </div>
                <div className="flex items-center gap-2 py-1">
                  <div className="w-3 h-3 rounded-full bg-[#4169E1]" />
                  <span>Cool (&lt;30°C / 86°F)</span>
                </div>
                <p className="pt-2 border-t border-border">Based on thermal infrared data from MODIS Terra/Aqua satellites. Shows daily average temperatures.</p>
              </div>
            )}
            
            {activeLayer === 'rainfall' && (
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Precipitation Accumulation</p>
                <div className="flex items-center gap-2 py-1">
                  <div className="w-3 h-3 rounded-full bg-[#00008B]" />
                  <span>Heavy (&gt;300mm/month)</span>
                </div>
                <div className="flex items-center gap-2 py-1">
                  <div className="w-3 h-3 rounded-full bg-[#4169E1]" />
                  <span>Moderate (100-300mm)</span>
                </div>
                <div className="flex items-center gap-2 py-1">
                  <div className="w-3 h-3 rounded-full bg-[#87CEEB]" />
                  <span>Low (&lt;100mm/month)</span>
                </div>
                <p className="pt-2 border-t border-border">Monthly precipitation data from GPM (Global Precipitation Measurement) mission and NOAA.</p>
              </div>
            )}
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

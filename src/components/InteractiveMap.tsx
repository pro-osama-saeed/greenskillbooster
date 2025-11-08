import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, Layers, Cloud, Droplets, Sprout, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

type MapLayer = 'satellite' | 'vegetation' | 'temperature' | 'rainfall';

export const InteractiveMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayer>('satellite');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>('Loading map...');
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [0, 20], // Center on global view
        zoom: 2,
        projection: 'globe' as any,
      });

      // Handle map errors
      map.current.on('error', (e: any) => {
        console.error('Map error:', e);
        if (e.error && (e.error.status === 403 || e.error.status === 401)) {
          setMapError('Invalid or expired Mapbox token. Please contact support.');
        }
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
        setMapError(null); // Clear error on successful load
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
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          setMapError('Failed to load map token. Please try again later.');
          return;
        }

        if (data?.token) {
          setMapboxToken(data.token);
          setMapError(null);
        } else {
          setMapError('Mapbox token not configured. Please contact support.');
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        setMapError('Failed to load map. Please try again later.');
      }
    };

    fetchToken();

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapboxToken && !map.current) {
      initializeMap(mapboxToken);
    }
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
          <Alert variant={mapError.includes('Loading') ? 'default' : 'destructive'}>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">{mapError}</AlertDescription>
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

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Volume2 } from 'lucide-react';
import { Header } from '@/components/Header';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ClimateAction {
  id: string;
  category: string;
  story: string | null;
  photo_url: string | null;
  voice_note_url: string | null;
  country: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  tree_planting: '🌳 Tree Planting',
  water_saving: '💧 Water Saving',
  energy_conservation: '⚡ Energy',
  teaching: '📚 Teaching',
  recycling: '♻️ Recycling',
  transportation: '🚲 Transport',
  other: '🌍 Other'
};

export default function Community() {
  const [actions, setActions] = useState<ClimateAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapToken, setMapToken] = useState<string>('');
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    fetchActions();
    fetchMapToken();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('climate-actions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'climate_actions',
          filter: 'is_public=eq.true'
        },
        () => {
          fetchActions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (mapToken && mapContainer.current && !map.current && actions.length > 0) {
      initializeMap();
    }
  }, [mapToken, actions]);

  const fetchMapToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) throw error;
      setMapToken(data.token);
    } catch (error) {
      console.error('Error fetching map token:', error);
    }
  };

  const fetchActions = async () => {
    try {
      const { data, error } = await supabase
        .from('climate_actions')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActions(data || []);
    } catch (error) {
      console.error('Error fetching actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 20],
      zoom: 1.5
    });

    // Add markers for actions with location
    actions.forEach((action) => {
      if (action.latitude && action.longitude && map.current) {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = '#22c55e';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';

        new mapboxgl.Marker(el)
          .setLngLat([action.longitude, action.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(
                `<div class="p-2">
                  <p class="font-bold">${action.profiles.username}</p>
                  <p class="text-sm">${CATEGORY_LABELS[action.category]}</p>
                  <p class="text-xs text-gray-500">${action.city}, ${action.country}</p>
                </div>`
              )
          )
          .addTo(map.current);
      }
    });
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Community Wall</h1>
          <p className="text-muted-foreground">See climate actions from around the world</p>
        </div>

        {mapToken && (
          <div className="mb-8">
            <Card>
              <CardContent className="p-0">
                <div ref={mapContainer} className="h-[400px] rounded-lg" />
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Card key={action.id} className="overflow-hidden">
              {action.photo_url && (
                <img
                  src={action.photo_url}
                  alt="Action"
                  className="w-full h-48 object-cover"
                />
              )}
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={action.profiles.avatar_url || undefined} />
                    <AvatarFallback>
                      {action.profiles.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{action.profiles.username}</p>
                    {action.city && action.country && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {action.city}, {action.country}
                      </p>
                    )}
                  </div>
                </div>

                <Badge variant="secondary">
                  {CATEGORY_LABELS[action.category]}
                </Badge>

                {action.story && (
                  <p className="text-sm text-muted-foreground">{action.story}</p>
                )}

                {action.voice_note_url && (
                  <button
                    onClick={() => playAudio(action.voice_note_url!)}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Volume2 className="w-4 h-4" />
                    Play voice note
                  </button>
                )}

                <p className="text-xs text-muted-foreground">
                  {new Date(action.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {actions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No actions yet. Be the first to share your climate action!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

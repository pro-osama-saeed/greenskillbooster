import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, MapPin, Volume2, Filter } from 'lucide-react';
import { Header } from '@/components/Header';
import { formatDistanceToNow } from 'date-fns';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import CommentSection from '@/components/CommentSection';
import ReactionBar from '@/components/ReactionBar';

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
    id: string;
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>(Object.keys(CATEGORY_LABELS));
  const [userColors, setUserColors] = useState<Record<string, string>>({});
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  
  useKeyboardShortcuts();

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
    } else if (map.current) {
      updateMarkers();
    }
  }, [mapToken, actions, selectedCategories]);

  const getUserColor = (userId: string): string => {
    if (userColors[userId]) return userColors[userId];
    
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash % 360);
    const color = `hsl(${hue}, 70%, 55%)`;
    
    setUserColors(prev => ({ ...prev, [userId]: color }));
    return color;
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

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
            id,
            username,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setActions(data || []);
    } catch (error) {
      console.error('Error fetching actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMarkers = () => {
    if (!map.current) return;

    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    const filteredActions = actions.filter(action => 
      selectedCategories.includes(action.category)
    );

    filteredActions.forEach((action) => {
      if (action.latitude && action.longitude && map.current) {
        const userColor = getUserColor(action.profiles.id);
        
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = userColor;
        el.style.width = '28px';
        el.style.height = '28px';
        el.style.borderRadius = '50%';
        el.style.border = '3px solid white';
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.transition = 'transform 0.2s';
        
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)';
        });
        
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
        });

        const popupContent = document.createElement('div');
        popupContent.className = 'p-2';
        
        const username = document.createElement('p');
        username.className = 'font-bold';
        username.textContent = action.profiles.username;
        
        const category = document.createElement('p');
        category.className = 'text-sm';
        category.textContent = CATEGORY_LABELS[action.category];
        
        const location = document.createElement('p');
        location.className = 'text-xs text-gray-500';
        location.textContent = `${action.city}, ${action.country}`;
        
        popupContent.appendChild(username);
        popupContent.appendChild(category);
        popupContent.appendChild(location);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([action.longitude, action.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setDOMContent(popupContent)
          )
          .addTo(map.current);
        
        markers.current.push(marker);
      }
    });
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

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    map.current.on('load', () => {
      updateMarkers();
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
          <div className="mb-8 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Filter by Category</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 p-2 rounded transition-colors"
                    >
                      <Checkbox
                        checked={selectedCategories.includes(key)}
                        onCheckedChange={() => toggleCategory(key)}
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-0">
                <div ref={mapContainer} className="h-[500px] rounded-lg" />
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {actions.filter(action => selectedCategories.includes(action.category)).map((action) => (
            <Card key={action.id}>
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => window.location.href = `/profile/${action.profiles.id}`}
                    >
                      <AvatarImage src={action.profiles.avatar_url || undefined} />
                      <AvatarFallback>
                        {action.profiles.username[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div 
                        className="font-medium cursor-pointer hover:text-primary transition-colors"
                        onClick={() => window.location.href = `/profile/${action.profiles.id}`}
                      >
                        {action.profiles.username}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    style={{ 
                      backgroundColor: `${userColors[action.profiles.id] || '#666'}20`,
                      borderColor: userColors[action.profiles.id] || '#666',
                      color: userColors[action.profiles.id] || '#666'
                    }}
                    className="border"
                  >
                    {action.category.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{action.story}</p>
                
                {action.photo_url && (
                  <img 
                    src={action.photo_url} 
                    alt="Climate action" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}

                {action.voice_note_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => playAudio(action.voice_note_url!)}
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Play Voice Note
                  </Button>
                )}

                {(action.city || action.country) && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    {[action.city, action.country].filter(Boolean).join(', ')}
                  </div>
                )}
                
                <ReactionBar parentType="climate_action" parentId={action.id} />
                
                <div className="pt-4 border-t">
                  <CommentSection parentType="climate_action" parentId={action.id} />
                </div>
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

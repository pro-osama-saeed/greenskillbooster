import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { z } from 'zod';

const ACTION_CATEGORIES = [
  { value: 'tree_planting', label: '🌳 Tree Planting' },
  { value: 'water_saving', label: '💧 Water Saving' },
  { value: 'energy_conservation', label: '⚡ Energy Conservation' },
  { value: 'teaching', label: '📚 Teaching' },
  { value: 'recycling', label: '♻️ Recycling' },
  { value: 'transportation', label: '🚲 Transportation' },
  { value: 'other', label: '🌍 Other' }
];


// Validation schema
const actionSchema = z.object({
  category: z.enum(['tree_planting', 'water_saving', 'energy_conservation', 'teaching', 'recycling', 'transportation', 'other'], {
    errorMap: () => ({ message: 'Please select a valid action category' })
  }),
  story: z.string().trim().max(1000, 'Story must be less than 1000 characters').optional().or(z.literal('')),
});

export default function TrackAction() {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshSession } = useAuth();
  const { location } = useLocation();
  const [category, setCategory] = useState('');
  const [story, setStory] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchUserPreferences();
    }
  }, [user, authLoading, navigate]);

  const fetchUserPreferences = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_public')
        .eq('id', user.id)
        .single();

      if (profile) {
        setIsPublic(profile.is_public ?? false);
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  // Monitor auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (event === 'SIGNED_OUT') {
          toast.error('Your session has expired. Please sign in again.');
          navigate('/auth');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form inputs
    const validation = actionSchema.safeParse({
      category,
      story,
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setSubmitting(true);

    try {
      // Verify session validity before submission
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!session || sessionError) {
        toast.error('Your session has expired. Please sign in again.');
        navigate('/auth');
        return;
      }

      // Verify session user ID matches context user ID
      if (session.user.id !== user!.id) {
        toast.error('Authentication mismatch. Please sign in again.');
        navigate('/auth');
        return;
      }

      // Refresh session to ensure we have a valid token
      await refreshSession();

      // Insert action
      const { error } = await supabase
        .from('climate_actions')
        .insert([{
          user_id: user!.id,
          category: category as any,
          story: story || null,
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          country: location?.country || null,
          city: location?.city || null,
          is_public: isPublic,
          points_awarded: 10
        }]);

      if (error) throw error;

      toast.success('Action tracked successfully! +10 points');
      navigate('/community');
    } catch (error: any) {
      console.error('Error tracking action:', {
        error,
        userId: user?.id,
        errorCode: error?.code,
        errorMessage: error?.message,
        errorDetails: error?.details
      });
      
      // Check for RLS or authentication errors
      if (error?.code === 'PGRST301' || error?.message?.includes('row-level security') || error?.message?.includes('violates row-level security policy')) {
        toast.error('Authentication error. Please sign in again.');
        navigate('/auth');
      } else if (error?.message?.includes('JWT') || error?.message?.includes('token')) {
        toast.error('Session expired. Please sign in again.');
        navigate('/auth');
      } else {
        toast.error(error.message || 'Failed to track action');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Track Your Climate Action</CardTitle>
            <CardDescription>
              Share your positive impact with the community and earn points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">Action Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="story">Your Story (optional)</Label>
                <Textarea
                  id="story"
                  placeholder="Tell us about your climate action..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">
                  {story.length}/1000 characters
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="public">Make this action public</Label>
                  <p className="text-sm text-muted-foreground">
                    Public actions appear on the community wall
                  </p>
                </div>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  'Track Action'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

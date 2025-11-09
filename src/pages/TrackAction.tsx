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
import { Camera, Mic, Upload, Loader2, ArrowLeft } from 'lucide-react';
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

// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB for audio

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
  const [isPublic, setIsPublic] = useState(true);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error('Image too large. Maximum size is 5MB');
        e.target.value = '';
        return;
      }

      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed');
        e.target.value = '';
        return;
      }

      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Validate audio size
        if (audioBlob.size > MAX_AUDIO_SIZE) {
          toast.error('Audio recording too large. Maximum size is 10MB');
          return;
        }
        
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const uploadFile = async (file: File, bucket: string, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${user!.id}/${Date.now()}.${fileExt}`;
    
    const { error, data } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

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

    // Additional photo validation (belt and suspenders approach)
    if (photo) {
      if (photo.size > MAX_FILE_SIZE) {
        toast.error('Image too large. Maximum size is 5MB');
        return;
      }
      if (!ALLOWED_IMAGE_TYPES.includes(photo.type)) {
        toast.error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed');
        return;
      }
    }

    // Additional audio validation
    if (audioBlob && audioBlob.size > MAX_AUDIO_SIZE) {
      toast.error('Audio recording too large. Maximum size is 10MB');
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
      let photoUrl = null;
      let voiceNoteUrl = null;

      // Upload photo if exists
      if (photo) {
        photoUrl = await uploadFile(photo, 'action-photos', 'photos');
      }

      // Upload voice note if exists
      if (audioBlob) {
        const audioFile = new File([audioBlob], 'voice-note.webm', { type: 'audio/webm' });
        voiceNoteUrl = await uploadFile(audioFile, 'voice-notes', 'notes');
      }

      // Insert action
      const { error } = await supabase
        .from('climate_actions')
        .insert([{
          user_id: user!.id,
          category: category as any,
          story: story || null,
          photo_url: photoUrl,
          voice_note_url: voiceNoteUrl,
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

              <div className="space-y-2">
                <Label>Photo (optional)</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {photo ? 'Change Photo' : 'Upload Photo'}
                </Button>
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Voice Note (optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={isRecording ? stopRecording : startRecording}
                  className="w-full"
                >
                  <Mic className={`w-4 h-4 mr-2 ${isRecording ? 'text-red-500' : ''}`} />
                  {isRecording ? 'Stop Recording' : audioBlob ? 'Re-record' : 'Record Voice Note'}
                </Button>
                {audioBlob && !isRecording && (
                  <p className="text-sm text-muted-foreground">Voice note recorded ✓</p>
                )}
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

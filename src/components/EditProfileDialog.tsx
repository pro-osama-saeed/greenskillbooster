import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Edit, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EditProfileDialogProps {
  currentProfile: {
    username: string;
    avatar_url: string | null;
    city: string | null;
    country: string | null;
  };
  onProfileUpdated: () => void;
}

const AVATAR_STYLES = [
  'abstract geometric portrait',
  'minimalist avatar design',
  'colorful vector portrait',
  'simple character illustration',
  'modern flat design avatar',
  'artistic profile icon'
];

export function EditProfileDialog({ currentProfile, onProfileUpdated }: EditProfileDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingAvatars, setGeneratingAvatars] = useState(false);
  const [username, setUsername] = useState(currentProfile.username);
  const [city, setCity] = useState(currentProfile.city || '');
  const [country, setCountry] = useState(currentProfile.country || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentProfile.avatar_url || '');
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);

  useEffect(() => {
    if (open && avatarOptions.length === 0) {
      generateAvatarOptions();
    }
  }, [open]);

  const generateAvatarOptions = async () => {
    setGeneratingAvatars(true);
    try {
      // Generate 6 unique avatar options using different styles
      const options = await Promise.all(
        AVATAR_STYLES.map(async (style, index) => {
          const randomSeed = Math.random().toString(36).substring(7);
          const prompt = `${style}, clean background, high quality, centered composition, ${randomSeed}`;
          
          // In a real implementation, you would call an image generation API here
          // For now, we'll use placeholder avatars with unique identifiers
          return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}-${index}-${randomSeed}`;
        })
      );
      
      setAvatarOptions(options);
    } catch (error) {
      console.error('Error generating avatars:', error);
      toast.error('Failed to generate avatar options');
    } finally {
      setGeneratingAvatars(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          city: city.trim() || null,
          country: country.trim() || null,
          avatar_url: selectedAvatar || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setOpen(false);
      onProfileUpdated();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleClearLocation = () => {
    setCity('');
    setCountry('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and choose a new avatar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              maxLength={50}
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Your city"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Your country"
                maxLength={100}
              />
            </div>
          </div>
          
          {(city || country) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearLocation}
              className="text-muted-foreground"
            >
              Clear Location
            </Button>
          )}

          {/* Avatar Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Choose Avatar</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={generateAvatarOptions}
                disabled={generatingAvatars}
              >
                {generatingAvatars ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Generate New Options
              </Button>
            </div>

            {generatingAvatars ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 animate-pulse text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Generating avatars...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {avatarOptions.map((avatarUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAvatar(avatarUrl)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedAvatar === avatarUrl
                        ? 'border-primary ring-2 ring-primary'
                        : 'border-border'
                    }`}
                  >
                    <Avatar className="w-full h-24">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback>
                        {username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {selectedAvatar === avatarUrl && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          ✓
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current Avatar Preview */}
          {selectedAvatar && (
            <div className="space-y-2">
              <Label>Current Selection</Label>
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedAvatar} />
                  <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{username}</p>
                  {(city || country) && (
                    <p className="text-sm text-muted-foreground">
                      {[city, country].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

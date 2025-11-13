import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const PrivacySettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('private');
  const [defaultActionVisibility, setDefaultActionVisibility] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPrivacySettings();
    }
  }, [user]);

  const fetchPrivacySettings = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_visibility, is_public')
        .eq('id', user.id)
        .single();

      if (profile) {
        const visibility = profile.profile_visibility as 'public' | 'private';
        setProfileVisibility(visibility || 'private');
        setDefaultActionVisibility(profile.is_public ?? true);
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileVisibility = async (isPublic: boolean) => {
    if (!user) return;
    
    try {
      const visibility = isPublic ? 'public' : 'private';
      const { error } = await supabase
        .from('profiles')
        .update({ profile_visibility: visibility })
        .eq('id', user.id);

      if (error) throw error;

      setProfileVisibility(visibility);
      toast({
        title: "Privacy Updated",
        description: `Your profile is now ${visibility}`,
      });
    } catch (error) {
      console.error('Error updating profile visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update profile visibility",
        variant: "destructive",
      });
    }
  };

  const updateActionVisibility = async (isPublic: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_public: isPublic })
        .eq('id', user.id);

      if (error) throw error;

      setDefaultActionVisibility(isPublic);
      toast({
        title: "Settings Updated",
        description: `New actions will be ${isPublic ? 'public' : 'private'} by default`,
      });
    } catch (error) {
      console.error('Error updating action visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update action visibility",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Privacy Settings
        </CardTitle>
        <CardDescription>
          Control who can see your profile and climate actions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Visibility */}
        <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border bg-card">
          <div className="flex items-start gap-3 flex-1">
            {profileVisibility === 'public' ? (
              <Eye className="w-5 h-5 text-primary mt-0.5" />
            ) : (
              <EyeOff className="w-5 h-5 text-muted-foreground mt-0.5" />
            )}
            <div className="space-y-1">
              <Label htmlFor="profile-visibility" className="text-base font-semibold">
                Public Profile
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow others to view your profile, achievements, and statistics
              </p>
            </div>
          </div>
          <Switch
            id="profile-visibility"
            checked={profileVisibility === 'public'}
            onCheckedChange={updateProfileVisibility}
          />
        </div>

        {/* Default Action Visibility */}
        <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border bg-card">
          <div className="flex items-start gap-3 flex-1">
            {defaultActionVisibility ? (
              <Eye className="w-5 h-5 text-primary mt-0.5" />
            ) : (
              <EyeOff className="w-5 h-5 text-muted-foreground mt-0.5" />
            )}
            <div className="space-y-1">
              <Label htmlFor="action-visibility" className="text-base font-semibold">
                Public Actions by Default
              </Label>
              <p className="text-sm text-muted-foreground">
                Make new climate actions visible to the community. You can change this for each action individually.
              </p>
            </div>
          </div>
          <Switch
            id="action-visibility"
            checked={defaultActionVisibility}
            onCheckedChange={updateActionVisibility}
          />
        </div>

        {/* Privacy Notice */}
        <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Privacy Protection</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Your email is never publicly visible</li>
            <li>Location coordinates are anonymized to ~1km precision</li>
            <li>Private actions are only visible to you and admins</li>
            <li>You can change action visibility anytime</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

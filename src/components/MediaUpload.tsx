import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface MediaItem {
  url: string;
  type: 'image';
  caption?: string;
}

interface MediaUploadProps {
  media: MediaItem[];
  onMediaChange: (media: MediaItem[]) => void;
  maxFiles?: number;
}

export default function MediaUpload({ media, onMediaChange, maxFiles = 5 }: MediaUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || media.length >= maxFiles) {
      if (media.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} images allowed`);
      }
      return;
    }

    const files = Array.from(e.target.files);
    const remainingSlots = maxFiles - media.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast.warning(`Only uploading ${remainingSlots} images to stay within the ${maxFiles} image limit`);
    }

    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          return null;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('post-media')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-media')
          .getPublicUrl(fileName);

        return { url: publicUrl, type: 'image' as const };
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((item): item is MediaItem => item !== null);

      onMediaChange([...media, ...successfulUploads]);
      toast.success(`${successfulUploads.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    onMediaChange(media.filter((_, i) => i !== index));
  };

  const updateCaption = (index: number, caption: string) => {
    const updated = [...media];
    updated[index] = { ...updated[index], caption };
    onMediaChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={uploading || media.length >= maxFiles}
          onClick={() => document.getElementById('media-upload')?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Add Images ({media.length}/{maxFiles})
            </>
          )}
        </Button>
        <Input
          id="media-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {media.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-2">
                <div className="relative">
                  <img
                    src={item.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeMedia(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Add caption..."
                  value={item.caption || ''}
                  onChange={(e) => updateCaption(index, e.target.value)}
                  className="mt-2 text-xs"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

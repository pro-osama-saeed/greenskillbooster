import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  postId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function BookmarkButton({ postId, variant = 'outline', size = 'sm' }: BookmarkButtonProps) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkBookmark();
    }
  }, [user, postId]);

  const checkBookmark = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single();

    setIsBookmarked(!!data);
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast.error('Please sign in to bookmark posts');
      return;
    }

    setLoading(true);

    if (isBookmarked) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) {
        toast.error('Failed to remove bookmark');
      } else {
        setIsBookmarked(false);
        toast.success('Bookmark removed');
      }
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, post_id: postId });

      if (error) {
        toast.error('Failed to add bookmark');
      } else {
        setIsBookmarked(true);
        toast.success('Post bookmarked');
      }
    }

    setLoading(false);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleBookmark}
      disabled={loading}
      className="gap-2"
    >
      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
      {isBookmarked ? 'Saved' : 'Save'}
    </Button>
  );
}

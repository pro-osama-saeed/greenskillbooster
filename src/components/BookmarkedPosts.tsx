import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface BookmarkedPost {
  id: string;
  post_id: string;
  created_at: string;
  post: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    user: {
      username: string;
    };
  };
}

export default function BookmarkedPosts() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        id,
        post_id,
        created_at,
        post:forum_posts(
          id,
          title,
          content,
          created_at,
          user:profiles(username)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookmarks(data as any);
    }
    
    setLoading(false);
  };

  const removeBookmark = async (bookmarkId: string) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId);

    if (error) {
      toast.error('Failed to remove bookmark');
      return;
    }

    toast.success('Bookmark removed');
    fetchBookmarks();
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-primary" />
          Saved Posts
        </CardTitle>
        <CardDescription>
          Posts you've bookmarked for later
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No saved posts yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="p-3 rounded-lg border border-border/50 hover:bg-accent transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Link to={`/forums/post/${bookmark.post.id}`} className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">
                      {bookmark.post.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      by {bookmark.post.user.username} •{' '}
                      {formatDistanceToNow(new Date(bookmark.post.created_at), { addSuffix: true })}
                    </p>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBookmark(bookmark.id)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

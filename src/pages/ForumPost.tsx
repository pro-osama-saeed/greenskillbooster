import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, Eye, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import CommentSection from '@/components/CommentSection';
import ReactionBar from '@/components/ReactionBar';
import ReportButton from '@/components/ReportButton';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  content_html: string;
  views: number;
  created_at: string;
  user_id: string;
  is_pinned: boolean;
  profiles: {
    username: string;
    avatar_url: string;
  };
  tags?: Array<{ id: string; name: string; color: string }>;
  media?: Array<{ url: string; caption?: string }>;
}

export default function ForumPost() {
  const { forumId, postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      fetchPost();
      incrementViews();
    }
  }, [postId]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('id', postId)
      .single();

    if (error) {
      toast.error('Failed to load post');
      navigate('/forums');
      return;
    }

    // Get tags
    const { data: postTags } = await supabase
      .from('post_tags')
      .select('tags(id, name, color)')
      .eq('post_id', postId);

    // Get media
    const { data: postMedia } = await supabase
      .from('post_media')
      .select('media_url, caption')
      .eq('post_id', postId)
      .order('display_order');

    setPost({
      ...data,
      tags: postTags?.map(pt => (pt.tags as any)) || [],
      media: postMedia?.map(m => ({ url: m.media_url, caption: m.caption || undefined })) || []
    });
    setLoading(false);
  };

  const incrementViews = async () => {
    await supabase.rpc('increment_post_views', { post_id: postId });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/forums')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Forums
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={post.profiles.avatar_url} />
                <AvatarFallback>{post.profiles.username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{post.profiles.username}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  <span>•</span>
                  <Eye className="w-3 h-3" />
                  {post.views} views
                </div>
              </div>
            </div>
            {post.is_pinned && (
              <Badge variant="default">Pinned</Badge>
            )}
          </div>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-3">
              {post.tags.map((tag) => (
                <Badge 
                  key={tag.id} 
                  style={{ backgroundColor: tag.color, color: 'white' }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {post.media && post.media.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {post.media.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <img
                    src={item.url}
                    alt={item.caption || `Media ${idx + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {item.caption && (
                    <p className="text-sm text-muted-foreground italic">{item.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div 
            className="prose prose-sm max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: post.content_html || post.content }}
          />
          
          <div className="flex items-center justify-between border-t pt-4">
            <ReactionBar parentType="forum_post" parentId={post.id} />
            <ReportButton reportedType="post" reportedId={post.id} />
          </div>
        </CardContent>
      </Card>

      <CommentSection parentType="forum_post" parentId={post.id} />
    </div>
  );
}

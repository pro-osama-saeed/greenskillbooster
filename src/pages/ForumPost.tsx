import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, Eye, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import CommentSection from '@/components/CommentSection';
import ReactionBar from '@/components/ReactionBar';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  views: number;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
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

    setPost(data);
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
          </div>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none mb-4">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
          <ReactionBar parentType="forum_post" parentId={post.id} />
        </CardContent>
      </Card>

      <CommentSection parentType="forum_post" parentId={post.id} />
    </div>
  );
}

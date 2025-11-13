import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface RelatedPost {
  id: string;
  title: string;
  views: number;
  created_at: string;
  username: string;
  comment_count: number;
}

interface RelatedPostsProps {
  postId: string;
  tags: string[];
}

export default function RelatedPosts({ postId, tags }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tags.length > 0) {
      fetchRelatedPosts();
    }
  }, [postId, tags]);

  const fetchRelatedPosts = async () => {
    setLoading(true);
    
    // Get tag IDs from tag names
    const { data: tagData } = await supabase
      .from('tags')
      .select('id')
      .in('name', tags);

    if (!tagData || tagData.length === 0) {
      setLoading(false);
      return;
    }

    const tagIds = tagData.map(t => t.id);

    // Get posts with similar tags
    const { data, error } = await supabase
      .from('post_tags')
      .select(`
        post:forum_posts(
          id,
          title,
          views,
          created_at,
          user:profiles(username)
        )
      `)
      .in('tag_id', tagIds)
      .neq('post_id', postId)
      .limit(5);

    if (!error && data) {
      // Transform and deduplicate
      const posts = data
        .map(item => item.post)
        .filter((post, index, self) => 
          post && self.findIndex(p => p?.id === post.id) === index
        ) as any[];

      // Get comment counts
      const postsWithCounts = await Promise.all(
        posts.map(async (post) => {
          const { count } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('parent_type', 'forum_post')
            .eq('parent_id', post.id);

          return {
            id: post.id,
            title: post.title,
            views: post.views,
            created_at: post.created_at,
            username: post.user.username,
            comment_count: count || 0
          };
        })
      );

      setRelatedPosts(postsWithCounts);
    }
    
    setLoading(false);
  };

  if (loading || relatedPosts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          Related Posts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {relatedPosts.map((post) => (
            <Link key={post.id} to={`/forums/post/${post.id}`}>
              <div className="p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer border border-border/50">
                <h4 className="font-medium text-sm line-clamp-2 mb-2">
                  {post.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>by {post.username}</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.views}
                  </span>
                  <span className="ml-auto">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

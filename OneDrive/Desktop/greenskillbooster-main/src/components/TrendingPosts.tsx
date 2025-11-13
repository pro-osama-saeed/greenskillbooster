import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, MessageSquare, Heart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface TrendingPost {
  id: string;
  title: string;
  content: string;
  views: number;
  created_at: string;
  trending_score: number;
  comment_count: number;
  reaction_count: number;
  forum_id: string;
  user_id: string;
}

interface TrendingPostsProps {
  forumId?: string;
  limit?: number;
}

export default function TrendingPosts({ forumId, limit = 5 }: TrendingPostsProps) {
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingPosts();
  }, [forumId]);

  const fetchTrendingPosts = async () => {
    setLoading(true);
    
    const { data, error } = await supabase.rpc('get_trending_posts', {
      p_limit: limit,
      p_forum_id: forumId || null
    });

    if (!error && data) {
      setTrendingPosts(data);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trendingPosts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Trending Now
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trendingPosts.map((post, index) => (
            <Link key={post.id} to={`/forums/post/${post.id}`}>
              <div className="p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer border border-border/50">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    #{index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 mb-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {post.comment_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {post.reaction_count}
                      </span>
                      <span className="ml-auto">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

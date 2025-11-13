import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface RecommendedPost {
  id: string;
  title: string;
  content: string;
  views: number;
  created_at: string;
  recommendation_reason: string;
  forum_id: string;
  user_id: string;
}

interface RecommendedPostsProps {
  limit?: number;
}

export default function RecommendedPosts({ limit = 5 }: RecommendedPostsProps) {
  const { user } = useAuth();
  const [recommendedPosts, setRecommendedPosts] = useState<RecommendedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecommendedPosts();
    }
  }, [user]);

  const fetchRecommendedPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const { data, error } = await supabase.rpc('get_recommended_posts', {
      p_user_id: user.id,
      p_limit: limit
    });

    if (!error && data) {
      setRecommendedPosts(data);
    }
    
    setLoading(false);
  };

  if (!user || loading) {
    return null;
  }

  if (recommendedPosts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Recommended For You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendedPosts.map((post) => (
            <Link key={post.id} to={`/forums/post/${post.id}`}>
              <div className="p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer border border-border/50">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 mb-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {post.recommendation_reason}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views}
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

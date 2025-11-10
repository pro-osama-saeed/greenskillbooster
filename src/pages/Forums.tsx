import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Plus, Eye, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Forum {
  id: string;
  name: string;
  description: string;
  icon: string;
  post_count?: number;
  latest_post?: {
    title: string;
    created_at: string;
    username: string;
  };
}

interface ForumPost {
  id: string;
  forum_id: string;
  title: string;
  content: string;
  views: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
  comment_count?: number;
}

export default function Forums() {
  const { user } = useAuth();
  const [forums, setForums] = useState<Forum[]>([]);
  const [selectedForum, setSelectedForum] = useState<string | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchForums();
  }, []);

  useEffect(() => {
    if (selectedForum) {
      fetchPosts(selectedForum);
    }
  }, [selectedForum]);

  const fetchForums = async () => {
    const { data, error } = await supabase
      .from('forums')
      .select('*')
      .order('created_at');

    if (error) {
      toast.error('Failed to load forums');
      return;
    }

    // Get post counts for each forum
    const forumsWithCounts = await Promise.all(
      data.map(async (forum) => {
        const { count } = await supabase
          .from('forum_posts')
          .select('*', { count: 'exact', head: true })
          .eq('forum_id', forum.id);

        const { data: latestPost } = await supabase
          .from('forum_posts')
          .select('title, created_at, profiles(username)')
          .eq('forum_id', forum.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...forum,
          post_count: count || 0,
          latest_post: latestPost ? {
            title: latestPost.title,
            created_at: latestPost.created_at,
            username: (latestPost.profiles as any)?.username || 'Unknown'
          } : undefined
        };
      })
    );

    setForums(forumsWithCounts);
    setLoading(false);
  };

  const fetchPosts = async (forumId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('forum_id', forumId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load posts');
      setLoading(false);
      return;
    }

    // Get comment counts
    const postsWithComments = await Promise.all(
      (data || []).map(async (post) => {
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('parent_type', 'forum_post')
          .eq('parent_id', post.id);

        return { ...post, comment_count: count || 0 };
      })
    );

    setPosts(postsWithComments);
    setLoading(false);
  };

  const createPost = async () => {
    if (!user || !selectedForum || !newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const { error } = await supabase
      .from('forum_posts')
      .insert({
        forum_id: selectedForum,
        user_id: user.id,
        title: newPost.title,
        content: newPost.content
      });

    if (error) {
      toast.error('Failed to create post');
      return;
    }

    toast.success('Post created successfully!');
    setNewPost({ title: '', content: '' });
    setIsDialogOpen(false);
    fetchPosts(selectedForum);
  };

  if (loading && forums.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Community Forums</h1>
        <p className="text-muted-foreground">Connect, share, and learn with fellow climate activists</p>
      </div>

      {!selectedForum ? (
        <div className="grid gap-4 md:grid-cols-2">
          {forums.map((forum) => (
            <Card 
              key={forum.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedForum(forum.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{forum.icon}</span>
                    <div>
                      <CardTitle className="text-xl">{forum.name}</CardTitle>
                      <CardDescription>{forum.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {forum.post_count} posts
                    </span>
                  </div>
                  {forum.latest_post && (
                    <div className="text-xs">
                      Latest: {forum.latest_post.username} • {formatDistanceToNow(new Date(forum.latest_post.created_at), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setSelectedForum(null)}>
              ← Back to Forums
            </Button>
            {user && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                    <DialogDescription>Share your thoughts with the community</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Post title"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="What's on your mind?"
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      rows={6}
                    />
                    <Button onClick={createPost} className="w-full">Post</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No posts yet. Be the first to start a discussion!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <Link to={`/forums/${selectedForum}/posts/${post.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl hover:text-primary transition-colors">
                            {post.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <span>by {post.profiles.username}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.views}
                          </span>
                          <Badge variant="secondary">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {post.comment_count}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2">{post.content}</p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

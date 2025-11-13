import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Plus, Eye, Clock, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import RichTextEditor from '@/components/RichTextEditor';
import MediaUpload from '@/components/MediaUpload';
import TagSelector from '@/components/TagSelector';
import ForumSearch from '@/components/ForumSearch';
import TrendingPosts from '@/components/TrendingPosts';
import RecommendedPosts from '@/components/RecommendedPosts';
import BookmarkedPosts from '@/components/BookmarkedPosts';

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
  content_html: string;
  views: number;
  is_pinned: boolean;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
  comment_count?: number;
  tags?: Array<{ id: string; name: string; color: string }>;
  media?: Array<{ url: string; caption?: string }>;
}

interface MediaItem {
  url: string;
  type: 'image';
  caption?: string;
}

export default function Forums() {
  const { user } = useAuth();
  const [forums, setForums] = useState<Forum[]>([]);
  const [selectedForum, setSelectedForum] = useState<string | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({ 
    title: '', 
    content: '',
    contentHtml: ''
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

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

    const forumsWithCounts = await Promise.all(
      data.map(async (forum) => {
        const { count } = await supabase
          .from('forum_posts')
          .select('*', { count: 'exact', head: true })
          .eq('forum_id', forum.id);

        const { data: latestPost } = await supabase
          .from('forum_posts')
          .select(`
            title, 
            created_at, 
            profiles:user_id (username)
          `)
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
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load posts');
      setLoading(false);
      return;
    }

    const postsWithDetails = await Promise.all(
      (data || []).map(async (post) => {
        // Get comment count
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('parent_type', 'forum_post')
          .eq('parent_id', post.id);

        // Get tags
        const { data: postTags } = await supabase
          .from('post_tags')
          .select('tags(id, name, color)')
          .eq('post_id', post.id);

        // Get media
        const { data: postMedia } = await supabase
          .from('post_media')
          .select('media_url, caption')
          .eq('post_id', post.id)
          .order('display_order');

        return {
          ...post,
          comment_count: count || 0,
          tags: postTags?.map(pt => (pt.tags as any)) || [],
          media: postMedia?.map(m => ({ url: m.media_url, caption: m.caption || undefined })) || []
        };
      })
    );

    setPosts(postsWithDetails);
    setLoading(false);
  };

  const createPost = async () => {
    if (!user || !selectedForum || !newPost.title.trim()) {
      toast.error('Please fill in the title');
      return;
    }

    setSubmitting(true);

    try {
      // Create the post
      const { data: postData, error: postError } = await supabase
        .from('forum_posts')
        .insert({
          forum_id: selectedForum,
          user_id: user.id,
          title: newPost.title,
          content: newPost.content || 'No description provided',
          content_html: newPost.contentHtml
        })
        .select()
        .single();

      if (postError) throw postError;

      // Add tags
      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map(tagId => ({
          post_id: postData.id,
          tag_id: tagId
        }));

        await supabase.from('post_tags').insert(tagInserts);
      }

      // Add media
      if (media.length > 0) {
        const mediaInserts = media.map((item, index) => ({
          post_id: postData.id,
          media_url: item.url,
          media_type: 'image',
          caption: item.caption,
          display_order: index
        }));

        await supabase.from('post_media').insert(mediaInserts);
      }

      toast.success('Post created successfully!');
      setNewPost({ title: '', content: '', contentHtml: '' });
      setSelectedTags([]);
      setMedia([]);
      setIsDialogOpen(false);
      fetchPosts(selectedForum);
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && forums.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Community Forums</h1>
        <p className="text-muted-foreground">Connect, share, and learn with fellow climate activists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="forums" className="space-y-6">
            <TabsList>
              <TabsTrigger value="forums">Forums</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="bookmarks">
                <Bookmark className="w-4 h-4 mr-2" />
                Saved
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search">
              <ForumSearch />
            </TabsContent>

            <TabsContent value="bookmarks">
              <BookmarkedPosts />
            </TabsContent>

            <TabsContent value="forums">
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
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Content</label>
                          <RichTextEditor
                            value={newPost.contentHtml}
                            onChange={(value) => {
                              setNewPost({ 
                                ...newPost, 
                                contentHtml: value,
                                content: value.replace(/<[^>]*>/g, '')
                              });
                            }}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Tags</label>
                          <TagSelector
                            selectedTags={selectedTags}
                            onTagsChange={setSelectedTags}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Media Gallery</label>
                          <MediaUpload
                            media={media}
                            onMediaChange={setMedia}
                          />
                        </div>

                        <Button 
                          onClick={createPost} 
                          className="w-full"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Post'
                          )}
                        </Button>
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
                              <div className="flex items-center gap-2 mb-2">
                                {post.is_pinned && (
                                  <Badge variant="default">Pinned</Badge>
                                )}
                                <CardTitle className="text-xl hover:text-primary transition-colors">
                                  {post.title}
                                </CardTitle>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <span>by {post.profiles.username}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex gap-2 mb-2 flex-wrap">
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
                          {post.media && post.media.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              {post.media.slice(0, 3).map((item, idx) => (
                                <img
                                  key={idx}
                                  src={item.url}
                                  alt={item.caption || `Media ${idx + 1}`}
                                  className="w-full h-24 object-cover rounded"
                                />
                              ))}
                            </div>
                          )}
                          <p className="text-muted-foreground line-clamp-2">{post.content}</p>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TrendingPosts forumId={selectedForum || undefined} limit={5} />
          <RecommendedPosts limit={5} />
        </div>
      </div>
    </div>
  );
}

-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_tags junction table
CREATE TABLE public.post_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, tag_id)
);

-- Create media_gallery table for post attachments
CREATE TABLE public.post_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL, -- 'image' or 'video'
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookmarks table
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Add rich content support to forum_posts
ALTER TABLE public.forum_posts ADD COLUMN content_html TEXT;
ALTER TABLE public.forum_posts ADD COLUMN is_pinned BOOLEAN DEFAULT false;
ALTER TABLE public.forum_posts ADD COLUMN view_count INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tags
CREATE POLICY "Anyone can view tags"
ON public.tags FOR SELECT
USING (true);

CREATE POLICY "Admins can manage tags"
ON public.tags FOR ALL
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'co_admin'::app_role]));

-- RLS Policies for post_tags
CREATE POLICY "Anyone can view post tags"
ON public.post_tags FOR SELECT
USING (true);

CREATE POLICY "Post authors can add tags"
ON public.post_tags FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.forum_posts
    WHERE id = post_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Post authors can remove tags"
ON public.post_tags FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.forum_posts
    WHERE id = post_id AND user_id = auth.uid()
  )
);

-- RLS Policies for post_media
CREATE POLICY "Anyone can view post media"
ON public.post_media FOR SELECT
USING (true);

CREATE POLICY "Post authors can add media"
ON public.post_media FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.forum_posts
    WHERE id = post_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Post authors can manage media"
ON public.post_media FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.forum_posts
    WHERE id = post_id AND user_id = auth.uid()
  )
);

-- RLS Policies for bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON public.bookmarks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookmarks"
ON public.bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON public.bookmarks FOR DELETE
USING (auth.uid() = user_id);

-- Insert default tags
INSERT INTO public.tags (name, slug, description, color) VALUES
('General', 'general', 'General climate discussions', '#3b82f6'),
('Question', 'question', 'Questions from the community', '#f59e0b'),
('Tips', 'tips', 'Practical tips and advice', '#10b981'),
('News', 'news', 'Climate news and updates', '#ef4444'),
('Success Story', 'success-story', 'Share your victories', '#8b5cf6'),
('Local Action', 'local-action', 'Community initiatives', '#ec4899'),
('Research', 'research', 'Scientific research and data', '#06b6d4'),
('Policy', 'policy', 'Climate policy discussions', '#f97316');

-- Create search function for posts
CREATE OR REPLACE FUNCTION public.search_forum_posts(
  search_query TEXT,
  forum_filter UUID DEFAULT NULL,
  tag_filter UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  forum_id UUID,
  user_id UUID,
  title TEXT,
  content TEXT,
  content_html TEXT,
  views INTEGER,
  is_pinned BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  username TEXT,
  avatar_url TEXT,
  comment_count BIGINT,
  relevance REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fp.id,
    fp.forum_id,
    fp.user_id,
    fp.title,
    fp.content,
    fp.content_html,
    fp.views,
    fp.is_pinned,
    fp.created_at,
    p.username,
    p.avatar_url,
    (SELECT COUNT(*) FROM comments WHERE parent_type = 'forum_post' AND parent_id = fp.id) as comment_count,
    ts_rank(
      to_tsvector('english', fp.title || ' ' || fp.content),
      plainto_tsquery('english', search_query)
    ) as relevance
  FROM forum_posts fp
  JOIN profiles p ON fp.user_id = p.id
  WHERE 
    (forum_filter IS NULL OR fp.forum_id = forum_filter)
    AND (
      tag_filter IS NULL 
      OR EXISTS (
        SELECT 1 FROM post_tags pt 
        WHERE pt.post_id = fp.id AND pt.tag_id = tag_filter
      )
    )
    AND (
      to_tsvector('english', fp.title || ' ' || fp.content) @@ plainto_tsquery('english', search_query)
    )
  ORDER BY fp.is_pinned DESC, relevance DESC, fp.created_at DESC
  LIMIT 50;
END;
$$;

-- Create storage bucket for post media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-media', 'post-media', true)
ON CONFLICT DO NOTHING;

-- Storage policies for post-media
CREATE POLICY "Anyone can view post media"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-media');

CREATE POLICY "Authenticated users can upload post media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own post media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'post-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own post media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
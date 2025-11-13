-- Create forums table
CREATE TABLE public.forums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '💬',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum posts table
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id UUID NOT NULL REFERENCES public.forums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table (for both forum posts and climate actions)
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  parent_type TEXT NOT NULL, -- 'forum_post' or 'climate_action'
  parent_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reactions table
CREATE TABLE public.reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  parent_type TEXT NOT NULL, -- 'forum_post', 'climate_action', or 'comment'
  parent_id UUID NOT NULL,
  reaction_type TEXT NOT NULL, -- 'like', 'love', 'celebrate', etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, parent_type, parent_id)
);

-- Enable RLS
ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forums
CREATE POLICY "Anyone can view forums"
ON public.forums FOR SELECT
USING (true);

CREATE POLICY "Admins can manage forums"
ON public.forums FOR ALL
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'co_admin'::app_role]));

-- RLS Policies for forum_posts
CREATE POLICY "Anyone can view forum posts"
ON public.forum_posts FOR SELECT
USING (true);

CREATE POLICY "Users can create forum posts"
ON public.forum_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forum posts"
ON public.forum_posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forum posts"
ON public.forum_posts FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Anyone can view comments"
ON public.comments FOR SELECT
USING (true);

CREATE POLICY "Users can create comments"
ON public.comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for reactions
CREATE POLICY "Anyone can view reactions"
ON public.reactions FOR SELECT
USING (true);

CREATE POLICY "Users can create reactions"
ON public.reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
ON public.reactions FOR DELETE
USING (auth.uid() = user_id);

-- Insert default forums
INSERT INTO public.forums (name, description, icon) VALUES
('General Discussion', 'Share your thoughts and ideas about climate action', '💬'),
('Tips & Tricks', 'Share practical tips for sustainable living', '💡'),
('Success Stories', 'Celebrate your climate action victories', '🌟'),
('Questions & Help', 'Ask questions and get help from the community', '❓'),
('Local Initiatives', 'Discuss local environmental projects', '🏘️');

-- Create function to update forum post views
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.forum_posts
  SET views = views + 1
  WHERE id = post_id;
END;
$$;
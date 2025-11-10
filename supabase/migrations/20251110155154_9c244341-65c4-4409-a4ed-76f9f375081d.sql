-- Add trending and engagement features

-- Add trending score calculation fields to forum_posts
ALTER TABLE public.forum_posts 
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS trending_score NUMERIC DEFAULT 0;

-- Create function to calculate trending score
CREATE OR REPLACE FUNCTION public.calculate_trending_score(
  p_post_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_views INTEGER;
  v_comments INTEGER;
  v_reactions INTEGER;
  v_age_hours NUMERIC;
  v_score NUMERIC;
BEGIN
  -- Get post metrics
  SELECT 
    fp.views,
    (SELECT COUNT(*) FROM comments WHERE parent_type = 'forum_post' AND parent_id = p_post_id),
    (SELECT COUNT(*) FROM reactions WHERE parent_type = 'forum_post' AND parent_id = p_post_id),
    EXTRACT(EPOCH FROM (NOW() - fp.created_at)) / 3600
  INTO v_views, v_comments, v_reactions, v_age_hours
  FROM forum_posts fp
  WHERE fp.id = p_post_id;
  
  -- Calculate trending score (more recent = higher score)
  -- Formula: (views + comments*5 + reactions*3) / (age_in_hours + 2)^1.5
  v_score := (v_views + (v_comments * 5) + (v_reactions * 3)) / POWER((v_age_hours + 2), 1.5);
  
  RETURN v_score;
END;
$$;

-- Create function to update trending scores
CREATE OR REPLACE FUNCTION public.update_trending_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE forum_posts
  SET trending_score = calculate_trending_score(id)
  WHERE created_at > NOW() - INTERVAL '7 days';
END;
$$;

-- Create user interests table for personalized recommendations
CREATE TABLE IF NOT EXISTS public.user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  interest_score INTEGER DEFAULT 1,
  last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, tag_id)
);

ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interests"
ON public.user_interests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own interests"
ON public.user_interests FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create post recommendations table
CREATE TABLE IF NOT EXISTS public.post_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  recommendation_score NUMERIC DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE public.post_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recommendations"
ON public.post_recommendations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create view counts table for better analytics
CREATE TABLE IF NOT EXISTS public.post_view_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_id TEXT
);

ALTER TABLE public.post_view_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record views"
ON public.post_view_history FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their own history"
ON public.post_view_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Function to get trending posts
CREATE OR REPLACE FUNCTION public.get_trending_posts(
  p_limit INTEGER DEFAULT 10,
  p_forum_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  forum_id UUID,
  user_id UUID,
  title TEXT,
  content TEXT,
  views INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  trending_score NUMERIC,
  comment_count BIGINT,
  reaction_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update trending scores first
  PERFORM update_trending_scores();
  
  RETURN QUERY
  SELECT 
    fp.id,
    fp.forum_id,
    fp.user_id,
    fp.title,
    fp.content,
    fp.views,
    fp.created_at,
    fp.trending_score,
    (SELECT COUNT(*) FROM comments WHERE parent_type = 'forum_post' AND parent_id = fp.id) as comment_count,
    (SELECT COUNT(*) FROM reactions WHERE parent_type = 'forum_post' AND parent_id = fp.id) as reaction_count
  FROM forum_posts fp
  WHERE 
    (p_forum_id IS NULL OR fp.forum_id = p_forum_id)
    AND fp.created_at > NOW() - INTERVAL '7 days'
  ORDER BY fp.trending_score DESC, fp.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function to get personalized recommendations
CREATE OR REPLACE FUNCTION public.get_recommended_posts(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  forum_id UUID,
  user_id UUID,
  title TEXT,
  content TEXT,
  views INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  recommendation_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    fp.id,
    fp.forum_id,
    fp.user_id,
    fp.title,
    fp.content,
    fp.views,
    fp.created_at,
    'Based on your interests' as recommendation_reason
  FROM forum_posts fp
  INNER JOIN post_tags pt ON fp.id = pt.post_id
  INNER JOIN user_interests ui ON pt.tag_id = ui.tag_id
  WHERE 
    ui.user_id = p_user_id
    AND fp.user_id != p_user_id
    AND fp.id NOT IN (
      SELECT post_id FROM bookmarks WHERE user_id = p_user_id
    )
    AND fp.id NOT IN (
      SELECT post_id FROM post_view_history 
      WHERE user_id = p_user_id 
      AND viewed_at > NOW() - INTERVAL '7 days'
    )
  ORDER BY ui.interest_score DESC, fp.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function to track user interests based on interactions
CREATE OR REPLACE FUNCTION public.track_user_interest()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tag_id UUID;
BEGIN
  -- Get tags from the post
  FOR v_tag_id IN 
    SELECT tag_id FROM post_tags WHERE post_id = NEW.parent_id
  LOOP
    -- Insert or update user interest
    INSERT INTO user_interests (user_id, tag_id, interest_score, last_interaction_at)
    VALUES (NEW.user_id, v_tag_id, 1, NOW())
    ON CONFLICT (user_id, tag_id) 
    DO UPDATE SET 
      interest_score = user_interests.interest_score + 1,
      last_interaction_at = NOW();
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger to track interests when users comment or react
CREATE TRIGGER track_interest_on_comment
AFTER INSERT ON comments
FOR EACH ROW
WHEN (NEW.parent_type = 'forum_post')
EXECUTE FUNCTION track_user_interest();

CREATE TRIGGER track_interest_on_reaction
AFTER INSERT ON reactions
FOR EACH ROW
WHEN (NEW.parent_type = 'forum_post')
EXECUTE FUNCTION track_user_interest();

-- Function to update last activity on posts
CREATE OR REPLACE FUNCTION public.update_post_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE forum_posts
  SET last_activity_at = NOW()
  WHERE id = NEW.parent_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_activity_on_comment
AFTER INSERT ON comments
FOR EACH ROW
WHEN (NEW.parent_type = 'forum_post')
EXECUTE FUNCTION update_post_activity();

CREATE TRIGGER update_activity_on_reaction
AFTER INSERT ON reactions
FOR EACH ROW
WHEN (NEW.parent_type = 'forum_post')
EXECUTE FUNCTION update_post_activity();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_trending ON forum_posts(trending_score DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_activity ON forum_posts(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests(user_id, interest_score DESC);
CREATE INDEX IF NOT EXISTS idx_post_view_history_user ON post_view_history(user_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_view_history_post ON post_view_history(post_id, viewed_at DESC);
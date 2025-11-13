-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  reported_type TEXT NOT NULL, -- 'post', 'comment', 'user', 'action'
  reported_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewing', 'resolved', 'dismissed'
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create moderation_actions table
CREATE TABLE public.moderation_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moderator_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'suspend', 'ban', 'warn', 'delete_content', 'pin_post', 'unpin_post'
  target_type TEXT NOT NULL, -- 'user', 'post', 'comment'
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  duration_days INTEGER, -- for temporary suspensions
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add moderation fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS warnings_count INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "Users can create reports"
ON public.reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
ON public.reports FOR SELECT
USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
ON public.reports FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'co_admin'::app_role]));

CREATE POLICY "Admins can update reports"
ON public.reports FOR UPDATE
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'co_admin'::app_role]));

-- RLS Policies for moderation_actions
CREATE POLICY "Admins can view moderation actions"
ON public.moderation_actions FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'co_admin'::app_role]));

CREATE POLICY "Admins can create moderation actions"
ON public.moderation_actions FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'co_admin'::app_role]));

-- Create function to get admin statistics
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'active_users_7d', (SELECT COUNT(DISTINCT user_id) FROM climate_actions WHERE created_at > NOW() - INTERVAL '7 days'),
    'total_posts', (SELECT COUNT(*) FROM forum_posts),
    'total_comments', (SELECT COUNT(*) FROM comments),
    'total_actions', (SELECT COUNT(*) FROM climate_actions),
    'pending_reports', (SELECT COUNT(*) FROM reports WHERE status = 'pending'),
    'suspended_users', (SELECT COUNT(*) FROM profiles WHERE suspended = true),
    'posts_today', (SELECT COUNT(*) FROM forum_posts WHERE created_at::date = CURRENT_DATE),
    'actions_today', (SELECT COUNT(*) FROM climate_actions WHERE created_at::date = CURRENT_DATE)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create function to get content statistics
CREATE OR REPLACE FUNCTION public.get_content_stats(days INTEGER DEFAULT 30)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'posts_by_day', (
      SELECT json_agg(day_data ORDER BY day)
      FROM (
        SELECT 
          DATE(created_at) as day,
          COUNT(*) as count
        FROM forum_posts
        WHERE created_at > NOW() - (days || ' days')::INTERVAL
        GROUP BY DATE(created_at)
      ) day_data
    ),
    'actions_by_category', (
      SELECT json_object_agg(category, count)
      FROM (
        SELECT category, COUNT(*) as count
        FROM climate_actions
        WHERE created_at > NOW() - (days || ' days')::INTERVAL
        GROUP BY category
      ) cat_data
    ),
    'top_contributors', (
      SELECT json_agg(user_data ORDER BY action_count DESC)
      FROM (
        SELECT 
          p.username,
          p.id,
          COUNT(*) as action_count
        FROM climate_actions ca
        JOIN profiles p ON ca.user_id = p.id
        WHERE ca.created_at > NOW() - (days || ' days')::INTERVAL
        GROUP BY p.username, p.id
        ORDER BY COUNT(*) DESC
        LIMIT 10
      ) user_data
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create trigger to update report timestamp
CREATE OR REPLACE FUNCTION public.update_report_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_reports_timestamp
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_report_timestamp();

-- Create function to suspend user
CREATE OR REPLACE FUNCTION public.suspend_user(
  p_user_id UUID,
  p_reason TEXT,
  p_duration_days INTEGER DEFAULT NULL,
  p_moderator_id UUID DEFAULT auth.uid()
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT has_any_role(p_moderator_id, ARRAY['admin'::app_role, 'co_admin'::app_role]) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Update profile
  UPDATE profiles
  SET 
    suspended = true,
    suspension_reason = p_reason,
    suspended_until = CASE 
      WHEN p_duration_days IS NOT NULL 
      THEN NOW() + (p_duration_days || ' days')::INTERVAL 
      ELSE NULL 
    END
  WHERE id = p_user_id;
  
  -- Log moderation action
  INSERT INTO moderation_actions (
    moderator_id,
    action_type,
    target_type,
    target_id,
    reason,
    duration_days,
    expires_at
  ) VALUES (
    p_moderator_id,
    'suspend',
    'user',
    p_user_id,
    p_reason,
    p_duration_days,
    CASE 
      WHEN p_duration_days IS NOT NULL 
      THEN NOW() + (p_duration_days || ' days')::INTERVAL 
      ELSE NULL 
    END
  );
END;
$$;

-- Create function to unsuspend user
CREATE OR REPLACE FUNCTION public.unsuspend_user(
  p_user_id UUID,
  p_moderator_id UUID DEFAULT auth.uid()
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT has_any_role(p_moderator_id, ARRAY['admin'::app_role, 'co_admin'::app_role]) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  UPDATE profiles
  SET 
    suspended = false,
    suspension_reason = NULL,
    suspended_until = NULL
  WHERE id = p_user_id;
END;
$$;
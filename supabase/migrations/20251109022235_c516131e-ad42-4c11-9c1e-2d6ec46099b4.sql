-- Create involvement forms table for different roles
CREATE TABLE IF NOT EXISTS public.involvement_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK (role_type IN ('educator', 'translator', 'developer', 'partner')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT,
  organization TEXT,
  experience TEXT,
  motivation TEXT,
  availability TEXT,
  skills TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected'))
);

-- Create feedback forms table
CREATE TABLE IF NOT EXISTS public.feedback_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'partnership', 'technical', 'suggestion')),
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved'))
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  achievement_icon TEXT,
  points_awarded INTEGER DEFAULT 0,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_type, achievement_name)
);

-- Enable RLS
ALTER TABLE public.involvement_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for involvement_forms
CREATE POLICY "Users can create involvement forms"
  ON public.involvement_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own involvement forms"
  ON public.involvement_forms
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all involvement forms"
  ON public.involvement_forms
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for feedback_forms
CREATE POLICY "Anyone can create feedback"
  ON public.feedback_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own feedback"
  ON public.feedback_forms
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
  ON public.feedback_forms
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public achievements are viewable"
  ON public.user_achievements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
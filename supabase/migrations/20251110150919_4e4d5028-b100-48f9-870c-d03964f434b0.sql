-- Create daily challenges table
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 50,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  active_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user challenge completions table
CREATE TABLE IF NOT EXISTS public.user_challenge_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INTEGER NOT NULL DEFAULT 10,
  is_public BOOLEAN NOT NULL DEFAULT true,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_challenges
CREATE POLICY "Anyone can view active challenges"
  ON public.daily_challenges FOR SELECT
  USING (true);

-- RLS Policies for user_challenge_completions
CREATE POLICY "Users can view their own completions"
  ON public.user_challenge_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
  ON public.user_challenge_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for teams
CREATE POLICY "Public teams are viewable by everyone"
  ON public.teams FOR SELECT
  USING (is_public = true OR EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = teams.id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team admins can update teams"
  ON public.teams FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = teams.id AND user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Team creators can delete teams"
  ON public.teams FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for team_members
CREATE POLICY "Anyone can view team members of public teams"
  ON public.team_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = team_members.team_id AND is_public = true
  ) OR auth.uid() = user_id);

CREATE POLICY "Users can join teams"
  ON public.team_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave teams"
  ON public.team_members FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update team points
CREATE OR REPLACE FUNCTION public.update_team_points_on_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update all teams the user is a member of
  UPDATE public.teams
  SET 
    total_points = total_points + NEW.points_awarded,
    updated_at = now()
  WHERE id IN (
    SELECT team_id FROM public.team_members WHERE user_id = NEW.user_id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to update team points when user completes action
CREATE TRIGGER update_team_points_trigger
  AFTER INSERT ON public.climate_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_points_on_action();

-- Create function to send notification
CREATE OR REPLACE FUNCTION public.send_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Create function to check and send streak notifications
CREATE OR REPLACE FUNCTION public.check_streak_milestones()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_streak INTEGER;
BEGIN
  SELECT current_streak INTO v_streak
  FROM public.user_stats
  WHERE user_id = NEW.user_id;
  
  -- Send notifications for streak milestones
  IF v_streak = 3 THEN
    PERFORM public.send_notification(
      NEW.user_id,
      'streak_milestone',
      '🔥 3-Day Streak!',
      'You''re on fire! Keep up the great work.',
      jsonb_build_object('streak', v_streak)
    );
  ELSIF v_streak = 7 THEN
    PERFORM public.send_notification(
      NEW.user_id,
      'streak_milestone',
      '🔥 Week Warrior!',
      'Amazing! You''ve maintained a 7-day streak.',
      jsonb_build_object('streak', v_streak)
    );
  ELSIF v_streak = 30 THEN
    PERFORM public.send_notification(
      NEW.user_id,
      'streak_milestone',
      '🌟 Month Master!',
      'Incredible! 30 days of consistent action.',
      jsonb_build_object('streak', v_streak)
    );
  ELSIF v_streak = 100 THEN
    PERFORM public.send_notification(
      NEW.user_id,
      'streak_milestone',
      '💎 Century Champion!',
      'Legendary! You''ve achieved a 100-day streak.',
      jsonb_build_object('streak', v_streak)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for streak notifications
CREATE TRIGGER check_streak_milestones_trigger
  AFTER INSERT ON public.climate_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_streak_milestones();

-- Insert sample daily challenges
INSERT INTO public.daily_challenges (title, description, category, points_reward, difficulty, active_date, expires_at)
VALUES 
  ('Tree Planting Tuesday', 'Plant a tree or help maintain a local green space', 'tree_planting', 100, 'medium', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'),
  ('Water Conservation', 'Track your water-saving actions for the day', 'water_saving', 50, 'easy', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'),
  ('Energy Audit', 'Conduct an energy audit of your home or workplace', 'energy_conservation', 150, 'hard', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day');
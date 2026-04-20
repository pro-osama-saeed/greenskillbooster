-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create action categories enum
CREATE TYPE public.action_category AS ENUM (
  'tree_planting',
  'water_saving',
  'energy_conservation',
  'teaching',
  'recycling',
  'transportation',
  'other'
);

-- Create climate actions table
CREATE TABLE public.climate_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category action_category NOT NULL,
  story TEXT,
  photo_url TEXT,
  voice_note_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  country TEXT,
  city TEXT,
  is_public BOOLEAN DEFAULT true,
  points_awarded INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.climate_actions ENABLE ROW LEVEL SECURITY;

-- Climate actions policies
CREATE POLICY "Public actions are viewable by everyone"
ON public.climate_actions FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own actions"
ON public.climate_actions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own actions"
ON public.climate_actions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own actions"
ON public.climate_actions FOR DELETE
USING (auth.uid() = user_id);

-- Create user stats table
CREATE TABLE public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_actions INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_action_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- User stats policies
CREATE POLICY "Users can view their own stats"
ON public.user_stats FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
ON public.user_stats FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
ON public.user_stats FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update user stats after action
CREATE OR REPLACE FUNCTION public.update_user_stats_on_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_action_date DATE;
  v_current_streak INTEGER;
BEGIN
  -- Get current stats
  SELECT last_action_date, current_streak INTO v_last_action_date, v_current_streak
  FROM public.user_stats
  WHERE user_id = NEW.user_id;
  
  -- Calculate new streak
  IF v_last_action_date IS NULL THEN
    v_current_streak := 1;
  ELSIF v_last_action_date = CURRENT_DATE THEN
    v_current_streak := v_current_streak;
  ELSIF v_last_action_date = CURRENT_DATE - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
  ELSE
    v_current_streak := 1;
  END IF;
  
  -- Update stats
  UPDATE public.user_stats
  SET 
    total_actions = total_actions + 1,
    total_points = total_points + NEW.points_awarded,
    current_streak = v_current_streak,
    longest_streak = GREATEST(longest_streak, v_current_streak),
    last_action_date = CURRENT_DATE,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update stats on new action
CREATE TRIGGER on_climate_action_created
AFTER INSERT ON public.climate_actions
FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_on_action();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('action-photos', 'action-photos', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice-notes', 'voice-notes', true);

-- Storage policies for action photos
CREATE POLICY "Anyone can view public action photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'action-photos');

CREATE POLICY "Users can upload their own action photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'action-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own action photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'action-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own action photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'action-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for voice notes
CREATE POLICY "Anyone can view public voice notes"
ON storage.objects FOR SELECT
USING (bucket_id = 'voice-notes');

CREATE POLICY "Users can upload their own voice notes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'voice-notes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own voice notes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'voice-notes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own voice notes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'voice-notes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable realtime for community wall
ALTER PUBLICATION supabase_realtime ADD TABLE public.climate_actions;
-- Create user goals table
CREATE TABLE public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('weekly_actions', 'monthly_actions', 'weekly_points', 'monthly_points', 'category_focus', 'streak_target')),
  target_value INTEGER NOT NULL CHECK (target_value > 0),
  current_value INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_goals
CREATE POLICY "Users can view their own goals"
  ON public.user_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
  ON public.user_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON public.user_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON public.user_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX idx_user_goals_period ON public.user_goals(period_start, period_end);

-- Function to update goal progress
CREATE OR REPLACE FUNCTION public.update_goal_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_goal RECORD;
BEGIN
  -- Update weekly/monthly action goals
  FOR v_goal IN 
    SELECT * FROM public.user_goals 
    WHERE user_id = NEW.user_id 
    AND goal_type IN ('weekly_actions', 'monthly_actions')
    AND period_start <= CURRENT_DATE 
    AND period_end >= CURRENT_DATE
    AND NOT completed
  LOOP
    UPDATE public.user_goals
    SET 
      current_value = (
        SELECT COUNT(*) 
        FROM public.climate_actions 
        WHERE user_id = NEW.user_id 
        AND created_at::date >= v_goal.period_start 
        AND created_at::date <= v_goal.period_end
      ),
      completed = (
        SELECT COUNT(*) >= v_goal.target_value
        FROM public.climate_actions 
        WHERE user_id = NEW.user_id 
        AND created_at::date >= v_goal.period_start 
        AND created_at::date <= v_goal.period_end
      ),
      updated_at = now()
    WHERE id = v_goal.id;
  END LOOP;
  
  -- Update weekly/monthly points goals
  FOR v_goal IN 
    SELECT * FROM public.user_goals 
    WHERE user_id = NEW.user_id 
    AND goal_type IN ('weekly_points', 'monthly_points')
    AND period_start <= CURRENT_DATE 
    AND period_end >= CURRENT_DATE
    AND NOT completed
  LOOP
    UPDATE public.user_goals
    SET 
      current_value = (
        SELECT COALESCE(SUM(points_awarded), 0)
        FROM public.climate_actions 
        WHERE user_id = NEW.user_id 
        AND created_at::date >= v_goal.period_start 
        AND created_at::date <= v_goal.period_end
      ),
      completed = (
        SELECT COALESCE(SUM(points_awarded), 0) >= v_goal.target_value
        FROM public.climate_actions 
        WHERE user_id = NEW.user_id 
        AND created_at::date >= v_goal.period_start 
        AND created_at::date <= v_goal.period_end
      ),
      updated_at = now()
    WHERE id = v_goal.id;
  END LOOP;
  
  -- Update category focus goals
  FOR v_goal IN 
    SELECT * FROM public.user_goals 
    WHERE user_id = NEW.user_id 
    AND goal_type = 'category_focus'
    AND period_start <= CURRENT_DATE 
    AND period_end >= CURRENT_DATE
    AND NOT completed
  LOOP
    UPDATE public.user_goals
    SET 
      current_value = (
        SELECT COUNT(*) 
        FROM public.climate_actions 
        WHERE user_id = NEW.user_id 
        AND category::text = v_goal.category
        AND created_at::date >= v_goal.period_start 
        AND created_at::date <= v_goal.period_end
      ),
      completed = (
        SELECT COUNT(*) >= v_goal.target_value
        FROM public.climate_actions 
        WHERE user_id = NEW.user_id 
        AND category::text = v_goal.category
        AND created_at::date >= v_goal.period_start 
        AND created_at::date <= v_goal.period_end
      ),
      updated_at = now()
    WHERE id = v_goal.id;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger to update goal progress after action insert
CREATE TRIGGER update_goals_on_action
  AFTER INSERT ON public.climate_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_goal_progress();

-- Function to update streak goals
CREATE OR REPLACE FUNCTION public.update_streak_goals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_goals
  SET 
    current_value = NEW.current_streak,
    completed = NEW.current_streak >= target_value,
    updated_at = now()
  WHERE user_id = NEW.user_id 
  AND goal_type = 'streak_target'
  AND NOT completed;
  
  RETURN NEW;
END;
$$;

-- Trigger to update streak goals after stats update
CREATE TRIGGER update_streak_goals_on_stats
  AFTER UPDATE OF current_streak ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_streak_goals();
-- Function to check and award streak badges
CREATE OR REPLACE FUNCTION public.check_and_award_streak_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_streak INTEGER;
BEGIN
  -- Get current streak
  SELECT current_streak INTO v_current_streak
  FROM public.user_stats
  WHERE user_id = NEW.user_id;
  
  -- Award 7-day streak badge
  IF v_current_streak >= 7 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = NEW.user_id AND achievement_type = 'streak_7'
  ) THEN
    INSERT INTO public.user_achievements (
      user_id, achievement_type, achievement_name, achievement_description, 
      achievement_icon, points_awarded
    ) VALUES (
      NEW.user_id, 'streak_7', '🔥 Week Warrior', 
      'Maintained a 7-day streak', '🔥', 50
    );
  END IF;
  
  -- Award 30-day streak badge
  IF v_current_streak >= 30 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = NEW.user_id AND achievement_type = 'streak_30'
  ) THEN
    INSERT INTO public.user_achievements (
      user_id, achievement_type, achievement_name, achievement_description, 
      achievement_icon, points_awarded
    ) VALUES (
      NEW.user_id, 'streak_30', '🌟 Month Master', 
      'Maintained a 30-day streak', '🌟', 150
    );
  END IF;
  
  -- Award 100-day streak badge
  IF v_current_streak >= 100 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = NEW.user_id AND achievement_type = 'streak_100'
  ) THEN
    INSERT INTO public.user_achievements (
      user_id, achievement_type, achievement_name, achievement_description, 
      achievement_icon, points_awarded
    ) VALUES (
      NEW.user_id, 'streak_100', '💎 Century Champion', 
      'Maintained a 100-day streak', '💎', 500
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to check streak badges after stats update
CREATE TRIGGER check_streak_badges_trigger
AFTER UPDATE OF current_streak ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.check_and_award_streak_badges();

-- Function to check and award action count badges
CREATE OR REPLACE FUNCTION public.check_and_award_action_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total_actions INTEGER;
  v_category TEXT;
  v_category_count INTEGER;
BEGIN
  -- Get total actions
  SELECT total_actions INTO v_total_actions
  FROM public.user_stats
  WHERE user_id = NEW.user_id;
  
  -- Award first action badge
  IF v_total_actions >= 1 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = NEW.user_id AND achievement_type = 'first_action'
  ) THEN
    INSERT INTO public.user_achievements (
      user_id, achievement_type, achievement_name, achievement_description, 
      achievement_icon, points_awarded
    ) VALUES (
      NEW.user_id, 'first_action', '🌱 First Steps', 
      'Completed your first climate action', '🌱', 10
    );
  END IF;
  
  -- Award 10 actions badge
  IF v_total_actions >= 10 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = NEW.user_id AND achievement_type = 'actions_10'
  ) THEN
    INSERT INTO public.user_achievements (
      user_id, achievement_type, achievement_name, achievement_description, 
      achievement_icon, points_awarded
    ) VALUES (
      NEW.user_id, 'actions_10', '🌿 Action Taker', 
      'Completed 10 climate actions', '🌿', 50
    );
  END IF;
  
  -- Award 50 actions badge
  IF v_total_actions >= 50 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = NEW.user_id AND achievement_type = 'actions_50'
  ) THEN
    INSERT INTO public.user_achievements (
      user_id, achievement_type, achievement_name, achievement_description, 
      achievement_icon, points_awarded
    ) VALUES (
      NEW.user_id, 'actions_50', '🌳 Eco Warrior', 
      'Completed 50 climate actions', '🌳', 200
    );
  END IF;
  
  -- Award 100 actions badge
  IF v_total_actions >= 100 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = NEW.user_id AND achievement_type = 'actions_100'
  ) THEN
    INSERT INTO public.user_achievements (
      user_id, achievement_type, achievement_name, achievement_description, 
      achievement_icon, points_awarded
    ) VALUES (
      NEW.user_id, 'actions_100', '🏆 Climate Hero', 
      'Completed 100 climate actions', '🏆', 500
    );
  END IF;
  
  -- Check category-specific badges
  FOR v_category IN 
    SELECT DISTINCT category FROM public.climate_actions WHERE user_id = NEW.user_id
  LOOP
    SELECT COUNT(*) INTO v_category_count
    FROM public.climate_actions
    WHERE user_id = NEW.user_id AND category = v_category;
    
    -- Award category master badges (10+ actions in one category)
    IF v_category_count >= 10 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = NEW.user_id AND achievement_type = 'category_' || v_category
    ) THEN
      INSERT INTO public.user_achievements (
        user_id, achievement_type, achievement_name, achievement_description, 
        achievement_icon, points_awarded
      ) VALUES (
        NEW.user_id, 
        'category_' || v_category, 
        '⭐ ' || initcap(replace(v_category, '_', ' ')) || ' Master', 
        'Completed 10+ actions in ' || replace(v_category, '_', ' '),
        '⭐', 
        100
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger to check action badges
CREATE TRIGGER check_action_badges_trigger
AFTER UPDATE OF total_actions ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.check_and_award_action_badges();

-- Function to award special event badges manually (can be called by admin)
CREATE OR REPLACE FUNCTION public.award_event_badge(
  p_user_id UUID,
  p_event_name TEXT,
  p_event_icon TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = p_user_id AND achievement_type = 'event_' || lower(replace(p_event_name, ' ', '_'))
  ) THEN
    INSERT INTO public.user_achievements (
      user_id, achievement_type, achievement_name, achievement_description, 
      achievement_icon, points_awarded
    ) VALUES (
      p_user_id, 
      'event_' || lower(replace(p_event_name, ' ', '_')),
      p_event_icon || ' ' || p_event_name,
      'Participated in ' || p_event_name,
      p_event_icon,
      100
    );
  END IF;
END;
$$;

-- Insert some initial special event badge templates
INSERT INTO public.user_achievements (
  user_id, achievement_type, achievement_name, achievement_description, 
  achievement_icon, points_awarded
)
SELECT 
  id,
  'event_earth_day_2025',
  '🌍 Earth Day 2025',
  'Participated in Earth Day 2025 activities',
  '🌍',
  100
FROM auth.users
WHERE raw_user_meta_data->>'joined_earth_day_2025' = 'true'
ON CONFLICT DO NOTHING;

-- Award early adopter badge
CREATE OR REPLACE FUNCTION public.award_early_adopter_badge()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_achievements (
    user_id, achievement_type, achievement_name, achievement_description, 
    achievement_icon, points_awarded
  )
  SELECT 
    id,
    'early_adopter',
    '🚀 Early Adopter',
    'Joined GreenSkill Booster in its early days',
    '🚀',
    50
  FROM auth.users
  WHERE created_at < NOW() - INTERVAL '7 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = auth.users.id AND achievement_type = 'early_adopter'
    );
END;
$$;
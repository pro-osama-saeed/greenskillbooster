-- Fix the type mismatch in check_and_award_action_badges function
DROP FUNCTION IF EXISTS public.check_and_award_action_badges() CASCADE;

CREATE OR REPLACE FUNCTION public.check_and_award_action_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total_actions INTEGER;
  v_category action_category;
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
      WHERE user_id = NEW.user_id AND achievement_type = 'category_' || v_category::text
    ) THEN
      INSERT INTO public.user_achievements (
        user_id, achievement_type, achievement_name, achievement_description, 
        achievement_icon, points_awarded
      ) VALUES (
        NEW.user_id, 
        'category_' || v_category::text, 
        '⭐ ' || initcap(replace(v_category::text, '_', ' ')) || ' Master', 
        'Completed 10+ actions in ' || replace(v_category::text, '_', ' '),
        '⭐', 
        100
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER check_action_badges_trigger
AFTER UPDATE OF total_actions ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.check_and_award_action_badges();
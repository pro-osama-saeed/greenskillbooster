-- Add privacy controls for profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private'));

-- Update climate_actions default visibility to false
ALTER TABLE public.climate_actions 
ALTER COLUMN is_public SET DEFAULT false;

-- Update RLS policy for profiles to respect privacy settings
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (
  profile_visibility = 'public' 
  OR auth.uid() = id 
  OR public.has_any_role(auth.uid(), ARRAY['admin', 'co_admin']::app_role[])
);

-- Update RLS policy for climate_actions to respect privacy
DROP POLICY IF EXISTS "Users can view public climate actions" ON public.climate_actions;

CREATE POLICY "Users can view public climate actions" 
ON public.climate_actions 
FOR SELECT 
USING (
  is_public = true 
  OR auth.uid() = user_id 
  OR public.has_any_role(auth.uid(), ARRAY['admin', 'co_admin']::app_role[])
);

-- Add function to anonymize coordinates (rounds to ~1km precision)
CREATE OR REPLACE FUNCTION public.anonymize_coordinates(lat DOUBLE PRECISION, lon DOUBLE PRECISION)
RETURNS JSON
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN json_build_object(
    'lat', ROUND(lat::numeric, 2),
    'lon', ROUND(lon::numeric, 2)
  );
END;
$$;
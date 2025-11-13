-- Fix search path for anonymize_coordinates function
DROP FUNCTION IF EXISTS public.anonymize_coordinates(DOUBLE PRECISION, DOUBLE PRECISION);

CREATE OR REPLACE FUNCTION public.anonymize_coordinates(lat DOUBLE PRECISION, lon DOUBLE PRECISION)
RETURNS JSON
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN json_build_object(
    'lat', ROUND(lat::numeric, 2),
    'lon', ROUND(lon::numeric, 2)
  );
END;
$$;
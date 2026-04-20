
CREATE OR REPLACE FUNCTION public.is_issuing_status(_status text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT _status IN ('sent','paid');
$$;

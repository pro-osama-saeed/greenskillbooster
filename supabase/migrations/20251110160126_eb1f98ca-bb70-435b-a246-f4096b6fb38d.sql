-- Fix search_path security warning by setting to empty string
-- All references are already fully qualified with schema names

CREATE OR REPLACE FUNCTION public.assign_user_role(
  p_user_id UUID,
  p_role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can assign roles';
  END IF;
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, p_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_user_role(
  p_user_id UUID,
  p_role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can revoke roles';
  END IF;
  
  -- Don't allow removing last admin
  IF p_role = 'admin' THEN
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') <= 1 THEN
      RAISE EXCEPTION 'Cannot remove the last admin';
    END IF;
  END IF;
  
  DELETE FROM public.user_roles 
  WHERE user_id = p_user_id AND role = p_role;
END;
$$;
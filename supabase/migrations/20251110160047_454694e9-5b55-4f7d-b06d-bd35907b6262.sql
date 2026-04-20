-- Phase 1: Assign Admin Role to pro1.osama@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('4334ce58-0393-446d-a045-7192b7c9fe7e', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Phase 5: Create Admin Management Functions
CREATE OR REPLACE FUNCTION public.assign_user_role(
  p_user_id UUID,
  p_role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
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
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
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

-- Phase 7: Create Audit Trail
CREATE TABLE IF NOT EXISTS public.admin_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Only admins can view logs
CREATE POLICY "Admins can view access logs"
ON public.admin_access_logs FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- RLS: Only admins can insert logs
CREATE POLICY "Admins can create access logs"
ON public.admin_access_logs FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_admin_id ON public.admin_access_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_created_at ON public.admin_access_logs(created_at DESC);
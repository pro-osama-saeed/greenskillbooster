-- Create a function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- Update RLS policies for admin/co-admin access
-- Drop and recreate policies for tables that need co-admin access

-- Update feedback_forms policies
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback_forms;
CREATE POLICY "Admins and co-admins can view all feedback"
ON public.feedback_forms
FOR ALL
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'co_admin'::app_role]));

-- Update involvement_forms policies
DROP POLICY IF EXISTS "Admins can view all involvement forms" ON public.involvement_forms;
CREATE POLICY "Admins and co-admins can view all involvement forms"
ON public.involvement_forms
FOR ALL
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'co_admin'::app_role]));

-- Update lesson_suggestions policies
DROP POLICY IF EXISTS "Admins can update suggestions" ON public.lesson_suggestions;
DROP POLICY IF EXISTS "Admins can view all suggestions" ON public.lesson_suggestions;

CREATE POLICY "Admins and co-admins can view all suggestions"
ON public.lesson_suggestions
FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'co_admin'::app_role]));

CREATE POLICY "Admins and co-admins can update suggestions"
ON public.lesson_suggestions
FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'co_admin'::app_role]));

-- Update profiles policies for admin access
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update suspension status" ON public.profiles;

CREATE POLICY "Admins and co-admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'co_admin'::app_role]) OR is_public = true OR auth.uid() = id);

CREATE POLICY "Admins and co-admins can update suspension status"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'co_admin'::app_role]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'co_admin'::app_role]));

-- Update user_stats policies for admin access
DROP POLICY IF EXISTS "Admins can update any user stats" ON public.user_stats;

CREATE POLICY "Admins and co-admins can update any user stats"
ON public.user_stats
FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'co_admin'::app_role]));

-- Update user_achievements policies for admin access
DROP POLICY IF EXISTS "Admins can manage achievements" ON public.user_achievements;

CREATE POLICY "Admins and co-admins can manage achievements"
ON public.user_achievements
FOR ALL
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'co_admin'::app_role]));

-- Update user_roles policies to allow admins to view all roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Admins and co-admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'co_admin'::app_role]) OR auth.uid() = user_id);
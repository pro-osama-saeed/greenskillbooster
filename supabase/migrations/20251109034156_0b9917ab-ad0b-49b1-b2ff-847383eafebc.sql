-- Add suspension capability to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Create admin policy to update suspension status
CREATE POLICY "Admins can update suspension status"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create admin policy to manage user stats
CREATE POLICY "Admins can update any user stats"
ON public.user_stats
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin policy to manage achievements
CREATE POLICY "Admins can manage achievements"
ON public.user_achievements
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin policy to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
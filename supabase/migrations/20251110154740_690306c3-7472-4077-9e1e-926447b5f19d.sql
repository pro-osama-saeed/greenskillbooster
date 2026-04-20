-- Add foreign key constraint for reports reporter_id to profiles
ALTER TABLE public.reports
  ADD CONSTRAINT reports_reporter_id_fkey 
  FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for bookmarks user_id to profiles
ALTER TABLE public.bookmarks
  ADD CONSTRAINT bookmarks_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
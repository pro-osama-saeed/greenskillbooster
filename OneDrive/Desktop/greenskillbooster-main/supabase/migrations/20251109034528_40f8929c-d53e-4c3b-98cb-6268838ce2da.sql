-- Add suspension capability to profiles (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'suspended') THEN
    ALTER TABLE public.profiles ADD COLUMN suspended BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'suspension_reason') THEN
    ALTER TABLE public.profiles ADD COLUMN suspension_reason TEXT;
  END IF;
END $$;
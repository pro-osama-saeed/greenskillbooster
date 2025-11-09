-- Drop old broken policies
DROP POLICY IF EXISTS "Users can upload their own action photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own action photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own action photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create corrected INSERT policy
CREATE POLICY "Users can upload their own action photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'action-photos' 
  AND (auth.uid())::text = (storage.foldername(name))[2]
);

-- Create corrected UPDATE policy
CREATE POLICY "Users can update their own action photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'action-photos' 
  AND (auth.uid())::text = (storage.foldername(name))[2]
);

-- Create corrected DELETE policy
CREATE POLICY "Users can delete their own action photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'action-photos' 
  AND (auth.uid())::text = (storage.foldername(name))[2]
);
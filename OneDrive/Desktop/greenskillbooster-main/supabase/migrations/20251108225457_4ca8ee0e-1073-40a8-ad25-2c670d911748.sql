-- Secure storage buckets by making them private
UPDATE storage.buckets 
SET public = false 
WHERE id IN ('action-photos', 'voice-notes');

-- Allow users to upload their own files
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('action-photos', 'voice-notes')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id IN ('action-photos', 'voice-notes')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('action-photos', 'voice-notes')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow access to files based on action privacy
CREATE POLICY "Access files based on action privacy"
ON storage.objects FOR SELECT
USING (
  bucket_id IN ('action-photos', 'voice-notes')
  AND (
    -- Owner can always access their own files
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Anyone can access if the action is public
    EXISTS (
      SELECT 1 FROM public.climate_actions
      WHERE (photo_url LIKE '%' || storage.objects.name || '%' OR voice_note_url LIKE '%' || storage.objects.name || '%')
      AND is_public = true
    )
  )
);
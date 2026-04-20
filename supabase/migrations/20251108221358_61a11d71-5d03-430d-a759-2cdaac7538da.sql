-- Add DELETE policy to user_stats table for GDPR compliance
-- Allows users to delete their own statistics (Right to Erasure)
CREATE POLICY "Users can delete their own stats"
ON user_stats FOR DELETE
USING (auth.uid() = user_id);
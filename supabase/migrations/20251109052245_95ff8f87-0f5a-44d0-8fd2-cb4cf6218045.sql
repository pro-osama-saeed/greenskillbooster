-- Restrict user achievements to authenticated users only
-- This prevents unauthenticated access to user activity patterns

DROP POLICY IF EXISTS "Public achievements are viewable" ON user_achievements;

CREATE POLICY "Authenticated users can view achievements" 
ON user_achievements
FOR SELECT
TO authenticated
USING (true);
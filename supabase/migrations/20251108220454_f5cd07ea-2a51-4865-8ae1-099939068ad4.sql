-- Create rate limiting table for API usage tracking
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  function_name TEXT NOT NULL,
  called_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can view their own rate limit data
CREATE POLICY "Users can view their own rate limits"
ON public.api_rate_limits
FOR SELECT
USING (auth.uid() = user_id);

-- System can insert rate limit records (edge function will use service role)
CREATE POLICY "Service role can insert rate limits"
ON public.api_rate_limits
FOR INSERT
WITH CHECK (true);

-- Create index for efficient rate limit queries
CREATE INDEX idx_api_rate_limits_user_function_time 
ON public.api_rate_limits(user_id, function_name, called_at DESC);

-- Function to clean up old rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.api_rate_limits
  WHERE called_at < now() - INTERVAL '1 hour';
END;
$$;
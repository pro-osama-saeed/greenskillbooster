import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MINUTES = 15;
const MAX_CALLS_PER_WINDOW = 10;
const MAX_TEXT_LENGTH = 5000;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract and validate JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authentication required');
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    const { text, voiceId } = await req.json();

    // Input validation
    if (!text || typeof text !== 'string') {
      throw new Error('Text is required and must be a string');
    }

    if (text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    if (text.length > MAX_TEXT_LENGTH) {
      throw new Error(`Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`);
    }

    // Check rate limit
    const rateLimitStart = new Date();
    rateLimitStart.setMinutes(rateLimitStart.getMinutes() - RATE_LIMIT_WINDOW_MINUTES);

    const { data: recentCalls, error: rateLimitError } = await supabase
      .from('api_rate_limits')
      .select('id')
      .eq('user_id', user.id)
      .eq('function_name', 'text-to-speech')
      .gte('called_at', rateLimitStart.toISOString());

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      throw new Error('Rate limit check failed');
    }

    if (recentCalls && recentCalls.length >= MAX_CALLS_PER_WINDOW) {
      throw new Error(`Rate limit exceeded. Maximum ${MAX_CALLS_PER_WINDOW} calls per ${RATE_LIMIT_WINDOW_MINUTES} minutes. Please try again later.`);
    }

    // Record this API call
    const { error: insertError } = await supabase
      .from('api_rate_limits')
      .insert({
        user_id: user.id,
        function_name: 'text-to-speech'
      });

    if (insertError) {
      console.error('Failed to record API call:', insertError);
      // Don't fail the request if we can't record the call
    }

    const ELEVEN_LABS_API_KEY = Deno.env.get('ELEVEN_LABS_API_KEY');
    if (!ELEVEN_LABS_API_KEY) {
      throw new Error('ELEVEN_LABS_API_KEY is not configured');
    }

    // Use a default voice ID if not provided
    const selectedVoiceId = voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Sarah voice

    console.log('Generating speech for text length:', text.length);

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error('Failed to generate audio. Please try again later.');
    }

    // Get audio data
    const audioData = await response.arrayBuffer();
    console.log('Audio generated, size:', audioData.byteLength);

    // Convert to base64 in chunks to avoid stack overflow
    const uint8Array = new Uint8Array(audioData);
    const chunkSize = 8192; // Process 8KB at a time
    let binaryString = '';
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64Audio = btoa(binaryString);

    return new Response(
      JSON.stringify({ audio: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    
    // Return user-friendly error messages without exposing internal details
    const userMessage = error instanceof Error && error.message.includes('Rate limit') 
      ? error.message
      : error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Text'))
      ? error.message
      : 'Service temporarily unavailable. Please try again later.';
    
    const statusCode = error instanceof Error && error.message.includes('Authentication') ? 401 
      : error instanceof Error && error.message.includes('Rate limit') ? 429
      : error instanceof Error && (error.message.includes('Text') || error.message.includes('string')) ? 400
      : 500;
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

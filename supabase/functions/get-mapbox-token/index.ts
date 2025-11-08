import { corsHeaders } from '../_shared/cors.ts';

console.log('Get Mapbox Token function called');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mapboxToken = Deno.env.get('MAPBOX_TOKEN');

    if (!mapboxToken) {
      console.error('MAPBOX_TOKEN not configured in environment');
      return new Response(
        JSON.stringify({ 
          error: 'Mapbox token not configured',
          message: 'Please configure MAPBOX_TOKEN in backend secrets' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Returning Mapbox token (length:', mapboxToken.length, ')');

    return new Response(
      JSON.stringify({ token: mapboxToken }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in get-mapbox-token:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});


import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

const supabaseUrl = "https://qrcjxzktczmcnvcyuush.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  
  if (!token) {
    // Redirect to error page on frontend
    return new Response(null, { 
      status: 302,
      headers: { 
        "Location": "https://blogs.lynixdevs.us/subscription/error?reason=invalid-token",
        ...corsHeaders
      } 
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the token and get the corresponding email
    const { data: subscription, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, confirmed")
      .eq("id", token)
      .maybeSingle();
    
    if (error || !subscription) {
      // Redirect to error page on frontend
      return new Response(null, { 
        status: 302,
        headers: { 
          "Location": "https://blogs.lynixdevs.us/subscription/error?reason=invalid-subscription",
          ...corsHeaders
        } 
      });
    }
    
    if (subscription.confirmed) {
      // Already confirmed, redirect to success page with already confirmed flag
      return new Response(null, { 
        status: 302,
        headers: { 
          "Location": `https://blogs.lynixdevs.us/subscription/confirmed?email=${encodeURIComponent(subscription.email)}&status=already-confirmed`,
          ...corsHeaders
        } 
      });
    }
    
    // Update the subscriber to be confirmed
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({ confirmed: true })
      .eq("id", subscription.id);
    
    if (updateError) {
      console.error("Error updating subscriber:", updateError);
      
      // Redirect to error page on frontend
      return new Response(null, { 
        status: 302,
        headers: { 
          "Location": "https://blogs.lynixdevs.us/subscription/error?reason=update-failed",
          ...corsHeaders
        } 
      });
    }
    
    // Redirect to success page
    return new Response(null, { 
      status: 302,
      headers: { 
        "Location": `https://blogs.lynixdevs.us/subscription/confirmed?email=${encodeURIComponent(subscription.email)}&status=confirmed`,
        ...corsHeaders
      } 
    });
  } catch (error) {
    console.error("Error in verify-subscriber function:", error);
    
    // Redirect to error page
    return new Response(null, { 
      status: 302,
      headers: { 
        "Location": "https://blogs.lynixdevs.us/subscription/error?reason=server-error",
        ...corsHeaders
      } 
    });
  }
});

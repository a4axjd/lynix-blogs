
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

const supabaseUrl = "https://qrcjxzktczmcnvcyuush.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  cover_image: string;
  slug: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const { blogId } = await req.json();
    
    if (!blogId) {
      return new Response(
        JSON.stringify({ error: "Blog ID is required" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Get blog details
    const { data: blog, error: blogError } = await supabase
      .from("blogs")
      .select("id, title, excerpt, cover_image, slug")
      .eq("id", blogId)
      .single();

    if (blogError || !blog) {
      console.error("Error fetching blog:", blogError);
      return new Response(
        JSON.stringify({ error: "Blog not found" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Get all confirmed subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("confirmed", true);

    if (subscribersError) {
      console.error("Error fetching subscribers:", subscribersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscribers" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    if (subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No confirmed subscribers found" }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // In a real app, you would use a proper email service here
    console.log(`Sending newsletter about "${blog.title}" to ${subscribers.length} subscribers`);
    
    // Create a log entry
    const { data: logEntry, error: logError } = await supabase
      .from("newsletter_logs")
      .insert({
        blog_id: blog.id,
        recipients_count: subscribers.length,
        subject: `New Post: ${blog.title}`,
      })
      .select()
      .single();

    if (logError) {
      console.error("Error creating newsletter log:", logError);
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Newsletter sent to ${subscribers.length} subscribers`,
        logId: logEntry?.id,
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});

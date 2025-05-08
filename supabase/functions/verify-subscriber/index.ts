
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
    // If no token, return an HTML error page
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Error: Invalid Verification Link</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
            .error { color: #e53e3e; }
            .box { border: 1px solid #ddd; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <div class="box">
            <h1 class="error">Invalid Verification Link</h1>
            <p>The verification link is invalid or has expired. Please try subscribing again.</p>
            <p><a href="/">Return to Homepage</a></p>
          </div>
        </body>
      </html>`,
      { 
        status: 400, 
        headers: { "Content-Type": "text/html" } 
      }
    );
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
      // If token not found, return an HTML error page
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Error: Invalid Verification Link</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
              .error { color: #e53e3e; }
              .box { border: 1px solid #ddd; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            </style>
          </head>
          <body>
            <div class="box">
              <h1 class="error">Invalid Verification Link</h1>
              <p>The verification link is invalid or has expired. Please try subscribing again.</p>
              <p><a href="/">Return to Homepage</a></p>
            </div>
          </body>
        </html>`,
        { 
          status: 400, 
          headers: { "Content-Type": "text/html" } 
        }
      );
    }
    
    if (subscription.confirmed) {
      // Already confirmed, return a success message
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Already Confirmed</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
              .success { color: #38a169; }
              .box { border: 1px solid #ddd; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            </style>
          </head>
          <body>
            <div class="box">
              <h1 class="success">Email Already Confirmed</h1>
              <p>Your email address ${subscription.email} was already confirmed. You will continue receiving our newsletters.</p>
              <p><a href="/">Return to Homepage</a></p>
            </div>
          </body>
        </html>`,
        { 
          status: 200, 
          headers: { "Content-Type": "text/html" } 
        }
      );
    }
    
    // Update the subscriber to be confirmed
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({ confirmed: true })
      .eq("id", subscription.id);
    
    if (updateError) {
      console.error("Error updating subscriber:", updateError);
      
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Error: Confirmation Failed</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
              .error { color: #e53e3e; }
              .box { border: 1px solid #ddd; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            </style>
          </head>
          <body>
            <div class="box">
              <h1 class="error">Confirmation Failed</h1>
              <p>There was a problem confirming your subscription. Please try again later.</p>
              <p><a href="/">Return to Homepage</a></p>
            </div>
          </body>
        </html>`,
        { 
          status: 500, 
          headers: { "Content-Type": "text/html" } 
        }
      );
    }
    
    // Return a success page
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Subscription Confirmed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
            .success { color: #38a169; }
            .box { border: 1px solid #ddd; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <div class="box">
            <h1 class="success">Subscription Confirmed!</h1>
            <p>Thank you for confirming your email address ${subscription.email}.</p>
            <p>You will now receive our newsletter with updates about new blog posts.</p>
            <p><a href="/">Return to Homepage</a></p>
          </div>
        </body>
      </html>`,
      { 
        status: 200, 
        headers: { "Content-Type": "text/html" } 
      }
    );
  } catch (error) {
    console.error("Error in verify-subscriber function:", error);
    
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Error: Something Went Wrong</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
            .error { color: #e53e3e; }
            .box { border: 1px solid #ddd; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <div class="box">
            <h1 class="error">Something Went Wrong</h1>
            <p>There was a problem processing your request. Please try again later.</p>
            <p><a href="/">Return to Homepage</a></p>
          </div>
        </body>
      </html>`,
      { 
        status: 500, 
        headers: { "Content-Type": "text/html" } 
      }
    );
  }
});

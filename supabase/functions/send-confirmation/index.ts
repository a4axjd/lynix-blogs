
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";
import { Resend } from "https://esm.sh/resend@2.0.0";

const supabaseUrl = "https://qrcjxzktczmcnvcyuush.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if email already exists and is confirmed
    const { data: existingSubscriber, error: lookupError } = await supabase
      .from("newsletter_subscribers")
      .select("id, confirmed")
      .eq("email", email)
      .maybeSingle();
    
    if (lookupError) {
      console.error("Error checking existing subscriber:", lookupError);
      return new Response(
        JSON.stringify({ error: "Failed to check subscription status" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    if (existingSubscriber?.confirmed) {
      return new Response(
        JSON.stringify({ message: "Email already confirmed", alreadyConfirmed: true }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    let subscriberId;
    
    // If subscriber exists but not confirmed, use existing ID
    if (existingSubscriber) {
      subscriberId = existingSubscriber.id;
    } else {
      // Create a new subscriber
      const { data: newSubscriber, error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({ email, confirmed: false })
        .select()
        .single();
      
      if (insertError) {
        console.error("Error creating subscriber:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create subscription" }),
          { 
            status: 500, 
            headers: { "Content-Type": "application/json", ...corsHeaders } 
          }
        );
      }
      
      subscriberId = newSubscriber.id;
    }
    
    // Generate verification link with production domain
    const productionBaseUrl = "https://blogs.lynixdevs.us";
    const verificationUrl = `${productionBaseUrl}/api/verify-subscriber?token=${subscriberId}`;
    
    // Send confirmation email
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: "Blog Newsletter <newsletter@blogs.lynixdevs.us>",
      to: [email],
      subject: "Confirm your newsletter subscription",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Confirm Your Subscription</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background-color: #f5f5f5;
                padding: 20px;
                text-align: center;
                border-radius: 5px;
              }
              .content {
                padding: 20px 0;
              }
              .button {
                display: inline-block;
                background-color: #4f46e5;
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 5px;
                margin-top: 20px;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 0.8em;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Confirm Your Subscription</h1>
            </div>
            <div class="content">
              <p>Thank you for subscribing to our newsletter! To complete your subscription, please click the button below:</p>
              <a href="${verificationUrl}" class="button">Confirm Subscription</a>
              <p style="margin-top: 20px;">If you didn't subscribe to our newsletter, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Blog Newsletter</p>
            </div>
          </body>
        </html>
      `
    });
    
    if (emailError) {
      console.error("Error sending confirmation email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send confirmation email" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Confirmation email sent"
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("Error in send-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});

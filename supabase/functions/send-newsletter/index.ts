
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

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  cover_image: string;
  slug: string;
}

interface Subscriber {
  id: string;
  email: string;
}

// Utility function to generate email content
const generateEmailContent = (blog: BlogPost) => {
  const blogUrl = `https://blogs.lynixdevs.us/blog/${blog.id}`;
  
  return {
    subject: `New Post: ${blog.title}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Blog Post: ${blog.title}</title>
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
            .image {
              width: 100%;
              max-height: 300px;
              object-fit: cover;
              border-radius: 5px;
              margin-bottom: 20px;
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
            <h1>New Blog Post</h1>
          </div>
          <div class="content">
            <img src="${blog.cover_image}" alt="${blog.title}" class="image" />
            <h2>${blog.title}</h2>
            <p>${blog.excerpt}</p>
            <a href="${blogUrl}" class="button">Read More</a>
          </div>
          <div class="footer">
            <p>You're receiving this email because you subscribed to our newsletter.</p>
            <p>To unsubscribe, please click <a href="{unsubscribe_url}">here</a>.</p>
          </div>
        </body>
      </html>
    `,
  };
};

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
      .select("id, email")
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

    // Create a newsletter log entry first
    const { data: logEntry, error: logError } = await supabase
      .from("newsletter_logs")
      .insert({
        blog_id: blog.id,
        recipients_count: subscribers.length,
        subject: `New Post: ${blog.title}`,
        status: 'processing'  // Set initial status as processing
      })
      .select()
      .single();

    if (logError) {
      console.error("Error creating newsletter log:", logError);
      return new Response(
        JSON.stringify({ error: "Failed to create newsletter log" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Generate email content
    const { subject, html } = generateEmailContent(blog);

    // Send emails to all subscribers
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        const data = await resend.emails.send({
          from: "Blog Newsletter <newsletter@blogs.lynixdevs.us>",
          to: [subscriber.email],
          subject: subject,
          html: html,
        });
        
        console.log(`Email sent to ${subscriber.email}:`, data);
        return { success: true, email: subscriber.email };
      } catch (error) {
        console.error(`Error sending email to ${subscriber.email}:`, error);
        return { success: false, email: subscriber.email, error };
      }
    });

    // Wait for all emails to be sent
    const emailResults = await Promise.all(emailPromises);
    const successfulEmails = emailResults.filter(result => result.success).length;

    // Update the log entry with final status
    const { error: updateError } = await supabase
      .from("newsletter_logs")
      .update({ 
        status: successfulEmails > 0 ? 'completed' : 'failed',
        recipients_count: successfulEmails  // Update with actual count of successful sends
      })
      .eq('id', logEntry.id);

    if (updateError) {
      console.error("Error updating newsletter log:", updateError);
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Newsletter sent to ${successfulEmails} of ${subscribers.length} subscribers`,
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

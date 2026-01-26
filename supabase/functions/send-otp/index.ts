import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidIITEmail(email: string): boolean {
  // Match patterns like @iitb.ac.in, @iitd.ac.in, @iitm.ac.in etc.
  const iitPattern = /^[a-zA-Z0-9._%+-]+@iit[a-z]*\.ac\.in$/i;
  return iitPattern.test(email);
}

interface SendOTPRequest {
  userId: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email }: SendOTPRequest = await req.json();

    if (!userId || !email) {
      throw new Error("Missing userId or email");
    }

    // Validate IIT email domain
    if (!isValidIITEmail(email)) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid email domain. Please use your IIT institutional email (@iit*.ac.in)" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store OTP in database
    const { error: dbError } = await supabase
      .from("email_verifications")
      .insert({
        user_id: userId,
        email: email,
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to store verification code");
    }

    // Send OTP via email
    const emailResponse = await resend.emails.send({
      from: "IIT Connect <noreply@resend.dev>",
      to: [email],
      subject: "Your IIT Connect Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a365d; text-align: center;">IIT Connect</h1>
          <div style="background: #f7fafc; border-radius: 8px; padding: 30px; text-align: center;">
            <h2 style="color: #2d3748; margin-bottom: 20px;">Verify Your Email</h2>
            <p style="color: #4a5568; margin-bottom: 20px;">
              Enter this code to verify your IIT email address:
            </p>
            <div style="background: #1a365d; color: white; font-size: 32px; letter-spacing: 8px; padding: 20px; border-radius: 8px; font-weight: bold;">
              ${otp}
            </div>
            <p style="color: #718096; margin-top: 20px; font-size: 14px;">
              This code expires in 10 minutes.
            </p>
          </div>
          <p style="color: #a0aec0; text-align: center; margin-top: 20px; font-size: 12px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    });

    console.log("OTP email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

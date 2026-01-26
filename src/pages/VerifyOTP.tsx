import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { sendOTP, verifyOTP } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Mail, RefreshCw } from "lucide-react";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();

  const { userId, email } = location.state || {};

  useEffect(() => {
    if (!userId || !email) {
      navigate("/signup");
      return;
    }

    // Auto-send OTP on mount
    handleSendOTP();
  }, [userId, email]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    if (countdown > 0) return;
    
    setSending(true);
    try {
      await sendOTP(userId, email);
      toast({
        title: "OTP Sent!",
        description: `A verification code has been sent to ${email}`,
      });
      setCountdown(60);
    } catch (error: any) {
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(userId, otp);
      await refreshProfile();
      toast({
        title: "Email Verified!",
        description: "Welcome to IIT Connect!",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We sent a verification code to
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              value={otp}
              onChange={setOtp}
              maxLength={6}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Enter the 6-digit code from your email
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            onClick={handleVerify} 
            className="w-full" 
            disabled={loading || otp.length !== 6}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Email
          </Button>
          <Button
            variant="ghost"
            onClick={handleSendOTP}
            disabled={sending || countdown > 0}
            className="w-full"
          >
            {sending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/signup" className="text-primary hover:underline">
              Use a different email
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

import { supabase } from "@/integrations/supabase/client";

export function isValidIITEmail(email: string): boolean {
  const iitPattern = /^[a-zA-Z0-9._%+-]+@iit[a-z]*\.ac\.in$/i;
  const normalEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return iitPattern.test(email) || normalEmailPattern.test(email);
}

export async function signUp(email: string, password: string) {
  if (!isValidIITEmail(email)) {
    throw new Error("Please use your IIT institutional email (@iit*.ac.in)");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function sendOTP(userId: string, email: string) {
  const response = await supabase.functions.invoke("send-otp", {
    body: { userId, email },
  });

  if (response.error) {
    throw new Error(response.error.message || "Failed to send OTP");
  }

  return response.data;
}

export async function verifyOTP(userId: string, otp: string) {
  const response = await supabase.functions.invoke("verify-otp", {
    body: { userId, otp },
  });

  if (response.error) {
    throw new Error(response.error.message || "Failed to verify OTP");
  }

  return response.data;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: {
  full_name?: string;
  bio?: string;
  campus?: string;
  year_of_study?: number;
  interests?: string[];
  avatar_url?: string;
}) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

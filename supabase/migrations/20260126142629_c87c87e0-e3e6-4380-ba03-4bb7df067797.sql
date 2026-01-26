-- Phase 1: Foundation Database Schema for IIT Connect

-- 1. Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create enum for member status
CREATE TYPE public.member_status AS ENUM ('pending', 'approved', 'rejected');

-- 3. Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT,
    bio TEXT,
    campus TEXT,
    year_of_study INTEGER,
    interests TEXT[],
    avatar_url TEXT,
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. Create user_roles table (secure role management)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- 5. Create email_verifications table for OTP
CREATE TABLE public.email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 6. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- 7. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- 8. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for profiles updated_at
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 10. Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
    
    -- Also assign default 'user' role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 11. Create trigger on auth.users for new signups
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 12. RLS Policies for profiles
CREATE POLICY "Users can view all verified profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (is_email_verified = true OR user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- 13. RLS Policies for user_roles (only admins can see/modify)
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
    ON public.user_roles FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
    ON public.user_roles FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- 14. RLS Policies for email_verifications
CREATE POLICY "Users can view their own verifications"
    ON public.email_verifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own verifications"
    ON public.email_verifications FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own verifications"
    ON public.email_verifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- 15. Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- 16. Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
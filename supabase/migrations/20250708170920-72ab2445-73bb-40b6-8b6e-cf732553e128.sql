
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data integrity
CREATE TYPE public.did_status AS ENUM ('draft', 'pending', 'anchored', 'failed');
CREATE TYPE public.operation_type AS ENUM ('create', 'update', 'deactivate', 'recover');
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'failed', 'expired');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create DIDs table
CREATE TABLE public.dids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  did_identifier TEXT NOT NULL UNIQUE,
  did_document JSONB NOT NULL,
  status did_status NOT NULL DEFAULT 'draft',
  public_key TEXT NOT NULL,
  private_key_encrypted TEXT NOT NULL,
  service_endpoints JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ION operations table
CREATE TABLE public.ion_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  did_id UUID REFERENCES public.dids(id) ON DELETE CASCADE NOT NULL,
  operation_type operation_type NOT NULL,
  operation_data JSONB NOT NULL,
  transaction_id TEXT,
  block_height BIGINT,
  status did_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create IPFS pins table
CREATE TABLE public.ipfs_pins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  did_id UUID REFERENCES public.dids(id) ON DELETE CASCADE NOT NULL,
  ipfs_hash TEXT NOT NULL,
  content JSONB NOT NULL,
  pin_status TEXT DEFAULT 'pinning',
  gateway_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create verifications table
CREATE TABLE public.verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  did_id UUID REFERENCES public.dids(id) ON DELETE CASCADE NOT NULL,
  verification_method TEXT NOT NULL,
  status verification_status NOT NULL DEFAULT 'pending',
  result JSONB,
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ion_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipfs_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for DIDs
CREATE POLICY "Users can view their own DIDs" 
  ON public.dids FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own DIDs" 
  ON public.dids FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own DIDs" 
  ON public.dids FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own DIDs" 
  ON public.dids FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for ION operations
CREATE POLICY "Users can view operations for their DIDs" 
  ON public.ion_operations FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.dids 
    WHERE dids.id = ion_operations.did_id 
    AND dids.user_id = auth.uid()
  ));

CREATE POLICY "Users can create operations for their DIDs" 
  ON public.ion_operations FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.dids 
    WHERE dids.id = did_id 
    AND dids.user_id = auth.uid()
  ));

CREATE POLICY "Users can update operations for their DIDs" 
  ON public.ion_operations FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.dids 
    WHERE dids.id = ion_operations.did_id 
    AND dids.user_id = auth.uid()
  ));

-- Create RLS policies for IPFS pins
CREATE POLICY "Users can view IPFS pins for their DIDs" 
  ON public.ipfs_pins FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.dids 
    WHERE dids.id = ipfs_pins.did_id 
    AND dids.user_id = auth.uid()
  ));

CREATE POLICY "Users can create IPFS pins for their DIDs" 
  ON public.ipfs_pins FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.dids 
    WHERE dids.id = did_id 
    AND dids.user_id = auth.uid()
  ));

CREATE POLICY "Users can update IPFS pins for their DIDs" 
  ON public.ipfs_pins FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.dids 
    WHERE dids.id = ipfs_pins.did_id 
    AND dids.user_id = auth.uid()
  ));

-- Create RLS policies for verifications
CREATE POLICY "Users can view verifications for their DIDs" 
  ON public.verifications FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.dids 
    WHERE dids.id = verifications.did_id 
    AND dids.user_id = auth.uid()
  ));

CREATE POLICY "Users can create verifications for their DIDs" 
  ON public.verifications FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.dids 
    WHERE dids.id = did_id 
    AND dids.user_id = auth.uid()
  ));

CREATE POLICY "Users can update verifications for their DIDs" 
  ON public.verifications FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.dids 
    WHERE dids.id = verifications.did_id 
    AND dids.user_id = auth.uid()
  ));

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.dids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ion_operations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.verifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ipfs_pins;

-- Set replica identity for realtime updates
ALTER TABLE public.dids REPLICA IDENTITY FULL;
ALTER TABLE public.ion_operations REPLICA IDENTITY FULL;
ALTER TABLE public.verifications REPLICA IDENTITY FULL;
ALTER TABLE public.ipfs_pins REPLICA IDENTITY FULL;

-- Create indexes for better performance
CREATE INDEX idx_dids_user_id ON public.dids(user_id);
CREATE INDEX idx_dids_status ON public.dids(status);
CREATE INDEX idx_ion_operations_did_id ON public.ion_operations(did_id);
CREATE INDEX idx_ion_operations_status ON public.ion_operations(status);
CREATE INDEX idx_ipfs_pins_did_id ON public.ipfs_pins(did_id);
CREATE INDEX idx_verifications_did_id ON public.verifications(did_id);
CREATE INDEX idx_verifications_status ON public.verifications(status);

-- Create verifiable_credentials table to store issued credentials
CREATE TABLE public.verifiable_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  holder_user_id UUID NOT NULL,
  issuer_user_id UUID NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  credential_type TEXT NOT NULL,
  credential_data JSONB NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verifiable_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for verifiable credentials
CREATE POLICY "Users can view their own credentials" 
ON public.verifiable_credentials 
FOR SELECT 
USING (auth.uid() = holder_user_id);

CREATE POLICY "Issuers can create credentials" 
ON public.verifiable_credentials 
FOR INSERT 
WITH CHECK (auth.uid() = issuer_user_id);

CREATE POLICY "Issuers can view credentials they issued" 
ON public.verifiable_credentials 
FOR SELECT 
USING (auth.uid() = issuer_user_id);

CREATE POLICY "Users can update their own credentials" 
ON public.verifiable_credentials 
FOR UPDATE 
USING (auth.uid() = holder_user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_verifiable_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_verifiable_credentials_updated_at
BEFORE UPDATE ON public.verifiable_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_verifiable_credentials_updated_at();
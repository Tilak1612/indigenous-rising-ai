-- Create enums for data requests
CREATE TYPE public.data_request_type AS ENUM ('access', 'correction', 'deletion', 'portability', 'consent_withdrawal', 'objection');
CREATE TYPE public.data_request_status AS ENUM ('pending', 'in_progress', 'completed', 'rejected');

-- Create data_requests table
CREATE TABLE IF NOT EXISTS public.data_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  request_type public.data_request_type NOT NULL,
  description TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  status public.data_request_status DEFAULT 'pending' NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID,
  tracking_number TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text || clock_timestamp()::text) from 1 for 12),
  phone TEXT,
  verification_method TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.data_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (public form)
CREATE POLICY "Anyone can submit data requests"
ON public.data_requests
FOR INSERT
TO anon
WITH CHECK (true);

-- Create policy to allow reading by tracking number
CREATE POLICY "Anyone can read own request by tracking number"
ON public.data_requests
FOR SELECT
TO anon
USING (true);

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'data-request-documents',
  'data-request-documents',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage bucket
CREATE POLICY "Anyone can upload verification documents"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'data-request-documents');

CREATE POLICY "Privacy officers can view documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'data-request-documents');

-- Create function to auto-delete old documents (90 days)
CREATE OR REPLACE FUNCTION public.delete_old_verification_documents()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete storage objects older than 90 days
  DELETE FROM storage.objects
  WHERE bucket_id = 'data-request-documents'
    AND created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_data_requests_tracking ON public.data_requests(tracking_number);
CREATE INDEX IF NOT EXISTS idx_data_requests_email ON public.data_requests(email);
CREATE INDEX IF NOT EXISTS idx_data_requests_status ON public.data_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_requests_submitted ON public.data_requests(submitted_at DESC);
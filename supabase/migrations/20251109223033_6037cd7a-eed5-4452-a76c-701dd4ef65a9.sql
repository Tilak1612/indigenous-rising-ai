-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  phone TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'new' NOT NULL,
  admin_notes TEXT,
  replied_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (public form)
CREATE POLICY "Anyone can submit contact forms"
ON public.contact_submissions
FOR INSERT
TO anon
WITH CHECK (true);

-- Create policy for authenticated users to read (admin access)
CREATE POLICY "Authenticated users can read all submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (true);

-- Create policy for authenticated users to update (admin access)
CREATE POLICY "Authenticated users can update submissions"
ON public.contact_submissions
FOR UPDATE
TO authenticated
USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contact_email ON public.contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submitted ON public.contact_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_ip ON public.contact_submissions(ip_address, submitted_at);

-- Create function to check rate limiting
CREATE OR REPLACE FUNCTION public.check_contact_rate_limit(
  _ip_address TEXT,
  _time_window INTERVAL DEFAULT '1 hour',
  _max_submissions INTEGER DEFAULT 3
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  submission_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO submission_count
  FROM public.contact_submissions
  WHERE ip_address = _ip_address
    AND submitted_at > NOW() - _time_window;
  
  RETURN submission_count < _max_submissions;
END;
$$;
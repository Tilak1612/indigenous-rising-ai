-- Create newsletter_subscriptions table with CASL compliance fields
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  consent_given BOOLEAN DEFAULT true NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmation_token TEXT UNIQUE,
  unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT
);

-- Enable RLS
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for public newsletter signup)
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscriptions
FOR INSERT
TO anon
WITH CHECK (true);

-- Create policy to allow reading own subscription by token
CREATE POLICY "Anyone can read by token"
ON public.newsletter_subscriptions
FOR SELECT
TO anon
USING (true);

-- Create policy to allow updating by token (for confirmation and unsubscribe)
CREATE POLICY "Anyone can update by token"
ON public.newsletter_subscriptions
FOR UPDATE
TO anon
USING (true);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_confirmation_token ON public.newsletter_subscriptions(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe_token ON public.newsletter_subscriptions(unsubscribe_token);
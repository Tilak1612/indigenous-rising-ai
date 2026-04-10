-- Roadmap #1: Funding Deadline Calendar + Email Alerts
-- See docs/SPEC_funding_alerts.md for the full feature spec.

-- Ensure update_updated_at_column helper exists (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- Table 1: grants — public-facing grant database
-- ============================================================
CREATE TABLE IF NOT EXISTS public.grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  funder TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_min INTEGER,
  amount_max INTEGER,
  amount_currency TEXT NOT NULL DEFAULT 'CAD',
  deadline DATE,
  is_recurring BOOLEAN DEFAULT FALSE NOT NULL,
  recurrence_notes TEXT,
  provinces TEXT[] NOT NULL DEFAULT '{}',
  industries TEXT[] NOT NULL DEFAULT '{}',
  business_stages TEXT[] NOT NULL DEFAULT '{}',
  eligibility_notes TEXT,
  application_url TEXT NOT NULL,
  is_published BOOLEAN DEFAULT FALSE NOT NULL,
  last_verified DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'grants' AND policyname = 'Anyone can read published grants'
  ) THEN
    CREATE POLICY "Anyone can read published grants" ON public.grants
      FOR SELECT TO anon, authenticated
      USING (is_published = TRUE);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_grants_published_deadline
  ON public.grants(is_published, deadline) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_grants_provinces
  ON public.grants USING GIN (provinces);
CREATE INDEX IF NOT EXISTS idx_grants_industries
  ON public.grants USING GIN (industries);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_grants_updated_at'
  ) THEN
    CREATE TRIGGER update_grants_updated_at
      BEFORE UPDATE ON public.grants
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- ============================================================
-- Table 2: grant_alerts_subscribers — CASL-compliant double-opt-in
-- ============================================================
CREATE TABLE IF NOT EXISTS public.grant_alerts_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  provinces TEXT[] NOT NULL DEFAULT '{}',
  industries TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT FALSE NOT NULL,
  confirmation_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  unsubscribe_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  consent_given BOOLEAN NOT NULL,
  consent_ip TEXT,
  consent_user_agent TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  last_digest_sent_at TIMESTAMPTZ
);

ALTER TABLE public.grant_alerts_subscribers ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies — only service role (edge functions) can access.
-- Subscribers manage their subscription via tokens validated server-side.

CREATE INDEX IF NOT EXISTS idx_grant_alerts_active
  ON public.grant_alerts_subscribers(is_active, last_digest_sent_at) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_grant_alerts_confirmation_token
  ON public.grant_alerts_subscribers(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_grant_alerts_unsubscribe_token
  ON public.grant_alerts_subscribers(unsubscribe_token);

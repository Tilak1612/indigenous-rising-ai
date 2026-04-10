-- Roadmap #2 Stage 1: AI Funding Matching — database schema
-- See docs/SPEC_ai_funding_matching.md for the full feature spec.

-- ============================================================
-- Extend profiles with matching-relevant fields
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS business_stage TEXT
    CHECK (business_stage IS NULL OR business_stage IN ('ideation','startup','early-stage','growth','established')),
  ADD COLUMN IF NOT EXISTS target_funding_amount INTEGER,
  ADD COLUMN IF NOT EXISTS funding_purpose TEXT;

-- ============================================================
-- funding_match_runs — quota tracking + cost telemetry
-- ============================================================
-- Source of truth for the monthly match cap (free tier = 3/month,
-- Growth = 50/month). Also tracks LLM token usage so we can monitor
-- cost and cache hit rate over time.
CREATE TABLE IF NOT EXISTS public.funding_match_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  grant_count INTEGER NOT NULL,
  llm_input_tokens INTEGER,
  llm_output_tokens INTEGER,
  cache_hits INTEGER DEFAULT 0,
  source TEXT NOT NULL CHECK (source IN ('user', 'cron', 'api'))
);

ALTER TABLE public.funding_match_runs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'funding_match_runs' AND policyname = 'Users see their own match runs'
  ) THEN
    CREATE POLICY "Users see their own match runs"
      ON public.funding_match_runs FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_match_runs_user_month
  ON public.funding_match_runs(user_id, run_at);

-- ============================================================
-- funding_match_cache — LLM result cache with 24h TTL
-- ============================================================
-- Cache key is (user_id, grant_id, profile_hash). When the user updates
-- their profile, the hash changes and cache misses automatically.
-- grant_updated_at is also stored so a grant edit invalidates the cache.
-- expires_at enforces TTL (24h) as a safety net.
CREATE TABLE IF NOT EXISTS public.funding_match_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grant_id UUID NOT NULL REFERENCES public.grants(id) ON DELETE CASCADE,
  profile_hash TEXT NOT NULL,
  grant_updated_at TIMESTAMPTZ NOT NULL,
  eligibility TEXT NOT NULL CHECK (eligibility IN ('yes','no','maybe')),
  fit_score SMALLINT NOT NULL CHECK (fit_score BETWEEN 0 AND 100),
  explanation TEXT NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours') NOT NULL,
  UNIQUE (user_id, grant_id, profile_hash)
);

ALTER TABLE public.funding_match_cache ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'funding_match_cache' AND policyname = 'Users see their own cached matches'
  ) THEN
    CREATE POLICY "Users see their own cached matches"
      ON public.funding_match_cache FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_match_cache_lookup
  ON public.funding_match_cache(user_id, grant_id, profile_hash);
CREATE INDEX IF NOT EXISTS idx_match_cache_expiry
  ON public.funding_match_cache(expires_at);

-- ============================================================
-- funding_saved_matches — Growth tier save-for-later + status pipeline
-- ============================================================
-- Users on Growth+ tiers can save matches and track their application
-- lifecycle: interested → applied → pending → awarded/declined/withdrawn.
CREATE TABLE IF NOT EXISTS public.funding_saved_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grant_id UUID NOT NULL REFERENCES public.grants(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'interested'
    CHECK (status IN ('interested','applied','pending','awarded','declined','withdrawn')),
  notes TEXT,
  saved_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, grant_id)
);

ALTER TABLE public.funding_saved_matches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'funding_saved_matches' AND policyname = 'Users manage their saved matches'
  ) THEN
    CREATE POLICY "Users manage their saved matches"
      ON public.funding_saved_matches FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_funding_saved_matches_updated_at'
  ) THEN
    CREATE TRIGGER update_funding_saved_matches_updated_at
      BEFORE UPDATE ON public.funding_saved_matches
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

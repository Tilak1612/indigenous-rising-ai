-- Funding Readiness Workspace (P0-3)
--
-- Threads the seven readiness stages into one resumable record per
-- (user, program). Stages 1, 3 and 6 already had working implementations
-- (funding_saved_matches, public.documents + Storage, public.tasks), so
-- this migration adds only the connective tissue, not replacements:
--
--   1 match              -> funding_saved_matches            (existing)
--   2 eligibility        -> funding_readiness_items          (new)
--   3 documents          -> public.documents                 (existing)
--   4 missing_info       -> funding_readiness_items          (new)
--   5 draft              -> grant_applications               (existing, now linked)
--   6 tasks              -> public.tasks via related_id      (existing)
--   7 submission         -> funding_readiness_items          (new)

CREATE TABLE IF NOT EXISTS public.funding_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grant_id UUID NOT NULL REFERENCES public.grants(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT 'match'
    CHECK (stage IN ('match','eligibility','documents','missing_info',
                     'draft','tasks','submission','submitted')),
  -- Set when the user starts a draft; ON DELETE SET NULL so discarding a
  -- draft does not destroy the readiness record around it.
  grant_application_id UUID REFERENCES public.grant_applications(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One workspace per program per user: this is what makes "leave and
  -- resume" resolve to the same record instead of creating a duplicate.
  UNIQUE (user_id, grant_id)
);

CREATE TABLE IF NOT EXISTS public.funding_readiness_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL
    REFERENCES public.funding_applications(id) ON DELETE CASCADE,
  -- Denormalised so RLS is a direct column test rather than a subquery
  -- into the parent on every row.
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('eligibility','missing_info','submission')),
  label TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'unknown'
    CHECK (state IN ('met','unmet','unknown')),
  -- A vault document satisfying this item. SET NULL, not CASCADE: deleting
  -- a file must not silently delete the checklist line that needed it.
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  note TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Links an existing draft to the program it is for. grant_applications
-- previously stored only free-text grant_name, so a draft could not be
-- resolved back to a grant row.
ALTER TABLE public.grant_applications
  ADD COLUMN IF NOT EXISTS grant_id UUID REFERENCES public.grants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_funding_applications_user
  ON public.funding_applications(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_funding_readiness_items_app
  ON public.funding_readiness_items(application_id, kind, position);
CREATE INDEX IF NOT EXISTS idx_grant_applications_grant
  ON public.grant_applications(grant_id);

ALTER TABLE public.funding_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_readiness_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies
                 WHERE tablename='funding_applications'
                   AND policyname='Users manage own funding applications') THEN
    CREATE POLICY "Users manage own funding applications"
      ON public.funding_applications FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies
                 WHERE tablename='funding_readiness_items'
                   AND policyname='Users manage own readiness items') THEN
    CREATE POLICY "Users manage own readiness items"
      ON public.funding_readiness_items FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Reuses the existing public.update_updated_at_column() (identical body,
-- already backing 4 triggers) rather than adding a second function that
-- does the same thing.
DROP TRIGGER IF EXISTS trg_funding_applications_touch ON public.funding_applications;
CREATE TRIGGER trg_funding_applications_touch
  BEFORE UPDATE ON public.funding_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_funding_readiness_items_touch ON public.funding_readiness_items;
CREATE TRIGGER trg_funding_readiness_items_touch
  BEFORE UPDATE ON public.funding_readiness_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

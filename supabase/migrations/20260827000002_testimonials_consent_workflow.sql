-- Testimonials with a consent and approval workflow.
--
-- The product currently publishes NO testimonials, and the Success Stories
-- page is explicitly labelled illustrative. This adds the machinery to
-- publish real ones later without ever risking a fabricated or
-- unconsented quote reaching the public site.
--
-- The central safety property is enforced by the DATABASE, not the UI: a
-- row cannot be 'published' unless consent was granted, an admin approved
-- it, and both the approver and the approval time are recorded. A UI bug,
-- a stray script, or a careless update cannot publish an unapproved quote.

CREATE TYPE public.testimonial_consent  AS ENUM ('pending','granted','withdrawn');
CREATE TYPE public.testimonial_approval AS ENUM ('pending','approved','rejected');
CREATE TYPE public.testimonial_publish  AS ENUM ('draft','published','unpublished');

CREATE TABLE IF NOT EXISTS public.testimonials (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name      TEXT NOT NULL CHECK (length(btrim(customer_name)) BETWEEN 2 AND 120),
  role               TEXT CHECK (role IS NULL OR length(role) <= 120),
  company            TEXT CHECK (company IS NULL OR length(company) <= 160),
  location           TEXT CHECK (location IS NULL OR length(location) <= 160),
  quote              TEXT NOT NULL CHECK (length(btrim(quote)) BETWEEN 20 AND 2000),
  -- A specific, checkable outcome ("cut reporting from 3 days to 4 hours"),
  -- never a number the platform made up.
  verified_metric    TEXT CHECK (verified_metric IS NULL OR length(verified_metric) <= 300),
  photo_or_logo_url  TEXT CHECK (photo_or_logo_url IS NULL OR photo_or_logo_url ~ '^https://'),
  -- Where the quote came from: an email, a recorded call, a signed form.
  source             TEXT CHECK (source IS NULL OR length(source) <= 300),

  consent_status     public.testimonial_consent  NOT NULL DEFAULT 'pending',
  approval_status    public.testimonial_approval NOT NULL DEFAULT 'pending',
  publish_status     public.testimonial_publish  NOT NULL DEFAULT 'draft',

  approved_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at        TIMESTAMPTZ,
  -- Null when submitted from the public intake form by a logged-out person.
  submitted_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- The invariant. Publishing requires granted consent, an approval, and a
  -- recorded approver + timestamp. Enforced in Postgres so it holds even if
  -- every layer above it is wrong.
  CONSTRAINT testimonials_publishable CHECK (
    publish_status <> 'published'
    OR (consent_status  = 'granted'
        AND approval_status = 'approved'
        AND approved_by IS NOT NULL
        AND approved_at IS NOT NULL)
  ),
  -- Approval must always carry its provenance, published or not.
  CONSTRAINT testimonials_approval_provenance CHECK (
    approval_status <> 'approved'
    OR (approved_by IS NOT NULL AND approved_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_testimonials_public
  ON public.testimonials (created_at DESC)
  WHERE publish_status = 'published'
    AND approval_status = 'approved'
    AND consent_status = 'granted';

CREATE INDEX IF NOT EXISTS idx_testimonials_queue
  ON public.testimonials (approval_status, created_at DESC);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Read: only fully consented, approved, published rows are ever visible.
DROP POLICY IF EXISTS "Published testimonials are publicly readable" ON public.testimonials;
CREATE POLICY "Published testimonials are publicly readable"
  ON public.testimonials FOR SELECT TO anon, authenticated
  USING (publish_status = 'published'
         AND approval_status = 'approved'
         AND consent_status  = 'granted');

-- Intake: anyone may submit, but only ever as an unapproved draft. The
-- WITH CHECK pins the workflow columns so a crafted request cannot arrive
-- pre-approved.
DROP POLICY IF EXISTS "Anyone can submit a testimonial for review" ON public.testimonials;
CREATE POLICY "Anyone can submit a testimonial for review"
  ON public.testimonials FOR INSERT TO anon, authenticated
  WITH CHECK (consent_status  = 'pending'
              AND approval_status = 'pending'
              AND publish_status  = 'draft'
              AND approved_by IS NULL
              AND approved_at IS NULL);

-- Admins manage the queue.
DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
CREATE POLICY "Admins manage testimonials"
  ON public.testimonials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_testimonials_touch ON public.testimonials;
CREATE TRIGGER trg_testimonials_touch
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

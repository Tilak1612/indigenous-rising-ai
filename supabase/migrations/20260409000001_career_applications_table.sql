-- career_applications: server-side backup of every job application
CREATE TABLE IF NOT EXISTS public.career_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email_address TEXT NOT NULL,
  phone_number TEXT,
  city_province TEXT NOT NULL,
  work_eligibility TEXT NOT NULL,
  role_applying_for TEXT NOT NULL,
  preferred_start_date TEXT,
  preferred_work_location TEXT NOT NULL,
  linkedin_url TEXT,
  portfolio_github_url TEXT,
  writing_samples_url TEXT,
  other_links TEXT,
  indigenous_sovereignty_meaning TEXT NOT NULL,
  community_experience TEXT NOT NULL,
  ocap_aligned_ai_interest TEXT NOT NULL,
  indigenous_identity TEXT,
  resume_url TEXT,
  cover_letter_url TEXT,
  ip_address TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

-- No public access — only service role (edge function) can insert/read
-- Admin access via has_role can be added once user_roles is populated

CREATE INDEX IF NOT EXISTS idx_career_apps_email ON public.career_applications(email_address);
CREATE INDEX IF NOT EXISTS idx_career_apps_submitted ON public.career_applications(submitted_at DESC);

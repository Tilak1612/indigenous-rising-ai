-- Fix Critical Security Issue #1: Newsletter Subscriptions Public Exposure
-- Remove the overly permissive policy that allows anyone to read all subscriptions
DROP POLICY IF EXISTS "Anyone can read by token" ON public.newsletter_subscriptions;

-- Keep only admin access for managing subscriptions
-- All token verification should be handled in edge functions, not via direct database access

-- Fix Critical Security Issue #2: Contact Submissions Access Control
-- Remove policies that allow any authenticated user to read/update all submissions
DROP POLICY IF EXISTS "Authenticated users can update submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can read all submissions" ON public.contact_submissions;

-- Replace with admin-only access policies
CREATE POLICY "Admins can read all contact submissions"
ON public.contact_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can update contact submissions"
ON public.contact_submissions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
);

-- Note: Public INSERT policies remain intact for both tables
-- Newsletter: "Anyone can insert subscriptions" - needed for public signup
-- Contact: "Anyone can submit contact forms" - needed for public contact form
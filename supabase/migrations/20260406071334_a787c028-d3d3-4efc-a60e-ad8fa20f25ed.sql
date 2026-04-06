-- Issue 1: Remove overly permissive policy on subscriptions
-- Service role bypasses RLS natively, so this policy is unnecessary
-- and dangerously grants all users full access
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;

-- Issue 2: Remove overly permissive policy on webhook_events
DROP POLICY IF EXISTS "Service role can manage webhook events" ON public.webhook_events;

-- Issue 3: Fix user_roles privilege escalation
-- The ALL policy's WITH CHECK may not properly block INSERT for non-admins
-- Add explicit INSERT policy restricted to admins only
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
-- Remove the overly permissive UPDATE policy that allows anyone to modify newsletter subscriptions
DROP POLICY IF EXISTS "Anyone can update by token" ON public.newsletter_subscriptions;
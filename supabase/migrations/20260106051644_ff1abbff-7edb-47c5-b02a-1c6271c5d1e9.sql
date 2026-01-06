-- Drop the overly permissive RLS policy that allows anyone to read all data_requests
DROP POLICY IF EXISTS "Anyone can read own request by tracking number" ON public.data_requests;
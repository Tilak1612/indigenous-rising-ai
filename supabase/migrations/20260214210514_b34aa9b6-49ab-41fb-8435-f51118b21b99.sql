-- Fix storage policies for data-request-documents bucket

-- Drop overly permissive SELECT policy (any authenticated user can view)
DROP POLICY IF EXISTS "Privacy officers can view documents" ON storage.objects;

-- Drop anonymous upload policy (allows direct uploads bypassing edge function)
DROP POLICY IF EXISTS "Anyone can upload verification documents" ON storage.objects;

-- Create restricted SELECT policy: only admins and team members
CREATE POLICY "Admins and team members can view verification documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'data-request-documents' AND 
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'team_member'))
);

-- Create restricted INSERT policy: only admins and team members can upload
-- (public submissions go through the edge function which uses service role key)
CREATE POLICY "Admins and team members can upload verification documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'data-request-documents' AND 
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'team_member'))
);

-- Allow admins to delete documents
CREATE POLICY "Admins can delete verification documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'data-request-documents' AND 
  public.has_role(auth.uid(), 'admin')
);
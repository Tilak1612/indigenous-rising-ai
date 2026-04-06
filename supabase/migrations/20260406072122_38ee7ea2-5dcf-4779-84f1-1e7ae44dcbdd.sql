-- Add explicit UPDATE policy for data-request-documents storage bucket
CREATE POLICY "Admins can update verification documents"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'data-request-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'data-request-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);
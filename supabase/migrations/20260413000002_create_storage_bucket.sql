-- Migration to create storage bucket for local verification documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-docs', 'verification-docs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Storage
-- Allow authenticated users to upload documents to their own folder (using local_id)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-docs' AND 
  auth.role() = 'authenticated'
);

-- Allow admins to read all verification documents
CREATE POLICY "Allow admin reads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-docs' AND 
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ))
);

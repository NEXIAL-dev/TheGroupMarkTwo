/*
  # Create additional storage buckets

  1. New Buckets
    - `documents` - For document uploads (PDFs, Word docs, etc.)
    - `images` - For general image uploads
    - `agency-files` - For agency-specific file storage

  2. Security Policies
    - Users can upload to their own folders
    - Public read access for images
    - Restricted access for documents and agency files
*/

-- Create documents bucket (private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create images bucket (public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create agency-files bucket (private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('agency-files', 'agency-files', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for documents bucket
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policies for images bucket
CREATE POLICY "Users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Images are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policies for agency-files bucket
CREATE POLICY "Agency members can upload files to their agency folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'agency-files' AND 
  (storage.foldername(name))[1] IN (
    SELECT a.id::text FROM agencies a 
    JOIN agency_members am ON a.id = am.agency_id 
    WHERE am.user_id = auth.uid()
  )
);

CREATE POLICY "Agency members can view their agency files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'agency-files' AND 
  (storage.foldername(name))[1] IN (
    SELECT a.id::text FROM agencies a 
    JOIN agency_members am ON a.id = am.agency_id 
    WHERE am.user_id = auth.uid()
  )
);

CREATE POLICY "Agency owners can manage their agency files"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'agency-files' AND 
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM agencies WHERE owner_id = auth.uid()
  )
);
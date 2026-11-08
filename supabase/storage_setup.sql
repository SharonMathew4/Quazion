-- ==============================================================================
-- QUAZION SUPABASE STORAGE SETUP: MANUSCRIPTS BUCKET
-- Run this SQL in your Supabase SQL Editor to enable PDF uploads
-- ==============================================================================

-- 1. Create the public 'manuscripts' storage bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'manuscripts',
  'manuscripts',
  true,
  52428800, -- 50 MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf'];

-- 2. Storage Policies for 'manuscripts' bucket

-- Public Read Policy: Anyone can view and download published manuscripts
DROP POLICY IF EXISTS "Public can view manuscripts" ON storage.objects;
CREATE POLICY "Public can view manuscripts"
ON storage.objects FOR SELECT
USING (bucket_id = 'manuscripts');

-- Authenticated Upload Policy: Logged-in researchers can upload manuscripts into their folder
DROP POLICY IF EXISTS "Authenticated users can upload manuscripts" ON storage.objects;
CREATE POLICY "Authenticated users can upload manuscripts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'manuscripts'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid() IS NOT NULL)
);

-- Author Delete/Update Policy: Researchers can manage their uploaded documents
DROP POLICY IF EXISTS "Researchers can update their manuscripts" ON storage.objects;
CREATE POLICY "Researchers can update their manuscripts"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'manuscripts' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Researchers can delete their manuscripts" ON storage.objects;
CREATE POLICY "Researchers can delete their manuscripts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'manuscripts' AND auth.uid()::text = (storage.foldername(name))[1]);

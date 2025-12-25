-- =====================================================
-- Supabase Storage Policies
-- Configure file upload permissions for product-uploads bucket
-- =====================================================

-- IMPORTANT: You must create the 'product-uploads' bucket first!
-- Go to: Supabase Dashboard → Storage → Create bucket
-- Name: product-uploads
-- Public: YES
-- Then run this SQL

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to view their own files
CREATE POLICY "Users can view own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'product-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access (files are accessed via signed URLs)
CREATE POLICY "Public can view uploaded files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-uploads');

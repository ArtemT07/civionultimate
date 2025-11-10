/*
  # Create Materials Storage Bucket
  
  1. Storage Bucket
    - Create public 'materials' bucket for material photos
  
  2. Security
    - Allow authenticated users to upload files
    - Allow public read access to all files
*/

-- Create materials bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'materials', 
  'materials', 
  true, 
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload material photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'materials');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update material photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'materials');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete material photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'materials');

-- Allow public read access
CREATE POLICY "Public read access for material photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'materials');

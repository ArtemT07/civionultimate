/*
  # Add Media Library and Navigation System

  ## New Features
  
  1. **Storage Bucket for Images**
    - Public bucket `cms-media` for uploaded images
    - Allows authenticated users to upload
    - Public read access for all images
  
  2. **Navigation Menu System**
    - `navigation_items` table for managing menu items
    - Supports hierarchical structure (parent_id for dropdowns)
    - Customizable labels in ES/EN
    - Order control
    - Show/hide items
  
  3. **Site-wide Settings**
    - Add show_back_button setting
    - Add back_button_text settings for ES/EN
  
  ## Security
    - RLS enabled on navigation_items
    - Only owners can manage navigation
    - Public read access for active items
*/

-- Create storage bucket for media
INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-media', 'cms-media', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
  DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
  DROP POLICY IF EXISTS "Owners can delete media" ON storage.objects;
END $$;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cms-media');

-- Allow public read access
CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cms-media');

-- Allow owners to delete media
CREATE POLICY "Owners can delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cms-media' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'owner'
  )
);

-- Create navigation items table
CREATE TABLE IF NOT EXISTS navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label_es text NOT NULL,
  label_en text NOT NULL,
  link_type text NOT NULL CHECK (link_type IN ('internal', 'external', 'cms_page')),
  link_value text NOT NULL,
  parent_id uuid REFERENCES navigation_items(id) ON DELETE CASCADE,
  "order" integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;

-- Anyone can read active navigation items
CREATE POLICY "Anyone can view active navigation"
ON navigation_items FOR SELECT
TO public
USING (is_active = true);

-- Only owners can manage navigation
CREATE POLICY "Owners can insert navigation"
ON navigation_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'owner'
  )
);

CREATE POLICY "Owners can update navigation"
ON navigation_items FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'owner'
  )
);

CREATE POLICY "Owners can delete navigation"
ON navigation_items FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'owner'
  )
);

-- Add default navigation items
INSERT INTO navigation_items (label_es, label_en, link_type, link_value, "order", is_active)
VALUES
  ('Inicio', 'Home', 'internal', '/', 1, true),
  ('Nosotros', 'About', 'internal', '/about', 2, true),
  ('Materiales', 'Materials', 'internal', '/materials', 3, true),
  ('Proyectos', 'Projects', 'internal', '/projects', 4, true),
  ('Calculadora', 'Calculator', 'internal', '/calculator', 5, true),
  ('Contactos', 'Contacts', 'internal', '/contacts', 6, true)
ON CONFLICT DO NOTHING;

-- Add navigation and back button settings
INSERT INTO site_settings (setting_key, setting_value)
VALUES
  ('show_back_button', 'true'),
  ('back_button_text_es', '"Volver"'),
  ('back_button_text_en', '"Back"')
ON CONFLICT (setting_key) DO NOTHING;
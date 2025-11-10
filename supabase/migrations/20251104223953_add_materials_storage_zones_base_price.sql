/*
  # Add Materials Storage, Zones System, and Base Construction Price

  ## New Features
  
  1. **Storage Bucket for Materials**
    - Public bucket `materials` for material photos
    - Allows authenticated managers to upload
    - Public read access
  
  2. **Zones System**
    - `material_zones` table for organizing materials by usage area
    - Zones: Building, Roof, Pool, Parking
    - Used in calculator for detailed estimates
  
  3. **Base Construction Price**
    - `construction_settings` table for base prices
    - Configurable by owner
    - Used in calculator
  
  4. **Link Materials to Zones**
    - Add zone_id to materials table
  
  ## Security
    - RLS enabled on all tables
    - Only managers can modify
    - Public can view active items
*/

-- Create storage bucket for materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Managers can upload materials" ON storage.objects;
  DROP POLICY IF EXISTS "Public can view materials" ON storage.objects;
  DROP POLICY IF EXISTS "Managers can delete materials" ON storage.objects;
END $$;

-- Allow managers to upload
CREATE POLICY "Managers can upload materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'materials' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('owner', 'admin', 'materials_manager')
  )
);

-- Allow public read access
CREATE POLICY "Public can view materials"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'materials');

-- Allow managers to delete
CREATE POLICY "Managers can delete materials"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'materials' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('owner', 'admin', 'materials_manager')
  )
);

-- Create material zones table
CREATE TABLE IF NOT EXISTS material_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_es text NOT NULL,
  name_en text NOT NULL,
  description_es text,
  description_en text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE material_zones ENABLE ROW LEVEL SECURITY;

-- Anyone can view active zones
CREATE POLICY "Anyone can view active zones"
ON material_zones FOR SELECT
TO public
USING (is_active = true);

-- Only managers can manage zones
CREATE POLICY "Managers can insert zones"
ON material_zones FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('owner', 'admin', 'materials_manager')
  )
);

CREATE POLICY "Managers can update zones"
ON material_zones FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('owner', 'admin', 'materials_manager')
  )
);

CREATE POLICY "Managers can delete zones"
ON material_zones FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('owner', 'admin', 'materials_manager')
  )
);

-- Insert default zones
INSERT INTO material_zones (name_es, name_en, description_es, description_en, display_order, is_active)
VALUES
  ('Edificio', 'Building', 'Materiales para construcción del edificio', 'Materials for building construction', 1, true),
  ('Cubierta', 'Roof', 'Materiales para el techo', 'Roofing materials', 2, true),
  ('Piscina', 'Pool', 'Materiales para la piscina', 'Pool materials', 3, true),
  ('Estacionamiento', 'Parking', 'Materiales para el estacionamiento', 'Parking materials', 4, true)
ON CONFLICT DO NOTHING;

-- Add zone_id to materials table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'materials' AND column_name = 'zone_id'
  ) THEN
    ALTER TABLE materials ADD COLUMN zone_id uuid REFERENCES material_zones(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create construction settings table
CREATE TABLE IF NOT EXISTS construction_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE construction_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view settings
CREATE POLICY "Anyone can view construction settings"
ON construction_settings FOR SELECT
TO public
USING (true);

-- Only owners can update settings
CREATE POLICY "Owners can update construction settings"
ON construction_settings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'owner'
  )
);

CREATE POLICY "Owners can insert construction settings"
ON construction_settings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'owner'
  )
);

-- Insert default base price (USD per m²)
INSERT INTO construction_settings (setting_key, setting_value, description)
VALUES
  ('base_price_per_sqm', '450', 'Base construction price per square meter in USD')
ON CONFLICT (setting_key) DO NOTHING;
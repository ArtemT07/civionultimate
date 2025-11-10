/*
  # Create CMS System for Content Management
  
  1. New Tables
    - `cms_pages`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL slug for the page
      - `title_es` (text) - Page title in Spanish
      - `title_en` (text) - Page title in English
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, references auth.users)
    
    - `cms_sections`
      - `id` (uuid, primary key)
      - `page_id` (uuid, references cms_pages)
      - `order` (integer) - Display order on page
      - `type` (text) - Section type: 'text', 'image', 'gallery', 'hero'
      - `content_es` (jsonb) - Content in Spanish
      - `content_en` (jsonb) - Content in English
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `cms_images`
      - `id` (uuid, primary key)
      - `section_id` (uuid, references cms_sections)
      - `url` (text) - Image URL
      - `alt_text_es` (text)
      - `alt_text_en` (text)
      - `order` (integer)
      - `width` (integer)
      - `height` (integer)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Public can view active content
    - Only owner can manage content
*/

-- Create cms_pages table
CREATE TABLE IF NOT EXISTS cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_es text NOT NULL,
  title_en text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create cms_sections table
CREATE TABLE IF NOT EXISTS cms_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES cms_pages(id) ON DELETE CASCADE,
  "order" integer NOT NULL DEFAULT 0,
  type text NOT NULL CHECK (type IN ('text', 'image', 'gallery', 'hero', 'cards')),
  content_es jsonb DEFAULT '{}',
  content_en jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cms_images table
CREATE TABLE IF NOT EXISTS cms_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES cms_sections(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text_es text,
  alt_text_en text,
  "order" integer DEFAULT 0,
  width integer,
  height integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cms_pages
CREATE POLICY "Anyone can view active pages"
  ON cms_pages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Owners can manage pages"
  ON cms_pages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'owner'
    )
  );

-- RLS Policies for cms_sections
CREATE POLICY "Anyone can view active sections"
  ON cms_sections FOR SELECT
  USING (
    is_active = true 
    AND EXISTS (
      SELECT 1 FROM cms_pages
      WHERE cms_pages.id = cms_sections.page_id
      AND cms_pages.is_active = true
    )
  );

CREATE POLICY "Owners can manage sections"
  ON cms_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'owner'
    )
  );

-- RLS Policies for cms_images
CREATE POLICY "Anyone can view images"
  ON cms_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cms_sections
      JOIN cms_pages ON cms_pages.id = cms_sections.page_id
      WHERE cms_sections.id = cms_images.section_id
      AND cms_sections.is_active = true
      AND cms_pages.is_active = true
    )
  );

CREATE POLICY "Owners can manage images"
  ON cms_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'owner'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cms_sections_page_id ON cms_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_cms_sections_order ON cms_sections("order");
CREATE INDEX IF NOT EXISTS idx_cms_images_section_id ON cms_images(section_id);
CREATE INDEX IF NOT EXISTS idx_cms_images_order ON cms_images("order");
/*
  # Create Property Listings and Page Management System
  
  1. New Tables
    - `property_listings` - Real estate properties for sale
      - `id` (uuid, primary key)
      - `title_es` (text) - Property title in Spanish
      - `title_en` (text) - Property title in English
      - `description_es` (text) - Description in Spanish
      - `description_en` (text) - Description in English
      - `price` (numeric) - Property price
      - `location` (text) - Property location
      - `bedrooms` (integer) - Number of bedrooms
      - `bathrooms` (integer) - Number of bathrooms
      - `area_m2` (numeric) - Area in square meters
      - `images` (jsonb) - Array of image URLs
      - `features_es` (jsonb) - Array of features in Spanish
      - `features_en` (jsonb) - Array of features in English
      - `is_featured` (boolean) - Show on homepage
      - `is_active` (boolean) - Is listing active
      - `created_by` (uuid) - User who created
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `cms_pages` - Manage all website pages
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL slug
      - `title_es` (text) - Page title in Spanish
      - `title_en` (text) - Page title in English
      - `content_es` (jsonb) - Page content in Spanish
      - `content_en` (jsonb) - Page content in English
      - `meta_title_es` (text) - SEO meta title Spanish
      - `meta_title_en` (text) - SEO meta title English
      - `meta_description_es` (text) - SEO meta description Spanish
      - `meta_description_en` (text) - SEO meta description English
      - `is_system_page` (boolean) - Cannot be deleted (home, about, etc)
      - `is_active` (boolean) - Is page active
      - `created_by` (uuid)
      - `updated_by` (uuid)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Public can view active listings and pages
    - Only owner/admin can manage listings and pages
*/

-- Create property_listings table
CREATE TABLE IF NOT EXISTS public.property_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_es text NOT NULL,
  title_en text NOT NULL,
  description_es text,
  description_en text,
  price numeric NOT NULL DEFAULT 0,
  location text,
  bedrooms integer DEFAULT 0,
  bathrooms integer DEFAULT 0,
  area_m2 numeric DEFAULT 0,
  images jsonb DEFAULT '[]'::jsonb,
  features_es jsonb DEFAULT '[]'::jsonb,
  features_en jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cms_pages table
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_es text NOT NULL,
  title_en text NOT NULL,
  content_es jsonb DEFAULT '{}'::jsonb,
  content_en jsonb DEFAULT '{}'::jsonb,
  meta_title_es text,
  meta_title_en text,
  meta_description_es text,
  meta_description_en text,
  is_system_page boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_property_listings_is_featured ON public.property_listings(is_featured) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_property_listings_is_active ON public.property_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_property_listings_created_by ON public.property_listings(created_by);
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON public.cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_is_active ON public.cms_pages(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_pages_created_by ON public.cms_pages(created_by);
CREATE INDEX IF NOT EXISTS idx_cms_pages_updated_by ON public.cms_pages(updated_by);

-- Enable RLS
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_listings
CREATE POLICY "Anyone can view active property listings"
  ON public.property_listings FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Owner and admin can manage property listings"
  ON public.property_listings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for cms_pages
CREATE POLICY "Anyone can view active pages"
  ON public.cms_pages FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Owner and admin can manage pages"
  ON public.cms_pages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_property_listings_updated_at
  BEFORE UPDATE ON public.property_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_pages_updated_at
  BEFORE UPDATE ON public.cms_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert system pages
INSERT INTO public.cms_pages (slug, title_es, title_en, is_system_page, is_active) VALUES
  ('home', 'Inicio', 'Home', true, true),
  ('about', 'Sobre Nosotros', 'About Us', true, true),
  ('materials', 'Materiales', 'Materials', true, true),
  ('calculator', 'Calculadora', 'Calculator', true, true),
  ('contacts', 'Contactos', 'Contacts', true, true)
ON CONFLICT (slug) DO NOTHING;

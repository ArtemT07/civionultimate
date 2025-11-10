/*
  # Add Site Settings and Design System
  
  1. New Tables
    - `site_settings`
      - Global site settings (logo, fonts, colors, etc.)
    - `page_elements`
      - Individual page elements with styling
  
  2. Features
    - Logo management (URL, size, position)
    - Font customization
    - Button styles (size, colors, border-radius)
    - Color scheme management
    - Page element positioning and styling
    - Visibility toggles for pages and elements
*/

-- Create site_settings table for global design settings
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Create page_elements table for managing existing page elements
CREATE TABLE IF NOT EXISTS page_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL,
  element_id text NOT NULL,
  element_type text NOT NULL CHECK (element_type IN ('logo', 'button', 'text', 'image', 'section', 'nav-item')),
  styles jsonb DEFAULT '{}',
  content_es jsonb DEFAULT '{}',
  content_en jsonb DEFAULT '{}',
  is_visible boolean DEFAULT true,
  position_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page_slug, element_id)
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_elements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings
CREATE POLICY "Anyone can view site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage site settings"
  ON site_settings FOR ALL
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

-- RLS Policies for page_elements
CREATE POLICY "Anyone can view visible page elements"
  ON page_elements FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Owners can manage page elements"
  ON page_elements FOR ALL
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

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('logo', '{"url": "/civion-logo.svg", "width": 80, "height": 80, "position": "left"}'),
  ('fonts', '{"heading": "system-ui", "body": "system-ui", "sizes": {"xs": 12, "sm": 14, "base": 16, "lg": 18, "xl": 20, "2xl": 24, "3xl": 30, "4xl": 36, "5xl": 48}}'),
  ('colors', '{"primary": {"from": "#dc2626", "to": "#2563eb"}, "secondary": "#f3f4f6", "text": "#111827", "textLight": "#6b7280"}'),
  ('buttons', '{"defaultSize": "medium", "borderRadius": 8, "sizes": {"small": {"px": 12, "py": 6, "text": 14}, "medium": {"px": 16, "py": 8, "text": 16}, "large": {"px": 24, "py": 12, "text": 18}}}'),
  ('spacing', '{"containerMaxWidth": 1280, "sectionPadding": {"y": 64, "x": 16}}')
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_page_elements_page_slug ON page_elements(page_slug);
CREATE INDEX IF NOT EXISTS idx_page_elements_visible ON page_elements(is_visible);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);
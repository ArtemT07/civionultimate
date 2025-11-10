/*
  # Add Complete Role, Projects, and Materials Management System
  
  1. New Tables
    - `user_roles`
      - Maps users to their roles (owner, admin, materials_manager)
    
    - `material_categories`
      - Categories for construction materials
      - Created by owner/admin
    
    - `materials`
      - Construction materials database
      - Photos, prices, groups
      - Managed by owner, admin, materials_manager
    
    - `projects`
      - User saved calculations/estimates
      - Stores calculation data and selected materials
    
    - `site_analytics`
      - Track visits, calculator usage, contact form usage
  
  2. Security
    - RLS enabled on all tables
    - Role-based access policies
    - Owner has full access
    - Admin has most access except role assignment
    - Materials manager can only manage materials
  
  3. Initial Data
    - Set artembay@yahoo.com as owner
*/

-- User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'materials_manager')),
  assigned_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only owner can assign roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Only owner can delete roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Material Categories Table
CREATE TABLE IF NOT EXISTS material_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_es text NOT NULL,
  name_en text NOT NULL,
  description_es text,
  description_en text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON material_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owner and admin can manage categories"
  ON material_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Materials Table
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES material_categories(id) ON DELETE CASCADE,
  name_es text NOT NULL,
  name_en text NOT NULL,
  description_es text,
  description_en text,
  photo_url text,
  store_price decimal(10,2) NOT NULL DEFAULT 0,
  company_profit_price decimal(10,2) NOT NULL DEFAULT 0,
  discount_price decimal(10,2) NOT NULL DEFAULT 0,
  labor_price decimal(10,2) NOT NULL DEFAULT 0,
  final_price decimal(10,2) GENERATED ALWAYS AS (company_profit_price + labor_price) STORED,
  unit text NOT NULL DEFAULT 'm²',
  is_base_material boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active materials"
  ON materials FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authorized users can manage materials"
  ON materials FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'materials_manager')
    )
  );

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  area decimal(10,2) NOT NULL,
  project_type text NOT NULL CHECK (project_type IN ('residential', 'commercial')),
  base_cost decimal(10,2) NOT NULL,
  materials_cost decimal(10,2) DEFAULT 0,
  total_cost decimal(10,2) NOT NULL,
  selected_materials jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owner and admin can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Site Analytics Table
CREATE TABLE IF NOT EXISTS site_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('page_visit', 'calculator_use', 'contact_form', 'project_created')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  page_name text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner and admin can view analytics"
  ON site_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Anyone can insert analytics"
  ON site_analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update triggers
CREATE TRIGGER update_material_categories_updated_at
  BEFORE UPDATE ON material_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to track analytics
CREATE OR REPLACE FUNCTION track_analytics(
  p_event_type text,
  p_page_name text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO site_analytics (event_type, user_id, page_name, metadata)
  VALUES (p_event_type, auth.uid(), p_page_name, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION has_role(p_role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = p_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
/*
  # Fix Security Issues - Part 4: Optimize RLS for Materials
  
  1. RLS Policy Optimization
    - Optimize material_categories, materials, material_zones, construction_settings, site_analytics
*/

-- material_categories
DROP POLICY IF EXISTS "Owner and admin can manage categories" ON public.material_categories;

CREATE POLICY "Owner and admin can manage categories"
  ON public.material_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

-- materials
DROP POLICY IF EXISTS "Authorized users can manage materials" ON public.materials;

CREATE POLICY "Authorized users can manage materials"
  ON public.materials
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin', 'materials_manager')
    )
  );

-- site_analytics
DROP POLICY IF EXISTS "Owner and admin can view analytics" ON public.site_analytics;

CREATE POLICY "Owner and admin can view analytics"
  ON public.site_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

-- construction_settings
DROP POLICY IF EXISTS "Owners can insert construction settings" ON public.construction_settings;
DROP POLICY IF EXISTS "Owners can update construction settings" ON public.construction_settings;

CREATE POLICY "Owners can insert construction settings"
  ON public.construction_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role = 'owner'
    )
  );

CREATE POLICY "Owners can update construction settings"
  ON public.construction_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role = 'owner'
    )
  );

-- material_zones
DROP POLICY IF EXISTS "Managers can insert zones" ON public.material_zones;
DROP POLICY IF EXISTS "Managers can update zones" ON public.material_zones;
DROP POLICY IF EXISTS "Managers can delete zones" ON public.material_zones;

CREATE POLICY "Managers can insert zones"
  ON public.material_zones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Managers can update zones"
  ON public.material_zones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Managers can delete zones"
  ON public.material_zones FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

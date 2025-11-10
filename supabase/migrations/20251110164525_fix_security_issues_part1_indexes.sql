/*
  # Fix Security Issues - Part 1: Indexes
  
  1. Create Indexes for Foreign Keys
    - Add indexes for all unindexed foreign keys to improve query performance
*/

-- construction_settings indexes
CREATE INDEX IF NOT EXISTS idx_construction_settings_updated_by 
  ON public.construction_settings(updated_by);

-- material_categories indexes
CREATE INDEX IF NOT EXISTS idx_material_categories_created_by 
  ON public.material_categories(created_by);

-- materials indexes
CREATE INDEX IF NOT EXISTS idx_materials_category_id 
  ON public.materials(category_id);

CREATE INDEX IF NOT EXISTS idx_materials_created_by 
  ON public.materials(created_by);

CREATE INDEX IF NOT EXISTS idx_materials_zone_id 
  ON public.materials(zone_id);

-- project_material_additions indexes
CREATE INDEX IF NOT EXISTS idx_project_material_additions_material_id 
  ON public.project_material_additions(material_id);

-- projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id 
  ON public.projects(user_id);

-- site_analytics indexes
CREATE INDEX IF NOT EXISTS idx_site_analytics_user_id 
  ON public.site_analytics(user_id);

-- user_roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_assigned_by 
  ON public.user_roles(assigned_by);

-- Remove unused indexes
DROP INDEX IF EXISTS public.idx_project_additions_project_id;
DROP INDEX IF EXISTS public.idx_project_additions_zone_id;

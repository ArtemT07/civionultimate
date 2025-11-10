/*
  # Fix Security Issues - Part 5: Optimize RLS for Projects
  
  1. RLS Policy Optimization
    - Optimize projects and project_material_additions tables
*/

-- projects
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
DROP POLICY IF EXISTS "Owner and admin can view all projects" ON public.projects;

CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Owner and admin can view all projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

-- project_material_additions
DROP POLICY IF EXISTS "Users can view own project additions" ON public.project_material_additions;
DROP POLICY IF EXISTS "Users can insert own project additions" ON public.project_material_additions;
DROP POLICY IF EXISTS "Users can update own project additions" ON public.project_material_additions;
DROP POLICY IF EXISTS "Users can delete own project additions" ON public.project_material_additions;

CREATE POLICY "Users can view own project additions"
  ON public.project_material_additions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_material_additions.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own project additions"
  ON public.project_material_additions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_material_additions.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own project additions"
  ON public.project_material_additions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_material_additions.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete own project additions"
  ON public.project_material_additions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_material_additions.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

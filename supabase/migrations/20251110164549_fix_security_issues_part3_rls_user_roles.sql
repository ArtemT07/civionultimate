/*
  # Fix Security Issues - Part 3: Optimize RLS for User Roles
  
  1. RLS Policy Optimization
    - Replace auth.uid() with (select auth.uid())
*/

DROP POLICY IF EXISTS "Only owner can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only owner can delete roles" ON public.user_roles;

CREATE POLICY "Only owner can assign roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role = 'owner'
    )
  );

CREATE POLICY "Only owner can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role = 'owner'
    )
  );

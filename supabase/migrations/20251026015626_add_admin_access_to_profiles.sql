/*
  # Add Admin Access to Profiles
  
  1. Changes
    - Add policy for Owner and Admin to view all profiles
    - Add policy for Owner and Admin to update all profiles
  
  2. Security
    - Only users with 'owner' or 'admin' role can view/update all profiles
    - Regular users can still only view/update their own profile
*/

-- Policy for Owner and Admin to view all profiles
CREATE POLICY "Owners and Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin')
    )
  );

-- Policy for Owner and Admin to update all profiles
CREATE POLICY "Owners and Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin')
    )
  );
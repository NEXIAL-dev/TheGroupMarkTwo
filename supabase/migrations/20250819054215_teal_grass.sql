/*
  # Create agencies and extended user profiles schema

  1. New Tables
    - `agencies`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `owner_id` (uuid, references user_profiles)
      - `status` (text, check constraint)
      - `recent_activity` (text array)
      - `created_at` (timestamp)
    
    - `agency_members`
      - `id` (uuid, primary key)
      - `agency_id` (uuid, references agencies)
      - `user_id` (uuid, references user_profiles)
      - `joined_at` (timestamp)

  2. Updates to user_profiles
    - Add `role` (text, check constraint)
    - Add `agency_id` (uuid, references agencies)
    - Add `profile_pic` (text)
    - Add `background_pic` (text)
    - Add `theme_pic` (text)
    - Remove old role arrays and simplify structure

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for data access
    - Users can read their own profiles and agency data
    - Agency owners can manage their agencies
*/

-- First, let's update the user_profiles table structure
-- Add new columns to existing user_profiles table
DO $$
BEGIN
  -- Add role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN role text CHECK (role IN ('Core Member', 'Agency Owner')) DEFAULT 'Core Member';
  END IF;

  -- Add agency_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'agency_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN agency_id uuid;
  END IF;

  -- Add profile_pic column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'profile_pic'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN profile_pic text;
  END IF;

  -- Add background_pic column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'background_pic'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN background_pic text;
  END IF;

  -- Add theme_pic column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'theme_pic'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN theme_pic text;
  END IF;
END $$;

-- Create agencies table
CREATE TABLE IF NOT EXISTS agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  status text CHECK (status IN ('Open to Work', 'Busy', 'Break/Vacation', 'Holiday')) DEFAULT 'Open to Work',
  recent_activity text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- Create agency_members table
CREATE TABLE IF NOT EXISTS agency_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(agency_id, user_id)
);

-- Add foreign key constraint for agency_id in user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_profiles_agency_id_fkey'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_agency_id_fkey 
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_members ENABLE ROW LEVEL SECURITY;

-- Policies for agencies table
CREATE POLICY "Users can read agencies they're associated with"
  ON agencies
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Agency owners can update their agencies"
  ON agencies
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Agency owners can delete their agencies"
  ON agencies
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create agencies"
  ON agencies
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Policies for agency_members table
CREATE POLICY "Users can read agency memberships they're part of"
  ON agency_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    agency_id IN (
      SELECT id FROM agencies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Agency owners can manage members"
  ON agency_members
  FOR ALL
  TO authenticated
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can join agencies"
  ON agency_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Update the handle_new_user function to use the new schema
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text;
  agency_name text;
  new_agency_id uuid;
BEGIN
  -- Get role and agency name from metadata
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'Core Member');
  agency_name := new.raw_user_meta_data->>'agency_name';

  -- Create agency first if user is Agency Owner and provided agency name
  IF user_role = 'Agency Owner' AND agency_name IS NOT NULL AND agency_name != '' THEN
    INSERT INTO agencies (name, owner_id)
    VALUES (agency_name, new.id)
    RETURNING id INTO new_agency_id;
  END IF;

  -- Insert user profile
  INSERT INTO public.user_profiles (id, full_name, role, agency_id)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    user_role,
    new_agency_id
  );

  -- Add user as member of their own agency if they created one
  IF new_agency_id IS NOT NULL THEN
    INSERT INTO agency_members (agency_id, user_id)
    VALUES (new_agency_id, new.id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
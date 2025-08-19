/*
  # Create agencies and agency members schema

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
    - Add `base_roles` (text array)
    - Add `agency_roles` (text array)
    - Add `agency_id` (uuid, references agencies)
    - Add `profile_pic` (text)
    - Add `background_pic` (text)
    - Add `theme_pic` (text)

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for data access
    - Users can read their own profiles and agency data
    - Agency owners can manage their agencies
*/

-- Update user_profiles table structure
DO $$
BEGIN
  -- Add base_roles column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'base_roles'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN base_roles text[] DEFAULT ARRAY['Core Member'];
  END IF;

  -- Add agency_roles column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'agency_roles'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN agency_roles text[] DEFAULT ARRAY[]::text[];
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
CREATE POLICY "Users can read all agencies"
  ON agencies
  FOR SELECT
  TO authenticated
  USING (true);

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
CREATE POLICY "Users can read all agency memberships"
  ON agency_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Agency owners and managers can manage members"
  ON agency_members
  FOR ALL
  TO authenticated
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE owner_id = auth.uid()
    ) OR
    (
      user_id = auth.uid() AND
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND agency_roles && ARRAY['Manager', 'Owner']
      )
    )
  );

CREATE POLICY "Users can join agencies"
  ON agency_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    agency_id IN (
      SELECT id FROM agencies WHERE owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND agency_roles && ARRAY['Manager', 'Owner']
    )
  );
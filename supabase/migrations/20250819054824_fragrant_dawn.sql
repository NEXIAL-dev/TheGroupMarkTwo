/*
  # Update user profiles to support multiple roles

  1. Schema Changes
    - Change `role` column to `base_roles` (text array) for roles like 'Core Member', 'Agency Owner'
    - Add `agency_roles` (text array) for agency-specific roles like 'Owner', 'Manager', 'CFO', 'HR', etc.
    - Update existing data to use arrays
    - Update RLS policies if needed

  2. Data Migration
    - Convert existing single role values to arrays
    - Set default values for new role arrays

  3. Functions
    - Update trigger function to handle role arrays from signup metadata
*/

-- Add new role array columns
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
END $$;

-- Migrate existing single role data to arrays (if role column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'role'
  ) THEN
    -- Update base_roles based on existing role column
    UPDATE user_profiles 
    SET base_roles = ARRAY[role]
    WHERE role IS NOT NULL AND (base_roles IS NULL OR base_roles = ARRAY[]::text[]);
    
    -- Set default agency_roles for Agency Owners
    UPDATE user_profiles 
    SET agency_roles = ARRAY['Owner']
    WHERE role = 'Agency Owner' AND (agency_roles IS NULL OR agency_roles = ARRAY[]::text[]);
  END IF;
END $$;

-- Update the handle_new_user function to support multiple roles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_base_roles text[];
  user_agency_roles text[];
  agency_name text;
  new_agency_id uuid;
BEGIN
  -- Get roles from metadata (can be arrays or single values)
  user_base_roles := COALESCE(
    CASE 
      WHEN jsonb_typeof(new.raw_user_meta_data->'base_roles') = 'array' 
      THEN ARRAY(SELECT jsonb_array_elements_text(new.raw_user_meta_data->'base_roles'))
      ELSE ARRAY[COALESCE(new.raw_user_meta_data->>'role', 'Core Member')]
    END,
    ARRAY['Core Member']
  );
  
  user_agency_roles := COALESCE(
    CASE 
      WHEN jsonb_typeof(new.raw_user_meta_data->'agency_roles') = 'array' 
      THEN ARRAY(SELECT jsonb_array_elements_text(new.raw_user_meta_data->'agency_roles'))
      ELSE ARRAY[]::text[]
    END,
    ARRAY[]::text[]
  );
  
  agency_name := new.raw_user_meta_data->>'agency_name';

  -- Create agency first if user is Agency Owner and provided agency name
  IF 'Agency Owner' = ANY(user_base_roles) AND agency_name IS NOT NULL AND agency_name != '' THEN
    INSERT INTO agencies (name, owner_id)
    VALUES (agency_name, new.id)
    RETURNING id INTO new_agency_id;
    
    -- Set default agency roles for agency owners
    IF array_length(user_agency_roles, 1) IS NULL OR array_length(user_agency_roles, 1) = 0 THEN
      user_agency_roles := ARRAY['Owner'];
    END IF;
  END IF;

  -- Insert user profile
  INSERT INTO public.user_profiles (id, full_name, base_roles, agency_roles, agency_id)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    user_base_roles,
    user_agency_roles,
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
/*
  # Create storage policies for profiles bucket

  1. Security Policies
    - Users can upload their own profile images (organized by user ID folders)
    - Users can update their own profile images
    - Users can delete their own profile images
    - Profile images are publicly viewable (since bucket is public)
    - Users can view their own private profile files

  2. File Organization
    - Files are organized in folders by user ID: `{user_id}/profile_image.jpg`
    - This ensures users can only access their own files
    - Supports multiple file types: profile pictures, background images, theme images

  3. File Types Supported
    - Profile pictures: `profile_*.{jpg,png,gif,webp}`
    - Background images: `background_*.{jpg,png,gif,webp}`
    - Theme images: `theme_*.{jpg,png,gif,webp}`
*/

-- Policy: Users can upload their own profile images
CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own profile images
CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profiles' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own profile images
CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profiles' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Profile images are publicly viewable (since bucket is public)
CREATE POLICY "Profile images are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');

-- Policy: Authenticated users can list their own profile files
CREATE POLICY "Users can list their own profile files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'profiles' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Optional: Create a function to help with file path validation
CREATE OR REPLACE FUNCTION is_profile_owner(file_path text)
RETURNS boolean AS $$
BEGIN
  -- Extract user ID from file path (first folder)
  RETURN auth.uid()::text = (storage.foldername(file_path))[1];
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Policy using the helper function (alternative approach)
-- CREATE POLICY "Users manage own profile files"
-- ON storage.objects FOR ALL
-- TO authenticated
-- USING (bucket_id = 'profiles' AND is_profile_owner(name))
-- WITH CHECK (bucket_id = 'profiles' AND is_profile_owner(name));
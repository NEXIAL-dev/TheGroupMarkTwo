import { supabase } from '@/lib/supabase';

export interface UploadOptions {
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
}

export const StorageHelper = {
  /**
   * Upload a file to the profiles bucket
   */
  async uploadProfileFile(
    userId: string,
    file: File,
    fileName: string,
    options: UploadOptions = {}
  ) {
    const filePath = `${userId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, {
        cacheControl: options.cacheControl || '3600',
        contentType: options.contentType || file.type,
        upsert: options.upsert || true,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    return {
      path: filePath,
      publicUrl,
      data,
    };
  },

  /**
   * Delete a file from the profiles bucket
   */
  async deleteProfileFile(userId: string, fileName: string) {
    const filePath = `${userId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('profiles')
      .remove([filePath]);

    if (error) throw error;
    return data;
  },

  /**
   * List all files for a user in the profiles bucket
   */
  async listUserProfileFiles(userId: string) {
    const { data, error } = await supabase.storage
      .from('profiles')
      .list(userId);

    if (error) throw error;
    return data;
  },

  /**
   * Get public URL for a profile file
   */
  getProfileFileUrl(userId: string, fileName: string) {
    const filePath = `${userId}/${fileName}`;
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  /**
   * Upload profile picture with automatic naming
   */
  async uploadProfilePicture(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `profile_${Date.now()}.${fileExt}`;
    
    return this.uploadProfileFile(userId, file, fileName);
  },

  /**
   * Upload background image with automatic naming
   */
  async uploadBackgroundImage(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `background_${Date.now()}.${fileExt}`;
    
    return this.uploadProfileFile(userId, file, fileName);
  },

  /**
   * Upload theme image with automatic naming
   */
  async uploadThemeImage(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `theme_${Date.now()}.${fileExt}`;
    
    return this.uploadProfileFile(userId, file, fileName);
  },

  /**
   * Validate file type for profile images
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size too large. Please upload an image smaller than 5MB.',
      };
    }

    return { valid: true };
  },
};
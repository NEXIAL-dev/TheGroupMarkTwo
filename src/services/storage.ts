import { supabase } from '@/lib/supabase';

export interface CreateBucketOptions {
  id: string;
  name: string;
  public?: boolean;
  allowedMimeTypes?: string[];
  fileSizeLimit?: number;
}

export const StorageService = {
  /**
   * Create a new storage bucket
   */
  async createBucket(options: CreateBucketOptions) {
    const { data, error } = await supabase.storage.createBucket(options.id, {
      public: options.public || false,
      allowedMimeTypes: options.allowedMimeTypes,
      fileSizeLimit: options.fileSizeLimit,
    });

    if (error) throw error;
    return data;
  },

  /**
   * List all buckets
   */
  async listBuckets() {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    return data;
  },

  /**
   * Delete a bucket
   */
  async deleteBucket(id: string) {
    const { data, error } = await supabase.storage.deleteBucket(id);
    if (error) throw error;
    return data;
  },

  /**
   * Upload file to bucket
   */
  async uploadFile(
    bucketId: string,
    path: string,
    file: File,
    options?: {
      cacheControl?: string;
      contentType?: string;
      upsert?: boolean;
    }
  ) {
    const { data, error } = await supabase.storage
      .from(bucketId)
      .upload(path, file, options);

    if (error) throw error;
    return data;
  },

  /**
   * Download file from bucket
   */
  async downloadFile(bucketId: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucketId)
      .download(path);

    if (error) throw error;
    return data;
  },

  /**
   * Get public URL for file
   */
  getPublicUrl(bucketId: string, path: string) {
    const { data } = supabase.storage
      .from(bucketId)
      .getPublicUrl(path);

    return data.publicUrl;
  },

  /**
   * Create signed URL for private files
   */
  async createSignedUrl(
    bucketId: string,
    path: string,
    expiresIn: number = 3600
  ) {
    const { data, error } = await supabase.storage
      .from(bucketId)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data;
  },

  /**
   * List files in bucket
   */
  async listFiles(bucketId: string, path?: string) {
    const { data, error } = await supabase.storage
      .from(bucketId)
      .list(path);

    if (error) throw error;
    return data;
  },

  /**
   * Delete file from bucket
   */
  async deleteFile(bucketId: string, paths: string[]) {
    const { data, error } = await supabase.storage
      .from(bucketId)
      .remove(paths);

    if (error) throw error;
    return data;
  },

  /**
   * Move file within bucket
   */
  async moveFile(
    bucketId: string,
    fromPath: string,
    toPath: string
  ) {
    const { data, error } = await supabase.storage
      .from(bucketId)
      .move(fromPath, toPath);

    if (error) throw error;
    return data;
  },

  /**
   * Copy file within bucket
   */
  async copyFile(
    bucketId: string,
    fromPath: string,
    toPath: string
  ) {
    const { data, error } = await supabase.storage
      .from(bucketId)
      .copy(fromPath, toPath);

    if (error) throw error;
    return data;
  },
};

// Example usage functions
export const BucketHelpers = {
  /**
   * Initialize common buckets for the application
   */
  async initializeAppBuckets() {
    const bucketsToCreate = [
      {
        id: 'documents',
        name: 'documents',
        public: false,
        allowedMimeTypes: ['application/pdf', 'application/msword', 'text/plain'],
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
      },
      {
        id: 'images',
        name: 'images',
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      },
      {
        id: 'agency-files',
        name: 'agency-files',
        public: false,
        fileSizeLimit: 50 * 1024 * 1024, // 50MB
      },
    ];

    const results = [];
    for (const bucket of bucketsToCreate) {
      try {
        const result = await StorageService.createBucket(bucket);
        results.push({ bucket: bucket.id, success: true, data: result });
      } catch (error) {
        results.push({ bucket: bucket.id, success: false, error });
      }
    }

    return results;
  },

  /**
   * Upload user profile image
   */
  async uploadProfileImage(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/profile_${Date.now()}.${fileExt}`;

    const uploadResult = await StorageService.uploadFile('profiles', fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

    return {
      ...uploadResult,
      publicUrl: StorageService.getPublicUrl('profiles', fileName),
    };
  },

  /**
   * Upload agency document
   */
  async uploadAgencyDocument(agencyId: string, file: File, userId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${agencyId}/${userId}_${Date.now()}.${fileExt}`;

    const uploadResult = await StorageService.uploadFile('agency-files', fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

    const signedUrl = await StorageService.createSignedUrl('agency-files', fileName, 3600);

    return {
      ...uploadResult,
      signedUrl: signedUrl.signedUrl,
    };
  },
};
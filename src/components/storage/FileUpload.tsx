import React, { useState } from 'react';
import { StorageService, BucketHelpers } from '@/services/storage';
import { Upload, File, Image, Trash2 } from 'lucide-react';

interface FileUploadProps {
  bucketId: string;
  path?: string;
  accept?: string;
  maxSize?: number;
  onUploadComplete?: (url: string, path: string) => void;
}

export default function FileUpload({
  bucketId,
  path = '',
  accept = '*/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  onUploadComplete,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const fileName = `${path}${Date.now()}_${file.name}`;
      
      const result = await StorageService.uploadFile(bucketId, fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

      const publicUrl = StorageService.getPublicUrl(bucketId, fileName);
      
      setUploadedFiles(prev => [...prev, publicUrl]);
      onUploadComplete?.(publicUrl, fileName);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    try {
      await StorageService.deleteFile(bucketId, [filePath]);
      setUploadedFiles(prev => prev.filter(url => !url.includes(filePath)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept={accept}
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer flex flex-col items-center gap-2 ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Upload className="w-8 h-8 text-gray-400" />
          <span className="text-sm text-gray-600">
            {uploading ? 'Uploading...' : 'Click to upload file'}
          </span>
          <span className="text-xs text-gray-500">
            Max size: {Math.round(maxSize / 1024 / 1024)}MB
          </span>
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Uploaded Files</h4>
          {uploadedFiles.map((url, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                {url.includes('image') ? (
                  <Image className="w-4 h-4 text-blue-500" />
                ) : (
                  <File className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-sm text-gray-700 truncate">
                  {url.split('/').pop()}
                </span>
              </div>
              <button
                onClick={() => handleDeleteFile(url.split('/').pop() || '')}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Example usage in a page
export function StorageExamplePage() {
  const [initializingBuckets, setInitializingBuckets] = useState(false);

  const handleInitializeBuckets = async () => {
    setInitializingBuckets(true);
    try {
      const results = await BucketHelpers.initializeAppBuckets();
      console.log('Bucket initialization results:', results);
    } catch (error) {
      console.error('Failed to initialize buckets:', error);
    } finally {
      setInitializingBuckets(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Storage Management</h1>
        
        <button
          onClick={handleInitializeBuckets}
          disabled={initializingBuckets}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {initializingBuckets ? 'Initializing...' : 'Initialize Buckets'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Upload Images</h2>
          <FileUpload
            bucketId="images"
            accept="image/*"
            maxSize={5 * 1024 * 1024}
            onUploadComplete={(url, path) => {
              console.log('Image uploaded:', { url, path });
            }}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
          <FileUpload
            bucketId="documents"
            accept=".pdf,.doc,.docx,.txt"
            maxSize={10 * 1024 * 1024}
            onUploadComplete={(url, path) => {
              console.log('Document uploaded:', { url, path });
            }}
          />
        </div>
      </div>
    </div>
  );
}
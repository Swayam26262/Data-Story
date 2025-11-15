import { v2 as cloudinary } from 'cloudinary';

// Validate required environment variables
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (
  !CLOUDINARY_CLOUD_NAME ||
  !CLOUDINARY_API_KEY ||
  !CLOUDINARY_API_SECRET
) {
  console.warn(
    '⚠️  Cloudinary credentials not configured. Storage operations will fail.'
  );
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadOptions {
  folder?: string;
  resourceType?: 'auto' | 'image' | 'video' | 'raw';
  tags?: string[];
}

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  size: number;
  resourceType: string;
}

/**
 * Upload a file to Cloudinary
 * @param buffer - File content as Buffer
 * @param filename - Original filename
 * @param options - Upload options
 * @returns Upload result with URL and metadata
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    const {
      folder = 'datastory-uploads',
      resourceType = 'raw',
      tags = [],
    } = options;

    // Generate unique public ID
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const publicId = `${folder}/${timestamp}-${sanitizedFilename}`;

    // Upload to Cloudinary
    const result = await new Promise<{
      public_id: string;
      url: string;
      secure_url: string;
      format: string;
      bytes: number;
      resource_type: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: resourceType,
          tags: [...tags, 'datastory'],
          folder,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as {
            public_id: string;
            url: string;
            secure_url: string;
            format: string;
            bytes: number;
            resource_type: string;
          });
        }
      );

      uploadStream.end(buffer);
    });

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      format: result.format,
      size: result.bytes,
      resourceType: result.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload file to Cloudinary: ${error}`);
  }
}

/**
 * Download a file from Cloudinary
 * @param publicId - Cloudinary public ID
 * @returns File content as Buffer
 */
export async function downloadFile(publicId: string): Promise<Buffer> {
  try {
    // Get the secure URL
    const url = cloudinary.url(publicId, {
      resource_type: 'raw',
      secure: true,
    });

    // Fetch the file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Cloudinary download error:', error);
    throw new Error(`Failed to download file from Cloudinary: ${error}`);
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId - Cloudinary public ID
 */
export async function deleteFile(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
      invalidate: true,
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete file from Cloudinary: ${error}`);
  }
}

/**
 * Get a secure URL for file access
 * @param publicId - Cloudinary public ID
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Secure URL with expiration
 */
export function getSecureUrl(
  publicId: string,
  expiresIn: number = 3600
): string {
  const expirationTimestamp = Math.floor(Date.now() / 1000) + expiresIn;

  return cloudinary.url(publicId, {
    resource_type: 'raw',
    secure: true,
    sign_url: true,
    type: 'authenticated',
    expires_at: expirationTimestamp,
  });
}

/**
 * Get file metadata from Cloudinary
 * @param publicId - Cloudinary public ID
 * @returns File metadata
 */
export async function getFileMetadata(publicId: string): Promise<{
  size: number;
  format: string;
  createdAt: Date;
  url: string;
}> {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'raw',
    });

    return {
      size: result.bytes,
      format: result.format,
      createdAt: new Date(result.created_at),
      url: result.secure_url,
    };
  } catch (error) {
    console.error('Cloudinary metadata error:', error);
    throw new Error(`Failed to get file metadata from Cloudinary: ${error}`);
  }
}

/**
 * Check if a file exists in Cloudinary
 * @param publicId - Cloudinary public ID
 * @returns True if file exists, false otherwise
 */
export async function fileExists(publicId: string): Promise<boolean> {
  try {
    await cloudinary.api.resource(publicId, {
      resource_type: 'raw',
    });
    return true;
  } catch (error: unknown) {
    const cloudinaryError = error as {
      error?: {
        http_code?: number;
      };
    };

    if (cloudinaryError.error?.http_code === 404) {
      return false;
    }

    console.error('Cloudinary file exists check error:', error);
    throw new Error(
      `Failed to check if file exists in Cloudinary: ${String(error)}`
    );
  }
}

/**
 * Generate a unique storage key for user uploads
 * @param userId - User ID
 * @param filename - Original filename
 * @returns Unique storage key
 */
export function generateUploadKey(userId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `datastory-uploads/${userId}/${timestamp}-${sanitizedFilename}`;
}

/**
 * Upload file from base64 string
 * @param base64Data - Base64 encoded file data
 * @param filename - Original filename
 * @param options - Upload options
 * @returns Upload result
 */
export async function uploadFromBase64(
  base64Data: string,
  filename: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    return await uploadFile(buffer, filename, options);
  } catch (error) {
    console.error('Cloudinary base64 upload error:', error);
    throw new Error(`Failed to upload base64 file to Cloudinary: ${error}`);
  }
}

export { cloudinary };

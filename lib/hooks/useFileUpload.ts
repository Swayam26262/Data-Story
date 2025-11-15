'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UploadOptions {
  onProgress?: (progress: number) => void;
  onSuccess?: (jobId: string) => void;
  onError?: (error: string) => void;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export function useFileUpload() {
  const router = useRouter();
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const uploadFile = useCallback(
    async (file: File, options?: UploadOptions) => {
      setState({ isUploading: true, progress: 0, error: null });

      try {
        // Client-side validation
        const validationError = validateFile(file);
        if (validationError) {
          throw new Error(validationError);
        }

        // Create form data
        const formData = new FormData();
        formData.append('file', file);

        // Upload with progress tracking
        const result = await uploadWithProgress(
          formData,
          (progress) => {
            setState((prev) => ({ ...prev, progress }));
            options?.onProgress?.(progress);
          }
        );

        // Success
        setState({ isUploading: false, progress: 100, error: null });
        options?.onSuccess?.(result.jobId);

        // Redirect to processing page
        router.push(`/processing/${result.jobId}`);

        return result;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Upload failed. Please try again.';
        setState({ isUploading: false, progress: 0, error: errorMessage });
        options?.onError?.(errorMessage);
        throw error;
      }
    },
    [router]
  );

  const reset = useCallback(() => {
    setState({ isUploading: false, progress: 0, error: null });
  }, []);

  return {
    ...state,
    uploadFile,
    reset,
  };
}

/**
 * Client-side file validation
 */
function validateFile(file: File): string | null {
  const ACCEPTED_EXTENSIONS = ['.csv', '.xls', '.xlsx'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    return 'Please upload CSV or Excel files only (.csv, .xls, .xlsx)';
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return 'File size exceeds 10 MB limit';
  }

  return null;
}

/**
 * Upload file with progress tracking using XMLHttpRequest
 */
function uploadWithProgress(
  formData: FormData,
  onProgress: (progress: number) => void
): Promise<{ jobId: string; status: string; message: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          reject(new Error('Invalid response from server'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(
            new Error(errorResponse.error?.message || 'Upload failed')
          );
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    // Handle network errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload. Please check your connection.'));
    });

    // Handle timeout
    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timed out. Please try again.'));
    });

    // Set timeout (60 seconds)
    xhr.timeout = 60000;

    // Send request
    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}

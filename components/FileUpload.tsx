'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { useToast } from '@/components/Toast';

interface FileUploadProps {
  onUploadStart?: () => void;
  onUploadComplete?: (jobId: string) => void;
  onUploadError?: (error: string) => void;
}

const ACCEPTED_EXTENSIONS = ['.csv', '.xls', '.xlsx'];

export default function FileUpload({
  onUploadStart,
  onUploadComplete,
  onUploadError,
}: FileUploadProps) {
  const { user } = useAuth();
  const { isUploading, progress: uploadProgress, error: uploadError, uploadFile } = useFileUpload();
  const { showToast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxRows = user?.limits?.maxDatasetRows || 1000;
  const storiesRemaining = user
    ? user.limits.storiesPerMonth - user.storiesThisMonth
    : 0;

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(fileExtension)) {
      return 'Please upload CSV or Excel files only (.csv, .xls, .xlsx)';
    }

    // Check file size (10 MB limit)
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return 'File size exceeds 10 MB limit';
    }

    // Check if user has stories remaining
    if (storiesRemaining <= 0) {
      return `You've reached your monthly limit of ${user?.limits?.storiesPerMonth || 3} stories. Upgrade or wait until next month.`;
    }

    return null;
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setError(null);
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setError(null);
    onUploadStart?.();

    try {
      await uploadFile(selectedFile, {
        onSuccess: (jobId) => {
          showToast('success', 'File uploaded successfully! Processing started.');
          onUploadComplete?.(jobId);
        },
        onError: (errorMessage) => {
          setError(errorMessage);
          showToast('error', errorMessage);
          onUploadError?.(errorMessage);
        },
      });
    } catch {
      // Error already handled by hook
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
          ${isUploading ? 'pointer-events-none opacity-60' : 'cursor-pointer hover:border-blue-400'}
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!selectedFile && !isUploading ? handleBrowseClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {!selectedFile && !isUploading && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drag and drop your file here
              </p>
              <p className="text-sm text-gray-500 mt-1">or</p>
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleBrowseClick}
              >
                Browse Files
              </button>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Accepted formats: CSV, Excel (.xlsx, .xls)</p>
              <p>Maximum file size: 10 MB</p>
              <p>Maximum rows: {maxRows.toLocaleString()} (Free tier)</p>
              <p className="font-medium text-gray-700">
                Stories remaining this month: {storiesRemaining} / {user?.limits?.storiesPerMonth || 3}
              </p>
            </div>
          </div>
        )}

        {selectedFile && !isUploading && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg
                className="w-16 h-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleUpload}
              >
                Upload & Generate Story
              </button>
              <button
                type="button"
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                Uploading {selectedFile?.name}...
              </p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{uploadProgress}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {(error || uploadError) && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error || uploadError}</p>
              {storiesRemaining <= 0 && (
                <button
                  type="button"
                  className="mt-2 text-sm text-red-700 underline hover:text-red-900"
                  onClick={() => {
                    // TODO: Open upgrade modal
                    console.log('Open upgrade modal');
                  }}
                >
                  Upgrade to Professional
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

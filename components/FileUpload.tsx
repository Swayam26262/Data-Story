'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { useToast } from '@/components/Toast';
import { Upload, CheckCircle, FileText, X, RefreshCw } from 'lucide-react';

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
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxRows = user?.limits?.maxDatasetRows || 1000;
  const isUnlimitedStories = user?.limits?.storiesPerMonth === -1;
  const storiesRemaining = user
    ? isUnlimitedStories
      ? -1
      : user.limits.storiesPerMonth - user.storiesThisMonth
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

    // Check if user has stories remaining (unless unlimited)
    if (!isUnlimitedStories && storiesRemaining <= 0) {
      return `You've reached your monthly limit of ${user?.limits?.storiesPerMonth || 3} stories. Upgrade or wait until next month.`;
    }

    return null;
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading && !uploadSuccess) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the drop zone itself
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading && !uploadSuccess) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isUploading || uploadSuccess) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  // Touch event handlers for mobile drag-and-drop support
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isUploading && !uploadSuccess) {
      setIsDragging(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (isUploading || uploadSuccess) return;

    // Check if there are files in the touch event
    const touch = e.changedTouches[0];
    if (touch && fileInputRef.current) {
      // On mobile, we'll just trigger the file picker instead
      // since true drag-and-drop isn't well supported
      fileInputRef.current.click();
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
    setUploadSuccess(false);
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      showToast('error', validationError);
      return;
    }

    setSelectedFile(file);
  };

  const handleBrowseClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!isUploading && !uploadSuccess && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setError(null);
    setUploadSuccess(false);
    onUploadStart?.();

    try {
      await uploadFile(selectedFile, {
        onSuccess: (jobId) => {
          setUploadSuccess(true);
          showToast('success', 'File uploaded successfully! Processing started.');
          onUploadComplete?.(jobId);
          // Reset after 3 seconds
          setTimeout(() => {
            setUploadSuccess(false);
            setSelectedFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }, 3000);
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
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-300
          ${isDragging 
            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
            : 'border-[#2a2a2a] bg-[#0A0A0A]'
          }
          ${isUploading || uploadSuccess
            ? 'pointer-events-none' 
            : 'cursor-pointer hover:border-primary/50 hover:bg-[#111111]'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={!selectedFile && !isUploading && !uploadSuccess ? handleBrowseClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading || uploadSuccess}
          aria-label="File upload input"
        />

        {/* Initial State - No File Selected */}
        {!selectedFile && !isUploading && !uploadSuccess && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-primary/20' : 'bg-secondary/20'}`}>
                <Upload className={`w-12 h-12 transition-colors ${isDragging ? 'text-primary' : 'text-secondary'}`} />
              </div>
            </div>
            <div>
              <p className="text-base sm:text-lg font-medium text-white">
                <span className="hidden sm:inline">Drag and drop your file here</span>
                <span className="sm:hidden">Tap to upload your file</span>
              </p>
              <p className="text-sm text-[#A0A0A0] mt-2">or</p>
              <button
                type="button"
                className="mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-primary text-background-dark text-sm sm:text-base font-medium rounded-lg hover:bg-opacity-80 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50"
                onClick={handleBrowseClick}
              >
                Browse Files
              </button>
            </div>
            <div className="text-xs text-[#A0A0A0] space-y-1 pt-4 border-t border-white/10">
              <p>Accepted formats: CSV, Excel (.xlsx, .xls)</p>
              <p>Maximum file size: 10 MB</p>
              <p>Maximum rows: {maxRows.toLocaleString()}</p>
              <p className="font-medium text-[#D4D4D4] pt-2">
                Stories remaining this month:{' '}
                <span className="text-primary">
                  {isUnlimitedStories ? 'Unlimited' : storiesRemaining}
                </span>
                {!isUnlimitedStories && (
                  <> / {user?.limits?.storiesPerMonth || 3}</>
                )}
              </p>
            </div>
          </div>
        )}

        {/* File Selected State */}
        {selectedFile && !isUploading && !uploadSuccess && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/20">
                <FileText className="w-12 h-12 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-lg font-medium text-white">
                {selectedFile.name}
              </p>
              <p className="text-sm text-[#A0A0A0] mt-1">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-background-dark text-sm sm:text-base font-medium rounded-lg hover:bg-opacity-80 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50"
                onClick={handleUpload}
              >
                Upload & Generate Story
              </button>
              <button
                type="button"
                className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-secondary/50 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-white/5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary/50"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Uploading State */}
        {isUploading && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-secondary/30 border-t-primary"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
            <div>
              <p className="text-lg font-medium text-white">
                Uploading {selectedFile?.name}...
              </p>
              <div className="mt-4 w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300 shadow-lg shadow-primary/50"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-[#A0A0A0] mt-2">{uploadProgress}% complete</p>
            </div>
          </div>
        )}

        {/* Success State */}
        {uploadSuccess && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/20 animate-pulse">
                <CheckCircle className="w-12 h-12 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-lg font-medium text-white">
                Upload Successful!
              </p>
              <p className="text-sm text-[#A0A0A0] mt-2">
                Your file is being processed. You'll be redirected shortly.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {(error || uploadError) && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl animate-slideDown">
          <div className="flex items-start">
            <X className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">{error || uploadError}</p>
              {!isUnlimitedStories && storiesRemaining <= 0 ? (
                <button
                  type="button"
                  className="mt-2 text-sm text-red-400 underline hover:text-red-300 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500/50 rounded px-2 py-1"
                  onClick={() => {
                    // TODO: Open upgrade modal
                    console.log('Open upgrade modal');
                  }}
                >
                  Upgrade to Professional
                </button>
              ) : (
                <button
                  type="button"
                  className="mt-2 flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500/50 rounded px-2 py-1"
                  onClick={() => {
                    setError(null);
                    if (selectedFile) {
                      handleUpload();
                    }
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

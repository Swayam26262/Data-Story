'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

interface DragDropUploadProps {
  onFileSelect?: (file: File) => void;
  onUpload?: (file: File) => void;
  acceptedFormats?: string[];
  maxSizeMB?: number;
}

export default function DragDropUpload({
  onFileSelect,
  onUpload,
  acceptedFormats = ['.csv', '.xls', '.xlsx'],
  maxSizeMB = 10,
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      return `Please upload ${acceptedFormats.join(', ')} files only`;
    }

    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return `File size exceeds ${maxSizeMB} MB limit`;
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
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
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
      return;
    }

    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const handleBrowseClick = () => {
    if (!isUploading && !uploadSuccess && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setError(null);
    setIsUploading(true);

    try {
      await onUpload?.(selectedFile);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
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
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
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
        onClick={!selectedFile && !isUploading && !uploadSuccess ? handleBrowseClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading || uploadSuccess}
        />

        {/* Initial State */}
        {!selectedFile && !isUploading && !uploadSuccess && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className={`p-6 rounded-full transition-all ${isDragging ? 'bg-primary/20 scale-110' : 'bg-primary/10'}`}>
                <Upload className={`w-16 h-16 transition-colors ${isDragging ? 'text-primary' : 'text-primary/70'}`} />
              </div>
            </div>
            <div>
              <p className="text-xl font-semibold text-white mb-2">
                Drag and drop your file here
              </p>
              <p className="text-sm text-[#A0A0A0] mb-4">or</p>
              <button
                type="button"
                className="px-8 py-3 bg-primary text-background-dark text-base font-medium rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBrowseClick();
                }}
              >
                Browse Files
              </button>
            </div>
            <div className="text-xs text-[#A0A0A0] space-y-1 pt-6 border-t border-white/10">
              <p>Accepted formats: {acceptedFormats.join(', ')}</p>
              <p>Maximum file size: {maxSizeMB} MB</p>
            </div>
          </div>
        )}

        {/* File Selected State */}
        {selectedFile && !isUploading && !uploadSuccess && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-6 rounded-full bg-primary/20">
                <FileText className="w-16 h-16 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-xl font-semibold text-white mb-2">
                {selectedFile.name}
              </p>
              <p className="text-sm text-[#A0A0A0]">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                className="px-8 py-3 bg-primary text-background-dark text-base font-medium rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={handleUpload}
              >
                Upload & Generate Story
              </button>
              <button
                type="button"
                className="px-8 py-3 border-2 border-[#2a2a2a] text-white text-base font-medium rounded-lg hover:bg-white/5 transition-all duration-300"
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
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#2a2a2a] border-t-primary"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
              </div>
            </div>
            <div>
              <p className="text-xl font-semibold text-white mb-4">
                Uploading {selectedFile?.name}...
              </p>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div className="bg-primary h-3 rounded-full transition-all duration-300 shadow-lg shadow-primary/50 animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {uploadSuccess && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-6 rounded-full bg-primary/20 animate-pulse">
                <CheckCircle className="w-16 h-16 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-xl font-semibold text-white mb-2">
                Upload Successful!
              </p>
              <p className="text-sm text-[#A0A0A0]">
                Your file is being processed. You'll be redirected shortly.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl">
          <div className="flex items-start">
            <X className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium text-red-400">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

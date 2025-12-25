'use client';

import { useRef, useState } from 'react';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  uploadedFiles: string[];
  acceptedTypes?: string[];
}

export function FileUpload({
  onUpload,
  uploadedFiles,
  acceptedTypes = ['application/pdf', 'image/*', 'text/*'],
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    onUpload(fileArray);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50 scale-[1.02]'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <svg
          className="mx-auto h-16 w-16 text-gray-400 mb-6"
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

        <p className="text-gray-900 font-semibold mb-2 text-xl">
          Drop files here
        </p>
        <p className="text-gray-500 mb-4">
          or click to browse
        </p>
        <p className="text-gray-400 text-xs">
          PDF, PNG, or JPG files
        </p>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8 space-y-4">
          <p className="text-gray-600 text-sm font-medium mb-4">Uploaded files:</p>
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-green-50 rounded-2xl px-6 py-4 border-2 border-green-200"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-900 font-medium text-lg flex-1 truncate">
                {file.split('/').pop()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

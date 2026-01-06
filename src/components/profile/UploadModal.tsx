'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Placements } from '@/lib/utils/placements';
import styles from '@/app/dashboard/dashboard.module.css';

interface UploadModalProps {
  show: boolean;
  onClose: () => void;
  onComplete: (placements: Placements) => void;
  userId: string;
}

export default function UploadModal({ show, onClose, onComplete, userId }: UploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    const uploadedPaths: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileName = `${userId}/profile/${Date.now()}_${file.name}`;

        const { data, error } = await supabase.storage
          .from('user-uploads')
          .upload(fileName, file);

        if (error) {
          console.error('File upload error:', error);
          throw new Error(`Upload failed: ${error.message}`);
        }

        if (data) {
          // Save to database
          await supabase.from('uploaded_documents').insert({
            user_id: userId,
            session_id: null, // Profile uploads don't have a session
            file_name: file.name,
            storage_path: data.path,
            file_type: file.type,
            file_size: file.size,
            upload_purpose: 'profile_placements',
          });

          uploadedPaths.push(data.path);
        }
      }

      setUploadedFiles([...uploadedFiles, ...uploadedPaths]);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleExtract = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload at least one chart file');
      return;
    }

    setExtracting(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/placements/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePaths: uploadedFiles }),
      });

      if (!response.ok) {
        throw new Error('Extraction failed');
      }

      const data = await response.json();
      onComplete(data.placements);

      // Reset modal state
      setUploadedFiles([]);
      setError(null);
    } catch (err: any) {
      console.error('Extraction error:', err);
      setError(err.message || 'Failed to extract placements from charts');
    } finally {
      setExtracting(false);
    }
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

  const handleClose = () => {
    setUploadedFiles([]);
    setError(null);
    onClose();
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={handleClose}
    >
      <div
        className={styles.productCard}
        style={{
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            Upload Chart Data
          </h3>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(206, 190, 255, 0.7)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))',
              border: '1px solid rgba(252, 165, 165, 0.3)',
              color: '#fca5a5',
              fontSize: '0.9375rem',
            }}
          >
            {error}
          </div>
        )}

        <p style={{ color: 'rgba(206, 190, 255, 0.85)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
          Drag and drop your chart images here, or click to browse.
        </p>

        {/* File Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            position: 'relative',
            border: `2px dashed ${isDragging ? 'rgba(124, 58, 237, 0.6)' : 'rgba(206, 190, 255, 0.3)'}`,
            borderRadius: '16px',
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragging ? 'rgba(124, 58, 237, 0.1)' : 'rgba(93, 63, 211, 0.05)',
            transition: 'all 0.2s',
            marginBottom: '1.5rem',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: 'none' }}
          />

          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📁</div>
          <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            Drop files here
          </p>
          <p style={{ color: 'rgba(206, 190, 255, 0.7)', fontSize: '0.875rem' }}>
            or click to browse
          </p>
          <p style={{ color: 'rgba(179, 153, 255, 0.6)', fontSize: '0.75rem', marginTop: '1rem' }}>
            Supported: PNG, JPG, PDF (max 10MB each)
          </p>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: 'rgba(206, 190, 255, 0.9)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Uploaded files:
            </p>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.1))',
                  border: '1px solid rgba(110, 231, 183, 0.3)',
                  borderRadius: '10px',
                  marginBottom: '0.5rem',
                }}
              >
                <div
                  style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'rgba(34, 197, 94, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✓
                </div>
                <span style={{ color: '#6ee7b7', fontSize: '0.9375rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.split('/').pop()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleClose}
            disabled={uploading || extracting}
            className={styles.secondaryButton}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            onClick={handleExtract}
            disabled={uploadedFiles.length === 0 || uploading || extracting}
            className={styles.productButton}
            style={{ flex: 1 }}
          >
            {uploading ? 'Uploading...' : extracting ? 'Extracting...' : 'Extract Data'}
          </button>
        </div>
      </div>
    </div>
  );
}

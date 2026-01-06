'use client';

import { useState } from 'react';
import { Placements } from '@/lib/utils/placements';
import PlacementsDisplay from './PlacementsDisplay';
import UploadModal from './UploadModal';
import styles from '@/app/dashboard/dashboard.module.css';

interface ProfileEditorProps {
  initialPlacements: Placements | null;
  placementsConfirmed: boolean;
  placementsUpdatedAt: string | null;
  userId: string;
}

export default function ProfileEditor({
  initialPlacements,
  placementsConfirmed,
  placementsUpdatedAt,
  userId,
}: ProfileEditorProps) {
  const [placements, setPlacements] = useState<Placements | null>(initialPlacements);
  const [confirmed, setConfirmed] = useState(placementsConfirmed);
  const [updatedAt, setUpdatedAt] = useState(placementsUpdatedAt);
  const [editMode, setEditMode] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (newPlacements: Placements) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placements: newPlacements, confirmed: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to save placements');
      }

      const data = await response.json();
      setPlacements(data.placements);
      setConfirmed(data.placements_confirmed);
      setUpdatedAt(data.placements_updated_at);
      setEditMode(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving placements:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save changes' });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear all your chart data? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile/placements', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear placements');
      }

      setPlacements(null);
      setConfirmed(false);
      setUpdatedAt(null);
      setMessage({ type: 'success', text: 'Chart data cleared' });

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error clearing placements:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to clear data' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (extractedPlacements: Placements) => {
    setPlacements(extractedPlacements);
    setShowUploadModal(false);
    setEditMode(true); // Allow user to review/edit before saving
  };

  // Empty state
  if (!placements) {
    return (
      <>
        <div className={styles.emptyState}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📊</div>
          <p>No chart data yet</p>
          <p style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
            Upload your astrology and Human Design charts to get started.
            <br />
            This data will be used across all your products.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className={styles.browseButton}
            style={{ marginTop: '1.5rem' }}
          >
            + Add Chart Data
          </button>
        </div>

        <UploadModal
          show={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onComplete={handleUploadComplete}
          userId={userId}
        />
      </>
    );
  }

  // View/Edit mode
  return (
    <>
      {message && (
        <div
          style={{
            marginBottom: '2rem',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            background:
              message.type === 'success'
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))',
            border:
              message.type === 'success'
                ? '1px solid rgba(110, 231, 183, 0.3)'
                : '1px solid rgba(252, 165, 165, 0.3)',
            color: message.type === 'success' ? '#6ee7b7' : '#fca5a5',
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'rgba(206, 190, 255, 0.7)', fontSize: '0.9375rem' }}>
          {updatedAt && (
            <>Last updated: {new Date(updatedAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}</>
          )}
        </div>
      </div>

      <PlacementsDisplay
        placements={placements}
        editMode={editMode}
        onSave={handleSave}
        loading={loading}
      />

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className={styles.productButton}
            style={{ flex: '1', minWidth: '200px' }}
          >
            ✏️ Edit Placements
          </button>
        )}
        <button
          onClick={() => setShowUploadModal(true)}
          className={styles.secondaryButton}
          style={{ flex: '1', minWidth: '200px' }}
        >
          📁 Upload New Charts
        </button>
        <button
          onClick={handleClear}
          className={styles.secondaryButton}
          style={{ flex: '1', minWidth: '200px' }}
          disabled={loading}
        >
          🗑️ Clear Data
        </button>
      </div>

      <UploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onComplete={handleUploadComplete}
        userId={userId}
      />
    </>
  );
}

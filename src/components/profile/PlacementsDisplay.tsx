'use client';

import { useState } from 'react';
import { Placements } from '@/lib/utils/placements';
import styles from '@/app/dashboard/dashboard.module.css';

interface PlacementsDisplayProps {
  placements: Placements;
  editMode: boolean;
  onSave: (placements: Placements) => void;
  loading?: boolean;
}

export default function PlacementsDisplay({
  placements,
  editMode,
  onSave,
  loading = false,
}: PlacementsDisplayProps) {
  const [editedPlacements, setEditedPlacements] = useState<Placements>(placements);

  const handleFieldChange = (
    section: 'astrology' | 'human_design',
    field: string,
    value: string
  ) => {
    setEditedPlacements((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(editedPlacements);
  };

  const handleCancel = () => {
    setEditedPlacements(placements);
  };

  const astro = editMode ? editedPlacements.astrology || {} : placements.astrology || {};
  const hd = editMode ? editedPlacements.human_design || {} : placements.human_design || {};

  const astroFields = [
    { key: 'sun', label: 'Sun' },
    { key: 'moon', label: 'Moon' },
    { key: 'rising', label: 'Rising' },
    { key: 'mercury', label: 'Mercury' },
    { key: 'venus', label: 'Venus' },
    { key: 'mars', label: 'Mars' },
    { key: 'jupiter', label: 'Jupiter' },
    { key: 'saturn', label: 'Saturn' },
    { key: 'uranus', label: 'Uranus' },
    { key: 'neptune', label: 'Neptune' },
    { key: 'pluto', label: 'Pluto' },
    { key: 'houses', label: 'Houses' },
  ];

  const hdFields = [
    { key: 'type', label: 'Type' },
    { key: 'strategy', label: 'Strategy' },
    { key: 'authority', label: 'Authority' },
    { key: 'profile', label: 'Profile' },
    { key: 'centers', label: 'Centers' },
    { key: 'gifts', label: 'Gifts' },
  ];

  const renderField = (
    section: 'astrology' | 'human_design',
    field: { key: string; label: string },
    value: string | undefined
  ) => {
    const displayValue = value || 'UNKNOWN';
    const isUnknown = !value || displayValue.trim().toUpperCase() === 'UNKNOWN';

    if (editMode) {
      return (
        <div key={field.key} style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              color: 'rgba(206, 190, 255, 0.9)',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
            }}
          >
            {field.label}
          </label>
          <input
            type="text"
            value={editMode ? (editedPlacements[section]?.[field.key as keyof typeof editedPlacements.astrology] || '') : displayValue}
            onChange={(e) => handleFieldChange(section, field.key, e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'rgba(93, 63, 211, 0.1)',
              border: '1px solid rgba(206, 190, 255, 0.3)',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '0.9375rem',
              fontFamily: 'inherit',
            }}
            placeholder={field.label}
          />
        </div>
      );
    }

    return (
      <div
        key={field.key}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 0',
          borderBottom: '1px solid rgba(206, 190, 255, 0.1)',
        }}
      >
        <span style={{ color: 'rgba(206, 190, 255, 0.9)', fontWeight: 600, fontSize: '0.9375rem' }}>
          {field.label}:
        </span>
        <span
          style={{
            color: isUnknown ? 'rgba(252, 165, 165, 0.8)' : '#ffffff',
            fontSize: '0.9375rem',
            textAlign: 'right',
            fontFamily: 'monospace',
          }}
        >
          {displayValue}
        </span>
      </div>
    );
  };

  return (
    <>
      {/* Astrology Section */}
      <div className={styles.productCard} style={{ marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#ffffff', fontSize: '1.375rem', fontWeight: 700, margin: 0 }}>
            Astrology
          </h3>
        </div>
        <div style={{ paddingTop: '0.5rem' }}>
          {astroFields.map((field) => renderField('astrology', field, astro[field.key as keyof typeof astro]))}
        </div>
      </div>

      {/* Human Design Section */}
      <div className={styles.productCard} style={{ marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#ffffff', fontSize: '1.375rem', fontWeight: 700, margin: 0 }}>
            Human Design
          </h3>
        </div>
        <div style={{ paddingTop: '0.5rem' }}>
          {hdFields.map((field) => renderField('human_design', field, hd[field.key as keyof typeof hd]))}
        </div>
      </div>

      {/* Save/Cancel buttons in edit mode */}
      {editMode && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            onClick={handleSave}
            disabled={loading}
            className={styles.productButton}
            style={{ flex: 1 }}
          >
            {loading ? 'Saving...' : '✓ Save Changes'}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className={styles.secondaryButton}
            style={{ flex: 1 }}
          >
            ✕ Cancel
          </button>
        </div>
      )}
    </>
  );
}

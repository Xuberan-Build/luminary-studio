'use client';

import { useState } from 'react';
import styles from './SessionVersionManager.module.css';

interface SessionVersion {
  session_id: string;
  version: number;
  is_complete: boolean;
  completed_at: string | null;
  created_at: string;
  is_latest: boolean;
  has_deliverable: boolean;
}

interface Props {
  sessionId: string;
  productSlug: string;
  attemptsRemaining: number;
  createNewVersionAction: (formData: FormData) => Promise<void>;
}

export default function SessionVersionManager({
  sessionId,
  productSlug,
  attemptsRemaining,
  createNewVersionAction,
}: Props) {
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState<SessionVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadVersionHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/sessions/get-versions?productSlug=${productSlug}`
      );
      const data = await response.json();
      setVersions(data.versions || []);
      setShowVersionHistory(true);
    } catch (error) {
      console.error('Error loading version history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewVersion = async () => {
    if (attemptsRemaining <= 0) {
      alert(
        'You have used all free attempts. Purchase additional sessions to continue.'
      );
      return;
    }

    const confirmed = confirm(
      `Start a new version? This will create a fresh session while keeping your current results.\n\nAttempts remaining: ${attemptsRemaining - 1}`
    );

    if (!confirmed) return;

    const formData = new FormData();
    formData.append('productSlug', productSlug);
    formData.append('parentSessionId', sessionId);

    await createNewVersionAction(formData);
  };

  return (
    <div className={styles.container}>
      <button
        onClick={loadVersionHistory}
        className={styles.versionHistoryButton}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'View All Versions'}
      </button>

      {attemptsRemaining > 0 && (
        <button
          onClick={handleCreateNewVersion}
          className={styles.newVersionButton}
        >
          Start New Version ({attemptsRemaining} left)
        </button>
      )}

      {showVersionHistory && (
        <div
          className={styles.modal}
          onClick={() => setShowVersionHistory(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Version History</h3>
              <button
                onClick={() => setShowVersionHistory(false)}
                className={styles.closeButton}
              >
                ✕
              </button>
            </div>

            <div className={styles.versionList}>
              {versions.length === 0 ? (
                <p className={styles.emptyState}>No versions found</p>
              ) : (
                versions.map((v) => (
                  <div
                    key={v.session_id}
                    className={`${styles.versionItem} ${
                      v.is_latest ? styles.latestVersion : ''
                    }`}
                  >
                    <div className={styles.versionInfo}>
                      <div className={styles.versionHeader}>
                        <span className={styles.versionNumber}>
                          Version {v.version}
                        </span>
                        {v.is_latest && (
                          <span className={styles.latestBadge}>Current</span>
                        )}
                        {v.is_complete && (
                          <span className={styles.completeBadge}>
                            Complete
                          </span>
                        )}
                      </div>
                      <p className={styles.versionDate}>
                        Created: {new Date(v.created_at).toLocaleDateString()}
                      </p>
                      {v.completed_at && (
                        <p className={styles.versionDate}>
                          Completed:{' '}
                          {new Date(v.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className={styles.versionActions}>
                      <a
                        href={`/dashboard/sessions/${v.session_id}`}
                        className={styles.viewButton}
                      >
                        {v.has_deliverable
                          ? 'View Deliverable'
                          : 'View Session'}
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={styles.modalFooter}>
              <p className={styles.attemptsInfo}>
                Free attempts used: {2 - attemptsRemaining}/2
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

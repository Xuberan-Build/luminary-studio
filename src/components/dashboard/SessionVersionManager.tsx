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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowVersionHistory(false)}
        >
          <div
            className="relative w-full max-w-2xl mx-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-2xl font-bold text-white">Version History</h3>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Version List */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {versions.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No versions found</p>
              ) : (
                <div className="space-y-4">
                  {versions.map((v) => (
                    <div
                      key={v.session_id}
                      className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-semibold text-white">
                              Version {v.version}
                            </span>
                            {v.is_latest && (
                              <span className="px-2 py-1 text-xs font-medium bg-teal-500/20 text-teal-300 rounded-md">
                                Current
                              </span>
                            )}
                            {v.is_complete && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-300 rounded-md">
                                Complete
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            Created: {new Date(v.created_at).toLocaleDateString()}
                          </p>
                          {v.completed_at && (
                            <p className="text-sm text-gray-400">
                              Completed: {new Date(v.completed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <a
                          href={`/dashboard/sessions/${v.session_id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-violet-500 hover:to-purple-500 transition-all"
                        >
                          {v.has_deliverable ? 'View Deliverable' : 'View Session'}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {attemptsRemaining >= 0 && attemptsRemaining < 1000 && (
              <div className="p-6 border-t border-white/10">
                <p className="text-sm text-gray-400 text-center">
                  {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

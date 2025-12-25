'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetSessionButton({
  sessionId,
  productSlug
}: {
  sessionId: string;
  productSlug: string;
}) {
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset this session? This will allow you to go through the experience again from the beginning.')) {
      return;
    }

    setIsResetting(true);

    try {
      const response = await fetch('/api/reset-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productSlug }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset session');
      }

      alert('Session reset successfully! Redirecting to experience...');
      router.push(`/products/${productSlug}/experience`);
      router.refresh();
    } catch (error: any) {
      console.error('Reset error:', error);
      alert(error.message || 'Failed to reset session');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={isResetting}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        fontSize: '14px',
        fontWeight: '600',
        cursor: isResetting ? 'not-allowed' : 'pointer',
        opacity: isResetting ? 0.5 : 1,
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!isResetting) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
      }}
    >
      {isResetting ? 'Resetting...' : '↻ Reset Session'}
    </button>
  );
}

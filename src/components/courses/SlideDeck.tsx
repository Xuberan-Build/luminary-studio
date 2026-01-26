'use client';

import type { RefObject } from 'react';
import styles from './slide-deck.module.css';

type SlideDeckProps = {
  moduleId: string;
  submoduleId?: string | null;
  startCoords?: string | null;
  iframeRef?: RefObject<HTMLIFrameElement | null>;
  title?: string;
};

export default function SlideDeck({ moduleId, submoduleId, startCoords, iframeRef, title }: SlideDeckProps) {
  const baseUrl = process.env.NEXT_PUBLIC_VCAP_SLIDES_URL || 'https://vcap-slides.vercel.app';
  const embedVersion = process.env.NEXT_PUBLIC_VCAP_SLIDES_VERSION || 'v1';
  const params = new URLSearchParams();

  if (moduleId) params.set('module', moduleId);
  if (submoduleId) params.set('submodule', submoduleId);
  if (startCoords) params.set('coords', startCoords);
  params.set('embed', '1');
  params.set('v', embedVersion);

  const iframeSrc = `${baseUrl}/?${params.toString()}`;
  const iframeKey = `${moduleId}:${submoduleId || ''}:${startCoords || ''}`;

  return (
    <div className={styles.wrapper}>
      <iframe
        key={iframeKey}
        src={iframeSrc}
        className={styles.iframe}
        title={title || 'VCAP Slide Deck'}
        allow="fullscreen"
        ref={iframeRef}
      />
    </div>
  );
}

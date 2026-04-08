'use client';

import { useEffect, useState } from 'react';

export default function LoadingScreen({
  images,
  onDone,
}: {
  images: string[];
  onDone: () => void;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Filter to non-empty, deduplicated URLs
    const urls = [...new Set(images.filter(Boolean))];
    if (urls.length === 0) {
      setProgress(100);
      setTimeout(onDone, 380);
      return;
    }

    let loaded = 0;

    function onLoad() {
      loaded += 1;
      const pct = Math.round((loaded / urls.length) * 100);
      setProgress(pct);
      if (loaded === urls.length) {
        setTimeout(onDone, 380);
      }
    }

    urls.forEach((src) => {
      const img = new window.Image();
      img.onload = onLoad;
      img.onerror = onLoad; // count errors so we never get stuck
      img.src = src;
      // If browser already cached it, onload may not fire — force it
      if (img.complete) onLoad();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.1rem',
        transition: 'opacity 360ms ease',
        opacity: progress === 100 ? 0 : 1,
        pointerEvents: progress === 100 ? 'none' : 'all',
      }}
    >
      {/* Percentage */}
      <span
        style={{
          fontFamily: 'var(--font-display), sans-serif',
          fontSize: '0.78rem',
          letterSpacing: '0.18em',
          color: 'rgba(255,225,205,0.55)',
          fontVariantNumeric: 'tabular-nums',
          minWidth: '3ch',
          textAlign: 'center',
        }}
      >
        {progress}%
      </span>

      {/* Track */}
      <div
        style={{
          width: 'min(340px, 72vw)',
          height: 1,
          background: 'rgba(255,225,205,0.12)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        {/* Fill */}
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: '#FFE1CD',
            borderRadius: 999,
            transition: 'width 80ms linear',
          }}
        />
      </div>
    </div>
  );
}

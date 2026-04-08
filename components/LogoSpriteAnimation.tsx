'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';

const FRAME_COUNT = 48;
const MIN_DURATION = 30;  // ms per frame at fastest (middle)
const MAX_DURATION = 160; // ms per frame at slowest (endpoints)

// Build ordered list of frame paths
const frames = Array.from({ length: FRAME_COUNT }, (_, i) => {
  const num = String(i + 1).padStart(4, '0');
  return `/logo-sprite/${num}.png`;
});

// Compute per-frame duration with ease-in-out (slow at edges, fast in middle)
function getFrameDuration(frame: number): number {
  const t = frame / (FRAME_COUNT - 1);
  const ease = (1 - Math.cos(t * 2 * Math.PI)) / 2;
  return MIN_DURATION + ease * (MAX_DURATION - MIN_DURATION);
}

export default function LogoSpriteAnimation({ className = '' }: { className?: string }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const currentFrameRef = useRef(0);
  const directionRef = useRef<1 | -1>(1);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const [loaded, setLoaded] = useState(false);

  // Preload all images
  useEffect(() => {
    let cancelled = false;
    const imgs = frames.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new window.Image();
          img.src = src;
          img.onload = () => resolve();
          img.onerror = () => resolve(); // don't block on error
        })
    );
    Promise.all(imgs).then(() => {
      if (!cancelled) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const animate = useCallback((time: number) => {
    const frameDuration = getFrameDuration(currentFrameRef.current);
    if (time - lastTimeRef.current >= frameDuration) {
      lastTimeRef.current = time;
      setCurrentFrame((prev) => {
        let next = prev + directionRef.current * 2;
        if (next >= FRAME_COUNT - 1) {
          next = FRAME_COUNT - 1;
          directionRef.current = -1;
        } else if (next <= 0) {
          next = 0;
          directionRef.current = 1;
        }
        currentFrameRef.current = next;
        return next;
      });
    }
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [loaded, animate]);

  if (!loaded) return null;

  return (
    <div className={className}>
      <Image
        src={frames[currentFrame]}
        alt="Lucid logo animation"
        width={300}
        height={300}
        priority
        unoptimized
      />
    </div>
  );
}

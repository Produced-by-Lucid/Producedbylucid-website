'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import { PiArrowUpRightLight } from "react-icons/pi";

interface FollowMouseDragProps {
  targetRef: RefObject<HTMLElement | null>;
  label?: string;
}

export default function FollowMouseDrag({ targetRef, label = 'DRAG' }: FollowMouseDragProps) {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    const cursor = cursorRef.current;
    if (!target || !cursor) return;

    // Use fixed positioning relative to the viewport
    gsap.set(cursor, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.9, position: 'fixed', top: 0, left: 0 });
    
    const moveX = gsap.quickTo(cursor, 'x', { duration: 0.1, ease: 'none' });
    const moveY = gsap.quickTo(cursor, 'y', { duration: 0.1, ease: 'none' });

    const handleEnter = (event: MouseEvent) => {
      target.classList.add('cursor-none');
      gsap.set(cursor, { x: event.clientX, y: event.clientY });
      gsap.to(cursor, { autoAlpha: 1, scale: 1, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
    };

    const handleMove = (event: MouseEvent) => {
      moveX(event.clientX);
      moveY(event.clientY);
    };

    const handleLeave = () => {
      target.classList.remove('cursor-none');
      gsap.to(cursor, { autoAlpha: 0, scale: 0.92, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
    };

    target.addEventListener('mouseenter', handleEnter);
    target.addEventListener('mousemove', handleMove);
    target.addEventListener('mouseleave', handleLeave);

    return () => {
      target.classList.remove('cursor-none');
      target.removeEventListener('mouseenter', handleEnter);
      target.removeEventListener('mousemove', handleMove);
      target.removeEventListener('mouseleave', handleLeave);
    };
  }, [targetRef]);

  return (
    <div
      ref={cursorRef}
      className="fixed left-0 -top-[50%] pointer-events-none z-[100] flex items-center gap-2 rounded-full border border-white/55 bg-[#eb5510] px-6 py-4 text-xl font-semibold tracking-[0.2em] text-white backdrop-blur-md"
    >
      {label}
      <PiArrowUpRightLight className="text-2xl" />
    </div>
  );
}

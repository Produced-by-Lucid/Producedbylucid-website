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

    // Keep positioning in viewport coordinates so the element can be centered exactly.
    gsap.set(cursor, { autoAlpha: 0, scale: 0.9, position: 'fixed', top: 0, left: 0, x: 0, y: 0 });

    const moveX = gsap.quickTo(cursor, 'x', { duration: 0.08, ease: 'power2.out' });
    const moveY = gsap.quickTo(cursor, 'y', { duration: 0.08, ease: 'power2.out' });

    const moveToPointerCenter = (clientX: number, clientY: number) => {
      const { width, height } = cursor.getBoundingClientRect();
      moveX(clientX - width / 2);
      moveY(clientY - height / 2);
    };

    const handleEnter = (event: MouseEvent) => {
      target.classList.add('cursor-none');
      const { width, height } = cursor.getBoundingClientRect();
      gsap.set(cursor, { x: event.clientX - width / 2, y: event.clientY - height / 2 });
      gsap.to(cursor, { autoAlpha: 1, scale: 1, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
    };

    const handleMove = (event: MouseEvent) => {
      moveToPointerCenter(event.clientX, event.clientY);
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
      className="fixed top-0 left-0 pointer-events-none z-100 flex items-center gap-2 rounded-full border border-white/55 bg-[#eb5510] px-6 py-4 text-xl font-semibold tracking-[0.2em] text-white backdrop-blur-md"
    >
      {label}
      <PiArrowUpRightLight className="text-2xl" />
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import { PiArrowUpRightLight } from "react-icons/pi";

interface FollowMouseDragProps {
  targetRef: RefObject<HTMLElement | null>;
  hoverTargetSelector?: string;
  label?: string;
  showIcon?: boolean;
  enabled?: boolean;
}

export default function FollowMouseDrag({
  targetRef,
  hoverTargetSelector,
  label = 'DRAG',
  showIcon = true,
  enabled = true,
}: FollowMouseDragProps) {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    const cursor = cursorRef.current;
    if (!target || !cursor || !enabled) return;

    // Keep positioning in viewport coordinates so the element can be centered exactly.
    gsap.set(cursor, { autoAlpha: 0, scale: 0.9, position: 'fixed', top: 0, left: 0, x: 0, y: 0 });

    const moveX = gsap.quickTo(cursor, 'x', { duration: 0.08, ease: 'power2.out' });
    const moveY = gsap.quickTo(cursor, 'y', { duration: 0.08, ease: 'power2.out' });

    const moveToPointerCenter = (clientX: number, clientY: number) => {
      const { width, height } = cursor.getBoundingClientRect();
      moveX(clientX - width / 2);
      moveY(clientY - height / 2);
    };

    const hoverTargets = hoverTargetSelector
      ? Array.from(target.querySelectorAll<HTMLElement>(hoverTargetSelector))
      : [target];

    const isFullyInViewport = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
    };

    const handleEnter = (event: MouseEvent) => {
      const currentTarget = event.currentTarget as HTMLElement;
      if (!isFullyInViewport(currentTarget)) {
        return;
      }
      currentTarget.classList.add('cursor-none');
      const { width, height } = cursor.getBoundingClientRect();
      gsap.set(cursor, { x: event.clientX - width / 2, y: event.clientY - height / 2 });
      gsap.to(cursor, { autoAlpha: 1, scale: 1, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
    };

    const handleMove = (event: MouseEvent) => {
      moveToPointerCenter(event.clientX, event.clientY);
    };

    const handleLeave = (event: MouseEvent) => {
      const currentTarget = event.currentTarget as HTMLElement;
      currentTarget.classList.remove('cursor-none');
      gsap.to(cursor, { autoAlpha: 0, scale: 0.92, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
    };

    hoverTargets.forEach((element) => {
      element.addEventListener('mouseenter', handleEnter);
      element.addEventListener('mousemove', handleMove);
      element.addEventListener('mouseleave', handleLeave);
    });

    return () => {
      hoverTargets.forEach((element) => {
        element.classList.remove('cursor-none');
        element.removeEventListener('mouseenter', handleEnter);
        element.removeEventListener('mousemove', handleMove);
        element.removeEventListener('mouseleave', handleLeave);
      });
    };
  }, [targetRef, hoverTargetSelector, enabled]);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-100 flex items-center gap-2 rounded-full border border-white/55 bg-[#eb5510] px-6 py-4 text-xl font-semibold tracking-[0.2em] text-white backdrop-blur-md"
    >
      {label}
      {showIcon && <PiArrowUpRightLight className="text-2xl" />}
    </div>
  );
}

'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type SectionsInViewMotionProps = {
  children: ReactNode;
  className?: string;
};

export default function SectionsInViewMotion({ children, className }: SectionsInViewMotionProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>('section', wrapper);

      sections.forEach((section) => {
        const sectionChildren = Array.from(section.children) as HTMLElement[];
        if (!sectionChildren.length) return;

        gsap.fromTo(
          sectionChildren,
          {
            autoAlpha: 0,
            x: (index) => (index % 2 === 0 ? -56 : 56),
            y: 22,
          },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: 'power3.out',
            overwrite: 'auto',
            scrollTrigger: {
              trigger: section,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, wrapper);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={wrapperRef} className={className}>
      {children}
    </div>
  );
}

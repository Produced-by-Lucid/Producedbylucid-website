'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

const projectCards = [
  { image: '/slider-imgs/pr-img-1.png', title: 'Beyond Borders 2025' },
  { image: '/slider-imgs/pr-img-2.png', title: 'Corporate Event Gala' },
  { image: '/slider-imgs/prl-img-3.png', title: 'Brand Launch Experience' },
  { image: '/slider-imgs/pr-img-1.png', title: 'Technology Expo Showcase' },
  { image: '/slider-imgs/pr-img-2.png', title: 'Product Reveal Moment' },
];

// Infinite motion tuning: lower value = slower, subtler loop.
const TRACK_DRIFT_PX_PER_SECOND = 6;

export default function ProjectsPerspective() {
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSegmentRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const segmentWidthRef = useRef(0);
  const xRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const centerIndex = Math.floor(projectCards.length / 2);

  useEffect(() => {
    const track = trackRef.current;
    const firstSegment = firstSegmentRef.current;
    if (!track || !firstSegment) return;

    const applyWrap = () => {
      const loopWidth = segmentWidthRef.current;
      if (!loopWidth) return;
      xRef.current = ((xRef.current % loopWidth) + loopWidth) % loopWidth;
      if (xRef.current > 0) {
        xRef.current -= loopWidth;
      }
    };

    const setTrackX = () => {
      track.style.transform = `translate3d(${xRef.current.toFixed(2)}px, 0, 0)`;
    };

    const measure = () => {
      segmentWidthRef.current = firstSegment.getBoundingClientRect().width;
      applyWrap();
      setTrackX();
    };

    const loop = (time: number) => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = time;
      }
      const deltaSec = Math.min(0.06, (time - lastFrameTimeRef.current) / 1000);
      lastFrameTimeRef.current = time;
      xRef.current -= TRACK_DRIFT_PX_PER_SECOND * deltaSec;
      applyWrap();
      setTrackX();
      rafRef.current = requestAnimationFrame(loop);
    };

    measure();
    rafRef.current = requestAnimationFrame(loop);
    window.addEventListener('resize', measure);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      lastFrameTimeRef.current = null;
      window.removeEventListener('resize', measure);
    };
  }, []);

  const renderCard = (card: (typeof projectCards)[number], index: number, keyPrefix: string) => {
    const distanceFromCenter = index - centerIndex;
    const rotateY = distanceFromCenter * -10;
    const translateZ = distanceFromCenter === 0 ? 60 : -Math.abs(distanceFromCenter) * 3;
    const translateY = Math.abs(distanceFromCenter) * 20;
    const scale = distanceFromCenter === 0 ? 1.05 : 1;

    return (
      <article
        key={`${keyPrefix}-${card.title}-${index}`}
        className="relative h-[190px] w-[150px] shrink-0 overflow-hidden rounded-2xl border bg-white shadow-[0_16px_28px_rgba(0,0,0,0.16)] sm:h-[230px] sm:w-[190px] md:h-[260px] md:w-[320px]"
        style={{
          transform: `translate3d(0, ${translateY}px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
          transformStyle: 'preserve-3d',
        }}
      >
        <Image
          src={card.image}
          alt={card.title}
          fill
          draggable={false}
          className="select-none object-cover"
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 190px, 150px"
        />
      </article>
    );
  };

  return (
    <section
      id="projects"
      className="relative flex min-h-[72vh] items-center justify-center overflow-hidden px-4 py-20 sm:px-8"
    >
      <div className="w-full ">
        <p className="section-title-text mb-12 text-center text-xs font-semibold uppercase tracking-[0.45em] text-[#1b5e3f] sm:text-sm sm:tracking-[0.8em]">
          Featured Works
        </p>

        {/* Perspective stage + seamless duplicated track for infinite slow drift. */}
        <div
          className="mx-auto w-full overflow-hidden"
          style={{ perspective: '1400px', transformStyle: 'preserve-3d' }}
        >
          <div ref={trackRef} className="flex w-max items-end">
            <div
              ref={firstSegmentRef}
              className="flex shrink-0 items-end gap-3 pr-3 sm:gap-5 sm:pr-5 md:gap-6 md:pr-6"
            >
              {projectCards.map((card, index) => renderCard(card, index, 'main'))}
            </div>
            <div
              className="flex  shrink-0 items-end gap-3 pr-3 sm:gap-5 sm:pr-5 md:gap-6 md:pr-6"
              aria-hidden="true"
            >
              {projectCards.map((card, index) => renderCard(card, index, 'dup'))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

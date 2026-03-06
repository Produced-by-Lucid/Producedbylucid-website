'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

// ===== Section: Project Data =====
const projectCards = [
  {
    image: '/slider-imgs/pr-img-1.png',
    company: 'Oscafest',
    title: 'Beyond Borders 2025',
  },
  {
    image: '/slider-imgs/pr-img-2.png',
    company: 'Acme Corp',
    title: 'Corporate Event Gala',
  },
  {
    image: '/slider-imgs/prl-img-3.png',
    company: 'BrandCo',
    title: 'Brand Launch Experience',
  },
  {
    image: '/slider-imgs/pr-img-1.png',
    company: 'ExpoTech',
    title: 'Technology Expo Showcase',
  },
  {
    image: '/slider-imgs/pr-img-2.png',
    company: 'LuxWeds',
    title: 'Luxury Wedding Production',
  },
  {
    image: '/slider-imgs/prl-img-3.png',
    company: 'FestBuild',
    title: 'Festival Stage Build',
  },
  {
    image: '/slider-imgs/pr-img-1.png',
    company: 'CultureHub',
    title: 'Community Cultural Night',
  },
  {
    image: '/slider-imgs/pr-img-2.png',
    company: 'RevealIt',
    title: 'Product Reveal Moment',
  },
];

// Motion tuning:
// AUTO_ADVANCE_MS controls how often the automatic "arrow-click" nudge runs.
// AUTO_NUDGE_* controls auto/infinite motion feel.
// MANUAL_NUDGE_* controls arrow-click feel.
const AUTO_ADVANCE_MS = 3000;
const AUTO_NUDGE_DURATION_S = 1.2;
const AUTO_NUDGE_EASE = 'sine.inOut';
const MANUAL_NUDGE_DURATION_S = 0.65;
const MANUAL_NUDGE_EASE = 'power3.out';
const NUDGE_STEP_RATIO = 0.95;
// Initial load reveal tuning (subtle entrance motion).
const ENTRY_OFFSET_RATIO = 0.42;
const ENTRY_DURATION_S = 1.25;
const ENTRY_EASE = 'sine.out';
const ENTRY_STAGGER_S = 0.06;
const ENTRY_DELAY_S = 0.1;

// Center emphasis tuning:
// CENTER_WIDTH_BOOST widens only the active center card media (0.15 = +15%).
// CENTER_HEIGHT_BOOST increases center card height without affecting layout flow.
const FOCUS_FALLOFF = 1.55;
const CENTER_WIDTH_BOOST = 0.15;
const CENTER_HEIGHT_BOOST = 0.12;
// Fall-off controllers:
// DISTANCE_STEP_SCALE_DECAY removes this much scale per "card step" away from center.
// Example with 0.02: 1 step away = 2% smaller, 3 steps away = 6% smaller.
// MIN_CARD_SCALE is a hard floor to prevent far cards getting too tiny.
// Reference-style slope: stronger progressive drop-off from the center card.
// 0.08 means: 1 step away = 8% smaller, 3 steps away = 24% smaller.
const DISTANCE_STEP_SCALE_DECAY = 0.08;
const MIN_CARD_SCALE = 0.64;

// Card style tuning:
// CARD_HOVER_MOTION_CLASSES controls hover raise + horizontal spread.
// TRACK_* controls equal spacing between cards across both loop segments.
const CARD_WIDTH_CLASSES = 'w-[58vw] sm:w-[15rem] md:w-[17rem] lg:w-[18rem]';
const CARD_HOVER_MOTION_CLASSES = 'transition-[margin,transform] duration-500 ease-[cubic-bezier(0.22,1.4,0.36,1)] group-hover:mx-4 group-hover:-translate-y-4';
const CARD_IMAGE_HEIGHT_CLASSES = 'h-[40vh] sm:h-[46vh]';
const TRACK_GAP_CLASSES = 'gap-8 sm:gap-10 lg:gap-12';
const TRACK_PAD_CLASSES = 'pr-8 sm:pr-10 lg:pr-12';
// Drag inertia tuning:
// Increase INERTIA_THROW_SECONDS for a longer glide after release.
// Increase MAX_INERTIA_THROW_PX to allow larger fling distance.
// Increase INERTIA_MIN_VELOCITY_PX_PER_S to require stronger swipe before glide starts.
const INERTIA_THROW_SECONDS = 0.32;
const MAX_INERTIA_THROW_PX = 320;
const INERTIA_MIN_VELOCITY_PX_PER_S = 35;
const INERTIA_EASE = 'power3.out';
// Drag response delay tuning:
// Small delay before drag movement starts (helps avoid instant/snappy pickup).
const DRAG_RESPONSE_DELAY_MS = 45;

export default function ProjectsCenterLoop() {
  // ===== Section: Refs / Runtime State =====
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSegmentRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const xRef = useRef(0);
  const segmentWidthRef = useRef(0);
  const cardStepPxRef = useRef(1);
  const isDraggingRef = useRef(false);
  const isInteractingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const lastPointerXRef = useRef(0);
  const centerIndexRef = useRef(-1);
  const nudgeTweenRef = useRef<gsap.core.Tween | null>(null);
  const inertiaTweenRef = useRef<gsap.core.Tween | null>(null);
  const isNudgingRef = useRef(false);
  const dragVelocityRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const dragStartTimeRef = useRef(0);
  const cards = useMemo(() => projectCards, []);

  // ===== Section: Core Motion Helpers =====
  // Core movement function used by both auto motion and arrow-click motion.
  // Tune nudge distance with NUDGE_STEP_RATIO and motion feel with AUTO/MANUAL constants.
  const performNudge = (direction: 1 | -1, mode: 'auto' | 'manual' = 'manual') => {
    if (isDraggingRef.current || isNudgingRef.current || isInteractingRef.current) return;
    const sample = itemRefs.current.find((item) => item !== null);
    if (!sample) return;
    // Nudge distance as a ratio of one card width.
    const step = sample.offsetWidth * NUDGE_STEP_RATIO;
    const state = { x: xRef.current };
    const targetX = xRef.current - direction * step;
    const duration = mode === 'auto' ? AUTO_NUDGE_DURATION_S : MANUAL_NUDGE_DURATION_S;
    const ease = mode === 'auto' ? AUTO_NUDGE_EASE : MANUAL_NUDGE_EASE;
    nudgeTweenRef.current?.kill();
    isNudgingRef.current = true;
    nudgeTweenRef.current = gsap.to(state, {
      x: targetX,
      duration,
      ease,
      onUpdate: () => {
        xRef.current = state.x;
      },
      onComplete: () => {
        isNudgingRef.current = false;
        nudgeTweenRef.current = null;
      },
    });
  };

  // ===== Section: Setup / Animation Lifecycle =====
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const firstSegment = firstSegmentRef.current;
    if (!section || !viewport || !track || !firstSegment) return;

    const ctx = gsap.context(() => {
      const revealCards = Array.from(
        firstSegment.querySelectorAll<HTMLElement>('[data-reveal-card="true"]')
      );

      // Card entrance reveal on initial page load.
      gsap.fromTo(
        revealCards,
        {
          x: () => window.innerWidth * ENTRY_OFFSET_RATIO,
          autoAlpha: 0,
        },
        {
          x: 0,
          autoAlpha: 1,
          duration: ENTRY_DURATION_S,
          ease: ENTRY_EASE,
          stagger: ENTRY_STAGGER_S,
          delay: ENTRY_DELAY_S,
        }
      );
    }, section);

    const applyLoopWrap = () => {
      const loopWidth = segmentWidthRef.current;
      if (!loopWidth) return;
      // Keep x in (-loopWidth, 0] using stable modulo wrapping to avoid visible reset jumps.
      xRef.current = ((xRef.current % loopWidth) + loopWidth) % loopWidth;
      if (xRef.current > 0) {
        xRef.current -= loopWidth;
      }
    };

    const setTrackX = () => {
      track.style.transform = `translate3d(${xRef.current.toFixed(2)}px, 0, 0)`;
    };

    // ===== Subsection: Center Focus / Depth Mapping =====
    // Per-frame center focus logic:
    // - cards stay bottom-aligned (no vertical curve offset)
    // - center card gets width/height boost via media scale (layout-safe)
    // - every step away from center subtracts DISTANCE_STEP_SCALE_DECAY
    const syncCenterDepth = () => {
      const viewportRect = viewport.getBoundingClientRect();
      const centerX = viewportRect.left + viewportRect.width / 2;
      const halfWidth = Math.max(1, viewportRect.width / 2);
      let closestIndex = -1;
      let closestDistance = Number.POSITIVE_INFINITY;
      const metrics: { item: HTMLDivElement; focus: number; centerDistancePx: number }[] = [];

      itemRefs.current.forEach((item, index) => {
        if (!item) return;
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const normalizedDistance = (itemCenter - centerX) / halfWidth;
        const clampedDistance = Math.max(-1.2, Math.min(1.2, normalizedDistance));
        const absDistance = Math.abs(clampedDistance);
        const centerDistancePx = Math.abs(itemCenter - centerX);

        const focus = Math.max(0, 1 - absDistance * FOCUS_FALLOFF);
        metrics.push({ item, focus, centerDistancePx });

        if (absDistance < closestDistance) {
          closestDistance = absDistance;
          closestIndex = index;
        }
      });

      // Stable step baseline (measured from layout) prevents pulsing scale jumps.
      const oneStepPx = Math.max(1, cardStepPxRef.current);

      metrics.forEach(({ item, focus, centerDistancePx }, index) => {
        item.style.transform = 'translate3d(0, 0, 0)';
        item.style.opacity = '1';
        // Higher zIndex keeps the center card visually above neighboring cards.
        item.style.zIndex = `${Math.round(24 + focus * 120)}`;
        const media = item.querySelector<HTMLElement>('[data-card-media="true"]');
        if (!media) return;
        const isCenter = index === closestIndex;
        // Fall-off sizing controls:
        // 0 for center, 1 for adjacent cards, 3 for cards three positions away, etc.
        // Tune DISTANCE_STEP_SCALE_DECAY and MIN_CARD_SCALE to adjust this behavior.
        const stepDistance = isCenter ? 0 : Math.max(1, Math.round(centerDistancePx / oneStepPx));
        const distanceDecay = stepDistance * DISTANCE_STEP_SCALE_DECAY;
        const baseScaleX = 1 + CENTER_WIDTH_BOOST;
        const baseScaleY = 1 + CENTER_HEIGHT_BOOST;
        const scaleX = Math.max(MIN_CARD_SCALE, baseScaleX - distanceDecay);
        const scaleY = Math.max(MIN_CARD_SCALE, baseScaleY - distanceDecay);
        media.style.transformOrigin = 'center bottom';
        media.style.transform = `scale(${scaleX}, ${scaleY})`;
      });

      if (centerIndexRef.current === closestIndex) return;
      centerIndexRef.current = closestIndex;
      itemRefs.current.forEach((item, index) => {
        if (!item) return;
        item.dataset.center = index === closestIndex ? 'true' : 'false';
      });
    };

    const measureTrack = () => {
      segmentWidthRef.current = firstSegment.getBoundingClientRect().width;
      const shells = Array.from(
        firstSegment.querySelectorAll<HTMLElement>('[data-card-shell="true"]')
      );
      if (shells.length >= 2) {
        const stepSamples: number[] = [];
        for (let i = 1; i < shells.length; i += 1) {
          stepSamples.push(shells[i].offsetLeft - shells[i - 1].offsetLeft);
        }
        const avgStep = stepSamples.reduce((sum, value) => sum + value, 0) / stepSamples.length;
        cardStepPxRef.current = Math.max(1, avgStep);
      }
      applyLoopWrap();
      setTrackX();
      syncCenterDepth();
    };

    measureTrack();

    // RAF loop keeps wrap and center focus in sync continuously.
    const loop = () => {
      applyLoopWrap();
      setTrackX();
      syncCenterDepth();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    // Auto motion cadence ("infinite movement").
    autoAdvanceTimerRef.current = setInterval(() => {
      performNudge(1, 'auto');
    }, AUTO_ADVANCE_MS);
    window.addEventListener('resize', measureTrack);

    return () => {
      ctx.revert();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      nudgeTweenRef.current?.kill();
      inertiaTweenRef.current?.kill();
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
      window.removeEventListener('resize', measureTrack);
    };
  }, []);

  // ===== Section: User Interaction Handlers =====
  // Drag interaction controls.
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    pointerIdRef.current = event.pointerId;
    lastPointerXRef.current = event.clientX;
    dragStartTimeRef.current = performance.now();
    lastMoveTimeRef.current = performance.now();
    dragVelocityRef.current = 0;
    nudgeTweenRef.current?.kill();
    inertiaTweenRef.current?.kill();
    isNudgingRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    if (pointerIdRef.current !== event.pointerId) return;
    const now = performance.now();
    // Delay pickup slightly so drag does not start abruptly.
    if (now - dragStartTimeRef.current < DRAG_RESPONSE_DELAY_MS) {
      lastPointerXRef.current = event.clientX;
      lastMoveTimeRef.current = now;
      return;
    }
    const deltaX = event.clientX - lastPointerXRef.current;
    const deltaTimeMs = Math.max(1, now - lastMoveTimeRef.current);
    const instantaneousVelocity = (deltaX / deltaTimeMs) * 1000;
    // Smoothed velocity for stable post-release inertia.
    dragVelocityRef.current = dragVelocityRef.current * 0.72 + instantaneousVelocity * 0.28;
    lastPointerXRef.current = event.clientX;
    lastMoveTimeRef.current = now;
    xRef.current += deltaX;
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    if (pointerIdRef.current !== event.pointerId) return;
    isDraggingRef.current = false;
    pointerIdRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const releaseVelocity = dragVelocityRef.current;
    const throwDistance = gsap.utils.clamp(
      -MAX_INERTIA_THROW_PX,
      MAX_INERTIA_THROW_PX,
      releaseVelocity * INERTIA_THROW_SECONDS
    );
    if (Math.abs(releaseVelocity) < INERTIA_MIN_VELOCITY_PX_PER_S || Math.abs(throwDistance) < 1) return;
    const state = { x: xRef.current };
    inertiaTweenRef.current?.kill();
    inertiaTweenRef.current = gsap.to(state, {
      x: xRef.current + throwDistance,
      duration: 0.9,
      ease: INERTIA_EASE,
      onUpdate: () => {
        xRef.current = state.x;
      },
      onComplete: () => {
        inertiaTweenRef.current = null;
      },
    });
  };
 
  // ===== Section: Render =====
  return (
    <section id="projects" ref={sectionRef} className="relative  flex min-h-screen  items-center justify-end overflow-hidden bg-white/60bg-gradient-to-t  max-sm:px-4  sm:min-h-screen ">
      <div className="relative z-10 w-full">
        

        <div className="relative mx-auto w-full ">
          {/* Controls: Previous Arrow */}
          {/* <button
            type="button"
            aria-label="Previous projects"
            onClick={() => nudgeTrack(-1)}
            className="absolute left-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#1b5e3f]/35 bg-white/80 text-xl text-[#174826] backdrop-blur transition-all hover:border-[#1b5e3f] hover:bg-white sm:h-12 sm:w-12 sm:text-2xl"
          >
            &larr;
          </button> */}

          {/* Carousel Viewport + Looping Track */}
          <div
            ref={viewportRef}
            onMouseEnter={() => {
              isInteractingRef.current = true;
            }}
            onMouseLeave={() => {
              isInteractingRef.current = false;
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onDragStart={(event) => {
              event.preventDefault();
            }}
            className="relative overflow-hidden px-2 pb-4 pt-16 sm:px-16 cursor-grab active:cursor-grabbing select-none touch-pan-y"
          >
            <div ref={trackRef} className="flex w-max items-end">
              {/* Segment A: Primary loop segment (also used for reveal animation) */}
              <div ref={firstSegmentRef} className={`flex shrink-0 items-ecenternd ${TRACK_GAP_CLASSES} ${TRACK_PAD_CLASSES}`}>
                {cards.map((card, index) => (
                  <div
                    key={`main-${card.title}-${index}`}
                    ref={(element) => {
                      itemRefs.current[index] = element;
                    }}
                    data-card-shell="true"
                    className="group shrink-0 will-change-transform transition-[opacity] duration-300"
                    data-center="false"
                  >
                    <div data-reveal-card="true">
                      <article className={`relative ${CARD_WIDTH_CLASSES} ${CARD_HOVER_MOTION_CLASSES}`}>
                        <div className="pointer-events-none absolute left-1/2 top-8 z-0 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/35 bg-black/70 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-cream transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-16 group-hover:z-20">
                          {card.company} - {card.title}
                        </div>
                        <div data-card-media="true" className={`relative z-10 ${CARD_IMAGE_HEIGHT_CLASSES} overflow-hidden rounded-2xl border border-white/15 shadow-[0_16px_46px_rgba(0,0,0,0.26)] transition-transform duration-300`}>
                          <Image
                            src={card.image}
                            alt={card.title}
                            fill
                            draggable={false}
                            className="object-cover"
                            sizes="(min-width: 1024px) 18rem, (min-width: 640px) 15rem, 58vw"
                          />
                        </div>
                      </article>
                    </div>
                  </div>
                ))}
              </div>

              {/* Segment B: Duplicate segment for seamless infinite looping */}
              <div className={`flex shrink-0 items-end ${TRACK_GAP_CLASSES} ${TRACK_PAD_CLASSES}`} aria-hidden="true">
                {cards.map((card, index) => {
                  const duplicateIndex = cards.length + index;
                  return (
                    <div
                      key={`dup-${card.title}-${index}`}
                      ref={(element) => {
                        itemRefs.current[duplicateIndex] = element;
                      }}
                      data-card-shell="true"
                      className="group shrink-0 will-change-transform transition-[opacity] duration-300"
                      data-center="false"
                    >
                      <article className={`relative ${CARD_WIDTH_CLASSES} ${CARD_HOVER_MOTION_CLASSES}`}>
                        <div className="pointer-events-none absolute left-1/2 top-8 z-0 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/35 bg-black/70 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-cream transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-16 group-hover:z-20">
                          {card.company} - {card.title}
                        </div>
                        <div data-card-media="true" className={`relative z-10 ${CARD_IMAGE_HEIGHT_CLASSES} overflow-hidden rounded-2xl border border-white/15 shadow-[0_16px_46px_rgba(0,0,0,0.26)] transition-transform duration-300`}>
                          <Image
                            src={card.image}
                            alt={card.title}
                            fill
                            draggable={false}
                            className="object-cover"
                            sizes="(min-width: 1024px) 18rem, (min-width: 640px) 15rem, 58vw"
                          />
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Controls: Next Arrow */}
          {/* <button
            type="button"
            aria-label="Next projects"
            onClick={() => nudgeTrack(1)}
            className="absolute right-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#1b5e3f]/35 bg-white/80 text-xl text-[#174826] backdrop-blur transition-all hover:border-[#1b5e3f] hover:bg-white sm:h-12 sm:w-12 sm:text-2xl"
          >
            &rarr;
          </button> */}
        </div>
        <p className="section-title-text mb-10 text-center text-xs font-semibold uppercase tracking-[0.45em] text-[#1b5e3f] sm:text-sm sm:tracking-[0.8em]">
          Featured Works
        </p>
      </div>
    </section>
  );
}

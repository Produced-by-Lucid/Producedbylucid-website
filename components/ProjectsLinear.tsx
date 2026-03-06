'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FollowMouseDrag from './FollowMouseDrag';

const projectCards = [
  {
    image: '/projects/oscafest.png',
    video: '',
    company: 'Oscafest',
    title: "Beyond Borders 2025",
    date: '2025',
  },
   {
    image: '/projects/Busha-moonshot.jpeg',
    video: '/busha.mp4',
    company: 'Busha',
    title: 'Busha, Moonshot 2025',
    date: '2025',
  },
  {
    image: '/projects/bamboo.png',
    video: '',
    company: 'Bamboo',
    title: 'Corporate Event Gala',
    date: '2025',
  },
  {
    image: '/projects/piggyvest.png',
    video: '',
    company: 'Piggyvest',
    title: 'Brand Launch Experience',
    date: '2025',
  },
 
  {
    image: '/projects/glovo-eoy.png',
    video: '',
    company: 'Glovo',
    title: ' End of the year party 2025',
    date: '2025',
  },
  {
    image: '/projects/bmoni-mixer.png',
    video: 'bmoni.mp4',
    company: 'Bmoni',
    title: 'Bmoni Mixer Lunch Party',
    date: '2025',
  },
  
  
];

export default function ProjectsLinear() {
  const sectionRef = useRef<HTMLElement>(null);
  const marqueeViewportRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const curveItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const curveStateRef = useRef<{ y: number; r: number; s: number }[]>([]);
  const loopTweenRef = useRef<gsap.core.Tween | null>(null);
  const isDraggingRef = useRef(false);
  const isHoveringRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const activePointerIdRef = useRef<number | null>(null);

  const loopCards = useMemo(() => [...projectCards, ...projectCards], []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const track = marqueeTrackRef.current;
    const viewport = marqueeViewportRef.current;
    if (!section || !track || !viewport) return;

    let applyCurve: (() => void) | null = null;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section,
        { autoAlpha: 0, y: 70 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.set(track, { xPercent: 0, force3D: true });
      loopTweenRef.current = gsap.to(track, {
        xPercent: -50,
        duration: 34,
        ease: 'none',
        repeat: -1,
      });

      applyCurve = () => {
        const viewportRect = viewport.getBoundingClientRect();
        const centerX = viewportRect.left + viewportRect.width / 2;
        const halfWidth = Math.max(1, viewportRect.width / 2);

        curveItemRefs.current.forEach((item, index) => {
          if (!item) return;

          const rect = item.getBoundingClientRect();
          const itemCenter = rect.left + rect.width / 2;
          const normalizedDistance = (itemCenter - centerX) / halfWidth;
          const clampedDistance = Math.max(-1.15, Math.min(1.15, normalizedDistance));
          const absDist = Math.abs(clampedDistance);

          const targetY = Math.pow(absDist, 1.35) * 88;
          const targetR = clampedDistance * 14;
          const targetS = 1 - absDist * 0.08;

          const prev = curveStateRef.current[index] ?? { y: targetY, r: targetR, s: targetS };
          const next = {
            y: prev.y + (targetY - prev.y) * 0.18,
            r: prev.r + (targetR - prev.r) * 0.18,
            s: prev.s + (targetS - prev.s) * 0.18,
          };

          curveStateRef.current[index] = next;
          item.style.transform = `translate3d(0, ${next.y.toFixed(2)}px, 0) rotate(${next.r.toFixed(2)}deg) scale(${next.s.toFixed(3)})`;
        });
      };

      gsap.ticker.add(applyCurve);
      window.addEventListener('resize', applyCurve);
      applyCurve();
    }, section);

    return () => {
      if (applyCurve) {
        gsap.ticker.remove(applyCurve);
        window.removeEventListener('resize', applyCurve);
      }
      loopTweenRef.current?.kill();
      loopTweenRef.current = null;
      ctx.revert();
    };
  }, []);

  const setMotionSpeed = (timeScale: number, duration: number) => {
    if (!loopTweenRef.current) return;
    gsap.to(loopTweenRef.current, {
      timeScale,
      duration,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  const pauseLoop = () => {
    isHoveringRef.current = true;
    if (isDraggingRef.current) return;
    // Smoothly decelerate on hover instead of abrupt pause.
    setMotionSpeed(0.18, 0.55);
  };

  const resumeLoop = () => {
    isHoveringRef.current = false;
    if (isDraggingRef.current) return;
    setMotionSpeed(1, 0.7);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!loopTweenRef.current) return;
    isDraggingRef.current = true;
    activePointerIdRef.current = event.pointerId;
    lastPointerXRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
    setMotionSpeed(0, 0.45);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !loopTweenRef.current) return;
    if (activePointerIdRef.current !== event.pointerId) return;

    const deltaX = event.clientX - lastPointerXRef.current;
    lastPointerXRef.current = event.clientX;
    // Scrub the looping timeline for direct drag control.
    loopTweenRef.current.totalTime(loopTweenRef.current.totalTime() - deltaX * 0.035);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    if (activePointerIdRef.current !== event.pointerId) return;

    isDraggingRef.current = false;
    activePointerIdRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setMotionSpeed(isHoveringRef.current ? 0.18 : 1, 0.65);
  };

  return (
    <section id="projects" ref={sectionRef} className="relative flex min-h-[75vh] scroll-mt-24 items-center justify-center overflow-hidden  px-4 py-14  sm:min-h-[110vh] sm:pb-[20vh]">
      <div className="relative z-10 w-full ">
     

        <div
          ref={marqueeViewportRef}
          onMouseEnter={pauseLoop}
          onMouseLeave={resumeLoop}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative w-full p-3 cursor-grab active:cursor-grabbing select-none"
        >
          <FollowMouseDrag targetRef={marqueeViewportRef} label="visit" />

          <div ref={marqueeTrackRef} className="projects-linear-track mb-20 flex w-max items-stretch gap-[6vw] sm:gap-[10vw]">
            {loopCards.map((card, index) => (
              <div
                key={`${card.title}-${index}`}
                ref={(element) => {
                  curveItemRefs.current[index] = element;
                }}
                className="shrink-0 will-change-transform"
              >
                <article className="projects-linear-card group w-[82vw] bg-white pt-2 px-2 shadow-5xl transition-[width,padding,box-shadow] duration-500 ease-out sm:w-[22rem] sm:hover:w-[36rem] sm:hover:p-3 sm:hover:shadow-[0_14px_50px_rgba(0,0,0,0.35)]">
                  
                  <div className="relative h-[38vh] w-full overflow-hidden sm:h-[44vh]">
                    {card.video && (
                      <video
                        src={`/projects/${card.video}`}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="projects-linear-video pointer-events-none absolute inset-0 z-10 h-full w-full object-cover group-hover:hidden"
                      />
                    )}
                    <Image src={card.image} alt={card.title} fill className="projects-linear-image pointer-events-none object-cover duration-200 group-hover:scale-120" sizes="(min-width: 1024px) 32rem, 78vw" />
                    <Image src={'/ribbon-cut.svg'} alt={'ribbon'} width={200} height={400} className=" group-hover:translate-y-0 duration-500 ease-cubic  absolute top-0 right-0 w-10 mr-4 -translate-y-[100%]" />
                  </div>
                  <div className="pt-3 text-left text-gray-600 transition-all sm:opacity-0 sm:translate-y-2 sm:group-hover:h-fit sm:h-0 overflow-hidden  sm:group-hover:opacity-100">
                    <p className="text-xs font-['Castio'] uppercase tracking-[0.2em] ">{card.company}</p>
                    <span className="flex items-center justify-between">
                      <p className="mt-1 text-lg  font-semibold">{card.title}</p>
                      {card.date}
                    </span>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
           <p className="section-title-text mb-8 text-center text-xs font-semibold uppercase tracking-[0.45em] text-[#1b5e3f] sm:text-sm sm:tracking-[0.8em]">Featured Projects</p>
      </div>
    </section>
  );
}

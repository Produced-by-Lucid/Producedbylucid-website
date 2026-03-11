'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

interface OurServicesProps {
  sectionRef: RefObject<HTMLDivElement | null>;
}

const ENABLE_SERVICE_SCROLL_HIJACK = false;
const SNAP_UNLOCK_DELAY_MS = 700;
const CONTENT_REVEAL_START = 'top 88%';
const CONTENT_REVEAL_END = 'top 62%';
const ACTIVE_TITLE_START = 'top 72%';
const ACTIVE_TITLE_END = 'bottom 52%';
const PROGRESS_BASE_GAP_PX = 4;
const PROGRESS_PULSE_GAP_PX = 14;

type ServiceSnapSetupArgs = {
  sectionRef: RefObject<HTMLDivElement | null>;
  contentRefs: MutableRefObject<(HTMLParagraphElement | null)[]>;
  getActiveIndex: () => number;
  onSnapIndex: (index: number) => void;
};

// Scroll hijack for service content snapping. Disable by setting ENABLE_SERVICE_SCROLL_HIJACK to false.
function setupServiceScrollHijack({
  sectionRef,
  contentRefs,
  getActiveIndex,
  onSnapIndex,
}: ServiceSnapSetupArgs) {
  const section = sectionRef.current;
  if (!section) return () => {};

  let isLocked = false;
  let touchStartY: number | null = null;
  let unlockTimer: ReturnType<typeof setTimeout> | null = null;

  const isInsideSnapZone = () => {
    const rect = section.getBoundingClientRect();
    const probeY = window.innerHeight * 0.5;
    return rect.top <= probeY && rect.bottom >= probeY;
  };

  const unlockLater = () => {
    if (unlockTimer) {
      clearTimeout(unlockTimer);
    }
    unlockTimer = setTimeout(() => {
      isLocked = false;
    }, SNAP_UNLOCK_DELAY_MS);
  };

  const snapToIndex = (index: number) => {
    const target = contentRefs.current[index];
    if (!target) return;

    isLocked = true;
    onSnapIndex(index);
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
    unlockLater();
  };

  const stepBy = (direction: 1 | -1) => {
    if (isLocked || !isInsideSnapZone()) return;

    const maxIndex = contentRefs.current.length - 1;
    if (maxIndex < 0) return;

    const current = getActiveIndex();
    const next = Math.min(maxIndex, Math.max(0, current + direction));
    if (next === current) return;

    snapToIndex(next);
  };

  const handleWheel = (event: WheelEvent) => {
    if (!isInsideSnapZone()) return;
    if (Math.abs(event.deltaY) < 6) return;

    event.preventDefault();
    stepBy(event.deltaY > 0 ? 1 : -1);
  };

  const handleTouchStart = (event: TouchEvent) => {
    touchStartY = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (!isInsideSnapZone() || touchStartY === null) return;

    const currentY = event.touches[0]?.clientY;
    if (typeof currentY !== 'number') return;

    const deltaY = touchStartY - currentY;
    if (Math.abs(deltaY) < 18) return;

    event.preventDefault();
    stepBy(deltaY > 0 ? 1 : -1);
    touchStartY = currentY;
  };

  const handleTouchEnd = () => {
    touchStartY = null;
  };

  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: false });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });

  return () => {
    if (unlockTimer) {
      clearTimeout(unlockTimer);
    }
    window.removeEventListener('wheel', handleWheel);
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  };
}

const services = [
  {
    title: 'conceptualization & design',
    image: '/services-img/svc-1.jpg',
    content:
      'From brainstorming creative ideas to bringing your vision to life, we work closely with you to design concepts that align with your goals. We create detailed floor plans, 2D/3D visuals, to ensure every element enhances the overall experience.',
  },
  {
    title: 'Event Planning & Coordination',
    image: '/services-img/svc-2.JPG',
    content:
      'We handle all logistics, from venue selection to vendor coordination. Our team manages timelines, budgets, event flows, and all moving parts to ensure a smooth, stress-free planning process.',
  },
  {
    title: 'Production & Execution',
    image: '/services-img/svc-3.jpg',
    content:
      'Our on-site expertise ensures flawless execution, managing every detail from setup to teardown. We handle technical elements-stage, lighting, sound, screens, etc.- as well as branding, decor, catering, entertainment, and everything in between to bring your event vision to life seamlessly.',
  },
  {
    title: 'Guest Management',
    image: '/services-img/svc-4.jpg',
    content:
      'We take care of the details to ensure a smooth experience for your guests. From managing guest lists and check-in to seating arrangements and special requests, we handle everything, making sure your guests get the best experience.',
  },
  {
    title: 'Branding & Experiential Marketing',
    image: '/services-img/svc-5.jpeg',
    content:
      'We elevate your brand using immersive experiences and compelling storytelling. By combining strategic marketing with event design, we engage your audience and leave a lasting impression.',
  },
  {
    title: 'Post-Event Services & Feedback',
    image: '/services-img/svc-6.JPG',
    content:
      'After the event, we provide post-event support, including detailed reports, feedback gathering, and analysis to ensure future events are even more successful.',
  },
];

export default function OurServices({ sectionRef }: OurServicesProps) {
  const titlesViewportRef = useRef<HTMLDivElement>(null);
  const titlesTrackRef = useRef<HTMLDivElement>(null);
  const progressPulseRef = useRef<HTMLSpanElement>(null);
  const trackStartSpacerRef = useRef<HTMLDivElement>(null);
  const trackEndSpacerRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const contentRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const track = titlesTrackRef.current;
    const viewport = titlesViewportRef.current;
    const progressPulse = progressPulseRef.current;
    const startSpacer = trackStartSpacerRef.current;
    const endSpacer = trackEndSpacerRef.current;
    if (!track || !viewport || !progressPulse || !startSpacer || !endSpacer) return;

    const triggers: ScrollTrigger[] = [];
    const contentTweens: gsap.core.Tween[] = [];
    let activeIndex = 0;
    let alignRafId: number | null = null;
    let pulseTween: gsap.core.Tween | null = null;
    let isPulseRunning = false;
    let queuedPulse = false;
    let lastScrollY = window.scrollY;
    gsap.set(track, { force3D: true });
    gsap.set(progressPulse, { rowGap: PROGRESS_BASE_GAP_PX });
    const animateTrackX = gsap.quickTo(track, 'x', {
      duration: 1.05,
      ease: 'expo.out',
      overwrite: 'auto',
    });

    const moveTitleToIndex = (index: number, animate: boolean) => {
      const title = titleRefs.current[index];
      if (!title) return;

      const viewportWidth = viewport.clientWidth;
      const trackWidth = track.scrollWidth;
      const targetCenter = title.offsetLeft + title.offsetWidth / 2;
      const desiredX = viewportWidth / 2 - targetCenter;
      const minX = Math.min(0, viewportWidth - trackWidth);
      const x = Math.max(minX, Math.min(0, desiredX));

      if (animate) {
        animateTrackX(x);
        return;
      }

      gsap.set(track, { x });
    };

    const syncEdgeSpacers = () => {
      const spacerWidth = viewport.clientWidth / 2;
      startSpacer.style.width = `${spacerWidth}px`;
      endSpacer.style.width = `${spacerWidth}px`;
    };

    const alignTitleAfterPaint = (index: number, animate: boolean) => {
      if (alignRafId !== null) {
        cancelAnimationFrame(alignRafId);
      }
      alignRafId = requestAnimationFrame(() => {
        alignRafId = null;
        moveTitleToIndex(index, animate);
      });
    };

    const setActiveTitle = (index: number, animate: boolean) => {
      if (index === activeIndex) return;
      activeIndex = index;
      setActiveServiceIndex(index);
      alignTitleAfterPaint(index, animate);
    };

    const runPulse = () => {
      isPulseRunning = true;
      pulseTween = gsap.fromTo(
        progressPulse,
        { rowGap: PROGRESS_BASE_GAP_PX },
        {
          rowGap: PROGRESS_PULSE_GAP_PX,
          duration: 0.16,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            isPulseRunning = false;
            pulseTween = null;

            if (queuedPulse) {
              queuedPulse = false;
              runPulse();
            }
          },
        }
      );
    };

    const pulseProgress = () => {
      if (isPulseRunning) {
        queuedPulse = true;
        return;
      }
      runPulse();
    };

    const isSectionVisible = () => {
      const section = sectionRef.current;
      if (!section) return false;
      const rect = section.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    };

    const handleScrollPulse = () => {
      const currentY = window.scrollY;
      if (currentY === lastScrollY) return;
      lastScrollY = currentY;
      if (!isSectionVisible()) return;
      pulseProgress();
    };

    contentRefs.current.forEach((content, index) => {
      if (!content) return;

      const revealTween = gsap.fromTo(
        content,
        { autoAlpha: 0, y: 48, filter: 'blur(8px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          ease: 'power2.out',
          scrollTrigger: {
            trigger: content,
            start: CONTENT_REVEAL_START,
            end: CONTENT_REVEAL_END,
            scrub: 0.8,
          },
        }
      );
      contentTweens.push(revealTween);

      const trigger = ScrollTrigger.create({
        trigger: content,
        start: ACTIVE_TITLE_START,
        end: ACTIVE_TITLE_END,
        onEnter: () => {
          setActiveTitle(index, true);
        },
        onEnterBack: () => {
          setActiveTitle(index, true);
        },
      });

      triggers.push(trigger);
    });

    syncEdgeSpacers();
    activeIndex = 0;
    startTransition(() => {
      setActiveServiceIndex(0);
    });
    alignTitleAfterPaint(0, false);

    const teardownScrollHijack = ENABLE_SERVICE_SCROLL_HIJACK
      ? setupServiceScrollHijack({
          sectionRef,
          contentRefs,
          getActiveIndex: () => activeIndex,
          onSnapIndex: (index) => setActiveTitle(index, true),
        })
      : () => {};

    const handleResize = () => {
      syncEdgeSpacers();
      alignTitleAfterPaint(activeIndex, false);
    };
    window.addEventListener('scroll', handleScrollPulse, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      if (alignRafId !== null) {
        cancelAnimationFrame(alignRafId);
      }
      if (pulseTween) {
        pulseTween.kill();
        pulseTween = null;
      }
      isPulseRunning = false;
      queuedPulse = false;
      window.removeEventListener('scroll', handleScrollPulse);
      window.removeEventListener('resize', handleResize);
      teardownScrollHijack();
      contentTweens.forEach((tween) => tween.kill());
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [sectionRef]);

  return (
    <section id="services" ref={sectionRef} className="relative z-60 min-h-[200vh] scroll-mt-24 bg-[#174826] backdrop-blur-3xl">
    
      <div className="sticky inset-0 top-[32vh] flex w-full justify-center bg-transparent sm:top-[40vh]">
        {/* pulsing progress */}
<span ref={progressPulseRef} className=" hidden flex-col items-center gap-1 [&>p]:text-2xl [&>p]:font-bold [&>p]:leading-none sm:[&>p]:text-4xl">
  <p>●</p>
  <p>○</p>
  <p>○</p>
  <p>○</p>
  <p>○</p>
  <p>○</p>
</span>

      </div>
      <p className="sticky top-16 mt-6 w-full px-4 text-center text-xs uppercase tracking-[0.45em] text-white sm:top-20 sm:mt-10 sm:text-right sm:text-xl sm:tracking-[1.2rem]">our services</p>
      <div className="sticky top-24 z-40 flex h-36 w-full bg-[#b7c970]/0 text-[#174826] sm:top-40 sm:h-60">
        <div className="flex h-full w-full items-center justify-center">
          
            
            <div ref={titlesViewportRef} className="flex-1 overflow-hidden">
              <div ref={titlesTrackRef} className="flex w-max items-center gap-10 px-4 text-xl uppercase will-change-transform sm:gap-24 sm:px-8 sm:text-5xl sm:whitespace-nowrap md:gap-40 md:text-6xl">
                <div ref={trackStartSpacerRef} className="h-px shrink-0" />
                {services.map((service, index) => (
                  <h2
                    key={service.title}
                    ref={(element) => {
                      titleRefs.current[index] = element;
                    }}
                    className={`relative z-10 shrink-0 whitespace-nowrap px-3 pb-1  transition-colors duration-300 ${
                      activeServiceIndex === index
                        ? 'text-[#DB612D] font-extrabold grayscale-0'
                        : '!text-transparent stroke-text font-medium  grayscale z-0'
                    }`}
                    style={{ WebkitTextStroke: activeServiceIndex === index ? '0px' : '1px #DB612D' }}
                  >
                    {service.title}
                  </h2>
                ))}
                <div ref={trackEndSpacerRef} className="h-px shrink-0" />
              </div>
            </div>
          </div>
      </div>

      <div className="flex flex-col px-4 sm:flex-row sm:px-20 lg:px-40">
        <div className="relative h-[50vh] w-full overflow-hidden pb-3 sm:sticky sm:top-0 sm:h-[70vh]">
          {services.map((service, index) => (
            <div
              key={`${service.title}-image`}
              className={`absolute inset-0 isolate flex items-start justify-center after:absolute after:inset-0 after:-z-10 after:max-w-[72vw] after:translate-y-2 after:bg-[#DB612D]/0 after:content-[''] sm:justify-start sm:after:max-w-[30vw] sm:after:translate-x-2 sm:after:-translate-y-2 transition-opacity duration-700 ease-out ${
                activeServiceIndex === index ? 'opacity-80' : 'opacity-0 pointer-events-none'
              }`}
            >
              <Image
                src={service.image}
                alt={service.title}
                width={900}
                height={1200}
                className="z-10 mt-6 h-[42vh] w-[72vw] object-cover sm:relative sm:top-40 sm:mt-20 sm:h-[48vh] sm:w-[30vw]"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
        <div className="relative z-10 mx-auto flex max-w-2xl flex-col px-2 py-[22vh] text-base leading-relaxed sm:px-10 sm:py-[50vh] sm:text-2xl">
          {services.map((service, index) => (
            <p
              key={`${service.title}-content`}
              ref={(element) => {
                contentRefs.current[index] = element;
              }}
              className="min-h-[72vh] sm:min-h-screen"
            >
              {service.content}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

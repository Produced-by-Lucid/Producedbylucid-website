'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import ClientsMarquee from './ClientsMarquee';

const projectCards = [
  {
    image: '/slider-imgs/pr-img-1.png',
    company: 'Piggyvest',
    title: "Sir Allan's 70th Birthday",
    background: 'radial-gradient(circle at 20% 20%, #334e68 0%, #0a0a0a 62%)',
  },
  {
    image: '/slider-imgs/pr-img-2.png',
    company: 'Acme Corp',
    title: 'Corporate Event Gala',
    background: 'radial-gradient(circle at 80% 16%, #7f5539 0%, #0a0a0a 62%)',
  },
  {
    image: '/slider-imgs/prl-img-3.png',
    company: 'BrandCo',
    title: 'Brand Launch Experience',
    background: 'radial-gradient(circle at 50% 0%, #386641 0%, #0a0a0a 62%)',
  },
  {
    image: '/slider-imgs/pr-img-1.png',
    company: 'ExpoTech',
    title: 'Technology Expo Showcase',
    background: 'radial-gradient(circle at 75% 30%, #3a506b 0%, #0a0a0a 64%)',
  },
  {
    image: '/slider-imgs/pr-img-2.png',
    company: 'LuxWeds',
    title: 'Luxury Wedding Production',
    background: 'radial-gradient(circle at 30% 75%, #6a4c93 0%, #0a0a0a 64%)',
  },
  {
    image: '/slider-imgs/prl-img-3.png',
    company: 'FestBuild',
    title: 'Festival Stage Build',
    background: 'radial-gradient(circle at 85% 72%, #8d5524 0%, #0a0a0a 65%)',
  },
  {
    image: '/slider-imgs/pr-img-1.png',
    company: 'CultureHub',
    title: 'Community Cultural Night',
    background: 'radial-gradient(circle at 14% 65%, #5f0f40 0%, #0a0a0a 62%)',
  },
  {
    image: '/slider-imgs/pr-img-2.png',
    company: 'RevealIt',
    title: 'Product Reveal Moment',
    background: 'radial-gradient(circle at 90% 50%, #2a9d8f 0%, #0a0a0a 64%)',
  },
];

export default function Projects() {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const rotationRef = useRef(0);
  const startXRef = useRef(0);
  const startRotationRef = useRef(0);
  // refs for auto-spin control
  const isDraggingRef = useRef(false);
  const isHoveringRef = useRef(false);
  const autoSpinEnabledRef = useRef(true);
  const resumeTimeoutRef = useRef<number | null>(null);
  // spin configuration: subtle, reversed direction (negative)
  const SPIN_TARGET = -0.02; // degrees per second (subtle, negative = reverse)
  // an object we can tween via GSAP for smooth speed transitions
  const spinObjRef = useRef({ speed: SPIN_TARGET });
  const pauseTweenRef = useRef<gsap.core.Tween | null>(null);
  const resumeTweenRef = useRef<gsap.core.Tween | null>(null);

  const cardCount = projectCards.length;
  const step = 360 / cardCount;

  const activeIndex = useMemo(() => {
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < cardCount; index += 1) {
      const cardAngle = index * step + rotation;
      const normalized = ((cardAngle + 540) % 360) - 180;
      const distance = Math.abs(normalized);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    }

    return nearestIndex;
  }, [cardCount, rotation, step]);

  const snapToIndex = (index: number) => {
    console.log('snapToIndex called with', index);
    const normalizedIndex = ((index % cardCount) + cardCount) % cardCount;
    const snappedRotation = -(normalizedIndex * step);
    console.log('target rotation', snappedRotation);
    // animate rotationRef -> snappedRotation and update state on each frame
    const animObj = { r: rotationRef.current };
    gsap.to(animObj, {
      r: snappedRotation,
      duration: 0.6,
      ease: 'power3.out',
      onUpdate: () => {
        rotationRef.current = animObj.r;
        setRotation(animObj.r);
      },
      onComplete: () => {
        rotationRef.current = snappedRotation;
        setRotation(snappedRotation);
        console.log('snap complete, rotation now', snappedRotation);
      },
    });
  };

  const snapToNearest = () => {
    const nearest = Math.round(-rotationRef.current / step);
    snapToIndex(nearest);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    isDraggingRef.current = true;
    // smooth pause when user starts interacting
    if (pauseTweenRef.current) pauseTweenRef.current.kill();
    if (resumeTweenRef.current) resumeTweenRef.current.kill();
    pauseTweenRef.current = gsap.to(spinObjRef.current, {
      speed: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        autoSpinEnabledRef.current = false;
      }
    });
    startXRef.current = event.clientX;
    startRotationRef.current = rotationRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) {
      return;
    }

    const deltaX = event.clientX - startXRef.current;
    const nextRotation = startRotationRef.current + deltaX * 0.35;
    // update directly while dragging (no animation)
    rotationRef.current = nextRotation;
    setRotation(nextRotation);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);
    isDraggingRef.current = false;
    snapToNearest();
    // resume auto-spin after short delay
    if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = window.setTimeout(() => {
      // tween speed back to target
      if (pauseTweenRef.current) { pauseTweenRef.current.kill(); pauseTweenRef.current = null; }
      resumeTweenRef.current = gsap.to(spinObjRef.current, {
        speed: SPIN_TARGET,
        duration: 0.9,
        ease: 'power2.out',
        onStart: () => { autoSpinEnabledRef.current = true; },
      });
      resumeTimeoutRef.current = null;
    }, 900);
  };

  // Pause auto-spin when hovering a card; resume after delay on leave
  const handleCardEnter = () => {
    isHoveringRef.current = true;
    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    // smooth pause the spin and snap when complete
    if (pauseTweenRef.current) pauseTweenRef.current.kill();
    if (resumeTweenRef.current) resumeTweenRef.current.kill();
    pauseTweenRef.current = gsap.to(spinObjRef.current, {
      speed: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        autoSpinEnabledRef.current = false;
        // snap to nearest when the spin has settled
        if (!isDraggingRef.current) snapToNearest();
      }
    });
  };

  const handleCardLeave = () => {
    isHoveringRef.current = false;
    // delay before resuming auto-spin (tween speed back in)
    if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = window.setTimeout(() => {
      if (pauseTweenRef.current) { pauseTweenRef.current.kill(); pauseTweenRef.current = null; }
      resumeTweenRef.current = gsap.to(spinObjRef.current, {
        speed: SPIN_TARGET,
        duration: 0.9,
        ease: 'power2.out',
        onStart: () => { autoSpinEnabledRef.current = true; },
      });
      resumeTimeoutRef.current = null;
    }, 1400);
  };

  useEffect(() => {
    // subtle continuous rotation via GSAP ticker
    const tick = (time: number, delta: number) => {
      // delta is seconds since last tick
      if (!isDraggingRef.current && autoSpinEnabledRef.current) {
        // use tweened speed from spinObjRef for smooth start/stop
        const speed = spinObjRef.current.speed || 0;
        rotationRef.current = (rotationRef.current + speed * delta) % 360;
        setRotation(rotationRef.current);
      }
    };

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
    };
  }, []);

  const activeCard = projectCards[activeIndex];

  return (
    <section
      className="relative sm:min-h-[120vh] min-h-screen flex justify-center -mt-20 px-4  py-[10vh] overflow-hidden transition-[background] duration-700"
      // style={{ background: activeCard.background }}
    >
      <div className="sm:h-[90vh]   sticky flex items-center top-15 ">
        <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.11)_0%,_transparent_58%)]" />
        <div className="absolute inset-0 opacity-15 transition-opacity duration-500">
          <Image src={activeCard.image} alt={activeCard.title} width={1200} height={400} className="object-cover mx-auto  h-screen blur-3xl w-1/2 "  />
        </div>
        <ClientsMarquee className="absolute bottom-0 left-1/2 mt-10 -translate-x-1/2" />

        <div className="relative z-10 w-full max-w-6xl flex flex-col items-center gap-10 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold invert tracking-[2.35em] uppercase text-cream/70 mb-[3rem">Featured Works</p>
          </div>
          <div className="w-full flex items-center justify-between gap-2 sm:gap-6">
            <button
              type="button"
              onClick={() => { console.log('left arrow'); snapToIndex(activeIndex - 1); }}
              className="z-20 h-11 w-11 sm:h-14 sm:w-14 rounded-full border border-cream/40 bg-black/30 hover:bg-black/60 transition-colors"
              aria-label="Rotate left"
            >
              <span className="text-2xl leading-none">{'<'}</span>
            </button>
            <div
              className={`projects-scene ${isDragging ? 'is-dragging' : ''}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div
                className={`projects-ring ${isDragging ? 'is-dragging' : ''}`}
                style={{ transform: `rotateX(5deg) rotateY(${rotation}deg)` }}
              >
                {projectCards.map((card, index) => (
                  <article
                    key={`${card.title}-${index}`}
                    className={`project-card ${activeIndex === index ? 'is-active' : ''}`}
                    style={{ ['--index' as string]: index, ['--count' as string]: cardCount }}
                    onMouseEnter={handleCardEnter}
                    onMouseLeave={handleCardLeave}
                  >
                    <div className="card-inner min-h-[25vh] flex flex-col bg-white p-2 overflow-hidden  max-w-screen-md relative">
                      <div className="card-image relative w-full min-h-20 flex flex-1">
                        <Image src={card.image} alt={card.title} fill className="object-cover" />
                      </div>
                      <div className=" p-2 text-xs  project-card-caption text-center">
                        <p className=" font-semibold text-gray-800">{card.title}</p>
                        <p className=" text-gray-600 mb-0.5">{card.company}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
        
            </div>
            <button
              type="button"
              onClick={() => { console.log('right arrow'); snapToIndex(activeIndex + 1); }}
              className="z-20 h-11 w-11 sm:h-14 sm:w-14 rounded-full border border-cream/40 bg-black/30 hover:bg-black/60 transition-colors"
              aria-label="Rotate right"
            >
              <span className="text-2xl leading-none">{'>'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

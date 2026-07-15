'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ProjectEntry } from '@/lib/site-types';
import FollowMouseDrag from './FollowMouseDrag';
import { FaArrowRight } from 'react-icons/fa';

interface ProjectsLinearProps {
  cards: ProjectEntry[];
  eyebrow: string;
}

export default function ProjectsLinear({ cards, eyebrow }: ProjectsLinearProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const marqueeViewportRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const loopTweenRef = useRef<gsap.core.Tween | null>(null);
  const isDraggingRef = useRef(false);
  const isHoveringRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const activePointerIdRef = useRef<number | null>(null);

  const loopCards = useMemo(() => [...cards, ...cards], [cards]);
 

  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const track = marqueeTrackRef.current;
    if (!section || !track) return;

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

      gsap.set(track, { xPercent: 0 });
      loopTweenRef.current = gsap.to(track, {
        xPercent: -90,
        duration: 34,
        ease: 'none',
        repeat: -1,
      });
    }, section);

    return () => {
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

  const preventDragStart = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <section id="projects" ref={sectionRef} className="relative flex justify-center    min-h-[120vh] flex-1 z-3   items-center overflow-hidden sm:px-0    ">
     
      {/* <Image
        src="/pattern-official.png"
        alt="Divider Shape"
        width={1920}
        height={889}
        className="absolute inset-0 w-screen  h-full object-cover"
      /> */}

      

      <div className="relative z-10   w-full ">
        <h2 className="section-title-text mb-8 text-center  font-semibold uppercase tracking-[0.45em]  sm:text-sm sm:tracking-[0.8em]">{eyebrow}</h2>


        <div
          ref={marqueeViewportRef}
          onMouseEnter={pauseLoop}
          onMouseLeave={resumeLoop}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDragStart={preventDragStart}
          className="relative w-full cursor-grab active:cursor-grabbing    select-none"
          style={{
            WebkitUserDrag: 'none',
            userSelect: 'none',
            MozUserSelect: 'none',
          } as React.CSSProperties}
        >
          <div
            className="w-full  overflow-hidden"
          >
            {/* <FollowMouseDrag targetRef={marqueeViewportRef} hoverTargetSelector=".projects-linear-card" label="View" showIcon={false} enabled={false} /> */}

            <div
              ref={marqueeTrackRef}
              className="projects-linear-track mb-20 pt-32 flex w-max items-center gap-[6vw] relative   justify-center sm:gap-[10vw]"
              
              
            >
              {loopCards.map((card, index) => (
                <div
                  key={`${card.title}-${index}`}
                  className="shrink-0 will-change-transform"
                >


                <a href={card.href || '#'} className="block" draggable={false}>
                  <article
                    className="projects-linear-card group w-[82vw] bg-[#fdf8ec] p-1 shadow-5xl transition-[width,padding,box-shadow] duration-400 ease-out sm:w-55 sm:hover:w-[26vw] sm:hover:p-3 sm:hover:shadow-[0_14px_50px_rgba(0,0,0,0.35)]"
                  >

                    <div className="relative h-[28vh] w-full overflow-hidden sm:h-[22vh] group-hover:sm:h-[34vh]">
                      {card.video && (
                        <video
                          src={card.video}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="projects-linear-video  pointer-events-none absolute inset-0 z-10 h-full w-full object-cover group-hover:hidden"
                        />
                      )}
                      <Image src={card.image} alt={card.title} fill className="projects-linear-image pointer-events-none object-cover duration-200  group-hover:scale-120" sizes="(min-width: 1024px) 32rem, 78vw" draggable={false} />
                      <Image src={'/ribbon-cut.svg'} alt={'ribbon'} width={200} height={400} className=" group-hover:translate-y-0 duration-500  ease-cubic  absolute top-0 right-0 w-10 mr-4 -translate-y-full" draggable={false} />
                    </div>
                    <div className="pt-3 text-left text-gray-600 transition-all pb-4 sm:opacity-0 sm:translate-y-2 sm:group-hover:h-fit sm:h-0 overflow-hidden sm:hidden group-hover:block sm:group-hover:opacity-100">
                      <h3 className="sm:text-2xl font-bold ">{card.company}</h3>
                      <p className="mt-1 text-lg  text-slate-400 font-semibold">{card.title}.  {card.date}</p>
                      <span className="flex relative  group mt-1   items-center w-full bg-gray-200 py-4 px-6  rounded-full   justify-between">
                        <p className="relative z-1 font-bold  ">View Case Study</p>
                        <FaArrowRight size={24}/>
                        <div className=" h-10 w-1/2 hidden  absolute group-hover:translate-x-0 duration-300  -translate-x-50 rounded-full left-2 bg-[#f67500] "></div>
                      </span>
                    </div>
                  </article>
                </a>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

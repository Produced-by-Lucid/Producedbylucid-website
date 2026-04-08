'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { HomePageContent } from '@/lib/site-types';
import HeroCurvedHeadline from '@/components/HeroCurvedHeadline';
import LogoSpriteAnimation from '@/components/LogoSpriteAnimation';

interface HeroProps {
  content: HomePageContent['hero'];
}

export default function Hero({ content }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const svgStrokeRef = useRef<SVGSVGElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Set initial states
    if (svgRef.current) {
      gsap.set(svgRef.current, { opacity: 0 });
    }
    if (svgStrokeRef.current) {
      // keep stroke visible or adjust if needed
      gsap.set(svgStrokeRef.current, { opacity: 0 });
    }
    if (logoRef.current) {
      gsap.set(logoRef.current, { opacity: 0, scale: 0.8 });
    }
    if (textRef.current) {
      gsap.set(textRef.current, { opacity: 0, y: 20 });
    }

    // Create reveal timeline
    const tl = gsap.timeline({ delay: 0.3 });
    
    if (svgRef.current) {
      tl.to(svgRef.current, {
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
      });
    }
    if (svgStrokeRef.current) {
      tl.to(svgStrokeRef.current, {
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
      }, '-=1');
    }
    
    if (logoRef.current) {
      tl.to(logoRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'back.out',
      }, '-=0.8');
    }
    
    if (textRef.current) {
      tl.to(textRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.6');
    }

  }, []);

  return (
    <section id="home" ref={heroRef} className="relative  flex sm:min-h-[50vh]  w-full scroll-mt-40 min-h-[60vh] sm:pt-20  max-sm:-mb-30  flex-col items-center justify-between  px-4  py-16   ">
      {/* <Image src="/pbl-round.svg" alt="Lucid logo" width={200} height={100} className="z-1 outline relative " /> */}

      <div className="absolute -top-4">
        <LogoSpriteAnimation className="mb-6 flex items-center justify-center" />
      </div>

      <h2 className="relative mb-10 mt-30 block whitespace-pre-line text-center sm:text-8xl  text-4xl font-extrabold uppercase   text-[#1B5E3F]! ">
        {content.mobileHeadline}
      </h2>
      <div className="absolute inset-0 sm:-translate-y-20 -translate-y-40 hidden   min-h-[20vh] ">
        <HeroCurvedHeadline svgRef={svgRef} curvedHeadline={content.curvedHeadline} />
      </div>

      {/* Center Logo and Text Content */}
      <div className="relative z-20 w-full  flex flex-col items-center justify-end   text-center">
        

        {/* Agency Description */}
        <div ref={textRef} className="max-w-xl px-4 sm:px-6">
          <p className="mb-3 text-xl font-bold text-[#1B5E3F]! sm:text-2xl md:text-3xl">
            {content.eyebrow}
          </p>
          <p className="max-w-2xl text-base  leading-relaxed text-[#2a3a2a] sm:text-lg md:text-xl">
            {content.description}
          </p>
          <a href={content.primaryCtaUrl} className="mt-6 inline-block  rounded-full bg-[#DB612D] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#ffe8d9] hover:text-black">
            {content.primaryCtaLabel}
          </a>
        </div>
      </div>
    </section>
  
  );
}

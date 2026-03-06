'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';

interface HeroProps {
  mounted: boolean;
}

export default function Hero({ mounted }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // second svg does not need animation, keep separate ref if needed later
  const svgStrokeRef = useRef<SVGSVGElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!mounted) return;

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

  }, [mounted]);

  return (
    <section id="home" ref={heroRef} className="relative  flex sm:min-h-[65vh] w-full scroll-mt-40 min-h-[50vh] sm:pt-10  max-sm:-mb-30  flex-col items-center justify-between  px-4  py-16 sm:py-2  ">
      {/* Main SVG with curved text and logo background */}
      <Image src="/3d-logo.png" alt="Lucid logo" width={200} height={100} className="z-0  -mb-20 relative z-5 h-auto w-68 object-contain sm:w-68 " />
      
      
<h2 className=" sm:hidden block font-extrabold uppercase !text-[#1B5E3F] text-6xl tracking-tight  text-center mb-10  relative    ">bold ideas. <br/> elevated experience.</h2>
      <div className="absolute inset-0 sm:-translate-y-20 -translate-y-40    min-h-[20vh] ">

        <div
          className=" relative top-28 flex h-[52vh]  w-full items-center sm:top-48 max-sm:hidden   sm:h-screen"
        >
          <svg
            ref={svgRef}
            viewBox="0 0 1200 850"
            className="absolute left-0  w-full scale-140 sm:top-14 sm:h-screen sm:scale-110"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Elliptical path for curved text */}
              <ellipse
                id="curve"
                cx="600"
                cy="600"
                rx="600"
                ry="400"
                fill="none"
              />
            </defs>
        
            {/* Curved text - BOLD IDEAS * ELEVATE */}
            <text
              className="font-bold uppercase fill-[#1B5E3F]"
              fontSize="56"
              fontFamily="var(--font-display), sans-serif"
              letterSpacing="1"
              fontWeight="700"
            >
              <textPath href="#curve" startOffset="75%" textAnchor="middle">
               bold ideas * elevated experiences
              </textPath>
            </text>
          </svg>
        
        </div>
      </div>

      {/* Center Logo and Text Content */}
      <div className="relative z-20 w-full  flex flex-col items-center justify-end   text-center">
        

        {/* Agency Description */}
        <div ref={textRef} className="max-w-xl px-4 sm:px-6">
          <p className="mb-3 text-xl font-bold !text-[#1B5E3F] sm:text-2xl md:text-3xl">
            We are an Event Planning & Production  Agency:
          </p>
          <p className="max-w-2xl text-base leading-relaxed text-[#2a3a2a] sm:text-lg md:text-xl">
           Creating unique event experiences for top Brands
          </p>
          <a href="#contact" className="mt-6 inline-block rounded-full bg-[#DB612D] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#ffe8d9] hover:text-black ">Let's talk</a>
        </div>
      </div>
    </section>
  );
}

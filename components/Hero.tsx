'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { HomePageContent } from '@/lib/site-types';
import HeroCurvedHeadline from '@/components/HeroCurvedHeadline';
import LogoSpriteAnimation from '@/components/LogoSpriteAnimation';
import Image from 'next/image';
import ClientsMarquee from './ClientsMarquee';
import Link from 'next/link'

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
    <section id="home" ref={heroRef} className="relative overflow-hidden flex w-full scroll-mt-40 min-h-screen bg-[#082210] sm:pt-20 max-sm:mb-30 flex-col items-center justify-center px-4 py-24 max-sm:min-h-[100svh] max-sm:px-5 max-sm:pt-20 max-sm:pb-5">
      <Image src="/orbital-lines.png" alt="" aria-hidden="true" width={1920} height={1200} className="mix-blend-color-dodge absolute mx-auto w-screen h-screen object-cover max-sm:h-full max-sm:w-full" />

     



      {/* Center Logo and Text Content */}
      <div className="relative z-20 w-full mb-18 flex flex-col items-center justify-center mx-auto h-[40dvh] gap-10 text-center max-sm:mb-0 max-sm:h-auto max-sm:min-h-[62svh] max-sm:justify-end max-sm:gap-6 max-sm:pb-8">

        <h2 className="relative flex sm:flex-row flex-col sm:items-center z-10 mt-4 whitespace-pre-line sm:text-6xl text-2xl font-extrabold text-white! max-sm:gap-1 max-sm:leading-tight max-sm:tracking-tight">
          {content.headlinePrefix}
          <span className='w-26 flex relative px-4 max-sm:h-11 max-sm:w-20 max-sm:items-center max-sm:justify-center max-sm:self-center max-sm:px-0'>
            <Image alt='spark' width={60} height={20} src='/new-spark.svg' className=' relative  z-1'/>
            <Image alt='spark' width={260} height={220} src='/new-spark.svg' className=' absolute scale-[0.5] -translate-y-3 z-2 -left-2  m-auto blur-sm mix-blend-color-dodge  opacity-40  brightness-200 ' />
            <Image alt='spark' width={260} height={220} src='/new-spark.svg' className=' absolute scale-[0.5] -translate-y-3 -translate-x-4 blur-sm mix-blend-multiply  opacity-80  brightness-0 ' />
            <Image alt='spark' width={260} height={220} src='/new-spark-2.svg' className='scale-[5] absolute brightness-200  mx-auto bottom-2 blur-md mix-color-dodge  opacity-10 ' />
            <Image alt='spark' width={260} height={220} src='/new-spark-2.svg' className='scale-[6] absolute brightness-200  mx-auto bottom-2 blur-md mix-color-dodge  opacity-10 ' />
          </span>
          {content.headlineSuffix}
        </h2>


        {/* Agency Description */}
        <div ref={textRef} className="max-w-xl px-4 sm:px-6 max-sm:px-0">
          {/* <p className="mb-3 text-xl font-bold text-[#1B5E3F]! sm:text-2xl md:text-3xl">
            {content.eyebrow}
          </p> */}
          <p className="max-w-7xl text-base leading-relaxed text-white sm:text-lg md:text-xl max-sm:text-[0.95rem] max-sm:leading-6">
            {content.description}
          </p>
          <Link href={content.primaryCtaUrl} className="mt-6 flex items-center hover:-rotate-z-2 justify-between min-w-44 mx-auto relative whitespace-nowrap group rounded-full max-sm:mt-5
          after:h-24 after:w-[130%] after:duration-600 after:ease-in-out hover:after:-translate-x-[10%] after:rounded-full  overflow-hidden after:-translate-x-[150%] after:bg-[#ffebaa]  after:absolute after:mix-blend-screen 
          bg-[#DB612D] max-w-32 hover:max-w-34 duration-75  px-4 py-3 text-sm font-semibold text-white  hover:text-black">
            <p className="relative z-1">{content.primaryCtaLabel}</p>
            <Image alt='chat' className='group-hover:brightness-0 duration-600 delay-150 ease-in-out relative z-1' width={20} height={20} src='/chat-icon.svg' />
          </Link>
        </div>
      </div>
      <ClientsMarquee className='brightness-20 invert max-sm:shrink-0 max-sm:py-3' />
      <div className='bg-linear-to-t from-[#082210] to-[#082210]/0 h-[80vh] w-screen absolute -bottom-20 mx-auto max-sm:h-[45vh] max-sm:-bottom-10'></div>
    </section>

  );
}

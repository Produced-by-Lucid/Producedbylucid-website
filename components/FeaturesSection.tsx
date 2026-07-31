"use client";

import React, { useEffect, useCallback, useState, useRef } from 'react';
import Image from 'next/image';
import type { HomePageContent } from '@/lib/site-types';
import {gsap} from 'gsap';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const hilghlights = [
"/glovo_img.png"

]


interface Props {
  section: HomePageContent['featureShowcase'];
  currentSlide: number;
  setCurrentSlide: React.Dispatch<React.SetStateAction<number>>;
}

const TextReveal: React.FC<{ text: string }> = ({ text }) => {
  const words = text.split(' ');

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 12, stiffness: 100 },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: { type: 'spring', damping: 12, stiffness: 100 },
    },
  };

  return (
    <motion.div
      className="flex flex-wrap text-black justify-center overflow-hidden text-2xl leading-relaxed sm:text-3xl lg:text-[2rem]"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span variants={child} style={{ marginRight: '8px' }} key={index}>
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

const FeaturesSection = React.forwardRef<HTMLDivElement, Props>(({ section, currentSlide, setCurrentSlide }, ref) => {
  const { slides, headingPrefix, highlightWord, description } = section;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length, setCurrentSlide]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section ref={ref} className="relative flex min-h-screen items-center justify-center bg-[#FDF8EC] px-4 pb-[16dvh] sm:px-6 sm:py-[20dvh]">
      <Image
        src="/divider-shape.svg"
        alt="Divider Shape"
        width={1920}
        height={889}
        className="absolute inset-0 w-full sm:-mt-20 -mt-32  h-full max-sm:h-[50vh] object-cover  "
      />
      <div className=" flex flex-col mx-auto items-center  gap-8 sm:gap-12 md:gap-20   lg:gap-30 relative z-10">

        <div className="max-w-5xl space-y-6 text-[#154122] sm:space-y-8 md:space-y-10">
          <h1 className="text-center text-5xl font-bold leading-tight sm:text-6xl lg:text-8xl">
            {headingPrefix.split(' ').slice(0, -2).join(' ')} <span className="w-2"></span>
            {headingPrefix.split(' ').slice(-2).join(' ')} <br /> <span className="text-[#DB612D]">{highlightWord}</span>
          </h1>
        </div>

        <div className="relative flex w-full  flex-col items-center gap-8 sm:gap-12">
          {/* Slider Images */}
          <div className="relative flex h-[30vh] bg-amber-100 max-h-[50vh] sm:min-h-[60vh]  outline w-full items-center overflow-hidden rounded-[1.5rem]  sm:rounded-[2rem]">
            {/* <video
              src={'/0001-0500.mp4'}
              width={1200}
              height={900}
              className="h-full w-full object-cover"
              autoPlay
              loop
              muted
            /> */}
            <Image
              src="/glovo_img.png"
              alt="Divider Shape"
              width={1920}
              height={889}
              className="absolute   inset-0 w-full   h-full  object-cover  "
            />
          </div>

          <div className="mt-2 max-w-3xl px-2 text-center sm:mt-8">
            <TextReveal text={description} />
          </div>

        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = 'FeaturesSection';

export default FeaturesSection;

"use client";

import React, { useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { HomePageContent } from '@/lib/site-types';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

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
      style={{ overflow: 'hidden', display: 'flex', fontSize: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}
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
    <section ref={ref} className="relative min-h-screen  bg-[#FDF8EC] py-[20dvh] flex items-center justify-center  px-4 sm:px-6">
      <Image
        src="/divider-shape.svg"
        alt="Divider Shape"
        width={1920}
        height={889}
        className="absolute inset-0 w-full -mt-20  h-full object-cover"
      />
      <div className=" flex flex-col mx-auto items-center  gap-8 sm:gap-12 md:gap-20   lg:gap-30 relative z-10">

        <div className="space-y-6 sm:space-y-8 md:space-y-10 text-[#154122] max-w-4xl">
          <h1 className="ml text-center text-7xl font-bold ">
            {headingPrefix.split(' ').slice(0, -2).join(' ')} <span className="w-2"></span>
            {headingPrefix.split(' ').slice(-2).join(' ')} <br /> <span className="text-[#DB612D]">{highlightWord}</span>
          </h1>
        </div>

        <div className='relative flex items-center flex-col gap-12   '>
          {/* Slider Images */}
          <div className="relative w-full sm:h-[80vh]  overflow-hidden rounded-3xl flex items-center  ">
            <video
              src={'/0001-0500.mp4'}
              width={1200}
              height={900}
              className="object-cover h-full"
              autoPlay
              loop
              muted
            />
          </div>

          <div className="mt-8 text-center max-w-3xl">
            <TextReveal text={description} />
          </div>

        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = 'FeaturesSection';

export default FeaturesSection;

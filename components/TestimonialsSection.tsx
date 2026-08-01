'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { HomePageContent, TestimonialEntry } from '@/lib/site-types';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const heartFrames = [
  '/heart/hrt01.png',
  '/heart/hrt02.png',
  '/heart/hrt03.png',
  '/heart/hrt04.png',
  '/heart/hrt05.png',
  '/heart/hrt06.png',
  '/heart/hrt07.png',
  '/heart/hrt08.png',
];

const testimonialTrackVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
    },
  },
};

const testimonialCardVariants: Variants = {
  hidden: { opacity: 0, x: '100vw' },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

type TestimonialsSectionProps = {
  heading: HomePageContent['testimonialsSection']['curvedHeading'];
  testimonials: TestimonialEntry[];
};

export default function TestimonialsSection({ heading, testimonials }: TestimonialsSectionProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [heartFrameIndex, setHeartFrameIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(672);
  const [isMobile, setIsMobile] = useState(false);
  const clientsTrackRef = useRef<HTMLDivElement | null>(null);
  const clientButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const CARD_GAP = typeof window === 'undefined' ? 0 : window.innerWidth * 0.1;
  const trackTransform = `translateX(calc(50vw - ${cardWidth / 2}px - ${currentTestimonial * (cardWidth + CARD_GAP)}px))`;

  useEffect(() => {
    const updateCardWidth = () => {
      const preferred = Math.min(672, window.innerWidth * 0.88);
      setCardWidth(preferred);
      setIsMobile(window.innerWidth < 768);
    };

    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, []);

  const showPreviousTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const showNextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;

    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    if (deltaX < 0) showNextTestimonial();
    else showPreviousTestimonial();
  };





  return (
    <section
      id="testimonials"
      className="relative mb-[20vh] flex-col flex sm:items-center justify-center px-4 sm:mb-[30vh] lg:mb-[40vh]"
    >
      <div className="  z-10 sm:flex justify-center sm:px-8">
        <h2 className=" sm:text-center sm:text-7xl text-6xl font-semibold uppercase px-3 sm:max-w-2xl max-w-xl text-[#FFE1CD] ">
          {heading || 'What clients say'}
        </h2>
      </div>

      {/* <div className="relative mt-20 w-full max-w-xl">
          <article
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="rounded-[2rem] border border-white/15 bg-linear-to-br from-white/30 via-black/20 to-white/20 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.35)] backdrop-blur-[18px]"
          >
            <div className="mb-4 flex items-center justify-between gap-4 font-bold text-sm text-white">
              <span className="flex gap-1 text-gray-300/90">
                {testimonials[currentTestimonial].author}, <strong className="text-white!" /> {testimonials[currentTestimonial].company}
              </span>
              <Image
                src="/new-spark.svg"
                alt="Divider Shape"
                width={26}
                height={26}
                className="z-1 inset-0 object-cover brightness-200 grayscale-100"
              />
            </div>
            <p className="text-base font-medium leading-8 text-white">
              {testimonials[currentTestimonial].quote}
            </p>
          </article>
          <div className="mt-5 flex items-center gap-3 px-1" aria-label={`Testimonial ${currentTestimonial + 1} of ${testimonials.length}`}>
            <div className="flex flex-1 gap-1" role="progressbar" aria-valuemin={1} aria-valuemax={testimonials.length} aria-valuenow={currentTestimonial + 1}>
              {testimonials.map((testimonial, index) => (
                <span
                  key={`${testimonial.author}-${index}`}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    index === currentTestimonial ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold tabular-nums text-white/80">
              {currentTestimonial + 1}/{testimonials.length}
            </span>
          </div>
        </div> */}
      <div className="relative mt-20  sm:min-h-[70vh] min-h-[59vh]  w-full">
        <div className="relative">
          <motion.div
            className="flex items-center gap-[10vw] transition-transform duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
            style={{ transform: trackTransform }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={testimonialTrackVariants}
          >
            {testimonials.map((testimonial, index) => {
              const distance = Math.abs(index - currentTestimonial);
              const isActive = distance === 0;
              const isNearby = distance === 1;
              return (
                <article
                  key={`${testimonial.author}-${index}`}
                  className={`shrink-0 rounded-[2.5rem]  sm:bg-white  transition-all duration-700 ease-out sm:p-10 ${isActive
                    ? 'scale-105 opacity-100 blur-0'
                    : isNearby
                      ? 'scale-95 opacity-90 blur-sm'
                      : 'scale-90 opacity-50 blur-md'
                    }`}
                  style={{
                    width: `${cardWidth}px`,
                    minWidth: `${cardWidth}px`,
                    maxWidth: `${cardWidth}px`,
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                  }}
                >
                  <div className="mb-4 flex flex-col  gap-4 font-bold text-md">
                    <span className="flex gap-2 sm:flex-row flex-col flex-wrap sm:text-black/20 ">
                      <span className="sm:pr-3 sm:pl-1 px-1 flex items-center  justify-center  text-[#983A12]! sm:text-[#FFE1CD]! bg-white sm:bg-[#983A12] grow-0 rounded-full w-fit ">
                        <Image
                          src="/new-spark.svg"
                          alt="Divider Shape"
                          width={16}
                          height={16}
                          className="z-1  inset-0 object-cover brightness-200 grayscale-100"
                        />
                        {testimonial.author}
                      </span>
                      {testimonial.company}
                    </span>

                  </div>
                  <p className="text-base font-medium leading-8 sm:text-black! text-white! max-sm:pr-8 sm:text-lg md:text-xl md:leading-9">
                    {testimonial.quote}
                  </p>
                </article>
              );
            })}
          </motion.div>
        </div>
      <div className="  relative  sm:absolute  sm:bottom-20  text-black  z-10 sm:mx-auto sm:inset-x-0  h-fit   px-5  w-80 justify-between gap-4 flex">
        <button
          onClick={() =>
            setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
          }
          className=" p-3 rounded-full active:outline  cursor-pointer hover:bg-white bg-[#FFE1CD]! flex items-center text-2xl "
        >
          <FaArrowLeft />
        </button>
        <button
          onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
          className= "p-3 rounded-full focus:outline text-2xl cursor-pointer hover:bg-white duration-75 flex items-center  bg-[#FFE1CD] transition"
        >
          <FaArrowRight />
        </button>
      </div>
      </div>

    </section>
  );
}

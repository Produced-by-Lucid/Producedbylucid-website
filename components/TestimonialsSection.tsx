'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
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

type TestimonialsSectionProps = {
  heading: HomePageContent['testimonialsSection']['curvedHeading'];
  testimonials: TestimonialEntry[];
};

export default function TestimonialsSection({ heading, testimonials }: TestimonialsSectionProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [heartFrameIndex, setHeartFrameIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(672);
  const clientsTrackRef = useRef<HTMLDivElement | null>(null);
  const clientButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const CARD_GAP = 20;
  const trackTransform = `translateX(calc(50vw - ${cardWidth / 2}px - ${currentTestimonial * (cardWidth + CARD_GAP)}px))`;

  useEffect(() => {
    const updateCardWidth = () => {
      const preferred = Math.min(672, window.innerWidth * 0.88);
      setCardWidth(preferred);
    };

    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, []);





  return (
    <section
      id="testimonials"
      className="relative flex  justify-center min-h-[140vh] items-center   px-4 "
    >
          
          <div className="relative w-full mt-40  ">
            <div className="relative ">
              <div
                className="flex items-center  transition-transform duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                style={{ transform: trackTransform }}
              >
                {testimonials.map((testimonial, index) => {
                  const distance = Math.abs(index - currentTestimonial);
                  const isActive = distance === 0;
                  const isNearby = distance === 1;
                  return (
                    <article
                      key={`${testimonial.author}-${index}`}
                      className={`shrink-0 rounded-[2.5rem] border border-white/15 bg-linear-to-br from-white/30 via-black/20 to-white/20 p-8 sm:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.35)] transition-all duration-700 ease-out ${
                        isActive
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
                      <div className=" font-bold text-md  flex gap-4 items-center justify-between  mb-4">
                        <span className=" flex gap-1  text-gray-300/90"> {testimonial.author}, <strong className=" text-white!"/> {testimonial.company} </span>
                          <Image
                                src="/new-spark.svg"
                                alt="Divider Shape"
                                width={26}
                                height={26}
                                className=" inset-0  brightness-200 z-1  grayscale-100   object-cover"
                              />
                      </div>
                      <p className="text-white text-base sm:text-lg leading-8 md:text-xl md:leading-9 font-medium">
                        {testimonial.quote}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>

          </div>
            <div className="mt-8 absolute bottom-[20vh] outline  z-3 mx-auto hidden w-80  justify-between gap-4 sm:flex">
              <button
                onClick={() =>
                  setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
                }
                className="h-12 w-12 rounded-full text-2xl  text-white transition "
              >
                <FaArrowLeft />
              </button>
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="h-12 w-12 rounded-full  text-2xl text-white transition "
              >
                <FaArrowRight />
              </button>
            </div>

        
    </section>
  );
}

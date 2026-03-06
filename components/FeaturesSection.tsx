'use client';

import React from 'react';
import Image from 'next/image';

interface Slide {
  image: string;
  title: string;
}

interface Props {
  slides: Slide[];
  currentSlide: number;
  setCurrentSlide: React.Dispatch<React.SetStateAction<number>>;
}

const FeaturesSection = React.forwardRef<HTMLDivElement, Props>(
  ({ slides, currentSlide, setCurrentSlide }, ref) => {
    return (
      <section ref={ref} className="relative h-screen  flex items-center justify-center  px-4 sm:px-6">
        <div className="max-w-6xl flex flex-col md:flex-row gap-8 sm:gap-12 md:gap-20 lg:gap-30 relative z-10">
          <div className='relative w-full md:w-125 h-80 sm:h-96 md:h-90'>
            {/* Slider Images */}
            <div className="relative w-full h-full overflow-hidden  ">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    width={500}
                    height={500}
                    className="object-cover h-full "
                  />
                </div>
              ))}

            </div>
            <Image
              src={'/bow.png'}
              alt="Decoration"
              width={150}
              height={150}
              className='absolute -top-6 -right-8 sm:-top-10 sm:-right-12 md:-right-20 w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36'
            />

            <div className="flex flex-row-reverse w-full justify-between items-center mt-4">
              {/* Slide Indicators */}
              <div className="relative bg-white/30 rounded-full overflow-hidden h-0.5 w-20 transform flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-1 rounded-full transition-all ${index === currentSlide ? 'bg-cream w-8' : 'bg-cream/30'
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              {/* Title */}
              <p className="text-center">{slides[currentSlide].title}</p>
            </div>
          </div>
          <div className="space-y-6 sm:space-y-8 md:space-y-10 text-[#174826] max-w-md">
            <h2 className="text-3xl sm:text-4xl  md:text-5xl lg:text-6xl font-bold mb-8 sm:mb-12 md:mb-16 uppercase">we <br />
              design for <span className="text-[#DB612D]">purpose</span></h2>
            <p className='text-sm sm:text-base font-medium md:pr-25'>At Produced by Lucid, we bring clarity to the chaos with creativity, structure,
              and precision—transforming bold ideas into elevated experiences.</p>
            <div className="flex flex-col">
            </div>
          </div>
        </div>
      </section>
    );
  }
);

FeaturesSection.displayName = 'FeaturesSection';

export default FeaturesSection;

'use client';

import { useState } from 'react';
import type { RefObject } from 'react';
import type { HomePageContent } from '@/lib/site-types';
import DynamicBackground from './DynamicBackground';

type OurServicesGridProps = {
  sectionRef?: RefObject<HTMLDivElement | null>;
  eyebrow: string;
  services: HomePageContent['servicesSection']['items'];
};

export default function OurServicesGrid({ sectionRef, eyebrow, services }: OurServicesGridProps) {
  const [activeService, setActiveService] = useState<string | null>(null);

  const handleServiceTap = (title: string) => {
    setActiveService(activeService === title ? null : title);
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative z-20 scroll-mt-24  px-4 py-8 sm:px-6 sm:py-10"
    >

      <DynamicBackground/>
      
      <div className="mx-auto ">
        <div className="flex items-center justify-between border-b border-[#DB612D]/65 pb-4">
          <p className="text-xl  uppercase tracking-[2rem] text-[#DB612D] sm:text-xl">
            {eyebrow}
          </p>
          
          <span className="hidden items-center gap-2 text-[#DB612D] sm:flex">
            <p className="text-5xl font-bold leading-none tracking-[0.22em] animate-spin  text-[#DB612D] sm:text-8xl">
              *
            </p>
            <p className="text-5xl font-bold leading-none tracking-[0.22em] animate-spin  text-[#DB612D] sm:text-8xl">
              *
            </p>
            
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const initial = service.title.charAt(0).toUpperCase();
            const isActive = activeService === service.title;
            return (
              <article
                key={service.title}
                onClick={() => handleServiceTap(service.title)}
                className={`group relative sm:min-h-[650px] min-h-[40vh] overflow-hidden border border-[#DB612D]/65 p-6 sm:min-h-[420px] sm:p-8 cursor-pointer transition-all ${
                  isActive ? 'is-active' : ''
                }`}
              >
                <div className={`pointer-events-none absolute inset-0 bg-[#FFE1CD] z-60 duration-300 group-hover:translate-y-0 ${
                  isActive ? 'translate-y-0' : 'translate-y-[100%]'
                }`} />
                <div className="relative flex z-90 h-full flex-col">
                  <h3 className={`max-w-[90%] text-xl font-semibold uppercase leading-tight text-[#DB612D] transition-opacity duration-300 group-hover:opacity-0 sm:text-2xl ${
                    isActive ? 'opacity-0' : ''
                  }`}>
                    {service.title}
                  </h3>

                  <div className={`pointer-events-none absolute inset-x-6 top-6 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:inset-x-8 sm:top-6 ${
                    isActive ? 'translate-y-0 opacity-100' : ''
                  }`}>
                    <h4 className="max-w-[90%] text-2xl font-semibold uppercase leading-tight !text-[#DB612D] sm:text-4xl">
                      {service.title}
                    </h4>
                    <p className="mt-8 max-w-[30ch] text-base leading-relaxed text-[#1f3e2d] sm:text-lg">
                      {service.content}
                    </p>
                  </div>
                </div>

                <span className={`pointer-events-none absolute bottom-2 right-6 z-10 text-[16rem] font-semibold leading-none text-transparent opacity-85 transition-all duration-300 [-webkit-text-stroke:1px_#DB612D] group-hover:translate-y-4 group-hover:opacity-0 sm:text-[22rem] ${
                  isActive ? 'translate-y-4 opacity-0' : ''
                }`}>
                  {initial}
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

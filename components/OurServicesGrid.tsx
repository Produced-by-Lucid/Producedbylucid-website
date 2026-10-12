'use client';

import { useState } from 'react';
import type { RefObject } from 'react';
import type { HomePageContent } from '@/lib/site-types';
import Image from 'next/image';
import DynamicBackground from './DynamicBackground';

type ServiceItem = HomePageContent['servicesSection']['items'][number];

type OurServicesGridProps = {
  sectionRef?: RefObject<HTMLDivElement | null>;
  eyebrow: HomePageContent['servicesSection']['eyebrow'];
  services: ServiceItem[];
};

const serviceIllustrations = [
  '/services-img/a.svg',
  '/services-img/b.svg',
  '/services-img/c.svg',
  '/services-img/d.svg',
  '/services-img/e.svg',
  '/services-img/f.svg',
];

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

      {/* <DynamicBackground/> */}
      
      <div className="mx-auto ">
        <div className="flex items-center justify-between border-b border-[#DB612D]/65 pb-4">
          <h3 className="uppercase text-[#DB612D] tracking-normal">
            {eyebrow}
          </h3>
          
          <span className="flex shrink-0 items-center gap-2 text-[#DB612D]">
            <p className="service-icon-spin flex h-10 w-10 items-center justify-center text-4xl font-bold leading-none text-[#DB612D] sm:h-24 sm:w-24 sm:text-8xl">
              *
            </p>
            <p className="service-icon-spin flex h-10 w-10 items-center justify-center text-4xl font-bold leading-none text-[#DB612D] sm:h-24 sm:w-24 sm:text-8xl">
              *
            </p>
            
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => {
            const isActive = activeService === service.title;
            const serviceImage =
              service.icon?.trim() || serviceIllustrations[index % serviceIllustrations.length] || serviceIllustrations[0];

            return (
              <article
                key={service.title}
                onClick={() => handleServiceTap(service.title)}
                className={`group relative rounded-lg bg-[#FFE1CD] overflow-hidden border border-[#DB612D]/65 p-6 sm:rounded-none sm:bg-transparent sm:min-h-[420px] sm:p-8 sm:cursor-pointer transition-all ${
                  isActive ? 'is-active' : ''
                }`}
              >
                <div className="sm:hidden">
                  <div className="flex flex-col items-start gap-3">
                    <Image
                      src={serviceImage}
                      unoptimized
                      alt=""
                      width={90}
                      height={90}
                      className="h-[90px] w-[90px] shrink-0 object-contain"
                    />
                    <h3 className="text-2xl font-semibold uppercase leading-tight text-[#DB612D]">
                      {service.title}
                    </h3>
                  </div>
                  <p className="mt-4 text-base leading-relaxed text-[#1f3e2d]">
                    {service.content}
                  </p>
                </div>
                <div className={`pointer-events-none absolute inset-0 hidden sm:block bg-[#FFE1CD] z-60 duration-300 group-hover:translate-y-0 ${
                  isActive ? 'translate-y-0' : 'translate-y-[100%]'
                }`} />
                <div className="relative hidden sm:flex z-90 h-full flex-col">
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

                <div className={`pointer-events-none absolute hidden sm:block bottom-4 right-4 z-10 h-56 w-56 overflow-hidden transition-all duration-300 group-hover:translate-y-4 group-hover:opacity-0 sm:bottom-6 sm:right-6 sm:h-[14rem] sm:w-[14rem] ${
                  isActive ? 'translate-y-4 opacity-0' : ''
                }`}>
                  <Image
                    src={serviceImage}
                    unoptimized
                    alt={`${service.title} icon`}
                    fill
                    sizes="(min-width: 640px) 224px, 144px"
                    className="object-contain p-1"
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

'use client';

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

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative z-20 bg-white min-h-screen px-4 pb-50 outilne sm:px-6 sm:pb-80"
    >
       <Image
              src="/divider-shape.svg"
              alt="Divider Shape"
              width={1920}
              height={889}
              className="absolute inset-0 w-full -mt-20 brightness-200  h-full object-cover"
            />
       <Image
        src="/divider-convex.svg"
        alt="Divider Shape"
        width={1920}
        height={889}
        className="absolute inset-0 w-full -bottom-[20vh]  brightness-200   h-full object-cover"
      />

      
      <div className="mx-auto relative z-20 ">
        <div className="flex items-center justify-between flex-col  py-18">
          <h1 className="sm:text-[5rem] text-center font-bold uppercase text-[#dfdfdf] text-xl">
            {eyebrow}
          </h1>
          
          
        </div> 

        <div className="mt-8 grid  max-w-screen-xl  mb-16 bg-white rounded-3xl border border-gray-200   overflow-hidden  mx-auto">
          {services.map((service, index) => {
            const serviceImage =
              serviceIllustrations[index % serviceIllustrations.length] ?? serviceIllustrations[0];

            return (
              <article
                key={service.title}
                className="flex items-stretch gap-6 rounded-lg p-6  overflow-hidden "
              >
                <div className="relative w-60 h-60 flex-shrink-0 rounded-lg bg-[#DB612D] p-4 flex items-center justify-center">
                  <Image
                    src={serviceImage}
                    alt={`${service.title} icon`}
                    fill
                    sizes="160px"
                    className="object-contain p-4"
                  />
                </div>
                
                <div className="flex flex-col justify-center py-6 pr-6 flex-1">
                  <h3 className="text-4xl font-semibold  leading-tight text-[#07773a] mb-3">
                    {service.title}
                  </h3>
                  <p className="sm:text-2xl text-lg  font-medium  leading-relaxed text-[#1f3e2d]">
                    {service.content}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

'use client';

import type { RefObject } from 'react';
import type { HomePageContent } from '@/lib/site-types';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
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

const serviceGridVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14 },
  },
};

const serviceCardVariants: Variants = {
  hidden: { opacity: 0, x: '100vw' },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function OurServicesGrid({ sectionRef, eyebrow, services }: OurServicesGridProps) {

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative z-20 min-h-screen pt-30  bg-white px-4 pb-12 sm:px-6 sm:pb-80"
    >
       {/* <Image
              src="/divider-shape.svg"
              alt="Divider Shape"
              width={1920}
              height={889}
              className="absolute inset-0 w-full -mt-20 brightness-200  h-full object-cover"
            /> */}
       

      
      <div className="relative z-20 mx-auto max-w-screen-xl">
        <div className="flex flex-col items-center justify-between py-12 sm:py-18">
          <h1 className="text-center text-4xl font-bold uppercase  text-[#dfdfdf] sm:text-[5rem] ">
            {eyebrow}
          </h1>
          
          
        </div> 

        <motion.div
          className="mx-auto mt-6 mb-16 grid overflow-hidden rounded-3xl border border-gray-200 bg-white sm:mt-8"
          variants={serviceGridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {services.map((service, index) => {
            const serviceImage =
              service.serviceImage ||
              serviceIllustrations[index % serviceIllustrations.length] ||
              serviceIllustrations[0];

            return (
              <motion.article
                key={service.title}
                variants={serviceCardVariants}
                className="flex flex-col items-center max-sm:mb-10 gap-4 overflow-hidden rounded-lg p-4 sm:flex-row sm:items-stretch sm:gap-6 sm:p-6"
              >
                <div className="relative flex min-h-50 w-full flex-shrink-0 items-center  overflow-hidden justify-center aspect-landscape sm:max-w-sm  rounded-2xl bg-[#DB612D] ">
                  <Image
                    src={serviceImage}
                    alt={`${service.title} icon`}
                    fill
                    sizes="160px"
                    className="object-cover "
                  />
                </div>
                
                <div className="flex  flex-1 flex-col justify-center py-0 pr-0  sm:py-6 sm:pr-6 text-left">
                  <h3 className="mb-3 text-2xl font-semibold leading-tight text-[#07773a] sm:text-4xl">
                    {service.title}
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-[#1f3e2d] sm:text-2xl">
                    {service.content}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

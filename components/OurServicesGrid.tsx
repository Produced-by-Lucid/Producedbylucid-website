'use client';

import type { RefObject } from 'react';
import DynamicBackground from './DynamicBackground';

type OurServicesGridProps = {
  sectionRef?: RefObject<HTMLDivElement | null>;
};

const services = [
  {
    title: 'Conceptualization & Design',
    content:
      'From brainstorming creative ideas to bringing your vision to life, we work closely with you to design concepts that align with your goals. We create detailed floor plans, 2D/3D visuals, to ensure every element enhances the overall experience.',
  },
  {
    title: 'Event Planning & Coordination',
    content:
      'We handle all logistics, from venue selection to vendor coordination. Our team manages timelines, budgets, event flows, and all moving parts to ensure a smooth, stress-free planning process.',
  },
  {
    title: 'Production & Execution',
    content:
      'Our on-site expertise ensures flawless execution, managing every detail from setup to teardown. We handle stage, lighting, sound, screens, branding, decor, catering, entertainment, and everything in between.',
  },
  {
    title: 'Guest Management',
    content:
      'From guest lists and check-in to seating arrangements and special requests, we coordinate every detail to deliver a smooth and memorable experience for your guests.',
  },
  {
    title: 'Branding & Experiential Marketing',
    content:
      'We elevate your brand with immersive experiences and compelling storytelling, combining strategic marketing with event design to create lasting audience engagement.',
  },
  {
    title: 'Post-Event Services & Feedback',
    content:
      'After the event, we provide detailed reports, feedback gathering, and analysis so each future event is sharper, stronger, and even more successful.',
  },
];

export default function OurServicesGrid({ sectionRef }: OurServicesGridProps) {
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
            Our Services
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
            return (
              <article
                key={service.title}
                className="group relative sm:min-h-[650px] min-h-[40vh]  overflow-hidden border border-[#DB612D]/65  p-6 sm:min-h-[420px] sm:p-8"
              >
                <div className="pointer-events-none absolute inset-0 bg-[#FFE1CD]   duration-300 group-hover:translate-y-0 translate-y-[100%] " />
                <div className="relative z-10 flex h-full flex-col">
                  <h3 className="max-w-[90%] text-xl font-semibold uppercase leading-tight text-[#DB612D] transition-opacity duration-300 group-hover:opacity-0 sm:text-2xl">
                    {service.title}
                  </h3>

                  <div className="pointer-events-none absolute inset-x-6 top-6 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:inset-x-8 sm:top-8">
                    <h4 className="max-w-[90%] text-3xl font-semibold uppercase leading-tight !text-[#DB612D] sm:text-5xl">
                      {service.title}
                    </h4>
                    <p className="mt-8 max-w-[30ch] text-base leading-relaxed text-[#1f3e2d] sm:text-lg">
                      {service.content}
                    </p>
                  </div>
                </div>

                <span className="pointer-events-none absolute bottom-2 right-6 z-10 text-[16rem] font-semibold leading-none text-transparent opacity-85 transition-all duration-300 [-webkit-text-stroke:1px_#DB612D] group-hover:translate-y-4 group-hover:opacity-0 sm:text-[22rem]">
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

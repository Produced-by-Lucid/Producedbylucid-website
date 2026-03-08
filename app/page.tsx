'use client';

import { useState, useEffect } from 'react';
import LandingPage from "@/components/LandingPage";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Image from "next/image"
import ProjectsLinear from '@/components/ProjectsLinear';
import FeaturesSection from '@/components/FeaturesSection';
import SectionsInViewMotion from '@/components/SectionsInViewMotion';


export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { image: '/slider-imgs/pr-img-1.png', title: "Sir Allan's 70th Birthday" },
    { image: '/slider-imgs/pr-img-2.png', title: 'Corporate Event Gala' },
    { image: '/slider-imgs/prl-img-3.png', title: 'Brand Launch Experience' },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-x-clip">
      {/* Noise overlay */}
      <div
        className="fixed inset-0 z-50 pointer-events-none opacity-10 mix-blend-plus-darker"
        style={{
          backgroundImage: 'url(/noise-tv.gif)',
          backgroundRepeat: 'repeat',
          backgroundSize: '80px 80px',
        }}
      />
      
      <div className="fixed inset-0 z-0 flex items-center justify-center bg-[#FFE1CD]">
        <Image
          src="/obj.svg"
          width={400}
          height={400}
          alt="obj"
          className="h-64 w-64 blur-2xl sm:h-100 sm:w-100"
        />
      </div>
      <SectionsInViewMotion>
        <Hero mounted={mounted} />
      </SectionsInViewMotion>
      <SectionsInViewMotion>
        {/* <ProjectsPerspective /> */}
        <ProjectsLinear />
        {/* <Projects /> */}
      </SectionsInViewMotion>
      <Nav />
      <div className="relative z-10 bg-white/80 ">
        <SectionsInViewMotion>
          <FeaturesSection
            slides={slides}
            currentSlide={currentSlide}
            setCurrentSlide={setCurrentSlide}
          />
        </SectionsInViewMotion>
        <LandingPage />
      </div>
    </div>
  );
}


 {/* <div className="w-screen p-12 bg-[#FFE1CD]/50 ">
              <video
                className="w-full h-auto rounded-xl object-cover"
                src="/wedding-vid.mp4"
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            </div> */}

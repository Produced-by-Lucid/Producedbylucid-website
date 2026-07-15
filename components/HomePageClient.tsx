'use client';

import { useEffect, useRef, useMemo, useState, type ComponentType } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import LoadingScreen from './LoadingScreen';
import FeaturesSection from './FeaturesSection';
import Hero from './Hero';
import Nav from './Nav';
import ProjectsLinear from './ProjectsLinear';
import TestimonialsSection from './TestimonialsSection';
import Footer from './Footer';
import BlogPosts from './BlogPosts'
import TeamSection from './team';

import type {
  HomePageContent,
  PostSummary,
  ProjectEntry,
  SiteSettings,
  TestimonialEntry,
} from '@/lib/site-types';
import OurServiceGrid from './OurServicesGrid';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}


type HomePageClientProps = {
  home: HomePageContent;
  settings: SiteSettings;
  projects: ProjectEntry[];
  testimonials: TestimonialEntry[];
  posts: PostSummary[];
};

export default function HomePageClient({
  home,
  settings,
  projects,
  testimonials,
  posts,
}: HomePageClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  const stripeHeights = useMemo(
    () => Array.from({ length: 8 }, () => `${120 + Math.floor(Math.random() * 2)}%`),
    []
  );
  const stripesRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    gsap.from('.cta-content', {
      scrollTrigger: {
        trigger: ctaRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      scale: 0.8,
      opacity: 0,
      duration: 1,
      ease: 'back.out(1.7)',
    });

    gsap.from('.testimonial-content', {
      scrollTrigger: {
        trigger: '#testimonials',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out',
    });

    const sectionTitleTexts = gsap.utils.toArray<Element>('.section-title-text');
    sectionTitleTexts.forEach((title) => {
      gsap.fromTo(
        title,
        { autoAlpha: 0, y: 32, filter: 'blur(8px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    gsap.fromTo(
      '.testimonial-curved-text',
      {
        attr: { startOffset: '0%' },
        opacity: 0,
      },
      {
        scrollTrigger: {
          trigger: '#testimonials',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        attr: { startOffset: '50%' },
        opacity: 1,
        duration: 2,
        ease: 'power2.inOut',
      }
    );

    gsap.to('.parallax-bg', {
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      y: 300,
      ease: 'none',
    });

    // Parallax scroll for background stripes (stronger, staggered)
    const stripeEls = gsap.utils.toArray('.parallax-stripe');
    if (stripeEls.length) {
      gsap.to(stripeEls, {
        yPercent: (i: number) => -45 - i * 4,
        ease: 'power1.out',
        stagger: { each: 0.07, from: 'center' },
        scrollTrigger: {
          trigger: stripesRef.current || 'body',
          start: 'top 90',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Collect all above-the-fold and key images for real preloading
  const preloadImages = [
    '/obj.svg',
    ...home.featureShowcase.slides.map((s) => s.image),
    ...projects.map((p) => p.image),
    ...posts.map((p) => p.coverImage),
  ];





  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-[#19532b]">
      {!loaded && <LoadingScreen images={preloadImages} onDone={() => setLoaded(true)} />}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: 'url(/noise-tv.gif)',
          backgroundRepeat: 'repeat',
          backgroundSize: '80px 80px',
        }}
      />
      <Image
        src="/pattern-official.png"
        alt="Divider Shape"
        width={1920}
        height={889}
        className=" inset-0 w-screen  fixed  h-full object-cover"
      />

      <div className="fixed  bottom-0  flex w-screen   h-[40vh] items-center justify-center ">
        <div className="bg-">
          <Image
            src={'/stamp-logo.svg'}
            alt="Produced by Lucid Footer Logo"
            height={300}
            width={300}
            className=" object-cover relative outline  "
          />
        </div>
      </div>
      <Nav navItems={settings.navItems} cta={settings.navCta} />

      <Hero content={home.hero} />

      <FeaturesSection
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        section={home.featureShowcase}
      />

      <OurServiceGrid
        sectionRef={ctaRef}
        eyebrow={home.servicesSection.eyebrow}
        services={home.servicesSection.items}
      />
      <div className="w-screen relative flex flex-col bg-[#1d6133]  ">
        <Image src={'/silver-bg.png'} alt={'silver'} width={1920} height={1200} className=" blur-2xl duration-500  ease-cubic min-w-[140vw] w-full -bottom-[5vh]  h-[150vh] absolute mx-auto " />
        <div ref={stripesRef} className="flex w-screen absolute z-1 inset-0 group gap-1 min-h-screen h-[80%]">
          {stripeHeights.map((height, index) => (
            <li key={index} className="list-none flex-1 min-h-screen g  parallax-stripe bg-[#19532B]" style={{ height }} />
          ))}
        </div>

        <ProjectsLinear cards={projects} eyebrow={''} />
        <TestimonialsSection
          heading={home.testimonialsSection.curvedHeading}
          testimonials={testimonials}
        />
      </div>
      <TeamSection team={home.teamSection} />
      <BlogPosts eyebrow={''} heading={'PBL Magazine'} posts={posts.slice(0, 3)} />



      <Footer settings={settings} />
    </div>
  );
}

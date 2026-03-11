'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import OurServicesGrid from './OurServicesGrid';
import BlogPosts from './BlogPosts';
import TestimonialsSection from './TestimonialsSection';
import SectionsInViewMotion from './SectionsInViewMotion';
import type {
  HomePageContent,
  PostSummary,
  SiteSettings,
  TestimonialEntry,
} from '@/lib/site-types';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type LandingPageProps = {
  settings: SiteSettings;
  servicesSection: HomePageContent['servicesSection'];
  testimonialsSection: HomePageContent['testimonialsSection'];
  testimonials: TestimonialEntry[];
  blogSection: HomePageContent['blogSection'];
  posts: PostSummary[];
};

export default function LandingPage({
  settings,
  servicesSection,
  testimonialsSection,
  testimonials,
  blogSection,
  posts,
}: LandingPageProps) {
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use native CSS smooth scroll instead of Lenis for better browser compatibility
    if (typeof window !== 'undefined') {
      document.documentElement.style.scrollBehavior = 'smooth';
    }

    // CTA section animation
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

    // Testimonials section animation
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

    // Section title text reveal
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

    // Curved text animation - sliding along the path
    gsap.fromTo('.testimonial-curved-text',
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

    // Parallax effect for background elements
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

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      if (typeof window !== 'undefined') {
        document.documentElement.style.scrollBehavior = 'auto';
      }
    };
  }, []);

  return (
    <>
     

    
      <div className="relative bg-[#174826] ">



        {/* Our Services */}
        <SectionsInViewMotion>
          <OurServicesGrid
            sectionRef={ctaRef}
            eyebrow={servicesSection.eyebrow}
            services={servicesSection.items}
          />
        </SectionsInViewMotion>

        <TestimonialsSection heading={testimonialsSection.curvedHeading} testimonials={testimonials} />

        <SectionsInViewMotion>
          <BlogPosts eyebrow={blogSection.eyebrow} heading={blogSection.heading} posts={posts} />
        </SectionsInViewMotion>
        {/* Footer */}
        <footer id="contact" className="relative z-10 flex min-h-[60vh] scroll-mt-24 flex-col justify-end gap-14 bg-linear-to-b from-black 60% to-[#19532B] py-8 sm:gap-20 sm:py-12">
          <div className="w-full text-center space-y-8 text-cream/60">
            {/* orange gradient  */}
            <div className="absolute bottom-0 z-0 mb-8 h-32 w-full sm:h-48 md:h-64">
              <Image
                src="/sharp-light.svg"
                alt="Produced by Lucid Footer Logo"
                fill
                className="h-full w-full scale-x-150 object-cover blur-3xl sm:scale-x-200"
              />
            </div>
              {/* marquee text */}
            <div className="relative  z-10 mb-8 w-full text-[Castio] overflow-hidden border-b border-cream">
              <div
                className="animate-scroll-x flex w-max items-center whitespace-nowrap text-outline mix-blend-color-dodge  will-change-transform text-5xl sm:text-6xl md:text-[14rem]"
                style={{ animationDuration: '80s' }}
              >
                <div className="flex shrink-0 font-[castio]  items-center">
                  <span className="mb-6 mr-10 font-bold uppercase">{settings.footerMarqueeText}</span>
                  <span className="mb-6 mr-10 font-bold uppercase">*</span>
                  <span className="mb-6 mr-10 font-bold uppercase">{settings.footerMarqueeText}</span>
                  <span className="mb-6 mr-10 font-bold uppercase">*</span>
                  <span className="mb-6 mr-10 font-bold uppercase">{settings.footerMarqueeText}</span>
                </div>
                <div className="flex shrink-0 items-center" aria-hidden="true">
                  <span className="mb-6 mr-10 font-bold uppercase">{settings.footerMarqueeText}</span>
                  <span className="mb-6 mr-10 font-bold uppercase">*</span>
                  <span className="mb-6 mr-10 font-bold uppercase">{settings.footerMarqueeText}</span>
                  <span className="mb-6 mr-10 font-bold uppercase">*</span>
                  <span className="mb-6 mr-10 font-bold uppercase">{settings.footerMarqueeText}</span>
                </div>
              </div>
            </div>
            <div className="relative flex w-full flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:gap-4">
              <a href={settings.footerPrimaryCta.url} className="w-full justify-center rounded-full min-w-xs bg-cream px-6 py-3 font-bold text-black transition-colors hover:bg-cream/80 sm:w-auto">
                {settings.footerPrimaryCta.label}
              </a>

              <div className="flex gap-6 sm:gap-10 [&>a]:px-8 [&>a]:hover:text-[#ff7c24]">
                {settings.socialLinks.map((link) => (
                  <a key={link.label} href={link.url} className="transition-colors">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <p className="w-full px-6 py-5 text-center text-sm opacity-70 duration-200 hover:opacity-100 sm:text-right sm:text-base">{settings.footerCopyright}</p>
          </div>
        </footer>
      </div>
    </>
  );
}

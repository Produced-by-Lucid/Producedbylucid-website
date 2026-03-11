'use client';

import { useState } from 'react';
import Image from 'next/image';
import FeaturesSection from './FeaturesSection';
import Hero from './Hero';
import LandingPage from './LandingPage';
import Nav from './Nav';
import ProjectsLinear from './ProjectsLinear';
import SectionsInViewMotion from './SectionsInViewMotion';
import type {
  HomePageContent,
  PostSummary,
  ProjectEntry,
  SiteSettings,
  TestimonialEntry,
} from '@/lib/site-types';

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

  return (
    <div className="relative min-h-screen w-full overflow-x-clip">
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-10 mix-blend-plus-darker"
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
        <Hero content={home.hero} />
      </SectionsInViewMotion>

      <SectionsInViewMotion>
        <ProjectsLinear cards={projects} eyebrow={home.projectsSection.eyebrow} />
      </SectionsInViewMotion>

      <Nav navItems={settings.navItems} cta={settings.navCta} />

      <div className="relative z-10 bg-white/80">
        <SectionsInViewMotion>
          <FeaturesSection
            currentSlide={currentSlide}
            setCurrentSlide={setCurrentSlide}
            section={home.featureShowcase}
          />
        </SectionsInViewMotion>
        <LandingPage
          settings={settings}
          servicesSection={home.servicesSection}
          testimonialsSection={home.testimonialsSection}
          testimonials={testimonials}
          blogSection={home.blogSection}
          posts={posts}
        />
      </div>
    </div>
  );
}

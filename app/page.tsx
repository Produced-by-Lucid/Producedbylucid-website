import HomePageClient from '@/components/HomePageClient';
import {
  getHomePageContent,
  getPosts,
  getProjects,
  getSiteSettings,
  getTestimonials,
} from '@/lib/site-content';

export default async function Home() {
  const [home, settings, projects, testimonials, posts] = await Promise.all([
    getHomePageContent(),
    getSiteSettings(),
    getProjects(),
    getTestimonials(),
    getPosts(),
  ]);

  return (
    <HomePageClient
      home={home}
      settings={settings}
      projects={projects}
      testimonials={testimonials}
      posts={posts}
    />
  );
}

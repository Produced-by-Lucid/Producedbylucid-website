'use client';

import Image from 'next/image';

const posts = [
  {
    image: '/slider-imgs/pr-img-1.png',
    title: 'Designing Event Concepts That Convert',
    excerpt: 'How concept direction and spatial storytelling shape memorable brand moments.',
    meta: 'Insight',
  },
  {
    image: '/slider-imgs/pr-img-2.png',
    title: 'Production Checklists For Zero-Surprise Launches',
    excerpt: 'A practical structure for timelines, vendors, and on-site execution quality.',
    meta: 'Playbook',
  },
  {
    image: '/slider-imgs/prl-img-3.png',
    title: 'Post-Event Debriefs That Improve ROI',
    excerpt: 'Metrics and feedback loops your team can use immediately on the next campaign.',
    meta: 'Guide',
  },
];

export default function BlogPosts() {
  return (
    <section
      id="blog"
      className="relative px-4 sm:px-6 py-16 sm:py-24 -mt-8 bg-gradient-to-b from-[#174826]/0 from-10% to-black"
    >
      <div className="max-w-7xl mx-auto">
        <p className="section-title-text text-sm uppercase tracking-[0.45em] text-white/70 mb-4">Blog Posts</p>
        <h3 className="text-3xl sm:text-5xl font-bold text-white mb-10">Latest Stories</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post.title} className="rounded-2xl overflow-hidden border border-white/15 bg-black/25 backdrop-blur-sm">
              <div className="relative h-52 w-full">
                <Image src={post.image} alt={post.title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#DB612D] mb-2">{post.meta}</p>
                <h4 className="text-xl font-semibold text-white mb-2">{post.title}</h4>
                <p className="text-sm text-white/70">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

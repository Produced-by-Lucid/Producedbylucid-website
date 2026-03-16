'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { HomePageContent, PostSummary } from '@/lib/site-types';

type BlogPostsProps = {
  eyebrow: HomePageContent['blogSection']['eyebrow'];
  heading: HomePageContent['blogSection']['heading'];
  posts: PostSummary[];
};

export default function BlogPosts({ eyebrow, heading, posts }: BlogPostsProps) {
  return (
    <section
      id="blog"
      className="relative px-4 sm:px-6 py-16 sm:py-24 -mt-8 bg-gradient-to-b from-[#174826]/0 from-10% to-black"
    >
      <div className="max-w-7xl mx-auto">
        <p className="section-title-text text-sm uppercase tracking-[0.45em] text-white/70 mb-4">{eyebrow}</p>
        <h3 className="text-3xl sm:text-5xl font-bold text-white mb-10">{heading}</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/journal/${post.slug}`} className="block">
              <article className="rounded-2xl overflow-hidden border border-white/15 bg-black/25 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
              <div className="relative h-52 w-full">
                <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#DB612D] mb-2">{post.meta}</p>
                <h4 className="text-xl font-semibold text-white mb-2">{post.title}</h4>
                <p className="text-sm text-white/70">{post.excerpt}</p>
              </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

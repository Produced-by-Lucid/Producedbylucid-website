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
      className="relative min-h-screen bg-[#F0E7DB] px-4 py-16 sm:px-6 sm:pb-24 sm:pt-26"
    >

      <div className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center sm:pt-24">
        <p className="section-title-text mb-4 text-xs uppercase tracking-[0.35em] text-gray-400 sm:text-sm sm:tracking-[0.45em]">{eyebrow}</p>
        <h3 className="mb-10 text-2xl font-bold text-[#c4c4c4] sm:mb-20 sm:text-7xl">{heading}</h3>

        <div className="relative z-1 grid w-full grid-cols-1 gap-4 px-0 md:grid-cols-3 md:px-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/journal/${post.slug}`} className="block ">
              <article className="group flex flex-col-reverse justify-between overflow-hidden rounded-3xl border border-white/15 bg-white p-4 transition-transform duration-300 hover:-translate-y-1 hover:bg-[#105942] sm:min-h-160 sm:p-6">
              <div className="relative h-48 w-full overflow-hidden rounded-2xl sm:h-60">
                <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
              </div>
              <div className="relative space-y-2 py-5">
                                <Image src={'/new-spark.svg'} alt={'spark'}  className="absolute right-2 " height={25} width={25} />

                <p className="mb-2 pr-8 text-xl font-semibold text-gray-800 group-hover:text-[#FEF4CD] sm:text-2xl">{post.title}</p>
                <p className="text-sm font-medium text-gray-600 group-hover:text-white">{post.excerpt}</p>
                <p className="mt-2 mb-2 w-fit rounded-sm bg-[#DB612D] p-1 text-xs capitalize text-[#FEF4CD] group-hover:text-white">{post.meta}</p>
              </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
         <Image
                            src="/divider-convex-2.svg"
                            alt="Divider Shape"
                            width={1920}
                            height={689}
                            className="absolute scale-105   inset-x-0  w-screen  bottom-20 sm:translate-y-80 translate-y-30  object-cover"
                        />
    </section>
  );
}

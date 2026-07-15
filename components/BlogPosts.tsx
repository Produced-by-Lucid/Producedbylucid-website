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
      className="relative px-4 min-h-screen   sm:px-6 py-16 sm:pb-24 sm:pt-26 bg-[#F0E7DB] "
    >

      <div className="max-w-7xl relative  h-screen    flex items-center flex-col  mx-auto sm:pt-24">
        <p className="section-title-text text-sm uppercase tracking-[0.45em] text-gray-400 mb-4">{eyebrow}</p>
        <h3 className="text-3xl sm:text-7xl font-bold text-[#c4c4c4]  mb-20">{heading}</h3>

        <div className="grid grid-cols-1 relative h-full px-6 z-1 md:grid-cols-3 gap-1">
          {posts.map((post) => (
            <Link key={post.slug} href={`/journal/${post.slug}`} className="block ">
              <article className="rounded-3xl overflow-hidden border flex-col-reverse group justify-between  flex sm:min-h-160   border-white/15 bg-white hover:bg-[#105942] p-6 transition-transform duration-300 hover:-translate-y-1">
              <div className="relative rounded-2xl overflow-hidden  h-60 w-full">
                <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
              </div>
              <div className="py-5 space-y-2 relative  ">
                                <Image src={'/new-spark.svg'} alt={'spark'}  className="absolute right-2 " height={25} width={25} />

                <p className="text-2xl group-hover:text-[#FEF4CD] pr-8 font-semibold text-gray-800 mb-2">{post.title}</p>
                <p className="text-sm group-hover:text-white font-medium text-gray-600">{post.excerpt}</p>
                <p className="text-xs group-hover:text-white p-1 rounded-sm w-fit mt-2 bg-[#DB612D] capitalize text-[#FEF4CD] mb-2">{post.meta}</p>
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
                            className="absolute scale-105   inset-x-0  w-screen  bottom-20 translate-y-80   object-cover"
                        />
    </section>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import type { PostSummary, SiteSettings } from '@/lib/site-types';

type BlogFooterProps = {
  settings: SiteSettings;
  morePosts: PostSummary[];
};

export default function BlogFooter({ settings, morePosts }: BlogFooterProps) {
  return (
    <>
      {morePosts.length > 0 && (
        <section className="bg-[#0d1f14] px-4 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-4xl">
            <p className="mb-2 text-xs uppercase tracking-[0.4em] text-[#DB612D]">More Posts</p>
            {/* <h2 className="mb-10 text-3xl font-bold text-white sm:text-4xl">More from the journal</h2> */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {morePosts.map((post) => (
                <Link key={post.slug} href={`/journal/${post.slug}`} className="group block">
                  <article className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm transition-transform duration-300 group-hover:-translate-y-1">
                    <div className="relative h-44 w-full">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                    <div className="p-4">
                      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[#DB612D]">{post.meta}</p>
                      <h3 className="text-base font-semibold text-white">{post.title}</h3>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    
    </>
  );
}

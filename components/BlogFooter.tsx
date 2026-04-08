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

      <footer
        id="contact"
        className="relative flex min-h-[60vh] flex-col justify-end gap-14 bg-linear-to-b from-black from-60% to-[#19532B] py-8 sm:gap-20 sm:py-12"
      >
        <div className="w-full space-y-8 text-center text-cream/60">
          <div className="absolute bottom-0 z-0 mb-8 h-32 w-full sm:h-48 md:h-64">
            <Image
              src="/sharp-light.svg"
              alt="Produced by Lucid Footer Logo"
              fill
              className="h-full w-full scale-x-150 object-cover blur-3xl sm:scale-x-200"
            />
          </div>
          <div className="relative z-10 mb-8 w-full overflow-hidden border-b border-cream font-[Castio]">
            <div
              className="animate-scroll-x flex w-max items-center whitespace-nowrap text-outline mix-blend-color-dodge will-change-transform text-5xl sm:text-6xl md:text-[14rem]"
              style={{ animationDuration: '80s' }}
            >
              <div className="flex shrink-0 items-center font-[castio]">
                <span className="mb-6 mr-10 font-bold uppercase">{settings.footerMarqueeText}</span>
                <span className="mb-6 mr-10 font-bold uppercase">*</span>
                <span className="mb-6 mr-10 font-bold uppercase">{settings.footerMarqueeText}</span>
                <span className="mb-6 mr-10 font-bold uppercase">*</span>
                <span className="mb-6 mr-10 font-bold uppercase">{settings.footerMarqueeText}</span>
              </div>
              <div className="flex shrink-0 items-center font-[castio]" aria-hidden="true">
                <span className="mb-6 mr-10 font-bold uppercase">let&apos;s create a masterpiece</span>
                <span className="mb-6 mr-10 font-bold uppercase">*</span>
                <span className="mb-6 mr-10 font-bold uppercase">{settings.footerMarqueeText}</span>
                <span className="mb-6 mr-10 font-bold uppercase">*</span>
                <span className="mb-6 mr-10 font-bold uppercase">{settings.footerMarqueeText}</span>
              </div>
            </div>
          </div>
          <div className="relative flex w-full flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:gap-4">
            <a
              href={settings.footerPrimaryCta.url}
              className="w-full min-w-xs justify-center rounded-full bg-cream px-6 py-3 font-bold text-black transition-colors hover:bg-cream/80 sm:w-auto"
            >
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
          <p className="w-full px-6 py-5 text-center text-sm opacity-70 duration-200 hover:opacity-100 sm:text-right sm:text-base">
            {settings.footerCopyright}
          </p>
        </div>
      </footer>
    </>
  );
}

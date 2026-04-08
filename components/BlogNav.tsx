import { getSiteSettings } from '@/lib/site-content';
import Image from 'next/image';
import Link from 'next/link';

export default async function BlogNav() {
  const settings = await getSiteSettings();

  return (
    <nav className="fixed top-0 z-50 flex w-screen items-center justify-between border-b border-white/10 bg-[#0d1f14]/80 px-4 py-4 backdrop-blur-md sm:px-8 sm:py-5">
      <Link href="/">
        <Image
          src="/lucid-logo.svg"
          alt="Lucid logo"
          width={120}
          height={36}
          className="h-8 w-auto"
        />
      </Link>
      <div className="flex items-center gap-6 sm:gap-10">
        {/* <Link
          href="/#blog"
          className="text-xs uppercase tracking-[0.3em] text-cream/60 transition-colors duration-200 hover:text-[#DB612D]"
        >
          Journal
        </Link> */}
        <a
          href={settings.navCta.href}
          className="rounded-full border border-cream/30 bg-transparent px-4 py-2 text-[10px] font-medium uppercase tracking-widest text-cream transition-all duration-300 hover:bg-cream hover:text-black sm:px-6 sm:py-2.5 sm:text-xs"
        >
          {settings.navCta.label}
        </a>
      </div>
    </nav>
  );
}

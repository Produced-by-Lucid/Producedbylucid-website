'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { SiteSettings } from '@/lib/site-types';

type BlogNavProps = {
  settings: SiteSettings;
};

export default function BlogNav({ settings }: BlogNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const [isStuck, setIsStuck] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const updateStuckState = () => {
      const navTop = navRef.current?.getBoundingClientRect().top ?? 1;
      setIsStuck(navTop <= 0);
      setHasScrolled(window.scrollY >= 600);
    };

    updateStuckState();
    window.addEventListener('scroll', updateStuckState, { passive: true });
    window.addEventListener('resize', updateStuckState);

    return () => {
      window.removeEventListener('scroll', updateStuckState);
      window.removeEventListener('resize', updateStuckState);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${hasScrolled ? 'bg-white py-2' : 'pt-8 max-sm:pt-3'} ease-out`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 overflow-hidden px-3 py-2.5 sm:px-6 sm:py-2 max-sm:overflow-visible">
        <div className={`overflow-hidden transition-[width] duration-300 ease-out ${isStuck ? '' : 'w-0'}`}>
          <Link href="/">
            <Image
              src="/lucid-logo.svg"
              alt="Lucid logo"
              width={200}
              height={60}
              className={`h-6 w-auto object-center sm:h-10 md:h-10 ${hasScrolled ? 'brightness-0' : ''}`}
            />
          </Link>
        </div>

        <div className="hidden items-center gap-4 sm:flex">
          <div className={`flex items-center justify-center gap-5 rounded-full border px-4 py-2 ${hasScrolled ? 'border-gray-300 brightness-0' : 'border-gray-50/20!'} `}>
            {settings.navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md bg-transparent px-3 py-2 text-center text-sm font-medium text-inherit transition-all duration-300 hover:bg-cream hover:text-white md:px-4 md:py-2.5 md:text-base"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className={`duration-1000 ease-in-out delay-500 ${hasScrolled ? 'w-auto' : 'w-0'}`}>
            <a
              href={settings.navCta.href}
              className={`mx-auto flex min-w-28 items-center justify-between gap-3 whitespace-nowrap rounded-full bg-[#DB612D] py-2 pl-4 pr-2 text-sm font-bold text-white transition-all duration-200 hover:text-black after:absolute after:-translate-x-[150%] after:rounded-full after:bg-[#ffebaa] after:mix-blend-screen after:duration-600 after:ease-in-out hover:after:-translate-x-[10%] ${hasScrolled ? 'w-auto rotate-0 opacity-100' : 'w-0 rotate-15 opacity-0'}`}
            >
              <p className="relative z-10">{settings.navCta.label}</p>
              <Image alt="chat" className="relative z-10 duration-600 delay-150 ease-in-out group-hover:brightness-0" width={20} height={20} src="/chat-icon.svg" />
            </a>
          </div>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
          className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full border transition-colors sm:hidden ${hasScrolled ? 'border-black/15 text-black' : 'border-white/30 text-white'}`}
        >
          <span className="sr-only">Menu</span>
          <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
            <span className={`h-px w-full bg-current transition-transform duration-300 ${isMenuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`h-px w-full bg-current transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`h-px w-full bg-current transition-transform duration-300 ${isMenuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </span>
        </button>

        <div
          id="mobile-navigation"
          className={`absolute left-3 right-3 top-full mt-2 origin-top rounded-2xl border p-2 shadow-xl backdrop-blur-md transition-all duration-200 sm:hidden ${hasScrolled ? 'border-black/10 bg-white/95' : 'border-white/15 bg-[#082210]/95'} ${isMenuOpen ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0'}`}
        >
          <div className="flex flex-col gap-1">
            {settings.navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${hasScrolled ? 'text-black hover:bg-black/5' : 'text-white hover:bg-white/10'}`}
              >
                {item.label}
              </a>
            ))}
            <a
              href={settings.navCta.href}
              onClick={() => setIsMenuOpen(false)}
              className="mt-1 flex items-center justify-between rounded-xl bg-[#DB612D] px-4 py-3 text-sm font-bold text-white"
            >
              {settings.navCta.label}
              <Image alt="" aria-hidden="true" width={18} height={18} src="/chat-icon.svg" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

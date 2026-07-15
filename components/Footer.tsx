'use client';

import Image from 'next/image';
import type { SiteSettings } from '@/lib/site-types';

type FooterProps = {
  settings: SiteSettings;
};

export default function Footer({ settings }: FooterProps) {
  return (
    <footer
      id="contact"
      className="relative z-10 flex min-h-[60vh] scroll-mt-24 flex-col justify-end gap-14  py-8 sm:gap-20 sm:py-12"
    >
      <div className="w-full max-w-7xl mx-auto  text-center space-y-8 text-cream/60">
        <div className="absolute bottom-0 z-0 mb-8 h-32 w-full sm:h-48 md:h-64">
        </div>
        <div className="relative flex w-full flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:gap-4">
          <a
            href={settings.footerPrimaryCta.url}
            className="w-full justify-center rounded-full min-w-xs bg-cream px-6 py-3 font-bold text-black transition-colors hover:bg-cream/80 sm:w-auto"
          >
            {settings.footerPrimaryCta.label}
          </a>

          <div className="flex gap-6 sm:gap-4 [&>a]:px-8 [&>a]:hover:text-[#ff7c24]">
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
  );
}

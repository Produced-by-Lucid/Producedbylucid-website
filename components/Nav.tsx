'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { NavItem, SiteSettings } from '@/lib/site-types';

type NavProps = {
    navItems: NavItem[];
    cta: SiteSettings['navCta'];
};

export default function Nav({ navItems, cta }: NavProps) {
    const navRef = useRef<HTMLElement>(null);
    const [isStuck, setIsStuck] = useState(false);

    useEffect(() => {
        const updateStuckState = () => {
            const navTop = navRef.current?.getBoundingClientRect().top ?? 1;
            setIsStuck(navTop <= 0);
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
            className={`sticky left-0 right-0 top-0 z-50 transition-all duration-300 bg-[#DB612D] hover:mix-blend-normal    ease-out ${
                isStuck ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0 pointer-events-none'
            }`}
        >
            <div className="mx-auto flex w-full   items-center justify-between gap-3 px-3 py-2.5 sm:px-6 sm:py-4">
                <div className={`overflow-hidden  transition-[width] duration-300 ease-out ${isStuck ? 'w-[96px] sm:w-[160px] md:w-[200px]' : 'w-0'}`}>
                    <Link href={'/'} >
                        <Image
                            src="/lucid-logo.svg"
                            alt="Logo"
                            width={200}
                            height={60}
                            className="h-8 sm:h-10 md:h-12 w-auto object-center"
                        />
                    </Link>
                </div>
                <div className="hidden sm:flex flex-1  items-center">
                    {navItems.map((item) => (
                        <div key={item.href} className="flex flex-1 justify-center gap-[2rem] items-center">
                            <a
                                href={item.href}
                                className="rounded-md bg-transparent text-center  px-3 py-2 text-sm font-medium text-cream transition-all duration-300 hover:bg-cream hover:text-white md:px-4 md:py-2.5 md:text-base"
                            >
                                {item.label}
                            </a>
                            {/* {index < navItems.length - 1 ? (
                                <svg width="100%" height="2" viewBox="0 0 100 2" preserveAspectRatio="none" className="mx-2 flex-1 stroke-cream/30">
                                    <line x1="0" y1="1" x2="100" y2="1" stroke="currentColor" strokeWidth="0.5" />
                                </svg>
                            ) : null} */}
                        </div>
                    ))}
                </div>
                <a href={cta.href} className="ml-auto rounded-full border border-cream/70 bg-transparent px-3 py-2 text-xs font-medium text-cream transition-all duration-300 hover:bg-cream hover:text-white sm:ml-0 sm:px-6 sm:py-2.5 sm:text-base">
                    {cta.label}
                </a>
            </div>
        </nav>
    );
}

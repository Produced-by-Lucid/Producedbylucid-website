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
            <div className="mx-auto flex w-full max-w-7xl overflow-hidden items-center justify-between gap-3 px-3 py-2.5 sm:px-6 sm:py-2 max-sm:overflow-visible">
                <div className={`overflow-hidden  transition-[width] duration-300 ease-out ${isStuck ? '' : 'w-0'}`}>
                    <Link href={'/'} >
                        <Image
                            src="/lucid-logo.svg"
                            alt="Logo"
                            width={200}
                            height={60}
                            className={`h-6 sm:h-10 md:h-10 w-auto object-center ${hasScrolled ? 'brightness-0' : ''}`}
                        />
                    </Link>
                </div>

                <div className="hidden sm:flex gap-4 items-center">
                    <div className={`px-4 py-2 border border-gray-50/20! rounded-full flex justify-center gap-5 items-center ${hasScrolled ? 'brightness-0 border-gray-300' : ''} `}>

                        {navItems.map((item) => (

                            <div key={item.href} className=" ">
                                <a
                                    href={item.href}
                                    className="rounded-md bg-transparent text-center  px-3 py-2 text-sm  font-medium   transition-all duration-300 hover:bg-cream hover:text-white md:px-4 md:py-2.5 md:text-base"
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

                    <div className={`duration-1000 ease-in-out delay-500 ${hasScrolled ? 'w-auto ' : 'w-0'}`}>
                        <a href={cta.href} className={`flex items-center  justify-between font-bold min-w-28 gap-3 mx-auto relative whitespace-nowrap group rounded-full
                        after:h-24 after:w-[130%] after:duration-600 after:ease-in-out hover:after:-translate-x-[10%] after:rounded-full  overflow-hidden after:-translate-x-[150%] after:bg-[#ffebaa]  after:absolute after:mix-blend-screen bg-[#DB612D]
                        hover:max-w-34 duration-200  pl-4 pr-2 py-2 text-sm  text-white  hover:text-black  ${hasScrolled ? '  w-auto  rotate-0 opacity-100 ' : ' rotate-15 opacity-0 w-0'}`}>
                        <p className="relative z-1">{cta.label}</p>

                        <Image alt='chat' className='group-hover:brightness-0 duration-600 delay-150 ease-in-out relative z-1' width={20} height={20} src='/chat-icon.svg' />

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
                        {navItems.map((item) => (
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
                            href={cta.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="mt-1 flex items-center justify-between rounded-xl bg-[#DB612D] px-4 py-3 text-sm font-bold text-white"
                        >
                            {cta.label}
                            <Image alt="" aria-hidden="true" width={18} height={18} src="/chat-icon.svg" />
                        </a>
                    </div>
                </div>


            </div>
        </nav>
    );
}

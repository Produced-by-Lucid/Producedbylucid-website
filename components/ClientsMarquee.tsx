import Image from 'next/image';

const clientLogos = [
  { src: '/clients/bmoni.png', alt: 'Bmoni' },
  { src: '/clients/busha.png', alt: 'Busha' },
  { src: '/clients/cleva.png', alt: 'Cleva' },
  { src: '/clients/dantown.png', alt: 'Dantown' },
  { src: '/clients/eclipse.png', alt: 'Eclipse' },
  { src: '/clients/glove.png', alt: 'Glove' },
  { src: '/clients/jewelrry-banc.png', alt: 'Jewelry Banc' },
  { src: '/clients/justbrandit.png', alt: 'Just Brand It' },
  { src: '/clients/monieworld.png', alt: 'Monieworld' },
  { src: '/clients/oscafest.png', alt: 'Oscafest' },
  { src: '/clients/piggyvest.png', alt: 'Piggyvest' },
  { src: '/clients/sabi.png', alt: 'Sabi' },
];

type ClientsMarqueeProps = {
  className?: string;
};

export default function ClientsMarquee({ className = '' }: ClientsMarqueeProps) {
  return (
    <div className={`relative z-20 mx-auto w-full max-w-8xl px-4 py-8 ${className}`.trim()}>
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#1B5E3F]/70 sm:text-sm">
        Trusted by 
      </p>
      <div className="relative overflow-hidden rounded-full px-3 py-4 shadow-[0_12px_40px_rgba(27,94,63,0.08)] backdrop-blur-sm mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] sm:px-5">
        <div className="animate-scroll-x flex w-max items-center gap-12 py-2 sm:gap-12">
          {[...clientLogos, ...clientLogos].map((logo, index) => (
            <div key={`${logo.src}-${index}`} className="flex h-9 shrink-0 items-center sm:h-12">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={140}
                height={48}
                sizes="(max-width: 640px) 110px, 140px"
                className="h-12 w-auto  object-contain brightness-0 opacity-90 sm:h-24 sm:max-w-64"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

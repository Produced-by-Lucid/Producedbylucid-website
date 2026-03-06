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

export default function ClientsMarquee() {
  return (
    <div className="mt-10 w-full max-w-4xl">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#1B5E3F]/70 sm:text-sm">
        Trusted by clients
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="animate-scroll-x flex w-max items-center gap-8 py-2 sm:gap-12">
          {[...clientLogos, ...clientLogos].map((logo, index) => (
            <div key={`${logo.src}-${index}`} className="relative h-9 w-[110px] shrink-0 sm:h-12 sm:w-[140px]">
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                sizes="(max-width: 640px) 110px, 140px"
                className="object-contain opacity-85"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

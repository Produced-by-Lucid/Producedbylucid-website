'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const testimonials = [
  {
    quote:
      "Shout out to Produced by Lucid. When we reached out to them, they took the time to truly listen to our ideas. Bringing our vision to life was intense, but they executed it flawlessly. At this year's Moonshot event, we had ample space to engage with both potential and existing customers. The booth was beautiful, all-inclusive, and mind-blowing. Visitors kept telling us it was one of the best at the event. We're truly grateful and look forward to creating more beautiful spaces together.",
    author: 'Patience',
    company: 'Busha Digital Limited ',
  },
  {
    quote:
      'The decor this year at Moonshot 2025 was a significant improvement from last year - absolutely impressive. What stood out most was seeing the solid minerals displayed in their physical forms, including copper and others we actively trade. It attracted a lot of engagement, with many visitors stopping to take pictures and interact with materials they had only previously seen in books or school. Thumbs up to Produced by Lucid. We would love to work together again next year.',
    author: 'Olabisi Oyedon',
    company: 'Head of Warehouse & Logistics Operations, Sabi ',
  },
  {
    quote:
      'Produced by Lucid handled all our event needs seamlessly. The entire process was smooth and stress-free for my team. They truly took the pressure off us and delivered beautifully. Highly recommended.',
    author: 'Natasha',
    company: 'Bmoni',
  },
  {
    quote:
      "After the incredible execution of our first anniversary, choosing Produced by Lucid again for our second anniversary was an easy decision. Working with Lucid gives you complete peace of mind. Peace is open, collaborative, and attentive to your ideas - but what truly stands out is the execution. You share your vision, and by the time you step into the venue, it exceeds your expectations. The team is reliable, cooperative, and incredibly helpful. It's like handing everything over and knowing it's fully covered. We look forward to many more years of collaboration.",
    author: 'Oluwatosin Fasoro-Joseph',
    company: 'Head of Operations, Cleva',
  },
  {
    quote:
      'Lucid did an amazing job. The way they blended the Christmas and traditional themes was beautiful. The ambience was stunning.',
    author: 'Somto',
    company: 'CEO & Co-founder, PiggyVest',
  },
  {
    quote: 'Lucid delivers every time - amazing production, amazing visuals. I loved everything.',
    author: 'Joshua Chibueze',
    company: 'CMO & Co-founder, PiggyVest',
  },
];

const heartFrames = [
  '/heart/hrt01.png',
  '/heart/hrt02.png',
  '/heart/hrt03.png',
  '/heart/hrt04.png',
  '/heart/hrt05.png',
  '/heart/hrt06.png',
  '/heart/hrt07.png',
  '/heart/hrt08.png',
];

export default function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [heartFrameIndex, setHeartFrameIndex] = useState(0);
  const clientsTrackRef = useRef<HTMLDivElement | null>(null);
  const clientButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const track = clientsTrackRef.current;
    const activeButton = clientButtonRefs.current[currentTestimonial];
    if (!track || !activeButton) return;

    const centeredLeft = activeButton.offsetLeft - (track.clientWidth - activeButton.clientWidth) / 2;
    track.scrollTo({
      left: centeredLeft,
      behavior: 'smooth',
    });
  }, [currentTestimonial]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeartFrameIndex((prev) => (prev + 1) % heartFrames.length);
    }, 90);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section
      id="testimonials"
      className="relative flex min-h-screen z-10 scroll-mt-24 items-end justify-center px-4 py-16 pt-[20vh] sm:px-6 sm:py-40"
    >
      <div className="testimonial-content max-sm:px-4  relative z-10 mx-auto flex w-full max-w-7xl items-center justify-center">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 lg:gap-12">
          <button
            onClick={() =>
              setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
            }
            className="hidden h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-cream/30 transition-all hover:border-cream sm:flex sm:h-16 sm:w-16 sm:-translate-x-30 sm:translate-y-25"
          >
            <span className="text-2xl">&larr;</span>
          </button>

          <div className="relative ">
            <div className="pointer-events-none  absolute inset-0 flex -translate-y-40 items-center justify-center overflow-visible sm:inset-0 sm:top-[30vh] sm:-translate-y-60">
              <svg viewBox="0 0 560 520" className="w-[95vw] max-w-[560px] sm:translate-y-10 overflow-visible sm:w-full sm:max-w-3xl">
                <defs>
                  <path
                    id="testimonial-top-curve"
                    d="M -60,330 C 80,120 170,40 280,40 C 390,40 480,120 650,330"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                </defs>

                <text
                  className="section-title-text"
                  fontSize="clamp(60px, 8.5vw, 74px)"
                  fontFamily="var(--font-display), sans-serif"
                  fontWeight="300"
                  fill="none"
                  stroke="#FFE1CD"
                  strokeWidth=".5"
                  letterSpacing="1"
                >
                  <textPath
                    href="#testimonial-top-curve"
                    startOffset="50%"
                    textAnchor="middle"
                    className="testimonial-curved-text"
                  >
                    WORDS FROM OUR CLIENTS
                  </textPath>
                </text>
              </svg>
            </div>

            <div className="relative  w-full mx-auto px-4 py-16 text-center sm:px-12 sm:py-20">
              <div className="relative max-sm:px-4 mb-4 flex justify-center transition-opacity duration-500">
                <Image src="/quote-bubble.png" alt="Quote" width={150} height={500} className="object-contain" />
                <div className="pointer-events-none absolute translate-x-10">
                  <Image
                    src={heartFrames[heartFrameIndex]}
                    alt=""
                    width={48}
                    height={48}
                    className="h-10 w-10 object-contain mix-blend-hard-light  sm:h-20 sm:w-20"
                    aria-hidden
                  />
                </div>
              </div>

              <p className="mb-10 text-base leading-relaxed max-w-xl md:min-h-[35vh] px-4 flex items-center justify-center transition-all duration-700 ease-out sm:text-lg md:text-xl">
                {testimonials[currentTestimonial].quote}
              </p>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#174826] to-transparent sm:w-32" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#174826] to-transparent sm:w-32" />
                <div
                  ref={clientsTrackRef}
                  className="flex items-start w-screen gap-5 overflow-x-auto px-[50%] text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-w-xl sm:gap-[8rem] sm:text-sm"
                >
                  {testimonials.map((testimonial, index) => (
                    <button
                      key={testimonial.author}
                      ref={(el) => {
                        clientButtonRefs.current[index] = el;
                      }}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`flex-shrink-0 text-center text-sm transition-all  duration-500  sm:whitespace-nowrap ${index === currentTestimonial
                          ? 'scale-110 text-cream opacity-100'
                          : 'scale-100 text-cream opacity-30 hover:opacity-70'
                        }`}
                    >
                      <p className="uppercase">{testimonial.author} {' '}</p>
                      <span className={index === currentTestimonial  ? 'text-[#DB612D]  ' : 'max-w-xs max-sm:px-12'}>
                        {testimonial.company}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex items-center justify-center gap-4 sm:hidden">
                <button
                  onClick={() =>
                    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
                  }
                  className="h-11 w-11 rounded-full border border-cream/30 transition-all hover:border-cream"
                >
                  <span className="text-xl">&larr;</span>
                </button>
                <button
                  onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                  className="h-11 w-11 rounded-full border border-cream/30 transition-all hover:border-cream"
                >
                  <span className="text-xl">&rarr;</span>
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
            className="hidden h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-cream/30 transition-all hover:border-cream sm:flex sm:h-16 sm:w-16 sm:translate-x-30 sm:translate-y-25"
          >
            <span className="text-2xl">&rarr;</span>
          </button>
        </div>
      </div>
    </section>
  );
}

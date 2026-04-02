import type { RefObject } from 'react';

type HeroCurvedHeadlineProps = {
  curvedHeadline: string;
  svgRef: RefObject<SVGSVGElement | null>;
};

export default function HeroCurvedHeadline({ curvedHeadline, svgRef }: HeroCurvedHeadlineProps) {
  return (
    <div className=" relative top-28  h-[52vh] hidden w-full items-center sm:top-24 md:top-32 lg:32 max-sm:hidden   sm:h-screen">
      <svg
        ref={svgRef}
        viewBox="0 0 1200 850"
        className="absolute left-0  w-full scale-140 sm:top-14 sm:h-screen sm:scale-110"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <path id="curve" d="M 100 560 A 500 320 0 0 1 1100 560" fill="none" />
        </defs>

        <text
          className="font-bold uppercase fill-[#1B5E3F]"
          fontSize="56"
          fontFamily="var(--font-display), sans-serif"
          letterSpacing="1"
          fontWeight="700"
        >
          <textPath href="#curve" xlinkHref="#curve" startOffset="50%" textAnchor="middle">
            {curvedHeadline}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
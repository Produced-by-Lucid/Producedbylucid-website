export type NavItem = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  url: string;
};

export type SiteSettings = {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  titleTemplate: string;
  description: string;
  abstract: string;
  keywords: string[];
  creator: string;
  publisher: string;
  category: string;
  themeColor: string;
  ogImage: string;
  twitterHandle: string;
  navItems: NavItem[];
  navCta: {
    label: string;
    href: string;
  };
  footerMarqueeText: string;
  footerPrimaryCta: {
    label: string;
    url: string;
  };
  socialLinks: SocialLink[];
  footerCopyright: string;
};

export type HomePageContent = {
  hero: {
    mobileHeadline: string;
    curvedHeadline: string;
    eyebrow: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaUrl: string;
  };
  featureShowcase: {
    headingPrefix: string;
    highlightWord: string;
    description: string;
    slides: {
      image: string;
      title: string;
    }[];
  };
  projectsSection: {
    eyebrow: string;
  };
  servicesSection: {
    eyebrow: string;
    items: {
      title: string;
      content: string;
    }[];
  };
  testimonialsSection: {
    curvedHeading: string;
  };
  blogSection: {
    eyebrow: string;
    heading: string;
  };
};

export type ProjectEntry = {
  order: number;
  company: string;
  title: string;
  date: string;
  image: string;
  video?: string;
  href: string;
};

export type TestimonialEntry = {
  order: number;
  author: string;
  company: string;
  quote: string;
};

export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  meta: string;
  coverImage: string;
  publishedAt: string;
};

export type PostDetail = PostSummary & {
  body: string;
};

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
    headlinePrefix: string;
headlineSuffix: string;
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
    heading: string;
  };
  servicesSection: {
    services: { title: string; content: string; }[];
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
  teamSection: {
    heading: string;
    description: string;
    members: {
      name: string;
      role: string;
      image: string;
      instagram: string;
      linkedIn: string;
    }[];
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

// ---------------------------------------------------------------------------
// Blog block types — structured content blocks for the block-based editor
// ---------------------------------------------------------------------------

export type ImageBlock = {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
  width?: 'small' | 'medium' | 'large' | 'full';
};

export type HeadingBlock = {
  type: 'heading';
  level: 2 | 3 | 4;
  text: string;
};

export type SubheadingBlock = {
  type: 'subheading';
  text: string;
};

export type ParagraphBlock = {
  type: 'paragraph';
  text: string;
};

export type QuoteBlock = {
  type: 'quote';
  text: string;
  attribution?: string;
};

export type CtaBlock = {
  type: 'cta';
  label: string;
  url: string;
  style?: 'primary' | 'secondary' | 'outline';
};

export type ListBlock = {
  type: 'list';
  style: 'ordered' | 'unordered';
  items: string[];
};

export type DividerBlock = {
  type: 'divider';
};

export type EmbedBlock = {
  type: 'embed';
  url: string;
  caption?: string;
};

export type CalloutBlock = {
  type: 'callout';
  variant: 'tip' | 'warning' | 'info';
  text: string;
};

export type CodeBlock = {
  type: 'code';
  language?: string;
  code: string;
};

export type BlogBlock =
  | ImageBlock
  | HeadingBlock
  | SubheadingBlock
  | ParagraphBlock
  | QuoteBlock
  | CtaBlock
  | ListBlock
  | DividerBlock
  | EmbedBlock
  | CalloutBlock
  | CodeBlock;

export type BlogPostData = {
  title: string;
  excerpt: string;
  meta: string;
  coverImage: string;
  publishedAt: string;
  blocks: BlogBlock[];
  /** Rich-text HTML content — used instead of blocks when present */
  html?: string;
};

// ---------------------------------------------------------------------------
// Post summary / detail types used by pages and content loaders
// ---------------------------------------------------------------------------

export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  meta: string;
  coverImage: string;
  publishedAt: string;
};

export type PostDetail = PostSummary & {
  blocks: BlogBlock[];
  /** Rich-text HTML content — used instead of blocks when present */
  html?: string;
  /** @deprecated kept for legacy .md posts only */
  body: string;
};

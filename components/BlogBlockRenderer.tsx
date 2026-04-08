import Image from 'next/image';
import type { BlogBlock } from '@/lib/site-types';

// ---------------------------------------------------------------------------
// Width mapping for resizable images
// ---------------------------------------------------------------------------

const IMAGE_WIDTH_CLASS: Record<string, string> = {
  small: 'max-w-sm mx-auto',
  medium: 'max-w-2xl mx-auto',
  large: 'max-w-4xl mx-auto',
  full: 'w-full',
};

// ---------------------------------------------------------------------------
// Callout variant styles
// ---------------------------------------------------------------------------

const CALLOUT_STYLES: Record<string, { border: string; bg: string; icon: string }> = {
  tip: { border: 'border-emerald-500/40', bg: 'bg-emerald-900/20', icon: '💡' },
  warning: { border: 'border-amber-500/40', bg: 'bg-amber-900/20', icon: '⚠️' },
  info: { border: 'border-sky-500/40', bg: 'bg-sky-900/20', icon: 'ℹ️' },
};

// ---------------------------------------------------------------------------
// Utility: parse simple inline markdown (bold, italic, links)
// ---------------------------------------------------------------------------

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Pattern matches: **bold**, *italic*, [text](url)
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={match.index}>{match[4]}</em>);
    } else if (match[5]) {
      parts.push(
        <a
          key={match.index}
          href={match[7]}
          className="text-[#DB612D] underline underline-offset-2 hover:text-[#e88a5e] transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[6]}
        </a>,
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

// ---------------------------------------------------------------------------
// Embed helper: convert watch URLs to embed URLs
// ---------------------------------------------------------------------------

function getEmbedSrc(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

// ---------------------------------------------------------------------------
// Individual block renderers
// ---------------------------------------------------------------------------

function ImageBlockComponent({ block }: { block: Extract<BlogBlock, { type: 'image' }> }) {
  const widthClass = IMAGE_WIDTH_CLASS[block.width ?? 'full'] ?? IMAGE_WIDTH_CLASS.full;
  return (
    <figure className={`${widthClass} my-8 sm:my-12`}>
      <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: '16/9' }}>
        <Image src={block.src} alt={block.alt || ''} fill className="object-cover" sizes="100vw" />
      </div>
      {block.caption && (
        <figcaption className="mt-2 text-center text-sm text-cream/50">{block.caption}</figcaption>
      )}
    </figure>
  );
}

function HeadingBlockComponent({ block }: { block: Extract<BlogBlock, { type: 'heading' }> }) {
  const Tag = `h${block.level}` as const;
  const sizeClass =
    block.level === 2
      ? 'text-2xl sm:text-3xl font-bold'
      : block.level === 3
        ? 'text-xl sm:text-2xl font-semibold'
        : 'text-lg sm:text-xl font-semibold';
  return <Tag className={`${sizeClass} text-white pt-4`}>{block.text}</Tag>;
}

function SubheadingBlockComponent({ block }: { block: Extract<BlogBlock, { type: 'subheading' }> }) {
  return <p className="text-lg sm:text-xl font-medium text-cream/60">{block.text}</p>;
}

function ParagraphBlockComponent({ block }: { block: Extract<BlogBlock, { type: 'paragraph' }> }) {
  return <p className="text-base sm:text-lg leading-8 text-cream/85">{parseInlineMarkdown(block.text)}</p>;
}

function QuoteBlockComponent({ block }: { block: Extract<BlogBlock, { type: 'quote' }> }) {
  return (
    <blockquote className="border-l-4 border-[#DB612D] pl-5 py-2 my-2">
      <p className="text-lg italic text-cream/90">&ldquo;{block.text}&rdquo;</p>
      {block.attribution && (
        <footer className="mt-2 text-sm text-cream/50">&mdash; {block.attribution}</footer>
      )}
    </blockquote>
  );
}

function CtaBlockComponent({ block }: { block: Extract<BlogBlock, { type: 'cta' }> }) {
  const base = 'inline-block rounded-full px-7 py-3 text-sm font-semibold tracking-wide transition-colors';
  const variant =
    block.style === 'secondary'
      ? 'bg-cream/10 text-cream hover:bg-cream/20'
      : block.style === 'outline'
        ? 'border border-[#DB612D] text-[#DB612D] hover:bg-[#DB612D]/10'
        : 'bg-[#DB612D] text-white hover:bg-[#c55520]';
  return (
    <div className="flex justify-center py-2">
      <a href={block.url} className={`${base} ${variant}`} target="_blank" rel="noopener noreferrer">
        {block.label}
      </a>
    </div>
  );
}

function ListBlockComponent({ block }: { block: Extract<BlogBlock, { type: 'list' }> }) {
  const Tag = block.style === 'ordered' ? 'ol' : 'ul';
  const listClass =
    block.style === 'ordered'
      ? 'list-decimal list-inside space-y-1 text-cream/85'
      : 'list-disc list-inside space-y-1 text-cream/85';
  return (
    <Tag className={listClass}>
      {block.items.map((item, i) => (
        <li key={i} className="text-base sm:text-lg leading-7">
          {parseInlineMarkdown(item)}
        </li>
      ))}
    </Tag>
  );
}

function DividerBlockComponent() {
  return <hr className="border-t border-cream/15 my-4" />;
}

function EmbedBlockComponent({ block }: { block: Extract<BlogBlock, { type: 'embed' }> }) {
  const embedSrc = getEmbedSrc(block.url);
  if (!embedSrc) {
    return (
      <div className="rounded-2xl border border-cream/20 p-6 text-center">
        <a
          href={block.url}
          className="text-[#DB612D] underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          View embedded content
        </a>
      </div>
    );
  }
  return (
    <figure>
      <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: '16/9' }}>
        <iframe
          src={embedSrc}
          title={block.caption || 'Embedded content'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      {block.caption && (
        <figcaption className="mt-2 text-center text-sm text-cream/50">{block.caption}</figcaption>
      )}
    </figure>
  );
}

function CalloutBlockComponent({ block }: { block: Extract<BlogBlock, { type: 'callout' }> }) {
  const style = CALLOUT_STYLES[block.variant] ?? CALLOUT_STYLES.info;
  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} px-5 py-4 flex gap-3 items-start`}>
      <span className="text-xl leading-none mt-0.5">{style.icon}</span>
      <p className="text-base text-cream/85 leading-7">{parseInlineMarkdown(block.text)}</p>
    </div>
  );
}

function CodeBlockDisplay({ block }: { block: Extract<BlogBlock, { type: 'code' }> }) {
  return (
    <div className="rounded-xl bg-[#0a1810] border border-cream/10 overflow-hidden">
      {block.language && (
        <div className="px-4 py-1.5 text-xs text-cream/40 border-b border-cream/10 uppercase tracking-wider">
          {block.language}
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-cream/80 font-mono leading-6">{block.code}</code>
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main renderer — maps each block to its component
// ---------------------------------------------------------------------------

export function BlogBlockRenderer({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'image':
            return <ImageBlockComponent key={index} block={block} />;
          case 'heading':
            return <HeadingBlockComponent key={index} block={block} />;
          case 'subheading':
            return <SubheadingBlockComponent key={index} block={block} />;
          case 'paragraph':
            return <ParagraphBlockComponent key={index} block={block} />;
          case 'quote':
            return <QuoteBlockComponent key={index} block={block} />;
          case 'cta':
            return <CtaBlockComponent key={index} block={block} />;
          case 'list':
            return <ListBlockComponent key={index} block={block} />;
          case 'divider':
            return <DividerBlockComponent key={index} />;
          case 'embed':
            return <EmbedBlockComponent key={index} block={block} />;
          case 'callout':
            return <CalloutBlockComponent key={index} block={block} />;
          case 'code':
            return <CodeBlockDisplay key={index} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

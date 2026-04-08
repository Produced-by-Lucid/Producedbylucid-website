'use client';

import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapUnderline from '@tiptap/extension-underline';
import TiptapLink from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import {
  LuPlus,
  LuTrash2,
  LuChevronUp,
  LuChevronDown,
  LuImage,
  LuHeading2,
  LuHeading3,
  LuHeading4,
  LuQuote,
  LuMousePointerClick,
  LuList,
  LuListOrdered,
  LuMinus,
  LuCode,
  LuMessageSquare,
  LuPlay,
  LuType,
} from 'react-icons/lu';
import type { BlogBlock, BlogPostData } from '@/lib/site-types';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const inputBase: CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.75rem',
  borderRadius: 10,
  border: '1px solid #d5dde6',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  background: '#fbfdff',
  boxSizing: 'border-box',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontWeight: 700,
  fontSize: '0.72rem',
  color: '#6b7b8c',
  marginBottom: '0.3rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const blockCardStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #e7edf2',
  borderRadius: 14,
  padding: '0.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
};

const toolbarBtnStyle: CSSProperties = {
  border: '1px solid #e3e8ee',
  background: '#fff',
  borderRadius: 8,
  padding: '0.35rem 0.5rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#5a6b7c',
  fontSize: '0.75rem',
};

// ---------------------------------------------------------------------------
// IMAGE_EXT_PATTERN — detect image URLs for preview
// ---------------------------------------------------------------------------

const IMAGE_EXT_PATTERN = /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i;

// ---------------------------------------------------------------------------
// Block menu items — the "add block" palette
// ---------------------------------------------------------------------------

type BlockMenuItem = {
  type: BlogBlock['type'];
  label: string;
  icon: React.ReactNode;
  extra?: string; // sub-type selection
};

const BLOCK_MENU: BlockMenuItem[] = [
  { type: 'paragraph', label: 'Paragraph', icon: <LuType size={14} /> },
  { type: 'image', label: 'Image', icon: <LuImage size={14} /> },
  { type: 'heading', label: 'Heading 2', icon: <LuHeading2 size={14} />, extra: '2' },
  { type: 'heading', label: 'Heading 3', icon: <LuHeading3 size={14} />, extra: '3' },
  { type: 'heading', label: 'Heading 4', icon: <LuHeading4 size={14} />, extra: '4' },
  { type: 'subheading', label: 'Subheading', icon: <LuType size={14} /> },
  { type: 'quote', label: 'Quote', icon: <LuQuote size={14} /> },
  { type: 'cta', label: 'CTA Button', icon: <LuMousePointerClick size={14} /> },
  { type: 'list', label: 'Bullet List', icon: <LuList size={14} />, extra: 'unordered' },
  { type: 'list', label: 'Numbered List', icon: <LuListOrdered size={14} />, extra: 'ordered' },
  { type: 'divider', label: 'Divider', icon: <LuMinus size={14} /> },
  { type: 'embed', label: 'Embed', icon: <LuPlay size={14} /> },
  { type: 'callout', label: 'Callout', icon: <LuMessageSquare size={14} /> },
  { type: 'code', label: 'Code Block', icon: <LuCode size={14} /> },
];

// ---------------------------------------------------------------------------
// Factory — creates a default block of a given type
// ---------------------------------------------------------------------------

function createBlock(menuItem: BlockMenuItem): BlogBlock {
  switch (menuItem.type) {
    case 'paragraph':
      return { type: 'paragraph', text: '' };
    case 'image':
      return { type: 'image', src: '', alt: '', width: 'full' };
    case 'heading':
      return { type: 'heading', level: Number(menuItem.extra || '2') as 2 | 3 | 4, text: '' };
    case 'subheading':
      return { type: 'subheading', text: '' };
    case 'quote':
      return { type: 'quote', text: '', attribution: '' };
    case 'cta':
      return { type: 'cta', label: '', url: '', style: 'primary' };
    case 'list':
      return { type: 'list', style: (menuItem.extra as 'ordered' | 'unordered') || 'unordered', items: [''] };
    case 'divider':
      return { type: 'divider' };
    case 'embed':
      return { type: 'embed', url: '', caption: '' };
    case 'callout':
      return { type: 'callout', variant: 'info', text: '' };
    case 'code':
      return { type: 'code', language: '', code: '' };
    default:
      return { type: 'paragraph', text: '' };
  }
}

// ---------------------------------------------------------------------------
// Block label helper
// ---------------------------------------------------------------------------

function blockLabel(block: BlogBlock): string {
  switch (block.type) {
    case 'heading':
      return `H${block.level}`;
    case 'subheading':
      return 'Sub';
    case 'paragraph':
      return 'P';
    case 'image':
      return 'Img';
    case 'quote':
      return 'Quote';
    case 'cta':
      return 'CTA';
    case 'list':
      return block.style === 'ordered' ? 'OL' : 'UL';
    case 'divider':
      return '—';
    case 'embed':
      return 'Embed';
    case 'callout':
      return block.variant.charAt(0).toUpperCase() + block.variant.slice(1);
    case 'code':
      return 'Code';
    default:
      return '?';
  }
}

// ---------------------------------------------------------------------------
// ImageUploadField — inline image upload (reuses CMS upload endpoint)
// ---------------------------------------------------------------------------

function ImageUploadField({
  value,
  onChange,
  password,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  password: string;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isImage = IMAGE_EXT_PATTERN.test(value) || localPreview !== null;

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError(null);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'posts');
      const res = await fetch('/api/cms/upload', {
        method: 'POST',
        headers: { 'x-cms-password': password },
        body: fd,
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Upload failed');
      if (body.url) onChange(body.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setLocalPreview(null);
      URL.revokeObjectURL(objectUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setPreviewError(false); }}
          placeholder={placeholder ?? '/path/to/image.png'}
          style={{ ...inputBase, flex: 1 }}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/mp4,video/webm,.svg"
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleUpload(f); e.target.value = ''; }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            borderRadius: 8,
            border: '1px solid #d5dde6',
            background: '#fff',
            color: '#425466',
            padding: '0.55rem 0.7rem',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.78rem',
            whiteSpace: 'nowrap',
          }}
        >
          {uploading ? '...' : '⬆'}
        </button>
      </div>
      {uploadError && <p style={{ color: '#9f2538', fontSize: '0.78rem', margin: 0 }}>{uploadError}</p>}
      {value && isImage && !previewError && (
        <div style={{ maxWidth: 160, borderRadius: 8, border: '1px solid #e3ebf3', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={localPreview ?? value}
            alt=""
            onError={() => setPreviewError(true)}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual block editors
// ---------------------------------------------------------------------------

function ImageBlockEditor({ block, onChange, password }: { block: Extract<BlogBlock, { type: 'image' }>; onChange: (b: BlogBlock) => void; password: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div><label style={labelStyle}>Image</label>
        <ImageUploadField value={block.src} onChange={(src) => onChange({ ...block, src })} password={password} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}><label style={labelStyle}>Alt text</label>
          <input type="text" value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} style={inputBase} placeholder="Describe the image" />
        </div>
        <div style={{ width: 120 }}><label style={labelStyle}>Width</label>
          <select value={block.width ?? 'full'} onChange={(e) => onChange({ ...block, width: e.target.value as 'small' | 'medium' | 'large' | 'full' })} style={{ ...inputBase, cursor: 'pointer' }}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="full">Full</option>
          </select>
        </div>
      </div>
      <div><label style={labelStyle}>Caption (optional)</label>
        <input type="text" value={block.caption ?? ''} onChange={(e) => onChange({ ...block, caption: e.target.value })} style={inputBase} placeholder="Photo credit or description" />
      </div>
    </div>
  );
}

function HeadingBlockEditor({ block, onChange }: { block: Extract<BlogBlock, { type: 'heading' }>; onChange: (b: BlogBlock) => void }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
      <div style={{ width: 70 }}><label style={labelStyle}>Level</label>
        <select value={block.level} onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 2 | 3 | 4 })} style={{ ...inputBase, cursor: 'pointer' }}>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
          <option value={4}>H4</option>
        </select>
      </div>
      <div style={{ flex: 1 }}><label style={labelStyle}>Text</label>
        <input type="text" value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} style={{ ...inputBase, fontWeight: 700, fontSize: block.level === 2 ? '1.1rem' : block.level === 3 ? '1rem' : '0.95rem' }} placeholder="Heading text" />
      </div>
    </div>
  );
}

function SubheadingBlockEditor({ block, onChange }: { block: Extract<BlogBlock, { type: 'subheading' }>; onChange: (b: BlogBlock) => void }) {
  return (
    <div><label style={labelStyle}>Subheading</label>
      <input type="text" value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} style={{ ...inputBase, fontWeight: 500, color: '#6b7b8c' }} placeholder="Subheading text" />
    </div>
  );
}

function ParagraphBlockEditor({ block, onChange }: { block: Extract<BlogBlock, { type: 'paragraph' }>; onChange: (b: BlogBlock) => void }) {
  return (
    <div className='focus:outline '>
      <textarea value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} rows={Math.min(Math.max(3, block.text.split('\n').length + 1), 10)} style={{ ...inputBase, resize: 'vertical', lineHeight: 1.6 }} placeholder="Body text. Supports **bold**, *italic*, and [links](url)." />
    </div>
  );
}

function QuoteBlockEditor({ block, onChange }: { block: Extract<BlogBlock, { type: 'quote' }>; onChange: (b: BlogBlock) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderLeft: '3px solid #de692e', paddingLeft: '0.6rem' }}>
      <div><label style={labelStyle}>Quote</label>
        <textarea value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} rows={3} style={{ ...inputBase, fontStyle: 'italic', resize: 'vertical' }} placeholder="The quoted text" />
      </div>
      <div><label style={labelStyle}>Attribution (optional)</label>
        <input type="text" value={block.attribution ?? ''} onChange={(e) => onChange({ ...block, attribution: e.target.value })} style={inputBase} placeholder="— Author name" />
      </div>
    </div>
  );
}

function CtaBlockEditor({ block, onChange }: { block: Extract<BlogBlock, { type: 'cta' }>; onChange: (b: BlogBlock) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}><label style={labelStyle}>Label</label>
          <input type="text" value={block.label} onChange={(e) => onChange({ ...block, label: e.target.value })} style={inputBase} placeholder="Get started" />
        </div>
        <div style={{ width: 120 }}><label style={labelStyle}>Style</label>
          <select value={block.style ?? 'primary'} onChange={(e) => onChange({ ...block, style: e.target.value as 'primary' | 'secondary' | 'outline' })} style={{ ...inputBase, cursor: 'pointer' }}>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="outline">Outline</option>
          </select>
        </div>
      </div>
      <div><label style={labelStyle}>URL</label>
        <input type="url" value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} style={inputBase} placeholder="https://..." />
      </div>
    </div>
  );
}

function ListBlockEditor({ block, onChange }: { block: Extract<BlogBlock, { type: 'list' }>; onChange: (b: BlogBlock) => void }) {
  const updateItem = (idx: number, val: string) => {
    const items = [...block.items];
    items[idx] = val;
    onChange({ ...block, items });
  };
  const removeItem = (idx: number) => onChange({ ...block, items: block.items.filter((_, i) => i !== idx) });
  const addItem = () => onChange({ ...block, items: [...block.items, ''] });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <label style={{ ...labelStyle, margin: 0 }}>List</label>
        <select value={block.style} onChange={(e) => onChange({ ...block, style: e.target.value as 'ordered' | 'unordered' })} style={{ border: '1px solid #d5dde6', borderRadius: 6, fontSize: '0.72rem', padding: '0.2rem 0.4rem', cursor: 'pointer' }}>
          <option value="unordered">Bullet</option>
          <option value="ordered">Numbered</option>
        </select>
      </div>
      {block.items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
          <span style={{ color: '#9aa5b0', fontSize: '0.78rem', width: 20, textAlign: 'center', flexShrink: 0 }}>
            {block.style === 'ordered' ? `${idx + 1}.` : '•'}
          </span>
          <input type="text" value={item} onChange={(e) => updateItem(idx, e.target.value)} style={{ ...inputBase, flex: 1 }} placeholder="List item" />
          <button type="button" onClick={() => removeItem(idx)} style={{ ...toolbarBtnStyle, color: '#b73449', borderColor: '#f0cfd5', padding: '0.25rem 0.4rem' }} title="Remove">×</button>
        </div>
      ))}
      <button type="button" onClick={addItem} style={{ background: '#fff8f3', border: '1px dashed #d97f52', borderRadius: 8, color: '#b8582b', cursor: 'pointer', padding: '0.4rem', fontSize: '0.78rem', fontWeight: 600 }}>
        + Add item
      </button>
    </div>
  );
}

function EmbedBlockEditor({ block, onChange }: { block: Extract<BlogBlock, { type: 'embed' }>; onChange: (b: BlogBlock) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div><label style={labelStyle}>Embed URL</label>
        <input type="url" value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} style={inputBase} placeholder="https://youtube.com/watch?v=..." />
      </div>
      <div><label style={labelStyle}>Caption (optional)</label>
        <input type="text" value={block.caption ?? ''} onChange={(e) => onChange({ ...block, caption: e.target.value })} style={inputBase} placeholder="Video description" />
      </div>
    </div>
  );
}

function CalloutBlockEditor({ block, onChange }: { block: Extract<BlogBlock, { type: 'callout' }>; onChange: (b: BlogBlock) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div><label style={labelStyle}>Variant</label>
        <select value={block.variant} onChange={(e) => onChange({ ...block, variant: e.target.value as 'tip' | 'warning' | 'info' })} style={{ ...inputBase, width: 130, cursor: 'pointer' }}>
          <option value="tip">💡 Tip</option>
          <option value="warning">⚠️ Warning</option>
          <option value="info">ℹ️ Info</option>
        </select>
      </div>
      <div><label style={labelStyle}>Text</label>
        <textarea value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} rows={3} style={{ ...inputBase, resize: 'vertical' }} placeholder="Callout message" />
      </div>
    </div>
  );
}

function CodeBlockEditor({ block, onChange }: { block: Extract<BlogBlock, { type: 'code' }>; onChange: (b: BlogBlock) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div><label style={labelStyle}>Language</label>
        <input type="text" value={block.language ?? ''} onChange={(e) => onChange({ ...block, language: e.target.value })} style={{ ...inputBase, width: 160 }} placeholder="javascript, python..." />
      </div>
      <div><label style={labelStyle}>Code</label>
        <textarea value={block.code} onChange={(e) => onChange({ ...block, code: e.target.value })} rows={6} style={{ ...inputBase, fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.82rem', lineHeight: 1.5, resize: 'vertical' }} placeholder="Paste your code here" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Block wrapper — renders the block header (label, move, delete) + editor
// ---------------------------------------------------------------------------

function BlockCard({
  block,
  index,
  total,
  onChange,
  onMove,
  onDelete,
  password,
  animDir,
}: {
  block: BlogBlock;
  index: number;
  total: number;
  onChange: (b: BlogBlock) => void;
  onMove: (from: number, to: number) => void;
  onDelete: (index: number) => void;
  password: string;
  animDir: 'up' | 'down' | null;
}) {
  const animStyle: CSSProperties = animDir
    ? { animation: `${animDir === 'up' ? 'blockBounceUp' : 'blockBounceDown'} 260ms cubic-bezier(0.4,0,0.2,1) forwards` }
    : {};

  return (
    <div style={{ ...blockCardStyle, ...animStyle }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: '#eef2f7', borderRadius: 6, padding: '0.2rem 0.5rem',
          fontWeight: 700, fontSize: '0.68rem', color: '#5a6b7c', textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {blockLabel(block)}
        </span>
        <span style={{ flex: 1 }} />
        <button type="button" disabled={index === 0} onClick={() => onMove(index, index - 1)} style={{ ...toolbarBtnStyle, opacity: index === 0 ? 0.3 : 1 }} title="Move up">
          <LuChevronUp size={13} />
        </button>
        <button type="button" disabled={index === total - 1} onClick={() => onMove(index, index + 1)} style={{ ...toolbarBtnStyle, opacity: index === total - 1 ? 0.3 : 1 }} title="Move down">
          <LuChevronDown size={13} />
        </button>
        <button type="button" onClick={() => onDelete(index)} style={{ ...toolbarBtnStyle, color: '#b73449', borderColor: '#f0cfd5' }} title="Delete block">
          <LuTrash2 size={13} />
        </button>
      </div>

      {/* Block-specific editor */}
      {block.type === 'image' && <ImageBlockEditor block={block} onChange={onChange} password={password} />}
      {block.type === 'heading' && <HeadingBlockEditor block={block} onChange={onChange} />}
      {block.type === 'subheading' && <SubheadingBlockEditor block={block} onChange={onChange} />}
      {block.type === 'paragraph' && <ParagraphBlockEditor block={block} onChange={onChange} />}
      {block.type === 'quote' && <QuoteBlockEditor block={block} onChange={onChange} />}
      {block.type === 'cta' && <CtaBlockEditor block={block} onChange={onChange} />}
      {block.type === 'list' && <ListBlockEditor block={block} onChange={onChange} />}
      {block.type === 'divider' && <div style={{ borderTop: '2px dashed #d5dde6', margin: '0.2rem 0' }} />}
      {block.type === 'embed' && <EmbedBlockEditor block={block} onChange={onChange} />}
      {block.type === 'callout' && <CalloutBlockEditor block={block} onChange={onChange} />}
      {block.type === 'code' && <CodeBlockEditor block={block} onChange={onChange} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Block menu (popup palette)
// ---------------------------------------------------------------------------

function AddBlockMenu({ onAdd, onClose }: { onAdd: (item: BlockMenuItem) => void; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: 6,
        background: '#fff',
        border: '1px solid #e0e6ec',
        borderRadius: 14,
        boxShadow: '0 8px 30px rgba(0,0,0,.12)',
        padding: '0.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.3rem',
        width: 310,
        zIndex: 100,
      }}
    >
      {BLOCK_MENU.map((item, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => { onAdd(item); onClose(); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            border: '1px solid transparent',
            background: 'transparent',
            borderRadius: 8,
            padding: '0.45rem 0.5rem',
            cursor: 'pointer',
            fontSize: '0.74rem',
            fontWeight: 500,
            color: '#3a4a5a',
            whiteSpace: 'nowrap',
            transition: 'background 100ms, border-color 100ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f7fa'; e.currentTarget.style.borderColor = '#e0e6ec'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Keyframe style injection for block move animations
// ---------------------------------------------------------------------------

const BLOCK_MOVE_STYLES = `
  @keyframes blockBounceUp {
    0%   { transform: translateY(0);    opacity: 1; }
    40%  { transform: translateY(-14px); opacity: 0.75; }
    70%  { transform: translateY(-6px);  opacity: 0.9; }
    100% { transform: translateY(0);    opacity: 1; }
  }
  @keyframes blockBounceDown {
    0%   { transform: translateY(0);    opacity: 1; }
    40%  { transform: translateY(14px);  opacity: 0.75; }
    70%  { transform: translateY(6px);   opacity: 0.9; }
    100% { transform: translateY(0);    opacity: 1; }
  }
`;

// ---------------------------------------------------------------------------
// Slash command items
// ---------------------------------------------------------------------------

const SLASH_ITEMS = [
  { id: 'h2',      label: 'Heading 2',     hint: 'Large section header',    icon: 'H2'  },
  { id: 'h3',      label: 'Heading 3',     hint: 'Medium section header',   icon: 'H3'  },
  { id: 'bullets', label: 'Bullet list',   hint: 'Unordered list',          icon: '•'   },
  { id: 'numbers', label: 'Numbered list', hint: 'Ordered list',            icon: '1.'  },
  { id: 'quote',   label: 'Blockquote',    hint: 'Highlighted quote',       icon: '❝'   },
  { id: 'code',    label: 'Code block',    hint: 'Monospaced code block',   icon: '{}'  },
  { id: 'divider', label: 'Divider',       hint: 'Horizontal rule',         icon: '—'   },
  { id: 'image',   label: 'Image',         hint: 'Upload or embed image',   icon: '🖼'  },
] as const;

type SlashItemId = typeof SLASH_ITEMS[number]['id'];

type SlashState = {
  open: boolean;
  x: number;
  y: number;
  filter: string;
  fromPos: number;
  selectedIdx: number;
};

const INIT_SLASH: SlashState = { open: false, x: 0, y: 0, filter: '', fromPos: 0, selectedIdx: 0 };

function TipBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      style={{
        border: active ? '1px solid #c0cdd8' : '1px solid transparent',
        background: active ? '#e8f0f7' : 'transparent',
        borderRadius: 6,
        padding: '0.22rem 0.5rem',
        cursor: 'pointer',
        fontWeight: active ? 700 : 500,
        fontSize: '0.82rem',
        color: active ? '#1a3a5c' : '#4a5a6a',
        minWidth: 28,
        lineHeight: 1.4,
      }}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Inline image picker (for slash /image command)
// ---------------------------------------------------------------------------

function ImagePickerPanel({
  password,
  onInsert,
  onClose,
}: {
  password: string;
  onInsert: (url: string) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'posts');
      const res = await fetch('/api/cms/upload', {
        method: 'POST',
        headers: { 'x-cms-password': password },
        body: fd,
      });
      const body = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(body.error ?? 'Upload failed');
      if (body.url) { onInsert(body.url); onClose(); }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ background: '#f9fafb', border: '1px solid #dce3ea', borderRadius: 10, padding: '0.7rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      <div style={{ fontWeight: 700, fontSize: '0.72rem', color: '#6b7b8c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Insert Image</div>
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste image URL…"
          style={{ ...inputBase, flex: 1, fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
        />
        <button
          type="button"
          onClick={() => { if (url.trim()) { onInsert(url.trim()); onClose(); } }}
          style={{ background: '#de692e', color: '#fff', border: 'none', borderRadius: 8, padding: '0.45rem 0.75rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Insert
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ''; }} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ background: '#fff', border: '1px solid #d5dde6', borderRadius: 8, padding: '0.4rem 0.8rem', fontWeight: 600, fontSize: '0.8rem', cursor: uploading ? 'not-allowed' : 'pointer', color: '#3a4a5a' }}
        >
          {uploading ? 'Uploading…' : '⬆ Upload file'}
        </button>
        <button type="button" onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9aa5b0', fontSize: '0.8rem' }}>Cancel</button>
      </div>
      {err && <p style={{ color: '#c0392b', fontSize: '0.77rem', margin: 0 }}>{err}</p>}
    </div>
  );
}

function RichTextArea({
  initialValue,
  onChange,
  password,
}: {
  initialValue: string;
  onChange: (html: string) => void;
  password: string;
}) {
  // ── Slash state ──────────────────────────────────────────────────────────
  const slashRef = useRef<SlashState>(INIT_SLASH);
  const [slashState, setSlashStateRaw] = useState<SlashState>(INIT_SLASH);
  const setSlash = useCallback((patch: Partial<SlashState>) => {
    const next = { ...slashRef.current, ...patch };
    slashRef.current = next;
    setSlashStateRaw(next);
  }, []);

  const [showImagePicker, setShowImagePicker] = useState(false);

  // editorRef lets executeSlashItem and handleKeyDown access the live editor
  // without creating a circular initialization (useCallback before useEditor).
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  // executeSlashItemRef avoids re-creating the editor when executeSlashItem changes.
  const executeSlashItemRef = useRef<(id: SlashItemId) => void>(() => {});

  const filteredItems = SLASH_ITEMS.filter((item) =>
    !slashState.filter || item.label.toLowerCase().includes(slashState.filter.toLowerCase()),
  );

  // ── Close slash menu on outside click ─────────────────────────────────────
  const slashMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!slashState.open) return;
    const handler = (e: MouseEvent) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(e.target as Node)) {
        setSlash({ open: false });
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [slashState.open, setSlash]);

  // ── Execute slash command ─────────────────────────────────────────────────
  // Uses editorRef so it can be defined before useEditor is called.
  const executeSlashItem = useCallback((id: SlashItemId) => {
    const ed = editorRef.current;
    if (!ed) return;
    const { fromPos } = slashRef.current;
    const { from } = ed.state.selection;
    // Delete the "/" + any filter text
    if (from > fromPos) {
      ed.chain().focus().deleteRange({ from: fromPos, to: from }).run();
    }
    setSlash({ open: false });

    if (id === 'image') { setShowImagePicker(true); return; }

    switch (id) {
      case 'h2':      ed.chain().focus().toggleHeading({ level: 2 }).run(); break;
      case 'h3':      ed.chain().focus().toggleHeading({ level: 3 }).run(); break;
      case 'bullets': ed.chain().focus().toggleBulletList().run();          break;
      case 'numbers': ed.chain().focus().toggleOrderedList().run();         break;
      case 'quote':   ed.chain().focus().toggleBlockquote().run();          break;
      case 'code':    ed.chain().focus().toggleCodeBlock().run();           break;
      case 'divider': ed.chain().focus().setHorizontalRule().run();         break;
    }
  }, [setSlash]);

  // Keep ref in sync so handleKeyDown always calls the latest version.
  executeSlashItemRef.current = executeSlashItem;

  // ── Tiptap editor ─────────────────────────────────────────────────────────
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TiptapUnderline,
      TiptapLink.configure({ openOnClick: false }),
      TiptapImage,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: 'Start writing here… or type / to insert elements.',
      }),
    ],
    content: initialValue,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());

      // Track slash filter text
      if (!slashRef.current.open) return;
      const { fromPos } = slashRef.current;
      const { from } = editor.state.selection;
      if (from <= fromPos) { setSlash({ open: false }); return; }
      try {
        const text = editor.state.doc.textBetween(fromPos, from);
        if (!text.startsWith('/')) { setSlash({ open: false }); }
        else { setSlash({ filter: text.slice(1), selectedIdx: 0 }); }
      } catch { setSlash({ open: false }); }
    },
    editorProps: {
      attributes: { class: 'ProseMirror' },
      handleKeyDown: (view, event) => {
        const slash = slashRef.current;

        // Navigate / execute slash menu
        if (slash.open) {
          if (event.key === 'Escape') { setSlash({ open: false }); return true; }
          if (event.key === 'ArrowUp') {
            setSlash({ selectedIdx: Math.max(0, slash.selectedIdx - 1) });
            return true;
          }
          if (event.key === 'ArrowDown') {
            const max = SLASH_ITEMS.filter(i => !slash.filter || i.label.toLowerCase().includes(slash.filter.toLowerCase())).length - 1;
            setSlash({ selectedIdx: Math.min(max, slash.selectedIdx + 1) });
            return true;
          }
          if (event.key === 'Enter') {
            const items = SLASH_ITEMS.filter(i => !slash.filter || i.label.toLowerCase().includes(slash.filter.toLowerCase()));
            const item = items[slash.selectedIdx];
            if (item) { executeSlashItemRef.current(item.id); }
            return true;
          }
        }

        // Open slash menu on "/"
        if (event.key === '/') {
          const { $from } = view.state.selection;
          if ($from.parent.type.name === 'paragraph') {
            // Let "/" be inserted, then detect it in onUpdate via a microtask
            const insertPos = view.state.selection.from;
            requestAnimationFrame(() => {
              const coords = view.coordsAtPos(insertPos + 1);
              setSlash({
                open: true,
                x: coords.left,
                y: coords.bottom + 4,
                filter: '',
                fromPos: insertPos,
                selectedIdx: 0,
              });
            });
          }
        }
        return false;
      },
    },
  });

  if (!editor) return null;

  // Keep editorRef in sync for executeSlashItem (defined before useEditor).
  editorRef.current = editor;

  const addLink = () => {
    const url = window.prompt('Link URL:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
    else if (editor.isActive('link')) editor.chain().focus().unsetLink().run();
  };

  return (
    <div className="blog-rich-editor" style={{ border: '1px solid #d5dde6', borderRadius: 12, overflow: 'visible', background: '#fff', position: 'relative' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.15rem', padding: '0.45rem 0.6rem', borderBottom: '1px solid #e7edf2', background: '#f9fafb', borderRadius: '12px 12px 0 0' }}>
        <TipBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><strong>B</strong></TipBtn>
        <TipBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><em>I</em></TipBtn>
        <TipBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><u>U</u></TipBtn>
        <div style={{ width: 1, background: '#dde3ea', margin: '0.1rem 0.2rem' }} />
        <TipBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</TipBtn>
        <TipBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</TipBtn>
        <div style={{ width: 1, background: '#dde3ea', margin: '0.1rem 0.2rem' }} />
        <TipBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">• List</TipBtn>
        <TipBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">1. List</TipBtn>
        <TipBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">❝</TipBtn>
        <TipBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">{'`code`'}</TipBtn>
        <TipBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">{'{ }'}</TipBtn>
        <div style={{ width: 1, background: '#dde3ea', margin: '0.1rem 0.2rem' }} />
        <TipBtn onClick={addLink} active={editor.isActive('link')} title="Link">🔗</TipBtn>
        <TipBtn onClick={() => setShowImagePicker((v) => !v)} active={showImagePicker} title="Insert image"><LuImage size={13} /></TipBtn>
        <TipBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Divider">—</TipBtn>
        <div style={{ flex: 1 }} />
        <TipBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">↩</TipBtn>
        <TipBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">↪</TipBtn>
      </div>

      <EditorContent editor={editor} />

      {/* Inline image picker (below editor area) */}
      {showImagePicker && (
        <div style={{ padding: '0.6rem 0.8rem', borderTop: '1px solid #e7edf2' }}>
          <ImagePickerPanel
            password={password}
            onInsert={(url) => { editor.chain().focus().setImage({ src: url }).run(); }}
            onClose={() => setShowImagePicker(false)}
          />
        </div>
      )}

      {/* Slash command menu — fixed-position portal */}
      {slashState.open && filteredItems.length > 0 && (
        <div
          ref={slashMenuRef}
          className="slash-menu"
          style={{ left: slashState.x, top: slashState.y }}
        >
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              className={`slash-menu-item${idx === slashState.selectedIdx ? ' active' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); executeSlashItem(item.id); }}
            >
              <span className="slash-menu-icon">{item.icon}</span>
              <span>
                <div className="slash-menu-label">{item.label}</div>
                <div className="slash-menu-hint">{item.hint}</div>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BlogEditor — the main exported component
// ---------------------------------------------------------------------------

export default function BlogEditor({
  content,
  onChange,
  password,
}: {
  content: string;
  onChange: (content: string) => void;
  password: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [animState, setAnimState] = useState<{ from: number; to: number } | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(true);

  // Parse the JSON content into BlogPostData
  const postData = useMemo<BlogPostData | null>(() => {
    try {
      const parsed = JSON.parse(content);
      return {
        title: parsed.title ?? '',
        excerpt: parsed.excerpt ?? '',
        meta: parsed.meta ?? '',
        coverImage: parsed.coverImage ?? '',
        publishedAt: parsed.publishedAt ?? new Date().toISOString().split('T')[0],
        blocks: Array.isArray(parsed.blocks) ? parsed.blocks : [],
      };
    } catch {
      return null;
    }
  }, [content]);

  // Serialize back to JSON string whenever we update
  const updatePost = useCallback(
    (updater: (prev: BlogPostData) => BlogPostData) => {
      if (!postData) return;
      const next = updater(postData);
      onChange(JSON.stringify(next, null, 2));
    },
    [postData, onChange],
  );

  const updateField = useCallback(
    (field: keyof BlogPostData, value: string) => {
      updatePost((prev) => ({ ...prev, [field]: value }));
    },
    [updatePost],
  );

  const updateBlock = useCallback(
    (index: number, block: BlogBlock) => {
      updatePost((prev) => {
        const blocks = [...prev.blocks];
        blocks[index] = block;
        return { ...prev, blocks };
      });
    },
    [updatePost],
  );

  const moveBlock = useCallback(
    (from: number, to: number) => {
      updatePost((prev) => {
        const blocks = [...prev.blocks];
        const [moved] = blocks.splice(from, 1);
        blocks.splice(to, 0, moved);
        return { ...prev, blocks };
      });
    },
    [updatePost],
  );

  const animatedMoveBlock = useCallback(
    (from: number, to: number) => {
      setAnimState({ from, to });
      setTimeout(() => {
        moveBlock(from, to);
        setAnimState(null);
      }, 260);
    },
    [moveBlock],
  );

  const deleteBlock = useCallback(
    (index: number) => {
      updatePost((prev) => ({
        ...prev,
        blocks: prev.blocks.filter((_, i) => i !== index),
      }));
    },
    [updatePost],
  );

  const addBlock = useCallback(
    (menuItem: BlockMenuItem) => {
      updatePost((prev) => ({
        ...prev,
        blocks: [...prev.blocks, createBlock(menuItem)],
      }));
    },
    [updatePost],
  );

  // If content can't be parsed, fall back to showing an error
  if (!postData) {
    return (
      <div style={{ padding: '1rem', color: '#9f2538', background: '#fff6f7', borderRadius: 12, border: '1px solid #f3ced5', fontSize: '0.92rem' }}>
        Cannot parse blog post data. Please check the JSON format or switch to Code view.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Post metadata section */}
      <section style={{ ...blockCardStyle, background: '#fafbfc', borderColor: '#dce3ea' }}>
        <button
          type="button"
          onClick={() => setDetailsOpen((o) => !o)}
          style={{
            all: 'unset',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#3a4a5a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Post Details
          </span>
          {detailsOpen ? <LuChevronUp size={15} color="#6b7b8c" /> : <LuChevronDown size={15} color="#6b7b8c" />}
        </button>
        {detailsOpen && (
          <>
            <div><label style={labelStyle}>Title</label>
              <input type="text" value={postData.title} onChange={(e) => updateField('title', e.target.value)} style={{ ...inputBase, fontWeight: 700, fontSize: '1.05rem' }} placeholder="Post title" />
            </div>
            <div><label style={labelStyle}>Excerpt</label>
              <textarea value={postData.excerpt} onChange={(e) => updateField('excerpt', e.target.value)} rows={2} style={{ ...inputBase, resize: 'vertical' }} placeholder="Short description for cards and SEO" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}><label style={labelStyle}>Meta / Category</label>
                <input type="text" value={postData.meta} onChange={(e) => updateField('meta', e.target.value)} style={inputBase} placeholder="e.g. Insight" />
              </div>
              <div style={{ flex: 1 }}><label style={labelStyle}>Published Date</label>
                <input type="date" value={postData.publishedAt} onChange={(e) => updateField('publishedAt', e.target.value)} style={inputBase} />
              </div>
            </div>
            <div><label style={labelStyle}>Cover Image</label>
              <ImageUploadField value={postData.coverImage} onChange={(v) => updateField('coverImage', v)} password={password} placeholder="/slider-imgs/cover.png" />
            </div>
          </>
        )}
      </section>

      {/* Rich-text content section */}
      <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#3a4a5a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Content
      </div>

      <RichTextArea
        initialValue={postData.html ?? ''}
        onChange={(html) => updatePost((prev) => ({ ...prev, html }))}
        password={password}
      />
    </div>
  );
}

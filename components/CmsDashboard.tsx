'use client';

import '@fontsource-variable/instrument-sans/index.css';
import './cms-dashboard.css';
import { ADMIN_SESSION_KEY } from '@/lib/admin-session';
import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { LuRefreshCw, LuPanelLeftClose, LuPanelLeftOpen, LuArrowLeft, LuGripVertical, LuX, LuSave, LuChevronDown, LuChevronRight, LuLogOut, LuRotateCw, LuPencil, LuPlus, LuTrash2, LuVideo, LuImage } from 'react-icons/lu';
import BlogEditor from './BlogEditor';
import CmsReorderableCards from './CmsReorderableCards';

// ---------------------------------------------------------------------------
// Type definitions — shapes of API responses and internal data models
// ---------------------------------------------------------------------------

type FileListResponse = { files: string[]; error?: string };
type FileResponse = { path: string; content: string; error?: string };
type JsonObject = { [key: string]: JsonValue };
type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
type SidebarTab = 'pages' | 'settings';
type SectionDefinition = { key: string; label: string; description?: string };
type UploadResponse = { url?: string; error?: string };

// ---------------------------------------------------------------------------
// Image/video detection — used to decide when to render the image upload UI
// instead of a plain text input in the form editor.
//
// IMAGE_KEY_PATTERN: matches common field names for images ("image", "logo", etc.)
// IMAGE_EXT_PATTERN: matches common image file extensions
// VIDEO_EXT_PATTERN: matches common video file extensions
// ---------------------------------------------------------------------------

const IMAGE_KEY_PATTERN = /image|img|photo|logo|avatar|thumbnail|cover|banner|icon|poster|src|video/i;
const IMAGE_EXT_PATTERN = /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i;
const VIDEO_EXT_PATTERN = /\.(mp4|webm)$/i;

/** Returns true if a JSON string field should be rendered as an image/video upload field. */
function isImageField(fieldKey: string, value: string) {
  if (IMAGE_KEY_PATTERN.test(fieldKey)) return true;
  if (IMAGE_EXT_PATTERN.test(value)) return true;
  if (VIDEO_EXT_PATTERN.test(value)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Content file paths — these constants map to files inside the /content folder.
// They determine which files are shown in which sidebar section.
// ---------------------------------------------------------------------------

const HOME_PAGE_FILE = 'pages/home.json';
const SITE_SETTINGS_FILE = 'settings/site.json';
const BLOG_POSTS_PREFIX = 'posts/';
const PROJECTS_PREFIX = 'projects/';
const TESTIMONIALS_PREFIX = 'testimonials/';

// The ordered list of editable sections on the home page.
// Each "key" must match a top-level key in content/pages/home.json.
const HOME_PAGE_SECTIONS: SectionDefinition[] = [
  { key: 'sectionVisibility', label: 'Show / Hide Sections', description: 'Check a section to show it on the homepage. Uncheck to hide it, then click Save. Hidden content is kept so you can show it again later.' },
  { key: 'hero', label: 'Hero' },
  { key: 'projectsSection', label: 'Featured Projects' },
  { key: 'featureShowcase', label: 'Intro' },
  { key: 'servicesSection', label: 'Services' },
  { key: 'testimonialsSection', label: 'Testimonials' },
  { key: 'blogSection', label: 'Blog' },
  { key: 'footerSection', label: 'Footer' },
];

// Base style object shared by all text inputs in the form editor.
const inputBase: CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.75rem',
  borderRadius: 10,
  border: '1px solid #d5dde6',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  background: '#fff',
  boxSizing: 'border-box',
};

// ---------------------------------------------------------------------------
// Utility helpers — formatting labels for display in the sidebar & form editor
// ---------------------------------------------------------------------------

/** Converts a camelCase or snake_case key into a readable label. e.g. "heroSection" → "Hero Section" */
function formatKeyLabel(value: string) {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

/** Extracts the filename from a file path for display. e.g. "posts/my-post.md" → "my-post.md" */
function fileLabel(filePath: string) {
  return filePath.split('/').pop() ?? filePath;
}

/** Turns a blog post filename into a human-readable title. e.g. "my-cool-post.json" → "My Cool Post" */
function blogLabel(filePath: string) {
  return fileLabel(filePath)
    .replace(/\.(md|json)$/i, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Turns a project/testimonial JSON filename into a human-readable title. */
function contentLabel(filePath: string) {
  return fileLabel(filePath)
    .replace(/\.json$/i, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// ---------------------------------------------------------------------------
// ImageField — renders an image/video path input with upload button & preview.
//
// How it works:
// 1. The text input shows the current file path (e.g. "/projects/bamboo.png")
// 2. Click "Upload" to pick a file from your computer
// 3. The file is sent to POST /api/cms/upload which saves it to public/
// 4. On success, the field value is updated to the new file’s public URL
// 5. A thumbnail preview is shown for image files (not videos)
//
// The "folder" sent to the upload API is derived from the current value,
// so replacing "/projects/old.png" will upload to the same /projects/ folder.
// ---------------------------------------------------------------------------

function ImageField({
  value,
  onChange,
  password,
  showPreview = true,
  accept = 'image/*,video/mp4,video/webm,.svg',
}: {
  value: string;
  onChange: (value: string) => void;
  password: string;
  showPreview?: boolean;
  accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folder = value.startsWith('/')
    ? value.substring(1, value.lastIndexOf('/'))
    : '';

  const isImage = IMAGE_EXT_PATTERN.test(value) || localPreview !== null;

  // Reset preview error when value changes
  useEffect(() => {
    setPreviewError(false);
    setLocalPreview(null);
  }, [value]);

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError(null);

    // Show instant local preview
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) formData.append('folder', folder);

      const response = await fetch('/api/cms/upload', {
        method: 'POST',
        headers: { 'x-cms-password': password },
        body: formData,
      });

      const text = await response.text();
      let body: UploadResponse;
      try {
        body = JSON.parse(text) as UploadResponse;
      } catch {
        throw new Error(`Server error (${response.status}). Upload may be too large or the route is misconfigured.`);
      }

      if (!response.ok) {
        throw new Error(body.error ?? 'Upload failed.');
      }

      if (body.url) {
        onChange(body.url);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed.');
      setLocalPreview(null);
      URL.revokeObjectURL(objectUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          style={{ ...inputBase, flex: 1 }}
          placeholder="/path/to/image.png"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleUpload(file);
            event.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            borderRadius: 10,
            border: '1px solid #d5dde6',
            background: uploading ? '#f3f4f6' : '#fff',
            color: '#425466',
            padding: '0.65rem 0.85rem',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            whiteSpace: 'nowrap',
          }}
        >
          {uploading ? 'Uploading...' : '⬆ Upload'}
        </button>
      </div>

      {uploadError ? (
        <p style={{ color: '#9f2538', fontSize: '0.85rem', margin: 0 }}>{uploadError}</p>
      ) : null}

      {showPreview && value && isImage && !previewError ? (
        <div
          style={{
            maxWidth: 200,
            borderRadius: 8,
            border: '1px solid #e3ebf3',
            overflow: 'hidden',
            background: '#f9fafb',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={localPreview ?? value}
            src={localPreview ?? value}
            alt=""
            onError={() => setPreviewError(true)}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      ) : null}
    </div>
  );
}

function ProjectCardFields({ content, onChange, password }: { content: string; onChange: (value: string) => void; password: string }) {
  let data: JsonObject;
  try { data = JSON.parse(content) as JsonObject; } catch { return <p>Invalid project JSON.</p>; }
  const update = (key: string, value: string) => onChange(JSON.stringify({ ...data, [key]: value }, null, 2));
  const image = typeof data.image === 'string' ? data.image : '';
  const video = typeof data.video === 'string' ? data.video : '';
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 96, height: 96, borderRadius: 14, overflow: 'hidden', background: '#f5f5f5', display: 'grid', placeItems: 'center' }}>
        {image ? <img src={image} alt="Project thumbnail" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <LuImage size={30} color="#bbb" aria-label="No image added" />}
      </div>
      <span title={video ? 'Video added' : 'No video added'} aria-label={video ? 'Video added' : 'No video added'} style={{ color: video ? '#de692e' : '#b8b8b8', opacity: video ? 1 : 0.35 }}><LuVideo size={28} /></span>
    </div>
    {['company', 'title', 'date', 'image', 'video', 'href'].map(key => <div key={key}>
      <label style={{ display: 'block', fontWeight: 700, color: '#111', fontSize: '0.95rem', marginBottom: '0.3rem' }}>
        {key === 'href' ? 'Link' : formatKeyLabel(key)}
        <div style={{ marginTop: '0.3rem', fontWeight: 400 }}>
          {key === 'image' || key === 'video' ? <ImageField value={String(data[key] ?? '')} onChange={value => update(key, value)} password={password} showPreview={false} /> : <input style={{ ...inputBase, background: '#fff', borderColor: '#d7d7d7', color: '#444' }} value={String(data[key] ?? '')} onChange={event => update(key, event.target.value)} />}
        </div>
      </label>
    </div>)}
  </div>;
}

// ---------------------------------------------------------------------------
// Field — recursive component that renders the correct form input for any
// JSON value type. This is the core of the form editor.
//
// It inspects the type of `value` and renders:
//   • string  → ImageField (if detected as image), textarea (if long), or text input
//   • number  → number input
//   • boolean → checkbox
//   • array   → list of items with add/remove buttons (renders Field recursively)
//   • object  → labeled group of fields (renders Field recursively for each key)
//   • null    → static "null" text
//
// The `depth` parameter tracks nesting level for indentation styling.
// The `password` is passed through so nested ImageFields can authenticate uploads.
// ---------------------------------------------------------------------------

function Field({
  fieldKey,
  value,
  onChange,
  password,
  depth = 0,
}: {
  fieldKey: string;
  value: JsonValue;
  onChange: (value: JsonValue) => void;
  password: string;
  depth?: number;
}) {
  if (typeof value === 'string') {
    if (isImageField(fieldKey, value)) {
      if (fieldKey === 'icon') {
        return <div>
          <ImageField value={value} onChange={v => onChange(v)} password={password} accept="image/png,image/svg+xml,.png,.svg" />
          <p style={{ margin: '0.4rem 0 0', color: '#6b7b8c', fontSize: '0.8rem' }}>Use a transparent PNG or SVG for the icon.</p>
        </div>;
      }
      return <ImageField value={value} onChange={(v) => onChange(v)} password={password} />;
    }

    const isLong = value.length > 80 || value.includes('\n');

    if (isLong) {
      return (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={Math.min(Math.max(3, value.split('\n').length + 1), 12)}
          style={{ ...inputBase, resize: 'vertical', lineHeight: 1.5 }}
        />
      );
    }

    return (
      <input
        type={value.startsWith('http') ? 'url' : 'text'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={inputBase}
      />
    );
  }

  if (typeof value === 'number') {
    return (
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ ...inputBase, width: 140 }}
      />
    );
  }

  if (typeof value === 'boolean') {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
          style={{ width: 16, height: 16, cursor: 'pointer' }}
        />
        <span style={{ fontSize: '0.9rem', color: '#425466' }}>{value ? 'Enabled' : 'Disabled'}</span>
      </label>
    );
  }

  if (Array.isArray(value)) {
    const updateItem = (index: number, nextValue: JsonValue) => {
      const nextArray = [...value];
      nextArray[index] = nextValue;
      onChange(nextArray);
    };

    const removeItem = (index: number) => onChange(value.filter((_, itemIndex) => itemIndex !== index));

    const addItem = () => {
      const first = value[0];

      if (first === undefined || typeof first === 'string') {
        onChange([...value, '']);
        return;
      }

      if (typeof first === 'number') {
        onChange([...value, 0]);
        return;
      }

      if (typeof first === 'boolean') {
        onChange([...value, false]);
        return;
      }

      if (Array.isArray(first)) {
        onChange([...value, []]);
        return;
      }

      if (first !== null && typeof first === 'object') {
        const blankObject: JsonObject = {};
        for (const [key, nestedValue] of Object.entries(first)) {
          blankObject[key] =
            typeof nestedValue === 'string'
              ? ''
              : typeof nestedValue === 'number'
                ? 0
                : typeof nestedValue === 'boolean'
                  ? false
                  : Array.isArray(nestedValue)
                    ? []
                    : null;
        }
        onChange([...value, blankObject]);
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <CmsReorderableCards
          items={value}
          onReorder={onChange}
          onRemove={removeItem}
          columns={false}
          renderItem={(item, index) => <Field fieldKey={fieldKey + '[' + index + ']'} value={item} onChange={next => updateItem(index, next)} password={password} depth={depth + 1} />}
        />

        <button
          type="button"
          onClick={addItem}
          style={{
            background: '#fff8f3',
            border: '1px dashed #d97f52',
            borderRadius: 10,
            color: '#b8582b',
            cursor: 'pointer',
            padding: '0.6rem 0.85rem',
            fontSize: '0.88rem',
            textAlign: 'left',
            fontWeight: 600,
          }}
        >
          + Add item
        </button>
      </div>
    );
  }

  if (value !== null && typeof value === 'object') {
    const objectValue = value as JsonObject;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.95rem',

        }}
      >
        {Object.entries(objectValue).map(([key, nestedValue]) => (
          <div key={key}>
            <label
              style={{
                display: 'block',
                fontWeight: 700,
                fontSize: '0.78rem',
                color: '#6b7b8c',
                marginBottom: '0.38rem',
                textTransform: 'none',
                letterSpacing: 'normal',
              }}
            >
              {formatKeyLabel(key)}
            </label>

            <Field
              fieldKey={key}
              value={nestedValue}
              onChange={(nextValue) => onChange({ ...objectValue, [key]: nextValue })}
              password={password}
              depth={depth + 1}
            />
          </div>
        ))}
      </div>
    );
  }

  return <span style={{ color: '#97a4b0', fontSize: '0.88rem' }}>null</span>;
}

// ---------------------------------------------------------------------------
// FormEditor — parses JSON content and renders it as an editable form.
//
// How it works:
// 1. Takes the raw JSON string `content` and parses it
// 2. Splits it into "sections" based on top-level keys (e.g. "hero", "servicesSection")
// 3. For known pages (like home.json), sections are shown in the preferred order
//    defined in HOME_PAGE_SECTIONS. Unknown keys appear after them.
// 4. Section navigation shows one <Field> at a time
// 5. When any field changes, the entire JSON is re-serialized and passed to `onChange`
//
// If the JSON is invalid or not an object, an error message is shown instead,
// explaining why the saved content cannot be edited.
// ---------------------------------------------------------------------------

function FormEditor({
  content,
  onChange,
  password,
  topLevelSections,
  activeSectionKey,
}: {
  content: string;
  onChange: (content: string) => void;
  password: string;
  topLevelSections?: SectionDefinition[];
  activeSectionKey?: string;
}) {
  const { data, error } = useMemo(() => {
    if (!content.trim()) {
      return { data: {} as JsonObject, error: null };
    }

    try {
      const parsed = JSON.parse(content) as unknown;

      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { data: null, error: 'This content could not be loaded into the editor: a JSON object is required.' };
      }

      return { data: parsed as JsonObject, error: null };
    } catch {
      return { data: null, error: 'This content could not be loaded because the saved JSON is invalid.' };
    }
  }, [content]);

  const sections = useMemo<SectionDefinition[]>(() => {
    if (!data) {
      return [];
    }

    const preferredSections = topLevelSections?.filter((section) => section.key in data) ?? [];
    const preferredKeys = new Set(preferredSections.map((section) => section.key));
    const remainingSections: SectionDefinition[] = Object.keys(data)
      .filter((key) => !preferredKeys.has(key))
      .map((key) => ({ key, label: formatKeyLabel(key) }));

    return [...preferredSections, ...remainingSections];
  }, [data, topLevelSections]);

  const selectedSectionKey =
    sections.find((section) => section.key === activeSectionKey)?.key ??
    sections[0]?.key;

  if (error || !data) {
    return (
      <div
        style={{
          padding: '1rem',
          color: '#9f2538',
          background: '#fff6f7',
          borderRadius: 12,
          border: '1px solid #f3ced5',
          fontSize: '0.92rem',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {sections.filter((section) => !activeSectionKey || section.key === selectedSectionKey).map((section) => (
        <section
          key={section.key}
          data-cms-section={section.key}
          style={{
            background: '#fff',
            border: '1px solid #e7edf2',
            borderRadius: 16,
            padding: '1rem',
            scrollMarginTop: '1rem',
          }}
        >
          <div style={{ marginBottom: ((!activeSectionKey && sections.length > 1) || section.description) ? '0.9rem' : 0 }}>
            {!activeSectionKey && sections.length > 1 && <h3 style={{ margin: 0, fontSize: '1rem', color: '#132030' }}>{section.label}</h3>}
            {section.description ? (
              <p style={{ margin: '0.35rem 0 0', color: '#697b8d', fontSize: '0.88rem' }}>{section.description}</p>
            ) : null}
          </div>

          <Field
            fieldKey={section.key}
            value={data[section.key]}
            onChange={(nextValue) => onChange(JSON.stringify({ ...data, [section.key]: nextValue }, null, 2))}
            password={password}
          />
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar style helpers — reusable style functions for navigation buttons
// and collapsible accordion triggers in the left sidebar.
// ---------------------------------------------------------------------------

/** Style for file navigation buttons in the sidebar. `active` highlights the selected file. */
function navButtonStyle(active: boolean, nested = false): CSSProperties {
  return {
    width: '100%',
    textAlign: 'left',
    border: 'none',
    background: active ? '#f3f6fa' : 'transparent',
    color: active ? '#142131' : '#495662',
    borderRadius: 12,
    padding: nested ? '0.7rem 0.75rem 0.7rem 2.1rem' : '0.8rem 0.85rem',
    cursor: 'pointer',
    fontSize: nested ? '0.96rem' : '1rem',
    fontWeight: active ? 700 : 500,
    transition: 'background 120ms ease, color 120ms ease',
  };
}

/** Style for the collapsible section headers (Home page, Blog, Content library). */
function accordionTriggerStyle(open: boolean): CSSProperties {
  return {
    width: '100%',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    padding: '0.8rem 0.85rem',
    borderRadius: 12,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#142131',
    fontWeight: 600,
    boxShadow: open ? 'inset 0 0 0 1px #e7edf2' : 'none',
  };
}

// ---------------------------------------------------------------------------
// CmsDashboard — the main dashboard component. Renders the full 3-column layout:
//
//   [Sidebar]  [Editor]  [Drag handle]  [Live Preview]
//
// Authentication: receives the already-validated password from AdminShell.
// All API calls include it in the "x-cms-password" header.
//
// Data flow:
//   1. On mount, loadFiles() fetches the list of editable content files
//   2. When a file is selected, loadFileContent() fetches its raw text
//   3. The editor (form or code) modifies the `content` state in memory
//   4. "Save Changes" calls saveCurrentFile() to persist via PUT /api/cms/files/...
//   5. After saving, the preview iframe is refreshed to show the update
// ---------------------------------------------------------------------------

export default function CmsDashboard({ initialPassword }: { initialPassword: string }) {
  // --- Core state ---
  const [password] = useState(initialPassword);          // CMS API password (from login)
  const [files, setFiles] = useState<string[]>([]);      // List of editable file paths
  const [selectedFile, setSelectedFile] = useState<string | null>(null); // Currently selected file
  const [content, setContent] = useState('');             // Raw text content of the selected file
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);    // Error message shown at bottom of editor
  const [status, setStatus] = useState<string | null>(null);  // Success message (e.g. "Saved at ...")

  // --- UI state ---
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('pages');    // Pages vs Settings sidebar tab
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<'home' | 'blog' | 'projects'>('home');
  const drawerSwipeStart = useRef<number | null>(null);
  const [homeOpen, setHomeOpen] = useState(true);        // Home page accordion expanded
  const [blogOpen, setBlogOpen] = useState(true);        // Blog accordion expanded
  const [projectsOpen, setProjectsOpen] = useState(false); // Projects accordion expanded
  const [libraryOpen, setLibraryOpen] = useState(false);  // Content library accordion expanded
  const [activeHomeSection, setActiveHomeSection] = useState('hero');

  // --- Preview & floating panel state ---
  const [previewKey, setPreviewKey] = useState(0);              // Incremented to force iframe reload
  const [panelOpen, setPanelOpen] = useState(false);             // Whether the floating form panel is visible
  const [panelPos, setPanelPos] = useState({ x: 204, y: 12 }); // Top-left position of the floating panel (next to sidebar)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Collapse sidebar into a small edit icon
  const [gridView, setGridView] = useState<'projects' | 'testimonials' | null>(null); // Grid picker mode for the panel
  const [multiContents, setMultiContents] = useState<Record<string, string>>({}); // All file contents for combined view
  const [loadingMulti, setLoadingMulti] = useState(false); // Loading all category files
  const [savingFile, setSavingFile] = useState<string | null>(null); // Which file in multi-view is currently saving
  const [panelWidth, setPanelWidth] = useState(440); // Current panel width (resizable)
  const [resizing, setResizing] = useState(false); // Whether the user is dragging the resize handle

  // --- Refs ---
  const panelRef = useRef<HTMLDivElement>(null);        // The floating panel element
  const [dragging, setDragging] = useState(false);      // Whether the user is currently dragging the panel
  const dragOffsetRef = useRef({ x: 0, y: 0 });        // Offset from mouse to panel top-left when drag started

  useEffect(() => {
    if (!mobileMoreOpen && !panelOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMobileMoreOpen(false); setPanelOpen(false); }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileMoreOpen, panelOpen]);

  // --- Effect: load file list on mount ---
  useEffect(() => {
    void loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Effect: load file content when a different file is selected ---
  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    void loadFileContent(selectedFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

  // --- Effect: load all files in category when gridView opens ---
  useEffect(() => {
    if (!gridView) return;
    const prefix = gridView === 'projects' ? PROJECTS_PREFIX : TESTIMONIALS_PREFIX;
    const filesToLoad = files.filter((fp) => fp.startsWith(prefix)).sort((a, b) => a.localeCompare(b));
    if (filesToLoad.length === 0) { setMultiContents({}); setLoadingMulti(false); return; }

    let cancelled = false;
    setLoadingMulti(true);

    Promise.all(
      filesToLoad.map(async (fp) => {
        const res = await fetch(`/api/cms/files/${encodeURI(fp)}`, { headers: { 'x-cms-password': password } });
        const body = (await res.json()) as FileResponse;
        if (!res.ok) throw new Error(body.error ?? `Failed to load ${fp}`);
        return [fp, body.content] as [string, string];
      }),
    )
      .then((entries) => {
        if (cancelled) return;
        setMultiContents(Object.fromEntries(entries));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load files.');
      })
      .finally(() => {
        if (!cancelled) setLoadingMulti(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridView, files]);

  // --- Effect: draggable floating panel ---
  // Listens for mousemove/mouseup globally so the drag keeps working
  // even if the cursor leaves the panel header.
  useEffect(() => {
    if (!dragging) return;

    function onMouseMove(e: MouseEvent) {
      e.preventDefault();
      setPanelPos({
        x: Math.max(0, e.clientX - dragOffsetRef.current.x),
        y: Math.max(0, e.clientY - dragOffsetRef.current.y),
      });
    }

    function onMouseUp() {
      setDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging]);

  // --- Effect: panel resize handle ---
  useEffect(() => {
    if (!resizing) return;

    function onMouseMove(e: MouseEvent) {
      e.preventDefault();
      const newWidth = Math.max(360, e.clientX - panelPos.x);
      setPanelWidth(newWidth);
    }

    function onMouseUp() {
      setResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [resizing, panelPos.x]);

  /** Start dragging the floating panel from its header bar. */
  function startPanelDrag(e: React.MouseEvent) {
    if (window.matchMedia('(max-width: 767px)').matches) return;
    e.preventDefault();
    dragOffsetRef.current = {
      x: e.clientX - panelPos.x,
      y: e.clientY - panelPos.y,
    };
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    setDragging(true);
  }

  // --- Computed / derived values ---

  /** Human-readable label for the file count shown under the Reload button. */
  const fileCountLabel = useMemo(
    () => (files.length === 1 ? '1 editable file' : `${files.length} editable files`),
    [files.length],
  );

  /** Markdown files use a plain text editor. */
  const isMdFile = selectedFile?.endsWith('.md') ?? false;

  /** True when the selected file is a blog post JSON file (uses the block editor). */
  const isBlogPost = selectedFile?.startsWith(BLOG_POSTS_PREFIX) && selectedFile?.endsWith('.json');

  /** Subset of files that live under the blog posts directory, alphabetically sorted. */
  const blogFiles = useMemo(
    () => files.filter((filePath) => filePath.startsWith(BLOG_POSTS_PREFIX)).sort((left, right) => left.localeCompare(right)),
    [files],
  );

  /** Project content files (projects/*.json), shown under Featured Projects. */
  const projectFiles = useMemo(
    () => files.filter((filePath) => filePath.startsWith(PROJECTS_PREFIX)).sort((left, right) => left.localeCompare(right)),
    [files],
  );

  /** Testimonial content files (testimonials/*.json), shown under Testimonials. */
  const testimonialFiles = useMemo(
    () => files.filter((filePath) => filePath.startsWith(TESTIMONIALS_PREFIX)).sort((left, right) => left.localeCompare(right)),
    [files],
  );

  /** All remaining files that aren't the home page, site settings, blog posts, projects, or testimonials. */
  const libraryFiles = useMemo(
    () =>
      files.filter(
        (filePath) =>
          filePath !== HOME_PAGE_FILE &&
          filePath !== SITE_SETTINGS_FILE &&
          !filePath.startsWith(BLOG_POSTS_PREFIX) &&
          !filePath.startsWith(PROJECTS_PREFIX) &&
          !filePath.startsWith(TESTIMONIALS_PREFIX),
      ),
    [files],
  );

  /** If editing the home page, provides the HOME_PAGE_SECTIONS array to FormEditor for section ordering. */
  const topLevelSections = useMemo(() => {
    if (selectedFile === HOME_PAGE_FILE) {
      return HOME_PAGE_SECTIONS;
    }

    return undefined;
  }, [selectedFile]);

  /** Maps the currently selected file to the public URL the iframe preview should display. */
  const previewUrl = useMemo(() => {
    if (!selectedFile) return '/';
    if (selectedFile === HOME_PAGE_FILE) return '/';
    if (selectedFile === SITE_SETTINGS_FILE) return '/';
    if (selectedFile.startsWith(BLOG_POSTS_PREFIX)) {
      const slug = selectedFile.replace(BLOG_POSTS_PREFIX, '').replace(/\.(md|json)$/i, '');
      return `/journal/${slug}`;
    }
    return '/';
  }, [selectedFile]);

  // --- API functions ---

  /** Fetches the list of editable content files from the server. Auto-selects home page or first file. */
  async function loadFiles() {
    setLoadingFiles(true);
    setError(null);

    try {
      const response = await fetch('/api/cms/files', {
        headers: { 'x-cms-password': password },
      });
      const body = (await response.json()) as FileListResponse;

      if (!response.ok) {
        throw new Error(body.error ?? 'Unable to load files.');
      }

      setFiles(body.files);

      if (!selectedFile) {
        if (body.files.includes(HOME_PAGE_FILE)) {
          setSelectedFile(HOME_PAGE_FILE);
        } else {
          setSelectedFile(body.files[0] ?? null);
        }
      }

      if (selectedFile && !body.files.includes(selectedFile)) {
        setSelectedFile(body.files[0] ?? null);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load files.');
    } finally {
      setLoadingFiles(false);
    }
  }

  /** Fetches the raw text content of a single file by its path. */
  async function loadFileContent(filePath: string) {
    setLoadingContent(true);
    setError(null);

    try {
      const response = await fetch(`/api/cms/files/${encodeURI(filePath)}`, {
        headers: { 'x-cms-password': password },
      });
      const body = (await response.json()) as FileResponse;

      if (!response.ok) {
        throw new Error(body.error ?? 'Unable to load file.');
      }

      setContent(body.content);
      setStatus(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load file.');
    } finally {
      setLoadingContent(false);
    }
  }

  /** Saves the current `content` state back to the selected file via PUT, then refreshes the preview iframe. */
  async function saveCurrentFile() {
    if (!selectedFile) {
      return;
    }

    setSaving(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch(`/api/cms/files/${encodeURI(selectedFile)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-cms-password': password,
        },
        body: JSON.stringify({ content }),
      });
      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? 'Unable to save file.');
      }

      setStatus(`Saved ${selectedFile} at ${new Date().toLocaleTimeString()}`);
      setPreviewKey((k) => k + 1);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save file.');
    } finally {
      setSaving(false);
    }
  }

  // --- Navigation helpers ---

  /** Saves a single file from the multi-file combined view. */
  async function saveMultiFile(filePath: string) {
    const fileContent = multiContents[filePath];
    if (!fileContent) return;

    setSavingFile(filePath);
    setError(null);

    try {
      const response = await fetch(`/api/cms/files/${encodeURI(filePath)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-cms-password': password },
        body: JSON.stringify({ content: fileContent }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? 'Unable to save.');
      setStatus(`Saved ${filePath} at ${new Date().toLocaleTimeString()}`);
      setPreviewKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save.');
    } finally {
      setSavingFile(null);
    }
  }

  /** Saves all modified files in the multi-file combined view. */
  async function saveAllMultiFiles() {
    const filesToSave = gridView === 'projects' ? projectFiles : gridView === 'testimonials' ? testimonialFiles : [];
    setSaving(true);
    setError(null);

    try {
      await Promise.all(
        filesToSave.map(async (fp) => {
          const fileContent = multiContents[fp];
          if (!fileContent) return;
          const res = await fetch(`/api/cms/files/${encodeURI(fp)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-cms-password': password },
            body: JSON.stringify({ content: fileContent }),
          });
          const body = (await res.json()) as { error?: string };
          if (!res.ok) throw new Error(body.error ?? `Failed to save ${fp}`);
        }),
      );
      setStatus(`Saved all at ${new Date().toLocaleTimeString()}`);
      setPreviewKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save.');
    } finally {
      setSaving(false);
    }
  }

  async function createFeaturedProject() {
    const title = prompt('Enter a name for the new project:');
    if (!title?.trim()) return;
    const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!slug) { setError('Enter a project name containing letters or numbers.'); return; }
    const filePath = PROJECTS_PREFIX + slug + '.json';
    setCreatingProject(true);
    setError(null);
    try {
      const existing = await fetch('/api/cms/files', { headers: { 'x-cms-password': password } });
      if (!existing.ok) throw new Error('Could not check project name.');
      const listing = await existing.json() as FileListResponse;
      if (listing.files.includes(filePath)) { setError('A project with this name already exists.'); return; }
      const template: import('@/lib/site-types').ProjectEntry = {
        title: title.trim(), company: '', date: '', image: '/obj.svg', video: '', href: '', order: Date.now(),
      };
      const content = JSON.stringify(template, null, 2);
      const response = await fetch('/api/cms/files/' + encodeURI(filePath), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-cms-password': password },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to create project.');
      setFiles((previous) => [...new Set([...previous, filePath])].sort());
      selectFile(filePath);
      setContent(content);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create project.');
    } finally {
      setCreatingProject(false);
    }
  }

  /** Selects a file in the sidebar. */
  function selectFile(filePath: string) {
    setMobileMoreOpen(false);
    if (filePath.startsWith(BLOG_POSTS_PREFIX)) setMobileSection('blog');
    else if (filePath.startsWith(PROJECTS_PREFIX)) setMobileSection('projects');
    else if (filePath === HOME_PAGE_FILE) setMobileSection('home');
    setSelectedFile(filePath);
    setGridView(null);
    setPanelOpen(true);
  }

  /** Selects a standalone homepage section form. */
  function openHomeSection(sectionKey: string) {
    setMobileMoreOpen(false);
    setMobileSection('home');
    // For projects/testimonials, open the grid picker instead of the home form
    if (sectionKey === 'projectsSection') {
      setGridView('projects');
      setPanelWidth(Math.max(panelWidth, 700));
      setPanelOpen(true);
      return;
    }
    if (sectionKey === 'testimonialsSection' && testimonialFiles.length > 0) {
      setGridView('testimonials');
      setPanelWidth(Math.max(panelWidth, 700));
      setPanelOpen(true);
      return;
    }

    setGridView(null);
    setActiveSidebarTab('pages');
    setHomeOpen(true);
    setActiveHomeSection(sectionKey);
    setPanelOpen(true);

    if (selectedFile !== HOME_PAGE_FILE) {
      setSelectedFile(HOME_PAGE_FILE);
    }
  }

  const editorTitle = (() => {
    if (gridView === 'projects') return 'Featured Projects';
    if (gridView === 'testimonials') return 'Testimonials';
    if (selectedFile === SITE_SETTINGS_FILE) return 'Site Settings';
    if (selectedFile === HOME_PAGE_FILE) {
      let available: JsonObject = {};
      try { available = JSON.parse(content) as JsonObject; } catch { /* Use the selected section while loading. */ }
      const section = HOME_PAGE_SECTIONS.find(item => item.key === activeHomeSection && (!Object.keys(available).length || item.key in available))
        ?? HOME_PAGE_SECTIONS.find(item => item.key in available);
      return section?.label ?? 'Home';
    }
    if (!selectedFile) return '';
    try {
      const data = JSON.parse(content) as JsonObject;
      const label = selectedFile.startsWith(TESTIMONIALS_PREFIX) ? data.author : data.title;
      if (typeof label === 'string' && label.trim()) return label;
    } catch { /* Fall back to the file label for non-JSON content. */ }
    return contentLabel(selectedFile);
  })();

  // --- Render ---
  // Minimal layout: full-screen preview, slim sidebar nav strip on the left,
  // and a separate floating form panel that appears when a section is clicked.

  return (
    <>
      <style>{`
        .cms-dashboard h1, .cms-dashboard h2, .cms-dashboard h3,
        .cms-dashboard h4, .cms-dashboard h5, .cms-dashboard h6,
        .cms-dashboard button, .cms-dashboard label, .cms-dashboard a {
          font-family: inherit;
          font-stretch: normal;
          font-variation-settings: normal;
        }
      `}</style>

      <main
        className="cms-dashboard"
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          fontFamily: "'Instrument Sans Variable', 'Instrument Sans', system-ui, sans-serif",
          color: '#122130',
        }}
      >
        <header className="cms-mobile-top" aria-label="CMS navigation">
          <div className="cms-mobile-tabs">
            <strong>Lucid CMS</strong>
            <button type="button" aria-pressed={activeSidebarTab === 'pages'} onClick={() => { setActiveSidebarTab('pages'); setPanelOpen(false); setMobileMoreOpen(false); }}>Pages</button>
            <button type="button" aria-pressed={activeSidebarTab === 'settings'} onClick={() => { setActiveSidebarTab('settings'); setPanelOpen(false); setMobileMoreOpen(false); }}>Settings</button>
          </div>
        </header>
        {mobileMoreOpen && <button type="button" className="cms-mobile-dismiss" aria-label="Close more options" onClick={() => setMobileMoreOpen(false)} />}
        <button type="button" className="cms-mobile-more" aria-label={mobileMoreOpen ? 'Close more options' : 'More options'} aria-expanded={mobileMoreOpen} aria-controls="cms-sidebar" onClick={() => setMobileMoreOpen(open => !open)}><span aria-hidden="true">•••</span></button>
        <nav className="cms-mobile-bottom" aria-label={activeSidebarTab === 'pages' ? 'Page sections' : 'Settings sections'}>
          <div className="cms-mobile-bottom-heading">{activeSidebarTab === 'pages' ? 'Pages' : 'Settings'}<span>Tap to edit</span></div>
          <div className="cms-mobile-section-list">
            {activeSidebarTab === 'pages' ? <>
              <button type="button" aria-current={mobileSection === 'home' ? 'true' : undefined} disabled={loadingFiles || !files.includes(HOME_PAGE_FILE)} onClick={() => openHomeSection(HOME_PAGE_SECTIONS[0].key)}>Home</button>
              <button type="button" aria-current={mobileSection === 'blog' ? 'true' : undefined} disabled={loadingFiles || !blogFiles.length} onClick={() => selectFile(blogFiles[0])}>Blog</button>
              <button type="button" aria-current={mobileSection === 'projects' ? 'true' : undefined} disabled={loadingFiles || !projectFiles.length} onClick={() => selectFile(projectFiles[0])}>Projects</button>
            </> : <button type="button" aria-current={selectedFile === SITE_SETTINGS_FILE ? 'true' : undefined} onClick={() => selectFile(SITE_SETTINGS_FILE)}>Site settings</button>}
          </div>
          {error && !panelOpen && <p className="cms-mobile-nav-error" role="alert">{error}</p>}
        </nav>
        {panelOpen && <button type="button" className="cms-drawer-backdrop" aria-label="Hide form" onClick={() => setPanelOpen(false)} />}
        {/* Full-screen preview iframe */}
        <iframe
          key={previewKey}
          src={`${previewUrl}${previewUrl.includes('?') ? '&' : '?'}t=${previewKey}`}
          title="Site preview"
          className="cms-preview"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: dragging || resizing ? 'none' : 'auto' }}
        />

        {/* Transparent overlay prevents iframe from stealing mouse events during drag/resize */}
        {dragging || resizing ? (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1050,
              cursor: 'grabbing',
            }}
          />
        ) : null}

        {/* ── Sidebar: collapses into a small edit icon, expands to full nav ── */}
        {sidebarCollapsed ? (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            title="Expand sidebar"
            className="cms-desktop-expand"
            style={{
              position: 'fixed',
              top: 12,
              left: 12,
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(16px)',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              zIndex: 1000,
              cursor: 'pointer',
              fontSize: '1rem',
              color: '#132030',
            }}
          >
            <LuPencil size={16} />
          </button>
        ) : null}
        <nav
          id="cms-sidebar"
          aria-label="More CMS options"
          className={`cms-sidebar ${mobileMoreOpen ? 'cms-more-open' : ''}`}
          style={{
            position: 'fixed',
            top: 12,
            left: 12,
            bottom: 12,
            width: 180,
            display: sidebarCollapsed ? 'none' : 'flex',
            flexDirection: 'column',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(16px)',
            borderRadius: 16,
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            zIndex: 1000,
            overflow: 'hidden',
            fontSize: '0.8rem',
          }}
        >
          {/* Brand + actions */}
          <div style={{ padding: '0.6rem 0.65rem', borderBottom: '1px solid #edf0f3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#132030' }}>Lucid CMS</span>
            <div style={{ display: 'flex', gap: '0.2rem' }}>
              <button type="button" onClick={() => setPreviewKey((k) => k + 1)} title="Refresh preview" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#7a8794', padding: '0.15rem', display: 'flex', alignItems: 'center' }}><LuRefreshCw size={13} /></button>
              <button type="button" onClick={() => setSidebarCollapsed(true)} title="Collapse sidebar" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#7a8794', padding: '0.15rem', display: 'flex', alignItems: 'center' }}><LuPanelLeftClose size={13} /></button>
              <a href="/" title="Back to site" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#7a8794', padding: '0.15rem', textDecoration: 'none', display: 'flex', alignItems: 'center' }}><LuArrowLeft size={13} /></a>
            </div>
          </div>

          {/* Pages / Settings toggle */}
          <div style={{ padding: '0.45rem 0.65rem 0.35rem', display: 'flex', gap: '0.2rem' }}>
            {(['pages', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveSidebarTab(tab);
                  if (window.matchMedia('(max-width: 767px)').matches) {
                    if (tab === 'settings') selectFile(SITE_SETTINGS_FILE);
                    else openHomeSection(activeHomeSection);
                  }
                }}
                style={{
                  flex: 1,
                  border: 'none',
                  background: activeSidebarTab === tab ? '#1a1a1a' : 'transparent',
                  color: activeSidebarTab === tab ? '#fff' : '#6b7b8c',
                  borderRadius: 8,
                  padding: '0.3rem 0',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {tab === 'pages' ? 'Pages' : 'Settings'}
              </button>
            ))}
          </div>

          {/* Scrollable section list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.35rem 0.5rem' }}>
            {activeSidebarTab === 'pages' ? (
              <>
                {/* Home page sections */}
                <div style={{ marginBottom: '0.5rem', border: '1px solid #e7edf2', borderRadius: 10, padding: '0.3rem', background: '#fff' }}>
                  <button
                    type="button"
                    aria-expanded={homeOpen}
                      aria-controls="cms-home-items"
                      onClick={() => setHomeOpen((c) => !c)}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      padding: '0.35rem 0.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: '#142131',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Home
                    {homeOpen ? <LuChevronDown size={12} style={{ color: '#a0aab4' }} /> : <LuChevronRight size={12} style={{ color: '#a0aab4' }} />}
                  </button>
                  <div id="cms-home-items">{homeOpen
                    ? HOME_PAGE_SECTIONS.map((section) => (
                        <button
                          key={section.key}
                          type="button"
                          onClick={() => openHomeSection(section.key)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            border: 'none',
                            background:
                              (section.key === 'projectsSection' && gridView === 'projects') ||
                              (section.key === 'testimonialsSection' && gridView === 'testimonials') ||
                              (selectedFile === HOME_PAGE_FILE && gridView === null && activeHomeSection === section.key)
                                ? '#f0f2f5'
                                : 'transparent',
                            color: '#3a4a5a',
                            borderRadius: 8,
                            padding: '0.35rem 0.45rem',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: 500,
                          }}
                        >
                          {section.label}
                        </button>
                      ))
                    : null}</div>
                </div>

                {/* Blog */}
                <div style={{ marginBottom: '0.5rem', border: '1px solid #e7edf2', borderRadius: 10, padding: '0.3rem', background: '#fff' }}>
                  <button
                    type="button"
                    aria-expanded={blogOpen}
                      aria-controls="cms-blog-items"
                      onClick={() => setBlogOpen((c) => !c)}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      padding: '0.35rem 0.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: '#142131',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Blog
                    {blogOpen ? <LuChevronDown size={12} style={{ color: '#a0aab4' }} /> : <LuChevronRight size={12} style={{ color: '#a0aab4' }} />}
                  </button>
                  <div id="cms-blog-items">{blogOpen
                    ? blogFiles.map((fp) => (
                        <div
                          key={fp}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            borderRadius: 8,
                            background: selectedFile === fp ? '#f0f2f5' : 'transparent',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => selectFile(fp)}
                            title={fp}
                            style={{
                              flex: 1,
                              textAlign: 'left',
                              border: 'none',
                              background: 'transparent',
                              color: selectedFile === fp ? '#132030' : '#3a4a5a',
                              borderRadius: 8,
                              padding: '0.35rem 0.45rem',
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              fontWeight: selectedFile === fp ? 600 : 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              minWidth: 0,
                            }}
                          >
                            {blogLabel(fp)}
                          </button>
                          <button
                            type="button"
                            title="Delete post"
                            onClick={async () => {
                              const label = blogLabel(fp);
                              if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
                              try {
                                const res = await fetch(`/api/cms/files/${encodeURI(fp)}`, {
                                  method: 'DELETE',
                                  headers: { 'x-cms-password': password },
                                });
                                if (!res.ok) {
                                  const data = (await res.json()) as { error?: string };
                                  setError(data.error ?? 'Failed to delete post.');
                                  return;
                                }
                                if (selectedFile === fp) setSelectedFile(null);
                                await loadFiles();
                              } catch {
                                setError('Failed to delete post.');
                              }
                            }}
                            style={{
                              flexShrink: 0,
                              border: 'none',
                              background: 'transparent',
                              color: '#c0392b',
                              cursor: 'pointer',
                              padding: '0.3rem 0.4rem',
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                              opacity: 0.6,
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.6'; }}
                          >
                            <LuTrash2 size={13} />
                          </button>
                        </div>
                      ))
                    : null}</div>
                  {blogOpen && (
                    <button
                      type="button"
                      onClick={async () => {
                        const slug = prompt('Enter a URL slug for the new post (e.g. my-new-post):');
                        if (!slug) return;
                        const safeName = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-');
                        if (!safeName) return;
                        const filePath = `${BLOG_POSTS_PREFIX}${safeName}.json`;
                        const template: import('@/lib/site-types').BlogPostData = {
                          title: '',
                          excerpt: '',
                          meta: 'Insight',
                          coverImage: '',
                          publishedAt: new Date().toISOString().split('T')[0],
                          blocks: [],
                        };
                        try {
                          const res = await fetch(`/api/cms/files/${encodeURI(filePath)}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'x-cms-password': password },
                            body: JSON.stringify({ content: JSON.stringify(template, null, 2) }),
                          });
                          if (!res.ok) throw new Error('Failed to create');
                          setFiles((prev) => [...prev, filePath].sort());
                          selectFile(filePath);
                          setContent(JSON.stringify(template, null, 2));
                        } catch {
                          setError('Failed to create new post.');
                        }
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        border: '1px dashed #cdd5dc',
                        background: 'transparent',
                        color: '#6b7b8c',
                        borderRadius: 8,
                        padding: '0.35rem 0.45rem',
                        cursor: 'pointer',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        marginTop: '0.15rem',
                      }}
                    >
                      <LuPlus size={11} /> New Post
                    </button>
                  )}
                </div>

                {/* Projects */}
                {(
                  <div style={{ marginBottom: '0.5rem', border: '1px solid #e7edf2', borderRadius: 10, padding: '0.3rem', background: '#fff' }}>
                    <button
                      type="button"
                      aria-expanded={projectsOpen}
                      aria-controls="cms-projects-items"
                      onClick={() => setProjectsOpen((c) => !c)}
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'none',
                        textAlign: 'left',
                        padding: '0.35rem 0.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: '#142131',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Projects
                      {projectsOpen ? <LuChevronDown size={12} style={{ color: '#a0aab4' }} /> : <LuChevronRight size={12} style={{ color: '#a0aab4' }} />}
                    </button>
                    {projectsOpen && projectFiles.length > 0 && (
                      <button type="button" onClick={() => { setGridView('projects'); setPanelWidth(Math.max(panelWidth, 700)); setPanelOpen(true); }} style={{ width: '100%', textAlign: 'left', border: 'none', background: '#f5f6f7', borderRadius: 8, padding: '0.5rem', color: '#3a4a5a', cursor: 'pointer', fontSize: '0.8rem' }}>
                        Edit / Reorder Projects
                      </button>
                    )}
                    <div id="cms-projects-items">{projectsOpen
                      ? projectFiles.map((fp) => (
                          <div
                            key={fp}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              borderRadius: 8,
                              background: selectedFile === fp ? '#f0f2f5' : 'transparent',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => selectFile(fp)}
                              title={fp}
                              style={{
                                flex: 1,
                                textAlign: 'left',
                                border: 'none',
                                background: 'transparent',
                                color: selectedFile === fp ? '#132030' : '#3a4a5a',
                                borderRadius: 8,
                                padding: '0.35rem 0.45rem',
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                                fontWeight: selectedFile === fp ? 600 : 500,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                minWidth: 0,
                              }}
                            >
                              {contentLabel(fp)}
                            </button>
                            <button
                              type="button"
                              title="Delete project"
                              onClick={async () => {
                                const label = contentLabel(fp);
                                if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
                                try {
                                  const res = await fetch(`/api/cms/files/${encodeURI(fp)}`, {
                                    method: 'DELETE',
                                    headers: { 'x-cms-password': password },
                                  });
                                  if (!res.ok) {
                                    const data = (await res.json()) as { error?: string };
                                    setError(data.error ?? 'Failed to delete project.');
                                    return;
                                  }
                                  if (selectedFile === fp) setSelectedFile(null);
                                  await loadFiles();
                                } catch {
                                  setError('Failed to delete project.');
                                }
                              }}
                              style={{
                                flexShrink: 0,
                                border: 'none',
                                background: 'transparent',
                                color: '#c0392b',
                                cursor: 'pointer',
                                padding: '0.3rem 0.4rem',
                                borderRadius: 6,
                                display: 'flex',
                                alignItems: 'center',
                                opacity: 0.6,
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.6'; }}
                            >
                              <LuTrash2 size={13} />
                            </button>
                          </div>
                        ))
                      : null}</div>
                    {projectsOpen && (
                      <button
                        type="button"
                        onClick={() => void createFeaturedProject()}
                        disabled={creatingProject}
                        style={{ width: '100%', textAlign: 'left', border: '1px dashed #cdd5dc', background: 'transparent', color: '#6b7b8c', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}
                      >
                        <LuPlus size={14} /> New Project
                      </button>
                    )}
                  </div>
                )}

                {/* Library */}
                {libraryFiles.length > 0 ? (
                  <div style={{ marginBottom: '0.5rem', border: '1px solid #e7edf2', borderRadius: 10, padding: '0.3rem', background: '#fff' }}>
                    <button
                      type="button"
                      onClick={() => setLibraryOpen((c) => !c)}
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'none',
                        textAlign: 'left',
                        padding: '0.35rem 0.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: '#142131',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Library
                      {libraryOpen ? <LuChevronDown size={12} style={{ color: '#a0aab4' }} /> : <LuChevronRight size={12} style={{ color: '#a0aab4' }} />}
                    </button>
                    {libraryOpen
                      ? libraryFiles.map((fp) => (
                          <button
                            key={fp}
                            type="button"
                            onClick={() => selectFile(fp)}
                            title={fp}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              border: 'none',
                              background: selectedFile === fp ? '#f0f2f5' : 'transparent',
                              color: selectedFile === fp ? '#132030' : '#3a4a5a',
                              borderRadius: 8,
                              padding: '0.35rem 0.45rem',
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              fontWeight: selectedFile === fp ? 600 : 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {fileLabel(fp)}
                          </button>
                        ))
                      : null}
                  </div>
                ) : null}
              </>
            ) : (
              <button
                type="button"
                onClick={() => selectFile(SITE_SETTINGS_FILE)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: selectedFile === SITE_SETTINGS_FILE ? '#f0f2f5' : 'transparent',
                  color: selectedFile === SITE_SETTINGS_FILE ? '#132030' : '#3a4a5a',
                  borderRadius: 8,
                  padding: '0.4rem 0.45rem',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: selectedFile === SITE_SETTINGS_FILE ? 600 : 500,
                }}
              >
                Site settings
              </button>
            )}
          </div>

          {/* Footer actions */}
          <div style={{ padding: '0.45rem 0.55rem', borderTop: '1px solid #edf0f3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={() => void loadFiles()}
              disabled={loadingFiles}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.72rem', color: '#7a8794', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <LuRotateCw size={11} /> {loadingFiles ? '...' : 'Reload'}
            </button>
            <button
              type="button"
              onClick={() => { window.localStorage.removeItem(ADMIN_SESSION_KEY); window.localStorage.removeItem('cms_dashboard_password'); window.location.reload(); }}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.72rem', color: '#7a8794', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <LuLogOut size={11} /> Sign out
            </button>
          </div>
        </nav>

        {/* ── Floating form editor panel (appears on section click) ── */}
        {(panelOpen || selectedFile) && (selectedFile || gridView) ? (
          <div
            className={`cms-editor ${panelOpen ? 'cms-editor-open' : 'cms-editor-desktop-closed'}`}
            aria-hidden={!panelOpen}
            inert={!panelOpen}
            ref={panelRef}
            style={{
              position: 'fixed',
              top: panelPos.y,
              left: panelPos.x,
              width: panelWidth,
              maxWidth: 'calc(100vw - 24px)',
              maxHeight: 'calc(100vh - 32px)',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255,255,255,0.97)',
              borderRadius: 16,
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
              zIndex: 1100,
              overflow: 'hidden',
            }}
          >
            {/* Resize handle on right edge */}
            <div
              className="cms-editor-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                document.body.style.cursor = 'ew-resize';
                document.body.style.userSelect = 'none';
                setResizing(true);
              }}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 6,
                height: '100%',
                cursor: 'ew-resize',
                zIndex: 2,
              }}
            />
            {/* Drag handle header */}
            <div
              onMouseDown={startPanelDrag}
              className="cms-editor-header"
              onPointerDown={event => {
                if (!window.matchMedia('(max-width: 767px)').matches || (event.target as HTMLElement).closest('button')) return;
                drawerSwipeStart.current = event.clientY;
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerUp={event => {
                if (drawerSwipeStart.current !== null && event.clientY - drawerSwipeStart.current > 50) setPanelOpen(false);
                drawerSwipeStart.current = null;
              }}
              onPointerCancel={() => { drawerSwipeStart.current = null; }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.7rem',
                cursor: 'grab',
                borderBottom: '1px solid #edf0f3',
                flexShrink: 0,
                userSelect: 'none',
                background: '#fafbfc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <LuGripVertical className="cms-editor-grip" size={14} style={{ color: '#b0b8c1', flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#132030', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <span className="cms-desktop-editor-title">{editorTitle}</span>
                  <span className="cms-mobile-editor-title">{activeSidebarTab === 'settings' ? 'Settings' : mobileSection === 'home' ? 'Home' : mobileSection === 'blog' ? 'Blog' : 'Projects'}</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                {gridView ? (
                  <button
                    type="button"
                    onClick={() => void saveAllMultiFiles()}
                    disabled={saving || loadingMulti}
                    style={{
                      border: 'none',
                      borderRadius: 8,
                      background: '#1f7a52',
                      color: '#fff',
                      padding: '0.3rem 0.6rem',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    {saving ? '...' : <><LuSave size={12} /> Save changes</>}
                  </button>
                ) : selectedFile ? (
                  <button
                    type="button"
                    onClick={() => void saveCurrentFile()}
                    disabled={!selectedFile || loadingContent || saving}
                    style={{
                      border: 'none',
                      borderRadius: 8,
                      background: '#1f7a52',
                      color: '#fff',
                      padding: '0.3rem 0.6rem',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    {saving ? '...' : <><LuSave size={12} /> Save</>}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  title="Hide form"
                  aria-label="Hide form"
                  className="cms-editor-close"
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#7a8794',
                    padding: '0.1rem 0.3rem',
                    borderRadius: 6,
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <LuX size={16} />
                </button>
              </div>
            </div>

            {activeSidebarTab === 'pages' && (
              <nav className="cms-mobile-form-picker" aria-label="Choose form">
                {(mobileSection === 'home'
                  ? HOME_PAGE_SECTIONS
                  : (mobileSection === 'blog' ? blogFiles : projectFiles).map(file => ({ key: file, label: contentLabel(file) }))
                ).map(form => {
                  const activeForm = mobileSection === 'home'
                    ? gridView === 'projects' ? 'projectsSection' : gridView === 'testimonials' ? 'testimonialsSection' : activeHomeSection
                    : selectedFile;
                  return <button type="button" key={form.key} aria-pressed={activeForm === form.key} onClick={event => {
                    event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
                    if (mobileSection === 'home') openHomeSection(form.key);
                    else selectFile(form.key);
                  }}>{form.label}</button>;
                })}
              </nav>
            )}
            {/* Scrollable editor body */}
            <div className="cms-editor-body" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '0.65rem 0.7rem' }}>
              {(gridView === 'projects' || (!gridView && selectedFile?.startsWith(PROJECTS_PREFIX))) && (
                <button type="button" disabled={creatingProject || saving} onClick={() => void createFeaturedProject()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%', marginBottom: '0.75rem', padding: '0.5rem 0.75rem', border: '1px dashed #de692e', borderRadius: 10, background: '#fff8f3', color: '#a74d20', font: 'inherit', fontSize: '0.85rem', fontWeight: 600, cursor: creatingProject ? 'wait' : 'pointer' }}>
                  <LuPlus size={16} /> {creatingProject ? 'Creating project...' : 'Add featured project'}
                </button>
              )}
              {gridView ? (
                loadingMulti ? (
                  <p style={{ color: '#4a6276', padding: '0.5rem 0', fontSize: '0.85rem' }}>Loading all items...</p>
                ) : (
                  <CmsReorderableCards
                    items={(gridView === 'projects' ? projectFiles : testimonialFiles)
                      .filter(file => multiContents[file] !== undefined)
                      .map((file): JsonObject & { __file: string } => ({ ...JSON.parse(multiContents[file]) as JsonObject, __file: file }))
                      .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))}
                    getKey={item => item.__file}
                    onReorder={items => setMultiContents(previous => {
                      const next = { ...previous };
                      items.forEach((item, index) => {
                        const { __file, ...data } = item;
                        next[__file] = JSON.stringify({ ...data, order: index + 1 }, null, 2);
                      });
                      return next;
                    })}
                    renderItem={item => {
                      const { __file, order, ...data } = item;
                      return gridView === 'projects'
                        ? <ProjectCardFields content={JSON.stringify({ ...data, order })} onChange={next => setMultiContents(previous => ({ ...previous, [__file]: next }))} password={password} />
                        : <Field fieldKey="testimonial" value={data} onChange={next => setMultiContents(previous => ({ ...previous, [__file]: JSON.stringify({ ...(next as JsonObject), order }, null, 2) }))} password={password} />;
                    }}
                  />
                )
              ) : loadingContent ? (
                <p style={{ color: '#4a6276', padding: '0.5rem 0', fontSize: '0.85rem' }}>Loading...</p>
              ) : isBlogPost ? (
                <BlogEditor key={selectedFile} content={content} onChange={setContent} password={password} />
              ) : isMdFile ? (
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  spellCheck={false}
                  disabled={loadingContent || !selectedFile}
                  style={{
                    width: '100%',
                    minHeight: 280,
                    borderRadius: 10,
                    border: '1px solid #cad4de',
                    padding: '0.65rem',
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    background: '#fcfdff',
                    boxSizing: 'border-box',
                  }}
                />
              ) : selectedFile?.startsWith(PROJECTS_PREFIX) ? (
                <ProjectCardFields content={content} onChange={setContent} password={password} />
              ) : (
                <div>
                  <FormEditor content={content} onChange={setContent} password={password} topLevelSections={topLevelSections} activeSectionKey={selectedFile === HOME_PAGE_FILE ? activeHomeSection : undefined} />
                </div>
              )}

              {error ? <p style={{ color: '#9f2538', margin: '0.4rem 0 0', fontSize: '0.8rem' }}>{error}</p> : null}
              {status ? <p style={{ color: '#16784f', margin: '0.4rem 0 0', fontSize: '0.8rem' }}>{status}</p> : null}
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}

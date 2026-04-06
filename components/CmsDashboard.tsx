'use client';

import '@fontsource-variable/instrument-sans/index.css';
import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { LuRefreshCw, LuPanelLeftClose, LuPanelLeftOpen, LuArrowLeft, LuGripVertical, LuX, LuSave, LuChevronDown, LuChevronRight, LuLogOut, LuRotateCw, LuPencil } from 'react-icons/lu';

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

const IMAGE_KEY_PATTERN = /image|img|photo|logo|avatar|thumbnail|cover|banner|icon|poster|src/i;
const IMAGE_EXT_PATTERN = /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i;
const VIDEO_EXT_PATTERN = /\.(mp4|webm)$/i;

/** Returns true if a JSON string field should be rendered as an image upload field. */
function isImageField(fieldKey: string, value: string) {
  if (IMAGE_KEY_PATTERN.test(fieldKey)) return true;
  if (IMAGE_EXT_PATTERN.test(value)) return true;
  if (value.startsWith('/') && (IMAGE_EXT_PATTERN.test(value) || VIDEO_EXT_PATTERN.test(value))) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Content file paths — these constants map to files inside the /content folder.
// They determine which files are shown in which sidebar section.
// ---------------------------------------------------------------------------

const HOME_PAGE_FILE = 'pages/home.json';
const SITE_SETTINGS_FILE = 'settings/site.json';
const BLOG_POSTS_PREFIX = 'posts/';

// The ordered list of editable sections on the home page.
// Each "key" must match a top-level key in content/pages/home.json.
const HOME_PAGE_SECTIONS: SectionDefinition[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'projectsSection', label: 'Featured Projects' },
  { key: 'featureShowcase', label: 'Featured showcase' },
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
  background: '#fbfdff',
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

/** Turns a blog post filename into a human-readable title. e.g. "my-cool-post.md" → "My Cool Post" */
function blogLabel(filePath: string) {
  return fileLabel(filePath)
    .replace(/\.md$/i, '')
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
}: {
  value: string;
  onChange: (value: string) => void;
  password: string;
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
          accept="image/*,video/mp4,video/webm,.svg"
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

      {value && isImage && !previewError ? (
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

    const hasObjectItems =
      value.length > 0 && !Array.isArray(value[0]) && value[0] !== null && typeof value[0] === 'object';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {value.map((item, index) => (
          <div
            key={`${fieldKey}-${index}`}
            style={{
              background: '#f4f8fc',
              borderRadius: 12,
              padding: '0.85rem 2.5rem 0.85rem 0.9rem',
              position: 'relative',
              border: '1px solid #e3ebf3',
            }}
          >
            {hasObjectItems ? (
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  color: '#6b7b8c',
                  marginBottom: '0.6rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Item {index + 1}
              </div>
            ) : null}

            <Field
              fieldKey={`${fieldKey}[${index}]`}
              value={item}
              onChange={(nextValue) => updateItem(index, nextValue)}
              password={password}
              depth={depth + 1}
            />

            <button
              type="button"
              onClick={() => removeItem(index)}
              title="Remove item"
              style={{
                position: 'absolute',
                top: '0.55rem',
                right: '0.55rem',
                background: '#fff',
                border: '1px solid #f0cfd5',
                color: '#b73449',
                cursor: 'pointer',
                fontSize: '0.88rem',
                lineHeight: 1,
                padding: '0.25rem 0.45rem',
                borderRadius: 999,
              }}
            >
              x
            </button>
          </div>
        ))}

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
          ...(depth > 0
            ? { paddingLeft: '1rem', borderLeft: '3px solid #e8eef4', marginTop: '0.3rem' }
            : {}),
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
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
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
// 4. Each section renders a <Field> for its value
// 5. When any field changes, the entire JSON is re-serialized and passed to `onChange`
//
// If the JSON is invalid or not an object, an error message is shown instead,
// prompting the user to switch to the Code Editor tab to fix the syntax.
// ---------------------------------------------------------------------------

function FormEditor({
  content,
  onChange,
  password,
  topLevelSections,
}: {
  content: string;
  onChange: (content: string) => void;
  password: string;
  topLevelSections?: SectionDefinition[];
}) {
  const { data, error } = useMemo(() => {
    if (!content.trim()) {
      return { data: {} as JsonObject, error: null };
    }

    try {
      const parsed = JSON.parse(content) as unknown;

      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { data: null, error: 'Top-level JSON must be an object. Use Code Editor instead.' };
      }

      return { data: parsed as JsonObject, error: null };
    } catch {
      return { data: null, error: 'Invalid JSON. Switch to Code Editor to fix the syntax first.' };
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
      {sections.map((section) => (
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
          <div style={{ marginBottom: '0.9rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#132030' }}>{section.label}</h3>
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
  const [error, setError] = useState<string | null>(null);    // Error message shown at bottom of editor
  const [status, setStatus] = useState<string | null>(null);  // Success message (e.g. "Saved at ...")

  // --- UI state ---
  const [activeEditorTab, setActiveEditorTab] = useState<'form' | 'code'>('form');  // Form vs Code editor toggle
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('pages');    // Pages vs Settings sidebar tab
  const [homeOpen, setHomeOpen] = useState(true);        // Home page accordion expanded
  const [blogOpen, setBlogOpen] = useState(true);        // Blog accordion expanded
  const [libraryOpen, setLibraryOpen] = useState(false);  // Content library accordion expanded
  const [pendingSectionScroll, setPendingSectionScroll] = useState<string | null>(null); // Section to scroll to after content loads

  // --- Preview & floating panel state ---
  const [previewKey, setPreviewKey] = useState(0);              // Incremented to force iframe reload
  const [panelOpen, setPanelOpen] = useState(false);             // Whether the floating form panel is visible
  const [panelPos, setPanelPos] = useState({ x: 204, y: 12 }); // Top-left position of the floating panel (next to sidebar)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Collapse sidebar into a small edit icon

  // --- Refs ---
  const formScrollRef = useRef<HTMLDivElement>(null);   // Scrollable container for the form editor
  const panelRef = useRef<HTMLDivElement>(null);        // The floating panel element
  const [dragging, setDragging] = useState(false);      // Whether the user is currently dragging the panel
  const dragOffsetRef = useRef({ x: 0, y: 0 });        // Offset from mouse to panel top-left when drag started

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

  // --- Effect: scroll to a specific section in the form editor ---
  // Triggered when clicking a home page section in the sidebar.
  useEffect(() => {
    if (!pendingSectionScroll || selectedFile !== HOME_PAGE_FILE || activeEditorTab !== 'form' || loadingContent) {
      return;
    }

    const scrollHost = formScrollRef.current;
    const sectionElement = scrollHost?.querySelector<HTMLElement>(`[data-cms-section="${pendingSectionScroll}"]`);

    if (!scrollHost || !sectionElement) {
      return;
    }

    sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setPendingSectionScroll(null);
  }, [activeEditorTab, content, loadingContent, pendingSectionScroll, selectedFile]);

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

  /** Start dragging the floating panel from its header bar. */
  function startPanelDrag(e: React.MouseEvent) {
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

  /** True when the selected file is Markdown (blog posts). Markdown files always use the code editor. */
  const isMdFile = selectedFile?.endsWith('.md') ?? false;

  /** Subset of files that live under the blog posts directory, alphabetically sorted. */
  const blogFiles = useMemo(
    () => files.filter((filePath) => filePath.startsWith(BLOG_POSTS_PREFIX)).sort((left, right) => left.localeCompare(right)),
    [files],
  );

  /** All remaining files that aren't the home page, site settings, or blog posts. */
  const libraryFiles = useMemo(
    () =>
      files.filter(
        (filePath) =>
          filePath !== HOME_PAGE_FILE && filePath !== SITE_SETTINGS_FILE && !filePath.startsWith(BLOG_POSTS_PREFIX),
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
      const slug = selectedFile.replace(BLOG_POSTS_PREFIX, '').replace(/\.md$/i, '');
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

  /** Selects a file in the sidebar and clears any pending section scroll. */
  function selectFile(filePath: string) {
    setSelectedFile(filePath);
    setPendingSectionScroll(null);
    setPanelOpen(true);
  }

  /** Selects the home page file, switches to the form editor, and queues a scroll to the given section. */
  function openHomeSection(sectionKey: string) {
    setActiveSidebarTab('pages');
    setHomeOpen(true);
    setActiveEditorTab('form');
    setPendingSectionScroll(sectionKey);
    setPanelOpen(true);

    if (selectedFile !== HOME_PAGE_FILE) {
      setSelectedFile(HOME_PAGE_FILE);
    }
  }

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
        {/* Full-screen preview iframe */}
        <iframe
          key={previewKey}
          src={`${previewUrl}${previewUrl.includes('?') ? '&' : '?'}t=${previewKey}`}
          title="Site preview"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: dragging ? 'none' : 'auto' }}
        />

        {/* Transparent overlay prevents iframe from stealing mouse events during drag */}
        {dragging ? (
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
                onClick={() => setActiveSidebarTab(tab)}
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
                <div style={{ marginBottom: '0.3rem' }}>
                  <button
                    type="button"
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
                  {homeOpen
                    ? HOME_PAGE_SECTIONS.map((section) => (
                        <button
                          key={section.key}
                          type="button"
                          onClick={() => openHomeSection(section.key)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            border: 'none',
                            background: selectedFile === HOME_PAGE_FILE && pendingSectionScroll === section.key ? '#f0f2f5' : 'transparent',
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
                    : null}
                </div>

                {/* Blog */}
                <div style={{ marginBottom: '0.3rem' }}>
                  <button
                    type="button"
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
                  {blogOpen
                    ? blogFiles.map((fp) => (
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
                          {blogLabel(fp)}
                        </button>
                      ))
                    : null}
                </div>

                {/* Library */}
                {libraryFiles.length > 0 ? (
                  <div style={{ marginBottom: '0.3rem' }}>
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
              onClick={() => { window.localStorage.removeItem('cms_dashboard_password'); window.location.reload(); }}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.72rem', color: '#7a8794', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <LuLogOut size={11} /> Sign out
            </button>
          </div>
        </nav>

        {/* ── Floating form editor panel (appears on section click) ── */}
        {panelOpen && selectedFile ? (
          <div
            ref={panelRef}
            style={{
              position: 'fixed',
              top: panelPos.y,
              left: panelPos.x,
              width: 440,
              maxWidth: 'calc(100vw - 220px)',
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
            {/* Drag handle header */}
            <div
              onMouseDown={startPanelDrag}
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
                <LuGripVertical size={14} style={{ color: '#b0b8c1', flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#132030', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedFile === HOME_PAGE_FILE ? 'Home' : fileLabel(selectedFile)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
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
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  title="Close editor panel"
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

            {/* Form / Code tab switcher (JSON files only) */}
            {!isMdFile && selectedFile ? (
              <div style={{ display: 'flex', padding: '0 0.7rem', borderBottom: '1px solid #edf0f3', flexShrink: 0 }}>
                {(['form', 'code'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveEditorTab(tab)}
                    style={{
                      border: 'none',
                      borderBottom: activeEditorTab === tab ? '2px solid #de692e' : '2px solid transparent',
                      background: 'none',
                      padding: '0.45rem 0.7rem',
                      fontWeight: activeEditorTab === tab ? 700 : 500,
                      color: activeEditorTab === tab ? '#de692e' : '#8a96a3',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      marginBottom: '-1px',
                    }}
                  >
                    {tab === 'form' ? 'Form' : 'Code'}
                  </button>
                ))}
              </div>
            ) : null}

            {/* Scrollable editor body */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '0.65rem 0.7rem' }}>
              {loadingContent ? (
                <p style={{ color: '#4a6276', padding: '0.5rem 0', fontSize: '0.85rem' }}>Loading...</p>
              ) : isMdFile || activeEditorTab === 'code' ? (
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
              ) : (
                <div ref={formScrollRef}>
                  <FormEditor content={content} onChange={setContent} password={password} topLevelSections={topLevelSections} />
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

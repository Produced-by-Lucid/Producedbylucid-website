'use client';

import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';

type FileListResponse = { files: string[]; error?: string };
type FileResponse = { path: string; content: string; error?: string };
type JsonObject = { [key: string]: JsonValue };
type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
type SidebarTab = 'pages' | 'settings';
type SectionDefinition = { key: string; label: string; description?: string };

const HOME_PAGE_FILE = 'pages/home.json';
const SITE_SETTINGS_FILE = 'settings/site.json';
const BLOG_POSTS_PREFIX = 'posts/';

const HOME_PAGE_SECTIONS: SectionDefinition[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'projectsSection', label: 'Featured Projects' },
  { key: 'featureShowcase', label: 'Featured showcase' },
  { key: 'servicesSection', label: 'Services' },
  { key: 'testimonialsSection', label: 'Testimonials' },
  { key: 'blogSection', label: 'Blog' },
  { key: 'footerSection', label: 'Footer' },
];

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

function formatKeyLabel(value: string) {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

function fileLabel(filePath: string) {
  return filePath.split('/').pop() ?? filePath;
}

function blogLabel(filePath: string) {
  return fileLabel(filePath)
    .replace(/\.md$/i, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function Field({
  fieldKey,
  value,
  onChange,
  depth = 0,
}: {
  fieldKey: string;
  value: JsonValue;
  onChange: (value: JsonValue) => void;
  depth?: number;
}) {
  if (typeof value === 'string') {
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
              depth={depth + 1}
            />
          </div>
        ))}
      </div>
    );
  }

  return <span style={{ color: '#97a4b0', fontSize: '0.88rem' }}>null</span>;
}

function FormEditor({
  content,
  onChange,
  topLevelSections,
}: {
  content: string;
  onChange: (content: string) => void;
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
          />
        </section>
      ))}
    </div>
  );
}

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

export default function CmsDashboard({ initialPassword }: { initialPassword: string }) {
  const [password] = useState(initialPassword);
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [activeEditorTab, setActiveEditorTab] = useState<'form' | 'code'>('form');
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('pages');
  const [homeOpen, setHomeOpen] = useState(true);
  const [blogOpen, setBlogOpen] = useState(true);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [pendingSectionScroll, setPendingSectionScroll] = useState<string | null>(null);
  const formScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    void loadFileContent(selectedFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

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

  const fileCountLabel = useMemo(
    () => (files.length === 1 ? '1 editable file' : `${files.length} editable files`),
    [files.length],
  );

  const isMdFile = selectedFile?.endsWith('.md') ?? false;

  const blogFiles = useMemo(
    () => files.filter((filePath) => filePath.startsWith(BLOG_POSTS_PREFIX)).sort((left, right) => left.localeCompare(right)),
    [files],
  );

  const libraryFiles = useMemo(
    () =>
      files.filter(
        (filePath) =>
          filePath !== HOME_PAGE_FILE && filePath !== SITE_SETTINGS_FILE && !filePath.startsWith(BLOG_POSTS_PREFIX),
      ),
    [files],
  );

  const topLevelSections = useMemo(() => {
    if (selectedFile === HOME_PAGE_FILE) {
      return HOME_PAGE_SECTIONS;
    }

    return undefined;
  }, [selectedFile]);

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
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save file.');
    } finally {
      setSaving(false);
    }
  }

  function selectFile(filePath: string) {
    setSelectedFile(filePath);
    setPendingSectionScroll(null);
  }

  function openHomeSection(sectionKey: string) {
    setActiveSidebarTab('pages');
    setHomeOpen(true);
    setActiveEditorTab('form');
    setPendingSectionScroll(sectionKey);

    if (selectedFile !== HOME_PAGE_FILE) {
      setSelectedFile(HOME_PAGE_FILE);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #fdf2e8 0%, #f6f8fb 18%, #f4f6f8 100%)',
        color: '#122130',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div style={{ maxWidth: 1420, margin: '0 auto', padding: '1.5rem 1rem 2rem' }}>
        <header style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Lucid Content Dashboard</h1>
          <p style={{ marginTop: '0.45rem', marginBottom: 0, color: '#556574' }}>
            Edit your pages, blog entries, and site settings from one place.
          </p>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '1rem', alignItems: 'start' }}>
          <aside
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 28,
              border: '1px solid #f0e5da',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(18, 33, 48, 0.07)',
              position: 'sticky',
              top: '1rem',
            }}
          >
            <div style={{ padding: '1.1rem 1.1rem 0.95rem', borderBottom: '1px solid #eceff3' }}>
              <div style={{ display: 'inline-flex', gap: '0.45rem', padding: '0.25rem', background: '#f3f4f6', borderRadius: 999 }}>
                <button
                  type="button"
                  onClick={() => setActiveSidebarTab('pages')}
                  style={{
                    border: 'none',
                    background: activeSidebarTab === 'pages' ? '#de692e' : 'transparent',
                    color: activeSidebarTab === 'pages' ? '#fff' : '#172331',
                    borderRadius: 999,
                    padding: '0.7rem 1.05rem',
                    cursor: 'pointer',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                  }}
                >
                  Pages
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSidebarTab('settings')}
                  style={{
                    border: 'none',
                    background: activeSidebarTab === 'settings' ? '#de692e' : 'transparent',
                    color: activeSidebarTab === 'settings' ? '#fff' : '#172331',
                    borderRadius: 999,
                    padding: '0.7rem 1.05rem',
                    cursor: 'pointer',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                  }}
                >
                  Site settings
                </button>
              </div>
            </div>

            <div style={{ padding: '1rem 1.1rem 1.25rem' }}>
              {activeSidebarTab === 'pages' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div>
                    <button type="button" onClick={() => setHomeOpen((current) => !current)} style={accordionTriggerStyle(homeOpen)}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1rem' }}>⌂</span>
                        <span>Home page</span>
                      </span>
                      <span style={{ color: '#7a8794' }}>{homeOpen ? '-' : '+'}</span>
                    </button>

                    {homeOpen ? (
                      <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        {HOME_PAGE_SECTIONS.map((section) => (
                          <button
                            key={section.key}
                            type="button"
                            onClick={() => openHomeSection(section.key)}
                            style={navButtonStyle(selectedFile === HOME_PAGE_FILE, true)}
                          >
                            {section.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #eceff3' }}>
                    <button type="button" onClick={() => setBlogOpen((current) => !current)} style={accordionTriggerStyle(blogOpen)}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.95rem' }}>▣</span>
                        <span>Blog</span>
                      </span>
                      <span style={{ color: '#7a8794' }}>{blogOpen ? '-' : '+'}</span>
                    </button>

                    {blogOpen ? (
                      <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        {blogFiles.map((filePath) => (
                          <button
                            key={filePath}
                            type="button"
                            onClick={() => selectFile(filePath)}
                            style={navButtonStyle(selectedFile === filePath, true)}
                            title={filePath}
                          >
                            {blogLabel(filePath)}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {libraryFiles.length > 0 ? (
                    <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #eceff3' }}>
                      <button type="button" onClick={() => setLibraryOpen((current) => !current)} style={accordionTriggerStyle(libraryOpen)}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.95rem' }}>⋯</span>
                          <span>Content library</span>
                        </span>
                        <span style={{ color: '#7a8794' }}>{libraryOpen ? '-' : '+'}</span>
                      </button>

                      {libraryOpen ? (
                        <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          {libraryFiles.map((filePath) => (
                            <button
                              key={filePath}
                              type="button"
                              onClick={() => selectFile(filePath)}
                              style={navButtonStyle(selectedFile === filePath, true)}
                              title={filePath}
                            >
                              {fileLabel(filePath)}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => selectFile(SITE_SETTINGS_FILE)}
                    style={navButtonStyle(selectedFile === SITE_SETTINGS_FILE)}
                  >
                    Site settings
                  </button>
                </div>
              )}
            </div>

            <div style={{ padding: '1rem 1.1rem 1.2rem', borderTop: '1px solid #eceff3', background: '#fcfcfd' }}>
              <button
                type="button"
                onClick={() => void loadFiles()}
                disabled={loadingFiles}
                style={{
                  width: '100%',
                  borderRadius: 12,
                  border: 'none',
                  background: '#de692e',
                  color: '#fff',
                  padding: '0.75rem 0.9rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {loadingFiles ? 'Loading...' : 'Reload Files'}
              </button>

              <p style={{ marginTop: '0.7rem', marginBottom: 0, color: '#6c7b89', fontSize: '0.9rem' }}>{fileCountLabel}</p>

              <button
                type="button"
                onClick={() => {
                  window.localStorage.removeItem('cms_dashboard_password');
                  window.location.reload();
                }}
                style={{
                  marginTop: '0.7rem',
                  width: '100%',
                  borderRadius: 12,
                  border: '1px solid #d5dde6',
                  background: 'transparent',
                  color: '#556574',
                  padding: '0.65rem 0.9rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                Sign Out
              </button>
            </div>
          </aside>

          <section
            style={{
              background: '#fff',
              borderRadius: 24,
              border: '1px solid #e6ebf0',
              padding: '1rem',
              boxShadow: '0 16px 40px rgba(18, 33, 48, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '0.85rem',
              }}
            >
              <div>
                <strong style={{ color: '#132030', fontSize: '1rem' }}>{selectedFile ?? 'No file selected'}</strong>
                <p style={{ margin: '0.3rem 0 0', color: '#6c7b89', fontSize: '0.9rem' }}>
                  {selectedFile === HOME_PAGE_FILE
                    ? 'Choose a section in the sidebar to jump directly to that part of the home page.'
                    : 'Edit content and save changes when you are ready.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void saveCurrentFile()}
                disabled={!selectedFile || loadingContent || saving}
                style={{
                  borderRadius: 12,
                  border: 'none',
                  background: '#1f7a52',
                  color: '#fff',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                  minWidth: 150,
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {!isMdFile && selectedFile ? (
              <div style={{ display: 'flex', borderBottom: '1px solid #d9e1e7', marginBottom: '1rem' }}>
                {(['form', 'code'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveEditorTab(tab)}
                    style={{
                      border: 'none',
                      borderBottom: activeEditorTab === tab ? '2px solid #de692e' : '2px solid transparent',
                      background: 'none',
                      padding: '0.65rem 1.15rem',
                      fontWeight: activeEditorTab === tab ? 700 : 500,
                      color: activeEditorTab === tab ? '#de692e' : '#566575',
                      cursor: 'pointer',
                      fontSize: '0.92rem',
                      marginBottom: '-1px',
                    }}
                  >
                    {tab === 'form' ? 'Form Editor' : 'Code Editor'}
                  </button>
                ))}
              </div>
            ) : null}

            {loadingContent ? (
              <p style={{ color: '#4a6276', padding: '1rem 0' }}>Loading...</p>
            ) : isMdFile || activeEditorTab === 'code' ? (
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                spellCheck={false}
                disabled={loadingContent || !selectedFile}
                style={{
                  width: '100%',
                  minHeight: '72vh',
                  borderRadius: 14,
                  border: '1px solid #cad4de',
                  padding: '1rem',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  background: '#fcfdff',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <div ref={formScrollRef} style={{ maxHeight: '74vh', overflowY: 'auto', padding: '0.25rem 0.1rem 1rem' }}>
                <FormEditor content={content} onChange={setContent} topLevelSections={topLevelSections} />
              </div>
            )}

            {error ? <p style={{ color: '#9f2538', margin: '0.85rem 0 0' }}>{error}</p> : null}
            {status ? <p style={{ color: '#16784f', margin: '0.85rem 0 0' }}>{status}</p> : null}
          </section>
        </section>
      </div>
    </main>
  );
}

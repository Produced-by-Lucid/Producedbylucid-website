'use client';

import { useEffect, useMemo, useState } from 'react';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type FileListResponse = { files: string[]; error?: string };
type FileResponse = { path: string; content: string; error?: string };
type JsonObject = { [key: string]: JsonValue };
type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

// â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PASSWORD_STORAGE_KEY = 'cms_dashboard_password';

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.6rem',
  borderRadius: 7,
  border: '1px solid #cad4de',
  fontSize: '0.88rem',
  fontFamily: 'inherit',
  background: '#fafcfe',
  boxSizing: 'border-box',
};

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function fileLabel(filePath: string) {
  return filePath.split('/').pop() ?? filePath;
}

// â”€â”€ Recursive field renderer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// A single self-referential component handles all JSON value types.

function Field({
  fieldKey,
  value,
  onChange,
  depth = 0,
}: {
  fieldKey: string;
  value: JsonValue;
  onChange: (v: JsonValue) => void;
  depth?: number;
}) {
  // â”€â”€ string â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (typeof value === 'string') {
    const isLong = value.length > 80 || value.includes('\n');
    if (isLong) {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={Math.min(Math.max(3, value.split('\n').length + 1), 12)}
          style={{ ...inputBase, resize: 'vertical', lineHeight: 1.5 }}
        />
      );
    }
    return (
      <input
        type={value.startsWith('http') ? 'url' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputBase}
      />
    );
  }

  // â”€â”€ number â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (typeof value === 'number') {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ...inputBase, width: 120 }}
      />
    );
  }

  // â”€â”€ boolean â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (typeof value === 'boolean') {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: 16, height: 16, cursor: 'pointer' }}
        />
        <span style={{ fontSize: '0.88rem', color: '#324454' }}>{value ? 'true' : 'false'}</span>
      </label>
    );
  }

  // â”€â”€ array â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (Array.isArray(value)) {
    const handleItem = (i: number, next: JsonValue) => {
      const arr = [...value];
      arr[i] = next;
      onChange(arr);
    };

    const removeItem = (i: number) => onChange(value.filter((_, idx) => idx !== i));

    const addItem = () => {
      const first = value[0];
      if (first === undefined) {
        onChange([...value, '']);
        return;
      }
      if (typeof first === 'string') {
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
        const blank: JsonObject = {};
        for (const [k, v] of Object.entries(first as JsonObject)) {
          blank[k] =
            typeof v === 'string' ? '' : typeof v === 'number' ? 0 : typeof v === 'boolean' ? false : null;
        }
        onChange([...value, blank]);
      }
    };

    const hasObjectItems =
      value.length > 0 &&
      !Array.isArray(value[0]) &&
      value[0] !== null &&
      typeof value[0] === 'object';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {value.map((item, i) => (
          <div
            key={i}
            style={{
              background: '#f0f5fb',
              borderRadius: 8,
              padding: '0.7rem 2.2rem 0.7rem 0.8rem',
              position: 'relative',
            }}
          >
            {hasObjectItems && (
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#4a6276',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Item {i + 1}
              </div>
            )}
            <Field
              fieldKey={`${fieldKey}[${i}]`}
              value={item}
              onChange={(v) => handleItem(i, v)}
              depth={depth + 1}
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              title="Remove item"
              style={{
                position: 'absolute',
                top: '0.4rem',
                right: '0.4rem',
                background: 'none',
                border: 'none',
                color: '#9f2538',
                cursor: 'pointer',
                fontSize: '0.9rem',
                lineHeight: 1,
                padding: '0.2rem 0.4rem',
                borderRadius: 4,
              }}
            >
              âœ•
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          style={{
            background: 'none',
            border: '1px dashed #9ab4c8',
            borderRadius: 7,
            color: '#0f4c81',
            cursor: 'pointer',
            padding: '0.4rem 0.8rem',
            fontSize: '0.85rem',
            textAlign: 'left',
          }}
        >
          + Add item
        </button>
      </div>
    );
  }

  // â”€â”€ object â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (value !== null && typeof value === 'object') {
    const data = value as JsonObject;
    const handleKey = (key: string, next: JsonValue) => onChange({ ...data, [key]: next });

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.9rem',
          ...(depth > 0
            ? { paddingLeft: '1rem', borderLeft: '3px solid #e0eaf5', marginTop: '0.2rem' }
            : {}),
        }}
      >
        {Object.entries(data).map(([key, v]) => (
          <div key={key}>
            <label
              style={{
                display: 'block',
                fontWeight: 700,
                fontSize: '0.78rem',
                color: '#4a6276',
                marginBottom: '0.35rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}
            </label>
            <Field
              fieldKey={key}
              value={v}
              onChange={(next) => handleKey(key, next)}
              depth={depth + 1}
            />
          </div>
        ))}
      </div>
    );
  }

  // â”€â”€ null â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return <span style={{ color: '#aaa', fontSize: '0.85rem' }}>null</span>;
}

// â”€â”€ FormEditor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function FormEditor({ content, onChange }: { content: string; onChange: (c: string) => void }) {
  const { data, error } = useMemo(() => {
    if (!content.trim()) return { data: {} as JsonObject, error: null };
    try {
      const parsed = JSON.parse(content) as unknown;
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { data: null, error: 'Top-level JSON must be an object â€” use Code Editor.' };
      }
      return { data: parsed as JsonObject, error: null };
    } catch {
      return {
        data: null,
        error: 'Invalid JSON â€” switch to Code Editor to fix the syntax first.',
      };
    }
  }, [content]);

  if (error || !data) {
    return (
      <div
        style={{
          padding: '1rem',
          color: '#9f2538',
          background: '#fff6f7',
          borderRadius: 10,
          border: '1px solid #f5c6cb',
          fontSize: '0.9rem',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <Field
      fieldKey="root"
      value={data}
      onChange={(next) => onChange(JSON.stringify(next, null, 2))}
    />
  );
}

// â”€â”€ CmsDashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function CmsDashboard() {
  const [password, setPassword] = useState('');
  const [passwordReady, setPasswordReady] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'code'>('form');

  useEffect(() => {
    const stored = window.localStorage.getItem(PASSWORD_STORAGE_KEY) ?? '';
    setPassword(stored);
    setPasswordReady(true);
  }, []);

  useEffect(() => {
    if (!passwordReady) return;
    void loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passwordReady]);

  useEffect(() => {
    if (!selectedFile) return;
    void loadFileContent(selectedFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

  const fileCountLabel = useMemo(
    () => (files.length === 1 ? '1 editable file' : `${files.length} editable files`),
    [files.length],
  );

  const isMdFile = selectedFile?.endsWith('.md') ?? false;

  async function loadFiles() {
    setLoadingFiles(true);
    setError(null);
    try {
      const res = await fetch('/api/cms/files', {
        headers: { 'x-cms-password': password },
      });
      const body = (await res.json()) as FileListResponse;
      if (!res.ok) throw new Error(body.error ?? 'Unable to load files.');
      setFiles(body.files);
      if (!selectedFile && body.files.length > 0) setSelectedFile(body.files[0]);
      if (selectedFile && !body.files.includes(selectedFile)) setSelectedFile(body.files[0] ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load files.');
    } finally {
      setLoadingFiles(false);
    }
  }

  async function loadFileContent(filePath: string) {
    setLoadingContent(true);
    setError(null);
    try {
      const res = await fetch(`/api/cms/files/${encodeURI(filePath)}`, {
        headers: { 'x-cms-password': password },
      });
      const body = (await res.json()) as FileResponse;
      if (!res.ok) throw new Error(body.error ?? 'Unable to load file.');
      setContent(body.content);
      setStatus(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load file.');
    } finally {
      setLoadingContent(false);
    }
  }

  async function saveCurrentFile() {
    if (!selectedFile) return;
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`/api/cms/files/${encodeURI(selectedFile)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-cms-password': password,
        },
        body: JSON.stringify({ content }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? 'Unable to save file.');
      setStatus(`Saved ${selectedFile} at ${new Date().toLocaleTimeString()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save file.');
    } finally {
      setSaving(false);
    }
  }

  function updatePassword(next: string) {
    setPassword(next);
    window.localStorage.setItem(PASSWORD_STORAGE_KEY, next);
  }

  return (
    <main
      style={{ minHeight: '100vh', background: '#f4f6f8', color: '#122130', fontFamily: 'Georgia, serif' }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1rem' }}>
        <header style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Lucid Content Dashboard</h1>
          <p style={{ marginTop: '0.4rem', marginBottom: 0, color: '#324454' }}>
            Edit your content files under content/.
          </p>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1rem' }}>
          {/* â”€â”€ Sidebar â”€â”€ */}
          <aside
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #d9e1e7',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '0.9rem', borderBottom: '1px solid #e7edf2' }}>
              <label
                htmlFor="cms-password"
                style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}
              >
                Dashboard Password
              </label>
              
              <input
                id="cms-password"
                type="password"
                value={password}
                onChange={(e) => updatePassword(e.target.value)}
                placeholder="Leave blank if disabled"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.7rem',
                  borderRadius: 8,
                  border: '1px solid #cad4de',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => void loadFiles()}
                disabled={loadingFiles}
                style={{
                  marginTop: '0.6rem',
                  width: '100%',
                  borderRadius: 8,
                  border: 'none',
                  background: '#D95B25',
                  color: '#fff',
                  padding: '0.6rem',
                  cursor: 'pointer',
                }}
              >
                {loadingFiles ? 'Loadingâ€¦' : 'Reload Files'}
              </button>
              <p style={{ marginTop: '0.6rem', marginBottom: 0, color: '#4a6276', fontSize: '0.9rem' }}>
                {fileCountLabel}
              </p>
            </div>

            <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              {files.map((filePath) => {
                const active = filePath === selectedFile;
                return (
                  <button
                    key={filePath}
                    type="button"
                    onClick={() => setSelectedFile(filePath)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      border: 'none',
                      borderBottom: '1px solid #eff3f7',
                      background: active ? '#e7f1fb' : '#fff',
                      padding: '0.7rem 0.8rem',
                      cursor: 'pointer',
                    }}
                    title={filePath}
                  >
                    <div style={{ fontWeight: 600, color: '#102030' }}>{fileLabel(filePath)}</div>
                    <div style={{ fontSize: '0.8rem', color: '#4a6276', marginTop: '0.2rem' }}>
                      {filePath}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* â”€â”€ Editor panel â”€â”€ */}
          <section
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #d9e1e7',
              padding: '1rem',
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.8rem',
                marginBottom: '0.75rem',
              }}
            >
              <strong style={{ color: '#102030' }}>{selectedFile ?? 'No file selected'}</strong>
              <button
                type="button"
                onClick={() => void saveCurrentFile()}
                disabled={!selectedFile || loadingContent || saving}
                style={{
                  borderRadius: 8,
                  border: 'none',
                  background: '#16784f',
                  color: '#fff',
                  padding: '0.6rem 1rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {saving ? 'Savingâ€¦' : 'Save Changes'}
              </button>
            </div>

            {/* Tab bar â€” JSON files only, hidden for markdown */}
            {!isMdFile && selectedFile && (
              <div
                style={{
                  display: 'flex',
                  borderBottom: '1px solid #d9e1e7',
                  marginBottom: '1rem',
                }}
              >
                {(['form', 'code'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      border: 'none',
                      borderBottom: activeTab === tab ? '2px solid #0f4c81' : '2px solid transparent',
                      background: 'none',
                      padding: '0.5rem 1.2rem',
                      fontWeight: activeTab === tab ? 700 : 400,
                      color: activeTab === tab ? '#0f4c81' : '#4a6276',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      marginBottom: '-1px',
                    }}
                  >
                    {tab === 'form' ? 'Form Editor' : 'Code Editor'}
                  </button>
                ))}
              </div>
            )}

            {/* Editor content */}
            {loadingContent ? (
              <p style={{ color: '#4a6276', padding: '1rem 0' }}>Loadingâ€¦</p>
            ) : isMdFile || activeTab === 'code' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck={false}
                disabled={loadingContent || !selectedFile}
                style={{
                  width: '100%',
                  minHeight: '70vh',
                  borderRadius: 10,
                  border: '1px solid #cad4de',
                  padding: '0.9rem',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.92rem',
                  lineHeight: 1.4,
                  background: '#fcfdff',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <div style={{ maxHeight: '72vh', overflowY: 'auto', padding: '0.25rem 0.5rem 1rem' }}>
                <FormEditor content={content} onChange={setContent} />
              </div>
            )}

            {error && <p style={{ color: '#9f2538', margin: '0.75rem 0 0' }}>{error}</p>}
            {status && <p style={{ color: '#16784f', margin: '0.75rem 0 0' }}>{status}</p>}
          </section>
        </section>
      </div>
    </main>
  );
}

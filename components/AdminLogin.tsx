'use client';

import { type CSSProperties, type FormEvent, useState } from 'react';

const PASSWORD_STORAGE_KEY = 'cms_dashboard_password';

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.75rem 0.85rem',
  borderRadius: 12,
  border: '1px solid #d5dde6',
  fontSize: '1rem',
  fontFamily: 'inherit',
  background: '#fbfdff',
  boxSizing: 'border-box',
};

export default function AdminLogin({ onAuthenticated }: { onAuthenticated: (password: string) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/cms/files', {
        headers: { 'x-cms-password': password },
      });

      if (!response.ok) {
        setError('Invalid password. Please try again.');
        setLoading(false);
        return;
      }

      window.localStorage.setItem(PASSWORD_STORAGE_KEY, password);
      onAuthenticated(password);
    } catch {
      setError('Unable to connect. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #fdf2e8 0%, #f6f8fb 18%, #f4f6f8 100%)',
        fontFamily: 'Georgia, serif',
        padding: '1rem',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 28,
          border: '1px solid #f0e5da',
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 50px rgba(18, 33, 48, 0.07)',
          textAlign: 'center',
          color: '#122130',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
        <h1 style={{ fontSize: '1.6rem', margin: '0 0 0.35rem' }}>Content Dashboard</h1>
        <p style={{ color: '#556574', margin: '0 0 1.75rem', fontSize: '0.95rem' }}>
          Enter your password to continue.
        </p>

        <label htmlFor="login-password" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'left' }}>
          Password
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Dashboard password"
          required
          autoFocus
          style={inputStyle}
        />

        {error ? (
          <p style={{ color: '#9f2538', margin: '0.75rem 0 0', fontSize: '0.9rem' }}>{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading || !password}
          style={{
            marginTop: '1.25rem',
            width: '100%',
            borderRadius: 12,
            border: 'none',
            background: '#de692e',
            color: '#fff',
            padding: '0.8rem 1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '1rem',
            opacity: loading || !password ? 0.65 : 1,
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </main>
  );
}

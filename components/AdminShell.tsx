// ---------------------------------------------------------------------------
// AdminShell — Auth gate wrapper for the /admin route.
//
// On mount it checks localStorage for a previously saved password:
//   • Found  → renders CmsDashboard immediately (returning user).
//   • Not found  → renders AdminLogin so the user can authenticate.
//
// The `ready` flag prevents a flash of the login form on first render
// while we're reading from localStorage (which requires the browser).
// ---------------------------------------------------------------------------

'use client';

import { useEffect, useState } from 'react';
import AdminLogin from './AdminLogin';
import CmsDashboard from './CmsDashboard';

/** localStorage key — must match the key used in AdminLogin. */
const PASSWORD_STORAGE_KEY = 'cms_dashboard_password';

/**
 * Wraps the dashboard in a simple auth check.
 * If the user has a stored password → CmsDashboard.
 * Otherwise → AdminLogin.
 */
export default function AdminShell() {
  const [password, setPassword] = useState<string | null>(null);  // Validated CMS password (null = not logged in)
  const [ready, setReady] = useState(false);                      // True once localStorage has been read

  // On mount: try restoring session from localStorage
  useEffect(() => {
    const stored = window.localStorage.getItem(PASSWORD_STORAGE_KEY);
    if (stored) {
      setPassword(stored);
    }
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  if (!password) {
    return <AdminLogin onAuthenticated={(pw) => setPassword(pw)} />;
  }

  return <CmsDashboard initialPassword={password} />;
}

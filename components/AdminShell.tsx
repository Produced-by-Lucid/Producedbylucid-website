'use client';

import { useEffect, useState } from 'react';
import AdminLogin from './AdminLogin';
import CmsDashboard from './CmsDashboard';

const PASSWORD_STORAGE_KEY = 'cms_dashboard_password';

export default function AdminShell() {
  const [password, setPassword] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

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

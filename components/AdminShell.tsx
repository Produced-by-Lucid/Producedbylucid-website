'use client';

import { useEffect, useState } from 'react';
import { ADMIN_SESSION_KEY, readAdminSession, type AdminSession } from '@/lib/admin-session';
import AdminLogin from './AdminLogin';
import CmsDashboard from './CmsDashboard';

/** Requires a fresh login every hour, including when the dashboard stays open. */
export default function AdminShell() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(readAdminSession());
    setReady(true);
  }, []);

  useEffect(() => {
    const restoreSession = () => setSession(readAdminSession());
    const onStorage = (event: StorageEvent) => {
      if (event.key === ADMIN_SESSION_KEY || event.key === null) restoreSession();
    };
    // Recheck suspended tabs on return and synchronize sign-ins across tabs.
    window.addEventListener('focus', restoreSession);
    document.addEventListener('visibilitychange', restoreSession);
    window.addEventListener('storage', onStorage);
    const timeout = session
      ? window.setTimeout(restoreSession, Math.max(0, session.expiresAt - Date.now()))
      : undefined;
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('focus', restoreSession);
      document.removeEventListener('visibilitychange', restoreSession);
      window.removeEventListener('storage', onStorage);
    };
  }, [session]);

  if (!ready) return null;
  if (!session) return <AdminLogin onAuthenticated={setSession} />;
  return <CmsDashboard key={session.expiresAt} initialPassword={session.password} />;
}

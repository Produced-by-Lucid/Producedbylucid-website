export const ADMIN_SESSION_KEY = 'cms_dashboard_session';
export const ADMIN_SESSION_DURATION_MS = 60 * 60 * 1000;
export type AdminSession = { password: string; expiresAt: number };

export function readAdminSession(): AdminSession | null {
  window.localStorage.removeItem('cms_dashboard_password');
  const stored = window.localStorage.getItem(ADMIN_SESSION_KEY);
  if (!stored) return null;
  try {
    const session = JSON.parse(stored) as AdminSession;
    const now = Date.now();
    if (typeof session.password === 'string' && session.password.length > 0 &&
        typeof session.expiresAt === 'number' && Number.isFinite(session.expiresAt) &&
        session.expiresAt > now && session.expiresAt <= now + ADMIN_SESSION_DURATION_MS) {
      return session;
    }
  } catch {
    // Invalid stored sessions require a fresh login.
  }
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
  return null;
}

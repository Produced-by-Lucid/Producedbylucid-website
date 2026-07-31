import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

export const CMS_SESSION_COOKIE = 'cms_admin_session';
export const CMS_SESSION_MAX_AGE = 60 * 60 * 8;

function password() { const value = process.env.CMS_DASHBOARD_PASSWORD; return value && value.length >= 12 ? value : null; }
function secret() { return process.env.CMS_SESSION_SECRET ?? password(); }
function equal(a: string, b: string) { const x = Buffer.from(a); const y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); }
function sign(value: string, key: string) { return createHmac('sha256', key).update(value).digest('base64url'); }

export function adminAuthIsConfigured() { return Boolean(password() && secret() && secret()!.length >= 32); }
export function verifyAdminPassword(value: string) { const expected = password(); return Boolean(expected && equal(value, expected)); }
export function createAdminSession() {
  const key = secret();
  if (!key || !adminAuthIsConfigured()) throw new Error('Admin authentication is not securely configured.');
  const payload = `${Date.now()}.${randomUUID()}`;
  return `${payload}.${sign(payload, key)}`;
}
export function isAdminRequest(request: NextRequest) {
  const key = secret(); const token = request.cookies.get(CMS_SESSION_COOKIE)?.value;
  if (!key || !token || !adminAuthIsConfigured()) return false;
  const dot = token.lastIndexOf('.'); if (dot < 1) return false;
  const payload = token.slice(0, dot); const signature = token.slice(dot + 1); const issuedAt = Number(payload.split('.')[0]);
  if (!Number.isFinite(issuedAt) || issuedAt > Date.now() + 30_000 || Date.now() - issuedAt > CMS_SESSION_MAX_AGE * 1000) return false;
  return equal(signature, sign(payload, key));
}

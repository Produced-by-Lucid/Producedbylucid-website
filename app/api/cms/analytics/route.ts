import { NextResponse } from 'next/server';
import { cmsPasswordIsValid } from '@/lib/cms-files';

// GA4 Data API v1beta — runReport
// Docs: https://developers.google.com/analytics/devguides/reporting/data/v1

async function getGoogleAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const signingInput = `${headerB64}.${payloadB64}`;

  const pemBody = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');

  const keyData = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput),
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const jwt = `${signingInput}.${signatureB64}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
    cache: 'no-store',
  });

  if (!tokenResponse.ok) {
    const err = await tokenResponse.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error(`Failed to get Google access token: ${String(err.error_description ?? err.error ?? tokenResponse.status)}`);
  }

  const tokenData = await tokenResponse.json() as { access_token: string };
  return tokenData.access_token;
}

export async function GET(request: Request) {
  const password = request.headers.get('x-cms-password');
  if (!cmsPasswordIsValid(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const propertyId = process.env.GA_PROPERTY_ID;
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  const privateKey = (process.env.GA_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');

  if (!propertyId || !clientEmail || !privateKey) {
    return NextResponse.json(
      { error: 'Missing GA4 config. Set GA_PROPERTY_ID, GA_CLIENT_EMAIL, and GA_PRIVATE_KEY.' },
      { status: 400 },
    );
  }

  const requestUrl = new URL(request.url);
  const daysRaw = Number(requestUrl.searchParams.get('days') ?? '14');
  const days = [7, 14, 30].includes(daysRaw) ? daysRaw : 14;

  try {
    const accessToken = await getGoogleAccessToken(clientEmail, privateKey);

    const until = new Date();
    const from = new Date(until);
    from.setDate(until.getDate() - days + 1);

    const startDate = from.toISOString().slice(0, 10);
    const endDate = until.toISOString().slice(0, 10);

    const reportResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'date' }],
          metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
          orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
        }),
        cache: 'no-store',
      },
    );

    const body = await reportResponse.json().catch(() => ({})) as Record<string, unknown>;

    if (!reportResponse.ok) {
      const errMsg =
        typeof (body.error as Record<string, unknown> | undefined)?.message === 'string'
          ? (body.error as Record<string, unknown>).message
          : `GA4 API returned ${reportResponse.status}`;
      return NextResponse.json({ error: String(errMsg) }, { status: reportResponse.status });
    }

    type GA4Row = { dimensionValues: { value: string }[]; metricValues: { value: string }[] };
    const rows = Array.isArray(body.rows) ? (body.rows as GA4Row[]) : [];

    const points = rows.map((row) => {
      const rawDate = row.dimensionValues?.[0]?.value ?? '';
      // GA4 returns dates as YYYYMMDD — convert to YYYY-MM-DD
      const date = rawDate.length === 8
        ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
        : rawDate;
      const pageViews = Number(row.metricValues?.[0]?.value ?? 0);
      const visitors = Number(row.metricValues?.[1]?.value ?? 0);
      return { date, pageViews, visitors };
    });

    return NextResponse.json({ points });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch GA4 analytics.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

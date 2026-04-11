import { NextResponse } from 'next/server';
import { cmsPasswordIsValid } from '@/lib/cms-files';

type VercelAnalyticsPoint = {
  date: string;
  pageViews: number;
  visitors: number;
};

function asNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function asDate(value: unknown) {
  if (typeof value === 'string' && value.trim().length > 0) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return new Date(value).toISOString().slice(0, 10);
  return '';
}

function normalizeAnalyticsPoints(payload: unknown): VercelAnalyticsPoint[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const dataPayload = payload as Record<string, unknown>;
  const candidate = [
    dataPayload.points,
    dataPayload.data,
    dataPayload.results,
    dataPayload.buckets,
  ].find((value) => Array.isArray(value));

  if (!Array.isArray(candidate)) {
    return [];
  }

  const mapped = candidate
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const row = entry as Record<string, unknown>;

      const date = asDate(row.date ?? row.day ?? row.x ?? row.start ?? row.timestamp);
      if (!date) return null;

      const pageViews = asNumber(row.pageViews ?? row.pageviews ?? row.views ?? row.visits ?? row.pv);
      const visitors = asNumber(row.visitors ?? row.uniqueVisitors ?? row.uniques ?? row.users ?? row.uv);

      return {
        date,
        pageViews,
        visitors: visitors > 0 ? visitors : pageViews,
      };
    })
    .filter((point): point is VercelAnalyticsPoint => point !== null)
    .sort((left, right) => left.date.localeCompare(right.date));

  return mapped;
}

export async function GET(request: Request) {
  const password = request.headers.get('x-cms-password');

  if (!cmsPasswordIsValid(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.CMS_VERCEL_API_TOKEN ?? process.env.VERCEL_API_TOKEN;
  const projectId = process.env.CMS_VERCEL_PROJECT_ID ?? process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.CMS_VERCEL_TEAM_ID;
  const endpoint = process.env.CMS_VERCEL_ANALYTICS_ENDPOINT ?? 'https://api.vercel.com/v1/web/insights';

  if (!token || !projectId) {
    return NextResponse.json(
      {
        error:
          'Missing Vercel analytics config. Set CMS_VERCEL_API_TOKEN and CMS_VERCEL_PROJECT_ID environment variables.',
      },
      { status: 400 },
    );
  }

  try {
    const url = new URL(endpoint);
    const requestUrl = new URL(request.url);
    const daysRaw = Number(requestUrl.searchParams.get('days') ?? '14');
    const days = [7, 14, 30].includes(daysRaw) ? daysRaw : 14;

    const until = new Date();
    const from = new Date(until);
    from.setDate(until.getDate() - days + 1);

    url.searchParams.set('projectId', projectId);
    url.searchParams.set('from', from.toISOString());
    url.searchParams.set('to', until.toISOString());
    url.searchParams.set('interval', 'day');

    if (teamId) {
      url.searchParams.set('teamId', teamId);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    if (!response.ok) {
      const apiMessage = typeof body.error === 'string' ? body.error : typeof body.message === 'string' ? body.message : 'Unable to fetch analytics from Vercel.';
      return NextResponse.json(
        {
          error: `Vercel API returned ${response.status}: ${apiMessage}`,
          vercelStatus: response.status,
          vercelBody: body,
        },
        { status: response.status },
      );
    }

    const points = normalizeAnalyticsPoints(body);

    return NextResponse.json({ points, source: endpoint });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch analytics from Vercel.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

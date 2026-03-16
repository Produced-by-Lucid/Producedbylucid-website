import type { NextApiRequest, NextApiResponse } from 'next';

const hasSelfHostedEnv = Boolean(
  process.env.NEXTAUTH_SECRET &&
    process.env.GITHUB_OWNER &&
    process.env.GITHUB_REPO &&
    process.env.GITHUB_PERSONAL_ACCESS_TOKEN &&
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
);

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true' || !hasSelfHostedEnv;

function normalizeRequestBody(req: NextApiRequest, res: NextApiResponse) {
  if (!req.body) {
    return true;
  }

  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      res.status(400).json({ error: 'invalid json body' });
      return false;
    }
  }

  if (typeof req.body === 'object' && req.body !== null && !('variables' in req.body)) {
    req.body = {
      ...req.body,
      variables: {},
    };
  }

  return true;
}

export default async function tinaHandler(req: NextApiRequest, res: NextApiResponse) {
  if (!normalizeRequestBody(req, res)) {
    return;
  }

  const { initializeTinaDatabase } = await import('../../../tina/database');
  await initializeTinaDatabase();

  const [{ TinaNodeBackend, LocalBackendAuthProvider }, { default: databaseClient }] =
    await Promise.all([
      import('@tinacms/datalayer'),
      import('../../../tina/__generated__/databaseClient'),
    ]);

  if (isLocal) {
    const handler = TinaNodeBackend({
      authProvider: LocalBackendAuthProvider(),
      databaseClient,
    });

    return handler(req, res);
  }

  const [{ AuthJsBackendAuthProvider, TinaAuthJSOptions }] = await Promise.all([
    import('tinacms-authjs'),
  ]);

  const handler = TinaNodeBackend({
    authProvider: AuthJsBackendAuthProvider({
      authOptions: TinaAuthJSOptions({
        databaseClient,
        secret: process.env.NEXTAUTH_SECRET!,
      }),
    }),
    databaseClient,
  });

  return handler(req, res);
}

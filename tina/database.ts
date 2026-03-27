import {
  createDatabase,
} from '@tinacms/datalayer';
import { createDatabaseInternal, FilesystemBridge } from '@tinacms/graphql';
import type { DocumentNode } from 'graphql';
import { MemoryLevel } from 'memory-level';

import graphQLSchema from './__generated__/_graphql.json';
import lookup from './__generated__/_lookup.json';
import tinaSchemaDocument from './__generated__/_schema.json';

const branch =
  process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || 'main';

const hasAuthBaseUrl = Boolean(
  process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL_INTERNAL || process.env.VERCEL_URL
);

const hasSelfHostedEnv = Boolean(
  hasAuthBaseUrl &&
    process.env.NEXTAUTH_SECRET &&
    process.env.GITHUB_OWNER &&
    process.env.GITHUB_REPO &&
    process.env.GITHUB_PERSONAL_ACCESS_TOKEN &&
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
);

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true' || !hasSelfHostedEnv;
const typedGraphQLSchema = graphQLSchema as unknown as DocumentNode;

type CreateDatabaseConfig = Parameters<typeof createDatabase>[0];

function createProductionDatabase() {
  // These providers are only needed for the self-hosted Vercel deployment path.
  // Keeping them behind a runtime branch avoids local Next dev importing ESM-only
  // packages when Tina is running in local mode.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { RedisLevel } = require('upstash-redis-level');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { GitHubProvider } = require('tinacms-gitprovider-github');

  const databaseAdapter = new RedisLevel({
    redis: {
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    },
    debug: process.env.DEBUG === 'true',
  }) as unknown as CreateDatabaseConfig['databaseAdapter'];

  return createDatabase({
    gitProvider: new GitHubProvider({
      branch,
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN!,
    }),
    databaseAdapter,
    namespace: branch,
  });
}

function createIndexedLocalDatabase() {
  return createDatabaseInternal({
    bridge: new FilesystemBridge(process.cwd()),
    level: new MemoryLevel<string, Record<string, any>>(),
  });
}

const database = isLocal ? createIndexedLocalDatabase() : createProductionDatabase();

let initializationPromise: Promise<void> | null = null;

export function initializeTinaDatabase() {
  if (!isLocal) {
    return Promise.resolve();
  }

  if (!initializationPromise) {
    const localTinaSchema = {
      schema: tinaSchemaDocument,
    } as unknown as any;

    initializationPromise = database
      .indexContent({
        graphQLSchema: typedGraphQLSchema,
        tinaSchema: localTinaSchema,
        lookup,
      })
      .then(() => {});
  }

  return initializationPromise;
}

export default database;

import { execSync } from 'node:child_process';

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
const tinaBuildCommand = isLocal ? 'npx tinacms build --skip-indexing' : 'npx tinacms build';

console.log(`Running Tina build in ${isLocal ? 'local' : 'production'} mode: ${tinaBuildCommand}`);

execSync(tinaBuildCommand, {
  stdio: 'inherit',
  env: process.env,
});

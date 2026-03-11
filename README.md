# Produced by Lucid Website

Next.js marketing site with a self-hosted TinaCMS admin embedded in the same app.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local`.

3. Start the app:

```bash
npm run dev
```

4. Open:

- Site: `http://localhost:3000`
- CMS: `http://localhost:3000/admin`

In local mode, Tina runs against the local filesystem and does not require the GitHub/KV backend.

## Editable content

The non-technical team can edit content from Tina for:

- Hero copy
- Feature showcase slides and copy
- Services
- Projects
- Testimonials
- Blog posts
- Navigation, footer CTA, social links, and SEO settings

Content lives under `content/`.

## Temporary CMS user

A temporary credentials-based Tina user is seeded in `content/users/index.json`.

- Username: `lucid-admin`
- Password: `lucid-change-me-2026`

Change this immediately after the first login.

## Production environment variables

For production editing on Vercel, set these variables:

- `NEXT_PUBLIC_SITE_URL`
- `NEXTAUTH_SECRET`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_PERSONAL_ACCESS_TOKEN`
- `GITHUB_BRANCH`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

If those variables are missing, the site still builds, but Tina falls back to local mode and production content editing will not persist correctly on Vercel.

## Build

```bash
npm run build
```

This runs:

- `tinacms build --skip-indexing`
- `next build --webpack`

`--skip-indexing` avoids a local Tina indexing hang during build, and webpack avoids a Turbopack sandbox issue in this environment.

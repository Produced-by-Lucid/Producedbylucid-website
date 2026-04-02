# Produced by Lucid Website

Next.js marketing site with a custom in-app CMS dashboard for editing content files.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local`.

For local development, `NEXT_PUBLIC_SITE_URL` is required.
`CMS_DASHBOARD_PASSWORD` is optional but strongly recommended before deploying.

3. Start the app:

```bash
npm run dev
```

4. Open:

- Site: `http://localhost:3000`
- CMS: `http://localhost:3000/admin`

## CMS dashboard

The dashboard edits files in `content/` directly through built-in API routes.

Editable file types:

- `.json`
- `.md`

API routes used by the dashboard:

- `GET /api/cms/files` lists editable files in `content/`
- `GET /api/cms/files/[...path]` reads a file
- `PUT /api/cms/files/[...path]` saves file content

If `CMS_DASHBOARD_PASSWORD` is set, requests must include it in the `x-cms-password` header. The dashboard handles this automatically from the password field.

## Editable content

The team can edit:

- Hero copy
- Feature showcase slides and copy
- Services
- Projects
- Testimonials
- Blog posts
- Navigation, footer CTA, social links, and SEO settings

Content lives under `content/`.

## Production environment variables

For production, set these variables:

- `NEXT_PUBLIC_SITE_URL`
- `CMS_DASHBOARD_PASSWORD`

If `CMS_DASHBOARD_PASSWORD` is not set, the CMS remains open to anyone who can access `/admin`.

## Build

```bash
npm run build
```

This runs:

- `next build`

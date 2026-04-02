# CMS Implementation Plan

## Objective
Build a reliable production CMS for this site while keeping the current code editor workflow.

Primary product direction: no-code experience comes first, and code editor remains fallback for advanced/manual edits.

## Current State
- The CMS UI exists at /admin.
- The editor currently uses direct text editing for JSON and Markdown files.
- The server currently reads and writes local files inside content.

Current implementation files:
- app/admin/page.tsx
- components/CmsDashboard.tsx
- app/api/cms/files/route.ts
- app/api/cms/files/[...path]/route.ts
- lib/cms-files.ts

## Best-Result Plan (Production-Ready)

### Phase 1: Ship no-code experience first
Deliver schema-driven form editing as the primary workflow.

Why:
- Non-technical users should be able to publish safely without touching raw JSON/Markdown.
- Form constraints reduce accidental content breakage.

Changes:
- Add schema files in a folder such as content-schemas/.
- Add API endpoint to return schema for a selected file.
- Add a Form Editor tab in the dashboard and make it the default selected tab.
- Keep Code Editor available as a fallback.

### Phase 2: Validate no-code inputs end-to-end
Add validation rules and enforce them both client-side and server-side.

Changes:
- Add POST /api/cms/validate/[...path].
- Block save until validation passes.
- Show inline error states and field-level help text.

### Phase 3: Make writes persistent in production
Use GitHub-backed writes for production instead of local filesystem writes.

Why:
- File writes in serverless production are not reliable for long-term persistence.
- Git-backed edits keep history, rollback, auditability, and fit the existing content structure.

Changes:
- Add a CMS save service that commits edited files to the repository using GitHub API.
- Keep local filesystem writes for local development only.
- Route behavior:
  - Development: read/write local files.
  - Production: read from repo branch and write via commits.

Suggested env vars:
- CMS_DASHBOARD_PASSWORD
- CMS_GITHUB_TOKEN
- CMS_GITHUB_OWNER
- CMS_GITHUB_REPO
- CMS_GITHUB_BRANCH

### Phase 4: Harden auth and security
Replace shared password-only model with proper session-based auth.

Changes:
- Add login endpoint and session cookie.
- Role model:
  - admin: all files and publish controls
  - editor: scoped files or content domains
- Add CSRF protection and rate limiting to write routes.
- Add audit logs for who edited what and when.

### Phase 5: Expand no-code coverage and workflows
Extend no-code support across all key content files and improve editorial workflows.

Changes in dashboard UI:
- Add tab switcher in components/CmsDashboard.tsx:
  - Form Editor (default)
  - Code Editor (fallback)
- Show Form Editor when schema exists for selected file.
- If no schema, automatically fall back to Code Editor with a guidance message.

### Phase 6: Add workflow quality improvements
- Preview mode for markdown content.
- Unsaved changes indicator per file.
- Diff view before save.
- Version history panel from Git commits.

## No-Code CMS Design (Second Tab)

## UX Requirements
- Code Editor remains available at all times.
- Form Editor is optional and schema-driven.
- Switching tabs must preserve unsaved draft state.
- Validation errors are inline and block save until resolved.

## Tab Behavior
- Tab 1: Form Editor
  - Renders input fields from schema.
  - Best for non-technical users.
  - Default when schema exists.
- Tab 2: Code Editor
  - Existing textarea editor remains unchanged.
  - Best for technical users and bulk edits.
  - Fallback when schema is missing.

## Field Types to Support First
- text
- textarea
- number
- select
- boolean (toggle)
- image path/url
- date
- list of objects (repeatable groups)

## Suggested Schema Shape
Use JSON schema-like definitions per file pattern.

Example shape:
- filePattern
- title
- fields[]
  - key
  - label
  - type
  - required
  - helpText
  - options (for select)
  - itemSchema (for lists)

## Data Mapping Rules
- For JSON files:
  - Parse JSON into object.
  - Bind fields to object paths.
  - On save, serialize with stable formatting.
- For Markdown files:
  - Parse frontmatter and body.
  - Map frontmatter keys to form fields.
  - Keep body editable in Code Editor tab initially.
  - Optional later: add rich-text field for body.

## API Additions for No-Code
Add endpoints:
- GET /api/cms/schema/[...path]
  - Returns schema for selected file.
- POST /api/cms/validate/[...path]
  - Validates payload against schema and returns errors.

Keep existing endpoints:
- GET /api/cms/files
- GET /api/cms/files/[...path]
- PUT /api/cms/files/[...path]

## Validation and Save Flow
1. User selects file.
2. Dashboard fetches file content.
3. Dashboard fetches optional schema.
4. In Form Editor tab:
   - Render fields.
   - Track dirty state.
   - Validate client-side.
5. On save:
   - Validate server-side.
   - Persist via local write (dev) or git commit (prod).
6. Return success with commit info (prod).

## Rollout Strategy
### Step A (Low risk)
- Keep current Code Editor behavior untouched as fallback.
- Add schema endpoint and editable Form tab for priority JSON files.

### Step B
- Make Form tab default and complete validation flow.

### Step C
- Add markdown frontmatter form support.

### Step D
- Add publish workflow, history, and rollback.

## Acceptance Criteria
- Production saves persist across deployments.
- /admin access is authenticated and role-aware.
- Code Editor still works exactly as fallback.
- Form Editor is available for schema-backed files.
- Validation prevents malformed content.
- Every save is auditable.

## Implementation Priority
1. Schema endpoint and form rendering (no-code first).
2. Field-level validation (client + server).
3. Production persistence via GitHub commits.
4. Auth/session hardening.
5. Workflow enhancements (preview, diff, history).

## Notes
This plan intentionally keeps the current code editor interface as the base path, and layers no-code editing as optional so technical and non-technical users can work in the same dashboard safely.

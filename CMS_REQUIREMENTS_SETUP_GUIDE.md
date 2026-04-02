# CMS Requirements Setup Guide

This guide shows exactly how to gather the inputs needed to ship the no-code-first CMS update.

## 1) Gather GitHub Repo Details

You need:
- GitHub owner
- GitHub repository name
- Target branch

Steps:
1. Open your repository on GitHub.
2. Copy the owner and repo from the URL:
   - Example: https://github.com/OWNER/REPO
3. Open the branch selector and confirm the branch the CMS should write to (usually main).
4. Record these values:
   - CMS_GITHUB_OWNER
   - CMS_GITHUB_REPO
   - CMS_GITHUB_BRANCH

## 2) Create a GitHub Token (Content Write Access)

You need a token that can read and write repository contents.

Recommended (fine-grained token):
1. Go to GitHub Settings.
2. Open Developer settings.
3. Open Personal access tokens.
4. Choose Fine-grained tokens.
5. Click Generate new token.
6. Set:
   - Resource owner: your account/org
   - Repository access: Only selected repositories
   - Select your website repo
7. Set repository permissions:
   - Contents: Read and write
   - Metadata: Read-only
8. Generate token and copy it immediately.
9. Save it securely (password manager).
10. Record as:
   - CMS_GITHUB_TOKEN

Notes:
- Do not commit this token to code.
- Rotate token periodically.

## 3) Choose Authentication Mode

Decide between:
- Option A: Shared password now (fastest)
- Option B: Session login now (safer)

How to choose:
1. If only 1-2 trusted internal editors need immediate access, pick A for quick launch.
2. If multiple editors or stricter security is required, pick B.
3. Record your choice as:
   - AUTH_MODE=A or AUTH_MODE=B

If choosing A now:
- Set CMS_DASHBOARD_PASSWORD to a strong unique value.

If choosing B now:
- Prepare list of editor accounts (name/email/role) for onboarding.

## 4) Define No-Code Scope (What Goes First)

Pick the first files/sections for form editing.

Suggested order:
1. content/pages/home.json
2. content/settings/site.json
3. content/projects/*.json
4. content/testimonials/*.json
5. content/posts/*.md frontmatter

Steps:
1. Review each file in content/.
2. Mark each as:
   - Phase 1 no-code
   - Phase 2 no-code
   - code editor only
3. Save this list in your project notes.

## 5) Define Validation Rules Per Content Area

For each no-code field, define:
- required or optional
- min/max length
- allowed options (for selects)
- numeric min/max
- date rules
- URL/image format rule

Steps:
1. Open each selected content file.
2. List all keys you want editable by non-technical users.
3. For each key, write validation constraints.
4. Flag sensitive keys as read-only if needed.

Template:
- file:
- field:
- type:
- required:
- constraints:
- help text:

## 6) Decide Media Handling for Phase 1

Choose one:
- Mode 1: Path/URL input only (fastest)
- Mode 2: Media upload/picker (better UX, more work)

Decision steps:
1. If editors already know your media folder structure, choose Mode 1 now.
2. If editors frequently struggle with image paths, choose Mode 2.
3. Record as:
   - MEDIA_MODE=PATH_ONLY or MEDIA_MODE=UPLOADER

## 7) Add Environment Variables in Production

For Vercel (or equivalent host), set:
- CMS_DASHBOARD_PASSWORD
- CMS_GITHUB_TOKEN
- CMS_GITHUB_OWNER
- CMS_GITHUB_REPO
- CMS_GITHUB_BRANCH

Vercel steps:
1. Open Vercel dashboard.
2. Open your project.
3. Go to Settings > Environment Variables.
4. Add each variable for Production (and Preview if needed).
5. Redeploy after adding variables.

## 8) Sanity Check Before Development Starts

Checklist:
- GitHub token created and tested
- Owner/repo/branch confirmed
- Auth mode selected
- Phase 1 no-code files selected
- Validation rules documented
- Media mode chosen
- Environment variables added in host

## 9) Send Back the Filled Values

Copy and complete this block:

- GitHub owner:
- GitHub repo:
- Branch:
- Auth mode (A or B):
- No-code first files/collections:
- Validation rules notes:
- Media mode (PATH_ONLY or UPLOADER):
- Hosting platform (Vercel/other):

Once you provide this, implementation can start immediately.

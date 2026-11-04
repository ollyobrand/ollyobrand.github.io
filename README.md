# Ollyo Brand Assets

A brand asset portal for downloading product logos, favicons, color palettes and brand guidelines.

- **Public site:** https://ollyobrand.github.io/
- **Admin login:** https://ollyobrand.github.io/#/admin (no link on the public page)

## How it works

There is no server or database. GitHub is the backend:

| What | Where |
| --- | --- |
| Products and settings | `public/data/db.json` |
| Uploaded files | `public/assets/<folder>/<file>` |
| Hosting | GitHub Pages, built by `.github/workflows/deploy.yml` on every push to `main` (see setup below) |

Visitors read `db.json` and the files straight from the Pages site, so downloads need no login.

Admins sign in at `/#/admin` with **Sign in with GitHub** (see setup below). Every create, edit, upload or delete becomes one commit on `main`: the new files plus the updated `db.json`, with files that are no longer used removed. The admin panel reads straight from the GitHub API, so changes show up for admins right away. The public site picks them up once the Pages deploy finishes, usually in 1–2 minutes.

## Publishing to GitHub Pages (one-time setup)

Figma Make's GitHub sync cannot push workflow files, so add this one on GitHub:

1. In the repo, click **Add file → Create new file** and name it `.github/workflows/deploy.yml`.
2. Paste the workflow below and click **Commit changes**.
3. Go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
4. Open the **Actions** tab and wait for "Deploy to GitHub Pages" to finish, or run it manually with **Run workflow**.

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

# Admin saves can land in quick succession; only the newest one needs to deploy.
concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      # Figma Make's GitHub sync exports the project without a lockfile, so
      # support both layouts.
      - name: Install dependencies
        run: |
          if [ -f pnpm-lock.yaml ]; then
            corepack enable
            pnpm install --frozen-lockfile
          else
            npm install --no-audit --no-fund
          fi
      - name: Build
        # `<owner>.github.io` repos are served from the domain root; others from /<repo>/.
        run: |
          REPO_NAME="${{ github.event.repository.name }}"
          case "$REPO_NAME" in
            *.github.io) BASE=/ ;;
            *) BASE="/$REPO_NAME/" ;;
          esac
          npm run build -- --base="$BASE"
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Admins and roles

- **Power admin:** owners of the `ollyobrand` GitHub organization (`iShowkot`). Can manage other admins under **Settings → Admins**.
- **Admins:** GitHub users with write access to this repo. The power admin invites them by GitHub username, and they become admins once they accept the invitation on GitHub (or from the email GitHub sends).

### Sign in with GitHub (one-time setup)

Sign-in uses a GitHub App on the `ollyobrand` organisation and a small helper on Vercel (`auth-helper/`) that holds the app's client secret. Tokens last 8 hours and renew quietly; nothing is stored on the helper.

1. **Create the GitHub App** under the `ollyobrand` organisation (Settings → Developer settings → GitHub Apps → New GitHub App):
   - Homepage URL and **Callback URL**: `https://ollyobrand.github.io/`
   - Keep **Expire user authorization tokens** on. Turn **Webhook** off.
   - Repository permissions: **Contents** read and write, **Administration** read and write (for managing admins), **Metadata** read.
   - Where can it be installed: **Only on this account**.
2. After creating it, **Install App** on `ollyobrand`, choosing only `ollyobrand.github.io`. Then **Generate a new client secret** and keep the page open.
3. **Import this repo into Vercel**, set **Root Directory** to `auth-helper`, and add `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` and `ALLOWED_ORIGINS=https://ollyobrand.github.io`. Deploy.
4. Put the app's Client ID and the Vercel URL in `AUTH` in `src/app/lib/config.ts`. Both are public.

Until step 4 is done, the login page says sign-in isn't set up yet.

## Limits

- Files can be up to 100 MB each (GitHub's limit). Files over 25 MB show a "large file" notice and upload more slowly.
- Keep the repository under about 1 GB in total. Deleted files remain in Git history.

## Local development

```sh
pnpm install
pnpm dev
```

To build for GitHub Pages locally, run `pnpm build`. The output goes to `dist/`.

The repo owner, repo name and branch are set in `src/app/lib/config.ts`.

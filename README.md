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

Admins sign in at `/#/admin` with a GitHub personal access token. Every create, edit, upload or delete becomes one commit on `main`: the new files plus the updated `db.json`, with files that are no longer used removed. The admin panel reads straight from the GitHub API, so changes show up for admins right away. The public site picks them up once the Pages deploy finishes, usually in 1–2 minutes.

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

### Creating a sign-in token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → **Tokens (classic)** → Generate new token.
2. Select the **`public_repo`** scope and generate the token.
3. Paste it on the admin login page. It is stored only in that browser and sent only to `api.github.com`.

Fine-grained tokens also work for the owner. Give them access to this repo with **Contents: Read and write**, plus **Administration: Read and write** for admin management. Other admins should use classic tokens, unless the `ollyobrand` organization allows fine-grained tokens (Organization settings → Personal access tokens).

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

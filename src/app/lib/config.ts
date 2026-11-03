// Repository that stores the site's data and brand files. GitHub Pages serves
// the built site from this repo, and admin edits are committed back to it.
// A repo named `<owner>.github.io` is served at https://<owner>.github.io/.
export const REPO = {
  owner: 'ollyobrand',
  name: 'ollyobrand.github.io',
  branch: 'main',
} as const;

// Paths inside the repo. Files under `public/` are copied into the built site.
export const DB_PATH = 'public/data/db.json';
export const PUBLIC_DIR = 'public/';
export const ASSETS_PREFIX = 'assets/';

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
export const LARGE_UPLOAD_BYTES = 25 * 1024 * 1024;

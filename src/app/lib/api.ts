import { toast } from 'sonner@2.0.3';
import { Product } from '../types';
import { ASSETS_PREFIX, DB_PATH, LARGE_UPLOAD_BYTES, MAX_UPLOAD_BYTES, PUBLIC_DIR, REPO } from './config';
import { commitTree, createBlob, getHeadSha, GitHubError, gh, listTreePaths, readTextFile, repoPath } from './github';
import { requireToken, SessionExpiredError } from './auth';

export interface AppSettings {
  organizationName: string;
  organizationLogo: string;
  adminEmail: string;
  accentColor: string;
  updatedAt?: string;
}

export interface Database {
  settings: AppSettings;
  products: Product[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  organizationName: 'Brand Asset Manager',
  organizationLogo: '',
  adminEmail: '',
  accentColor: '#3B82F6',
};

function normalize(raw: Partial<Database> | null): Database {
  return {
    settings: { ...DEFAULT_SETTINGS, ...(raw?.settings || {}) },
    products: (raw?.products || []).filter((p) => p && p.name),
  };
}

// ---------- Asset URLs ----------

// Object URLs for files uploaded this session, so admins see them before
// GitHub Pages finishes redeploying.
const localPreviews = new Map<string, string>();

export function assetUrl(path?: string | null): string {
  if (!path) return '';
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return localPreviews.get(path) || `${import.meta.env.BASE_URL}${path}`;
}

// ---------- Public reads (served by GitHub Pages) ----------

export async function loadPublicDb(): Promise<Database> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/db.json?t=${Date.now()}`, { cache: 'no-cache' });
  if (!response.ok) throw new Error('Failed to load brand assets');
  return normalize(await response.json());
}

// ---------- Admin reads/writes (GitHub API) ----------

function handleAuth(error: unknown): never {
  if (error instanceof GitHubError && (error.status === 401 || error.status === 403)) {
    if (error.status === 401) throw new SessionExpiredError();
    throw new Error(`GitHub denied the request: ${error.message}`);
  }
  throw error;
}

async function readDbAt(token: string, sha: string): Promise<Database> {
  const text = await readTextFile(token, DB_PATH, sha);
  return normalize(text ? JSON.parse(text) : null);
}

export async function loadAdminDb(): Promise<Database> {
  const token = requireToken();
  try {
    return await readDbAt(token, await getHeadSha(token));
  } catch (error) {
    handleAuth(error);
  }
}

// Blobs uploaded to GitHub but not yet referenced by a commit.
const pendingBlobs = new Map<string, string>();

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a file to the repo's object store and returns its site-relative path.
 * The file becomes part of the site with the next database commit that references it.
 */
export async function uploadFile(file: File, folder: string): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${file.name} is larger than GitHub's 100 MB file limit.`);
  }
  if (file.size > LARGE_UPLOAD_BYTES) {
    toast.info(`${file.name} is a large file — the upload may take a while.`);
  }
  const token = requireToken();
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, '-').replace(/^\/+|\/+$/g, '');
  const path = `${ASSETS_PREFIX}${safeFolder}/${crypto.randomUUID()}.${ext}`;
  try {
    pendingBlobs.set(path, await createBlob(token, await fileToBase64(file)));
  } catch (error) {
    handleAuth(error);
  }
  localPreviews.set(path, URL.createObjectURL(file));
  return path;
}

function collectAssetPaths(value: unknown, into = new Set<string>()): Set<string> {
  if (typeof value === 'string') {
    if (value.startsWith(ASSETS_PREFIX)) into.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectAssetPaths(v, into));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((v) => collectAssetPaths(v, into));
  }
  return into;
}

let lastHeadSha: string | null = null;

/**
 * Applies `mutate` to the latest database and commits it, together with any
 * newly referenced uploads, and deletes files no longer referenced.
 */
export async function mutateDb(mutate: (db: Database) => void, message: string): Promise<Database> {
  const token = requireToken();
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const headSha = await getHeadSha(token);
      const before = await readDbAt(token, headSha);
      const after: Database = structuredClone(before);
      mutate(after);

      const oldPaths = collectAssetPaths(before);
      const newPaths = collectAssetPaths(after);
      const added = [...newPaths].filter((p) => pendingBlobs.has(p));
      let removed = [...oldPaths].filter((p) => !newPaths.has(p)).map((p) => PUBLIC_DIR + p);
      if (removed.length) {
        // Deleting a path that does not exist makes GitHub reject the tree.
        const existing = await listTreePaths(token, headSha);
        removed = removed.filter((p) => existing.has(p));
      }

      const dbJson = JSON.stringify(after, null, 2) + '\n';
      const dbSha = await createBlob(token, btoa(unescape(encodeURIComponent(dbJson))));
      const sha = await commitTree(
        token,
        headSha,
        [
          { path: DB_PATH, sha: dbSha },
          ...added.map((p) => ({ path: PUBLIC_DIR + p, sha: pendingBlobs.get(p)! })),
          ...removed.map((p) => ({ path: p, sha: null })),
        ],
        message,
      );
      added.forEach((p) => pendingBlobs.delete(p));
      lastHeadSha = sha;
      return after;
    } catch (error) {
      // The branch moved under us (another admin saved); retry on the new head.
      if (error instanceof GitHubError && (error.status === 409 || error.status === 422) && attempt < 3) continue;
      handleAuth(error);
    }
  }
  throw new Error('Could not save changes. Please try again.');
}

export function lastCommitSha() {
  return lastHeadSha;
}

// ---------- Product helpers ----------

export async function getAdminProduct(id: string): Promise<Product | null> {
  const db = await loadAdminDb();
  return db.products.find((p) => p.id === id) || null;
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const product: Product = {
    id: crypto.randomUUID(),
    name: data.name || 'Untitled',
    tagline: data.tagline || '',
    logoUrl: data.logoUrl || '',
    assets: { colors: [], ...(data.assets || {}) },
    createdAt: new Date().toISOString(),
  } as Product;
  await mutateDb((db) => {
    db.products.push(product);
  }, `Add product: ${product.name}`);
  return product;
}

export async function updateProduct(
  id: string,
  update: (product: Product) => Product,
  message: string,
): Promise<Product> {
  let result: Product | null = null;
  await mutateDb((db) => {
    const index = db.products.findIndex((p) => p.id === id);
    if (index < 0) throw new Error('Product not found');
    result = { ...update(db.products[index]), id, updatedAt: new Date().toISOString() } as Product;
    db.products[index] = result;
  }, message);
  return result!;
}

export async function deleteProduct(id: string): Promise<void> {
  await mutateDb((db) => {
    const product = db.products.find((p) => p.id === id);
    db.products = db.products.filter((p) => p.id !== id);
    if (!product) throw new Error('Product not found');
  }, 'Delete product');
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  const next = { ...settings, updatedAt: new Date().toISOString() };
  await mutateDb((db) => {
    db.settings = next;
  }, 'Update settings');
  return next;
}

// ---------- Admin (collaborator) management ----------

export interface Collaborator {
  login: string;
  avatarUrl: string;
  role: string;
  isOwner: boolean;
}

export interface Invitation {
  id: number;
  login: string;
  avatarUrl: string;
  createdAt: string;
}

export async function listCollaborators(): Promise<Collaborator[]> {
  const token = requireToken();
  try {
    const users = await gh<any[]>(token, repoPath('/collaborators?affiliation=all&per_page=100'));
    return users.map((u) => ({
      login: u.login,
      avatarUrl: u.avatar_url,
      role: u.role_name || (u.permissions?.admin ? 'admin' : 'write'),
      // Repo administrators (the organization owners) are power admins.
      isOwner: Boolean(u.permissions?.admin) || u.login.toLowerCase() === REPO.owner.toLowerCase(),
    }));
  } catch (error) {
    handleAuth(error);
  }
}

export async function listInvitations(): Promise<Invitation[]> {
  const token = requireToken();
  try {
    const invites = await gh<any[]>(token, repoPath('/invitations?per_page=100'));
    return invites.map((i) => ({
      id: i.id,
      login: i.invitee?.login || i.invitee?.email || 'Unknown',
      avatarUrl: i.invitee?.avatar_url || '',
      createdAt: i.created_at,
    }));
  } catch (error) {
    handleAuth(error);
  }
}

export async function inviteCollaborator(login: string): Promise<'invited' | 'added'> {
  const token = requireToken();
  try {
    const result = await gh(token, repoPath(`/collaborators/${encodeURIComponent(login.trim().replace(/^@/, ''))}`), {
      method: 'PUT',
      body: JSON.stringify({ permission: 'push' }),
    });
    return result ? 'invited' : 'added';
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) throw new Error(`GitHub user "${login}" was not found.`);
    handleAuth(error);
  }
}

export async function removeCollaborator(login: string): Promise<void> {
  const token = requireToken();
  try {
    await gh(token, repoPath(`/collaborators/${encodeURIComponent(login)}`), { method: 'DELETE' });
  } catch (error) {
    handleAuth(error);
  }
}

export async function cancelInvitation(id: number): Promise<void> {
  const token = requireToken();
  try {
    await gh(token, repoPath(`/invitations/${id}`), { method: 'DELETE' });
  } catch (error) {
    handleAuth(error);
  }
}

export async function downloadFile(path: string, name: string) {
  const response = await fetch(assetUrl(path));
  if (!response.ok) throw new Error(`Failed to download ${name}`);
  const blobUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}

export function fileExt(path: string, fallback: string) {
  const match = /\.([a-z0-9]+)(?:$|\?)/i.exec(path);
  return match ? match[1].toLowerCase() : fallback;
}

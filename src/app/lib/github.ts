import { REPO } from './config';

const API = 'https://api.github.com';
const REPO_PATH = `/repos/${REPO.owner}/${REPO.name}`;

export class GitHubError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function gh<T = any>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path.startsWith('http') ? path : `${API}${path}`, {
    ...init,
    // GitHub's API responses are cacheable for 60s; admins must always see fresh data.
    cache: 'no-store',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    let message = response.statusText;
    try {
      message = (await response.json()).message || message;
    } catch {
      // Non-JSON error body.
    }
    throw new GitHubError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  const type = response.headers.get('Content-Type') || '';
  return (type.includes('json') ? response.json() : response.text()) as Promise<T>;
}

export const repoPath = (suffix = '') => `${REPO_PATH}${suffix}`;

export async function getHeadSha(token: string): Promise<string> {
  const ref = await gh(token, repoPath(`/git/ref/heads/${REPO.branch}`));
  return ref.object.sha;
}

export async function readTextFile(token: string, path: string, ref: string): Promise<string | null> {
  try {
    return await gh<string>(token, repoPath(`/contents/${path}?ref=${ref}`), {
      headers: { Accept: 'application/vnd.github.raw' },
    });
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return null;
    throw error;
  }
}

export async function createBlob(token: string, base64: string): Promise<string> {
  const blob = await gh(token, repoPath('/git/blobs'), {
    method: 'POST',
    body: JSON.stringify({ content: base64, encoding: 'base64' }),
  });
  return blob.sha;
}

export type TreeChange = { path: string; sha: string | null };

// Creates one commit on top of `parentSha` and fast-forwards the branch to it.
// Throws a 409/422 GitHubError when the branch moved, so callers can retry.
export async function commitTree(
  token: string,
  parentSha: string,
  changes: TreeChange[],
  message: string,
): Promise<string> {
  const parent = await gh(token, repoPath(`/git/commits/${parentSha}`));
  const tree = await gh(token, repoPath('/git/trees'), {
    method: 'POST',
    body: JSON.stringify({
      base_tree: parent.tree.sha,
      tree: changes.map((change) => ({ path: change.path, mode: '100644', type: 'blob', sha: change.sha })),
    }),
  });
  const commit = await gh(token, repoPath('/git/commits'), {
    method: 'POST',
    body: JSON.stringify({ message, tree: tree.sha, parents: [parentSha] }),
  });
  await gh(token, repoPath(`/git/refs/heads/${REPO.branch}`), {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  return commit.sha;
}

export async function listTreePaths(token: string, commitSha: string): Promise<Set<string>> {
  const commit = await gh(token, repoPath(`/git/commits/${commitSha}`));
  const tree = await gh(token, repoPath(`/git/trees/${commit.tree.sha}?recursive=1`));
  return new Set((tree.tree as Array<{ path: string; type: string }>).filter((e) => e.type === 'blob').map((e) => e.path));
}

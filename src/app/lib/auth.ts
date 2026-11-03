import { REPO } from './config';
import { gh, GitHubError, repoPath } from './github';

const TOKEN_KEY = 'bam.githubToken';
const SESSION_KEY = 'bam.session';

export interface AdminSession {
  login: string;
  name: string;
  avatarUrl: string;
  // Repo owner/administrators manage other admins (the "power admin" role).
  isOwner: boolean;
}

export class SessionExpiredError extends Error {
  constructor() {
    super('Your GitHub token is no longer valid. Please sign in again.');
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getSession(): AdminSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw || !getToken()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function requireToken(): string {
  const token = getToken();
  if (!token) throw new SessionExpiredError();
  return token;
}

export async function signIn(rawToken: string): Promise<AdminSession> {
  const token = rawToken.trim();
  let user;
  let repo;
  try {
    user = await gh(token, '/user');
    repo = await gh(token, repoPath());
  } catch (error) {
    if (error instanceof GitHubError && error.status === 401) {
      throw new Error('GitHub rejected this token. Check that it was copied correctly and has not expired.');
    }
    if (error instanceof GitHubError && error.status === 404) {
      throw new Error(`This token cannot access ${REPO.owner}/${REPO.name}.`);
    }
    throw error;
  }
  if (!repo.permissions?.push) {
    throw new Error(
      `@${user.login} does not have write access to ${REPO.owner}/${REPO.name}. Ask the owner to add you as a collaborator.`,
    );
  }
  const session: AdminSession = {
    login: user.login,
    name: user.name || user.login,
    avatarUrl: user.avatar_url,
    isOwner: Boolean(repo.permissions.admin) || user.login.toLowerCase() === REPO.owner.toLowerCase(),
  };
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function signOut() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

import { AUTH, REPO } from './config';
import { gh, GitHubError, repoPath } from './github';

const TOKEN_KEY = 'bam.githubToken';
const SESSION_KEY = 'bam.session';
const REFRESH_KEY = 'bam.refresh';
const STATE_KEY = 'bam.signInState';
export const SIGN_IN_ERROR_KEY = 'bam.signInError';

export interface AdminSession {
  login: string;
  name: string;
  avatarUrl: string;
  // Repo owner/administrators manage other admins (the "power admin" role).
  isOwner: boolean;
}

export class SessionExpiredError extends Error {
  constructor() {
    super('Your sign-in has expired. Sign in with GitHub again.');
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
      throw new Error("You don't have access to these brand assets. Ask the site owner to add you in Settings → Admins.");
    }
    throw error;
  }
  if (!repo.permissions?.push) {
    throw new Error(`@${user.login} doesn't have access to edit these brand assets. Ask the site owner to add you in Settings → Admins.`);
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
  localStorage.removeItem(REFRESH_KEY);
}

// ---------- Sign in with GitHub ----------

export const signInReady = () => Boolean(AUTH.clientId && AUTH.helperUrl);

/** Where GitHub sends people back: the site root, without hash or query. */
export const callbackUrl = () => `${window.location.origin}${window.location.pathname}`;

/** Sends the browser to GitHub's "Authorize Ollyo Brand Assets" page. */
export function startSignIn() {
  const state = crypto.randomUUID();
  sessionStorage.setItem(STATE_KEY, state);
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', AUTH.clientId);
  url.searchParams.set('redirect_uri', callbackUrl());
  url.searchParams.set('state', state);
  window.location.assign(url.toString());
}

interface TokenReply {
  access_token: string;
  expires_in: number | null;
  refresh_token: string | null;
  refresh_token_expires_in: number | null;
  error?: string;
}

async function callHelper(path: string, body: object): Promise<TokenReply> {
  let response: Response;
  try {
    response = await fetch(`${AUTH.helperUrl.replace(/\/$/, '')}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Couldn't reach the sign-in service. Check your connection and try again.");
  }
  const data = (await response.json().catch(() => ({}))) as TokenReply;
  if (!response.ok || !data.access_token) throw new Error(data.error || 'GitHub sign-in failed. Try again.');
  return data;
}

function keep(reply: TokenReply) {
  const now = Date.now();
  localStorage.setItem(TOKEN_KEY, reply.access_token);
  localStorage.setItem(
    REFRESH_KEY,
    JSON.stringify({
      refreshToken: reply.refresh_token,
      expiresAt: reply.expires_in ? now + reply.expires_in * 1000 : null,
      refreshExpiresAt: reply.refresh_token_expires_in ? now + reply.refresh_token_expires_in * 1000 : null,
    }),
  );
}

/** Finishes a sign-in after GitHub redirects back with ?code=…&state=… */
export async function completeSignIn(code: string, state: string): Promise<AdminSession> {
  const expected = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);
  if (!expected || expected !== state) throw new Error('That sign-in link has expired. Sign in again.');
  const reply = await callHelper('/api/token', { code, redirect_uri: callbackUrl() });
  try {
    const session = await signIn(reply.access_token);
    keep(reply);
    return session;
  } catch (error) {
    signOut();
    throw error;
  }
}

let refreshing: Promise<void> | null = null;

/**
 * GitHub App tokens last 8 hours. Renews the token quietly when it has under
 * 10 minutes left; signs out if the renewal is refused (for example, access removed).
 */
export function refreshIfNeeded(): Promise<void> {
  if (refreshing) return refreshing;
  let stored: { refreshToken: string | null; expiresAt: number | null; refreshExpiresAt: number | null } | null = null;
  try {
    stored = JSON.parse(localStorage.getItem(REFRESH_KEY) || 'null');
  } catch {
    stored = null;
  }
  if (!stored?.expiresAt || stored.expiresAt - Date.now() > 10 * 60 * 1000) return Promise.resolve();
  if (!stored.refreshToken || (stored.refreshExpiresAt && stored.refreshExpiresAt < Date.now()) || !signInReady()) {
    signOut();
    return Promise.reject(new SessionExpiredError());
  }
  refreshing = callHelper('/api/refresh', { refresh_token: stored.refreshToken })
    .then(keep)
    .catch(() => {
      signOut();
      throw new SessionExpiredError();
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

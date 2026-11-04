// Shared by the two endpoints: CORS for the brand site only, and the call to
// GitHub that swaps a sign-in code (or a refresh token) for a user token.
// The client secret never leaves this function.

const ALLOWED = (process.env.ALLOWED_ORIGINS || 'https://ollyobrand.github.io')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export function cors(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '600');
  }
  if (req.method === 'OPTIONS') {
    res.status(ALLOWED.includes(origin) ? 204 : 403).end();
    return false;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' });
    return false;
  }
  if (!ALLOWED.includes(origin)) {
    res.status(403).json({ error: 'This origin is not allowed to sign in' });
    return false;
  }
  return true;
}

export async function exchange(params) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return { status: 500, body: { error: 'Sign-in is not set up yet: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are missing in Vercel.' } };
  }
  const r = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, ...params }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || data.error || !data.access_token) {
    return { status: 400, body: { error: data.error_description || data.error || 'GitHub did not return a token' } };
  }
  // Only what the browser needs; nothing is stored here.
  return {
    status: 200,
    body: {
      access_token: data.access_token,
      expires_in: data.expires_in ?? null,
      refresh_token: data.refresh_token ?? null,
      refresh_token_expires_in: data.refresh_token_expires_in ?? null,
    },
  };
}

export function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try {
    return JSON.parse(req.body || '{}');
  } catch {
    return {};
  }
}

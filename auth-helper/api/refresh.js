import { cors, exchange, readBody } from '../lib/github.js';

// POST { refresh_token } -> a fresh token pair. Keeps admins signed in without asking again.
export default async function handler(req, res) {
  if (!cors(req, res)) return;
  const { refresh_token } = readBody(req);
  if (typeof refresh_token !== 'string' || !refresh_token) return res.status(400).json({ error: 'Missing refresh token' });
  const out = await exchange({ grant_type: 'refresh_token', refresh_token });
  res.status(out.status).json(out.body);
}

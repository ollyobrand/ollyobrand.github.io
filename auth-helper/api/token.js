import { cors, exchange, readBody } from '../lib/github.js';

// POST { code, redirect_uri } -> { access_token, expires_in, refresh_token, ... }
export default async function handler(req, res) {
  if (!cors(req, res)) return;
  const { code, redirect_uri } = readBody(req);
  if (typeof code !== 'string' || !code) return res.status(400).json({ error: 'Missing sign-in code' });
  const out = await exchange({ code, ...(redirect_uri ? { redirect_uri } : {}) });
  res.status(out.status).json(out.body);
}

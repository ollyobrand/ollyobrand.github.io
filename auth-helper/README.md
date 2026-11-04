# Sign-in helper

A two-endpoint Vercel function that lets admins of Ollyo Brand Assets sign in with GitHub.
GitHub needs a client secret to finish a sign-in, and a public site can't hold one, so this
helper holds it and swaps the one-time code for a short-lived token. It stores nothing.

| Endpoint | Body | Returns |
| --- | --- | --- |
| `POST /api/token` | `{ code, redirect_uri }` | `access_token` (8 hours), `refresh_token` |
| `POST /api/refresh` | `{ refresh_token }` | a fresh pair |

Only origins in `ALLOWED_ORIGINS` may call it.

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Name | Value |
| --- | --- |
| `GITHUB_CLIENT_ID` | The GitHub App's Client ID |
| `GITHUB_CLIENT_SECRET` | A client secret generated on the GitHub App page |
| `ALLOWED_ORIGINS` | `https://ollyobrand.github.io` (comma-separate to add `http://localhost:4173` for local testing) |

When importing this repo into Vercel, set **Root Directory** to `auth-helper`.

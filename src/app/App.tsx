import { useEffect, useMemo, useState } from 'react';
import { RouterProvider } from 'react-router';
import { makeRouter } from './routes';
import { completeSignIn, SIGN_IN_ERROR_KEY } from './lib/auth';

// GitHub sends admins back to the site root as /?code=…&state=… (outside the
// hash router). Finish the sign-in here, then continue to the dashboard.
function readCallback() {
  const q = new URLSearchParams(window.location.search);
  const code = q.get('code');
  const state = q.get('state');
  return code && state ? { code, state } : null;
}

export default function App() {
  const [callback] = useState(readCallback);
  const [done, setDone] = useState(!callback);
  const router = useMemo(() => (done ? makeRouter() : null), [done]);

  useEffect(() => {
    if (!callback) return;
    const base = window.location.pathname;
    completeSignIn(callback.code, callback.state)
      .then(() => window.history.replaceState(null, '', `${base}#/admin/dashboard`))
      .catch((error) => {
        sessionStorage.setItem(SIGN_IN_ERROR_KEY, error instanceof Error ? error.message : 'Sign-in failed. Try again.');
        window.history.replaceState(null, '', `${base}#/admin`);
      })
      .finally(() => setDone(true));
  }, [callback]);

  if (!done || !router) {
    return (
      <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', fontFamily: 'var(--sb-font-sans)', color: 'var(--sb-muted)' }} role="status">
        Signing you in…
      </div>
    );
  }
  return <RouterProvider router={router} />;
}

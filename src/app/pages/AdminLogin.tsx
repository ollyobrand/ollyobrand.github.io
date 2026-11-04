import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import imgLogo from 'figma:asset/7efdf963b465ea840cf15b3e1ac80db6d73ce1bb.png';
import { getSession, SIGN_IN_ERROR_KEY, signInReady, startSignIn } from '../lib/auth';
import './browse.css';

function GitHubMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export function AdminLogin() {
  const navigate = useNavigate();
  const [error] = useState(() => {
    const message = sessionStorage.getItem(SIGN_IN_ERROR_KEY);
    sessionStorage.removeItem(SIGN_IN_ERROR_KEY);
    return message;
  });
  const [leaving, setLeaving] = useState(false);
  const ready = signInReady();

  useEffect(() => {
    if (getSession()) navigate('/admin/dashboard', { replace: true });
  }, [navigate]);

  useEffect(() => {
    document.title = 'Admin · Ollyo Brand Assets';
  }, []);

  return (
    <div className="sb-public sb-login">
      <main className="sb-login-card" aria-labelledby="login-title">
        <img src={imgLogo} alt="" width="44" height="44" />
        <h1 id="login-title">Ollyo Brand Assets</h1>
        <p className="sb-mono">Admin</p>

        {error && (
          <p className="sb-login-error" role="alert">
            {error}
          </p>
        )}

        {ready ? (
          <button
            className="sb-btn sb-login-btn"
            onClick={() => {
              setLeaving(true);
              startSignIn();
            }}
            disabled={leaving}
          >
            {leaving ? <Loader2 size={18} className="sb-spin" /> : <GitHubMark />}
            {leaving ? 'Opening GitHub…' : 'Sign in with GitHub'}
          </button>
        ) : (
          <p className="sb-login-error" role="status">
            Sign-in isn't set up yet. The site owner needs to finish connecting the GitHub App.
          </p>
        )}

        <button className="sb-login-back" onClick={() => navigate('/')}>
          Back to brand assets
        </button>
      </main>
    </div>
  );
}

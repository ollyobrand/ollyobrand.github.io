import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ExternalLink, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Toaster } from '../components/ui/sonner';
import { getSession, signIn } from '../lib/auth';
import { REPO } from '../lib/config';

const TOKEN_URL =
  'https://github.com/settings/tokens/new?scopes=public_repo&description=Brand%20Asset%20Manager';

export function AdminLogin() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (getSession()) navigate('/admin/dashboard', { replace: true });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Paste your GitHub token to continue.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const session = await signIn(token);
      toast.success(`Signed in as @${session.login}`);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">Sign in with a GitHub token to manage brand assets</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub personal access token
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="token"
                  type="password"
                  autoComplete="off"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_… or github_pat_…"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                  disabled={loading}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'token-error' : undefined}
                />
              </div>
              {error && (
                <p id="token-error" className="text-sm text-red-600 mt-2">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Verifying…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-600 space-y-2">
            <p className="font-medium text-gray-900">Need a token?</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                <a href={TOKEN_URL} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                  Create a classic token <ExternalLink className="w-3 h-3" />
                </a>{' '}
                with the <code className="text-xs bg-white border px-1 rounded">public_repo</code> scope.
              </li>
              <li>
                Your GitHub account must be a collaborator on{' '}
                <span className="font-medium text-gray-900">
                  {REPO.owner}/{REPO.name}
                </span>
                .
              </li>
            </ol>
            <p className="text-xs text-gray-500">The token stays in this browser only and is sent directly to GitHub.</p>
          </div>

          <div className="mt-6 text-center">
            <button onClick={() => navigate('/')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              ← Back to Public Page
            </button>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

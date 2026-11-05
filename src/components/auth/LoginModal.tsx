import React, { useState } from 'react';
import {
  Lock,
  User,
  ShieldAlert,
  ArrowRight,
  Loader2,
  CheckCircle,
  Flame,
  Globe,
} from 'lucide-react';
import { api } from '../../lib/api';
import { AdminUser } from '../../types/news';

interface LoginModalProps {
  onSuccess: (user: AdminUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both administrative username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login({ username: username.trim(), password: password.trim() });
      localStorage.setItem('fastzlive_token', res.token);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-2xl text-white space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center">
            <span className="flex h-10 items-center bg-red-600 px-3 text-lg font-black tracking-tight text-white rounded-l-md shadow-md">
              FASTZ
            </span>
            <span className="flex h-10 items-center bg-white px-3 text-lg font-black tracking-tight text-black rounded-r-md shadow-md">
              LIVE
            </span>
          </div>
          <h2 className="text-base font-bold text-neutral-100 tracking-tight">
            Newsroom Publishing CMS
          </h2>
          <p className="text-xs text-neutral-400">
            Secure editorial administration for fastzlive.com
          </p>
        </div>

        {/* Demo Credentials Quick Pill */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">
              Quick Admin Access
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              Role: Super Admin
            </span>
          </div>
          <p className="text-[11px] text-neutral-300">
            Default credentials are pre-filled below for quick review:
          </p>
          <div className="flex flex-wrap gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => fillQuickCredentials('admin', 'admin123')}
              className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1 text-[11px] font-mono text-neutral-200 border border-neutral-700"
            >
              admin / admin123
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('srk016361@gmail.com', 'fastzlive2026')}
              className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1 text-[11px] font-mono text-neutral-200 border border-neutral-700"
            >
              srk016361@gmail.com
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-xl border border-red-800/80 bg-red-950/60 p-3 text-xs text-red-300 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Admin Username or Email
            </label>
            <div className="flex items-center rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs focus-within:border-red-600 transition-colors">
              <User className="h-4 w-4 text-neutral-500 mr-2.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or email"
                className="w-full bg-transparent text-white outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Secret Password
            </label>
            <div className="flex items-center rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs focus-within:border-red-600 transition-colors">
              <Lock className="h-4 w-4 text-neutral-500 mr-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-white outline-none font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 py-3 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:from-red-700 hover:to-red-800 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Fastzlive CMS</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-[11px] text-neutral-500 pt-2 border-t border-neutral-900">
          <span>Protected Area • Unauthorized access is strictly logged</span>
        </div>
      </div>
    </div>
  );
};

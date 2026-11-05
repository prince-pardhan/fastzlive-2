import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Key,
  Lock,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Camera,
} from 'lucide-react';
import { AdminUser } from '../../types/news';

interface AdminProfileProps {
  user: AdminUser | null;
  onUpdateUser?: (updated: AdminUser) => void;
}

export const AdminProfile: React.FC<AdminProfileProps> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user?.name || 'Suresh R. Kumar');
  const [email, setEmail] = useState(user?.email || 'srk016361@gmail.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="rounded-2xl bg-neutral-900 p-6 text-white border border-neutral-800 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-red-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-red-500">
            Security & Credentials
          </span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight mt-1">
          Admin Profile & Permissions
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Manage your editorial credentials, role privileges, and newsroom audit identity.
        </p>
      </div>

      {/* Profile Info Card */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="h-20 w-20 rounded-full object-cover ring-4 ring-red-600"
            />
            <button
              className="absolute bottom-0 right-0 rounded-full bg-neutral-900 p-1.5 text-white shadow-md hover:bg-neutral-700"
              title="Change Avatar"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {user?.name || 'Suresh R. Kumar'}
              </h2>
              <span className="rounded-md bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 px-2 py-0.5 text-xs font-bold border border-red-200 dark:border-red-900">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              <span>{user?.email || 'srk016361@gmail.com'}</span>
            </p>
            <p className="text-[11px] text-neutral-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Last active session: Today at 04:47 IST</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Registered Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Security & Password Change */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
          <Lock className="h-4 w-4 text-red-600" />
          <span>Change Administrative Password</span>
        </h3>

        {passwordError && (
          <div className="rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-3 text-xs font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>Password successfully updated. Secure token reissued.</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700"
          >
            Update Admin Password
          </button>
        </form>
      </div>
    </div>
  );
};

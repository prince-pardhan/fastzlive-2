import React, { useState, useEffect } from 'react';
import {
  Menu,
  Moon,
  Sun,
  Flame,
  Globe,
  Radio,
  User,
  LogOut,
  Settings,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { AdminUser, NewsArticle } from '../../types/news';

interface NavbarProps {
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser: AdminUser | null;
  onLogout: () => void;
  breakingNewsList: NewsArticle[];
  onNavigate: (section: string) => void;
  isRealtimeConnected?: boolean;
  activeEditors?: number;
  activeReaders?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  darkMode,
  onToggleDarkMode,
  currentUser,
  onLogout,
  breakingNewsList,
  onNavigate,
  isRealtimeConnected = true,
  activeEditors = 1,
  activeReaders = 182,
}) => {
  const [istTime, setIstTime] = useState<string>('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setIstTime(new Intl.DateTimeFormat('en-IN', options).format(now));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const breakingCount = breakingNewsList.length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white/95 px-3 md:px-6 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/95 transition-colors duration-200">
      {/* Left: Hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="flex items-center">
            <span className="flex h-8 items-center bg-red-600 px-2.5 text-base font-extrabold tracking-tight text-white rounded-l-md shadow-sm">
              FASTZ
            </span>
            <span className="flex h-8 items-center bg-black px-2.5 text-base font-extrabold tracking-tight text-white rounded-r-md border-y border-r border-black dark:border-neutral-800 shadow-sm">
              LIVE
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900">
            News CMS
          </span>
        </div>
      </div>

      {/* Center: Real-Time Live Sync, Breaking alerts, & IST Newsroom Clock */}
      <div className="hidden md:flex items-center gap-3">
        {/* Real-Time Live Connection Indicator */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50/80 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isRealtimeConnected ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isRealtimeConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="text-[10px] tracking-wider uppercase font-black">
            {isRealtimeConnected ? 'REAL-TIME LIVE' : 'CONNECTING...'}
          </span>
          <span className="text-emerald-300 dark:text-emerald-700">|</span>
          <span className="text-[10px] font-mono font-medium">
            {activeEditors} Editor{activeEditors > 1 ? 's' : ''} Online
          </span>
        </div>

        {/* Breaking Badge */}
        {breakingCount > 0 && (
          <button
            onClick={() => onNavigate('breaking')}
            className="flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-950/70 px-3 py-1 text-xs font-bold text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800 hover:bg-red-200 transition-colors cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <Flame className="h-3.5 w-3.5 text-red-600 fill-red-600" />
            <span>{breakingCount} Breaking Alert{breakingCount > 1 ? 's' : ''}</span>
          </button>
        )}

        {/* Live IST Clock */}
        <div className="hidden xl:flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 px-3 py-1 rounded-md border border-neutral-200 dark:border-neutral-800">
          <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold uppercase text-neutral-500 dark:text-neutral-500">IST:</span>
          <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-200 tracking-tight">
            {istTime || 'Loading...'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Visit Live Website */}
        <a
          href="https://www.fastzlive.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 px-2.5 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          title="Open fastzlive.com in new tab"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>fastzlive.com</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleDarkMode}
          aria-label="Toggle Dark Mode"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-neutral-700" />}
        </button>

        {/* Admin User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-all"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser?.name || 'Admin'}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-red-600"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                {currentUser?.name || 'Admin'}
              </span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 capitalize">
                Super Admin
              </span>
            </div>
          </button>

          {showUserDropdown && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 bg-white py-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onMouseLeave={() => setShowUserDropdown(false)}
            >
              <div className="border-b border-neutral-100 dark:border-neutral-800 px-4 py-2.5">
                <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {currentUser?.name || 'Suresh R. Kumar'}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                  {currentUser?.email || 'srk016361@gmail.com'}
                </p>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified News Administrator</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onNavigate('profile');
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <User className="h-3.5 w-3.5 text-neutral-500" />
                  <span>Admin Profile</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onNavigate('settings');
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Settings className="h-3.5 w-3.5 text-neutral-500" />
                  <span>Website Settings</span>
                </button>
              </div>

              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

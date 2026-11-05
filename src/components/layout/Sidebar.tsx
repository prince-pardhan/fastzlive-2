import React from 'react';
import {
  LayoutDashboard,
  FilePlus2,
  Newspaper,
  CheckCircle2,
  FileEdit,
  Clock,
  Flame,
  Sparkles,
  FolderTree,
  Image,
  SearchCheck,
  Settings,
  UserCheck,
  LogOut,
  X,
  ExternalLink,
} from 'lucide-react';
import { NewsArticle, NewsCategory } from '../../types/news';

interface SidebarProps {
  currentSection: string;
  onNavigate: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
  articles: NewsArticle[];
  categories: NewsCategory[];
  onLogout: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  highlight?: boolean;
  badge?: string | null;
  count?: number;
  countColor?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  isOpen,
  onClose,
  articles,
  categories,
  onLogout,
}) => {
  // Counts calculation
  const totalCount = articles.length;
  const publishedCount = articles.filter(a => a.status === 'published').length;
  const draftCount = articles.filter(a => a.status === 'draft').length;
  const scheduledCount = articles.filter(a => a.status === 'scheduled').length;
  const breakingCount = articles.filter(a => a.isBreaking).length;
  const featuredCount = articles.filter(a => a.isFeatured).length;
  const categoryCount = categories.length;

  const navGroups: NavGroup[] = [
    {
      group: 'Editorial Desk',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Overview',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'create',
          label: 'Create News',
          icon: FilePlus2,
          highlight: true,
          badge: 'NEW',
        },
      ],
    },
    {
      group: 'News Management',
      items: [
        {
          id: 'all',
          label: 'All News',
          icon: Newspaper,
          count: totalCount,
        },
        {
          id: 'published',
          label: 'Published News',
          icon: CheckCircle2,
          count: publishedCount,
          countColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
        },
        {
          id: 'draft',
          label: 'Draft News',
          icon: FileEdit,
          count: draftCount,
          countColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
        },
        {
          id: 'scheduled',
          label: 'Scheduled News',
          icon: Clock,
          count: scheduledCount,
          countColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
        },
        {
          id: 'breaking',
          label: 'Breaking News',
          icon: Flame,
          count: breakingCount,
          countColor: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 font-bold',
        },
        {
          id: 'featured',
          label: 'Featured News',
          icon: Sparkles,
          count: featuredCount,
          countColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40',
        },
      ],
    },
    {
      group: 'Organization & Media',
      items: [
        {
          id: 'categories',
          label: 'News Categories',
          icon: FolderTree,
          count: categoryCount,
        },
        {
          id: 'media',
          label: 'Media Library',
          icon: Image,
        },
      ],
    },
    {
      group: 'Configuration',
      items: [
        {
          id: 'seo',
          label: 'SEO Manager',
          icon: SearchCheck,
        },
        {
          id: 'settings',
          label: 'Website Settings',
          icon: Settings,
        },
        {
          id: 'profile',
          label: 'Admin Profile',
          icon: UserCheck,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header / Brand */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800 lg:hidden">
          <div className="flex items-center">
            <span className="bg-red-600 px-2.5 py-1 text-sm font-extrabold tracking-tight text-white rounded-l">
              FASTZ
            </span>
            <span className="bg-black px-2.5 py-1 text-sm font-extrabold tracking-tight text-white rounded-r">
              LIVE
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Action Button: Create News */}
        <div className="p-3 border-b border-neutral-100 dark:border-neutral-900">
          <button
            onClick={() => {
              onNavigate('create');
              if (window.innerWidth < 1024) onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-red-500/20 hover:from-red-700 hover:to-red-800 active:scale-[0.98] transition-all cursor-pointer"
          >
            <FilePlus2 className="h-4 w-4" />
            <span>Create News Article</span>
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-red-50 text-red-700 font-bold dark:bg-red-950/50 dark:text-red-400 border-l-4 border-red-600 shadow-xs'
                          : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            isActive
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-neutral-500 group-hover:text-neutral-800 dark:text-neutral-400 dark:group-hover:text-neutral-200'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {/* Count or Badge */}
                      {item.badge && (
                        <span className="rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                          {item.badge}
                        </span>
                      )}

                      {typeof item.count === 'number' && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            item.countColor ||
                            'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer with Site Link, Logout & Version */}
        <div className="border-t border-neutral-200 p-3 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-2">
          <a
            href="https://www.fastzlive.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-white hover:text-red-600 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-red-400 border border-neutral-200 dark:border-neutral-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Fastzlive Live Portal</span>
            </span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out Admin</span>
          </button>

          <div className="px-3 pt-1 text-[10px] text-neutral-400 dark:text-neutral-500 flex justify-between items-center">
            <span>Fastzlive CMS v2.6</span>
            <span className="font-mono">Node / Express</span>
          </div>
        </div>
      </aside>
    </>
  );
};

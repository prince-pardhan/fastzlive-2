import React from 'react';
import {
  Newspaper,
  CheckCircle2,
  FileEdit,
  Clock,
  FolderTree,
  Flame,
  Sparkles,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Eye,
  Radio,
  Activity,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { NewsArticle, NewsCategory } from '../../types/news';

interface DashboardOverviewProps {
  articles: NewsArticle[];
  categories: NewsCategory[];
  onNavigate: (section: string) => void;
  onEditArticle: (article: NewsArticle) => void;
  onPreviewArticle: (article: NewsArticle) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  articles,
  categories,
  onNavigate,
  onEditArticle,
  onPreviewArticle,
}) => {
  const totalNews = articles.length;
  const publishedArticles = articles.filter((a) => a.status === 'published');
  const draftArticles = articles.filter((a) => a.status === 'draft');
  const scheduledArticles = articles.filter((a) => a.status === 'scheduled');
  const breakingArticles = articles.filter((a) => a.isBreaking);
  const totalCategories = categories.length;

  // Calculate total views across published articles
  const totalViews = publishedArticles.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);

  // Recent 6 articles
  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 6);

  // Stat cards definitions
  const statCards = [
    {
      title: 'Total News Stories',
      value: totalNews,
      subtitle: `${publishedArticles.length} Live on Fastzlive.com`,
      icon: Newspaper,
      color: 'from-neutral-900 to-neutral-800 text-white',
      badge: '+12% this week',
      badgeColor: 'bg-emerald-500/20 text-emerald-400',
      action: () => onNavigate('all'),
    },
    {
      title: 'Published Articles',
      value: publishedArticles.length,
      subtitle: `${Math.round((publishedArticles.length / (totalNews || 1)) * 100)}% publication rate`,
      icon: CheckCircle2,
      color: 'from-emerald-700 to-emerald-900 text-white',
      badge: 'Active & Indexed',
      badgeColor: 'bg-emerald-500/20 text-emerald-200',
      action: () => onNavigate('published'),
    },
    {
      title: 'Draft Articles',
      value: draftArticles.length,
      subtitle: 'Pending editorial review',
      icon: FileEdit,
      color: 'from-amber-600 to-amber-800 text-white',
      badge: 'Needs Review',
      badgeColor: 'bg-amber-400/20 text-amber-200',
      action: () => onNavigate('draft'),
    },
    {
      title: 'Scheduled Releases',
      value: scheduledArticles.length,
      subtitle: 'Auto-publish queue',
      icon: Clock,
      color: 'from-blue-600 to-blue-800 text-white',
      badge: 'Upcoming',
      badgeColor: 'bg-blue-400/20 text-blue-200',
      action: () => onNavigate('scheduled'),
    },
    {
      title: 'Breaking News Active',
      value: breakingArticles.length,
      subtitle: 'Live banner alerts',
      icon: Flame,
      color: 'from-red-600 to-red-800 text-white',
      badge: 'LIVE TICKER',
      badgeColor: 'bg-white text-red-700 font-extrabold',
      action: () => onNavigate('breaking'),
    },
    {
      title: 'News Categories',
      value: totalCategories,
      subtitle: 'Regional & beat desks',
      icon: FolderTree,
      color: 'from-purple-700 to-purple-900 text-white',
      badge: '18 Active Beats',
      badgeColor: 'bg-purple-400/20 text-purple-200',
      action: () => onNavigate('categories'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Active Breaking News Alert Banner if any breaking story */}
      {breakingArticles.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-red-700 to-neutral-900 p-4 text-white shadow-lg border border-red-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <div className="flex items-center gap-2">
                <span className="bg-black/60 px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded border border-white/20">
                  FASTZLATE FLASH
                </span>
                <span className="text-xs sm:text-sm font-bold font-hindi truncate max-w-xl">
                  {breakingArticles[0].title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPreviewArticle(breakingArticles[0])}
                className="rounded-lg bg-white/20 hover:bg-white/30 px-3 py-1 text-xs font-bold transition-colors cursor-pointer"
              >
                View Live
              </button>
              <button
                onClick={() => onNavigate('breaking')}
                className="rounded-lg bg-black px-3 py-1 text-xs font-bold hover:bg-black/80 transition-colors cursor-pointer"
              >
                Manage ({breakingArticles.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Editorial Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Fastzlive Newsroom Desk
            </h2>
            <p className="text-[11px] text-neutral-500">
              Publish Hindi and English journalism to Fastzlive.com
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('create')}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Write New Story</span>
          </button>
          <button
            onClick={() => onNavigate('media')}
            className="rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Media Library
          </button>
          <button
            onClick={() => onNavigate('seo')}
            className="rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            SEO Hub
          </button>
        </div>
      </div>

      {/* 6 Analytics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className={`cursor-pointer group relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                    {card.title}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight">
                    {card.value}
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-xs group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-xs opacity-90">{card.subtitle}</span>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-Column Layout: Left (Recent News) & Right (Category Breakdown & Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent News Desk (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-red-600" />
                  <span>Recent News Articles</span>
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Latest editorial updates from reporters and regional bureaus
                </p>
              </div>

              <button
                onClick={() => onNavigate('all')}
                className="flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              >
                <span>View All News</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Recent Articles List */}
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 pt-1">
              {recentArticles.map((article) => (
                <div
                  key={article.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 rounded-xl px-2 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        article.featuredImage ||
                        'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=120&auto=format&fit=crop&q=80'
                      }
                      alt=""
                      className="h-14 w-20 shrink-0 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700 bg-neutral-100"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] font-bold text-neutral-700 dark:text-neutral-300">
                          {article.category}
                        </span>
                        {article.isBreaking && (
                          <span className="flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                            <Flame className="h-2.5 w-2.5 fill-white" /> BREAKING
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-400">
                          {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <h4
                        onClick={() => onEditArticle(article)}
                        className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 font-hindi line-clamp-1 group-hover:text-red-600 cursor-pointer"
                      >
                        {article.title}
                      </h4>
                      <p className="text-[11px] text-neutral-500 line-clamp-1">
                        By {article.author} • {article.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                        article.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : article.status === 'draft'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                      }`}
                    >
                      {article.status}
                    </span>
                    <button
                      onClick={() => onPreviewArticle(article)}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
                      title="Live Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditArticle(article)}
                      className="p-1 rounded text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Category Distribution & Publishing Activity Log */}
        <div className="space-y-4">
          {/* Category Coverage Card */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <Layers className="h-4 w-4 text-red-600" />
                <span>Regional & Beat Desks</span>
              </h3>
              <button
                onClick={() => onNavigate('categories')}
                className="text-[11px] font-bold text-red-600 hover:underline"
              >
                Manage All
              </button>
            </div>

            {/* Top Categories with Article Counts */}
            <div className="space-y-2 pt-1">
              {categories.slice(0, 7).map((cat) => {
                const count = articles.filter(
                  (a) => a.category.toLowerCase() === cat.name.toLowerCase()
                ).length;
                const percentage = Math.round((count / (totalNews || 1)) * 100);

                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-neutral-800 dark:text-neutral-200">
                        {cat.name} <span className="font-hindi text-neutral-400">({cat.hindiName})</span>
                      </span>
                      <span className="font-bold text-neutral-600 dark:text-neutral-400">
                        {count} stories ({percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Publishing Activity Audit Log */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-600" />
              <span>Newsroom Publishing Log</span>
            </h3>

            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                <div>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Live Broadcast Active on Fastzlive.com
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Verified CMS persistent sync online
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="h-2 w-2 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                <div>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                    AI News Assistant Ready
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Gemini 3.8 Flash Hindi grammar & headlines active
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="h-2 w-2 rounded-full bg-red-500 mt-1 shrink-0"></span>
                <div>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Breaking Alert Redundancy
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Auto-ticker refresh every 18 seconds
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Flame,
  Star,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle,
  FileEdit,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  ExternalLink,
  Plus,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { NewsArticle, NewsCategory, NewsStatus } from '../../types/news';
import { NewsPreviewModal } from './NewsPreviewModal';

interface NewsListProps {
  articles: NewsArticle[];
  categories: NewsCategory[];
  title: string;
  subtitle: string;
  initialStatusFilter?: string;
  initialBreakingFilter?: boolean;
  initialFeaturedFilter?: boolean;
  onEdit: (article: NewsArticle) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleBreaking: (id: string) => void;
  onToggleFeatured: (id: string) => void;
  onCreateNew: () => void;
  onRefresh: () => void;
}

export const NewsList: React.FC<NewsListProps> = ({
  articles,
  categories,
  title,
  subtitle,
  initialStatusFilter = 'all',
  initialBreakingFilter = false,
  initialFeaturedFilter = false,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleBreaking,
  onToggleFeatured,
  onCreateNew,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views'>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [previewArticle, setPreviewArticle] = useState<NewsArticle | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter and sort articles
  let filtered = articles.filter((article) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        article.title.toLowerCase().includes(q) ||
        article.description.toLowerCase().includes(q) ||
        article.author.toLowerCase().includes(q) ||
        article.location.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q) ||
        (article.tags && article.tags.some((t) => t.toLowerCase().includes(q)));
      if (!match) return false;
    }

    // Category
    if (selectedCategory !== 'all' && article.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    // Status
    if (statusFilter !== 'all' && article.status !== statusFilter) {
      return false;
    }

    // Initial Breaking filter
    if (initialBreakingFilter && !article.isBreaking) {
      return false;
    }

    // Initial Featured filter
    if (initialFeaturedFilter && !article.isFeatured) {
      return false;
    }

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'views') {
      return (b.viewsCount || 0) - (a.viewsCount || 0);
    }
    return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected articles?`)) {
      selectedIds.forEach((id) => onDelete(id));
      setSelectedIds([]);
    }
  };

  const getStatusBadge = (status: NewsStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 px-2.5 py-0.5 text-[11px] font-bold">
            <CheckCircle className="h-3 w-3" />
            <span>Published</span>
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900 px-2.5 py-0.5 text-[11px] font-bold">
            <FileEdit className="h-3 w-3" />
            <span>Draft</span>
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900 px-2.5 py-0.5 text-[11px] font-bold">
            <Clock className="h-3 w-3" />
            <span>Scheduled</span>
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[11px] font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-950 p-6 text-white border border-neutral-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-red-500">
              Fastzlive Newsroom
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            {subtitle} • Showing {filtered.length} of {articles.length} total stories
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
            title="Refresh database"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={onCreateNew}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Article</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search headline, reporter, location, tags..."
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} {c.hindiName ? `(${c.hindiName})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
              <option value="scheduled">Scheduled Only</option>
            </select>
          </div>

          {/* Sort By & View Mode */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-2 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="views">Most Views</option>
            </select>

            <div className="flex rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
                title="Table View"
              >
                <ListIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
                title="Cards View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Toolbar if items selected */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 px-4 py-2 text-xs text-red-900 dark:text-red-300 animate-in fade-in duration-150">
            <span className="font-bold">
              {selectedIds.length} article(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Selected</span>
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 px-2"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Table or Cards View */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            No News Articles Found
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            No articles match your current search or filter criteria. Try clearing filters or create a new article.
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Article</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Responsive Table Container (scrollable without page overflow) */
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
              <thead className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 accent-red-600 rounded"
                    />
                  </th>
                  <th className="p-4 min-w-[280px]">News Story & Headline</th>
                  <th className="p-4 min-w-[120px]">Category</th>
                  <th className="p-4 min-w-[140px]">Author & Location</th>
                  <th className="p-4 min-w-[100px]">Status</th>
                  <th className="p-4 min-w-[110px]">Toggles</th>
                  <th className="p-4 min-w-[130px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filtered.map((article) => {
                  const isSelected = selectedIds.includes(article.id);
                  return (
                    <tr
                      key={article.id}
                      className={`hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors ${
                        isSelected ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(article.id)}
                          className="h-4 w-4 accent-red-600 rounded"
                        />
                      </td>

                      {/* Headline + Thumbnail + Date */}
                      <td className="p-4">
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
                            <h2
                              onClick={() => onEdit(article)}
                              className="font-bold text-sm text-neutral-900 dark:text-neutral-100 hover:text-red-600 dark:hover:text-red-400 font-hindi line-clamp-2 cursor-pointer leading-snug"
                            >
                              {article.title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                              <span>
                                {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              <span>•</span>
                              <span className="font-mono truncate max-w-[180px]">
                                /{article.slug}
                              </span>
                              {article.viewsCount ? (
                                <>
                                  <span>•</span>
                                  <span>{article.viewsCount.toLocaleString()} views</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="rounded-lg bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                          {article.category}
                        </span>
                        {article.subcategory && (
                          <span className="block text-[11px] text-neutral-400 mt-1">
                            {article.subcategory}
                          </span>
                        )}
                      </td>

                      {/* Author & Location */}
                      <td className="p-4">
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[140px]">
                          {article.author}
                        </p>
                        <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span>{article.location || 'India'}</span>
                        </p>
                      </td>

                      {/* Status */}
                      <td className="p-4">{getStatusBadge(article.status)}</td>

                      {/* Quick Toggles */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {/* Breaking Toggle */}
                          <button
                            type="button"
                            onClick={() => onToggleBreaking(article.id)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              article.isBreaking
                                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                : 'text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:text-red-600'
                            }`}
                            title={article.isBreaking ? 'Active Breaking Alert' : 'Set as Breaking News'}
                          >
                            <Flame className={`h-3.5 w-3.5 ${article.isBreaking ? 'fill-white' : ''}`} />
                          </button>

                          {/* Featured Toggle */}
                          <button
                            type="button"
                            onClick={() => onToggleFeatured(article.id)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              article.isFeatured
                                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                : 'text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:text-amber-500'
                            }`}
                            title={article.isFeatured ? 'Featured Story' : 'Set as Featured'}
                          >
                            <Star className={`h-3.5 w-3.5 ${article.isFeatured ? 'fill-white' : ''}`} />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreviewArticle(article)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                            title="Live Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onEdit(article)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                            title="Edit News Article"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDuplicate(article.id)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
                            title="Duplicate as Draft"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(article.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                            title="Delete Article"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View (Mobile & Grid Friendly) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((article) => (
            <div
              key={article.id}
              className="group flex flex-col justify-between rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs hover:border-red-500 transition-all"
            >
              <div>
                {/* Thumbnail & Badges */}
                <div className="relative h-44 w-full bg-neutral-100 overflow-hidden">
                  <img
                    src={
                      article.featuredImage ||
                      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80'
                    }
                    alt={article.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    {getStatusBadge(article.status)}
                    {article.isBreaking && (
                      <span className="flex items-center gap-1 rounded-full bg-red-600 text-white px-2 py-0.5 text-[10px] font-extrabold uppercase shadow-sm">
                        <Flame className="h-3 w-3 fill-white" />
                        <span>Breaking</span>
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className="rounded-lg bg-black/75 backdrop-blur-xs px-2 py-1 text-[11px] font-bold text-white">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-2">
                  <h3
                    onClick={() => onEdit(article)}
                    className="text-sm font-bold text-neutral-900 dark:text-neutral-100 font-hindi line-clamp-2 hover:text-red-600 cursor-pointer"
                  >
                    {article.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {article.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="border-t border-neutral-100 dark:border-neutral-800 p-3 bg-neutral-50/50 dark:bg-neutral-950/40 flex items-center justify-between text-xs">
                <span className="text-[11px] text-neutral-500">
                  By {article.author}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewArticle(article)}
                    className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                    title="Live Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(article)}
                    className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-950 text-blue-600"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(article.id)}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-950 text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Confirm News Deletion
              </h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Are you sure you want to delete this news article? This action will remove it from the database and Fastzlive.com immediately.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-xl border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewArticle && (
        <NewsPreviewModal
          article={previewArticle}
          categories={categories}
          onClose={() => setPreviewArticle(null)}
        />
      )}
    </div>
  );
};

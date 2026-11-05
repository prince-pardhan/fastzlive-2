import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Newspaper,
  Check,
  X,
  Search,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { NewsCategory, NewsArticle } from '../../types/news';
import { api } from '../../lib/api';

interface CategoriesManagerProps {
  categories: NewsCategory[];
  articles: NewsArticle[];
  onRefresh: () => void;
  onFilterByCategory: (categoryName: string) => void;
}

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  categories,
  articles,
  onRefresh,
  onFilterByCategory,
}) => {
  const [search, setSearch] = useState('');
  const [editingCategory, setEditingCategory] = useState<NewsCategory | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states for modal
  const [name, setName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [slug, setSlug] = useState('');
  const [subcategoriesStr, setSubcategoriesStr] = useState('');
  const [color, setColor] = useState('#e11d48');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.hindiName && c.hindiName.includes(search)) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setName('');
    setHindiName('');
    setSlug('');
    setSubcategoriesStr('');
    setColor('#e11d48');
    setIsCreating(true);
    setEditingCategory(null);
  };

  const openEditModal = (cat: NewsCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setHindiName(cat.hindiName || '');
    setSlug(cat.slug);
    setSubcategoriesStr(cat.subcategories?.join(', ') || '');
    setColor(cat.color || '#e11d48');
    setIsCreating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const subcategories = subcategoriesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, {
          name: name.trim(),
          hindiName: hindiName.trim(),
          slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
          subcategories,
          color,
        });
      } else {
        await api.createCategory({
          name: name.trim(),
          hindiName: hindiName.trim(),
          slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
          subcategories,
          color,
        });
      }
      setIsCreating(false);
      setEditingCategory(null);
      onRefresh();
    } catch (err: any) {
      alert(`Operation failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the category "${name}"?`)) {
      try {
        await api.deleteCategory(id);
        onRefresh();
      } catch (err: any) {
        alert(`Failed to delete category: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-neutral-900 p-6 text-white border border-neutral-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">
              News Desks & Beats
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">
            News Categories (श्रेणियाँ)
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            18 Core categories covering national, state bureaus (Haryana, Rajasthan, Delhi, Punjab, UP), and thematic beats.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom Category</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2.5 shadow-xs">
        <Search className="h-4 w-4 text-neutral-400 mr-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search category by English name, Hindi name, or slug..."
          className="w-full bg-transparent text-xs text-neutral-800 dark:text-neutral-200 outline-none"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat, idx) => {
          const articleCount = articles.filter(
            (a) => a.category.toLowerCase() === cat.name.toLowerCase()
          ).length;

          return (
            <div
              key={cat.id}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-xs hover:border-red-500 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-white shrink-0"
                    style={{ backgroundColor: cat.color || '#e11d48' }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <span>{cat.name}</span>
                      {cat.hindiName && (
                        <span className="font-hindi text-neutral-400 font-semibold text-xs">
                          ({cat.hindiName})
                        </span>
                      )}
                    </h3>
                    <p className="font-mono text-[11px] text-neutral-400">
                      /{cat.slug}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-neutral-400"
                    title="Edit Category"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Delete Category"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Subcategories Chips */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Subcategories ({cat.subcategories?.length || 0}):
                </p>
                <div className="flex flex-wrap gap-1">
                  {cat.subcategories && cat.subcategories.length > 0 ? (
                    cat.subcategories.map((sub, i) => (
                      <span
                        key={i}
                        className="rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-700 dark:text-neutral-300 font-medium"
                      >
                        {sub}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-neutral-400 italic">No subcategories defined</span>
                  )}
                </div>
              </div>

              {/* Bottom stats & Filter Link */}
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                  {articleCount} Published Stories
                </span>
                <button
                  onClick={() => onFilterByCategory(cat.name)}
                  className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:underline"
                >
                  <span>Filter News</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {(isCreating || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {editingCategory ? 'Edit News Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingCategory(null);
                }}
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    English Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Crime"
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Hindi Name (हिंदी)
                  </label>
                  <input
                    type="text"
                    value={hindiName}
                    onChange={(e) => setHindiName(e.target.value)}
                    placeholder="e.g. अपराध"
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs font-hindi text-neutral-900 dark:text-neutral-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. crime-news"
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs font-mono text-neutral-900 dark:text-neutral-100 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Subcategories (comma separated)
                </label>
                <input
                  type="text"
                  value={subcategoriesStr}
                  onChange={(e) => setSubcategoriesStr(e.target.value)}
                  placeholder="e.g. Police, Investigation, Court, Cyber Crime"
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-8 w-14 rounded cursor-pointer border-0"
                  />
                  <span className="font-mono text-xs text-neutral-500">{color}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingCategory(null);
                  }}
                  className="rounded-xl border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Fastzlive News CMS - API Client Library
 */

import {
  NewsArticle,
  NewsCategory,
  MediaItem,
  SiteSettings,
  AdminUser,
  AiAssistantRequest,
  AiAssistantResponse,
} from '../types/news';

export interface NewsFilterParams {
  status?: string;
  category?: string;
  search?: string;
  breaking?: boolean;
  featured?: boolean;
}

export const api = {
  // --- News Articles ---
  async getNews(params?: NewsFilterParams): Promise<NewsArticle[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.breaking) query.set('breaking', 'true');
    if (params?.featured) query.set('featured', 'true');

    const res = await fetch(`/api/news?${query.toString()}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch news');
    return json.data;
  },

  async getArticle(id: string): Promise<NewsArticle> {
    const res = await fetch(`/api/news/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Article not found');
    return json.data;
  },

  async createArticle(data: Partial<NewsArticle>): Promise<NewsArticle> {
    const res = await fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create article');
    return json.data;
  },

  async updateArticle(id: string, data: Partial<NewsArticle>): Promise<NewsArticle> {
    const res = await fetch(`/api/news/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update article');
    return json.data;
  },

  async deleteArticle(id: string): Promise<void> {
    const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete article');
  },

  async duplicateArticle(id: string): Promise<NewsArticle> {
    const res = await fetch(`/api/news/${id}/duplicate`, { method: 'POST' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to duplicate article');
    return json.data;
  },

  async toggleBreaking(id: string): Promise<NewsArticle> {
    const res = await fetch(`/api/news/${id}/toggle-breaking`, { method: 'PATCH' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to toggle breaking status');
    return json.data;
  },

  async toggleFeatured(id: string): Promise<NewsArticle> {
    const res = await fetch(`/api/news/${id}/toggle-featured`, { method: 'PATCH' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to toggle featured status');
    return json.data;
  },

  // --- Categories ---
  async getCategories(): Promise<NewsCategory[]> {
    const res = await fetch('/api/categories');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch categories');
    return json.data;
  },

  async createCategory(cat: Partial<NewsCategory>): Promise<NewsCategory> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create category');
    return json.data;
  },

  async updateCategory(id: string, cat: Partial<NewsCategory>): Promise<NewsCategory> {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update category');
    return json.data;
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete category');
  },

  // --- Media Library ---
  async getMedia(): Promise<MediaItem[]> {
    const res = await fetch('/api/media');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch media');
    return json.data;
  },

  async uploadMedia(formData: FormData): Promise<MediaItem[]> {
    const res = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to upload media');
    return json.data;
  },

  async deleteMedia(id: string): Promise<void> {
    const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete media');
  },

  // --- Settings ---
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch('/api/settings');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch settings');
    return json.data;
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to save settings');
    return json.data;
  },

  // --- Auth ---
  async login(credentials: { username: string; password: string }): Promise<{ token: string; user: AdminUser }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Login failed');
    return { token: json.token, user: json.user };
  },

  async getMe(): Promise<AdminUser> {
    const res = await fetch('/api/auth/me');
    const json = await res.json();
    if (!json.success) throw new Error('Not authenticated');
    return json.user;
  },

  // --- AI Assistant ---
  async runAiAssistant(payload: AiAssistantRequest): Promise<AiAssistantResponse> {
    const res = await fetch('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'AI generation failed');
    return json;
  },
};

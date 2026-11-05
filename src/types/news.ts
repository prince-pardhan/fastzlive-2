/**
 * Fastzlive News CMS - Data Models & Types
 */

export type NewsStatus = 'published' | 'draft' | 'scheduled' | 'archived';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  featuredImage: string;
  images: string[];
  videoUrl?: string;
  category: string;
  subcategory?: string;
  author: string;
  location: string;
  tags: string[];
  source: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  isBreaking: boolean;
  isFeatured: boolean;
  status: NewsStatus;
  publishedAt: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  viewsCount?: number;
}

export interface NewsCategory {
  id: string;
  name: string;
  hindiName: string;
  slug: string;
  description?: string;
  subcategories: string[];
  articleCount?: number;
  order: number;
  color?: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  dimensions?: { width: number; height: number };
  uploadedAt: string;
  title?: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  siteUrl: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  breakingNewsTickerEnabled: boolean;
  tickerSpeed: number; // seconds
  watermarkText: string;
  defaultLanguage: 'hi' | 'en' | 'both';
  facebookUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  telegramUrl: string;
  googleAnalyticsId: string;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'super_admin' | 'senior_editor' | 'bureau_chief' | 'reporter';
  avatar: string;
  lastLogin?: string;
}

export type AiActionType =
  | 'headline'
  | 'hindi_grammar'
  | 'description'
  | 'rewrite'
  | 'seo_title_desc'
  | 'tags'
  | 'summarize';

export interface AiAssistantRequest {
  action: AiActionType;
  title?: string;
  content?: string;
  category?: string;
  language?: 'hi' | 'en';
}

export interface AiAssistantResponse {
  success: boolean;
  action: AiActionType;
  result: string | string[] | { title: string; description: string; tags: string[] };
  notes?: string;
  error?: string;
}

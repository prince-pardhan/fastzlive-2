import React, { useState, useEffect } from 'react';
import {
  Save,
  Send,
  Clock,
  Sparkles,
  Eye,
  Trash2,
  Copy,
  Image as ImageIcon,
  Upload,
  Link,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Flame,
  Star,
  ChevronDown,
  ChevronUp,
  MapPin,
  User,
  Tag,
  Search,
  Bold,
  Italic,
  Quote,
  List,
  Heading2,
  Heading3,
  Loader2,
} from 'lucide-react';
import { NewsArticle, NewsCategory, MediaItem } from '../../types/news';
import { AiNewsAssistant } from '../ai/AiNewsAssistant';
import { NewsPreviewModal } from './NewsPreviewModal';
import { api } from '../../lib/api';
import { optimizeImageForUpload } from '../../lib/imageUtils';

interface CreateNewsEditorProps {
  initialArticle?: NewsArticle | null;
  categories: NewsCategory[];
  onSaved: (article: NewsArticle) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export const CreateNewsEditor: React.FC<CreateNewsEditorProps> = ({
  initialArticle,
  categories,
  onSaved,
  onCancel,
  onDelete,
  onDuplicate,
}) => {
  // Form State
  const [title, setTitle] = useState(initialArticle?.title || '');
  const [slug, setSlug] = useState(initialArticle?.slug || '');
  const [description, setDescription] = useState(initialArticle?.description || '');
  const [content, setContent] = useState(initialArticle?.content || '');
  const [featuredImage, setFeaturedImage] = useState(initialArticle?.featuredImage || '');
  const [images, setImages] = useState<string[]>(initialArticle?.images || []);
  const [videoUrl, setVideoUrl] = useState(initialArticle?.videoUrl || '');
  const [category, setCategory] = useState(initialArticle?.category || (categories[0]?.name || 'India'));
  const [subcategory, setSubcategory] = useState(initialArticle?.subcategory || '');
  const [author, setAuthor] = useState(initialArticle?.author || 'Fastzlive Special Desk');
  const [location, setLocation] = useState(initialArticle?.location || 'New Delhi');
  const [tags, setTags] = useState<string[]>(initialArticle?.tags || ['Fastzlive', 'India']);
  const [tagInput, setTagInput] = useState('');
  const [source, setSource] = useState(initialArticle?.source || 'Fastzlive Bureau');
  const [isBreaking, setIsBreaking] = useState(initialArticle?.isBreaking || false);
  const [isFeatured, setIsFeatured] = useState(initialArticle?.isFeatured || false);
  const [status, setStatus] = useState<'published' | 'draft' | 'scheduled'>(
    initialArticle?.status === 'archived' ? 'draft' : (initialArticle?.status || 'draft')
  );

  // Date and Time
  const now = new Date();
  const defaultDate = initialArticle?.publishedAt
    ? initialArticle.publishedAt.split('T')[0]
    : now.toISOString().split('T')[0];
  const defaultTime = initialArticle?.publishedAt
    ? initialArticle.publishedAt.split('T')[1]?.substring(0, 5) || '12:00'
    : now.toTimeString().substring(0, 5);

  const [publishedDate, setPublishedDate] = useState(defaultDate);
  const [publishedTime, setPublishedTime] = useState(defaultTime);

  // Scheduled date and time
  const [scheduledDate, setScheduledDate] = useState(
    initialArticle?.scheduledAt ? initialArticle.scheduledAt.split('T')[0] : defaultDate
  );
  const [scheduledTime, setScheduledTime] = useState(
    initialArticle?.scheduledAt ? initialArticle.scheduledAt.split('T')[1]?.substring(0, 5) || '18:00' : '18:00'
  );

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState(initialArticle?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialArticle?.seoDescription || '');
  const [seoKeywords, setSeoKeywords] = useState<string[]>(initialArticle?.seoKeywords || []);
  const [seoKeywordInput, setSeoKeywordInput] = useState('');
  const [seoAccordionOpen, setSeoAccordionOpen] = useState(false);

  // Modals & Panels
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'featured' | 'gallery'>('featured');
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Auto-slug generator on headline typing if slug is empty or matches previous title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialArticle && (!slug || slug === title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'))) {
      const generated = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
      setSlug(generated);
    }
  };

  // Get active subcategories based on chosen category
  const activeCategoryObj = categories.find(
    (c) => c.name.toLowerCase() === category.toLowerCase()
  );
  const availableSubcategories = activeCategoryObj?.subcategories || [];

  // Load media library for picker
  useEffect(() => {
    api.getMedia().then(setMediaLibrary).catch(() => {});
  }, []);

  // Tag helper
  const handleAddTag = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter' && e.key !== ',') return;
    if (e) e.preventDefault();
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // SEO Keyword helper
  const handleAddSeoKeyword = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter' && e.key !== ',') return;
    if (e) e.preventDefault();
    const trimmed = seoKeywordInput.trim();
    if (trimmed && !seoKeywords.includes(trimmed)) {
      setSeoKeywords([...seoKeywords, trimmed]);
      setSeoKeywordInput('');
    }
  };

  const handleRemoveSeoKeyword = (kwToRemove: string) => {
    setSeoKeywords(seoKeywords.filter((k) => k !== kwToRemove));
  };

  // Featured Image File Upload handler with automatic optimization & base64 fallback
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    setUploadingImage(true);
    setValidationError(null);

    try {
      // Step 1: Pre-optimize all images on client side
      const optimizedResults = await Promise.all(
        Array.from(rawFiles).map((file) => optimizeImageForUpload(file, 1920, 0.85))
      );

      // Attempt 1: Standard multipart upload with optimized files
      try {
        const formData = new FormData();
        for (const item of optimizedResults) {
          formData.append('files', item.file);
        }

        const uploaded = await api.uploadMedia(formData);
        if (uploaded.length > 0) {
          if (isGallery) {
            setImages([...images, ...uploaded.map((u) => u.url)]);
          } else {
            setFeaturedImage(uploaded[0].url);
          }
          api.getMedia().then(setMediaLibrary).catch(() => {});
          setUploadingImage(false);
          return;
        }
      } catch (multipartErr: any) {
        console.warn('Multipart upload failed, attempting JSON Base64 upload fallback:', multipartErr.message);
      }

      // Attempt 2: Base64 JSON upload (bypasses multipart proxies, 100% reliable)
      try {
        const base64Payload = optimizedResults.map((item) => ({
          dataUrl: item.dataUrl,
          filename: item.file.name,
        }));

        const uploadedBase64 = await api.uploadMediaBase64(base64Payload);
        if (uploadedBase64.length > 0) {
          if (isGallery) {
            setImages([...images, ...uploadedBase64.map((u) => u.url)]);
          } else {
            setFeaturedImage(uploadedBase64[0].url);
          }
          api.getMedia().then(setMediaLibrary).catch(() => {});
          setUploadingImage(false);
          return;
        }
      } catch (base64Err: any) {
        console.warn('Base64 upload error:', base64Err.message);
      }

      // Attempt 3: Direct DataURL storage (zero-server dependency, works offline & in any proxy)
      const dataUrls = optimizedResults.map((item) => item.dataUrl).filter(Boolean);
      if (dataUrls.length > 0) {
        if (isGallery) {
          setImages([...images, ...dataUrls]);
        } else {
          setFeaturedImage(dataUrls[0]);
        }
      }
    } catch (err: any) {
      console.error('All image upload methods failed:', err);
      setValidationError('Image could not be processed. Please check file format.');
    } finally {
      setUploadingImage(false);
      // Reset input value so same file can be re-selected if desired
      e.target.value = '';
    }
  };

  // Formatting toolbar inserts into content
  const handleFormat = (tagType: string) => {
    const textarea = document.getElementById('news-content-area') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);

    let replacement = '';
    switch (tagType) {
      case 'b':
        replacement = `<strong>${selected || 'Bold text'}</strong>`;
        break;
      case 'i':
        replacement = `<em>${selected || 'Italic text'}</em>`;
        break;
      case 'h2':
        replacement = `\n<h2>${selected || 'Subheading'}</h2>\n`;
        break;
      case 'h3':
        replacement = `\n<h3>${selected || 'Section Title'}</h3>\n`;
        break;
      case 'quote':
        replacement = `\n<blockquote>${selected || 'Prominent statement or quote'}</blockquote>\n`;
        break;
      case 'p':
        replacement = `\n<p>${selected || 'New paragraph text'}</p>\n`;
        break;
      case 'ul':
        replacement = `\n<ul>\n  <li>${selected || 'Key fact point'}</li>\n  <li>Second fact</li>\n</ul>\n`;
        break;
      default:
        replacement = selected;
    }

    const updated = content.substring(0, start) + replacement + content.substring(end);
    setContent(updated);
  };

  // Prepare full Article object
  const buildArticlePayload = (overrideStatus?: 'published' | 'draft' | 'scheduled'): Partial<NewsArticle> => {
    const targetStatus = overrideStatus || status;
    const publishedIso = `${publishedDate}T${publishedTime}:00.000Z`;
    const scheduledIso = targetStatus === 'scheduled' ? `${scheduledDate}T${scheduledTime}:00.000Z` : undefined;

    return {
      title: title.trim(),
      slug: slug.trim() || undefined,
      description: description.trim(),
      content: content.trim(),
      featuredImage: featuredImage.trim(),
      images,
      videoUrl: videoUrl.trim(),
      category: category.trim(),
      subcategory: subcategory.trim(),
      author: author.trim(),
      location: location.trim(),
      tags,
      source: source.trim(),
      seoTitle: (seoTitle || title).trim(),
      seoDescription: (seoDescription || description).trim(),
      seoKeywords: seoKeywords.length > 0 ? seoKeywords : tags,
      isBreaking,
      isFeatured,
      status: targetStatus,
      publishedAt: targetStatus === 'published' ? publishedIso : '',
      scheduledAt: scheduledIso,
    };
  };

  // Form submission / save handler
  const handleSave = async (overrideStatus?: 'published' | 'draft' | 'scheduled') => {
    setValidationError(null);
    if (!title.trim()) {
      setValidationError('News Headline is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!category.trim()) {
      setValidationError('Please select a news category.');
      return;
    }

    const payload = buildArticlePayload(overrideStatus);
    setIsSubmitting(true);

    try {
      let saved: NewsArticle;
      if (initialArticle?.id) {
        saved = await api.updateArticle(initialArticle.id, payload);
        setSuccessToast('Article updated successfully!');
      } else {
        saved = await api.createArticle(payload);
        setSuccessToast('Article created and saved successfully!');
      }

      setTimeout(() => {
        onSaved(saved);
      }, 1000);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Action Bar */}
      <div className="sticky top-16 z-20 -mx-4 -mt-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {initialArticle ? 'Edit Article' : 'Compose News'}
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <span className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100 truncate max-w-xs md:max-w-md">
            {title ? title : 'Untitled Draft'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AI Assistant Button */}
          <button
            type="button"
            onClick={() => setShowAiAssistant(!showAiAssistant)}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 px-3 py-1.5 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-red-600 fill-red-600" />
            <span>AI Assistant</span>
          </button>

          {/* Live Preview Button */}
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shadow-xs cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview</span>
          </button>

          {/* Save as Draft */}
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </button>

          {/* Schedule News */}
          <button
            type="button"
            onClick={() => handleSave('scheduled')}
            disabled={isSubmitting}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Schedule</span>
          </button>

          {/* Publish Now */}
          <button
            type="button"
            onClick={() => handleSave('published')}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            <span>Publish Now</span>
          </button>

          {/* If existing article: Duplicate & Delete */}
          {initialArticle?.id && (
            <>
              {onDuplicate && (
                <button
                  type="button"
                  onClick={() => onDuplicate(initialArticle.id)}
                  title="Duplicate News Article"
                  className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to permanently delete this news article?')) {
                      onDelete(initialArticle.id);
                    }
                  }}
                  title="Delete Article"
                  className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300 px-2 py-1"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Validation or Success Toast */}
      {validationError && (
        <div className="rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-xs font-medium text-red-800 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {successToast && (
        <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Grid: Left Editor & Right Metadata Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2): Headline, Lead, Content, Media */}
        <div className="lg:col-span-2 space-y-6">
          {/* Headline & Slug Card */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-6 space-y-4 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <span className="text-red-600">*</span>
                  <span>News Headline (शीर्षक)</span>
                </label>
                <span className="text-[11px] text-neutral-400">
                  {title.length} characters
                </span>
              </div>
              <textarea
                rows={2}
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter bold, captivating headline in Hindi or English (e.g. सुप्रीम कोर्ट का बड़ा फैसला...)"
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-3 text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-hindi transition-all"
              />
            </div>

            {/* URL Slug */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1 block">
                Permanent URL Slug
              </label>
              <div className="flex items-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-1.5 text-xs text-neutral-500">
                <span className="hidden sm:inline font-mono">fastzlive.com/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="article-slug-url"
                  className="w-full bg-transparent font-mono text-neutral-800 dark:text-neutral-200 outline-none pl-1"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Short Description / Lead (संक्षिप्त विवरण)
                </label>
                <span className="text-[11px] text-neutral-400">
                  {description.length} chars (Recommended: 120-180)
                </span>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a crisp 2-to-3 sentence summary of the news development..."
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-3 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-hindi transition-all leading-relaxed"
              />
            </div>
          </div>

          {/* Full News Content Card with Formatting Toolbar */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-6 space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Full News Content (विस्तृत समाचार)
              </label>

              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleFormat('b')}
                  className="p-1.5 rounded hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold"
                  title="Bold text"
                >
                  <Bold className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('i')}
                  className="p-1.5 rounded hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 italic"
                  title="Italic text"
                >
                  <Italic className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('h2')}
                  className="px-1.5 py-0.5 rounded hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('h3')}
                  className="px-1.5 py-0.5 rounded hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold"
                  title="Heading 3"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('quote')}
                  className="p-1.5 rounded hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  title="Quote Block"
                >
                  <Quote className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('ul')}
                  className="p-1.5 rounded hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  title="Bullet list"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('p')}
                  className="px-1.5 py-0.5 rounded hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium"
                  title="Paragraph"
                >
                  &lt;P&gt;
                </button>
              </div>
            </div>

            <textarea
              id="news-content-area"
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write or paste your comprehensive news article prose here... Supports both Devanagari Hindi and English."
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-4 text-sm font-hindi leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
            />

            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
              <span>
                Word count:{' '}
                {content.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(Boolean).length} words
              </span>
              <span>Estimated reading time: ~{Math.max(1, Math.ceil(content.split(/\s+/).length / 180))} min</span>
            </div>
          </div>

          {/* Media & Attachments Card */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-red-600" />
              <span>Media Attachments & Visuals</span>
            </h3>

            {/* Featured Image Section */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                Featured Primary Image (मुख्य तस्वीर)
              </label>

              {featuredImage ? (
                <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 max-w-lg">
                  <img
                    src={featuredImage}
                    alt="Featured Preview"
                    className="w-full h-56 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFeaturedImage('')}
                    className="absolute top-2 right-2 rounded-full bg-red-600 text-white p-1 hover:bg-red-700 transition-colors shadow-sm"
                    title="Remove Image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="p-2 bg-neutral-50 dark:bg-neutral-950 text-[11px] text-neutral-500 truncate">
                    {featuredImage}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-6 text-center hover:border-red-500 transition-colors">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="h-8 w-8 text-neutral-400" />
                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Upload Featured News Image
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Supports PNG, JPG, WebP up to 15MB
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                      <label className="cursor-pointer rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-3 py-1.5 text-xs font-bold hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-colors">
                        <span>Browse Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFileUpload(e, false)}
                          disabled={uploadingImage}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setMediaPickerTarget('featured');
                          setShowMediaPicker(true);
                        }}
                        className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        Choose from Media Library
                      </button>
                    </div>

                    {uploadingImage && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold mt-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Uploading image to server...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* URL paste alternative */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-400">Or paste image URL:</span>
                <input
                  type="text"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2.5 py-1 text-xs text-neutral-800 dark:text-neutral-200 outline-none"
                />
              </div>
            </div>

            {/* Gallery Images */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Additional Gallery Images ({images.length})
                </label>
                <div className="flex gap-2">
                  <label className="cursor-pointer text-xs font-bold text-red-600 hover:underline">
                    <span>+ Add Photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileUpload(e, true)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPickerTarget('gallery');
                      setShowMediaPicker(true);
                    }}
                    className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                  >
                    From Library
                  </button>
                </div>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden group border border-neutral-200 dark:border-neutral-700">
                      <img src={img} alt={`Gallery ${idx}`} className="h-20 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 rounded-full bg-red-600 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video URL */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                Video Embed URL (YouTube, Vimeo, or MP4)
              </label>
              <div className="flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-950">
                <Link className="h-3.5 w-3.5 text-neutral-400 mr-2" />
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-transparent text-xs text-neutral-800 dark:text-neutral-200 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Taxonomy, Author, Scheduling, Toggles, SEO */}
        <div className="space-y-6">
          {/* Publishing Status & Urgent Toggles */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Publishing Controls
            </h3>

            {/* Status Selector */}
            <div>
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                Article State
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 outline-none"
              >
                <option value="draft">Draft (Private in CMS)</option>
                <option value="published">Published (Live on Fastzlive.com)</option>
                <option value="scheduled">Scheduled (Auto-publish at time)</option>
              </select>
            </div>

            {/* Date & Time if Published */}
            {status === 'published' && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div>
                  <label className="text-[11px] text-neutral-500 block mb-0.5">Publish Date</label>
                  <input
                    type="date"
                    value={publishedDate}
                    onChange={(e) => setPublishedDate(e.target.value)}
                    className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-xs text-neutral-800 dark:text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-500 block mb-0.5">Publish Time</label>
                  <input
                    type="time"
                    value={publishedTime}
                    onChange={(e) => setPublishedTime(e.target.value)}
                    className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-xs text-neutral-800 dark:text-neutral-200"
                  />
                </div>
              </div>
            )}

            {/* Date & Time if Scheduled */}
            {status === 'scheduled' && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-900">
                <div>
                  <label className="text-[11px] font-bold text-blue-700 dark:text-blue-300 block mb-0.5">Release Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-blue-700 dark:text-blue-300 block mb-0.5">Release Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Breaking News Toggle */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 hover:bg-red-100/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-red-600 fill-red-600" />
                  <div>
                    <span className="text-xs font-bold text-red-700 dark:text-red-400 block">
                      Breaking News (ब्रेकिंग न्यूज़)
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      Displays in top red flash ticker
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="h-4 w-4 accent-red-600 rounded"
                />
              </label>
            </div>

            {/* Featured Story Toggle */}
            <div>
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 hover:bg-amber-100/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <div>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                      Featured Story (प्रमुख खबर)
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      Pinned at top of home page
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 accent-amber-600 rounded"
                />
              </label>
            </div>
          </div>

          {/* Categories & Subcategories */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Category & Taxonomy
            </h3>

            {/* Main Category */}
            <div>
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                News Category (18 Portal Categories)
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubcategory('');
                }}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} {c.hindiName ? `(${c.hindiName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                Subcategory (उप-श्रेणी)
              </label>
              {availableSubcategories.length > 0 ? (
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
                >
                  <option value="">Select subcategory...</option>
                  {availableSubcategories.map((sc, i) => (
                    <option key={i} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g. Gurugram, Crime Branch, Parliament"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
                />
              )}
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                News Location / Dateline (स्थान)
              </label>
              <div className="flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-1.5 text-xs">
                <MapPin className="h-3.5 w-3.5 text-neutral-400 mr-2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New Delhi, Chandigarh, Jaipur, Lucknow"
                  className="w-full bg-transparent text-neutral-800 dark:text-neutral-200 outline-none"
                />
              </div>
            </div>

            {/* Author */}
            <div>
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                Author / Journalist Name (लेखक)
              </label>
              <div className="flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-1.5 text-xs">
                <User className="h-3.5 w-3.5 text-neutral-400 mr-2" />
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Rajeev Sharma (Senior Bureau Chief)"
                  className="w-full bg-transparent text-neutral-800 dark:text-neutral-200 outline-none"
                />
              </div>
            </div>

            {/* Source Agency */}
            <div>
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                News Source / Credit (स्रोत)
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Fastzlive Bureau, PTI, ANI, Agencies"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-800 dark:text-neutral-200 outline-none"
              />
            </div>
          </div>

          {/* Tags / Keywords Card */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
              <span>Tags & Keywords ({tags.length})</span>
              <button
                type="button"
                onClick={() => {
                  setShowAiAssistant(true);
                }}
                className="text-[11px] text-red-600 font-bold hover:underline"
              >
                AI Suggest
              </button>
            </h3>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag & press enter..."
                className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddTag()}
                className="rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-3 py-1.5 text-xs font-bold"
              >
                Add
              </button>
            </div>

            {/* Tags Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 rounded-full bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900 px-2.5 py-0.5 text-xs font-medium"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-red-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* SEO Accordion */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoAccordionOpen(!seoAccordionOpen)}
              className="flex w-full items-center justify-between p-4 text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-red-600" />
                <span>SEO & Google News Metadata</span>
              </div>
              {seoAccordionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {seoAccordionOpen && (
              <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
                    <span>SEO Title</span>
                    <span>{seoTitle.length}/60 chars</span>
                  </div>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={title || 'Optimized title for search engines...'}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
                    <span>SEO Meta Description</span>
                    <span>{seoDescription.length}/160 chars</span>
                  </div>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder={description || 'Meta description for Google Snippet...'}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-2.5 text-xs text-neutral-800 dark:text-neutral-200 outline-none"
                  />
                </div>

                {/* Google Snippet Simulation */}
                <div className="rounded-xl bg-neutral-50 dark:bg-neutral-950 p-3 border border-neutral-200 dark:border-neutral-800">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">
                    Google Search Preview
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 font-medium truncate">
                    https://www.fastzlive.com/{slug || 'article-url'}
                  </p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1 mt-0.5">
                    {seoTitle || title || 'Fastzlive Breaking News'}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-0.5">
                    {seoDescription || description || 'Read latest breaking news and verified updates on Fastzlive.com...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating or Modal AI News Assistant Drawer */}
      {showAiAssistant && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white dark:bg-neutral-900 shadow-2xl border-l border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-right duration-200">
          <AiNewsAssistant
            currentHeadline={title}
            currentContent={content}
            currentCategory={category}
            onApplyHeadline={(hl) => {
              setTitle(hl);
              if (!slug) handleTitleChange(hl);
            }}
            onApplyDescription={(desc) => setDescription(desc)}
            onApplyContent={(cnt) => setContent(cnt)}
            onApplyTags={(newTags) => setTags(Array.from(new Set([...tags, ...newTags])))}
            onApplySeo={(seo) => {
              setSeoTitle(seo.title);
              setSeoDescription(seo.description);
              setSeoKeywords(seo.keywords);
              setSeoAccordionOpen(true);
            }}
            onClose={() => setShowAiAssistant(false)}
          />
        </div>
      )}

      {/* Live Preview Modal */}
      {showPreview && (
        <NewsPreviewModal
          article={buildArticlePayload()}
          categories={categories}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Media Library Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Choose Image from Media Library
              </h3>
              <button
                onClick={() => setShowMediaPicker(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {mediaLibrary.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 text-xs">
                  No images in media library yet. Upload images from your device.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaLibrary.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (mediaPickerTarget === 'featured') {
                          setFeaturedImage(item.url);
                        } else {
                          setImages([...images, item.url]);
                        }
                        setShowMediaPicker(false);
                      }}
                      className="group cursor-pointer rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:border-red-600 transition-all shadow-xs"
                    >
                      <img
                        src={item.url}
                        alt={item.title || item.filename}
                        className="h-28 w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="p-2 text-[11px] truncate text-neutral-700 dark:text-neutral-300 font-medium">
                        {item.title || item.filename}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

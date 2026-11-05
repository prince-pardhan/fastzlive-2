import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Monitor,
  Share2,
  Calendar,
  Clock,
  MapPin,
  User,
  Flame,
  Star,
  ExternalLink,
  MessageCircle,
  Bookmark,
  Check,
} from 'lucide-react';
import { NewsArticle, NewsCategory } from '../../types/news';

interface NewsPreviewModalProps {
  article: Partial<NewsArticle>;
  categories: NewsCategory[];
  onClose: () => void;
}

export const NewsPreviewModal: React.FC<NewsPreviewModalProps> = ({
  article,
  categories,
  onClose,
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  const categoryObj = categories.find(
    (c) => c.name.toLowerCase() === (article.category || '').toLowerCase()
  );

  const displayDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

  // Calculate estimated reading time
  const wordCount = (article.content || '').replace(/<[^>]*>?/gm, '').split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 180));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://www.fastzlive.com/${article.slug || 'article'}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4">
      <div className="flex h-[95vh] w-full max-w-6xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Preview Control Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Fastzlive.com Article Simulation
            </span>

            {/* Device Switcher */}
            <div className="hidden sm:flex items-center rounded-lg bg-neutral-200 dark:bg-neutral-800 p-0.5">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  deviceMode === 'desktop'
                    ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Desktop (1200px)</span>
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  deviceMode === 'mobile'
                    ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobile (375px)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 rounded-lg border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copied ? 'Link Copied' : 'Share Link'}</span>
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 dark:text-neutral-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Preview Scroll Area */}
        <div className="flex-1 overflow-y-auto bg-neutral-100 dark:bg-neutral-950 p-2 sm:p-6 flex justify-center">
          <div
            className={`transition-all duration-300 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xl rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col ${
              deviceMode === 'mobile'
                ? 'w-[380px] max-w-full rounded-3xl border-8 border-neutral-800 dark:border-neutral-700 my-auto'
                : 'w-full max-w-4xl'
            }`}
          >
            {/* Simulated Fastzlive News Portal Header */}
            <div className="border-b border-red-600 bg-black text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-red-600 px-2 py-0.5 text-xs font-extrabold tracking-tight text-white rounded">
                  FASTZ
                </span>
                <span className="text-xs font-bold tracking-tight text-white">
                  LIVE
                </span>
                <span className="text-[10px] text-neutral-400 border-l border-neutral-700 pl-2">
                  www.fastzlive.com
                </span>
              </div>
              <span className="text-[10px] font-mono text-red-400">
                IST: LIVE
              </span>
            </div>

            {/* Breaking News Ticker if marked breaking */}
            {article.isBreaking && (
              <div className="bg-red-600 text-white px-4 py-1.5 flex items-center gap-2 text-xs font-bold">
                <span className="flex h-2 w-2 rounded-full bg-white animate-ping"></span>
                <Flame className="h-3.5 w-3.5 fill-white" />
                <span className="uppercase tracking-wider">BREAKING NEWS</span>
              </div>
            )}

            {/* Article Content Container */}
            <article className="p-4 sm:p-8 space-y-4">
              {/* Category Breadcrumbs & Tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-red-600 uppercase tracking-wider">
                  {article.category || 'General News'}
                </span>
                {categoryObj?.hindiName && (
                  <span className="text-neutral-500 font-hindi">
                    ({categoryObj.hindiName})
                  </span>
                )}
                {article.subcategory && (
                  <>
                    <span className="text-neutral-400">›</span>
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                      {article.subcategory}
                    </span>
                  </>
                )}
                {article.isFeatured && (
                  <span className="ml-auto flex items-center gap-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                    <Star className="h-3 w-3 fill-amber-500" />
                    <span>Featured Story</span>
                  </span>
                )}
              </div>

              {/* Headline */}
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight font-hindi leading-tight text-neutral-900 dark:text-neutral-50">
                {article.title || 'Untitled News Headline'}
              </h1>

              {/* Dateline & Byline */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-y border-neutral-200 dark:border-neutral-800 py-3 text-xs text-neutral-600 dark:text-neutral-400">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 font-semibold text-neutral-900 dark:text-neutral-200">
                    <User className="h-3.5 w-3.5 text-red-600" />
                    <span>{article.author || 'Fastzlive Bureau'}</span>
                  </div>
                  {article.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                      <span>{article.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                    <span>{displayDate} IST</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-neutral-400" />
                    <span>{readTime} min read</span>
                  </div>
                </div>

                {/* Social Share Icons */}
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <span className="text-[11px] font-semibold mr-1">Share:</span>
                  <div className="flex gap-1">
                    <span className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer hover:opacity-80">
                      WA
                    </span>
                    <span className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer hover:opacity-80">
                      FB
                    </span>
                    <span className="h-6 w-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold cursor-pointer hover:opacity-80 border border-neutral-700">
                      X
                    </span>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              {article.featuredImage && (
                <div className="relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800">
                  <img
                    src={article.featuredImage}
                    alt={article.title || 'Featured'}
                    className="w-full h-auto max-h-[480px] object-cover"
                  />
                  {/* Watermark badge */}
                  <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                    Fastzlive.com Verified
                  </div>
                  {article.source && (
                    <div className="bg-neutral-100 dark:bg-neutral-800/80 px-3 py-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 italic">
                      Source / Photo Credit: {article.source}
                    </div>
                  )}
                </div>
              )}

              {/* Short Description / Lead */}
              {article.description && (
                <div className="border-l-4 border-red-600 pl-4 py-1 text-sm sm:text-base font-semibold text-neutral-700 dark:text-neutral-300 font-hindi italic leading-relaxed">
                  {article.description}
                </div>
              )}

              {/* Main News Content */}
              <div
                className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed font-hindi text-neutral-800 dark:text-neutral-200 space-y-4 pt-2"
                dangerouslySetInnerHTML={{
                  __html: article.content || '<p>News story content will appear here...</p>',
                }}
              />

              {/* Gallery Images if multiple */}
              {article.images && article.images.length > 0 && (
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                    Photo Gallery ({article.images.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {article.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Gallery ${i}`}
                        className="rounded-lg h-32 w-full object-cover border border-neutral-200 dark:border-neutral-800"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Video preview if provided */}
              {article.videoUrl && (
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                    Related Video Report
                  </h3>
                  <div className="rounded-xl overflow-hidden bg-neutral-900 aspect-video flex items-center justify-center text-white">
                    <p className="text-xs text-neutral-400">
                      Embedded Video URL: {article.videoUrl}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags Section */}
              {article.tags && article.tags.length > 0 && (
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <span className="text-xs font-bold text-neutral-500 mr-2">Tags:</span>
                  <div className="inline-flex flex-wrap gap-1.5 mt-1">
                    {article.tags.map((t, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 px-2.5 py-0.5 text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Portal Footer Stamp */}
            <div className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-6 py-3 text-center text-xs text-neutral-500">
              © {new Date().getFullYear()} Fastzlive.com | All Rights Reserved
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

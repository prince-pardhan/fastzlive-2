import React, { useState } from 'react';
import {
  SearchCheck,
  Globe,
  Share2,
  FileCode,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { SiteSettings, NewsArticle } from '../../types/news';

interface SeoManagerProps {
  settings: SiteSettings;
  articles: NewsArticle[];
}

export const SeoManager: React.FC<SeoManagerProps> = ({ settings, articles }) => {
  const [activeTab, setActiveTab] = useState<'serp' | 'social' | 'sitemap' | 'schema' | 'robots'>('serp');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const sampleArticle = articles.find((a) => a.status === 'published') || articles[0];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articles
  .filter((a) => a.status === 'published')
  .slice(0, 15)
  .map(
    (a) => `  <url>
    <loc>${settings.siteUrl}${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${settings.siteName}</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${a.publishedAt || a.createdAt}</news:publication_date>
      <news:title><![CDATA[${a.title}]]></news:title>
    </news:news>
  </url>`
  )
  .join('\n')}
</urlset>`;

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${settings.siteUrl}${sampleArticle?.slug || 'latest-news'}`,
    },
    headline: sampleArticle?.title || 'Fastzlive Breaking News',
    description: sampleArticle?.description || settings.tagline,
    image: [sampleArticle?.featuredImage || settings.logoUrl],
    datePublished: sampleArticle?.publishedAt || sampleArticle?.createdAt,
    dateModified: sampleArticle?.updatedAt || sampleArticle?.createdAt,
    author: {
      '@type': 'Person',
      name: sampleArticle?.author || 'Fastzlive Bureau',
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: settings.siteName,
      logo: {
        '@type': 'ImageObject',
        url: settings.logoUrl,
      },
    },
  };

  const robotsTxt = `# Fastzlive News Robot Directives
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

User-agent: Googlebot
Allow: /

User-agent: Googlebot-News
Allow: /

Sitemap: ${settings.siteUrl}sitemap.xml
Sitemap: ${settings.siteUrl}news-sitemap.xml`;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-neutral-900 p-6 text-white border border-neutral-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <SearchCheck className="h-4 w-4 text-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">
              Search & Google News
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">
            SEO & Indexing Hub
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Google News XML Sitemap, OpenGraph social cards, Schema.org NewsArticle markup, and robots.txt.
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex overflow-x-auto border-b border-neutral-200 dark:border-neutral-800 gap-2 pb-2">
        <button
          onClick={() => setActiveTab('serp')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'serp'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Google SERP Preview</span>
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'social'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Social Share Cards</span>
        </button>
        <button
          onClick={() => setActiveTab('sitemap')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'sitemap'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          <span>Google News Sitemap</span>
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'schema'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>NewsArticle Schema (JSON-LD)</span>
        </button>
        <button
          onClick={() => setActiveTab('robots')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'robots'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <span>robots.txt</span>
        </button>
      </div>

      {/* Tab 1: Google SERP Preview */}
      {activeTab === 'serp' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Desktop Google Search Snippet
            </h3>
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 bg-white dark:bg-neutral-950 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                <span className="font-semibold text-neutral-900 dark:text-neutral-200">Fastzlive</span>
                <span>•</span>
                <span className="text-emerald-700 dark:text-emerald-400 truncate">
                  https://www.fastzlive.com/{sampleArticle?.slug}
                </span>
              </div>
              <h4 className="text-base text-blue-700 dark:text-blue-400 hover:underline font-medium cursor-pointer font-hindi">
                {sampleArticle?.seoTitle || sampleArticle?.title}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 font-hindi leading-relaxed">
                {sampleArticle?.seoDescription || sampleArticle?.description}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Google News Mobile Card
            </h3>
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 p-3 bg-white dark:bg-neutral-950 flex gap-3 items-center">
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-bold text-red-600 uppercase">
                  Fastzlive • {sampleArticle?.category}
                </span>
                <p className="text-xs font-bold font-hindi line-clamp-2 text-neutral-900 dark:text-neutral-100">
                  {sampleArticle?.title}
                </p>
                <span className="text-[10px] text-neutral-400">1 hour ago</span>
              </div>
              <img
                src={sampleArticle?.featuredImage}
                alt=""
                className="h-16 w-16 rounded-xl object-cover shrink-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Social Share Cards */}
      {activeTab === 'social' && (
        <div className="max-w-xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            OpenGraph / Twitter Card Preview
          </h3>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-neutral-50 dark:bg-neutral-950">
            <img
              src={sampleArticle?.featuredImage}
              alt=""
              className="h-56 w-full object-cover"
            />
            <div className="p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase text-neutral-400">
                FASTZLIVE.COM
              </span>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 font-hindi">
                {sampleArticle?.title}
              </h4>
              <p className="text-xs text-neutral-500 line-clamp-2 font-hindi">
                {sampleArticle?.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: XML Sitemap */}
      {activeTab === 'sitemap' && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Google News XML Sitemap
              </h3>
              <p className="text-xs text-neutral-500">
                Conforms to Google News Sitemap schema specifications with publication name, date, and title.
              </p>
            </div>
            <button
              onClick={() => copyText(sitemapXml, 'sitemap')}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
            >
              {copiedKey === 'sitemap' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedKey === 'sitemap' ? 'Copied' : 'Copy Sitemap XML'}</span>
            </button>
          </div>
          <pre className="rounded-xl bg-neutral-950 p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-96">
            {sitemapXml}
          </pre>
        </div>
      )}

      {/* Tab 4: NewsArticle Schema */}
      {activeTab === 'schema' && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Schema.org NewsArticle Structured Data
              </h3>
              <p className="text-xs text-neutral-500">
                JSON-LD payload injected in &lt;head&gt; of all Fastzlive articles for rich snippets in Google News carousel.
              </p>
            </div>
            <button
              onClick={() => copyText(JSON.stringify(schemaJsonLd, null, 2), 'schema')}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
            >
              {copiedKey === 'schema' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedKey === 'schema' ? 'Copied' : 'Copy JSON-LD'}</span>
            </button>
          </div>
          <pre className="rounded-xl bg-neutral-950 p-4 text-xs font-mono text-amber-300 overflow-x-auto max-h-96">
            {JSON.stringify(schemaJsonLd, null, 2)}
          </pre>
        </div>
      )}

      {/* Tab 5: robots.txt */}
      {activeTab === 'robots' && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              robots.txt Configuration
            </h3>
            <button
              onClick={() => copyText(robotsTxt, 'robots')}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
            >
              {copiedKey === 'robots' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedKey === 'robots' ? 'Copied' : 'Copy robots.txt'}</span>
            </button>
          </div>
          <pre className="rounded-xl bg-neutral-950 p-4 text-xs font-mono text-neutral-300 overflow-x-auto">
            {robotsTxt}
          </pre>
        </div>
      )}
    </div>
  );
};

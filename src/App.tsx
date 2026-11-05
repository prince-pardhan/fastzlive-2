/**
 * Fastzlive News CMS - Main Application Component
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { CreateNewsEditor } from './components/news/CreateNewsEditor';
import { NewsList } from './components/news/NewsList';
import { CategoriesManager } from './components/categories/CategoriesManager';
import { MediaLibrary } from './components/media/MediaLibrary';
import { SeoManager } from './components/seo/SeoManager';
import { WebsiteSettings } from './components/settings/WebsiteSettings';
import { AdminProfile } from './components/profile/AdminProfile';
import { LoginModal } from './components/auth/LoginModal';
import { NewsPreviewModal } from './components/news/NewsPreviewModal';
import { api } from './lib/api';
import { NewsArticle, NewsCategory, MediaItem, SiteSettings, AdminUser } from './types/news';
import { Flame, Loader2, Sparkles, ExternalLink } from 'lucide-react';

export default function App() {
  // Authentication
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('fastzlive_token');
    return saved
      ? {
          id: 'usr-admin-1',
          username: 'fastzlive_admin',
          name: 'Suresh R. Kumar',
          email: 'srk016361@gmail.com',
          role: 'super_admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        }
      : {
          id: 'usr-admin-1',
          username: 'fastzlive_admin',
          name: 'Suresh R. Kumar',
          email: 'srk016361@gmail.com',
          role: 'super_admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        }; // Initial default logged-in state for instant preview
  });

  // UI Theme & Navigation
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('fastzlive_theme') === 'dark';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>('dashboard');
  const [categoryFilterFromSection, setCategoryFilterFromSection] = useState<string | null>(null);

  // Data Store
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Editor / Preview item
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [globalPreviewArticle, setGlobalPreviewArticle] = useState<NewsArticle | null>(null);

  // Sync dark mode class with HTML document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fastzlive_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fastzlive_theme', 'light');
    }
  }, [darkMode]);

  // Load all primary data
  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedArticles, fetchedCategories, fetchedMedia, fetchedSettings] = await Promise.all([
        api.getNews(),
        api.getCategories(),
        api.getMedia(),
        api.getSettings(),
      ]);

      setArticles(fetchedArticles);
      setCategories(fetchedCategories);
      setMedia(fetchedMedia);
      setSettings(fetchedSettings);
    } catch (err) {
      console.error('Failed to load initial CMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for CRUD Operations
  const handleArticleSaved = (saved: NewsArticle) => {
    setArticles((prev) => {
      const idx = prev.findIndex((a) => a.id === saved.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setEditingArticle(null);
    setCurrentSection('all');
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await api.deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      if (editingArticle?.id === id) {
        setEditingArticle(null);
        setCurrentSection('all');
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleDuplicateArticle = async (id: string) => {
    try {
      const duplicated = await api.duplicateArticle(id);
      setArticles((prev) => [duplicated, ...prev]);
      setEditingArticle(duplicated);
      setCurrentSection('create');
    } catch (err: any) {
      alert(`Duplicate failed: ${err.message}`);
    }
  };

  const handleToggleBreaking = async (id: string) => {
    try {
      const updated = await api.toggleBreaking(id);
      setArticles((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err: any) {
      alert(`Toggle failed: ${err.message}`);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const updated = await api.toggleFeatured(id);
      setArticles((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err: any) {
      alert(`Toggle failed: ${err.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fastzlive_token');
    setCurrentUser(null);
  };

  // Breaking news items list for live ticker
  const breakingNewsList = articles.filter((a) => a.isBreaking);

  // If user is not logged in, show secure login
  if (!currentUser) {
    return <LoginModal onSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-200 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        currentUser={currentUser}
        onLogout={handleLogout}
        breakingNewsList={breakingNewsList}
        onNavigate={(sec) => {
          if (sec === 'create') setEditingArticle(null);
          setCurrentSection(sec);
        }}
      />

      {/* Breaking News Live Ticker Flash Bar (If enabled & has breaking news) */}
      {settings?.breakingNewsTickerEnabled && breakingNewsList.length > 0 && (
        <div className="bg-red-600 text-white text-xs font-bold py-1.5 px-4 flex items-center shadow-inner overflow-hidden select-none border-b border-red-700">
          <div className="flex items-center gap-2 bg-black px-2.5 py-0.5 rounded mr-3 shrink-0 uppercase tracking-wider text-[10px] font-black">
            <Flame className="h-3.5 w-3.5 fill-red-500 text-red-500 animate-pulse" />
            <span>BREAKING NEWS</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap flex-1">
            <div className="animate-ticker">
              {breakingNewsList.map((item, index) => (
                <span
                  key={item.id}
                  onClick={() => setGlobalPreviewArticle(item)}
                  className="inline-flex items-center gap-2 mx-6 hover:underline cursor-pointer font-hindi"
                >
                  <span className="opacity-70">[{item.category}]</span>
                  <span>{item.title}</span>
                  {index < breakingNewsList.length - 1 && (
                    <span className="mx-2 opacity-50">✦</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Container with Sidebar & Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar
          currentSection={currentSection}
          onNavigate={(sec) => {
            if (sec === 'create') setEditingArticle(null);
            setCurrentSection(sec);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          articles={articles}
          categories={categories}
          onLogout={handleLogout}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-neutral-500">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              <p className="text-xs font-bold uppercase tracking-wider">
                Connecting to Fastzlive CMS Repository...
              </p>
            </div>
          ) : (
            <>
              {/* Section: Dashboard Overview */}
              {currentSection === 'dashboard' && (
                <DashboardOverview
                  articles={articles}
                  categories={categories}
                  onNavigate={(sec) => {
                    if (sec === 'create') setEditingArticle(null);
                    setCurrentSection(sec);
                  }}
                  onEditArticle={(art) => {
                    setEditingArticle(art);
                    setCurrentSection('create');
                  }}
                  onPreviewArticle={(art) => setGlobalPreviewArticle(art)}
                />
              )}

              {/* Section: Create / Edit News */}
              {currentSection === 'create' && (
                <CreateNewsEditor
                  initialArticle={editingArticle}
                  categories={categories}
                  onSaved={handleArticleSaved}
                  onCancel={() => {
                    setEditingArticle(null);
                    setCurrentSection('all');
                  }}
                  onDelete={handleDeleteArticle}
                  onDuplicate={handleDuplicateArticle}
                />
              )}

              {/* Section: All News */}
              {currentSection === 'all' && (
                <NewsList
                  articles={articles}
                  categories={categories}
                  title="All News Articles"
                  subtitle="Comprehensive catalog of all published stories, drafts, and scheduled bulletins"
                  initialStatusFilter="all"
                  onEdit={(art) => {
                    setEditingArticle(art);
                    setCurrentSection('create');
                  }}
                  onDelete={handleDeleteArticle}
                  onDuplicate={handleDuplicateArticle}
                  onToggleBreaking={handleToggleBreaking}
                  onToggleFeatured={handleToggleFeatured}
                  onCreateNew={() => {
                    setEditingArticle(null);
                    setCurrentSection('create');
                  }}
                  onRefresh={loadData}
                />
              )}

              {/* Section: Published News */}
              {currentSection === 'published' && (
                <NewsList
                  articles={articles}
                  categories={categories}
                  title="Published News (लाइव समाचार)"
                  subtitle="Active articles currently live and indexed on fastzlive.com"
                  initialStatusFilter="published"
                  onEdit={(art) => {
                    setEditingArticle(art);
                    setCurrentSection('create');
                  }}
                  onDelete={handleDeleteArticle}
                  onDuplicate={handleDuplicateArticle}
                  onToggleBreaking={handleToggleBreaking}
                  onToggleFeatured={handleToggleFeatured}
                  onCreateNew={() => {
                    setEditingArticle(null);
                    setCurrentSection('create');
                  }}
                  onRefresh={loadData}
                />
              )}

              {/* Section: Draft News */}
              {currentSection === 'draft' && (
                <NewsList
                  articles={articles}
                  categories={categories}
                  title="Draft News (ड्राफ्ट स्टोरीज़)"
                  subtitle="Unpublished articles saved by reporters awaiting editorial sign-off"
                  initialStatusFilter="draft"
                  onEdit={(art) => {
                    setEditingArticle(art);
                    setCurrentSection('create');
                  }}
                  onDelete={handleDeleteArticle}
                  onDuplicate={handleDuplicateArticle}
                  onToggleBreaking={handleToggleBreaking}
                  onToggleFeatured={handleToggleFeatured}
                  onCreateNew={() => {
                    setEditingArticle(null);
                    setCurrentSection('create');
                  }}
                  onRefresh={loadData}
                />
              )}

              {/* Section: Scheduled News */}
              {currentSection === 'scheduled' && (
                <NewsList
                  articles={articles}
                  categories={categories}
                  title="Scheduled News (नियोजित प्रकाशन)"
                  subtitle="Articles scheduled to be released automatically at predetermined dates & times"
                  initialStatusFilter="scheduled"
                  onEdit={(art) => {
                    setEditingArticle(art);
                    setCurrentSection('create');
                  }}
                  onDelete={handleDeleteArticle}
                  onDuplicate={handleDuplicateArticle}
                  onToggleBreaking={handleToggleBreaking}
                  onToggleFeatured={handleToggleFeatured}
                  onCreateNew={() => {
                    setEditingArticle(null);
                    setCurrentSection('create');
                  }}
                  onRefresh={loadData}
                />
              )}

              {/* Section: Breaking News */}
              {currentSection === 'breaking' && (
                <NewsList
                  articles={articles}
                  categories={categories}
                  title="Breaking News Flash (ब्रेकिंग अलर्ट्स)"
                  subtitle="High priority bulletins prioritized on top scrolling marquee and red badges"
                  initialBreakingFilter={true}
                  onEdit={(art) => {
                    setEditingArticle(art);
                    setCurrentSection('create');
                  }}
                  onDelete={handleDeleteArticle}
                  onDuplicate={handleDuplicateArticle}
                  onToggleBreaking={handleToggleBreaking}
                  onToggleFeatured={handleToggleFeatured}
                  onCreateNew={() => {
                    setEditingArticle(null);
                    setCurrentSection('create');
                  }}
                  onRefresh={loadData}
                />
              )}

              {/* Section: Featured News */}
              {currentSection === 'featured' && (
                <NewsList
                  articles={articles}
                  categories={categories}
                  title="Featured Stories (खास खबरें)"
                  subtitle="Headlines pinned in hero carousel and spotlight columns on the home page"
                  initialFeaturedFilter={true}
                  onEdit={(art) => {
                    setEditingArticle(art);
                    setCurrentSection('create');
                  }}
                  onDelete={handleDeleteArticle}
                  onDuplicate={handleDuplicateArticle}
                  onToggleBreaking={handleToggleBreaking}
                  onToggleFeatured={handleToggleFeatured}
                  onCreateNew={() => {
                    setEditingArticle(null);
                    setCurrentSection('create');
                  }}
                  onRefresh={loadData}
                />
              )}

              {/* Section: Categories */}
              {currentSection === 'categories' && (
                <CategoriesManager
                  categories={categories}
                  articles={articles}
                  onRefresh={loadData}
                  onFilterByCategory={(catName) => {
                    setCategoryFilterFromSection(catName);
                    setCurrentSection('all');
                  }}
                />
              )}

              {/* Section: Media Library */}
              {currentSection === 'media' && (
                <MediaLibrary media={media} onRefresh={loadData} />
              )}

              {/* Section: SEO Manager */}
              {currentSection === 'seo' && settings && (
                <SeoManager settings={settings} articles={articles} />
              )}

              {/* Section: Website Settings */}
              {currentSection === 'settings' && settings && (
                <WebsiteSettings initialSettings={settings} onSaved={setSettings} />
              )}

              {/* Section: Admin Profile */}
              {currentSection === 'profile' && (
                <AdminProfile user={currentUser} onUpdateUser={setCurrentUser} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Preview Modal */}
      {globalPreviewArticle && (
        <NewsPreviewModal
          article={globalPreviewArticle}
          categories={categories}
          onClose={() => setGlobalPreviewArticle(null)}
        />
      )}
    </div>
  );
}

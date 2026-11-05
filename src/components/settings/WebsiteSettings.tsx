import React, { useState } from 'react';
import {
  Settings,
  Save,
  Globe,
  Radio,
  Share2,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { SiteSettings } from '../../types/news';
import { api } from '../../lib/api';

interface WebsiteSettingsProps {
  initialSettings: SiteSettings;
  onSaved: (settings: SiteSettings) => void;
}

export const WebsiteSettings: React.FC<WebsiteSettingsProps> = ({
  initialSettings,
  onSaved,
}) => {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof SiteSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const updated = await api.updateSettings(settings);
      onSaved(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-neutral-900 p-6 text-white border border-neutral-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">
              Newsroom Configuration
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">
            Website Settings (पोर्टल सेटिंग्स)
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure Fastzlive portal identity, live ticker parameters, social handles, and contact information.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 disabled:opacity-50 transition-all self-start sm:self-auto cursor-pointer"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>Website settings successfully updated! Changes are live across the portal.</span>
        </div>
      )}

      {/* Brand Identity */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
          <Globe className="h-4 w-4 text-red-600" />
          <span>Brand Identity & Domain</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Website Brand Name
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Official Website URL
            </label>
            <input
              type="url"
              value={settings.siteUrl}
              onChange={(e) => handleChange('siteUrl', e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-neutral-100 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
            Portal Tagline (स्लोगन)
          </label>
          <input
            type="text"
            value={settings.tagline}
            onChange={(e) => handleChange('tagline', e.target.value)}
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs font-hindi text-neutral-900 dark:text-neutral-100 outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
            Watermark Text for Published Photos
          </label>
          <input
            type="text"
            value={settings.watermarkText}
            onChange={(e) => handleChange('watermarkText', e.target.value)}
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
          />
        </div>
      </div>

      {/* Breaking News Ticker Settings */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
          <Radio className="h-4 w-4 text-red-600" />
          <span>Breaking News Flash Ticker Settings</span>
        </h3>

        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
          <div>
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block">
              Enable Red Live Breaking Banner
            </span>
            <span className="text-[11px] text-neutral-500">
              When toggled ON, articles marked with Breaking will scroll continuously at top of website.
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.breakingNewsTickerEnabled}
            onChange={(e) => handleChange('breakingNewsTickerEnabled', e.target.checked)}
            className="h-5 w-5 accent-red-600 rounded"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
            Ticker Scroll Speed: {settings.tickerSpeed} seconds
          </label>
          <input
            type="range"
            min="10"
            max="40"
            value={settings.tickerSpeed}
            onChange={(e) => handleChange('tickerSpeed', Number(e.target.value))}
            className="w-full accent-red-600"
          />
        </div>
      </div>

      {/* Contact & Editorial Desk Details */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
          <Mail className="h-4 w-4 text-red-600" />
          <span>Editorial Bureau Contact Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Editorial Email
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Newsroom Hotline Phone
            </label>
            <input
              type="text"
              value={settings.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
            Media Headquarters Address
          </label>
          <textarea
            rows={2}
            value={settings.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
          />
        </div>
      </div>

      {/* Social Media Links */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
          <Share2 className="h-4 w-4 text-red-600" />
          <span>Social Media Channels</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              YouTube Channel
            </label>
            <input
              type="url"
              value={settings.youtubeUrl}
              onChange={(e) => handleChange('youtubeUrl', e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Twitter / X Handle
            </label>
            <input
              type="url"
              value={settings.twitterUrl}
              onChange={(e) => handleChange('twitterUrl', e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Facebook Page
            </label>
            <input
              type="url"
              value={settings.facebookUrl}
              onChange={(e) => handleChange('facebookUrl', e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Telegram Broadcast
            </label>
            <input
              type="url"
              value={settings.telegramUrl}
              onChange={(e) => handleChange('telegramUrl', e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
};

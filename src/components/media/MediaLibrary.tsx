import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Copy,
  Trash2,
  Check,
  Search,
  ExternalLink,
  Eye,
  Loader2,
  FileImage,
} from 'lucide-react';
import { MediaItem } from '../../types/news';
import { api } from '../../lib/api';

interface MediaLibraryProps {
  media: MediaItem[];
  onRefresh: () => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ media, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const filteredMedia = media.filter(
    (m) =>
      (m.title && m.title.toLowerCase().includes(search.toLowerCase())) ||
      m.filename.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      await api.uploadMedia(formData);
      onRefresh();
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (item: MediaItem) => {
    const fullUrl = item.url.startsWith('http')
      ? item.url
      : `${window.location.origin}${item.url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.deleteMedia(id);
        onRefresh();
      } catch (err: any) {
        alert(`Failed to delete media: ${err.message}`);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-neutral-900 p-6 text-white border border-neutral-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">
              Newsroom Assets
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">
            Media Library (मीडिया गैलरी)
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Upload and organize high-resolution news photographs, charts, and wire photos.
          </p>
        </div>

        <label className="cursor-pointer flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition-all self-start sm:self-auto">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span>{uploading ? 'Uploading...' : 'Upload Media Files'}</span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleUpload(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
          dragActive
            ? 'border-red-600 bg-red-50/50 dark:bg-red-950/20'
            : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
            <FileImage className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Drag & Drop News Photos Here
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm">
            Or browse from your device. Files will be saved directly into the Fastzlive server media repository.
          </p>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search images by name or caption..."
            className="w-full bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-300 dark:border-neutral-700 pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
          />
        </div>
        <span className="text-xs font-semibold text-neutral-500">
          Showing {filteredMedia.length} of {media.length} files
        </span>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMedia.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs hover:border-red-500 transition-all flex flex-col justify-between"
          >
            <div className="relative h-36 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <img
                src={item.url}
                alt={item.title || item.filename}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setPreviewItem(item)}
                  className="rounded-full bg-white/90 p-1.5 text-neutral-900 hover:bg-white"
                  title="View Image"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleCopyUrl(item)}
                  className="rounded-full bg-white/90 p-1.5 text-neutral-900 hover:bg-white"
                  title="Copy URL"
                >
                  {copiedId === item.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.filename)}
                  className="rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-3 space-y-1">
              <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                {item.title || item.filename}
              </p>
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span>{formatFileSize(item.size)}</span>
                <span>
                  {new Date(item.uploadedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl bg-neutral-900 overflow-hidden flex flex-col items-center">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-3 right-3 rounded-full bg-black/60 text-white p-2 hover:bg-black"
            >
              ✕
            </button>
            <img
              src={previewItem.url}
              alt={previewItem.title || previewItem.filename}
              className="max-h-[75vh] w-auto object-contain"
            />
            <div className="w-full bg-black/90 p-3 flex items-center justify-between text-xs text-white">
              <span className="truncate max-w-md font-mono">{previewItem.filename}</span>
              <button
                onClick={() => handleCopyUrl(previewItem)}
                className="flex items-center gap-1 rounded bg-red-600 px-3 py-1 text-xs font-bold"
              >
                {copiedId === previewItem.id ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

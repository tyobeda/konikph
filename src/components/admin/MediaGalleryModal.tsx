'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Upload,
  Image as ImageIcon,
  Check,
  Loader2,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { getMediaGalleryItems, MediaGalleryItem } from '@/actions/media';

interface MediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'thumbnail' | 'insert';
  onSelect: (result: { url: string; caption?: string; align?: 'center' | 'left' | 'right' }) => void;
}

export function MediaGalleryModal({
  isOpen,
  onClose,
  mode,
  onSelect,
}: MediaGalleryModalProps) {
  const [items, setItems] = useState<MediaGalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState<'all' | 'upload' | 'artwork' | 'news'>('all');

  // Selected item state
  const [selectedItem, setSelectedItem] = useState<MediaGalleryItem | null>(null);
  const [caption, setCaption] = useState('');
  const [align, setAlign] = useState<'center' | 'left' | 'right'>('center');

  // Direct Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
      setSelectedItem(null);
      setCaption('');
      setUploadError(null);
    }
  }, [isOpen]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await getMediaGalleryItems();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        const newItem: MediaGalleryItem = {
          id: `new-${Date.now()}`,
          url: data.url,
          title: file.name,
          source: 'upload',
          createdAt: new Date().toISOString(),
        };
        setItems((prev) => [newItem, ...prev]);
        setSelectedItem(newItem);
        setActiveTab('gallery');
      } else {
        setUploadError(data.error || 'Gagal mengunggah berkas.');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Terjadi kesalahan saat unggah.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleConfirm = () => {
    if (!selectedItem) return;
    onSelect({
      url: selectedItem.url,
      caption: caption.trim() || undefined,
      align,
    });
    onClose();
  };

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    const matchSearch =
      search === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.url.toLowerCase().includes(search.toLowerCase());
    const matchSource = filterSource === 'all' || item.source === filterSource;
    return matchSearch && matchSource;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl w-full max-w-4xl h-[90vh] max-h-[750px] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center">
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {mode === 'thumbnail' ? 'Pilih Gambar Thumbnail Berita' : 'Sisipkan Foto ke Dalam Artikel'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih foto dari galeri media atau unggah foto baru dari perangkat Anda.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab & Filter Bar */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'gallery'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Galeri Foto ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Upload size={13} />
              <span>Unggah Foto Baru</span>
            </button>
          </div>

          {/* Search Input when in Gallery */}
          {activeTab === 'gallery' && (
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <div className="relative w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama berkas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Main Gallery Area */}
          <div className="lg:col-span-8 p-4 overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 h-full">
            {activeTab === 'upload' ? (
              <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mb-4">
                  {uploading ? <Loader2 size={28} className="animate-spin" /> : <Upload size={28} />}
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {uploading ? 'Sedang Mengunggah Berkas...' : 'Pilih Foto dari Komputer Anda'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">
                  Format gambar JPG, PNG, atau WebP (Maksimal 5MB). Foto yang diunggah akan otomatis tersimpan di galeri media.
                </p>

                {uploadError && (
                  <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
                    {uploadError}
                  </div>
                )}

                <label className="cursor-pointer px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2">
                  <Upload size={14} />
                  <span>Pilih Berkas Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            ) : loading ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                <Loader2 size={24} className="animate-spin text-red-600 mb-2" />
                <span>Memuat galeri media...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6">
                <ImageIcon size={36} className="text-slate-300 dark:text-slate-700 mb-2" />
                <p className="font-bold text-slate-600 dark:text-slate-300">Tidak ada foto yang ditemukan</p>
                <p className="text-[11px] mt-0.5">Unggah foto baru lewat tab "Unggah Foto Baru".</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {filteredItems.map((item) => {
                  const isSelected = selectedItem?.url === item.url;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                        isSelected
                          ? 'border-red-600 ring-4 ring-red-600/20 shadow-lg'
                          : 'border-slate-200 dark:border-slate-800 hover:border-red-400'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Selected Checkmark Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}

                      {/* Title overlay on hover */}
                      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white font-medium truncate">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar: Selected Preview & Caption Settings */}
          <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-slate-50/30 dark:bg-slate-900/20 overflow-y-auto">
            {selectedItem ? (
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Pratinjau Foto Terpilih
                </h4>

                <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm">
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white truncate">
                    {selectedItem.title}
                  </p>
                  <p className="text-[11px] text-slate-400 break-all truncate">
                    {selectedItem.url}
                  </p>
                </div>

                {/* Caption Input for Insert Mode */}
                {mode === 'insert' && (
                  <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Keterangan Foto (Caption):
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Suasana pembukaan kejuaraan di GOR Tebat Monok..."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Caption akan tampil di bawah foto artikel dengan format rapi.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Posisi Gambar:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setAlign('center')}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                            align === 'center'
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <AlignCenter size={14} />
                          <span>Tengah</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAlign('left')}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                            align === 'left'
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <AlignLeft size={14} />
                          <span>Kiri</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAlign('right')}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                            align === 'right'
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <AlignRight size={14} />
                          <span>Kanan</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ImageIcon size={32} className="mb-2 opacity-40" />
                <p className="text-xs font-semibold">Pilih salah satu gambar di galeri</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Klik foto untuk melihat pratinjau dan menyetelnya.
                </p>
              </div>
            )}

            {/* Confirmation Action Button */}
            <div className="pt-4 mt-auto border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedItem}
                className="w-2/3 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Check size={16} />
                <span>{mode === 'thumbnail' ? 'Gunakan Sebagai Thumbnail' : 'Sisipkan ke Artikel'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  ArrowLeft,
  Download,
  Heart,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  FolderPlus,
  Calendar,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { ArtworkCard } from '@/components/ArtworkCard';
import { useData } from '@/context/DataContext';
import { Artwork } from '@/lib/types';
import { ARTWORK_CATEGORIES } from '@/lib/data';
import { ConfirmUnsavedModal } from '@/components/ConfirmUnsavedModal';

export default function MyArtworksPage() {
  const router = useRouter();
  const { artworks, currentUser, updateArtwork, deleteArtwork } = useData();

  // Filter artworks created by current logged user
  const myArtworks = artworks.filter(
    (art) => currentUser && (art.author.email === currentUser.email || art.author.name === currentUser.name)
  );

  const [filterTab, setFilterTab] = useState<'all' | 'Disetujui' | 'Pending' | 'Ditolak' | 'Dihapus'>('all');
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editFormat, setEditFormat] = useState('Hanya gambar');
  const [editDownloadUrl, setEditDownloadUrl] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus karya postingan ini?')) {
      deleteArtwork(id);
    }
  };

  const [initialEditSnapshot, setInitialEditSnapshot] = useState<string>('');

  const handleOpenEdit = (art: Artwork) => {
    setEditingArtwork(art);
    const titleVal = art.title;
    const descVal = art.description || '';
    const catVal = art.category;
    const formatVal = art.format || 'Hanya gambar';
    const dlVal = art.downloadUrl || '';

    // Parse date & time from art.createdAt
    const createdDateObj = new Date(art.createdAt || Date.now());
    const yyyy = createdDateObj.getFullYear();
    const mm = String(createdDateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(createdDateObj.getDate()).padStart(2, '0');
    const hh = String(createdDateObj.getHours()).padStart(2, '0');
    const min = String(createdDateObj.getMinutes()).padStart(2, '0');
    const dateVal = `${yyyy}-${mm}-${dd}`;
    const timeVal = `${hh}:${min}`;

    setEditTitle(titleVal);
    setEditDescription(descVal);
    setEditCategory(catVal);
    setEditFormat(formatVal);
    setEditDownloadUrl(dlVal);
    setEditDate(dateVal);
    setEditTime(timeVal);

    setInitialEditSnapshot(JSON.stringify({
      title: titleVal,
      desc: descVal,
      cat: catVal,
      fmt: formatVal,
      dl: dlVal,
      date: dateVal,
      time: timeVal,
    }));
  };

  const isFormDirty = () => {
    const currentSnapshot = JSON.stringify({
      title: editTitle,
      desc: editDescription,
      cat: editCategory,
      fmt: editFormat,
      dl: editDownloadUrl,
      date: editDate,
      time: editTime,
    });
    return currentSnapshot !== initialEditSnapshot;
  };

  const handleAttemptCloseModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isFormDirty()) {
      setShowUnsavedModal(true);
      return;
    }
    setEditingArtwork(null);
  };

  const handleDiscardChanges = () => {
    setShowUnsavedModal(false);
    setEditingArtwork(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtwork) return;

    // Auto extract hashtags from description field (words starting with #)
    const hashtagsFromDesc = (editDescription.match(/#[a-zA-Z0-9_-]+/g) || []).map((t) => t.trim());
    const parsedTags = Array.from(new Set(hashtagsFromDesc));

    let updatedCreatedAt: string | undefined = undefined;
    if (editDate && editTime) {
      updatedCreatedAt = new Date(`${editDate}T${editTime}`).toISOString();
    } else if (editDate) {
      updatedCreatedAt = new Date(editDate).toISOString();
    }

    updateArtwork(editingArtwork.id, {
      title: editTitle,
      description: editDescription,
      category: editCategory,
      format: editFormat,
      downloadUrl: editFormat === 'Hanya gambar' ? '' : editDownloadUrl,
      tags: parsedTags,
      ...(updatedCreatedAt ? { createdAt: updatedCreatedAt as any } : {}),
    });
    setEditingArtwork(null);
  };

  const filteredItems = myArtworks.filter((art) => {
    if (filterTab === 'all') return true;
    return art.status === filterTab;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#F26522] mb-1 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Kembali</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              Kelola Postingan Karya Saya
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Daftar desain poster, spanduk, dan templat yang pernah Anda unggah ke PKSart.
            </p>
          </div>

          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Unggah Karya Baru</span>
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase">Total Karya</p>
            <p className="text-xl font-black text-gray-900 mt-1">{myArtworks.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-emerald-600 uppercase">Disetujui</p>
            <p className="text-xl font-black text-emerald-600 mt-1">
              {myArtworks.filter((a) => a.status === 'Disetujui').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-amber-600 uppercase">Pending</p>
            <p className="text-xl font-black text-amber-600 mt-1">
              {myArtworks.filter((a) => a.status === 'Pending').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-[#F26522] uppercase">Total Unduhan</p>
            <p className="text-xl font-black text-[#F26522] mt-1">
              {myArtworks.reduce((acc, curr) => acc + curr.downloadsCount, 0)}x
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3 overflow-x-auto">
          {(['all', 'Disetujui', 'Pending', 'Ditolak', 'Dihapus'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
                filterTab === tab
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab === 'all' ? 'Semua Karya' : tab}
            </button>
          ))}
        </div>

        {/* Artworks Feed Grid Container */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((artwork) => (
              <div key={artwork.id} className="relative group">
                {/* Status Badge Overlay (Bottom Left of Thumbnail) */}
                <div className="absolute bottom-16 left-3 z-30 pointer-events-none">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md backdrop-blur-md ${
                      artwork.status === 'Disetujui'
                        ? 'bg-emerald-500/95 text-white'
                        : artwork.status === 'Pending'
                        ? 'bg-amber-500/95 text-white'
                        : 'bg-red-500/95 text-white'
                    }`}
                  >
                    {artwork.status === 'Disetujui' && <CheckCircle2 size={11} />}
                    {artwork.status === 'Pending' && <Clock size={11} />}
                    {artwork.status === 'Ditolak' && <XCircle size={11} />}
                    <span>{artwork.status}</span>
                  </span>
                </div>

                {/* Edit & Delete Quick Action Floating Overlay */}
                <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenEdit(artwork);
                    }}
                    className="p-2 bg-white/90 hover:bg-white text-blue-600 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95"
                    title="Edit Postingan Karya"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(artwork.id);
                    }}
                    className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95"
                    title="Hapus Postingan Karya"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Standard Feed Artwork Card */}
                <ArtworkCard artwork={artwork} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <FolderPlus size={48} className="mx-auto text-gray-300 mb-3 stroke-1" />
            <h3 className="text-base font-bold text-gray-800">
              {filterTab === 'Pending' ? 'Tidak ada karya yang pending' :
               filterTab === 'Ditolak' ? 'Tidak ada karya yang ditolak' :
               filterTab === 'Dihapus' ? 'Tidak ada karya yang dihapus' :
               'Belum Ada Karya'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {filterTab === 'all' || filterTab === 'Disetujui' ? 'Unggah karya desain baru Anda untuk mulai membagikannya kepada kader PKS.' : 'Tidak ada data untuk kategori ini saat ini.'}
            </p>
            {(filterTab === 'all' || filterTab === 'Disetujui') && (
              <Link
                href="/upload"
                className="inline-block mt-4 px-4 py-2 bg-[#F26522] text-white text-xs font-bold rounded-xl shadow-md"
              >
                Unggah Karya Sekarang
              </Link>
            )}
          </div>
        )}

        {/* Edit Artwork Modal */}
        {editingArtwork && (
          <div
            onClick={handleAttemptCloseModal}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 cursor-default max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h3 className="text-xl font-extrabold text-gray-900">
                  Edit Postingan Karya
                </h3>
                <button
                  type="button"
                  onClick={handleAttemptCloseModal}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors font-bold text-base"
                  title="Tutup Modal"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Judul Karya
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#F26522]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <span>Deskripsi Karya</span>
                    <span className="text-[11px] font-normal text-[#F26522] lowercase">Hashtag dapat diketik langsung di sini (contoh: #PKS #JawaBarat)</span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={1500}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                  />
                  <div className="flex justify-end mt-1">
                    <span className={`text-[11px] font-semibold ${editDescription.length >= 1500 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                      {editDescription.length}/1500 karakter
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Kategori
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                  >
                    {ARTWORK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Tanggal & Jam Karya (2 Kolom 1 Baris pada Mobile) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Tanggal Karya
                    </label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-8 pr-2 py-2 text-xs font-semibold focus:outline-none focus:border-[#F26522] cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Jam Karya
                    </label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                      <input
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-8 pr-2 py-2 text-xs font-semibold focus:outline-none focus:border-[#F26522] cursor-pointer"
                        required
                      />
                    </div>
                  </div>
                </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Format File Master
                    </label>
                    <select
                      value={editFormat}
                      onChange={(e) => setEditFormat(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                    >
                      <option value="Hanya gambar">Hanya gambar (Tanpa File Master)</option>
                      <option value="PSD">PSD (Photoshop)</option>
                      <option value="AI">AI (Illustrator)</option>
                      <option value="CDR">CDR (CorelDraw)</option>
                    </select>
                  </div>

                {editFormat !== 'Hanya gambar' && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex flex-col gap-0.5">
                      <span>Tautan File Master / Tautan Berbagi</span>
                      <span className="text-[11px] font-normal text-gray-500 lowercase">(Misal: Link Canva, Google Drive, dll.)</span>
                    </label>
                    <input
                      type="text"
                      value={editDownloadUrl}
                      onChange={(e) => setEditDownloadUrl(e.target.value)}
                      placeholder="Contoh: https://canva.com/... atau https://drive.google.com/..."
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={handleAttemptCloseModal}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}

        {/* Confirm Unsaved Changes Modal */}
        <ConfirmUnsavedModal
          isOpen={showUnsavedModal}
          onDiscard={handleDiscardChanges}
          onKeepEditing={() => setShowUnsavedModal(false)}
        />

      </main>
    </div>
  );
}

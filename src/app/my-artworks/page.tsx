'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Header } from '@/components/Header';
import { useData } from '@/context/DataContext';
import { Artwork } from '@/lib/types';

export default function MyArtworksPage() {
  const router = useRouter();
  const { artworks, currentUser, updateArtwork, deleteArtwork } = useData();

  // Filter artworks created by current logged user
  const myArtworks = artworks.filter(
    (art) => currentUser && (art.author.email === currentUser.email || art.author.name === currentUser.name)
  );

  const [filterTab, setFilterTab] = useState<'all' | 'Disetujui' | 'Pending' | 'Ditolak'>('all');
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus karya postingan ini?')) {
      deleteArtwork(id);
    }
  };

  const handleOpenEdit = (art: Artwork) => {
    setEditingArtwork(art);
    setEditTitle(art.title);
    setEditCategory(art.category);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtwork) return;

    updateArtwork(editingArtwork.id, { title: editTitle, category: editCategory });
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
          {(['all', 'Disetujui', 'Pending', 'Ditolak'] as const).map((tab) => (
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

        {/* Artworks List Container */}
        <div className="space-y-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((artwork) => (
              <div
                key={artwork.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-gray-200"
              >
                {/* Left Thumbnail & Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {artwork.category}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          artwork.status === 'Disetujui'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : artwork.status === 'Pending'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}
                      >
                        {artwork.status === 'Disetujui' && <CheckCircle2 size={12} />}
                        {artwork.status === 'Pending' && <Clock size={12} />}
                        {artwork.status === 'Ditolak' && <XCircle size={12} />}
                        <span>{artwork.status}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mt-1">
                      {artwork.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mt-1">
                      <span className="flex items-center gap-1">
                        <Download size={14} className="text-gray-400" />
                        <span>{artwork.downloadsCount} Unduhan</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={14} className="text-red-400" />
                        <span>{artwork.likesCount} Sukai</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Link
                    href={`/artwork/${artwork.id}`}
                    className="p-2 text-gray-600 hover:text-[#F26522] hover:bg-orange-50 rounded-xl transition-colors"
                    title="Lihat Halaman Postingan"
                  >
                    <Eye size={18} />
                  </Link>

                  <button
                    onClick={() => handleOpenEdit(artwork)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Edit Postingan"
                  >
                    <Edit3 size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(artwork.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Hapus Postingan"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <FolderPlus size={48} className="mx-auto text-gray-300 mb-3 stroke-1" />
              <h3 className="text-base font-bold text-gray-800">Belum Ada Karya dalam Kategori Ini</h3>
              <p className="text-xs text-gray-500 mt-1">
                Unggah karya karya desain baru Anda untuk mulai membagikannya kepada kader PKS.
              </p>
              <Link
                href="/upload"
                className="inline-block mt-4 px-4 py-2 bg-[#F26522] text-white text-xs font-bold rounded-xl"
              >
                Unggah Karya Sekarang
              </Link>
            </div>
          )}
        </div>

        {/* Edit Artwork Modal */}
        {editingArtwork && (
          <div
            onClick={() => setEditingArtwork(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 cursor-default"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Edit Postingan Karya
              </h3>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Judul Karya
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#F26522]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Kategori
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-[#F26522]"
                  >
                    <option value="Poster">Poster</option>
                    <option value="Spanduk">Spanduk</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Infografis">Infografis</option>
                    <option value="Templat">Templat</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingArtwork(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

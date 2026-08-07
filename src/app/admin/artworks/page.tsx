'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Image as ImageIcon,
  Users,
  Building,
  Settings,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Edit,
  Star,
  Download,
  ArrowUpRight,
  Filter,
  Flag,
  AlertTriangle,
} from 'lucide-react';
import { PksLogo } from '@/components/PksLogo';
import { useData } from '@/context/DataContext';
import { Artwork } from '@/lib/types';
import { ARTWORK_CATEGORIES } from '@/lib/data';

export default function AdminArtworksPage() {
  const { artworks, updateArtwork, deleteArtwork, artworkReports, resolveArtworkReport } = useData();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'reports'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);

  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editRegion, setEditRegion] = useState('');

  const pendingArtworksCount = artworks.filter((a) => (a as any).status === 'Pending').length;
  const pendingReportsCount = artworkReports.filter((r) => r.status === 'Pending').length;

  const handleApprove = (id: string) => {
    updateArtwork(id, { status: 'Disetujui' } as any);
  };

  const handleReject = (id: string) => {
    updateArtwork(id, { status: 'Ditolak' } as any);
  };

  const handleToggleFeatured = (id: string, current?: boolean) => {
    updateArtwork(id, { isFeatured: !current });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus karya ini dari sistem?')) {
      deleteArtwork(id);
    }
  };

  const handleOpenEdit = (art: Artwork) => {
    setEditingArtwork(art);
    setEditTitle(art.title);
    setEditCategory(art.category);
    setEditRegion(art.region);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtwork) return;

    updateArtwork(editingArtwork.id, { title: editTitle, category: editCategory, region: editRegion });
    setEditingArtwork(null);
  };

  const filteredArtworks = artworks.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || art.category === filterCategory;
    
    let matchesStatus = true;
    if (activeTab === 'pending') {
      matchesStatus = (art as any).status === 'Pending';
    } else if (filterStatus !== 'all') {
      matchesStatus = (art as any).status === filterStatus;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredReports = artworkReports.filter(
    (r) =>
      r.artworkTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = activeTab === 'reports' ? filteredReports.length : filteredArtworks.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterCategory, activeTab]);

  const paginatedArtworks = filteredArtworks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <ImageIcon className="text-[#F26522]" />
              <span>Kelola & Moderasi Karya</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Moderasi unggahan karya desainer, edit metadata, jadikan pilihan utama (featured), atau hapus karya.
            </p>
          </div>

          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F26522] hover:bg-[#d85517] text-white text-sm font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus size={18} />
            <span>Tambah Karya Baru</span>
          </Link>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 mb-6 gap-6 text-sm font-bold overflow-x-auto">
          <button
            onClick={() => { setActiveTab('all'); setFilterStatus('all'); }}
            className={`pb-3 relative transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'text-[#F26522] border-b-2 border-[#F26522]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>Semua Karya ({artworks.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('pending'); setFilterStatus('Pending'); }}
            className={`pb-3 relative transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'text-[#F26522] border-b-2 border-[#F26522]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>⏳ Menunggu Approval</span>
            {pendingArtworksCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                {pendingArtworksCount} Karya Baru
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 relative transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'text-[#F26522] border-b-2 border-[#F26522]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>🚩 Laporan Masuk</span>
            {pendingReportsCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                {pendingReportsCount}
              </span>
            )}
          </button>
        </div>

        {/* Table Filter Container */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-extrabold text-gray-900">
                {activeTab === 'reports' ? 'Daftar Laporan Karya' : 'Daftar Postingan Karya'}
              </h2>
              <span className="bg-orange-50 text-[#F26522] text-xs font-bold px-2.5 py-1 rounded-full border border-orange-100">
                {totalItems} Hasil
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeTab === 'reports' ? "Cari judul karya atau alasan..." : "Cari judul karya atau uploader..."}
                  className="w-full bg-gray-50 text-sm rounded-xl pl-9 pr-4 py-2 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
                />
              </div>

              {activeTab !== 'reports' && (
                <>
                  {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#F26522]"
              >
                <option value="all">Semua Kategori</option>
                {ARTWORK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#F26522]"
              >
                <option value="all">Semua Status</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Pending">Pending</option>
                <option value="Ditolak">Ditolak</option>
              </select>
                </>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                {activeTab === 'reports' ? (
                  <tr>
                    <th className="py-3.5 px-4">Karya Dilaporkan</th>
                    <th className="py-3.5 px-4">Alasan Pelaporan</th>
                    <th className="py-3.5 px-4">Tanggal Masuk</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Tindakan Admin</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="py-3.5 px-4">Artwork & Title</th>
                    <th className="py-3.5 px-4">Kategori & DPW</th>
                    <th className="py-3.5 px-4">Uploader / Desainer</th>
                    <th className="py-3.5 px-4">Format File</th>
                    <th className="py-3.5 px-4">Unduhan</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Tindakan Admin</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeTab === 'reports' ? (
                  paginatedReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={report.artworkImageUrl}
                            alt={report.artworkTitle}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-gray-900 max-w-xs truncate">
                              {report.artworkTitle}
                            </p>
                            <Link href={`/artwork/${report.artworkId}`} target="_blank" className="text-xs text-[#F26522] font-semibold hover:underline flex items-center gap-0.5 mt-0.5">
                              Lihat Karya <ArrowUpRight size={12} />
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-sm font-medium text-gray-800 bg-red-50 p-2 rounded-lg border border-red-100 max-w-sm flex items-start gap-2">
                          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                          <span>{report.reason}</span>
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-600 text-xs">
                        {report.createdAt}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          report.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : report.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {report.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => {
                                  if (confirm('Abaikan laporan ini dan biarkan karya tetap tayang?')) {
                                    resolveArtworkReport(report.id, 'reject_report');
                                  }
                                }}
                                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-bold text-xs px-3"
                                title="Abaikan Laporan"
                              >
                                Abaikan
                              </button>
                              <button
                                onClick={() => {
                                  const msg = prompt('Masukkan alasan penghapusan karya yang akan dikirim ke uploader (opsional):');
                                  if (msg !== null) {
                                    resolveArtworkReport(report.id, 'delete_artwork');
                                    alert('Karya telah dihapus dan laporan ditutup.');
                                  }
                                }}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-bold text-xs flex items-center gap-1 shadow-sm"
                                title="Hapus Karya"
                              >
                                <Trash2 size={14} /> Hapus Karya
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  paginatedArtworks.map((art) => (
                    <tr key={art.id} className="hover:bg-gray-50/60 transition-colors">
                    
                    {/* Artwork & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={art.imageUrl}
                            alt={art.title}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                          />
                          {art.isFeatured && (
                            <span className="absolute -top-1 -right-1 bg-amber-400 text-white p-0.5 rounded-full shadow-sm" title="Karya Pilihan (Featured)">
                              <Star size={10} className="fill-white" />
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 max-w-xs truncate">
                            {art.title}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">ID: {art.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category & Region */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-800 block">{art.category}</span>
                      <span className="text-xs text-gray-500">{art.region}</span>
                    </td>

                    {/* Uploader */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={art.author.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200'}
                          alt={art.author.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <span className="font-semibold text-gray-800">{art.author.name}</span>
                      </div>
                    </td>

                    {/* Format File */}
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-gray-700">
                      {art.format || 'PSD/AI'}
                    </td>

                    {/* Downloads */}
                    <td className="py-3.5 px-4 font-semibold text-gray-700">
                      {art.downloadsCount}x
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          art.status === 'Disetujui'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : art.status === 'Pending'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            art.status === 'Disetujui'
                              ? 'bg-emerald-500'
                              : art.status === 'Pending'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        />
                        {art.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {art.status === 'Pending' && (
                          <div className="flex items-center gap-1 mr-1">
                            <button
                              onClick={() => handleApprove(art.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                              title="Setujui Karya (Publikasikan)"
                            >
                              <CheckCircle size={13} />
                              <span>Setujui</span>
                            </button>
                            <button
                              onClick={() => handleReject(art.id)}
                              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                              title="Tolak Karya"
                            >
                              <XCircle size={13} />
                              <span>Tolak</span>
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => handleToggleFeatured(art.id, art.isFeatured)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            art.isFeatured
                              ? 'text-amber-500 bg-amber-50'
                              : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                          }`}
                          title={art.isFeatured ? 'Hapus dari Pilihan Utama' : 'Jadikan Pilihan Utama (Featured)'}
                        >
                          <Star size={16} className={art.isFeatured ? 'fill-amber-500' : ''} />
                        </button>

                        <Link
                          href={`/artwork/${art.slug || art.id}`}
                          className="p-1.5 text-gray-500 hover:text-[#F26522] hover:bg-orange-50 rounded-lg transition-colors"
                          title="Lihat Detail Halaman"
                        >
                          <Eye size={16} />
                        </Link>

                        <button
                          onClick={() => handleOpenEdit(art)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Postingan"
                        >
                          <Edit size={16} />
                        </button>

                        {art.status !== 'Disetujui' && (
                          <button
                            onClick={() => handleApprove(art.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Setujui Karya"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {art.status !== 'Ditolak' && (
                          <button
                            onClick={() => handleReject(art.id)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Tolak Karya"
                          >
                            <XCircle size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(art.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Permanent"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white sm:px-6 rounded-b-3xl">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Menampilkan <span className="font-bold text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> hingga <span className="font-bold text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> dari <span className="font-bold text-gray-900">{totalItems}</span> {activeTab === 'reports' ? 'laporan' : 'karya'}
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-lg px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                          page === currentPage 
                            ? 'z-10 bg-[#F26522] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F26522]' 
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-lg px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Edit Artwork Modal */}
        {editingArtwork && (
          <div
            onClick={() => setEditingArtwork(null)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 cursor-default"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Edit Metadata Karya (Admin)
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
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#F26522]"
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
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#F26522]"
                  >
                    {ARTWORK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Wilayah / Daerah DPW
                  </label>
                  <input
                    type="text"
                    value={editRegion}
                    onChange={(e) => setEditRegion(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#F26522]"
                    required
                  />
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

    </>
  );
}

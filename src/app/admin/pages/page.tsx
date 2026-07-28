'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  X,
  Sparkles,
  Layout,
  PlusCircle,
  HelpCircle,
  Megaphone,
  AlignLeft,
  Settings,
  Eye,
  Save,
  ArrowLeft,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  Info,
  Copy
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { CustomPage } from '@/lib/types';

interface Block {
  type: 'hero' | 'text' | 'cta' | 'faq';
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  content?: string;
  description?: string;
  faqs?: { question: string; answer: string }[];
}

export default function AdminPagesPage() {
  const { customPages, addCustomPage, updateCustomPage, deleteCustomPage } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);

  // Editor states
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pagePublished, setPagePublished] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);

  // Temp faq state
  const [tempFaqQ, setTempFaqQ] = useState('');
  const [tempFaqA, setTempFaqA] = useState('');

  // active editor tab inside sidebar (Layout vs Settings)
  const [sidebarTab, setSidebarTab] = useState<'content' | 'settings'>('content');

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus halaman kustom ini?')) {
      deleteCustomPage(id);
    }
  };

  const handleOpenNewEditor = () => {
    setEditingPage(null);
    setPageTitle('');
    setPageSlug('');
    setPagePublished(true);
    setBlocks([
      {
        type: 'hero',
        title: 'Judul Utama Halaman',
        subtitle: 'Sub-judul pendukung atau deskripsi singkat.',
        ctaText: 'Pelajari Selengkapnya',
        ctaLink: '#'
      }
    ]);
    setSelectedBlockIndex(0);
    setSidebarTab('content');
    setIsEditorOpen(true);
  };

  const handleOpenEditEditor = (page: CustomPage) => {
    setEditingPage(page);
    setPageTitle(page.title);
    setPageSlug(page.slug);
    setPagePublished(page.published);
    try {
      setBlocks(JSON.parse(page.content));
    } catch (e) {
      setBlocks([]);
    }
    setSelectedBlockIndex(0);
    setSidebarTab('content');
    setIsEditorOpen(true);
  };

  const handleSavePage = () => {
    if (!pageTitle || !pageSlug) {
      alert('Judul dan Slug wajib diisi.');
      return;
    }

    const cleanSlug = pageSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    const pageData = {
      title: pageTitle,
      slug: cleanSlug,
      published: pagePublished,
      content: JSON.stringify(blocks),
    };

    if (editingPage) {
      updateCustomPage(editingPage.id, pageData);
    } else {
      addCustomPage(pageData);
    }
    setIsEditorOpen(false);
  };

  // Block handlers
  const addBlock = (type: 'hero' | 'text' | 'cta' | 'faq') => {
    const newBlock: Block = type === 'hero' 
      ? { type, title: 'Judul Hero Baru', subtitle: 'Deskripsi singkat hero block.', ctaText: 'Klik Di Sini', ctaLink: '#' }
      : type === 'text' 
      ? { type, content: '<h3 class="text-lg font-bold mb-2">Subjudul Teks</h3><p>Tulis konten teks kustom Anda di sini menggunakan format HTML standar...</p>' }
      : type === 'cta'
      ? { type, title: 'Banner Aksi Kustom', description: 'Deskripsi singkat untuk mengajak pembaca melakukan aksi tertentu.', ctaText: 'Klik Aksi', ctaLink: '#' }
      : { type, faqs: [{ question: 'Pertanyaan FAQ Baru?', answer: 'Tulis jawaban detail di sini.' }] };
    
    setBlocks([...blocks, newBlock]);
    setSelectedBlockIndex(blocks.length); // Select new block immediately
  };

  const deleteBlock = (index: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setBlocks(blocks.filter((_, idx) => idx !== index));
    setSelectedBlockIndex(null);
  };

  const moveBlock = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;
    setBlocks(newBlocks);
    setSelectedBlockIndex(targetIdx);
  };

  const updateBlockField = (index: number, field: keyof Block, value: any) => {
    setBlocks(
      blocks.map((block, idx) => 
        idx === index ? { ...block, [field]: value } : block
      )
    );
  };

  const addFaqItem = (blockIdx: number) => {
    if (!tempFaqQ || !tempFaqA) return;
    const currentFaqs = blocks[blockIdx].faqs || [];
    updateBlockField(blockIdx, 'faqs', [...currentFaqs, { question: tempFaqQ, answer: tempFaqA }]);
    setTempFaqQ('');
    setTempFaqA('');
  };

  const removeFaqItem = (blockIdx: number, faqIdx: number) => {
    const currentFaqs = blocks[blockIdx].faqs || [];
    updateBlockField(
      blockIdx, 
      'faqs', 
      currentFaqs.filter((_, idx) => idx !== faqIdx)
    );
  };

  const filteredPages = customPages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Listing View */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Layout className="text-[#F26522]" />
            <span>Page Builder & Halaman Kustom</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Buat dan edit halaman publik kustom (seperti tentang kami, panduan, syarat) menggunakan visual block-builder.
          </p>
        </div>

        <button
          onClick={handleOpenNewEditor}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus size={16} />
          <span>Buat Halaman Baru</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari halaman..."
            className="w-full bg-gray-50 text-sm rounded-xl pl-10 pr-4 py-2 border border-gray-250 text-gray-950 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30 transition-all"
          />
        </div>
        <div className="text-xs font-semibold text-gray-500">
          Total: <strong className="text-gray-900">{filteredPages.length} Halaman</strong>
        </div>
      </div>

      {/* Pages list table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6">Nama Halaman</th>
                <th className="py-4 px-6">Slug & Link</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 px-6 text-center text-gray-400 font-semibold">
                    Belum ada halaman kustom. Klik "Buat Halaman Baru" untuk memulai.
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-800">{page.title}</td>
                    <td className="py-4 px-6 text-xs font-semibold text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <span>/p/{page.slug}</span>
                        <Link 
                          href={`/p/${page.slug}`} 
                          target="_blank" 
                          className="text-[#F26522] hover:underline inline-flex items-center gap-0.5"
                        >
                          <ExternalLink size={12} />
                          <span>Buka</span>
                        </Link>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        page.published 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {page.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditEditor(page)}
                          className="p-2 bg-gray-50 hover:bg-orange-50 border border-gray-150 hover:border-orange-100 text-gray-600 hover:text-[#F26522] rounded-xl shadow-sm transition-all"
                          title="Edit Halaman"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="p-2 bg-gray-50 hover:bg-red-50 border border-gray-150 hover:border-red-100 text-gray-600 hover:text-red-500 rounded-xl shadow-sm transition-all"
                          title="Hapus Halaman"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 Elementor-Style Split Screen Page Builder Workspace */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-[#F1F5F9] flex flex-col md:flex-row overflow-hidden font-sans">
          
          {/* ================= LEFT SIDEBAR (ELEMENTOR PANEL) ================= */}
          <div className="w-full md:w-96 bg-white text-gray-800 flex flex-col border-r border-gray-250 shrink-0 h-1/2 md:h-full shadow-2xl z-30">
            
            {/* Top Toolbar Info */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#F26522] flex items-center justify-center font-black text-white text-xs">
                  P
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Visual Page Builder</h4>
                  <p className="text-xs text-gray-800 truncate max-w-[180px] font-bold">{pageTitle || 'Halaman Baru'}</p>
                </div>
              </div>

              {/* Top Navigation tabs */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setSidebarTab('content')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    sidebarTab === 'content' ? 'bg-[#F26522] text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Layout
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab('settings')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    sidebarTab === 'settings' ? 'bg-[#F26522] text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Setelan
                </button>
              </div>
            </div>

            {/* Sidebar Scrollable Editor Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              {/* TAB 1: SETTINGS TAB */}
              {sidebarTab === 'settings' && (
                <div className="space-y-4">
                  <h5 className="text-xs font-black uppercase text-gray-400 tracking-wider pb-2 border-b border-gray-200 flex items-center gap-1.5">
                    <Settings size={14} />
                    <span>Pengaturan Halaman</span>
                  </h5>
                  
                  <div>
                    <label className="block text-[10px] font-black text-gray-450 uppercase mb-1">Judul Halaman</label>
                    <input
                      type="text"
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      placeholder="Contoh: Panduan Kreator"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-450 uppercase mb-1">Slug URL (/p/your-slug)</label>
                    <input
                      type="text"
                      value={pageSlug}
                      onChange={(e) => setPageSlug(e.target.value)}
                      placeholder="contoh: panduan-kreator"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 pt-2">
                    <input
                      type="checkbox"
                      id="sidebar-published"
                      checked={pagePublished}
                      onChange={(e) => setPagePublished(e.target.checked)}
                      className="w-4.5 h-4.5 text-[#F26522] focus:ring-[#F26522] border-gray-300 rounded cursor-pointer accent-[#F26522]"
                    />
                    <label htmlFor="sidebar-published" className="text-xs font-bold text-gray-700 cursor-pointer uppercase select-none">
                      Terbitkan Halaman (Public)
                    </label>
                  </div>

                  <div className="bg-orange-50/40 p-3 rounded-xl border border-orange-100/60 text-[10px] text-gray-500 space-y-1">
                    <div className="flex items-center gap-1 text-gray-700 font-bold mb-1">
                      <Info size={12} className="text-[#F26522]" />
                      <span>Aturan Slug Halaman:</span>
                    </div>
                    <p>Slug hanya menggunakan huruf kecil, angka, dan tanda hubung (-).</p>
                    <p>Contoh: <strong>tentang-pksart</strong></p>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTENT & WIDGET BUILDER TAB */}
              {sidebarTab === 'content' && (
                <>
                  {selectedBlockIndex === null ? (
                    // SHOW WIDGET DRAWER PANEL
                    <div className="space-y-5">
                      <h5 className="text-xs font-black uppercase text-gray-400 tracking-wider pb-2 border-b border-gray-200 flex items-center gap-1.5">
                        <PlusCircle size={14} />
                        <span>Widget Elemen (Elementor)</span>
                      </h5>

                      {/* Elements toolbox grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => addBlock('hero')}
                          className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-orange-50/20 border border-gray-200 hover:border-[#F26522] rounded-2xl transition-all group text-center"
                        >
                          <Sparkles className="text-purple-500 group-hover:scale-110 transition-transform mb-2" size={24} />
                          <span className="text-xs font-extrabold block text-gray-700">Hero Header</span>
                          <span className="text-[9px] text-gray-450 mt-0.5">Headline & CTA</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => addBlock('text')}
                          className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-orange-50/20 border border-gray-200 hover:border-[#F26522] rounded-2xl transition-all group text-center"
                        >
                          <AlignLeft className="text-sky-500 group-hover:scale-110 transition-transform mb-2" size={24} />
                          <span className="text-xs font-extrabold block text-gray-700">Teks HTML</span>
                          <span className="text-[9px] text-gray-450 mt-0.5">Konten paragraf</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => addBlock('cta')}
                          className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-orange-50/20 border border-gray-200 hover:border-[#F26522] rounded-2xl transition-all group text-center"
                        >
                          <Megaphone className="text-amber-500 group-hover:scale-110 transition-transform mb-2" size={24} />
                          <span className="text-xs font-extrabold block text-gray-700">CTA Banner</span>
                          <span className="text-[9px] text-gray-450 mt-0.5">Tombol aksi</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => addBlock('faq')}
                          className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-orange-50/20 border border-gray-200 hover:border-[#F26522] rounded-2xl transition-all group text-center"
                        >
                          <HelpCircle className="text-emerald-500 group-hover:scale-110 transition-transform mb-2" size={24} />
                          <span className="text-xs font-extrabold block text-gray-700">FAQ List</span>
                          <span className="text-[9px] text-gray-450 mt-0.5">Tanya-Jawab</span>
                        </button>
                      </div>

                      {/* Outline List */}
                      <div className="space-y-2 pt-3">
                        <h6 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Struktur Halaman:</h6>
                        {blocks.length === 0 ? (
                          <p className="text-xs text-gray-500 italic">Halaman masih kosong.</p>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {blocks.map((b, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedBlockIndex(idx)}
                                className="w-full py-2.5 flex items-center justify-between text-left text-xs font-semibold text-gray-650 hover:text-[#F26522] transition-colors border-b border-gray-100"
                              >
                                <span>{idx + 1}. {b.type === 'hero' ? 'Hero Header' : b.type === 'text' ? 'Teks HTML' : b.type === 'cta' ? 'CTA Banner' : 'FAQ Accordion'}</span>
                                <span className="text-[10px] text-gray-400 italic uppercase">{b.type}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // SHOW ACTIVE BLOCK EDITOR PANEL (SETTINGS FOR SELECTED BLOCK)
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => setSelectedBlockIndex(null)}
                        className="inline-flex items-center gap-1 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-all border border-gray-150"
                      >
                        <ChevronLeft size={14} />
                        <span>Kembali ke Widget</span>
                      </button>

                      <div className="border-t border-gray-100 pt-3">
                        <h5 className="text-xs font-black uppercase text-gray-455 tracking-wider mb-3 flex items-center justify-between">
                          <span>Konfigurasi: {blocks[selectedBlockIndex].type}</span>
                          <span className="text-[10px] bg-[#F26522] text-white px-2 py-0.5 rounded">
                            Blok {selectedBlockIndex + 1}
                          </span>
                        </h5>

                        {/* RENDER FORM FIELDS DEPENDING ON SELECTED BLOCK */}
                        {blocks[selectedBlockIndex].type === 'hero' && (
                          <div className="space-y-3.5">
                            <div>
                              <label className="block text-[10px] font-black text-gray-450 uppercase mb-1">Headline Utama</label>
                              <input
                                type="text"
                                value={blocks[selectedBlockIndex].title || ''}
                                onChange={(e) => updateBlockField(selectedBlockIndex, 'title', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-gray-450 uppercase mb-1">Sub-Headline</label>
                              <textarea
                                value={blocks[selectedBlockIndex].subtitle || ''}
                                onChange={(e) => updateBlockField(selectedBlockIndex, 'subtitle', e.target.value)}
                                rows={3}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-gray-455 uppercase mb-1">Teks Tombol CTA</label>
                              <input
                                type="text"
                                value={blocks[selectedBlockIndex].ctaText || ''}
                                onChange={(e) => updateBlockField(selectedBlockIndex, 'ctaText', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-gray-455 uppercase mb-1">Link Tombol CTA</label>
                              <input
                                type="text"
                                value={blocks[selectedBlockIndex].ctaLink || ''}
                                onChange={(e) => updateBlockField(selectedBlockIndex, 'ctaLink', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                              />
                            </div>
                          </div>
                        )}

                        {blocks[selectedBlockIndex].type === 'text' && (
                          <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-455 uppercase mb-1">Teks / HTML Markup</label>
                            <textarea
                              value={blocks[selectedBlockIndex].content || ''}
                              onChange={(e) => updateBlockField(selectedBlockIndex, 'content', e.target.value)}
                              rows={12}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-800 font-mono focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                            />
                            <p className="text-[9px] text-gray-400">Anda dapat menulis tag HTML kustom seperti &lt;h2&gt;, &lt;p&gt;, atau &lt;ul&gt; untuk memformat tulisan.</p>
                          </div>
                        )}

                        {blocks[selectedBlockIndex].type === 'cta' && (
                          <div className="space-y-3.5">
                            <div>
                              <label className="block text-[10px] font-black text-gray-455 uppercase mb-1">Judul Banner</label>
                              <input
                                type="text"
                                value={blocks[selectedBlockIndex].title || ''}
                                onChange={(e) => updateBlockField(selectedBlockIndex, 'title', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-gray-455 uppercase mb-1">Pesan Deskripsi</label>
                              <textarea
                                value={blocks[selectedBlockIndex].description || ''}
                                onChange={(e) => updateBlockField(selectedBlockIndex, 'description', e.target.value)}
                                rows={3}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-gray-455 uppercase mb-1">Teks Tombol</label>
                              <input
                                type="text"
                                value={blocks[selectedBlockIndex].ctaText || ''}
                                onChange={(e) => updateBlockField(selectedBlockIndex, 'ctaText', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-gray-455 uppercase mb-1">Link Tombol</label>
                              <input
                                type="text"
                                value={blocks[selectedBlockIndex].ctaLink || ''}
                                onChange={(e) => updateBlockField(selectedBlockIndex, 'ctaLink', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                              />
                            </div>
                          </div>
                        )}

                        {blocks[selectedBlockIndex].type === 'faq' && (
                          <div className="space-y-4">
                            <label className="block text-[10px] font-black text-gray-455 uppercase">Daftar Tanya Jawab FAQ</label>
                            
                            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                              {(blocks[selectedBlockIndex].faqs || []).map((faq, fIdx) => (
                                <div key={fIdx} className="bg-gray-50 p-2.5 rounded-xl border border-gray-150 flex items-start justify-between gap-3 text-xs">
                                  <div>
                                    <p className="font-bold text-gray-800">Q: {faq.question}</p>
                                    <p className="text-gray-500 mt-0.5">A: {faq.answer}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeFaqItem(selectedBlockIndex, fIdx)}
                                    className="text-red-500 hover:text-red-650"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="border border-gray-200 p-3 rounded-xl bg-gray-50 space-y-2">
                              <p className="text-[9px] font-black uppercase text-[#F26522]">Tambah FAQ Baru:</p>
                              <input
                                type="text"
                                value={tempFaqQ}
                                onChange={(e) => setTempFaqQ(e.target.value)}
                                placeholder="Pertanyaan?"
                                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900"
                              />
                              <input
                                type="text"
                                value={tempFaqA}
                                onChange={(e) => setTempFaqA(e.target.value)}
                                placeholder="Jawaban..."
                                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900"
                              />
                              <button
                                type="button"
                                onClick={() => addFaqItem(selectedBlockIndex)}
                                className="w-full py-1.5 bg-[#F26522] text-white text-[10px] font-bold rounded-lg"
                              >
                                + Tambah Item
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Selected Block Action Controls */}
                        <div className="border-t border-gray-100 mt-4 pt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => deleteBlock(selectedBlockIndex, e)}
                            className="flex-1 py-2 bg-red-55 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl text-center transition-colors"
                          >
                            Hapus Blok
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              </div>

            {/* Sidebar Bottom Action Buttons */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-750 text-xs font-bold rounded-xl transition-all"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSavePage}
                className="flex-1 py-2.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Save size={14} />
                <span>Simpan Halaman</span>
              </button>
            </div>
          </div>

          {/* ================= RIGHT CANVAS PREVIEW (LIVE PREVIEW AREA) ================= */}
          <div className="flex-1 bg-gray-100 overflow-y-auto p-4 sm:p-8 flex justify-center items-start h-1/2 md:h-full">
            <div className="w-full max-w-3xl bg-white min-h-full rounded-2xl shadow-2xl overflow-hidden flex flex-col relative border border-slate-600/40">
              
              {/* Simulated Browser Address Bar */}
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-3 select-none text-slate-400">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="bg-white rounded-lg px-3 py-1 flex-1 text-[11px] font-semibold flex items-center justify-between border border-gray-200 shadow-inner">
                  <span className="text-slate-500 truncate">localhost:3000/p/{pageSlug || 'your-slug'}</span>
                  <Eye size={12} className="text-slate-400" />
                </div>
                <span className="text-[10px] font-extrabold uppercase text-[#F26522] bg-orange-50 border border-orange-100 px-2 py-0.5 rounded shadow-sm">
                  LIVE PREVIEW
                </span>
              </div>

              {/* LIVE BUILDER CANVAS */}
              <div className="flex-1 p-6 space-y-8 select-none">
                
                {blocks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                    <Layout size={40} className="mb-2 stroke-1" />
                    <p className="text-xs font-bold">Canvas Halaman Kosong</p>
                    <p className="text-[10px] mt-0.5">Pilih widget di panel kiri untuk mulai membangun layout halaman.</p>
                  </div>
                ) : (
                  blocks.map((block, idx) => {
                    const isSelected = selectedBlockIndex === idx;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedBlockIndex(idx)}
                        className={`group relative rounded-2xl transition-all duration-200 cursor-pointer ${
                          isSelected 
                            ? 'ring-2 ring-blue-500 ring-offset-4' 
                            : 'hover:ring-2 hover:ring-blue-400 hover:ring-offset-4'
                        }`}
                      >
                        {/* Hover/Selection Floating Label */}
                        <div className="absolute -top-3 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded shadow flex items-center gap-1.5">
                          <span>Blok {idx + 1}: {block.type}</span>
                          
                          {/* Tiny ordering actions */}
                          <div className="flex gap-0.5">
                            <button
                              type="button"
                              onClick={(e) => moveBlock(idx, 'up', e)}
                              disabled={idx === 0}
                              className="hover:bg-blue-600 p-0.5 rounded"
                            >
                              <ArrowUp size={8} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => moveBlock(idx, 'down', e)}
                              disabled={idx === blocks.length - 1}
                              className="hover:bg-blue-600 p-0.5 rounded"
                            >
                              <ArrowDown size={8} />
                            </button>
                          </div>
                        </div>

                        {/* RENDER CONTENT BLOCKS */}
                        
                        {/* 1. HERO BLOCK */}
                        {block.type === 'hero' && (
                          <div className="bg-gradient-to-br from-[#1E293B] via-slate-900 to-black text-white p-6 sm:p-10 rounded-2xl shadow-md relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-[#F26522]/10 rounded-full blur-2xl" />
                            <div className="relative z-10 space-y-2">
                              <h3 className="text-xl sm:text-2xl font-black leading-tight">{block.title || 'Judul Hero'}</h3>
                              <p className="text-xs text-slate-350 leading-relaxed">{block.subtitle || 'Sub-headline deskripsi.'}</p>
                              {block.ctaText && (
                                <span className="inline-block mt-2 px-4 py-2 bg-[#F26522] text-white text-[10px] font-bold rounded-lg shadow-sm">
                                  {block.ctaText}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 2. TEXT BLOCK */}
                        {block.type === 'text' && (
                          <div 
                            className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 text-gray-700 leading-relaxed text-xs sm:text-sm prose prose-slate max-w-none"
                            dangerouslySetInnerHTML={{ __html: block.content || '<p>Konten paragraf teks kosong.</p>' }}
                          />
                        )}

                        {/* 3. CTA BANNER */}
                        {block.type === 'cta' && (
                          <div className="bg-[#F26522]/5 border border-[#F26522]/20 rounded-2xl p-5 sm:p-6 flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-extrabold text-gray-900">{block.title || 'Banner CTA'}</h4>
                              <p className="text-[10px] text-gray-500 leading-relaxed">{block.description || 'Pesan ajakan aksi.'}</p>
                            </div>
                            {block.ctaText && (
                              <span className="px-4 py-2 bg-black text-white text-[10px] font-bold rounded-lg shrink-0">
                                {block.ctaText}
                              </span>
                            )}
                          </div>
                        )}

                        {/* 4. FAQ ACCORDION */}
                        {block.type === 'faq' && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-extrabold text-gray-900 flex items-center gap-1 px-1">
                              <HelpCircle size={14} className="text-[#F26522]" />
                              <span>Tanya Jawab (FAQ)</span>
                            </h4>
                            <div className="space-y-1.5">
                              {(block.faqs || []).map((faq, fIdx) => (
                                <div key={fIdx} className="bg-white border border-gray-100 rounded-xl p-3 text-xs space-y-1">
                                  <p className="font-bold text-gray-800">Q: {faq.question}</p>
                                  <p className="text-gray-500">A: {faq.answer}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })
                )}

              </div>
              
            </div>
          </div>

        </div>
      )}
    </>
  );
}

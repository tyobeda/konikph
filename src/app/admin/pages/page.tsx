'use client';

import React, { useState } from 'react';
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
  AlignLeft
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

  // Temp faq state for block adding
  const [tempFaqQ, setTempFaqQ] = useState('');
  const [tempFaqA, setTempFaqA] = useState('');

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
        ctaText: 'Tombol Aksi',
        ctaLink: '#'
      }
    ]);
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
    setIsEditorOpen(true);
  };

  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitle || !pageSlug) {
      alert('Judul dan Slug wajib diisi.');
      return;
    }

    // Clean slug format
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

  // Block Manipulation functions
  const addBlock = (type: 'hero' | 'text' | 'cta' | 'faq') => {
    const newBlock: Block = type === 'hero' 
      ? { type, title: 'Judul Hero Baru', subtitle: 'Deskripsi singkat hero block.', ctaText: 'Klik Di Sini', ctaLink: '#' }
      : type === 'text' 
      ? { type, content: '<p>Tulis paragraf konten teks kustom Anda di sini...</p>' }
      : type === 'cta'
      ? { type, title: 'Banner Aksi Baru', description: 'Tulis pesan ajakan bertindak untuk pengguna.', ctaText: 'Hubungi Kami', ctaLink: '#' }
      : { type, faqs: [{ question: 'Pertanyaan Baru?', answer: 'Jawaban atas pertanyaan tersebut.' }] };
    
    setBlocks([...blocks, newBlock]);
  };

  const deleteBlock = (index: number) => {
    setBlocks(blocks.filter((_, idx) => idx !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;
    setBlocks(newBlocks);
  };

  const updateBlockField = (index: number, field: keyof Block, value: any) => {
    setBlocks(
      blocks.map((block, idx) => 
        idx === index ? { ...block, [field]: value } : block
      )
    );
  };

  // FAQ block specific helper
  const addFaqItem = (blockIdx: number) => {
    if (!tempFaqQ || !tempFaqA) {
      alert('Pertanyaan dan Jawaban FAQ wajib diisi.');
      return;
    }
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
      {/* Top Header */}
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

      {/* Fullscreen Block Builder Modal Editor */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 overflow-y-auto">
          <div className="bg-white w-full h-full md:h-[95vh] md:max-w-5xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 text-[#F26522] rounded-xl">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
                    {editingPage ? 'Sunting Halaman Kustom' : 'Buat Halaman Kustom Baru'}
                  </h3>
                  <p className="text-xs text-gray-500">Gunakan blok dinamis di bawah untuk menyusun layout.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Main Content (Split Settings + Builder Canvas) */}
            <form onSubmit={handleSavePage} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                
                {/* Page Meta Settings Card */}
                <div className="bg-orange-50/40 border border-orange-100 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Judul Halaman</label>
                    <input
                      type="text"
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      placeholder="Contoh: Tentang PKSart"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#F26522]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Slug URL (/p/your-slug)</label>
                    <input
                      type="text"
                      value={pageSlug}
                      onChange={(e) => setPageSlug(e.target.value)}
                      placeholder="contoh: tentang-kami"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#F26522]"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2.5 pt-4 sm:pt-0 sm:pl-4">
                    <input
                      type="checkbox"
                      id="published"
                      checked={pagePublished}
                      onChange={(e) => setPagePublished(e.target.checked)}
                      className="w-4.5 h-4.5 text-[#F26522] focus:ring-[#F26522] border-gray-300 rounded cursor-pointer accent-[#F26522]"
                    />
                    <label htmlFor="published" className="text-xs font-bold text-gray-800 cursor-pointer uppercase select-none">
                      Terbitkan Halaman (Public)
                    </label>
                  </div>
                </div>

                {/* Blocks Workspace Canvas */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h4 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Layout size={16} className="text-gray-400" />
                      <span>Layout Blok Halaman</span>
                    </h4>
                    
                    {/* Add block action selectors */}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => addBlock('hero')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 text-[10px] font-bold rounded-lg transition-all"
                      >
                        <PlusCircle size={12} />
                        <span>+ Hero Block</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('text')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-100 text-[10px] font-bold rounded-lg transition-all"
                      >
                        <AlignLeft size={12} />
                        <span>+ Teks HTML</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('cta')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 text-[10px] font-bold rounded-lg transition-all"
                      >
                        <Megaphone size={12} />
                        <span>+ CTA Banner</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('faq')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 text-[10px] font-bold rounded-lg transition-all"
                      >
                        <HelpCircle size={12} />
                        <span>+ FAQ Accordion</span>
                      </button>
                    </div>
                  </div>

                  {/* Render list of blocks */}
                  {blocks.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs font-semibold">
                      Blok tata letak kosong. Silakan tambah blok hero, teks, atau CTA di atas.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {blocks.map((block, idx) => (
                        <div 
                          key={idx}
                          className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col sm:flex-row items-stretch"
                        >
                          {/* Block Left Control handle */}
                          <div className="bg-gray-50 border-r border-gray-150 p-3.5 flex flex-row sm:flex-col items-center justify-between sm:justify-start gap-3 shrink-0">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                              Block {idx + 1}: {block.type}
                            </span>
                            
                            <div className="flex sm:flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => moveBlock(idx, 'up')}
                                className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-800 disabled:opacity-30"
                                disabled={idx === 0}
                              >
                                <ChevronUp size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveBlock(idx, 'down')}
                                className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-800 disabled:opacity-30"
                                disabled={idx === blocks.length - 1}
                              >
                                <ChevronDown size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteBlock(idx)}
                                className="p-1 hover:bg-red-100 rounded text-red-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Block Form Editor Body */}
                          <div className="flex-1 p-4 space-y-4">
                            {/* HERO BLOCK TYPE EDITOR */}
                            {block.type === 'hero' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Headline Utama</label>
                                  <input
                                    type="text"
                                    value={block.title || ''}
                                    onChange={(e) => updateBlockField(idx, 'title', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Sub-Headline</label>
                                  <input
                                    type="text"
                                    value={block.subtitle || ''}
                                    onChange={(e) => updateBlockField(idx, 'subtitle', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Teks Tombol CTA</label>
                                  <input
                                    type="text"
                                    value={block.ctaText || ''}
                                    onChange={(e) => updateBlockField(idx, 'ctaText', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Tautan Tombol CTA Link</label>
                                  <input
                                    type="text"
                                    value={block.ctaLink || ''}
                                    onChange={(e) => updateBlockField(idx, 'ctaLink', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none"
                                  />
                                </div>
                              </div>
                            )}

                            {/* RICH TEXT EDITOR */}
                            {block.type === 'text' && (
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">HTML Konten Halaman</label>
                                <textarea
                                  value={block.content || ''}
                                  onChange={(e) => updateBlockField(idx, 'content', e.target.value)}
                                  rows={4}
                                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-semibold text-gray-950 focus:outline-none font-mono"
                                  placeholder="Contoh: <p>Tulisan Anda...</p>"
                                />
                              </div>
                            )}

                            {/* CTA BANNER EDITOR */}
                            {block.type === 'cta' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Headline Banner</label>
                                  <input
                                    type="text"
                                    value={block.title || ''}
                                    onChange={(e) => updateBlockField(idx, 'title', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Deskripsi Banner</label>
                                  <textarea
                                    value={block.description || ''}
                                    onChange={(e) => updateBlockField(idx, 'description', e.target.value)}
                                    rows={2}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-semibold text-gray-900 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Teks Tombol</label>
                                  <input
                                    type="text"
                                    value={block.ctaText || ''}
                                    onChange={(e) => updateBlockField(idx, 'ctaText', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Link Tombol</label>
                                  <input
                                    type="text"
                                    value={block.ctaLink || ''}
                                    onChange={(e) => updateBlockField(idx, 'ctaLink', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none"
                                  />
                                </div>
                              </div>
                            )}

                            {/* FAQ ACCORDION BLOCK EDITOR */}
                            {block.type === 'faq' && (
                              <div className="space-y-3">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase">Daftar Pertanyaan FAQ</label>
                                
                                {/* Current FAQ list */}
                                <div className="space-y-2">
                                  {(block.faqs || []).map((faq, faqIdx) => (
                                    <div key={faqIdx} className="bg-gray-50 p-2.5 rounded-xl border border-gray-150 flex items-start justify-between gap-4">
                                      <div className="text-xs">
                                        <p className="font-bold text-gray-800">Q: {faq.question}</p>
                                        <p className="text-gray-500 mt-0.5">A: {faq.answer}</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeFaqItem(idx, faqIdx)}
                                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                {/* Add FAQ entry form */}
                                <div className="border border-orange-100 rounded-xl p-3 bg-orange-50/20 space-y-2.5">
                                  <p className="text-[10px] font-extrabold uppercase text-[#F26522]">Tambah Pertanyaan FAQ:</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={tempFaqQ}
                                      onChange={(e) => setTempFaqQ(e.target.value)}
                                      placeholder="Pertanyaan?"
                                      className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-900"
                                    />
                                    <input
                                      type="text"
                                      value={tempFaqA}
                                      onChange={(e) => setTempFaqA(e.target.value)}
                                      placeholder="Jawaban..."
                                      className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-900"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => addFaqItem(idx)}
                                    className="px-3 py-1.5 bg-[#F26522] hover:bg-[#d85417] text-white text-[10px] font-bold rounded-lg"
                                  >
                                    + Tambah FAQ Item
                                  </button>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 sm:p-5 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-750 text-xs font-bold rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.99]"
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

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Layout,
  PlusCircle,
  Copy,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { ConfirmSuspendModal as ConfirmModal } from '@/components/ConfirmSuspendModal';

export default function AdminPagesPage() {
  const router = useRouter();
  const { customPages, deleteCustomPage, addCustomPage } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingPage, setDeletingPage] = useState<any | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleDelete = (pageItem: any) => {
    setDeletingPage(pageItem);
  };

  const confirmDeletePage = () => {
    if (deletingPage) {
      deleteCustomPage(deletingPage.id);
      setDeletingPage(null);
    }
  };

  const handleClone = (page: any) => {
    const baseSlug = page.slug.replace(/-\d+$/, '');
    const baseTitle = page.title.replace(/\s-\d+$/, '');

    let maxSuffix = 0;
    customPages.forEach((p) => {
      // Check if it matches exactly or has a dash number suffix
      if (p.slug === baseSlug && maxSuffix === 0) {
        maxSuffix = 0; // Not strictly needed, just means 0 exists
      }
      if (p.slug.startsWith(baseSlug + '-')) {
        const match = p.slug.match(new RegExp(`^${baseSlug}-(\\d+)$`));
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSuffix) maxSuffix = num;
        }
      }
    });

    const nextSuffix = maxSuffix + 1;
    const newSlug = `${baseSlug}-${nextSuffix}`;
    const newTitle = `${baseTitle} -${nextSuffix}`;

    addCustomPage({
      title: newTitle,
      slug: newSlug,
      content: page.content,
      published: false,
      useRootPath: page.useRootPath,
    });
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
          onClick={() => router.push('/admin/pages/new')}
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
                        <span>{page.useRootPath ? '' : '/p'}/{page.slug}</span>
                        <Link 
                          href={page.useRootPath ? `/${page.slug}` : `/p/${page.slug}`} 
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
                          onClick={() => handleClone(page)}
                          className="p-2 bg-gray-50 hover:bg-blue-50 border border-gray-150 hover:border-blue-100 text-gray-600 hover:text-blue-500 rounded-xl shadow-sm transition-all"
                          title="Duplikat Halaman"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/pages/${page.id}`)}
                          className="p-2 bg-gray-50 hover:bg-orange-50 border border-gray-150 hover:border-orange-100 text-gray-600 hover:text-[#F26522] rounded-xl shadow-sm transition-all"
                          title="Edit Halaman"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(page)}
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

      {/* Confirm Delete Custom Page Modal */}
      <ConfirmModal
        isOpen={!!deletingPage}
        title={`Hapus Halaman "${deletingPage?.title}"?`}
        message={`Apakah Anda yakin ingin menghapus halaman kustom "${deletingPage?.title}" ini dari sistem?`}
        confirmLabel="Ya, Hapus Halaman"
        variant="danger"
        onConfirm={confirmDeletePage}
        onCancel={() => setDeletingPage(null)}
      />
    </>
  );
}

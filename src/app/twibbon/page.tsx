'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Sparkles, 
  Image as ImageIcon, 
  Search, 
  LayoutGrid, 
  Layers, 
  Heart, 
  Plus, 
  UploadCloud, 
  X,
  CheckCircle2
} from 'lucide-react';
import { Header } from '@/components/Header';
import { useData } from '@/context/DataContext';
import { compressImageFile } from '@/lib/imageCompressor';

import { getUserTwibbonFavorites, toggleTwibbonFavorite } from '@/actions/twibbon';

export default function TwibbonGalleryPage() {
  const { twibbons, addTwibbon, currentUser, isTwibbonsLoaded } = useData();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all');

  // Add Twibbon Template Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Nasional');
  const [uploadRegion, setUploadRegion] = useState('');
  const [uploadFileUrl, setUploadFileUrl] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    if (currentUser?.id) {
      getUserTwibbonFavorites(currentUser.id).then(res => {
        if (res.success && res.data) setFavorites(res.data);
      });
    } else {
      setFavorites([]);
    }
  }, [currentUser?.id]);

  const approvedTwibbons = twibbons.filter((t) => t.status === 'Disetujui');

  const [isTogglingFavorite, setIsTogglingFavorite] = useState<string | null>(null);

  const toggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      alert('Silakan login untuk menyimpan Twibbon favorit Anda!');
      return;
    }

    if (isTogglingFavorite) return;
    setIsTogglingFavorite(id);

    // Optimistic UI Update
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

    const res = await toggleTwibbonFavorite(id, currentUser.id);
    if (!res.success) {
      // Revert if failed
      alert('Gagal memperbarui status favorit.');
      setFavorites((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }
    
    setIsTogglingFavorite(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingFile(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Upload gagal');
        setFilePreview(data.url);
        setUploadFileUrl(data.url);
      } catch (err: any) {
        alert(err.message || 'Gagal upload file PNG.');
      } finally {
        setIsUploadingFile(false);
      }
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileUrl) {
      alert('Harap unggah berkas gambar bingkai PNG terlebih dahulu.');
      return;
    }

    const res = await addTwibbon({
      title: uploadTitle,
      category: uploadCategory,
      region: uploadRegion || 'Nasional',
      imageUrl: uploadFileUrl,
      author: {
        name: currentUser?.name || 'Kreator PKSart',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      },
      status: currentUser?.role === 'Super Admin' ? 'Disetujui' : 'Pending',
      isFeatured: false,
    });

    if (res?.success === false) {
      alert(res.message || 'Terjadi kesalahan saat menambahkan Twibbon.');
      return;
    }

    setUploadSuccess(true);
    setTimeout(() => {
      setIsUploadModalOpen(false);
      setUploadSuccess(false);
      setUploadTitle('');
      setUploadRegion('');
      setUploadFileUrl('');
      setFilePreview(null);
    }, 2000);
  };

  const filteredTwibbons = approvedTwibbons.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeFilter === 'all' || favorites.includes(t.id);
    return matchesSearch && matchesTab;
  });



  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Top Title & Header */}
        <div className="border-b border-gray-200 pb-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <LayoutGrid size={24} className="text-[#F26522]" />
              <span>Galeri Bingkai Twibbon PKS</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Pilih bingkai twibbon resmi PKS dari berbagai wilayah untuk mempercantik foto profil media sosial Anda.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 flex-wrap">
            {/* Create Template Twibbon Button */}
            <button
              onClick={() => {
                if (!currentUser) {
                  router.push('/login?redirect=/twibbon');
                } else {
                  setIsUploadModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus size={16} />
              <span>Buat Template Twibbon</span>
            </button>

            {/* Search bar */}
            <div className="relative flex-1 md:max-w-xs">
              <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari bingkai twibbon..."
                className="w-full bg-white text-sm rounded-xl pl-10 pr-4 py-2.5 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30 shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-gray-200 mb-6 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveFilter('all')}
            className={`pb-3 relative transition-all ${
              activeFilter === 'all'
                ? 'text-[#F26522] border-b-2 border-[#F26522]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              Semua Bingkai
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeFilter === 'all' ? 'bg-orange-100 text-[#F26522]' : 'bg-gray-100 text-gray-600'}`}>
                {approvedTwibbons.length}
              </span>
            </span>
          </button>
          <button
            onClick={() => setActiveFilter('favorites')}
            className={`pb-3 relative transition-all flex items-center gap-1.5 ${
              activeFilter === 'favorites'
                ? 'text-[#F26522] border-b-2 border-[#F26522]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Heart size={14} className={activeFilter === 'favorites' ? 'fill-[#F26522]' : ''} />
            <span className="flex items-center gap-1.5">
              Favorit Saya
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeFilter === 'favorites' ? 'bg-orange-100 text-[#F26522]' : 'bg-gray-100 text-gray-600'}`}>
                {isMounted ? approvedTwibbons.filter(t => favorites.includes(t.id)).length : 0}
              </span>
            </span>
          </button>
        </div>

        {/* Twibbons Grid list */}
        {!isMounted || (!isTwibbonsLoaded && twibbons.length === 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-[320px] animate-pulse flex flex-col"
              >
                <div className="bg-gray-100 aspect-square w-full" />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                  <div className="h-8 bg-gray-150 rounded-xl w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTwibbons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-150 shadow-sm p-6 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-purple-50 text-[#F26522] rounded-full flex items-center justify-center mb-4 shadow-sm">
              <ImageIcon size={30} />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {activeFilter === 'favorites' ? 'Belum Ada Twibbon Favorit' : 'Tidak Ada Bingkai Twibbon'}
            </h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              {activeFilter === 'favorites' 
                ? 'Klik ikon hati pada bingkai twibbon di galeri untuk menambahkannya ke favorit Anda.'
                : 'Tidak ada bingkai twibbon yang cocok dengan kata kunci pencarian Anda saat ini.'}
            </p>
            {activeFilter === 'favorites' ? (
              <button
                onClick={() => setActiveFilter('all')}
                className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all"
              >
                Lihat Semua Bingkai
              </button>
            ) : (
              <button
                onClick={() => setSearchQuery('')}
                className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTwibbons.map((tw) => (
              <div 
                key={tw.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col relative"
              >
                {/* Favorite Heart Toggle Button Overlay */}
                <button
                  onClick={(e) => toggleFavorite(tw.id, e)}
                  className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md text-gray-400 hover:text-red-500 transition-all active:scale-90"
                  title={favorites.includes(tw.id) ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
                >
                  <Heart 
                    size={16} 
                    className={favorites.includes(tw.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} 
                  />
                </button>

                {/* Checkered pattern background for transparent twibbons */}
                <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center p-6 border-b border-gray-50/80 overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-5 pointer-events-none" 
                    style={{
                      backgroundImage: 'radial-gradient(#000 15%, transparent 16%), radial-gradient(#000 15%, transparent 16%)',
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 8px 8px'
                    }}
                  />
                  <img
                    src={tw.imageUrl}
                    alt={tw.title}
                    className="w-full h-full object-contain drop-shadow-md group-hover:scale-[1.03] transition-transform duration-300"
                  />
                  <span className="absolute bottom-3 left-3 bg-black/65 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {tw.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-[#F26522] transition-colors leading-snug line-clamp-1">
                      {tw.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">
                      Wilayah: {tw.region}
                    </p>
                    
                    {/* Used count */}
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 mt-2">
                      <Layers size={10} />
                      <span>{tw.usedCount || 0}x digunakan</span>
                    </span>
                  </div>

                  <Link
                    href={`/twibbon/${tw.id}`}
                    className="w-full mt-4 py-2.5 bg-[#F26522] hover:bg-[#d85417] text-white text-center text-xs font-bold rounded-xl shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={13} />
                    <span>Gunakan Bingkai</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Upload Twibbon Template Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-150 relative">
            <button 
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-1.5">
              <Plus size={18} className="text-[#F26522]" />
              <span>Buat Template Twibbon Baru</span>
            </h3>

            {uploadSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-base font-bold text-gray-900">Template Berhasil Diajukan!</h4>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                  Template twibbon baru Anda berhasil dibuat. Silakan tunggu peninjauan dan persetujuan dari Super Admin agar tampil di galeri.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Judul Template Twibbon
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Contoh: Twibbon Milad PKS 26"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Unggah Bingkai Gambar PNG (Harus Transparan)
                  </label>
                  
                  <label className="border-2 border-dashed border-purple-200 hover:border-[#F26522] bg-purple-50/50 hover:bg-orange-50/10 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
                    <input
                      type="file"
                      accept="image/png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {filePreview ? (
                      <div className="w-full flex flex-col items-center gap-2">
                        <img
                          src={filePreview}
                          alt="Preview Upload"
                          className="w-full max-h-40 aspect-square rounded-xl object-contain border border-purple-200 bg-white p-2 shadow-sm"
                        />
                        <span className="text-xs font-bold text-[#F26522] group-hover:underline">
                          Ganti Gambar PNG
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="p-3 bg-white rounded-full text-purple-600 group-hover:text-[#F26522] shadow-sm transition-colors">
                          <UploadCloud size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            {isUploadingFile ? 'Sedang memproses berkas...' : 'Klik di sini untuk mengunggah berkas PNG'}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Format wajib PNG transparan persegi (rekomendasi 1080x1080px)
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Kategori Twibbon
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#F26522]"
                    >
                      <option value="Nasional">Nasional</option>
                      <option value="Daerah">Daerah</option>
                      <option value="Milenial">Milenial</option>
                      <option value="Pemuda">Pemuda</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Wilayah / DPW
                    </label>
                    <input
                      type="text"
                      value={uploadRegion}
                      onChange={(e) => setUploadRegion(e.target.value)}
                      placeholder="Contoh: DPW Jatim"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-750 text-xs font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl"
                  >
                    Ajukan Template
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

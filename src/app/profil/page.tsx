import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Trophy,
  ShieldCheck,
  Target,
  Award,
  Users,
  MapPin,
  ChevronRight,
  Sparkles,
  PhoneCall,
  Mail,
  Building,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { getBoardMembers } from '@/actions/board';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Profil & Struktur Organisasi | KONI Kabupaten Kepahiang',
  description:
    'Visi, Misi, Sejarah, dan Susunan Dewan Pengurus Komite Olahraga Nasional Indonesia (KONI) Kabupaten Kepahiang Masa Bakti 2024-2028.',
};

export const revalidate = 60;

export default async function ProfilPage() {
  const resBoard = await getBoardMembers();
  const boardMembers = resBoard.success && resBoard.data ? resBoard.data : [];

  const caborCount = await prisma.dpwOffice.count({ where: { isActive: true } });

  const pimpinanUtama = boardMembers.filter((m: any) => m.hierarchy === 1 || m.hierarchy === 2);
  const ketuaBidang = boardMembers.filter((m: any) => m.hierarchy === 3);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-red-600 transition-colors">
            Beranda
          </Link>
          <ChevronRight size={14} />
          <span className="text-slate-800 dark:text-slate-200">Profil & Struktur Organisasi</span>
        </nav>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white p-6 sm:p-12 shadow-2xl border border-red-900/30">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/30 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Award size={14} className="text-amber-400" />
              <span>Komite Olahraga Nasional Indonesia</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              KONI Kabupaten <span className="text-red-500">Kepahiang</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Wadah pembinaan prestasi keolahragaan resmi di Bumi Sehasen, menaungi 23 Cabang Olahraga prestasi guna mencetak patriot olahraga yang tangguh, berkarakter, dan berdaya saing tinggi.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <Trophy size={16} className="text-amber-400" />
                <span>{caborCount} Cabang Olahraga Aktif</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <MapPin size={16} className="text-red-400" />
                <span>Sekretariat GOR Tebat Monok</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visi & Misi Grid */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Visi */}
          <div className="md:col-span-5 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
                <Target size={24} className="text-white" />
              </div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-red-200">
                Arah & Pandangan Masa Depan
              </span>
              <h2 className="text-2xl font-black">Visi Utama</h2>
              <p className="text-sm sm:text-base text-red-50 leading-relaxed font-medium">
                "Mewujudkan Kabupaten Kepahiang sebagai lumbung atlet berprestasi tinggi di tingkat Provinsi Bengkulu dan Nasional dengan tata kelola olahraga yang modern, transparan, dan berintegritas."
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-xs text-red-100 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-300 shrink-0" />
              <span>Target: Tembus Peringkat 3 Besar Porprov Bengkulu 2026</span>
            </div>
          </div>

          {/* Misi */}
          <div className="md:col-span-7 bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-red-600">
                Strategi & Langkah Nyata
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                5 Pilar Misi KONI Kepahiang
              </h2>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  title: 'Deteksi & Pembinaan Dini',
                  desc: 'Menyelenggarakan program "KONI Masuk Desa" guna menyaring bakat atletik alami anak-anak di 8 kecamatan Kepahiang.',
                },
                {
                  title: 'Peningkatan Kualitas Pelatih & Wasit',
                  desc: 'Mendorong standarisasi lisensi pelatih dan wasit bersertifikasi tingkat provinsi hingga nasional di setiap cabor.',
                },
                {
                  title: 'Modernisasi Fasilitas Olahraga',
                  desc: 'Mengoptimalkan sarana prasarana di GOR Tebat Monok, Stadion Mini Padang Lekat, dan fasilitas cabor pegunungan.',
                },
                {
                  title: 'Penerapan Sport Science & Gizi Atlet',
                  desc: 'Mengadopsi pendekatan ilmiah dalam latihan fisik kontur perbukitan Kabawetan dan pemantauan kebugaran berkala.',
                },
                {
                  title: 'Transparansi & Akuntabilitas Hibah',
                  desc: 'Menerapkan tata kelola anggaran pembinaan yang akuntabel, efisien, dan tepat sasaran bagi atlet dan pelatih.',
                },
              ].map((misi, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80"
                >
                  <div className="w-7 h-7 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {misi.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {misi.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Struktur Organisasi Pimpinan Utama */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-600">
              Dewan Eksekutif
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Struktur Kepengurusan KONI Kepahiang
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pimpinan dan penanggung jawab teknis pembinaan keolahragaan Kabupaten Kepahiang
            </p>
          </div>

          {/* Pimpinan Inti Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pimpinanUtama.map((person: any) => (
              <div
                key={person.name}
                className="group bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-4"
              >
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-red-500/20 shadow-md bg-slate-100 dark:bg-slate-800">
                  <img
                    src={person.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'}
                    alt={person.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                    {person.role}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                    {person.name}
                  </h3>
                  <span className="text-xs text-slate-400 block mt-1">
                    {person.department}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Ketua-Ketua Bidang */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users size={18} className="text-red-600" />
              <span>Ketua-Ketua Bidang Fungsional</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {ketuaBidang.map((bidang: any) => (
                <div
                  key={bidang.name}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-100 block">
                    {bidang.role}
                  </span>
                  <span className="text-slate-500 mt-1 block font-medium">
                    {bidang.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fasilitas Olahraga Daerah */}
        <section className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-600">
              Sarana & Prasarana
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Fasilitas Olahraga Kabupaten Kepahiang
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pusat latihan dan penyelenggaraan event olahraga resmi di Kabupaten Kepahiang
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center font-bold">
                <Building size={20} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                GOR Tebat Monok
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Gelanggang Olahraga serbaguna indoor untuk pertandingan Bulutangkis, Bola Voli, Futsal, Basket, dan Sekretariat Utama KONI.
              </p>
            </div>

            <div className="rounded-2xl p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
                <Trophy size={20} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Stadion Mini Padang Lekat
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pusat pertandingan Sepak Bola, lintasan Atletik, dan lokasi kejuaraan akbar tahunan Bupati Cup.
              </p>
            </div>

            <div className="rounded-2xl p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                <Sparkles size={20} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Pusat Latihan Kabawetan
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kawasan perkebunan teh berkontur pegunungan untuk latihan daya tahan (endurance) atletik, balap sepeda (ISSI), dan panjat tebing.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-black">
              Ingin Bergabung atau Membina Atlet?
            </h3>
            <p className="text-xs sm:text-sm text-red-100 max-w-xl">
              Hubungi Sekretariat KONI Kepahiang atau temukan 23 Cabang Olahraga pilihanmu untuk mulai berprestasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/cabor"
              className="px-5 py-3 rounded-2xl bg-white text-red-600 hover:bg-red-50 text-xs font-black shadow-lg transition-all"
            >
              Lihat 23 Cabor
            </Link>
            <Link
              href="/kontak"
              className="px-5 py-3 rounded-2xl bg-red-950/50 hover:bg-red-950 text-white text-xs font-bold border border-white/20 transition-all"
            >
              Hubungi Sekretariat
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin,
  PhoneCall,
  Mail,
  Clock,
  ChevronRight,
  Send,
  MessageCircle,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Kontak & Sekretariat | KONI Kabupaten Kepahiang',
  description:
    'Alamat kantor sekretariat KONI Kabupaten Kepahiang di GOR Tebat Monok, nomor WhatsApp resmi, email, dan saluran aspirasi pembinaan olahraga daerah.',
};

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-red-600 transition-colors">
            Beranda
          </Link>
          <ChevronRight size={14} />
          <span className="text-slate-800 dark:text-slate-200">Kontak Sekretariat</span>
        </nav>

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-red-900/30">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Building size={14} className="text-amber-400" />
              <span>Sekretariat Resmi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Hubungi KONI Kabupaten <span className="text-red-500">Kepahiang</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pusat koordinasi, informasi kejuaraan, pengurusan rekomendasi cabor, dan konsultasi pembinaan atlet daerah.
            </p>
          </div>
        </div>

        {/* Contact Grid: Info Cards & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Info Side (col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Address */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center shrink-0">
                <MapPin size={22} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  Alamat Sekretariat
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  Gedung Olahraga (GOR) Tebat Monok
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Jl. Lintas Kepahiang - Bengkulu, Kelurahan Tebat Monok, Kec. Kepahiang, Kab. Kepahiang, Bengkulu 39372
                </p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageCircle size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  Layanan WhatsApp
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  0811-9988-7766
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Respon cepat informasi administrasi & layanan cabor.
                </p>
                <a
                  href="https://wa.me/6281199887766?text=Halo%20Sekretariat%20KONI%20Kepahiang,%20saya%20ingin%20berkonsultasi."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-3"
                >
                  <span>Kirim Pesan WhatsApp</span>
                  <ChevronRight size={13} />
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
                <Mail size={22} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  Surat Elektronik Resmi
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  kepahiangkoni@gmail.com
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Untuk persuratan resmi, proposal sponsorship, dan undangan kejuaraan.
                </p>
              </div>
            </div>

            {/* Jam Kerja */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock size={22} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  Jam Layanan Kantor
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  Senin – Jumat: 08.00 – 16.00 WIB
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sabtu: 08.00 – 13.00 WIB (Piket Latihan) | Minggu & Hari Libur: Tutup
                </p>
              </div>
            </div>
          </div>

          {/* Form Side (col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase text-red-600 tracking-wider">
                  Aspirasi & Layanan
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  Kirim Pesan ke Sekretariat KONI
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Sampaikan saran, laporan kegiatan atlet, atau pertanyaan seputar keolahragaan Kabupaten Kepahiang.
                </p>
              </div>

              <ContactForm />
            </div>

            {/* Google Maps Location Preview */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin size={16} className="text-red-600" />
                <span>Peta Lokasi GOR Tebat Monok, Kepahiang</span>
              </h3>
              <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100">
                <iframe
                  title="Lokasi GOR Tebat Monok KONI Kepahiang"
                  src="https://maps.google.com/maps?q=GOR+Tebat+Monok+Kepahiang+Bengkulu&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

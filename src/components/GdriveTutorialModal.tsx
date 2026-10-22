'use client';

import React from 'react';
import { X, ExternalLink, HelpCircle, CheckCircle2, ShieldCheck, Share2 } from 'lucide-react';

interface GdriveTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GdriveTutorialModal: React.FC<GdriveTutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 cursor-default relative overflow-hidden text-left"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <HelpCircle size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                Panduan Upload & Akses Link Google Drive
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Cara mempublikasikan tautan file master agar dapat diunduh pengguna lain
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-4 text-xs text-gray-700">
          
          {/* Step 1 */}
          <div className="flex items-start gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-150">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
              1
            </span>
            <div className="space-y-1">
              <p className="font-bold text-gray-900 text-xs">Upload File Master ke Google Drive Anda</p>
              <p className="text-gray-500 leading-relaxed text-[11px]">
                Buka <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5">drive.google.com <ExternalLink size={10} /></a> di akun Google pribadi/organisasi Anda, lalu unggah berkas master karya Anda (PSD, AI, CDR, TIFF, dll.).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-150">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
              2
            </span>
            <div className="space-y-1">
              <p className="font-bold text-gray-900 text-xs">Ubah Pengaturan Akses Berbagi menjadi Publik</p>
              <p className="text-gray-500 leading-relaxed text-[11px]">
                Klik kanan berkas/folder yang baru diunggah &rarr; Pilih <strong className="text-gray-800">Bagikan (Share)</strong> &rarr; Pada menu <em>Akses Umum (General Access)</em>, ubah opsi dari <strong>"Dibatasi (Restricted)"</strong> menjadi <strong className="text-emerald-600">"Siapa saja yang memiliki link (Anyone with the link)"</strong>.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-150">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
              3
            </span>
            <div className="space-y-1">
              <p className="font-bold text-gray-900 text-xs">Salin Link & Tempel di Form Unggah</p>
              <p className="text-gray-500 leading-relaxed text-[11px]">
                Klik tombol <strong className="text-blue-600">"Salin Link (Copy Link)"</strong>, kemudian tempelkan (paste) tautan tersebut pada kolom <span className="font-semibold text-gray-800">Tautan Berkas Master / Berbagi</span> di form KONI Kepahiang.
              </p>
            </div>
          </div>

        </div>

        {/* Tip Alert */}
        <div className="mt-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-[11px] text-amber-800">
          <ShieldCheck size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            <strong className="font-bold">Informasi:</strong> Saat ini sistem mendukung tautan link publik dari <strong className="text-amber-900">Google Drive</strong> dan <strong className="text-amber-900">Canva</strong>.
          </p>
        </div>

        {/* Close Button */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Mengerti & Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

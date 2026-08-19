'use client';

import React from 'react';
import { AlertTriangle, X, LogOut, Save } from 'lucide-react';

interface ConfirmUnsavedModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onDiscard: () => void;
  onKeepEditing: () => void;
}

export const ConfirmUnsavedModal: React.FC<ConfirmUnsavedModalProps> = ({
  isOpen,
  title = 'Perubahan Belum Disimpan',
  message = 'Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin keluar tanpa menyimpan?',
  confirmLabel = 'Tinggalkan Tanpa Menyimpan',
  cancelLabel = 'Lanjut Edit',
  onDiscard,
  onKeepEditing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 max-w-sm w-full mx-auto text-center relative animate-in zoom-in-95 duration-200">
        
        {/* Close Icon Button */}
        <button
          onClick={onKeepEditing}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Tutup Modal"
        >
          <X size={18} />
        </button>

        {/* Warning Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce duration-1000">
          <AlertTriangle size={28} />
        </div>

        {/* Title & Message */}
        <h3 className="text-lg font-black text-gray-900 tracking-tight mb-1.5">
          {title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-6 font-medium">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onDiscard}
            className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-red-200"
          >
            <LogOut size={14} />
            <span>{confirmLabel}</span>
          </button>

          <button
            type="button"
            onClick={onKeepEditing}
            className="w-full py-2.5 px-4 bg-[#F26522] hover:bg-[#d85417] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Save size={14} />
            <span>{cancelLabel}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

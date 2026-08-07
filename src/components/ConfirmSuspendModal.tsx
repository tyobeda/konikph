'use client';

import React from 'react';
import { Ban, CheckCircle, X } from 'lucide-react';

interface ConfirmSuspendModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isSuspending?: boolean;
}

export const ConfirmSuspendModal: React.FC<ConfirmSuspendModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
  isSuspending = true,
}) => {
  if (!isOpen) return null;

  const defaultTitle = isSuspending ? 'Konfirmasi Suspend' : 'Konfirmasi Aktifkan';
  const defaultMessage = isSuspending 
    ? 'Apakah Anda yakin ingin men-suspend desainer ini? Mereka tidak akan dapat mengunggah karya baru sampai diaktifkan kembali.'
    : 'Apakah Anda yakin ingin mengaktifkan kembali desainer ini? Mereka akan dapat beraktivitas seperti semula.';
  const defaultConfirmLabel = isSuspending ? 'Ya, Suspend' : 'Ya, Aktifkan';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 max-w-sm w-full mx-auto text-center relative animate-in zoom-in-95 duration-200">
        
        {/* Close Icon Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Tutup Modal"
        >
          <X size={18} />
        </button>

        {/* Icon Badge */}
        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto mb-4 shadow-sm ${
          isSuspending ? 'bg-amber-50 border-amber-100 text-amber-500' : 'bg-emerald-50 border-emerald-100 text-emerald-500'
        }`}>
          {isSuspending ? <Ban size={26} /> : <CheckCircle size={26} />}
        </div>

        {/* Title & Message */}
        <h3 className="text-lg font-black text-gray-900 tracking-tight mb-1.5">
          {title || defaultTitle}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-6 font-medium">
          {message || defaultMessage}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 text-white font-bold text-xs rounded-xl transition-all active:scale-95 ${
              isSuspending ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {confirmLabel || defaultConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

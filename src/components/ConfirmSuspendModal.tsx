'use client';

import React from 'react';
import { Ban, CheckCircle, Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
  // Legacy prop backwards compatibility
  isSuspending?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Batal',
  variant,
  onConfirm,
  onCancel,
  isSuspending = true,
}) => {
  if (!isOpen) return null;

  // Determine effective variant
  const effectiveVariant = variant || (isSuspending ? 'warning' : 'success');

  const getIcon = () => {
    switch (effectiveVariant) {
      case 'danger':
        return <Trash2 size={26} />;
      case 'warning':
        return <Ban size={26} />;
      case 'success':
        return <CheckCircle size={26} />;
      default:
        return <AlertTriangle size={26} />;
    }
  };

  const getBadgeStyle = () => {
    switch (effectiveVariant) {
      case 'danger':
        return 'bg-red-50 border-red-100 text-red-500';
      case 'warning':
        return 'bg-amber-50 border-amber-100 text-amber-500';
      case 'success':
        return 'bg-emerald-50 border-emerald-100 text-emerald-500';
      default:
        return 'bg-gray-50 border-gray-100 text-gray-500';
    }
  };

  const getConfirmButtonStyle = () => {
    switch (effectiveVariant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 shadow-red-100';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 shadow-amber-100';
      case 'success':
        return 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100';
      default:
        return 'bg-gray-800 hover:bg-black';
    }
  };

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
        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto mb-4 shadow-sm ${getBadgeStyle()}`}>
          {getIcon()}
        </div>

        {/* Title & Message */}
        <h3 className="text-lg font-black text-gray-900 tracking-tight mb-1.5">
          {title || 'Konfirmasi'}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-6 font-medium">
          {message || 'Apakah Anda yakin ingin melanjutkan tindakan ini?'}
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
            className={`flex-1 py-2.5 px-4 text-white font-bold text-xs rounded-xl transition-all active:scale-95 shadow-md ${getConfirmButtonStyle()}`}
          >
            {confirmLabel || 'Ya, Lanjutkan'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Export alias for backwards compatibility
export const ConfirmSuspendModal = ConfirmModal;

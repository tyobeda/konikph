import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center gap-3">
      <Loader2 size={32} className="text-[#F26522] animate-spin" />
      <p className="text-xs font-bold text-gray-500">Memuat Halaman Admin...</p>
    </div>
  );
}

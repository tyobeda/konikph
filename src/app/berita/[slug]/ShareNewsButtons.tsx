'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy, MessageCircle } from 'lucide-react';

export default function ShareNewsButtons({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  const [copied, setCopied] = useState(false);

  const getArticleUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/berita/${slug}`;
    }
    return `https://konikph.site/berita/${slug}`;
  };

  const handleCopy = () => {
    const url = getArticleUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareToWhatsapp = () => {
    const url = encodeURIComponent(getArticleUrl());
    const text = encodeURIComponent(`*${title}*\n\nBaca berita selengkapnya di KONI Kepahiang:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(getArticleUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareToTwitter = () => {
    const url = encodeURIComponent(getArticleUrl());
    const text = encodeURIComponent(title);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
        <Share2 size={16} className="text-red-500" />
        <span>Bagikan Artikel Ini:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* WhatsApp */}
        <button
          onClick={shareToWhatsapp}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-all"
        >
          <MessageCircle size={14} />
          <span>WhatsApp</span>
        </button>

        {/* Facebook */}
        <button
          onClick={shareToFacebook}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
        >
          <span>Facebook</span>
        </button>

        {/* Twitter / X */}
        <button
          onClick={shareToTwitter}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-all"
        >
          <span>X / Twitter</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          <span>{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cabor, setCabor] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending & prepare WhatsApp fallback
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);

      const waText = encodeURIComponent(
        `*Aspirasi / Pertanyaan KONI Kepahiang*\n\n` +
          `• Nama: ${name}\n` +
          `• Email: ${email || '-'}\n` +
          `• No. HP: ${phone || '-'}\n` +
          `• Cabor/Instansi: ${cabor || '-'}\n\n` +
          `*Pesan:*\n${message}`
      );

      // Open WhatsApp after brief delay
      window.open(`https://wa.me/6281199887766?text=${waText}`, '_blank');
    }, 800);
  };

  if (isSent) {
    return (
      <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 space-y-3 animate-in fade-in">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 size={24} />
        </div>
        <h4 className="font-bold text-base text-emerald-900 dark:text-emerald-100">
          Pesan Berhasil Terkirim!
        </h4>
        <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-sm mx-auto">
          Terima kasih telah menghubungi KONI Kabupaten Kepahiang. Tim sekretariat kami akan segera menindaklanjuti pesan Anda.
        </p>
        <button
          onClick={() => {
            setIsSent(false);
            setName('');
            setEmail('');
            setPhone('');
            setCabor('');
            setMessage('');
          }}
          className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
        >
          Kirim Pesan Lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Rian Pratama"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Nomor WhatsApp / HP <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Contoh: 081234567890"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Alamat Email (Opsional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Cabang Olahraga / Instansi
          </label>
          <input
            type="text"
            value={cabor}
            onChange={(e) => setCabor(e.target.value)}
            placeholder="Contoh: IPSI Kepahiang / Umum"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Isi Pesan / Aspirasi / Pertanyaan <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tuliskan pesan atau pertanyaan Anda kepada Sekretariat KONI Kabupaten Kepahiang secara rinci..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Mengirim Pesan...</span>
          </>
        ) : (
          <>
            <Send size={15} />
            <span>Kirim Pesan ke KONI Kepahiang</span>
          </>
        )}
      </button>
    </form>
  );
}

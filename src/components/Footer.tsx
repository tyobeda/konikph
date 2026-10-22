import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#0B0F17] border-t border-gray-100 dark:border-gray-800/80 py-8 text-center text-xs text-gray-500 dark:text-gray-400 mt-12 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 space-y-4">
        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
          <Link href="/" className="hover:text-red-600 transition-colors">
            Beranda
          </Link>
          <Link href="/berita" className="hover:text-red-600 transition-colors">
            Warta Berita
          </Link>
          <Link href="/cabor" className="hover:text-red-600 transition-colors">
            23 Cabang Olahraga
          </Link>
          <Link href="/agenda" className="hover:text-red-600 transition-colors">
            Agenda Kegiatan
          </Link>
          <Link href="/prestasi" className="hover:text-red-600 transition-colors">
            Prestasi & Medali
          </Link>
          <Link href="/twibbon" className="hover:text-red-600 transition-colors">
            Twibbon Atlet
          </Link>
          <Link href="/profil" className="hover:text-red-600 transition-colors">
            Profil & Visi Misi
          </Link>
          <Link href="/kontak" className="hover:text-red-600 transition-colors">
            Kontak Sekretariat
          </Link>
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-gray-800/60 max-w-sm mx-auto space-y-1">
          <p>© {new Date().getFullYear()} KONI Kabupaten Kepahiang. Hak Cipta Dilindungi.</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Made with ❤️ by{' '}
            <a
              href="https://www.invitara.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors underline decoration-dotted"
            >
              Invitara
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

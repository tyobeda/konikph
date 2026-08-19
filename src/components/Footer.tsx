import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-500 mt-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 space-y-1">
        <p>© {new Date().getFullYear()} PKSART Designer Community. Dikelola oleh Komunitas PKSart di bawah Komdigi DPP PKS.</p>
        <p className="text-[11px] text-gray-400">
          Made with ❤️ by{' '}
          <a
            href="https://namagraph.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-gray-600 hover:text-[#F26522] transition-colors underline decoration-dotted"
          >
            NDS
          </a>
        </p>
      </div>
    </footer>
  );
};

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#0B0F17] border-t border-gray-100 dark:border-gray-800 py-6 text-center text-xs text-gray-500 dark:text-gray-400 mt-12 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 space-y-1">
        <p>© {new Date().getFullYear()} PKSART Designer Community. Dikelola oleh Komunitas PKSart di bawah Komdigi DPP PKS.</p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          Made with ❤️ by{' '}
          <a
            href="https://namagraph.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-gray-600 dark:text-gray-300 hover:text-[#F26522] dark:hover:text-[#F26522] transition-colors underline decoration-dotted"
          >
            NDS
          </a>
        </p>
      </div>
    </footer>
  );
};

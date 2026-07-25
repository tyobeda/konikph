import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-500 mt-12 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <p>© {new Date().getFullYear()} PKSART Designer Community. Dikelola oleh Komunitas PKSart di bawah Komdigi DPP PKS.</p>
      </div>
    </footer>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Link as LinkIcon, CheckCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url, title }) => {
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Lihat desain "${title}" di PKSart: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleInstagramShare = () => {
    // For Instagram, we can copy the link and instruct the user since direct intent for IG Story with URL is not universally supported in web
    handleCopyLink();
    alert('Tautan telah disalin! Buka Instagram dan paste tautan ini di Story Anda.');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Box */}
      <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-gray-900">Bagikan Postingan</h3>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button 
            onClick={handleWhatsAppShare}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-[#E8FADF] hover:bg-[#d6f7c8] text-[#128C7E] rounded-2xl transition-colors"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <MessageCircle size={24} />
            </div>
            <span className="text-xs font-bold text-center">Story/Chat<br/>WhatsApp</span>
          </button>

          <button 
            onClick={handleInstagramShare}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-2xl transition-colors"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </div>
            <span className="text-xs font-bold text-center">Story<br/>Instagram</span>
          </button>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-500 mb-2">Atau salin tautan langsung</p>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 p-1.5 rounded-xl">
            <div className="flex-1 min-w-0 pl-2">
              <p className="text-xs text-gray-600 truncate">{url}</p>
            </div>
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                copied 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-gray-900 hover:bg-black text-white'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle size={14} /> Disalin
                </>
              ) : (
                <>
                  <LinkIcon size={14} /> Salin
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

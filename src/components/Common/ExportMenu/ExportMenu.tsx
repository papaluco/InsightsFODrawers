import React, { useState, useRef, useEffect } from 'react';
import { DownloadIcon } from '../Icons';

interface ExportMenuProps {
  children: React.ReactNode;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // standard click-outside logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // NEW: Internal closer with a safety timer
  const handleContentClick = () => {
    setTimeout(() => {
      setIsOpen(false);
    }, 150); // 150ms is the "sweet spot" for PDF generation to trigger
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-center px-3 py-1.5 rounded-full hover:bg-gray-100 transition-all group"
      >
        <DownloadIcon 
          size={20} 
          className="text-gray-500 group-hover:text-indigo-600 transition-colors" 
        />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform origin-top-right transition-all"
          onClick={handleContentClick} // Any click inside the menu triggers the timer
        >
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Exports</p>
          </div>
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
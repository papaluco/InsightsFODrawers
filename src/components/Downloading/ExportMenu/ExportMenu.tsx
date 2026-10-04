import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DownloadIcon } from '../../Common/Icons';
import { useCloseOnEscape } from '../../Common/useFloatingDropdown';

interface ExportMenuProps {
  children: React.ReactNode;
  /** Optional tooltip for the download button. */
  title?: string;
  /** Disables the menu; disabledReason becomes the tooltip. */
  disabled?: boolean;
  disabledReason?: string;
  /**
   * Opt-in: while open, Escape closes the menu and stops there, so a containing overlay
   * only closes when no menu is open (same as the selectors). Off by default.
   */
  closeOnEscape?: boolean;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ children, title, disabled = false, disabledReason, closeOnEscape = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);
  useCloseOnEscape(closeOnEscape && isOpen, close);
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

  if (disabled) {
    // The tooltip sits on a wrapper because disabled buttons don't show tooltips in every browser.
    return (
      <span title={disabledReason ?? title} className="relative inline-block text-left">
        <button
          type="button"
          disabled
          aria-label={disabledReason ? `${title ?? 'Download'}: ${disabledReason}` : title ?? 'Download'}
          className="flex items-center justify-center px-3 py-1.5 rounded-full opacity-40 cursor-not-allowed"
        >
          <DownloadIcon size={20} className="text-gray-500" />
        </button>
      </span>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        title={title}
        aria-label={title}
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
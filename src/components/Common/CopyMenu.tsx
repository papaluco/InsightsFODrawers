import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CopyIcon, ImageIcon, DatabaseIcon } from './Icons';
import { useCloseOnEscape } from './useFloatingDropdown';

interface CopyMenuProps {
  onCopyData?: () => Promise<void> | void;
  onCopyImage?: () => Promise<void> | void;
  disableImageCopy?: boolean;
  /** Disables the whole menu; disabledReason becomes the tooltip. */
  disabled?: boolean;
  disabledReason?: string;
  /**
   * Opt-in: while open, Escape closes the menu and stops there, so a containing overlay
   * only closes when no menu is open (same as the selectors). Off by default.
   */
  closeOnEscape?: boolean;
}

export const CopyMenu: React.FC<CopyMenuProps> = ({
  onCopyData,
  onCopyImage,
  disableImageCopy = false,
  disabled = false,
  disabledReason,
  closeOnEscape = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);
  useCloseOnEscape(closeOnEscape && isOpen, close);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEvents = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleEvents);

    return () => {
      document.removeEventListener('mousedown', handleEvents);
    };
  }, []);

  if (disabled) {
    // The tooltip sits on a wrapper because disabled buttons don't show tooltips in every browser.
    return (
      <span title={disabledReason ?? 'Copy'} className="relative inline-block">
        <button
          type="button"
          disabled
          aria-label={disabledReason ? `Copy: ${disabledReason}` : 'Copy'}
          className="flex items-center justify-center w-[40px] h-[40px] bg-white rounded-lg border-none opacity-40 cursor-not-allowed"
        >
          <CopyIcon size={24} className="text-gray-500" />
        </button>
      </span>
    );
  }

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Copy"
        className="flex items-center justify-center w-[40px] h-[40px] bg-white rounded-lg hover:shadow-sm transition-all group border-none"
      >
        <CopyIcon
          size={24}
          className="text-gray-500 group-hover:text-indigo-600 transition-colors"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Copy Options
            </p>
          </div>

          <div className="p-1">
            {onCopyData && (
              <button
                onClick={async () => {
                  await onCopyData();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors text-left"
              >
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <DatabaseIcon size={16} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Copy Data
                  </p>

                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    Excel Friendly
                  </p>
                </div>
              </button>
            )}

            {onCopyImage && (
              <button
                disabled={disableImageCopy}
                onClick={async () => {
                  if (disableImageCopy) return;

                  await onCopyImage();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${disableImageCopy
                    ? 'opacity-50 cursor-not-allowed bg-gray-50'
                    : 'hover:bg-indigo-50'
                  }`}
              >
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <ImageIcon size={16} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Copy Image
                  </p>

                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    {disableImageCopy
                      ? 'Disabled for All Rows'
                      : 'PNG Clipboard'}
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
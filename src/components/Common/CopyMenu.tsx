import React, { useEffect, useRef, useState } from 'react';
import { CopyIcon, ImageIcon, DatabaseIcon } from './Icons';

interface CopyMenuProps {
  onCopyData?: () => Promise<void> | void;
  onCopyImage?: () => Promise<void> | void;
}

export const CopyMenu: React.FC<CopyMenuProps> = ({
  onCopyData,
  onCopyImage,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEvents = (event: any) => {
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
                onClick={async () => {
                  await onCopyImage();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors text-left"
              >
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <ImageIcon size={16} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Copy Image
                  </p>

                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    PNG Clipboard
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
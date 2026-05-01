import { useEffect, useRef, useState } from 'react';
import { ReportIcon } from '../../Common/Icons';

export interface PromptVersionOption {
  id: string;
  name: string;
  version: number;
  updatedAt: string;
  updatedBy?: string;
  promptText: string;
  currentVersion?: number;
}

interface AIPromptVersionHistoryProps {
  versions: PromptVersionOption[];
  currentVersion?: number;
  onSelectVersion: (version: PromptVersionOption) => void;
}

export const AIPromptVersionHistory = ({
  versions,
    currentVersion,
  onSelectVersion
}: AIPromptVersionHistoryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
  type="button"
  title="Version history"
  onClick={() => setIsOpen(prev => !prev)}
  className="group p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-colors"
>
  <ReportIcon size={18} className="text-primary" />
</button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <p className="text-sm font-bold text-gray-800">Version History</p>
            <p className="text-xs text-gray-500">
              Select a version to load it into the editor.
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {versions.length === 0 ? (
              <div className="px-4 py-4 text-sm text-gray-400">
                No version history available.
              </div>
            ) : (
              versions.map((item) => {
  const isCurrent = item.version === currentVersion;

  return (
    <button
      key={item.id}
      type="button"
      disabled={isCurrent}
      onClick={() => {
        if (!isCurrent) {
          onSelectVersion(item);
          setIsOpen(false);
        }
      }}
      className={`w-full text-left px-4 py-3 transition-colors border-b last:border-b-0 ${
        isCurrent
          ? 'bg-indigo-50 text-indigo-700 cursor-default'
          : 'hover:bg-indigo-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold">
          Version {item.version}
        </div>

        {isCurrent && (
          <span className="text-xs font-semibold text-indigo-600">
            Current
          </span>
        )}
      </div>

      <div className="text-xs text-gray-500">
        Created on {item.updatedAt}
      </div>
    </button>
  );
})
            )}
          </div>
        </div>
      )}
    </div>
  );
};
import React from 'react';
import { Download, X } from 'lucide-react';
import { ReportHistoryItem } from '../../types/ReportTypes';

interface Props {
  recentDownloads: ReportHistoryItem[];
  onDismiss: (id: string) => void;
}

const DownloadReadyBanner: React.FC<Props> = ({ recentDownloads, onDismiss }) => {
  if (recentDownloads.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {recentDownloads.map(item => (
        <div
          key={item.id}
          className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl animate-in fade-in slide-in-from-top-1 duration-300"
        >
          <Download size={16} className="text-emerald-600 shrink-0" />

          <p className="flex-1 min-w-0 text-sm text-emerald-800">
            Your download is ready:{' '}
            <span className="font-bold">{item.name}</span>
          </p>

          {item.fileUrl && (
            <a
              href={item.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onDismiss(item.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-700 transition-colors shrink-0"
            >
              <Download size={12} />
              Open File
            </a>
          )}

          <button
            onClick={() => onDismiss(item.id)}
            className="p-1 text-emerald-500 hover:text-emerald-700 transition-colors shrink-0"
            title="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default DownloadReadyBanner;

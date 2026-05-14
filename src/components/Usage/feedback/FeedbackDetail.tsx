import React, { useEffect } from 'react';
import { X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { FeedbackRecord } from '../../../types/feedbackTypes';
import { USER_DISPLAY_NAMES, DISTRICT_DISPLAY_NAMES } from '../../../data/mockFeedbackData';
import { getPromptName, getPromptTypeDisplay, getReasonDisplay } from './feedbackHelpers';

interface Props {
  record: FeedbackRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

const Row: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <dt className="text-xs font-medium text-gray-400 pt-0.5">{label}</dt>
      <dd className="text-sm text-gray-800 col-span-2">{value}</dd>
    </div>
  );
};

const FeedbackDetail: React.FC<Props> = ({ record, isOpen, onClose }) => {
  // Capture-phase listener so Escape closes this panel without
  // propagating up to the outer drawer's window listener.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  const isHelpful = record?.feedbackValue === 'thumbs_up';
  const userName = record ? (USER_DISPLAY_NAMES[record.userId] ?? record.userId) : '';
  const districtName = record
    ? ((record.contextJson?.districtName as string) ?? DISTRICT_DISPLAY_NAMES[record.districtId] ?? record.districtId)
    : '';
  const ctx = record?.contextJson ?? {};

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[59] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed inset-y-0 right-0 w-1/4 min-w-80 bg-white z-[60] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
          <h3 className="text-base font-bold text-slate-800">Feedback Detail</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {record && (
            <>
              {/* Sentiment banner */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${isHelpful ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                {isHelpful
                  ? <ThumbsUp size={15} className="text-green-600 flex-shrink-0" />
                  : <ThumbsDown size={15} className="text-red-500 flex-shrink-0" />
                }
                <span className={`font-semibold text-sm ${isHelpful ? 'text-green-700' : 'text-red-600'}`}>
                  {isHelpful ? 'Marked as Helpful' : 'Marked as Not Helpful'}
                </span>
                <span className="ml-auto text-[11px] text-gray-400 whitespace-nowrap">
                  {new Date(record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* User & Context */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">User & Context</h4>
                <dl>
                  <Row label="User" value={userName} />
                  <Row label="District" value={districtName} />
                  <Row label="Platform" value={record.platform} />
                  <Row label="Prompt Type" value={getPromptTypeDisplay(record.sourceEntryPoint)} />
                  <Row label="Prompt Name" value={getPromptName(record)} />
                  <Row label="Version" value={`v${record.promptVersion}`} />
                  <Row label="KPI" value={record.kpiIdentifier} />
                  <Row label="Date Range" value={ctx.dateRange as string} />
                  <Row label="Site" value={ctx.siteName as string} />
                  <Row label="Cache" value={record.cacheStatus} />
                </dl>
              </div>

              {/* Feedback reasons & comment */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Feedback</h4>
                {record.reasonCodes?.length ? (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {record.reasonCodes.map(code => (
                      <span key={code} className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-200">
                        {getReasonDisplay(code)}
                      </span>
                    ))}
                  </div>
                ) : null}
                {record.comment ? (
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 italic">"{record.comment}"</p>
                ) : !record.reasonCodes?.length ? (
                  <p className="text-sm text-gray-400 italic">No reason or comment provided.</p>
                ) : null}
              </div>

              {/* Prompt text */}
              {record.promptText && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Prompt Text</h4>
                  <pre className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                    {record.promptText}
                  </pre>
                </div>
              )}

              {/* AI Response */}
              {(record.responseText || record.responseJson) && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">AI Response</h4>
                  <pre className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                    {record.responseText ?? JSON.stringify(record.responseJson, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default FeedbackDetail;

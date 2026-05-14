import React, { useEffect, useState } from 'react';
import { X, Loader2, AlertTriangle, Inbox, RotateCcw } from 'lucide-react';
import { SchoolieIcon } from '../Common/Icons';
import { ProductFeedback } from '../Feedback/ProductFeedback';
import { getPromptAnalysis } from '../../services/schoolieService';
import { SchoolieSourceEntryPoint } from '../../types/feedbackTypes';

export interface SchoolieDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  promptId: string;
  sourceEntryPoint: SchoolieSourceEntryPoint;
}

type DrawerState = 'loading' | 'success' | 'error' | 'empty';

export const SchoolieDrawer: React.FC<SchoolieDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  promptId,
  sourceEntryPoint,
}) => {
  const [drawerState, setDrawerState] = useState<DrawerState>('loading');
  const [html, setHtml] = useState<string>('');
  const [generatedAt, setGeneratedAt] = useState<string>('');
  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = () => setRetryKey(k => k + 1);

  useEffect(() => {
    if (!isOpen) {
      setDrawerState('loading');
      setHtml('');
      return;
    }

    setDrawerState('loading');
    setHtml('');

    let cancelled = false;
    getPromptAnalysis(promptId)
      .then(data => {
        if (cancelled) return;
        if (!data?.html) {
          setDrawerState('empty');
        } else {
          setHtml(data.html);
          setGeneratedAt(data.generatedAt);
          setDrawerState('success');
        }
      })
      .catch(() => {
        if (!cancelled) setDrawerState('error');
      });

    return () => { cancelled = true; };
  }, [isOpen, promptId, retryKey]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formattedDate = generatedAt
    ? new Date(generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[55]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-white shadow-2xl z-[60] flex flex-col animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-indigo-100">
                <SchoolieIcon className="h-5 w-5 text-indigo-600" size={20} />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">{subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 flex-1 bg-gray-50/30 overflow-y-auto">

          {drawerState === 'loading' && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-4 text-center animate-in fade-in duration-300">
              <div className="relative">
                <div className="p-4 rounded-full bg-indigo-50">
                  <SchoolieIcon className="h-8 w-8 text-indigo-400" size={32} />
                </div>
                <Loader2 className="absolute -bottom-1 -right-1 w-5 h-5 text-indigo-500 animate-spin" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">Schoolie is analyzing your data...</p>
                <p className="text-sm text-gray-400 mt-1">This usually takes just a moment.</p>
              </div>
            </div>
          )}

          {drawerState === 'error' && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-4 text-center animate-in fade-in duration-300">
              <div className="p-4 rounded-full bg-red-50">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">Unable to load analysis</p>
                <p className="text-sm text-gray-400 mt-1">Something went wrong while generating insights.</p>
              </div>
              <button
                onClick={handleRetry}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {drawerState === 'empty' && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-4 text-center animate-in fade-in duration-300">
              <div className="p-4 rounded-full bg-gray-100">
                <Inbox className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">No analysis available</p>
                <p className="text-sm text-gray-400 mt-1">Schoolie wasn't able to generate insights right now.</p>
              </div>
              <button
                onClick={handleRetry}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {drawerState === 'success' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500 text-left">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-none">
                <div
                  className="prose prose-sm max-w-none text-gray-700 [&>h2]:text-base [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-5 [&>h2]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>p]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
                <p className="text-xs text-gray-400 mt-8 italic pt-4 flex justify-between border-t border-gray-100">
                  <span>Insights are generated by Schoolie AI and should be reviewed alongside your data.</span>
                  <span>{formattedDate}</span>
                </p>
                <ProductFeedback
                  feedbackType='Schoolie'
                  variant='drawer'
                  sourceEntryPoint='KpiDrawer'
                  analysisIdentifier='Schoolie'
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

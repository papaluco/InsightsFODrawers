import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, CheckCircle2, AlertCircle, Lightbulb, Loader2, AlertTriangle, Inbox, RotateCcw } from 'lucide-react';
import { SchoolieIcon, SparklesIcon } from '../Common/Icons';
import { KPIKey, AIResponsePayload } from '../../types/SchoolieTypes';
import { getKPIAnalysis } from '../../services/schoolieService';
import { ProductFeedback } from '../Feedback/ProductFeedback';

export interface AIKPIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  title: string;
  subtitle: string;
  kpiKey: KPIKey;
  kpiName: string;
  districtName: string;
  dateRange: string;
  siteName?: string;
}

type DrawerState = 'loading' | 'success' | 'error' | 'empty';

export const AIKPIDrawer: React.FC<AIKPIDrawerProps> = ({
  isOpen,
  onClose,
  onBack,
  title,
  subtitle,
  kpiKey,
  kpiName,
  districtName,
  dateRange,
  siteName,
}) => {
  const [drawerState, setDrawerState] = useState<DrawerState>('loading');
  const [response, setResponse] = useState<AIResponsePayload | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = () => setRetryKey(k => k + 1);

  useEffect(() => {
    if (!isOpen) {
      setDrawerState('loading');
      setResponse(null);
      return;
    }

    setDrawerState('loading');
    setResponse(null);

    let cancelled = false;
    getKPIAnalysis(kpiKey).then(data => {
      if (cancelled) return;
      if (!data.data) {
        setDrawerState('empty');
      } else {
        setResponse(data);
        setDrawerState('success');
      }
    }).catch(() => {
      if (!cancelled) setDrawerState('error');
    });

    return () => { cancelled = true; };
  }, [isOpen, kpiKey, retryKey]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onBack]);

  if (!isOpen) return null;

  const contextSummary = siteName
    ? `This analysis was generated for ${siteName} in ${districtName} for ${dateRange} regarding ${kpiName}.`
    : `This analysis was generated for all sites in ${districtName} for ${dateRange} regarding ${kpiName}.`;

  const formattedDate = response?.generatedAt
    ? new Date(response.generatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[55]" onClick={onBack} />
      <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-white shadow-2xl z-[60] flex flex-col animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                aria-label="Back to KPI drawer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
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
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleRetry}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={onBack}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  Return to {kpiName}
                </button>
              </div>
            </div>
          )}

          {drawerState === 'empty' && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-4 text-center animate-in fade-in duration-300">
              <div className="p-4 rounded-full bg-gray-100">
                <Inbox className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">No analysis available</p>
                <p className="text-sm text-gray-400 mt-1">Schoolie wasn't able to generate insights for this KPI right now.</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleRetry}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={onBack}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  Return to {kpiName}
                </button>
              </div>
            </div>
          )}

          {drawerState === 'success' && response?.data && (
            <div className="animate-in slide-in-from-bottom-4 duration-500 text-left">

              {/* Context summary */}
              <p className="text-gray-600 mb-6 px-1 leading-relaxed text-sm">
                {contextSummary}
              </p>

              {/* Analysis card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-none">
                <div className="flex items-center space-x-2 mb-2">
                  <SparklesIcon className="h-4 w-4 text-indigo-500" size={16} />
                  <h2 className="text-xl font-bold text-gray-900">{kpiName} Analysis</h2>
                </div>
                <p className="text-gray-600 mb-6">{response.data.summary}</p>

                {/* What's Working / Needs Attention */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100 relative overflow-hidden">
                    <CheckCircle2 className="absolute -right-2 -top-2 w-12 h-12 text-green-100" />
                    <h4 className="text-green-800 font-bold mb-2 text-sm">What's Working</h4>
                    <p className="text-sm text-green-700 relative z-10">{response.data.whatsWorking}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 relative overflow-hidden">
                    <AlertCircle className="absolute -right-2 -top-2 w-12 h-12 text-amber-100" />
                    <h4 className="text-amber-800 font-bold mb-2 text-sm">Needs Attention</h4>
                    <p className="text-sm text-amber-700 relative z-10">{response.data.needsAttention}</p>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 relative overflow-hidden">
                  <Lightbulb className="absolute -right-2 -top-2 w-12 h-12 text-indigo-100" />
                  <h4 className="text-indigo-800 font-bold mb-2 text-sm">Recommendation</h4>
                  <p className="text-sm text-indigo-700 relative z-10">{response.data.recommendation}</p>
                </div>

                {/* Footer */}
                <p className="text-xs text-gray-400 mt-8 italic pt-4 flex justify-between border-t border-gray-100">
                  <span>Insights are generated by Schoolie AI and should be reviewed alongside your data.</span>
                  <span>{formattedDate}</span>
                </p>

                {/* Feedback */}
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

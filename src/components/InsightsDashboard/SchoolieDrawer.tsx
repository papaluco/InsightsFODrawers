import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Loader2, AlertTriangle, Inbox, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { SchoolieIcon } from '../Common/Icons';
import { ProductFeedback } from '../Feedback/ProductFeedback';
import { getPromptAnalysis } from '../../services/schoolieService';
import { SchoolieSourceEntryPoint } from '../../types/feedbackTypes';
import { telemetry } from '../../telemetry';
import type { PerformanceTimer } from '../../telemetry/types';
import { MOCK_CURRENT_USER } from '../../data/mockCurrentUser';

/**
 * Structured facts sent with the prompt, tagged with the key of the context they were built for.
 * Used by Performance Comparison (NXT-77214 §11) for stale detection.
 */
export interface SchoolieAnalysisContext {
  key: string;
  facts: unknown;
}

export interface SchoolieDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  promptId: string;
  sourceEntryPoint: SchoolieSourceEntryPoint;
  /**
   * 'default': max-w-4xl with a dimming backdrop. 'panel': a third of the screen on desktop (half at
   * tablet width, full width on phones) with no backdrop, so the page behind stays visible and usable (NXT-77214 §11).
   * Panel mode also handles Escape before any other listener, so it closes before its host.
   */
  width?: 'default' | 'panel';
  /** Loading message; defaults to "Schoolie is analyzing your data...". */
  loadingText?: string;
  /**
   * Context-driven analysis. When `contextKey` is set, the drawer waits for an `analysisContext`
   * whose key matches it, sends its facts, shows them in "Facts sent to Schoolie", and marks the
   * analysis "Out of date" (with Reanalyze) once `contextKey` moves on. It never re-runs on its own.
   */
  analysisContext?: SchoolieAnalysisContext | null;
  /** Key of the current context, even while its facts are still loading. */
  contextKey?: string;
  /**
   * 'actual' records the real promptId and sourceEntryPoint with feedback. 'legacy' (default) keeps
   * the original hardcoded attribution for the existing entry points.
   */
  feedbackAttribution?: 'legacy' | 'actual';
}

type DrawerState = 'loading' | 'success' | 'error' | 'empty';

export const SchoolieDrawer: React.FC<SchoolieDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  promptId,
  sourceEntryPoint,
  width = 'default',
  loadingText,
  analysisContext,
  contextKey,
  feedbackAttribution = 'legacy',
}) => {
  const [drawerState, setDrawerState] = useState<DrawerState>('loading');
  const [html, setHtml] = useState<string>('');
  const [generatedAt, setGeneratedAt] = useState<string>('');
  /** An analysis has been requested (open, retry, Reanalyze) and hasn't started yet. */
  const [runPending, setRunPending] = useState(false);
  /** The context whose facts produced the current analysis. */
  const [analyzedContext, setAnalyzedContext] = useState<SchoolieAnalysisContext | null>(null);
  const [factsExpanded, setFactsExpanded] = useState(false);

  const usesContext = contextKey !== undefined;
  // The facts to send are ready only when they were built for the current context.
  const readyContext = usesContext && analysisContext && analysisContext.key === contextKey ? analysisContext : null;
  const canRun = !usesContext || readyContext !== null;
  const readyContextRef = useRef(readyContext);
  readyContextRef.current = readyContext;

  /** Each run gets a token; responses from superseded runs are ignored. */
  const runTokenRef = useRef(0);
  const timerRef = useRef<PerformanceTimer | null>(null);

  const cancelRun = useCallback(() => {
    runTokenRef.current += 1;
    timerRef.current?.cancel();
    timerRef.current = null;
  }, []);

  const requestRun = () => setRunPending(true);

  const startRun = useCallback(() => {
    cancelRun();
    const token = runTokenRef.current;
    const context = readyContextRef.current;
    setDrawerState('loading');
    setHtml('');

    const timer = telemetry.startPerformanceTimer('schoolie_kpi_response', {
      performanceCategory: 'ai_response',
      module: 'insights',
      component: 'SchoolieDrawer',
      thresholdMs: 15000,
    });
    timerRef.current = timer;

    telemetry.trackUsage('ai_request_started', {
      module: 'insights',
      component: 'SchoolieDrawer',
      userId: MOCK_CURRENT_USER.userId,
      districtId: MOCK_CURRENT_USER.districtId,
      properties: {
        analysisIdentifier: promptId,
        sourceEntryPoint,
        promptVersion: 1,
        modelVersion: 'gpt-4o',
      },
    });

    getPromptAnalysis(promptId, context?.facts)
      .then(data => {
        if (token !== runTokenRef.current) return;
        timer.success();
        timerRef.current = null;
        telemetry.trackUsage('ai_response_success', {
          module: 'insights',
          component: 'SchoolieDrawer',
          userId: MOCK_CURRENT_USER.userId,
          districtId: MOCK_CURRENT_USER.districtId,
          properties: {
            analysisIdentifier: promptId,
            sourceEntryPoint,
          },
        });
        setAnalyzedContext(context);
        if (!data?.html) {
          setDrawerState('empty');
        } else {
          setHtml(data.html);
          setGeneratedAt(data.generatedAt);
          setDrawerState('success');
        }
      })
      .catch((err: unknown) => {
        if (token !== runTokenRef.current) return;
        timer.failure(err instanceof Error ? err : undefined);
        timerRef.current = null;
        telemetry.trackUsage('ai_response_error', {
          module: 'insights',
          component: 'SchoolieDrawer',
          userId: MOCK_CURRENT_USER.userId,
          districtId: MOCK_CURRENT_USER.districtId,
          properties: {
            analysisIdentifier: promptId,
            sourceEntryPoint,
            errorMessage: err instanceof Error ? err.message : 'Unknown error',
          },
        });
        setDrawerState('error');
      });
  }, [cancelRun, promptId, sourceEntryPoint]);

  // Opening the drawer (or switching prompts) requests an analysis; closing resets it.
  useEffect(() => {
    if (isOpen) {
      setRunPending(true);
      return;
    }
    cancelRun();
    setRunPending(false);
    setDrawerState('loading');
    setHtml('');
    setAnalyzedContext(null);
    setFactsExpanded(false);
  }, [isOpen, promptId, cancelRun]);

  // A requested analysis starts once its facts are ready, e.g. when results finish loading after
  // the drawer opens. The analyzed key is always the key of the facts actually sent.
  useEffect(() => {
    if (!isOpen || !runPending || !canRun) return;
    setRunPending(false);
    startRun();
  }, [isOpen, runPending, canRun, startRun]);

  useEffect(() => cancelRun, [cancelRun]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Panel mode sits on top of another overlay: handle Escape first (window capture) and stop it,
      // so the overlay underneath stays open.
      if (width === 'panel') e.stopImmediatePropagation();
      onClose();
    };
    const capture = width === 'panel';
    window.addEventListener('keydown', handleKeyDown, capture);
    return () => window.removeEventListener('keydown', handleKeyDown, capture);
  }, [isOpen, onClose, width]);

  if (!isOpen) return null;

  const formattedDate = generatedAt
    ? new Date(generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // NXT-77214 §11 stale state: the analyzed facts no longer match the current context.
  const isOutOfDate =
    usesContext && drawerState !== 'loading' && analyzedContext !== null && analyzedContext.key !== contextKey;

  const panelClasses =
    width === 'panel'
      ? 'w-full sm:w-[400px] md:w-1/2 lg:w-1/3 max-w-full border-l border-gray-200'
      : 'w-full max-w-4xl';

  return (
    <>
      {width === 'default' && <div className="fixed inset-0 bg-black/30 z-[55]" onClick={onClose} />}
      <div
        role="dialog"
        aria-label={title}
        className={`fixed inset-y-0 right-0 ${panelClasses} bg-white shadow-2xl z-[60] flex flex-col animate-in slide-in-from-right duration-300`}
      >

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2 rounded-full bg-indigo-100 shrink-0">
                <SchoolieIcon className="h-5 w-5 text-indigo-600" size={20} />
              </div>
              <div className="text-left min-w-0">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">{subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 flex-1 bg-gray-50/30 overflow-y-auto">

          {isOutOfDate && (
            <div role="status" className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left">
              <div className="flex items-start gap-2 min-w-0">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-900">Out of date</p>
                  <p className="text-xs text-amber-800">The comparison changed after this analysis ran.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={requestRun}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Reanalyze</span>
              </button>
            </div>
          )}

          {drawerState === 'loading' && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-4 text-center animate-in fade-in duration-300">
              <div className="relative">
                <div className="p-4 rounded-full bg-indigo-50">
                  <SchoolieIcon className="h-8 w-8 text-indigo-400" size={32} />
                </div>
                <Loader2 className="absolute -bottom-1 -right-1 w-5 h-5 text-indigo-500 animate-spin" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">{loadingText ?? 'Schoolie is analyzing your data...'}</p>
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
                onClick={requestRun}
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
                onClick={requestRun}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {drawerState === 'success' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500 text-left">
              <div className={`bg-white rounded-xl border border-gray-200 shadow-sm max-w-none ${width === 'panel' ? 'p-5' : 'p-6'}`}>
                <div
                  className="prose prose-sm max-w-none text-gray-700 [&>h2]:text-base [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-5 [&>h2]:mb-2 [&>h2:first-child]:mt-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1 [&>p]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
                <p className="text-xs text-gray-400 mt-8 italic pt-4 flex justify-between gap-3 border-t border-gray-100">
                  <span>Insights are generated by Schoolie AI and should be reviewed alongside your data.</span>
                  <span className="shrink-0">{formattedDate}</span>
                </p>
                <ProductFeedback
                  feedbackType='Schoolie'
                  variant='drawer'
                  sourceEntryPoint={feedbackAttribution === 'actual' ? sourceEntryPoint : 'KpiDrawer'}
                  analysisIdentifier={feedbackAttribution === 'actual' ? promptId : 'Schoolie'}
                />
              </div>
            </div>
          )}

          {/* NXT-77214 §11: the facts payload actually sent, so developers can see the contract. */}
          {usesContext && analyzedContext && drawerState !== 'loading' && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-white text-left">
              <button
                type="button"
                onClick={() => setFactsExpanded(v => !v)}
                aria-expanded={factsExpanded}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
              >
                {factsExpanded ? <ChevronDown className="w-4 h-4" aria-hidden="true" /> : <ChevronRight className="w-4 h-4" aria-hidden="true" />}
                Facts sent to Schoolie
              </button>
              {factsExpanded && (
                <pre className="mx-4 mb-4 max-h-96 overflow-auto rounded-lg bg-gray-900 p-3 text-[11px] leading-snug text-gray-100">
                  {JSON.stringify(analyzedContext.facts, null, 2)}
                </pre>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

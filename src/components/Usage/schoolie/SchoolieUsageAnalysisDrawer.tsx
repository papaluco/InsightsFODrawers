import React, { useEffect, useRef, useState } from 'react';
import { X, Send, AlertTriangle, RotateCcw } from 'lucide-react';
import { SchoolieIcon } from '../../Common/Icons';
import { SchoolieUsageFilters } from '../../../types/schoolieUsageTypes';
import {
  getSchoolieUsageSummary,
  getSchoolieOperationalStats,
  getSatisfactionStats,
} from '../../../services/schoolieUsageService';
import { getPrompts, getUsageChatResponse } from '../../../services/schoolieService';
import { ProductFeedback } from '../../Feedback/ProductFeedback';
import { telemetry } from '../../../telemetry';
import { MOCK_CURRENT_USER } from '../../../data/mockCurrentUser';

const ANALYSIS_ID = 'SchoolieUsageDashboard';
const SOURCE = 'UsageScreen';

const SUGGESTED_PROMPTS = [
  'Summarize overall Schoolie adoption trends',
  'Which surfaces have the lowest engagement?',
  'What does the feedback data suggest about user satisfaction?',
  'Are there any operational concerns I should be aware of?',
  'Which districts are most and least active?',
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: SchoolieUsageFilters;
  activeTab: string;
}

const parseBold = (text: string): React.ReactNode => {
  if (!text.includes('**')) return text;
  const parts = text.split(/(\*\*.+?\*\*)/);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : part
      )}
    </>
  );
};

const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (/^## /.test(line)) {
      nodes.push(<h3 key={i} className="font-bold text-slate-800 text-sm mt-3 mb-1 leading-snug">{parseBold(line.slice(3))}</h3>);
    } else if (/^### /.test(line)) {
      nodes.push(<h4 key={i} className="font-semibold text-slate-700 text-sm mt-2 mb-0.5">{parseBold(line.slice(4))}</h4>);
    } else if (/^---+$/.test(line)) {
      nodes.push(<hr key={i} className="my-2 border-slate-200" />);
    } else if (/^  [\*\-] /.test(line)) {
      nodes.push(<li key={i} className="ml-8 list-disc marker:text-slate-300 text-xs leading-relaxed">{parseBold(line.replace(/^  [\*\-] /, ''))}</li>);
    } else if (/^[\*\-] /.test(line)) {
      nodes.push(<li key={i} className="ml-4 list-disc marker:text-slate-400 text-[0.8125rem] leading-relaxed">{parseBold(line.replace(/^[\*\-] /, ''))}</li>);
    } else if (/^\d+\. /.test(line)) {
      nodes.push(<li key={i} className="ml-4 list-decimal marker:text-slate-400 text-[0.8125rem] leading-relaxed">{parseBold(line.replace(/^\d+\. /, ''))}</li>);
    } else if (line === '') {
      nodes.push(<div key={i} className="h-1.5" />);
    } else {
      nodes.push(<p key={i} className="text-[0.8125rem] leading-relaxed">{parseBold(line)}</p>);
    }
  });

  return <div className="text-gray-700 space-y-0.5">{nodes}</div>;
};

const SchoolieUsageAnalysisDrawer: React.FC<Props> = ({ isOpen, onClose, filters, activeTab }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [contextPayload, setContextPayload] = useState<Record<string, unknown>>({});
  const [regenerateKey, setRegenerateKey] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Capture-phase Escape so this drawer closes without closing the parent
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [isOpen, onClose]);

  // On open (or regenerate): load prompt config + context, then run initial analysis
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInputValue('');
      setIsLoading(false);
      setSystemPrompt('');
      setContextPayload({});
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setMessages([]);

    Promise.all([
      getPrompts(),
      getSchoolieUsageSummary(filters),
      getSchoolieOperationalStats(filters),
      getSatisfactionStats(filters),
    ]).then(([prompts, summary, opStats, satStats]) => {
      if (cancelled) return;

      // Read prompt from AI Configurator — prefer a usage-specific prompt, fall back to schoolie_feedback
      const prompt =
        prompts.find(p => p.id === 'schoolie_usage') ??
        prompts.find(p => p.id === 'schoolie_feedback') ??
        prompts[0];
      const promptText = prompt?.promptText ?? '';

      const payload: Record<string, unknown> = {
        activeTab,
        filters,
        summary,
        operationalStats: opStats,
        satisfactionStats: satStats,
        platform: MOCK_CURRENT_USER.platform,
      };

      setSystemPrompt(promptText);
      setContextPayload(payload);

      const timer = telemetry.startPerformanceTimer('schoolie_usage_analysis', {
        performanceCategory: 'ai_response',
        module: 'usage',
        component: 'SchoolieUsageAnalysisDrawer',
        thresholdMs: 15000,
      });
      telemetry.trackUsage('ai_request_started', {
        module: 'usage',
        component: 'SchoolieUsageAnalysisDrawer',
        userId: MOCK_CURRENT_USER.userId,
        districtId: MOCK_CURRENT_USER.districtId,
        properties: {
          analysisIdentifier: ANALYSIS_ID,
          sourceEntryPoint: SOURCE,
          isInitial: true,
          modelVersion: 'gpt-4o',
        },
      });

      return getUsageChatResponse('', true, promptText, payload)
        .then(content => {
          if (cancelled) return;
          timer.success();
          telemetry.trackUsage('ai_response_success', {
            module: 'usage',
            component: 'SchoolieUsageAnalysisDrawer',
            userId: MOCK_CURRENT_USER.userId,
            districtId: MOCK_CURRENT_USER.districtId,
            properties: { analysisIdentifier: ANALYSIS_ID, sourceEntryPoint: SOURCE, isInitial: true },
          });
          setMessages([{ id: '0', role: 'assistant', content }]);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          timer.failure(err instanceof Error ? err : undefined);
          telemetry.trackUsage('ai_response_error', {
            module: 'usage',
            component: 'SchoolieUsageAnalysisDrawer',
            userId: MOCK_CURRENT_USER.userId,
            districtId: MOCK_CURRENT_USER.districtId,
            properties: {
              analysisIdentifier: ANALYSIS_ID,
              sourceEntryPoint: SOURCE,
              isInitial: true,
              errorMessage: err instanceof Error ? err.message : 'Unknown error',
            },
          });
          setMessages([{
            id: '0', role: 'assistant', isError: true,
            content: 'An error occurred during analysis. Use the regenerate button to try again.',
          }]);
        });
    }).catch((err: unknown) => {
      if (cancelled) return;
      telemetry.trackUsage('ai_response_error', {
        module: 'usage',
        component: 'SchoolieUsageAnalysisDrawer',
        userId: MOCK_CURRENT_USER.userId,
        districtId: MOCK_CURRENT_USER.districtId,
        properties: {
          analysisIdentifier: ANALYSIS_ID,
          sourceEntryPoint: SOURCE,
          isInitial: true,
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
        },
      });
      setMessages([{
        id: '0', role: 'assistant', isError: true,
        content: 'Failed to load context data. Use the regenerate button to try again.',
      }]);
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, regenerateKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 112)}px`;
    }
  }, [inputValue]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? inputValue).trim();
    if (!content || isLoading) return;
    setInputValue('');
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const timer = telemetry.startPerformanceTimer('schoolie_usage_analysis', {
      performanceCategory: 'ai_response',
      module: 'usage',
      component: 'SchoolieUsageAnalysisDrawer',
      thresholdMs: 15000,
    });
    telemetry.trackUsage('ai_request_started', {
      module: 'usage',
      component: 'SchoolieUsageAnalysisDrawer',
      userId: MOCK_CURRENT_USER.userId,
      districtId: MOCK_CURRENT_USER.districtId,
      properties: { analysisIdentifier: ANALYSIS_ID, sourceEntryPoint: SOURCE, modelVersion: 'gpt-4o' },
    });

    try {
      const response = await getUsageChatResponse(content, false, systemPrompt, contextPayload);
      timer.success();
      telemetry.trackUsage('ai_response_success', {
        module: 'usage',
        component: 'SchoolieUsageAnalysisDrawer',
        userId: MOCK_CURRENT_USER.userId,
        districtId: MOCK_CURRENT_USER.districtId,
        properties: { analysisIdentifier: ANALYSIS_ID, sourceEntryPoint: SOURCE },
      });
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: response }]);
    } catch (err) {
      timer.failure(err instanceof Error ? err : undefined);
      telemetry.trackUsage('ai_response_error', {
        module: 'usage',
        component: 'SchoolieUsageAnalysisDrawer',
        userId: MOCK_CURRENT_USER.userId,
        districtId: MOCK_CURRENT_USER.districtId,
        properties: {
          analysisIdentifier: ANALYSIS_ID,
          sourceEntryPoint: SOURCE,
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
        },
      });
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`, role: 'assistant', isError: true,
        content: 'An error occurred. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const initialAnalysis = messages.find(m => m.id === '0');
  const hasInitialAnalysis = !!initialAnalysis && !initialAnalysis.isError;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-[51] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed inset-y-0 right-0 w-[520px] bg-white z-[52] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <SchoolieIcon size={40} />
            <div>
              <h3 className="text-base font-bold text-slate-800">Schoolie Usage Analysis</h3>
              <p className="text-[11px] text-gray-400 font-medium capitalize">{activeTab} tab · current filters</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setRegenerateKey(k => k + 1)}
              disabled={isLoading}
              title="Regenerate analysis"
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mx-4 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2.5 shrink-0">
          <AlertTriangle size={13} className="flex-shrink-0 mt-0.5 text-amber-500" />
          <p className="text-[11px] leading-relaxed text-amber-800">
            Conversations are <strong>not saved</strong> and reset when this drawer closes. Results are based on the <strong>currently filtered dataset</strong> only. Only the last 5 messages are used for follow-up context.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map(msg => (
            <React.Fragment key={msg.id}>
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                    <SchoolieIcon size={20} />
                  </div>
                )}
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : msg.isError
                    ? 'bg-red-50 border border-red-200 text-red-700 rounded-tl-sm'
                    : 'bg-gray-50 border border-gray-200 rounded-tl-sm'
                }`}>
                  {msg.role === 'assistant' ? (
                    <SimpleMarkdown content={msg.content} />
                  ) : (
                    <span className="leading-relaxed">{msg.content}</span>
                  )}
                </div>
              </div>

              {/* ProductFeedback rendered after the initial analysis only */}
              {msg.id === '0' && !msg.isError && (
                <div className="pl-9">
                  <ProductFeedback
                    feedbackType='Schoolie'
                    variant='drawer'
                    sourceEntryPoint='UsageScreen'
                    analysisIdentifier='SchoolieUsageDashboard'
                  />
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                <SchoolieIcon size={20} />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2.5">
                <div className="flex gap-1">
                  {[0, 150, 300].map(d => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-gray-400">Schoolie is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested prompts */}
        {hasInitialAnalysis && !isLoading && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
            {SUGGESTED_PROMPTS.map(prompt => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-medium rounded-full border border-indigo-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2 shrink-0 border-t border-gray-100">
          <div className="flex gap-2 items-end bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all p-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Schoolie a question..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 resize-none outline-none leading-relaxed py-1 px-1 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
            >
              <Send size={15} />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-1.5">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
};

export default SchoolieUsageAnalysisDrawer;

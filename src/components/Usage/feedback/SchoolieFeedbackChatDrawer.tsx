import React, { useEffect, useRef, useState } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';
import { SchoolieIcon } from '../../Common/Icons';
import { FeedbackRecord } from '../../../types/schoolieFeedbackTypes';
import { DashboardFilters } from './feedbackHelpers';
import { getFeedbackChatResponse } from '../../../services/schoolieService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

const SUGGESTED_PROMPTS = [
  'Why are users giving thumbs down?',
  'Which prompts are performing the worst?',
  'Which KPIs need improvement?',
  'What should we prioritize fixing?',
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filteredData: FeedbackRecord[];
  filters: DashboardFilters;
}

// Simple React-based markdown renderer for AI messages
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

const SchoolieFeedbackChatDrawer: React.FC<Props> = ({ isOpen, onClose, filteredData, filters }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Escape key — capture phase so it fires before the outer drawer's window listener
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen, onClose]);

  // Open → run initial analysis; Close → clear all state
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInputValue('');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    getFeedbackChatResponse('', true, filteredData)
      .then(content => setMessages([{ id: '0', role: 'assistant', content }]))
      .catch(() => setMessages([{ id: '0', role: 'assistant', content: 'An error occurred during analysis. Please close and reopen to try again.', isError: true }]))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
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
    try {
      const response = await getFeedbackChatResponse(content, false, filteredData);
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { id: `e-${Date.now()}`, role: 'assistant', content: 'An error occurred. Please try again.', isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;
  const dataLabel = `${filteredData.length} record${filteredData.length !== 1 ? 's' : ''}${activeFilterCount > 0 ? ` · ${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} applied` : ''}`;

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
              <h3 className="text-base font-bold text-slate-800">Schoolie Analysis</h3>
              <p className="text-[11px] text-gray-400 font-medium">{dataLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
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
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                <SchoolieIcon size={20} />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2.5">
                <div className="flex gap-1">
                  {[0, 150, 300].map(delay => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
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
        {messages.length > 0 && !isLoading && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
            {SUGGESTED_PROMPTS.map(prompt => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-medium rounded-full border border-indigo-200 transition-colors whitespace-nowrap"
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
              className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
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

export default SchoolieFeedbackChatDrawer;

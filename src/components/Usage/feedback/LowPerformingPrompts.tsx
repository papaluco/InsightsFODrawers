import React, { useMemo, useState } from 'react';
import { AlertTriangle, Star, ChevronRight } from 'lucide-react';
import { FeedbackRecord } from '../../../types/feedbackTypes';
import { getPromptName } from './feedbackHelpers';

interface Props {
  data: FeedbackRecord[];
  onPromptClick: (promptName: string) => void;
}

const LOW_THRESHOLD = 70;
const HIGH_THRESHOLD = 80;

type Mode = 'low' | 'high';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const LowPerformingPrompts: React.FC<Props> = ({ data, onPromptClick }) => {
  const [expanded, setExpanded] = useState(true);
  const [mode, setMode] = useState<Mode>('low');

  const isLow = mode === 'low';

  const promptStats = useMemo(() => {
    const map = new Map<string, { helpful: number; total: number }>();
    data.forEach(r => {
      const name = getPromptName(r);
      const cur = map.get(name) ?? { helpful: 0, total: 0 };
      cur.total++;
      if (r.feedbackValue === 'thumbs_up') cur.helpful++;
      map.set(name, cur);
    });
    return [...map.entries()]
      .filter(([, d]) => d.total >= 2)
      .map(([name, d]) => ({
        name,
        pctHelpful: Math.round((d.helpful / d.total) * 100),
        pctNotHelpful: Math.round(((d.total - d.helpful) / d.total) * 100),
        total: d.total,
      }));
  }, [data]);

  const displayed = isLow
    ? promptStats.filter(p => p.pctHelpful < LOW_THRESHOLD).sort((a, b) => a.pctHelpful - b.pctHelpful)
    : promptStats.filter(p => p.pctHelpful >= HIGH_THRESHOLD).sort((a, b) => b.pctHelpful - a.pctHelpful);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex w-full items-center justify-between px-5 py-4 hover:bg-gray-50 rounded-xl">
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          className="min-w-0 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-2">
            {isLow
              ? <AlertTriangle size={15} className="text-amber-500" />
              : <Star size={15} className="text-green-500" />
            }
            <h4 className="text-sm font-semibold text-gray-900">
              {isLow ? 'Low Performing Prompts' : 'High Performing Prompts'}
            </h4>
            <span className="text-xs text-gray-400">
              {isLow ? `(below ${LOW_THRESHOLD}%)` : `(above ${HIGH_THRESHOLD}%)`}
            </span>
          </div>
        </button>
        <div className="ml-4 flex shrink-0 items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
            <button
              onClick={e => { e.stopPropagation(); setMode('low'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors ${
                isLow ? 'bg-red-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <AlertTriangle size={11} />
              Low
            </button>
            <button
              onClick={e => { e.stopPropagation(); setMode('high'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors border-l border-gray-200 ${
                !isLow ? 'bg-green-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Star size={11} />
              High
            </button>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(prev => !prev)}
            className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <CollapseChevron expanded={expanded} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
          {!displayed.length ? (
            <div className={`py-4 text-sm ${isLow ? 'text-green-600' : 'text-gray-400 italic'}`}>
              {isLow
                ? 'All prompts are performing above threshold.'
                : 'No prompts have reached the high performance threshold yet.'
              }
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-3">
                {isLow
                  ? 'The following prompts are underperforming based on user feedback:'
                  : 'The following prompts are exceeding the helpfulness benchmark:'
                }
              </p>
              {displayed.map(item => (
                <button
                  key={item.name}
                  onClick={() => onPromptClick(item.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 transition-colors group text-left ${
                    isLow
                      ? 'hover:bg-red-50 hover:border-red-200'
                      : 'hover:bg-green-50 hover:border-green-200'
                  }`}
                >
                  <div>
                    <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                    <span className="text-xs text-gray-400 ml-2">({item.total} responses)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {isLow ? (
                        <>
                          <span className="text-sm font-bold text-red-500">{item.pctNotHelpful}%</span>
                          <span className="text-xs text-gray-400 ml-1">not helpful</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-bold text-green-600">{item.pctHelpful}%</span>
                          <span className="text-xs text-gray-400 ml-1">helpful</span>
                        </>
                      )}
                    </div>
                    <ChevronRight
                      size={14}
                      className={`text-gray-400 transition-colors ${isLow ? 'group-hover:text-red-500' : 'group-hover:text-green-500'}`}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LowPerformingPrompts;

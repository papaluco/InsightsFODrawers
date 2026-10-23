import React, { useEffect } from 'react';
import { X, Target, ChevronDown, Download } from 'lucide-react';
import { SchoolieIcon } from '../../Common/Icons';
import { KPIAbout } from '../KPIAbout';

// DEMO ONLY: static layout with hardcoded dummy values. Nothing here is calculated.
interface WasteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dateRange?: string;
}

const TABLE_ROWS: { category: string; portions: string; pct: { value: string; of: string }[] }[] = [
  { category: 'Planned', portions: '13,059', pct: [{ value: '100%', of: '' }] },
  { category: 'Produced', portions: '15,883', pct: [{ value: '121.62%', of: 'of Planned' }] },
  {
    category: 'Served',
    portions: '13,387',
    pct: [
      { value: '102.51%', of: 'of Planned' },
      { value: '84.29%', of: 'of Produced' },
    ],
  },
  { category: 'Returned to Stock', portions: '357', pct: [{ value: '2.25%', of: 'of Produced' }] },
  { category: 'Total Waste', portions: '2,139', pct: [{ value: '13.47%', of: 'of Produced' }] },
];

const SectionHeading: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center gap-2 mb-4">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <ChevronDown className="w-5 h-5 text-gray-500" />
  </div>
);

const SummaryBox: React.FC<{
  label: string;
  primary: string;
  secondary: string;
  tertiary?: string;
  tone: 'good' | 'neutral';
}> = ({ label, primary, secondary, tertiary, tone }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center flex-1">
    <div className="text-[11px] uppercase font-semibold text-gray-400 mb-0.5">{label}</div>
    <div className={`text-xl font-bold ${tone === 'good' ? 'text-insightsFavorable' : 'text-gray-900'}`}>{primary}</div>
    <div className="text-sm font-semibold text-gray-600">{secondary}</div>
    {tertiary && <div className="text-xs text-gray-400">{tertiary}</div>}
  </div>
);

export const WasteDrawer: React.FC<WasteDrawerProps> = ({
  isOpen,
  onClose,
  dateRange = 'Jul 1, 2025 - Jun 30, 2026',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">Waste</h2>
                <p className="text-sm text-gray-500">Analysis for {dateRange}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* DEMO ONLY: icons for visual consistency, no actions behind them */}
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Download">
                <Download className="w-5 h-5 text-gray-500" />
              </button>
              <button className="flex items-center px-3 py-1.5 bg-white text-gray-700 hover:text-indigo-600 transition-all" aria-label="Schoolie AI">
                <SchoolieIcon size={60} />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 flex-1 bg-gray-50/30 overflow-y-auto">
          <div className="space-y-6 text-left">
            {/* Production Overview: now shows both % and $ */}
            <div className="mb-6 pb-4 border-b border-gray-100">
              <SectionHeading title="Production Overview" />
              <div className="flex items-center justify-between gap-3">
                <SummaryBox label="Actual Waste" primary="13.47%" secondary="$5,286.21" tone="good" />
                <div className="text-sm font-bold text-gray-300">vs</div>
                <SummaryBox label="Expected Waste" primary="15.00%" secondary="$29,172.00" tone="neutral" />
                <div className="text-sm font-bold text-gray-300">=</div>
                <SummaryBox
                  label="Difference"
                  primary="-1.53 pp"
                  secondary="-$23,885.79"
                  tertiary="(-81.88%)"
                  tone="good"
                />
              </div>
              <p className="text-sm text-gray-600 mt-4 px-1 leading-relaxed">
                A total of <span className="font-bold text-gray-900">15,883</span> portions were produced, of which{' '}
                <span className="font-bold text-gray-900">13,387</span> were served and{' '}
                <span className="font-bold text-gray-900">357</span> were returned to stock, resulting in{' '}
                <span className="font-bold text-gray-900">2,139</span> wasted portions. Waste was{' '}
                <span className="font-bold text-gray-900">13.47%</span> of production, which is{' '}
                <span className="font-semibold text-insightsFavorable">1.53 percentage points lower</span> than the
                expected waste of <span className="font-bold text-gray-900">15.00%</span>. The total value of wasted
                food was <span className="font-bold text-gray-900">$5,286.21</span>, which is{' '}
                <span className="font-semibold text-insightsFavorable">$23,885.79 lower</span> than the expected waste
                of <span className="font-bold text-gray-900">$29,172.00</span>.
              </p>
            </div>

            {/* Production table (unchanged) */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3">Category</th>
                    <th className="text-right font-semibold px-4 py-3">Portions</th>
                    <th className="text-right font-semibold px-4 py-3">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {TABLE_ROWS.map((row) => (
                    <tr key={row.category}>
                      <td className="px-4 py-3 text-gray-800">{row.category}</td>
                      <td className="px-4 py-3 text-right text-gray-800">{row.portions}</td>
                      <td className="px-4 py-3 text-right text-gray-800">
                        {row.pct.map((p) => (
                          <div key={p.value + p.of}>
                            {p.value} {p.of && <span className="text-xs text-gray-500">{p.of}</span>}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Impact (unchanged) */}
            <div className="pt-6 border-t border-gray-100">
              <SectionHeading title="Financial Impact" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Total value of wasted food</span>
                <span className="font-bold text-gray-900">$5,286.21</span>
              </div>
            </div>

            <KPIAbout
              content="Waste measures the amount and financial value of food produced but not served or returned to stock. Actual waste is calculated from recorded waste portions and their associated portion costs and is compared with expected waste to identify the difference in waste performance."
            />
          </div>
        </div>
      </div>
    </>
  );
};

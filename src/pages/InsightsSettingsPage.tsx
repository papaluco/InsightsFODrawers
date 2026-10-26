import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// DEMO ONLY: visual mockup of the system-wide Waste display setting.
// Not persisted and not read by any other component.
type WasteDisplay = 'percent' | 'dollar';

const WASTE_DISPLAY_OPTIONS: { key: WasteDisplay; label: string; gridHeader: string; gridValue: string }[] = [
  { key: 'dollar', label: 'Dollar Amount ($)', gridHeader: 'Waste ($)', gridValue: '$795.57' },
  { key: 'percent', label: 'Percentage (%)', gridHeader: 'Waste (%)', gridValue: '4.7%' },
];

const InsightsSettingsPage = () => {
  const [wasteDisplay, setWasteDisplay] = useState<WasteDisplay>('dollar');
  const selected = WASTE_DISPLAY_OPTIONS.find((o) => o.key === wasteDisplay);

  return (
    <div className="min-h-full">
      <Link
        to="/settings"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Back to Settings
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Insights Settings</h1>
        <p className="text-gray-500 mt-1">Configure how Insights displays data across the system.</p>
      </header>

      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <span className="text-sm font-medium text-gray-700 block mb-1">Waste Display</span>
        <p className="text-sm text-gray-500 mb-3">
          Choose how Waste is shown in Benchmark Configuration, the Performance Grid, and Performance Trends. This
          applies to all users. The Waste details drawer always shows both.
        </p>
        <div className="flex gap-2">
          {WASTE_DISPLAY_OPTIONS.map((option) => {
            const isActive = wasteDisplay === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setWasteDisplay(option.key)}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 inline-flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
          <span className="text-gray-500">Preview: Performance Grid</span>
          <span className="font-medium text-gray-700">{selected?.gridHeader}</span>
          <span className="font-semibold text-gray-900">{selected?.gridValue}</span>
        </div>
      </div>
    </div>
  );
};

export default InsightsSettingsPage;

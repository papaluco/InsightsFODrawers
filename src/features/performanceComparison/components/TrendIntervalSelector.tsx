import React from 'react';
import type { TrendInterval } from '../trend/trendRules';
import { TREND_INTERVAL_LABELS, TrendIntervalOption } from '../trend/trendView';

interface TrendIntervalSelectorProps {
  options: TrendIntervalOption[];
  value: TrendInterval | null;
  onChange: (interval: TrendInterval) => void;
}

/**
 * Day | Week | Month | Quarter (NXT-77211 §7). Incompatible intervals stay visible but
 * disabled, with a tooltip saying why. The title sits on a wrapper because disabled buttons
 * don't show tooltips in every browser.
 */
export const TrendIntervalSelector: React.FC<TrendIntervalSelectorProps> = ({ options, value, onChange }) => (
  <div role="radiogroup" aria-label="Trend interval" className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
    {options.map(option => {
      const isSelected = option.interval === value;
      const label = TREND_INTERVAL_LABELS[option.interval];
      return (
        <span key={option.interval} title={option.disabledReason ?? `Show by ${label.toLowerCase()}`} className="inline-flex">
          <button
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={!option.available}
            onClick={() => onChange(option.interval)}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              isSelected
                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                : 'text-gray-600 hover:text-indigo-600'
            } disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:text-gray-300`}
          >
            {label}
          </button>
        </span>
      );
    })}
  </div>
);

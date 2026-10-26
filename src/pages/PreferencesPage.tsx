import { useState } from 'react';
import { Moon } from 'lucide-react';
import { useInsightsPreferencesStore } from '../store/useInsightsPreferencesStore';
import {
  COLOR_PRESETS,
  InsightsColorScheme,
  InsightsTrendSize,
} from '../constants/insightsColorPresets';
import ColorSwatchPicker from '../components/Common/ColorSwatchPicker';
import TrendIndicator from '../components/Common/TrendIndicator';

const SCHEME_OPTIONS: { key: Exclude<InsightsColorScheme, 'custom'>; label: string }[] = [
  { key: 'default', label: 'Default' },
  { key: 'highContrast', label: 'High Contrast' },
  { key: 'colorVisionFriendly', label: 'Color Vision Friendly' },
  { key: 'alternative', label: 'Alternative' },
];

const TREND_SIZE_OPTIONS: { key: InsightsTrendSize; label: string }[] = [
  { key: 'small', label: 'Small' },
  { key: 'medium', label: 'Medium' },
  { key: 'large', label: 'Large' },
];

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const PreferencesPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const scheme = useInsightsPreferencesStore((state) => state.scheme);
  const colors = useInsightsPreferencesStore((state) => state.colors);
  const trendIndicatorSize = useInsightsPreferencesStore((state) => state.trendIndicatorSize);
  const setScheme = useInsightsPreferencesStore((state) => state.setScheme);
  const setColor = useInsightsPreferencesStore((state) => state.setColor);
  const setTrendIndicatorSize = useInsightsPreferencesStore((state) => state.setTrendIndicatorSize);
  const selectCustomScheme = useInsightsPreferencesStore((state) => state.selectCustomScheme);
  const restoreDefaults = useInsightsPreferencesStore((state) => state.restoreDefaults);

  const isCustomScheme = scheme === 'custom';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Preferences</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Display Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Moon className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-700">Dark mode</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={() => setDarkMode((value) => !value)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="w-full flex items-center justify-between px-4 py-5 sm:px-6 hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-medium text-gray-900">Insights Display Preferences</h3>
            <CollapseChevron expanded={expanded} />
          </button>

          {expanded && (
          <div className="border-t border-gray-100 px-4 py-5 sm:p-6 space-y-6">
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-3">Performance Color Scheme</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {SCHEME_OPTIONS.map((option) => {
                  const preset = COLOR_PRESETS[option.key];
                  const isActive = scheme === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setScheme(option.key)}
                      className={`flex flex-col items-start gap-2 px-3 py-3 rounded-lg border text-left transition-colors ${
                        isActive
                          ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex gap-1">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: preset.favorable }}
                        />
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: preset.unfavorable }}
                        />
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: preset.neutral }}
                        />
                      </div>
                      <span
                        className={`text-sm ${isActive ? 'text-indigo-700 font-medium' : 'text-gray-700'}`}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={selectCustomScheme}
                  className={`flex flex-col items-start gap-2 px-3 py-3 rounded-lg border text-left transition-colors ${
                    isCustomScheme
                      ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex gap-1">
                    <span className="w-3 h-3 rounded-full border border-dashed border-gray-300" />
                    <span className="w-3 h-3 rounded-full border border-dashed border-gray-300" />
                    <span className="w-3 h-3 rounded-full border border-dashed border-gray-300" />
                  </div>
                  <span
                    className={`text-sm ${isCustomScheme ? 'text-indigo-700 font-medium' : 'text-gray-700'}`}
                  >
                    Custom
                  </span>
                </button>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700 block mb-3">Custom Colors</span>
              <div className="space-y-3">
                <ColorSwatchPicker
                  label="Favorable"
                  value={colors.favorable}
                  onChange={(hex) => setColor('favorable', hex)}
                />
                <ColorSwatchPicker
                  label="Unfavorable"
                  value={colors.unfavorable}
                  onChange={(hex) => setColor('unfavorable', hex)}
                />
                <ColorSwatchPicker
                  label="Neutral"
                  value={colors.neutral}
                  onChange={(hex) => setColor('neutral', hex)}
                />
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700 block mb-3">Trend Indicator Size</span>
              <div className="flex gap-2">
                {TREND_SIZE_OPTIONS.map((option) => {
                  const isActive = trendIndicatorSize === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setTrendIndicatorSize(option.key)}
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
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700 block mb-3">Preview</span>
              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-6">
                  <TrendIndicator direction="up" status="favorable" />
                  <TrendIndicator direction="down" status="unfavorable" />
                  <TrendIndicator direction="flat" status="neutral" />
                </div>
                <button
                  type="button"
                  onClick={restoreDefaults}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Restore Defaults
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;

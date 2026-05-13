import { useState, useCallback } from 'react';
import { X, CheckCircle2, Info, Trash2 } from 'lucide-react';
import type {
  TelemetryConfig,
  PerformanceTrackingMode,
  EventCategoryId,
} from '../../../telemetry/types';
import { TelemetryConfigResolver } from '../../../telemetry';
import { MultiSelectDropdown } from '../../Common/MultiSelectDropdown';
import FeedbackKPICard from '../../Usage/feedback/FeedbackKPICard';
import { TAB_TAILWIND , USAGE_ICONS } from '../../Usage/common/usageHelpers';

interface DistrictOption {
  id: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  districtOptions?: DistrictOption[];
}

const EVENT_CATEGORIES: { id: EventCategoryId; label: string; sub: string }[] = [
  {
    id: 'navigation',
    label: 'Page Views & Navigation',
    sub: 'Routes, page views, entry points, and navigation paths.',
  },
  {
    id: 'core_workflows',
    label: 'Core Workflows',
    sub: 'Workflow start, completion, retry, and abandonment events.',
  },
  {
    id: 'feature_engagement',
    label: 'Feature Engagement',
    sub: 'Drawer opens, card clicks, chart interactions, and feature usage.',
  },
  {
    id: 'filters_search',
    label: 'Filters & Search',
    sub: 'Date/site filters, search actions, and filter changes.',
  },
  {
    id: 'grid_interactions',
    label: 'Grid Interactions',
    sub: 'Sorting, pagination, row expansion, and grid-level behavior.',
  },
  {
    id: 'reports_exports',
    label: 'Reports & Exports',
    sub: 'Report generation, export, download, and distribution actions.',
  },
  {
    id: 'ai_interactions',
    label: 'AI Interactions',
    sub: 'Schoolie prompts, recap requests, responses, and AI workflows.',
  },
  {
    id: 'debug_diagnostics',
    label: 'Debug & Diagnostics',
    sub: 'Verbose diagnostic events. Recommended off unless investigating.',
  },
];

const TRACKING_MODES: { value: PerformanceTrackingMode; label: string; sub: string }[] = [
  {
    value: 'off',
    label: 'Off',
    sub: 'No general performance events captured.',
  },
  {
    value: 'slow_only',
    label: 'Slow Only',
    sub: 'Capture only events exceeding configured thresholds.',
  },
  {
    value: 'sampled',
    label: 'Sampled',
    sub: 'Capture a configured percentage of performance events.',
  },
  {
    value: 'full',
    label: 'Full',
    sub: 'Capture every performance event. Best for short investigations.',
  },
];

function Toggle({
  checked,
  onChange,
  label,
  sub,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  sub?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-800'}`}>
          {label}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative shrink-0 w-10 h-5 rounded-full transition-colors focus:outline-none ${
          checked ? 'bg-indigo-500' : 'bg-gray-200'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  sub,
  colorClass = 'bg-indigo-50 text-indigo-600',
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  colorClass?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <p className="text-[11px] text-gray-400">{sub}</p>
      </div>
    </div>
  );
}

function InfoCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
      <Info size={14} className="shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

export const TelemetrySettingsDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  districtOptions = [],
}) => {
  const [cfg, setCfg] = useState<TelemetryConfig>(() =>
    TelemetryConfigResolver.getGlobalConfig()
  );
  const [saved, setSaved] = useState(false);

  const excludedDistrictIds = cfg.excludedDistrictIds ?? [];
  const enabledCategories = cfg.enabledEventCategoryIds;

  const selectedDistricts = districtOptions.filter(district =>
    excludedDistrictIds.includes(district.id)
  );

  const patchCfg = useCallback((patch: Partial<TelemetryConfig>) => {
    setCfg(prev => ({ ...prev, ...patch }));
  }, []);

  const patchPerf = useCallback((patch: Partial<TelemetryConfig['performance']>) => {
    setCfg(prev => ({
      ...prev,
      performance: {
        ...prev.performance,
        ...patch,
      },
    }));
  }, []);

  const toggleCategory = (id: EventCategoryId) => {
    const next = enabledCategories.includes(id)
      ? enabledCategories.filter(categoryId => categoryId !== id)
      : [...enabledCategories, id];

    patchCfg({ enabledEventCategoryIds: next });
  };

  const removeExcludedDistrict = (districtId: string) => {
    patchCfg({
      excludedDistrictIds: excludedDistrictIds.filter(id => id !== districtId),
    });
  };

  const save = () => {
    TelemetryConfigResolver.updateGlobalConfig(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div
      className={`fixed inset-0 bg-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="px-8 py-5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${TAB_TAILWIND.Event}`}>
            <USAGE_ICONS.KPI size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Telemetry Settings</h2>
            <p className="text-xs text-gray-500">
              Global telemetry controls, event categories, and analytics exclusions
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
        <div className="w-full max-w-none space-y-6">
          {/* Status cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FeedbackKPICard
              label="Usage Tracking"
              value={cfg.usageTrackingEnabled ? 'Enabled' : 'Disabled'}
              icon={<USAGE_ICONS.Usage size={20} />}
              colorClass={TAB_TAILWIND.Usage}
            />

            <FeedbackKPICard
              label="Error Tracking"
              value="Always On"
              icon={<USAGE_ICONS.Error size={20} />}
              colorClass={TAB_TAILWIND.Error}
            />

            <FeedbackKPICard
              label="Performance Mode"
              value={cfg.performance.performanceTrackingMode.replace('_', ' ')}
              icon={<USAGE_ICONS.Performance size={20} />}
              colorClass={TAB_TAILWIND.Performance}
            />

            <FeedbackKPICard
              label="Excluded Districts"
              value={excludedDistrictIds.length.toLocaleString()}
              icon={<USAGE_ICONS.District size={20} />}
              colorClass={TAB_TAILWIND.Districts}
            />
          </div>

          {/* Main layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left column */}
            <div className="xl:col-span-7 space-y-6">
              {/* Usage Tracking */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <SectionHeader
                  icon={<USAGE_ICONS.Usage size={16} />}
                  title="Usage Tracking"
                  sub="Controls product analytics capture"
                  colorClass={TAB_TAILWIND.Usage}
                />

                <Toggle
                  checked={cfg.usageTrackingEnabled}
                  onChange={value => patchCfg({ usageTrackingEnabled: value })}
                  label="Usage Tracking Enabled"
                  sub="Capture product usage, page views, workflows, and feature engagement."
                />
              </div>

              {/* Error Tracking */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <SectionHeader
                  icon={<USAGE_ICONS.Error size={16} />}
                  title="Error Tracking"
                  sub="Operational error telemetry"
                  colorClass={TAB_TAILWIND.Error}
                />

                <Toggle
                  checked={true}
                  disabled
                  onChange={() => {}}
                  label="Error Tracking Enabled"
                  sub="Errors are captured globally for operational visibility."
                />

                <Toggle
                  checked={true}
                  disabled
                  onChange={() => {}}
                  label="Always Capture Critical Errors"
                  sub="Critical errors are captured even for excluded districts."
                />

                <Toggle
                  checked={cfg.errorSanitizationEnabled}
                  onChange={value => patchCfg({ errorSanitizationEnabled: value })}
                  label="Error Sanitization"
                  sub="Redact tokens, passwords, and raw payloads from error details."
                />
              </div>

              {/* Performance Tracking */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <SectionHeader
                  icon={<USAGE_ICONS.Performance size={16} />}
                  title="Performance Tracking"
                  sub="Controls performance telemetry capture volume"
                  colorClass={TAB_TAILWIND.Performance}
                />

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                  {TRACKING_MODES.map(mode => {
                    const selected =
                      cfg.performance.performanceTrackingMode === mode.value;

                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() =>
                          patchPerf({ performanceTrackingMode: mode.value })
                        }
                        className={`text-left p-3 rounded-lg border-2 transition-all ${
                          selected
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <p
                          className={`text-sm font-semibold ${
                            selected ? 'text-green-700' : 'text-gray-700'
                          }`}
                        >
                          {mode.label}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {mode.sub}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {cfg.performance.performanceTrackingMode === 'sampled' && (
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                      Sample Rate:{' '}
                      <span className="text-green-600">
                        {Math.round(cfg.performance.performanceSampleRate * 100)}%
                      </span>
                    </label>

                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={Math.round(cfg.performance.performanceSampleRate * 100)}
                      onChange={event =>
                        patchPerf({
                          performanceSampleRate:
                            parseInt(event.target.value, 10) / 100,
                        })
                      }
                      className="w-full accent-green-500"
                    />
                  </div>
                )}

                <Toggle
                  checked={cfg.performance.alwaysCaptureSlowEvents}
                  onChange={value =>
                    patchPerf({ alwaysCaptureSlowEvents: value })
                  }
                  label="Always Capture Slow Events"
                  sub="Slow events are captured regardless of sample rate."
                />

                <Toggle
                  checked={cfg.performance.alwaysCaptureFailedEvents}
                  onChange={value =>
                    patchPerf({ alwaysCaptureFailedEvents: value })
                  }
                  label="Always Capture Failed Events"
                  sub="Failed operations are always captured regardless of tracking mode."
                />

                {cfg.performance.performanceTrackingMode === 'full' && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Full performance tracking may create high event volume. Use
                    mainly for short-term investigations.
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="xl:col-span-5 space-y-6">
              {/* Event Categories */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <SectionHeader
                  icon={<USAGE_ICONS.Event size={16} />}
                  title="Event Categories"
                  sub="Applies to usage and performance telemetry. Errors are tracked separately."
                  colorClass={TAB_TAILWIND.Event}
                />

                <div className="grid grid-cols-1 gap-3">
                  {EVENT_CATEGORIES.map(category => {
                    const checked = enabledCategories.includes(category.id);

                    return (
                      <button
                        type="button"
                        key={category.id}
                        onClick={() => toggleCategory(category.id)}
                        className={`text-left rounded-xl border p-4 transition-all ${
                          checked
                            ? 'border-violet-200 bg-violet-50/60'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center ${
                              checked
                                ? 'bg-violet-600 border-violet-600 text-white'
                                : 'bg-white border-gray-300'
                            }`}
                          >
                            {checked && <CheckCircle2 size={14} />}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {category.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {category.sub}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <InfoCallout>
                  Event categories control which usage and performance events are
                  captured globally. They do not suppress error tracking.
                </InfoCallout>
              </div>

              {/* Excluded Districts */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <SectionHeader
                  icon={<USAGE_ICONS.District size={16} />}
                  title="Excluded Districts"
                  sub="Exclude demo, test, training, and internal districts from usage analytics and rollups"
                  colorClass={TAB_TAILWIND.Districts}
                />

                <MultiSelectDropdown
                  options={districtOptions.map(district => ({
                    value: district.id,
                    label: district.name,
                  }))}
                  selected={excludedDistrictIds}
                  onChange={ids => patchCfg({ excludedDistrictIds: ids })}
                  placeholder="Select districts to exclude"
                  label="District"
                />

                <InfoCallout>
                  Excluded districts are removed from usage analytics and
                  dashboard rollups so demo/test activity does not skew results.
                  Critical errors are still captured for operational visibility.
                </InfoCallout>

                <div className="mt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Selected Districts
                  </p>

                  {selectedDistricts.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDistricts.map(district => (
                        <div
                          key={district.id}
                          className="flex items-center justify-between rounded-lg border border-orange-100 bg-orange-50 px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {district.name}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              {district.id}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeExcludedDistrict(district.id)
                            }
                            className="p-1.5 text-orange-500 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
                      <p className="text-sm text-gray-500">
                        No districts excluded.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        All production districts are included in usage analytics.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 bg-white border-t border-gray-200 flex items-center justify-between shrink-0">
        <p className="text-xs text-gray-400">
          Changes apply to new telemetry events.
        </p>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-xs font-semibold text-emerald-600 animate-pulse">
              Saved!
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={save}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
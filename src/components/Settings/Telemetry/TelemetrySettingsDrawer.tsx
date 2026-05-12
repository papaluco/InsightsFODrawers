import { useState, useCallback } from 'react';
import { X, Radio, Shield, Zap, Users, Plus, Trash2 } from 'lucide-react';
import type {
  TelemetryConfig,
  TelemetryDistrictOverride,
  PerformanceTrackingMode,
} from '../../../telemetry/types';
import { TelemetryConfigResolver } from '../../../telemetry';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-10 h-5 rounded-full transition-colors focus:outline-none ${checked ? 'bg-indigo-500' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function SectionHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">{icon}</div>
      <div>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <p className="text-[11px] text-gray-400">{sub}</p>
      </div>
    </div>
  );
}

const TRACKING_MODES: { value: PerformanceTrackingMode; label: string; sub: string }[] = [
  { value: 'off',      label: 'Off',       sub: 'No performance events captured' },
  { value: 'slow_only',label: 'Slow Only', sub: 'Only events exceeding their threshold' },
  { value: 'sampled',  label: 'Sampled',   sub: 'Capture a % of events randomly' },
  { value: 'full',     label: 'Full',      sub: 'Capture every performance event' },
];

const EMPTY_OVERRIDE: TelemetryDistrictOverride = {
  districtId:              '',
  districtName:            '',
  usageTrackingEnabled:    true,
  errorTrackingEnabled:    true,
  performanceTrackingMode: 'slow_only',
  overrideEnabled:         true,
};

export const TelemetrySettingsDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [cfg,       setCfg]       = useState<TelemetryConfig>(() => TelemetryConfigResolver.getGlobalConfig());
  const [overrides, setOverrides] = useState<TelemetryDistrictOverride[]>(() => TelemetryConfigResolver.getAllDistrictOverrides());
  const [adding,    setAdding]    = useState(false);
  const [newOvr,    setNewOvr]    = useState<TelemetryDistrictOverride>({ ...EMPTY_OVERRIDE });
  const [saved,     setSaved]     = useState(false);

  const patchCfg = useCallback((patch: Partial<TelemetryConfig>) => {
    setCfg(prev => ({ ...prev, ...patch }));
  }, []);

  const patchPerf = useCallback((patch: Partial<TelemetryConfig['performance']>) => {
    setCfg(prev => ({ ...prev, performance: { ...prev.performance, ...patch } }));
  }, []);

  const removeOverride = (districtId: string) => {
    setOverrides(prev => prev.filter(o => o.districtId !== districtId));
  };

  const addOverride = () => {
    if (!newOvr.districtId.trim()) return;
    setOverrides(prev => [...prev.filter(o => o.districtId !== newOvr.districtId), { ...newOvr }]);
    setNewOvr({ ...EMPTY_OVERRIDE });
    setAdding(false);
  };

  const save = () => {
    TelemetryConfigResolver.updateGlobalConfig(cfg);
    for (const o of overrides) TelemetryConfigResolver.setDistrictOverride(o);
    // Remove any overrides that were deleted
    for (const existing of TelemetryConfigResolver.getAllDistrictOverrides()) {
      if (!overrides.find(o => o.districtId === existing.districtId)) {
        TelemetryConfigResolver.removeDistrictOverride(existing.districtId);
      }
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className={`fixed inset-0 bg-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

      {/* Header */}
      <div className="px-8 py-5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Radio size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Telemetry Settings</h2>
            <p className="text-xs text-gray-500">Global tracking configuration and district-level overrides</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
        <div className="max-w-2xl space-y-6">

          {/* ── Error Tracking ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <SectionHeader
              icon={<Shield size={16} className="text-rose-500" />}
              title="Error Tracking"
              sub="Controls when error events are captured and sanitized"
            />
            <Toggle
              checked={cfg.errorTrackingEnabled}
              onChange={v => patchCfg({ errorTrackingEnabled: v })}
              label="Error Tracking Enabled"
              sub="Capture frontend exceptions, API errors, and network errors"
            />
            <Toggle
              checked={cfg.criticalErrorsAlwaysCaptured}
              onChange={v => patchCfg({ criticalErrorsAlwaysCaptured: v })}
              label="Always Capture Critical Errors"
              sub="Critical/crash-level errors are captured even when error tracking is disabled"
            />
            <Toggle
              checked={cfg.errorSanitizationEnabled}
              onChange={v => patchCfg({ errorSanitizationEnabled: v })}
              label="Error Sanitization"
              sub="Redact tokens, passwords, and raw payloads from error messages and stack traces"
            />
          </div>

          {/* ── Usage Tracking ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <SectionHeader
              icon={<Users size={16} className="text-blue-500" />}
              title="Usage Tracking"
              sub="Behavioral analytics — page views, interactions, drawer opens"
            />
            <Toggle
              checked={cfg.usageTrackingEnabled}
              onChange={v => patchCfg({ usageTrackingEnabled: v })}
              label="Usage Tracking Enabled"
              sub="Capture page views, interactions, drawer opens, and feature usage"
            />
            <div className="mt-3 pt-3 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Excluded Districts
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Comma-separated district IDs excluded from usage analytics (demo/test/internal). Errors are still captured for these districts.
              </p>
              <input
                type="text"
                value={cfg.excludedDistrictIds.join(', ')}
                onChange={e => patchCfg({ excludedDistrictIds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder="e.g. demo-001, test-district, internal-qa"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none font-mono"
              />
            </div>
          </div>

          {/* ── Performance Tracking ───────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <SectionHeader
              icon={<Zap size={16} className="text-amber-500" />}
              title="Performance Tracking"
              sub="Controls how aggressively performance events are captured"
            />

            <div className="mb-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Tracking Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {TRACKING_MODES.map(m => (
                  <button
                    key={m.value}
                    onClick={() => patchPerf({ performanceTrackingMode: m.value })}
                    className={`text-left p-3 rounded-lg border-2 transition-all ${
                      cfg.performance.performanceTrackingMode === m.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className={`text-sm font-semibold ${cfg.performance.performanceTrackingMode === m.value ? 'text-indigo-700' : 'text-gray-700'}`}>
                      {m.label}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{m.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {cfg.performance.performanceTrackingMode === 'sampled' && (
              <div className="mb-4 pb-4 border-b border-gray-100">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                  Sample Rate: <span className="text-indigo-600">{Math.round(cfg.performance.performanceSampleRate * 100)}%</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={Math.round(cfg.performance.performanceSampleRate * 100)}
                  onChange={e => patchPerf({ performanceSampleRate: parseInt(e.target.value) / 100 })}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>1%</span><span>50%</span><span>100%</span>
                </div>
              </div>
            )}

            <Toggle
              checked={cfg.performance.alwaysCaptureSlowEvents}
              onChange={v => patchPerf({ alwaysCaptureSlowEvents: v })}
              label="Always Capture Slow Events"
              sub="Slow events are captured regardless of tracking mode or sample rate"
            />
            <Toggle
              checked={cfg.performance.alwaysCaptureFailedEvents}
              onChange={v => patchPerf({ alwaysCaptureFailedEvents: v })}
              label="Always Capture Failed Events"
              sub="Failed operations are always captured regardless of tracking mode"
            />
          </div>

          {/* ── District Overrides ─────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-gray-100">
              <SectionHeader
                icon={<Shield size={16} className="text-emerald-500" />}
                title="District Overrides"
                sub="Per-district tracking configuration — takes precedence over global settings"
              />
              <button
                onClick={() => setAdding(a => !a)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Plus size={13} /> Add Override
              </button>
            </div>

            {adding && (
              <div className="p-5 bg-indigo-50/50 border-b border-indigo-100 space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">New District Override</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">District ID *</label>
                    <input
                      type="text"
                      value={newOvr.districtId}
                      onChange={e => setNewOvr(o => ({ ...o, districtId: e.target.value }))}
                      placeholder="e.g. dist-042"
                      className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-200 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">District Name</label>
                    <input
                      type="text"
                      value={newOvr.districtName}
                      onChange={e => setNewOvr(o => ({ ...o, districtName: e.target.value }))}
                      placeholder="Springfield USD"
                      className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-200 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400"
                      checked={newOvr.usageTrackingEnabled}
                      onChange={e => setNewOvr(o => ({ ...o, usageTrackingEnabled: e.target.checked }))}
                    />
                    <span className="text-xs text-gray-700">Usage Enabled</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400"
                      checked={newOvr.errorTrackingEnabled}
                      onChange={e => setNewOvr(o => ({ ...o, errorTrackingEnabled: e.target.checked }))}
                    />
                    <span className="text-xs text-gray-700">Error Tracking</span>
                  </label>
                  <div>
                    <select
                      value={newOvr.performanceTrackingMode}
                      onChange={e => setNewOvr(o => ({ ...o, performanceTrackingMode: e.target.value as PerformanceTrackingMode }))}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none"
                    >
                      {TRACKING_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={addOverride} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                    Add
                  </button>
                  <button onClick={() => { setAdding(false); setNewOvr({ ...EMPTY_OVERRIDE }); }} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {overrides.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {overrides.map(o => (
                  <div key={o.districtId} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{o.districtName || o.districtId}</p>
                      <p className="text-xs text-gray-400 font-mono">{o.districtId}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs shrink-0 ml-4">
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${o.usageTrackingEnabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        Usage {o.usageTrackingEnabled ? 'On' : 'Off'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${o.errorTrackingEnabled ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-500'}`}>
                        Errors {o.errorTrackingEnabled ? 'On' : 'Off'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700 capitalize">
                        Perf: {o.performanceTrackingMode.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => removeOverride(o.districtId)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-gray-400">
                <Shield size={24} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No district overrides configured.</p>
                <p className="text-xs mt-1">All districts use global defaults.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 bg-white border-t border-gray-200 flex items-center justify-between shrink-0">
        <p className="text-xs text-gray-400">Changes take effect immediately for new events.</p>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs font-semibold text-emerald-600 animate-pulse">Saved!</span>}
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
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

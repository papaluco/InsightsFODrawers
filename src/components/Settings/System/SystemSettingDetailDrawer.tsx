import React from 'react';
import { X, History } from 'lucide-react';
import { SystemSetting } from '../../../data/mockSystemSettingsData';

interface SystemSettingDetailDrawerProps {
  setting: SystemSetting | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') return JSON.stringify(val, null, 2);
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  return String(val);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const Field = ({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
    {/* Added overflow-hidden and break-words to prevent the layout from stretching */}
    <p className={`text-sm text-gray-800 overflow-hidden break-words ${
      mono ? 'font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 whitespace-pre-wrap' : ''
    }`}>
      {value}
    </p>
  </div>
);

export const SystemSettingDetailDrawer: React.FC<SystemSettingDetailDrawerProps> = ({ setting, isOpen, onClose }) => {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-[65]" onClick={onClose} />}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col transition-transform duration-300 ${
          isOpen && setting ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {setting && (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Setting Details</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{setting.settingCode}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              <div className="grid grid-cols-2 gap-4">
                <Field label="Setting Name" value={setting.settingName} />
                <Field label="Code" value={setting.settingCode} mono />
                <Field label="Module" value={setting.module} />
                <Field label="Scope" value={
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${setting.scope === 'Global' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
                    {setting.scope}
                  </span>
                } />
                <Field label="Value Type" value={setting.valueType} />
                {setting.districtName && (
                  <Field label="District" value={setting.districtName} />
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{setting.description}</p>
              </div>

              <div className="border-t border-gray-100 pt-5 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Values</p>
                <Field label="Default Value" value={formatValue(setting.defaultValue)} mono />
                <Field label="Current Value" value={formatValue(setting.currentValue)} mono />
              </div>

              <div className="border-t border-gray-100 pt-5 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Audit</p>
                <Field label="Last Updated By" value={setting.lastUpdatedBy} />
                <Field label="Last Updated" value={formatDate(setting.lastUpdatedAt)} />
              </div>
            </div>

            {/* Footer with history button */}
            <div className="border-t border-gray-100 px-6 py-4 shrink-0">
              <button
                onClick={() => {}}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <History size={15} />
                View History
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

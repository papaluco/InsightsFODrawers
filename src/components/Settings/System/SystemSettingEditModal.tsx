import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { SystemSetting, ValueType } from '../../../data/mockSystemSettingsData';

interface SystemSettingEditModalProps {
  setting: SystemSetting | null;
  onSave: (setting: SystemSetting, newValue: unknown) => void;
  onCancel: () => void;
}

type Step = 'edit' | 'confirm';

function parseValue(raw: string, valueType: ValueType): { value: unknown; error: string } {
  if (!raw.trim()) return { value: null, error: 'This field is required.' };
  switch (valueType) {
    case 'Boolean': {
      if (raw === 'true') return { value: true, error: '' };
      if (raw === 'false') return { value: false, error: '' };
      return { value: null, error: 'Must be true or false.' };
    }
    case 'Number': {
      const n = Number(raw);
      if (isNaN(n)) return { value: null, error: 'Must be a valid number.' };
      return { value: n, error: '' };
    }
    case 'Date': {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return { value: null, error: 'Must be a valid date.' };
      return { value: raw, error: '' };
    }
    case 'JSON': {
      try {
        return { value: JSON.parse(raw), error: '' };
      } catch {
        return { value: null, error: 'Must be valid JSON.' };
      }
    }
    case 'String':
    default:
      return { value: raw, error: '' };
  }
}

function toEditString(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val, null, 2);
  return String(val);
}

const ReadOnlyField = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">{value}</p>
  </div>
);

export const SystemSettingEditModal: React.FC<SystemSettingEditModalProps> = ({ setting, onSave, onCancel }) => {
  const [step, setStep] = useState<Step>('edit');
  const [rawValue, setRawValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (setting) {
      setRawValue(toEditString(setting.currentValue));
      setError('');
      setStep('edit');
    }
  }, [setting]);

  if (!setting) return null;

  const { value: parsedValue, error: validationError } = parseValue(rawValue, setting.valueType);
  const isValid = !validationError;

  const handleNext = () => {
    const { error: err } = parseValue(rawValue, setting.valueType);
    if (err) { setError(err); return; }
    setStep('confirm');
  };

  const handleConfirm = () => {
    onSave(setting, parsedValue);
  };

  const handleValueChange = (val: string) => {
    setRawValue(val);
    const { error: err } = parseValue(val, setting.valueType);
    setError(err);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            {step === 'edit' ? 'Edit Setting' : 'Confirm Change'}
          </h3>
          <button onClick={onCancel} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Edit Step */}
        {step === 'edit' && (
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <ReadOnlyField label="Setting Name" value={setting.settingName} />
              <ReadOnlyField label="Code" value={<span className="font-mono text-xs">{setting.settingCode}</span>} />
              <ReadOnlyField label="Module" value={setting.module} />
              <ReadOnlyField label="Scope" value={setting.scope} />
              <ReadOnlyField label="Value Type" value={setting.valueType} />
              <ReadOnlyField label="Default Value" value={toEditString(setting.defaultValue)} />
            </div>

            {/* Editable current value */}
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                Current Value <span className="text-indigo-500">*</span>
              </p>

              {setting.valueType === 'Boolean' ? (
                <select
                  value={rawValue}
                  onChange={e => handleValueChange(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : setting.valueType === 'Date' ? (
                <input
                  type="date"
                  value={rawValue}
                  onChange={e => handleValueChange(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              ) : setting.valueType === 'Number' ? (
                <input
                  type="number"
                  value={rawValue}
                  onChange={e => handleValueChange(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              ) : setting.valueType === 'JSON' ? (
                <textarea
                  value={rawValue}
                  onChange={e => handleValueChange(e.target.value)}
                  rows={6}
                  className={`w-full text-sm font-mono border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 resize-none ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-300'}`}
                />
              ) : (
                <input
                  type="text"
                  value={rawValue}
                  onChange={e => handleValueChange(e.target.value)}
                  className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-300'}`}
                />
              )}

              {error && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle size={13} className="text-red-500 shrink-0" />
                  <p className="text-xs text-red-500">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirm Step */}
        {step === 'confirm' && (
          <div className="px-6 py-5">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3">
                <AlertTriangle size={24} />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                You are about to change <span className="font-semibold text-gray-900">{setting.settingName}</span>. This may affect system behavior for{' '}
                {setting.scope === 'District' ? 'your district' : 'all districts'}.
                Please confirm you want to proceed.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Previous value</span>
                <span className="font-medium text-gray-700">{toEditString(setting.currentValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">New value</span>
                <span className="font-semibold text-indigo-700">{rawValue}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex border-t border-gray-100">
          <button
            onClick={step === 'edit' ? onCancel : () => setStep('edit')}
            className="flex-1 px-4 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors border-r"
          >
            {step === 'edit' ? 'Cancel' : 'Back'}
          </button>
          {step === 'edit' ? (
            <button
              onClick={handleNext}
              disabled={!isValid && !!error}
              className="flex-1 px-4 py-4 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Review Change
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-4 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={15} /> Save Change
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

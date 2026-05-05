import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { XIcon } from '../../Common/Icons';
import { SystemSetting } from '../../../data/mockSystemSettingsData';
import { getSystemSettings, updateSystemSetting } from '../../../services/systemSettingsService';
import { SystemSettingsFilters, defaultFilters, SystemSettingsFilterState } from './SystemSettingsFilters';
import { SystemSettingsGrid } from './SystemSettingsGrid';
import { SystemSettingEditModal } from './SystemSettingEditModal';
import { SystemSettingDetailDrawer } from './SystemSettingDetailDrawer';

interface SystemSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemSettingsDrawer: React.FC<SystemSettingsDrawerProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SystemSettingsFilterState>(defaultFilters);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [detailSetting, setDetailSetting] = useState<SystemSetting | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    getSystemSettings().then(data => {
      setSettings(data);
      setIsLoading(false);
    });
  }, [isOpen]);

  const handleSave = async (setting: SystemSetting, newValue: unknown) => {
    const updated = await updateSystemSetting(setting.settingId, newValue);
    setSettings(prev => prev.map(s => s.settingId === updated.settingId ? updated : s));
    setEditingSetting(null);
  };

  const handleViewDetails = (setting: SystemSetting) => {
    setDetailSetting(setting);
    setIsDetailOpen(true);
  };

  return (
    <>
      {/* Outer shell always in DOM for transition — no content when closed */}
      <div
        className={`fixed inset-0 bg-white z-50 transition-transform duration-500 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {isOpen && (
          <div className="flex flex-col h-full bg-gray-50">

            {/* Header */}
            <div className="h-20 bg-white border-b px-8 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">System Settings</h1>
                <p className="text-sm text-gray-500">Manage global and district-level configuration</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XIcon size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
              ) : (
                <>
                  <SystemSettingsFilters filters={filters} onChange={setFilters} />
                  <SystemSettingsGrid
                    settings={settings}
                    filters={filters}
                    onEdit={s => setEditingSetting(s)}
                    onViewDetails={handleViewDetails}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals are fixed-position, render only when drawer is open */}
      {isOpen && (
        <>
          <SystemSettingEditModal
            setting={editingSetting}
            onSave={handleSave}
            onCancel={() => setEditingSetting(null)}
          />
          <SystemSettingDetailDrawer
            setting={detailSetting}
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
          />
        </>
      )}
    </>
  );
};

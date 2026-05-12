import { useState } from 'react';
import { Bot, ArrowRight, Settings2, Radio } from 'lucide-react';
import { AIConfigDrawer } from '../components/Settings/AI/AIConfigDrawer';
import { SystemSettingsDrawer } from '../components/Settings/System/SystemSettingsDrawer';
import { TelemetrySettingsDrawer } from '../components/Settings/Telemetry/TelemetrySettingsDrawer';

const MOCK_USER_ROLE = 'customer_support';
const SYSTEM_SETTINGS_ROLES = ['customer_support', 'technical_support'];

const SettingPage = () => {
  const [isAIDrawerOpen,          setIsAIDrawerOpen]          = useState(false);
  const [isSystemDrawerOpen,      setIsSystemDrawerOpen]      = useState(false);
  const [isTelemetryDrawerOpen,   setIsTelemetryDrawerOpen]   = useState(false);

  const canAccessSystemSettings = SYSTEM_SETTINGS_ROLES.includes(MOCK_USER_ROLE);

  return (
    <div className="min-h-full">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings Hub</h1>
        <p className="text-gray-500 mt-1">Manage your platform intelligence and data rules.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Card */}
        <div
          onClick={() => setIsAIDrawerOpen(true)}
          className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <Bot size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">AI Configuration</h3>
          <p className="text-gray-500 text-sm mb-6">Fine-tune model parameters and personas.</p>
          <div className="text-purple-600 font-semibold flex items-center gap-2">
            Configure <ArrowRight size={16} />
          </div>
        </div>

        {/* System Settings Card — role-gated */}
        {canAccessSystemSettings && (
          <div
            onClick={() => setIsSystemDrawerOpen(true)}
            className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
          >
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-4">
              <Settings2 size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">System Settings</h3>
            <p className="text-gray-500 text-sm mb-6">Manage global and district-level configuration.</p>
            <div className="text-teal-600 font-semibold flex items-center gap-2">
              Configure <ArrowRight size={16} />
            </div>
          </div>
        )}

        {/* Telemetry Settings Card */}
        <div
          onClick={() => setIsTelemetryDrawerOpen(true)}
          className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <Radio size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Telemetry Settings</h3>
          <p className="text-gray-500 text-sm mb-6">Configure error, usage, and performance tracking globally or by district.</p>
          <div className="text-indigo-600 font-semibold flex items-center gap-2">
            Configure <ArrowRight size={16} />
          </div>
        </div>
      </div>

      {isAIDrawerOpen && (
        <AIConfigDrawer
          isOpen={isAIDrawerOpen}
          onClose={() => setIsAIDrawerOpen(false)}
        />
      )}

      {isSystemDrawerOpen && (
        <SystemSettingsDrawer
          isOpen={isSystemDrawerOpen}
          onClose={() => setIsSystemDrawerOpen(false)}
        />
      )}

      {isTelemetryDrawerOpen && (
        <TelemetrySettingsDrawer
          isOpen={isTelemetryDrawerOpen}
          onClose={() => setIsTelemetryDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default SettingPage;

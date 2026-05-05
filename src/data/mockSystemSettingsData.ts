export type ValueType = 'Boolean' | 'String' | 'Number' | 'Date' | 'JSON';
export type Scope = 'Global' | 'District';

export interface SystemSetting {
  settingId: string;
  settingName: string;
  settingCode: string;
  module: string;
  scope: Scope;
  valueType: ValueType;
  defaultValue: unknown;
  currentValue: unknown;
  description: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

export const MOCK_SYSTEM_SETTINGS: SystemSetting[] = [
  {
    settingId: 'setting-001',
    settingName: 'Enable Usage Tracking',
    settingCode: 'enable_usage_tracking',
    module: 'System',
    scope: 'District',
    valueType: 'Boolean',
    defaultValue: true,
    currentValue: false,
    description: 'Controls whether usage tracking events are recorded for the district.',
    lastUpdatedBy: 'Jane Smith',
    lastUpdatedAt: '2026-05-04T14:22:00Z',
  },
  {
    settingId: 'setting-002',
    settingName: 'Example JSON Setting',
    settingCode: 'example_json_setting',
    module: 'Insights',
    scope: 'Global',
    valueType: 'JSON',
    defaultValue: { enabled: true, threshold: 10 },
    currentValue: { enabled: true, threshold: 15 },
    description: 'Example JSON-based system setting.',
    lastUpdatedBy: 'Technical Support',
    lastUpdatedAt: '2026-05-04T15:10:00Z',
  },
  {
    settingId: 'setting-003',
    settingName: 'Max Export Rows',
    settingCode: 'max_export_rows',
    module: 'Insights',
    scope: 'Global',
    valueType: 'Number',
    defaultValue: 10000,
    currentValue: 50000,
    description: 'Maximum number of rows allowed in a data export.',
    lastUpdatedBy: 'Admin',
    lastUpdatedAt: '2026-04-15T09:00:00Z',
  },
  {
    settingId: 'setting-004',
    settingName: 'Support Email Address',
    settingCode: 'support_email_address',
    module: 'System',
    scope: 'Global',
    valueType: 'String',
    defaultValue: 'support@cybersoft.net',
    currentValue: 'support@cybersoft.net',
    description: 'Email address used for support notifications.',
    lastUpdatedBy: 'Admin',
    lastUpdatedAt: '2026-03-01T08:00:00Z',
  },
  {
    settingId: 'setting-005',
    settingName: 'Data Refresh Date',
    settingCode: 'data_refresh_date',
    module: 'Insights',
    scope: 'District',
    valueType: 'Date',
    defaultValue: '2026-01-01',
    currentValue: '2026-05-01',
    description: 'Date when district data was last fully refreshed.',
    lastUpdatedBy: 'Jane Smith',
    lastUpdatedAt: '2026-05-01T06:00:00Z',
  },
  {
    settingId: 'setting-006',
    settingName: 'Enable AI Features',
    settingCode: 'enable_ai_features',
    module: 'AI',
    scope: 'District',
    valueType: 'Boolean',
    defaultValue: true,
    currentValue: false,
    description: 'Controls whether AI-powered features such as Schoolie are available to the district.',
    lastUpdatedBy: 'Jane Smith',
    lastUpdatedAt: '2026-04-20T11:30:00Z',
  },
  {
    settingId: 'setting-007',
    settingName: 'Session Timeout (minutes)',
    settingCode: 'session_timeout_minutes',
    module: 'System',
    scope: 'Global',
    valueType: 'Number',
    defaultValue: 30,
    currentValue: 60,
    description: 'Number of minutes before an idle session is automatically logged out.',
    lastUpdatedBy: 'Technical Support',
    lastUpdatedAt: '2026-02-10T14:00:00Z',
  },
];

export const MOCK_MODULES = ['AI', 'Insights', 'System'];

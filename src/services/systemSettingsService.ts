import { SystemSetting, MOCK_SYSTEM_SETTINGS } from '../data/mockSystemSettingsData';

const settingsStore: SystemSetting[] = MOCK_SYSTEM_SETTINGS.map(s => ({ ...s }));

/** Synchronous read — safe to call from fire-and-forget tracking functions. */
export function isSettingEnabled(settingCode: string): boolean {
  const setting = settingsStore.find(s => s.settingCode === settingCode);
  return setting?.currentValue === true;
}

export async function getSystemSettings(): Promise<SystemSetting[]> {
  await delay(150);
  return settingsStore.map(s => ({ ...s }));
}

export async function updateSystemSetting(
  settingId: string,
  newValue: unknown,
  updatedBy = 'Support User'
): Promise<SystemSetting> {
  await delay(200);

  const index = settingsStore.findIndex(s => s.settingId === settingId);
  if (index === -1) throw new Error(`Setting ${settingId} not found`);

  const updated: SystemSetting = {
    ...settingsStore[index],
    currentValue: newValue,
    lastUpdatedBy: updatedBy,
    lastUpdatedAt: new Date().toISOString(),
  };
  settingsStore[index] = updated;

  return { ...updated };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

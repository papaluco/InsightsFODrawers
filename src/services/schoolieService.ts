import { SchooliePrompt, SchoolieVersion, KPIKey, AIResponsePayload } from '../types/SchoolieTypes';
import { initialSchooliePrompts } from '../data/mockSchoolieData';
import { mockSchoolieVersions } from '../data/mockSchoolieVersions';
import { mockAIResponses } from '../data/mockAIResponses';

const promptStore: SchooliePrompt[] = initialSchooliePrompts.map(p => ({ ...p }));
const versionStore: SchoolieVersion[] = [...mockSchoolieVersions];

export async function getPrompts(): Promise<SchooliePrompt[]> {
  await delay(100);
  return [...promptStore];
}

export async function getAllVersions(): Promise<SchoolieVersion[]> {
  await delay(75);
  return [...versionStore];
}

export async function savePrompt(
  id: string,
  promptText: string,
  updatedBy = 'current_user'
): Promise<{ prompt: SchooliePrompt; archivedVersion: SchoolieVersion }> {
  await delay(200);

  const index = promptStore.findIndex(p => p.id === id);
  if (index === -1) throw new Error(`Prompt ${id} not found`);

  const current = promptStore[index];

  const archivedVersion: SchoolieVersion = {
    id: `${id}-v${current.version}`,
    name: current.name,
    version: current.version,
    promptText: current.promptText,
    updatedBy: current.updatedBy,
    updatedAt: current.updatedAt,
  };
  versionStore.push(archivedVersion);

  const updated: SchooliePrompt = {
    ...current,
    promptText,
    version: current.version + 1,
    updatedBy,
    updatedAt: new Date().toISOString().split('T')[0],
  };
  promptStore[index] = updated;

  return { prompt: { ...updated }, archivedVersion: { ...archivedVersion } };
}

export async function getKPIAnalysis(kpiKey: KPIKey): Promise<AIResponsePayload> {
  await delay(1500);
  const response = mockAIResponses[kpiKey];
  if (!response?.data) {
    return { status: 'empty', fromCache: false, isStructured: false, generatedAt: new Date().toISOString() };
  }
  return { ...response, generatedAt: new Date().toISOString() };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

import { SchooliePrompt, SchoolieVersion, KPIKey, AIResponsePayload } from '../types/SchoolieTypes';
import type { FeedbackRecord } from '../types/schoolieFeedbackTypes';
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

export async function getPromptAnalysis(promptId: string): Promise<{ html: string; generatedAt: string } | null> {
  await delay(1500);
  const prompt = promptStore.find(p => p.id === promptId);
  if (!prompt?.previewOutput) return null;
  return { html: prompt.previewOutput.trim(), generatedAt: new Date().toISOString() };
}

export async function getKPIAnalysis(kpiKey: KPIKey): Promise<AIResponsePayload> {
  await delay(1500);
  const response = mockAIResponses[kpiKey];
  if (!response?.data) {
    return { status: 'empty', fromCache: false, isStructured: false, generatedAt: new Date().toISOString() };
  }
  return { ...response, generatedAt: new Date().toISOString() };
}

const USAGE_INITIAL_RESPONSE = `## Report Usage Analysis

Based on the current dataset, here's a summary of report activity across your platform:

**Key Highlights**
- Report usage spans multiple modules and data sources, with a mix of consumer and operator behavior
- Viewing and running activity indicate both exploration and active operational use
- Download and distribution patterns reveal how data leaves the platform

**Patterns to Explore**
- Some reports consistently drive higher engagement across districts
- Module-level activity varies, suggesting uneven feature adoption
- Consumer vs. operator ratios can reveal training or workflow gaps

Ask a follow-up question to dig into specific reports, modules, users, or adoption opportunities.`;

const USAGE_FOLLOW_UP_RESPONSE = `**AI Response**

Based on the current report usage dataset, this is a simulated Schoolie analysis response.

In production, Schoolie would analyze your question using:
- The filtered event data and aggregated usage summary
- The configured system prompt for report analytics
- The last 5 messages for conversational context

Schoolie would identify patterns, surface adoption gaps, and provide data-driven recommendations tailored to your specific question.

*This is a prototype simulation.*`;

export async function getUsageChatResponse(
  userMessage: string,
  isInitial: boolean,
  _systemPrompt: string,
  _payload: Record<string, unknown>
): Promise<string> {
  await delay(isInitial ? 2200 : 1400);
  return isInitial ? USAGE_INITIAL_RESPONSE : USAGE_FOLLOW_UP_RESPONSE;
}

const FOLLOW_UP_RESPONSE = `**AI Response**

Based on the current feedback dataset, this is a simulated Schoolie analysis response.

In production, Schoolie would analyze your question using:
- The filtered feedback records and aggregated summary
- The configured Schoolie Feedback system prompt
- The last 5 messages for conversational context

Schoolie would identify relevant patterns, surface insights, and provide data-driven recommendations tailored to your specific question.

*This is a prototype simulation.*`;

export async function getFeedbackChatResponse(
  userMessage: string,
  isInitial: boolean,
  _data: FeedbackRecord[]
): Promise<string> {
  await delay(isInitial ? 2200 : 1400);
  if (isInitial) {
    const fp = promptStore.find(p => p.id === 'schoolie_feedback');
    return fp?.previewOutput?.trim() ?? 'Analysis complete. Ask a follow-up question to explore the data.';
  }
  return FOLLOW_UP_RESPONSE;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

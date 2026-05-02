export interface SchooliePrompt {
  id: string;
  name: string;
  version: number;
  promptText: string;
  previewOutput: string;
  updatedBy: string;
  updatedAt: string;
}

export interface SchoolieVersion {
  id: string;
  name: string;
  version: number;
  promptText: string;
  updatedBy: string;
  updatedAt: string;
}

export type KPIKey =
  | 'MEALS'
  | 'MEAL_EQUIVALENTS'
  | 'BREAKFAST'
  | 'LUNCH'
  | 'SNACK'
  | 'SUPPER'
  | 'REVENUE'
  | 'WASTE'
  | 'ECON_DISADVANTAGED'
  | 'PAID_NOT_APPLIED'
  | 'ENP'
  | 'MPLH'
  | 'PHYS_INV_DISCREPANCY'
  | 'INV_VALUE'
  | 'INV_TURNOVER';

export interface StructuredAIResponse {
  summary: string;
  whatsWorking: string;
  needsAttention: string;
  recommendation: string;
}

export interface AIResponsePayload {
  status: 'success' | 'error' | 'empty';
  fromCache: boolean;
  isStructured: boolean;
  generatedAt: string;
  data?: StructuredAIResponse;
}

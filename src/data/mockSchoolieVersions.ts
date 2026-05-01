export interface mockSchoolieVersionData {
  id: string;              // unique version id
  name: string;        // ties back to workspace, insights, etc.
  version: number;
  promptText: string;
  updatedBy: string;
  updatedAt: string;
}

// Example versions for WORKSPACE
export const mockSchoolieVersions: mockSchoolieVersionData[] = [
  {
    id: 'workspace-v1',
    name: 'Workspace',
    version: 1,
    promptText: `You are an AI Assistant... (original version)`,
    updatedBy: 'System',
    updatedAt: '2026-03-01'
  },
  {
    id: 'workspace-v2',
    name: 'Workspace',
    version: 2,
    promptText: `You are an AI Assistant... (added HTML formatting instructions)`,
    updatedBy: 'John Smith',
    updatedAt: '2026-03-10'
  },
  {
    id: 'workspace-v3',
    name: 'Workspace',
    version: 3,
    promptText: `You are an AI Assistant... (improved KPI explanation clarity)`,
    updatedBy: 'Jane Admin',
    updatedAt: '2026-03-18'
  },

  // INSIGHTS
  {
    id: 'insights-v1',
    name: 'Insights',
    version: 1,
    promptText: `Analyze MPLH and ENP... (original version)`,
    updatedBy: 'System',
    updatedAt: '2026-03-02'
  },
  {
    id: 'insights-v2',
    name: 'Insights',
    version: 2,
    promptText: `Analyze MPLH, ENP, and PNA... (expanded KPIs)`,
    updatedBy: 'Support Team',
    updatedAt: '2026-03-12'
  },

  // MPLH example
  {
    id: 'mplh-v1',
    name: 'MPLH',
    version: 1,
    promptText: `Analyze MPLH vs benchmark.`,
    updatedBy: 'System',
    updatedAt: '2026-03-05'
  },
  {
    id: 'mplh-v2',
    name: 'MPLH',
    version: 2,
    promptText: `Analyze MPLH vs benchmark and explain labor efficiency clearly.`,
    updatedBy: 'John Smith',
    updatedAt: '2026-03-20'
  }
];
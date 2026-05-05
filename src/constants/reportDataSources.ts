export const REPORT_MODULES = [
  'Accountability',
  'Eligibility',
  'Account Management',
  'K12 Catering',
  'Item Management',
  'Inventory',
  'Menu Planning',
  'Production',
  'Financials',
  'Insights',
  'Reports',
  'System',
] as const;

export type ReportModule = typeof REPORT_MODULES[number];

export interface DataSourceDef {
  key: string;    // raw value stored in context.dataSource
  label: string;  // normalized display name
}

// module → reportType → data sources
// Custom reports: label = report name (data source is the report)
// Other types: label = display name alongside the report
const DS: Partial<Record<ReportModule, Partial<Record<string, DataSourceDef[]>>>> = {
  Accountability: {
    Custom: [
      { key: 'Acc_SaleRollupData',  label: 'Sale Rollup Data' },
      { key: 'Acc_IncomeData',      label: 'Income Data' },
      { key: 'Online_Payments',     label: 'Online Payments' },
      { key: 'Debit_Sales',         label: 'Debit Sales' },
      { key: 'Revenue_Sales',       label: 'Revenue Sales' },
      { key: 'ACH_Deposits',        label: 'ACH Deposits' },
    ],
    PowerBI: [
      { key: 'Activity',        label: 'Activity' },
      { key: 'Edit Check',      label: 'Edit Check' },
      { key: 'Revenue',         label: 'Revenue' },
      { key: 'Cash Collection', label: 'Cash Collection' },
    ],
  },
  'Account Management': {
    Custom: [
      { key: 'AcctMgt_StudentData',                    label: 'Student Data' },
      { key: 'AcctMgt_StudentEligibilityDataForState', label: 'Student Eligibility for State' },
    ],
    MVR: [
      { key: 'Sessions', label: 'Sessions' },
    ],
  },
  Eligibility: {
    Custom: [
      { key: 'Elig_ApplicationData',    label: 'Application Data' },
      { key: 'Elig_Surveys',            label: 'Surveys' },
      { key: 'Elig_DirectCertification', label: 'Direct Certification' },
    ],
  },
  System: {
    Custom: [
      { key: 'Users',               label: 'Users' },
      { key: 'Sites',               label: 'Sites' },
      { key: 'ReimbursementRates',  label: 'Reimbursement Rates' },
      { key: 'PriceTypes',          label: 'Price Types' },
      { key: 'PersonTypes',         label: 'Person Types' },
      { key: 'Templates',           label: 'Templates' },
      { key: 'ProgramConfig',       label: 'Program Config' },
      { key: 'Role',                label: 'Role' },
      { key: 'Period',              label: 'Period' },
      { key: 'SystemSetting',       label: 'System Setting' },
      { key: 'Language',            label: 'Language' },
      { key: 'SiteType',            label: 'Site Type' },
      { key: 'Grade',               label: 'Grade' },
      { key: 'Module',              label: 'Module' },
      { key: 'RDAGroup',            label: 'RDA Group' },
    ],
  },
};

export const DATA_SOURCES_BY_MODULE = DS;

/**
 * Returns data source options for a given module + optional report type.
 * When reportType is provided, returns only data sources for that type.
 * When reportType is omitted, returns all data sources for the module.
 */
export function getDataSourceOptions(module?: string, reportType?: string): DataSourceDef[] {
  if (!module) return [];
  const moduleMap = DS[module as ReportModule];
  if (!moduleMap) return [];
  if (reportType) return moduleMap[reportType] ?? [];
  return Object.values(moduleMap).flat();
}

/**
 * Looks up the normalized label for a raw data source key.
 * Falls back to the key itself if not found.
 */
export function getDataSourceLabel(key: string): string {
  for (const moduleMap of Object.values(DS)) {
    for (const sources of Object.values(moduleMap ?? {})) {
      const found = sources?.find(s => s.key === key);
      if (found) return found.label;
    }
  }
  return key;
}

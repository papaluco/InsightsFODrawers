export interface IOverviewMetric {
  label: string;
  primaryValue: string;
  secondaryValue?: string;
  comparisonLabel?: string;
  status?: 'success' | 'danger' | 'warning' | 'neutral'; 
}

export interface IReportSection {
  type: 'table' | 'text';
  title: string;
  content?: string;
  headers?: string[];
  rows?: any[][];
  
  // --- Styling Metadata ---
  hasTotalRow?: boolean;      // If true, the LAST row in 'rows' gets the Grey/Bold style
  hasSubtotals?: boolean;     // If true, we could look for specific flags in rows
  footerText?: string; 
}

export interface IPDFReportData {
  reportTitle: string;
  subTitle?: string;
  districtName: string;
  overview: {
    plainLanguageSummary?: string;
    metrics: IOverviewMetric[];
  };
  sections: IReportSection[];
  generatedBy: {
    userName: string;
    timestamp: string;
  };
}
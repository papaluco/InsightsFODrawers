export interface IPDFDashMetric {
  label: string;
  primaryValue: string;
  benchmark?: string; 
  trend?: 'up' | 'down' | 'neutral'; 
  status?: 'success' | 'danger' | 'neutral';
}

export interface IPDFDashSection {
  // Added 'table' and 'kpi' to the ID union for stricter typing
  id: 'kpi' | 'grid' | 'trend' | 'table' | string; 
  title: string;
  // Added 'trend' to type to match the new visualization section
  type: 'grid' | 'table' | 'trend'; 
  headers?: string[];
  rows?: (string | number)[][];
  metrics?: IPDFDashMetric[]; 
  /** * Base64 string or URL of the exported chart image 
   * (Used when id is 'trend')
   */
  chartImage?: string; 
}

export interface IPDFDashReportData {
  reportTitle: string;
  subTitle: string;
  districtName: string;
  generatedBy: {
    userName: string;
    timestamp: string;
  };
  sections: IPDFDashSection[];
}
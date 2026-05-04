import { ICSVReportData } from '../CSVContract';

export const CSVReportViewerAdapter = (
  data: any[],
  visibleColumns: string[],
  reportName: string = 'Report'
): ICSVReportData => {
  
  // 1. Internalize District (Matches your MPLH pattern)
  const rawDistrict = "Katy ISD"; 
  const district = rawDistrict.replace(/\s+/g, '_');

  const formatHeader = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim();
  };

  // 2. Map Rows with enhanced sanitization
  const rows = data.map(item => 
    visibleColumns.map(col => {
      let value = item[col];

      // Handle Nulls/Undefined
      if (value === null || value === undefined) return '-';
      
      // Handle Booleans
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      
      // Handle Dates
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        return new Date(value).toLocaleDateString();
      }

      // Handle Numbers (Keep as numbers for Excel formatting)
      if (typeof value === 'number') {
        return value; 
      }

      // Handle Strings (Escape quotes and commas for CSV safety)
      const stringVal = String(value);
      if (stringVal.includes(',') || stringVal.includes('"')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }

      return stringVal;
    })
  );

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);

  return {
    // Matches the naming convention of your other project
    fileName: `${reportName.replace(/\s+/g, '_')}_${district}_${timestamp}.csv`,
    headers: visibleColumns.map(col => formatHeader(col)),
    rows
  };
};
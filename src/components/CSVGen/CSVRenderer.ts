import { ICSVReportData } from './CSVContract';

/**
 * CSVRenderer
 * Handles the conversion of structured data into a downloadable CSV file.
 */
export const CSVRenderer = (data: ICSVReportData): void => {
  const { headers, rows, fileName } = data;

  // 1. Join headers and rows into a single CSV string
  // Best Practice: Handle escaping for values containing commas or quotes
  const escapeValue = (val: string | number) => {
    const stringValue = String(val ?? '');
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const csvContent = [
    headers.map(escapeValue).join(','),
    ...rows.map(row => row.map(escapeValue).join(','))
  ].join('\n');

  // 2. Create a Blob with UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // 3. Trigger Browser Download
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup: Remove from DOM and release memory
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
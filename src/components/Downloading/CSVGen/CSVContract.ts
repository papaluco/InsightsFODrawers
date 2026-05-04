export interface ICSVReportData {
  fileName: string;
  headers: string[];
  rows: (string | number)[][];
}
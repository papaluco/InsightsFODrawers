import { ReportSource } from '../data/ReportTypes';

export const getReportSourceStyle = (source: ReportSource) => {
  switch (source) {
    case ReportSource.Custom:
      return { text: 'CR', bg: 'bg-purple-50 text-purple-600', border: 'border-purple-200' };
    case ReportSource.ManagedView:
      return { text: 'MVR', bg: 'bg-blue-50 text-blue-600', border: 'border-blue-200' };
    case ReportSource.PowerBI:
      return { text: 'PBI', bg: 'bg-yellow-50 text-yellow-700', border: 'border-yellow-200' };
    case ReportSource.Insights:
      return { text: 'INS', bg: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-200' };
    default:
      return { text: 'RPT', bg: 'bg-gray-50 text-gray-600', border: 'border-gray-200' };
  }
};

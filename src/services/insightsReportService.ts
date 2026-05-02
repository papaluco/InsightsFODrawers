import { UnifiedReport, ReportHistoryItem } from '../types/ReportTypes';
import { mockReportData } from '../data/mockReportData';
import { mockReportHistoryData } from '../data/mockReportHistoryData';
import reportResponse from '../data/report_response.json';

const reportStore: UnifiedReport[] = mockReportData.map(r => ({ ...r }));
const reportHistoryStore: ReportHistoryItem[] = [...mockReportHistoryData];

let histIdCounter = reportHistoryStore.length + 1;

export async function getReports(): Promise<UnifiedReport[]> {
  await delay(100);
  return [...reportStore];
}

export async function getReportHistory(reportId?: string): Promise<ReportHistoryItem[]> {
  await delay(75);
  if (reportId) return reportHistoryStore.filter(h => h.reportId === reportId);
  return [...reportHistoryStore];
}

export async function toggleStarReport(id: string): Promise<UnifiedReport> {
  await delay(50);
  const index = reportStore.findIndex(r => r.id === id);
  if (index === -1) throw new Error(`Report ${id} not found`);
  reportStore[index] = { ...reportStore[index], isStarred: !reportStore[index].isStarred };
  return { ...reportStore[index] };
}

export async function runReport(reportId: string): Promise<ReportHistoryItem> {
  await delay(1500);
  const report = reportStore.find(r => r.id === reportId);
  if (!report) throw new Error(`Report ${reportId} not found`);

  const newRun: ReportHistoryItem = {
    id: `hist-run-${String(histIdCounter++).padStart(3, '0')}`,
    reportId,
    name: report.name,
    module: report.module,
    dataSource: report.dataSource,
    sourceType: report.sourceType,
    runDate: new Date().toISOString(),
    status: 'Success',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    distributionDetails: { channels: ['Inbox'], recipients: 'current_user' },
  };

  reportHistoryStore.unshift(newRun);
  return newRun;
}

export async function getReportData(): Promise<unknown> {
  await delay(800);
  return reportResponse;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

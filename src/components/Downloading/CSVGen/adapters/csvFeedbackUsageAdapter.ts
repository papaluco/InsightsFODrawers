import { ICSVReportData } from '../CSVContract';
import { FeedbackRecord } from '../../../../types/feedbackTypes';
import { USER_DISPLAY_NAMES, DISTRICT_DISPLAY_NAMES } from '../../../../data/mockFeedbackData';
import { getPromptName, getPromptTypeDisplay } from '../../../Usage/feedback/feedbackHelpers';

export interface FeedbackColDef {
  key: string;
  label: string;
  getValue: (r: FeedbackRecord) => string | number;
  defaultVisible: boolean;
}

export const FEEDBACK_COLUMNS: FeedbackColDef[] = [
  {
    key: 'district',
    label: 'District',
    getValue: r => (r.contextJson?.districtName as string) ?? DISTRICT_DISPLAY_NAMES[r.districtId] ?? r.districtId,
    defaultVisible: true,
  },
  {
    key: 'user',
    label: 'User',
    getValue: r => USER_DISPLAY_NAMES[r.userId] ?? r.userId,
    defaultVisible: true,
  },
  {
    key: 'promptType',
    label: 'Prompt Type',
    getValue: r => getPromptTypeDisplay(r.sourceEntryPoint),
    defaultVisible: true,
  },
  {
    key: 'promptName',
    label: 'Prompt Name',
    getValue: r => getPromptName(r),
    defaultVisible: true,
  },
  {
    key: 'version',
    label: 'Version',
    getValue: r => `v${r.promptVersion}`,
    defaultVisible: false,
  },
  {
    key: 'platform',
    label: 'Platform',
    getValue: r => r.platform ?? '—',
    defaultVisible: false,
  },
  {
    key: 'feedback',
    label: 'Feedback',
    getValue: r => r.feedbackValue === 'thumbs_up' ? 'Helpful' : 'Not Helpful',
    defaultVisible: true,
  },
  {
    key: 'reasons',
    label: 'Reason Codes',
    getValue: r => (r.reasonCodes ?? []).join(', ') || '—',
    defaultVisible: false,
  },
  {
    key: 'comment',
    label: 'Comment',
    getValue: r => r.comment || '—',
    defaultVisible: true,
  },
  {
    key: 'date',
    label: 'Date',
    getValue: r => new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    defaultVisible: true,
  },
];

const colByKey = new Map(FEEDBACK_COLUMNS.map(c => [c.key, c]));

export const CSVFeedbackUsageAdapter = (
  data: FeedbackRecord[],
  visibleColumns: string[],
  title: string = 'Feedback_Usage'
): ICSVReportData => {
  const rawDistrict = 'Katy ISD';
  const district = rawDistrict.replace(/\s+/g, '_');

  const cols = visibleColumns.filter(k => colByKey.has(k));
  const headers = cols.map(k => colByKey.get(k)!.label);

  const rows = data.map(record =>
    cols.map(k => {
      const val = String(colByKey.get(k)!.getValue(record));
      if (val.includes(',') || val.includes('"')) return `"${val.replace(/"/g, '""')}"`;
      return val;
    })
  );

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);

  return {
    fileName: `${title.replace(/\s+/g, '_')}_${district}_${timestamp}.csv`,
    headers,
    rows,
  };
};

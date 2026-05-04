import { ICSVReportData } from '../CSVContract';
import { FeedbackRecord } from '../../../../types/schoolieFeedbackTypes';
import { FEEDBACK_COLUMNS } from './csvFeedbackUsageAdapter';

export const CSVFeedbackDashAdapter = (data: FeedbackRecord[]): ICSVReportData => {
  const district = 'Katy_ISD';
  const allKeys = FEEDBACK_COLUMNS.map(c => c.key);
  const headers = FEEDBACK_COLUMNS.map(c => c.label);
  const colByKey = new Map(FEEDBACK_COLUMNS.map(c => [c.key, c]));

  const rows = data.map(record =>
    allKeys.map(k => {
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
    fileName: `Schoolie_Feedback_Full_${district}_${timestamp}.csv`,
    headers,
    rows,
  };
};

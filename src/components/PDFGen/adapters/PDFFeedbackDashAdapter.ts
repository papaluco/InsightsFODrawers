import { IPDFDashReportData } from '../PDFDashContract';
import { FeedbackRecord } from '../../../types/schoolieFeedbackTypes';
import { USER_DISPLAY_NAMES, DISTRICT_DISPLAY_NAMES } from '../../../data/mockFeedbackData';
import { getPromptName, getPromptTypeDisplay, pct } from '../../Usage/feedback/feedbackHelpers';

export const prepareFeedbackDashPDFData = (data: FeedbackRecord[]): IPDFDashReportData => {
  const total = data.length;
  const helpfulCount = data.filter(r => r.feedbackValue === 'thumbs_up').length;
  const notHelpfulCount = total - helpfulCount;

  // By prompt type
  const byType = new Map<string, { helpful: number; total: number }>();
  data.forEach(r => {
    const key = getPromptTypeDisplay(r.sourceEntryPoint);
    const entry = byType.get(key) ?? { helpful: 0, total: 0 };
    entry.total++;
    if (r.feedbackValue === 'thumbs_up') entry.helpful++;
    byType.set(key, entry);
  });

  // By prompt name
  const byPrompt = new Map<string, { helpful: number; total: number }>();
  data.forEach(r => {
    const key = getPromptName(r);
    const entry = byPrompt.get(key) ?? { helpful: 0, total: 0 };
    entry.total++;
    if (r.feedbackValue === 'thumbs_up') entry.helpful++;
    byPrompt.set(key, entry);
  });

  // By user
  const byUser = new Map<string, { helpful: number; total: number }>();
  data.forEach(r => {
    const key = USER_DISPLAY_NAMES[r.userId] ?? r.userId;
    const entry = byUser.get(key) ?? { helpful: 0, total: 0 };
    entry.total++;
    if (r.feedbackValue === 'thumbs_up') entry.helpful++;
    byUser.set(key, entry);
  });

  // By district
  const byDistrict = new Map<string, { helpful: number; total: number }>();
  data.forEach(r => {
    const key = (r.contextJson?.districtName as string) ?? DISTRICT_DISPLAY_NAMES[r.districtId] ?? r.districtId;
    const entry = byDistrict.get(key) ?? { helpful: 0, total: 0 };
    entry.total++;
    if (r.feedbackValue === 'thumbs_up') entry.helpful++;
    byDistrict.set(key, entry);
  });

  const toSortedRows = (map: Map<string, { helpful: number; total: number }>): (string | number)[][] =>
    [...map.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .map(([name, v]) => [name, v.total, v.helpful, notHelpfulCount >= 0 ? v.total - v.helpful : 0, pct(v.helpful, v.total)]);

  return {
    reportTitle: 'Schoolie Feedback Dashboard',
    subTitle: `${total} feedback record${total !== 1 ? 's' : ''} — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
    districtName: 'Katy ISD',
    generatedBy: {
      userName: 'Johnathon',
      timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    },
    sections: [
      {
        id: 'kpi',
        title: 'Feedback Overview',
        type: 'grid',
        metrics: [
          { label: 'Total Feedback', primaryValue: String(total), status: 'neutral' },
          {
            label: 'Helpful',
            primaryValue: `${helpfulCount}`,
            benchmark: `${pct(helpfulCount, total)} of total`,
            status: 'success',
          },
          {
            label: 'Not Helpful',
            primaryValue: `${notHelpfulCount}`,
            benchmark: `${pct(notHelpfulCount, total)} of total`,
            status: notHelpfulCount > helpfulCount ? 'danger' : 'neutral',
          },
        ],
      },
      {
        id: 'by-type',
        title: 'Feedback by Prompt Type',
        type: 'table',
        headers: ['Prompt Type', 'Total', 'Helpful', 'Not Helpful', '% Helpful'],
        rows: toSortedRows(byType),
      },
      {
        id: 'by-prompt',
        title: 'Feedback by Prompt Name',
        type: 'table',
        headers: ['Prompt Name', 'Total', 'Helpful', 'Not Helpful', '% Helpful'],
        rows: toSortedRows(byPrompt),
      },
      {
        id: 'by-user',
        title: 'Feedback by User',
        type: 'table',
        headers: ['User', 'Total', 'Helpful', 'Not Helpful', '% Helpful'],
        rows: toSortedRows(byUser),
      },
      {
        id: 'by-district',
        title: 'Feedback by District',
        type: 'table',
        headers: ['District', 'Total', 'Helpful', 'Not Helpful', '% Helpful'],
        rows: toSortedRows(byDistrict),
      },
    ],
  };
};

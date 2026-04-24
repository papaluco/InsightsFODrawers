export enum ReportSource {
  Custom = 1,
  ManagedView = 2,
  PowerBI = 3,
  Insights = 4
}

export interface UnifiedReport {
  id: string;
  name: string;
  description: string;
  module: string;
  dataSource: string;
  sourceType: ReportSource;
  owner: string;
  isStarred: boolean;
  isScheduled: boolean;
  distributionChannels: string[]; // e.g., ['Email', 'Inbox', 'FTP']
  lastRunDate: string | null;
}
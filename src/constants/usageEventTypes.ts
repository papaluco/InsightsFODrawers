export type UsageFeature =
  | "App"
  | "Workspace"
  | "Insights"
  | "Reports"
  | "MenuAnalysis"
  | "Schoolie"
  | "Feedback"
  | "Settings";

export type UsageEventDefinition = {
  eventType: string;
  friendlyName: string;
  feature: UsageFeature;
  description?: string;
};

export const USAGE_EVENT_TYPES = {
  SESSION_STARTED: {
    eventType: "SESSION_STARTED",
    friendlyName: "Started Session",
    feature: "App",
    description: "User entered Insights Workspace."
  },

  APP_CLOSED: {
    eventType: "APP_CLOSED",
    friendlyName: "Closed App",
    feature: "App",
    description: "User closed the browser tab or app session."
  },

  PAGE_VIEWED: {
    eventType: "PAGE_VIEWED",
    friendlyName: "Viewed Page",
    feature: "App",
    description: "User viewed a page in Insights Workspace."
  },

  SITE_FILTER_CHANGED: {
    eventType: "SITE_FILTER_CHANGED",
    friendlyName: "Changed Site Filter",
    feature: "Insights",
    description: "User changed the selected site or site group."
  },

  DATE_RANGE_CHANGED: {
    eventType: "DATE_RANGE_CHANGED",
    friendlyName: "Changed Date Range",
    feature: "Insights",
    description: "User changed the selected date range."
  },

  KPI_RENDERED: {
    eventType: "KPI_RENDERED",
    friendlyName: "Rendered KPI Cards",
    feature: "Insights",
    description: "KPI cards available in the user's dashboard layout were rendered."
  },

  KPI_LAYOUT_UPDATED: {
    eventType: "KPI_LAYOUT_UPDATED",
    friendlyName: "Updated KPI Layout",
    feature: "Insights",
    description: "User changed KPI visibility or order."
  },

  KPI_DRAWER_OPENED: {
    eventType: "KPI_DRAWER_OPENED",
    friendlyName: "Opened KPI Drawer",
    feature: "Insights",
    description: "User opened a district or site KPI drawer."
  },

  TREND_KPI_SELECTED: {
    eventType: "TREND_KPI_SELECTED",
    friendlyName: "Selected Trend KPI",
    feature: "Insights",
    description: "User changed the KPI displayed in the trend chart."
  },

  BENCHMARK_CONFIG_OPENED: {
    eventType: "BENCHMARK_CONFIG_OPENED",
    friendlyName: "Opened Benchmark Configuration",
    feature: "Insights",
    description: "User opened benchmark configuration."
  },

  BENCHMARK_CONFIG_UPDATED: {
    eventType: "BENCHMARK_CONFIG_UPDATED",
    friendlyName: "Updated Benchmark Configuration",
    feature: "Insights",
    description: "User saved benchmark configuration changes."
  },

  BENCHMARK_BULK_UPDATE_USED: {
    eventType: "BENCHMARK_BULK_UPDATE_USED",
    friendlyName: "Used Benchmark Bulk Update",
    feature: "Insights",
    description: "User used the benchmark bulk update action."
  },

  DASHBOARD_DOWNLOAD_TRIGGERED: {
    eventType: "DASHBOARD_DOWNLOAD_TRIGGERED",
    friendlyName: "Downloaded Insights Dashboard",
    feature: "Insights",
    description: "User downloaded the Insights Dashboard PDF."
  },

  KPI_DRAWER_DOWNLOAD_TRIGGERED: {
    eventType: "KPI_DRAWER_DOWNLOAD_TRIGGERED",
    friendlyName: "Downloaded KPI Drawer",
    feature: "Insights",
    description: "User downloaded a KPI drawer PDF or CSV."
  },

  DASHBOARD_SCHOOLIE_OPENED: {
    eventType: "DASHBOARD_SCHOOLIE_OPENED",
    friendlyName: "Opened Dashboard Schoolie",
    feature: "Schoolie",
    description: "User opened Schoolie from the Insights Dashboard."
  },

  KPI_SCHOOLIE_OPENED: {
    eventType: "KPI_SCHOOLIE_OPENED",
    friendlyName: "Opened KPI Schoolie",
    feature: "Schoolie",
    description: "User opened Schoolie from a KPI drawer."
  },

  COMPARE_SITES_SCHOOLIE_OPENED: {
    eventType: "COMPARE_SITES_SCHOOLIE_OPENED",
    friendlyName: "Opened Compare Sites Schoolie",
    feature: "Schoolie",
    description: "User opened Schoolie to compare selected sites."
  },

  TREND_SCHOOLIE_OPENED: {
    eventType: "TREND_SCHOOLIE_OPENED",
    friendlyName: "Opened Trend Analysis Schoolie",
    feature: "Schoolie",
    description: "User opened Schoolie for trend analysis."
  },

  WORKSPACE_AI_REQUEST_STARTED: {
    eventType: "WORKSPACE_AI_REQUEST_STARTED",
    friendlyName: "Started Workspace Daily Recap",
    feature: "Workspace",
    description: "Workspace Daily Recap AI request started."
  },

  WORKSPACE_AI_RESPONSE_SUCCESS: {
    eventType: "WORKSPACE_AI_RESPONSE_SUCCESS",
    friendlyName: "Workspace Daily Recap Completed",
    feature: "Workspace",
    description: "Workspace Daily Recap AI response returned successfully."
  },

  WORKSPACE_AI_RESPONSE_ERROR: {
    eventType: "WORKSPACE_AI_RESPONSE_ERROR",
    friendlyName: "Workspace Daily Recap Failed",
    feature: "Workspace",
    description: "Workspace Daily Recap AI response failed."
  },

  WORKSPACE_SITE_FILTER_CHANGED: {
    eventType: "WORKSPACE_SITE_FILTER_CHANGED",
    friendlyName: "Changed Workspace Site Filter",
    feature: "Workspace",
    description: "User changed site selection for Workspace Daily Recap."
  },

  WORKSPACE_DATE_RANGE_CHANGED: {
    eventType: "WORKSPACE_DATE_RANGE_CHANGED",
    friendlyName: "Changed Workspace Date Range",
    feature: "Workspace",
    description: "User changed date range for Workspace Daily Recap."
  },

  WORKSPACE_NAVIGATION: {
    eventType: "WORKSPACE_NAVIGATION",
    friendlyName: "Navigated from Workspace",
    feature: "Workspace",
    description: "User navigated from Workspace to another area."
  },

  REPORT_VIEWED: {
    eventType: "REPORT_VIEWED",
    friendlyName: "Viewed Report",
    feature: "Reports",
    description: "User opened a previously run report."
  },

  REPORT_RUN: {
    eventType: "REPORT_RUN",
    friendlyName: "Ran Report",
    feature: "Reports",
    description: "User manually ran a report."
  },

  REPORT_DOWNLOADED: {
    eventType: "REPORT_DOWNLOADED",
    friendlyName: "Downloaded Report",
    feature: "Reports",
    description: "User downloaded report output."
  },

  REPORT_DISTRIBUTED: {
    eventType: "REPORT_DISTRIBUTED",
    friendlyName: "Distributed Report",
    feature: "Reports",
    description: "User manually distributed a report."
  },

  REPORT_EMAILED: {
    eventType: "REPORT_EMAILED",
    friendlyName: "Emailed Report",
    feature: "Reports",
    description: "User emailed a report."
  },

  REPORT_CONFIG_VIEWED: {
    eventType: "REPORT_CONFIG_VIEWED",
    friendlyName: "Viewed Report Configuration",
    feature: "Reports",
    description: "User viewed report configuration."
  },

  AI_REQUEST_STARTED: {
    eventType: "AI_REQUEST_STARTED",
    friendlyName: "Started AI Request",
    feature: "Schoolie",
    description: "Schoolie AI request started."
  },

  AI_CACHE_HIT: {
    eventType: "AI_CACHE_HIT",
    friendlyName: "AI Cache Hit",
    feature: "Schoolie",
    description: "Cached Schoolie response was returned."
  },

  AI_RESPONSE_SUCCESS: {
    eventType: "AI_RESPONSE_SUCCESS",
    friendlyName: "AI Response Completed",
    feature: "Schoolie",
    description: "Schoolie AI request completed successfully."
  },

  AI_RESPONSE_ERROR: {
    eventType: "AI_RESPONSE_ERROR",
    friendlyName: "AI Response Failed",
    feature: "Schoolie",
    description: "Schoolie AI request failed."
  },

  SCHOOLIE_FEEDBACK_SUBMITTED: {
    eventType: "SCHOOLIE_FEEDBACK_SUBMITTED",
    friendlyName: "Submitted Schoolie Feedback",
    feature: "Feedback",
    description: "User submitted thumbs up/down feedback for a Schoolie response."
  },

  SETTINGS_OPENED: {
    eventType: "SETTINGS_OPENED",
    friendlyName: "Opened Settings",
    feature: "Settings",
    description: "User opened Settings."
  },

  SYSTEM_SETTING_UPDATED: {
    eventType: "SYSTEM_SETTING_UPDATED",
    friendlyName: "Updated System Setting",
    feature: "Settings",
    description: "User updated a system setting."
  },

  SYSTEM_SETTING_HISTORY_VIEWED: {
    eventType: "SYSTEM_SETTING_HISTORY_VIEWED",
    friendlyName: "Viewed Setting History",
    feature: "Settings",
    description: "User viewed system setting history."
  }
} as const satisfies Record<string, UsageEventDefinition>;

export type UsageEventType = keyof typeof USAGE_EVENT_TYPES;

export function getUsageEventFriendlyName(eventType: string): string {
  return (
    USAGE_EVENT_TYPES[eventType as UsageEventType]?.friendlyName ??
    eventType
  );
}

export function getUsageEventFeature(eventType: string): UsageFeature | "Unknown" {
  return (
    USAGE_EVENT_TYPES[eventType as UsageEventType]?.feature ??
    "Unknown"
  );
}

export function getUsageEventDescription(eventType: string): string {
  return (
    USAGE_EVENT_TYPES[eventType as UsageEventType]?.description ??
    ""
  );
}

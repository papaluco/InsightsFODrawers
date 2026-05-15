// Shared Usage helper constants.
// Goal: one visual language for Usage, App Health, Reports, Insights, Menu Analysis, Schoolie, and related dashboards.
import {
  Activity,
  AlertCircle,
  ArrowUpDown,
  BarChart2,
  Building2,
  CalendarDays,
  Clock,
  Gauge,
  Globe,
  Layers,
  MousePointerClick,
  RefreshCw,
  School,
  Search,
  Shield,
  SlidersHorizontal,
  Target,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';

export const TOPIC_COLORS = {
  Workspace: '#6366f1',       // Indigo
  Insights: '#3b82f6',        // Blue
  MenuAnalysis: '#f97316',    // Orange
  Reports: '#f59e0b',         // Amber
  Usage: '#0ea5e9',           // Sky
  AppHealth: '#10b981',       // Emerald
  Settings: '#64748b',        // Slate

  AI: '#8b5cf6',              // Violet
  Schoolie: '#8b5cf6',        // Same as AI
  Feedback: '#f43f5e',        // Rose

  Users: '#3b82f6',           // Blue
  Districts: '#f97316',       // Orange
  Sessions: '#10b981',        // Emerald
  PageViews: '#6366f1',       // Indigo
  Events: '#8b5cf6',          // Violet fallback
  Interactions: '#14b8a6',    // Teal
  Filters: '#14b8a6',         // Teal
  Drawers: '#3b82f6',         // Blue
  Downloads: '#f59e0b',       // Amber
  Errors: '#ef4444',          // Red
  Performance: '#22c55e',     // Green
  Reliability: '#059669',     // Emerald
  Telemetry: '#64748b',       // Slate
  Search: '#84cc16',          // Lime
  Sort: '#64748b',            // Slate

  MPLH: '#6366f1',
  PNA: '#10b981',
  ENP: '#f59e0b',
  Revenue: '#3b82f6',
  FoodCost: '#ef4444',
  Labor: '#8b5cf6',
  Breakfast: '#06b6d4',
  Lunch: '#f97316',
  ALaCarte: '#ec4899',
  Participation: '#14b8a6',
  Inventory: '#a78bfa',
  Waste: '#fb923c',
  Favorability: '#34d399',
} as const;

export const TOPIC_TAILWIND = {
  Workspace: 'bg-indigo-50 text-indigo-600',
  Insights: 'bg-blue-50 text-blue-600',
  MenuAnalysis: 'bg-orange-50 text-orange-600',
  Reports: 'bg-amber-50 text-amber-600',
  Usage: 'bg-sky-50 text-sky-600',
  AppHealth: 'bg-emerald-50 text-emerald-600',
  Settings: 'bg-slate-50 text-slate-600',
  Feedback: 'bg-rose-50 text-rose-600',

  AI: 'bg-violet-50 text-violet-600',
  Schoolie: 'bg-violet-50 text-violet-600',

  Users: 'bg-blue-50 text-blue-600',
  Districts: 'bg-orange-50 text-orange-600',
  Sessions: 'bg-emerald-50 text-emerald-600',
  PageViews: 'bg-indigo-50 text-indigo-600',
  Events: 'bg-violet-50 text-violet-600',
  Interactions: 'bg-teal-50 text-teal-600',
  Filters: 'bg-teal-50 text-teal-600',
  Drawers: 'bg-blue-50 text-blue-600',
  Downloads: 'bg-amber-50 text-amber-600',
  Errors: 'bg-red-50 text-red-600',
  Performance: 'bg-green-50 text-green-600',
  Reliability: 'bg-emerald-50 text-emerald-600',
  Telemetry: 'bg-slate-50 text-slate-600',
  Search: 'bg-lime-50 text-lime-600',
  Sort: 'bg-slate-50 text-slate-600',

  MPLH: 'bg-indigo-50 text-indigo-600',
  PNA: 'bg-emerald-50 text-emerald-600',
  ENP: 'bg-amber-50 text-amber-600',
  Revenue: 'bg-blue-50 text-blue-600',
  FoodCost: 'bg-red-50 text-red-600',
  Labor: 'bg-violet-50 text-violet-600',
  Breakfast: 'bg-cyan-50 text-cyan-600',
  Lunch: 'bg-orange-50 text-orange-600',
  ALaCarte: 'bg-pink-50 text-pink-600',
  Participation: 'bg-teal-50 text-teal-600',
  Inventory: 'bg-purple-50 text-purple-600',
  Waste: 'bg-orange-50 text-orange-600',
  Favorability: 'bg-emerald-50 text-emerald-600',
} as const;

export const CHART_COLORS = [
  TOPIC_COLORS.Workspace,
  TOPIC_COLORS.Sessions,
  TOPIC_COLORS.Reports,
  TOPIC_COLORS.Insights,
  TOPIC_COLORS.AI,
  TOPIC_COLORS.MenuAnalysis,
  TOPIC_COLORS.Interactions,
  TOPIC_COLORS.Districts,
  TOPIC_COLORS.Telemetry,
  TOPIC_COLORS.Errors,
];

export const PAGE_COLORS: Record<string, string> = {
  Workspace: TOPIC_COLORS.Workspace,
  Insights: TOPIC_COLORS.Insights,
  'Menu Analysis': TOPIC_COLORS.MenuAnalysis,
  MenuAnalysis: TOPIC_COLORS.MenuAnalysis,
  Reports: TOPIC_COLORS.Reports,
  Usage: TOPIC_COLORS.Usage,
  App: TOPIC_COLORS.Workspace,
  'App Health': TOPIC_COLORS.AppHealth,
  AppHealth: TOPIC_COLORS.AppHealth,
  Settings: TOPIC_COLORS.Settings,

  'Schoolie AI': TOPIC_COLORS.AI,
  SchoolieAI: TOPIC_COLORS.AI,
  'Schoolie Feedback': TOPIC_COLORS.Feedback,
  SchoolieFeedback: TOPIC_COLORS.Feedback,

  'AI Configuration': TOPIC_COLORS.AI,
  AIConfiguration: TOPIC_COLORS.AI,
  'System Settings': TOPIC_COLORS.Settings,
  SystemSettings: TOPIC_COLORS.Settings,
  'Telemetry Settings': TOPIC_COLORS.Telemetry,
  TelemetrySettings: TOPIC_COLORS.Telemetry,

  'Error Tracking': TOPIC_COLORS.Errors,
  ErrorTracking: TOPIC_COLORS.Errors,
  Performance: TOPIC_COLORS.Performance,
  'Session Explorer': TOPIC_COLORS.Sessions,
  SessionExplorer: TOPIC_COLORS.Sessions,
  Reliability: TOPIC_COLORS.Reliability,
};

export const TAB_COLORS: Record<string, string> = {
  Overview: TOPIC_COLORS.Workspace,
  Users: TOPIC_COLORS.Users,
  Districts: TOPIC_COLORS.Districts,
  Sessions: TOPIC_COLORS.Sessions,
  Timing: TOPIC_COLORS.Telemetry,
  Funnel: TOPIC_COLORS.Interactions,
  Events: TOPIC_COLORS.Events,
  Usage: TOPIC_COLORS.Usage,
  Errors: TOPIC_COLORS.Errors,
  Error: TOPIC_COLORS.Errors,
  Performance: TOPIC_COLORS.Performance,
  Reliability: TOPIC_COLORS.Reliability,
  PageViews: TOPIC_COLORS.PageViews,
  'Page Views': TOPIC_COLORS.PageViews,
  Interactions: TOPIC_COLORS.Interactions,
  Drawers: TOPIC_COLORS.Drawers,
  Filters: TOPIC_COLORS.Filters,
  Metrics: TOPIC_COLORS.Events,

  Insights: TOPIC_COLORS.Insights,
  MenuAnalysis: TOPIC_COLORS.MenuAnalysis,
  Reports: TOPIC_COLORS.Reports,
  App: TOPIC_COLORS.Workspace,
  'Schoolie AI': TOPIC_COLORS.AI,
  SchoolieAI: TOPIC_COLORS.AI,
  'Schoolie Feedback': TOPIC_COLORS.Feedback,
  SchoolieFeedback: TOPIC_COLORS.Feedback,
  Feedback: TOPIC_COLORS.Feedback,

  'Menu Items': TOPIC_COLORS.MenuAnalysis,
  SchoolPerformance: TOPIC_COLORS.Performance,
};

export const TAB_TAILWIND: Record<string, string> = {
  Overview: TOPIC_TAILWIND.Workspace,
  Users: TOPIC_TAILWIND.Users,
  Districts: TOPIC_TAILWIND.Districts,
  Sessions: TOPIC_TAILWIND.Sessions,
  Timing: TOPIC_TAILWIND.Telemetry,
  Funnel: TOPIC_TAILWIND.Interactions,
  Events: TOPIC_TAILWIND.Events,
  Event: TOPIC_TAILWIND.Events,
  Usage: TOPIC_TAILWIND.Usage,
  Errors: TOPIC_TAILWIND.Errors,
  Error: TOPIC_TAILWIND.Errors,
  Performance: TOPIC_TAILWIND.Performance,
  Reliability: TOPIC_TAILWIND.Reliability,
  PageViews: TOPIC_TAILWIND.PageViews,
  // 'Page Views': TOPIC_TAILWIND.PageViews,
  Interactions: TOPIC_TAILWIND.Interactions,
  Drawers: TOPIC_TAILWIND.Drawers,
  Filters: TOPIC_TAILWIND.Filters,
  Metrics: TOPIC_TAILWIND.Events,

  Insights: TOPIC_TAILWIND.Insights,
  // 'Menu Analysis': TOPIC_TAILWIND.MenuAnalysis,
  MenuAnalysis: TOPIC_TAILWIND.MenuAnalysis,
  Reports: TOPIC_TAILWIND.Reports,
  App: TOPIC_TAILWIND.Workspace,
  // 'Schoolie AI': TOPIC_TAILWIND.AI,
  SchoolieAI: TOPIC_TAILWIND.AI,
  // 'Schoolie Feedback': TOPIC_TAILWIND.AI,
  SchoolieFeedback: TOPIC_TAILWIND.Feedback,
  Feedback: TOPIC_TAILWIND.Feedback,

  // 'Menu Items': TOPIC_TAILWIND.MenuAnalysis,
  MenuItems: TOPIC_TAILWIND.MenuAnalysis,
  'School Performance': TOPIC_TAILWIND.Performance,
  SchoolPerformance: TOPIC_TAILWIND.Performance,
};

export const EVENT_COLORS: Record<string, string> = {
  PAGE_VIEWED: TOPIC_COLORS.PageViews,
  INSIGHTS_PAGE_VIEWED: TOPIC_COLORS.Insights,
  MENU_ANALYSIS_PAGE_VIEWED: TOPIC_COLORS.MenuAnalysis,
  REPORT_VIEWED: TOPIC_COLORS.Reports,

  APP_CLOSED: TOPIC_COLORS.Telemetry,

  KPI_RENDERED: TOPIC_COLORS.Telemetry,
  KPI_DRAWER_OPENED: TOPIC_COLORS.Drawers,
  KPI_DRAWER_DOWNLOAD: TOPIC_COLORS.Downloads,
  KPI_SCHOOLIE_OPENED: TOPIC_COLORS.AI,

  DASHBOARD_DOWNLOAD: TOPIC_COLORS.Downloads,
  DASHBOARD_DOWNLOAD_TRIGGERED: TOPIC_COLORS.Downloads,
  DASHBOARD_SCHOOLIE_OPENED: TOPIC_COLORS.AI,

  SITE_FILTER_CHANGED: TOPIC_COLORS.Filters,
  DATE_RANGE_CHANGED: TOPIC_COLORS.Telemetry,
  TREND_KPI_SELECTED: TOPIC_COLORS.Interactions,
  TREND_KPI_CHANGED: TOPIC_COLORS.Interactions,
  KPI_LAYOUT_UPDATED: TOPIC_COLORS.Telemetry,
  LAYOUT_CONFIG_CHANGED: TOPIC_COLORS.Telemetry,

  BENCHMARK_CONFIG_OPENED: TOPIC_COLORS.Performance,
  BENCHMARK_UPDATED: TOPIC_COLORS.Performance,
  BULK_UPDATE: TOPIC_COLORS.Events,

  REPORT_RUN: TOPIC_COLORS.Reports,
  REPORT_DOWNLOADED: TOPIC_COLORS.Downloads,
  REPORT_DISTRIBUTED: TOPIC_COLORS.Reports,
  REPORT_EMAILED: TOPIC_COLORS.Reports,
  REPORT_CONFIG_VIEWED: TOPIC_COLORS.Telemetry,

  MENU_ITEMS_DRAWER_VIEWED: TOPIC_COLORS.MenuAnalysis,
  SCHOOL_PERFORMANCE_DRAWER_VIEWED: TOPIC_COLORS.Performance,
  MENU_ANALYSIS_METRIC_SELECTED: TOPIC_COLORS.MenuAnalysis,
  MENU_ANALYSIS_DATE_FILTER_CHANGED: TOPIC_COLORS.Telemetry,
  MENU_ANALYSIS_SITE_FILTER_CHANGED: TOPIC_COLORS.Filters,
  MENU_ANALYSIS_DAYS_SERVED_CHANGED: TOPIC_COLORS.Telemetry,
  MENU_ANALYSIS_SCHOOLS_SERVED_CHANGED: TOPIC_COLORS.Districts,
  MENU_ANALYSIS_CATEGORY_FILTER_CHANGED: TOPIC_COLORS.Filters,
  MENU_ANALYSIS_SEARCH_USED: TOPIC_COLORS.Search,
  MENU_ANALYSIS_SORT_CHANGED: TOPIC_COLORS.Sort,

  ERROR_TRACKING_VIEWED: TOPIC_COLORS.Errors,
  ERROR_OCCURRED: TOPIC_COLORS.Errors,
  PERFORMANCE_VIEWED: TOPIC_COLORS.Performance,
  RELIABILITY_VIEWED: TOPIC_COLORS.Reliability,
  SESSION_EXPLORER_VIEWED: TOPIC_COLORS.Sessions,
  TELEMETRY_SETTINGS_VIEWED: TOPIC_COLORS.Telemetry,
  AI_CONFIGURATION_VIEWED: TOPIC_COLORS.AI,
  SYSTEM_SETTINGS_VIEWED: TOPIC_COLORS.Settings,
};

export const KPI_COLORS: Record<string, string> = {
  MPLH: TOPIC_COLORS.MPLH,
  PNA: TOPIC_COLORS.PNA,
  ENP: TOPIC_COLORS.ENP,
  REV: TOPIC_COLORS.Revenue,
  Revenue: TOPIC_COLORS.Revenue,
  FCS: TOPIC_COLORS.FoodCost,
  FoodCost: TOPIC_COLORS.FoodCost,
  LBR: TOPIC_COLORS.Labor,
  Labor: TOPIC_COLORS.Labor,
  BKF: TOPIC_COLORS.Breakfast,
  Breakfast: TOPIC_COLORS.Breakfast,
  LNH: TOPIC_COLORS.Lunch,
  Lunch: TOPIC_COLORS.Lunch,
  ALC: TOPIC_COLORS.ALaCarte,
  ALaCarte: TOPIC_COLORS.ALaCarte,
  PRC: TOPIC_COLORS.Participation,
  Participation: TOPIC_COLORS.Participation,
  TRD: TOPIC_COLORS.Events,
  SBD: TOPIC_COLORS.Telemetry,
  INV: TOPIC_COLORS.Inventory,
  Inventory: TOPIC_COLORS.Inventory,
  WST: TOPIC_COLORS.Waste,
  Waste: TOPIC_COLORS.Waste,
  FVR: TOPIC_COLORS.Favorability,
  Favorability: TOPIC_COLORS.Favorability,

  TotalUsers: TOPIC_COLORS.Users,
  Users: TOPIC_COLORS.Users,
  Districts: TOPIC_COLORS.Districts,
  PageViews: TOPIC_COLORS.PageViews,
  Sessions: TOPIC_COLORS.Sessions,
  Events: TOPIC_COLORS.Events,
  Errors: TOPIC_COLORS.Errors,
  Performance: TOPIC_COLORS.Performance,
  Reliability: TOPIC_COLORS.Reliability,
  Schoolie: TOPIC_COLORS.AI,
  AI: TOPIC_COLORS.AI,
};

export const FUNNEL_COLORS: Record<string, string> = {
  Workspace: TOPIC_COLORS.Workspace,
  Insights: TOPIC_COLORS.Insights,
  MenuAnalysis: TOPIC_COLORS.MenuAnalysis,
  'Menu Analysis': TOPIC_COLORS.MenuAnalysis,
  Reports: TOPIC_COLORS.Reports,
  App: TOPIC_COLORS.Workspace,
  Usage: TOPIC_COLORS.Usage,
  AppHealth: TOPIC_COLORS.AppHealth,
  'App Health': TOPIC_COLORS.AppHealth,
  Schoolie: TOPIC_COLORS.AI,
  AI: TOPIC_COLORS.AI,

  Viewed: TOPIC_COLORS.PageViews,
  Interacted: TOPIC_COLORS.Interactions,
  Interaction: TOPIC_COLORS.Interactions,
  Drawer: TOPIC_COLORS.Drawers,
  Downloaded: TOPIC_COLORS.Downloads,
  Download: TOPIC_COLORS.Downloads,
  Filter: TOPIC_COLORS.Filters,
  Search: TOPIC_COLORS.Search,
  Sort: TOPIC_COLORS.Sort,
  Error: TOPIC_COLORS.Errors,
  Performance: TOPIC_COLORS.Performance,
  Reliability: TOPIC_COLORS.Reliability,
  Sessions: TOPIC_COLORS.Sessions,
  Events: TOPIC_COLORS.Events,
};

export const ENTRY_POINT_COLORS: Record<string, string> = {
  Workspace: TOPIC_COLORS.Workspace,
  InsightsDirect: TOPIC_COLORS.Insights,
  MenuAnalysisDirect: TOPIC_COLORS.MenuAnalysis,
  ReportsDirect: TOPIC_COLORS.Reports,
};

export const ENTRY_POINT_LABELS: Record<string, string> = {
  Workspace: 'Workspace',
  InsightsDirect: 'Insights Direct',
  MenuAnalysisDirect: 'Menu Analysis Direct',
  ReportsDirect: 'Reports Direct',
};

export const getTopicColor = (key?: string, fallback = TOPIC_COLORS.Events): string => {
  if (!key) return fallback;

  return (
    PAGE_COLORS[key] ||
    TAB_COLORS[key] ||
    EVENT_COLORS[key] ||
    KPI_COLORS[key] ||
    FUNNEL_COLORS[key] ||
    TOPIC_COLORS[key as keyof typeof TOPIC_COLORS] ||
    fallback
  );
};

export const getTopicTailwind = (key?: string, fallback = TOPIC_TAILWIND.Events): string => {
  if (!key) return fallback;

  return (
    TAB_TAILWIND[key] ||
    TOPIC_TAILWIND[key as keyof typeof TOPIC_TAILWIND] ||
    fallback
  );
};

export function fmtDuration(minutes: number, isDerived = false): string {
  const m = Math.round(minutes);
  if (m < 1) return isDerived ? '< 1 min (est.)' : '< 1 min';
  if (m < 60) return isDerived ? `${m} min (est.)` : `${m} min`;

  const h = Math.floor(m / 60);
  const rem = m % 60;
  const base = rem > 0 ? `${h}h ${rem}m` : `${h}h`;

  return isDerived ? `${base} (est.)` : base;
}

export function fmtDate(ts: string): string {
  if (!ts) return '—';

  const d = new Date(ts);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function fmtDateTime(ts: string): string {
  if (!ts) return '—';

  const d = new Date(ts);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function fmtRelative(ts: string): string {
  if (!ts) return '—';

  const diff = Date.now() - new Date(ts).getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;

  return `${Math.floor(days / 30)}mo ago`;
}

export function pct(a: number, b: number): string {
  if (b === 0) return '0%';
  return `${Math.round((a / b) * 100)}%`;
}


export const USAGE_ICONS = {
  // Primary pages
  Workspace: Activity,
  Insights: Gauge,
  MenuAnalysis: UtensilsCrossed,
  // 'Menu Analysis': UtensilsCrossed,
  Reports: BarChart2,
  Usage: Activity,
  App: Activity,
  AppHealth: Shield,
  // 'App Health': Shield,
  Settings: SlidersHorizontal,

  // Usage sub-pages / modules
  SchoolieAI: Zap,
  // 'Schoolie AI': Zap,
  SchoolieFeedback: MousePointerClick,
  // 'Schoolie Feedback': MousePointerClick,

  // App Health drawers/pages
  ErrorTracking: AlertCircle,
  // 'Error Tracking': AlertCircle,
  Performance: Zap,
  SessionExplorer: Clock,
  // 'Session Explorer': Clock,
  Reliability: Shield,

  // Settings drawers/pages
  AIConfiguration: Zap,
  'AI Configuration': Zap,
  SystemSettings: SlidersHorizontal,
  'System Settings': SlidersHorizontal,
  TelemetrySettings: Globe,
  'Telemetry Settings': Globe,

  // Common tabs / metrics
  Overview: Activity,
  Users,
  User: Users,
  Districts: Building2,
  District: Building2,
  Sessions: Activity,
  PageViews: MousePointerClick,
  'Page Views': MousePointerClick,
  Timing: Clock,
  Time: Clock,
  Funnel: Layers,
  Events: Globe,
  Event: Globe,
  Interactions: MousePointerClick,
  Drawers: Layers,
  Filters: SlidersHorizontal,
  Metrics: Gauge,

  // Common actions / behaviors
  Search,
  Sort: ArrowUpDown,
  Date: CalendarDays,
  Trends: TrendingUp,
  Frequency: RefreshCw,
  Chart: BarChart2,
  KPI: Target,

  // Menu-specific concepts
  MenuItems: UtensilsCrossed,
  'Menu Items': UtensilsCrossed,
  SchoolPerformance: School,
  // 'School Performance': School,

  // Health concepts
  Errors: AlertCircle,
  Error: AlertCircle,
  UsageMetric: Users,
  PerformanceMetric: Zap,
  ReliabilityMetric: Shield,
} as const;

export const getUsageIcon = (key?: string) => {
  if (!key) return USAGE_ICONS.Events;

  return (
    USAGE_ICONS[key as keyof typeof USAGE_ICONS] ||
    USAGE_ICONS.Events
  );
};
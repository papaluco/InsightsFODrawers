import type { CSSProperties } from 'react';

/**
 * Shared Recharts styling for Insights trend charts, lifted from the dashboard's
 * PerformanceTrends so the Performance Comparison trend (NXT-77211) looks the same.
 * Values are unchanged from the original inline props.
 */

/** Axis tick text (PerformanceTrends X and Y axes). */
export const TREND_AXIS_TICK = {
  fill: '#0f172a',
  fontSize: 9,
  fontWeight: 400,
  letterSpacing: '0.1em',
};

/** Horizontal grid lines only. */
export const TREND_GRID_PROPS = {
  strokeDasharray: '3 3',
  vertical: false,
  stroke: '#f3f4f6',
};

/** Tooltip box. */
export const TREND_TOOLTIP_CONTENT_STYLE: CSSProperties = {
  borderRadius: '8px',
  border: 'none',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

/** Hover highlight behind the active category. */
export const TREND_TOOLTIP_CURSOR = { fill: '#f9fafb' };

/** Benchmark/target line color and dot style. */
export const TREND_TARGET_LINE_COLOR = '#6366f1';

import React, { useId } from 'react';
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  TREND_AXIS_TICK,
  TREND_GRID_PROPS,
  TREND_TOOLTIP_CONTENT_STYLE,
  TREND_TOOLTIP_CURSOR,
} from '../../../components/Common/charts/trendChartStyles';
import { formatKpiAxisValue, formatKpiValue, NO_DATA_TEXT } from '../../../utils/kpiFormatters';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import type { TrendChartData, TrendChartRow } from '../trend/trendView';

/**
 * Sides are told apart by more than color (spec §7, §12): the first comparison's bars are
 * solid, the second's are hatched with an outline, and target lines use different dash
 * patterns. The legend names each by its generated label.
 */
const SIDE_STYLES = {
  left: { bar: '#6366f1', target: '#4338ca', targetDash: '6 4' },
  right: { bar: '#0284c7', hatchBackground: '#e0f2fe', target: '#0369a1', targetDash: '2 3' },
  shared: { target: '#334155' },
} as const;

const NO_TARGET_TEXT = '—';

interface LegendSwatchProps {
  kind: 'solid' | 'hatched' | 'line';
  color: string;
  dash?: string;
  patternId?: string;
}

const LegendSwatch: React.FC<LegendSwatchProps> = ({ kind, color, dash, patternId }) => (
  <svg width="22" height="12" aria-hidden="true" className="shrink-0">
    {kind === 'line' ? (
      <line x1="1" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" strokeDasharray={dash} />
    ) : (
      <rect
        x="4"
        y="1"
        width="14"
        height="10"
        rx="2"
        fill={kind === 'hatched' ? `url(#${patternId})` : color}
        stroke={kind === 'hatched' ? color : 'none'}
        strokeWidth="1.5"
      />
    )}
  </svg>
);

/** Diagonal hatch for the second comparison's bars (and its legend swatch). */
const HatchPattern: React.FC<{ id: string }> = ({ id }) => (
  <pattern id={id} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
    <rect width="6" height="6" fill={SIDE_STYLES.right.hatchBackground} />
    <line x1="0" y1="0" x2="0" y2="6" stroke={SIDE_STYLES.right.bar} strokeWidth="3" />
  </pattern>
);

interface TooltipSideProps {
  kpi: ComparisonKpiKey;
  label: string;
  periodLabel: string | null;
  actual: number | null;
  target: number | null;
  showTarget: boolean;
  swatch: React.ReactNode;
}

const TooltipSide: React.FC<TooltipSideProps> = ({ kpi, label, periodLabel, actual, target, showTarget, swatch }) => (
  <div className="flex flex-col gap-0.5">
    <div className="flex items-center gap-1.5 font-semibold text-gray-800">
      {swatch}
      <span>{label}</span>
    </div>
    {periodLabel === null ? (
      <div className="pl-7 text-gray-400">No matching period</div>
    ) : (
      <div className="pl-7 text-gray-600">
        <span className="text-gray-400">{periodLabel}:</span>{' '}
        <span className="font-semibold text-gray-900">{formatKpiValue(kpi, actual, NO_DATA_TEXT)}</span>
        {showTarget && <span className="text-gray-500"> · Target {formatKpiValue(kpi, target, NO_TARGET_TEXT)}</span>}
      </div>
    )}
  </div>
);

interface ComparisonTrendChartProps {
  kpi: ComparisonKpiKey;
  data: TrendChartData;
  leftLabel: string;
  rightLabel: string;
  /** False for informational KPIs: no target lines or target text. */
  showTargets: boolean;
}

/**
 * Paired-bar trend for one KPI (NXT-77211 §7): one Recharts ComposedChart with left and right
 * actual bars per aligned interval and a target line per side (one shared line when the
 * targets are identical). No Data buckets are gaps, never zero bars.
 */
export const ComparisonTrendChart: React.FC<ComparisonTrendChartProps> = ({ kpi, data, leftLabel, rightLabel, showTargets }) => {
  const patternId = `trend-hatch-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const legendPatternId = `${patternId}-legend`;
  const { rows, targetsMerged, hasLeftTarget, hasRightTarget } = data;
  const manyTicks = rows.length > 14;

  const renderTooltip = ({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }> }) => {
    const row = payload?.[0]?.payload as TrendChartRow | undefined;
    if (!active || !row) return null;
    const leftTarget = targetsMerged ? row.sharedTarget : row.leftTarget;
    const rightTarget = targetsMerged ? row.sharedTarget : row.rightTarget;
    return (
      <div style={TREND_TOOLTIP_CONTENT_STYLE} className="bg-white px-3 py-2.5 text-xs flex flex-col gap-2 max-w-xs">
        <div className="font-bold text-gray-900">{row.axisLabel}</div>
        <TooltipSide
          kpi={kpi}
          label={leftLabel}
          periodLabel={row.leftPeriodLabel}
          actual={row.leftActual}
          target={leftTarget}
          showTarget={showTargets}
          swatch={<LegendSwatch kind="solid" color={SIDE_STYLES.left.bar} />}
        />
        <TooltipSide
          kpi={kpi}
          label={rightLabel}
          periodLabel={row.rightPeriodLabel}
          actual={row.rightActual}
          target={rightTarget}
          showTarget={showTargets}
          swatch={<LegendSwatch kind="hatched" color={SIDE_STYLES.right.bar} patternId={legendPatternId} />}
        />
      </div>
    );
  };

  const targetLine = (dataKey: keyof TrendChartRow, name: string, color: string, dash?: string) => (
    <Line
      type="linear"
      dataKey={dataKey}
      name={name}
      stroke={color}
      strokeWidth={2}
      strokeDasharray={dash}
      dot={rows.length <= 24 ? { r: 2.5, fill: '#fff', stroke: color, strokeWidth: 1.5 } : false}
      activeDot={{ r: 4 }}
      connectNulls={false}
      isAnimationActive={false}
    />
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Legend: generated labels, bar fill, and line dash identify each side without color */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <HatchPattern id={legendPatternId} />
        </defs>
      </svg>
      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-700">
        <li className="flex items-center gap-1.5">
          <LegendSwatch kind="solid" color={SIDE_STYLES.left.bar} />
          {leftLabel}
        </li>
        <li className="flex items-center gap-1.5">
          <LegendSwatch kind="hatched" color={SIDE_STYLES.right.bar} patternId={legendPatternId} />
          {rightLabel}
        </li>
        {targetsMerged && (
          <li className="flex items-center gap-1.5">
            <LegendSwatch kind="line" color={SIDE_STYLES.shared.target} />
            Target · both comparisons
          </li>
        )}
        {!targetsMerged && hasLeftTarget && (
          <li className="flex items-center gap-1.5">
            <LegendSwatch kind="line" color={SIDE_STYLES.left.target} dash={SIDE_STYLES.left.targetDash} />
            Target · {leftLabel}
          </li>
        )}
        {!targetsMerged && hasRightTarget && (
          <li className="flex items-center gap-1.5">
            <LegendSwatch kind="line" color={SIDE_STYLES.right.target} dash={SIDE_STYLES.right.targetDash} />
            Target · {rightLabel}
          </li>
        )}
      </ul>

      <div className="h-[340px] w-full" role="img" aria-label={`Trend chart: ${leftLabel} compared with ${rightLabel}`}>
        {/* initialDimension avoids Recharts 3 logging width(-1) before the first measurement. */}
        <ResponsiveContainer width="100%" height="100%" debounce={1} initialDimension={{ width: 1, height: 1 }}>
          <ComposedChart data={rows} margin={{ top: 10, right: 16, left: 4, bottom: manyTicks ? 24 : 4 }} barGap={2}>
            <defs>
              <HatchPattern id={patternId} />
            </defs>
            <CartesianGrid {...TREND_GRID_PROPS} />
            <XAxis
              dataKey="axisLabel"
              axisLine={false}
              tickLine={false}
              tick={TREND_AXIS_TICK}
              interval="preserveStartEnd"
              minTickGap={8}
              angle={manyTicks ? -45 : 0}
              textAnchor={manyTicks ? 'end' : 'middle'}
              height={manyTicks ? 50 : 30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={TREND_AXIS_TICK}
              tickFormatter={(value: number) => formatKpiAxisValue(kpi, value)}
              width={64}
            />
            <Tooltip cursor={TREND_TOOLTIP_CURSOR} content={renderTooltip} />
            <Bar dataKey="leftActual" name={leftLabel} fill={SIDE_STYLES.left.bar} maxBarSize={28} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            <Bar
              dataKey="rightActual"
              name={rightLabel}
              fill={`url(#${patternId})`}
              stroke={SIDE_STYLES.right.bar}
              strokeWidth={1.5}
              maxBarSize={28}
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
            />
            {targetsMerged && targetLine('sharedTarget', 'Target · both comparisons', SIDE_STYLES.shared.target)}
            {!targetsMerged && hasLeftTarget && targetLine('leftTarget', `Target · ${leftLabel}`, SIDE_STYLES.left.target, SIDE_STYLES.left.targetDash)}
            {!targetsMerged && hasRightTarget && targetLine('rightTarget', `Target · ${rightLabel}`, SIDE_STYLES.right.target, SIDE_STYLES.right.targetDash)}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

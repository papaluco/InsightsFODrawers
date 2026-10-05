import type { SideTargetAttainment } from '../selectors/selectComparison';

/**
 * Comparison Summary text (NXT-77208, spec §8). Wording only: every count comes from the
 * selector's summary, which counts engine results.
 */

/** "14 KPIs compared", "1 KPI compared". The count is directional KPIs in scope. */
export function getKpisComparedText(directional: number): string {
  return `${directional} ${directional === 1 ? 'KPI' : 'KPIs'} compared`;
}

/** Shown for a side with no directional KPI in scope that has both data and a target. */
export const NO_ATTAINMENT_TEXT = 'No KPIs with data and a target';

export interface AttainmentText {
  /** Bold part: "8 of 13". */
  count: string;
  /** "KPIs meeting target" ("KPI" when the denominator is 1). */
  rest: string;
  /** Share meeting target, whole percent: "62%". */
  percent: string;
}

/** "8 of 13 KPIs meeting target · 62%" in parts; null when there is nothing to count (NO_ATTAINMENT_TEXT). */
export function getAttainmentText({ meetingTarget, kpisWithTarget }: SideTargetAttainment): AttainmentText | null {
  if (kpisWithTarget === 0) return null;
  return {
    count: `${meetingTarget} of ${kpisWithTarget}`,
    rest: `${kpisWithTarget === 1 ? 'KPI' : 'KPIs'} meeting target`,
    percent: `${Math.round((meetingTarget / kpisWithTarget) * 100)}%`,
  };
}

import { IsoDate } from '../utils/dateOnly';
import { ComparisonKpiKey } from './kpiTypes';

/**
 * Data shapes behind Performance Comparison (NXT-77201 spec §9).
 *
 * Facts are the additive components each KPI is built from, so every KPI can be
 * aggregated correctly over any set of sites and days (sums, ratio of sums,
 * point-in-time). The production API should supply the same components.
 */

/** One site on one serving day. Rows exist only for serving days on which the site was open. */
export interface DailySiteFacts {
  siteId: number;
  date: IsoDate;

  /** Students enrolled that day. Denominator for participation (enrollment × serving days), Eco Dis, and PNA. */
  enrollment: number;

  // Meals served by type (each ≤ enrollment, so participation never exceeds 100%)
  breakfastMeals: number;
  lunchMeals: number;
  snackMeals: number;
  supperMeals: number;

  /** Eco Dis numerator (÷ enrollment). */
  ecoDisStudents: number;
  /** PNA numerator (÷ enrollment, i.e. "students", as in calculateDistrictPNA). */
  paidNotAppliedStudents: number;
  /** ENP denominator. */
  eligibleStudents: number;
  /** ENP numerator (÷ eligibleStudents). */
  eligibleNotParticipating: number;

  /** Meals = breakfast + lunch + snack + supper. */
  meals: number;
  /** Meal equivalents. MPLH numerator. */
  meqs: number;
  /** MPLH denominator. */
  laborHours: number;

  // Dollars
  revenue: number;
  aLaCarteSales: number;
  reimbursement: number;
  waste: number;
}

/** One site's month-end inventory snapshot. */
export interface InventorySnapshot {
  siteId: number;
  /** Month-end date of the count. */
  date: IsoDate;
  inventoryValue: number;
  /** Days of usage on hand. Aggregated as Σ value ÷ Σ (value ÷ turnoverDays). */
  turnoverDays: number;
  discrepancyDollars: number;
  /** discrepancyDollars ÷ inventoryValue × 100. Aggregated as Σ $ ÷ Σ value. */
  discrepancyPercent: number;
}

export type BenchmarkScope = 'district' | 'siteType' | 'site';

/**
 * One configured benchmark (spec §9).
 * For sum KPIs (Revenue, Meals, MEQs, A La Carte, Reimbursement, Waste) `value` is a rate
 * per site per serving day; the side target is that rate × elapsed site-serving-days.
 * For every other KPI `value` is directly comparable with the KPI's value.
 */
export interface BenchmarkRow {
  kpi: ComparisonKpiKey;
  /** School year start year (SY 2025–26 → 2025). */
  schoolYear: number;
  scope: BenchmarkScope;
  /** siteTypeId or siteId; omitted for district. */
  scopeId?: number;
  /** null = not configured at this scope (falls through to the next scope). */
  value: number | null;
}

export interface ResolvedBenchmark {
  value: number | null;
  /** Which scope supplied the value; null when no benchmark applies. */
  source: BenchmarkScope | null;
}

import { getKpiDefinition } from '../constants/kpiDefinitions';
import { DailySiteFacts, InventorySnapshot } from '../types/comparisonDataTypes';
import { ComparisonKpiKey } from '../types/kpiTypes';

/**
 * KPI aggregation from additive facts (NXT-77201 spec §4, §9).
 *
 * Pure functions with no mock-data imports: this is the logic the production API must
 * reproduce. Rules:
 * - sum KPIs → total over the sites and days given.
 * - ratio KPIs → ratio of sums (Σ numerator ÷ Σ denominator), never an average of ratios.
 * - inventory KPIs → point-in-time: each site's last snapshot in the period, combined.
 * - No rows / zero denominator → null (No Data), never 0.
 */

type NumericFactField = Exclude<keyof DailySiteFacts, 'siteId' | 'date'>;

export interface RatioComponents {
  numerator: NumericFactField;
  denominator: NumericFactField;
}

/** Components of each ratio KPI. Percent KPIs are ×100 (see kpiDefinitions displayFormat). */
export const RATIO_KPI_COMPONENTS: Partial<Record<ComparisonKpiKey, RatioComponents>> = {
  Breakfast: { numerator: 'breakfastMeals', denominator: 'enrollment' },
  Lunch: { numerator: 'lunchMeals', denominator: 'enrollment' },
  Snack: { numerator: 'snackMeals', denominator: 'enrollment' },
  Supper: { numerator: 'supperMeals', denominator: 'enrollment' },
  'Eco Dis': { numerator: 'ecoDisStudents', denominator: 'enrollment' },
  PNA: { numerator: 'paidNotAppliedStudents', denominator: 'enrollment' },
  ENP: { numerator: 'eligibleNotParticipating', denominator: 'eligibleStudents' },
  MPLH: { numerator: 'meqs', denominator: 'laborHours' },
};

/** Fact field summed for each sum KPI. */
export const SUM_KPI_FIELDS: Partial<Record<ComparisonKpiKey, NumericFactField>> = {
  Revenue: 'revenue',
  Meals: 'meals',
  MEQs: 'meqs',
  'A La Carte': 'aLaCarteSales',
  Reimbursement: 'reimbursement',
  Waste: 'waste',
};

const sumField = (facts: DailySiteFacts[], field: NumericFactField): number =>
  facts.reduce((total, row) => total + row[field], 0);

/** A daily-fact KPI (sum or ratio) over the given rows. Null when there are no rows or the denominator is 0. */
export function aggregateDailyKpi(kpi: ComparisonKpiKey, facts: DailySiteFacts[]): number | null {
  if (facts.length === 0) return null;

  const sumFieldName = SUM_KPI_FIELDS[kpi];
  if (sumFieldName) return sumField(facts, sumFieldName);

  const ratio = RATIO_KPI_COMPONENTS[kpi];
  if (!ratio) throw new Error(`"${kpi}" is not aggregated from daily facts`);
  const denominator = sumField(facts, ratio.denominator);
  if (denominator === 0) return null;
  const scale = getKpiDefinition(kpi).displayFormat === 'percent' ? 100 : 1;
  return (sumField(facts, ratio.numerator) / denominator) * scale;
}

/** Each site's latest snapshot among those given. */
export function latestSnapshotPerSite(snapshots: InventorySnapshot[]): InventorySnapshot[] {
  const latest = new Map<number, InventorySnapshot>();
  for (const snapshot of snapshots) {
    const current = latest.get(snapshot.siteId);
    if (!current || snapshot.date > current.date) latest.set(snapshot.siteId, snapshot);
  }
  return Array.from(latest.values());
}

/**
 * An inventory KPI (point-in-time) from the snapshots in a period: each site's last
 * snapshot, combined across sites.
 * - Inventory Value: Σ value
 * - Inventory Turnover Rate: Σ value ÷ Σ daily usage, where usage = value ÷ turnover days
 * - Physical Inventory Discrepancy: Σ discrepancy $ ÷ Σ value × 100 (% of total inventory value)
 */
export function aggregateInventoryKpi(kpi: ComparisonKpiKey, snapshots: InventorySnapshot[]): number | null {
  const latest = latestSnapshotPerSite(snapshots);
  if (latest.length === 0) return null;
  const totalValue = latest.reduce((t, s) => t + s.inventoryValue, 0);

  switch (kpi) {
    case 'Inventory Value':
      return totalValue;
    case 'Inventory Turnover Rate': {
      const dailyUsage = latest.reduce((t, s) => t + (s.turnoverDays > 0 ? s.inventoryValue / s.turnoverDays : 0), 0);
      return dailyUsage === 0 ? null : totalValue / dailyUsage;
    }
    case 'Physical Inventory Discrepancy':
      return totalValue === 0 ? null : (latest.reduce((t, s) => t + s.discrepancyDollars, 0) / totalValue) * 100;
    default:
      throw new Error(`"${kpi}" is not an inventory KPI`);
  }
}

/** Physical Inventory Discrepancy $ (shown alongside the %): Σ of each site's last snapshot. */
export function aggregateInventoryDiscrepancyDollars(snapshots: InventorySnapshot[]): number | null {
  const latest = latestSnapshotPerSite(snapshots);
  return latest.length === 0 ? null : latest.reduce((t, s) => t + s.discrepancyDollars, 0);
}

/** Any KPI, choosing the rule from its definition. */
export function aggregateKpi(
  kpi: ComparisonKpiKey,
  facts: DailySiteFacts[],
  snapshots: InventorySnapshot[],
): number | null {
  return getKpiDefinition(kpi).aggregation === 'pointInTime'
    ? aggregateInventoryKpi(kpi, snapshots)
    : aggregateDailyKpi(kpi, facts);
}

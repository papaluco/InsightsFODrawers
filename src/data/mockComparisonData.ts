import { DEMO_AS_OF_DATE } from '../constants/demo';
import { DailySiteFacts, InventorySnapshot } from '../types/comparisonDataTypes';
import { addDays, eachDay, endOfMonth, IsoDate } from '../utils/dateOnly';
import { getSchoolYear } from '../utils/schoolYear';
import { isServingDay } from './mockSchoolCalendar';
import { DEMO_SITES, Site, SITE_TYPE_IDS } from './siteRegistry';

/**
 * Performance Comparison mock data generator (NXT-77201 spec §9).
 *
 * Generates, in memory and deterministically (seeded PRNG keyed by site + date):
 * - Daily per-site facts for every serving day from 2023-07-01 to DEMO_AS_OF_DATE.
 * - One inventory snapshot per site per month (month-end count).
 *
 * Values are plausible mocks, not production formulas. They store the additive
 * components each KPI needs (see DailySiteFacts) so every KPI aggregates correctly.
 *
 * Mock component definitions (Phase 2 brief):
 * - Breakfast/Lunch/Snack/Supper participation = meals of that type ÷ (enrollment × serving days)
 * - Eco Dis = economically disadvantaged students ÷ enrollment
 * - PNA = paid-not-applied students ÷ students (enrollment)
 * - ENP = eligible-not-participating students ÷ eligible students
 * - MPLH = MEQs ÷ labor hours
 * - Meals = breakfast + lunch + snack + supper
 * - MEQs = breakfast + lunch + supper + ½ snack + à la carte $ ÷ A_LA_CARTE_DOLLARS_PER_MEQ
 * - Revenue = reimbursement + paid meal sales + à la carte sales
 *
 * ─── BUILT-IN SCENARIOS (spec §9) ────────────────────────────────────────────
 * Search for "SCENARIO:" to find each one.
 *  1. Year-over-year shifts → Improved, Comparable, and Declined all appear for
 *     district SY 2024–25 vs SY 2025–26                       → YEAR_RATES
 *  2. A KPI changing by just under its threshold (Snack, +0.4 pts) and one that
 *     crosses its target while staying Comparable (Lunch, 59.8% → 60.2% vs 60%)
 *                                                              → YEAR_RATES
 *  3. A site that opens mid SY 2024–25 (Kennedy Middle, 2025-01-06) → SITE_OPEN_DATES
 *  4. A legitimate zero distinct from No Data (Lincoln Elementary serves no
 *     supper, so Supper = 0.0%)                                → SITES_WITHOUT_SUPPER
 *  5. A relative-% KPI with a zero baseline for one site (Little Learners sells
 *     no à la carte until SY 2025–26)                          → A_LA_CARTE_START_YEAR
 *  6. Sites within a type that differ meaningfully (Site Drivers spread)
 *                                                              → SITE_QUALITY
 * Benchmark scenarios (year-specific overrides, missing benchmarks) live in
 * mockComparisonBenchmarks.ts.
 */

export const COMPARISON_DATA_START: IsoDate = '2023-07-01';

const SEED = 77201;

/** À la carte dollars that count as one meal equivalent. */
const A_LA_CARTE_DOLLARS_PER_MEQ = 3.75;

/** Share of breakfast/lunch meals sold at the paid price. */
const PAID_MEAL_SHARE = 0.3;

/** Blended federal reimbursement per meal served, by meal type. */
const REIMBURSEMENT_PER_MEAL = { breakfast: 1.45, lunch: 2.85, snack: 0.75, supper: 2.85 };

/** Participation share cap so participation stays realistic (never near or over 100%). */
const MAX_PARTICIPATION_SHARE = 0.95;

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────

/** mulberry32: small, fast, deterministic PRNG returning [0, 1). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a style hash of integers → 32-bit seed. */
function hashSeed(...parts: number[]): number {
  let h = 2166136261 >>> 0;
  for (const part of parts) {
    h ^= part >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
    h ^= h >>> 13;
  }
  return h >>> 0;
}

/** A PRNG for one (site, date, stream) so each row is independent of generation order. */
function rngFor(...parts: number[]): () => number {
  return mulberry32(hashSeed(SEED, ...parts));
}

const dateKey = (date: IsoDate): number => Number(date.replace(/-/g, ''));

const round = (value: number, decimals = 0): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

// ─── District rates by school year ───────────────────────────────────────────

interface YearRates {
  // Participation shares before site-type and site factors (meals of type ÷ enrollment)
  breakfast: number;
  lunch: number;
  snack: number;
  supper: number;
  /** Eco Dis share of enrollment. */
  ecoDis: number;
  /** Paid-not-applied share of enrollment. */
  pna: number;
  /** Eligible-not-participating share of eligible students. */
  enp: number;
  mplh: number;
  /** À la carte $ per enrolled student per day. */
  aLaCartePerStudent: number;
  /** Paid price per paid meal. */
  paidMealPrice: number;
  wastePerMeal: number;
  /** Enrollment multiplier vs each site's base enrollment. */
  enrollment: number;
  inventoryValue: number;
  turnoverDays: number;
  discrepancyPercent: number;
}

/**
 * SCENARIO: year-over-year shifts (spec §9). Rates are tuned so the district-wide
 * results land on these values (see mockComparisonData.test.ts):
 *
 *   KPI           SY 2024–25 → SY 2025–26   Result
 *   Breakfast     25.0% → 27.5%             Improved
 *   Lunch         59.8% → 60.2%             Comparable, crosses the 60% target
 *   Snack          9.7% → 10.1%             Comparable, just under the 0.5 pt threshold
 *   Supper         4.4% →  3.3%             Declined
 *   Eco Dis       51.5% → 51.3%             Comparable
 *   PNA           11.8% → 10.4%             Improved (lower is favorable)
 *   ENP            4.4% →  5.3%             Declined, crosses the 5% target
 *   MPLH          18.6  → 17.9              Declined
 *
 * Dollar and count KPIs shift per site-serving-day (SY 2024–25 → SY 2025–26):
 * Revenue +5%, Meals +3%, MEQs +4%, A La Carte +9%, Reimbursement +2%, Waste +8%.
 * SY 2025–26 is partial, so its totals are smaller than a full year's; compare
 * like-for-like periods (e.g. Jul 1 – Apr 16 both years) to see these shifts.
 */
const YEAR_RATES: Record<number, YearRates> = {
  2023: {
    breakfast: 0.2659, lunch: 0.6231, snack: 0.1029, supper: 0.04228,
    ecoDis: 0.5348, pna: 0.11855, enp: 0.04408, mplh: 18.247,
    aLaCartePerStudent: 0.62, paidMealPrice: 3.0, wastePerMeal: 0.4, enrollment: 0.98,
    inventoryValue: 0.95, turnoverDays: 16.8, discrepancyPercent: 3.5,
  },
  2024: {
    breakfast: 0.2761, lunch: 0.6303, snack: 0.1107, supper: 0.04137,
    ecoDis: 0.5296, pna: 0.1122, enp: 0.04227, mplh: 18.957,
    aLaCartePerStudent: 0.65, paidMealPrice: 3.1, wastePerMeal: 0.42, enrollment: 1.0,
    inventoryValue: 1.0, turnoverDays: 16, discrepancyPercent: 3.2,
  },
  2025: {
    breakfast: 0.303, lunch: 0.633, snack: 0.115, supper: 0.03103,
    ecoDis: 0.5274, pna: 0.09923, enp: 0.05107, mplh: 18.205,
    aLaCartePerStudent: 0.7, paidMealPrice: 3.35, wastePerMeal: 0.44, enrollment: 1.01,
    inventoryValue: 1.08, turnoverDays: 14, discrepancyPercent: 2.6,
  },
};

// ─── Site profiles ───────────────────────────────────────────────────────────

/** Per-site-type multipliers on the district rates, plus enrollment and inventory size. */
interface SiteTypeProfile {
  enrollment: [min: number, max: number];
  breakfast: number;
  lunch: number;
  snack: number;
  supper: number;
  ecoDis: number;
  pna: number;
  enp: number;
  mplh: number;
  aLaCarte: number;
  inventoryValue: number;
}

const SITE_TYPE_PROFILES: Record<number, SiteTypeProfile> = {
  [SITE_TYPE_IDS.elementary]: {
    enrollment: [420, 620], breakfast: 1.25, lunch: 1.12, snack: 1.4, supper: 0.6,
    ecoDis: 1.08, pna: 0.8, enp: 0.9, mplh: 1.04, aLaCarte: 0.25, inventoryValue: 9000,
  },
  [SITE_TYPE_IDS.middle]: {
    enrollment: [680, 900], breakfast: 0.95, lunch: 0.98, snack: 0.9, supper: 1.0,
    ecoDis: 1.0, pna: 1.0, enp: 1.0, mplh: 1.0, aLaCarte: 1.0, inventoryValue: 14000,
  },
  [SITE_TYPE_IDS.high]: {
    enrollment: [1150, 1700], breakfast: 0.72, lunch: 0.85, snack: 0.6, supper: 1.3,
    ecoDis: 0.92, pna: 1.2, enp: 1.15, mplh: 0.95, aLaCarte: 1.9, inventoryValue: 22000,
  },
  // Alternative education program housed at the central office.
  [SITE_TYPE_IDS.centralOffice]: {
    enrollment: [40, 50], breakfast: 0.8, lunch: 0.9, snack: 0.5, supper: 0.5,
    ecoDis: 1.1, pna: 1.0, enp: 1.0, mplh: 0.8, aLaCarte: 0.5, inventoryValue: 4000,
  },
  [SITE_TYPE_IDS.childCare]: {
    enrollment: [85, 95], breakfast: 2.4, lunch: 1.35, snack: 5.0, supper: 1.2,
    ecoDis: 1.15, pna: 0.7, enp: 0.8, mplh: 0.85, aLaCarte: 0.4, inventoryValue: 3000,
  },
};

/**
 * SCENARIO: sites within a type differ meaningfully (Site Drivers spread).
 * Quality from −1 (struggling) to +1 (strong). Higher quality → higher participation
 * and MPLH, lower PNA, ENP, and waste.
 */
export const SITE_QUALITY: Record<number, number> = {
  1: 0.6, 2: -0.4, 3: 0.2, 4: -0.8, 5: 0.9, 6: -0.1, // Elementary
  7: 0.5, 8: -0.6, 9: 0.1, 10: -0.2, 11: 0.4, //         Middle
  12: -0.7, 13: 0.8, 14: 0.0, 15: -0.3, 16: 0.4, //      High
  17: 0.0, // Central Office
  18: 0.3, // Child Care
};

/**
 * SCENARIO: a site that opens mid SY 2024–25. Kennedy Middle has no data before its
 * opening, so SY 2023–24 comparisons that include it show one-sided No Data.
 */
export const SITE_OPEN_DATES: Record<number, IsoDate> = {
  11: '2025-01-06',
};

/**
 * SCENARIO: a legitimate zero distinct from No Data. Lincoln Elementary offers no
 * supper program: it reports every serving day with supperMeals = 0, so Supper
 * participation is 0.0%, not No Data.
 */
export const SITES_WITHOUT_SUPPER: ReadonlySet<number> = new Set([1]);

/**
 * SCENARIO: a relative-% KPI with a zero baseline. Little Learners Child Care Center
 * sells no à la carte (aLaCarteSales = 0) until SY 2025–26, so its SY 2024–25 vs
 * SY 2025–26 A La Carte comparison is RelativeNotApplicable.
 */
export const A_LA_CARTE_START_YEAR: Record<number, number> = {
  18: 2025,
};

function getBaseEnrollment(site: Site): number {
  const [min, max] = SITE_TYPE_PROFILES[site.siteTypeId].enrollment;
  return Math.round(min + (max - min) * rngFor(site.siteId, 0)());
}

export function isSiteOpen(siteId: number, date: IsoDate): boolean {
  const openDate = SITE_OPEN_DATES[siteId];
  return !openDate || date >= openDate;
}

// ─── Generation ──────────────────────────────────────────────────────────────

function generateDailyFacts(site: Site, date: IsoDate, baseEnrollment: number): DailySiteFacts {
  const rates = YEAR_RATES[getSchoolYear(date).startYear];
  const type = SITE_TYPE_PROFILES[site.siteTypeId];
  const q = SITE_QUALITY[site.siteId] ?? 0;
  const rng = rngFor(site.siteId, dateKey(date));
  /** 1 ± amplitude, uniformly distributed. */
  const noise = (amplitude: number) => 1 + (rng() * 2 - 1) * amplitude;

  const enrollment = Math.round(baseEnrollment * rates.enrollment * noise(0.01));
  const participation = (rate: number, typeFactor: number) =>
    Math.round(enrollment * Math.min(MAX_PARTICIPATION_SHARE, rate * typeFactor * (1 + 0.12 * q) * noise(0.06)));

  const breakfastMeals = participation(rates.breakfast, type.breakfast);
  const lunchMeals = participation(rates.lunch, type.lunch);
  const snackMeals = participation(rates.snack, type.snack);
  const supperMeals = SITES_WITHOUT_SUPPER.has(site.siteId) ? 0 : participation(rates.supper, type.supper);

  const ecoDisStudents = Math.round(enrollment * Math.min(0.95, rates.ecoDis * type.ecoDis * (1 - 0.05 * q) * noise(0.005)));
  const paidNotAppliedStudents = Math.round(enrollment * rates.pna * type.pna * (1 - 0.18 * q) * noise(0.02));
  const eligibleStudents = Math.min(enrollment, Math.round(ecoDisStudents * 1.15));
  const eligibleNotParticipating = Math.round(eligibleStudents * rates.enp * type.enp * (1 - 0.2 * q) * noise(0.03));

  const sellsALaCarte = getSchoolYear(date).startYear >= (A_LA_CARTE_START_YEAR[site.siteId] ?? 0);
  const aLaCarteSales = sellsALaCarte
    ? round(enrollment * rates.aLaCartePerStudent * type.aLaCarte * (1 + 0.1 * q) * noise(0.15), 2)
    : 0;

  const meals = breakfastMeals + lunchMeals + snackMeals + supperMeals;
  const meqs = Math.round(breakfastMeals + lunchMeals + supperMeals + 0.5 * snackMeals + aLaCarteSales / A_LA_CARTE_DOLLARS_PER_MEQ);
  const laborHours = round(meqs / (rates.mplh * type.mplh * (1 + 0.06 * q) * noise(0.04)), 1);

  const reimbursement = round(
    breakfastMeals * REIMBURSEMENT_PER_MEAL.breakfast +
      lunchMeals * REIMBURSEMENT_PER_MEAL.lunch +
      snackMeals * REIMBURSEMENT_PER_MEAL.snack +
      supperMeals * REIMBURSEMENT_PER_MEAL.supper,
    2,
  );
  const paidMealSales = round((0.5 * breakfastMeals + lunchMeals) * PAID_MEAL_SHARE * rates.paidMealPrice, 2);
  const revenue = round(reimbursement + paidMealSales + aLaCarteSales, 2);
  const waste = round(meals * rates.wastePerMeal * (1 - 0.1 * q) * noise(0.1), 2);

  return {
    siteId: site.siteId,
    date,
    enrollment,
    breakfastMeals,
    lunchMeals,
    snackMeals,
    supperMeals,
    ecoDisStudents,
    paidNotAppliedStudents,
    eligibleStudents,
    eligibleNotParticipating,
    meals,
    meqs,
    laborHours,
    revenue,
    aLaCarteSales,
    reimbursement,
    waste,
  };
}

function generateInventorySnapshot(site: Site, monthEnd: IsoDate): InventorySnapshot {
  const rates = YEAR_RATES[getSchoolYear(monthEnd).startYear];
  const type = SITE_TYPE_PROFILES[site.siteTypeId];
  const q = SITE_QUALITY[site.siteId] ?? 0;
  const rng = rngFor(site.siteId, dateKey(monthEnd), 1);
  const noise = (amplitude: number) => 1 + (rng() * 2 - 1) * amplitude;

  const inventoryValue = round(type.inventoryValue * rates.inventoryValue * noise(0.06), 2);
  const turnoverDays = round(rates.turnoverDays * (1 - 0.05 * q) * noise(0.08), 1);
  const discrepancyDollars = round(inventoryValue * (rates.discrepancyPercent / 100) * (1 - 0.15 * q) * noise(0.15), 2);

  return {
    siteId: site.siteId,
    date: monthEnd,
    inventoryValue,
    turnoverDays,
    discrepancyDollars,
    discrepancyPercent: (discrepancyDollars / inventoryValue) * 100,
  };
}

export interface ComparisonMockData {
  dailyFacts: DailySiteFacts[];
  inventorySnapshots: InventorySnapshot[];
}

/** Generates all comparison mock data through `asOf` (inclusive). */
export function generateComparisonMockData(asOf: IsoDate = DEMO_AS_OF_DATE): ComparisonMockData {
  const dailyFacts: DailySiteFacts[] = [];
  const inventorySnapshots: InventorySnapshot[] = [];
  const servingDays = eachDay(COMPARISON_DATA_START, asOf).filter(isServingDay);

  for (const site of DEMO_SITES.siteList) {
    const baseEnrollment = getBaseEnrollment(site);

    for (const date of servingDays) {
      if (isSiteOpen(site.siteId, date)) dailyFacts.push(generateDailyFacts(site, date, baseEnrollment));
    }

    // Month-end inventory counts that have happened by asOf, once the site is open.
    for (let monthEnd = endOfMonth(COMPARISON_DATA_START); monthEnd <= asOf; monthEnd = endOfMonth(addDays(monthEnd, 1))) {
      if (isSiteOpen(site.siteId, monthEnd)) inventorySnapshots.push(generateInventorySnapshot(site, monthEnd));
    }
  }

  return { dailyFacts, inventorySnapshots };
}

let cached: ComparisonMockData | null = null;

/** The demo dataset through DEMO_AS_OF_DATE, generated once on first use. */
export function getComparisonMockData(): ComparisonMockData {
  cached ??= generateComparisonMockData();
  return cached;
}

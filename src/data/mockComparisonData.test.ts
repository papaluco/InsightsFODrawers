import { describe, expect, it } from 'vitest';
import { DEMO_AS_OF_DATE } from '../constants/demo';
import { endOfMonth } from '../utils/dateOnly';
import {
  A_LA_CARTE_START_YEAR,
  generateComparisonMockData,
  getComparisonMockData,
  SITE_OPEN_DATES,
  SITES_WITHOUT_SUPPER,
} from './mockComparisonData';
import { isServingDay } from './mockSchoolCalendar';
import { DEMO_SITES } from './siteRegistry';

const { dailyFacts, inventorySnapshots } = getComparisonMockData();

const KENNEDY_MIDDLE = 11;
const LINCOLN_ELEMENTARY = 1;
const LITTLE_LEARNERS = 18;

describe('comparison mock data generator', () => {
  it('is deterministic', () => {
    const again = generateComparisonMockData();
    expect(again.dailyFacts).toEqual(dailyFacts);
    expect(again.inventorySnapshots).toEqual(inventorySnapshots);
  });

  it('covers SY 2023–24 through DEMO_AS_OF_DATE for every site', () => {
    const dates = dailyFacts.map(f => f.date).sort();
    expect(dates[0]).toBe('2023-08-14'); // first serving day on or after 2023-07-01
    expect(dates[dates.length - 1]).toBe(DEMO_AS_OF_DATE);
    expect(new Set(dailyFacts.map(f => f.siteId)).size).toBe(DEMO_SITES.siteList.length);
  });

  it('has rows only on serving days (no weekends or breaks)', () => {
    expect(dailyFacts.every(f => isServingDay(f.date))).toBe(true);
    expect(dailyFacts.some(f => f.date === '2025-12-23')).toBe(false); // winter break
    expect(dailyFacts.some(f => f.date === '2026-03-17')).toBe(false); // spring break
    expect(dailyFacts.some(f => f.date === '2025-07-15')).toBe(false); // summer
  });

  it('keeps every count realistic: meals of a type and ratio numerators never exceed their denominators', () => {
    const violations = dailyFacts.filter(f =>
      [f.breakfastMeals, f.lunchMeals, f.snackMeals, f.supperMeals].some(m => m < 0 || m > f.enrollment) ||
      f.ecoDisStudents > f.enrollment ||
      f.paidNotAppliedStudents > f.enrollment ||
      f.eligibleStudents > f.enrollment ||
      f.eligibleNotParticipating > f.eligibleStudents ||
      f.laborHours <= 0,
    );
    expect(violations).toEqual([]);
  });

  it('derives Meals and Revenue from their components', () => {
    for (const f of dailyFacts.slice(0, 500)) {
      expect(f.meals).toBe(f.breakfastMeals + f.lunchMeals + f.snackMeals + f.supperMeals);
      expect(f.revenue).toBeGreaterThanOrEqual(f.reimbursement + f.aLaCarteSales - 0.01);
    }
  });

  it('SCENARIO: Kennedy Middle has no rows before it opens mid SY 2024–25', () => {
    const kennedy = dailyFacts.filter(f => f.siteId === KENNEDY_MIDDLE);
    expect(SITE_OPEN_DATES[KENNEDY_MIDDLE]).toBe('2025-01-06');
    expect(kennedy.length).toBeGreaterThan(0);
    expect(kennedy.every(f => f.date >= '2025-01-06')).toBe(true);
    expect(inventorySnapshots.filter(s => s.siteId === KENNEDY_MIDDLE).every(s => s.date >= '2025-01-31')).toBe(true);
  });

  it('SCENARIO: Lincoln Elementary reports supper as a real zero, not missing rows', () => {
    expect(SITES_WITHOUT_SUPPER.has(LINCOLN_ELEMENTARY)).toBe(true);
    const lincoln = dailyFacts.filter(f => f.siteId === LINCOLN_ELEMENTARY);
    expect(lincoln.length).toBeGreaterThan(400);
    expect(lincoln.every(f => f.supperMeals === 0)).toBe(true);
    expect(lincoln.every(f => f.lunchMeals > 0)).toBe(true);
  });

  it('SCENARIO: Little Learners sells no à la carte until SY 2025–26', () => {
    expect(A_LA_CARTE_START_YEAR[LITTLE_LEARNERS]).toBe(2025);
    const rows = dailyFacts.filter(f => f.siteId === LITTLE_LEARNERS);
    expect(rows.filter(f => f.date < '2025-07-01').every(f => f.aLaCarteSales === 0)).toBe(true);
    expect(rows.filter(f => f.date >= '2025-07-01').every(f => f.aLaCarteSales > 0)).toBe(true);
  });

  it('takes one month-end inventory snapshot per open site per month, through the as-of date', () => {
    const lincolnDates = inventorySnapshots.filter(s => s.siteId === LINCOLN_ELEMENTARY).map(s => s.date);
    expect(lincolnDates[0]).toBe('2023-07-31');
    expect(lincolnDates[lincolnDates.length - 1]).toBe('2026-03-31'); // April's count hasn't happened yet
    expect(lincolnDates.every(d => d === endOfMonth(d))).toBe(true);
    expect(new Set(lincolnDates).size).toBe(33);
  });

  it('stores discrepancy % consistent with its $ and value', () => {
    for (const s of inventorySnapshots) {
      expect(s.discrepancyPercent).toBeCloseTo((s.discrepancyDollars / s.inventoryValue) * 100, 8);
      expect(s.turnoverDays).toBeGreaterThan(0);
    }
  });
});

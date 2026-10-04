import { describe, expect, it } from 'vitest';
import { COMPARISON_KPI_KEYS } from '../constants/kpiDefinitions';
import { buildSideDataset, SideDataset } from '../services/comparisonDataService';
import { getPeriodLengthNotice } from '../utils/timeframes';
import { ComparisonFilters, selectComparison } from '../features/performanceComparison/selectors/selectComparison';
import { buildComparisonFacts, ComparisonFactsPayload, KpiFacts } from '../features/performanceComparison/schoolie/comparisonFacts';
import { generatePerformanceComparisonAnalysis } from './mockPerformanceComparisonAnalysis';

const ALL_KPIS: ComparisonFilters = { kpiFilter: COMPARISON_KPI_KEYS, needsAttentionOnly: false };

function facts(from: SideDataset, to: SideDataset, filters: ComparisonFilters = ALL_KPIS): ComparisonFactsPayload {
  return buildComparisonFacts({
    from,
    to,
    results: selectComparison(from, to, filters),
    filters,
    periodLengthNotice: getPeriodLengthNotice(from.timeframe, to.timeframe),
    totalKpiCount: COMPARISON_KPI_KEYS.length,
  });
}

/** A copy of a dataset with no targets for the given KPIs (missing benchmarks). */
function withoutTargets(dataset: SideDataset, kpis: string[]): SideDataset {
  const copy = { ...dataset, kpis: { ...dataset.kpis } };
  for (const kpi of kpis) copy.kpis[kpi as keyof typeof copy.kpis] = { ...copy.kpis[kpi as keyof typeof copy.kpis], target: null };
  return copy;
}

const ds = (sites: number[], optionId: Parameters<typeof buildSideDataset>[1]['optionId']) => buildSideDataset(sites, { optionId });

const allPriorYear = ds([0], 'prior_year');
const allPytd = ds([0], 'prior_ytd');
const allYtd = ds([0], 'ytd');
const all2223 = ds([0], 'sy2223');
const highPytd = ds([104], 'prior_ytd');
const highYtd = ds([104], 'ytd');
const elementaryYtd = ds([103], 'ytd');
const oneSitePytd = ds([1], 'prior_ytd');
const oneSiteYtd = ds([1], 'ytd');

const SCENARIOS: Array<[string, ComparisonFactsPayload]> = [
  ['Prior Year to Date vs Year to Date', facts(allPytd, allYtd)],
  ['Year to Date vs Prior Year to Date (swapped)', facts(allYtd, allPytd)],
  ['Prior Year vs Year to Date (partial)', facts(allPriorYear, allYtd)],
  ['Needs Attention only', facts(allPytd, allYtd, { ...ALL_KPIS, needsAttentionOnly: true })],
  ['KPI filter', facts(allPytd, allYtd, { kpiFilter: ['Lunch', 'Waste', 'Inventory Value'], needsAttentionOnly: false })],
  ['SY 2022–23 (No Data) vs Year to Date', facts(all2223, allYtd)],
  ['Year to Date vs SY 2022–23 (No Data)', facts(allYtd, all2223)],
  ['High Schools vs Elementary', facts(highYtd, elementaryYtd)],
  ['High Schools PYTD vs YTD', facts(highPytd, highYtd)],
  ['Single site', facts(oneSitePytd, oneSiteYtd)],
  ['Missing targets', facts(withoutTargets(allPytd, ['Lunch', 'Revenue', 'Waste']), withoutTargets(allYtd, ['Lunch', 'Revenue', 'Waste', 'MPLH']))],
];

// ─── Parsing helpers ─────────────────────────────────────────────────────────

const unescape = (text: string) =>
  text.replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');

/** Every paragraph and list item in the response, with its section heading. */
function items(html: string): Array<{ section: string; text: string; kpis: string[] }> {
  const result: Array<{ section: string; text: string; kpis: string[] }> = [];
  const sections = html.split('<h2>').slice(1);
  for (const part of sections) {
    const section = part.slice(0, part.indexOf('</h2>'));
    for (const match of part.matchAll(/<(li|p)>(.*?)<\/\1>/g)) {
      const raw = match[2];
      result.push({
        section,
        text: unescape(raw.replace(/<[^>]+>/g, '')),
        kpis: [...raw.matchAll(/<strong>(.*?)<\/strong>/g)].map(m => unescape(m[1])),
      });
    }
  }
  return result;
}

const sectionsOf = (html: string) => [...html.matchAll(/<h2>(.*?)<\/h2>/g)].map(m => m[1]);

const MISS_WORDS = /\b(below|above|miss(ed|es)?|not meet|does not meet|outside|poor|worse|underperform\w*)\b/i;

/** The checks behind "never contradicts the engine" (spec §1, §11). */
function expectConsistent(payload: ComparisonFactsPayload, html: string) {
  const byName = new Map(payload.kpis.map(k => [k.name, k]));
  const labels = { from: payload.orientation.from, to: payload.orientation.to };
  const sideOf = (label: string): 'from' | 'to' => (label === labels.from ? 'from' : 'to');

  for (const item of items(html)) {
    const kpis = item.kpis.map(name => {
      const kpi = byName.get(name);
      expect(kpi, `"${name}" is not a KPI in the payload`).toBeDefined();
      return kpi as KpiFacts;
    });

    for (const kpi of kpis) {
      const where = `${kpi.name} in "${item.text}"`;
      if (/\bimprove(d|ment)?\b/i.test(item.text)) expect(kpi.classification, where).toBe('Improved');
      if (/\bdeclin(e|ed)\b/i.test(item.text)) expect(kpi.classification, where).toBe('Declined');
      if (/\bcomparable\b/i.test(item.text)) expect(kpi.classification, where).toBe('Comparable');

      // Informational KPIs are never classified or assessed against a target.
      if (kpi.informational) expect(item.text, where).not.toMatch(/improv|declin|comparable|target/i);

      // No Data and missing targets are never misses; a miss needs a NotMet status on some side.
      // Site-level facts (row summary, sites outside their own targets) are about sites, not the KPI.
      const kpiLevelText = item.text
        .replace((kpi.siteDrivers?.summary ?? '\u0000').split('\n').join('; '), '')
        .replace(/Furthest outside target for .*$/, '')
        .replace(/the sites furthest outside target/, '');
      const hasNotMet = kpi.from.targetStatus === 'NotMet' || kpi.to.targetStatus === 'NotMet';
      if (!hasNotMet) expect(kpiLevelText, where).not.toMatch(MISS_WORDS);
      if (item.section === 'Areas needing attention') expect(kpi.needsAttention, where).toBe(true);
      if (item.section === 'Positive performance') expect(kpi.classification, where).not.toBe('Declined');
    }

    // Side-specific target statements match that side's status.
    if (kpis.length === 1) {
      const [kpi] = kpis;
      for (const label of [labels.from, labels.to]) {
        const status = kpi[sideOf(label)].targetStatus;
        if (item.text.includes(`${label} meets its`)) expect(status, `${kpi.name}: ${item.text}`).toBe('Met');
        if (new RegExp(`${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} is (below|above) its`).test(item.text)) {
          expect(status, `${kpi.name}: ${item.text}`).toBe('NotMet');
        }
      }
    }
    if (item.text.startsWith(`Also meeting target for ${labels.to}`)) {
      for (const kpi of kpis) expect(kpi.to.targetStatus).toBe('Met');
    }
  }
}

describe('generatePerformanceComparisonAnalysis (NXT-77214 §11)', () => {
  it.each(SCENARIOS)('never contradicts the payload: %s', (_name, payload) => {
    expectConsistent(payload, generatePerformanceComparisonAnalysis(payload));
  });

  it('uses the sections in order, with Key site drivers only when Site Drivers data exists', () => {
    const multi = generatePerformanceComparisonAnalysis(facts(allPriorYear, allYtd));
    expect(sectionsOf(multi)).toEqual([
      'Overall direction',
      'Target attainment',
      'Key site drivers',
      'Areas needing attention',
      'Positive performance',
      'Suggested next steps',
    ]);
    const single = generatePerformanceComparisonAnalysis(facts(oneSitePytd, oneSiteYtd));
    expect(sectionsOf(single)).not.toContain('Key site drivers');
  });

  it.each(SCENARIOS)('suggests 2–3 next steps, each naming a KPI or site from the payload: %s', (_name, payload) => {
    const html = generatePerformanceComparisonAnalysis(payload);
    const steps = items(html).filter(i => i.section === 'Suggested next steps');
    expect(steps.length).toBeLessThanOrEqual(3);
    if (payload.kpis.filter(k => !k.informational).length >= 2) expect(steps.length).toBeGreaterThanOrEqual(2);

    const kpiNames = payload.kpis.map(k => k.name);
    const siteNames = payload.kpis.flatMap(k => k.siteDrivers?.topSitesOutsideTarget.map(s => s.siteName) ?? []);
    for (const step of steps) {
      expect(step.kpis.length + siteNames.filter(s => step.text.includes(s)).length, step.text).toBeGreaterThan(0);
      expect(step.kpis.every(name => kpiNames.includes(name))).toBe(true);
      // Never states or implies causes.
      expect(step.text).not.toMatch(/\b(menu|staff\w*|pric\w*|because|due to|caused?)\b/i);
    }
  });

  it('describes No Data neutrally and never as a miss', () => {
    const payload = facts(all2223, allYtd);
    expect(payload.kpis.every(k => k.classification === 'NoData')).toBe(true);
    const html = generatePerformanceComparisonAnalysis(payload);
    expect(html).toContain('could not be compared because data is unavailable');
    expect(html).not.toMatch(/\bdeclin|poor|worse/i);
    expectConsistent(payload, html);
  });

  it('describes missing targets as not assessed, never as misses', () => {
    const payload = facts(withoutTargets(allPytd, ['Lunch']), withoutTargets(allYtd, ['Lunch']));
    const lunch = payload.kpis.find(k => k.kpi === 'Lunch');
    expect(lunch?.to.targetStatus).toBe('NotAvailable');
    const html = generatePerformanceComparisonAnalysis(payload);
    const lunchItems = items(html).filter(i => i.kpis.includes('Lunch'));
    expect(lunchItems.some(i => /not assessed/.test(i.text))).toBe(true);
    for (const item of lunchItems) expect(item.text).not.toMatch(MISS_WORDS);
  });

  it('never calls an informational KPI improved or declined', () => {
    const payload = facts(allPytd, allYtd, { kpiFilter: ['Inventory Value', 'Inventory Turnover Rate', 'Physical Inventory Discrepancy'], needsAttentionOnly: false });
    const html = generatePerformanceComparisonAnalysis(payload);
    expect(html).toContain('3 inventory KPIs are informational and not classified');
    expect(html).not.toMatch(/improved|declined/i);
  });

  it('mentions the partial period only when the period-length notice applies', () => {
    const partial = generatePerformanceComparisonAnalysis(facts(allPriorYear, allYtd));
    expect(partial).toContain('includes data through April 16, 2026');
    expect(partial).toContain('Prior Year to Date');
    const likeForLike = generatePerformanceComparisonAnalysis(facts(allPytd, allYtd));
    expect(likeForLike).not.toMatch(/includes data through|different lengths of time/);
  });

  it('names sides only by their generated labels', () => {
    for (const [, payload] of SCENARIOS) {
      const text = items(generatePerformanceComparisonAnalysis(payload)).map(i => i.text).join(' ');
      expect(text).not.toMatch(/\b(left|right|baseline|side A|side B)\b/i);
      expect(text).not.toMatch(/\b(from|to) side\b/i);
    }
  });

  it('handles an empty scope', () => {
    const payload = facts(allPytd, allYtd, { kpiFilter: [], needsAttentionOnly: false });
    expect(generatePerformanceComparisonAnalysis(payload)).toContain('No KPIs are in scope');
  });
});

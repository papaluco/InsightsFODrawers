import type { ComparisonFactsPayload, KpiFacts, SideFacts } from '../features/performanceComparison/schoolie/comparisonFacts';

/**
 * Mock Schoolie response for the performance_comparison prompt (NXT-77214, spec §11).
 *
 * Stands in for the real model: it writes the analysis only from the facts payload, never from
 * canned text. Every statement about a KPI restates an engine fact (classification, target
 * status, delta, Site Drivers summary), so it can't contradict the comparison:
 * - only Improved KPIs are called improved, only Declined KPIs declined;
 * - No Data and missing targets are reported neutrally, never as misses or poor performance;
 * - informational KPIs are only counted, never called improved or declined;
 * - the partial period is mentioned only when the period-length notice applies;
 * - next steps point at KPIs and sites in the payload and never suggest causes.
 */

const MAX_ATTENTION_ITEMS = 5;
const MAX_POSITIVE_ITEMS = 4;
const MAX_SITE_DRIVER_ITEMS = 3;
const MAX_NEXT_STEPS = 3;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** "2026-04-16" → "April 16, 2026". */
function formatLongDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

const plural = (n: number, singular: string, pluralForm = `${singular}s`) => `${n} ${n === 1 ? singular : pluralForm}`;

const kpiName = (kpi: KpiFacts) => `<strong>${escapeHtml(kpi.name)}</strong>`;

const kpiList = (kpis: KpiFacts[]) => kpis.map(kpiName).join(', ');

/** "below" for higher-is-favorable KPIs, "above" for lower-is-favorable (matches the engine's wording). */
const outsideWord = (kpi: KpiFacts) => (kpi.favorableDirection === 'lower' ? 'above' : 'below');

/** "<label> is below its 60% target at 57.9%". */
const outsideTargetClause = (kpi: KpiFacts, side: 'from' | 'to', label: string) =>
  `${label} is ${outsideWord(kpi)} its ${escapeHtml(kpi[side].targetFormatted)} target at ${escapeHtml(kpi[side].actualFormatted)}`;

/** "<label> meets its 60% target". */
const meetsTargetClause = (kpi: KpiFacts, side: 'from' | 'to', label: string) =>
  `${label} meets its ${escapeHtml(kpi[side].targetFormatted)} target`;

/** Site Drivers row summary on one line (the payload keeps one line per side). */
const siteSummary = (kpi: KpiFacts) => escapeHtml((kpi.siteDrivers?.summary ?? '').split('\n').join('; '));

const section = (heading: string, body: string) => `<h2>${heading}</h2>${body}`;
const list = (items: string[]) => `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;

interface Labels {
  from: string;
  to: string;
}

/** Which side lacks data for a No Data KPI, by label. */
const missingDataSide = (kpi: KpiFacts, labels: Labels) =>
  !kpi.from.hasData && !kpi.to.hasData ? 'both sides' : !kpi.from.hasData ? labels.from : labels.to;

// ─── Overall direction ───────────────────────────────────────────────────────

function overallDirection(facts: ComparisonFactsPayload, labels: Labels): string {
  const directional = facts.kpis.filter(k => !k.informational);
  const count = (classification: KpiFacts['classification']) => directional.filter(k => k.classification === classification).length;
  const scope = facts.filters.needsAttentionOnly ? ' that need attention' : ' in scope';

  const sentences: string[] = [];
  const classified = count('Improved') + count('Comparable') + count('Declined');
  if (classified > 0) {
    sentences.push(
      `Comparing ${labels.to} with ${labels.from} across ${plural(classified, 'classified KPI')}${scope}: ` +
        `${count('Improved')} improved, ${count('Comparable')} comparable, and ${count('Declined')} declined.`,
    );
  }
  const relativeNotApplicable = count('RelativeNotApplicable');
  if (relativeNotApplicable > 0) {
    sentences.push(
      `${plural(relativeNotApplicable, 'KPI')} ${relativeNotApplicable === 1 ? 'has' : 'have'} a value of zero for ${labels.from}, so only the absolute change is reported.`,
    );
  }
  const noData = directional.filter(k => k.classification === 'NoData');
  if (noData.length > 0) {
    // Name the side without data when it's the same for every No Data KPI.
    const missing = new Set(noData.map(k => missingDataSide(k, labels)));
    const where = missing.size === 1 ? [...missing][0] : 'one or both sides';
    sentences.push(`${plural(noData.length, 'KPI')} could not be compared because data is unavailable for ${where}.`);
  }
  const informational = facts.kpis.length - directional.length;
  if (informational > 0) {
    sentences.push(`${plural(informational, 'inventory KPI')} ${informational === 1 ? 'is' : 'are'} informational and not classified.`);
  }

  // Partial period only when the period-length notice applies (spec §5.9, §6).
  if (facts.periodLengthNotice) {
    const partialSide: SideFacts | undefined = [facts.sides.from, facts.sides.to].find(s => s.partial.isPartial);
    if (partialSide?.partial.throughDate) {
      sentences.push(`${escapeHtml(partialSide.label)} includes data through ${formatLongDate(partialSide.partial.throughDate)}.`);
    }
    sentences.push(escapeHtml(facts.periodLengthNotice));
  }

  return section('Overall direction', `<p>${sentences.join(' ')}</p>`);
}

// ─── Target attainment ───────────────────────────────────────────────────────

function targetAttainment(facts: ComparisonFactsPayload, labels: Labels): string {
  const directional = facts.kpis.filter(k => !k.informational);
  const items: string[] = [];

  for (const [side, label] of [['to', labels.to], ['from', labels.from]] as const) {
    const withTarget = directional.filter(k => k[side].targetStatus !== 'NotAvailable');
    const met = withTarget.filter(k => k[side].targetStatus === 'Met').length;
    const hasData = directional.some(k => k[side].hasData);
    items.push(
      withTarget.length > 0
        ? `${label}: ${met} of ${plural(withTarget.length, 'KPI')} with a target ${met === 1 ? 'meets' : 'meet'} it.`
        : hasData
          ? `${label}: no KPIs in scope have a target to assess.`
          : `${label}: no data is available to assess against targets.`,
    );
  }

  for (const kpi of directional.filter(k => k.targetTransition === 'NotMetToMet')) {
    items.push(`${kpiName(kpi)}: ${meetsTargetClause(kpi, 'to', labels.to)}; ${outsideTargetClause(kpi, 'from', labels.from)}.`);
  }
  for (const kpi of directional.filter(k => k.targetTransition === 'MetToNotMet')) {
    items.push(`${kpiName(kpi)}: ${meetsTargetClause(kpi, 'from', labels.from)}; ${outsideTargetClause(kpi, 'to', labels.to)}.`);
  }

  // A missing target is reported as "not assessed", never as a miss (spec §1).
  const noTarget = directional.filter(k => k.to.hasData && k.to.targetStatus === 'NotAvailable');
  if (noTarget.length > 0) {
    items.push(`No target is configured for ${labels.to} for ${kpiList(noTarget)}, so ${noTarget.length === 1 ? 'it is' : 'they are'} not assessed against one.`);
  }

  return section('Target attainment', list(items));
}

// ─── Key site drivers ────────────────────────────────────────────────────────

function keySiteDrivers(facts: ComparisonFactsPayload, labels: Labels): string | null {
  const withDrivers = facts.kpis.filter(k => k.siteDrivers !== null);
  if (withDrivers.length === 0) return null; // Only when Site Drivers data exists (spec §11).

  const items: string[] = [];
  const shown = new Set<string>();

  for (const kpi of withDrivers) {
    const sites = kpi.siteDrivers?.topSitesOutsideTarget ?? [];
    if (!kpi.needsAttention || sites.length === 0 || items.length >= MAX_SITE_DRIVER_ITEMS) continue;
    const siteText = sites
      .map(site => `${escapeHtml(site.siteName)} (${escapeHtml(site.actualFormatted)} vs ${escapeHtml(site.targetFormatted)} target)`)
      .join(', ');
    items.push(`${kpiName(kpi)}: ${siteSummary(kpi)}. Furthest outside target for ${labels.to}: ${siteText}.`);
    shown.add(kpi.kpi);
  }

  // Fill with other KPIs' row summaries; skip No Data and KPIs without a target to assess.
  for (const kpi of withDrivers) {
    if (items.length >= MAX_SITE_DRIVER_ITEMS) break;
    if (shown.has(kpi.kpi) || kpi.informational || kpi.classification === 'NoData' || kpi.to.targetStatus === 'NotAvailable') continue;
    items.push(`${kpiName(kpi)}: ${siteSummary(kpi)}.`);
  }

  if (items.length === 0) return null;
  return section('Key site drivers', list(items));
}

// ─── Areas needing attention ─────────────────────────────────────────────────

/** Both reasons first, then Declined only, then Below Target only. */
const attentionRank = (kpi: KpiFacts) =>
  kpi.needsAttentionReasons.length === 2 ? 0 : kpi.needsAttentionReasons.includes('Declined') ? 1 : 2;

function attentionItem(kpi: KpiFacts, labels: Labels): string {
  const parts: string[] = [];
  if (kpi.needsAttentionReasons.includes('Declined')) parts.push(`declined, ${escapeHtml(kpi.deltaFormatted ?? '')}`);
  if (kpi.needsAttentionReasons.includes('BelowTarget')) parts.push(outsideTargetClause(kpi, 'to', labels.to));
  return `${kpiName(kpi)}: ${parts.join('; ')}.`;
}

function areasNeedingAttention(facts: ComparisonFactsPayload, labels: Labels): string {
  const attention = facts.kpis.filter(k => k.needsAttention).sort((a, b) => attentionRank(a) - attentionRank(b));
  if (attention.length === 0) return section('Areas needing attention', '<p>No KPIs in scope need attention.</p>');

  const items = attention.slice(0, MAX_ATTENTION_ITEMS).map(kpi => attentionItem(kpi, labels));
  const rest = attention.slice(MAX_ATTENTION_ITEMS);
  if (rest.length > 0) items.push(`Also needing attention: ${kpiList(rest)}.`);
  return section('Areas needing attention', list(items));
}

// ─── Positive performance ────────────────────────────────────────────────────

function positivePerformance(facts: ComparisonFactsPayload, labels: Labels): string {
  if (facts.kpis.every(k => k.informational)) return section('Positive performance', '<p>No classified KPIs are in scope.</p>');
  const improved = facts.kpis.filter(k => k.classification === 'Improved');
  // Other KPIs meeting their target on the compared side, excluding declines (never framed as positive).
  const meeting = facts.kpis.filter(
    k => !k.informational && k.classification !== 'Improved' && k.classification !== 'Declined' && k.to.targetStatus === 'Met',
  );

  const items = improved.slice(0, MAX_POSITIVE_ITEMS).map(kpi => {
    const target = kpi.to.targetStatus === 'Met' ? `; ${meetsTargetClause(kpi, 'to', labels.to)}` : '';
    return `${kpiName(kpi)} improved, ${escapeHtml(kpi.deltaFormatted ?? '')}${target}.`;
  });
  if (improved.length > MAX_POSITIVE_ITEMS) items.push(`Also improved: ${kpiList(improved.slice(MAX_POSITIVE_ITEMS))}.`);
  if (meeting.length > 0) items.push(`Also meeting target for ${labels.to}: ${kpiList(meeting)}.`);

  if (items.length === 0) return section('Positive performance', '<p>None of the KPIs in scope improved.</p>');
  return section('Positive performance', list(items));
}

// ─── Suggested next steps ────────────────────────────────────────────────────

/**
 * 2–3 areas to investigate, each naming a KPI (and sites, when Site Drivers has them) from the
 * payload. Steps point at where to look in the comparison; they never suggest causes.
 */
function suggestedNextSteps(facts: ComparisonFactsPayload, labels: Labels): string | null {
  const steps: string[] = [];
  const used = new Set<string>();
  const add = (kpi: KpiFacts, text: string) => {
    if (steps.length >= MAX_NEXT_STEPS || used.has(kpi.kpi)) return;
    steps.push(text);
    used.add(kpi.kpi);
  };
  const directional = facts.kpis.filter(k => !k.informational);
  const attention = directional.filter(k => k.needsAttention).sort((a, b) => attentionRank(a) - attentionRank(b));

  // 1. Named sites furthest outside target.
  for (const kpi of attention) {
    const sites = kpi.siteDrivers?.topSitesOutsideTarget ?? [];
    if (sites.length === 0) continue;
    const names = sites.slice(0, 2).map(s => escapeHtml(s.siteName)).join(' and ');
    add(kpi, `Review ${kpiName(kpi)} at ${names}, the sites furthest outside target for ${labels.to}, in Site Drivers.`);
  }
  // 2. Targets met on one side and missed on the other.
  for (const kpi of directional.filter(k => k.targetTransition === 'MetToNotMet')) {
    add(kpi, `Compare ${kpiName(kpi)} in the Performance Trend: ${meetsTargetClause(kpi, 'from', labels.from)}, while ${outsideTargetClause(kpi, 'to', labels.to)}.`);
  }
  // 3. Remaining declines and below-target KPIs.
  for (const kpi of attention) {
    const where = kpi.siteDrivers ? 'Site Drivers and the Performance Trend' : 'the Performance Trend';
    if (kpi.needsAttentionReasons.includes('Declined')) {
      add(kpi, `Use ${where} to see where the decline in ${kpiName(kpi)} is concentrated.`);
    } else {
      add(kpi, `Look at ${kpiName(kpi)} in ${where}: ${outsideTargetClause(kpi, 'to', labels.to)}.`);
    }
  }
  // 4. Nothing needs attention: confirm improvements hold across sites or over time.
  for (const kpi of directional.filter(k => k.classification === 'Improved')) {
    const where = kpi.siteDrivers ? 'across sites in Site Drivers' : 'over time in the Performance Trend';
    add(kpi, `Check whether the improvement in ${kpiName(kpi)} holds ${where}.`);
  }
  // 5. Gaps in the facts themselves: No Data and missing targets (reported neutrally).
  for (const kpi of directional.filter(k => k.classification === 'NoData')) {
    add(kpi, `Data for ${kpiName(kpi)} is unavailable for ${missingDataSide(kpi, labels)}; choose a site scope or timeframe with data to compare it.`);
  }
  for (const kpi of directional.filter(k => k.to.hasData && k.to.targetStatus === 'NotAvailable')) {
    add(kpi, `${kpiName(kpi)} has no target for ${labels.to}; configuring one would let it be assessed against a target.`);
  }
  // 6. Fill to at least two steps from the remaining classified KPIs.
  for (const kpi of directional) {
    if (steps.length >= 2) break;
    if (kpi.classification === 'Comparable') {
      const where = kpi.siteDrivers ? 'across sites in Site Drivers' : 'over time in the Performance Trend';
      add(kpi, `Check whether ${kpiName(kpi)}, which is comparable overall, is consistent ${where}.`);
    } else if (kpi.classification === 'RelativeNotApplicable') {
      add(kpi, `Review ${kpiName(kpi)} in the Performance Trend: its value for ${labels.from} is zero, so only the absolute change (${escapeHtml(kpi.deltaFormatted ?? '')}) is reported.`);
    }
  }

  if (steps.length === 0) return null;
  return section('Suggested next steps', `<ol>${steps.map(step => `<li>${step}</li>`).join('')}</ol>`);
}

// ─── Response ────────────────────────────────────────────────────────────────

export function generatePerformanceComparisonAnalysis(facts: ComparisonFactsPayload): string {
  const labels: Labels = { from: escapeHtml(facts.orientation.from), to: escapeHtml(facts.orientation.to) };

  if (facts.kpis.length === 0) {
    return section(
      'Overall direction',
      `<p>No KPIs are in scope for the current filters, so there is nothing to compare between ${labels.from} and ${labels.to}.</p>`,
    );
  }

  return [
    overallDirection(facts, labels),
    targetAttainment(facts, labels),
    keySiteDrivers(facts, labels),
    areasNeedingAttention(facts, labels),
    positivePerformance(facts, labels),
    suggestedNextSteps(facts, labels),
  ]
    .filter((part): part is string => part !== null)
    .join('');
}

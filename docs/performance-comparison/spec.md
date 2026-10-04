# Insights Performance Comparison — Prototype Spec

**Epic:** NXT-77201 · **Stories:** NXT-77202 (Overlay & Setup), NXT-77217 (Rules Engine), NXT-77208 (Summary), NXT-77210 (KPI Comparison), NXT-77211 (Performance Trend), NXT-77212 (Site Drivers), NXT-77213 (Copy & Download), NXT-77214 (Schoolie). NXT-77203 (Resource Catalog) is out of scope for the prototype.

This file is the source of truth for the prototype. It distills the Jira stories and adds the prototype-specific decisions made after discovery (`docs/performance-comparison/discovery.md`). Where this file and the stories disagree, this file wins for the prototype.

---

## 0. What this prototype is for

This is a **product prototype**. The development team will read this code and re-implement the feature in the production SchoolCafé/Insights codebase, which has real KPI calculations, real benchmarks, real security, and real Schoolie AI.

That has three consequences for how the code should be written:

1. **The rules engine is the most important deliverable.** It should be pure, framework-free TypeScript with thorough unit tests, so developers can port it almost line for line.
2. **Mock data sits behind a clear service interface.** UI components never import mock data directly. They call a comparison data service, so developers can see exactly what shape of data the production API must return.
3. **Favor clarity over cleverness.** Name things after the spec. Comment non-obvious rules with the story/section they come from (e.g. `// NXT-77217 §13 one-sided data`).

### Out of scope for the prototype
- **Security and permissions.** No role checks, no site-level or KPI-level trimming, no resource catalog, no restricted users, no hide/show logic. All sites and all KPIs are visible. Developers will implement security in production.
- **Making the Insights Dashboard data-driven.** The dashboard keeps its existing mock data. The only dashboard change is adding the Compare action. Dashboard and comparison numbers are not expected to reconcile.
- **Real AI calls.** Schoolie returns a mock response (see §11).
- **Supabase.** All comparison mock data is generated in memory. Supabase remains used only for the existing telemetry/feedback.
- **Full/raw data export.**

---

## 1. Core principles

- **The application determines the facts. Schoolie explains the facts.** All classifications, deltas, target statuses, Needs Attention, and deterministic descriptions come from the rules engine. Nothing else recalculates them.
- **One centralized result per KPI.** The KPI table, Summary, Needs Attention filter, Site Drivers, Trend context, exports, and the Schoolie payload all consume the same engine output.
- **No overall score or winner.** KPIs stay independently interpretable.
- **No Data is never zero.** A missing benchmark is never a missed target.

---

## 2. Terminology

- **Left side / right side** — the two comparison definitions. Internally they may be called A (left) and B (right). **A/B must never appear in the UI, exports, descriptions, or the Schoolie payload's user-facing text.**
- **Baseline** — the **left side** is always the mathematical baseline/reference. The right side is compared against it. This is internal only; never show a "Baseline" label.
- **Side definition** = Site Scope + Timeframe.
- **Generated label** — the user-facing name of a side, e.g. `High Schools · SY 2025–26`. Used everywhere a side needs to be identified.

---

## 3. Prototype decisions (made after discovery)

| Topic | Decision |
|---|---|
| Demo "today" | A single constant `DEMO_AS_OF_DATE = 2026-04-16`, used by the timeframe selector, data generator, partial-period detection, and labels. |
| School year | July 1 – June 30. Not configurable. |
| Mock data years | SY 2023–24 and SY 2024–25 full; SY 2025–26 partial through `DEMO_AS_OF_DATE`. Earlier school years in the selector (SY 2022–23 and older) have no data, which is a natural No Data demo. |
| Prior Year to Date | A timeframe option covering the same elapsed portion of the prior school year as Year to Date: from Jul 1 of the prior school year through the as-of date's month and day one year earlier. With `DEMO_AS_OF_DATE` 2026-04-16 it is Jul 1, 2024 – Apr 16, 2025. Feb 29 maps to Feb 28. It is **not** partial (the period is complete). |
| Timeframe selections are never altered | The application never trims, normalizes, or changes a user's selected timeframe to match the other side. Differences in period length are surfaced only through the informational period-length notice (§6). |
| Default comparison | **None.** Both sides start empty. Nothing is calculated until both sides have a site scope and a timeframe. |
| KPI values | Mock data, not real business formulas. Generate plausible values directly. Store additive components where aggregation needs them (see §9). |
| A La Carte | À la carte sales, dollars. Mock data. |
| Reimbursement | Federal reimbursement claimed, dollars. Mock data. |
| Participation (Breakfast/Lunch/Snack/Supper) | Mock numerator/denominator pairs that produce realistic percentages (no values over 100%). |
| ENP | Percentage, lower is favorable. |
| Default trend interval | Based on the longer of the two sides' spans: ≤ 14 days → Day; ≤ 93 days → Week; ≤ 366 days → Month; otherwise Quarter. |
| Quarters | School-year quarters: Q1 = Jul–Sep, Q2 = Oct–Dec, Q3 = Jan–Mar, Q4 = Apr–Jun. |
| Benchmark resolution | Single site: site → site type → district → none. Site-type selection: site type → district → none. All Sites / Multiple Sites: district → none. **Never average site benchmarks.** Site Drivers uses each site's own resolved benchmark. |
| Sum-KPI benchmarks | **Prototype convention.** Benchmarks for Revenue, Meals, MEQs, A La Carte, Reimbursement, and Waste are stored as a rate **per site, per serving day**. A side's target = rate × the scope's site-serving-days with data through the through date (days each site was open and reporting). This makes targets meaningful for any timeframe and site scope, and gives partial periods a proportional target. Production may store these benchmarks differently (e.g. annual or monthly totals); developers should map them to an equivalent per-day rate. |
| District target choices | District Lunch target is 60% and Eco Dis is 52%. `DASHBOARD_METRICS.expected` stores Lunch as 2% and Eco Dis as 10%, which are not plausible targets for those KPIs. Breakfast, Snack, and Supper use `DASHBOARD_METRICS.expected` (20%, 10%, 10%). |
| Inventory targets | Inventory Turnover Rate has **site-level** benchmarks only ("Varies by site"), as context; site-type and district scopes show no turnover target. Physical Inventory Discrepancy has a district context target of 0% (`DASHBOARD_METRICS.expected`, i.e. "≤ 0% of total inventory"). Neither gets Met/Not Met. |
| Inventory point in time | Inventory KPIs use each site's **last month-end count within the period**. A period with no month-end count yet (e.g. This Month, This Week, Today before the month closes) shows No Data for inventory. |
| Benchmark school year | A timeframe's benchmarks come from its school year. A custom range that spans Jul 1 uses the benchmarks of the school year it **starts** in. |
| Informational KPI targets | Inventory Turnover Rate and Physical Inventory Discrepancy may display a benchmark as context, but get **no** Met/Not Met status, are excluded from target-attainment counts, and never qualify for Needs Attention. Inventory Value has no target. |
| Site label for one-site types | A site-type selection that resolves to exactly one site (e.g. Central Office) uses that site's name as its label, not the plural type name (see §6). |
| Site Drivers matching | Matched (side-by-side by site) only when both sides resolve to the **identical** set of sites. Otherwise each side's sites are listed independently. |
| Trend compatibility | See §7. |
| Schoolie | Real structured-facts payload, new `performance_comparison` prompt, mock response templated from the payload. See §11. |
| Tests | Vitest is added as a dev dependency. The rules engine and date/aggregation utilities must have unit tests. |

---

## 4. KPI rules matrix (NXT-77217 §2)

| KPI | Display format | Type | Favorable | Materiality | Threshold | Aggregation (prototype) | Target |
|---|---|---|---|---|---|---|---|
| Breakfast | % | Directional | Higher | Percentage-point | 0.5 pts | ratio of sums | Configured benchmark |
| Lunch | % | Directional | Higher | Percentage-point | 0.5 pts | ratio of sums | Configured benchmark |
| Snack | % | Directional | Higher | Percentage-point | 0.5 pts | ratio of sums | Configured benchmark |
| Supper | % | Directional | Higher | Percentage-point | 0.5 pts | ratio of sums | Configured benchmark |
| Revenue | $ | Directional | Higher | Relative % | 2% | sum | Configured benchmark |
| Meals | count | Directional | Higher | Relative % | 2% | sum | Configured benchmark |
| MEQs | count | Directional | Higher | Relative % | 2% | sum | Configured benchmark |
| Eco Dis | % | Directional | Higher | Percentage-point | 0.5 pts | ratio of sums | Configured benchmark |
| PNA | % | Directional | Lower | Percentage-point | 0.5 pts | ratio of sums | Configured benchmark |
| ENP | % | Directional | Lower | Percentage-point | 0.5 pts | ratio of sums | Configured benchmark |
| MPLH | number (2 dp) | Directional | Higher | Relative % | 2% | ratio of sums (MEQs ÷ labor hours) | Configured benchmark |
| A La Carte | $ | Directional | Higher | Relative % | 2% | sum | Configured benchmark |
| Reimbursement | $ | Directional | Higher | Relative % | 2% | sum | Configured benchmark |
| Waste | $ | Directional | Lower | Relative % | 2% | sum | Configured benchmark |
| Inventory Value | $ | Informational | None | None | — | point-in-time (last snapshot in period) | No target |
| Inventory Turnover Rate | days | Informational | None | None | — | point-in-time (last snapshot in period) | Site benchmark as context only |
| Physical Inventory Discrepancy | $ + % of total inventory value | Informational | None | None | — | point-in-time (last snapshot in period) | Benchmark as context only |

For **sum** KPIs, the side value is the total over the side's sites and period. Ratio KPIs must aggregate as **ratio of sums** across sites and days, never as an average of site ratios.

---

## 5. Rules engine (NXT-77217)

A pure function (or small set of functions) in `src/features/performanceComparison/engine/` (or the closest equivalent to existing repo conventions). No React, no imports from mock data.

### 5.1 Inputs
For one KPI: KPI key, left actual (number | null), right actual (number | null), left target (number | null), right target (number | null), left/right generated labels, left/right partial-period info (`{ isPartial, throughDate }`).

### 5.2 Output (per KPI)
```ts
{
  kpi,
  kind: 'directional' | 'informational',
  left:  { actual, target, actualFormatted, targetFormatted, hasData, targetStatus },   // 'Met' | 'NotMet' | 'NotAvailable'
  right: { actual, target, actualFormatted, targetFormatted, hasData, targetStatus },
  delta: number | null,                 // right − left (absolute, in KPI units; pts for % KPIs)
  relativeChange: number | null,        // (right − left) / left, relative-% KPIs only
  deltaFormatted: string | null,        // "+4.3 pts", "−$500", "+2.0% (+$2,000)"
  materiality: 'Material' | 'NotMaterial' | 'NotApplicable' | null,
  classification: 'Improved' | 'Comparable' | 'Declined' | 'NoData' | 'RelativeNotApplicable' | 'Informational',
  favorability: 'favorable' | 'unfavorable' | 'neutral' | null,
  targetTransition: 'MetToMet' | 'NotMetToMet' | 'MetToNotMet' | 'NotMetToNotMet' | null,
  needsAttention: boolean,
  needsAttentionReasons: Array<'Declined' | 'BelowTarget'>,
  description: string,                  // deterministic, user-facing
  partialNote: string | null,
}
```
Exact names may follow repo conventions, but every field above must be represented.

### 5.3 Orientation
- Percentage-point change = right − left.
- Relative change = (right − left) / left.
- Swap reverses orientation; everything is recalculated.

### 5.4 Materiality
- **Percentage-point KPIs:** |change| ≥ 0.5 pts → material; < 0.5 → Comparable. Use the raw pt difference, never relative %. Guard against floating-point error (e.g. compare after rounding to 4 dp) so 60 → 60.5 is exactly material.
- **Relative-% KPIs:** |relative change| ≥ 2% → material; < 2% → Comparable.
- **Baseline zero (relative-% KPIs):** left = 0 and right ≠ 0 → classification `RelativeNotApplicable`; show the absolute change; no relative %; not Improved/Declined/Comparable; never show ∞. Both 0 → change 0, Comparable.
  - `RelativeNotApplicable` results are excluded from the Summary's Improved/Comparable/Declined counts (§8), but can still qualify for Needs Attention through the right side's target status (§5.8).
- **Informational KPIs:** no materiality; classification `Informational`.

### 5.5 Directionality
Once material: higher-is-favorable → increase = Improved, decrease = Declined. Lower-is-favorable → decrease = Improved, increase = Declined. The sign of the delta never by itself means favorable.

### 5.6 Target status (per side, directional KPIs only)
- Target null → `NotAvailable`.
- No data on that side → `NotAvailable`.
- Higher-is-favorable → Met when actual ≥ target. Lower-is-favorable → Met when actual ≤ target.
- Each side uses its own target. Never copy one side's target to the other.
- Target transition only when both sides have a status of Met or NotMet.

### 5.7 No Data and one-sided data (§13)
- Neither side has data → `NoData`; no delta.
- Only one side has data → keep that side's actual and target status; other side is No Data; no delta, materiality, classification (use `NoData`), or transition.
- No Data never becomes 0, Declined, Comparable, a missed target, or Needs Attention by itself.

### 5.8 Needs Attention (§17)
Directional KPIs only. `needsAttention = right.targetStatus === 'NotMet' || classification === 'Declined'`.
- Reasons: `Declined`, `BelowTarget`, or both.
- Right side has data and is Not Met, left side No Data → qualifies (BelowTarget).
- Only left side has data → does not qualify.
- Right target missing → can only qualify via Declined.
- `RelativeNotApplicable` → can still qualify via right-side BelowTarget.
- Informational KPIs never qualify.

### 5.9 Deterministic descriptions (§10, §11, §20, §21)
Format: `<Classification> — <sentence>.` Optionally a second short sentence for partial-period context. One or two sentences, factual, no causes, no recommendations, no "better/worse", no temporal words ("previous", "current", "now") unless chronology is explicit, no A/B, no "left/right side". When a side must be named, use its generated label.

Decision matrix (all 12 classification × transition combinations, plus the missing-target row):

| Classification | Transition | Sentence behavior |
|---|---|---|
| Improved | NotMet→Met | material improvement + meets target |
| Improved | NotMet→NotMet | material improvement + remains outside target |
| Improved | Met→Met | material improvement + meets target |
| Improved | Met→NotMet | material improvement but does not meet target |
| Declined | Met→NotMet | material decline + does not meet target |
| Declined | Met→Met | material decline + still meets target |
| Declined | NotMet→NotMet | material decline + remains outside target |
| Declined | NotMet→Met | material decline but meets target |
| Comparable | Met→Met | relatively stable + meets target |
| Comparable | NotMet→NotMet | relatively stable + remains outside target |
| Comparable | NotMet→Met | below materiality threshold + meets target |
| Comparable | Met→NotMet | below materiality threshold + does not meet target |
| any | no transition (missing target) | omit target commentary |

These examples are **test fixtures**; the engine must reproduce them (wording may differ slightly only if the test is updated deliberately):

| Input | Expected |
|---|---|
| Lunch 58% → 60%, target 60% | Improved — Lunch participation increased by 2 percentage points and meets the 60% target. |
| Waste $10,000 → $9,500, target $9,000 | Improved — Waste decreased by $500 but remains above the $9,000 target. |
| PNA 8% → 6.5%, target 5% | Improved — PNA decreased by 1.5 percentage points but remains above the 5% target. |
| Lunch 68% → 66%, target 60% | Declined — Lunch participation decreased by 2 percentage points but meets the 60% target. |
| Lunch 61% → 59%, target 60% | Declined — Lunch participation decreased by 2 percentage points and is below the 60% target. |
| Lunch 63% → 63.4%, target 60% | Comparable — Lunch participation remained relatively stable and meets the 60% target. |
| Lunch 59.8% → 60.2%, target 60% | Comparable — Lunch participation changed by less than the materiality threshold but meets the 60% target. |
| Revenue $100,000 → $104,000, no target | Improved — Revenue increased by $4,000 (4.0%). |
| Lunch 58% (target 55%) → 58.4% (target 65%), right label "High Schools · SY 2025–26" | Comparable — Lunch participation increased by 0.4 percentage points; High Schools · SY 2025–26 is below its 65% target. |
| Revenue +$8,420 (6.3%), right side partial through Apr 16 | Improved — Revenue increased by $8,420 (6.3%). High Schools · SY 2025–26 includes data through April 16, 2026. |
| Lunch no data on left (label "High Schools · SY 2022–23") | No Data — Lunch participation could not be compared because data is unavailable for High Schools · SY 2022–23. |
| Inventory Value $167,224 → $181,750 | Inventory value increased from $167,224 to $181,750, a change of $14,526. |
| Inventory Turnover 16 → 14 days | Inventory turnover changed from 16 days to 14 days. |
| Physical Inventory Discrepancy 3.2% → 2.6% | Physical inventory discrepancy changed from 3.2% to 2.6% of total inventory value. |

Materiality fixtures:

| Input | Expected |
|---|---|
| Lunch 60% → 60.4% | Comparable (+0.4 pts) |
| Lunch 60% → 60.5% | Improved (+0.5 pts) |
| Lunch 60% → 59.5% | Declined (−0.5 pts) |
| Revenue $100,000 → $101,500 | Comparable (+1.5%) |
| Revenue $100,000 → $102,000 | Improved (+2.0%) |
| Meals 12,500 → 12,625 | Comparable (+1.0%) |
| Meals 12,500 → 12,750 | Improved (+2.0%) |
| MPLH 18.40 → 18.58 | Comparable (~+1.0%) |
| MPLH 18.40 → 18.77 | Improved (~+2.0%) |
| Waste $10,000 → $9,800 | Improved (−2.0%, lower is favorable) |
| Revenue $0 → $5,000 | RelativeNotApplicable, delta +$5,000 |
| Revenue $0 → $0 | Comparable, delta $0 |

The engine also evaluates **site-level** results for Site Drivers using the same function with each site's actuals and targets.

---

## 6. Overlay & Comparison Setup (NXT-77202)

- **Entry point:** a Compare icon button in the Insights Dashboard header action group (`SimpleHeader`), using the existing icon-button class string, Lucide `GitCompareArrows`, and `title="Compare"`.
- **Overlay:** full-screen, following the AppUsageDrawer pattern (`fixed inset-0 bg-white z-50`, sticky header, scrolling gray body). Header: back navigation to the dashboard, "Performance Comparison" title, and Schoolie + Download actions on the right (disabled until a comparison exists).
- **Layout order:** Comparison Setup → Filters → Comparison Summary → KPI Comparison → Performance Trend → materiality note.
- **Setup:** two side panels (left and right), each with a site selector and a timeframe selector, reusing `DemoSchoolSelector` and `TimeframeSelector` made controlled through optional `value`/`onChange` props. The dashboard's existing uncontrolled usage must keep working.
- **Generated label** shown below each side's selectors:
  - Site part: single site → site name; one site type → plural type name ("High Schools"); All → "All Sites"; anything else → "Multiple Sites".
  - Timeframe part: school-year options → "SY 2025–26" (YTD and Prior Year resolve to their SY); Prior Year to Date → "SY 2024–25 through Apr 16"; relative options use their name ("This Month", "Last Week"); Custom Range → "Aug 1 – Sep 30, 2025".
  - Joined with " · ".
  - Partial indicator when the timeframe extends past `DEMO_AS_OF_DATE`, e.g. a small badge "Partial · through Apr 16, 2026".
- **Timeframe options:** the existing `TimeframeSelector` options plus **Prior Year to Date**, listed directly after Prior Year (see §3). Example generated label: "High Schools · SY 2024–25 through Apr 16".
- **Period-length notice** (informational only; never changes a selection), shown below the setup when **exactly one side is partial** and the other side covers **at least 10% more days** (calendar days; the partial side counts days through its through date):
  - Default text: "These timeframes cover different lengths of time and cumulative totals may be difficult to compare directly."
  - When the pair is Year to Date and Prior Year (in either order), use instead: "These timeframes cover different lengths of time. For a like-for-like comparison, consider Prior Year to Date."
- **Swap:** exchanges the complete definitions and recalculates everything. Disabled until both sides are set.
- **Empty state:** until both sides are set, the Summary/KPI/Trend areas show a single prompt: "Select sites and a timeframe for both sides to compare."
- **Filters:** a KPI multi-select (`MultiSelectDropdown`; default all 17 KPIs), a Needs Attention toggle, and Clear Filters/Reset (resets the KPI filter and Needs Attention only, not the sides).
- **Focused KPI** (set by clicking a KPI row) is separate state from the KPI filter and never changes it. If a filter change removes the focused KPI from scope, clear the focus.
- **Materiality note** (small italic, near the bottom): "Percentage-based KPIs are classified as Improved or Declined when they change by at least 0.5 percentage points. Dollar, count, and MPLH KPIs use a 2% relative-change threshold. Inventory KPIs are informational and are not classified."
- **State:** a single comparison store (Zustand, matching `useInsightsPreferencesStore`) holding left/right definitions, KPI filter, Needs Attention toggle, focused KPI, and trend interval. Derived data comes from memoized selectors/hooks so every component reads the same engine results.

---

## 7. Performance Trend (NXT-77211)

- One KPI at a time: the focused KPI. Empty state when none is focused: "Select a KPI from the KPI Comparison table to view its trend." Never auto-select a KPI.
- One Recharts `ComposedChart`: paired bars per aligned interval (left actual, right actual) plus a target line per side where a target exists. If both sides share the same target, draw one line labeled for both. No benchmark bars. Sides distinguished by color **and** pattern/label (not color alone).
- Interval selector: Day | Week | Month | Quarter. Default from §3. Extend the existing granularity dropdown UI and lift the Usage module's bucketing into a shared util with `quarter` added.
- **Alignment:** buckets are aligned by **position within each side's period**, not by calendar date:
  - Day: position = school-day index within the period, except week-vs-week aligns by weekday (Mon–Fri).
  - Week: week index within the period.
  - Month: month position counted from the start of the period (month 1 = the month the period starts in). For school years this is identical to the school-year position (Jul = 1); counting from the period start keeps custom ranges that cross Jul 1 in order.
  - Quarter: buckets remain school-year quarters (Q1 = Jul–Sep), but positions count from the quarter the period starts in. For school years this is identical to the quarter number.
- **Compatibility (prototype rule):** a trend is available when (a) both timeframes are the same kind (both school years, both months, both weeks, both single days) or are custom ranges whose lengths differ by ≤ 10%, and (b) the selected interval is finer than the period (no Quarter for a month, no Week for a single day; a custom range's grain is set by its length: ≤ 1 day = day, ≤ 7 days = week, ≤ 31 days = month, ≤ 92 days = quarter, longer = year), and (c) each side produces at least 2 buckets. Otherwise show: **"Trend comparison unavailable. Select comparable timeframes to view performance trends."** The rest of the page stays available.
- **Partial periods:** show only buckets that have occurred; never draw zero or extrapolated bars for the future; show the partial-period note under the chart.
- Non-serving days (weekends, breaks) are excluded from Day buckets, not shown as No Data.

---

## 8. Summary, KPI table, Site Drivers

### Comparison Summary (NXT-77208)
- Compact block above the KPI table.
- Counts of Improved / Comparable / Declined among directional KPIs in the current scope (KPI filter + Needs Attention). No Data, RelativeNotApplicable, and Informational KPIs are excluded from those counts; No Data may be shown separately as "N with no data".
- Target attainment per side, using generated labels: "High Schools · SY 2025–26 — 11 of 15 KPIs meeting target". Denominator = directional KPIs in scope with data and a target on that side.
- No charts, gauges, scores, or winners.

### KPI Comparison table (NXT-77210)
- One row per KPI in scope. Columns: KPI · left (actual, target) · right (actual, target) · Change · Target Status · Performance (classification badge + description) · Site Drivers summary.
- Column headers are the generated labels. Target Status names sides by their timeframe/label part.
- Classification badges use the `insightsFavorable` / `insightsNeutral` / `insightsUnfavorable` tokens **plus** text and an icon (`TrendIndicator`). Informational rows use a neutral "Informational" badge.
- Needs Attention rows show their reason(s): "Declined", "Below Target", or both.
- Clicking a row focuses that KPI (highlighted); a clear control removes focus.
- Model the table on `MPLHSchoolTable`; store numbers, format at render time.
- No mini charts or gauges in rows.

### Site Drivers (NXT-77212)
- Available when at least one side resolves to more than one site.
- Row summary, e.g. "6 of 10 sites meeting target · 4 below target · View Sites", or for matched populations "8 of 10 → 6 of 10 sites meeting target · View Sites". Denominator = sites with data and a target.
- **View Sites** opens a side drawer (KPI drawer pattern, `z-[55]` above the overlay) titled with the KPI and both generated labels.
- **Matched** sites (identical site sets): one row per site with left actual, right actual, change, each side's target where they differ, and status (classification · target status), all from the engine.
- **Unmatched:** two independent lists, each headed by its generated label, each site with actual, target, target status, and variance from target.
- Default sort: largest unfavorable variance from target first (right side for matched); sites with no target next; No Data last. Sortable columns.
- Refresh in place if the comparison changes while the drawer is open.

---

## 9. Mock data

Everything lives in `src/data/` and is generated in memory with a seeded PRNG so results are deterministic across reloads.

- **Site registry:** promote `DEMO_SITES` out of `DemoSchoolSelector` into `src/data/`, keeping its `{ siteTypeList, siteList }` shape. Grow to ~18 sites across Elementary, Middle, and High (plus Central Office), reusing names from the MPLH/PNA/ENP mocks where possible (Lincoln Elementary, Washington Middle, Roosevelt High, Jefferson Elementary, etc.).
- **Daily per-site facts** for every serving day from 2023-07-01 to `DEMO_AS_OF_DATE`. Generate the components each KPI needs to aggregate correctly:
  - Participation KPIs and Eco Dis/PNA/ENP: numerator and denominator per day.
  - Revenue, A La Carte, Reimbursement, Waste: dollars per day.
  - Meals, MEQs: counts per day. MPLH: MEQs and labor hours per day.
  - Inventory: one snapshot per site per month (value, turnover days, discrepancy $ and % of value).
- **Built-in scenarios** (document each in a comment):
  - Visible year-over-year shifts so Improved, Comparable, and Declined all appear for district-wide SY 2024–25 vs SY 2025–26.
  - At least one KPI that changes by just under its threshold (Comparable) and one that crosses its target while staying Comparable.
  - One site that opens mid SY 2024–25 (no data before opening, so one-sided No Data appears in SY 2023–24 comparisons).
  - One site with a legitimate zero (e.g. Supper = 0 served all year) distinct from No Data.
  - A relative-% KPI with a zero baseline for one site (to exercise RelativeNotApplicable).
  - Sites within a type that differ meaningfully, so Site Drivers shows a spread.
- **Benchmarks table:** `{ kpi, schoolYear, scope: 'district' | 'siteType' | 'site', scopeId?, value | null }`.
  - District values seeded from existing constants where they exist (MPLH 18.5, PNA 10, ENP 5, `DASHBOARD_METRICS.expected`).
  - Site-type and site overrides that **differ by school year** (e.g. Lunch target 60% in SY 2024–25, 62% in SY 2025–26 for High Schools).
  - Deliberately missing: Inventory Value (never has one), A La Carte (none configured), and one directional KPI missing only for SY 2024–25.
  - Resolver implements the precedence in §3.
  - **Sum KPIs (prototype convention, see §3):** for Revenue, Meals, MEQs, A La Carte, Reimbursement, and Waste, `value` is a rate per site per serving day, and the comparison data service computes the side target as rate × the scope's site-serving-days with data through the through date. Site-type rates reflect that type's typical site size so a site-type target isn't measured against an average-sized site. Production may store these benchmarks differently; developers should map them to an equivalent per-day rate. All other KPIs store `value` in the KPI's own units.
- **Leave existing dashboard mocks untouched.**

### Comparison data service
`src/services/comparisonDataService.ts` (async, matching existing `*Service.ts` conventions):
```ts
getSideDataset(siteSelection, timeframeSelection) → {
  label, siteIds, timeframe: { start, end, isPartial, throughDate },
  kpis:   { [kpi]: { actual: number | null, target: number | null } },
  sites:  { [siteId]: { [kpi]: { actual: number | null, target: number | null } } },
  series: (kpi, interval) → Array<{ position, label, actual: number | null }>
}
```
This is the contract developers will replace with the production API. UI components and the engine never touch mock data directly.

---

## 10. Copy & Download (NXT-77213)

Reuse `CopyMenu`, `CSVRenderer`/`ICSVReportData`, `ExportMenu`, `html-to-image`, `file-saver`, and the dashboard PDF flow.
- **KPI table:** Copy (TSV) and Download (CSV) of exactly the rows in scope, with generated labels in headers, formatted values, classification, target statuses, and description. No Data and missing targets export as "No Data" / "—", never 0.
- **Trend:** Copy data (TSV) and Copy image; Download as CSV and PNG. Includes KPI, labels, interval, actuals, targets, partial note. Disabled when the trend is unavailable or no KPI is focused.
- **Page PDF:** header Download action → a new adapter producing `IPDFDashReportData`: title, both generated labels, site scopes, timeframes, current filters, Summary, KPI table (with compact Site Drivers summaries), and the focused KPI's trend image when available. No interactive controls, no Schoolie. Filename `Performance_Comparison_<YYYY-MM-DD>.pdf`. District/user names come from `MOCK_CURRENT_USER`, not hardcoded strings.
- Exports always reflect current orientation and filters.

---

## 11. Schoolie (NXT-77214)

- Schoolie action in the overlay header opens the existing `SchoolieDrawer`, extended with a width option so it occupies about one-quarter to one-third of the screen (`z-[60]`).
- Analysis runs automatically on open; the drawer states it is analyzing the current comparison, using generated labels.
- **Structured facts payload:** built from the engine output and comparison state: generated labels, site scopes, timeframes, partial info, KPI filter, Needs Attention state, and per-KPI engine results (actuals, targets, delta, classification, target statuses, transition, Needs Attention reasons, description, informational flag), plus Site Drivers summaries. Only KPIs in the current scope are included.
- **New prompt:** add a `performance_comparison` prompt to the mock Schoolie prompt data so it appears and versions in AI Config like the others. Leave `compare_sites` alone.
- **Mock response:** `getPromptAnalysis(promptId, context?)` gains an optional context argument. For `performance_comparison`, generate the response from the payload (not canned text): overall direction, target attainment, key site drivers, areas needing attention, positive performance, and 2–3 suggested next areas to investigate. It must never contradict engine classifications or describe No Data / missing targets as poor performance.
- Include a collapsible "Facts sent to Schoolie" section showing the JSON payload, so developers can see the contract.
- **Stale state:** store a hash of the analyzed context. When sides, orientation, KPI filter, or Needs Attention change while the drawer is open, mark the analysis "Out of date" with a **Reanalyze** button. Do not auto-rerun.
- Pass the real `promptId` and `sourceEntryPoint: 'CompareSites'` to telemetry and `ProductFeedback` for this drawer instead of the hardcoded values.

---

## 12. Cross-cutting

- Use the `insights*` color tokens, not raw emerald/red, for classification states.
- Never communicate status by color alone.
- Responsive down to tablet width; tables scroll horizontally inside their own container.
- Follow `trackInsightsEvent` for key actions (open comparison, swap, focus KPI, view sites, export, Schoolie).
- Z-index plan: overlay `z-50`, Site Drivers drawer `z-[55]`, Schoolie `z-[60]`, dropdown menus above their container.
- Note that `tailwindcss-animate` is not installed; use `transition-transform translate-x-*` for slide effects.

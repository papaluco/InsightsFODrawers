# Performance Comparison (NXT-77201): As-Built

**Purpose:** a factual description of what the prototype does, organized by Jira story, for comparison against each story's acceptance criteria.
**Branch:** `feature/performance-comparison-NXT-77201` @ `9a3261a` (after the acceptance review and final refinements) · **Date:** 2026-10-04
**Related:** [spec.md](spec.md) (prototype source of truth), [acceptance-review.md](acceptance-review.md) (spec-by-spec review, issues, accepted deviations).
**Tests at this commit:** `npm test`, 26 files, 559 tests, all passing.

Conventions in this document:
- Quoted text in "double quotes" is the exact on-screen or exported wording.
- "Left" and "right" are the internal names of the two comparison definitions (left = the side the change is measured from). The user never sees these words.
- The demo "today" is `DEMO_AS_OF_DATE` = **2026-04-16** (`src/constants/demo.ts`). Every relative timeframe, partial-period check, and label uses it.

---

## NXT-77202 Overlay & Comparison Setup

### Behavior as built

**Entry point**
- The Insights Dashboard header (`SimpleHeader`) has a new icon button at the start of its action group: Lucide `GitCompareArrows`, tooltip "Compare", same classes as the neighboring icon buttons.
- Clicking it opens the overlay and sends `COMPARISON_OPENED` (context `entryPoint: 'Dashboard'`).

**Overlay**
- Full-screen white panel (`fixed inset-0 z-50`) that slides in from the right, following the AppUsageDrawer pattern. Its header stays fixed; the body scrolls on a gray background.
- Header, left to right:
  - Back button (chevron, tooltip "Back to Insights")
  - Compare icon tile
  - Title "Performance Comparison", subtitle "Compare KPI performance across sites and timeframes"
  - On the right: the Schoolie button and the Download button.
- **Schoolie** is disabled until both sides are set. Disabled tooltip: "Set both sides to analyze this comparison with Schoolie". Enabled tooltip: "Ask Schoolie about this comparison".
- **Download** is disabled until both sides are set. Disabled tooltip: "Set both sides to download this comparison". Enabled, it opens a menu with "Download PDF" (UI only, see NXT-77213).
- Escape closes the overlay when nothing inside it is open (see Cross-cutting).
- Closing the overlay keeps the comparison: both sides, the filters, the focused KPI, the interval, and the collapsed sections are all still there when it reopens. A page reload starts empty. State is in memory only, with no persistence.

**Page layout (top to bottom)**
1. Comparison Setup, with the period-length notice inside it.
2. Comparison Summary.
3. KPI Comparison, with the filters in its title row.
4. Performance Trend.

Every section is a collapsible card (`CollapsiblePanel`) with a chevron. All sections start expanded. A panel's title-row actions (filters, copy/download icons, the interval selector) are hidden while it is collapsed. There is no separate Filters panel and no always-visible materiality note.

**Comparison Setup**
- Two side panels with a Swap button between them. From tablet width (`md`) up the panels sit side by side; below that they stack, and the Swap icon changes from ↔ to ↕.
- Each side panel holds:
  - A "SITES" selector (`DemoSchoolSelector`, placeholder "Select sites")
  - A "TIMEFRAME" selector (`TimeframeSelector`, placeholder "Select timeframe")
  - Below them, a status area:
    - Before the side is set: "Choose sites and a timeframe."
    - While loading: "Loading…"
    - On error: "Couldn't load this comparison: {error}"
    - Once set: the generated label, plus a partial badge when it applies.
- The panels have accessible names "First comparison" and "Second comparison".
- Both sides start empty. **Nothing is calculated until both sides have sites and a timeframe.**

**Selectors (made controlled; the dashboard's uncontrolled use is unchanged)**
- Site selector: a checkbox list with "All Schools", the 5 site types, and the 18 sites, with Clear and Apply buttons. A selection takes effect on **Apply**.
  - Button text uses the dashboard wording: "All Schools", the site name, the plural type name (e.g. "High Schools"), or "N Schools Selected".
  - Clear followed by Apply empties the side's sites.
- Timeframe selector options, in order:
  - Today, Yesterday, This Week, Last Week, This Month, Last Month
  - Year to Date, Prior Year, **Prior Year to Date**
  - SY 2023 - 2024, SY 2022 - 2023, SY 2021 - 2022, SY 2020 - 2021
  - Custom Range (opens a date-range picker; the range is set once both dates are picked).
- Each option shows a computed date description under its name, e.g. This Week "Apr 13 – Apr 19, 2026" and Year to Date "Jul 1, 2025 – Apr 16, 2026".
- Both menus are portaled to `document.body` so they render above the overlay.

**Timeframe resolution** (`src/utils/timeframes.ts`)
- Weeks run Monday–Sunday. This Week = Apr 13–19, 2026; Last Week = Apr 6–12, 2026.
- This Month = Apr 1–30, 2026; Last Month = Mar 1–31, 2026.
- Year to Date = the full school year containing the as-of date (Jul 1, 2025 – Jun 30, 2026), flagged partial with data through Apr 16, 2026.
- Prior Year = Jul 1, 2024 – Jun 30, 2025.
- Prior Year to Date = Jul 1, 2024 – Apr 16, 2025. It is not partial. Feb 29 maps to Feb 28.
- **Partial** means the period ends after the as-of date. Today is not partial; This Week, This Month, and Year to Date are.
- **Selections are never trimmed or adjusted to match the other side.**

**Generated label** = site part + " · " + timeframe part.
- Site part, based on the sites the selection resolves to:
  - Every site → "All Sites"
  - One site → its name. A one-site type also uses the site name, e.g. Central Office → "District Central Office".
  - Exactly one type's members → the plural type name, e.g. "High Schools". This also applies when every high school is picked individually.
  - Anything else → "Multiple Sites (N)", where N is the resolved site count.
- Timeframe part:
  - School-year options, Year to Date, and Prior Year → "SY 2025–26" style
  - Prior Year to Date → "SY 2024–25 through Apr 16"
  - Relative options → their name ("This Month", "Last Week")
  - Custom Range → "Aug 1 – Sep 30, 2025", or "Dec 15, 2025 – Jan 10, 2026" across calendar years.
- Partial badge (amber pill with a clock icon), next to the label: "Partial · through Apr 16, 2026". A period that starts after the as-of date shows "Partial · no data yet" instead.

**Auto-fill**
- When the user applies sites or picks a timeframe on the left side and that field on the right side is still empty, the value is copied to the right side.
- Each field fills independently.
- A right-side field that already has a value is never overwritten. Nothing is ever copied right → left.
- Clearing the left sites copies nothing.

**Swap**
- Round button between the panels. Disabled until both sides are set, with the tooltip "Select sites and a timeframe for both comparisons to swap". Enabled tooltip: "Swap comparisons".
- Swap exchanges the two complete definitions and recalculates everything. The focused KPI and the filters stay as they are.
- Sends `COMPARISON_SWAPPED`.

**Period-length notice**
- An indigo info box inside Comparison Setup, below the side panels. It is informational only and never changes a selection.
- Shown when **exactly one side is partial** and the other side covers **at least 10% more calendar days**. The partial side counts days through its through date.
- Text:
  - Default: "These timeframes cover different lengths of time and cumulative totals may be difficult to compare directly."
  - Year to Date paired with Prior Year (either order): "These timeframes cover different lengths of time. For a like-for-like comparison, consider Prior Year to Date."

**Empty and loading states**
- Until both sides are set, the area below Setup shows a single prompt: "Select sites and a timeframe for both sides to compare."
- On the first load after both sides are set: "Loading comparison…". If loading fails: "This comparison could not be loaded."
- On later changes, the previous results stay visible, dimmed, with an "Updating…" chip.
- A response for a selection that is no longer current is discarded.

**Filters** (in the KPI Comparison title row; see NXT-77210)
- KPI multi-select, defaulting to all 17 KPIs.
- Needs Attention toggle.
- Clear Filters: resets the KPI filter and Needs Attention only, never the sides.
- The filters set the scope for the Summary, KPI table, Site Drivers, exports, and the Schoolie payload.

**Focused KPI**
- Set by clicking a KPI row. It is separate state from the KPI filter and never changes it.
- Focus is cleared when the KPI filter or the Needs Attention toggle removes that KPI from scope.

**Materiality note**
- Shown on hover or keyboard focus of an info icon next to the KPI Comparison title: "Percentage-based KPIs are classified as Improved or Declined when they change by at least 0.5 percentage points. Dollar, count, and MPLH KPIs use a 2% relative-change threshold. Inventory KPIs are informational and are not classified."

**State**
- One Zustand store (`useComparisonStore`) holds:
  - left and right definitions
  - the KPI filter (always kept in display order) and the Needs Attention toggle
  - the focused KPI and the user's trend interval choice (null = default)
  - which sections are expanded
- `useComparison()` is called once in the overlay. It loads both side datasets through `comparisonDataService`, runs the selector, and passes the single result object to every section.

**Telemetry**
- `COMPARISON_SIDE_CHANGED`, with `comparisonSide` (`left`/`right`) and `comparisonField` (`sites`/`timeframe`).
- All comparison events carry `entryPoint: 'PerformanceComparison'`, except `COMPARISON_OPENED`, which carries `'Dashboard'`.

### Decisions made during the prototype
- **Prior Year to Date** timeframe (`prior_ytd`), listed right after Prior Year. It is also added to the dashboard's timeframe list.
- **Year to Date resolves to the full school year** (end Jun 30) with partial info, rather than ending at the as-of date.
- **No default comparison.** Both sides start empty.
- **Auto-fill** right from left, per field, only into empty fields.
- **"Multiple Sites (N)"** labels, so two different multi-site selections can be told apart. Labels are based on the resolved site set.
- A one-site type uses the site's name in its label.
- **Period-length notice** inside Setup, with a separate YTD/Prior Year wording that suggests Prior Year to Date. Selections are never auto-trimmed.
- **Filters live in the KPI Comparison title row**, not in a separate Filters panel. The materiality note sits behind an info icon.
- Every section is collapsible, with its state in the store.
- Clear Filters is disabled while the filters are already at their defaults.
- Schoolie and Download stay disabled, with tooltips, until both sides are set. Schoolie closes if a side is cleared.
- The timeframe selector's option descriptions are computed from the resolved period instead of being hardcoded.
- The site selector fixes the old dashboard bug where a type-only selection showed "0 Schools Selected".
- Selector menus are portaled and close on Escape.

### Not built / prototype-only
- **Security and permissions:** no role checks and no site- or KPI-level trimming. All 18 sites, 5 site types, and 17 KPIs are visible to everyone.
- **Demo date:** `DEMO_AS_OF_DATE` stands in for the real current date.
- **Site registry:** an in-memory demo registry of 18 sites (`src/data/siteRegistry.ts`). Production supplies the district's real sites and site types.
- **School years:** a fixed Jul 1 – Jun 30 school year. The timeframe list is the existing hardcoded one plus Prior Year to Date; older SY options have no data.
- **Telemetry user:** telemetry uses `MOCK_CURRENT_USER`.
- **Persistence:** none. No saved or shared comparisons, no URL state.

### Key files
- `src/features/performanceComparison/components/PerformanceComparisonOverlay.tsx`: overlay, header, Schoolie and Download actions, Escape
- `.../components/ComparisonSetup.tsx`, `.../components/ComparisonSidePanel.tsx`: setup, Swap, notice, labels, badges
- `.../components/ComparisonResultsArea.tsx`: layout, empty and loading states, materiality note
- `.../components/ComparisonFilters.tsx`: KPI multi-select, Needs Attention, Clear Filters
- `.../store/useComparisonStore.ts`: state, auto-fill, swap, filter and focus rules
- `.../hooks/useComparison.ts`, `.../hooks/useSideDataset.ts`: loading, single results object, stale-response guard
- `src/utils/timeframes.ts`, `src/utils/schoolYear.ts`, `src/utils/dateOnly.ts`: timeframe resolution, labels, partial info, period-length notice
- `src/data/siteRegistry.ts`: site registry, scope resolution, site labels
- `src/components/Common/DemoSchoolSelector.tsx`, `src/components/Common/TimeframeSelector.tsx`: controlled `value`/`onChange`/`placeholder` props
- `src/components/InsightsDashboard/SimpleHeader.tsx`, `src/pages/InsightsPage.tsx`: Compare button and overlay mount

---

## NXT-77203 Resource Catalog

**Out of scope for the prototype. Nothing was built for this story.**

There is no resource catalog, no resource-based permissions, no restricted users, and no hide/show logic. Every user sees all sites and all 17 KPIs. Production must implement the catalog and apply it to the site selector, the KPI filter, the KPI table, Site Drivers, exports, and the Schoolie payload.

---

## NXT-77217 Rules & Deterministic Description Engine

### Behavior as built

**Shape**
- Pure TypeScript in `src/features/performanceComparison/engine/`, with no React and no mock-data imports.
- `compareKpi(input)` takes, for one KPI:
  - the KPI key
  - each side's actual (number or null) and target (number or null)
  - each side's generated label
  - each side's timeframe (period plus `isPartial` and `throughDate`)
  - for Physical Inventory Discrepancy, the $ amount.
- It returns one result per KPI:
  - `kind`
  - per side: actual, target, formatted actual, formatted target, `hasData`, target status
  - `delta`, `relativeChange`, `deltaFormatted`
  - `materiality`, `classification`, `favorability`, `targetTransition`
  - `needsAttention` and `needsAttentionReasons`
  - `description`, `descriptionBody` (the description without its "<Classification> — " prefix), `partialNote`
- `selectComparison(left, right, filters)` runs the engine once per KPI, plus Site Drivers per KPI. It applies the KPI filter and Needs Attention toggle and builds the Summary counts. Every surface reads this one result object; components do no arithmetic on actuals or targets.

**KPI rules matrix** (`src/constants/kpiDefinitions.ts`; display order = this order)

| KPI (display name) | Format | Kind | Favorable | Materiality | Aggregation | Target |
|---|---|---|---|---|---|---|
| Breakfast | % (1 dp) | Directional | Higher | ≥ 0.5 pts | ratio of sums | configured |
| Lunch | % | Directional | Higher | ≥ 0.5 pts | ratio of sums | configured |
| Snack | % | Directional | Higher | ≥ 0.5 pts | ratio of sums | configured |
| Supper | % | Directional | Higher | ≥ 0.5 pts | ratio of sums | configured |
| Meals | count | Directional | Higher | ≥ 2% relative | sum | configured |
| Meal Equivalents (MEQs) | count | Directional | Higher | ≥ 2% relative | sum | configured |
| Economically Disadvantaged | % | Directional | Higher | ≥ 0.5 pts | ratio of sums | configured |
| Paid Not Applied (PNA) | % | Directional | Lower | ≥ 0.5 pts | ratio of sums | configured |
| Eligible Not Participating (ENP) | % | Directional | Lower | ≥ 0.5 pts | ratio of sums | configured |
| Meals per Labor Hour (MPLH) | number (2 dp) | Directional | Higher | ≥ 2% relative | ratio of sums (MEQs ÷ labor hours) | configured |
| Revenue | $ (whole) | Directional | Higher | ≥ 2% relative | sum | configured |
| A La Carte | $ | Directional | Higher | ≥ 2% relative | sum | configured |
| Reimbursement | $ | Directional | Higher | ≥ 2% relative | sum | configured |
| Waste | $ | Directional | Lower | ≥ 2% relative | sum | configured |
| Inventory Value | $ | Informational | — | none | point in time | never |
| Inventory Turnover Rate | days (≤ 1 dp) | Informational | — | none | point in time | context only |
| Physical Inventory Discrepancy | % of inventory value + $ | Informational | — | none | point in time | context only |

**Change and materiality**
- Change is always right − left. For % KPIs it is in percentage points. Relative change = (right − left) ÷ left, for relative-% KPIs only.
- Percentage-point KPIs are material when |change| ≥ 0.5 pts. The comparison rounds to 4 dp first, so 60 → 60.5 is exactly material.
- Relative-% KPIs are material when |relative change| ≥ 2%. The fraction is rounded to 4 dp first, so 1.995% counts as material, matching the displayed "2.0%". This was accepted in the acceptance review (#16).
- Below the threshold → **Comparable**.
- Above it, direction decides:
  - Higher is favorable: increase = **Improved**, decrease = **Declined**.
  - Lower is favorable: decrease = **Improved**, increase = **Declined**.
  - The sign of the change never decides this on its own.
- **Baseline zero** (relative-% KPIs only):
  - 0 → non-zero gives **RelativeNotApplicable**: absolute change only, no relative %, never ∞.
  - 0 → 0 gives change 0, **Comparable**.
- Informational KPIs → **Informational**, with no materiality.
- **No Data:** if either side's actual is null, the classification is **NoData**, with no delta, materiality, or transition. The side that has data keeps its actual and target status. No Data never becomes 0, Declined, Comparable, or a missed target.

**Favorability:** Improved = favorable; Declined = unfavorable; Comparable, RelativeNotApplicable and Informational = neutral; No Data = null.

**Target status** (per side, directional KPIs only)
- `NotAvailable` when the target is null or that side has no data.
- Otherwise Met when actual ≥ target (higher is favorable) or actual ≤ target (lower is favorable).
- **Both values are rounded to display precision before comparing:** 1 dp for %, whole dollars and counts, 2 dp for MPLH, 1 dp for days. Example: 59.97% shows as 60.0% and is Met against 60%.
- Each side uses its own target.
- Informational KPIs are always `NotAvailable`, even when a context benchmark is shown. Inventory Value ignores any target passed in.
- A transition (MetToMet, NotMetToMet, MetToNotMet, NotMetToNotMet) is set only when both sides are Met or NotMet.

**Needs Attention**
- Directional KPIs only.
- Reasons: `Declined` when the classification is Declined; `BelowTarget` when the right side is Not Met. A KPI can have both.
- Consequences:
  - Right Not Met with left No Data → qualifies (BelowTarget).
  - Only the left side has data → never qualifies.
  - Right target missing → can qualify only through Declined.
  - RelativeNotApplicable → can still qualify through BelowTarget.
  - Informational KPIs never qualify.
- The user-facing reason labels are "Declined" and "Below Target".

**Formatting** (`src/utils/kpiFormatters.ts`)
- Negative values use the true minus sign "−".
- No Data → "No Data". A missing target → "—".
- Percentage-point change in compact form: "+2.5%", "−0.5%", "0.0%".
- Relative-% change: "+2.0% (+$2,000)" (relative %, then the absolute change in parentheses).
- RelativeNotApplicable change: the absolute change only, e.g. "+$5,000".
- MPLH change: "+0.37". Days: "+2 days". Counts: "+125".
- Targets: % targets drop a trailing ".0" ("60%") but keep real decimals ("62.5%"). Other formats use the KPI's display format.
- Physical Inventory Discrepancy value: "3.1% ($7,647)". The % is the compared value; its change is in points ("−0.6%").

**Deterministic descriptions** (`engine/descriptions.ts`)
- Format: "<Classification> — <sentence>." The classification labels are "Improved", "Comparable", "Declined", "No Data", and "Relative Change N/A".
- Subjects used in sentences:
  - "Breakfast participation", "Lunch participation", "Snack participation", "Supper participation"
  - "Meals", "MEQs", "Eco Dis", "PNA", "ENP", "MPLH"
  - "Revenue", "A La Carte sales", "Reimbursement", "Waste"
  - "Inventory value", "Inventory turnover", "Physical inventory discrepancy"
- Change phrasing:
  - % KPIs: "increased by 2 percentage points". Points use 1 dp with trailing zeros dropped, and 2 dp if 1 dp would round a non-zero change to 0. One point is "1 percentage point".
  - Other KPIs: "decreased by $500".
  - A change that rounds to zero: "did not change".
- **No target clause** (no transition, or the right target is missing):
  - Improved/Declined: the change plus the relative % in parentheses, e.g. "Improved — Revenue increased by $4,000 (4.0%)."
  - Comparable: "Comparable — <subject> remained relatively stable."
- **With a target clause**, from the 12-cell decision matrix:
  - Improved:
    - NotMet→Met and Met→Met: "…and meets the X target"
    - NotMet→NotMet: "…but remains below/above the X target"
    - Met→NotMet: "…but is below/above the X target"
  - Declined:
    - Met→NotMet: "…and is below/above the X target"
    - Met→Met and NotMet→Met: "…but meets the X target"
    - NotMet→NotMet: "…and remains below/above the X target"
  - Comparable:
    - Met→Met: "remained relatively stable and meets the X target"
    - NotMet→NotMet: "remained relatively stable and is below/above the X target"
    - NotMet→Met: "changed by less than the materiality threshold but meets the X target"
    - Met→NotMet: "changed by less than the materiality threshold and is below/above the X target"
  - "below" is used for higher-is-favorable KPIs, "above" for lower-is-favorable. X is the right side's target.
  - **The relative % is left out whenever there is a target clause.**
- **Comparable, status changed, and the two sides' targets differ:** states the actual change and names the right side by its label, e.g. "Comparable — Lunch participation increased by 0.4 percentage points; High Schools · SY 2025–26 is below its 65% target."
- **RelativeNotApplicable:** "Relative Change N/A — Revenue increased by $5,000 from $0, so a percentage change cannot be calculated." When the right side has a status, it adds "; <right label> meets/is below its X target".
- **No Data:** "No Data — Lunch participation could not be compared because data is unavailable for <label>." When both sides lack data: "…for <label> and <label>."
- **Informational** (no prefix):
  - "Inventory value increased from $167,224 to $181,750, a change of $14,526."
  - "Inventory turnover changed from 16 days to 14 days."
  - "Physical inventory discrepancy changed from 3.2% to 2.6% of total inventory value."
  - Equal values: "<subject> remained at <value>."
- **Partial note:** appended as a second sentence only when it is material, meaning the KPI is a sum KPI (Revenue, Meals, MEQs, A La Carte, Reimbursement, Waste) **and** the period-length notice applies. Example: "High Schools · SY 2025–26 includes data through April 16, 2026." Never added to ratio, informational, or No Data results.
- Descriptions never contain left/right, A/B, baseline, causes, or recommendations. A test checks the forbidden words across generated descriptions.

**Site-level evaluation:** Site Drivers runs the same `compareKpi` per site with that site's own actuals and own resolved target (see NXT-77212).

### Decisions made during the prototype
- **Target status is compared at display precision**, so status always agrees with the displayed numbers. Materiality still uses raw values with the 4 dp guard.
- **"%" for percentage-point changes** in compact places: the Change column, Site Drivers, CSV/copy, and the Schoolie formatted fields. Full sentences keep the words "percentage points".
- **Material partial notes only:** sum KPIs, and only when the period-length notice applies.
- The relative % is omitted from sentences that carry a target clause.
- The Comparable + differing-targets + status-change wording names the right side's own target by label. This generalizes the spec's "below its 65% target" fixture.
- RelativeNotApplicable displays as "Relative Change N/A". Favorability is neutral, not null, for RelativeNotApplicable and Informational.
- "Did not change" is used when the change rounds to zero.
- A zero denominator gives null (No Data).
- Relative materiality rounds the fraction to 4 dp, so 1.995%–1.9999% counts as material (accepted).
- `descriptionBody` was added so the KPI table can show the classification as a badge next to the sentence. Exports and Schoolie use the full `description`.

### Not built / prototype-only
- **Inputs:** the engine is complete as a portable reference, but its inputs (actuals, targets) are mock values. Production must supply real KPI calculations and benchmarks in the same shape: null for No Data and no target, never 0.
- **Fixed rules:** thresholds and favorable directions are constants in `kpiDefinitions.ts` and are not configurable.
- **Localization:** none. Text is English only, and numbers are formatted `en-US`.

### Key files
- `src/features/performanceComparison/engine/compareKpi.ts`: classification, materiality, target status, transitions, Needs Attention
- `.../engine/descriptions.ts`: decision matrix, sentences, partial note, classification labels
- `.../engine/types.ts`, `.../engine/rounding.ts`
- `.../engine/siteDrivers.ts`: site-level evaluation
- `.../selectors/selectComparison.ts`: runs the engine for all KPIs, filters, Summary counts
- `src/constants/kpiDefinitions.ts`: rules matrix
- `src/utils/kpiFormatters.ts`: value, delta, target formatting, display precision
- Tests: `.../engine/compareKpi.test.ts` (every spec fixture, decision matrix, swap symmetry, forbidden words, Needs Attention rules), `.../engine/siteDrivers.test.ts`, `.../selectors/selectComparison.test.ts`

---

## NXT-77208 Comparison Summary

### Behavior as built
- A collapsible card titled "Comparison Summary", directly above KPI Comparison.
- Inside, a small heading "TARGET ATTAINMENT" with a target icon and an info icon. On hover or focus the icon shows: "Counts cover directional KPIs in the current filters. Inventory KPIs are informational and are not counted."
- **Counts sentence:** one line covering directional KPIs in scope (KPI filter + Needs Attention), e.g. "6 ↗ Improved, 1 — Comparable, 7 ↘ Declined."
  - Each part is colored with the insights favorable, neutral, or unfavorable token, **plus** its arrow icon and text.
  - Optional trailing text, in gray:
    - " N with no data." (directional KPIs classified No Data)
    - " N with a zero starting value (no relative change)." (RelativeNotApplicable)
  - No Data, RelativeNotApplicable, and Informational KPIs are not in the Improved/Comparable/Declined counts.
- **Target attainment**, one line per side, in left-then-right order:
  - "<generated label> — X of Y KPIs meeting target", with real spaces around the dash.
  - Y = directional KPIs in scope with data and a target on that side. X = those that are Met.
  - When Y is 0: "<label> — No KPIs in scope have data and a target".
- When no KPIs are in scope: "No KPIs match the current filters."
- No charts, gauges, scores, or winners.
- All numbers come from `selectComparison`'s summary. The component does no counting of its own.

### Decisions made during the prototype
- **One counts sentence instead of count cards**, under a "Target Attainment" heading, with the "what the counts cover" note behind an info icon.
- The "with a zero starting value (no relative change)" text was added for RelativeNotApplicable results.
- A "No KPIs match the current filters." state.
- The Summary follows the Needs Attention toggle as well as the KPI filter. With Needs Attention on, it counts only KPIs that need attention.

### Not built / prototype-only
- **Data:** counts come from mock data. There is nothing production-specific in the Summary logic itself.

### Key files
- `src/features/performanceComparison/components/ComparisonSummary.tsx`
- `.../components/InfoTip.tsx`
- `.../selectors/selectComparison.ts` (`summarize`)

---

## NXT-77210 KPI Comparison

### Behavior as built

**Panel**
- A collapsible card titled "KPI Comparison", with an info icon holding the materiality note (see NXT-77202).
- The title-row actions, right-aligned and wrapping below the title at narrower widths, are:
  1. A "Focused: <KPI name>" chip with an × (aria label "Clear focused KPI"), shown only while a KPI is focused.
  2. **KPI filter:** a compact multi-select whose visible label is hidden for screen readers only ("KPIs").
     - Button text: "All KPIs", a single KPI's name, "N selected", or "No KPIs selected".
     - The menu has a search box ("Search KPIs..."), Select All and Clear, checkboxes in display order, and a "N of 17 selected" footer.
  3. **Needs Attention:** a pill toggle with a ⚠ icon, red (`insightsUnfavorable`) when on.
  4. **Clear Filters:** a button with a reset icon, disabled while the filters are at their defaults.
  5. **Copy or download:** one copy icon whose menu holds the copy and download items (see NXT-77213).

**Table** (modeled on `MPLHSchoolTable`; scrolls horizontally inside its own container)

| Column | Content |
|---|---|
| KPI | Display name. Needs Attention rows add a ⚠ icon; hover or focus shows "Needs attention: Declined · Below Target" (or one reason). |
| <left label> / "ACTUAL · TARGET" | Actual (bold), or "No Data" (gray italic). Second line: "Target 60%", or "Target —" when there is no target. Informational KPIs show "Context <value>" or "No target". |
| <right label> / "ACTUAL · TARGET" | Same, for the right side. |
| Change | The engine's `deltaFormatted`, or "—". A combined change ("−6.8% (−$709,713)") can wrap only between the % and the parenthesized amount. |
| Target Status | Two lines, one per side: "<compact side name>: <status>" with an icon. Statuses: "Met" (check, favorable), "Not Met" (×, unfavorable), "No target" or "No Data" (gray minus), "Not evaluated" (informational KPIs). |
| Performance | Classification badge (border and text in the insights token, plus a `TrendIndicator` arrow; Informational has an info icon; No Data is gray with no icon), then `descriptionBody`. |
| Site Drivers | Only when at least one side has more than one site; otherwise the column is not rendered. See NXT-77212. |

- **Column headers** are the generated labels, with "Actual · Target" under each.
- **Compact side names** in Target Status: if only the timeframes differ, the timeframe part ("SY 2024–25: Met"); if only the sites differ, the site part ("High Schools: Not Met"); if both differ or the labels are identical, the full labels.
- **Badge arrows:** Improved and Declined arrows follow the sign of the change and take their color from favorability, so a PNA decrease shows a down arrow in the favorable color. Comparable is a flat neutral arrow. Relative Change N/A keeps its arrow but stays neutral.
- **Descriptions** are clamped to two lines. When cut off, the full text shows in a tooltip on hover or while the row has keyboard focus. The focused row shows the full text.
- **Row focus:**
  - Clicking a row, or pressing Enter/Space on it, focuses that KPI: indigo background with a left accent bar. Tooltip "Click to focus this KPI".
  - Clicking the focused row again clears focus ("Click to clear focus").
  - Focus drives the Performance Trend. "View Sites" never changes focus.
  - Sends `COMPARISON_KPI_FOCUSED`.
- **Empty table:** "No KPIs in the current filters need attention." when Needs Attention is on; otherwise "No KPIs selected. Choose KPIs in the KPI filter to compare them."
- Rows are always in display order, whatever order the filter was clicked in.
- Values are stored as numbers and formatted by the engine and formatters. No mini charts or gauges.

### Decisions made during the prototype
- **Filters sit in the KPI Comparison header**, compact, and hide with the panel when collapsed. `MultiSelectDropdown` gained an opt-in `hideLabel` prop, and `CollapsiblePanel` gained a `titleAddon` slot for the info icon.
- **Needs Attention reasons appear on hover or focus of the ⚠ icon, not as row text.** This was a PO decision (acceptance review #3).
- The Site Drivers column is hidden entirely when no side has more than one site, in the table, CSV, and copy alike.
- Descriptions are clamped to two lines with a tooltip, and expanded on the focused row. Column widths were rebalanced for row height.
- Compact side names are used in Target Status and in the Site Drivers cell.
- The badge shows the classification, and the sentence next to it drops the "<Classification> — " prefix.
- Informational rows say "Context" instead of "Target", and "Not evaluated" for status.

### Not built / prototype-only
- **Data:** values come from mock data via `comparisonDataService`.
- **Security:** no KPI-level security trimming.
- **Customization:** no column customization, sorting, or row reordering in the KPI table. Order is fixed to display order.

### Key files
- `src/features/performanceComparison/components/ComparisonKpiTable.tsx`
- `.../components/ClassificationBadge.tsx`, `.../components/TargetStatusIndicator.tsx`
- `.../components/ComparisonFilters.tsx`
- `.../ui/comparisonDisplay.ts`: badge, status text, compact side names, reason labels
- `.../hooks/useSideShortNames.ts`
- `src/components/Common/CollapsiblePanel.tsx`, `src/components/Common/MultiSelectDropdown.tsx`

---

## NXT-77211 Performance Trend

### Behavior as built

**Panel**
- A collapsible card titled "Performance Trend", charting **one KPI: the focused KPI**.
- Title-row actions:
  - The interval selector: a Day | Week | Month | Quarter segmented control. Enabled buttons have the tooltip "Show by <interval>"; unavailable ones are disabled with a reason.
  - The trend copy/download menu (see NXT-77213).
- States:
  - No focused KPI: "Select a KPI from the KPI Comparison table to view its trend." A KPI is never auto-selected.
  - No compatible interval: "Trend comparison unavailable. Select comparable timeframes to view performance trends." The rest of the page still works.
  - Every interval dropped for lack of data: "Neither timeframe has data for <KPI name>."
- Otherwise, a heading "<KPI name> by <interval>" (e.g. "Lunch by month") above the chart.

**Chart** (one Recharts `ComposedChart`)
- Paired bars per aligned position:
  - Left side: solid indigo.
  - Right side: sky-blue diagonal hatch with an outline.
- Target lines:
  - Left: dashed (6 4).
  - Right: dotted (2 3).
  - When both sides have identical targets at every shared position, **one** solid slate line labeled "Target · both comparisons".
- No benchmark bars. Informational KPIs chart without target lines.
- Legend: each side's generated label with its swatch (solid or hatched), plus "Target · <label>" or "Target · both comparisons".
- Tooltip:
  - The position label, then for each side: its label, then "<calendar bucket label>: <value> · Target <target>".
  - When a side has no bucket at that position: "No matching period".
  - No Data values read "No Data".
- Y-axis is abbreviated by format: "$1.2M", "250K", "60%", "18.5", "14 days".
- The chart region has the aria label "Trend chart: <left label> compared with <right label>".

**Targets per bucket**
- Ratio and point-in-time KPIs: the side's target, unchanged.
- Sum KPIs: the per-site, per-serving-day benchmark rate × that bucket's site-serving-days with data. Each month's target covers that month only. A bucket with no data has no sum target.

**Default interval**
- Based on the longer of the two sides' **full** spans (Year to Date counts as the full school year):
  - ≤ 14 days → Day
  - ≤ 93 days → Week
  - ≤ 366 days → Month
  - otherwise Quarter
- The user's choice is kept while it remains available. If the comparison changes so that it's unavailable, the choice is cleared and the default applies.
- If the default is unavailable too, the nearest available interval is used (the finer one on a tie).

**Alignment** (buckets are paired by position within each side's period, not by calendar date)
- **Day:** the serving-day index within the period ("Day 1", "Day 2"…). Week vs week aligns by weekday instead ("Mon"…"Fri"). Non-serving days (weekends, winter and spring break, summer) are left out of Day buckets.
- **Week:** the Monday–Sunday week index from the period start ("Wk 1"…).
- **Month:** the month index from the period start. The axis shows the month name ("Aug") when both sides' buckets are the same calendar month, as with school year vs school year; otherwise "Month 3".
- **Quarter:** school-year quarters (Q1 = Jul–Sep, Q2 = Oct–Dec, Q3 = Jan–Mar, Q4 = Apr–Jun), indexed from the quarter the period starts in. The axis shows "Q1"…"Q4".

**Compatibility** (all three must hold, or that interval is disabled)
1. Both timeframes are the same kind (day, week, month, or school year), or both are custom ranges whose lengths differ by ≤ 10%. Year to Date, Prior Year, Prior Year to Date, and the SY options all count as "school year".
2. The interval is finer than each side's period: no Week for a single day, no Month for a month, and so on. A custom range's grain comes from its length: ≤ 1 day = day, ≤ 7 = week, ≤ 31 = month, ≤ 92 = quarter, longer = year.
3. Each side has at least 2 buckets that have occurred.

Disabled-interval tooltips:
- "Unavailable: the two timeframes are different kinds of periods."
- "Unavailable: the two custom ranges differ in length by more than 10%."
- "Unavailable: <Interval> is not shorter than the selected timeframes."
- "Unavailable: each timeframe needs at least 2 <intervals> that have occurred."

**Partial periods and gaps**
- Only buckets through the through date are drawn. Future periods never appear as zero or projected bars.
- Under the chart, one note per partial side: "<label> includes data through April 16, 2026. Later periods have not occurred and are not shown." (or "<label> has no data yet.").
- Positions where neither side has data are dropped, e.g. July and June by Month.
- Positions where only one side lacks data stay, with a gap for that side (never a zero bar).
- Side effect: a dropped week can make the axis skip a number. Example: month vs month by Week reads "Wk 1, 2, 3, 5, 6" when a break week has no data on either side.

### Decisions made during the prototype
- **The interval control is a segmented control**, not the dashboard's granularity dropdown. Unavailable intervals stay visible, disabled, with a reason (approved in Phase 6).
- **Month and Quarter positions count from the period start** rather than from the school year, so custom ranges that cross Jul 1 stay in order. For school years the result is the same.
- **Prior Year to Date counts as a school year** for compatibility, so it trends against Year to Date.
- The default interval uses the full period span (YTD = full year). If both the default and the user's choice are unavailable, the nearest available interval is used.
- Custom-range grain by length, and the ≤ 10% length rule for custom ranges, are prototype rules.
- **Sum-KPI targets are computed per bucket** from the per-day rate.
- Extra messages: "Neither timeframe has data for <KPI>." and "…Later periods have not occurred and are not shown."
- The merged target line is labeled "Target · both comparisons". Aria labels say "first/second comparison" instead of naming sides.
- The Usage module's bucketing was lifted into `src/utils/timeBuckets.ts` with `quarter` added. All four Usage trend charts now import it, with output unchanged.

### Not built / prototype-only
- **Data:** the series come from mock daily facts through `SideDataset.series()`. Production must supply bucketed actuals and targets per side in the same shape (position, label, start/end, actual|null, target|null).
- **School calendar:** serving days come from a mock calendar (`src/data/mockSchoolCalendar.ts`) with fixed first and last days and winter and spring breaks for SY 2023–24 to SY 2025–26. Production needs the district's real calendar.
- **Exports:** trend copy and download are UI only (NXT-77213).

### Key files
- `src/features/performanceComparison/trend/trendRules.ts`: default interval, buckets, alignment, compatibility
- `.../trend/trendView.ts`: interval options and reasons, interval resolution, chart rows, target merging, partial notes
- `.../hooks/useComparisonTrend.ts`
- `.../components/ComparisonTrendChart.tsx`, `.../components/TrendIntervalSelector.tsx`
- `src/utils/timeBuckets.ts` (shared with Usage), `src/components/Common/charts/trendChartStyles.ts` (shared with the dashboard's PerformanceTrends)
- `src/services/comparisonDataService.ts` (`series`)

---

## NXT-77212 Site Drivers

### Behavior as built

**Availability**
- Only when at least one side resolves to more than one site. Otherwise the KPI table has no Site Drivers column.
- If Site Drivers stops applying while the drawer is open, the drawer closes.

**Evaluation** (engine)
- Every site on each side is checked against **its own resolved target** (site → site type → district). Benchmarks are never averaged.
- Per site, the engine gives:
  - actual and target (formatted)
  - target status
  - variance from target (actual − target, in KPI units, formatted like a change: "−3.1%" for points, "+$200")
  - an "unfavorable variance" used for sorting, which respects the KPI's favorable direction.
- **Matched** means both sides resolve to the **identical** set of sites. Each site then also gets a full `compareKpi` result (classification, change, both statuses), with its sides labeled "<site name> · <timeframe label>".
- Any other pair of sets is **unmatched**: each side's sites are listed independently.

**Row summary** (the KPI table's Site Drivers cell; "View Sites" link at the end)
- Matched: "8 of 10 → 6 of 10 sites meeting target" (left → right).
- Unmatched, one multi-site side: "6 of 10 sites meeting target · 4 below target". For lower-is-favorable KPIs this reads "above target". The "· N below target" part is left out when every site meets its target.
- Unmatched, both sides multi-site: one line per side, named with the compact side name. The table uses the compact form "High Schools: 3 of 4 meeting"; the cell's tooltip has the full wording.
- The denominator is sites with data and a target. If no site has a target: "No site targets". If no site has data: "No site data".
- Informational KPIs show only "N sites".
- "View Sites" (aria label "View sites for <KPI>") opens the drawer and sends `COMPARISON_SITE_DRIVERS_OPENED`. It does not focus the row.

**Drawer**
- Portaled to the body at `z-[55]`, above the overlay, with a dimmed backdrop. It slides in from the right, `max-w-5xl` wide, with a white body.
- Header: school icon, title "<KPI name> · Site Drivers", subtitle "<left label> vs <right label>", and a close button (aria "Close Site Drivers"). Focus moves to the close button on open.
- Closing: the close button, a click on the backdrop, or Escape.
- No Swap in the drawer.
- While the comparison updates it shows "Updating…" and refreshes in place.
- When Schoolie is open on desktop, the drawer shifts left of the Schoolie panel.

**Matched table**
- Section title "<site scope label> · N sites", e.g. "High Schools · 5 sites". Two summary lines: "<compact name>: <attainment text>" for each side.
- Columns:
  - Site
  - <left compact name> (actual)
  - <right compact name> (actual)
  - Change
  - Target: one value when both sides agree, otherwise "55% → 58%", with a tooltip naming each side. Informational KPIs show it as "Context", only when a site has one.
  - Variance from target (<right compact name>)
  - Status: the classification badge plus "Met → Not Met" style target statuses, or one status when both are the same "none" status.
- Informational KPIs have no variance or status columns.

**Unmatched tables**
- Two sections, each titled with the side's generated label and its attainment text. A single-site side is listed too.
- Columns: Site, Actual, Target (or Context), Target Status, Variance from target.

**Variance coloring**
- Favorable color when the site meets its own target, unfavorable when it doesn't, neutral with no target.
- Always with the status icon and screen-reader status text, so color is never the only signal.

**Sorting**
- Default order: largest unfavorable variance from target first (based on the right side when matched), then sites with data but no target, then No Data, with ties broken by name.
- Every column header is a sort button with a single chevron on the active column only, as in the MPLH school table.
  - First click: names and status ascending (worst status first); number columns largest first.
  - The next click on the same column flips the direction.
  - No Data always sorts last.
- A "Default order" link appears once a column is sorted.
- Sorting resets when the drawer switches KPI.
- Footnote:
  - Directional KPIs: "Each site is measured against its own target. Sites furthest outside their target are listed first (based on <right compact name>), then sites with no target, then sites with No Data. Select a column header to sort." The parenthetical appears only when matched.
  - Informational KPIs: "Inventory KPIs are informational, so sites are not evaluated against a target."

**Copy:** each table has a copy icon (tooltip "Copy table"). It copies the table exactly as shown (columns, text, current sort order) as tab-separated text, with the toast "Copied to clipboard". There is no download in the drawer.

### Decisions made during the prototype
- **The matched table adds a variance column** for the right side.
- **The drawer has no Swap.** Swap lives only in Comparison Setup; the in-drawer Swap was removed in the final round.
- White body, a wider panel (`max-w-5xl`), a per-table copy icon, MPLH-style sorting, and a "Default order" reset.
- **Compact row-summary lines** in the table, with the full wording in the tooltip and in exports.
- **Explicit "no target" benchmark rows** stop the precedence fallback. This creates the mixed-target demo: Hamilton High has no Lunch target for SY 2025–26, shows "No target", and is excluded from the "of N" count.
- The drawer closes itself when Site Drivers no longer applies. A dimmed backdrop closes it on click.

### Not built / prototype-only
- **Data:** site actuals and resolved site targets come from mock data and mock benchmarks. Production supplies per-site values and per-site resolved benchmarks.
- **Security:** no site-level security trimming of which sites appear.
- **Exports and telemetry:** no download from the drawer; copy is client-side only. No telemetry for drawer sorting or copy.

### Key files
- `src/features/performanceComparison/engine/siteDrivers.ts`: per-site evaluation, matched/unmatched
- `.../ui/siteDriversView.ts`: row-summary text, default order, column sorting
- `.../ui/siteDriversExport.ts`: drawer table copy (TSV)
- `.../components/SiteDriversDrawer.tsx`
- `.../components/ComparisonKpiTable.tsx` (`SiteDriversCell`)
- `src/components/Common/SortIcon.tsx` (shared with `MPLHSchoolTable`)
- `src/data/mockComparisonBenchmarks.ts` (`resolveBenchmark`, the Hamilton `noTarget` row)

---

## NXT-77213 Copy & Download

### Behavior as built

**Pattern:** one icon per panel, as on the Insights Dashboard. It is the dashboard's `CopyMenu` (tooltip "Copy or download"), whose dropdown lists copy options under "COPY OPTIONS" and download items under "AVAILABLE EXPORTS". Menus layer above the overlay, close on outside click and on Escape, and hide while their panel is collapsed.

**KPI Comparison table (real)**
- Menu items:
  - "Copy Data" / "Excel Friendly": tab-separated text to the clipboard. Toast: "Copied N KPIs to the clipboard." On failure: "Could not copy to the clipboard."
  - "Download CSV" / "KPI table as shown (N KPIs)": a CSV through `CSVRenderer` (UTF-8 with BOM, so "—" and "−" display correctly in Excel).
  - No "Copy Image" item for the table.
- **Filename:** `Performance_Comparison_KPIs_<YYYY-MM-DD>.csv`, using the local date at the moment of the click.
- **Rows:** exactly the KPIs in scope (KPI filter + Needs Attention), in display order and the current orientation.
- **Columns:** `KPI | <left label> Actual | <left label> Target | <left label> Target Status | <right label> Actual | <right label> Target | <right label> Target Status | Change | Performance | Needs Attention | Needs Attention Reasons | Description | Site Drivers`
  - Values are the engine's formatted text, as the table shows it.
  - No Data exports as "No Data"; a missing target or change as "—"; never 0.
  - Informational KPIs export their context benchmark in the Target column.
  - Target Status is "Met", "Not Met", "No target", "No Data", or "Not evaluated".
  - Performance is the classification label, e.g. "Relative Change N/A".
  - Needs Attention is "Yes"/"No". The reasons are joined with " · ".
  - Description is the full engine description, with its classification prefix.
  - Site Drivers is the full-wording row summary, with lines joined by "; ". The column is left out entirely when no side has more than one site.
  - Tabs and line breaks inside a cell become spaces in the TSV.
- Sends `COMPARISON_EXPORTED` with `format: 'TSV'` or `'CSV'`.

**Performance Trend (UI only)**
- Menu items: "Copy Data", "Copy Image" ("PNG Clipboard"), "Download CSV" ("Trend data for the focused KPI"), and "Download PNG" ("Image of the trend chart").
- Each shows the toast "Not implemented in prototype."
- The icon is disabled, with a tooltip:
  - "Select a KPI in the KPI Comparison table to copy or download its trend" when no KPI is focused.
  - "The trend is unavailable for the current comparison" when there's no compatible interval or no rows.

**Page download (UI only):** the header Download icon, disabled until both sides are set. Its menu has "Download PDF" ("Summary, KPI table, and trend"), which shows "Not implemented in prototype."

**Site Drivers drawer (real):** per-table copy to the clipboard (see NXT-77212). No download.

**Toast:** a new minimal `ToastProvider` around the overlay, because the app had none. A white card with a colored left border appears at the bottom right and dismisses itself after 4 seconds.

### Decisions made during the prototype
- **Only the KPI table's Copy Data and Download CSV are real.** They are the reference column layout. Trend exports and the page PDF are UI only, with a "Not implemented in prototype." toast; production's existing dashboard implementation provides the behavior.
- **One menu per panel**, using the dashboard's exact wording ("Copy Data", "Copy Image", "Excel Friendly", "PNG Clipboard", "Available Exports"), instead of separate copy and download buttons.
- **"%" for percentage-point changes** in exported Change values. Description sentences still say "percentage points".
- The CSV is built when the user clicks, so the filename always has the download date.
- Needs Attention reasons are joined with " · ".
- Shared component changes, all backward compatible and opt-in:
  - `CopyMenu` gained `disabled`, `disabledReason`, `closeOnEscape`, `title`, and download items as children.
  - `ExportMenu` gained `title`, `disabled`, `disabledReason`, and `closeOnEscape`.

### Not built / prototype-only
- **Trend exports:** Copy Data (TSV), Copy Image (`html-to-image` PNG to the clipboard), Download CSV, and Download PNG are not built. Production should include the KPI, both labels, the interval, actuals, targets, and the partial note.
- **Page PDF:** not built. The spec calls for `IPDFDashReportData` with:
  - title, both labels, site scopes, timeframes, and current filters
  - the Summary
  - the KPI table with compact Site Drivers summaries
  - the focused KPI's trend image when available
  - no interactive controls and no Schoolie
  - filename `Performance_Comparison_<YYYY-MM-DD>.pdf`
  - district and user names from the current user.
- **Full/raw data export:** not built (out of scope).
- **Telemetry:** none for the UI-only export items (accepted, acceptance review #9).
- **Toast:** production may replace the prototype `ToastProvider` with its own.

### Key files
- `src/features/performanceComparison/components/ComparisonExportControls.tsx`: KPI table, trend, and page menus
- `.../ui/kpiTableExport.ts`: columns, rows, TSV, CSV filename (tested in `kpiTableExport.test.ts`)
- `.../ui/siteDriversExport.ts`: drawer table copy
- `src/components/Common/CopyMenu.tsx`, `src/components/Downloading/ExportMenu/ExportMenu.tsx`
- `src/components/Downloading/CSVGen/CSVRenderer.ts`
- `src/components/Common/Toast.tsx`, `src/components/Common/toastContext.ts`

---

## NXT-77214 Schoolie Analysis

### Behavior as built

**Opening**
- The header Schoolie button opens the existing `SchoolieDrawer` in a new `width="panel"` mode, portaled at `z-[60]`, and sends `COMPARISON_SCHOOLIE_OPENED`.
- Title "Schoolie AI — Performance Comparison", subtitle "AI analysis of the current comparison".
- Width: full width on phones, 400px at `sm`, half the screen at `md`, **one-third at `lg`+**.
- There is no backdrop.
- **Desktop (`lg`+):** the overlay reserves the panel's width as right padding while it's open (one shared width constant), with a padding transition, so every page control stays visible and clickable. An open Site Drivers drawer shifts left of the panel.
- **Tablet:** the panel overlays the page; no padding change.
- It slides in and out with `transition-transform` and stays mounted while closed.
- Escape closes an open dropdown or menu first, then Schoolie, then the overlay.
- Schoolie closes when the overlay closes or a side is cleared.

**Analysis**
- Runs automatically on open, once the facts for the current comparison are ready.
- Loading text: "Analyzing <left label> vs <right label>…" with "This usually takes just a moment."
- The mock call waits 1.5 seconds.
- The response renders as HTML with the existing disclaimer "Insights are generated by Schoolie AI and should be reviewed alongside your data." and the date.
- The existing error ("Retry") and empty states are kept.

**Facts payload** (`buildComparisonFacts`)
- Built only from engine results and side datasets; nothing is recalculated. **Only KPIs in the current scope are included.**
- Sides are keyed `from` (left) and `to` (right). The payload contains:
  - `orientation`: both labels plus three `rules` strings for the model.
  - `sides`: label; site scope (label, scope type, site count); timeframe (label, option ID, start, end); partial (`isPartial`, `throughDate`).
  - `periodLengthNotice`: the text, or null.
  - `filters`: KPI names, `allKpisSelected`, `needsAttentionOnly`.
  - `kpis`, one entry per KPI in scope:
    - name, `informational`, `favorableDirection`
    - `from` and `to`: actual, formatted actual, target, formatted target, `hasData`, target status
    - `delta`, `deltaFormatted`, `classification`, `targetTransition`
    - `needsAttention` and its reasons
    - the full description
    - `siteDrivers` (null when Site Drivers doesn't apply): `matched`, the full-wording summary, and, for KPIs needing attention, up to 3 `to`-side sites furthest outside their own targets (name, actual, target, variance).

**Prompt**
- A new `performance_comparison` prompt in the mock Schoolie prompt data (name "Performance Comparison", version 1). It appears and versions in AI Config like the others. `compare_sites` is untouched.
- The prompt text explains the payload and sets 10 rules: labels only, no chronology words, never contradict a classification, No Data is not poor performance, no target is not a miss, informational KPIs as context only, absolute change for a zero baseline, the partial period only when the notice applies, no causes, no winner. It also fixes the response format.

**Mock response** (`getPromptAnalysis(promptId, context?)`)
- For `performance_comparison` with a context, the HTML is generated from the payload. Every other prompt, or a call without context, returns its static preview as before.
- Sections:
  - **Overall direction:**
    - "Comparing <to> with <from> across N classified KPIs in scope: X improved, Y comparable, and Z declined." ("that need attention" replaces "in scope" when that filter is on)
    - Then, as they apply: zero-baseline KPIs, No Data KPIs (naming the side without data), informational KPIs not classified, and the partial-period sentence plus the notice when the notice applies.
  - **Target attainment:**
    - Per side: "<label>: X of N KPIs with a target meet(s) it."
    - KPIs whose status differs between the sides.
    - "No target is configured for <label> for <KPIs>, so they are not assessed against one."
  - **Key site drivers:** only when Site Drivers data exists. Up to 3 items: KPIs needing attention with their sites furthest outside target, then other KPIs' row summaries.
  - **Areas needing attention:** up to 5 items, both-reasons first, then "Also needing attention: …". When none: "No KPIs in scope need attention."
  - **Positive performance:** up to 4 improved KPIs (with "meets its X target" when Met), then "Also meeting target for <label>: …". Never includes a Declined KPI.
  - **Suggested next steps:** up to 3 numbered steps, each naming a KPI or sites and pointing to Site Drivers or the Performance Trend, never to causes. It can produce fewer than 2 when few KPIs are in scope.
- With no KPIs in scope: "No KPIs are in scope for the current filters, so there is nothing to compare between <from> and <to>."

**Facts sent to Schoolie:** a collapsible section under the response showing the exact JSON payload that was sent.

**Stale state**
- The drawer stores a hash (FNV-1a) of the analyzed context: both side definitions in orientation order, the KPI filter, and Needs Attention.
- When any of these change while the drawer is open, an amber "Out of date" banner appears: "The comparison changed after this analysis ran." It has a **Reanalyze** button.
- It never re-runs on its own.
- Changing the focused KPI or the trend interval does not mark the analysis out of date.

**Attribution:** telemetry and `ProductFeedback` get the real `promptId` (`performance_comparison`) and `sourceEntryPoint: 'CompareSites'`, through the new `feedbackAttribution="actual"`. Existing callers keep their hardcoded attribution (default `'legacy'`).

### Decisions made during the prototype
- **Panel width:** ⅓ at desktop, ½ at tablet, 400px at `sm`. Half width at tablet was accepted for readability (#4).
- **Reserved space on desktop** instead of a backdrop, so the page stays usable beside Schoolie.
- **Payload sides are keyed `from`/`to`.** `orientation.rules` uses "A", "B", "left", "right", and "baseline" only as instructions to the model, never in user-facing text (accepted, #6).
- **Top 3 sites outside target** per KPI needing attention, plus `favorableDirection` and `periodLengthNotice`, were added to the payload.
- **Fewer than 2 next steps** is allowed when few KPIs are in scope (accepted, #5).
- The Schoolie button is disabled until both sides are set. Schoolie closes if a side is cleared.
- **Panel-mode Escape listener:** it listens on `document` in the bubble phase. Open dropdowns close first, and Schoolie still closes before the overlay.
- **New `SchoolieDrawer` props:** `width`, `loadingText`, `analysisContext`, `contextKey`, `feedbackAttribution`. Defaults keep the existing drawer unchanged.
- **Reanalyze sends no telemetry** (accepted, #9).
- **Type-only reverse dependency:** `schoolieService.ts` imports the payload type from `features/…`.

### Not built / prototype-only
- **Real AI:** no real AI call. `getPromptAnalysis` returns a deterministic template built from the payload after a 1.5-second delay. Production sends the `performance_comparison` prompt plus the facts payload to the real Schoolie service.
- **Prompt storage:** the prompt lives in in-memory mock prompt data (`mockSchoolieData.ts`). Production stores it with the other AI Config prompts.
- **Output:** no streaming, no conversation or follow-up questions, no persistence of analyses.

### Key files
- `src/features/performanceComparison/schoolie/comparisonFacts.ts`: payload contract (tested)
- `.../schoolie/contextKey.ts`, `.../hooks/useSchoolieComparisonContext.ts`: stale-state key and facts
- `src/components/InsightsDashboard/SchoolieDrawer.tsx`: panel mode, reserved-space constants, stale banner, facts view, Escape
- `src/services/schoolieService.ts`: `PERFORMANCE_COMPARISON_PROMPT_ID`, `getPromptAnalysis(promptId, context?)`
- `src/data/mockPerformanceComparisonAnalysis.ts`: mock response generator (tested)
- `src/data/mockSchoolieData.ts`: `performance_comparison` prompt
- `.../components/PerformanceComparisonOverlay.tsx`: Schoolie wiring and reserved padding

---

## Data layer (supports every story)

### Comparison data service
`src/services/comparisonDataService.ts`, async: `getSideDataset(siteSelection, timeframeSelection)`. This is the contract production replaces. UI code and the engine never import mock data.

It returns:
- `label`, `siteLabel`, `timeframeLabel`
- `siteIds`, `siteNames`, `scopeType` (`site`, `siteType`, `allSites`, `multipleSites`)
- `timeframe`: option ID, kind, start, end, school year, `isPartial`, `throughDate`
- `kpis`: per KPI, `{ actual|null, target|null }`, plus `secondaryActual`, the $ amount for Physical Inventory Discrepancy
- `sites`: per site, the same shape, with that site's own resolved target
- `series(kpi, interval, options)` → buckets with position, labels, start, end, actual|null, target|null.

Only dates through the through date contribute.

### Aggregation
`src/services/comparisonAggregation.ts`, pure:
- Sum KPIs: the total over sites and days.
- Ratio KPIs: ratio of sums, never an average of ratios.
- Inventory: each site's **last month-end snapshot within the period**, combined:
  - Value: Σ value
  - Turnover: Σ value ÷ Σ (value ÷ days)
  - Discrepancy: Σ$ ÷ Σ value
- A period with no month-end count yet (This Week, Last Week, Today, This Month) shows No Data for inventory.
- No rows, or a zero denominator, gives null.

### Targets
- A timeframe's benchmarks come from its school year. A custom range across Jul 1 uses the year it starts in.
- **Sum KPIs** (Revenue, Meals, MEQs, A La Carte, Reimbursement, Waste): the benchmark is a **rate per site per serving day**. A side's target = rate × the scope's site-serving-days with data through the through date, so partial periods get a proportional target. With no data, there is no sum target.

### Benchmarks
`src/data/mockComparisonBenchmarks.ts`. Rows are `{ kpi, schoolYear, scope, scopeId?, value|null, noTarget? }` for SY 2023–24 to SY 2025–26.

Precedence:
- Single site: site → site type → district → none.
- Site-type selection: site type → district → none.
- All Sites or Multiple Sites: district → none.
- Never averaged.
- A plain null row falls through to the next scope; a `noTarget` row stops the chain.

District targets:

| KPI | Target |
|---|---|
| Breakfast | 20% |
| Lunch | 60% |
| Snack | 10% (none for SY 2024–25) |
| Supper | 10% |
| Eco Dis | 52% |
| PNA | 10% |
| ENP | 5% |
| MPLH | 18.5 |
| Physical Inventory Discrepancy | 0% (context only) |
| Sum KPIs | per-day rates, scaled for site types by typical size |

Overrides and gaps:
- Year-specific overrides:
  - High Schools Lunch 60% → 62%
  - Elementary Lunch 65% (SY 2025–26)
  - Elementary Breakfast 30% / 32%
  - High Schools MPLH 17.5 / 18
  - Roosevelt High Lunch 55% / 58%
  - Lincoln Elementary Breakfast 35% (SY 2025–26)
  - Washington Middle MPLH 19 / 19.5 / 20
  - Roosevelt High Revenue $6,000 per day (SY 2025–26)
- Inventory Turnover Rate has site-level values only (12–20 days by type), as context.
- No benchmark for Inventory Value or A La Carte.
- The Hamilton High Lunch SY 2025–26 `noTarget` row.

### Mock data
`src/data/mockComparisonData.ts`
- Seeded and deterministic, generated in memory.
- Daily per-site facts for every serving day from 2023-07-01 to 2026-04-16, plus monthly inventory snapshots.
- SY 2022–23 and earlier have no data.

Built-in scenarios:
1. District SY 2024–25 vs SY 2025–26 produces Improved, Comparable, and Declined results.
2. Snack +0.4 pts (just under the threshold). Lunch 59.8% → 60.2% stays Comparable while crossing the 60% target.
3. Kennedy Middle opens 2025-01-06.
4. Lincoln Elementary serves no supper (a legitimate 0.0%, not No Data).
5. Little Learners Child Care Center has $0 à la carte until SY 2025–26 (RelativeNotApplicable).
6. Per-site quality factors create a spread within each type.

### Site registry
`src/data/siteRegistry.ts`. 18 sites in 5 types:
- 6 Elementary
- 5 Middle
- 5 High
- 1 Central Office ("District Central Office")
- 1 Child Care ("Little Learners Child Care Center").

### Production must supply
- Real KPI calculations, benchmarks, school calendars, the site registry, and user context.
- All behind the `getSideDataset` contract (or an equivalent API), with null for No Data and for no target.

---

## Cross-cutting

**KPI order** (registry, KPI filter, KPI table, exports, Schoolie payload):
1. Breakfast
2. Lunch
3. Snack
4. Supper
5. Meals
6. Meal Equivalents (MEQs)
7. Economically Disadvantaged
8. Paid Not Applied (PNA)
9. Eligible Not Participating (ENP)
10. Meals per Labor Hour (MPLH)
11. Revenue
12. A La Carte
13. Reimbursement
14. Waste
15. Inventory Value
16. Inventory Turnover Rate
17. Physical Inventory Discrepancy

The filter keeps this order regardless of the order KPIs were clicked in.

**Terminology**
- Sides are named only by generated labels, or by compact names (the differing part of the labels).
- "A"/"B", "left/right side", and "baseline" never appear in the UI, exports, or descriptions. Code uses `left`/`right` internally, and the Schoolie payload uses `from`/`to`.
- Accessible names say "First comparison", "Second comparison", and "Swap comparisons". Chart aria labels use "first/second comparison".
- The only literal "A", "B", "left", "right", and "baseline" strings in user-reachable output are in the payload's `orientation.rules`, which are model instructions visible in the "Facts sent to Schoolie" developer view (accepted).
- Descriptions avoid "previous", "current", and "now", causes, recommendations, and "better/worse".

**No Data handling**
- No Data is `null` end to end, from aggregation through the service, engine, UI, exports, and payload. It is never 0.
- The UI shows "No Data" (gray italic in tables), and the status reads "No Data", never Not Met.
- A missing benchmark shows "—" / "No target" and is never a missed target.
- No Data is never Declined, Comparable, or Needs Attention by itself. It is counted separately ("N with no data") and is never charted as a zero bar.
- A legitimate zero (e.g. Supper 0.0%) is a real value, distinct from No Data.

**Escape and layering**
- Z-order:
  - overlay `z-50`
  - Site Drivers drawer and its backdrop `z-[55]`
  - Schoolie panel `z-[60]`
  - toast `z-[70]`
  - floating menus `z-[100]` (`MultiSelectDropdown` uses 9999)
- Selector menus are portaled to the body.
- Escape closes the innermost open thing first:
  1. Open dropdowns, menus, and the date picker (document listener, capture phase; they stop the event).
  2. The Site Drivers drawer (capture phase).
  3. The Schoolie panel (document listener, bubble phase; it stops the event).
  4. The overlay itself (window listener), returning to the dashboard with the comparison state kept.
- On the shared `CopyMenu` and `ExportMenu`, Escape handling is opt-in (`closeOnEscape`).

**Responsive**
- Down to tablet width (768px): side panels stack below `md`, and title-row actions wrap.
- The KPI table (min 1070–1280px) and the drawer tables scroll horizontally inside their own containers. The page itself never scrolls horizontally.

**Status is never shown by color alone:** badges carry text and an arrow, statuses an icon and text, variances an icon plus screen-reader text, and trend sides a fill pattern, dash style, and label. Classification colors use the `insightsFavorable`, `insightsNeutral`, and `insightsUnfavorable` tokens.

**Telemetry**
- Seven new events: `COMPARISON_OPENED`, `COMPARISON_SIDE_CHANGED`, `COMPARISON_SWAPPED`, `COMPARISON_KPI_FOCUSED`, `COMPARISON_SITE_DRIVERS_OPENED`, `COMPARISON_EXPORTED`, `COMPARISON_SCHOOLIE_OPENED`.
- `InsightsEventContext` gained `comparisonSide` and `comparisonField`.
- The events are also registered in `INSIGHTS_INTERACTION_TYPES`.

**Dashboard side effects** (approved, acceptance review #18; listed for developers)
- **Header:** a Compare button in the dashboard header; the overlay is mounted in `InsightsPage`.
- **`DemoSchoolSelector`:**
  - Site list replaced by the 18-site registry; site IDs and names reassigned (the old "Andria High School_tier 1 low" etc. are gone).
  - Shows plural type names and resolved counts; the "0 Schools Selected" bug is fixed.
  - Its menu is portaled and closes on Escape.
- **`TimeframeSelector`:**
  - Option descriptions are computed, e.g. "Week of April 15" became "Apr 13 – Apr 19, 2026".
  - The list includes Prior Year to Date.
  - Its menu is portaled and closes on Escape.
- **`MultiSelectDropdown`** opens upward and clamps its height when space is short, for every caller including Usage.
- **Usage:** the seven comparison events count as Usage interaction types, which can change engagement counts.
- **Usage trend charts** (`InsightsOverview/District/UserActivityTrend`, `ReportsUserDetailPage`) import the shared `timeBuckets.ts`, with output unchanged.
- **Dashboard `PerformanceTrends`** chart styles moved to the shared `trendChartStyles.ts`.
- **`MPLHSchoolTable`**'s sort icon moved to the shared `SortIcon.tsx`, with behavior unchanged.
- **Backward-compatible, opt-in props** on `CopyMenu`, `ExportMenu`, `MultiSelectDropdown`, `CollapsiblePanel`, and `SchoolieDrawer`. Existing callers are unchanged.
- **KPI types:** `kpiTypes.ts` gained `A La Carte` and `Reimbursement` (`ComparisonKpiKey`) and their chart colors. They are kept out of `KPI_SHORT_NAMES`, so the Usage KPI filter is unchanged.
- **Unchanged:** dashboard mock data is untouched, and dashboard and comparison numbers are not expected to reconcile.

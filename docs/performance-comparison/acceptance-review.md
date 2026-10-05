# Performance Comparison (NXT-77201): Acceptance Review

**Phase 10. Read-only review.** No source code was changed.
**Branch:** `feature/performance-comparison-NXT-77201` @ `1ac913a` · **Date:** 2026-10-04
**Measured against:** [spec.md](spec.md), section by section, in both the code and the running prototype (Vite dev server, headless Chromium via Playwright, 1440×900 desktop and 768×1024 tablet).

> **Update (final refinements round, 2026-10-04):** every issue below is now **Fixed** or **Accepted**; see [Resolution](#resolution). Accepted items are also listed under [Deviations from spec](#deviations-from-spec-intentional-recorded-across-phases). The requirement tables keep their original Phase 10 results.

**Overall:** the rules engine, mock data, service, setup, trend, Summary, KPI table, Site Drivers, exports, and Schoolie all meet the spec. No requirement fails in the engine or the data layer. There is one High issue (the Schoolie drawer covers page controls), two Medium issues, and a set of Low issues: polish items, missing tests, and dashboard side effects.

**Quality gates**
- `npm test`: 25 files, **537 tests passed**.
- Lint and typecheck on new and touched files: **0 new problems.** Three touched files still have problems, and all of them are pre-existing. They are identical at the pre-feature commit `cdbca90`:
  - Lint: 6 problems in `InsightsPage.tsx`, `schoolieService.ts` and `ReportsUserDetailPage.tsx`.
  - Typecheck: 8 errors in `SchoolieDrawer.tsx`, `schoolieService.ts` and `ReportsUserDetailPage.tsx`.
  - Whole repo: 131 lint problems and 93 typecheck errors, all pre-existing.
- Browser console: no errors in any scenario, except one React duplicate-key warning (issue 10).

---

## Issues (every Fail and Partial)

| # | Status | Severity | Spec | What's wrong | Suggested fix |
|---|---|---|---|---|---|
| 1 | **Fixed** | **High** | §11, §12 | **On desktop, the Schoolie drawer covers right-hand controls.** These include the trend interval selector, the KPI table and trend Copy/Download icons, and the header Schoolie/Download buttons. The drawer is a portaled `fixed right-0 lg:w-1/3 z-[60]` panel with no backdrop ([SchoolieDrawer.tsx](../../src/components/InsightsDashboard/SchoolieDrawer.tsx)), so the page looks usable but those controls can't be clicked. Confirmed in the browser: at 1440px, `elementFromPoint` on the interval selector returns the Schoolie prose ([07-schoolie-drawer.png](screenshots/07-schoolie-drawer.png)). | While Schoolie is open, reserve its width. Lift `isSchoolieOpen` into the overlay and pad the header and scroll body by the drawer width, e.g. `lg:pr-[33.333vw]`. Use one shared width constant or CSS variable for both the drawer and the padding, with `transition-[padding]`. Below `md`, use full width with a backdrop. |
| 2 | **Fixed** | Medium | §6, §10 | **The header Download is enabled before a comparison exists.** The spec says Schoolie and Download are disabled until a comparison exists. Only Schoolie is. Confirmed in the browser with both sides empty. `PageDownloadMenu` ([ComparisonExportControls.tsx:117](../../src/features/performanceComparison/components/ComparisonExportControls.tsx#L117)) | Pass `disabled={!bothSidesSet}` and a `disabledReason`. `ExportMenu` already supports both. |
| 3 | **Accepted** | Medium | §8 | **Needs Attention reasons aren't visible in the row.** Rows show only a ⚠ icon. "Declined" / "Below Target" appear only in the hover tooltip and `aria-label` ([ComparisonKpiTable.tsx:51-72](../../src/features/performanceComparison/components/ComparisonKpiTable.tsx#L51-L72); [03-needs-attention.png](screenshots/03-needs-attention.png)). | Render the reason text in the row, e.g. a small "Declined · Below Target" line under the KPI name. Keep the tooltip. |
| 4 | **Accepted** | Low | §11 | The Schoolie drawer is about ⅓ of the screen only at `lg`. At `md` it takes ½, and at `sm` it is 400px (about 52% of the 768px tablet width). | Fold this into fix 1. Use ⅓ from `md` up (or ¼ at `xl`), and full width with a backdrop below `md`. |
| 5 | **Accepted** | Low | §11 | "Suggested next steps" can drop below 2. The fill-up only uses Comparable or RelativeNotApplicable KPIs, so a narrow KPI filter can produce one step or none ([mockPerformanceComparisonAnalysis.ts:268-279](../../src/data/mockPerformanceComparisonAnalysis.ts#L268-L279)). | Fall back to other in-scope KPIs, or to a generic "review the Performance Trend for {KPI}" step, whenever 2 or more KPIs are in scope. |
| 6 | **Accepted** | Low | §2, §11 | The JSON shown in "Facts sent to Schoolie" includes `orientation.rules[2]`, which literally contains "A", "B", "left", "right" and "baseline" in an instruction to the model ([comparisonFacts.ts:28-32](../../src/features/performanceComparison/schoolie/comparisonFacts.ts#L28-L32)). The payload test doesn't cover `rules`. | Keep that rule in the prompt text only (`mockSchoolieData.ts`) and drop it from the payload. Otherwise, extend the test and accept the rule as model-facing. |
| 7 | **Fixed** | Low | §12 | Schoolie still uses the no-op `animate-in slide-in-from-right` classes and has no slide transition. It renders `null` when closed. | In panel mode, keep it mounted and use `transition-transform translate-x-full/0`, as the Site Drivers drawer does. |
| 8 | **Fixed** | Low | §11 | From code review, not reproduced in the browser: with Schoolie open, Escape closes Schoolie before an open dropdown. Schoolie uses a window-level capture listener with `stopImmediatePropagation`; the menus use a document-level capture listener. | Have Schoolie skip Escape while a floating menu is open, or register the menus first. |
| 9 | **Accepted** | Low | §10, §12 | Telemetry is incomplete. `COMPARISON_EXPORTED` fires for the KPI table TSV and CSV only. Trend export selections, the page PDF, and Reanalyze send no `trackInsightsEvent`. | Fire `COMPARISON_EXPORTED` with `{ format, implemented: false }` from the not-implemented handlers, and add a Reanalyze event. |
| 10 | **Fixed** | Low | §8 | When both sides have the same generated label (e.g. "Multiple Sites · Last Month" on each side), the Site Drivers cell uses the label as a React key twice. The console shows "Encountered two children with the same key". The labels are correct per spec (identical labels → full labels), but both sides are then indistinguishable on screen. | Key the lines by side (`left`/`right`), not by name. Separately, consider whether identical labels need a product decision, e.g. a site count in "Multiple Sites". |
| 11 | **Accepted** | Low | §10 | The CopyMenu items read "Copy Data" / "Copy Image". The spec says "Copy data" / "Copy image". These are the dashboard's existing strings. | Either accept the dashboard wording and update spec §10, or add an optional label prop. Don't change the dashboard. |
| 12 | **Fixed** | Low | §10 | The CSV filename date is computed at render (`toKpiTableCsvData` runs during render), not at click. If the overlay stays open past midnight, the file gets the previous day's date. | Build the CSV data when the item is clicked. |
| 13 | **Accepted** | Low | §7 | The interval selector is a new segmented control. The spec says to extend the existing granularity dropdown UI. The control itself works well: unavailable intervals stay visible, disabled, with a reason. | Record this as an intentional deviation in the spec, or restyle it as the dashboard `<select>` with Quarter added. |
| 14 | **Fixed** | Low | §8 | In the attainment line, the label, "—" and count are separate flex spans with no real spaces. Copied text and screen readers get "Label—6 of 12…". | Add `{' '}` around the dash span in [ComparisonSummary.tsx](../../src/features/performanceComparison/components/ComparisonSummary.tsx). |
| 15 | **Fixed** | Low | §8, §12 | Change values wrap mid-value at desktop width, e.g. "−6.8% (−" / "$709,713)" ([03-needs-attention.png](screenshots/03-needs-attention.png)). | Use `whitespace-nowrap` on the absolute part, or put a line break before the parenthesis. |
| 16 | **Accepted** | Low | §5.4 | Relative materiality rounds the *fraction* to 4 dp, so anything from 1.995% to 1.9999% counts as material. Example: Revenue 100,000 → 101,995 is Improved. This agrees with the displayed "+2.0%", but it is coarser than the float guard the spec intends ([compareKpi.ts:128](../../src/features/performanceComparison/engine/compareKpi.ts#L128)). | Round `relativeChange × 100` to 4 dp, or compare with `≥ threshold − 1e-9`. Add a fixture either way, so the choice is deliberate. |
| 17 | **Fixed** | Low | §3, §9 | Correct behavior is not covered by tests in four places, all verified by probes: (a) a custom range across Jul 1 uses the start year's benchmarks; (b) inventory is No Data for This Week, Last Week and Today (only This Month is tested); (c) the zero-baseline scenario returns `RelativeNotApplicable` on the real mock data (Little Learners A La Carte); (d) sites within a type show a spread. | Add the four tests listed. |
| 18 | **Accepted** | Low | §0 (feature notes) | Some dashboard behavior changed beyond what the spec allows: <br>• `MultiSelectDropdown` now opens upward and clamps its height for every caller, including Usage. <br>• Dashboard `TimeframeSelector` descriptions are now computed, e.g. "Week of April 15" became "Apr 13 – Apr 19, 2026", and the dashboard list also shows Prior Year to Date. <br>• `DemoSchoolSelector` shows plural type names and resolved counts, and site IDs were reassigned. <br>• Escape now closes the dashboard dropdowns. <br>• The 7 new event types were added to `INSIGHTS_INTERACTION_TYPES`, which can change Usage engagement counts. | Confirm with product. Most are improvements; record the ones you accept as deviations, and make `MultiSelectDropdown`'s change opt-in if Usage must stay unchanged. |

## Resolution

Final refinements round, on top of `750cc99`. **Fixed** means changed in code and checked in the browser (1440×900 and 768×1024) and/or by tests. **Accepted** means kept as is, for the reason given; each is also recorded under Deviations from spec.

| # | Status | Fix or reason |
|---|---|---|
| 1 | Fixed | On desktop (`lg`+) the overlay reserves Schoolie's width as right padding while it is open (`SCHOOLIE_PANEL_RESERVED_SPACE_CLASS`, kept next to the panel's width class in `SchoolieDrawer.tsx`), with a padding transition. An open Site Drivers drawer shifts left of Schoolie. At tablet width the panel still overlays, with no padding change. Browser: padding 480px = panel width at 1440; the header actions, both copy menus and every interval button hit-test to the page; Day was selected with Schoolie open. |
| 2 | Fixed | Header Download is disabled until both sides are set, with the tooltip "Set both sides to download this comparison" (same pattern as Schoolie). |
| 3 | Accepted | Showing the Needs Attention reason on hover is a PO decision. |
| 4 | Accepted | Half width at tablet keeps the drawer readable. |
| 5 | Accepted | Fewer next steps is correct when few KPIs are in scope. |
| 6 | Accepted | "A", "B", "left", "right" and "baseline" appear only in model instructions (`orientation.rules`), never in user-facing text. |
| 7 | Fixed | Panel mode stays mounted and slides with `transition-transform translate-x-full/0` (and `visibility`). Browser: 480px → 0 over about 300ms. The default (dashboard) drawer is unchanged. |
| 8 | Fixed | Confirmed in the browser that Schoolie (window, capture phase) closed before an open menu. Panel mode now listens on `document` in the bubble phase: open dropdowns and menus (document capture, which stops the event) close first, and Schoolie still runs before the overlay's window listener. Browser: with Schoolie open, Escape closed the trend menu, then the KPI picker, then Schoolie, and the overlay stayed open. |
| 9 | Accepted | Telemetry for prototype-only controls isn't needed. |
| 10 | Fixed | Site Drivers cell lines and trend partial notes are keyed by side position (left → right), not by text. Generated labels now say "Multiple Sites (N)" (e.g. "Multiple Sites (3) · Last Month"); spec §6 and `siteRegistry.test.ts` updated. Browser: identical labels on both sides, no duplicate-key warning. |
| 11 | Accepted | Superseded by refinement 7: the comparison now uses the dashboard's single menu and its exact wording ("Copy Data", "Copy Image"); spec §10 updated. |
| 12 | Fixed | The CSV is built when Download CSV is clicked (`toKpiTableCsvData(table, new Date())` in the click handler), not during render. Test added for dates on either side of midnight. |
| 13 | Accepted | The segmented control was approved in Phase 6. |
| 14 | Fixed | The attainment line is plain inline text with real spaces: "Label — 6 of 12 KPIs meeting target". |
| 15 | Fixed | The Change cell renders the % and the parenthesized amount as two `whitespace-nowrap` parts with a space between, so it can only break there. Browser: all 24 parts render on one line each. |
| 16 | Accepted | 1.995% displays as 2.0%, so treating it as material matches what users see. |
| 17 | Fixed | Added tests: (a) a custom range across Jul 1 uses the start year's benchmarks, plus one starting on Jul 1; (b) inventory is No Data for This Week, Last Week and Today; (c) the engine returns `RelativeNotApplicable` for the real Little Learners A La Carte data (no relative %, absolute delta only, counted separately); (d) High School Lunch spreads by at least 5 points across sites. |
| 18 | Accepted | Approved dashboard side effects; they stay listed for the developers. |

---

## Requirements

Legend: **Pass** · **Partial** · **Fail**. *Browser* means observed in the running prototype; the screenshot paths are in the last section.

### §0–§2 Purpose, principles, terminology

| § | Requirement | Result | Evidence | Note |
|---|---|---|---|---|
| 0 | Rules engine is pure TS with thorough tests | Pass | `engine/*.ts` import only kpiDefinitions, kpiTypes and utils; `compareKpi.test.ts` (100 tests), `siteDrivers.test.ts` | |
| 0 | UI never imports mock data; goes through `comparisonDataService` | Pass | Feature components import only `type SiteSelection` from `data/siteRegistry` (the promoted registry the spec allows) | `telemetry.ts` imports `MOCK_CURRENT_USER`, following the existing app pattern; that isn't comparison data |
| 0 | Out of scope not built (security, data-driven dashboard, real AI, Supabase for comparison) | Pass | No permission, Supabase or AI-client code in the changed files; `getPromptAnalysis` is a mock | |
| 1 | Application decides the facts; Schoolie explains them; one engine result per KPI | Pass | Table, Summary, Site Drivers, exports and payload all read `useComparison` / `selectComparison`; components do no arithmetic on actuals or targets | |
| 1 | No overall score or winner | Pass | Browser: Summary shows counts and attainment only | |
| 1 | No Data is never zero; a missing benchmark is never a missed target | Pass | Browser: SY 2022–23 rows show "No Data" / "Target —" and the left status "No Data"; Hamilton Lunch right shows "No target" | |
| 2 | No A/B, "left/right side" or "baseline" in UI, exports or descriptions | Pass | Grep finds these only in comments and identifiers; exhaustive description test (`compareKpi.test.ts:501-526`); CSV headers use labels | |
| 2 | Same rule for Schoolie payload user-facing text | Partial | `comparisonFacts.ts:28-32` | Issue 6 |
| 2 | Generated labels identify sides everywhere | Pass | Browser: column headers, Summary, Site Drivers, trend legend, Schoolie text | |

### §3 Prototype decisions

| § | Requirement | Result | Evidence | Note |
|---|---|---|---|---|
| 3 | Single `DEMO_AS_OF_DATE` = 2026-04-16 | Pass | `constants/demo.ts:8`; used by the selector, generator, service and labels | |
| 3 | School year Jul 1 – Jun 30 | Pass | `utils/schoolYear.ts`; Jun 30 / Jul 1 boundary tests | |
| 3 | Mock years: SY 23–24 and 24–25 full, 25–26 partial, older have no data | Pass | Browser: SY 2022–23 is all No Data; YTD shows "Partial · through Apr 16, 2026" | |
| 3 | Prior Year to Date = Jul 1, 2024 – Apr 16, 2025, Feb 29 → Feb 28, not partial | Pass | `timeframes.ts:88-91, 131-134`; tests; browser label "SY 2024–25 through Apr 16" with no partial badge | |
| 3 | Selections never altered; differences only via the notice | Pass | `resolveTimeframe` and `getPeriodLengthNotice` never trim | |
| 3 | No default comparison; nothing calculated until both sides are set | Pass | Browser: empty state, and still empty with one side set | |
| 3 | KPI values are mocks with additive components; participation ≤ 100%; ENP % lower-is-favorable | Pass | `comparisonDataTypes.ts`, `mockComparisonData.ts`; "≤ 100%" test | |
| 3 | Default trend interval ≤14 Day / ≤93 Week / ≤366 Month / else Quarter | Pass | `trendRules.ts:38-47`; browser: SY vs SY → Month, week vs week → Day, month vs month → Week | Based on the full period span |
| 3 | School-year quarters | Pass | Browser: Lunch by quarter shows Q1–Q4 | |
| 3 | Benchmark precedence; never average site benchmarks; Site Drivers uses each site's own benchmark | Pass | `mockComparisonBenchmarks.ts:179-189`; tests; browser: Roosevelt shows 55% → 58%, the other high schools 60% → 62% | |
| 3 | Sum-KPI targets = rate × site-serving-days through the through date | Pass | `comparisonDataService.ts:158-168`; tests | |
| 3 | District Lunch 60%, Eco Dis 52%; B/S/S from `DASHBOARD_METRICS` | Pass | Browser: Lunch 60%, Eco Dis 52%, Breakfast 20%, Supper 10% | |
| 3 | Inventory targets are context only; turnover at site level only; discrepancy 0% context | Pass | Browser: district turnover "No target", discrepancy "Context 0%", status "Not evaluated" | |
| 3 | Inventory uses the last month-end count; No Data for periods with no month-end | Pass | `comparisonAggregation.ts:64-97` | Only This Month is tested (issue 17b) |
| 3 | Benchmark school year from the timeframe; a custom range across Jul 1 uses its start year | Partial | `comparisonDataService.ts:151-152`; behavior verified by probe | No test (issue 17a) |
| 3 | Informational KPI targets: no status, excluded from counts, never Needs Attention | Pass | Browser: NA on hides inventory rows; attainment is out of 12/13 | |
| 3 | One-site type uses the site's name | Pass | Browser: Central Office → "District Central Office · SY 2025–26" | |
| 3 | Site Drivers matched only for identical site sets | Pass | Browser: HS vs HS matched; HS vs MS shows two lists | |
| 3 | Vitest added; engine and utils tested | Pass | `package.json`; 25 test files | |

### §4 KPI rules matrix

| § | Requirement | Result | Evidence | Note |
|---|---|---|---|---|
| 4 | 17 KPIs in display order in registry, picker, table and exports | Pass | `kpiDefinitions.ts`; browser table order; CSV order | |
| 4 | Format, type, direction, materiality method and threshold per row | Pass | `kpiDefinitions.ts:69-71` plus each definition; tests | |
| 4 | Ratio KPIs are ratio of sums (never an average of ratios); sums; point-in-time | Pass | `comparisonAggregation.ts`; "ratio of sums" tests | |
| 4 | MPLH = MEQs ÷ labor hours, 2 dp | Pass | Browser: 18.61 / 17.91 | |
| 4 | Physical Inventory Discrepancy shows $ plus % of value | Pass | Browser: "3.1% ($7,647)" | |

### §5 Rules engine

| § | Requirement | Result | Evidence | Note |
|---|---|---|---|---|
| 5 | Pure function in `features/performanceComparison/engine/`, no React or mock imports | Pass | Import audit | |
| 5.1 | Inputs: KPI, actuals, targets, labels, partial info | Pass | `engine/types.ts:20-38` | |
| 5.2 | Every output field present | Pass | `engine/types.ts:58-103`; `compareKpi.ts:210-227` | |
| 5.3 | Change = right − left; relative change = Δ/left; swap recalculates | Pass | Swap tests; browser: after Swap, Lunch +0.4 → −0.4 pts and Not Met ↔ Met | |
| 5.4 | pt materiality ≥ 0.5 with float guard (60 → 60.5 material) | Pass | Fixture tests | |
| 5.4 | Relative materiality ≥ 2% | Partial | `compareKpi.ts:128` | Issue 16 |
| 5.4 | Baseline zero → RelativeNotApplicable, no ∞; 0 → 0 Comparable; excluded from counts but can be Needs Attention | Pass | Tests; `selectComparison.ts:90-94` | |
| 5.4 | Informational KPIs: no materiality, classified Informational | Pass | Browser: "Informational" badge | |
| 5.5 | Direction decides Improved/Declined, not the sign | Pass | Browser: PNA −1.4 pts and Waste −4.2% are Improved; ENP +0.9 pts is Declined | |
| 5.6 | Target status rules; compare at display precision; each side its own target; transition only for Met/NotMet | Pass | Tests; browser: HS Lunch left 62% vs right 60% targets kept separate | |
| 5.7 | No Data / one-sided data | Pass | Browser: SY 2022–23 rows show "No Data — Lunch participation could not be compared because data is unavailable for High Schools · SY 2022–23." with the right status kept | |
| 5.8 | Needs Attention rules and reasons | Pass | 9 rule tests; browser: SY 2022–23 vs YTD with NA on lists only right-side Not Met KPIs | |
| 5.9 | Description format; partial note only for sum KPIs when the notice applies | Pass | Browser: PY vs YTD adds the note to Meals, MEQs, Revenue, A La Carte, Reimbursement and Waste only; Prior YTD vs YTD adds none | |
| 5.9 | Target formatting ("35%", "62.5%", "—") everywhere | Pass | Browser: table "Target 60%", description "the 60% target", tooltip "Target 60%" | |
| 5.9 | Decision matrix: 12 combinations plus missing target | Pass | Matrix tests; browser examples for Improved NotMet→Met, Declined Met→Met, Comparable NotMet→NotMet, Comparable Met→NotMet (after swap) | |
| 5.9 | All 14 description fixtures | Pass | `it.each` in `compareKpi.test.ts:37-72` | |
| 5.9 | All 12 materiality fixtures | Pass | `compareKpi.test.ts:74-92` | |
| 5.9 | Site-level evaluation uses the same function | Pass | `siteDrivers.ts:141-145` | |

### §6 Overlay & Comparison Setup

| § | Requirement | Result | Evidence | Note |
|---|---|---|---|---|
| 6 | Compare button: `GitCompareArrows`, `title="Compare"`, existing classes, telemetry | Pass | `SimpleHeader.tsx:52-58`; `COMPARISON_OPENED`; browser | |
| 6 | Full-screen overlay (AppUsageDrawer pattern), sticky header, gray scrolling body | Pass | `PerformanceComparisonOverlay.tsx:185, 218`; browser | |
| 6 | Header: back, title, Schoolie + Download on the right | Pass | Browser | |
| 6 | Schoolie + Download disabled until a comparison exists | **Fail** | Browser: Download enabled with both sides empty | Issue 2. Schoolie is correctly disabled with a tooltip |
| 6 | Layout order: Setup → Filters → Summary → KPI → Trend → note | Pass | Browser ([02-full-comparison.png](screenshots/02-full-comparison.png)) | |
| 6 | Reuses the selectors via optional `value`/`onChange`; dashboard usage still works | Pass | `DemoSchoolSelector.tsx`, `TimeframeSelector.tsx`; dashboard defaults unchanged | Visible dashboard side effects in issue 18 |
| 6 | Generated label rules (site, type, All, Multiple; SY, Prior YTD, relative, custom; " · ") | Pass | Browser: "All Sites · SY 2024–25", "High Schools · SY 2025–26", "Multiple Sites · Last Month", "All Sites · This Month", "… SY 2024–25 through Apr 16" | |
| 6 | Partial badge "Partial · through Apr 16, 2026" | Pass | Browser | |
| 6 | `prior_ytd` option right after Prior Year | Pass | `TimeframeSelector.tsx:51-52`; browser | |
| 6 | Period-length notice: default text | Pass | Browser: SY 2022–23 vs YTD shows the exact text | |
| 6 | Period-length notice: YTD/Prior Year variant | Pass | Browser: PY vs YTD shows the exact text | |
| 6 | Notice only when exactly one side is partial and the other covers ≥10% more days | Pass | Browser: no notice for Prior YTD vs YTD, HS vs MS YTD, or week vs week | |
| 6 | Swap exchanges definitions and recalculates; disabled until both sides are set | Pass | Browser: disabled with a tooltip while empty; after Swap, values, statuses, description and Site Drivers flip and the focused KPI stays | |
| 6 | Empty state text | Pass | Browser: "Select sites and a timeframe for both sides to compare." ([01-empty-state.png](screenshots/01-empty-state.png)) | |
| 6 | Filters: KPI multi-select (all 17 by default), Needs Attention, Clear Filters (filters only) | Pass | `ComparisonFilters.tsx`; `useComparisonStore.ts:115`; browser | |
| 6 | Focused KPI separate from the filter; cleared when filtered out | Pass | Store `:103-111`; `useComparison.ts:51-54` | |
| 6 | Materiality note: exact text, small italic, at the bottom | Pass | Browser | |
| 6 | Zustand store with sides, filter, NA, focus and interval; memoized derived data | Pass | `useComparisonStore.ts:47-58`; `useComparison` used once | |

### §7 Performance Trend

| § | Requirement | Result | Evidence | Note |
|---|---|---|---|---|
| 7 | Focused KPI only; empty text; never auto-selects | Pass | Browser: "Select a KPI from the KPI Comparison table to view its trend." | |
| 7 | One `ComposedChart`: paired bars, a target line per side, one shared line when equal, no benchmark bars | Pass | Browser: Lunch shows "Target · both comparisons"; Revenue (Prior YTD vs YTD) and Meals (month vs month) show two target lines | |
| 7 | Sides distinguished by colour **and** pattern/label | Pass | Browser: solid vs hatched bars, legend uses labels ([04-trend-lunch-month.png](screenshots/04-trend-lunch-month.png)) | |
| 7 | Day / Week / Month / Quarter with the default rule | Pass | Browser | |
| 7 | Extends the existing granularity dropdown UI | Partial | New `TrendIntervalSelector.tsx` | Issue 13 |
| 7 | Usage bucketing lifted to a shared util with quarter | Pass | `utils/timeBuckets.ts`; all 4 Usage charts import it | |
| 7 | Alignment by position; week vs week by weekday | Pass | Browser: week vs week shows Mon–Fri ([10-trend-week-vs-week-day.png](screenshots/10-trend-week-vs-week-day.png)); SY vs SY Aug–May; `trendRules.ts:78-110` | |
| 7 | Compatibility rules and the unavailable text | Pass | Browser: YTD vs This Month shows "Trend comparison unavailable. Select comparable timeframes to view performance trends." and every interval is disabled with a reason | |
| 7 | Interval must be finer than the period | Pass | Browser: week vs week disables Week/Month/Quarter; month vs month disables Month/Quarter | |
| 7 | Partial: no future buckets, no zeros; note under the chart | Pass | Browser: SY 2025–26 stops at Apr; note "…includes data through April 16, 2026. Later periods have not occurred and are not shown." | |
| 7 | Drop intervals where neither side has data; show a gap where only one side lacks it | Pass | Browser: Jul and Jun dropped; May shows the SY 2024–25 bar only; SY 2022–23 vs YTD shows right-side bars only | Month vs month drops "Wk 4" (spring break in March, not yet occurred in April), so the axis reads Wk 1, 2, 3, 5, 6. Correct per spec, but it may surprise users |
| 7 | Non-serving days excluded from Day buckets | Pass | `trendRules.ts:143-146`; browser: day series 190 vs 164 serving days, no weekends | |

### §8 Summary, KPI table, Site Drivers

| § | Requirement | Result | Evidence | Note |
|---|---|---|---|---|
| 8 | Summary: I/C/D counts over directional in-scope KPIs; excludes No Data, RNA and Informational; "N with no data" | Pass | Browser: 3/3/8 for district PY vs YTD; 2/1/8 with NA on; SY 2022–23 shows "14 with no data" | |
| 8 | Attainment per side with labels; denominator = data + target | Pass | Browser: "6 of 12" vs "6 of 13" (Snack has no SY 2024–25 target; A La Carte has none) | |
| 8 | Attainment text format | Partial | `ComparisonSummary.tsx` | Issue 14 |
| 8 | No charts, gauges, scores or winners | Pass | Browser | |
| 8 | Table columns and order; headers are generated labels | Pass | Browser | |
| 8 | Compact side names rule | Pass | Browser: "SY 2024–25: Met" (timeframes differ), "High Schools: Not Met" (sites differ) | Identical labels: issue 10 |
| 8 | Badges: insights tokens + text + `TrendIndicator`; neutral Informational badge | Pass | `ClassificationBadge.tsx`; browser | |
| 8 | Needs Attention rows show reason(s) | Partial | Icon only; text in the tooltip | Issue 3 |
| 8 | Row click focuses the KPI (highlighted); a clear control removes focus | Pass | Browser: "Clear focused KPI" control | |
| 8 | Numbers stored, formatted at render; no mini charts | Pass | Engine `*Formatted` strings, as §5.2/§10 require | |
| 8 | Site Drivers only when a side has more than one site | Pass | Browser: single site vs single site shows 0 View Sites buttons | |
| 8 | Row summary formats (matched "a of n → b of n", unmatched per side) | Pass | Browser: "11 of 18 → 10 of 17 sites meeting target · View Sites"; HS vs MS shows compact per-side lines | The compact table cell is a deviation; exports keep the full wording |
| 8 | View Sites drawer at `z-[55]`, titled with the KPI and both labels | Pass | Browser: "Lunch · Site Drivers / High Schools · SY 2024–25 vs High Schools · SY 2025–26" | |
| 8 | Matched: per site, both actuals, change, targets where they differ, status from the engine | Pass | Browser: Roosevelt "55% → 58%", Hamilton "60% → —" / "No target" ([05-site-drivers-matched.png](screenshots/05-site-drivers-matched.png)) | Adds a variance column |
| 8 | Unmatched: two lists headed by labels with actual, target, status, variance | Pass | Browser ([06-site-drivers-unmatched.png](screenshots/06-site-drivers-unmatched.png)) | |
| 8 | Default sort (largest unfavorable variance, then no target, then No Data); sortable | Pass | Browser: Truman −10.2 … Madison −3.1, then Hamilton (no target); Kennedy Middle sorted by its right-side value with left "No Data" ([12-site-drivers-kennedy-middle.png](screenshots/12-site-drivers-kennedy-middle.png)) | |
| 8 | Refreshes in place | Pass | `SiteDriversDrawer.tsx:299-301`; in-drawer Swap | |

### §9 Mock data and service

| § | Requirement | Result | Evidence | Note |
|---|---|---|---|---|
| 9 | Seeded, deterministic, in memory under `src/data/` | Pass | "is deterministic" test | |
| 9 | `DEMO_SITES` promoted with `{siteTypeList, siteList}`, 18 sites | Pass | `siteRegistry.ts:44-76` | Shape extended with `siteTypePluralName`; IDs reassigned (issue 18) |
| 9 | Daily per-site facts from 2023-07-01, with all components; monthly inventory snapshots | Pass | `mockComparisonData.ts`; tests | |
| 9 | Scenario: Improved, Comparable and Declined all appear, district SY 24–25 vs 25–26 | Pass | Browser 3/3/8 | |
| 9 | Scenario: just-under-threshold KPI, and a target crossed while Comparable | Pass | Browser: Snack +0.4 pts; Lunch 59.8% → 60.2% Comparable, Not Met → Met | |
| 9 | Scenario: mid-year opening site | Pass | Browser: Kennedy Middle "No Data" in SY 2023–24 | |
| 9 | Scenario: legitimate zero | Pass | Lincoln Elementary Supper 0.0% (shown in Schoolie site drivers); test | |
| 9 | Scenario: zero baseline on a relative-% KPI | Partial | Little Learners A La Carte; verified by probe | No engine-level test (issue 17c) |
| 9 | Scenario: spread within a type | Partial | Browser: High Schools Lunch 49.2–58.9% | No test (issue 17d) |
| 9 | Benchmarks table shape; district seeded from constants; overrides differ by year | Pass | `mockComparisonBenchmarks.ts`; browser: HS Lunch 60% → 62% | |
| 9 | Deliberately missing: Inventory Value, A La Carte, one KPI for SY 24–25 only | Pass | Browser: A La Carte "Target —"; Snack SY 2024–25 "No target" | |
| 9 | `noTarget` stops the fallback (Hamilton Lunch SY 25–26) | Pass | Browser: Hamilton single-site Lunch right "Target —" / "No target", description has no target clause; in Site Drivers, "No target" and excluded from the "of 4/of 17" count | |
| 9 | Sum-KPI per-site-per-day rates, type-size scaled | Pass | Tests | |
| 9 | Existing dashboard mocks untouched | Pass | `src/data` diff: new files plus additions to `mockSchoolieData.ts` only | |
| 9 | `getSideDataset` contract; async; null for No Data | Pass | `comparisonDataService.ts:85-101, 245-250`; contract test | Returns extra fields (see Deviations) |

### §10 Copy & Download

| § | Requirement | Result | Evidence | Note |
|---|---|---|---|---|
| 10 | KPI table Copy data → TSV, rows in scope | Pass | Browser with NA on: clipboard has header + 11 rows; toast "Copied 11 KPIs to the clipboard." | |
| 10 | Download CSV: BOM, filename, rows in scope | Pass | Browser: `Performance_Comparison_KPIs_2026-10-04.csv`, BOM present, header + 17 rows | Date captured at render (issue 12) |
| 10 | Exact columns and order; values as shown; "No Data" / "—"; status texts; full description; Site Drivers joined with "; " or blank | Pass | Clipboard header matches the spec exactly; `kpiTableExport.test.ts` (14 tests) | |
| 10 | Current orientation and display order | Pass | Swap test; browser order | |
| 10 | Trend Copy (data, image) and Download (CSV, PNG) menus; toast; disabled with a reason | Pass | Browser: with no focus, both show "Select a KPI in the KPI Comparison table to copy or download its trend"; items show "Not implemented in prototype." | |
| 10 | Menu item wording "Copy data" / "Copy image" | Partial | Shows "Copy Data" / "Copy Image" | Issue 11 |
| 10 | Header Download → "Download PDF" → toast | Pass | Browser | Enabled too early (issue 2) |
| 10 | Icons hide when a panel is collapsed; menus above the overlay | Pass | `CollapsiblePanel.tsx:43`; browser | |
| 10 | Export telemetry | Partial | KPI TSV and CSV only | Issue 9 |

### §11 Schoolie

| § | Requirement | Result | Evidence | Note |
|---|---|---|---|---|
| 11 | Opens `SchoolieDrawer` with a width option, about ¼–⅓ of the screen, `z-[60]` | Partial | 480px = ⅓ at 1440; ½ at `md` | Issue 4. Covers controls: issue 1 |
| 11 | Auto-analysis on open; states it is analyzing the current comparison with labels | Pass | Browser: "Analyzing All Sites · SY 2024–25 vs All Sites · SY 2025–26…" | |
| 11 | Structured facts payload from engine output; in-scope KPIs only | Pass | `comparisonFacts.ts`; tests | |
| 11 | New `performance_comparison` prompt; `compare_sites` untouched | Pass | `mockSchoolieData.ts:349-390` | |
| 11 | `getPromptAnalysis(promptId, context?)` builds a templated response with every section | Pass | Browser: Overall direction, Target attainment, Key site drivers, Areas needing attention, Positive performance, Suggested next steps | |
| 11 | 2–3 suggested next areas | Partial | 3 in the district scenario | Can drop below 2 (issue 5) |
| 11 | Never contradicts the engine; No Data and missing targets aren't poor performance | Pass | Browser: counts and classifications match the table; "No target is configured… so it is not assessed against one."; tests | |
| 11 | Collapsible "Facts sent to Schoolie" | Pass | Browser | |
| 11 | Stale hash, "Out of date", Reanalyze, no auto-rerun | Pass | Browser: toggling NA showed "Out of date" + Reanalyze; Reanalyze cleared it | |
| 11 | Real `promptId` and `'CompareSites'` to telemetry and `ProductFeedback` | Pass | `Overlay.tsx:95-105`; `SchoolieDrawer.tsx:108-118, 338-339` | |

### §12 Cross-cutting

| § | Requirement | Result | Evidence | Note |
|---|---|---|---|---|
| 12 | `insights*` tokens for classification states | Pass | `ClassificationBadge.tsx`, `TargetStatusIndicator.tsx`, `ComparisonSummary.tsx` | |
| 12 | Never status by colour alone | Pass | Badge text + icon; status icon + text; hatched trend bars | NA reasons: issue 3 |
| 12 | Responsive to tablet; tables scroll in their own container | Pass | Browser at 768px: no page horizontal scroll; KPI table (1280px) scrolls inside an `overflow-x-auto` container (676px) | |
| 12 | `trackInsightsEvent` for open, swap, focus, view sites, export, Schoolie | Partial | All present; export covers TSV/CSV only | Issue 9 |
| 12 | Z-index: overlay 50, Site Drivers 55, Schoolie 60, menus above | Pass | Overlay, drawer and Schoolie classes; toast at 70, menus at 100 | |
| 12 | Slide effects use `transition-transform`, not `animate-in` | Partial | Overlay and Site Drivers comply; Schoolie doesn't | Issue 7 |

---

## Deviations from spec (intentional, recorded across phases)

None of these is counted as a failure above. Devs should know they are deliberate.

**Engine and descriptions**
- When a sentence has a target clause, the relative % is left out of the description. Example: "Revenue decreased by $709,713 but meets…" has no "(6.8%)". It stays in the no-target case ("Revenue increased by $4,000 (4.0%)"). `descriptions.ts:105-109`
- A Comparable result whose status changes while the two sides' targets differ names the right side's own target by label. This generalizes the "below its 65% target" fixture. `descriptions.ts:237-243`
- Informational descriptions have no "<Classification> — " prefix, matching the fixtures. `descriptions.ts:197-211`
- `RelativeNotApplicable` displays as "Relative Change N/A" and explains "…from $0, so a percentage change cannot be calculated". A change that rounds to zero is described as "did not change". `descriptions.ts:37, 117-122, 214-221`
- Favorability is `'neutral'` for RelativeNotApplicable and Informational, and `null` only for No Data. `compareKpi.ts:139-147`
- A zero denominator gives null (No Data). Inventory turnover across sites is Σ value ÷ Σ (value ÷ days); discrepancy % is Σ$ ÷ Σ value. These are prototype choices. `comparisonAggregation.ts`
- Year to Date resolves to the full school year (end Jun 30) with `isPartial` and `throughDate`. The default interval uses that full span, not the through date. `timeframes.ts:120-124`, `trendRules.ts:38-47`
- Status is compared at display precision (spec §5.6, added in the Phase 3 follow-up). The partial note appears only when it is material (Phase 3 follow-up).

**Data and service**
- Snack is the directional KPI missing a target for SY 2024–25, a choice the spec left open. A La Carte has no target at any scope.
- The Hamilton High `noTarget` row was added after Phase 7 as the mixed-target demo (spec §9 updated).
- The MPLH 18.5 constant is duplicated, because `mockMPLHData` doesn't export it.
- The site registry was extended with `siteTypePluralName`. The Child Care type was kept with one site. Site IDs and names were reassigned.
- `getSideDataset` returns more than the contract: `siteLabel`, `timeframeLabel`, `siteNames`, `scopeType` and `secondaryActual`. Series points add `positionLabel`, `start`, `end` and `target`, and `series()` takes day-alignment options.

**Setup and filters**
- Every section is a `CollapsiblePanel`, with its state in the store (`expandedSections`).
- Clear Filters is disabled when the filters are already at their defaults.
- The filters are compact controls in the KPI Comparison title row (spec §6 updated in the final round). `MultiSelectDropdown` gained an opt-in `hideLabel` prop for this; `CollapsiblePanel` gained a `titleAddon` slot for the info icon.
- Escape closes the overlay. Open dropdowns, the date picker, Site Drivers and Schoolie handle Escape first. `CopyMenu`/`ExportMenu` gained an opt-in `closeOnEscape`.
- The site label uses the resolved site set: picking every High School individually is labeled "High Schools". The dashboard selector's "0 Schools Selected" bug was fixed (Phase 1).
- The partial badge has an extra "Partial · no data yet" variant.

**Trend**
- The interval control is a segmented control. Unavailable intervals stay visible, disabled, with a reason tooltip (issue 13).
- If both the user's interval and the default are unavailable, the nearest available interval is used. An invalid stored choice is reset.
- Extra messages: "Neither timeframe has data for {KPI}." The partial note adds "Later periods have not occurred and are not shown."
- `prior_ytd` counts as a school year for compatibility. Month and Quarter positions count from the period start (spec §7 was updated to match).
- The merged target line is labeled "Target · both comparisons". Chart aria labels say "first/second comparison".

**Summary and KPI table**
- The Summary is one counts sentence under a "Target Attainment" heading (with an info icon for what the counts cover), plus "with a zero starting value" text and a "No KPIs match the current filters." state.
- Performance descriptions are clamped to two lines, with the full text in a tooltip and shown in full on the focused row. Columns were rebalanced for row height.
- The Site Drivers cell uses compact per-side lines ("High Schools: 3 of 5 meeting"), with the full wording in its tooltip. Exports keep the full wording.

**Site Drivers drawer**
- Adds a variance column in the matched table, a copy icon per table, and a wider panel (`max-w-5xl`). It closes automatically when Site Drivers no longer applies. It is portaled above the overlay. (The in-drawer Swap was removed in the final round.)

**Copy and Download** (spec §10 was updated in Phase 8 to match)
- Only the KPI table's Copy data and CSV are real. Trend exports and the page PDF are UI only and show a "Not implemented in prototype." toast.
- A new minimal `ToastProvider` was added, because the app had none. `CopyMenu`/`ExportMenu` gained backward-compatible `disabled`, `disabledReason`, `title` and `closeOnEscape` props. `CopyMenu` also takes optional download items as children, listed under "Available Exports" in the same dropdown (dashboard callers pass none, so they are unchanged).
- `MPLHSchoolTable`'s sort icon moved to a shared `Common/SortIcon.tsx` so the Site Drivers drawer reuses it; the MPLH table's behavior is unchanged.
- Needs Attention reasons are joined with " · " in exports.

**Schoolie**
- Panel mode has no backdrop, so the page stays visible beside it. On desktop the page reserves the panel's width (issue 1 fix). The width is responsive: full / 400px / ½ / ⅓.
- The Schoolie button is disabled, with a tooltip, until both sides are set. Schoolie closes when a side is cleared or the overlay closes.
- The payload keys the sides `from`/`to` with an `orientation.rules` block. It includes the top 3 sites outside target for each KPI needing attention, `favorableDirection`, and `periodLengthNotice`.
- New `SchoolieDrawer` props: `width`, `loadingText`, `analysisContext`, `contextKey` and `feedbackAttribution`. The default `'legacy'` keeps the existing callers' hardcoded attribution.
- `schoolieService.ts` and `mockPerformanceComparisonAnalysis.ts` import the `ComparisonFactsPayload` type from `features/…`. This is a type-only reverse dependency.

**Accepted in the final round** (see Resolution)
- #3 Needs Attention reasons show on hover/focus of the row's ⚠ icon, not as row text. PO decision.
- #4 The Schoolie panel is half width at `md` (and 400px at `sm`), not ⅓, so it stays readable at tablet width.
- #5 "Suggested next steps" can be fewer than 2 when few KPIs are in scope.
- #6 The Schoolie payload's `orientation.rules` uses "A", "B", "left", "right" and "baseline" as model instructions only; no user-facing text does.
- #9 Trend exports, the page PDF and Reanalyze send no telemetry, since they are prototype-only controls.
- #11 Superseded: the comparison's menus now use the dashboard's wording ("Copy Data", "Copy Image").
- #13 The trend interval control is a segmented control, not the dashboard granularity dropdown (approved in Phase 6).
- #16 Relative materiality rounds the fraction to 4 dp, so 1.995%–1.9999% counts as material, matching the displayed "2.0%".
- #18 Dashboard side effects, approved: `MultiSelectDropdown` opens upward and clamps its height for every caller; `TimeframeSelector` descriptions are computed and the list includes Prior Year to Date; `DemoSchoolSelector` shows plural type names and resolved counts, and site IDs were reassigned; Escape closes the dashboard dropdowns; the 7 comparison events are registered as Usage interaction types.

**Telemetry**
- New events: `COMPARISON_OPENED`, `COMPARISON_SIDE_CHANGED`, `COMPARISON_SWAPPED`, `COMPARISON_KPI_FOCUSED`, `COMPARISON_SITE_DRIVERS_OPENED`, `COMPARISON_EXPORTED` and `COMPARISON_SCHOOLIE_OPENED`, with `comparisonSide`/`comparisonField` context. They are also registered as Usage interaction types (issue 18).

---

## Scenarios checked in the browser

- District: Prior Year to Date vs Year to Date; SY 2024–25 vs SY 2025–26 (with Swap, Needs Attention, trend by Month/Quarter/Day, Copy, CSV, Schoolie)
- This Week vs Last Week (trend by Day, weekday alignment)
- This Month vs Last Month (trend by Week)
- YTD vs This Month (trend unavailable)
- High Schools SY 2024–25 vs SY 2025–26 (matched Site Drivers, Hamilton "No target")
- High Schools vs Middle Schools YTD (unmatched Site Drivers)
- Lincoln Elementary vs Jefferson Elementary (no Site Drivers)
- High Schools SY 2022–23 vs YTD (No Data, default period-length notice)
- Middle Schools SY 2023–24 vs SY 2024–25 (Kennedy Middle No Data)
- Hamilton High SY 2024–25 vs SY 2025–26 (Lunch with no SY 2025–26 target)
- Central Office label
- Mixed multi-site selections (identical labels)
- Tablet width (768px)

## Screenshots

Saved locally in `docs/performance-comparison/screenshots/`. The folder is gitignored and not committed; rerun the review to regenerate it.

| State | Path |
|---|---|
| Empty state | `docs/performance-comparison/screenshots/01-empty-state.png` |
| Full comparison (district SY 2024–25 vs SY 2025–26) | `docs/performance-comparison/screenshots/02-full-comparison.png` |
| Needs Attention on | `docs/performance-comparison/screenshots/03-needs-attention.png` |
| Trend (Lunch by month) | `docs/performance-comparison/screenshots/04-trend-lunch-month.png` |
| Site Drivers, matched (High Schools, Lunch) | `docs/performance-comparison/screenshots/05-site-drivers-matched.png` |
| Site Drivers, unmatched (High vs Middle Schools) | `docs/performance-comparison/screenshots/06-site-drivers-unmatched.png` |
| Schoolie drawer (covers the interval selector) | `docs/performance-comparison/screenshots/07-schoolie-drawer.png` |
| Schoolie "Out of date" | `docs/performance-comparison/screenshots/07b-schoolie-out-of-date.png` |
| Tablet: setup and Summary | `docs/performance-comparison/screenshots/08-tablet-setup.png` |
| Tablet: KPI table | `docs/performance-comparison/screenshots/09-tablet-kpi-table.png` |
| Tablet: trend | `docs/performance-comparison/screenshots/09b-tablet-trend.png` |
| Tablet: Site Drivers | `docs/performance-comparison/screenshots/09c-tablet-site-drivers.png` |
| Trend, This Week vs Last Week by day | `docs/performance-comparison/screenshots/10-trend-week-vs-week-day.png` |
| No Data (SY 2022–23) | `docs/performance-comparison/screenshots/11-no-data-sy2223.png` |
| Site Drivers, Kennedy Middle No Data | `docs/performance-comparison/screenshots/12-site-drivers-kennedy-middle.png` |

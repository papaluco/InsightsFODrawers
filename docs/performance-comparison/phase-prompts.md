# Performance Comparison — Claude Code Phase Prompts

Paste one prompt per session, in order. Each phase ends with Claude Code stopping for review. Start a fresh session (or `/clear`) between phases so context stays focused; `CLAUDE.md` and the spec carry everything forward.

---

## Phase 1 — Foundation: utilities, registries, tests

```
We're starting implementation of Performance Comparison. Read CLAUDE.md,
docs/performance-comparison/spec.md, and docs/performance-comparison/discovery.md.

This phase builds the foundation only. No UI changes.

1. Add Vitest as a dev dependency with an `npm test` script. Configure it to work
   with the existing Vite/TS setup.
2. Add DEMO_AS_OF_DATE (2026-04-16) as a single shared constant (spec §3).
3. Date utilities (pure, unit-tested):
   - getSchoolYear(date) with a Jul 1 – Jun 30 school year
   - resolveTimeframe(optionId, asOf, customRange?) → { start, end, kind,
     schoolYear?, isPartial, throughDate } for every option the existing
     TimeframeSelector offers
   - timeframe label generation per spec §6
   - time bucketing for Day/Week/Month/Quarter (school-year quarters). Lift the
     Usage module's getBucket logic into a shared util rather than writing a
     third copy; leave the Usage components working.
   - default interval (spec §3) and trend alignment + compatibility (spec §7)
4. Site registry: promote DEMO_SITES into src/data/ (keep its shape so
   DemoSchoolSelector still works), grow it to ~18 sites per spec §9, and add
   resolveSiteScope(selection) → siteIds plus site-label generation per spec §6.
   Fix the "0 Schools Selected" label bug for type-only selections while you're there.
5. KPI definitions registry: all 17 KPIs from spec §4 with display format, kind,
   favorable direction, materiality method + threshold, and aggregation. Extend
   or sit beside kpiTypes.ts; reuse existing names. Add A La Carte and
   Reimbursement. Do not consolidate the two KPIKey types unless it's trivial;
   if not, add a mapping and note it.
6. Shared formatters for %, $, counts, MPLH, days, and pts deltas.

Write unit tests for every utility, including school-year boundaries (Jun 30 /
Jul 1), partial detection against DEMO_AS_OF_DATE, label generation, default
interval thresholds, and alignment/compatibility cases.

Before writing code, give me a short plan (files to add/change) and wait for my OK.
When done: run lint, typecheck, and tests, summarize, and stop.
```

---

## Phase 2 — Mock data, benchmarks, comparison data service

```
Read CLAUDE.md and docs/performance-comparison/spec.md (especially §3, §4, §9).

Build the comparison mock data layer.

1. Deterministic, seeded daily per-site data generator in src/data/ covering
   2023-07-01 through DEMO_AS_OF_DATE, serving days only, generating the
   components each KPI needs (spec §9). Include every built-in scenario listed in
   spec §9 and document each one in a comment so developers and I can find them.
2. Benchmarks table and resolveBenchmark(kpi, siteIds, scopeType, schoolYear)
   implementing the precedence in spec §3, including the deliberately missing
   benchmarks. Never average site benchmarks.
3. src/services/comparisonDataService.ts implementing getSideDataset() per the
   contract in spec §9: aggregate KPI values per side (ratio-of-sums for ratio
   KPIs, sums, point-in-time for inventory), per-site values, per-side targets,
   and a series(kpi, interval) function. Return null (never 0) for No Data.
4. Leave existing dashboard mocks untouched.

Tests: aggregation correctness (ratio of sums vs average of ratios), No Data vs
zero, benchmark precedence and missing benchmarks, partial SY 2025–26, the
mid-year-opening site, and that the scenarios actually produce Improved,
Comparable, and Declined for district SY 2024–25 vs SY 2025–26.

Finish by printing a short table (in chat, not a file) of district-wide
SY 2024–25 vs SY 2025–26 values and targets for all 17 KPIs so I can sanity-check
the numbers. Run lint, typecheck, tests. Summarize and stop.
```

---

## Phase 3 — Rules engine (NXT-77217)

```
Read CLAUDE.md and docs/performance-comparison/spec.md §5 carefully. This is the
most important phase: developers will port this engine directly.

Implement the KPI comparison rules engine as pure TypeScript with no React and
no mock-data imports, returning the per-KPI result described in spec §5.2.
Cover orientation, both materiality models, baseline zero, informational KPIs,
directionality, per-side target status, target transitions, No Data and
one-sided data, Needs Attention with reasons, deterministic descriptions
(including partial-period notes and label usage), and site-level evaluation for
Site Drivers.

Tests:
- Every fixture in the spec §5.9 tables, as table-driven tests.
- Swap symmetry: swapping sides flips the delta sign and recalculates
  classification and Needs Attention correctly.
- Floating-point edge: 60 → 60.5 is exactly material.
- No description ever contains "left", "right", "baseline", " A ", " B ",
  "previous", "current", or "now" (except inside a generated label).
- Every Needs Attention rule in spec §5.8, including the one-sided cases.

Also add a small comparison selector/hook that takes two side datasets plus the
KPI filter and Needs Attention toggle and returns the engine results for every
KPI in scope. This is the single source every UI component will read.

Run lint, typecheck, tests. Summarize, list any spec ambiguities you resolved,
and stop.
```

---

## Phase 4 — Overlay & Comparison Setup (NXT-77202)

```
Read CLAUDE.md, spec §6 and §12, and the discovery report's UI pattern sections.

Build the Performance Comparison overlay and setup.

1. Add the Compare action to SimpleHeader (GitCompareArrows, title "Compare",
   existing icon-button classes) with telemetry.
2. Full-screen overlay following the AppUsageDrawer pattern: back navigation,
   "Performance Comparison" title, Schoolie and Download header actions
   (disabled placeholders for now), and placeholder sections for Summary,
   KPI Comparison, and Performance Trend.
3. Make DemoSchoolSelector and TimeframeSelector controlled via optional
   value/onChange props. Their current dashboard usage must behave exactly as before.
4. Left and right side panels, both starting empty, with generated labels and
   partial-period badges below each side.
5. Swap (disabled until both sides are set), KPI multi-select filter (default
   all), Needs Attention toggle, Clear Filters/Reset (filters only).
6. Comparison Zustand store per spec §6, wired to comparisonDataService and the
   Phase 3 selector so downstream sections can read engine results.
7. Empty state until both sides are set; materiality note at the bottom.
8. Responsive to tablet width.

Before writing code, give me a short plan and wait for my OK. When done, run
lint, typecheck, tests, tell me how to open it in the dev server, summarize,
and stop.
```

---

## Phase 5 — Comparison Summary & KPI Comparison table (NXT-77208, NXT-77210)

```
Read CLAUDE.md and spec §8 (Summary and KPI table) and §12.

1. Comparison Summary: Improved/Comparable/Declined counts and per-side target
   attainment using generated labels, all from the engine results in scope.
2. KPI Comparison table modeled on MPLHSchoolTable: columns per spec §8, numeric
   data formatted at render time, classification badges using insights tokens +
   text + TrendIndicator, Needs Attention reasons, informational badge, and an
   empty Site Drivers column placeholder for Phase 7.
3. Row click focuses a KPI (separate from the filter) with a clear control.
4. Needs Attention toggle and KPI filter drive both the table and the Summary.

Verify by hand in the browser: district SY 2024–25 vs SY 2025–26, a swap, a
Needs Attention filter, an older school year with No Data, and the mid-year site.
Report what you checked. Run lint, typecheck, tests. Summarize and stop.
```

---

## Phase 6 — Performance Trend (NXT-77211)

```
Read CLAUDE.md and spec §7.

Build the Performance Trend section for the focused KPI using Recharts
ComposedChart: paired actual bars per aligned interval, a target line per side
(merged when identical), interval selector with the default rule, alignment and
compatibility per spec §7, the "Trend comparison unavailable…" state, the
no-focused-KPI empty state, and partial-period handling (no future buckets, no
zeros). Generalize or extend the existing PerformanceTrends chart pieces where
practical rather than duplicating them. Sides must be distinguishable without
color.

Hand-check: SY vs SY by Month and Quarter, This Week vs Last Week by Day, This
Month vs Last Month by Week, an incompatible pair, and the partial SY 2025–26.
Run lint, typecheck, tests. Summarize and stop.
```

---

## Phase 7 — Site Drivers (NXT-77212)

```
Read CLAUDE.md and spec §8 (Site Drivers).

Add the Site Drivers row summary and the View Sites drawer (KPI drawer pattern,
z-[55] above the overlay). Implement matched vs unmatched populations, per-site
targets from the resolver, engine-driven site classifications, default sort
(largest unfavorable variance first, no-target next, No Data last), sortable
columns, and in-place refresh when the comparison changes while open.

Hand-check: High Schools SY vs SY (matched), High Schools vs Middle Schools
(unmatched), single site vs single site (no Site Drivers), and the mid-year site.
Run lint, typecheck, tests. Summarize and stop.
```

---

## Phase 8 — Copy & Download (NXT-77213)

```
Read CLAUDE.md and spec §10.

Only the KPI table's copy and CSV download are real; trend exports and the page
PDF are UI only (production's existing implementation provides the behavior).

1. KPI Comparison title row: the dashboard's CopyMenu and ExportMenu.
   - "Copy data" copies the table as tab-separated text.
   - "Download CSV" uses CSVExpButton/CSVRenderer (UTF-8 with BOM), filename
     Performance_Comparison_KPIs_<YYYY-MM-DD>.csv.
   Both contain exactly the rows in scope (KPI filter + Needs Attention), in the
   current orientation and display order, with these columns:
   KPI | <left label> Actual | <left label> Target | <left label> Target Status |
   <right label> Actual | <right label> Target | <right label> Target Status |
   Change | Performance | Needs Attention | Needs Attention Reasons | Description |
   Site Drivers
   Use the engine's formatted values as the table shows them; "No Data" and "—"
   instead of zeros; the full engine description; the full-wording Site Drivers
   summary, or blank when not applicable. Build the rows in a pure, unit-tested
   module (ui/kpiTableExport.ts): scope, orientation after swap, No Data, missing
   targets, informational KPIs.
2. Performance Trend title row: Copy ("Copy data", "Copy image") and Download
   ("Download CSV", "Download PNG") menus. Every item shows a toast: "Not
   implemented in prototype." Disable both icons, with a tooltip saying why, when
   no KPI is focused or the trend is unavailable.
3. Overlay header Download: a menu with "Download PDF" that shows the same toast.
4. Toast: the app has none, so add a minimal one that matches the app's styling
   and auto-dismisses after a few seconds.
5. Icons and menus follow the dashboard's placement, styling, tooltips, and
   layering above the overlay; panel icons hide while a panel is collapsed.
   Escape closes an open menu first and closes the overlay only when nothing is
   open (opt-in on the shared menus; the dashboard's menus are unchanged).
6. Update spec §10 to match.

Hand-check in the browser at desktop and tablet width, including the downloaded
CSV opened as text, a swapped comparison, and Needs Attention on. Run lint,
typecheck, tests. Summarize and stop.
```

---

## Phase 9 — Schoolie (NXT-77214)

```
Read CLAUDE.md and spec §11.

Add Schoolie to the comparison: drawer width option, auto-analysis on open,
structured facts payload built from engine results (in-scope KPIs only), new
performance_comparison prompt visible in AI Config, getPromptAnalysis with an
optional context argument and a response generated from the payload, a
collapsible "Facts sent to Schoolie" JSON view, stale detection with Reanalyze
(no auto-rerun), and correct promptId/sourceEntryPoint in telemetry and feedback.

Add unit tests that the payload excludes filtered-out KPIs and that the mock
response never contradicts engine classifications.
Run lint, typecheck, tests. Summarize and stop.
```

---

## Phase 10 — Acceptance review

```
Do a read-only acceptance review. Don't change code.

Go through every requirement in spec.md, section by section, and check it
against the running prototype and the code. Produce
docs/performance-comparison/acceptance-review.md with one row per requirement:
spec section, requirement, Pass / Fail / Partial, evidence (file or what you observed),
and a note. Put all Fails and Partials in a single issues list at the top.
Then summarize in chat and stop.
```

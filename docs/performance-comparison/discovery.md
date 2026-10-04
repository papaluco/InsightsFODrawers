# Insights Performance Comparison — Discovery Report

**Epic:** NXT-77201 · **Branch at time of discovery:** `main` @ `2766f0c` · **Date:** 2026-10-04
**Scope:** read-only investigation. No source files were modified.

Verdict legend: **Reuse as-is** · **Extend** (modify/generalize an existing piece) · **Build new**

---

## TL;DR — the five things that most affect the plan

1. **The Insights Dashboard is a static mockup, not a data-driven page.** Neither header selector emits a value. `TimeframeSelector` has no props, and `DemoSchoolSelector`'s `onApply` only `console.log`s. 12 of the 15 KPI cards are hardcoded JSX strings. There is no filtering by site or date anywhere. The Comparison page would be the first Insights surface that actually computes KPIs from a scope and timeframe.
2. **There is no "default interval selection logic" to reuse.** The Performance Trends granularity dropdown defaults to a hardcoded `'Monthly'` and is explicitly commented *"NXT-74485 — visual placement only, does not affect chart data"* ([PerformanceTrends.tsx:116](../../src/components/InsightsDashboard/PerformanceTrends.tsx#L116)). No Quarter option exists. The rule must be specified and built, or it lives in another repo or spec.
3. **No KPI mock data has a time dimension.** Every Insights dataset is a single snapshot with no dates. Two school years of history, Day/Week/Month/Quarter trends, and partial-period detection are all unsupported today.
4. **Benchmarks are scattered constants.** They exist only as hardcoded values (MPLH `18.5`, PNA `10.00`, ENP `5.00`, plus `DASHBOARD_METRICS.expected`). They have no school-year dimension, no per-site variation, and no representation for "missing". "No Data" is uniformly encoded as `0`.
5. **Site identity is inconsistent across datasets.** Four different site lists exist: 3 sites in the selector, about 100 in the grid, 20 in `DASHBOARD_GRID_DATA`, and 5–8 in the MPLH/PNA/ENP drawers. The names don't overlap meaningfully. A canonical site registry is a prerequisite.

---

## 1. Project basics

| Area | Finding | Path |
|---|---|---|
| Framework | Vite 5 + React 18.3 + TypeScript 5.5 (SPA) | [package.json](../../package.json), [vite.config.ts](../../vite.config.ts) |
| Commands | `npm run dev` · `build` · `preview` · `lint` (ESLint 9 flat config) · `typecheck` (`tsc --noEmit -p tsconfig.app.json`) | [package.json](../../package.json) |
| Routing | `react-router-dom` v7, `BrowserRouter` → `RoutesProvider`. Routes: `/insights` (index redirect), `/reports`, `/settings`, `/settings/json-payload-demo`, `/usage`, `/app-health`, `/preferences`. All are wrapped in `LayoutMenu`. | [App.tsx](../../src/App.tsx), [RoutesProvider.tsx](../../src/components/Common/RoutesProvider.tsx), [LayoutMen.tsx](../../src/components/Common/LayoutMen.tsx) |
| State | Mostly local `useState`, lifted into the page (`InsightsPage` owns all drawer state and a `navOrigin` for back navigation). One Zustand store, `useInsightsPreferencesStore` (display preferences only). | [InsightsPage.tsx](../../src/pages/InsightsPage.tsx), [useInsightsPreferencesStore.ts](../../src/store/useInsightsPreferencesStore.ts) |
| Styling | Tailwind 3.4, `plugins: []`. Tokens: `primary` (#665AD8) plus `insightsFavorable` / `insightsUnfavorable` / `insightsNeutral`, mapped to HSL CSS vars (`--insights-*`). In practice most components use raw `indigo-*`, `emerald-*` and `red-*` classes. Icons are `lucide-react` 0.344, plus a custom `SchoolieIcon`. | [tailwind.config.js](../../tailwind.config.js), [index.css](../../src/index.css), [Icons.tsx](../../src/components/Common/Icons.tsx) |
| Other libraries | `recharts` 3, `@react-pdf/renderer`, `html-to-image`, `file-saver`, `date-fns` 4, `react-datepicker`, `react-quill`, `@supabase/supabase-js` | |
| Tests | **None.** There's no vitest, jest, playwright or testing-library dependency, no `*.test.*` or `*.spec.*` files, and no `test` block in Vite config. The only quality gates are `npm run lint` and `npm run typecheck`. | [package.json](../../package.json) |
| Folder conventions | `src/pages/*Page.tsx` (route pages) · `src/components/<Feature>/<SubArea>/` (e.g. `InsightsDashboard/MPLH/`) · `src/data/mock*.ts` · `src/services/*Service.ts` (async wrappers "so they can be swapped for a real API") · `src/types/*` · `src/constants/*` · `src/utils/*` · `src/telemetry/*` | |
| Telemetry | Every user action calls `trackInsightsEvent({eventType, userId, districtId, platform, context})`. Drawers also call `telemetry.trackPerformance(...)`. The new page should follow this. | [insightsUsageService.ts](../../src/services/insightsUsageService.ts), [src/telemetry/](../../src/telemetry/) |

**Gotcha:** 71 usages of `animate-in`, `fade-in` and `slide-in-from-right` classes exist, but the `tailwindcss-animate` plugin isn't installed. Those classes do nothing. The only real slide animations come from `transition-transform translate-x-*`.

---

## 2. Insights Dashboard

| Item | Finding | Path |
|---|---|---|
| Page | `InsightsPage` at route **`/insights`**. Renders `SimpleHeader` → `KPICards` → `SchoolPerformanceGrid` → `PerformanceTrends` (wrapped in `chartRef` for PDF) → `ProductFeedback`. Lazy-loads the six KPI drawers. | [InsightsPage.tsx](../../src/pages/InsightsPage.tsx) |
| Header and action area | `SimpleHeader`: title on the left; on the right, `TimeframeSelector`, `DemoSchoolSelector`, then an action group (`DashExportMenu`, **Configure KPIs** (`Settings`), **Ask Schoolie** (`SchoolieIcon`), **Configure Benchmarks** (`Target`)). Only the export menu works; the other three buttons have no `onClick`. | [SimpleHeader.tsx:47-79](../../src/components/InsightsDashboard/SimpleHeader.tsx#L47-L79) |
| Icon and tooltip pattern | `<button title="…" className="p-2 bg-white rounded-lg text-gray-500 hover:text-indigo-600 hover:shadow-sm transition-all border-none"><Icon size={20}/></button>`. **The tooltip is the native `title` attribute only**; there is no tooltip component. | same |
| KPI rendering | `KPICards` is a fixed 4-column grid of **15 bespoke card components**. Only `MPLHCard`, `PNACard` and `ENPCard` take props (actual/target/onClick) and use `TrendIndicator` and the favorable tokens. The other 12 (`BreakfastCard`, `RevenueCard`, …) hardcode values, colors and icons. There is no KPI registry and no data-driven card. | [KPICards.tsx](../../src/components/InsightsDashboard/KPICards.tsx), [Cards/](../../src/components/InsightsDashboard/Cards/) |

**Reuse verdict**
- Compare action button: **Extend** `SimpleHeader`. Add one button using the existing class string. Lucide 0.344 has `GitCompareArrows`, `GitCompare`, `ArrowLeftRight` and `Columns2` (all verified). Add `trackInsightsEvent`.
- KPI cards: **Reuse as-is** for the dashboard. Don't use them as a source of KPI metadata, because a KPI definition registry must be **built new** (§7).

---

## 3. Reusable UI patterns

| Pattern | Where it exists | Notes | Verdict |
|---|---|---|---|
| **Full-screen overlay / side-slide** | [AppUsageDrawer.tsx:49-80](../../src/components/Usage/AppUsageDrawer.tsx#L49-L80), AppHealth `*Drawer.tsx`, [AIConfigDrawer.tsx:159](../../src/components/Settings/AI/AIConfigDrawer.tsx#L159), [SystemSettingsDrawer.tsx](../../src/components/Settings/System/SystemSettingsDrawer.tsx), [TelemetrySettingsDrawer.tsx](../../src/components/Settings/Telemetry/TelemetrySettingsDrawer.tsx) | `fixed inset-0 bg-white z-50 flex flex-col transition-transform duration-300 ${isOpen?'translate-x-0':'translate-x-full'}`. Sticky header (`px-8 py-5`, icon tile, title and subtitle, Schoolie button, X). Scroll body `flex-1 overflow-y-auto bg-gray-50 px-8 py-6`. Escape closes only when no child drawer is open. **No shared shell component**: each file copies the markup. Nothing in Insights uses it yet. | **Reuse pattern** (copy the AppUsageDrawer structure). Optionally extract a `FullScreenOverlay` shell. |
| **Side drawer (KPI drill-in)** | [MPLHDrawer.tsx:126-127](../../src/components/InsightsDashboard/MPLH/MPLHDrawer.tsx#L126-L127), PNA and ENP drawers | Backdrop `bg-black/40 z-40` plus panel `fixed inset-y-0 right-0 w-full max-w-4xl z-50`. Header has `ExportMenu`, a Schoolie button and X. Body is `KPISummary` → tables → `KPIAbout` → `ProductFeedback`. Includes Escape handling and drawer-load performance telemetry. | **Reuse pattern** for Site Drivers |
| **Drawer back navigation** | [SingleSchoolMPLHDrawer.tsx](../../src/components/InsightsDashboard/MPLH/SingleSchoolMPLHDrawer.tsx) (`onBack` + `ChevronLeft`), [InsightsPage.tsx `navOrigin`/`handleBack`](../../src/pages/InsightsPage.tsx) | Page-level origin tracking | **Reuse as-is** |
| **Z-index stack** | Header dropdowns `z-50`/`z-[45]`, menus `z-[100]`. KPI drawers `z-40/50`. Schoolie/AIKPI drawers `z-[55]/z-[60]`. Report modals `z-[999]`–`z-[2000]`. | A `z-50` full-screen overlay hosting a Site Drivers drawer needs `z-[55]+`. Schoolie at `z-[60]` already sits above it. | Plan the layering explicitly |
| **Tables / grids** | [MPLHSchoolTable.tsx](../../src/components/InsightsDashboard/MPLH/MPLHSchoolTable.tsx) (search, **Needs Attention toggle**, sort, pagination, empty-state row), [SchoolPerformanceGrid.tsx](../../src/components/InsightsDashboard/SchoolPerformanceGrid.tsx) (wide grid, CopyMenu, pagination), ENP and PNA grids | No shared table component; sort and pagination logic is copied per table. `SchoolPerformanceGrid` stores **preformatted strings** (`"$1,819.69"`, `"85%"`), so sorting is lexicographic and wrong for numbers. | **Extend**: model the KPI Comparison table on `MPLHSchoolTable` (it already has Needs Attention), with typed numeric rows and formatting at render time |
| **Tooltips** | Native `title` everywhere. One hand-rolled hover tooltip in [MPLHOtherMeals.tsx:20-40](../../src/components/InsightsDashboard/MPLH/MPLHOtherMeals.tsx#L20-L40). Recharts `<Tooltip>` in charts. | | **Build new** small `InfoTooltip` (based on the MPLHOtherMeals approach) for KPI descriptions and status explanations |
| **Status / favorable–unfavorable** | [TrendIndicator.tsx](../../src/components/Common/TrendIndicator.tsx) (`direction` up/down/flat × `status` favorable/unfavorable/neutral, size from the preferences store). Tailwind tokens `text-/bg-insightsFavorable` etc. are user-configurable via [insightsColorPresets.ts](../../src/constants/insightsColorPresets.ts) and the Preferences page. [KPISummary.tsx](../../src/components/InsightsDashboard/KPISummary.tsx) shows *Actual vs Benchmark = Difference* with `higherIsBetter`. | `KPISummary`, the `PerformanceTrends` bars (`#22c55e`/`#ef4444`) and the grid cells hardcode emerald and red instead of the tokens, so they ignore the user's color preferences. `KPISummary` can't render a null benchmark and has no "comparable/neutral" state. | `TrendIndicator` and tokens: **Reuse as-is** (map Improved / Comparable / Declined → favorable / neutral / unfavorable). `KPISummary`: **Extend** (tokens, null benchmark, neutral). |
| **Empty states** | Inline `<td colSpan>` text only: [MPLHSchoolTable.tsx:201](../../src/components/InsightsDashboard/MPLH/MPLHSchoolTable.tsx#L201), [ENPSchoolGrid.tsx:148](../../src/components/InsightsDashboard/ENP/ENPSchoolGrid.tsx#L148) | No "No Data", "No benchmark", "No access" or "No sites match" treatments | **Build new** (small shared `EmptyState` plus a `NoDataCell`/`—` convention) |
| **Collapsible section** | `KPISummary` and `KPIAbout` (chevron toggle) | | **Reuse as-is** for Summary and About sections |
| **Generic multi-select** | [MultiSelectDropdown.tsx](../../src/components/Common/MultiSelectDropdown.tsx) | Used by Usage filters | Candidate for the KPI filter: **Reuse as-is** |

---

## 4. Site selection

**Component:** [DemoSchoolSelector.tsx](../../src/components/Common/DemoSchoolSelector.tsx)

- **Data:** a hardcoded `DEMO_SITES` constant inside the component with 5 site types (`101` Central Office, `102` Child Care Facility Provider, `103` Elementary, `104` High, `105` Middle) and **3 sites**.
- **Selection model:** a flat `number[]` of mixed IDs. `0` = All Schools, `101–105` = types, `1–3` = sites. Toggling All selects every ID; unchecking any item drops `0`. Edits go to a pending selection, committed with Apply/Clear.
- **Output:** `buildFilters()` → `{ siteIdList, siteTypeIdList }` (both empty for "All"). **Selecting a type does not resolve to its member sites**; the type ID is just passed through.
- **Label:** "All Schools" / the single site name / "`N` Schools Selected". **Bug:** a type-only selection (e.g. just "Elementary") displays *"0 Schools Selected"*.
- **Uncontrolled:** there's no `value` prop, so the comparison page can't preset, swap or restore a selection.
- **Site types are defined three incompatible ways:**
  1. Numeric `siteTypeId` in the selector.
  2. String union `'Elementary School' | 'Middle School' | 'High School'` in [mockMPLHData.ts](../../src/data/mockMPLHData.ts), [mockPNAData.ts](../../src/data/mockPNAData.ts) and [ENPDataTypes.ts](../../src/types/ENPDataTypes.ts).
  3. Implied only by the school name in the grid data.
- Site-type rollup UI exists in [MPLHSiteTypeSummary.tsx](../../src/components/InsightsDashboard/MPLH/MPLHSiteTypeSummary.tsx), which groups by the string union.

**Verdict: Extend.**
1. Move `DEMO_SITES` into a canonical site registry under `src/data`.
2. Add a controlled `value` + `onChange`.
3. Add a resolver `resolveSiteScope(selection) → siteId[]` that expands types.
4. Add a label generator (e.g. "All Schools", "Elementary Schools (12)", "Lincoln Elementary", "3 Schools").

Reuse the same component twice (left and right) so Swap is a simple state exchange.

---

## 5. Timeframe selection

**Component:** [TimeframeSelector.tsx](../../src/components/Common/TimeframeSelector.tsx)

- **Options (hardcoded `DATE_OPTIONS`):** Today, Yesterday, This Week, Last Week, This Month, Last Month, Year to Date (`2025 - 2026`), Prior Year (`2024 - 2025`), SY 2023-24, SY 2022-23, SY 2021-22, SY 2020-21, **Custom Range** (`react-datepicker` inline range, 2 months).
- The descriptions are static text anchored to **"today = April 16, 2026"**.
- **There are no props and no `onChange`.** The selection never leaves the component. The default is `'today'`.
- **No date resolution:** option IDs are never converted to start/end dates.
- **No school-year logic** anywhere in the repo beyond these labels. The SY boundary is not defined; drawers default to `'Jul 1, 2025 - Apr 3, 2026'`, which implies a July 1 start.
- **No partial-period detection.**
- The demo "today" is inconsistent: Apr 16, 2026 here, Apr 3, 2026 in drawer defaults and the README, and the real date is Oct 4, 2026.

**Verdict: Extend** (keep the UI and make it controlled) **+ Build new** pure utilities:
- `resolveTimeframe(id, asOf, custom?) → { start, end, label, schoolYear?, isPartial, coveredDays, totalDays }`
- `getSchoolYear(date)` with a configurable SY start month.
- A single `DEMO_AS_OF_DATE` constant used by the selector, data and labels.

---

## 6. Performance Trends

**Component:** [PerformanceTrends.tsx](../../src/components/InsightsDashboard/PerformanceTrends.tsx)

- **Library:** Recharts 3 `ComposedChart` with `Bar` (actual; per-bar `Cell` colored green/red vs the benchmark) and `Line` (benchmark), plus `ResponsiveContainer`, `Legend` and `Tooltip`.
- **Data:** hardcoded `MOCK_CHART_DATA`, 12 monthly points Jul 2024 – Jun 2025. The values are unrealistic (e.g. 53 vs a 2,800 benchmark, and a 19,221 spike).
- **KPI select:** MEQs, Meals and Revenue only, and **not wired**. Changing it updates only the copy text.
- **Interval select:** Daily / Weekly / Monthly. **Visual only (NXT-74485)**, defaulting to a hardcoded `'Monthly'`. **There is no Quarter option and no default-interval logic.**
- **Copy:** `CopyMenu` with data (TSV) and image (`html-to-image` → clipboard). The dashboard PDF captures this chart via `chartRef` + `toPng`.
- **Related code:** the Usage module has real Day/Week/Month bucketing (`getBucket`, `formatBucketLabel`), **copy-pasted** in [InsightsOverviewActivityTrend.tsx:9-52](../../src/components/Usage/insights/InsightsOverviewActivityTrend.tsx#L9-L52), [InsightsDistrictActivityTrend.tsx:9-57](../../src/components/Usage/insights/InsightsDistrictActivityTrend.tsx#L9-L57) and the other Usage trend charts. Their default is a hardcoded `'week'`, which isn't auto-selected either.

**Verdict**
- Chart shell, styling, legend and copy: **Extend**. Generalize to N series so the comparison can render paired bars (left/right) plus two target lines.
- Bucketing: **Extend**. Lift the Usage `getBucket` into a shared `src/utils` time-bucket util and add `quarter` (school-year quarters vs calendar quarters is an open question).
- **Default interval logic: Build new.** It doesn't exist in this repo. I need the rule, e.g. "≤ 31 days → Day, ≤ 120 → Week, ≤ 400 → Month, else Quarter" (see Open Questions).

---

## 7. KPIs

**Where they live today**
- **Names and colors:** [kpiTypes.ts](../../src/types/kpiTypes.ts) holds `KPI_SHORT_NAMES` (15), `KPI_LONG_NAMES`, short↔long maps, `KPI_SELECT_OPTIONS` and `KPI_CHART_COLORS`. **It has no unit, format, direction (higher/lower is better), aggregation rule, or description.**
- **Calculations (only three exist):**
  - MPLH: [mockMPLHData.ts](../../src/data/mockMPLHData.ts). `MEQ = B + L + 0.5·Snack + 0.5·ALC + 0.5·Other`; `MPLH = MEQ / laborHours`. District = ΣMEQ / Σhours, the correct ratio-of-sums.
  - PNA: `calculateDistrictPNA()` = Σpaid / Σstudents × 100 ([mockPNAData.ts](../../src/data/mockPNAData.ts)).
  - ENP: static constants only ([mockENPProgramData.ts](../../src/data/mockENPProgramData.ts)).
- **Formatters:** none shared. Formatting is inline (`toFixed(2)`, `toLocaleString()`, string literals).
- **Direction:** known only implicitly. MPLH is higher-is-better; PNA and ENP are lower-is-better (via `KPISummary higherIsBetter` and card logic).
- **Plain-language descriptions:** a "KPIAbout" panel exists per drawer, but the content is inline JSX per KPI.

**Map against the requested list**

| KPI | Exists in kpiTypes | Card | Grid col | Drawer | Calc / formula | Mock values | Notes |
|---|---|---|---|---|---|---|---|
| Breakfast | ✅ | hardcoded `7%` vs `20%` | ✅ % | — | ❌ | snapshot | Meaning of % undefined (participation rate?); values up to 267% |
| Lunch | ✅ | hardcoded | ✅ % | — | ❌ | snapshot | same |
| Snack | ✅ | hardcoded | ✅ % | — | ❌ | snapshot | same |
| Supper | ✅ | hardcoded | ✅ % | — | ❌ | snapshot | same |
| Revenue | ✅ | hardcoded $ | ✅ $ | — | ❌ | snapshot | |
| Meals | ✅ | hardcoded | ✅ count | — | ❌ | snapshot | `DASHBOARD_METRICS.meals.trend:'up'` though actual < expected |
| MEQs | ✅ | hardcoded | ✅ count | (in MPLH) | ✅ (in MPLH calc) | snapshot | |
| Eco Dis | ✅ | hardcoded | ✅ % | — | ❌ | snapshot | |
| PNA | ✅ | ✅ props | ✅ % | ✅ district + single | ✅ | 8 schools | Named "Paid Not Applied" in kpiTypes, "Participation Net Analysis" in [mockReportData.ts](../../src/data/mockReportData.ts) |
| ENP | ✅ | ✅ props | ✅ **$** | ✅ district + single | ❌ (static) | 8 schools | Card shows %, grid shows $. "Eligible Not Participating" vs "Estimated Net Participation". Data field is named `snp`. |
| MPLH | ✅ | ✅ props | ✅ (all `"0.00"` in grid) | ✅ district + single | ✅ | 5 schools | Grid MPLH column is all zeros |
| **A La Carte** | ❌ | ❌ | ❌ | — | — | only as a field (`aLaCarte` count in MPLH and ENP data) | **Gap**: not a KPI |
| **Reimbursement** | ❌ | ❌ | ❌ | — | — | **none anywhere** | **Gap** |
| Waste | ✅ | hardcoded | ✅ $ | — | ❌ | snapshot | |
| Inventory Value | ✅ | hardcoded | ✅ $ | — | ❌ | snapshot | Point-in-time metric |
| Inventory Turnover Rate | ✅ | hardcoded `"0 (365 days)"` | ✅ string | — | ❌ | string | Expected = `"Varies by site"`, a non-numeric target |
| Physical Inventory Discrepancy | ✅ | hardcoded | ✅ $ (signed) | — | ❌ | snapshot | Target is a threshold (`≤ $0.00`, `≤ 0% of Total Inventory`), not a point value |

**Verdict: Build new** `src/constants/kpiDefinitions.ts` (or extend `kpiTypes.ts`), keyed by the existing `KPIKey`. Fields: `unit` · `format` · `higherIsBetter` · `aggregation` (sum / ratio-of-sums / point-in-time / average) · `numerator`/`denominator` base facts · `description` · `targetType` (point / ≤ threshold / none). **Reuse** `KPI_SHORT_NAMES`, `KPI_LONG_NAMES` and `KPI_CHART_COLORS`, and add `A La Carte` and `Reimbursement` to them. **Reuse** the MPLH and PNA formulas by moving them into shared calc functions.

---

## 8. Benchmarks / targets

| Where | Shape | Level | School year? |
|---|---|---|---|
| [mockMPLHData.ts](../../src/data/mockMPLHData.ts) | `mplhTarget = 18.5` hardcoded in the generator and again in `calculateDistrictMPLH` | Same value for every site and the district | ❌ |
| [mockPNAData.ts](../../src/data/mockPNAData.ts) | `pnaTarget: 10.00` per row, `districtPNATarget` | Per site, but all identical | ❌ |
| [mockENPSchoolData.ts](../../src/data/mockENPSchoolData.ts) / [mockENPProgramData.ts](../../src/data/mockENPProgramData.ts) | `snpTarget: 5.00` per row, `districtENPBenchmark` | Per site, but all identical | ❌ |
| [mockDashData.ts](../../src/data/mockDashData.ts) | `DASHBOARD_METRICS.*.expected` | District only | ❌ |
| [PerformanceTrends.tsx](../../src/components/InsightsDashboard/PerformanceTrends.tsx) | `benchmark` per month in chart mock | District | ❌ |
| [InsightsPage.tsx](../../src/pages/InsightsPage.tsx) | `targetPNA = 10.00` literal | District | ❌ |

- **There is no benchmark store, model or resolver.** "Configure Benchmarks" is a no-op button.
- **There is no representation for a missing benchmark.** The closest are `inventoryValue.expected: 0` (ambiguous with a real zero target) and `inventoryTurnover.expected: "Varies by site"` (a string).

**Verdict: Build new.** Add a benchmark table in mock data, `{ kpi, schoolYear, scope: 'district'|'siteType'|'site', scopeId?, value | null, targetType }`, and a resolver `resolveBenchmark(kpi, siteIds, schoolYear) → { value | null, source }`.
- **Precedence** (to confirm): site → site type → district → `null`.
- **Multi-site scopes:** derive the target with the same aggregation as the KPI (e.g. weighted by denominator), or use the district target (open question).

---

## 9. Security (roles, permissions, site/KPI access)

**There is effectively no access control in this prototype.**

| Item | Finding | Path |
|---|---|---|
| Current user | `MOCK_CURRENT_USER.role = 'District Admin'` is **never read**. Only `userId`, `districtId` and `platform` are used, for telemetry and feedback. | [mockCurrentUser.ts](../../src/data/mockCurrentUser.ts) |
| Only role gate in the app | `const MOCK_USER_ROLE = 'customer_support'` plus `SYSTEM_SETTINGS_ROLES.includes(...)` hides the System Settings card. It's a separate, unconnected role constant. AI Config and Telemetry cards are ungated. | [SettingPage.tsx:8-9,17,42-43](../../src/pages/SettingPage.tsx#L8-L9) |
| Routes | All open: no guards, no `ProtectedRoute` | [RoutesProvider.tsx](../../src/components/Common/RoutesProvider.tsx) |
| Sidebar / user menu | Static items, no role filtering. `UserMenu` has hardcoded initials, and Sign out only `console.log`s. | [SidebarMenu.tsx](../../src/components/Common/SidebarMenu.tsx), [UserMenu.tsx](../../src/components/Common/UserMenu.tsx) |
| Site-level access | None. `DemoSchoolSelector` shows every site. | [DemoSchoolSelector.tsx](../../src/components/Common/DemoSchoolSelector.tsx) |
| KPI-level access | None | — |
| Resource catalog / permissions | None. No `canView`, `hasAccess`, `allowedSites`, `entitlement` or `permission` model. | — |
| Backend | No RLS policies or grants in `supabase/migrations`. Supabase is used only for telemetry and feedback. | [supabase/migrations/](../../supabase/migrations/) |

**Verdict: Build new**, but keep it minimal and mock-only:
- Extend `MOCK_CURRENT_USER` with `allowedSiteIds: number[] | 'ALL'` and `allowedKpis: KPIKey[] | 'ALL'` (and optionally `permissions: string[]`, e.g. `insights.compare.view`).
- Add one or two restricted demo users and a dev switcher. `UserMenu` is the natural home.
- Add a tiny `useAccess()` hook (`canViewSite`, `canViewKpi`, `canUse(resource)`) consumed by the site selector (filtered options), KPI filter, table rows, the Site Drivers drawer, exports and the Schoolie payload, so restricted data never reaches AI or exports.
- Consolidate the role constant in `SettingPage.tsx` into the same user object.

---

## 10. Copy, Download, and PDF export

| Utility | What it does | Path | Verdict for Comparison |
|---|---|---|---|
| `CopyMenu` | Dropdown with "Copy Data" and "Copy Image". Props: `{ onCopyData?, onCopyImage?, disableImageCopy? }`. The caller supplies the handlers. | [CopyMenu.tsx](../../src/components/Common/CopyMenu.tsx) | **Reuse as-is** (table and chart) |
| Copy handlers | Table → TSV via `navigator.clipboard.writeText` ([SchoolPerformanceGrid.tsx:238](../../src/components/InsightsDashboard/SchoolPerformanceGrid.tsx#L238)). Image → `html-to-image` `toBlob` → `ClipboardItem`, with full scroll size and pixel ratio 1 when height > 4000 ([:284-314](../../src/components/InsightsDashboard/SchoolPerformanceGrid.tsx#L284-L314)). The chart copy falls back to data when `ClipboardItem` is missing ([PerformanceTrends.tsx:53-92](../../src/components/InsightsDashboard/PerformanceTrends.tsx#L53-L92)). | — | **Extend**: copy-pasted per component, so extract into a `src/utils/clipboard.ts` (`copyTableAsTSV(headers, rows)`, `copyNodeAsImage(node)`) |
| `CopyButton` | Single icon button with a check-mark state. **Unused.** | [CopyButton.tsx](../../src/components/Common/CopyButton.tsx) | Optional |
| CSV | `ICSVReportData { fileName, headers, rows }` → `CSVRenderer` (BOM, escaping, Blob download). `CSVExpButton` is a menu item. `CSVFullExpButton` is a **fake** server export with timeouts. | [CSVGen/](../../src/components/Downloading/CSVGen/) | **Reuse as-is**, plus a new `CSVComparisonAdapter` |
| `ExportMenu` | Generic dropdown wrapper (`children`) | [ExportMenu.tsx](../../src/components/Downloading/ExportMenu/ExportMenu.tsx) | **Reuse as-is** |
| `DashExportMenu` | Section toggles `ExportOptions { includeKPIs, includeGrid, includeTrends }` → `onExport` | [DashExportMenu.tsx](../../src/components/Downloading/ExportMenu/DashExportMenu.tsx) | **Extend** (generic section list) or use `ExportMenu` directly |
| PDF (react-pdf) | Two contracts. `IPDFReportData` (drawer report: overview metrics + table/text sections). `IPDFDashReportData` (sections `id:'kpi'`, `type:'table'`, `id:'trend'` with base64 `chartImage`). Renderers are `PDFRenderer` and `PDFDashRenderer`. Download buttons wrap `PDFDownloadLink` and hardcode filename prefixes (`MPLH_Analysis_`, `Schoolie_Feedback_Dashboard_`). | [PDFGen/](../../src/components/Downloading/PDFGen/) | **Extend**: new `PDFComparisonAdapter` → `IPDFDashReportData`. The summary maps to `kpi` metric cards, the table to `table`, and the chart to `trend` with a `toPng` image. Make the filename a prop. A two-column "Left vs Right" header may need a small renderer addition. |
| Dashboard PDF flow | `handleDashboardExport`: `toPng(chartRef, {pixelRatio:5})` → `prepareDashboardPDFData(DASHBOARD_GRID_DATA, DASHBOARD_METRICS, options, chartImage)` → `pdf(<PDFDashRenderer/>).toBlob()` → `saveAs` → `trackInsightsEvent('DASHBOARD_DOWNLOAD')`. It is **hybrid**: native react-pdf tables and cards plus a PNG chart. The data comes from mock constants, not from what's on screen. | [InsightsPage.tsx:90-122](../../src/pages/InsightsPage.tsx#L90-L122), [PDFDashAdapter.ts](../../src/components/Downloading/PDFGen/adapters/PDFDashAdapter.ts) | **Reuse the flow**. Feed the adapter the *computed comparison state*, not the mocks. |

**Inconsistencies:** adapters hardcode the district ("Katy ISD"), user ("Johnathon") and date range ("Jul 1, 2025 - Apr 3, 2026"), and the MPLH drawer passes "Mercer County District" to Schoolie. The comparison adapters should take these from `MOCK_CURRENT_USER` and the resolved timeframes. `src/utils/reportUtils.ts` is unrelated (report-source badges).

---

## 11. Schoolie

| Item | Finding | Path |
|---|---|---|
| Drawer | `SchoolieDrawer` props: `{ isOpen, onClose, title, subtitle, promptId, sourceEntryPoint }`. It **auto-analyzes on open** (`useEffect` on `[isOpen, promptId, retryKey]`) and has a retry button. It renders HTML through `dangerouslySetInnerHTML` (unsanitized). It sits at `z-[55]/z-[60]`, `max-w-4xl` from the right. | [SchoolieDrawer.tsx](../../src/components/InsightsDashboard/SchoolieDrawer.tsx) |
| KPI AI drawer | `AIKPIDrawer` props: `{ isOpen, onClose, onBack, title, subtitle, kpiKey, kpiName, districtName, dateRange, siteName? }`. Auto-runs and renders a structured response (`summary`, `whatsWorking`, `needsAttention`, `recommendation`). | [AIKPIDrawer.tsx](../../src/components/InsightsDashboard/AIKPIDrawer.tsx) |
| How it "calls the AI" | **No real AI endpoint.** `getPromptAnalysis(promptId)` waits 1.5s and returns the prompt's static `previewOutput`. `getKPIAnalysis(kpiKey)` returns `mockAIResponses[kpiKey]`. No AI endpoint exists in `src/lib/api.ts` or `supabase/functions/`, and `.env` holds only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. | [schoolieService.ts](../../src/services/schoolieService.ts), [mockAIResponses.ts](../../src/data/mockAIResponses.ts) |
| Context passing | **None.** Only `promptId` or `kpiKey` reaches the service. `districtName`, `dateRange` and `siteName` are display-only. | same |
| Prompt config and versioning | `SchooliePrompt { id, name, version, promptText, previewOutput, updatedBy, updatedAt }`, held in module memory, seeded from [mockSchoolieData.ts](../../src/data/mockSchoolieData.ts). `savePrompt()` archives the old version and bumps `version`; nothing persists across reloads. Versions in [mockSchoolieVersions.ts](../../src/data/mockSchoolieVersions.ts) link to prompts **by `name`**, not id. The editing UI is [Settings/AI/](../../src/components/Settings/AI/) (`AIConfigDrawer`, `AIPromptEditor`, `AIPromptVersionHistory`, mock "Test"). | |
| **Comparison hooks already exist** | Prompt **`compare_sites`** (v1, placeholder text and output) at [mockSchoolieData.ts:348](../../src/data/mockSchoolieData.ts#L348). `SchoolieSourceEntryPoint` already includes **`'CompareSites'`** ([feedbackTypes.ts:9](../../src/types/feedbackTypes.ts#L9)), with display label "Compare Sites" ([feedbackHelpers.ts:25](../../src/components/Usage/feedback/feedbackHelpers.ts#L25)). Mock feedback records exist for it. | |
| Feedback | `ProductFeedback` (thumbs, reasons) → Supabase `feedback` table + telemetry. **Both AI drawers hardcode `analysisIdentifier='Schoolie'` and `sourceEntryPoint='KpiDrawer'`**, so feedback is misattributed and `promptId` isn't recorded. | [ProductFeedback.tsx](../../src/components/Feedback/ProductFeedback.tsx), [SchoolieDrawer.tsx:220-225](../../src/components/InsightsDashboard/SchoolieDrawer.tsx#L220-L225) |
| Telemetry | `ai_request_started`, `ai_response_success`, `ai_response_error` plus a performance timer, with hardcoded `promptVersion: 1` and `modelVersion: 'gpt-4o'` | both drawers |
| KPI key mismatch | `SchoolieTypes.KPIKey` uses `MPLH`, `PAID_NOT_APPLIED`, `MEAL_EQUIVALENTS`, `INV_TURNOVER`…, while `kpiTypes.KPIKey` uses `'MPLH'`, `'PNA'`, `'MEQs'`, `'Inventory Turnover Rate'`…. They are **two different `KPIKey` types with the same name.** | [SchoolieTypes.ts](../../src/types/SchoolieTypes.ts), [kpiTypes.ts](../../src/types/kpiTypes.ts) |

**Verdict: Extend.**
- Reuse `SchoolieDrawer` with `promptId: 'compare_sites'` (or a new `performance_comparison` prompt) and `sourceEntryPoint: 'CompareSites'`.
- Widen `getPromptAnalysis(promptId, context?)` to accept a serialized comparison payload: both scopes, timeframes, labels, KPI rows, targets, statuses and partial-period flags, filtered by access.
- Have the mock return a comparison-specific canned response.
- Pass `promptId`, `sourceEntryPoint` and `promptVersion` through to `ProductFeedback` and telemetry instead of the hardcoded values.
- Enrich the `compare_sites` prompt text so it shows meaningfully in AI Config.

---

## 12. Mock data

### Inventory (Insights-relevant)

| Dataset | Path | Shape | Date range | Granularity | # Sites | Site types | KPIs covered |
|---|---|---|---|---|---|---|---|
| `DASHBOARD_METRICS` | [mockDashData.ts:7](../../src/data/mockDashData.ts#L7) | `{ [kpi]: { actual, expected, trend? } }`, numbers or strings | none | single snapshot | district only | — | 15 (all current KPIs) |
| `DASHBOARD_GRID_DATA` | [mockDashData.ts:25](../../src/data/mockDashData.ts#L25) | `{ school, ecoDis, meals, …, pna, enp }[]`, numeric (turnover is a string) | none | snapshot | 20 | implied by name (incl. CENTRAL OFFICE, child care) | 15. Used for PDF only. Many all-zero rows. |
| `PERFORMANCE_DATA` (inline) | [SchoolPerformanceGrid.tsx:73](../../src/components/InsightsDashboard/SchoolPerformanceGrid.tsx#L73) | same keys, **preformatted strings** | none ("Current Month" label) | snapshot | ~100 | implied by name | 15 (MPLH all `"0.00"`) |
| `generateMockMPLHData()` | [mockMPLHData.ts](../../src/data/mockMPLHData.ts) | `SchoolMPLHData[]`: B/L/Snack/ALC/Other counts, laborHours, derived MEQ/MPLH/target/delta | none (UI says Jul 1 2025 – Apr 3 2026) | snapshot | 5 | E/M/H string union | MPLH, MEQs, partial meal counts, ALC count |
| `mockPNAData` | [mockPNAData.ts](../../src/data/mockPNAData.ts) | `{ school, siteType, students, paid, pna, pnaTarget, pnaDelta }[]` | none | snapshot | 8 | E/M/H | PNA |
| `mockSchoolENPData` | [mockENPSchoolData.ts](../../src/data/mockENPSchoolData.ts) | `SchoolENPData[]`: enrollment, `snp`, target, eligibility × meal-type matrix | none | snapshot | 8 | E/M/H | ENP, eligibility counts by meal type (incl. ALC, adult) |
| `programByEligibilityData` + district constants | [mockENPProgramData.ts](../../src/data/mockENPProgramData.ts) | `ProgramByEligibility[]`, `districtENPActual/Benchmark`, enrollment | none | snapshot | district | — | ENP |
| `MOCK_CHART_DATA` (inline) | [PerformanceTrends.tsx:21](../../src/components/InsightsDashboard/PerformanceTrends.tsx#L21) | `{ name: "Jul 2024", value, benchmark }[]` | Jul 2024 – Jun 2025 | monthly | district | — | one unnamed series |
| `DEMO_SITES` (inline) | [DemoSchoolSelector.tsx:5](../../src/components/Common/DemoSchoolSelector.tsx#L5) | `{ siteTypeList[], siteList[] }` with numeric IDs | — | — | 3 | 5 types | — |
| `MOCK_CURRENT_USER` | [mockCurrentUser.ts](../../src/data/mockCurrentUser.ts) | `{ userId, districtId, districtName, userName, platform, role: 'District Admin' }` | — | — | — | — | No site or KPI access fields |
| `mockReportData` | [mockReportData.ts](../../src/data/mockReportData.ts) | Report catalog entries (Insights KPIs as reports) | — | — | — | — | metadata only |
| `mockAIResponses`, `mockSchoolieData`, `mockSchoolieVersions` | [src/data/](../../src/data/) | See §11 | | | | | |

Not relevant to KPIs: `mockAppUsageData`, `mockInsightsUsageData`, `mockMenuUsageData`, `mockReportUsageData`, `mockSchoolieUsageData`, `mockFeedbackData`, `mockTelemetryData`, `mockReportHistoryData`, `mockSystemSettingsData`, `report_response.json` (student roster payload). These are telemetry and usage datasets. They do have timestamps, but they don't contain KPI facts.

### Gap analysis against requirement 12

| Requirement | Status | Evidence |
|---|---|---|
| ≥ 2 full school years per site | ❌ **Missing** | No KPI dataset has dates |
| Granular enough for Day/Week/Month/Quarter | ❌ **Missing** | Only one monthly district series (12 points, one unnamed KPI) |
| Site-level benchmarks differing by site and by SY | ❌ **Missing** | All per-site targets are identical; no SY key |
| KPIs with no benchmark configured | ⚠️ **Ambiguous** | Only `"Varies by site"` (string) and `expected: 0`; no `null` convention |
| "No Data" distinct from a legitimate zero | ❌ **Missing** | Inactive sites are rows of `0` (e.g. Cheria, Corfu, Kula); MPLH grid is all `"0.00"` |
| A partial current period | ❌ **Missing** | No dates, and the "today" anchor itself is inconsistent |
| Mock user with restricted site and/or KPI access | ❌ **Missing** | Single `District Admin` user, no access fields (details in §9) |
| A La Carte and Reimbursement as KPIs | ❌ **Missing** | Reimbursement has no data at all |
| Consistent site identity across datasets | ❌ **Missing** | 4 unrelated site lists (3 / 20 / ~100 / 5–8) |

### Recommended plan to close gaps by extending the existing mock data

The goal is one source of truth that the existing dashboard pieces can gradually adopt. There should be no parallel "comparison dataset".

1. **Canonical site registry.** Promote `DEMO_SITES` out of `DemoSchoolSelector` into `src/data/` and keep its `{ siteTypeList, siteList }` shape so the selector keeps working. Grow it to roughly 15–20 sites:
   - Reuse names that already appear in the MPLH, PNA and ENP datasets (Lincoln Elementary, Washington Middle, Roosevelt High, Jefferson Elementary, Madison/Adams/Monroe/Jackson…) so the drawers line up.
   - Include several Elementary, Middle and High sites, plus Central Office.
   - Have the existing MPLH, PNA and ENP mocks reference sites by `siteId`.
2. **Daily base-fact generator, added to `mockDashData.ts`.** Use a deterministic seeded PRNG. It should produce **daily per-site base facts**, not KPIs:
   - Meal counts by type (B/L/Snack/Supper/ALC/adult), enrollment, eligibility counts, paid-not-applied counts
   - Labor hours, revenue, reimbursement $, waste $
   - Inventory snapshots: value, COGS, physical count variance
   - Range: **SY 2024-25 and SY 2025-26 full, plus SY 2026-27 partial** up to `DEMO_AS_OF_DATE`
   - School days only, with weekends and breaks as **`null` (No Data)**
   - Built-in scenarios: one site opening mid-SY 2025-26 (pre-open = `null`), one site with a real **zero** (e.g. Supper = 0 served), and visible year-over-year shifts so Improved, Comparable and Declined all appear

   This is roughly 20 sites × ~450 school days, generated in memory, so file size isn't a concern. KPIs are then derived through the shared calc functions from §7, with aggregation by ratio-of-sums.
3. **Benchmarks table.** Extend the existing target constants into the `{kpi, schoolYear, scope, scopeId, value|null}` table from §8:
   - District values carry forward the current constants (MPLH 18.5, PNA 10, ENP 5, `DASHBOARD_METRICS.expected`).
   - Add site- and site-type overrides that **differ per SY**.
   - Deliberately leave some KPIs with **no benchmark** (Inventory Turnover Rate, A La Carte, and one KPI missing only for SY 2024-25).
4. **Current user and access.** Extend `MOCK_CURRENT_USER` with `allowedSiteIds` (or `'ALL'`) and `allowedKpis` (or `'ALL'`). Add one or two alternate restricted users and a dev-only switcher, building on whatever `UserMenu` exposes (see §9).
5. **Back-compat.** Keep `DASHBOARD_METRICS`, `DASHBOARD_GRID_DATA`, `generateMockMPLHData` and `mockPNAData` exported and unchanged in phase 1, so nothing on the dashboard regresses. Optionally re-derive them from the generator later. **Accept that dashboard and comparison numbers won't reconcile until then** (see Risks).
6. **Single date anchor.** Add `DEMO_AS_OF_DATE` and use it in the generator, `TimeframeSelector` descriptions and drawer `dateRange` defaults.

---

## Risks, inconsistencies, open questions

### Risks / inconsistencies found
1. **"Reuse the default interval logic" can't be satisfied from this repo.** It doesn't exist. See §6.
2. **Dashboard vs Comparison numbers will disagree** until the dashboard reads from the same generator. A user who compares "All Schools / YTD" against the dashboard will see different values.
3. **Site lists don't match** across the selector, grid, PDF data and drawers. Drill-ins from the comparison (Site Drivers → single-school drawer) need a shared site ID.
4. **ENP is shown as % on the card and $ in the grid.** PNA and ENP have conflicting long names across files.
5. **Ratio KPIs must aggregate as ratio-of-sums** across sites and intervals, never as an average of site ratios. MPLH already does this correctly; it must hold for all ratio KPIs.
6. **Inventory KPIs are point-in-time.** Aggregating over a timeframe needs a rule (end-of-period vs average). Turnover needs COGS / average inventory, which no data supports today.
7. **Physical Inventory Discrepancy's target is a threshold** (`≤ 0`). Its "change" and "status" semantics differ from point targets.
8. **Hardcoded colors** in `KPISummary`, `PerformanceTrends` and the grid bypass the user-configurable favorable/unfavorable tokens. The new page should use the tokens, so it may not visually match those older components.
9. **No-op `animate-in` classes** (plugin not installed). They're cosmetic, but don't rely on them for the overlay transition.
10. **The header selectors are uncontrolled.** Making them controlled touches the dashboard header; that change is low-risk but not zero.
11. **Z-index layering** across the overlay (`z-50`), Site Drivers drawer, Schoolie (`z-[60]`) and header dropdowns (`z-[100]`) needs to be planned.
12. **There is no test runner.** Comparison math (ratio-of-sums, status classification, benchmark resolution, timeframe and partial-period resolution, default interval) is pure logic that deserves unit tests. Adding Vitest is a small, isolated dev dependency, but it's your call.
13. **Two incompatible `KPIKey` types** exist (`src/types/kpiTypes.ts` vs `src/types/SchoolieTypes.ts`). The comparison needs a mapping, or a consolidation.
14. **Schoolie renders unsanitized HTML** (`dangerouslySetInnerHTML`). That's fine for static mocks, but it becomes a risk once real model output or user-influenced context flows through.
15. **There are no real security primitives.** Anything the spec says about site- and KPI-level access will be mock-enforced on the client only.

### Open questions for you
1. **Default interval rule:** is there a spec (or code in another repo) for NXT-74485's default interval? If not, what thresholds should we use, and are Quarters school-year or calendar quarters?
2. **School year boundaries:** is a Jul 1 – Jun 30 SY start correct (implied by `Jul 1, 2025` defaults)? Is it district-configurable?
3. **Demo "today":** should the prototype anchor to Apr 16, 2026 (selector), Apr 3, 2026 (drawers/README), or the real current date?
4. **"Comparable" threshold:** is it a fixed % band (e.g. ±2%)? Per KPI? Absolute for percentage KPIs?
5. **Partial periods:** when one side is partial (e.g. SY 2026-27 to date vs full SY 2025-26), should counts and $ be normalized (per serving day) or flagged only?
6. **Benchmark for multi-site scopes:** use the district target, a weighted blend of site targets, or a site-type target?
7. **Benchmark precedence:** site → site type → district → none. Correct?
8. **A La Carte and Reimbursement definitions:** A La Carte as a count, $ or % of revenue? Reimbursement as $ claimed or $ per meal? What is the favorable direction for each?
9. **Breakfast/Lunch/Snack/Supper %:** participation rate against which denominator (ADA, enrollment, eligible)? The grid shows values over 100%.
10. **ENP:** % (card/drawer) or $ (grid)?
11. **Restricted users:** should KPIs the user can't access be hidden or shown locked? Should sites outside their scope be absent from the selector, or present but disabled?
12. **Schoolie prompt:** should we reuse the existing `compare_sites` prompt and `CompareSites` entry point, or register a new `performance_comparison` prompt (the existing one is framed as site-vs-site, not dataset-vs-dataset)?
13. **Tests:** may I add Vitest as a dev dependency for the pure calculation and timeframe utilities?
14. **Mock data consolidation:** OK to promote `DEMO_SITES` into `src/data/` and expand it, which also changes what the dashboard selector shows?

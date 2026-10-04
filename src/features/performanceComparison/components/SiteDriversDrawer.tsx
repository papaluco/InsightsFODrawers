import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeftRight, ChevronDown, ChevronUp, ChevronsUpDown, Loader2, School, X } from 'lucide-react';
import { useCloseOnEscape } from '../../../components/Common/useFloatingDropdown';
import { getKpiDefinition } from '../../../constants/kpiDefinitions';
import { ComparisonKpiKey } from '../../../types/kpiTypes';
import type { MatchedSiteResult, SiteDriversResult, SiteDriversSide, SiteTargetEvaluation } from '../engine/siteDrivers';
import type { ComparisonView } from '../hooks/useComparison';
import { useSideShortNames } from '../hooks/useSideShortNames';
import { getTargetStatusDisplay } from '../ui/comparisonDisplay';
import {
  getSideAttainmentText,
  nextSiteSort,
  SiteSort,
  SiteSortKey,
  sortMatchedSites,
  sortSiteEvaluations,
} from '../ui/siteDriversView';
import { ClassificationBadge } from './ClassificationBadge';
import { TargetStatusIndicator } from './TargetStatusIndicator';

const TH = 'px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-bottom';
const TD = 'px-3 py-2.5 align-top text-sm';

// ─── Table pieces ────────────────────────────────────────────────────────────

interface SortHeaderProps {
  label: React.ReactNode;
  sortKey: SiteSortKey;
  sort: SiteSort | null;
  onSort: (key: SiteSortKey) => void;
}

/** Sortable column header (spec §8 "Sortable columns"). */
const SortHeader: React.FC<SortHeaderProps> = ({ label, sortKey, sort, onSort }) => {
  const active = sort?.key === sortKey;
  const Icon = !active ? ChevronsUpDown : sort.direction === 'asc' ? ChevronUp : ChevronDown;
  return (
    <th className={TH} aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-end gap-1 text-left uppercase tracking-wider rounded hover:text-gray-800 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {label}
        <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-indigo-600' : 'text-gray-300'}`} aria-hidden="true" />
      </button>
    </th>
  );
};

/** Side names are proper names, so they keep their case inside uppercase headers. */
const SideName: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="normal-case tracking-normal">{children}</span>;

const ActualText: React.FC<{ site: SiteTargetEvaluation }> = ({ site }) => (
  <span className={site.hasData ? 'font-semibold text-gray-900' : 'italic text-gray-400'}>{site.actualFormatted}</span>
);

/** Section header: title, per-side summary, and a way back to the default order once a column is sorted. */
const SectionHeader: React.FC<{ title: React.ReactNode; summaries: React.ReactNode; sorted: boolean; onResetSort: () => void }> = ({
  title,
  summaries,
  sorted,
  onResetSort,
}) => (
  <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
    <div className="min-w-0">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <div className="mt-0.5 text-xs text-gray-500">{summaries}</div>
    </div>
    {sorted && (
      <button type="button" onClick={onResetSort} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
        Default order
      </button>
    )}
  </div>
);

const useSiteSort = () => {
  const [sort, setSort] = useState<SiteSort | null>(null);
  return { sort, onSort: (key: SiteSortKey) => setSort(current => nextSiteSort(current, key)), resetSort: () => setSort(null) };
};

// ─── Matched populations ─────────────────────────────────────────────────────

/**
 * Both sides' targets, or one when they're the same (spec §8 "each side's target where they
 * differ"). Differing targets read left → right, in column order ("55% → 58%"); the title names
 * each side.
 */
const MatchedTargetCell: React.FC<{ site: MatchedSiteResult; sideShortNames: [string, string] }> = ({ site, sideShortNames }) => {
  if (site.left.targetFormatted === site.right.targetFormatted) {
    return <td className={`${TD} whitespace-nowrap text-gray-700`}>{site.right.targetFormatted}</td>;
  }
  return (
    <td
      className={`${TD} whitespace-nowrap text-gray-700`}
      title={`${sideShortNames[0]}: ${site.left.targetFormatted} · ${sideShortNames[1]}: ${site.right.targetFormatted}`}
    >
      {site.left.targetFormatted} <span className="text-gray-400">→</span> {site.right.targetFormatted}
    </td>
  );
};

/** Classification · target status (left → right), all from the site's engine result. */
const MatchedStatusCell: React.FC<{ site: MatchedSiteResult }> = ({ site }) => {
  const left = getTargetStatusDisplay(site.result.left, false);
  const right = getTargetStatusDisplay(site.result.right, false);
  const sameNone = left.tone === 'none' && right.tone === 'none' && left.text === right.text;
  return (
    <td className={TD}>
      <div className="flex flex-col items-start gap-1">
        <ClassificationBadge result={site.result} />
        <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap text-xs">
          {sameNone ? (
            <TargetStatusIndicator display={right} />
          ) : (
            <>
              <TargetStatusIndicator display={left} />
              <span className="text-gray-400" aria-label="then">→</span>
              <TargetStatusIndicator display={right} />
            </>
          )}
        </span>
      </div>
    </td>
  );
};

interface MatchedSitesTableProps {
  drivers: SiteDriversResult;
  sideShortNames: [string, string];
  /** The shared site scope, e.g. "High Schools". */
  siteLabel: string;
}

/** Identical site sets: one row per site with both sides side by side (spec §8 Matched). */
const MatchedSitesTable: React.FC<MatchedSitesTableProps> = ({ drivers, sideShortNames, siteLabel }) => {
  const { sort, onSort, resetSort } = useSiteSort();
  const isInformational = getKpiDefinition(drivers.kpi).kind === 'informational';
  const sites = sortMatchedSites(drivers.matchedSites ?? [], sort);
  const showTarget = !isInformational || sites.some(s => s.left.target !== null || s.right.target !== null);
  const [leftName, rightName] = sideShortNames;

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <SectionHeader
        title={`${siteLabel} · ${sites.length} sites`}
        sorted={sort !== null}
        onResetSort={resetSort}
        summaries={
          <>
            <div>
              {leftName}: {getSideAttainmentText(drivers, drivers.left)}
            </div>
            <div>
              {rightName}: {getSideAttainmentText(drivers, drivers.right)}
            </div>
          </>
        }
      />
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortHeader label="Site" sortKey="site" sort={sort} onSort={onSort} />
              <SortHeader label={<SideName>{leftName}</SideName>} sortKey="leftActual" sort={sort} onSort={onSort} />
              <SortHeader label={<SideName>{rightName}</SideName>} sortKey="rightActual" sort={sort} onSort={onSort} />
              <SortHeader label="Change" sortKey="change" sort={sort} onSort={onSort} />
              {showTarget && <SortHeader label={isInformational ? 'Context' : 'Target'} sortKey="target" sort={sort} onSort={onSort} />}
              {!isInformational && (
                <SortHeader
                  label={
                    <span className="text-left">
                      Variance from target
                      <span className="block normal-case tracking-normal font-normal">{rightName}</span>
                    </span>
                  }
                  sortKey="variance"
                  sort={sort}
                  onSort={onSort}
                />
              )}
              {!isInformational && <SortHeader label="Status" sortKey="status" sort={sort} onSort={onSort} />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sites.map(site => (
              <tr key={site.siteId}>
                <td className={`${TD} whitespace-nowrap font-medium text-gray-900`}>{site.siteName}</td>
                <td className={`${TD} whitespace-nowrap`}>
                  <ActualText site={site.left} />
                </td>
                <td className={`${TD} whitespace-nowrap`}>
                  <ActualText site={site.right} />
                </td>
                <td className={`${TD} whitespace-nowrap text-gray-800`}>{site.result.deltaFormatted ?? '—'}</td>
                {showTarget && <MatchedTargetCell site={site} sideShortNames={sideShortNames} />}
                {!isInformational && <td className={`${TD} whitespace-nowrap text-gray-800`}>{site.right.varianceFormatted ?? '—'}</td>}
                {!isInformational && <MatchedStatusCell site={site} />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// ─── Unmatched populations ───────────────────────────────────────────────────

interface SideSitesTableProps {
  drivers: SiteDriversResult;
  side: SiteDriversSide;
}

/** One side's sites, listed independently and headed by its generated label (spec §8 Unmatched). */
const SideSitesTable: React.FC<SideSitesTableProps> = ({ drivers, side }) => {
  const { sort, onSort, resetSort } = useSiteSort();
  const isInformational = getKpiDefinition(drivers.kpi).kind === 'informational';
  const sites = sortSiteEvaluations(side.sites, sort);
  const showTarget = !isInformational || sites.some(s => s.target !== null);

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <SectionHeader title={side.label} summaries={getSideAttainmentText(drivers, side)} sorted={sort !== null} onResetSort={resetSort} />
      <div className="overflow-x-auto">
        <table className="min-w-[560px] w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortHeader label="Site" sortKey="site" sort={sort} onSort={onSort} />
              <SortHeader label="Actual" sortKey="actual" sort={sort} onSort={onSort} />
              {showTarget && <SortHeader label={isInformational ? 'Context' : 'Target'} sortKey="target" sort={sort} onSort={onSort} />}
              {!isInformational && <SortHeader label="Target Status" sortKey="status" sort={sort} onSort={onSort} />}
              {!isInformational && <SortHeader label="Variance from target" sortKey="variance" sort={sort} onSort={onSort} />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sites.map(site => (
              <tr key={site.siteId}>
                <td className={`${TD} whitespace-nowrap font-medium text-gray-900`}>{site.siteName}</td>
                <td className={`${TD} whitespace-nowrap`}>
                  <ActualText site={site} />
                </td>
                {showTarget && <td className={`${TD} whitespace-nowrap text-gray-700`}>{site.targetFormatted}</td>}
                {!isInformational && (
                  <td className={TD}>
                    <TargetStatusIndicator display={getTargetStatusDisplay(site, false)} />
                  </td>
                )}
                {!isInformational && <td className={`${TD} whitespace-nowrap text-gray-800`}>{site.varianceFormatted ?? '—'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// ─── Drawer ──────────────────────────────────────────────────────────────────

interface SiteDriversDrawerProps {
  /** KPI whose sites are shown; null = closed. */
  kpi: ComparisonKpiKey | null;
  comparison: ComparisonView;
  onClose: () => void;
  /** Swap sides from inside the drawer; the drawer refreshes in place. */
  onSwap: () => void;
}

/**
 * Site Drivers drawer (NXT-77212, spec §8): the KPI drawer pattern (one step wider, max-w-5xl,
 * so the matched table's seven columns fit without scrolling on desktop), portaled to the body at
 * z-[55] so it sits above the comparison overlay (z-50) and below Schoolie (z-[60]) — spec §12.
 *
 * It reads the engine's siteDrivers result for the KPI on every render, so it refreshes in place
 * when the comparison changes while open. The parent closes it when no side has more than one site.
 */
export const SiteDriversDrawer: React.FC<SiteDriversDrawerProps> = ({ kpi, comparison, onClose, onSwap }) => {
  const isOpen = kpi !== null;
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const sideShortNames = useSideShortNames(comparison);

  // Keep showing the last KPI while the drawer slides out.
  const [shownKpi, setShownKpi] = useState<ComparisonKpiKey | null>(kpi);
  useEffect(() => {
    if (kpi) setShownKpi(kpi);
  }, [kpi]);

  // Escape closes this drawer before the overlay sees it (capture phase, like the dropdowns).
  useCloseOnEscape(isOpen, onClose);

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  const displayKpi = kpi ?? shownKpi;
  const { results, isLoading } = comparison;
  const drivers = displayKpi && results ? results.siteDrivers[displayKpi] : null;
  const kpiName = displayKpi ? getKpiDefinition(displayKpi).name : '';

  return createPortal(
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[55] bg-black/30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 right-0 z-[55] w-full max-w-5xl bg-white shadow-2xl flex flex-col transition-[transform,visibility] duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 visible' : 'translate-x-full invisible'
        }`}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 hidden sm:flex items-center justify-center shrink-0">
              <School size={20} className="text-indigo-600" />
            </div>
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-semibold text-gray-900">
                {kpiName} <span className="font-normal text-gray-500">· Site Drivers</span>
              </h2>
              {results && (
                <p className="text-sm text-gray-600">
                  {results.leftLabel} <span className="text-gray-400">vs</span> {results.rightLabel}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isLoading && (
              <span className="inline-flex items-center gap-1.5 mr-1 text-xs font-medium text-gray-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                Updating…
              </span>
            )}
            <button
              type="button"
              onClick={onSwap}
              title="Swap sides"
              aria-label="Swap sides"
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <ArrowLeftRight size={18} />
            </button>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              title="Close"
              aria-label="Close Site Drivers"
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={`flex-1 overflow-y-auto bg-gray-50 px-4 sm:px-6 py-5 transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
          {drivers && (
            // Keyed by KPI so column sorting starts from the default order for each KPI.
            <div key={drivers.kpi} className="flex flex-col gap-5">
              {drivers.matched ? (
                <MatchedSitesTable drivers={drivers} sideShortNames={sideShortNames} siteLabel={comparison.right.dataset?.siteLabel ?? 'Sites'} />
              ) : (
                <>
                  <SideSitesTable drivers={drivers} side={drivers.left} />
                  <SideSitesTable drivers={drivers} side={drivers.right} />
                </>
              )}
              <p className="text-xs italic text-gray-500">
                {getKpiDefinition(drivers.kpi).kind === 'informational'
                  ? 'Inventory KPIs are informational, so sites are not evaluated against a target.'
                  : `Each site is measured against its own target. Sites furthest outside their target are listed first${
                      drivers.matched ? ` (based on ${sideShortNames[1]})` : ''
                    }, then sites with no target, then sites with No Data. Select a column header to sort.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
};

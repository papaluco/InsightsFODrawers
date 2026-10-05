import React, { useMemo } from 'react';
import { FileImage, FileSpreadsheet, FileText } from 'lucide-react';
import { CopyMenu } from '../../../components/Common/CopyMenu';
import { useToast } from '../../../components/Common/toastContext';
import { CSVRenderer } from '../../../components/Downloading/CSVGen/CSVRenderer';
import { ExportMenu } from '../../../components/Downloading/ExportMenu/ExportMenu';
import type { ComparisonResults } from '../selectors/selectComparison';
import { trackComparisonEvent } from '../telemetry';
import { buildKpiTableExport, toKpiTableCsvData, toTsv } from '../ui/kpiTableExport';

/**
 * Copy and Download controls (NXT-77213, spec §10). In the prototype only the KPI table's
 * Copy data (TSV) and Download CSV are real. Trend exports and the page PDF show the controls
 * and a "not implemented" toast; production's existing implementation provides the behavior.
 */

const NOT_IMPLEMENTED_MESSAGE = 'Not implemented in prototype.';

interface ExportMenuActionProps {
  icon: React.ReactNode;
  title: string;
  subtext: string;
  onSelect: () => void;
}

/** ExportMenu item with the same look as CSVExpButton / PDFExpButton. */
const ExportMenuAction: React.FC<ExportMenuActionProps> = ({ icon, title, subtext, onSelect }) => (
  <button type="button" onClick={onSelect} className="w-full flex items-center px-4 py-3 text-sm transition-colors text-slate-700 hover:bg-indigo-50 group">
    <span className="mr-3 flex-shrink-0">{icon}</span>
    <span className="flex flex-col text-left min-w-0">
      <span className="font-bold whitespace-nowrap text-slate-700">{title}</span>
      <span className="text-[10px] text-slate-400">{subtext}</span>
    </span>
  </button>
);

interface KpiTableExportControlsProps {
  results: ComparisonResults;
  sideShortNames: [string, string];
}

/**
 * KPI Comparison title row: one Copy menu, as on the Insights Dashboard's grid and trend, with
 * Copy Data (TSV) and Download CSV of exactly the rows in scope.
 */
export const KpiTableExportControls: React.FC<KpiTableExportControlsProps> = ({ results, sideShortNames }) => {
  const { showToast } = useToast();
  const table = useMemo(
    () =>
      buildKpiTableExport({
        results: results.results,
        leftLabel: results.leftLabel,
        rightLabel: results.rightLabel,
        sideShortNames,
        siteDrivers: results.siteDrivers,
      }),
    [results, sideShortNames],
  );
  const kpiCount = table.rows.length;
  const kpiCountText = `${kpiCount} KPI${kpiCount === 1 ? '' : 's'}`;

  const handleCopyData = async () => {
    try {
      await navigator.clipboard.writeText(toTsv(table));
      showToast(`Copied ${kpiCountText} to the clipboard.`, 'success');
      trackComparisonEvent('COMPARISON_EXPORTED', { format: 'TSV' });
    } catch {
      showToast('Could not copy to the clipboard.');
    }
  };

  const handleDownloadCsv = () => {
    // Built on click, so the filename has the date of the download (spec §10).
    CSVRenderer(toKpiTableCsvData(table, new Date()));
    trackComparisonEvent('COMPARISON_EXPORTED', { format: 'CSV' });
  };

  return (
    <CopyMenu onCopyData={handleCopyData} closeOnEscape title="Copy or download">
      <ExportMenuAction
        icon={<FileSpreadsheet size={18} className="text-emerald-600 group-hover:text-emerald-700" />}
        title="Download CSV"
        subtext={`KPI table as shown (${kpiCountText})`}
        onSelect={handleDownloadCsv}
      />
    </CopyMenu>
  );
};

interface TrendExportControlsProps {
  /** Why the trend can't be exported (no KPI focused, trend unavailable); null when it can. */
  disabledReason: string | null;
}

/** Performance Trend title row: one Copy menu, UI only in the prototype (spec §10). */
export const TrendExportControls: React.FC<TrendExportControlsProps> = ({ disabledReason }) => {
  const { showToast } = useToast();
  const notImplemented = () => showToast(NOT_IMPLEMENTED_MESSAGE);

  return (
    <CopyMenu
      onCopyData={notImplemented}
      onCopyImage={notImplemented}
      closeOnEscape
      title="Copy or download"
      disabled={disabledReason !== null}
      disabledReason={disabledReason ?? undefined}
    >
      <ExportMenuAction
        icon={<FileSpreadsheet size={18} className="text-emerald-600 group-hover:text-emerald-700" />}
        title="Download CSV"
        subtext="Trend data for the focused KPI"
        onSelect={notImplemented}
      />
      <ExportMenuAction
        icon={<FileImage size={18} className="text-indigo-500" />}
        title="Download PNG"
        subtext="Image of the trend chart"
        onSelect={notImplemented}
      />
    </CopyMenu>
  );
};

/** Why the header Download is disabled; matches the Schoolie action's wording. */
const PAGE_DOWNLOAD_DISABLED_REASON = 'Set both sides to download this comparison';

/** Overlay header Download: page PDF, UI only in the prototype (spec §10). Disabled until both sides are set. */
export const PageDownloadMenu: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  const { showToast } = useToast();
  return (
    <ExportMenu title="Download" closeOnEscape disabled={disabled} disabledReason={PAGE_DOWNLOAD_DISABLED_REASON}>
      <ExportMenuAction
        icon={<FileText size={18} className="text-indigo-500" />}
        title="Download PDF"
        subtext="Summary, KPI table, and trend"
        onSelect={() => showToast(NOT_IMPLEMENTED_MESSAGE)}
      />
    </ExportMenu>
  );
};

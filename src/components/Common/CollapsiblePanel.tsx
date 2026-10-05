import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsiblePanelProps {
  title: string;
  /** Optional element right after the title (e.g. an info icon). Always shown, and never toggles the panel. */
  titleAddon?: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  /** Controls on the right of the title row, shown only while expanded (as in MPLHSchoolTable). */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Card with a collapsible title row. Extracted from the MPLH Details drawer's section
 * pattern (MPLHSchoolTable, MPLHSiteTypeSummary): same title styling, a ChevronDown that
 * rotates to point right when collapsed, and actions that hide with the content.
 * Controlled, so the parent decides where expand state lives.
 */
export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  titleAddon,
  isExpanded,
  onToggle,
  actions,
  children,
  className = '',
}) => {
  const contentId = useId();

  return (
    <section aria-label={title} className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
            aria-controls={isExpanded ? contentId : undefined}
            className="flex items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 rounded"
          >
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
          </button>
          {titleAddon}
        </div>
        {isExpanded && actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>

      {isExpanded && (
        <div id={contentId} className="mt-4">
          {children}
        </div>
      )}
    </section>
  );
};

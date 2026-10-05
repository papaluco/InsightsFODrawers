import { ChevronDown, ChevronUp } from 'lucide-react';

export interface SortIconConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Sort indicator for a table header, from MPLHSchoolTable: one chevron on the active sort
 * column (up = ascending, down = descending) and an empty placeholder of the same size on the
 * others, so headers don't shift when the sort changes.
 */
export const SortIcon = ({ column, config }: { column: string; config: SortIconConfig | null }) => {
  if (config?.key !== column) return <div className="w-4 h-4 opacity-0" />;
  return config.direction === 'asc'
    ? <ChevronUp className="w-4 h-4 text-blue-600" />
    : <ChevronDown className="w-4 h-4 text-blue-600" />;
};

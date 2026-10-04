import React from 'react';
import { CheckCircle2, MinusCircle, XCircle } from 'lucide-react';
import type { TargetStatusDisplay, TargetStatusTone } from '../ui/comparisonDisplay';

/** Icon per target status tone, so status is never shown by color alone (spec §12). */
const TARGET_STATUS_ICON: Record<TargetStatusTone, React.ReactNode> = {
  met: <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-insightsFavorable" aria-hidden="true" />,
  notMet: <XCircle className="w-3.5 h-3.5 shrink-0 text-insightsUnfavorable" aria-hidden="true" />,
  none: <MinusCircle className="w-3.5 h-3.5 shrink-0 text-gray-300" aria-hidden="true" />,
};

export const TargetStatusIcon: React.FC<{ tone: TargetStatusTone }> = ({ tone }) => <>{TARGET_STATUS_ICON[tone]}</>;

/** Status text ("Met", "Not Met", "No target", "No Data") styled by tone. Never splits across lines. */
export const TargetStatusText: React.FC<{ display: TargetStatusDisplay }> = ({ display }) => (
  <span className={`whitespace-nowrap ${display.tone === 'none' ? 'text-gray-500' : 'font-semibold text-gray-800'}`}>{display.text}</span>
);

/** Icon plus status text, inline. */
export const TargetStatusIndicator: React.FC<{ display: TargetStatusDisplay }> = ({ display }) => (
  <span className="inline-flex items-center gap-1.5 text-xs">
    <TargetStatusIcon tone={display.tone} />
    <TargetStatusText display={display} />
  </span>
);

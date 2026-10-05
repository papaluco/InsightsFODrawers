import React, { useId } from 'react';
import { Info } from 'lucide-react';

interface InfoTipProps {
  /** Text shown on hover or keyboard focus. */
  text: string;
  /** Accessible name of the icon, e.g. "About materiality". */
  label: string;
}

/**
 * Small info icon whose explanation appears on hover or keyboard focus. The text is always in
 * the DOM (aria-describedby), so screen readers get it without hovering.
 */
export const InfoTip: React.FC<InfoTipProps> = ({ text, label }) => {
  const tooltipId = useId();
  return (
    <span
      tabIndex={0}
      role="img"
      aria-label={label}
      aria-describedby={tooltipId}
      className="group relative inline-flex rounded-full text-gray-400 hover:text-indigo-600 focus-visible:text-indigo-600 outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
    >
      <Info className="w-4 h-4" aria-hidden="true" />
      <span
        id={tooltipId}
        role="tooltip"
        className="invisible group-hover:visible group-focus-visible:visible absolute left-0 top-full mt-2 z-30 w-80 max-w-[80vw] rounded-md bg-gray-900 px-3 py-2 text-xs font-normal normal-case tracking-normal leading-snug text-white shadow-lg"
      >
        {text}
      </span>
    </span>
  );
};

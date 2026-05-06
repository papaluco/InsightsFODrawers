import React, { useState } from 'react';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

interface TermDef {
  term: string;
  definition: string;
  calculation?: string;
}

const TERMS: TermDef[] = [
  {
    term: 'Available Sessions',
    definition: 'Number of sessions where a KPI could be displayed based on permissions and licensing.',
  },
  {
    term: 'Rendered Sessions',
    definition: 'Number of sessions where a KPI was actually shown to the user.',
  },
  {
    term: 'Visibility %',
    definition: 'Measures whether users choose to show a KPI.',
    calculation: 'Rendered ÷ Available',
  },
  {
    term: 'Hidden %',
    definition: 'Measures how often users hide a KPI.',
    calculation: '1 − Visibility %',
  },
  {
    term: 'Usage %',
    definition: 'Measures how often users click on a KPI or interact with it in the drawer.',
    calculation: 'Sessions where KPI drawer was opened or KPI was selected in trend chart ÷ Sessions where KPI was rendered',
  },
  {
    term: 'Never Opened %',
    definition: '% of sessions where a KPI was shown but never interacted with.',
  },
  {
    term: 'KPI Depth',
    definition: 'Number of unique KPIs a user opens during a session.',
  },
  {
    term: 'Co-Usage',
    definition: 'Measures which KPIs are used together within the same session.',
  },
];

const InsightsKPIAbout: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">About</span>
        <CollapseChevron expanded={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Definitions</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-5">
            {TERMS.map(({ term, definition, calculation }) => (
              <div key={term}>
                <p className="text-xs font-bold text-slate-700 mb-1">{term}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{definition}</p>
                {calculation && (
                  <p className="text-[11px] text-indigo-400 mt-1 font-medium">
                    <span className="text-gray-300 mr-1">Calculation:</span>{calculation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(InsightsKPIAbout);

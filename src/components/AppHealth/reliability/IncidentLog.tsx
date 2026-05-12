import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { IncidentEntry } from '../../../services/reliabilityService';
import { SEV_BADGE } from '../errors/errorHelpers';
import { fmtTs } from '../errors/errorHelpers';

interface Props {
  incidents: IncidentEntry[];
}

const IncidentLog: React.FC<Props> = ({ incidents }) => {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const displayed = showAll ? incidents : incidents.slice(0, 10);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangle size={16} className="text-rose-500" />
          <span className="text-sm font-semibold text-slate-700">Incident Log</span>
          <span className="text-[11px] text-gray-400">Critical &amp; High severity</span>
          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[11px] font-bold rounded-full">
            {incidents.length}
          </span>
        </div>
        <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {expanded && (
        <>
          <div className="border-t border-gray-100 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Severity</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Message</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Component</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Module</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Blocking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.map(inc => (
                  <tr key={inc.eventId} className="hover:bg-rose-50/30 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-gray-400 whitespace-nowrap">{fmtTs(inc.timestamp)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${SEV_BADGE[inc.severity]}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600 max-w-[280px] truncate">{inc.message}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{inc.component ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{inc.module}</td>
                    <td className="px-4 py-2.5 text-xs">
                      {inc.isUserBlocking
                        ? <span className="font-semibold text-rose-600">Yes</span>
                        : <span className="text-gray-300">No</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {incidents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <AlertTriangle size={28} className="mb-2 opacity-20" />
                <p className="text-sm">No critical or high severity incidents.</p>
              </div>
            )}
          </div>

          {incidents.length > 10 && (
            <div className="px-5 py-3 border-t border-gray-100 flex justify-center">
              <button
                onClick={() => setShowAll(p => !p)}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                {showAll ? 'Show less' : `Show all ${incidents.length} incidents`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IncidentLog;

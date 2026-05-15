import React, { useEffect, useMemo, useState } from 'react';
import { X, ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import { SchoolieDistrictStatRow, SchoolieSessionStatRow, SchoolieUserStatRow } from '../../../types/schoolieUsageTypes';
import { SchoolieUsageEvent } from '../../../data/mockSchoolieUsageData';
import { ChevronLeftIcon } from '../../Common/Icons';
import SchoolieDistrictDetailDrawer from './SchoolieDistrictDetailDrawer';
import SchoolieUserListDrawer from './SchoolieUserListDrawer';
import SchoolieEventListDrawer from './SchoolieEventListDrawer';
import { TAB_COLORS, USAGE_ICONS, fmtDate } from '../common/usageHelpers';

interface Props {
  districts: SchoolieDistrictStatRow[];
  sessions: SchoolieSessionStatRow[];
  users?: SchoolieUserStatRow[];
  rawEvents?: SchoolieUsageEvent[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
  isChildDrawerOpen?: boolean;
}

const SchoolieDistrictListDrawer: React.FC<Props> = ({
  districts,
  sessions,
  users,
  rawEvents,
  title,
  isOpen,
  onClose,
  isChildDrawerOpen = false,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<SchoolieDistrictStatRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [userListDistrict, setUserListDistrict] = useState<SchoolieDistrictStatRow | null>(null);
  const [isEventListOpen, setIsEventListOpen] = useState(false);
  const [eventListEvents, setEventListEvents] = useState<SchoolieUsageEvent[]>([]);
  const [eventListTitle, setEventListTitle] = useState('');
  const [sort, setSort] = useState<{ key: keyof SchoolieDistrictStatRow; dir: 'asc' | 'desc' }>({ key: 'totalRequests', dir: 'desc' });

  const isAnyChildOpen = isChildDrawerOpen || isDetailOpen || isUserListOpen || isEventListOpen;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !isOpen) return;
      if (isAnyChildOpen) return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  }, [isOpen, isAnyChildOpen, onClose]);

  const sorted = useMemo(() => {
    return [...districts].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av ?? '').localeCompare(String(bv ?? ''));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [districts, sort]);

  const requestSort = (key: keyof SchoolieDistrictStatRow) => {
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const SortIcon = ({ colKey }: { colKey: keyof SchoolieDistrictStatRow }) =>
    sort.key === colKey
      ? sort.dir === 'asc' ? <ChevronUp size={12} className="text-teal-500" /> : <ChevronDown size={12} className="text-teal-500" />
      : null;

  return (
    <>
      <div className={`fixed inset-0 bg-white z-[52] flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-8 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" title="Back">
              <ChevronLeftIcon size={20} />
            </button>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${TAB_COLORS.Districts}1A` }}>
              <USAGE_ICONS.District size={20} style={{ color: TAB_COLORS.Districts }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-500">Schoolie AI districts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
          <div className="mb-4">
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">
              {districts.length.toLocaleString()} district{districts.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    {[
                      { key: 'districtName' as const,     label: 'District' },
                      { key: 'activeUsers' as const,       label: 'Active Users' },
                      { key: 'totalRequests' as const,     label: 'Requests' },
                      { key: 'successRate' as const,       label: 'Success Rate' },
                      { key: 'avgResponseTimeMs' as const, label: 'Avg Response' },
                      { key: 'lastActivity' as const,      label: 'Last Activity' },
                    ].map(col => (
                      <th
                        key={col.key}
                        onClick={() => requestSort(col.key)}
                        className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none"
                      >
                        <div className="flex items-center gap-1">{col.label}<SortIcon colKey={col.key} /></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sorted.map(district => (
                    <tr key={district.districtId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <button
                          onClick={() => { setSelectedDistrict(district); setIsDetailOpen(true); }}
                          className="text-sm font-medium text-slate-700 hover:text-violet-600 cursor-pointer text-left"
                        >
                          {district.districtName}
                        </button>
                      </td>
                      <td className="px-4 py-2.5 tabular-nums whitespace-nowrap">
                        {users ? (
                          <button
                            onClick={() => { setUserListDistrict(district); setIsUserListOpen(true); }}
                            className="text-sm text-slate-500 hover:text-violet-600 cursor-pointer tabular-nums"
                          >
                            {district.activeUsers.toLocaleString()}
                          </button>
                        ) : (
                          <span className="text-sm text-slate-500">{district.activeUsers.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums whitespace-nowrap">
                        {rawEvents ? (
                          <button
                            onClick={() => {
                              setEventListEvents(rawEvents.filter(e => e.districtId === district.districtId));
                              setEventListTitle(`${district.districtName} — Events`);
                              setIsEventListOpen(true);
                            }}
                            className="text-sm text-slate-500 hover:text-violet-600 cursor-pointer tabular-nums"
                          >
                            {district.totalRequests.toLocaleString()}
                          </button>
                        ) : (
                          <span className="text-sm text-slate-500">{district.totalRequests.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-slate-500 tabular-nums whitespace-nowrap">{Math.round(district.successRate * 100)}%</td>
                      <td className="px-4 py-2.5 text-sm text-slate-500 tabular-nums whitespace-nowrap">{Math.round(district.avgResponseTimeMs).toLocaleString()}ms</td>
                      <td className="px-4 py-2.5 text-sm text-slate-400 whitespace-nowrap">{district.lastActivity ? fmtDate(district.lastActivity) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sorted.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <MessageSquare size={32} className="mb-2 opacity-20" />
                  <p className="text-sm">No districts found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SchoolieDistrictDetailDrawer
        district={selectedDistrict}
        sessions={sessions}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        zIndex={62}
        isTopmost={isDetailOpen}
      />
      <SchoolieUserListDrawer
        users={users?.filter(u => u.districtId === userListDistrict?.districtId) ?? []}
        sessions={sessions.filter(s => s.districtId === userListDistrict?.districtId)}
        title={`${userListDistrict?.districtName ?? ''} — Users`}
        isOpen={isUserListOpen}
        onClose={() => setIsUserListOpen(false)}
        zIndex={62}
      />
      <SchoolieEventListDrawer
        events={eventListEvents}
        title={eventListTitle}
        isOpen={isEventListOpen}
        onClose={() => setIsEventListOpen(false)}
        zIndex={62}
        isTopmost={isEventListOpen}
      />
    </>
  );
};

export default SchoolieDistrictListDrawer;

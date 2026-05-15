import React, { useEffect, useMemo, useState } from 'react';
import { X, ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import { SchoolieUserStatRow, SchoolieSessionStatRow, SchoolieDistrictStatRow } from '../../../types/schoolieUsageTypes';
import { SchoolieUsageEvent } from '../../../data/mockSchoolieUsageData';
import { ChevronLeftIcon } from '../../Common/Icons';
import SchoolieUserDetailDrawer from './SchoolieUserDetailDrawer';
import SchoolieDistrictDetailDrawer from './SchoolieDistrictDetailDrawer';
import SchoolieEventListDrawer from './SchoolieEventListDrawer';
import { TAB_COLORS, USAGE_ICONS, fmtDate } from '../common/usageHelpers';

interface Props {
  users: SchoolieUserStatRow[];
  sessions: SchoolieSessionStatRow[];
  districts?: SchoolieDistrictStatRow[];
  rawEvents?: SchoolieUsageEvent[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  isChildDrawerOpen?: boolean;
}

const SchoolieUserListDrawer: React.FC<Props> = ({
  users,
  sessions,
  districts,
  rawEvents,
  title,
  isOpen,
  onClose,
  zIndex = 52,
  isChildDrawerOpen = false,
}) => {
  const [selectedUser, setSelectedUser] = useState<SchoolieUserStatRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<SchoolieDistrictStatRow | null>(null);
  const [isDistrictDetailOpen, setIsDistrictDetailOpen] = useState(false);
  const [isEventListOpen, setIsEventListOpen] = useState(false);
  const [eventListEvents, setEventListEvents] = useState<SchoolieUsageEvent[]>([]);
  const [eventListTitle, setEventListTitle] = useState('');
  const [sort, setSort] = useState<{ key: keyof SchoolieUserStatRow; dir: 'asc' | 'desc' }>({ key: 'totalRequests', dir: 'desc' });

  const isAnyChildOpen = isChildDrawerOpen || isDetailOpen || isDistrictDetailOpen || isEventListOpen;

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
    return [...users].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av ?? '').localeCompare(String(bv ?? ''));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [users, sort]);

  const requestSort = (key: keyof SchoolieUserStatRow) => {
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const SortIcon = ({ colKey }: { colKey: keyof SchoolieUserStatRow }) =>
    sort.key === colKey
      ? sort.dir === 'asc' ? <ChevronUp size={12} className="text-teal-500" /> : <ChevronDown size={12} className="text-teal-500" />
      : null;

  return (
    <>
      <div className={`fixed inset-0 bg-white flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ zIndex }}>
        <div className="px-2 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" title="Back">
              <ChevronLeftIcon size={20} />
            </button>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${TAB_COLORS.Users}1A` }}>
              <USAGE_ICONS.User size={20} style={{ color: TAB_COLORS.Users }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-500">Schoolie AI users</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
          <div className="mb-4">
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">
              {users.length.toLocaleString()} user{users.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    {[
                      { key: 'userName' as const,         label: 'User' },
                      { key: 'districtName' as const,     label: 'District' },
                      { key: 'totalRequests' as const,    label: 'Requests' },
                      { key: 'successRate' as const,      label: 'Success Rate' },
                      { key: 'avgResponseTimeMs' as const, label: 'Avg Response' },
                      { key: 'topAnalysis' as const,      label: 'Top Analysis' },
                      { key: 'lastActive' as const,       label: 'Last Active' },
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
                  {sorted.map(user => {
                    const districtRow = districts?.find(d => d.districtId === user.districtId);
                    return (
                      <tr key={user.userId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <button
                            onClick={() => { setSelectedUser(user); setIsDetailOpen(true); }}
                            className="text-sm font-medium text-slate-700 hover:text-violet-600 cursor-pointer text-left"
                          >
                            {user.userName}
                          </button>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          {districtRow ? (
                            <button
                              onClick={() => { setSelectedDistrict(districtRow); setIsDistrictDetailOpen(true); }}
                              className="text-sm text-slate-500 hover:text-violet-600 cursor-pointer text-left"
                            >
                              {user.districtName}
                            </button>
                          ) : (
                            <span className="text-sm text-slate-500">{user.districtName}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums whitespace-nowrap">
                          {rawEvents ? (
                            <button
                              onClick={() => {
                                setEventListEvents(rawEvents.filter(e => e.userId === user.userId));
                                setEventListTitle(`${user.userName} — Events`);
                                setIsEventListOpen(true);
                              }}
                              className="text-sm text-slate-500 hover:text-violet-600 cursor-pointer tabular-nums"
                            >
                              {user.totalRequests.toLocaleString()}
                            </button>
                          ) : (
                            <span className="text-sm text-slate-500">{user.totalRequests.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-slate-500 tabular-nums whitespace-nowrap">{Math.round(user.successRate * 100)}%</td>
                        <td className="px-4 py-2.5 text-sm text-slate-500 tabular-nums whitespace-nowrap">{Math.round(user.avgResponseTimeMs).toLocaleString()}ms</td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          {rawEvents && user.topAnalysis ? (
                            <button
                              onClick={() => {
                                setEventListEvents(rawEvents.filter(e => e.analysisIdentifier === user.topAnalysis));
                                setEventListTitle(`${user.topAnalysis} — Events`);
                                setIsEventListOpen(true);
                              }}
                              className="text-sm text-slate-500 hover:text-violet-600 cursor-pointer text-left"
                            >
                              {user.topAnalysis}
                            </button>
                          ) : (
                            <span className="text-sm text-slate-500">{user.topAnalysis || '—'}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-slate-400 whitespace-nowrap">{fmtDate(user.lastActive)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {sorted.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <MessageSquare size={32} className="mb-2 opacity-20" />
                  <p className="text-sm">No users found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SchoolieUserDetailDrawer
        user={selectedUser}
        sessions={sessions}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        zIndex={zIndex + 10}
        isTopmost={isDetailOpen}
      />
      <SchoolieDistrictDetailDrawer
        district={selectedDistrict}
        sessions={sessions}
        isOpen={isDistrictDetailOpen}
        onClose={() => setIsDistrictDetailOpen(false)}
        zIndex={zIndex + 10}
        isTopmost={isDistrictDetailOpen}
      />
      <SchoolieEventListDrawer
        events={eventListEvents}
        title={eventListTitle}
        isOpen={isEventListOpen}
        onClose={() => setIsEventListOpen(false)}
        zIndex={zIndex + 10}
        isTopmost={isEventListOpen}
      />
    </>
  );
};

export default SchoolieUserListDrawer;

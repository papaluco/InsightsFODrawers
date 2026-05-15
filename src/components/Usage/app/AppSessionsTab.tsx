import React from 'react';

import {
  AppSessionStatRow,
  AppUserStatRow,
  AppDistrictStatRow,
  AppUsageEvent,
} from '../../../types/appUsageTypes';
import AppSessionKPICards from './AppSessionKPICards';
import AppSessionGrid from './AppSessionGrid';

interface Props {
  sessionStats: AppSessionStatRow[];
  userStats: AppUserStatRow[];
  districtStats: AppDistrictStatRow[];
  filteredEvents: AppUsageEvent[];
  onDrillToSessions: (title: string, sessions: AppSessionStatRow[]) => void;
  onOpenSessionDetail: (session: AppSessionStatRow) => void;
  onOpenUserDetail: (user: AppUserStatRow) => void;
  onOpenDistrictDetail: (district: AppDistrictStatRow) => void;
  onOpenEventList: (events: AppUsageEvent[], title: string) => void;
}

const AppSessionsTab: React.FC<Props> = ({
  sessionStats,
  userStats,
  districtStats,
  filteredEvents,
  onDrillToSessions,
  onOpenSessionDetail,
  onOpenUserDetail,
  onOpenDistrictDetail,
  onOpenEventList,
}) => {
  return (
    <div className="space-y-5">
      <AppSessionKPICards
        data={sessionStats}
        onTotalSessionsClick={() => onDrillToSessions('Total Sessions', sessionStats)}
        onSessionsPerUserClick={() => onDrillToSessions('Sessions by User', sessionStats)}
        onAppClosedClick={() => onDrillToSessions('Sessions with App Closed', sessionStats.filter(s => s.hasAppClosed))}
        onNoAppCloseClick={() => onDrillToSessions('Sessions without App Close', sessionStats.filter(s => !s.hasAppClosed))}
      />
      <AppSessionGrid
        data={sessionStats}
        onRowClick={onOpenSessionDetail}
        onEventsClick={session =>
          onOpenEventList(
            filteredEvents.filter(e => e.sessionId === session.sessionId),
            `Events — ${session.sessionId}`
          )
        }
        onUserClick={session => {
          const user = userStats.find(u => u.userId === session.userId);
          if (user) onOpenUserDetail(user);
        }}
        onDistrictClick={session => {
          const district = districtStats.find(d => d.districtId === session.districtId);
          if (district) onOpenDistrictDetail(district);
        }}
      />
    </div>
  );
};

export default AppSessionsTab;

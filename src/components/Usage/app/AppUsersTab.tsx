import React from 'react';

import {
  AppUserStatRow,
  AppDistrictStatRow,
  AppSessionStatRow,
  AppUsageEvent,
} from '../../../types/appUsageTypes';
import AppUserKPICards from './AppUserKPICards';
import AppUserGrid from './AppUserGrid';

interface Props {
  userStats: AppUserStatRow[];
  sessionStats: AppSessionStatRow[];
  districtStats: AppDistrictStatRow[];
  filteredEvents: AppUsageEvent[];
  onDrillToUsers: (title: string, users: AppUserStatRow[]) => void;
  onDrillToSessions: (title: string, sessions: AppSessionStatRow[]) => void;
  onOpenUserDetail: (user: AppUserStatRow) => void;
  onOpenDistrictDetail: (district: AppDistrictStatRow) => void;
  onOpenEventList: (events: AppUsageEvent[], title: string) => void;
}

const AppUsersTab: React.FC<Props> = ({
  userStats,
  sessionStats,
  districtStats,
  filteredEvents,
  onDrillToUsers,
  onDrillToSessions,
  onOpenUserDetail,
  onOpenDistrictDetail,
  onOpenEventList,
}) => {
  return (
    <div className="space-y-5">
      <AppUserKPICards
        data={userStats}
        onActiveUsersClick={() => onDrillToUsers('Active Users', userStats)}
        onNewUsersClick={() => onDrillToUsers('New Users', userStats.filter(u => u.isPowerUser === false && u.sessions <= 2))}
        onReturningUsersClick={() => onDrillToUsers('Returning Users', userStats.filter(u => u.sessions > 2))}
        onPowerUsersClick={() => onDrillToUsers('Power Users', userStats.filter(u => u.isPowerUser))}
        onAvgSessionsClick={() => onDrillToSessions('User Sessions', sessionStats)}
      />
      <AppUserGrid
        data={userStats}
        onUserClick={onOpenUserDetail}
        onSessionsClick={user =>
          onDrillToSessions(
            `Sessions — ${user.userName}`,
            sessionStats.filter(s => s.userId === user.userId)
          )
        }
        onDistrictClick={user => {
          const district = districtStats.find(d => d.districtId === user.districtId);
          if (district) onOpenDistrictDetail(district);
        }}
        onRowClick={user =>
          onOpenEventList(
            filteredEvents.filter(e => e.userId === user.userId),
            `Events — ${user.userName}`
          )
        }
      />
    </div>
  );
};

export default AppUsersTab;

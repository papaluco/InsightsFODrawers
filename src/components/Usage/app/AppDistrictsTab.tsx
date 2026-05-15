import React, { lazy, Suspense } from 'react';
import { AppDistrictStatRow, AppUserStatRow, AppSessionStatRow, } from '../../../types/appUsageTypes';
const AppDistrictKPICards = lazy(() => import('./AppDistrictKPICards'));
const AppDistrictGrid = lazy(() => import('./AppDistrictGrid'));

interface Props {
  districtStats: AppDistrictStatRow[];
  userStats: AppUserStatRow[];
  sessionStats: AppSessionStatRow[];
  onDrillToDistricts: (title: string, districts: AppDistrictStatRow[]) => void;
  onDrillToUsers: (title: string, users: AppUserStatRow[]) => void;
  onDrillToSessions: (title: string, sessions: AppSessionStatRow[]) => void;
  onOpenDistrictDetail: (district: AppDistrictStatRow) => void;
}

const AppDistrictsTab: React.FC<Props> = ({
  districtStats,
  userStats,
  sessionStats,
  onDrillToDistricts,
  onDrillToUsers,
  onDrillToSessions,
  onOpenDistrictDetail,
}) => {
  return (
    <div className="space-y-5">
      <Suspense fallback={<div className="h-64 w-full animate-pulse bg-gray-50 rounded-xl" />}>
      <AppDistrictKPICards
        data={districtStats}
        onActiveDistrictsClick={() => onDrillToDistricts('Active Districts', districtStats.filter(d => !d.hasNoActivity))}
        onNoActivityClick={() => onDrillToDistricts('Districts with No Activity', districtStats.filter(d => d.hasNoActivity))}
        onAvgUsersClick={() => onDrillToUsers('Users by District', userStats)}
        onAvgSessionsClick={() => onDrillToSessions('District Sessions', sessionStats)}
      />
      <AppDistrictGrid
        data={districtStats}
        onRowClick={onOpenDistrictDetail}
        onUsersClick={district =>
          onDrillToUsers(
            `Users — ${district.districtName}`,
            userStats.filter(u => u.districtId === district.districtId)
          )
        }
        onSessionsClick={district =>
          onDrillToSessions(
            `Sessions — ${district.districtName}`,
            sessionStats.filter(s => s.districtId === district.districtId)
          )
        }
      />
      </Suspense>
    </div>
  );
};

export default AppDistrictsTab;

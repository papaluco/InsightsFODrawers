import React, { useMemo, useState, lazy, Suspense } from 'react';
import { FeedbackRecord } from '../../../types/feedbackTypes';
import { DashboardFilters, applyFilters, getPromptName, getPromptTypeDisplay } from './feedbackHelpers';
import FeedbackFilters from './FeedbackFilters';
import FeedbackKPICards from './FeedbackKPICards';

// 1. Lazy load heavy view components
const FeedbackList = lazy(() => import('./FeedbackList'));
const FeedbackDetail = lazy(() => import('./FeedbackDetail'));

// 2. Lazy load the heavy dashboard sections (charts/tables)
const FeedbackByPromptTypeChart = lazy(() => import('./FeedbackByPromptTypeChart'));
const FeedbackByPromptNameChart = lazy(() => import('./FeedbackByPromptNameChart'));
const FeedbackReasonsChart = lazy(() => import('./FeedbackReasonsChart'));
const FeedbackTrendChart = lazy(() => import('./FeedbackTrendChart'));
const FeedbackByUserTable = lazy(() => import('./FeedbackByUserTable'));
const FeedbackByDistrictTable = lazy(() => import('./FeedbackByDistrictTable'));
const PromptVersionTable = lazy(() => import('./PromptVersionTable'));
const LowPerformingPrompts = lazy(() => import('./LowPerformingPrompts'));

type View = 'dashboard' | 'list';

interface Props {
  allData: FeedbackRecord[];
  filters: DashboardFilters;
  onFiltersChange: (f: DashboardFilters) => void;
}

const SchoolieFeedbackDashboard: React.FC<Props> = ({ allData, filters, onFiltersChange }) => {
  const [view, setView] = useState<View>('dashboard');
  const [drillPredicate, setDrillPredicate] = useState<((r: FeedbackRecord) => boolean) | null>(null);
  const [drillTitle, setDrillTitle] = useState('All Feedback');
  const [selectedRecord, setSelectedRecord] = useState<FeedbackRecord | null>(null);

  const filteredData = useMemo(() => applyFilters(allData, filters), [allData, filters]);

  const listData = useMemo(
    () => drillPredicate ? filteredData.filter(drillPredicate) : filteredData,
    [filteredData, drillPredicate]
  );

  const drillDown = (title: string, predicate: (r: FeedbackRecord) => boolean) => {
    setDrillTitle(title);
    setDrillPredicate(() => predicate);
    setView('list');
  };

  const handleBack = () => {
    setView('dashboard');
    setDrillPredicate(null);
    setSelectedRecord(null);
  };

  // --- List View ---
  if (view === 'list') {
    return (
      <Suspense fallback={null}>
        <FeedbackList
          data={listData}
          title={drillTitle}
          onRecordClick={r => setSelectedRecord(r)}
          onBack={handleBack}
        />
        {/* Only mount Detail if a record is selected */}
        {selectedRecord && (
          <FeedbackDetail
            record={selectedRecord}
            isOpen={selectedRecord !== null}
            onClose={() => setSelectedRecord(null)}
          />
        )}
      </Suspense>
    );
  }

  // --- Dashboard View ---
  return (
    <div className="space-y-5">
      <FeedbackFilters filters={filters} onChange={onFiltersChange} allData={allData} />

      <FeedbackKPICards
        data={filteredData}
        onDrillAll={() => drillDown('All Feedback', () => true)}
        onDrillHelpful={() => drillDown('Helpful Feedback', r => r.feedbackValue === 'thumbs_up')}
        onDrillNotHelpful={() => drillDown('Not Helpful Feedback', r => r.feedbackValue === 'thumbs_down')}
      />

      <Suspense fallback={<div className="h-96 w-full animate-pulse bg-gray-50 rounded-2xl" />}>
        {/* Pie charts row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeedbackByPromptTypeChart
            data={filteredData}
            onSegmentClick={ep => drillDown(
              `${getPromptTypeDisplay(ep)} Feedback`,
              r => r.sourceEntryPoint === ep
            )}
          />
          <FeedbackByPromptNameChart
            data={filteredData}
            onSegmentClick={name => drillDown(
              `${name} Feedback`,
              r => getPromptName(r) === name
            )}
          />
          <FeedbackReasonsChart
            data={filteredData}
            onSegmentClick={code => drillDown(
              `Feedback: "${code}" reason`,
              r => r.feedbackValue === 'thumbs_down' && (r.reasonCodes ?? []).includes(code)
            )}
          />
        </div>

        {/* Trend chart */}
        <FeedbackTrendChart data={filteredData} />

        {/* User + District tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FeedbackByUserTable
            data={filteredData}
            onUserClick={(userId, userName) => drillDown(
              `${userName}'s Feedback`,
              r => r.userId === userId
            )}
          />
          <FeedbackByDistrictTable
            data={filteredData}
            onDistrictClick={(districtId, districtName) => drillDown(
              `${districtName} Feedback`,
              r => r.districtId === districtId
            )}
          />
        </div>

        {/* Version analysis + Low performers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <PromptVersionTable
            data={filteredData}
            onRowClick={(promptName, version) => drillDown(
              `${promptName} v${version} Feedback`,
              r => getPromptName(r) === promptName && r.promptVersion === version
            )}
          />
          <LowPerformingPrompts
            data={filteredData}
            onPromptClick={name => drillDown(
              `${name} Feedback`,
              r => getPromptName(r) === name
            )}
          />
        </div>
      </Suspense>
    </div>
  );
};

export default SchoolieFeedbackDashboard;
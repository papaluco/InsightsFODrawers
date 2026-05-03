import React, { useMemo, useState } from 'react';
import { FeedbackRecord } from '../../../types/schoolieFeedbackTypes';
import { DashboardFilters, DEFAULT_FILTERS, applyFilters, getPromptName, getPromptTypeDisplay } from './feedbackHelpers';
import FeedbackFilters from './FeedbackFilters';
import FeedbackKPICards from './FeedbackKPICards';
import FeedbackByPromptTypeChart from './FeedbackByPromptTypeChart';
import FeedbackByPromptNameChart from './FeedbackByPromptNameChart';
import FeedbackReasonsChart from './FeedbackReasonsChart';
import FeedbackTrendChart from './FeedbackTrendChart';
import FeedbackByUserTable from './FeedbackByUserTable';
import FeedbackByDistrictTable from './FeedbackByDistrictTable';
import PromptVersionTable from './PromptVersionTable';
import LowPerformingPrompts from './LowPerformingPrompts';
import FeedbackList from './FeedbackList';
import FeedbackDetail from './FeedbackDetail';

type View = 'dashboard' | 'list';

interface Props {
  allData: FeedbackRecord[];
}

const SchoolieFeedbackDashboard: React.FC<Props> = ({ allData }) => {
  const [filters, setFilters] = useState<DashboardFilters>({ ...DEFAULT_FILTERS });
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

  if (view === 'list') {
    return (
      <>
        <FeedbackList
          data={listData}
          title={drillTitle}
          onRecordClick={r => setSelectedRecord(r)}
          onBack={handleBack}
        />
        <FeedbackDetail
          record={selectedRecord}
          isOpen={selectedRecord !== null}
          onClose={() => setSelectedRecord(null)}
        />
      </>
    );
  }

  return (
    <div className="space-y-5">
      <FeedbackFilters filters={filters} onChange={setFilters} allData={allData} />

      <FeedbackKPICards
        data={filteredData}
        onDrillAll={() => drillDown('All Feedback', () => true)}
        onDrillHelpful={() => drillDown('Helpful Feedback', r => r.feedbackValue === 'thumbs_up')}
        onDrillNotHelpful={() => drillDown('Not Helpful Feedback', r => r.feedbackValue === 'thumbs_down')}
      />

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
    </div>
  );
};

export default SchoolieFeedbackDashboard;

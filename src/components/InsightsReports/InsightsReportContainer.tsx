import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { UnifiedReport, ReportSource, ReportHistoryItem } from '../../types/ReportTypes';
import { getReports, getReportHistory, toggleStarReport } from '../../services/insightsReportService';
import { trackReportEvent } from '../../services/reportUsageService';
import ReportListTable from './ReportListTable';
import { ProductFeedback } from '../Feedback/ProductFeedback';
import StarredReportsGrid from './StarredReportsGrid';
import ReportSidebar from './ReportSidebar';
import ReportFilters from './ReportFilters';
import DownloadReadyBanner from './DownloadReadyBanner';

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

// Lazy Imports
const RecentReportsDrawer = React.lazy(() => import('./RecentReportsDrawer'));
const ViewConfigDrawer = React.lazy(() => import('./ViewConfigDrawer'));
const ReportViewerDrawer = React.lazy(() => import('./ReportViewerDrawer'));

const InsightsReportsContainer: React.FC = () => {
  // --- STATE ---
  const [reports, setReports] = useState<UnifiedReport[]>([]);
  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('All');
  const [selectedSource, setSelectedSource] = useState<ReportSource | 'All'>('All');
  const [selectedDataSource, setSelectedDataSource] = useState('All');
  
  // --- DRAWER STATES ---
  const [historyDrawer, setHistoryDrawer] = useState<{ 
    isOpen: boolean; 
    reportId: string | null; 
    reportName: string | null;
  }>({
    isOpen: false,
    reportId: null,
    reportName: null
  });

  const [configDrawer, setConfigDrawer] = useState<{
    isOpen: boolean;
    report: UnifiedReport | null;
    historyItem: ReportHistoryItem | null;
  }>({
    isOpen: false,
    report: null,
    historyItem: null,
  });

  const [dismissedDownloads, setDismissedDownloads] = useState<Set<string>>(new Set());

  const [viewerDrawer, setViewerDrawer] = useState<{
    isOpen: boolean;
    report: UnifiedReport | null;
  }>({
    isOpen: false,
    report: null
  });

  // Sorting State
  const [sortBy, setSortBy] = useState<'Recent' | 'Name' | 'Module'>('Recent');
  const [directorySort, setDirectorySort] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc'
  });
  
  // --- PAGING STATE ---
  const cardsPerRow = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(cardsPerRow * 2);

  const [dirCurrentPage, setDirCurrentPage] = useState(1);
  const [dirItemsPerPage, setDirItemsPerPage] = useState(5);

  // Load data from service on mount
  useEffect(() => {
    getReports().then(setReports);
    getReportHistory().then(setReportHistory);
  }, []);

  // Reset paging on filter change
  useEffect(() => {
    setCurrentPage(1);
    setDirCurrentPage(1);
  }, [searchTerm, selectedModule, selectedSource, selectedDataSource]);

  const filteredHistory = useMemo(() => {
  return reportHistory.filter(h => {
    const matchesModule = selectedModule === 'All' || h.module === selectedModule;
    const matchesSource = selectedSource === 'All' || h.sourceType === selectedSource;
    const matchesSearch = searchTerm === '' || h.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesModule && matchesSource && matchesSearch;
  });
}, [reportHistory, selectedModule, selectedSource, searchTerm]);

  // --- HANDLERS ---
  const toggleStar = useCallback((id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, isStarred: !r.isStarred } : r));
    toggleStarReport(id);
  }, []);

  const openHistoryDrawer = useCallback((id: string | null = null, name: string | null = null) => {
    setHistoryDrawer({
      isOpen: true,
      reportId: id,
      reportName: name
    });
  }, []);

  const closeHistoryDrawer = () => {
    setHistoryDrawer(prev => ({ ...prev, isOpen: false }));
  };

  const recentDownloads = useMemo(() => {
    const now = Date.now();
    return reportHistory.filter(h =>
      h.sourceType === ReportSource.Download &&
      h.status === 'Success' &&
      h.fileUrl &&
      (now - new Date(h.runDate).getTime()) <= EIGHT_HOURS_MS &&
      !dismissedDownloads.has(h.id)
    );
  }, [reportHistory, dismissedDownloads]);

  const handleDismissDownload = useCallback((id: string) => {
    setDismissedDownloads(prev => new Set([...prev, id]));
  }, []);

  const handleViewConfig = useCallback((reportId: string, historyItem?: ReportHistoryItem) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      // For Download type, auto-resolve most recent history item if none provided
      let resolvedItem = historyItem ?? null;
      if (!resolvedItem && report.sourceType === ReportSource.Download) {
        resolvedItem = [...reportHistory]
          .filter(h => h.reportId === reportId && h.status === 'Success')
          .sort((a, b) => new Date(b.runDate).getTime() - new Date(a.runDate).getTime())[0] ?? null;
      }
      setHistoryDrawer(prev => ({ ...prev, isOpen: false }));
      setConfigDrawer({ isOpen: true, report, historyItem: resolvedItem });
      trackReportEvent({
        eventType: 'REPORT_CONFIG_VIEWED',
        userId: 'current-user',
        districtId: 'current-district',
        platform: 'SchoolCafe',
        context: {
          reportId: report.id,
          reportName: report.name,
          reportType: ReportSource[report.sourceType],
          module: report.module,
          dataSource: report.dataSource,
          entryPoint: 'FullDirectory',
        },
      });
    }
  }, [reports]);

  const closeConfigDrawer = () => {
    setConfigDrawer(prev => ({ ...prev, isOpen: false }));
  };

  const openReportViewer = useCallback((report: UnifiedReport) => {
    setViewerDrawer({
      isOpen: true,
      report: report
    });
  }, []);

  const closeReportViewer = () => {
    setViewerDrawer(prev => ({ ...prev, isOpen: false }));
  };

  const getLastRunDate = (reportId: string) => {
    return reportHistory
      .filter(h => h.reportId === reportId)
      .sort((x, y) => new Date(y.runDate).getTime() - new Date(x.runDate).getTime())[0]?.runDate || '';
  };

  const filteredReports = useMemo(() => {
    let result = reports.filter(report => {
      const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModule = selectedModule === 'All' || report.module === selectedModule;
      const matchesSource = selectedSource === 'All' || report.sourceType === selectedSource;
      const matchesDataSource = selectedDataSource === 'All' || report.dataSource === selectedDataSource;
      return matchesSearch && matchesModule && matchesSource && matchesDataSource;
    });

    if (sortBy === 'Name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'Module') {
      result.sort((a, b) => a.module.localeCompare(b.module));
    } else if (sortBy === 'Recent') {
      result.sort((a, b) => new Date(getLastRunDate(b.id)).getTime() - new Date(getLastRunDate(a.id)).getTime());
    }

    return result;
  }, [reports, reportHistory, searchTerm, selectedModule, selectedSource, selectedDataSource, sortBy]);


  const handleDirSort = (key: string) => {
    setDirectorySort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Paging Slices
  const starredReports = filteredReports.filter(r => r.isStarred);
  const totalStarredPages = Math.ceil(starredReports.length / itemsPerPage);
  const pagedStarredReports = starredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

 

  return (
    <div className=" max-w-[1600px] mx-auto px-4 pb-20">
      <ReportFilters
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        selectedModule={selectedModule} setSelectedModule={setSelectedModule}
        selectedSource={selectedSource} setSelectedSource={setSelectedSource}
        selectedDataSource={selectedDataSource} setSelectedDataSource={setSelectedDataSource}
      />

      <DownloadReadyBanner recentDownloads={recentDownloads} onDismiss={handleDismissDownload} />

      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-8">
          
          {/* STARRED REPORTS SECTION */}
          <StarredReportsGrid
            reports={pagedStarredReports}
            history={reportHistory}
            totalStarredCount={starredReports.length}
            onToggleStar={toggleStar}
            onRunReport={(report) => openReportViewer(report)}
            onDistributeReport={(report) => {
              trackReportEvent({
                eventType: 'REPORT_DISTRIBUTED',
                userId: 'current-user',
                districtId: 'current-district',
                platform: 'SchoolCafe',
                context: {
                  reportId: report.id,
                  reportName: report.name,
                  reportType: ReportSource[report.sourceType],
                  module: report.module,
                  dataSource: report.dataSource,
                  entryPoint: 'Starred',
                  distributionType: 'Manual',
                },
              });
            }}

            // Paging Props
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalStarredPages={totalStarredPages}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}

            // Sorting Props
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* FULL REPORT DIRECTORY SECTION */}
          <ReportListTable
            reports={filteredReports}
            history={reportHistory}
            totalReportsCount={filteredReports.length}

            // Handlers
            onRunReport={(report) => openReportViewer(report)}
            onDistributeReport={(report) => {
              trackReportEvent({
                eventType: 'REPORT_DISTRIBUTED',
                userId: 'current-user',
                districtId: 'current-district',
                platform: 'SchoolCafe',
                context: {
                  reportId: report.id,
                  reportName: report.name,
                  reportType: ReportSource[report.sourceType],
                  module: report.module,
                  dataSource: report.dataSource,
                  entryPoint: 'FullDirectory',
                  distributionType: 'Manual',
                },
              });
            }}
            onToggleStar={toggleStar}
            onViewHistory={openHistoryDrawer}
            onViewConfig={(report) => handleViewConfig(report.id)}

            // Paging State
            currentPage={dirCurrentPage}
            itemsPerPage={dirItemsPerPage}
            onPageChange={setDirCurrentPage}
            onItemsPerPageChange={(val) => {
              setDirItemsPerPage(val);
              setDirCurrentPage(1);
            }}

            // Sorting State
            sortField={directorySort.key}
            sortDirection={directorySort.direction}
            onSort={handleDirSort}
          />
        </div>

        <aside className="col-span-12 lg:col-span-4 xl:col-span-3 sticky top-6">
          <ReportSidebar 
            onViewAllHistory={() => openHistoryDrawer()}
            history={filteredHistory} 
          />
        </aside>
      </div>
      
      <div className="mt-8 pt-8 border-t border-gray-200">
        <ProductFeedback
          feedbackType='Reports'
          variant='dashboard'
          sourceEntryPoint='Dashboard'
          analysisIdentifier='ReportsDashboard'
        />
      </div>

      <React.Suspense fallback={null}>
        {/* RECENT REPORTS DRAWER */}
        {historyDrawer.isOpen && (
          <RecentReportsDrawer
            isOpen={historyDrawer.isOpen}
            onClose={closeHistoryDrawer}
            onViewConfig={handleViewConfig}
            history={reportHistory}
            reportId={historyDrawer.reportId}
            reportName={historyDrawer.reportName}
          />
        )}

        {/* CONFIG DRAWER */}
        {configDrawer.isOpen && (
          <ViewConfigDrawer
            isOpen={configDrawer.isOpen}
            onClose={closeConfigDrawer}
            reportName={configDrawer.report?.name}
            reportType={configDrawer.report?.sourceType}
            historyItem={configDrawer.historyItem}
          />
        )}

        {/* REPORT VIEWER DRAWER */}
        {viewerDrawer.isOpen && (
          <ReportViewerDrawer
            isOpen={viewerDrawer.isOpen}
            onClose={closeReportViewer}
            reportInfo={{
              name: viewerDrawer.report?.name || '',
              module: viewerDrawer.report?.module || '',
              source: viewerDrawer.report?.dataSource?.toString() || '',
              reportType: viewerDrawer.report?.sourceType
            }}
          />
        )}
      </React.Suspense>
    </div>
  );
};

export default InsightsReportsContainer;
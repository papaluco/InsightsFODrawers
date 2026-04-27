import React, { useState, useMemo, useEffect } from 'react';
import { mockReportData } from '../../data/mockReportData';
import { mockReportHistoryData } from '../../data/mockReportHistoryData';
import { UnifiedReport, ReportSource } from '../../data/ReportTypes';
import ReportListTable from './ReportListTable';
import StarredReportsGrid from './StarredReportsGrid';
import ReportSidebar from './ReportSidebar';
import ReportFilters from './ReportFilters';

// Lazy Imports
const RecentReportsDrawer = React.lazy(() => import('./RecentReportsDrawer'));
const ViewConfigDrawer = React.lazy(() => import('./ViewConfigDrawer'));
const ReportViewerDrawer = React.lazy(() => import('./ReportViewerDrawer'));

const InsightsReportsContainer: React.FC = () => {
  // --- STATE ---
  const [reports, setReports] = useState<UnifiedReport[]>(mockReportData);
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
  }>({
    isOpen: false,
    report: null
  });

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

  // Reset paging on filter change
  useEffect(() => {
    setCurrentPage(1);
    setDirCurrentPage(1);
  }, [searchTerm, selectedModule, selectedSource, selectedDataSource]);

  // --- HANDLERS ---
  const toggleStar = (id: string) => {
    setReports(prev => prev.map(report => 
      report.id === id ? { ...report, isStarred: !report.isStarred } : report
    ));
  };

  const openHistoryDrawer = (id: string | null = null, name: string | null = null) => {
    setHistoryDrawer({
      isOpen: true,
      reportId: id,
      reportName: name
    });
  };

  const closeHistoryDrawer = () => {
    setHistoryDrawer(prev => ({ ...prev, isOpen: false }));
  };

  const handleViewConfig = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setHistoryDrawer(prev => ({ ...prev, isOpen: false }));
      setConfigDrawer({
        isOpen: true,
        report: report
      });
    }
  };

  const closeConfigDrawer = () => {
    setConfigDrawer(prev => ({ ...prev, isOpen: false }));
  };

  const openReportViewer = (report: UnifiedReport) => {
    setViewerDrawer({
      isOpen: true,
      report: report
    });
  };

  const closeReportViewer = () => {
    setViewerDrawer(prev => ({ ...prev, isOpen: false }));
  };

  // Helper for Last Run date retrieval
  const getLastRunDate = (reportId: string) => {
    return mockReportHistoryData
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
  }, [reports, searchTerm, selectedModule, selectedSource, selectedDataSource, sortBy]);

  const sortedDirectoryReports = useMemo(() => {
    const data = [...filteredReports];
    const { key, direction } = directorySort;

    data.sort((a: any, b: any) => {
      let valA = a[key];
      let valB = b[key];

      if (key === 'lastRun') {
        valA = getLastRunDate(a.id);
        valB = getLastRunDate(b.id);
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [filteredReports, directorySort]);

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

  const pagedDirectoryReports = dirItemsPerPage === -1 
    ? sortedDirectoryReports 
    : sortedDirectoryReports.slice((dirCurrentPage - 1) * dirItemsPerPage, dirCurrentPage * dirItemsPerPage);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-4 pb-20">
      <ReportFilters 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        selectedModule={selectedModule} setSelectedModule={setSelectedModule}
        selectedSource={selectedSource} setSelectedSource={setSelectedSource}
        selectedDataSource={selectedDataSource} setSelectedDataSource={setSelectedDataSource}
        availableDataSources={reports.map(r => ({ name: r.dataSource, module: r.module }))}
      />

      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-8">
          
          {/* STARRED REPORTS SECTION */}
          <StarredReportsGrid 
            reports={pagedStarredReports}
            totalStarredCount={starredReports.length}
            onToggleStar={toggleStar}
            onRunReport={(report) => openReportViewer(report)}
            onDistributeReport={() => { }}

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
            reports={pagedDirectoryReports}
            totalReportsCount={sortedDirectoryReports.length}

            // Handlers
            onRunReport={(report) => openReportViewer(report)}
            onDistributeReport={() => { }}
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
            history={mockReportHistoryData.filter(h => 
              (selectedModule === 'All' || h.module === selectedModule) &&
              (selectedSource === 'All' || h.sourceType === selectedSource) &&
              (searchTerm === '' || h.name.toLowerCase().includes(searchTerm.toLowerCase()))
            )} 
          />
        </aside>
      </div>
      
      <React.Suspense fallback={null}>
        {/* RECENT REPORTS DRAWER */}
        {historyDrawer.isOpen && (
          <RecentReportsDrawer
            isOpen={historyDrawer.isOpen}
            onClose={closeHistoryDrawer}
            onViewConfig={handleViewConfig}
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
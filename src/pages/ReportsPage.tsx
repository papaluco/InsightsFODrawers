import React from 'react';
import InsightsReportsContainer from '../components/InsightsReports/InsightsReportContainer';

const ReportsPage: React.FC = () => {

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports Directory</h1>
        <p className="text-sm text-gray-500">
          Manage and distribute your Insights, Custom, Managed View, and Power BI reports.
        </p>
      </header>

      {/* The main logic hub */}
      <InsightsReportsContainer />
      
      {/* Developer Note: 
          isHistoryOpen and selectedReportForHistory will be used 
          to trigger the slide-out 'Recently Run Reports' panel.
      */}
    </main>
  );
};

export default ReportsPage;
import React from 'react';
import InsightsReportsContainer from '../components/InsightsReports/InsightsReportContainer';

const ReportsPage: React.FC = () => {
  return (
    // Changed <main className="p-6 bg-gray-50 min-h-screen"> 
    // to match SettingPage's <div className="min-h-full">
    <div className="min-h-full">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Reports Directory
        </h1>
        <p className="text-gray-500 mt-1">
          Manage and distribute your Insights, Custom, Managed View, and Power BI reports.
        </p>
      </header>

      {/* The main logic hub */}
      <InsightsReportsContainer />
    </div>
  );
};

export default ReportsPage;
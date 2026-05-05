import React, { useState } from 'react';
import { Eye, Play, Download, Mail, Share2, Settings, Users, Building2 } from 'lucide-react';
import { ReportUsageSummary } from '../../../types/reportUsageTypes';
import FeedbackKPICard from '../feedback/FeedbackKPICard';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

interface Props {
  summary: ReportUsageSummary;
  onDrill: (eventType: string) => void;
}

const ReportsKPICards: React.FC<Props> = ({ summary, onDrill }) => {
  const [expanded, setExpanded] = useState(true);

  const total = summary.views + summary.runs + summary.downloads + summary.emails + summary.distributions + summary.configViews;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">KPIs</span>
        <CollapseChevron expanded={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
            <FeedbackKPICard
              label="Views"
              value={summary.views.toLocaleString()}
              icon={<Eye size={20} />}
              colorClass="bg-indigo-50 text-indigo-600"
              onClick={() => onDrill('REPORT_VIEWED')}
            />
            <FeedbackKPICard
              label="Runs"
              value={summary.runs.toLocaleString()}
              icon={<Play size={20} />}
              colorClass="bg-emerald-50 text-emerald-600"
              onClick={() => onDrill('REPORT_RUN')}
            />
            <FeedbackKPICard
              label="Downloads"
              value={summary.downloads.toLocaleString()}
              icon={<Download size={20} />}
              colorClass="bg-amber-50 text-amber-600"
              onClick={() => onDrill('REPORT_DOWNLOADED')}
            />
            <FeedbackKPICard
              label="Emails"
              value={summary.emails.toLocaleString()}
              icon={<Mail size={20} />}
              colorClass="bg-blue-50 text-blue-600"
              onClick={() => onDrill('REPORT_EMAILED')}
            />
            <FeedbackKPICard
              label="Distributions"
              value={summary.distributions.toLocaleString()}
              icon={<Share2 size={20} />}
              colorClass="bg-violet-50 text-violet-600"
              onClick={() => onDrill('REPORT_DISTRIBUTED')}
            />
            <FeedbackKPICard
              label="Config Views"
              value={summary.configViews.toLocaleString()}
              icon={<Settings size={20} />}
              colorClass="bg-slate-100 text-slate-500"
              onClick={() => onDrill('REPORT_CONFIG_VIEWED')}
            />
            <FeedbackKPICard
              label="Active Users"
              value={summary.activeUsers.toLocaleString()}
              icon={<Users size={20} />}
              colorClass="bg-pink-50 text-pink-600"
            />
            <FeedbackKPICard
              label="Active Districts"
              value={summary.activeDistricts.toLocaleString()}
              icon={<Building2 size={20} />}
              colorClass="bg-teal-50 text-teal-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsKPICards;

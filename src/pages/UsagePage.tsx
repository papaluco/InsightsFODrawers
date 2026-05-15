import { useState, lazy, Suspense } from 'react';
import { 
  BarChart3, 
  ChefHat, 
  Bot, 
  ThumbsUp, 
  FileBarChart, 
  Globe, 
  ArrowRight 
} from 'lucide-react';

// 1. Lazy Load the components
const InsightsUsageDrawer = lazy(() => import('../components/Usage/InsightsUsageDrawer'));
const MenuAnalysisUsageDrawer = lazy(() => import('../components/Usage/MenuAnalysisUsageDrawer'));
const SchoolieUsageDrawer = lazy(() => import('../components/Usage/SchoolieUsageDrawer'));
const SchoolieFeedbackUsageDrawer = lazy(() => import('../components/Usage/SchoolieFeedbackUsageDrawer'));
const ReportsUsageDrawer = lazy(() => import('../components/Usage/ReportsUsageDrawer'));
const AppUsageDrawer = lazy(() => import('../components/Usage/AppUsageDrawer'));

const UsagePage = () => {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [menuAnalysisOpen, setMenuAnalysisOpen] = useState(false);
  const [schoolieOpen, setSchoolieOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [appOpen, setAppOpen] = useState(false);

  return (
    <div className="min-h-full">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Usage Dashboard</h1>
        <p className="text-gray-500 mt-1">Track engagement and adoption across platform features.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Insights Card */}
        <div
          onClick={() => setInsightsOpen(true)}
          onMouseEnter={() => import('../components/Usage/InsightsUsageDrawer')}
          className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <BarChart3 size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Insights</h3>
          <p className="text-gray-500 text-sm mb-6">KPI drawer engagement and adoption metrics.</p>
          <div className="text-blue-600 font-semibold flex items-center gap-2">
            View Usage <ArrowRight size={16} />
          </div>
        </div>

        {/* Menu Analysis Card */}
        <div
          onClick={() => setMenuAnalysisOpen(true)}
          onMouseEnter={() => import('../components/Usage/MenuAnalysisUsageDrawer')}
          className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <ChefHat size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Menu Analysis</h3>
          <p className="text-gray-500 text-sm mb-6">Menu feature engagement and recipe view trends.</p>
          <div className="text-emerald-600 font-semibold flex items-center gap-2">
            View Usage <ArrowRight size={16} />
          </div>
        </div>

        {/* Schoolie AI Card */}
        <div
          onClick={() => setSchoolieOpen(true)}
          onMouseEnter={() => import('../components/Usage/SchoolieUsageDrawer')}
          className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <Bot size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Schoolie AI</h3>
          <p className="text-gray-500 text-sm mb-6">AI analysis requests, KPI coverage, and response trends.</p>
          <div className="text-purple-600 font-semibold flex items-center gap-2">
            View Usage <ArrowRight size={16} />
          </div>
        </div>

        {/* Schoolie Feedback Card */}
        <div
          onClick={() => setFeedbackOpen(true)}
          onMouseEnter={() => import('../components/Usage/SchoolieFeedbackUsageDrawer')}
          className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4">
            <ThumbsUp size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Schoolie Feedback</h3>
          <p className="text-gray-500 text-sm mb-6">Feedback ratings, comment trends, and response quality scores.</p>
          <div className="text-rose-600 font-semibold flex items-center gap-2">
            View Usage <ArrowRight size={16} />
          </div>
        </div>

        {/* Reports Card */}
        <div
          onClick={() => setReportsOpen(true)}
          onMouseEnter={() => import('../components/Usage/ReportsUsageDrawer')}
          className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <FileBarChart size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Reports</h3>
          <p className="text-gray-500 text-sm mb-6">Report views, runs, downloads, and distribution activity.</p>
          <div className="text-indigo-600 font-semibold flex items-center gap-2">
            View Usage <ArrowRight size={16} />
          </div>
        </div>

        {/* App Card */}
        <div
          onClick={() => setAppOpen(true)}
          onMouseEnter={() => import('../components/Usage/AppUsageDrawer')}
          className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-4">
            <Globe size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">App</h3>
          <p className="text-gray-500 text-sm mb-6">Session tracking, page views, and engagement across all features.</p>
          <div className="text-teal-600 font-semibold flex items-center gap-2">
            View Usage <ArrowRight size={16} />
          </div>
        </div>
      </div>

      {/* 2. Wrap all lazy drawers in Suspense */}
      <Suspense fallback={null}>
        {insightsOpen && (
          <InsightsUsageDrawer 
            isOpen={insightsOpen} 
            onClose={() => setInsightsOpen(false)} 
          />
        )}

        {menuAnalysisOpen && (
          <MenuAnalysisUsageDrawer 
            isOpen={menuAnalysisOpen} 
            onClose={() => setMenuAnalysisOpen(false)} 
          />
        )}

        {schoolieOpen && (
          <SchoolieUsageDrawer 
            isOpen={schoolieOpen} 
            onClose={() => setSchoolieOpen(false)} 
          />
        )}

        {feedbackOpen && (
          <SchoolieFeedbackUsageDrawer 
            isOpen={feedbackOpen} 
            onClose={() => setFeedbackOpen(false)} 
          />
        )}

        {reportsOpen && (
          <ReportsUsageDrawer 
            isOpen={reportsOpen} 
            onClose={() => setReportsOpen(false)} 
          />
        )}

        {appOpen && (
          <AppUsageDrawer 
            isOpen={appOpen} 
            onClose={() => setAppOpen(false)} 
          />
        )}
      </Suspense>
    </div>
  );
};

export default UsagePage;
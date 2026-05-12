import { useMemo, useState } from 'react';
import { HeartPulse, AlertCircle, Zap, Users, Shield, ArrowRight } from 'lucide-react';
import ErrorsDrawer from '../components/AppHealth/ErrorsDrawer';
import PerformanceDrawer from '../components/AppHealth/PerformanceDrawer';
import SessionsDrawer from '../components/AppHealth/SessionsDrawer';
import ReliabilityDrawer from '../components/AppHealth/ReliabilityDrawer';
import {
  getErrorSummary,
  getPerformanceSummary,
  getSessionSummary,
  getReliabilitySummary,
} from '../services/appHealthService';

const AppHealthPage = () => {
  const [errorsOpen,      setErrorsOpen]      = useState(false);
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [sessionsOpen,    setSessionsOpen]    = useState(false);
  const [reliabilityOpen, setReliabilityOpen] = useState(false);

  const errorSummary  = useMemo(() => getErrorSummary(), []);
  const perfSummary   = useMemo(() => getPerformanceSummary(), []);
  const sessionSummary = useMemo(() => getSessionSummary(), []);
  const reliability   = useMemo(() => getReliabilitySummary(), []);

  return (
    <div className="min-h-full">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
            <HeartPulse size={20} className="text-rose-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">App Health</h1>
        </div>
        <p className="text-gray-500 mt-1 ml-13">Real-time error tracking, performance monitoring, and session analytics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Errors */}
        <div
          onClick={() => setErrorsOpen(true)}
          className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Error Tracking</h3>
          <p className="text-gray-500 text-sm mb-3">Frontend exceptions, API failures, and network errors.</p>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-medium bg-rose-50 text-rose-700 px-2 py-1 rounded-full">
              {errorSummary.total} total
            </span>
            {errorSummary.critical > 0 && (
              <span className="text-xs font-medium bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
                {errorSummary.critical} critical
              </span>
            )}
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {errorSummary.userBlocking} blocking
            </span>
          </div>
          <div className="text-rose-600 font-semibold flex items-center gap-2">
            View Errors <ArrowRight size={16} />
          </div>
        </div>

        {/* Performance */}
        <div
          onClick={() => setPerformanceOpen(true)}
          className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <Zap size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Performance</h3>
          <p className="text-gray-500 text-sm mb-3">Page loads, API requests, drawer opens, and render times.</p>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
              {perfSummary.total} events
            </span>
            <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
              {perfSummary.slowPct}% slow
            </span>
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              p95 {perfSummary.p95Ms >= 1000 ? `${(perfSummary.p95Ms / 1000).toFixed(1)}s` : `${perfSummary.p95Ms}ms`}
            </span>
          </div>
          <div className="text-amber-600 font-semibold flex items-center gap-2">
            View Performance <ArrowRight size={16} />
          </div>
        </div>

        {/* Sessions */}
        <div
          onClick={() => setSessionsOpen(true)}
          className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Session Explorer</h3>
          <p className="text-gray-500 text-sm mb-3">Cross-domain session health — errors, performance, and engagement.</p>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
              {sessionSummary.totalSessions} sessions
            </span>
            <span className="text-xs font-medium bg-rose-50 text-rose-700 px-2 py-1 rounded-full">
              {sessionSummary.errorRate}% error rate
            </span>
          </div>
          <div className="text-blue-600 font-semibold flex items-center gap-2">
            View Sessions <ArrowRight size={16} />
          </div>
        </div>

        {/* Reliability */}
        <div
          onClick={() => setReliabilityOpen(true)}
          className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Reliability</h3>
          <p className="text-gray-500 text-sm mb-3">Session health rates, critical incidents, and user impact analysis.</p>
          <div className="flex items-center gap-3 mb-5">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              reliability.errorFreeSessionRate >= 95
                ? 'bg-green-50 text-green-700'
                : reliability.errorFreeSessionRate >= 85
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-rose-50 text-rose-700'
            }`}>
              {reliability.errorFreeSessionRate}% error-free
            </span>
            {reliability.criticalErrors > 0 && (
              <span className="text-xs font-medium bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
                {reliability.criticalErrors} critical
              </span>
            )}
          </div>
          <div className="text-emerald-600 font-semibold flex items-center gap-2">
            View Reliability <ArrowRight size={16} />
          </div>
        </div>

      </div>

      <ErrorsDrawer      isOpen={errorsOpen}      onClose={() => setErrorsOpen(false)} />
      <PerformanceDrawer isOpen={performanceOpen} onClose={() => setPerformanceOpen(false)} />
      <SessionsDrawer    isOpen={sessionsOpen}    onClose={() => setSessionsOpen(false)} />
      <ReliabilityDrawer isOpen={reliabilityOpen} onClose={() => setReliabilityOpen(false)} />
    </div>
  );
};

export default AppHealthPage;

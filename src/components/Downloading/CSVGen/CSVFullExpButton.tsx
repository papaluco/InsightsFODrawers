import React, { useState } from 'react';
import { Database, Loader2, CheckCircle, Info, X, FileText } from 'lucide-react';

/**
 * ! DEMO CODE NOTE:
 * This component uses a manual DOM injection for the toast notification to simulate 
 * asynchronous background job completion for prototype purposes. 
 * * TODO FOR DEV: 
 * 1. Replace handleRequest with an actual API POST to the export queue.
 * 2. Replace 'triggerDemoToast' with a global Toast Provider (e.g., Sonner, react-hot-toast).
 * 3. Implement WebSockets or Push Notifications to trigger the toast when the server job finishes.
 */

interface CSVFullExpButtonProps {
  title: string;
  subtext?: string;
  onClose?: () => void; 
}

export const CSVFullExpButton: React.FC<CSVFullExpButtonProps> = ({ 
  title, 
  subtext = "Full system export"
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isDismissed, setIsDismissed] = useState(false);

  const triggerDemoToast = () => {
    const toast = document.createElement('div');
    // Using a high z-index and fixed positioning to ensure it shows over drawers/modals
    toast.className = "fixed bottom-6 right-6 z-[9999] flex items-center bg-white border-l-4 border-emerald-500 shadow-2xl p-4 rounded-r animate-in slide-in-from-right duration-500 min-w-[300px]";
    
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background-color: #ecfdf5; padding: 8px; border-radius: 9999px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </div>
        <div style="text-align: left;">
          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #1e293b;">Report Ready</p>
          <p style="margin: 0; font-size: 11px; color: #64748b;">Full Raw Data export is now available on your Reports page.</p>
        </div>
      </div>
    `;

    document.body.appendChild(toast);

    // Auto-remove toast after 6 seconds
    setTimeout(() => {
      toast.classList.add('animate-out', 'fade-out', 'slide-out-to-right');
      setTimeout(() => toast.remove(), 500);
    }, 6000);
  };

  const handleRequest = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents ExportMenu from closing immediately
    if (status !== 'idle') return;

    setIsDismissed(false);
    setStatus('loading');
    
    // Simulate API Request Latency
    setTimeout(() => {
      setStatus('success');

      // Simulate the "Background Processing" time (8 seconds)
      // This will trigger even if the drawer has been closed.
      setTimeout(() => {
        triggerDemoToast();
      }, 8000);

    }, 2000); 
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setIsDismissed(true);
    setStatus('idle'); 
  };

  return (
    <div className="border-t border-slate-100 bg-slate-50/50">
      <div 
        onClick={handleRequest}
        className={`flex items-center px-4 py-3 text-sm transition-colors cursor-pointer group
          ${status === 'success' ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
      >
        <div className="mr-3 flex-shrink-0">
          {status === 'loading' && <Loader2 size={18} className="text-blue-500 animate-spin" />}
          {status === 'success' && <CheckCircle size={18} className="text-emerald-600" />}
          {status === 'idle' && <Database size={18} className="text-slate-400 group-hover:text-blue-500 flex-shrink-0" />}
        </div>
        
        <div className="flex flex-col text-left min-w-0">
          <span className="font-bold text-slate-700">
            {status === 'success' ? 'Request Received' : title}
          </span>
          <span className="text-[10px] text-slate-400 italic">
            {status === 'loading' ? 'Communicating with server...' : subtext}
          </span>
        </div>
      </div>

      {status === 'success' && !isDismissed && (
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-300"
        >
          <div className="relative flex items-start p-2.5 rounded border border-emerald-200 bg-white shadow-sm">
            <button 
              onClick={handleDismiss}
              className="absolute top-1.5 right-1.5 p-1 text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={12} />
            </button>

            <Info size={14} className="text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-slate-600 leading-tight pr-4">
              Large reports take time to generate. You'll be notified when it's ready, and a link will be added to your 
              <span className="font-bold text-emerald-700"> Reports</span> page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
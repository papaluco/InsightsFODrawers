import { X, Users } from 'lucide-react';
import SessionsDashboard from './sessions/SessionsDashboard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SessionsDrawer: React.FC<Props> = ({ isOpen, onClose }) => (
  <div className={`fixed inset-0 bg-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

    {/* Header */}
    <div className="px-8 py-5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Users size={20} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Session Explorer</h2>
          <p className="text-xs text-gray-500">Cross-domain session health — errors, performance, and engagement</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <X size={20} />
      </button>
    </div>

    {/* Body */}
    <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
      {isOpen && <SessionsDashboard />}
    </div>
  </div>
);

export default SessionsDrawer;

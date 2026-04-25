import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import { XIcon, MaximizeIcon, MinimizeIcon, ChevronDownIcon, CheckIcon } from '../Common/Icons';
import { ReportSource } from '../../data/ReportTypes';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportInfo: {
    name: string;
    reportType?: ReportSource;
  } | null;
}

const FAKE_USERS = [
  { id: 1, name: 'Johnathon Smith', email: 'jsmith@company.com' },
  { id: 2, name: 'Sarah Jenkins', email: 'sjenkins@company.com' },
  { id: 3, name: 'Michael Chen', email: 'mchen@company.com' },
];

export const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, reportInfo }) => {
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isQueued, setIsQueued] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && reportInfo) {
      setSubject(`Email report - ${reportInfo.name}`);
      setBody(`<p>Hi,</p><p>Johnathon Smith has shared Custom Report <strong>${reportInfo.name}</strong> with you.</p>`);
      setIsQueued(false); // Reset state when opening for a new report
    }
  }, [isOpen, reportInfo]);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen || !reportInfo) return null;

  const toggleUser = (user: any) => {
    if (isQueued) return; // Lock editing if queued
    setSelectedUsers(prev => 
      prev.find(u => u.id === user.id) ? prev.filter(u => u.id !== user.id) : [...prev, user]
    );
  };

  const handleSend = () => {
    setIsQueued(true);
    // Logic for actual distribution would go here
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
      <div className="bg-white w-[650px] rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-4 py-2 bg-slate-50 border-b border-gray-200 flex justify-between items-center text-slate-700">
          <span className="text-sm font-medium">Send Message</span>
          <div className="flex items-center gap-3 text-gray-400">
            <button className="hover:text-slate-600 transition-colors"><MinimizeIcon size={14} /></button>
            <button className="hover:text-slate-600 transition-colors"><MaximizeIcon size={14} /></button>
            <button onClick={onClose} className="hover:text-red-500 transition-colors"><XIcon size={18} /></button>
          </div>
        </div>

        {/* To Field */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center relative" ref={dropdownRef}>
          <label className="text-sm text-gray-400 w-10">To:</label>
          <div 
            className={`flex-1 flex flex-wrap gap-1.5 min-h-[32px] items-center ${isQueued ? 'cursor-default' : 'cursor-pointer'}`}
            onClick={() => !isQueued && setShowUserDropdown(!showUserDropdown)}
          >
            {selectedUsers.map(user => (
              <span key={user.id} className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1.5 border border-slate-200">
                {user.name}
                {!isQueued && (
                  <button 
                    type="button"
                    className="hover:text-red-500 transition-colors flex items-center justify-center"
                    onClick={(e) => { e.stopPropagation(); toggleUser(user); }} 
                  >
                    <XIcon size={12} />
                  </button>
                )}
              </span>
            ))}
            <input 
              readOnly 
              placeholder={selectedUsers.length === 0 ? "Select system users..." : ""} 
              className="outline-none text-sm flex-1 min-w-[150px] placeholder:text-gray-300 pointer-events-none"
            />
          </div>
          {!isQueued && <ChevronDownIcon size={16} className={`text-gray-300 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />}
          
          {showUserDropdown && !isQueued && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-xl z-[2100] max-h-48 overflow-y-auto rounded-b-lg">
              {FAKE_USERS.map(user => (
                <div 
                  key={user.id}
                  onClick={() => toggleUser(user)}
                  className={`px-6 py-2.5 text-sm cursor-pointer hover:bg-slate-50 flex justify-between items-center ${selectedUsers.find(u => u.id === user.id) ? 'bg-indigo-50/50 text-primary font-bold' : 'text-slate-600'}`}
                >
                  {user.name}
                  <span className="text-[10px] opacity-40 font-mono italic">{user.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subject Line */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center">
          <label className="text-sm text-gray-400 w-10">Sub:</label>
          <input 
            value={subject}
            disabled={isQueued}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 outline-none text-sm font-medium text-slate-700 disabled:bg-transparent"
          />
        </div>

        {/* Rich Text Editor */}
        <div className={`flex-1 overflow-hidden email-quill-wrapper ${isQueued ? 'opacity-60 pointer-events-none' : ''}`}>
          <style>{`
            .email-quill-wrapper .ql-toolbar.ql-snow { border: none; border-bottom: 1px solid #f1f5f9; background: #fcfcfc; padding: 8px 24px; }
            .email-quill-wrapper .ql-container.ql-snow { border: none; font-family: inherit; font-size: 14px; height: 280px; }
            .email-quill-wrapper .ql-editor { padding: 24px 32px; color: #334155; }
            .email-quill-wrapper .ql-editor.ql-blank::before { left: 32px; font-style: normal; color: #cbd5e1; }
          `}</style>
          <ReactQuill 
            theme="snow" 
            value={body} 
            onChange={setBody} 
            modules={modules}
            readOnly={isQueued}
          />
        </div>

        {/* Action Footer with Success Message */}
        <div className="px-6 py-5 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleSend}
              disabled={selectedUsers.length === 0 || isQueued}
              className={`px-10 py-2 rounded font-bold text-[11px] uppercase tracking-widest transition-all ${
                  isQueued 
                  ? 'bg-emerald-500 text-white cursor-default' 
                  : selectedUsers.length > 0 
                    ? 'bg-primary text-white hover:bg-primary/90 shadow-lg active:scale-95' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isQueued ? 'Queued' : 'Send Message'}
            </button>

            {isQueued && (
              <div className="flex-1 flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 rounded-full p-1">
                    <CheckIcon size={12} className="text-white" />
                  </div>
                  <p className="text-[11px] font-bold text-emerald-800 leading-tight">
                    Report queued for distribution to the chosen recipients.
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="text-emerald-400 hover:text-emerald-600 transition-colors"
                >
                  <XIcon size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
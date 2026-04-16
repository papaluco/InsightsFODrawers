import React from 'react';
import { PencilRuler, Play, Save } from 'lucide-react';

interface EditorProps {
  promptText: string;
  setPromptText: (val: string) => void;
  onTest: () => void;
  isTesting: boolean;
  hasChanges: boolean;
  onSave: () => void;
}

export const AIPromptEditor = ({ 
  promptText, 
  setPromptText, 
  onTest, 
  isTesting, 
  hasChanges, 
  onSave 
}: EditorProps) => {
  return (
    // This container must be flex-1 to grow
    <div className="flex-1 flex flex-col min-h-0">
      
      <div className="flex items-center gap-2 text-gray-900 font-bold shrink-0 mb-3">
        <PencilRuler size={18} className="text-indigo-600" />
        Prompt Editor
      </div>
      
      {/* The textarea wrapper and the textarea itself must be flex-1 */}
      <textarea 
        value={promptText}
        onChange={(e) => setPromptText(e.target.value)}
        className="flex-1 w-full p-6 bg-gray-900 text-green-400 font-mono text-sm rounded-xl border-4 border-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner resize-none leading-relaxed overflow-y-auto"
        placeholder="Enter prompt instructions..."
      />

      {/* Footer area - Buttons grouped to the right */}
      <div className="flex justify-end items-center py-4 shrink-0 gap-3">
        
        {/* Test Prompt on the left of the group */}
        <button 
          onClick={onTest}
          disabled={isTesting}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
        >
          {isTesting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
          Test Prompt
        </button>

        {/* Save Prompt on the right of the group */}
        <button 
          onClick={onSave}
          disabled={!hasChanges}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm ${
            hasChanges 
            ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save size={16} />
          Save Prompt
        </button>

      </div>
    </div>
  );
};
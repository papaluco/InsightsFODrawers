import { RefreshIcon, SaveIcon, PlayIcon, EditIcon } from '../../Common/Icons';
import { AIPromptVersionHistory, PromptVersionOption } from './AIPromptVersionHistory';

interface EditorProps {
  promptText: string;
  setPromptText: (val: string) => void;
  onTest: () => void;
  isTesting: boolean;
  hasChanges: boolean;
  onSave: () => void;
  onReset: () => void;
  version?: number;
  updatedBy?: string;
  updatedAt?: string;
  versions?: PromptVersionOption[];
  onSelectVersion?: (version: PromptVersionOption) => void;
}

export const AIPromptEditor = ({ 
  promptText, 
  setPromptText, 
  onTest, 
  isTesting, 
  hasChanges,
  onSave,
  onReset,
  version,
  updatedBy,
  updatedAt,
  versions = [],
  onSelectVersion
}: EditorProps) => {
  const isPromptValid = promptText.trim().length > 0;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      
      <div className="flex items-center justify-between shrink-0 mb-3">
        <div className="flex items-center gap-2 text-gray-900 font-bold">
          
          <EditIcon size={18} className="text-primary" />
          Prompt Editor
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Reset prompt"
            onClick={onReset}
            disabled={!hasChanges}
            className={`group p-2 rounded-lg transition-colors ${
              hasChanges
                ? 'hover:bg-gray-100 text-gray-500 hover:text-blue-600'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <RefreshIcon size={18} className="text-primary"/>
          </button>

          <AIPromptVersionHistory
  versions={versions}
  currentVersion={version}
  onSelectVersion={(selectedVersion) => {
    if (onSelectVersion) {
      onSelectVersion(selectedVersion);
    }
  }}
/>
        </div>
      </div>
      
      <textarea 
        value={promptText}
        onChange={(e) => setPromptText(e.target.value)}
        className="flex-1 w-full p-6 bg-gray-900 text-green-400 font-mono text-sm rounded-xl border-4 border-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner resize-none leading-relaxed overflow-y-auto"
        placeholder="Enter prompt instructions..."
      />

      {hasChanges && !isPromptValid && (
        <div className="text-xs text-red-500 mt-2">
          Prompt cannot be empty
        </div>
      )}

      <div className="flex justify-between items-center py-4 shrink-0">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>
            {version
              ? `Version ${version} created on ${updatedAt} by ${updatedBy}`
              : 'No version info'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
  onClick={onTest}
  disabled={isTesting}
  className="flex items-center gap-2 px-6 py-2.5 bg-green-100 text-green-800 rounded-lg font-semibold hover:bg-green-200 transition-all shadow-sm disabled:opacity-50"
>
  {isTesting ? (
    <div className="w-4 h-4 border-2 border-green-400/40 border-t-green-700 rounded-full animate-spin" />
  ) : (
    <PlayIcon size={18} />
  )}
  Test Prompt
</button>

          <button 
            onClick={onSave}
            disabled={!hasChanges || !isPromptValid}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm ${
              hasChanges && isPromptValid
                ? 'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark/90'
    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <SaveIcon size={18} />
            Save Prompt
          </button>
        </div>
      </div>
    </div>
  );
};
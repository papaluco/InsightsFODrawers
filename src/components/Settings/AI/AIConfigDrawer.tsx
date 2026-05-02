import { useState, useEffect } from 'react';
import { XIcon } from '../../Common/Icons';
import { AIPromptFilters } from './AIPromptFilters';
import { AIPromptEditor } from './AIPromptEditor';
import { AIPreviewPanel } from './AIPreviewPanel';
import { ConfirmModal } from './ConfirmModal';
import { SavePromptConfirmModal } from './SavePromptConfirmModal';
import { PromptVersionOption } from './AIPromptVersionHistory';
import { SchooliePrompt, SchoolieVersion } from '../../../types/SchoolieTypes';
import { getPrompts, getAllVersions, savePrompt } from '../../../services/schoolieService';

type PendingAction = (() => void) | null;

export const AIConfigDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [prompts, setPrompts] = useState<SchooliePrompt[]>([]);
  const [versions, setVersions] = useState<SchoolieVersion[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState('');

  const [promptText, setPromptText] = useState('');
  const [originalPrompt, setOriginalPrompt] = useState('');

  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const [loadedVersion, setLoadedVersion] = useState(0);
  const [loadedUpdatedBy, setLoadedUpdatedBy] = useState('');
  const [loadedUpdatedAt, setLoadedUpdatedAt] = useState('');

  // Load prompts and version history from service on mount
  useEffect(() => {
    Promise.all([getPrompts(), getAllVersions()]).then(([loadedPrompts, loadedVersions]) => {
      setPrompts(loadedPrompts);
      setVersions(loadedVersions);
      if (loadedPrompts.length > 0) {
        const first = loadedPrompts[0];
        setSelectedPromptId(first.id);
        setPromptText(first.promptText);
        setOriginalPrompt(first.promptText);
        setLoadedVersion(first.version);
        setLoadedUpdatedBy(first.updatedBy);
        setLoadedUpdatedAt(first.updatedAt);
      }
    });
  }, []);

  // Re-initialize editor text when drawer re-opens without unsaved changes
  useEffect(() => {
    if (isOpen && !promptText && prompts.length > 0) {
      const first = prompts[0];
      setPromptText(first.promptText);
      setOriginalPrompt(first.promptText);
      setLoadedVersion(first.version);
      setLoadedUpdatedBy(first.updatedBy);
      setLoadedUpdatedAt(first.updatedAt);
    }
  }, [isOpen, prompts]);

  const hasChanges = promptText !== originalPrompt;
  const selectedPrompt = prompts.find(p => p.id === selectedPromptId);

  const selectedPromptVersions: PromptVersionOption[] = versions
    .filter(v => v.name === selectedPrompt?.name)
    .sort((a, b) => b.version - a.version);

  const executeSwitch = (id: string) => {
    const active = prompts.find(p => p.id === id);

    if (active) {
      setSelectedPromptId(id);
      setPromptText(active.promptText);
      setOriginalPrompt(active.promptText);

      setLoadedVersion(active.version);
      setLoadedUpdatedBy(active.updatedBy);
      setLoadedUpdatedAt(active.updatedAt);

      setShowResult(false);
    }

    setIsConfirmOpen(false);
    setPendingAction(null);
  };

  const handlePromptSelectionChange = (newId: string) => {
    const action = () => executeSwitch(newId);

    if (hasChanges) {
      setPendingAction(() => action);
      setIsConfirmOpen(true);
    } else {
      action();
    }
  };

  const executeVersionLoad = (version: PromptVersionOption) => {
    setPromptText(version.promptText);
    setOriginalPrompt(version.promptText);

    setLoadedVersion(version.version);
    setLoadedUpdatedBy(version.updatedBy || '');
    setLoadedUpdatedAt(version.updatedAt);

    setShowResult(false);
    setIsConfirmOpen(false);
    setPendingAction(null);
  };

  const handleVersionSelection = (version: PromptVersionOption) => {
    const action = () => executeVersionLoad(version);

    if (hasChanges) {
      setPendingAction(() => action);
      setIsConfirmOpen(true);
    } else {
      action();
    }
  };

  const handleReset = () => {
    setPromptText(originalPrompt);
    setShowResult(false);
  };

  const handleTest = () => {
    setIsTesting(true);
    setShowResult(false);

    setTimeout(() => {
      setIsTesting(false);
      setShowResult(true);
    }, 2500);
  };

  const handleSave = () => {
    setIsSaveConfirmOpen(true);
  };

  const executeSave = async () => {
    try {
      const { prompt: updated, archivedVersion } = await savePrompt(selectedPromptId, promptText);
      setPrompts(prev => prev.map(p => p.id === selectedPromptId ? updated : p));
      setVersions(prev => [...prev, archivedVersion]);
      setOriginalPrompt(promptText);
      setLoadedVersion(updated.version);
      setLoadedUpdatedBy(updated.updatedBy);
      setLoadedUpdatedAt(updated.updatedAt);
      setIsSaveConfirmOpen(false);
    } catch {
      setIsSaveConfirmOpen(false);
    }
  };

  return (
    <div className={`absolute inset-0 bg-white z-50 transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full bg-gray-50">

        <div className="h-20 bg-white border-b px-8 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Schoolie Prompt Playground
            </h1>
            <p className="text-sm text-gray-500">
              Configure text for each schoolie OpenAI prompt
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">

          <div className="w-3/5 h-full flex flex-col p-8 border-r bg-white overflow-hidden">

            <div className="shrink-0 mb-6">
              <AIPromptFilters
                selectedKPI={selectedPromptId}
                setSelectedKPI={handlePromptSelectionChange}
                isExpanded={filtersExpanded}
                setIsExpanded={setFiltersExpanded}
                prompts={prompts}
              />
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <AIPromptEditor
                promptText={promptText}
                setPromptText={setPromptText}
                onTest={handleTest}
                isTesting={isTesting}
                hasChanges={hasChanges}
                
                onSave={handleSave}
                onReset={handleReset}
                version={loadedVersion}
                updatedBy={loadedUpdatedBy}
                updatedAt={loadedUpdatedAt}
                versions={selectedPromptVersions}
                onSelectVersion={handleVersionSelection}
              />
            </div>
          </div>

          <div className="w-2/5 h-full bg-gray-50 p-8 overflow-y-auto">
            <AIPreviewPanel isTesting={isTesting} showResult={showResult} />
          </div>

        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Unsaved Changes"
        message="You have unsaved changes in your current prompt. If you continue, those changes will be lost. Do you want to continue?"
        onConfirm={() => {
          if (pendingAction) {
            pendingAction();
          }
        }}
        onCancel={() => {
          setIsConfirmOpen(false);
          setPendingAction(null);
        }}
      />

      <SavePromptConfirmModal
        isOpen={isSaveConfirmOpen}
        promptName={selectedPrompt?.name}
        onConfirm={executeSave}
        onCancel={() => setIsSaveConfirmOpen(false)}
      />
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AIPromptFilters } from './AIPromptFilters';
import { AIPromptEditor } from './AIPromptEditor';
import { AIPreviewPanel } from './AIPreviewPanel';
import { ConfirmModal } from './ConfirmModal'; // Ensure this component is created as per the previous step

// IMPORT MOCK DATA
import { initialSchooliePrompts, mockSchoolieData } from '../../data/mockSchoolieData';

export const AIConfigDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  // 1. State Management
  const [prompts, setPrompts] = useState<mockSchoolieData[]>(initialSchooliePrompts);
  const [selectedPromptId, setSelectedPromptId] = useState(initialSchooliePrompts[0].id);
  
  const [promptText, setPromptText] = useState('');
  const [originalPrompt, setOriginalPrompt] = useState('');
  
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // 2. Custom Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingPromptId, setPendingPromptId] = useState<string | null>(null);

  // Sync state with the first item on initial load
  useEffect(() => {
    if (isOpen && !promptText) {
      const first = prompts[0];
      setPromptText(first.promptText);
      setOriginalPrompt(first.promptText);
    }
  }, [isOpen]);

  const hasChanges = promptText !== originalPrompt;

  // 3. DIRTY CHECK LOGIC (Custom Modal)
  const handlePromptSelectionChange = (newId: string) => {
    if (hasChanges) {
      // Open our custom mobile-style pop-up instead of browser alert
      setPendingPromptId(newId);
      setIsConfirmOpen(true);
    } else {
      // If no changes, switch immediately
      executeSwitch(newId);
    }
  };

  const executeSwitch = (id: string) => {
    const active = prompts.find(p => p.id === id);
    if (active) {
      setSelectedPromptId(id);
      setPromptText(active.promptText);
      setOriginalPrompt(active.promptText);
      setShowResult(false);
    }
    // Clean up modal state
    setIsConfirmOpen(false);
    setPendingPromptId(null);
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
    const updatedPrompts = prompts.map(p => 
      p.id === selectedPromptId ? { ...p, promptText: promptText } : p
    );
    
    setPrompts(updatedPrompts);
    setOriginalPrompt(promptText); 
    console.log("Mock Save: Prompt updated in local state.");
  };

  return (
    <div className={`absolute inset-0 bg-white z-50 transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full bg-gray-50">
        
        {/* Production-Style Header */}
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
            <X size={24} />
          </button>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Working Area */}
          <div className="w-3/5 h-full flex flex-col p-8 border-r bg-white overflow-hidden">
            
            {/* Filter Section */}
            <div className="shrink-0 mb-6">
              <AIPromptFilters 
                selectedKPI={selectedPromptId}
                setSelectedKPI={handlePromptSelectionChange} 
                isExpanded={filtersExpanded}
                setIsExpanded={setFiltersExpanded}
                prompts={prompts}
              />
            </div>

            {/* Editor Area (Expands into available space) */}
            <div className="flex-1 flex flex-col min-h-0">
              <AIPromptEditor 
                promptText={promptText} 
                setPromptText={setPromptText} 
                onTest={handleTest}
                isTesting={isTesting}
                hasChanges={hasChanges}
                onSave={handleSave}
              />
            </div>
          </div>

          {/* Right Preview Area */}
          <div className="w-2/5 h-full bg-gray-50 p-8 overflow-y-auto">
            <AIPreviewPanel isTesting={isTesting} showResult={showResult} />
          </div>

        </div>
      </div>

      {/* The Custom Mobile-Style Modal */}
      <ConfirmModal 
        isOpen={isConfirmOpen}
        title="Unsaved Changes"
        message="You have unsaved changes in your current prompt. If you switch now, those changes will be lost. Do you want to continue?"
        onConfirm={() => pendingPromptId && executeSwitch(pendingPromptId)}
        onCancel={() => {
          setIsConfirmOpen(false);
          setPendingPromptId(null);
        }}
      />
    </div>
  );
};
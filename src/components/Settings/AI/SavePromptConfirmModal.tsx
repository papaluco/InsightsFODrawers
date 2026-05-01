import { AlertTriangleIcon } from '../../Common/Icons';

interface SavePromptConfirmModalProps {
  isOpen: boolean;
  promptName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SavePromptConfirmModal = ({
  isOpen,
  promptName,
  onConfirm,
  onCancel
}: SavePromptConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <AlertTriangleIcon size={24} />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Save Prompt Changes?
          </h3>

          <p className="text-sm text-gray-500 leading-relaxed">
            You are updating the global {promptName ? <strong>{promptName}</strong> : 'Schoolie'} prompt.
            This change may affect AI responses across districts.
          </p>
        </div>

        <div className="flex border-t">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors border-r"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-4 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            Save Prompt
          </button>
        </div>
      </div>
    </div>
  );
};
import { SparklesIcon } from '../../Common/Icons';

interface Props {
  isTesting: boolean;
  showResult: boolean;
  previewOutput?: string;
  promptName?: string;
}

export const AIPreviewPanel = ({ isTesting, showResult, previewOutput, promptName }: Props) => {
  if (isTesting) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="font-bold text-gray-500">Consulting Schoolie...</p>
      </div>
    );
  }

  if (!showResult) {
    return (
      <div className="h-full border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center text-gray-400">
        <SparklesIcon size={40} className="mb-4 opacity-20" />
        <p className="text-sm font-medium">Run a test to see the preview here.</p>
      </div>
    );
  }

  const isHtml = previewOutput?.trimStart().startsWith('<');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 text-indigo-600 pb-4 border-b">
        <SparklesIcon size={20} />
        <h3 className="text-lg font-bold">{promptName ?? 'Schoolie'} Preview</h3>
      </div>

      {previewOutput ? (
        isHtml ? (
          <div
            className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: previewOutput }}
          />
        ) : (
          <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
            {previewOutput}
          </pre>
        )
      ) : (
        <p className="text-sm text-gray-400 italic">No preview output available for this prompt.</p>
      )}
    </div>
  );
};
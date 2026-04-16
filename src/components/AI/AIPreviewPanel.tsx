import React from 'react';
import { Sparkles } from 'lucide-react';

export const AIPreviewPanel = ({ isTesting, showResult }: { isTesting: boolean; showResult: boolean }) => {
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
        <Sparkles size={40} className="mb-4 opacity-20" />
        <p className="text-sm font-medium">Run a test to see the preview here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 text-indigo-600 pb-4 border-b">
        <Sparkles size={20} />
        <h3 className="text-lg font-bold">Schoolie Insights</h3>
      </div>
      
      <p className="text-sm font-medium text-gray-800">Hi Hanu! I've analyzed the KPIs for all schools.</p>

      <div className="space-y-4">
        <div>
          <h4 className="font-bold text-gray-900 mb-1">Assessment</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            Based on the analysis of the Child Nutrition Programs' Key Performance Indicators (KPIs) for the period from 07/01/2024 to 06/30/2025, there is a mixed performance across the district. While some KPIs such as Supper ADP, Snack ADP, and Waste are performing exceptionally well, other critical metrics like Revenue, Breakfast ADP, and Meals are below the benchmark.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-2">What Went Well</h4>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li><span className="font-bold">Supper ADP:</span> Achieved 71%, which is 61% above benchmark.</li>
            <li><span className="font-bold">Lunch ADP:</span> Achieved 9%, which is 7% above benchmark.</li>
            <li><span className="font-bold">Waste:</span> Recorded $0.00, reflecting excellent efficiency.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
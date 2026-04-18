import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { CSVRenderer } from './CSVRenderer';
import { ICSVReportData } from './CSVContract';

interface CSVExpButtonProps {
  // Instead of raw data, we pass the already-adapted CSV object
  csvData: ICSVReportData; 
  // We can pass the labels as props to keep the UI flexible for PNA/ENP
  title: string;
  subtext?: string;
  onClose?: () => void;
}

export const CSVExpButton: React.FC<CSVExpButtonProps> = ({ 
  csvData, 
  title,
  subtext = "Download grid data as seen",
  onClose 
}) => {
  
  const handleDownload = () => {
    // The button doesn't need to know HOW the data was mapped
    CSVRenderer(csvData);

    if (onClose) {
      onClose();
    }
  };

  return (
    <div 
      onClick={handleDownload}
      className="flex items-center px-4 py-3 text-sm transition-colors cursor-pointer text-slate-700 hover:bg-emerald-50 group"
    >
      <FileSpreadsheet 
        size={18} 
        className="mr-3 text-emerald-600 group-hover:text-emerald-700 flex-shrink-0" 
      />
      <div className="flex flex-col text-left min-w-0">
        <span className="font-bold whitespace-nowrap text-slate-700">
          {title}
        </span>
        <span className="text-[10px] text-slate-400">
          {subtext}
        </span>
      </div>
    </div>
  );
};
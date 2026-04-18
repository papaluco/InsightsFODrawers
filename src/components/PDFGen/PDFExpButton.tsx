import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PDFRenderer } from './PDFRenderer';
import { IPDFReportData } from './PDFContract';
import { FileText } from 'lucide-react';

interface PDFExpButtonProps {
  data: IPDFReportData;
  onClose?: () => void;
}

export const PDFExpButton: React.FC<PDFExpButtonProps> = ({ 
  data, 
  onClose 
}) => {
  // UNIQUE FILE NAME LOGIC
  const getFileName = () => {
    const district = data.districtName.replace(/\s+/g, '_');
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19);
    
    return `MPLH_Analysis_${district}_${timestamp}.pdf`;
  };

  return (
    <PDFDownloadLink
      document={<PDFRenderer data={data} />}
      fileName={getFileName()}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      {({ loading }) => (
        <div 
          onClick={() => onClose?.()}
          className={`
            flex items-center px-4 py-3 text-sm transition-colors cursor-pointer
            ${loading ? 'text-slate-400 bg-slate-50 cursor-not-allowed' : 'text-slate-700 hover:bg-indigo-50'}
          `}
        >
          <FileText 
            size={18} 
            className={`mr-3 ${loading ? 'text-slate-300' : 'text-indigo-500'}`} 
          />
          <div className="flex flex-col text-left">
            <span className="font-medium whitespace-nowrap text-slate-700">
              {loading ? 'Generating...' : 'Drawer Visualization (.pdf)'}
            </span>
            <span className="text-[10px] text-slate-400">
              Download a PDF of this drawer
            </span>
          </div>
        </div>
      )}
    </PDFDownloadLink>
  );
};
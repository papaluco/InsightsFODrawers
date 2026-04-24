import React from 'react';
import { 
  ChevronLeftIcon,
  ChevronRightIcon
} from '../Common/Icons';

interface ReportPagingProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (count: number) => void;
  showAllOption?: boolean;
}

// Added 'export' here
export const ReportPaging: React.FC<ReportPagingProps> = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange, 
  showAllOption 
}) => {
  // Use 1 for totalPages if totalItems is 0 to avoid "Page 1 of 0"
  const itemsLimit = itemsPerPage === -1 ? totalItems : itemsPerPage;
  const totalPages = Math.ceil(totalItems / (itemsLimit || 1));
  
  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsLimit + 1;
  const end = Math.min(currentPage * itemsLimit, totalItems);

  const btnClass = "p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-white">
      <div className="flex items-center gap-6">
        <span className="text-[12px] text-gray-500 font-medium">
          Showing {start}-{end} of {totalItems}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-gray-400">Show</span>
          <select 
            value={itemsPerPage === -1 ? 'All' : itemsPerPage}
            onChange={(e) => onItemsPerPageChange(e.target.value === 'All' ? -1 : Number(e.target.value))}
            className="text-[12px] font-semibold text-slate-700 border border-gray-200 rounded-lg py-1 px-2 focus:ring-1 focus:ring-blue-500 outline-none bg-white cursor-pointer"
          >
            {[5, 10, 25].map(n => <option key={n} value={n}>{n}</option>)}
            {showAllOption && <option value="All">All</option>}
          </select>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1} 
          className={btnClass}
        > 
          <ChevronLeftIcon size={16} /> 
        </button>
        
        <span className="text-[12px] font-bold text-slate-700">
          Page {currentPage} of {totalPages || 1}
        </span>
        
        <button 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage >= totalPages} 
          className={btnClass}
        > 
          <ChevronRightIcon size={16} /> 
        </button>
      </div>
    </div>
  );
};
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, GripVertical } from 'lucide-react';
import { FeedbackRecord } from '../../../types/schoolieFeedbackTypes';
import {
  FilterIcon,
  SettingsIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  AlertIcon,
} from '../../Common/Icons';
import { ExportMenu } from '../../Downloading/ExportMenu/ExportMenu';
import { CSVExpButton } from '../../Downloading/CSVGen/CSVExpButton';
import { CSVFeedbackUsageAdapter, FEEDBACK_COLUMNS } from '../../Downloading/CSVGen/adapters/csvFeedbackUsageAdapter';
import { ReportPaging } from '../../InsightsReports/ReportPaging';

interface Props {
  data: FeedbackRecord[];
  title: string;
  onRecordClick: (record: FeedbackRecord) => void;
  onBack: () => void;
}

const DEFAULT_VISIBLE = FEEDBACK_COLUMNS.filter(c => c.defaultVisible).map(c => c.key);
const ALL_KEYS = FEEDBACK_COLUMNS.map(c => c.key);
const COL_BY_KEY = new Map(FEEDBACK_COLUMNS.map(c => [c.key, c]));

const FeedbackList: React.FC<Props> = ({ data, title, onRecordClick, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE);
  const [columnOrder, setColumnOrder] = useState<string[]>(ALL_KEYS);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Drag-and-drop state
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowColumnPicker(false);
      }
    };
    if (showColumnPicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColumnPicker]);

  // Columns in current order, filtered to visible
  const orderedVisibleCols = useMemo(
    () => columnOrder.filter(k => visibleColumns.includes(k)).map(k => COL_BY_KEY.get(k)!),
    [columnOrder, visibleColumns]
  );

  const filteredAndSorted = useMemo(() => {
    let rows = [...data];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      rows = rows.filter(r =>
        FEEDBACK_COLUMNS.some(col => String(col.getValue(r)).toLowerCase().includes(lower))
      );
    }
    if (sortConfig) {
      const col = COL_BY_KEY.get(sortConfig.key);
      if (col) {
        rows.sort((a, b) => {
          const av = col.getValue(a);
          const bv = col.getValue(b);
          if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
          if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }
    return rows;
  }, [data, searchTerm, sortConfig]);

  const paged = useMemo(() => {
    if (itemsPerPage <= 0) return filteredAndSorted;
    return filteredAndSorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredAndSorted, currentPage, itemsPerPage]);

  const requestSort = (key: string) => {
    setSortConfig(prev =>
      prev?.key === key && prev.direction === 'asc'
        ? { key, direction: 'desc' }
        : { key, direction: 'asc' }
    );
    setCurrentPage(1);
  };

  // CSV uses the current visible order
  const csvData = useMemo(
    () => CSVFeedbackUsageAdapter(filteredAndSorted, orderedVisibleCols.map(c => c.key), title),
    [filteredAndSorted, orderedVisibleCols, title]
  );

  // Drag handlers for column picker
  const handleDragStart = (e: React.DragEvent, key: string) => {
    setDraggedKey(key);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (key !== draggedKey) setDragOverKey(key);
  };
  const handleDrop = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!draggedKey || draggedKey === targetKey) return;
    setColumnOrder(prev => {
      const next = [...prev];
      const from = next.indexOf(draggedKey);
      const to = next.indexOf(targetKey);
      next.splice(from, 1);
      next.splice(to, 0, draggedKey);
      return next;
    });
    setDraggedKey(null);
    setDragOverKey(null);
  };
  const handleDragEnd = () => {
    setDraggedKey(null);
    setDragOverKey(null);
  };

  const hiddenCount = ALL_KEYS.length - visibleColumns.length;

  const renderCell = (record: FeedbackRecord, key: string): React.ReactNode => {
    switch (key) {
      case 'feedback':
        return record.feedbackValue === 'thumbs_up'
          ? <ThumbsUp size={14} className="inline text-green-500" />
          : <ThumbsDown size={14} className="inline text-red-400" />;
      case 'comment':
        return record.comment
          ? <MessageSquare size={13} className="inline text-indigo-400" />
          : <span className="text-gray-300">—</span>;
      default: {
        const col = COL_BY_KEY.get(key);
        return col ? String(col.getValue(record)) : '—';
      }
    }
  };

  return (
    <div className="animate-in fade-in duration-200 flex flex-col gap-0">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">
            {data.length} record{data.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-200 rounded-t-xl px-5 py-3 flex justify-between items-center gap-3">
        {hiddenCount > 0 ? (
          <div className="flex items-center gap-2 text-amber-600 animate-in fade-in duration-300">
            <AlertIcon size={14} className="text-amber-500" />
            <span className="text-[11px] font-semibold italic">
              Showing {visibleColumns.length} of {ALL_KEYS.length} columns.
            </span>
          </div>
        ) : <div />}

        <div className="flex items-center gap-3">
          {/* Export */}
          <ExportMenu>
            <div className="px-4 py-1.5 bg-slate-50 border-y border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Data Exports</p>
            </div>
            <CSVExpButton
              title="Feedback Records (.csv)"
              subtext="Download visible columns as seen"
              csvData={csvData}
            />
          </ExportMenu>

          {/* Column picker */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowColumnPicker(p => !p)}
              className={`p-2 rounded-lg border transition-all ${showColumnPicker ? 'bg-indigo-50 border-indigo-400 text-indigo-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              <SettingsIcon size={18} />
            </button>

            {showColumnPicker && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 shadow-xl rounded-xl z-50 p-4 animate-in zoom-in-95 duration-100">
                <div className="flex justify-between items-center mb-1 px-1">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Columns</h3>
                  <button
                    onClick={() => setVisibleColumns(
                      visibleColumns.length === ALL_KEYS.length ? [] : [...ALL_KEYS]
                    )}
                    className="text-[10px] font-bold text-indigo-600 uppercase hover:underline"
                  >
                    {visibleColumns.length === ALL_KEYS.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 px-1 mb-3">Drag to reorder</p>
                <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
                  {columnOrder.map(key => {
                    const col = COL_BY_KEY.get(key)!;
                    const isDragging = draggedKey === key;
                    const isOver = dragOverKey === key && draggedKey !== key;
                    return (
                      <div
                        key={key}
                        draggable
                        onDragStart={e => handleDragStart(e, key)}
                        onDragOver={e => handleDragOver(e, key)}
                        onDrop={e => handleDrop(e, key)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors select-none
                          ${isDragging ? 'opacity-40 bg-indigo-50' : 'hover:bg-slate-50'}
                          ${isOver ? 'border-t-2 border-indigo-400' : 'border-t-2 border-transparent'}
                        `}
                      >
                        <GripVertical size={14} className="text-gray-300 cursor-grab flex-shrink-0" />
                        <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                            checked={visibleColumns.includes(key)}
                            onChange={() =>
                              setVisibleColumns(prev =>
                                prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                              )
                            }
                          />
                          <span className="text-sm text-slate-600 font-medium truncate">{col.label}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative w-64">
            <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white border-x border-b border-gray-200 rounded-b-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <tr>
                {orderedVisibleCols.map(col => (
                  <th
                    key={col.key}
                    onClick={() => requestSort(col.key)}
                    className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      <div className="w-4 flex items-center">
                        {sortConfig?.key === col.key && (
                          sortConfig.direction === 'asc'
                            ? <ChevronUpIcon size={13} className="text-indigo-500" />
                            : <ChevronDownIcon size={13} className="text-indigo-500" />
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.map(record => (
                <tr
                  key={record.feedbackId}
                  onClick={() => onRecordClick(record)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  {orderedVisibleCols.map(col => (
                    <td key={col.key} className="px-4 py-2.5 text-sm text-slate-600">
                      <div className={`truncate max-w-[240px] ${col.key === 'feedback' || col.key === 'comment' ? 'text-center' : ''}`}>
                        {renderCell(record, col.key)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {paged.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <MessageSquare size={36} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">No records found{searchTerm ? ' matching your search' : ''}.</p>
            </div>
          )}
        </div>
        <ReportPaging
          currentPage={currentPage}
          totalItems={filteredAndSorted.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={val => { setItemsPerPage(val); setCurrentPage(1); }}
          showAllOption={true}
        />
      </div>
    </div>
  );
};

export default FeedbackList;

import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { GripVertical, Settings2, RotateCcw } from 'lucide-react';

export interface OrderedSelectItem {
  value: string;
  label: string;
  selected: boolean;
}

interface DragReorderSelectProps {
  items: OrderedSelectItem[];
  onChange: (items: OrderedSelectItem[]) => void;
  defaultItems: OrderedSelectItem[];
}

export const DragReorderSelect: React.FC<DragReorderSelectProps> = ({
  items,
  onChange,
  defaultItems,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const openPopover = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const width = 268;
      setPopoverStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: Math.max(8, rect.right - width),
        width,
        zIndex: 9999,
      });
    }
    setIsOpen(true);
  };

  const closePopover = () => {
    setIsOpen(false);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !popoverRef.current?.contains(e.target as Node)
      ) closePopover();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopImmediatePropagation(); closePopover(); }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey, true);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey, true);
    };
  }, [isOpen]);

  const toggleItem = (value: string) =>
    onChange(items.map(item => item.value === value ? { ...item, selected: !item.selected } : item));

  const selectAll = () => onChange(items.map(item => ({ ...item, selected: true })));
  const reset = () => onChange(defaultItems);

  // Drag handlers
  const onDragStart = (i: number) => setDragIndex(i);
  const onDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOverIndex(i); };
  const onDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const onDragEnd = () => { setDragIndex(null); setDragOverIndex(null); };

  const selectedCount = items.filter(i => i.selected).length;

  const popover = isOpen ? ReactDOM.createPortal(
    <div ref={popoverRef} style={popoverStyle} className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-gray-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {selectedCount}/{items.length} shown · drag to reorder
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={selectAll}
            className="text-[11px] text-indigo-600 font-semibold hover:underline"
          >
            All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={reset}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 font-semibold hover:underline"
          >
            <RotateCcw size={10} />
            Reset
          </button>
        </div>
      </div>

      {/* Draggable item list */}
      <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
        {items.map((item, i) => (
          <div
            key={item.value}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={e => onDragOver(e, i)}
            onDrop={() => onDrop(i)}
            onDragEnd={onDragEnd}
            className={`flex items-center gap-2 px-3 py-2 text-xs select-none transition-colors
              border-t-2 cursor-grab active:cursor-grabbing
              ${dragOverIndex === i && dragIndex !== i
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-transparent'}
              ${dragIndex === i
                ? 'opacity-40 bg-slate-100'
                : 'bg-white hover:bg-gray-50'}`}
          >
            <GripVertical size={13} className="text-gray-300 flex-shrink-0" />
            <input
              type="checkbox"
              checked={item.selected}
              onChange={() => toggleItem(item.value)}
              className="accent-indigo-600 flex-shrink-0 cursor-pointer"
            />
            <span className={`truncate ${item.selected ? 'text-slate-700' : 'text-gray-400'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => isOpen ? closePopover() : openPopover()}
        className={`flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors
          ${isOpen
            ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
        title="Configure visible items and order"
      >
        <Settings2 size={12} />
        <span>{selectedCount}/{items.length}</span>
      </button>
      {popover}
    </>
  );
};

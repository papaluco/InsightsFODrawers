import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown, X, Search, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  label: string;
  options: SelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  maxListHeight?: number;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = React.memo(({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Search...',
  maxListHeight = 240,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Position the portal dropdown under the trigger button
  const openDropdown = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 240),
        zIndex: 9999,
      });
    }
    setIsOpen(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSearch('');
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        closeDropdown();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        closeDropdown();
      }
    };
    const handleScroll = () => closeDropdown();
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const filtered = useMemo(() =>
    search
      ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
      : options,
    [options, search]
  );

  const toggle = (value: string) => {
    onChange(selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value]
    );
  };

  const selectAll = () => onChange(options.map(o => o.value));
  const clear = () => onChange([]);

  const displayLabel =
    selected.length === 0
      ? `All ${label}`
      : selected.length === 1
        ? (options.find(o => o.value === selected[0])?.label ?? selected[0])
        : `${selected.length} selected`;

  const dropdown = isOpen ? ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
    >
      {/* Search */}
      <div className="px-2 pt-2 pb-1.5 border-b border-gray-100">
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-6 pr-2 py-1 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            autoFocus
          />
        </div>
      </div>

      {/* Select All / Clear */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-gray-100">
        <button
          type="button"
          onClick={selectAll}
          className="text-[11px] font-semibold text-indigo-600 hover:underline"
        >
          Select All
        </button>
        <span className="text-gray-300">|</span>
        <button
          type="button"
          onClick={clear}
          className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 hover:underline"
        >
          Clear
        </button>
      </div>

      {/* Option list */}
      <div className="overflow-y-auto" style={{ maxHeight: maxListHeight }}>
        {filtered.length === 0 ? (
          <div className="px-3 py-4 text-xs text-gray-400 italic text-center">
            No matches
          </div>
        ) : (
          filtered.map(option => {
            const isSelected = selected.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors
                  ${isSelected ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-gray-50'}`}
              >
                <div className={`w-4 h-4 flex-shrink-0 rounded border-[1.5px] flex items-center justify-center transition-colors
                  ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}
                >
                  {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <span className="truncate">{option.label}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Selected count footer */}
      {selected.length > 0 && (
        <div className="px-3 py-1.5 bg-indigo-50 border-t border-indigo-100 text-[11px] text-indigo-600 font-semibold">
          {selected.length} of {options.length} selected
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {label}
      </label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => isOpen ? closeDropdown() : openDropdown()}
        className={`w-full flex items-center justify-between text-sm border rounded-lg px-2 py-1.5 bg-white outline-none transition-colors
          ${isOpen ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'}
          ${selected.length > 0 ? 'text-indigo-700 font-semibold' : 'text-gray-500'}`}
      >
        <span className="truncate text-left">{displayLabel}</span>
        {selected.length > 0 ? (
          <X
            size={13}
            className="ml-1 flex-shrink-0 text-indigo-400 hover:text-indigo-600"
            onClick={e => { e.stopPropagation(); clear(); }}
          />
        ) : (
          <ChevronDown size={13} className="ml-1 flex-shrink-0 text-gray-400" />
        )}
      </button>
      {dropdown}
    </div>
  );
});

MultiSelectDropdown.displayName = 'MultiSelectDropdown';

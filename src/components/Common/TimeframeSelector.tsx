import React, { useCallback, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Calendar,
  ChevronDown,
  Clock,
  CalendarDays,
  CalendarRange,
  History,
  X,
  BookOpen,
  LucideIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { DEMO_AS_OF_DATE } from '../../constants/demo';
import { fromLocalDate, toLocalDate } from '../../utils/dateOnly';
import { getTimeframeOptionDescription, TimeframeOptionId } from '../../utils/timeframes';
import type { TimeframeSelection } from '../../services/comparisonDataService';
import { useCloseOnEscape, useCloseOnOutsideClick, useFloatingPosition } from './useFloatingDropdown';

const CUSTOM = 'custom';

const IconComponent: Record<string, LucideIcon> = {
  Calendar,
  Clock,
  History,
  CalendarDays,
  CalendarRange,
  BookOpen,
};

interface DateOption {
  id: TimeframeOptionId;
  label: string;
  icon: string;
}

// Descriptions are derived from resolveTimeframe and DEMO_AS_OF_DATE (getTimeframeOptionDescription),
// so they always match the period each option resolves to (NXT-77202).
const DATE_OPTIONS: DateOption[] = [
  { id: 'today', label: 'Today', icon: 'Clock' },
  { id: 'yesterday', label: 'Yesterday', icon: 'History' },
  { id: 'this_week', label: 'This Week', icon: 'CalendarDays' },
  { id: 'last_week', label: 'Last Week', icon: 'CalendarDays' },
  { id: 'this_month', label: 'This Month', icon: 'Calendar' },
  { id: 'last_month', label: 'Last Month', icon: 'Calendar' },
  { id: 'ytd', label: 'Year to Date', icon: 'CalendarRange' },
  { id: 'prior_year', label: 'Prior Year', icon: 'BookOpen' },
  // NXT-77201 spec §3 Prior Year to Date: same elapsed portion of the prior school year as YTD.
  { id: 'prior_ytd', label: 'Prior Year to Date', icon: 'BookOpen' },
  { id: 'sy2324', label: 'SY 2023 - 2024', icon: 'BookOpen' },
  { id: 'sy2223', label: 'SY 2022 - 2023', icon: 'BookOpen' },
  { id: 'sy2122', label: 'SY 2021 - 2022', icon: 'BookOpen' },
  { id: 'sy2021', label: 'SY 2020 - 2021', icon: 'BookOpen' },
  { id: CUSTOM, label: 'Custom Range', icon: 'CalendarRange' },
];

const CUSTOM_RANGE_DESCRIPTION = 'Select a custom date range';

const OPTION_DESCRIPTIONS: Record<TimeframeOptionId, string> = Object.fromEntries(
  DATE_OPTIONS.map(option => [option.id, getTimeframeOptionDescription(option.id, DEMO_AS_OF_DATE) ?? CUSTOM_RANGE_DESCRIPTION]),
) as Record<TimeframeOptionId, string>;

interface TimeframeSelectorProps {
  /**
   * Controlled selection (NXT-77202). When provided, the component shows this value and
   * reports changes through onChange; null shows the placeholder. Omit it for the
   * dashboard's uncontrolled behavior (defaults to Today).
   */
  value?: TimeframeSelection | null;
  onChange?: (selection: TimeframeSelection) => void;
  /** Button text when nothing is selected (controlled mode). */
  placeholder?: string;
}

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ value, onChange, placeholder = 'Select timeframe' }) => {
  const isControlled = value !== undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uncontrolledTimeframe, setUncontrolledTimeframe] = useState<TimeframeOptionId>('today');
  // Uncontrolled keeps its original picker seed (the demo date); controlled starts empty.
  const [startDate, setStartDate] = useState<Date | null>(isControlled ? null : toLocalDate(DEMO_AS_OF_DATE));
  const [endDate, setEndDate] = useState<Date | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isMenuOpen = isOpen || showDatePicker;
  const close = useCallback(() => {
    setIsOpen(false);
    setShowDatePicker(false);
  }, []);
  useCloseOnOutsideClick([dropdownRef, menuRef], isMenuOpen, close);
  useCloseOnEscape(isMenuOpen, close);
  const menuStyle = useFloatingPosition(triggerRef, menuRef, isMenuOpen, showDatePicker ? 'picker' : 'list');

  const selectedTimeframe: TimeframeOptionId | null = isControlled ? value?.optionId ?? null : uncontrolledTimeframe;
  const selectedOption = DATE_OPTIONS.find((t) => t.id === selectedTimeframe);
  const Icon = (selectedOption && IconComponent[selectedOption.icon]) || Calendar;

  const selectTimeframe = (selection: TimeframeSelection) => {
    if (isControlled) onChange?.(selection);
    else setUncontrolledTimeframe(selection.optionId);
  };

  const openDatePicker = () => {
    // Controlled: seed the picker with the current custom range, if any.
    if (isControlled) {
      const range = value?.optionId === CUSTOM ? value.customRange : undefined;
      setStartDate(range ? toLocalDate(range.start) : null);
      setEndDate(range ? toLocalDate(range.end) : null);
    }
    setShowDatePicker(true);
  };

  const handleDateRangeSelect = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      selectTimeframe({ optionId: CUSTOM, customRange: { start: fromLocalDate(start), end: fromLocalDate(end) } });
      setIsOpen(false);
      setShowDatePicker(false);
    }
  };

  const getDisplayLabel = () => {
    if (!selectedOption) return placeholder;
    if (selectedTimeframe === CUSTOM) {
      const range = isControlled ? value?.customRange : undefined;
      const rangeStart = range ? toLocalDate(range.start) : startDate;
      const rangeEnd = range ? toLocalDate(range.end) : endDate;
      if (rangeStart && rangeEnd) return `${format(rangeStart, 'MMM d')} - ${format(rangeEnd, 'MMM d, yyyy')}`;
    }
    return selectedOption.label;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={triggerRef}
        onClick={() => {
          if (isMenuOpen) close();
          else setIsOpen(true);
        }}
        className="flex items-center space-x-2 px-3 py-2 bg-white text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200 rounded-lg shadow-sm w-full md:w-auto"
      >
        <Icon className="w-4 h-4 text-indigo-500" />
        <span className={`text-sm font-semibold whitespace-nowrap ${selectedOption ? '' : 'text-gray-400'}`}>
          {getDisplayLabel()}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Option list — portaled so it renders above overlays and isn't clipped */}
      {isOpen && !showDatePicker && ReactDOM.createPortal(
        <div ref={menuRef} style={menuStyle} className="w-72 flex flex-col bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="py-2 max-h-[400px] min-h-0 flex-1 overflow-y-auto">
            {DATE_OPTIONS.map((option) => {
              const OptionIcon = IconComponent[option.icon] || Calendar;
              const isSelected = selectedTimeframe === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => {
                    if (option.id === CUSTOM) {
                      openDatePicker();
                    } else {
                      selectTimeframe({ optionId: option.id });
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full flex items-center px-4 py-2.5 text-left transition-colors ${
                    isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 ${isSelected ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                    <OptionIcon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{option.label}</div>
                    <div className={`text-xs ${isSelected ? 'text-indigo-500' : 'text-gray-400'}`}>
                      {OPTION_DESCRIPTIONS[option.id]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}

      {showDatePicker && ReactDOM.createPortal(
        <div ref={menuRef} style={menuStyle} className="w-max p-4 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-y-auto">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Select Custom Range</h3>
            <button
              onClick={() => setShowDatePicker(false)}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateRangeSelect}
            openToDate={startDate ?? toLocalDate(DEMO_AS_OF_DATE)}
            monthsShown={2}
            inline
            calendarClassName="custom-schoolie-calendar"
          />
        </div>,
        document.body
      )}

      <style>{`
        .custom-schoolie-calendar {
          font-family: inherit;
          border: none !important;
        }
        .react-datepicker__header {
          background-color: white !important;
          border-bottom: 1px solid #f3f4f6 !important;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--in-range,
        .react-datepicker__day--in-selecting-range {
          background-color: #4f46e5 !important;
          border-radius: 0.375rem !important;
        }
      `}</style>
    </div>
  );
};

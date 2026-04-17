import React, { useState, useRef, useEffect } from 'react';
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

const CUSTOM = 'custom';

const IconComponent: Record<string, LucideIcon> = {
  Calendar,
  Clock,
  History,
  CalendarDays,
  CalendarRange,
  BookOpen,
};

// Updated list to include the missing timeframe options
const DATE_OPTIONS = [
  { id: 'today', label: 'Today', description: 'April 16, 2026', icon: 'Clock' },
  { id: 'yesterday', label: 'Yesterday', description: 'April 15, 2026', icon: 'History' },
  { id: 'this_week', label: 'This Week', description: 'Week of April 15', icon: 'CalendarDays' },
  { id: 'last_week', label: 'Last Week', description: 'Week of April 11', icon: 'CalendarDays' },
  { id: 'this_month', label: 'This Month', description: 'April 2026', icon: 'Calendar' },
  { id: 'last_month', label: 'Last Month', description: 'March 2026', icon: 'Calendar' },
  { id: 'ytd', label: 'Year to Date', description: '2025 - 2026', icon: 'CalendarRange' },
  { id: 'prior_year', label: 'Prior Year', description: '2024 - 2025', icon: 'BookOpen' },
  { id: 'sy2324', label: 'SY 2023 - 2024', description: '2023 - 2024', icon: 'BookOpen' },
  { id: 'sy2223', label: 'SY 2022 - 2023', description: '2022 - 2023', icon: 'BookOpen' },
  { id: 'sy2122', label: 'SY 2021 - 2022', description: '2021 - 2022', icon: 'BookOpen' },
  { id: 'sy2021', label: 'SY 2020 - 2021', description: '2020 - 2021', icon: 'BookOpen' },
  { id: CUSTOM, label: 'Custom Range', description: 'Select a custom date range', icon: 'CalendarRange' },
];

export const TimeframeSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [startDate, setStartDate] = useState<Date | null>(new Date('2026-04-16'));
  const [endDate, setEndDate] = useState<Date | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = DATE_OPTIONS.find((t) => t.id === selectedTimeframe) || DATE_OPTIONS[0];
  const Icon = IconComponent[selectedOption.icon] || Calendar;

  const handleDateRangeSelect = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      setSelectedTimeframe(CUSTOM);
      setIsOpen(false);
      setShowDatePicker(false);
    }
  };

  const getDisplayLabel = () => {
    if (selectedTimeframe === CUSTOM && startDate && endDate) {
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    }
    return selectedOption.label;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200 rounded-lg shadow-sm w-full md:w-auto"
      >
        <Icon className="w-4 h-4 text-indigo-500" />
        <span className="text-sm font-semibold whitespace-nowrap">
          {getDisplayLabel()}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !showDatePicker && (
        <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in duration-150">
          <div className="py-2 max-h-[400px] overflow-y-auto">
            {DATE_OPTIONS.map((option) => {
              const OptionIcon = IconComponent[option.icon] || Calendar;
              const isSelected = selectedTimeframe === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => {
                    if (option.id === CUSTOM) {
                      setShowDatePicker(true);
                    } else {
                      setSelectedTimeframe(option.id);
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
                      {option.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showDatePicker && (
        <div className="absolute left-0 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 animate-in slide-in-from-top-2">
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
            monthsShown={2}
            inline
            calendarClassName="custom-schoolie-calendar"
          />
        </div>
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
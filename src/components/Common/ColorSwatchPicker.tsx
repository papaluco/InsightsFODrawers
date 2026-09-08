import { useEffect, useRef } from 'react';
import { Pencil } from 'lucide-react';

interface ColorSwatchPickerProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

const ColorSwatchPicker = ({ label, value, onChange }: ColorSwatchPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const lastEmittedValue = useRef(value);

  // Deliberately uncontrolled: only push `value` into the DOM node when it
  // changed for a reason other than this input's own onChange (e.g. a preset
  // was selected elsewhere). Re-assigning .value on every render caused by
  // this input's own drag/onChange fights the native color-picker popup's
  // internal state and can abort an in-progress drag.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    if (value !== lastEmittedValue.current) {
      input.value = value;
    }
    lastEmittedValue.current = value;
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    lastEmittedValue.current = e.target.value;
    onChange(e.target.value);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700 w-24 shrink-0">{label}</span>
      <label
        className="group relative inline-flex w-9 h-9 rounded-full border border-gray-300 shadow-sm cursor-pointer overflow-hidden transition-shadow hover:shadow-md hover:ring-2 hover:ring-primary hover:ring-offset-2 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
        style={{ backgroundColor: value }}
        aria-label={`Change ${label} color`}
      >
        <input
          ref={inputRef}
          type="color"
          defaultValue={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
        />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
          <Pencil className="w-3.5 h-3.5 text-white" />
        </span>
      </label>
    </div>
  );
};

export default ColorSwatchPicker;

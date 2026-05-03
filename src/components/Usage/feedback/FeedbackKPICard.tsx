import React from 'react';

interface Props {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  colorClass: string;
  onClick?: () => void;
}

const FeedbackKPICard: React.FC<Props> = ({ label, value, subtitle, icon, colorClass, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-500 ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
  >
    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}>
      {icon}
    </div>
    <div className="flex flex-1 flex-col">
      <p className="text-sm font-medium text-gray-500 mb-0.5">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-gray-900">{value}</span>
        {subtitle && <span className="text-xl font-bold text-gray-400">{subtitle}</span>}
      </div>
    </div>
  </div>
);

export default FeedbackKPICard;

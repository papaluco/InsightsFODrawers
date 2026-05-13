import React, { useState } from 'react';
import { SchoolieIcon } from '../Common/Icons';
import { CopyMenu } from '../Common/CopyMenu';
import { toBlob } from 'html-to-image';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { useRef } from 'react';

// Mock data to match the visual in your screenshot
const MOCK_CHART_DATA = [
  { name: "Jul 2024", value: 53, benchmark: 2800 },
  { name: "Aug 2024", value: 199, benchmark: 4500 },
  { name: "Sep 2024", value: 115, benchmark: 4200 },
  { name: "Oct 2024", value: 114, benchmark: 3500 },
  { name: "Nov 2024", value: 65, benchmark: 2000 },
  { name: "Dec 2024", value: 97, benchmark: 5200 },
  { name: "Jan 2025", value: 111, benchmark: 5500 },
  { name: "Feb 2025", value: 220, benchmark: 6500 },
  { name: "Mar 2025", value: 139, benchmark: 6500 },
  { name: "Apr 2025", value: 1252, benchmark: 2500 },
  { name: "May 2025", value: 19221, benchmark: 4200 },
  { name: "Jun 2025", value: 2553, benchmark: 2200 },
];

interface PerformanceTrendsProps {
  onSchoolieClick?: () => void;
}

export const PerformanceTrends: React.FC<PerformanceTrendsProps> = ({ onSchoolieClick }) => {
  const [selectedKPI, setSelectedKPI] = useState('MEQs');

  // Logic to determine bar color based on value vs benchmark (from your screenshot)
  const getBarColor = (value: number, benchmark: number) => {
    if (value > benchmark) return "#22c55e"; // Green (Success)
    return "#ef4444"; // Red (Below Benchmark)
  };

 
    // Function to export chart as an image
    const chartRef = useRef<HTMLDivElement>(null);

    const copyChartDataToClipboard = async () => {
      const headers = ['Month', 'Actual', 'Benchmark'];

      const rows = MOCK_CHART_DATA.map((item) => [
        item.name,
        item.value.toLocaleString(),
        item.benchmark.toLocaleString(),
      ]);

      const text = [
        'Performance Trends',
        `KPI: ${selectedKPI}`,
        '',
        [headers, ...rows].map((row) => row.join('\t')).join('\n'),
      ].join('\n');

      await navigator.clipboard.writeText(text);
    };

    const copyChartImageToClipboard = async () => {
      if (!chartRef.current) return;

      if (!navigator.clipboard || !window.ClipboardItem) {
        await copyChartDataToClipboard();
        return;
      }

      const blob = await toBlob(chartRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });

      if (!blob) return;

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
    };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-bold text-gray-800">Performance Trends</h3>
        <div className="flex items-center gap-2">

          {/* Copy Button Section */}
        
          <CopyMenu onCopyData={copyChartDataToClipboard} onCopyImage={copyChartImageToClipboard} />

          {/* Schoolie Button Section */}
          {onSchoolieClick && (
            <button
              onClick={onSchoolieClick}
              title="Ask Schoolie"
              className="flex items-center justify-center w-[40px] h-[40px] bg-white rounded-lg hover:shadow-sm transition-all group border-none"
            >
              <SchoolieIcon size={24} className="text-gray-500 group-hover:text-indigo-600 transition-colors"
              />
            </button>
          )}
          <select
            value={selectedKPI}
            onChange={(e) => setSelectedKPI(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MEQs">MEQs</option>
            <option value="Meals">Meals</option>
            <option value="Revenue">Revenue</option>
          </select>
        </div>
      </div>

      {/* Chart Export Container */}
      <div ref={chartRef} className="bg-white">
        {/* Chart Container */}
        <div className="h-[400px] min-h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%" debounce={1}>
            <ComposedChart
              data={MOCK_CHART_DATA}
              margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: '#0f172a',
                  fontSize: 9,
                  fontWeight: 400,
                  letterSpacing: '0.1em'
                }}
                angle={-45}
                textAnchor="end"
                height={60}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: '#0f172a',
                  fontSize: 9,
                  fontWeight: 400,
                  letterSpacing: '0.1em'
                }}
                tickFormatter={(val) => val.toLocaleString()}
                width={60}
                label={{
                  value: 'NUMBER',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  style: {
                    fill: '#0f172a',
                    fontSize: 10,
                    fontWeight: 400,
                    letterSpacing: '0.2em',
                    textAnchor: 'middle'
                  }
                }}
              />

              <Tooltip
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />

              <Legend
                verticalAlign="bottom"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingTop: '40px' }}
              />

              <Bar dataKey="value" name="Actual" barSize={25} radius={[4, 4, 0, 0]}>
                {MOCK_CHART_DATA.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.value, entry.benchmark)}
                  />
                ))}
              </Bar>

              <Line
                type="monotone"
                dataKey="benchmark"
                name="Benchmark"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 4, fill: '#fff', stroke: '#6366f1', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* X-Axis Central Label */}
        <div className="text-center text-xs font-normal text-slate-900 uppercase tracking-widest mt-3">
          Months
        </div>
      </div>
    </div>
  );
};
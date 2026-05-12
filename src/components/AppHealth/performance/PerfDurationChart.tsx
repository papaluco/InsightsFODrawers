import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer,
} from 'recharts';
import type { CategoryStat } from '../../../services/performanceService';
import { CAT_LABEL, fmtMs, slowColor } from './perfHelpers';

interface Props {
  stats: CategoryStat[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as CategoryStat;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold text-gray-800">{CAT_LABEL[d.category] ?? d.category}</p>
      <p className="text-gray-600">Avg: <span className="font-bold text-gray-900">{fmtMs(d.avgMs)}</span></p>
      <p className="text-gray-600">p95: <span className="font-bold text-gray-900">{fmtMs(d.p95Ms)}</span></p>
      <p className="text-gray-600">Events: <span className="font-bold text-gray-900">{d.count}</span></p>
      <p className="text-gray-600">Slow: <span className="font-bold" style={{ color: slowColor(d.slowPct) }}>{d.slowPct}%</span></p>
    </div>
  );
};

const PerfDurationChart: React.FC<Props> = ({ stats }) => {
  if (stats.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-center h-48">
        <p className="text-sm text-gray-400">No data</p>
      </div>
    );
  }

  const data = [...stats]
    .sort((a, b) => b.avgMs - a.avgMs)
    .map(s => ({ ...s, label: CAT_LABEL[s.category] ?? s.category }));

  const chartH = Math.max(200, data.length * 44);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Avg Duration by Category</h3>
      <ResponsiveContainer width="100%" height={chartH}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
          <XAxis
            type="number"
            dataKey="avgMs"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickFormatter={fmtMs}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={120}
            tick={{ fontSize: 11, fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="avgMs" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((d, i) => (
              <Cell key={i} fill={slowColor(d.slowPct)} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {[
          { label: 'Fast (<10% slow)', color: '#10b981' },
          { label: 'Moderate (10–20%)', color: '#fbbf24' },
          { label: 'Elevated (20–40%)', color: '#f97316' },
          { label: 'Critical (40%+)', color: '#e11d48' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerfDurationChart;

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { ErrorKpis } from '../../../services/errorsService';
import { SEV_COLORS } from './errorHelpers';

interface Props {
  kpis: ErrorKpis;
}

const SEV_ITEMS = [
  { key: 'critical', label: 'Critical' },
  { key: 'high',     label: 'High'     },
  { key: 'medium',   label: 'Medium'   },
  { key: 'low',      label: 'Low'      },
] as const;

const ErrorSeverityChart: React.FC<Props> = ({ kpis }) => {
  const data = SEV_ITEMS
    .map(s => ({ name: s.label, value: kpis[s.key], color: SEV_COLORS[s.key] }))
    .filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">No errors in current filter</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">By Severity</h3>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [value, name]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-xs text-gray-500">{d.name}</span>
            <span className="text-xs font-semibold text-gray-800">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorSeverityChart;

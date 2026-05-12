import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { PerfKpis } from '../../../services/performanceService';
import { fmtMs } from './perfHelpers';

interface Props {
  kpis: PerfKpis;
}

const COLORS = { slow: '#f97316', fast: '#10b981' };

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs">
      <span className="font-semibold text-gray-800">{name}:</span>{' '}
      <span className="text-gray-600">{value} events</span>
    </div>
  );
};

const PerfSlowChart: React.FC<Props> = ({ kpis }) => {
  const fastCount = kpis.total - kpis.slowCount;
  const data = [
    { name: 'Slow', value: kpis.slowCount },
    { name: 'Fast', value: fastCount },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Slow vs Fast</h3>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center">
        {kpis.total === 0 ? (
          <p className="text-sm text-gray-400">No data</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill={COLORS.slow} />
                  <Cell fill={COLORS.fast} />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="text-center -mt-1 mb-2">
              <p className="text-3xl font-bold" style={{ color: kpis.slowPct >= 20 ? '#f97316' : '#10b981' }}>
                {kpis.slowPct}%
              </p>
              <p className="text-xs text-gray-500">slow events</p>
            </div>

            <div className="w-full space-y-2 mt-1">
              {[
                { label: 'Slow', count: kpis.slowCount, color: COLORS.slow },
                { label: 'Fast', count: fastCount,       color: COLORS.fast },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: row.color }} />
                    <span className="text-gray-600">{row.label}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{row.count.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">p50</span>
                  <span className="font-semibold text-gray-700">{fmtMs(kpis.p50Ms)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">p95</span>
                  <span className="font-semibold text-gray-700">{fmtMs(kpis.p95Ms)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">avg</span>
                  <span className="font-semibold text-gray-700">{fmtMs(kpis.avgMs)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PerfSlowChart;

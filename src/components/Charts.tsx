import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { Table as TableIcon, LineChart as ChartIcon, Download, PieChart as PieIcon } from 'lucide-react';
import { WageProgressionPoint, RetentionCurvePoint, NonPlacementReasonStat } from '../types.ts';

// Chart series palette per specification
const CHART_COLORS = {
  chart1: '#8B95F0', // Periwinkle / Indigo
  chart2: '#8FE0B0', // Mint
  chart3: '#8CC8F5', // Sky
  chart4: '#B9A8F0', // Lavender
  chart5: '#E8853A', // Saffron action
  chart6: '#E58CA5', // Rose
  ink: '#1B1F2A',
  muted: '#8F97A8',
  border: '#2B3140'
};

const STATUS_COLORS: Record<string, string> = {
  'Wage Employed': '#8B95F0', // chart-1
  'Self-Employed': '#8FE0B0', // chart-2
  'Apprenticeship': '#8CC8F5', // chart-3
  'Further Study': '#B9A8F0', // chart-4
  'Unemployed': '#E55A5A',    // danger
  'Not Reachable': '#E0A03A'  // warning
};

// 1. Outcome Status Distribution Donut Chart (per specification: 62% inner radius, legend list on right with dot & percentage, total in center)
export const OutcomeStatusChart: React.FC<{
  breakdown: Record<string, number>;
  total: number;
}> = ({ breakdown, total }) => {
  const [viewMode, setViewMode] = useState<'donut' | 'table'>('donut');

  const data = Object.entries(breakdown)
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      color: STATUS_COLORS[name] || '#8B95F0'
    }))
    .filter((d) => d.count > 0);

  const calculatedTotal = total > 0 ? total : data.reduce((acc, d) => acc + d.count, 0);

  const exportCsv = () => {
    const csv = 'Status,Trainees,Percentage\n' + data.map((d) => `"${d.name}",${d.count},${d.percentage}%`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'outcome-statuses.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col justify-between">
      {/* Header controls: Table toggle & Export */}
      <div className="flex items-center justify-end gap-2 mb-2">
        <button
          type="button"
          onClick={() => setViewMode((m) => (m === 'donut' ? 'table' : 'donut'))}
          className="text-xs text-slate-500 dark:text-[#8F97A8] hover:text-slate-800 dark:hover:text-[#E6E9F0] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded border border-[#E3E6EC] dark:border-[#2B3140]"
        >
          {viewMode === 'donut' ? (
            <>
              <TableIcon className="w-3 h-3" />
              <span>View as table</span>
            </>
          ) : (
            <>
              <PieIcon className="w-3 h-3" />
              <span>View as chart</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={exportCsv}
          className="text-xs text-slate-500 dark:text-[#8F97A8] hover:text-slate-800 dark:hover:text-[#E6E9F0] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded border border-[#E3E6EC] dark:border-[#2B3140]"
          title="Export CSV"
        >
          <Download className="w-3 h-3" />
          <span>CSV</span>
        </button>
      </div>

      {viewMode === 'table' ? (
        <div className="overflow-x-auto max-h-64 my-1">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E3E6EC] dark:border-[#2B3140] text-slate-500 dark:text-[#8F97A8]">
                <th className="py-2 px-2 font-semibold">Classification</th>
                <th className="py-2 px-2 text-right font-semibold">Trainees</th>
                <th className="py-2 px-2 text-right font-semibold">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6EC] dark:divide-[#2B3140]">
              {data.map((d) => (
                <tr key={d.name} className="hover:bg-slate-50 dark:hover:bg-[#1F2430]">
                  <td className="py-2 px-2 flex items-center gap-2 text-slate-800 dark:text-[#E6E9F0]">
                    <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: d.color }} />
                    <span>{d.name}</span>
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-slate-900 dark:text-[#E6E9F0]">
                    {d.count.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-2 text-right font-semibold text-slate-800 dark:text-white">
                    {d.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 min-h-[260px] py-1">
          {/* Donut graphic with center label */}
          <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minHeight={180} minWidth={180}>
              <PieChart>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${Number(val).toLocaleString('en-IN')} trainees (${item?.payload?.percentage}%)`,
                    name
                  ]}
                  contentStyle={{
                    backgroundColor: '#171B24',
                    borderColor: '#2B3140',
                    borderRadius: 8,
                    fontSize: 12,
                    color: '#E6E9F0'
                  }}
                />
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="62%"
                  outerRadius="92%"
                  paddingAngle={2}
                  isAnimationActive={true}
                >
                  {data.map((entry, index) => (
                    <Cell key={`donut-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Total Count */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#E6E9F0] font-mono">
                {calculatedTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#8F97A8]">
                Trainees
              </span>
            </div>
          </div>

          {/* Right-aligned Legend list with dot, label & percentage */}
          <div className="flex-1 w-full space-y-1.5 text-xs">
            {data.map((entry) => (
              <div
                key={entry.name}
                className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-[#1F2430] transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="truncate text-slate-700 dark:text-[#E6E9F0]">{entry.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono shrink-0">
                  <span className="text-slate-400 text-[11px] hidden sm:inline">
                    ({entry.count.toLocaleString('en-IN')})
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white w-9 text-right">
                    {entry.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 2. Longitudinal Wage Progression Chart (3m, 6m, 12m + Minimum Wage line)
export const WageProgressionChart: React.FC<{ data: WageProgressionPoint[] }> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [activeTrade, setActiveTrade] = useState<'all' | 'it' | 'mfg'>('all');

  // Normalize data safely so nulls or missing fields don't cause zero-render
  const chartData = (data && data.length > 0 ? data : [
    { checkpoint: '3 Months', wage: 16140, avgWage: 16140, all: 16140, itSector: 18100, mfgSector: 15400, targetWage: 12500 },
    { checkpoint: '6 Months', wage: 16875, avgWage: 16875, all: 16875, itSector: 19400, mfgSector: 16500, targetWage: 12500 },
    { checkpoint: '12 Months', wage: 17015, avgWage: 17015, all: 17015, itSector: 20750, mfgSector: 17350, targetWage: 12500 }
  ]).map((d) => {
    const mainWage = d.all ?? d.wage ?? d.avgWage ?? 15000;
    return {
      checkpoint: d.checkpoint,
      all: mainWage,
      itSector: d.itSector ?? Math.round(mainWage * 1.15),
      mfgSector: d.mfgSector ?? Math.round(mainWage * 0.98),
      targetWage: 12500
    };
  });

  const exportCsv = () => {
    const csv =
      'Checkpoint,Cohort_Avg_Wage,IT_Trade,Manufacturing_Trade,Min_Wage_Target\n' +
      chartData.map((d) => `"${d.checkpoint}",${d.all},${d.itSector},${d.mfgSector},${d.targetWage}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wage-progression.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col justify-between">
      {/* Chart controls & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-[#E3E6EC] dark:border-[#2B3140]">
        {/* Metric tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1F2430] p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTrade('all')}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTrade === 'all'
                ? 'bg-white dark:bg-[#2B3140] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-[#8F97A8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Trades
          </button>
          <button
            type="button"
            onClick={() => setActiveTrade('it')}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTrade === 'it'
                ? 'bg-white dark:bg-[#2B3140] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-[#8F97A8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            IT / ITES
          </button>
          <button
            type="button"
            onClick={() => setActiveTrade('mfg')}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTrade === 'mfg'
                ? 'bg-white dark:bg-[#2B3140] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-[#8F97A8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Manufacturing
          </button>
        </div>

        {/* View & Export */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'chart' ? 'table' : 'chart'))}
            className="text-xs text-slate-500 dark:text-[#8F97A8] hover:text-slate-800 dark:hover:text-[#E6E9F0] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded border border-[#E3E6EC] dark:border-[#2B3140]"
          >
            {viewMode === 'chart' ? (
              <>
                <TableIcon className="w-3 h-3" />
                <span>View as table</span>
              </>
            ) : (
              <>
                <ChartIcon className="w-3 h-3" />
                <span>View as chart</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="text-xs text-slate-500 dark:text-[#8F97A8] hover:text-slate-800 dark:hover:text-[#E6E9F0] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded border border-[#E3E6EC] dark:border-[#2B3140]"
            title="Export CSV"
          >
            <Download className="w-3 h-3" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="overflow-x-auto min-h-[260px] my-1">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E3E6EC] dark:border-[#2B3140] text-slate-500 dark:text-[#8F97A8]">
                <th className="py-2 px-3 font-semibold">Checkpoint</th>
                <th className="py-2 px-3 text-right font-semibold">Cohort Average</th>
                <th className="py-2 px-3 text-right font-semibold">IT / ITES</th>
                <th className="py-2 px-3 text-right font-semibold">Manufacturing</th>
                <th className="py-2 px-3 text-right font-semibold">Min. Wage Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6EC] dark:divide-[#2B3140]">
              {chartData.map((d) => (
                <tr key={d.checkpoint} className="hover:bg-slate-50 dark:hover:bg-[#1F2430]">
                  <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-[#E6E9F0]">{d.checkpoint}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ₹{d.all.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sky-600 dark:text-[#8CC8F5]">
                    ₹{d.itSector.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-[#8FE0B0]">
                    ₹{d.mfgSector.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-500">
                    ₹{d.targetWage.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="w-full h-64 min-h-[260px] my-1">
          <ResponsiveContainer width="100%" height={260} minHeight={260}>
            <LineChart data={chartData} margin={{ top: 12, right: 24, left: 0, bottom: 4 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-slate-200 dark:text-[#2B3140]"
                opacity={0.4}
              />
              <XAxis
                dataKey="checkpoint"
                stroke="currentColor"
                className="text-slate-500 dark:text-[#8F97A8] text-xs"
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#8F97A8' }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                domain={[10000, 24000]}
                stroke="currentColor"
                className="text-slate-500 dark:text-[#8F97A8] text-xs"
                tickLine={false}
              />
              <Tooltip
                formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString('en-IN')}`, name]}
                contentStyle={{
                  backgroundColor: '#171B24',
                  borderColor: '#2B3140',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#E6E9F0'
                }}
              />
              {/* Reference line for Maharashtra minimum wage ₹12,500 */}
              <ReferenceLine
                y={12500}
                stroke="#E55A5A"
                strokeDasharray="4 4"
                label={{
                  value: 'Min Wage: ₹12.5k',
                  fill: '#E55A5A',
                  fontSize: 10,
                  position: 'insideBottomRight'
                }}
              />

              {/* Primary Cohort Wage Line (solid line) */}
              <Line
                type="monotone"
                dataKey="all"
                name="Cohort Average"
                stroke="#E8853A"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#E8853A' }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
              />

              {/* Secondary comparison lines */}
              {(activeTrade === 'all' || activeTrade === 'it') && (
                <Line
                  type="monotone"
                  dataKey="itSector"
                  name="IT / ITES Sector"
                  stroke="#8CC8F5"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#8CC8F5' }}
                  isAnimationActive={true}
                />
              )}

              {(activeTrade === 'all' || activeTrade === 'mfg') && (
                <Line
                  type="monotone"
                  dataKey="mfgSector"
                  name="Manufacturing Sector"
                  stroke="#8FE0B0"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#8FE0B0' }}
                  isAnimationActive={true}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
          {/* Custom visible legend per spec */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 dark:text-[#8F97A8] mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#E8853A]" />
              <span className="font-medium text-slate-800 dark:text-[#E6E9F0]">Cohort Average (Solid)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-[#8CC8F5]" />
              <span>IT / ITES</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-[#8FE0B0]" />
              <span>Manufacturing</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-[#E55A5A]" />
              <span className="text-rose-500">Min. Wage (₹12,500)</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. Longitudinal Retention Curve (3m, 6m, 12m)
export const RetentionCurveChart: React.FC<{ data: RetentionCurvePoint[] }> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  // Normalize data safely
  const chartData = (data && data.length > 0 ? data : [
    { checkpoint: '3 Months', retention: 100, retentionPct: 100, targetPct: 70 },
    { checkpoint: '6 Months', retention: 59, retentionPct: 59, targetPct: 70 },
    { checkpoint: '12 Months', retention: 36, retentionPct: 36, targetPct: 70 }
  ]).map((d) => ({
    checkpoint: d.checkpoint || d.interval || 'Checkpoint',
    retention: d.retention ?? d.retentionPct ?? d.rate ?? 50,
    targetPct: d.targetPct ?? 70
  }));

  const exportCsv = () => {
    const csv =
      'Checkpoint,Retention_Pct,Policy_Target_Pct\n' +
      chartData.map((d) => `"${d.checkpoint}",${d.retention}%,${d.targetPct}%`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retention-curve.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col justify-between">
      {/* Header Controls */}
      <div className="flex items-center justify-end gap-2 mb-2 pb-1 border-b border-[#E3E6EC] dark:border-[#2B3140]">
        <button
          type="button"
          onClick={() => setViewMode((m) => (m === 'chart' ? 'table' : 'chart'))}
          className="text-xs text-slate-500 dark:text-[#8F97A8] hover:text-slate-800 dark:hover:text-[#E6E9F0] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded border border-[#E3E6EC] dark:border-[#2B3140]"
        >
          {viewMode === 'chart' ? (
            <>
              <TableIcon className="w-3 h-3" />
              <span>View as table</span>
            </>
          ) : (
            <>
              <ChartIcon className="w-3 h-3" />
              <span>View as chart</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={exportCsv}
          className="text-xs text-slate-500 dark:text-[#8F97A8] hover:text-slate-800 dark:hover:text-[#E6E9F0] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded border border-[#E3E6EC] dark:border-[#2B3140]"
          title="Export CSV"
        >
          <Download className="w-3 h-3" />
          <span>CSV</span>
        </button>
      </div>

      {viewMode === 'table' ? (
        <div className="overflow-x-auto min-h-[260px] my-1">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E3E6EC] dark:border-[#2B3140] text-slate-500 dark:text-[#8F97A8]">
                <th className="py-2 px-3 font-semibold">Interval</th>
                <th className="py-2 px-3 text-right font-semibold">Trainee Retention</th>
                <th className="py-2 px-3 text-right font-semibold">Policy Benchmark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6EC] dark:divide-[#2B3140]">
              {chartData.map((d) => (
                <tr key={d.checkpoint} className="hover:bg-slate-50 dark:hover:bg-[#1F2430]">
                  <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-[#E6E9F0]">{d.checkpoint}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {d.retention}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-500">
                    {d.targetPct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="w-full h-64 min-h-[260px] my-1">
          <ResponsiveContainer width="100%" height={260} minHeight={260}>
            <LineChart data={chartData} margin={{ top: 12, right: 24, left: 0, bottom: 4 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-slate-200 dark:text-[#2B3140]"
                opacity={0.4}
              />
              <XAxis
                dataKey="checkpoint"
                stroke="currentColor"
                className="text-slate-500 dark:text-[#8F97A8] text-xs"
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                unit="%"
                stroke="currentColor"
                className="text-slate-500 dark:text-[#8F97A8] text-xs"
                tickLine={false}
              />
              <Tooltip
                formatter={(val: any) => [`${val}%`, 'Retention Rate']}
                contentStyle={{
                  backgroundColor: '#171B24',
                  borderColor: '#2B3140',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#E6E9F0'
                }}
              />
              <ReferenceLine
                y={70}
                stroke="#E0A03A"
                strokeDasharray="4 4"
                label={{
                  value: 'Target (70%)',
                  fill: '#E0A03A',
                  fontSize: 10,
                  position: 'insideTopLeft'
                }}
              />
              <Line
                type="monotone"
                dataKey="retention"
                name="Cohort Retention"
                stroke="#E8853A"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#E8853A' }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="targetPct"
                name="Policy Target"
                stroke="#8F97A8"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
          {/* Custom visible legend */}
          <div className="flex items-center justify-center gap-6 text-xs text-slate-600 dark:text-[#8F97A8] mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#E8853A]" />
              <span className="font-medium text-slate-800 dark:text-[#E6E9F0]">Cohort Retention (Solid)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-[#8F97A8]" />
              <span>Policy Target 70% (Dashed)</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. Non-Placement Reasons Mini-Bar List (per specification: label on the left, 6px track with pastel fill in middle, percentage on right, sorted descending)
export const NonPlacementReasonsChart: React.FC<{ data: NonPlacementReasonStat[] }> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'bars' | 'table'>('bars');

  // Sort descending per specification
  const sortedData = [...(data || [])].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));

  const exportCsv = () => {
    const csv =
      'Reason,Count,Percentage\n' +
      sortedData.map((d) => `"${d.reason}",${d.count},${d.percentage}%`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'non-placement-reasons.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col justify-between">
      {/* Header Controls */}
      <div className="flex items-center justify-end gap-2 mb-2 pb-1 border-b border-[#E3E6EC] dark:border-[#2B3140]">
        <button
          type="button"
          onClick={() => setViewMode((m) => (m === 'bars' ? 'table' : 'bars'))}
          className="text-xs text-slate-500 dark:text-[#8F97A8] hover:text-slate-800 dark:hover:text-[#E6E9F0] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded border border-[#E3E6EC] dark:border-[#2B3140]"
        >
          {viewMode === 'bars' ? (
            <>
              <TableIcon className="w-3 h-3" />
              <span>View as table</span>
            </>
          ) : (
            <>
              <ChartIcon className="w-3 h-3" />
              <span>View as list</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={exportCsv}
          className="text-xs text-slate-500 dark:text-[#8F97A8] hover:text-slate-800 dark:hover:text-[#E6E9F0] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded border border-[#E3E6EC] dark:border-[#2B3140]"
          title="Export CSV"
        >
          <Download className="w-3 h-3" />
          <span>CSV</span>
        </button>
      </div>

      {viewMode === 'table' ? (
        <div className="overflow-x-auto max-h-64 my-1">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E3E6EC] dark:border-[#2B3140] text-slate-500 dark:text-[#8F97A8]">
                <th className="py-2 px-2 font-semibold">Root Cause</th>
                <th className="py-2 px-2 text-right font-semibold">Count</th>
                <th className="py-2 px-2 text-right font-semibold">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6EC] dark:divide-[#2B3140]">
              {sortedData.map((d) => (
                <tr key={d.reason} className="hover:bg-slate-50 dark:hover:bg-[#1F2430]">
                  <td className="py-2 px-2 text-slate-800 dark:text-[#E6E9F0] font-medium">{d.reason}</td>
                  <td className="py-2 px-2 text-right font-mono text-slate-900 dark:text-white">
                    {d.count.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-2 text-right font-semibold text-slate-900 dark:text-white">
                    {d.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Mini-bar list per specification */
        <div className="space-y-3 py-2">
          {sortedData.map((d, index) => {
            // Colors: top 1 is rose, next 2 are saffron/amber, rest pastel sky/periwinkle
            const barFill =
              index === 0
                ? '#E55A5A' // danger
                : index < 3
                ? '#E8853A' // saffron accent
                : '#8B95F0'; // pastel periwinkle

            return (
              <div key={d.reason} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-[#E6E9F0] truncate max-w-[200px]">
                    {d.reason}
                  </span>
                  <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                    <span className="text-slate-400 text-[11px] hidden sm:inline">
                      {d.count.toLocaleString('en-IN')} youth
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white w-8 text-right">
                      {d.percentage}%
                    </span>
                  </div>
                </div>
                {/* 6px track with pastel fill */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-[#1F2430] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(2, (d.percentage / 30) * 100))}%`,
                      backgroundColor: barFill
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 5. Verification Confidence Split Bar
export const ConfidenceSplitBar: React.FC<{
  high: number;
  medium: number;
  low: number;
}> = ({ high, medium, low }) => {
  return (
    <div className="space-y-2">
      <div className="h-3 w-full bg-slate-100 dark:bg-[#1F2430] rounded-full overflow-hidden flex shadow-inner">
        <div
          style={{ width: `${high}%` }}
          className="bg-emerald-500 h-full transition-all duration-500"
          title={`High (Dual-Verified): ${high}%`}
        />
        <div
          style={{ width: `${medium}%` }}
          className="bg-amber-400 h-full transition-all duration-500"
          title={`Medium (Assisted/Employer): ${medium}%`}
        />
        <div
          style={{ width: `${low}%` }}
          className="bg-slate-300 dark:bg-slate-600 h-full transition-all duration-500"
          title={`Low (Unverified/Self): ${low}%`}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#8F97A8] pt-0.5">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>High ({high}%)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Medium ({medium}%)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span>Low ({low}%)</span>
        </span>
      </div>
    </div>
  );
};

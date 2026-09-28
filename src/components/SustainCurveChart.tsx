import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Info,
  ChevronDown,
  Download,
  Table as TableIcon,
  LineChart as ChartIcon
} from 'lucide-react';

export interface CurvePoint {
  month: number;
  retained: number;
  lower: number;
  upper: number;
  n: number;
}

export interface CurveData {
  id: string;
  name: string;
  type: string;
  points: CurvePoint[];
  reliability: 'Reliable' | 'Low sample' | 'Insufficient';
  sample_size: number;
  coverage: number;
  ldi: number | null;
  band: string;
  shrunk_ratio?: number;
  notes?: string;
}

interface SustainCurveChartProps {
  cohort?: string;
  selectedEntity?: { type: string; id: string; name?: string };
  onSelectEntity?: (entity: { type: string; id: string; name?: string }) => void;
  compareWithState?: boolean;
  compact?: boolean;
}

const DEFAULT_STATE_BENCHMARK: CurvePoint[] = [
  { month: 3, retained: 1.0, lower: 1.0, upper: 1.0, n: 708 },
  { month: 6, retained: 0.79, lower: 0.76, upper: 0.82, n: 671 },
  { month: 12, retained: 0.65, lower: 0.61, upper: 0.68, n: 406 },
  { month: 18, retained: 0.55, lower: 0.50, upper: 0.59, n: 216 },
  { month: 24, retained: 0.47, lower: 0.42, upper: 0.52, n: 114 }
];

export const SustainCurveChart: React.FC<SustainCurveChartProps> = ({
  cohort = 'all',
  selectedEntity = { type: 'state', id: 'state', name: 'Maharashtra State Benchmark' },
  onSelectEntity,
  compareWithState = true,
  compact = false
}) => {
  const [data, setData] = useState<{
    curves: CurveData[];
    benchmark?: CurveData;
    state_benchmark?: CurveData;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showConfidence, setShowConfidence] = useState(true);
  const [showComparison, setShowComparison] = useState(compareWithState);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [entityOptions, setEntityOptions] = useState<{ id: string; name: string; type: string }[]>([]);

  // Fetch options for entity picker dropdown
  useEffect(() => {
    fetch('/api/durability/leaderboard?group_by=provider&cohort=' + cohort)
      .then((r) => r.json())
      .then((res) => {
        if (res.items) {
          const provs = res.items.map((it: any) => ({
            id: it.id,
            name: it.name,
            type: 'provider'
          }));
          setEntityOptions([
            { id: 'state', name: 'Maharashtra State Benchmark', type: 'state' },
            ...provs
          ]);
        }
      })
      .catch((err) => console.error('Failed to load entity options:', err));
  }, [cohort]);

  // Fetch curve data
  useEffect(() => {
    setLoading(true);
    setError(null);

    const isState = selectedEntity.type === 'state' || selectedEntity.id === 'state';
    const groupBy = isState ? 'state' : selectedEntity.type;
    const entityId = isState ? '' : selectedEntity.id;

    const url = `/api/durability/curve?group_by=${groupBy}${entityId ? `&entity_id=${entityId}` : ''}&cohort=${cohort}&with_state=true`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch sustain curve');
        return r.json();
      })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Curve fetch error:', err);
        setError(err.message || 'Error loading curve');
        setLoading(false);
      });
  }, [cohort, selectedEntity]);

  // Primary curve
  const primaryCurve = useMemo(() => {
    if (!data?.curves || data.curves.length === 0) {
      return {
        id: 'state',
        name: 'Maharashtra State Benchmark',
        type: 'state',
        points: DEFAULT_STATE_BENCHMARK,
        reliability: 'Reliable' as const,
        sample_size: 708,
        coverage: 100,
        ldi: 61,
        band: 'Moderate Durability'
      };
    }
    if (selectedEntity.type === 'state' || selectedEntity.id === 'state') {
      return data.curves.find((c) => c.id === 'state') || data.curves[0];
    }
    return data.curves.find((c) => c.id === selectedEntity.id) || data.curves[0];
  }, [data, selectedEntity]);

  const stateCurve = useMemo(() => {
    return (
      (data as any)?.benchmark ||
      (data as any)?.state_benchmark ||
      data?.curves?.find((c) => c.id === 'state') || {
        id: 'state',
        name: 'Maharashtra State Benchmark',
        points: DEFAULT_STATE_BENCHMARK
      }
    );
  }, [data]);

  // Build merged chart coordinates (Month 3, 6, 12, 18, 24)
  const chartData = useMemo(() => {
    const months = [3, 6, 12, 18, 24];
    return months.map((m) => {
      const pPoint = primaryCurve?.points?.find((pt: CurvePoint) => pt.month === m);
      const sPoint = stateCurve?.points?.find((pt: CurvePoint) => pt.month === m);

      const retainedVal = pPoint ? Math.round(pPoint.retained * 100) : null;
      const lowerVal = pPoint ? Math.max(0, Math.round(pPoint.lower * 100)) : null;
      const upperVal = pPoint ? Math.min(100, Math.round(pPoint.upper * 100)) : null;
      const stateRetainedVal = sPoint ? Math.round(sPoint.retained * 100) : null;

      return {
        month: `${m}m`,
        rawMonth: m,
        retained: retainedVal,
        lower: lowerVal,
        upper: upperVal,
        ciRange: lowerVal != null && upperVal != null ? [lowerVal, upperVal] : null,
        n: pPoint?.n ?? 0,
        stateRetained: stateRetainedVal,
        stateN: sPoint?.n ?? 0
      };
    });
  }, [primaryCurve, stateCurve]);

  // Export CSV
  const handleExportCsv = () => {
    if (!chartData) return;
    const headers = ['Month', 'Sustain_Rate_Pct', 'CI_95_Lower', 'CI_95_Upper', 'Effective_Sample_N', 'State_Benchmark_Pct'];
    const rows = chartData.map((d) => [
      d.month,
      d.retained ?? '',
      d.lower ?? '',
      d.upper ?? '',
      d.n,
      d.stateRetained ?? ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `skilltrack-sustain-curve-${selectedEntity.id}-${cohort}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLowSample = primaryCurve?.reliability === 'Low sample';
  const isInsufficient = primaryCurve?.reliability === 'Insufficient';

  const isSpecificEntity = selectedEntity.type !== 'state' && selectedEntity.id !== 'state';
  const mainColor = isSpecificEntity ? '#E8853A' : '#7C83E6'; // Saffron if specific entity, Indigo for state

  return (
    <div
      id="sustain-curve-container"
      className="bg-white dark:bg-[#171B24] border border-[#E3E6EC] dark:border-[#2B3140] rounded-xl p-4 sm:p-5 shadow-xs transition-colors"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3E6EC] dark:border-[#2B3140] mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-[#E6E9F0] text-sm sm:text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#E8853A]" />
              <span>Livelihood Sustain Curve (Survival Probability)</span>
            </h3>
            {isLowSample && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                <span>Shrunk Estimate</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8F97A8] mt-0.5">
            Kaplan-Meier survival probability from Month 3 baseline to Month 24 checkpoint
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Entity selector dropdown */}
          {onSelectEntity && entityOptions.length > 0 && (
            <div className="relative inline-block text-left">
              <select
                aria-label="Select entity for sustain curve"
                value={selectedEntity.id}
                onChange={(e) => {
                  const opt = entityOptions.find((o) => o.id === e.target.value);
                  if (opt) {
                    onSelectEntity({ type: opt.type, id: opt.id, name: opt.name });
                  }
                }}
                className="appearance-none bg-slate-50 dark:bg-[#1F2430] border border-[#E3E6EC] dark:border-[#2B3140] text-slate-800 dark:text-[#E6E9F0] text-xs rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#E8853A]"
              >
                {entityOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Toggle 95% CI Band */}
          <button
            type="button"
            onClick={() => setShowConfidence((prev) => !prev)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
              showConfidence
                ? 'bg-slate-100 dark:bg-[#1F2430] text-slate-900 dark:text-white border-slate-300 dark:border-[#2B3140]'
                : 'bg-transparent text-slate-500 dark:text-slate-400 border-[#E3E6EC] dark:border-[#2B3140]'
            }`}
          >
            {showConfidence ? '95% CI: On' : '95% CI: Off'}
          </button>

          {/* Compare with State Benchmark */}
          {isSpecificEntity && (
            <button
              type="button"
              onClick={() => setShowComparison((prev) => !prev)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                showComparison
                  ? 'bg-slate-100 dark:bg-[#1F2430] text-slate-900 dark:text-white border-slate-300 dark:border-[#2B3140]'
                  : 'bg-transparent text-slate-500 dark:text-slate-400 border-[#E3E6EC] dark:border-[#2B3140]'
              }`}
            >
              vs State Benchmark
            </button>
          )}

          {/* View Mode Toggle */}
          <button
            type="button"
            onClick={() => setViewMode((prev) => (prev === 'chart' ? 'table' : 'chart'))}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1F2430] border border-[#E3E6EC] dark:border-[#2B3140]"
            title={viewMode === 'chart' ? 'View as table' : 'View as chart'}
          >
            {viewMode === 'chart' ? <TableIcon className="w-3.5 h-3.5" /> : <ChartIcon className="w-3.5 h-3.5" />}
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1F2430] border border-[#E3E6EC] dark:border-[#2B3140]"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body: Chart or Table */}
      {loading && !data ? (
        <div className="h-64 sm:h-72 flex items-center justify-center animate-pulse text-slate-400">
          Loading survival curve estimates...
        </div>
      ) : error && !primaryCurve ? (
        <div className="h-64 flex items-center justify-center text-red-500 text-sm">
          {error}
        </div>
      ) : isInsufficient ? (
        <div className="h-64 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 mb-2">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Insufficient Cohort Data
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            This cohort has fewer than 10 evaluated trainees reaching the baseline window. Actuarial survival curves and LDI scores cannot be reliably displayed until minimum reporting volume is reached.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Accessible Table View (per DESIGN.md requirement) */
        <div className="overflow-x-auto my-2 min-h-[260px]">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E3E6EC] dark:border-[#2B3140] text-slate-500 dark:text-slate-400">
                <th className="py-2 px-3 font-semibold">Checkpoint</th>
                <th className="py-2 px-3 text-right font-semibold">Sustain Rate</th>
                <th className="py-2 px-3 text-right font-semibold">95% Confidence Band</th>
                <th className="py-2 px-3 text-right font-semibold">Sample (n)</th>
                {isSpecificEntity && (
                  <th className="py-2 px-3 text-right font-semibold">State Benchmark</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6EC] dark:divide-[#2B3140]">
              {chartData.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-[#1F2430]">
                  <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-[#E6E9F0]">
                    Month {row.rawMonth} ({row.month})
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white font-mono">
                    {row.retained != null ? `${row.retained}%` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500 dark:text-slate-400 font-mono">
                    {row.lower != null && row.upper != null
                      ? `[${row.lower}% – ${row.upper}%]`
                      : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                    n = {row.n}
                  </td>
                  {isSpecificEntity && (
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400 font-mono">
                      {row.stateRetained != null ? `${row.stateRetained}%` : '—'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Guaranteed Visible Recharts Curve with explicit height */
        <div className="w-full h-72 min-h-[280px] my-1 relative">
          <ResponsiveContainer width="100%" height={280} minHeight={280}>
            <ComposedChart data={chartData} margin={{ top: 12, right: 24, left: 0, bottom: 4 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-slate-200 dark:text-[#2B3140]"
                opacity={0.4}
              />
              <XAxis
                dataKey="month"
                stroke="currentColor"
                className="text-slate-500 dark:text-[#8F97A8] text-xs"
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                unit="%"
                stroke="currentColor"
                className="text-slate-500 dark:text-[#8F97A8] text-xs"
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0]?.payload;
                  if (!d) return null;
                  return (
                    <div className="bg-[#171B24] border border-[#2B3140] rounded-lg p-3 shadow-lg text-xs space-y-1 z-50 text-[#E6E9F0]">
                      <div className="font-semibold text-white border-b border-[#2B3140] pb-1 flex items-center justify-between gap-4">
                        <span>Checkpoint: Month {d.rawMonth}</span>
                        <span className="font-mono text-[#8F97A8]">n = {d.n}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mainColor }} />
                          <span className="text-[#8F97A8]">
                            {primaryCurve?.name || 'Cohort Sustain'}:
                          </span>
                        </span>
                        <span className="font-semibold text-white font-mono">
                          {d.retained != null ? `${d.retained}%` : 'N/A'}
                        </span>
                      </div>
                      {d.lower != null && d.upper != null && (
                        <div className="text-[11px] text-[#8F97A8] pl-4 font-mono">
                          95% Conf: [{d.lower}% – {d.upper}%]
                        </div>
                      )}
                      {showComparison && d.stateRetained != null && isSpecificEntity && (
                        <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#2B3140]">
                          <span className="flex items-center gap-1.5 text-[#8F97A8]">
                            <span className="w-2.5 h-0.5 border-t-2 border-dashed border-[#8F97A8]" />
                            <span>State Benchmark:</span>
                          </span>
                          <span className="font-semibold text-white font-mono">
                            {d.stateRetained}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }}
              />

              {/* Confidence Band Lines */}
              {showConfidence && (
                <Line
                  type="monotone"
                  dataKey="upper"
                  stroke={mainColor}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  activeDot={false}
                  isAnimationActive={true}
                  name="Upper 95% Bound"
                />
              )}
              {showConfidence && (
                <Line
                  type="monotone"
                  dataKey="lower"
                  stroke={mainColor}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  activeDot={false}
                  isAnimationActive={true}
                  name="Lower 95% Bound"
                />
              )}

              {/* State Benchmark Line (Dashed) */}
              {showComparison && isSpecificEntity && (
                <Line
                  type="monotone"
                  dataKey="stateRetained"
                  stroke="#8F97A8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#8F97A8' }}
                  activeDot={{ r: 5 }}
                  name="State Benchmark"
                />
              )}

              {/* Primary Cohort Line */}
              <Line
                type="monotone"
                dataKey="retained"
                stroke={mainColor}
                strokeWidth={2.5}
                strokeDasharray={isLowSample ? '5 5' : undefined}
                dot={{ r: 4, fill: mainColor }}
                activeDot={{ r: 6 }}
                name={primaryCurve?.name || 'Sustain Rate'}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer Annotation & Legend */}
      <div className="mt-2 pt-2 border-t border-[#E3E6EC] dark:border-[#2B3140] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-[#8F97A8]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5" style={{ backgroundColor: mainColor }} />
            <span className="font-medium text-slate-800 dark:text-[#E6E9F0]">
              {primaryCurve?.name || 'Selected Cohort'} (Solid)
            </span>
          </span>
          {showComparison && isSpecificEntity && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-[#8F97A8]" />
              <span>State Benchmark (Dashed)</span>
            </span>
          )}
          {showConfidence && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dotted" style={{ borderColor: mainColor }} />
              <span>95% Greenwood CI Bounds</span>
            </span>
          )}
        </div>
        <div>
          Baseline: Month 3 &bull; Actuarial life-table survival estimator
        </div>
      </div>
    </div>
  );
};

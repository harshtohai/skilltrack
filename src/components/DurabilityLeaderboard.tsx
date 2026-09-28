import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { SustainCurveChart } from './SustainCurveChart.tsx';

export interface LeaderboardItem {
  id: string;
  name: string;
  type?: string;
  n: number;
  ldi: number | null;
  band: 'A' | 'B' | 'C' | 'Needs attention' | 'Insufficient';
  sustain12: number;
  progression12: number;
  expectedSustain12: number;
  shrunkRatio: number;
  reliability: 'Reliable' | 'Low sample' | 'Insufficient';
  coverage: number;
  flags: string[];
}

interface DurabilityLeaderboardProps {
  cohort?: string;
  onSelectEntity?: (entity: { type: string; id: string; name: string }) => void;
}

export const DurabilityLeaderboard: React.FC<DurabilityLeaderboardProps> = ({
  cohort = 'all',
  onSelectEntity
}) => {
  const [groupBy, setGroupBy] = useState<'provider' | 'provider_type' | 'course' | 'district'>('provider');
  const [minSampleOnly, setMinSampleOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'ldi' | 'sustain12' | 'progression12' | 'trainees'>('ldi');

  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [stateAvg, setStateAvg] = useState<{ ldi: number | null; sustain12: number; progression12: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected item for slide-over Drawer
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<LeaderboardItem | null>(null);

  // Fetch data
  useEffect(() => {
    setLoading(true);
    const minSample = minSampleOnly ? 30 : 0;
    fetch(`/api/durability/leaderboard?group_by=${groupBy}&cohort=${cohort}&min_sample=${minSample}&sort_by=${sortBy}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || []);
        setStateAvg(data.state_average || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load durability leaderboard:', err);
        setLoading(false);
      });
  }, [groupBy, cohort, minSampleOnly, sortBy]);

  // Filter by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        (it.type && it.type.toLowerCase().includes(q)) ||
        it.id.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Rank',
      'ID',
      'Name',
      'Type',
      'Cohort_Size_N',
      'Reliability',
      'LDI_Score',
      'Band',
      'Sustain_12m_Pct',
      'Expected_Sustain_12m_Pct',
      'Progression_12m_Pct',
      'Followup_Coverage_Pct',
      'Flags'
    ];
    const rows = filteredItems.map((it, idx) => [
      idx + 1,
      it.id,
      `"${it.name.replace(/"/g, '""')}"`,
      it.type || '',
      it.n,
      it.reliability,
      it.ldi != null ? it.ldi : 'N/A',
      it.band,
      it.sustain12,
      it.expectedSustain12,
      it.progression12,
      it.coverage,
      `"${it.flags.join('; ')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `skilltrack-durability-leaderboard-${groupBy}-${cohort}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBandBadge = (band: string, ldi: number | null) => {
    if (ldi == null || band === 'Insufficient') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
          N/A
        </span>
      );
    }
    if (band === 'A') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
          Band A ({ldi})
        </span>
      );
    }
    if (band === 'B') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-800">
          Band B ({ldi})
        </span>
      );
    }
    if (band === 'C') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
          Band C ({ldi})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800">
        Needs Attn ({ldi})
      </span>
    );
  };

  const getReliabilityBadge = (rel: string) => {
    if (rel === 'Reliable') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-3 h-3" />
          Reliable
        </span>
      );
    }
    if (rel === 'Low sample') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-3 h-3" />
          Low sample
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
        <HelpCircle className="w-3 h-3" />
        Insufficient
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-[#171B24] border border-[#E3E6EC] dark:border-[#2B3140] rounded-xl p-4 sm:p-5 shadow-xs my-6 transition-colors duration-200 w-full max-w-full overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E3E6EC] dark:border-[#2B3140]">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6B7385] dark:text-[#8F97A8] flex items-center gap-2">
            Livelihood Durability Leaderboard
            {stateAvg && (
              <span className="normal-case text-xs font-normal text-slate-500">
                (State LDI Benchmark: <strong className="font-semibold text-slate-900 dark:text-white">{stateAvg.ldi}</strong>, Sustain: {stateAvg.sustain12}%)
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mix-adjusted scores benchmarked against peer groups. Click any entity row to inspect its trajectory drawer.
          </p>
        </div>

        {/* Group-By Toggle Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-[#1F2430] p-1 rounded-lg border border-[#E3E6EC] dark:border-[#2B3140]">
          {(
            [
              ['provider', 'By Provider'],
              ['provider_type', 'By Type'],
              ['course', 'By Course'],
              ['district', 'By District']
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setGroupBy(val)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                groupBy === val
                  ? 'bg-white dark:bg-[#171B24] text-[#E8853A] shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar: Search, Min Sample Toggle, Sort, Export */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 w-full">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${groupBy.replace('_', ' ')}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#E3E6EC] dark:border-[#2B3140] bg-slate-50 dark:bg-[#1F2430] text-slate-800 dark:text-[#E6E9F0] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#E8853A]"
            />
          </div>

          {/* Min Sample Toggle */}
          <button
            type="button"
            onClick={() => setMinSampleOnly((prev) => !prev)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
              minSampleOnly
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-transparent text-slate-600 dark:text-slate-400 border-[#E3E6EC] dark:border-[#2B3140]'
            }`}
          >
            {minSampleOnly ? 'Reliable Cohorts Only (n &ge; 30)' : 'All Cohorts (Incl. Small Samples)'}
          </button>
        </div>

        {/* Sort and Export */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Sort by:</span>
            <select
              aria-label="Sort by"
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-[#1F2430] text-slate-800 dark:text-[#E6E9F0] border border-[#E3E6EC] dark:border-[#2B3140] rounded-md px-2 py-1"
            >
              <option value="ldi">LDI Score (High to Low)</option>
              <option value="sustain12">12m Sustain Rate</option>
              <option value="progression12">12m Progression Rate</option>
              <option value="trainees">Trainees Sample (n)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 border border-[#E3E6EC] dark:border-[#2B3140] rounded-md hover:bg-slate-100 dark:hover:bg-[#1F2430] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full rounded-lg border border-[#E3E6EC] dark:border-[#2B3140]">
        <table className="w-full text-xs text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#1F2430] border-b border-[#E3E6EC] dark:border-[#2B3140] text-slate-600 dark:text-slate-400">
              <th className="py-2.5 px-3 font-semibold w-12 text-center">Rank</th>
              <th className="py-2.5 px-3 font-semibold">Entity &amp; Identifier</th>
              <th className="py-2.5 px-3 font-semibold text-center">Sample (n)</th>
              <th className="py-2.5 px-3 font-semibold text-center">LDI Score</th>
              <th className="py-2.5 px-3 font-semibold text-right">12m Sustain vs Expected</th>
              <th className="py-2.5 px-3 font-semibold text-right">12m Progression</th>
              <th className="py-2.5 px-3 font-semibold text-center">Coverage</th>
              <th className="py-2.5 px-3 font-semibold">Action Flags</th>
              <th className="py-2.5 px-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3E6EC] dark:divide-[#2B3140]">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  Calculating durability distributions across {groupBy}...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-500">
                  No matching entities found. Try clearing filters or reducing sample size constraint.
                </td>
              </tr>
            ) : (
              filteredItems.map((it, idx) => {
                const isSelected = selectedDrawerItem?.id === it.id;
                return (
                  <tr
                    key={it.id}
                    onClick={() => setSelectedDrawerItem(it)}
                    className={`cursor-pointer transition-colors duration-150 ${
                      isSelected
                        ? 'bg-orange-50/60 dark:bg-orange-950/20'
                        : 'hover:bg-slate-50 dark:hover:bg-[#1F2430]'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 text-center font-mono text-slate-500 font-medium">
                      {idx + 1}
                    </td>

                    {/* Name & Type */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-[#E6E9F0] hover:text-[#E8853A] flex items-center gap-1.5">
                        <span>{it.name}</span>
                        {it.type && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal">
                            {it.type}
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {it.id}
                      </div>
                    </td>

                    {/* Sample Size (n) & Reliability */}
                    <td className="py-3 px-3 text-center">
                      <div className="font-mono font-medium text-slate-900 dark:text-white">
                        n = {it.n}
                      </div>
                      <div>{getReliabilityBadge(it.reliability)}</div>
                    </td>

                    {/* LDI Score & Band */}
                    <td className="py-3 px-3 text-center">
                      {getBandBadge(it.band, it.ldi)}
                    </td>

                    {/* 12m Sustain vs Expected */}
                    <td className="py-3 px-3 text-right">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {it.sustain12}%
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        (exp. {it.expectedSustain12}%)
                      </span>
                    </td>

                    {/* Progression Rate */}
                    <td className="py-3 px-3 text-right font-medium">
                      <span
                        className={
                          it.progression12 >= 20
                            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                            : it.progression12 < 10
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }
                      >
                        {it.progression12}%
                      </span>
                    </td>

                    {/* Follow-up Coverage */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                          it.coverage >= 60
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold'
                        }`}
                      >
                        {it.coverage}%
                      </span>
                    </td>

                    {/* Action Flags */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {it.flags.length === 0 ? (
                          <span className="text-[11px] text-slate-400">—</span>
                        ) : (
                          it.flags.map((fl) => (
                            <span
                              key={fl}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                fl === 'Early drop-off'
                                  ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400'
                                  : fl === 'Wage stagnation'
                                  ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                                  : fl === 'Low follow-up coverage'
                                  ? 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {fl}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Arrow */}
                    <td className="py-3 px-2 text-slate-400">
                      <ChevronRight className="w-4 h-4" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over Drawer for Selected Entity */}
      {selectedDrawerItem && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
          onClick={() => setSelectedDrawerItem(null)}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-[#171B24] h-full shadow-2xl p-6 overflow-y-auto border-l border-[#E3E6EC] dark:border-[#2B3140] flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#E3E6EC] dark:border-[#2B3140]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 uppercase">
                      {selectedDrawerItem.type || groupBy}
                    </span>
                    {getBandBadge(selectedDrawerItem.band, selectedDrawerItem.ldi)}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {selectedDrawerItem.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    ID: {selectedDrawerItem.id} &bull; Cohort: {cohort.toUpperCase()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDrawerItem(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#1F2430]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
                <div className="p-3 bg-slate-50 dark:bg-[#1F2430] rounded-lg border border-[#E3E6EC] dark:border-[#2B3140]">
                  <span className="text-[11px] text-slate-500 block">LDI Score</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedDrawerItem.ldi != null ? selectedDrawerItem.ldi : 'N/A'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#1F2430] rounded-lg border border-[#E3E6EC] dark:border-[#2B3140]">
                  <span className="text-[11px] text-slate-500 block">12m Sustain</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedDrawerItem.sustain12}%
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    exp. {selectedDrawerItem.expectedSustain12}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#1F2430] rounded-lg border border-[#E3E6EC] dark:border-[#2B3140]">
                  <span className="text-[11px] text-slate-500 block">Progression</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedDrawerItem.progression12}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#1F2430] rounded-lg border border-[#E3E6EC] dark:border-[#2B3140]">
                  <span className="text-[11px] text-slate-500 block">Coverage</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedDrawerItem.coverage}%
                  </span>
                </div>
              </div>

              {/* Sustain Curve inside Drawer */}
              <div className="my-4">
                <SustainCurveChart
                  cohort={cohort}
                  selectedEntity={{
                    type: groupBy === 'provider_type' ? 'provider_type' : groupBy,
                    id: selectedDrawerItem.id,
                    name: selectedDrawerItem.name
                  }}
                  compareWithState={true}
                  compact={true}
                />
              </div>

              {/* Action Flags in Drawer */}
              {selectedDrawerItem.flags.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 my-4">
                  <div className="text-xs font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Active Quality Warnings
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDrawerItem.flags.map((fl) => (
                      <span
                        key={fl}
                        className="text-xs px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-medium"
                      >
                        {fl}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Actions */}
            <div className="pt-4 border-t border-[#E3E6EC] dark:border-[#2B3140] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onSelectEntity) {
                    onSelectEntity({
                      type: groupBy === 'provider_type' ? 'provider_type' : groupBy,
                      id: selectedDrawerItem.id,
                      name: selectedDrawerItem.name
                    });
                  }
                  setSelectedDrawerItem(null);
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-[#E8853A] text-[#1B1F2A] font-semibold text-xs text-center hover:bg-[#D4762F] transition-colors"
              >
                Plot on Main Sustain Curve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

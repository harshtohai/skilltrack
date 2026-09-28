import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles, RefreshCw, Layers } from 'lucide-react';

interface DurabilityKpiCardsProps {
  sustain12: number; // e.g. 74 (%)
  sustainStateAvg?: number; // e.g. 65 (%)
  progression12: number; // e.g. 22 (%)
  progressionStateAvg?: number; // e.g. 18 (%)
  adjustedRatio: number; // e.g. 1.12 (observed / expected)
  shrunkRatio?: number; // e.g. 1.08 (EB shrunk)
  recoveryRate: number; // e.g. 34 (%)
  loading?: boolean;
}

export const DurabilityKpiCards: React.FC<DurabilityKpiCardsProps> = ({
  sustain12,
  sustainStateAvg = 65,
  progression12,
  progressionStateAvg = 18,
  adjustedRatio,
  shrunkRatio,
  recoveryRate,
  loading = false
}) => {
  const sustainDiff = sustain12 - sustainStateAvg;
  const progressionDiff = progression12 - progressionStateAvg;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 my-4 w-full min-w-0">
      {/* KPI 1: 12-Month Sustain Rate */}
      <div
        id="kpi-sustain-rate"
        className="bg-white text-[#303030] rounded-[20px] border border-[#E2E2DE] p-4 shadow-[0_3px_14px_rgba(35,38,45,0.05)] transition-all duration-200 w-full min-w-0 overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#74767D]">
            12m Sustain Rate
          </span>
          <div className="w-7 h-7 rounded-full bg-[#F1F1EE] text-[#303030] flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="my-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-[28px] font-normal tracking-tight text-[#303030]">
            {loading ? '—' : `${sustain12}%`}
          </span>
          <div className="flex items-center text-xs font-medium">
            {sustainDiff >= 0 ? (
              <span className="text-[#305B35] bg-[#BFE7C2]/50 px-2 py-0.5 rounded-full flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{sustainDiff}%
              </span>
            ) : (
              <span className="text-[#8A3030] bg-[#FCE8E8] px-2 py-0.5 rounded-full flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                {sustainDiff}%
              </span>
            )}
          </div>
        </div>
        <div className="pt-2 border-t border-[#E2E2DE] text-[10px] text-[#74767D] flex items-center justify-between">
          <span>vs State Avg ({sustainStateAvg}%)</span>
          <span className="text-[#9A9A9A]">&ge;95% baseline wage</span>
        </div>
      </div>

      {/* KPI 2: 12-Month Progression Rate */}
      <div
        id="kpi-progression-rate"
        className="bg-white text-[#303030] rounded-[20px] border border-[#E2E2DE] p-4 shadow-[0_3px_14px_rgba(35,38,45,0.05)] transition-all duration-200 w-full min-w-0 overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#74767D]">
            12m Progression Rate
          </span>
          <div className="w-7 h-7 rounded-full bg-[#F1F1EE] text-[#303030] flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="my-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-[28px] font-normal tracking-tight text-[#303030]">
            {loading ? '—' : `${progression12}%`}
          </span>
          <div className="flex items-center text-xs font-medium">
            {progressionDiff >= 0 ? (
              <span className="text-[#305B35] bg-[#BFE7C2]/50 px-2 py-0.5 rounded-full flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{progressionDiff}%
              </span>
            ) : (
              <span className="text-[#8A3030] bg-[#FCE8E8] px-2 py-0.5 rounded-full flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                {progressionDiff}%
              </span>
            )}
          </div>
        </div>
        <div className="pt-2 border-t border-[#E2E2DE] text-[10px] text-[#74767D] flex items-center justify-between">
          <span>vs State Avg ({progressionStateAvg}%)</span>
          <span className="text-[#9A9A9A]">&ge;110% baseline wage</span>
        </div>
      </div>

      {/* KPI 3: Mix-Adjusted Ratio (Warm Surface) */}
      <div
        id="kpi-adjusted-ratio"
        className="bg-[#FFF9E9] text-[#303030] rounded-[20px] border border-[#E2E2DE] p-4 shadow-[0_3px_14px_rgba(35,38,45,0.05)] transition-all duration-200 w-full min-w-0 overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#74767D]">
            Mix-Adjusted Ratio
          </span>
          <div className="w-7 h-7 rounded-full bg-[#FFF0A8] text-[#665400] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="my-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-[28px] font-normal tracking-tight text-[#303030]">
            {loading ? '—' : `${adjustedRatio.toFixed(2)}x`}
          </span>
          <span className="text-[11px] font-medium bg-white px-2 py-0.5 rounded-full text-[#303030] border border-[#E2E2DE]">
            {adjustedRatio >= 1.0 ? 'Above Peers' : 'Below Peers'}
          </span>
        </div>
        <div className="pt-2 border-t border-[#E2E2DE] text-[10px] text-[#74767D] flex items-center justify-between">
          <span>Observed / Expected</span>
          {shrunkRatio != null && (
            <span className="text-[#9A9A9A]">EB Shrunk: {shrunkRatio.toFixed(2)}x</span>
          )}
        </div>
      </div>

      {/* KPI 4: Second-Chance Recovery Rate */}
      <div
        id="kpi-recovery-rate"
        className="bg-white text-[#303030] rounded-[20px] border border-[#E2E2DE] p-4 shadow-[0_3px_14px_rgba(35,38,45,0.05)] transition-all duration-200 w-full min-w-0 overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#74767D]">
            Recovery Rate
          </span>
          <div className="w-7 h-7 rounded-full bg-[#F1F1EE] text-[#303030] flex items-center justify-center">
            <RefreshCw className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="my-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-[28px] font-normal tracking-tight text-[#303030]">
            {loading ? '—' : `${recoveryRate}%`}
          </span>
          <span className="text-[11px] font-medium bg-[#F1F1EE] px-2 py-0.5 rounded-full text-[#74767D]">
            Second-chance
          </span>
        </div>
        <div className="pt-2 border-t border-[#E2E2DE] text-[10px] text-[#74767D] flex items-center justify-between">
          <span>Re-employed by 12m/18m</span>
          <span className="text-[#9A9A9A]">after 6m exit</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';
import { FilterParams } from '../types.ts';

interface Props {
  filters: FilterParams;
  initialSummary?: string;
  initialActions?: string[];
}

export const AiInsightCard: React.FC<Props> = ({ filters, initialSummary, initialActions }) => {
  const [loading, setLoading] = useState(false);
  const defaultSummary =
    initialSummary ||
    'Across Maharashtra cohorts of 1,591 tracked trainees, verified placement stands at 41% with 6-month retention at 59% and average wages at ₹17,015/month. While Chhatrapati Sambhajinagar (53%) and Pune (47%) lead in industrial placement, tribal regions like Gadchiroli (32%) face acute local job shortages.';

  const defaultActions = initialActions || [
    'Mandate 40 hours of workplace simulation and Advanced Excel to eliminate the #1 non-placement driver (Skill Mismatch at 22%).',
    'Deploy mobile training vans and employer travel subsidies in Nanded, Gadchiroli, and Palghar to boost verified 12-month rural retention.',
    'Link training provider capital grants directly to the 65-point Provider Scorecard benchmark (Grade B minimum), pausing funding for persistently lagging ITIs.'
  ];

  const [summary, setSummary] = useState<string>(defaultSummary);
  const [actions, setActions] = useState<string[]>(defaultActions);
  const [metrics, setMetrics] = useState({
    placementRate: '41%',
    avgWage: '₹17,015',
    topGapSector: 'IT-ITeS & Automotive',
    criticalDistrict: 'Gadchiroli (32%)'
  });

  // Typewriter effect state for first view
  const [displayedText, setDisplayedText] = useState<string>('');
  const hasTypedRef = useRef(false);

  useEffect(() => {
    if (!hasTypedRef.current) {
      let index = 0;
      setDisplayedText('');
      const interval = setInterval(() => {
        index += 2;
        if (index <= summary.length) {
          setDisplayedText(summary.slice(0, index));
        } else {
          setDisplayedText(summary);
          hasTypedRef.current = true;
          clearInterval(interval);
        }
      }, 12);
      return () => clearInterval(interval);
    } else {
      setDisplayedText(summary);
    }
  }, [summary]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
      });
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
        hasTypedRef.current = false;
      }
      if (data.actions && Array.isArray(data.actions)) {
        setActions(data.actions);
      }
      if (data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to generate insights:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="ai-insight-card"
      className="bg-[#FFF9E9] rounded-[20px] border border-[#E2E2DE] p-4 sm:p-5 shadow-[0_3px_14px_rgba(35,38,45,0.05)] transition-colors duration-200 w-full min-w-0 overflow-hidden"
    >
      {/* Card Header with Gemini Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E2DE]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#F8D84A] text-[#303030] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-[#303030]">Executive Policy Synthesis</h2>
              <span className="text-[10px] font-medium bg-[#303030] text-white px-2 py-0.5 rounded-full">
                Gemini 2.5
              </span>
            </div>
            <p className="text-[10px] text-[#74767D]">
              Automated cross-district skilling outcome synthesis
            </p>
          </div>
        </div>

        {/* Ghost Regenerate Button */}
        <button
          id="btn-regenerate-ai-insights"
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[#E2E2DE] bg-white text-[#303030] hover:bg-[#F1F1EE] transition-colors disabled:opacity-50 shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#303030]' : 'text-[#74767D]'}`} />
          <span>{loading ? 'Synthesizing data...' : 'Regenerate'}</span>
        </button>
      </div>

      {/* Grounded Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 pb-3">
        <div className="bg-white rounded-[14px] p-2.5 border border-[#E2E2DE]">
          <span className="text-[10px] uppercase font-medium text-[#74767D] block">State Placement</span>
          <span className="text-sm font-medium text-[#305B35]">{metrics.placementRate}</span>
        </div>
        <div className="bg-white rounded-[14px] p-2.5 border border-[#E2E2DE]">
          <span className="text-[10px] uppercase font-medium text-[#74767D] block">Average Wage</span>
          <span className="text-sm font-medium text-[#303030]">{metrics.avgWage}</span>
        </div>
        <div className="bg-white rounded-[14px] p-2.5 border border-[#E2E2DE]">
          <span className="text-[10px] uppercase font-medium text-[#74767D] block">Key Gap Sector</span>
          <span className="text-sm font-medium text-[#665400]">{metrics.topGapSector}</span>
        </div>
        <div className="bg-white rounded-[14px] p-2.5 border border-[#E2E2DE]">
          <span className="text-[10px] uppercase font-medium text-[#74767D] block">Critical Focus</span>
          <span className="text-sm font-medium text-[#8A3030]">{metrics.criticalDistrict}</span>
        </div>
      </div>

      {/* Generated text with typing effect */}
      <div className="py-2">
        <p className="text-xs leading-relaxed text-[#303030]">
          {displayedText}
          {!hasTypedRef.current && (
            <span className="inline-block w-1.5 h-3 bg-[#303030] ml-1 animate-pulse" />
          )}
        </p>
      </div>

      {/* Up to 3 action rows */}
      <div className="mt-3 pt-3 border-t border-[#E2E2DE] space-y-2">
        <span className="text-[11px] font-medium text-[#74767D] block">
          Key Remedial Actions:
        </span>
        <div className="space-y-1.5">
          {actions.slice(0, 3).map((action, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 p-2.5 rounded-[14px] bg-white border border-[#E2E2DE] text-xs text-[#303030]"
            >
              <span className="w-4 h-4 rounded-full bg-[#303030] text-white flex items-center justify-center font-medium text-[10px] shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="leading-snug">{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory caption */}
      <div className="mt-3 pt-2 border-t border-[#E2E2DE] flex items-center justify-between text-[10px] text-[#74767D]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#305B35]" />
          <span>Generated from aggregated, anonymised data</span>
        </div>
        <span>Section 4(2) DPDP Compliant</span>
      </div>
    </div>
  );
};

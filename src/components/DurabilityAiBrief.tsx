import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DurabilityAiBriefProps {
  entityType?: string;
  entityId?: string;
  cohort?: string;
}

export const DurabilityAiBrief: React.FC<DurabilityAiBriefProps> = ({
  entityType = 'state',
  entityId = 'state',
  cohort = 'all'
}) => {
  const [insight, setInsight] = useState<string>('');
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = async (isRegen = false) => {
    if (isRegen) setRegenerating(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/durability/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          period: cohort
        })
      });
      if (!res.ok) throw new Error('Failed to generate durability policy brief');
      const data = await res.json();
      setInsight(data.insight || '');
      setMetrics(data.metrics || null);
    } catch (err: any) {
      console.error('AI durability insight fetch error:', err);
      setError(err.message || 'Unable to generate brief');
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchInsight(false);
  }, [entityType, entityId, cohort]);

  return (
    <div
      id="ai-durability-brief"
      className="bg-[#171B24] dark:bg-[#1F2430] border border-[#7C83E6] rounded-xl p-5 shadow-sm text-slate-100 my-6 transition-colors duration-200"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#7C83E6]/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#7C83E6]/20 text-[#7C83E6]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white flex items-center gap-2">
              AI Livelihood Durability Brief
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C83E6]/20 text-indigo-300 font-normal">
                Gemini Policy Synthesis
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated 3-tier verdict, peer benchmarking, and decisive administrative intervention.
            </p>
          </div>
        </div>

        {/* Regenerate Button */}
        <button
          type="button"
          disabled={loading || regenerating}
          onClick={() => fetchInsight(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#7C83E6]/50 text-indigo-200 hover:bg-[#7C83E6]/20 text-xs font-medium transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
          {regenerating ? 'Regenerating...' : 'Regenerate Brief'}
        </button>
      </div>

      {/* Metrics Strip */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 text-xs">
          <div className="bg-black/20 p-2 rounded border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">Entity</span>
            <span className="font-semibold text-white truncate block">{metrics.entity_name}</span>
          </div>
          <div className="bg-black/20 p-2 rounded border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">LDI Score</span>
            <span className="font-bold text-[#E8853A]">{metrics.ldi ?? 'N/A'} / 100</span>
            <span className="text-slate-400 text-[10px] ml-1">({metrics.band})</span>
          </div>
          <div className="bg-black/20 p-2 rounded border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">12m Sustain</span>
            <span className="font-semibold text-emerald-400">{metrics.sustain12}%</span>
            <span className="text-slate-400 text-[10px] ml-1">(avg {metrics.state_sustain12}%)</span>
          </div>
          <div className="bg-black/20 p-2 rounded border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">12m Progression</span>
            <span className="font-semibold text-sky-300">{metrics.progression12}%</span>
            <span className="text-slate-400 text-[10px] ml-1">(avg {metrics.state_progression12}%)</span>
          </div>
        </div>
      )}

      {/* Text Body */}
      {loading ? (
        <div className="py-8 text-center text-slate-400 text-xs animate-pulse">
          Synthesizing longitudinal survival trends into policy brief...
        </div>
      ) : error ? (
        <div className="py-6 text-center text-red-400 text-xs flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-line py-1">
          {insight}
        </div>
      )}

      {/* Caption footer */}
      <div className="mt-4 pt-3 border-t border-[#7C83E6]/20 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Generated from aggregated, anonymised data. Check the confidence interval before taking action.</span>
        <span className="font-mono text-[10px] opacity-75">Model: Gemini 2.5 Flash</span>
      </div>
    </div>
  );
};

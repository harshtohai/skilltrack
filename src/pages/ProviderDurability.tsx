import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { SustainCurveChart } from '../components/SustainCurveChart.tsx';
import { DurabilityKpiCards } from '../components/DurabilityKpiCards.tsx';
import { DurabilityActionEngine } from '../components/DurabilityActionEngine.tsx';
import { LdiCalculationModal } from '../components/LdiCalculationModal.tsx';
import { DurabilityAiBrief } from '../components/DurabilityAiBrief.tsx';
import {
  ShieldCheck,
  Award,
  HelpCircle,
  TrendingUp,
  Sparkles,
  Users,
  Info
} from 'lucide-react';

export const ProviderDurability: React.FC = () => {
  const { user } = useAuth();
  const providerId = user?.provider_id || 'prov-1';

  const [providerInfo, setProviderInfo] = useState<any>(null);
  const [providerMetrics, setProviderMetrics] = useState<{
    name: string;
    ldi: number | null;
    band: string;
    sustain12: number;
    stateSustain12: number;
    progression12: number;
    stateProgression12: number;
    adjustedRatio: number;
    shrunkRatio: number;
    recoveryRate: number;
    ruralPct: number;
    womenPct: number;
  }>({
    name: 'Pune Skill Development Centre',
    ldi: 76,
    band: 'B',
    sustain12: 74,
    stateSustain12: 65,
    progression12: 22,
    stateProgression12: 18,
    adjustedRatio: 1.12,
    shrunkRatio: 1.09,
    recoveryRate: 34,
    ruralPct: 58,
    womenPct: 44
  });

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fetch provider analytics
    fetch(`/api/analytics/providers/${providerId}`)
      .then((r) => r.json())
      .then((data) => {
        setProviderInfo(data.provider || null);
      })
      .catch((err) => console.error(err));

    // Fetch provider durability curve and metrics
    fetch(`/api/durability/curve?group_by=provider&cohort=all`)
      .then((r) => r.json())
      .then((data) => {
        const pCurve = data.curves?.find((c: any) => c.id === providerId) || data.curves?.[0];
        const stateCurve = data.state_benchmark || data.benchmark || data.curves?.find((c: any) => c.id === 'state');

        const pt12 = pCurve?.points?.find((p: any) => p.month === 12);
        const sPt12 = stateCurve?.points?.find((p: any) => p.month === 12);

        if (pCurve) {
          setProviderMetrics((prev) => ({
            ...prev,
            name: pCurve.name || prev.name,
            ldi: pCurve.ldi ?? prev.ldi,
            band: pCurve.band || prev.band,
            sustain12: pt12 ? Math.round(pt12.retained * 100) : prev.sustain12,
            stateSustain12: sPt12 ? Math.round(sPt12.retained * 100) : 65,
            progression12: pt12?.progressed ? Math.round(pt12.progressed * 100) : prev.progression12,
            adjustedRatio: pCurve.shrunk_ratio ?? 1.12,
            shrunkRatio: pCurve.shrunk_ratio ?? 1.09
          }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [providerId]);

  const sustainDiff = providerMetrics.sustain12 - providerMetrics.stateSustain12;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E3E6EC] dark:border-[#2B3140]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-[#E8853A]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Institute Durability Portal
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {providerInfo?.name || providerMetrics.name}
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tracking post-course employment retention and wage progression for your graduates.
          </p>
        </div>

        {/* LDI Badge & Explainer Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-[#171B24] border border-[#E3E6EC] dark:border-[#2B3140] rounded-xl shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7385] dark:text-[#8F97A8] block">
                Your LDI Score
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                  {loading ? '—' : providerMetrics.ldi}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
                <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Band {providerMetrics.band}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-[#E3E6EC] dark:border-[#2B3140] bg-white dark:bg-[#171B24] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1F2430] transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>How is my LDI calculated?</span>
          </button>
        </div>
      </div>

      {/* Fairness & Intake Profile Notice Banner */}
      <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-950 dark:text-indigo-200">
        <div className="flex items-center gap-2.5">
          <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <span className="font-bold">Fair Comparison Notice:</span> Adjusted for your trainee intake ({providerMetrics.ruralPct}% rural, {providerMetrics.womenPct}% women).
            <span className="opacity-80 block sm:inline sm:ml-1">
              Your expected retention is weighted to match similar student and economic conditions.
            </span>
          </div>
        </div>
        <div className="font-semibold text-emerald-700 dark:text-emerald-400 bg-white/80 dark:bg-black/30 px-3 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 shrink-0">
          {sustainDiff >= 0
            ? `You retain +${sustainDiff}% more trainees at 12m than state peers`
            : `12m retention is ${Math.abs(sustainDiff)}% below state peer benchmark`}
        </div>
      </div>

      {/* 4 Pastel KPI Cards */}
      <section>
        <DurabilityKpiCards
          sustain12={providerMetrics.sustain12}
          sustainStateAvg={providerMetrics.stateSustain12}
          progression12={providerMetrics.progression12}
          progressionStateAvg={providerMetrics.stateProgression12}
          adjustedRatio={providerMetrics.adjustedRatio}
          shrunkRatio={providerMetrics.shrunkRatio}
          recoveryRate={providerMetrics.recoveryRate}
          loading={loading}
        />
      </section>

      {/* Sustain Curve Component (Provider vs State) */}
      <section>
        <SustainCurveChart
          selectedEntity={{
            type: 'provider',
            id: providerId,
            name: providerInfo?.name || providerMetrics.name
          }}
          compareWithState={true}
        />
      </section>

      {/* Action Recommendations for this Provider */}
      <section>
        <DurabilityActionEngine filterEntityId={providerId} />
      </section>

      {/* AI Durability Brief for Provider */}
      <section>
        <DurabilityAiBrief
          entityType="provider"
          entityId={providerId}
          cohort="all"
        />
      </section>

      {/* Modal */}
      <LdiCalculationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        entityName={providerInfo?.name || providerMetrics.name}
        mixDetails={{
          ruralPct: providerMetrics.ruralPct,
          womenPct: providerMetrics.womenPct
        }}
      />
    </div>
  );
};

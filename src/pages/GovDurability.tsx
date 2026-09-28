import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { SustainCurveChart } from '../components/SustainCurveChart.tsx';
import { DurabilityKpiCards } from '../components/DurabilityKpiCards.tsx';
import { DurabilityLeaderboard } from '../components/DurabilityLeaderboard.tsx';
import { DurabilityActionEngine } from '../components/DurabilityActionEngine.tsx';
import { DurabilityAiBrief } from '../components/DurabilityAiBrief.tsx';
import { LdiCalculationModal } from '../components/LdiCalculationModal.tsx';
import {
  ShieldCheck,
  Scale,
  Sparkles,
  HelpCircle,
  Calendar,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export const GovDurability: React.FC = () => {
  const { language } = useAuth();
  const [cohort, setCohort] = useState<string>('all');
  const [selectedEntity, setSelectedEntity] = useState<{
    type: string;
    id: string;
    name: string;
  }>({
    type: 'state',
    id: 'state',
    name: 'Maharashtra State Benchmark'
  });

  const [stateMetrics, setStateMetrics] = useState<{
    ldi: number | null;
    band: string;
    sustain12: number;
    progression12: number;
    adjustedRatio: number;
    shrunkRatio: number;
    recoveryRate: number;
  }>({
    ldi: 73,
    band: 'B',
    sustain12: 65,
    progression12: 11,
    adjustedRatio: 1.0,
    shrunkRatio: 1.0,
    recoveryRate: 28
  });

  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch state aggregate summary metrics
  useEffect(() => {
    setLoadingMetrics(true);
    fetch(`/api/durability/curve?group_by=state&cohort=${cohort}`)
      .then((r) => r.json())
      .then((data) => {
        const stateCurve = data.curves?.find((c: any) => c.id === 'state') || data.curves?.[0];
        if (stateCurve) {
          const pt12 = stateCurve.points?.find((p: any) => p.month === 12);
          setStateMetrics({
            ldi: stateCurve.ldi ?? 73,
            band: stateCurve.band || 'B',
            sustain12: pt12 ? Math.round(pt12.retained * 100) : 65,
            progression12: pt12?.progressed ? Math.round(pt12.progressed * 100) : 11,
            adjustedRatio: stateCurve.shrunk_ratio ?? 1.0,
            shrunkRatio: stateCurve.shrunk_ratio ?? 1.0,
            recoveryRate: 28
          });
        }
        setLoadingMetrics(false);
      })
      .catch((err) => {
        console.error('Failed to load state metrics:', err);
        setLoadingMetrics(false);
      });
  }, [cohort]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header with Hero LDI & Slogans */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E3E6EC] dark:border-[#2B3140]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-[#E8853A]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Livelihood Durability Index (LDI)
            </h1>
          </div>

          {/* Bilingual Slogan */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-[#E8853A]">
              What happens after the course
            </span>
            <span className="text-slate-300 dark:text-slate-600">&bull;</span>
            <span className="font-marathi font-medium text-slate-500 dark:text-slate-400">
              अभ्यासक्रमानंतर काय होते
            </span>
          </div>
        </div>

        {/* Hero Score Badge & Cohort Picker */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Hero State LDI Number */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-[#171B24] border border-[#E3E6EC] dark:border-[#2B3140] rounded-xl shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7385] dark:text-[#8F97A8] block">
                State Durability Score
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                  {loadingMetrics ? '—' : stateMetrics.ldi}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
                <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                  Band {stateMetrics.band}
                </span>
              </div>
            </div>
          </div>

          {/* Cohort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#1F2430] p-1 rounded-lg border border-[#E3E6EC] dark:border-[#2B3140]">
            <Calendar className="w-3.5 h-3.5 ml-2 text-slate-400" />
            <select
              aria-label="Filter cohort"
              value={cohort}
              onChange={(e) => setCohort(e.target.value)}
              className="text-xs font-medium bg-transparent text-slate-800 dark:text-[#E6E9F0] border-none pr-3 py-1 cursor-pointer focus:outline-hidden"
            >
              <option value="all">All Cohorts (2023–2025)</option>
              <option value="2025">Cohort 2025 (Active)</option>
              <option value="2024">Cohort 2024 (12m Complete)</option>
              <option value="2023">Cohort 2023 (24m Mature)</option>
            </select>
          </div>

          {/* How is LDI Calculated Button */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-[#E3E6EC] dark:border-[#2B3140] bg-white dark:bg-[#171B24] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1F2430] transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>How is LDI calculated?</span>
          </button>
        </div>
      </div>

      {/* Row 1: The Sustain Curve (Main Visual) */}
      <section>
        <SustainCurveChart
          cohort={cohort}
          selectedEntity={selectedEntity}
          onSelectEntity={(ent) => setSelectedEntity(ent as any)}
          compareWithState={true}
        />
      </section>

      {/* Row 2: 4 Pastel KPI Cards */}
      <section>
        <DurabilityKpiCards
          sustain12={stateMetrics.sustain12}
          progression12={stateMetrics.progression12}
          adjustedRatio={stateMetrics.adjustedRatio}
          shrunkRatio={stateMetrics.shrunkRatio}
          recoveryRate={stateMetrics.recoveryRate}
          loading={loadingMetrics}
        />
      </section>

      {/* Row 3: Durability Leaderboard (With Drawer & Mix-Adjustment Breakdown) */}
      <section>
        <DurabilityLeaderboard
          cohort={cohort}
          onSelectEntity={(ent) => setSelectedEntity(ent)}
        />
      </section>

      {/* Row 4: Action Engine Panel */}
      <section>
        <DurabilityActionEngine
          onFocusEntity={(ent) => setSelectedEntity(ent)}
        />
      </section>

      {/* Row 5: AI Durability Brief */}
      <section>
        <DurabilityAiBrief
          entityType={selectedEntity.type}
          entityId={selectedEntity.id}
          cohort={cohort}
        />
      </section>

      {/* Explainer Modal */}
      <LdiCalculationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        entityName={selectedEntity.name}
      />
    </div>
  );
};

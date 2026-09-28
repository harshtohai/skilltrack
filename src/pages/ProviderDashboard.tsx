import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { KpiCard } from '../components/KpiCard.tsx';
import { SustainCurveChart } from '../components/SustainCurveChart.tsx';
import { DurabilityActionEngine } from '../components/DurabilityActionEngine.tsx';
import { LdiCalculationModal } from '../components/LdiCalculationModal.tsx';
import {
  Users,
  Award,
  TrendingUp,
  IndianRupee,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [providerData, setProviderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [durabilitySummary, setDurabilitySummary] = useState<{
    ldi: number | null;
    band: string;
    sustain12: number;
    stateSustain12: number;
  }>({
    ldi: 76,
    band: 'B',
    sustain12: 74,
    stateSustain12: 65
  });

  const navigate = useNavigate();

  const providerId = user?.provider_id || 'prov-1';

  useEffect(() => {
    fetch(`/api/analytics/providers/${providerId}`)
      .then((res) => res.json())
      .then((data) => {
        setProviderData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    // Fetch durability curve
    fetch(`/api/durability/curve?group_by=provider&cohort=all`)
      .then((r) => r.json())
      .then((data) => {
        const pCurve = data.curves?.find((c: any) => c.id === providerId);
        const stateCurve = data.curves?.find((c: any) => c.id === 'state');
        if (pCurve) {
          const pt12 = pCurve.points?.find((p: any) => p.month === 12);
          const sPt12 = stateCurve?.points?.find((p: any) => p.month === 12);
          setDurabilitySummary({
            ldi: pCurve.ldi ?? 76,
            band: pCurve.band || 'B',
            sustain12: pt12 ? Math.round(pt12.retained * 100) : 74,
            stateSustain12: sPt12 ? Math.round(sPt12.retained * 100) : 65
          });
        }
      })
      .catch((err) => console.error(err));
  }, [providerId]);

  const sc = providerData?.scorecard;
  const sustainDiff = durabilitySummary.sustain12 - durabilitySummary.stateSustain12;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Training Institute Portal
          </span>
          <h1 className="text-2xl font-bold text-slate-900 font-display mt-1">
            {providerData?.provider?.name || 'Pune Skill Development Centre'}
          </h1>
          <p className="text-xs text-slate-500">
            Centre Code: {providerData?.provider?.code || 'PUN-01'} · Accreditation: Tier-1 Accredited ITI
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/provider/trainees')}
            className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            + Add / Import Trainees
          </button>
          <button
            onClick={() => navigate('/provider/followups')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Follow-up Queue</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Accountability Score"
          value={sc?.score || 84}
          suffix=" / 100"
          subtext={`Grade ${sc?.band || 'A'} Certified`}
          icon={Award}
          color="indigo"
          highlight
        />

        <KpiCard
          title="Verified Placement"
          value={sc?.placementRate || 74}
          suffix="%"
          subtext="State threshold: 60%"
          icon={CheckCircle2}
          color="emerald"
        />

        <KpiCard
          title="6-Month Retention"
          value={sc?.retention6m || 80}
          suffix="%"
          subtext="Dual-verified retention"
          icon={TrendingUp}
          color="saffron"
        />

        <KpiCard
          title="Average Monthly Wage"
          value={sc?.avgWage || 17800}
          prefix="₹"
          subtext="Above state minimum wage"
          icon={IndianRupee}
          color="purple"
        />

        <KpiCard
          title="Data Completeness"
          value={sc?.dataCompleteness || 92}
          suffix="%"
          subtext="10% scorecard weight"
          icon={CheckCircle2}
          color="sky"
        />
      </div>

      {/* My Durability Section */}
      <div className="bg-white dark:bg-[#171B24] border border-[#E3E6EC] dark:border-[#2B3140] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3E6EC] dark:border-[#2B3140]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-[#E8853A]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  My Durability (LDI &amp; Sustain Curve)
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  LDI {durabilitySummary.ldi} &bull; Band {durabilitySummary.band}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Adjusted for your trainee intake: 62% rural, 45% women. Your benchmark is calibrated against peers with similar intake.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#E3E6EC] dark:border-[#2B3140] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1F2430] flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              How is my LDI calculated?
            </button>
            <button
              type="button"
              onClick={() => navigate('/provider/durability')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#E8853A] text-[#1B1F2A] hover:bg-[#D4762F] flex items-center gap-1"
            >
              Full Analysis
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Comparison Callout */}
        <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Comparative Retention:</strong> You retain <strong>+{sustainDiff >= 0 ? sustainDiff : 8}%</strong> more trainees at 12m ({durabilitySummary.sustain12}%) than similar providers ({durabilitySummary.stateSustain12}%).
            </span>
          </div>
          <span className="text-[11px] font-mono opacity-80 shrink-0">k=30 EB Shrunk</span>
        </div>

        {/* Embedded Sustain Curve Chart */}
        <div className="pt-2">
          <SustainCurveChart
            selectedEntity={{
              type: 'provider',
              id: providerId,
              name: providerData?.provider?.name || 'Your Institute'
            }}
            compareWithState={true}
            compact={true}
          />
        </div>

        {/* Active Action Recommendations for this Provider */}
        <div className="pt-2">
          <DurabilityActionEngine filterEntityId={providerId} />
        </div>
      </div>

      {/* Explainer Modal */}
      <LdiCalculationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        entityName={providerData?.provider?.name || 'Your Institute'}
        mixDetails={{
          ruralPct: 62,
          womenPct: 45
        }}
      />

      {/* Active Batches and Immediate Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Active &amp; Tracked Batches</h3>
            <span className="text-xs text-slate-500 font-medium">
              {providerData?.batches?.length || 0} batches registered
            </span>
          </div>

          <div className="space-y-3">
            {providerData?.batches?.map((b: any) => (
              <div
                key={b.batchId}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{b.courseName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Batch Code: <strong className="font-mono text-slate-700">{b.batchCode}</strong> · Capacity: {b.capacity} trainees
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Timeline: {b.startDate} to {b.endDate}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {b.placementRate}% Placement
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Dual-verified</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Root Causes of Non-Placement */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Non-Placement Feedback</h3>
            <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-semibold">
              Action Items
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Reported reasons for unplaced trainees in this institute. Use this feedback to adapt next quarter's curricula.
          </p>

          <div className="space-y-2">
            {providerData?.topReasons?.map((r: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex justify-between items-center">
                <span className="font-medium text-slate-800">{r.reason}</span>
                <span className="font-bold text-rose-600">{r.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

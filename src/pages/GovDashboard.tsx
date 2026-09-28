import React, { useEffect, useState } from 'react';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  IndianRupee,
  ShieldCheck,
  Award,
  Download,
  Printer,
  Sparkles,
  RefreshCw,
  HelpCircle,
  FileSpreadsheet,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import { KpiCard } from '../components/KpiCard.tsx';
import { FilterBar } from '../components/FilterBar.tsx';
import { AiInsightCard } from '../components/AiInsightCard.tsx';
import { AskDataBox } from '../components/AskDataBox.tsx';
import { ScoreModal } from '../components/ScoreModal.tsx';
import {
  OutcomeStatusChart,
  WageProgressionChart,
  RetentionCurveChart,
  NonPlacementReasonsChart,
  ConfidenceSplitBar
} from '../components/Charts.tsx';
import {
  FilterParams,
  SummaryMetrics,
  WageProgressionPoint,
  RetentionCurvePoint,
  NonPlacementReasonStat
} from '../types.ts';
import { useNavigate } from 'react-router-dom';

export const GovDashboard: React.FC = () => {
  const [filters, setFilters] = useState<FilterParams>({ includeUnverified: false });
  const [summary, setSummary] = useState<SummaryMetrics | null>(null);
  const [wageData, setWageData] = useState<WageProgressionPoint[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionCurvePoint[]>([]);
  const [reasonsData, setReasonsData] = useState<NonPlacementReasonStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchAll = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (filters.district) query.set('district', filters.district);
    if (filters.sector) query.set('sector', filters.sector);
    if (filters.provider) query.set('provider', filters.provider);
    if (filters.gender) query.set('gender', filters.gender);
    if (filters.category) query.set('category', filters.category);
    if (filters.year) query.set('year', filters.year);
    if (filters.includeUnverified) query.set('includeUnverified', 'true');

    const qs = query.toString() ? `?${query.toString()}` : '';

    Promise.all([
      fetch(`/api/analytics/summary${qs}`).then((r) => r.json()),
      fetch(`/api/analytics/wage-progression${qs}`).then((r) => r.json()),
      fetch(`/api/analytics/retention${qs}`).then((r) => r.json()),
      fetch(`/api/analytics/non-placement-reasons${qs}`).then((r) => r.json())
    ])
      .then(([sum, wages, ret, reasons]) => {
        setSummary(sum);
        setWageData(wages);
        setRetentionData(ret);
        setReasonsData(reasons);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard analytics:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAll();
  }, [filters]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    window.location.href = '/api/export/analytics.csv';
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Export controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#E2E2DE]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[22px] sm:text-[26px] font-normal text-[#303030] tracking-tight">
              Maharashtra Skilling Outcomes & Impact Dashboard
            </h1>
            <span className="bg-[#FFF0A8] text-[#665400] text-[11px] font-medium px-2.5 py-0.5 rounded-full">
              Live State Telemetry
            </span>
          </div>
          <p className="text-xs text-[#74767D] mt-0.5">
            Department of Skills, Employment, Entrepreneurship and Innovation · Real-time longitudinal cohort tracking
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden flex-wrap">
          <button
            onClick={() => navigate('/gov/followups')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#075E54] bg-[#BFE7C2] hover:bg-[#A4D8A8] border border-[#A4D8A8] transition-colors shadow-2xs group"
            title="View all recorded trainee WhatsApp follow-up messages"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#075E54]" />
            <span>WhatsApp Follow-ups</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#075E54] animate-pulse" />
          </button>

          <button
            onClick={() => setScoreModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#303030] bg-white hover:bg-[#F1F1EE] border border-[#E2E2DE] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#74767D]" />
            <span>Scorecard Formula</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#303030] bg-white hover:bg-[#F1F1EE] border border-[#E2E2DE] transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#74767D]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-white bg-[#303030] hover:bg-[#202020] transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-white" />
            <span>Print Policy Brief</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={(newFilters) => setFilters(newFilters)}
        onReset={() => setFilters({ includeUnverified: false })}
      />

      {/* Gemini AI Policy Intelligence */}
      <AiInsightCard filters={filters} />

      {/* Natural Language Query Assistant */}
      <AskDataBox
        onChartSelect={(hint) => {
          if (hint === 'districts') navigate('/gov/districts');
          else if (hint === 'providers') navigate('/gov/providers');
          else if (hint === 'skill-gaps') navigate('/gov/skill-gaps');
        }}
      />

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 w-full">
        <KpiCard
          id="kpi-total-trainees"
          title="Tracked Trainees"
          value={summary?.totalCertifiedConsented || 0}
          suffix=""
          change={+14}
          changePeriod="longitudinal cohort"
          icon={Users}
          color="indigo"
          highlight
        />

        <KpiCard
          id="kpi-placement-rate"
          title="Verified Placement"
          value={summary?.placementRate || 0}
          suffix="%"
          change={+5.2}
          changePeriod="dual-verified"
          icon={CheckCircle2}
          color="emerald"
        />

        <KpiCard
          id="kpi-retention-6m"
          title="6-Month Retention"
          value={summary?.retention6m || 0}
          suffix="%"
          change={-2.1}
          changePeriod="post-placement"
          icon={TrendingUp}
          color="saffron"
        />

        <KpiCard
          id="kpi-avg-wage"
          title="Avg. Monthly Wage"
          value={summary?.avgWage || 0}
          prefix="₹"
          change={+8.4}
          changePeriod="vs ₹12.5k min."
          icon={IndianRupee}
          color="purple"
        />

        <KpiCard
          id="kpi-public-value"
          title="Public Value Ratio"
          value={summary?.publicValueRatio || '2.8'}
          suffix="x"
          subtext="₹2.80 tax return per ₹1 spent"
          icon={Award}
          color="sky"
        />

        <KpiCard
          id="kpi-data-quality"
          title="Data Completeness"
          value={summary?.dataCompleteness || 0}
          suffix="%"
          subtext="Audited verification score"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* Dual Verification Split Banner */}
      <div className="bg-white rounded-[20px] border border-[#E2E2DE] p-4 sm:p-5 shadow-[0_3px_14px_rgba(35,38,45,0.05)] transition-colors duration-200 w-full overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E2DE] mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#305B35]" />
            <h3 className="font-medium text-[#303030] text-xs uppercase tracking-wider">
              Longitudinal Verification Confidence Split
            </h3>
          </div>
          <span className="text-xs text-[#74767D]">
            {filters.includeUnverified ? 'Showing all records' : 'Filtered to verified outcomes'}
          </span>
        </div>
        <ConfidenceSplitBar
          high={summary?.highConfidencePct || 54}
          medium={summary?.mediumConfidencePct || 28}
          low={summary?.lowConfidencePct || 18}
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
        {/* Longitudinal Wage Progression with Minimum Wage reference line */}
        <div className="bg-white rounded-[20px] border border-[#E2E2DE] p-4 sm:p-5 shadow-[0_3px_14px_rgba(35,38,45,0.05)] transition-colors duration-200 w-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E2DE] mb-2">
            <div>
              <h3 className="font-medium text-[#303030] text-sm">Longitudinal Wage Progression</h3>
              <p className="text-xs text-[#74767D]">Tracked across 3-Month, 6-Month, and 12-Month checkpoints</p>
            </div>
            <span className="text-[11px] font-medium text-[#8A3030] bg-[#FCE8E8] px-2.5 py-0.5 rounded-full">
              Min Wage: ₹12,500
            </span>
          </div>
          <WageProgressionChart data={wageData} />
        </div>

        {/* Longitudinal Employment Retention Curve */}
        <div className="bg-white rounded-[20px] border border-[#E2E2DE] p-4 sm:p-5 shadow-[0_3px_14px_rgba(35,38,45,0.05)] transition-colors duration-200 w-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E2DE] mb-2">
            <div>
              <h3 className="font-medium text-[#303030] text-sm">Employment Retention Curve</h3>
              <p className="text-xs text-[#74767D]">Percentage of placed trainees retaining employment over 12 months</p>
            </div>
            <span className="text-[11px] font-medium text-[#665400] bg-[#FFF0A8] px-2.5 py-0.5 rounded-full">
              Target: 70%
            </span>
          </div>
          <RetentionCurveChart data={retentionData} />
        </div>

        {/* Outcome Status Distribution */}
        <div className="bg-white rounded-[20px] border border-[#E2E2DE] p-4 sm:p-5 shadow-[0_3px_14px_rgba(35,38,45,0.05)] transition-colors duration-200 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E2DE] mb-2">
            <div>
              <h3 className="font-medium text-[#303030] text-sm">Cohort Outcome Statuses</h3>
              <p className="text-xs text-[#74767D]">6 standard post-training classifications</p>
            </div>
          </div>
          <OutcomeStatusChart
            breakdown={
              summary?.breakdown || {
                'Wage Employed': 580,
                'Self-Employed': 75,
                Apprenticeship: 50,
                'Further Study': 30,
                Unemployed: 245,
                'Not Reachable': 76
              }
            }
            total={summary?.totalCertifiedConsented || 1056}
          />
        </div>

        {/* Non-Placement Reasons */}
        <div className="bg-white rounded-[20px] border border-[#E2E2DE] p-4 sm:p-5 shadow-[0_3px_14px_rgba(35,38,45,0.05)] transition-colors duration-200 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E2DE] mb-2">
            <div>
              <h3 className="font-medium text-[#303030] text-sm">Non-Placement Root Causes</h3>
              <p className="text-xs text-[#74767D]">Why unplaced youth are not employed (Gemini NLP classified)</p>
            </div>
            <span className="text-[11px] font-medium text-[#74767D] bg-[#F1F1EE] px-2.5 py-0.5 rounded-full">
              Ranked Impact
            </span>
          </div>
          <NonPlacementReasonsChart data={reasonsData} />
        </div>
      </div>

      {/* Provider Scorecard Formula Modal */}
      <ScoreModal isOpen={scoreModalOpen} onClose={() => setScoreModalOpen(false)} />
    </div>
  );
};

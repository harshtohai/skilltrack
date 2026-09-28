import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { KpiCard } from '../components/KpiCard.tsx';
import { CheckSquare, Briefcase, Award, ShieldCheck, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [hires, setHires] = useState<any[]>([]);
  const [demands, setDemands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const employerId = user?.employer_id || 'emp-1';

  useEffect(() => {
    Promise.all([
      fetch(`/api/employers/${employerId}/hires`).then((r) => r.json()),
      fetch('/api/employers/demands').then((r) => r.json())
    ])
      .then(([h, d]) => {
        setHires(h);
        setDemands(d.filter((item: any) => item.employer_id === employerId));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [employerId]);

  const pendingConfirmations = hires.filter((h) => !h.employerConfirmed);
  const confirmedHires = hires.filter((h) => h.employerConfirmed);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Corporate &amp; MSME Portal
          </span>
          <h1 className="text-2xl font-bold text-slate-900 font-display mt-1">
            Tata Motors Ltd · Maharashtra
          </h1>
          <p className="text-xs text-slate-500">
            GSTIN: 27AAAAT0123M1Z2 · Status:{' '}
            <strong className="text-emerald-700">Verified Enterprise (Code 27)</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/employer/hires')}
            className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Confirm Pending Hires ({pendingConfirmations.length})</span>
          </button>
          <button
            onClick={() => navigate('/employer/demand')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Skill Demand</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Pending Hire Confirmations"
          value={pendingConfirmations.length}
          subtext="Awaiting your verification"
          icon={CheckSquare}
          color="saffron"
          highlight={pendingConfirmations.length > 0}
        />

        <KpiCard
          title="Verified Retained Hires"
          value={confirmedHires.length}
          subtext="Dual-verified on state registry"
          icon={ShieldCheck}
          color="emerald"
        />

        <KpiCard
          title="Active Skill Requisitions"
          value={demands.length}
          subtext="Live in curriculum heatmap"
          icon={Briefcase}
          color="indigo"
        />
      </div>

      {/* Immediate action list */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Trainees Awaiting Confirmation</h3>
            <p className="text-xs text-slate-500">
              Confirming these youth establishes High-Confidence Dual-Verified outcomes for state subsidy reconciliation.
            </p>
          </div>
          <button
            onClick={() => navigate('/employer/hires')}
            className="text-xs text-indigo-700 font-semibold flex items-center gap-1 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingConfirmations.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            All reported hires are verified. No pending confirmations.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingConfirmations.slice(0, 4).map((hire) => (
              <div
                key={hire.outcomeId}
                className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-900">{hire.traineeName}</p>
                  <p className="text-[11px] text-slate-500">
                    Role: <strong>{hire.jobRole}</strong> · Trainee ID:{' '}
                    <span className="font-mono text-indigo-700">{hire.skillId}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900">
                    ₹{hire.monthlyWage?.toLocaleString('en-IN')}/mo
                  </span>
                  <button
                    onClick={() => navigate('/employer/hires')}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold rounded-lg text-xs"
                  >
                    Review &amp; Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

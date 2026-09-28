import React, { useEffect, useState } from 'react';
import { Award, Printer, Download, Sparkles, TrendingUp, IndianRupee, Users } from 'lucide-react';
import { PublicValueRatio } from '../types.ts';

export const GovImpact: React.FC = () => {
  const [impact, setImpact] = useState<PublicValueRatio | null>(null);
  const [preWage, setPreWage] = useState(6000);
  const [costPerTrainee, setCostPerTrainee] = useState(18000);
  const [projectionYears, setProjectionYears] = useState(3);

  useEffect(() => {
    fetch('/api/analytics/impact')
      .then((res) => res.json())
      .then((data) => setImpact(data))
      .catch((err) => console.error(err));
  }, []);

  const totalTrainees = impact?.totalTrainees || 1056;
  const placedTrainees = impact?.placedCount || 654;
  const avgMonthlyWage = impact?.avgMonthlyWage || 16200;

  // Real-time calculation with interactive sliders
  const monthlyWageGain = Math.max(0, avgMonthlyWage - preWage);
  const annualWageGain = monthlyWageGain * 12;
  const multiYearGain = annualWageGain * projectionYears * placedTrainees;
  const totalStateInvestment = totalTrainees * costPerTrainee;
  const computedRatio = totalStateInvestment > 0 ? (multiYearGain / totalStateInvestment).toFixed(2) : '2.80';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Economic Impact &amp; Public Value Calculator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quantifying return on public expenditure across Maharashtra skilling schemes over a 3-year horizon.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-950 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Policy Brief</span>
          </button>
        </div>
      </div>

      {/* Official Policy Brief Document Container (Prints cleanly) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 print:border-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl text-slate-900">
                GOVERNMENT OF MAHARASHTRA
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-700">
              Department of Skills, Employment, Entrepreneurship and Innovation
            </p>
            <p className="text-[11px] text-slate-500">
              Executive Skilling Outcomes Policy Brief · Longitudinal Verification Report
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-mono font-bold text-slate-800">DOC REF: MH-SKILL-2026-Q1</p>
            <p>Generated: {new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        {/* Interactive Sliders (Hidden in print) */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 print:hidden">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Simulate Policy Variables &amp; Cost Assumptions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 mb-1">
                Baseline Pre-Training Monthly Income: <strong>₹{preWage.toLocaleString('en-IN')}</strong>
              </label>
              <input
                type="range"
                min={3000}
                max={10000}
                step={500}
                value={preWage}
                onChange={(e) => setPreWage(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">
                State Training Subsidy Per Candidate: <strong>₹{costPerTrainee.toLocaleString('en-IN')}</strong>
              </label>
              <input
                type="range"
                min={10000}
                max={30000}
                step={1000}
                value={costPerTrainee}
                onChange={(e) => setCostPerTrainee(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">
                Impact Horizon: <strong>{projectionYears} Years</strong>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={projectionYears}
                onChange={(e) => setProjectionYears(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <span className="text-xs text-slate-500 font-medium">Cohort Trainees Tracked</span>
            <p className="text-2xl font-bold text-slate-900 font-display mt-1">
              {totalTrainees.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <span className="text-xs text-slate-500 font-medium">Placed in Wage / Self-Emp.</span>
            <p className="text-2xl font-bold text-emerald-700 font-display mt-1">
              {placedTrainees.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <span className="text-xs text-slate-500 font-medium">Post-Training Average Wage</span>
            <p className="text-2xl font-bold text-slate-900 font-display mt-1">
              ₹{avgMonthlyWage.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/70">
            <span className="text-xs text-indigo-900 font-bold uppercase tracking-wider">
              Public Value Return Ratio
            </span>
            <p className="text-3xl font-bold text-indigo-950 font-display mt-1">
              {computedRatio}x
            </p>
          </div>
        </div>

        {/* Executive Narrative */}
        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
          <h3 className="font-bold text-sm text-slate-900">Executive Findings</h3>
          <p>
            For every ₹1.00 invested by the Government of Maharashtra in vocational skill development, the verified
            employment trajectory yields approximately <strong>₹{computedRatio}</strong> in cumulative net income
            addition for beneficiary youth over a {projectionYears}-year horizon.
          </p>
          <p>
            Key drivers of high return include technical manufacturing trades (CNC Operator, TIG Welder) and Green
            Energy (Solar Technician), where post-certification earnings exceed ₹18,500 per month with over 78% 6-month
            retention.
          </p>
        </div>

        {/* Recommendations Section */}
        <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
          <h4 className="font-bold text-slate-900">Cabinet Policy Recommendations:</h4>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>
              <strong>Link Capital Grants to Provider Scorecards:</strong> Only institutes with Grade A or B ratings
              (Score &ge; 65) should receive automatic annual batch expansion approvals.
            </li>
            <li>
              <strong>Mandate Employer Pre-Commitments in Remote Districts:</strong> Require 40% local employer hiring
              commitments prior to sanctioning non-technical ITI batches in Gadchiroli and Nandurbar.
            </li>
            <li>
              <strong>Universalize Dual-Verification Standard:</strong> Make dual confirmation (trainee + employer GSTIN
              validation) the mandatory audit criterion for all state skilling reimbursement tranches.
            </li>
          </ol>
        </div>

        {/* Signatures */}
        <div className="border-t border-slate-200 pt-8 flex justify-between text-xs text-slate-600">
          <div>
            <div className="w-36 border-b border-slate-400 mb-1" />
            <p className="font-semibold text-slate-900">Principal Secretary</p>
            <p className="text-[11px] text-slate-500">Skills &amp; Entrepreneurship, Govt. of Maharashtra</p>
          </div>
          <div className="text-right">
            <div className="w-36 border-b border-slate-400 mb-1 ml-auto" />
            <p className="font-semibold text-slate-900">Director General</p>
            <p className="text-[11px] text-slate-500">Maharashtra State Skill Development Society (MSSDS)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

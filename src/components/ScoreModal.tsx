import React from 'react';
import { X, HelpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ScoreModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#171B24] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-[#2B3140] text-slate-800 dark:text-[#E6E9F0] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#2B3140]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Provider Scorecard Formula</h3>
              <p className="text-xs text-slate-500 dark:text-[#8F97A8]">Official Government of Maharashtra Accountability Metric</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F2430]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 py-4 text-xs text-slate-700 dark:text-[#E6E9F0]">
          <p className="leading-relaxed">
            The <strong>0–100 Provider Score</strong> quantifies both employment impact and data integrity.
            Institutes cannot inflate scores through unverified claims, as data completeness and follow-up response
            directly weight the outcome.
          </p>

          <div className="bg-slate-50 dark:bg-[#1F2430] p-3.5 rounded-xl border border-slate-200 dark:border-[#2B3140] space-y-2 font-mono text-[11px]">
            <div className="flex justify-between border-b border-slate-200 dark:border-[#2B3140] pb-1 font-semibold text-indigo-950 dark:text-indigo-300 font-sans text-xs">
              <span>Metric Component</span>
              <span>Weight</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-[#E6E9F0]">
              <span>1. Verified Placement Rate</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400">35%</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-[#E6E9F0]">
              <span>2. 6-Month Verified Retention</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400">25%</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-[#E6E9F0]">
              <span>3. Wage Index (Avg Wage ÷ ₹18,000, capped at 1.0)</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400">20%</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-[#E6E9F0]">
              <span>4. Longitudinal Data Completeness</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400">10%</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-[#E6E9F0]">
              <span>5. Follow-Up Response Rate</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400">10%</span>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Performance Rating Bands:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">Grade A (≥ 80 pts):</span>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Eligible for state expansion grants & priority batch quotas.</p>
              </div>
              <div className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/40">
                <span className="font-bold text-blue-800 dark:text-blue-300">Grade B (65–79 pts):</span>
                <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">Meets standard state skilling performance benchmark.</p>
              </div>
              <div className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40">
                <span className="font-bold text-amber-800 dark:text-amber-300">Grade C (50–64 pts):</span>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">Mandatory curriculum audit and assisted follow-up plan.</p>
              </div>
              <div className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40">
                <span className="font-bold text-rose-800 dark:text-rose-300">Needs Improvement (&lt; 50 pts):</span>
                <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">De-accreditation notice; frozen trainee admissions.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-[#2B3140] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#E8853A] hover:bg-[#D4762F] text-[#1B1F2A] rounded-xl text-xs font-semibold"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

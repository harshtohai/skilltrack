import React from 'react';
import { X, CheckCircle2, ShieldCheck, Scale, ArrowRight, HelpCircle } from 'lucide-react';

interface LdiCalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityName?: string;
  mixDetails?: {
    ruralPct?: number;
    womenPct?: number;
    courseMixName?: string;
  };
}

export const LdiCalculationModal: React.FC<LdiCalculationModalProps> = ({
  isOpen,
  onClose,
  entityName,
  mixDetails
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#171B24] border border-[#E3E6EC] dark:border-[#2B3140] rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-800 dark:text-[#E6E9F0] overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E3E6EC] dark:border-[#2B3140] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-[#E8853A]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                How is the Livelihood Durability Index (LDI) Calculated?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Maharashtra State Fairness &amp; Mix-Adjusted Methodology (Actuarial Standard)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#1F2430] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Key Formula Box */}
          <div className="bg-slate-50 dark:bg-[#1F2430] border border-[#E3E6EC] dark:border-[#2B3140] rounded-xl p-4">
            <div className="text-xs uppercase font-semibold text-[#E8853A] tracking-wider mb-1">
              The Primary LDI Formula (0 to 100)
            </div>
            <div className="font-mono text-sm sm:text-base font-medium text-slate-900 dark:text-white py-1">
              LDI = 100 &times; ( 0.60 &times; SustainScore + 0.40 &times; ProgressionScore )
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Durability evaluates not only whether a job lasts, but whether the worker gains career and wage momentum.
            </p>
          </div>

          {/* 1. Baseline & Durability Criteria */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              1. Baseline &amp; Thresholds
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-[#E3E6EC] dark:border-[#2B3140] bg-white dark:bg-[#171B24]">
                <span className="font-medium text-slate-900 dark:text-white">Retention Baseline:</span>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Earnings at Month 3 (Wage Employed, Self-Employed or Registered Apprenticeship).
                </p>
              </div>
              <div className="p-2.5 rounded-lg border border-[#E3E6EC] dark:border-[#2B3140] bg-white dark:bg-[#171B24]">
                <span className="font-medium text-slate-900 dark:text-white">Durability (&ge;95%):</span>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Trainees earning within 5% of their Month 3 baseline are classified as Sustained.
                </p>
              </div>
              <div className="p-2.5 rounded-lg border border-[#E3E6EC] dark:border-[#2B3140] bg-white dark:bg-[#171B24]">
                <span className="font-medium text-slate-900 dark:text-white">Wage Progression (&ge;110%):</span>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Trainees who receive a &ge;10% compensation rise over baseline earn full progression points.
                </p>
              </div>
              <div className="p-2.5 rounded-lg border border-[#E3E6EC] dark:border-[#2B3140] bg-white dark:bg-[#171B24]">
                <span className="font-medium text-slate-900 dark:text-white">Life-Table Survival:</span>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Accounts for trainees who enrolled recently and have not reached later checkpoints yet (right censoring).
                </p>
              </div>
            </div>
          </div>

          {/* 2. Demographic Mix-Adjustment */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              2. Fairness &amp; Mix-Adjustment
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Providers working with historically marginalized or rural populations face different employment ecosystems. We calculate an <strong>Expected Retention Rate</strong> by weighting state benchmarks against each provider’s exact course and geographic intake (Urban vs. Rural).
            </p>
            {mixDetails && (
              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-lg text-xs text-indigo-950 dark:text-indigo-200">
                <strong>Intake Profile for {entityName || 'your institution'}:</strong>{' '}
                {mixDetails.ruralPct != null ? `${mixDetails.ruralPct}% Rural` : 'Mix-adjusted'}{' '}
                {mixDetails.womenPct != null ? `&bull; ${mixDetails.womenPct}% Women` : ''}. Your target is benchmarked against peers training under matching demographic conditions.
              </div>
            )}
          </div>

          {/* 3. Small-Sample Shrinkage (Empirical Bayes) */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-500" />
              3. Empirical Bayes Shrinkage (k = 30)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Small training centres (e.g. 15 trainees) can swing wildly due to single random job changes. We pull small-sample estimates gently toward the statewide average using empirical Bayes shrinkage:
            </p>
            <div className="p-2 bg-slate-100 dark:bg-[#1F2430] rounded font-mono text-[11px] text-slate-700 dark:text-slate-300 text-center">
              shrunkRatio = (nEff &times; observedRatio + 30 &times; 1.0) / (nEff + 30)
            </div>
          </div>

          {/* 4. Confidence & Reliability Tiers */}
          <div className="space-y-2 border-t border-[#E3E6EC] dark:border-[#2B3140] pt-3">
            <h4 className="font-semibold text-slate-900 dark:text-white">
              Data Confidence Rules
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <li><strong>Reliable (Solid Line):</strong> Effective sample &ge; 30 trainees and follow-up coverage &ge; 60%.</li>
              <li><strong>Low Sample (Dashed Line):</strong> Effective sample &lt; 30 trainees. Band shown with warning icon.</li>
              <li><strong>Blocked Score:</strong> Follow-up coverage &lt; 40% suppresses LDI to prevent unreliable ranking.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-[#E3E6EC] dark:border-[#2B3140] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#E8853A] text-[#1B1F2A] hover:bg-[#D4762F] transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

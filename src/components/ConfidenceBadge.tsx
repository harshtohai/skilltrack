import React from 'react';
import { ConfidenceLevel } from '../types.ts';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface Props {
  confidence: ConfidenceLevel;
  showIcon?: boolean;
}

export const ConfidenceBadge: React.FC<Props> = ({ confidence, showIcon = true }) => {
  if (confidence === 'High') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        {showIcon && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
        <span>High Confidence (Dual-Verified)</span>
      </span>
    );
  }

  if (confidence === 'Medium') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        {showIcon && <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />}
        <span>Medium (Single-Source)</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      {showIcon && <Shield className="w-3.5 h-3.5 text-slate-400" />}
      <span>Low (Unverified)</span>
    </span>
  );
};

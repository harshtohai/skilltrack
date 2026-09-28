import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  TrendingDown,
  Layers,
  Send,
  MessageSquare
} from 'lucide-react';

export interface DurabilityAction {
  id: string;
  rule: string;
  title: string;
  evidence: string;
  recommendation: string;
  group: string;
  entity_type: 'provider' | 'course' | 'district' | 'provider_type';
  entity_id: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Acknowledged';
  triggered_on: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  acknowledged_note?: string;
}

interface DurabilityActionEngineProps {
  onFocusEntity?: (entity: { type: string; id: string; name: string }) => void;
  filterEntityId?: string;
}

export const DurabilityActionEngine: React.FC<DurabilityActionEngineProps> = ({
  onFocusEntity,
  filterEntityId
}) => {
  const [actions, setActions] = useState<DurabilityAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [acknowledgeNote, setAcknowledgeNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchActions = () => {
    setLoading(true);
    let url = '/api/durability/actions';
    if (filterEntityId) {
      url += `?entity_id=${filterEntityId}`;
    }
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setActions(data.actions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load durability actions:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchActions();
  }, [filterEntityId]);

  const handleAcknowledge = async (actionId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/durability/actions/${actionId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: acknowledgeNote.trim() || 'Reviewed and initiated department intervention.',
          user: 'State Project Directorate Official'
        })
      });
      if (res.ok) {
        setToastMessage('Durability action acknowledged');
        setSelectedActionId(null);
        setAcknowledgeNote('');
        fetchActions();
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err) {
      console.error('Failed to acknowledge action:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityStyle = (severity: string) => {
    if (severity === 'High') {
      return 'border-red-300 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-400';
    }
    if (severity === 'Medium') {
      return 'border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400';
    }
    return 'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400';
  };

  return (
    <div className="bg-white dark:bg-[#171B24] border border-[#E3E6EC] dark:border-[#2B3140] rounded-xl p-4 sm:p-5 shadow-xs my-6 transition-colors duration-200 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E3E6EC] dark:border-[#2B3140]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-[#E8853A]">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6B7385] dark:text-[#8F97A8]">
              Durability Action Engine
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Targeted policy interventions and quality recommendations generated from longitudinal survival data.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1F2430] text-slate-700 dark:text-slate-300 font-mono">
          {actions.length} {actions.length === 1 ? 'Action' : 'Actions'}
        </span>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Actions List */}
      {loading ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          Analyzing cohort retention and progression patterns...
        </div>
      ) : actions.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            No Active Durability Flags
          </span>
          <span className="text-slate-400 text-[11px] mt-0.5">
            Evaluated cohorts are performing within expected retention, wage growth, and coverage tolerances.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {actions.map((act) => {
            const isAcknowledging = selectedActionId === act.id;
            const isAck = act.status === 'Acknowledged';

            return (
              <div
                key={act.id}
                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                  isAck
                    ? 'border-slate-200 dark:border-[#2B3140] bg-slate-50/60 dark:bg-[#1F2430]/40 opacity-75'
                    : getSeverityStyle(act.severity)
                }`}
              >
                <div>
                  {/* Rule Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-white dark:bg-[#171B24] border border-current shadow-2xs">
                      {act.rule}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono">
                      <span>{act.group}</span>
                      {isAck ? (
                        <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-sans">
                          Acknowledged
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 font-sans font-medium">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                    {act.title}
                  </h4>

                  {/* Evidence */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                    <strong>Evidence:</strong> {act.evidence}
                  </p>

                  {/* Recommendation */}
                  <div className="mt-2.5 p-2.5 rounded-lg bg-white/80 dark:bg-[#171B24]/90 border border-[#E3E6EC] dark:border-[#2B3140] text-xs text-slate-800 dark:text-[#E6E9F0]">
                    <span className="font-semibold text-[#E8853A] block mb-0.5">
                      Required Action:
                    </span>
                    {act.recommendation}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-3 pt-3 border-t border-current/15 flex flex-wrap items-center justify-between gap-2">
                  {onFocusEntity && (
                    <button
                      type="button"
                      onClick={() =>
                        onFocusEntity({
                          type: act.entity_type,
                          id: act.entity_id,
                          name: act.group
                        })
                      }
                      className="text-xs font-semibold text-[#E8853A] hover:underline flex items-center gap-1"
                    >
                      View on Curve
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  {!isAck && !isAcknowledging && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedActionId(act.id);
                        setAcknowledgeNote('');
                      }}
                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#E8853A] text-[#1B1F2A] hover:bg-[#D4762F] transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>

                {/* Inline Note Box upon Acknowledge Click */}
                {isAcknowledging && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in duration-150">
                    <input
                      type="text"
                      placeholder="Add official note (e.g. issued directive to provider)..."
                      value={acknowledgeNote}
                      onChange={(e) => setAcknowledgeNote(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-[#E3E6EC] dark:border-[#2B3140] bg-white dark:bg-[#1F2430] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#E8853A]"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedActionId(null)}
                        className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleAcknowledge(act.id)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#E8853A] text-[#1B1F2A] hover:bg-[#D4762F] disabled:opacity-50"
                      >
                        {submitting ? 'Submitting...' : 'Confirm Acknowledgment'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

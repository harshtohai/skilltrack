import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Check, X, LogOut, CheckCircle2, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { ConfidenceBadge } from '../components/ConfidenceBadge.tsx';

export const EmployerHires: React.FC = () => {
  const { user } = useAuth();
  const [hires, setHires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string>('');

  // Left Job Modal state
  const [leftModalOpen, setLeftModalOpen] = useState(false);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string | null>(null);
  const [leftReason, setLeftReason] = useState('Salary Expectation');
  const [leftDate, setLeftDate] = useState(new Date().toISOString().split('T')[0]);

  const employerId = user?.employer_id || 'emp-1';

  const fetchHires = () => {
    fetch(`/api/employers/${employerId}/hires`)
      .then((res) => res.json())
      .then((data) => {
        setHires(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHires();
  }, [employerId]);

  const handleAction = async (outcomeId: string, action: 'CONFIRM' | 'NOT_EMPLOYEE' | 'LEFT_JOB') => {
    try {
      const payload: any = { action };
      if (action === 'LEFT_JOB') {
        payload.left_reason = leftReason;
        payload.left_date = leftDate;
      }

      const res = await fetch(`/api/outcomes/${outcomeId}/employer-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFeedback(
          action === 'CONFIRM'
            ? 'Hire confirmed! Outcome verified with High Confidence.'
            : action === 'LEFT_JOB'
            ? 'Separation recorded. Retention status updated.'
            : 'Marked as not an employee.'
        );
        setLeftModalOpen(false);
        fetchHires();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Verify Hired Trainees &amp; Retention Checkpoints
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official employer verification interface establishing dual-confirmed employment status.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-3 rounded-l-lg">Trainee Name &amp; SkillID</th>
                <th className="py-3 px-3">Job Role / Trade</th>
                <th className="py-3 px-3 text-center">Interval</th>
                <th className="py-3 px-3 text-center">Monthly Wage</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Verification Level</th>
                <th className="py-3 px-3 text-right rounded-r-lg">Employer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hires.map((h) => (
                <tr key={h.outcomeId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-semibold text-slate-900">{h.traineeName}</p>
                    <p className="text-[11px] font-mono text-indigo-700">{h.skillId}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-slate-800">{h.jobRole}</p>
                    <p className="text-[11px] text-slate-500">{h.courseName}</p>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                    {h.checkpointMonth}M
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-semibold text-slate-900">
                    ₹{h.monthlyWage?.toLocaleString('en-IN') || '—'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {h.stillEmployed ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active Employee
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Left the Job
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <ConfidenceBadge confidence={h.confidence} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!h.employerConfirmed ? (
                        <>
                          <button
                            onClick={() => handleAction(h.outcomeId, 'CONFIRM')}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                            title="Confirm this hire"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm</span>
                          </button>
                          <button
                            onClick={() => handleAction(h.outcomeId, 'NOT_EMPLOYEE')}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200"
                            title="Not an employee"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        h.stillEmployed && (
                          <button
                            onClick={() => {
                              setSelectedOutcomeId(h.outcomeId);
                              setLeftModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Report Left</span>
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Left Job Separation Modal */}
      {leftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Record Employee Separation</h3>
            <p className="text-xs text-slate-500">
              Please specify the primary departure reason to help improve training curriculum retention.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Separation Reason</label>
                <select
                  value={leftReason}
                  onChange={(e) => setLeftReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900"
                >
                  <option value="Salary Expectation">Salary Expectation / Better Offer</option>
                  <option value="Relocation Issues">Relocation / Commute Distance</option>
                  <option value="Family or Personal">Family or Personal Commitments</option>
                  <option value="Skill Mismatch">Skill Mismatch / Performance</option>
                  <option value="Health Issues">Health Issues</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Effective Date</label>
                <input
                  type="date"
                  value={leftDate}
                  onChange={(e) => setLeftDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setLeftModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedOutcomeId && handleAction(selectedOutcomeId, 'LEFT_JOB')}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold"
              >
                Confirm Separation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

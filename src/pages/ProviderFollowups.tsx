import React, { useEffect, useState } from 'react';
import {
  PhoneCall,
  Play,
  CheckCircle2,
  AlertCircle,
  PhoneForwarded,
  Clock,
  Send,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge.tsx';

export const ProviderFollowups: React.FC = () => {
  const [followups, setFollowups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchFollowups = () => {
    fetch('/api/followups')
      .then((res) => res.json())
      .then((data) => {
        setFollowups(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFollowups();
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    setFeedbackMsg('');
    try {
      const res = await fetch('/api/followups/simulate', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbackMsg(data.message);
        fetchFollowups();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const handleQuickRespond = async (id: string) => {
    try {
      const res = await fetch(`/api/followups/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Responded', channel: 'SMS/WhatsApp' })
      });
      if (res.ok) {
        fetchFollowups();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = followups.filter((f) => {
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Longitudinal Follow-up Queue &amp; Auto-Escalation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated SMS &amp; WhatsApp surveys dispatched at 3, 6, and 12 months with assisted call escalation.
          </p>
        </div>

        {/* Simulate Sending Followups button for Hackathon judges */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-simulate-followups"
            onClick={handleSimulate}
            disabled={simulating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
            <span>{simulating ? 'Simulating...' : 'Simulate Sending Follow-ups (Judge Demo)'}</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs">
        {['all', 'Scheduled', 'Sent', 'Responded', 'No Response', 'Escalated to Assisted'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              filterStatus === st
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {st === 'all' ? 'All Follow-ups' : st}
          </button>
        ))}
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-3 rounded-l-lg">Trainee Name &amp; SkillID</th>
                <th className="py-3 px-3 text-center">Interval</th>
                <th className="py-3 px-3 text-center">Channel</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Attempts</th>
                <th className="py-3 px-3">Last Attempt</th>
                <th className="py-3 px-3 text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((f) => {
                const isEscalated = f.status === 'Escalated to Assisted';

                return (
                  <tr
                    key={f.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isEscalated ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">{f.trainee?.full_name || 'Trainee'}</p>
                      <p className="text-[11px] font-mono text-indigo-700">{f.trainee?.skill_id}</p>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                      {f.checkpoint_month}M
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {f.channel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isEscalated ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          <PhoneForwarded className="w-3 h-3" />
                          Escalated to Call
                        </span>
                      ) : (
                        <StatusBadge status={f.status} />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium text-slate-800">
                      {f.attempts || 1}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{f.last_attempt_on || 'Pending'}</td>
                    <td className="py-3 px-3 text-right">
                      {f.status !== 'Responded' && (
                        <button
                          onClick={() => handleQuickRespond(f.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                        >
                          Record Response
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

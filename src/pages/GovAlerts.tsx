import React, { useEffect, useState } from 'react';
import { AlertItem } from '../types.ts';
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock, Filter } from 'lucide-react';

export const GovAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const fetchAlerts = () => {
    fetch('/api/alerts')
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'Open' | 'In Progress' | 'Resolved') => {
    try {
      const res = await fetch(`/api/alerts/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchAlerts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = alerts.filter((a) => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Early Warning &amp; Operational Pulse
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated trigger alerts identifying underperforming institutes, high-attrition batches, and data non-compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as any)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-hidden"
          >
            <option value="all">All Severities</option>
            <option value="high">High Severity Only</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((alert) => {
          const isHigh = alert.severity === 'high';
          const isMed = alert.severity === 'medium';

          return (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all ${
                alert.status === 'Resolved'
                  ? 'bg-slate-50/50 border-slate-200 opacity-60'
                  : isHigh
                  ? 'bg-rose-50/30 border-rose-200 shadow-xs'
                  : isMed
                  ? 'bg-amber-50/30 border-amber-200 shadow-xs'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isHigh
                        ? 'bg-rose-100 text-rose-700'
                        : isMed
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{alert.title}</h4>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          isHigh
                            ? 'bg-rose-100 text-rose-800'
                            : isMed
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {alert.severity} priority
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Triggered on: {alert.triggered_on}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      alert.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : alert.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {alert.status}
                  </span>

                  <select
                    value={alert.status}
                    onChange={(e) => handleStatusChange(alert.id, e.target.value as any)}
                    className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-hidden"
                  >
                    <option value="Open">Mark Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

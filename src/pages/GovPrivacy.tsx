import React, { useEffect, useState } from 'react';
import { Shield, Lock, CheckCircle2, History, AlertTriangle } from 'lucide-react';
import { AuditLogEntry } from '../types.ts';

export const GovPrivacy: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit-log')
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">
          Privacy Architecture &amp; DPDP Act Compliance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Statutory compliance under India's Digital Personal Data Protection (DPDP) Act 2023 with immutable audit logging.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Granular Consent</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Separate opt-ins for employment tracking, wage tracking, and longitudinal follow-ups. Youth can withdraw at any time.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Data Minimisation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Full Aadhaar numbers are strictly prohibited. The system only stores salted SHA-256 hashes and last 4 digits.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Purpose Limitation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Skilling outcome data is restricted exclusively to public policy evaluation and training provider accreditation.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <History className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Right to Erasure</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Upon withdrawal of consent, individual trainee records are immediately excluded from all active state analytics.
          </p>
        </div>
      </div>

      {/* Immutable Audit Log Viewer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              State Access &amp; Modification Audit Trail
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {logs.length} Recent Access Events
          </span>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Timestamp</th>
                <th className="py-2.5 px-3">Actor / User ID</th>
                <th className="py-2.5 px-3">Operation / Action</th>
                <th className="py-2.5 px-3">Entity Type</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Details / Record ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-slate-500">{log.timestamp}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{log.user_id}</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{log.entity}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{log.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Search, CheckCircle2, AlertCircle } from 'lucide-react';

export const GovDataQuality: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/analytics/data-quality')
      .then((res) => res.json())
      .then((items) => {
        setData(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = (data || []).filter((d) => {
    const s = (search || '').trim().toLowerCase();
    if (!s) return true;
    const name = String(d?.name || '').toLowerCase();
    const district = String(d?.district || '').toLowerCase();
    return name.includes(s) || district.includes(s);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">
          Data Quality &amp; Verification Integrity Index
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Auditing the completeness, reliability, and dual-verification coverage of outcome data submitted by training institutes.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search provider or district..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Monitoring {filtered.length} institutes
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-3 rounded-l-lg">Institute Name</th>
                <th className="py-3 px-3">District</th>
                <th className="py-3 px-3 text-center">Data Completeness</th>
                <th className="py-3 px-3 text-center">Dual-Verified (High)</th>
                <th className="py-3 px-3 text-center">Single-Source (Med)</th>
                <th className="py-3 px-3 text-center">Unverified (Low)</th>
                <th className="py-3 px-3 text-right rounded-r-lg">Follow-up Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">{row.name}</td>
                  <td className="py-3 px-3 text-slate-600">{row.district}</td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        row.dataCompleteness >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.dataCompleteness >= 65
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {row.dataCompleteness}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-emerald-700 font-semibold">
                    {row.highConfidencePct}%
                  </td>
                  <td className="py-3 px-3 text-center text-amber-700 font-semibold">
                    {row.mediumConfidencePct}%
                  </td>
                  <td className="py-3 px-3 text-center text-slate-500">{row.lowConfidencePct}%</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {row.followupResponseRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { DistrictAnalyticsItem, DemographicGapItem } from '../types.ts';
import { MapPin, Search, ArrowUpRight, ShieldCheck, Users } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const GovDistricts: React.FC = () => {
  const [districts, setDistricts] = useState<DistrictAnalyticsItem[]>([]);
  const [demographics, setDemographics] = useState<DemographicGapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTribalOnly, setFilterTribalOnly] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics/districts').then((r) => r.json()),
      fetch('/api/analytics/demographics').then((r) => r.json())
    ])
      .then(([dist, demo]) => {
        setDistricts(dist);
        setDemographics(demo);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = (districts || []).filter((d) => {
    if (filterTribalOnly && !d.isTribal) return false;
    const s = (search || '').trim().toLowerCase();
    if (!s) return true;
    const name = String(d?.districtName || (d as any)?.name || '').toLowerCase();
    const region = String(d?.region || '').toLowerCase();
    return name.includes(s) || region.includes(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            District-Level Outcomes &amp; Equity Disparities
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Geographic dispersion analysis comparing tribal districts (Gadchiroli, Nandurbar, Palghar) vs urban industrial hubs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
            <input
              type="checkbox"
              checked={filterTribalOnly}
              onChange={(e) => setFilterTribalOnly(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 border-slate-300"
            />
            <span>Show Tribal Districts Only (ITDP)</span>
          </label>
        </div>
      </div>

      {/* Demographic Equity Gaps Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Demographic Equity Gaps (Placement &amp; Retention)</h3>
            <p className="text-xs text-slate-500">Comparing outcomes across gender, social category, and urban/rural location</p>
          </div>
          <span className="text-xs bg-amber-50 text-amber-800 font-semibold px-2.5 py-0.5 rounded border border-amber-200">
            Equity Benchmark: 65%
          </span>
        </div>

        <div className="h-64 min-h-[260px] w-full">
          <ResponsiveContainer width="100%" height={260} minHeight={260}>
            <BarChart data={demographics} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" opacity={0.5} />
              <XAxis dataKey="segment" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit="%" domain={[0, 100]} />
              <Tooltip
                formatter={(val: any) => [`${val}%`, '']}
                contentStyle={{ backgroundColor: '#171B24', borderColor: '#2B3140', borderRadius: 8, fontSize: 12, color: '#E6E9F0' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="placementRate" name="Placement Rate (%)" fill="#8B95F0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="retentionRate" name="6M Retention (%)" fill="#8FE0B0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search district or region..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filtered.length} districts in Maharashtra
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-3 rounded-l-lg">District Name</th>
                <th className="py-3 px-3">Administrative Division</th>
                <th className="py-3 px-3 text-center">Trainees Tracked</th>
                <th className="py-3 px-3 text-center">Placement Rate</th>
                <th className="py-3 px-3 text-center">6M Retention</th>
                <th className="py-3 px-3 text-center">Female Share</th>
                <th className="py-3 px-3 text-right rounded-r-lg">Average Wage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr key={d.districtId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{d.districtName}</span>
                      {d.isTribal && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          Tribal
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{d.region} Division</td>
                  <td className="py-3 px-3 text-center font-medium text-slate-800">
                    {d.traineeCount}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`font-bold ${
                        d.placementRate >= 65
                          ? 'text-emerald-700'
                          : d.placementRate >= 50
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {d.placementRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-medium text-slate-800">{d.retentionRate}%</td>
                  <td className="py-3 px-3 text-center text-slate-600 font-mono">{d.femaleShare}%</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    ₹{d.avgWage.toLocaleString('en-IN')}
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

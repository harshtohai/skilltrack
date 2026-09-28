import React, { useEffect, useState } from 'react';
import { ProviderScorecard, Provider } from '../types.ts';
import { Award, ChevronRight, HelpCircle, Search, ArrowUpDown, Building2 } from 'lucide-react';
import { ScoreModal } from '../components/ScoreModal.tsx';

export const GovProviders: React.FC = () => {
  const [scorecards, setScorecards] = useState<ProviderScorecard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [providerDetail, setProviderDetail] = useState<any>(null);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/analytics/providers')
      .then((res) => res.json())
      .then((data) => {
        setScorecards(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedProviderId) {
      fetch(`/api/analytics/providers/${selectedProviderId}`)
        .then((res) => res.json())
        .then((data) => setProviderDetail(data))
        .catch((err) => console.error(err));
    } else {
      setProviderDetail(null);
    }
  }, [selectedProviderId]);

  const filtered = (scorecards || []).filter((sc) => {
    const s = (search || '').trim().toLowerCase();
    if (!s) return true;
    const providerName = String(sc?.provider?.name || '').toLowerCase();
    const district = String(sc?.districtName || '').toLowerCase();
    return providerName.includes(s) || district.includes(s);
  });

  const getBandBadge = (band: string) => {
    switch (band) {
      case 'A':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Grade A (High Impact)</span>;
      case 'B':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Grade B (Standard)</span>;
      case 'C':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Grade C (Audited)</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">Needs Improvement</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Training Provider Accountability Scorecards
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            0–100 Composite index evaluating employment outcomes, retention, wage index, and data integrity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScoreModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How is this calculated?</span>
          </button>
        </div>
      </div>

      {/* Main Scorecard Table & Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`space-y-4 ${selectedProviderId ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
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
                Showing {filtered.length} accredited institutes
              </span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="py-3 px-3 rounded-l-lg text-center">Rank</th>
                    <th className="py-3 px-3">Provider Name & District</th>
                    <th className="py-3 px-3 text-center">Score (0–100)</th>
                    <th className="py-3 px-3 text-center">Rating Band</th>
                    <th className="py-3 px-3 text-center">Placement</th>
                    <th className="py-3 px-3 text-center">6M Retention</th>
                    <th className="py-3 px-3 text-center">Avg Wage</th>
                    <th className="py-3 px-3 text-right rounded-r-lg">Drill Down</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((sc) => (
                    <tr
                      key={sc.provider.id}
                      onClick={() => setSelectedProviderId(sc.provider.id)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        selectedProviderId === sc.provider.id ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-bold text-slate-900 font-mono">
                        #{sc.rank}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-900">{sc.provider.name}</p>
                        <p className="text-[11px] text-slate-500">{sc.districtName} · Code: {sc.provider.code}</p>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-sm text-indigo-950 font-display">{sc.score}</span>
                      </td>
                      <td className="py-3 px-3 text-center">{getBandBadge(sc.band)}</td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-800">
                        {sc.placementRate}%
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-800">
                        {sc.retention6m}%
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-800">
                        ₹{sc.avgWage.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button className="p-1 rounded text-slate-400 hover:text-indigo-600">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Provider Details Drawer */}
        {selectedProviderId && providerDetail && (
          <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-lg space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">
                  Detailed Institute Profile
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">
                  {providerDetail.provider?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {providerDetail.scorecard?.districtName} · Code: {providerDetail.provider?.code}
                </p>
              </div>
              <button
                onClick={() => setSelectedProviderId(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            {/* Scorecard breakdown */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-900 border-b border-slate-200 pb-1.5">
                <span>Composite Score</span>
                <span className="text-base font-bold text-indigo-900 font-display">
                  {providerDetail.scorecard?.score} / 100
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Placement (35% weight):</span>
                <span className="font-medium">{providerDetail.scorecard?.placementRate}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>6M Retention (25% weight):</span>
                <span className="font-medium">{providerDetail.scorecard?.retention6m}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Average Monthly Wage:</span>
                <span className="font-medium">₹{providerDetail.scorecard?.avgWage?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Data Completeness (10%):</span>
                <span className="font-medium">{providerDetail.scorecard?.dataCompleteness}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Follow-up Response (10%):</span>
                <span className="font-medium">{providerDetail.scorecard?.followupResponseRate}%</span>
              </div>
            </div>

            {/* Batches Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Active &amp; Completed Batches
              </h4>
              <div className="space-y-2">
                {providerDetail.batches?.map((b: any) => (
                  <div
                    key={b.batchId}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{b.courseName}</p>
                      <p className="text-[11px] text-slate-500">Batch Code: {b.batchCode}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700">{b.placementRate}%</span>
                      <p className="text-[10px] text-slate-400">placed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Non-Placement Reasons for this Provider */}
            {providerDetail.topReasons?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Top Unplaced Reasons
                </h4>
                <div className="space-y-1.5">
                  {providerDetail.topReasons.map((r: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs text-slate-600">
                      <span>{r.reason}</span>
                      <span className="font-semibold text-rose-600">{r.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ScoreModal isOpen={scoreModalOpen} onClose={() => setScoreModalOpen(false)} />
    </div>
  );
};

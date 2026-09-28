import React, { useEffect, useState } from 'react';
import { SkillGapItem } from '../types.ts';
import { AlertCircle, TrendingUp, CheckCircle, Search } from 'lucide-react';

export const SkillGapHeatmap: React.FC = () => {
  const [data, setData] = useState<SkillGapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/analytics/skill-gap')
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

  const filtered = (data || []).filter((item) => {
    const s = (search || '').trim().toLowerCase();
    if (!s) return true;
    const skill = String(item?.skill || (item as any)?.courseName || '').toLowerCase();
    const sector = String(item?.sector || '').toLowerCase();
    const course = String(item?.curriculumCourse || (item as any)?.courseName || '').toLowerCase();
    return skill.includes(s) || sector.includes(s) || course.includes(s);
  });

  return (
    <div className="bg-white dark:bg-[#171B24] rounded-2xl border border-slate-200 dark:border-[#2B3140] p-6 shadow-xs w-full max-w-full overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#2B3140]">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Skill Gap Heatmap (Employer Demand vs. ITI Curriculum)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Correlating live employer demand openings against current vocational training syllabus coverage.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skill, sector, or course..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2B3140] bg-slate-50 dark:bg-[#1F2430] focus:bg-white dark:focus:bg-[#171B24] text-slate-800 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading skill heatmap matrix...</div>
      ) : (
        <div className="overflow-x-auto w-full mt-4">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[720px]">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-3 rounded-l-lg">Skill / Tool Tag</th>
                <th className="py-3 px-3">Industry Sector</th>
                <th className="py-3 px-3">Associated Course</th>
                <th className="py-3 px-3 text-center">Employer Demand</th>
                <th className="py-3 px-3 text-center">Curriculum Status</th>
                <th className="py-3 px-3 text-center">Gap Score</th>
                <th className="py-3 px-3 text-right rounded-r-lg">Impacted Trainees</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row, idx) => {
                const isCritical = row.gapScore >= 70;
                const isModerate = row.gapScore >= 40 && row.gapScore < 70;

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCritical ? 'bg-rose-500' : isModerate ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                      {row.skill || (row as any).courseName || 'General Skill'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{row.sector || 'Technical'}</td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{row.curriculumCourse || (row as any).courseName || 'Vocational Trade'}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-slate-900">{row.employerDemandPct ?? 65}%</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {row.taughtInCurriculum ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-medium border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          Included
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full text-[11px] font-medium border border-rose-200">
                          <AlertCircle className="w-3 h-3" />
                          Omitted
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800 font-extrabold'
                              : isModerate
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {row.gapScore}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-800">
                      {row.impactedTrainees}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Critical Gap (Gap &gt; 70) — Immediate curriculum revision mandated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Moderate Gap (40–69)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Aligned (Taught &amp; In Demand)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

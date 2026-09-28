import React, { useEffect, useState } from 'react';
import { SkillGapHeatmap } from '../components/SkillGapHeatmap.tsx';
import { Briefcase, Building2, MapPin, IndianRupee } from 'lucide-react';

export const GovSkillGaps: React.FC = () => {
  const [demands, setDemands] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/employers/demands')
      .then((res) => res.json())
      .then((data) => setDemands(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">
          Skill Gaps &amp; Live Industry Demand Heatmap
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Bridging the disconnect between vocational curricula and private-sector job requirements in Maharashtra.
        </p>
      </div>

      {/* Primary Heatmap Matrix */}
      <SkillGapHeatmap />

      {/* Live Employer Demands Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Live Industry Openings &amp; Demand Requisitions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified corporate requisitions posted by registered Maharashtra employers.
            </p>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full border border-indigo-200">
            {demands.length} Open Positions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {demands.map((d) => (
            <div
              key={d.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{d.job_role}</h4>
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {d.employerName}
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {d.openings} Openings
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {d.skill_tags?.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {d.districtName}
                </span>
                <span className="font-mono font-semibold text-slate-800">
                  ₹{d.wage_min?.toLocaleString('en-IN')} - ₹{d.wage_max?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { CourseAnalyticsItem } from '../types.ts';
import { BookOpen, Search, ArrowUpDown, Award, Users, ChevronRight } from 'lucide-react';

export const GovCourses: React.FC = () => {
  const [courses, setCourses] = useState<CourseAnalyticsItem[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'courses' | 'cohorts'>('courses');

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics/courses').then((r) => r.json()),
      fetch('/api/analytics/cohorts').then((r) => r.json())
    ])
      .then(([crs, coh]) => {
        setCourses(crs);
        setCohorts(coh);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredCourses = (courses || []).filter((c) => {
    const s = (search || '').trim().toLowerCase();
    if (!s) return true;
    const name = String(c?.courseName || '').toLowerCase();
    const sector = String(c?.sector || '').toLowerCase();
    const code = String(c?.code || '').toLowerCase();
    return name.includes(s) || sector.includes(s) || code.includes(s);
  });

  const filteredCohorts = (cohorts || []).filter((ch) => {
    const s = (search || '').trim().toLowerCase();
    if (!s) return true;
    const cName = String(ch?.courseName || '').toLowerCase();
    const pName = String(ch?.providerName || '').toLowerCase();
    const bCode = String(ch?.batchCode || '').toLowerCase();
    return cName.includes(s) || pName.includes(s) || bCode.includes(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Vocational Courses &amp; Cohorts Performance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking 12 key NSQF courses across completion rates, verified placements, and market wage outcomes.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'courses' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Course Aggregates
          </button>
          <button
            onClick={() => setActiveTab('cohorts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'cohorts' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Batch Cohorts
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course title or sector..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {activeTab === 'courses' ? `${filteredCourses.length} Courses` : `${filteredCohorts.length} Cohorts`}
          </span>
        </div>

        {activeTab === 'courses' ? (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="py-3 px-3 rounded-l-lg">Course Name &amp; Code</th>
                  <th className="py-3 px-3">Industry Sector</th>
                  <th className="py-3 px-3 text-center">NSQF Level</th>
                  <th className="py-3 px-3 text-center">Duration</th>
                  <th className="py-3 px-3 text-center">Completion Rate</th>
                  <th className="py-3 px-3 text-center">Verified Placement</th>
                  <th className="py-3 px-3 text-right rounded-r-lg">Average Wage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">{c.courseName}</p>
                      <p className="text-[11px] text-slate-500">Code: {c.code}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{c.sector}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                        Lvl {c.nsqfLevel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600">{c.durationHours} hrs</td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-800">
                      {c.completionRate}%
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-700">
                      {c.placementRate}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{c.avgWage.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="py-3 px-3 rounded-l-lg">Batch Code</th>
                  <th className="py-3 px-3">Course Name</th>
                  <th className="py-3 px-3">Institute</th>
                  <th className="py-3 px-3 text-center">Enrolled</th>
                  <th className="py-3 px-3 text-center">Certified</th>
                  <th className="py-3 px-3 text-center">Placement</th>
                  <th className="py-3 px-3 text-right rounded-r-lg">Average Wage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCohorts.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-950">{ch.batchCode}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{ch.courseName}</td>
                    <td className="py-3 px-3 text-slate-600">{ch.providerName}</td>
                    <td className="py-3 px-3 text-center">{ch.enrolled}</td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-800">{ch.certified}</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-700">{ch.placementRate}%</td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-800">
                      ₹{ch.avgWage?.toLocaleString('en-IN') || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

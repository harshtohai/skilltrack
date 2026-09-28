import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { CalendarCheck, Users, Search, Award } from 'lucide-react';

export const ProviderBatches: React.FC = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/cohorts')
      .then((res) => res.json())
      .then((data) => {
        setBatches(data);
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
          Training Batches &amp; Cohort Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed enrolment, NSQF assessment rates, and post-training placement tracking by batch.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-3 rounded-l-lg">Batch Code</th>
                <th className="py-3 px-3">Trade / Course</th>
                <th className="py-3 px-3">Institute</th>
                <th className="py-3 px-3 text-center">Enrolled</th>
                <th className="py-3 px-3 text-center">Certified</th>
                <th className="py-3 px-3 text-center">Placement</th>
                <th className="py-3 px-3 text-right rounded-r-lg">Average Wage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-900">{b.batchCode}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{b.courseName}</td>
                  <td className="py-3 px-3 text-slate-600">{b.providerName}</td>
                  <td className="py-3 px-3 text-center font-medium">{b.enrolled}</td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-800">{b.certified}</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700">{b.placementRate}%</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    ₹{b.avgWage?.toLocaleString('en-IN')}
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

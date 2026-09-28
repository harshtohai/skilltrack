import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Briefcase, CheckCircle2, Plus, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmployerDemand: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobRole, setJobRole] = useState('Solar Field Technician');
  const [openings, setOpenings] = useState(10);
  const [skillInput, setSkillInput] = useState('Solar Wiring, Inverter Troubleshooting');
  const [wageMin, setWageMin] = useState(16000);
  const [wageMax, setWageMax] = useState(24000);
  const [districtId, setDistrictId] = useState('dist-2');
  const [success, setSuccess] = useState(false);

  const employerId = user?.employer_id || 'emp-1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const skills = skillInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/employers/${employerId}/demands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_role: jobRole,
          openings,
          skill_tags: skills,
          wage_min: wageMin,
          wage_max: wageMax,
          district_id: districtId
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/employer/dashboard');
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">
          Post Industry Skill Demand Requisition
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Your skill requisitions feed directly into the State Skill Gap Heatmap to guide vocational training curricula.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Demand requisition posted successfully! Redirecting to dashboard...</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs"
      >
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Job Designation / Role</label>
          <input
            type="text"
            required
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Number of Open Positions</label>
            <input
              type="number"
              min={1}
              required
              value={openings}
              onChange={(e) => setOpenings(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hiring District</label>
            <select
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
            >
              <option value="dist-2">Pune</option>
              <option value="dist-1">Mumbai Suburban</option>
              <option value="dist-3">Nagpur</option>
              <option value="dist-4">Nashik</option>
              <option value="dist-5">Aurangabad (Chhatrapati Sambhajinagar)</option>
              <option value="dist-11">Gadchiroli</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Required Specific Skills / Tools (Comma-separated)
          </label>
          <input
            type="text"
            required
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="e.g. Advanced Excel, MIS Reporting, Spoken English"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            These tags are matched against ITI course modules to pinpoint curriculum deficit areas.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Minimum Monthly Wage (₹)</label>
            <input
              type="number"
              min={10000}
              step={500}
              value={wageMin}
              onChange={(e) => setWageMin(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Maximum Monthly Wage (₹)</label>
            <input
              type="number"
              min={10000}
              step={500}
              value={wageMax}
              onChange={(e) => setWageMax(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/employer/dashboard')}
            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl font-semibold shadow-xs"
          >
            Publish Skill Requisition
          </button>
        </div>
      </form>
    </div>
  );
};

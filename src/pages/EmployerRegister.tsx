import React, { useState } from 'react';
import { Award, CheckCircle2, AlertTriangle, ShieldCheck, Building2, Search } from 'lucide-react';

export const EmployerRegister: React.FC = () => {
  const [name, setName] = useState('Mahindra & Mahindra Ltd');
  const [gstin, setGstin] = useState('27AAACM1234F1Z8');
  const [udyam, setUdyam] = useState('UDYAM-MH-26-0012345');
  const [sector, setSector] = useState('Automotive');
  const [districtId, setDistrictId] = useState('dist-2');
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/employers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          gstin,
          udyam,
          sector,
          district_id: districtId
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">
          Employer Accreditation &amp; Statutory Verification
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Automated GSTIN and Udyam format validation ensuring only legitimate enterprises verify skilling placements.
        </p>
      </div>

      {result && (
        <div
          className={`p-5 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-200 ${
            result.verification_status === 'Verified'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : result.verification_status === 'Pending'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {result.verification_status === 'Verified' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : result.verification_status === 'Pending' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            )}
            <span>
              Accreditation Status:{' '}
              {result.verification_status === 'Verified'
                ? 'Verified Maharashtra Enterprise (State Code 27)'
                : result.verification_status === 'Pending'
                ? 'Pending Manual Jurisdiction Review (Non-MH GSTIN)'
                : 'Flagged / Invalid GSTIN Format'}
            </span>
          </div>

          <p className="leading-relaxed">
            {result.verification_status === 'Verified'
              ? `Your entity "${result.name}" with GSTIN ${result.gstin} is authorized to confirm trainee placements.`
              : result.verification_status === 'Pending'
              ? `GSTIN ${result.gstin} belongs to an interstate jurisdiction. Requires state nodal officer approval.`
              : `GSTIN ${result.gstin} failed syntax checks or is present on the state risk register.`}
          </p>
        </div>
      )}

      <form
        onSubmit={handleRegister}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs"
      >
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Company / Legal Entity Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Goods and Services Tax Identification Number (GSTIN)
          </label>
          <input
            type="text"
            required
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            placeholder="e.g. 27AAAAA0000A1Z5"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono text-slate-900"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            State code 27 indicates Maharashtra registration for instant verification.
          </p>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            MSME Udyam Registration Number (Optional)
          </label>
          <input
            type="text"
            value={udyam}
            onChange={(e) => setUdyam(e.target.value.toUpperCase())}
            placeholder="e.g. UDYAM-MH-12-0012345"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono text-slate-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Industry Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
            >
              <option value="Automotive">Automotive</option>
              <option value="IT & ITES">IT &amp; ITES</option>
              <option value="Manufacturing">Capital Goods / Manufacturing</option>
              <option value="Green Energy">Renewable Energy</option>
              <option value="Healthcare">Healthcare &amp; Allied</option>
              <option value="Retail & Commerce">Retail &amp; Logistics</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Operating District</label>
            <select
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
            >
              <option value="dist-2">Pune</option>
              <option value="dist-1">Mumbai Suburban</option>
              <option value="dist-3">Nagpur</option>
              <option value="dist-4">Nashik</option>
              <option value="dist-5">Aurangabad (Chhatrapati Sambhajinagar)</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl font-semibold shadow-xs flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Validating Format...' : 'Validate & Verify Enterprise'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

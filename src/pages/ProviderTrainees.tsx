import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Upload,
  AlertCircle,
  CheckCircle,
  Eye,
  AlertTriangle,
  X
} from 'lucide-react';
import { ConfidenceBadge } from '../components/ConfidenceBadge.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { useNavigate } from 'react-router-dom';

export const ProviderTrainees: React.FC = () => {
  const [trainees, setTrainees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Add Trainee Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    dob: '2002-05-14',
    gender: 'Male',
    category: 'OBC',
    area_type: 'Rural',
    district_id: 'dist-2',
    phone: '9822012345',
    aadhaar_last4: '4589',
    education_level: '12th Standard',
    consent_granted: true
  });

  const navigate = useNavigate();

  const fetchTrainees = () => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      page: String(page),
      limit: '20'
    });
    fetch(`/api/trainees?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setTrainees(data.trainees || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrainees();
  }, [search, page]);

  const handleCreateTrainee = async (bypass = false) => {
    setFormError('');
    try {
      const res = await fetch('/api/trainees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          bypassDuplicateWarning: bypass
        })
      });

      if (res.status === 409) {
        const dupData = await res.json();
        setDuplicateWarning(dupData);
        return;
      }

      if (res.ok) {
        setIsAddOpen(false);
        setDuplicateWarning(null);
        fetchTrainees();
      } else {
        const err = await res.json();
        setFormError(err.error || 'Failed to register trainee');
      }
    } catch (err: any) {
      setFormError(err.message || 'Network error');
    }
  };

  // Bulk Upload handler
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const rows: any[] = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 3) {
        rows.push({
          full_name: parts[0]?.trim(),
          dob: parts[1]?.trim() || '2002-01-01',
          gender: parts[2]?.trim() || 'Male',
          phone: parts[3]?.trim() || '9876543210',
          aadhaar_last4: parts[4]?.trim() || '1234'
        });
      }
    }

    if (rows.length === 0) {
      alert('No valid CSV rows parsed. Expected format: full_name,dob,gender,phone,aadhaar_last4');
      return;
    }

    const res = await fetch('/api/trainees/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows })
    });
    if (res.ok) {
      const data = await res.json();
      alert(`Successfully imported ${data.imported} trainees. (${data.duplicatesSkipped} duplicates skipped)`);
      setIsBulkOpen(false);
      fetchTrainees();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Enrolled Trainees &amp; Unified SkillIDs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking longitudinal youth records under consent-governed permanent identifiers (MH-SK-XXXXXX).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBulkOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Bulk CSV Import</span>
          </button>

          <button
            id="btn-add-trainee"
            onClick={() => {
              setDuplicateWarning(null);
              setIsAddOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-950 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Single Trainee</span>
          </button>
        </div>
      </div>

      {/* Trainee Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or SkillID..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total {total} tracked trainees
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-3 rounded-l-lg">SkillID</th>
                <th className="py-3 px-3">Full Name &amp; Demographics</th>
                <th className="py-3 px-3">District</th>
                <th className="py-3 px-3">Trade / Course</th>
                <th className="py-3 px-3 text-center">Consent Status</th>
                <th className="py-3 px-3 text-center">12M Outcome</th>
                <th className="py-3 px-3 text-center">Confidence</th>
                <th className="py-3 px-3 text-right rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trainees.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-900">{t.skillId}</td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-slate-900">{t.fullName}</p>
                    <p className="text-[11px] text-slate-500">
                      {t.gender} · {t.category} · {t.areaType}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{t.districtName}</td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{t.courseName}</td>
                  <td className="py-3 px-3 text-center">
                    <StatusBadge status={t.consentStatus} />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <StatusBadge status={t.latestOutcomeStatus} />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <ConfidenceBadge confidence={t.confidence} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate(`/provider/trainees/${t.id}`)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                      title="View Full Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Page {page} of {Math.ceil(total / 20) || 1}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page * 20 >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Trainee Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Register New Trainee</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DUPLICATE WARNING MODAL / BANNER */}
            {duplicateWarning && (
              <div className="my-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Potential Duplicate Record Detected!</span>
                </div>
                <p>{duplicateWarning.message}</p>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleCreateTrainee(true)}
                    className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold"
                  >
                    Proceed Anyway (Create New)
                  </button>
                  <button
                    onClick={() => setDuplicateWarning(null)}
                    className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {formError && (
              <div className="my-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 py-3 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-600 mb-1 font-semibold">Full Legal Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Ramesh Shankar Patil"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Social Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Area Type</label>
                <select
                  value={formData.area_type}
                  onChange={(e) => setFormData({ ...formData, area_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
                >
                  <option value="Rural">Rural</option>
                  <option value="Urban">Urban</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Phone (Salted)</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Aadhaar (Last 4 digits)</label>
                <input
                  type="text"
                  maxLength={4}
                  value={formData.aadhaar_last4}
                  onChange={(e) => setFormData({ ...formData, aadhaar_last4: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
                />
              </div>

              <div className="col-span-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consent_granted}
                    onChange={(e) => setFormData({ ...formData, consent_granted: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="text-slate-700 font-medium">
                    Trainee signed DPDP-compliant consent form at enrolment
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateTrainee(false)}
                className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-semibold"
              >
                Register Trainee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk CSV Modal */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Bulk CSV Trainee Upload</h3>
              <button
                onClick={() => setIsBulkOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Upload a standard batch CSV. Required headers:{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">
                full_name,dob,gender,phone,aadhaar_last4
              </code>
            </p>
            <div className="mt-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleBulkUpload}
                className="text-xs w-full text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

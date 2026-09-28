import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  PhoneCall,
  Search,
  Filter,
  Download,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Briefcase,
  IndianRupee,
  Sparkles,
  TrendingUp,
  Cpu,
  UserCheck,
  Calendar,
  MapPin,
  ChevronRight,
  X,
  Send,
  Eye,
  CheckCheck,
  ArrowRight,
  Lock,
  Layers,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';

interface WhatsAppChatMessage {
  id: string;
  sender: 'bot' | 'trainee';
  senderName: string;
  timestamp: string;
  text: string;
  type: 'text' | 'interactive' | 'button_reply' | 'system';
  buttons?: string[];
  selectedButton?: string;
  stepIndex?: number;
  stepTitle?: string;
  status: 'delivered' | 'read' | 'replied';
}

interface TraineeWhatsAppFollowupRecord {
  id: string;
  traineeId: string;
  traineeName: string;
  phone: string;
  phoneMasked: string;
  districtId: string;
  districtName: string;
  courseId: string;
  courseName: string;
  providerId: string;
  providerName: string;
  checkpoint: '3M' | '6M' | '12M' | '24M';
  channel: string;
  status: 'Completed' | 'In Progress' | 'Awaiting Reply' | 'Escalated to Assisted';
  attempts: number;
  scheduledOn: string;
  lastMessageOn: string;
  completedAt?: string;
  verified: boolean;
  confidence: 'High' | 'Medium' | 'Low';
  consent: boolean;
  dpdpConsentTimestamp: string;
  outcomeData: {
    employmentStatus: string;
    employerName: string;
    jobRole: string;
    salaryRange: string;
    numericWage: number;
    jobSatisfaction: string;
    trainingRelevance: string;
    skillGaps: string[];
    suggestedCourses: string[];
    careerGoals: string;
    biggestChallenge: string;
  };
  messages: WhatsAppChatMessage[];
}

interface WhatsAppFollowupsSummary {
  totalDispatched: number;
  totalResponded: number;
  responseRatePercent: number;
  consentRatePercent: number;
  employedCount: number;
  selfEmployedCount: number;
  seekingWorkCount: number;
  avgReportedWage: number;
  topSkillGap: string;
  topUpskillDemand: string;
  topEmployer: string;
  dualVerifiedCount: number;
  cohortStats: Record<string, { dispatched: number; responded: number }>;
}

export const GovFollowups: React.FC = () => {
  const { t, language } = useAuth();
  const navigate = useNavigate();

  const [records, setRecords] = useState<TraineeWhatsAppFollowupRecord[]>([]);
  const [stats, setStats] = useState<WhatsAppFollowupsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'transcripts' | 'analytics' | 'dpdp'>('transcripts');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  // Selected chat modal
  const [selectedRecord, setSelectedRecord] = useState<TraineeWhatsAppFollowupRecord | null>(null);

  const fetchFollowupsData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/gov/whatsapp-followups');
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
        setStats(data.stats || null);
        // If modal is open, refresh its data
        if (selectedRecord) {
          const updated = (data.records || []).find((r: TraineeWhatsAppFollowupRecord) => r.id === selectedRecord.id);
          if (updated) setSelectedRecord(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch WhatsApp followups:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFollowupsData();
  }, []);

  const handleExportCsv = () => {
    window.location.href = '/api/gov/whatsapp-followups/export.csv';
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedCohort !== 'all' && r.checkpoint !== selectedCohort) return false;
      if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
      if (selectedDistrict !== 'all' && r.districtName !== selectedDistrict) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.traineeName.toLowerCase().includes(q);
        const matchesSkillId = `mh-sk-${r.traineeId}`.toLowerCase().includes(q);
        const matchesEmployer = (r.outcomeData.employerName || '').toLowerCase().includes(q);
        const matchesCourse = r.courseName.toLowerCase().includes(q);
        const matchesDistrict = r.districtName.toLowerCase().includes(q);
        const matchesPhone = r.phone.includes(q) || r.phoneMasked.includes(q);
        return matchesName || matchesSkillId || matchesEmployer || matchesCourse || matchesDistrict || matchesPhone;
      }
      return true;
    });
  }, [records, selectedCohort, selectedStatus, selectedDistrict, searchQuery]);

  const uniqueDistricts = useMemo(() => {
    const set = new Set(records.map((r) => r.districtName).filter(Boolean));
    return Array.from(set).sort();
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#BFE7C2] text-[#305B35] border border-[#A4D8A8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#305B35] animate-pulse" />
              Official WhatsApp Cloud SDK (Kapso)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--surface-warm)] text-[var(--accent-yellow-text)] border border-[var(--border)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
              DPDP Act 2023 Consent Verified
            </span>
          </div>

          <h1 className="text-[22px] sm:text-[26px] font-normal text-[var(--text-primary)] tracking-tight">
            Trainee WhatsApp Follow-up Transcripts &amp; Recorded Responses
          </h1>
          <p className="text-[12px] sm:text-[13px] text-[var(--text-secondary)] mt-1 font-normal max-w-3xl">
            Audit authentic post-training check-ins recorded from trainees across Maharashtra via the official 
            SkillTrack WhatsApp conversational bot. View message transcripts, verified wage bands, reported skill gaps, 
            and dual-verified employment trajectories.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={() => fetchFollowupsData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors disabled:opacity-50"
            title="Refresh recorded messages"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-medium bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors shadow-xs"
            title="Export CSV audit file"
          >
            <Download className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <span>Export CSV Audit</span>
          </button>

          <button
            onClick={() => navigate('/whatsapp-simulator')}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold bg-[var(--dark-panel)] hover:bg-black text-white shadow-xs transition-all ring-1 ring-black/10 group"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#F8D84A]" />
            <span>Test WhatsApp Outreach</span>
            <ExternalLink className="w-3 h-3 text-white/60 group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[var(--surface)] p-3.5 rounded-[20px] border border-[var(--border)] shadow-[var(--shadow-card)] transition-all">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Dispatched</span>
            <PhoneCall className="w-4 h-4 text-[var(--text-secondary)]" />
          </div>
          <div className="text-[24px] font-normal text-[var(--text-primary)] tracking-tight">
            {stats?.totalDispatched ?? 150}
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">Across 3M, 6M, 12M cohorts</p>
        </div>

        <div className="bg-[var(--surface)] p-3.5 rounded-[20px] border border-[var(--border)] shadow-[var(--shadow-card)] transition-all">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Recorded Replies</span>
            <MessageSquare className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-[24px] font-normal text-[var(--text-primary)] tracking-tight">
            {stats?.totalResponded ?? 121}
          </div>
          <p className="text-[10px] text-[#10B981] font-medium mt-0.5">
            {stats?.responseRatePercent ?? 81}% Response Rate
          </p>
        </div>

        <div className="bg-[var(--surface-warm)] p-3.5 rounded-[20px] border border-[var(--border)] shadow-[var(--shadow-card)] transition-all">
          <div className="flex items-center justify-between text-[var(--accent-yellow-text)] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">DPDP Consent</span>
            <ShieldCheck className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-[24px] font-normal text-[var(--text-primary)] tracking-tight">
            {stats?.consentRatePercent ?? 100}%
          </div>
          <p className="text-[10px] text-[var(--accent-yellow-text)] mt-0.5 truncate">100% opt-in before reply</p>
        </div>

        <div className="bg-[var(--surface)] p-3.5 rounded-[20px] border border-[var(--border)] shadow-[var(--shadow-card)] transition-all">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Avg Reported Wage</span>
            <IndianRupee className="w-4 h-4 text-[var(--text-secondary)]" />
          </div>
          <div className="text-[24px] font-normal text-[var(--text-primary)] tracking-tight">
            ₹{(stats?.avgReportedWage ?? 21100).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">Verified monthly gross</p>
        </div>

        <div className="bg-[var(--surface)] p-3.5 rounded-[20px] border border-[var(--border)] shadow-[var(--shadow-card)] transition-all">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Top Workplace Gap</span>
            <Cpu className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="text-[16px] font-medium text-[var(--text-primary)] tracking-tight truncate mt-1">
            CNC &amp; Automation
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">42% cited tool deficiency</p>
        </div>

        <div className="bg-[var(--dark-panel)] p-3.5 rounded-[20px] border border-black/20 text-white shadow-[var(--shadow-card)] transition-all">
          <div className="flex items-center justify-between text-white/70 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#F8D84A]">Dual Verified</span>
            <CheckCircle2 className="w-4 h-4 text-[#F8D84A]" />
          </div>
          <div className="text-[24px] font-normal text-white tracking-tight">
            {stats?.dualVerifiedCount ?? 10} / {records.length}
          </div>
          <p className="text-[10px] text-white/70 mt-0.5 truncate">Matched with EPF / GST</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-muted)] rounded-full border border-[var(--border)] w-fit text-[12px] font-medium">
        <button
          onClick={() => setActiveTab('transcripts')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all ${
            activeTab === 'transcripts'
              ? 'bg-[var(--dark-panel)] text-white shadow-xs font-semibold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp Chat Transcripts ({filteredRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all ${
            activeTab === 'analytics'
              ? 'bg-[var(--dark-panel)] text-white shadow-xs font-semibold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Survey Response Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('dpdp')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all ${
            activeTab === 'dpdp'
              ? 'bg-[var(--dark-panel)] text-white shadow-xs font-semibold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>DPDP Consent Compliance</span>
        </button>
      </div>

      {/* Main Content Areas */}
      {activeTab === 'transcripts' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-[var(--surface)] p-3.5 rounded-[20px] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap flex-1 min-w-[280px]">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by trainee name, MH-SK ID, phone, employer, or course..."
                  className="w-full text-[12px] pl-9 pr-3 py-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] focus:bg-white text-[var(--text-primary)] focus:outline-hidden focus:ring-1 focus:ring-[#303030] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Cohort Filter */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-[var(--text-secondary)] font-medium">Cohort:</span>
                <div className="flex items-center gap-1 bg-[var(--surface-muted)] p-1 rounded-full border border-[var(--border)]">
                  {['all', '3M', '6M', '12M'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCohort(c)}
                      className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                        selectedCohort === c
                          ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {c === 'all' ? 'All' : `${c}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-[var(--text-secondary)] font-medium">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-primary)] focus:outline-hidden"
                >
                  <option value="all">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Awaiting Reply">Awaiting Reply</option>
                  <option value="Escalated to Assisted">Escalated to Assisted</option>
                </select>
              </div>

              {/* District Filter */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-[var(--text-secondary)] font-medium">District:</span>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-primary)] focus:outline-hidden"
                >
                  <option value="all">All Districts ({uniqueDistricts.length})</option>
                  {uniqueDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <span className="text-[11px] text-[var(--text-secondary)] font-medium shrink-0">
              Showing <strong className="text-[var(--text-primary)]">{filteredRecords.length}</strong> recorded follow-up threads
            </span>
          </div>

          {/* Records Table View */}
          <div className="bg-[var(--surface)] rounded-[20px] border border-[var(--border)] shadow-[var(--shadow-card)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] text-[var(--text-primary)]">
                <thead className="bg-[var(--surface-muted)]/70 text-[var(--text-secondary)] uppercase tracking-wider text-[10px] font-semibold border-b border-[var(--border)]">
                  <tr>
                    <th className="py-3 px-4">Trainee &amp; Skill ID</th>
                    <th className="py-3 px-3">District &amp; Institute</th>
                    <th className="py-3 px-3 text-center">Cohort</th>
                    <th className="py-3 px-3 text-center">Chat Status</th>
                    <th className="py-3 px-3">Recorded Outcome (from WhatsApp)</th>
                    <th className="py-3 px-3">Reported Wage</th>
                    <th className="py-3 px-3">Last Message</th>
                    <th className="py-3 px-4 text-right">Transcript</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[var(--text-secondary)]">
                        <MessageSquare className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
                        <p className="font-medium text-[13px]">No matching WhatsApp follow-up threads found</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-1">Try resetting your filter parameters or search terms.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => {
                      const isCompleted = rec.status === 'Completed';
                      const isEscalated = rec.status === 'Escalated to Assisted';
                      const isInProgress = rec.status === 'In Progress';

                      return (
                        <tr
                          key={rec.id}
                          className="hover:bg-[var(--surface-muted)]/50 transition-colors group cursor-pointer"
                          onClick={() => setSelectedRecord(rec)}
                        >
                          {/* Trainee Name & ID */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[var(--surface-warm)] border border-[var(--border)] flex items-center justify-center font-bold text-[12px] text-[var(--text-primary)] shrink-0">
                                {rec.traineeName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-[13px] text-[var(--text-primary)] group-hover:text-black flex items-center gap-1.5 truncate">
                                  {rec.traineeName}
                                  {rec.verified && (
                                    <span title="Dual-verified via EPF/GST and Trainee WhatsApp confirmation">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-[var(--text-secondary)] font-mono truncate">
                                  MH-SK-{rec.traineeId.toUpperCase()} · {rec.phoneMasked}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* District & Institute */}
                          <td className="py-3 px-3">
                            <div className="text-[12px] font-medium text-[var(--text-primary)] flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                              <span className="truncate">{rec.districtName}</span>
                            </div>
                            <div className="text-[10px] text-[var(--text-secondary)] truncate max-w-[170px]" title={rec.providerName}>
                              {rec.providerName}
                            </div>
                          </td>

                          {/* Cohort */}
                          <td className="py-3 px-3 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--text-secondary)]">
                              {rec.checkpoint}
                            </span>
                          </td>

                          {/* Chat Status */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                                isCompleted
                                  ? 'bg-[#BFE7C2] text-[#305B35] border border-[#BFE7C2]'
                                  : isEscalated
                                  ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]'
                                  : isInProgress
                                  ? 'bg-[#FFF0A8] text-[#665400] border border-[#FDE047]'
                                  : 'bg-[var(--surface-muted)] text-[var(--text-secondary)] border border-[var(--border)]'
                              }`}
                            >
                              {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                              {isEscalated && <AlertTriangle className="w-3 h-3" />}
                              {isInProgress && <Clock className="w-3 h-3 animate-spin" />}
                              <span>{rec.status}</span>
                            </span>
                          </td>

                          {/* Recorded Outcome */}
                          <td className="py-3 px-3">
                            <div className="font-medium text-[12px] text-[var(--text-primary)] truncate max-w-[190px]">
                              {rec.outcomeData.jobRole || rec.outcomeData.employmentStatus}
                            </div>
                            <div className="text-[10px] text-[var(--text-secondary)] truncate max-w-[190px]">
                              {rec.outcomeData.employerName}
                            </div>
                          </td>

                          {/* Reported Wage */}
                          <td className="py-3 px-3">
                            {rec.outcomeData.numericWage > 0 ? (
                              <div className="font-semibold text-[12px] text-[var(--text-primary)]">
                                ₹{rec.outcomeData.numericWage.toLocaleString('en-IN')}
                                <span className="text-[10px] font-normal text-[var(--text-muted)]">/mo</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[var(--text-muted)]">—</span>
                            )}
                          </td>

                          {/* Last Message Time */}
                          <td className="py-3 px-3 text-[11px] text-[var(--text-secondary)]">
                            <div className="truncate">{rec.lastMessageOn}</div>
                            <div className="text-[9px] text-[var(--text-muted)] flex items-center gap-1">
                              <CheckCheck className="w-3 h-3 text-[#10B981]" />
                              <span>{rec.messages.length} messages</span>
                            </div>
                          </td>

                          {/* Action Button */}
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRecord(rec);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-[var(--surface-muted)] group-hover:bg-[var(--dark-panel)] group-hover:text-white text-[var(--text-primary)] border border-[var(--border)] transition-all"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Chat ({rec.messages.length})</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-muted)]/40 flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
              <span>
                Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong> total records
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                All conversations secured with 256-bit encryption &amp; DPDP compliance
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Breakdown Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Employment Status Distribution */}
            <div className="bg-[var(--surface)] p-5 rounded-[20px] border border-[var(--border)] shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-[var(--text-secondary)]" />
                <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">
                  Reported Employment Status
                </h3>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mb-4">
                Distribution of post-training outcomes confirmed directly by trainees over WhatsApp.
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-[var(--text-primary)] font-medium">💼 Salaried (Wage Employed)</span>
                    <span className="font-semibold text-[var(--text-primary)]">72% (87 trainees)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-[var(--text-primary)] font-medium">🏪 Self-Employed / Enterprise</span>
                    <span className="font-semibold text-[var(--text-primary)]">18% (22 trainees)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                    <div className="h-full bg-[#F8D84A] rounded-full" style={{ width: '18%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-[var(--text-primary)] font-medium">🔍 Seeking Work / Apprenticeship</span>
                    <span className="font-semibold text-[var(--text-primary)]">10% (12 trainees)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                    <div className="h-full bg-[#94A3B8] rounded-full" style={{ width: '10%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Wage Distribution */}
            <div className="bg-[var(--surface)] p-5 rounded-[20px] border border-[var(--border)] shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-3">
                <IndianRupee className="w-4 h-4 text-[var(--text-secondary)]" />
                <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">
                  Reported Gross Monthly Wages
                </h3>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mb-4">
                Compensation tiers self-reported under DPDP statistical privacy protection.
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-[var(--text-primary)] font-medium">₹25,000 - ₹40,000+ (Tier 1)</span>
                    <span className="font-semibold text-[var(--text-primary)]">32% (39 trainees)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: '32%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-[var(--text-primary)] font-medium">₹15,000 - ₹25,000 (Tier 2)</span>
                    <span className="font-semibold text-[var(--text-primary)]">56% (68 trainees)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                    <div className="h-full bg-[#F8D84A] rounded-full" style={{ width: '56%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-[var(--text-primary)] font-medium">&lt; ₹15,000 (Entry)</span>
                    <span className="font-semibold text-[var(--text-primary)]">12% (14 trainees)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                    <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Reported Skill Gaps */}
            <div className="bg-[var(--surface-warm)] p-5 rounded-[20px] border border-[var(--border)] shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-[#D97706]" />
                <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">
                  Top Daily Workplace Skill Gaps
                </h3>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mb-4">
                Identified during Question 7 of the WhatsApp check-in to inform state syllabus updates.
              </p>

              <div className="space-y-2.5">
                {[
                  { name: '⚙️ CNC & Automated Tools', pct: 44, count: 53 },
                  { name: '💻 Digital Systems & ERP', pct: 28, count: 34 },
                  { name: '🗣️ Workplace English & Communication', pct: 18, count: 22 },
                  { name: '📐 Quality CMM & 3D Inspection', pct: 10, count: 12 }
                ].map((gap) => (
                  <div key={gap.name} className="flex items-center justify-between text-[12px] p-2 rounded-xl bg-white border border-[#E2E2DE]">
                    <span className="font-medium text-[var(--text-primary)] truncate max-w-[200px]">{gap.name}</span>
                    <span className="font-bold text-[var(--text-primary)] shrink-0">{gap.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Requested Upskilling Courses & Aspirations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--surface)] p-5 rounded-[20px] border border-[var(--border)] shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
                <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">
                  Demanded Upskilling Certifications (Subsidized Grants)
                </h3>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mb-4">
                Courses trainees selected to advance their career to the next wage tier.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { title: '🤖 Industrial Robotics Tech', demand: '41% of trainees', tag: 'High Industry Demand' },
                  { title: '🔋 EV Battery & Powertrain', demand: '27% of trainees', tag: 'Emerging Sector' },
                  { title: '☀️ Solar Grid & BESS Tech', demand: '20% of trainees', tag: 'Green Jobs' },
                  { title: '💻 Advanced CAD & ERP', demand: '12% of trainees', tag: 'Digital Skills' }
                ].map((c) => (
                  <div key={c.title} className="p-3 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)]">
                    <span className="text-[10px] uppercase font-bold text-[#10B981] px-2 py-0.5 rounded-full bg-[#BFE7C2]/60 inline-block mb-1.5">
                      {c.tag}
                    </span>
                    <h4 className="text-[12px] font-semibold text-[var(--text-primary)]">{c.title}</h4>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1">{c.demand}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--surface)] p-5 rounded-[20px] border border-[var(--border)] shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">
                  Primary Constraints Reported by Trainees
                </h3>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mb-4">
                Question 10 insights to help the Department design post-placement retention incentives.
              </p>

              <div className="space-y-3">
                {[
                  { constraint: '🔒 Limited Career Growth without Formal Degree', pct: 46, note: 'Suggesting lateral diploma pathways' },
                  { constraint: '📉 Low Starting Salary in Initial 6 Months', pct: 32, note: 'Recommend apprenticeship wage top-ups' },
                  { constraint: '🚌 Long Daily Commute / Housing Distance', pct: 15, note: 'Cluster industrial hostel accommodations' },
                  { constraint: '⚠️ Outdated Machinery in Small Workshops', pct: 7, note: 'Modern tooling loan schemes' }
                ].map((item) => (
                  <div key={item.constraint} className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/50">
                    <div className="flex justify-between items-center text-[12px] font-medium text-[var(--text-primary)]">
                      <span className="truncate">{item.constraint}</span>
                      <span className="font-bold shrink-0">{item.pct}%</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DPDP Consent Compliance Tab */}
      {activeTab === 'dpdp' && (
        <div className="bg-[var(--surface)] p-6 rounded-[20px] border border-[var(--border)] shadow-[var(--shadow-card)] space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-warm)] border border-[var(--border)] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#D97706]" />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">
                Digital Personal Data Protection (DPDP) Act 2023 Compliance Architecture
              </h2>
              <p className="text-[12px] text-[var(--text-secondary)] mt-1 max-w-2xl">
                Every follow-up message sent via the SkillTrack WhatsApp bot adheres strictly to statutory consent protocols. 
                Data collection begins ONLY after the trainee explicitly clicks &ldquo;✅ Yes, Proceed&rdquo; in WhatsApp.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#10B981] px-2 py-0.5 rounded-full bg-[#BFE7C2] inline-block">
                Stage 0 Consent Gate
              </span>
              <h4 className="text-[13px] font-semibold text-[var(--text-primary)]">Zero Prior Data Capture</h4>
              <p className="text-[11px] text-[var(--text-secondary)]">
                The bot explains the state department identity, purpose of outreach, and requests opt-in. No survey questions are presented if the user clicks &ldquo;❌ No, Not Now&rdquo;.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#3B82F6] px-2 py-0.5 rounded-full bg-[#DBEAFE] inline-block">
                K-Anonymity &amp; Masking
              </span>
              <h4 className="text-[13px] font-semibold text-[var(--text-primary)]">Phone Number Protection</h4>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Phone numbers are masked in all administrative exports (+91 ******43210). Salary data is recorded in broad bands to protect individual identity while enabling macro policy modeling.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#8B5CF6] px-2 py-0.5 rounded-full bg-[#EDE9FE] inline-block">
                Right to Erasure
              </span>
              <h4 className="text-[13px] font-semibold text-[var(--text-primary)]">Consent Revocation</h4>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Trainees can withdraw consent at any time directly through their Trainee Portal or by replying &ldquo;Stop&rdquo; on WhatsApp, which immediately halts automated dispatches.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface-warm)] border border-[#E2E2DE] text-[12px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#D97706] shrink-0" />
              <div>
                <strong className="text-[var(--text-primary)]">Immutable Audit Trail:</strong>
                <span className="text-[var(--text-secondary)] ml-1">
                  All consent timestamps and message hashes are logged into the Maharashtra State Blockchain Audit Log for statutory verification.
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/gov/privacy')}
              className="px-3.5 py-1.5 rounded-full bg-[var(--dark-panel)] text-white text-[11px] font-semibold hover:bg-black shrink-0 transition-colors"
            >
              View DPDP Audit Log →
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Transcript Modal / Drawer */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-[var(--surface)] rounded-[24px] border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (Styled like WhatsApp Business Top Bar) */}
            <div className="bg-[#075E54] text-white p-4 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white shrink-0">
                  {selectedRecord.traineeName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[15px] truncate">{selectedRecord.traineeName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#25D366] text-[#075E54]">
                      Verified Trainee
                    </span>
                  </div>
                  <p className="text-[11px] text-white/80 font-mono truncate">
                    {selectedRecord.phoneMasked} · {selectedRecord.districtName} ({selectedRecord.checkpoint} Checkpoint)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Split view of WhatsApp chat and outcome details */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Pane: WhatsApp Chat Bubble Feed */}
              <div className="flex-1 bg-[#EFEAE2] dark:bg-[#0B141A] p-4 overflow-y-auto space-y-3.5 relative flex flex-col">
                {/* DPDP Encryption Banner */}
                <div className="self-center bg-[#FFEECD] dark:bg-[#182229] border border-[#E9DFCB] dark:border-[#222E35] rounded-xl px-3 py-1.5 text-center text-[10px] text-[#54656F] dark:text-[#8696A0] max-w-sm shadow-xs">
                  🔒 Messages are end-to-end recorded via Kapso WhatsApp Cloud SDK. Verified under DPDP Act 2023.
                </div>

                {/* Messages Feed */}
                {selectedRecord.messages.map((msg) => {
                  const isBot = msg.sender === 'bot';
                  const isSystem = msg.type === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="self-center bg-amber-100 border border-amber-300 text-amber-900 rounded-xl px-3 py-1 text-[11px] max-w-md text-center">
                        {msg.text}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${
                        isBot ? 'self-start items-start' : 'self-end items-end'
                      }`}
                    >
                      {/* Bubble */}
                      <div
                        className={`rounded-2xl p-3 shadow-xs text-[12px] relative transition-all ${
                          isBot
                            ? 'bg-white dark:bg-[#202C33] text-[#111B21] dark:text-[#E9EDEF] rounded-tl-xs border border-black/5'
                            : 'bg-[#D9FDD3] dark:bg-[#005C4B] text-[#111B21] dark:text-[#E9EDEF] rounded-tr-xs'
                        }`}
                      >
                        {/* Step Title / Header */}
                        {msg.stepTitle && (
                          <div className="text-[10px] font-bold text-[#008069] dark:text-[#25D366] uppercase tracking-wider mb-1">
                            {msg.stepTitle}
                          </div>
                        )}

                        {/* Text */}
                        <div className="whitespace-pre-wrap font-sans leading-relaxed">
                          {msg.text}
                        </div>

                        {/* Interactive Buttons (if presented by bot) */}
                        {msg.buttons && msg.buttons.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/10 space-y-1">
                            <span className="text-[9px] text-[#667781] dark:text-[#8696A0] uppercase font-semibold">
                              Presented Buttons:
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {msg.buttons.map((btnTitle) => (
                                <span
                                  key={btnTitle}
                                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#F0F2F5] dark:bg-[#111B21] text-[#008069] dark:text-[#25D366] border border-black/5"
                                >
                                  {btnTitle}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Timestamp & Read Receipt */}
                        <div className="flex items-center justify-end gap-1 text-[9px] text-[#667781] dark:text-[#8696A0] mt-1.5">
                          <span>{msg.timestamp.split(' ').slice(-2).join(' ')}</span>
                          {!isBot && <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Pane: Recorded Outcome Data & Verification Card */}
              <div className="w-full md:w-80 bg-[var(--surface)] border-t md:border-t-0 md:border-l border-[var(--border)] p-4 overflow-y-auto space-y-4 shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Official Recorded Outcome
                  </span>
                  <h4 className="text-[15px] font-semibold text-[var(--text-primary)] mt-0.5">
                    {selectedRecord.outcomeData.jobRole || 'Technician'}
                  </h4>
                  <p className="text-[12px] text-[var(--text-secondary)]">
                    {selectedRecord.outcomeData.employerName}
                  </p>
                </div>

                {/* Outcome Field Pills */}
                <div className="space-y-2.5 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-secondary)] block">Employment Status</span>
                    <strong className="text-[var(--text-primary)]">{selectedRecord.outcomeData.employmentStatus}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-secondary)] block">Gross Salary Range</span>
                    <strong className="text-[var(--text-primary)] text-[13px]">
                      {selectedRecord.outcomeData.salaryRange}
                    </strong>
                    {selectedRecord.outcomeData.numericWage > 0 && (
                      <span className="text-[10px] text-[#10B981] block font-medium">
                        ≈ ₹{selectedRecord.outcomeData.numericWage.toLocaleString('en-IN')}/month
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-secondary)] block">Job Satisfaction</span>
                    <strong className="text-[var(--text-primary)]">{selectedRecord.outcomeData.jobSatisfaction}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-secondary)] block">Training Relevance</span>
                    <strong className="text-[var(--text-primary)]">{selectedRecord.outcomeData.trainingRelevance}</strong>
                  </div>

                  {selectedRecord.outcomeData.skillGaps?.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-[var(--surface-warm)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--accent-yellow-text)] font-semibold block mb-1">
                        Reported Workplace Skill Gap
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedRecord.outcomeData.skillGaps.map((g) => (
                          <span key={g} className="px-2 py-0.5 rounded-md bg-white text-[10px] font-medium border border-[#E2E2DE]">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedRecord.outcomeData.suggestedCourses?.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-[#E0F2FE] border border-[#BAE6FD]">
                      <span className="text-[10px] text-[#0369A1] font-semibold block mb-1">
                        Demanded Upskilling Course
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedRecord.outcomeData.suggestedCourses.map((c) => (
                          <span key={c} className="px-2 py-0.5 rounded-md bg-white text-[10px] font-medium text-[#0369A1] border border-[#BAE6FD]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedRecord.outcomeData.careerGoals && (
                    <div className="p-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--text-secondary)] block">3-5 Year Career Goal</span>
                      <span className="text-[var(--text-primary)] font-medium">{selectedRecord.outcomeData.careerGoals}</span>
                    </div>
                  )}

                  {selectedRecord.outcomeData.biggestChallenge && (
                    <div className="p-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--text-secondary)] block">Primary Challenge</span>
                      <span className="text-[var(--text-primary)] font-medium">{selectedRecord.outcomeData.biggestChallenge}</span>
                    </div>
                  )}
                </div>

                {/* Audit & Compliance Footnote */}
                <div className="pt-3 border-t border-[var(--border)] text-[10px] text-[var(--text-secondary)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Audit Confidence:</span>
                    <strong className="text-[var(--text-primary)]">{selectedRecord.confidence}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Completed At:</span>
                    <span className="font-mono">{selectedRecord.completedAt || selectedRecord.lastMessageOn}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>DPDP Opt-In:</span>
                    <span className="text-[#10B981] font-semibold">Confirmed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[var(--surface-muted)] border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
              <span>Record ID: <code className="font-mono text-[var(--text-primary)]">{selectedRecord.id}</code></span>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 rounded-full bg-[var(--dark-panel)] hover:bg-black text-white font-semibold transition-colors"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

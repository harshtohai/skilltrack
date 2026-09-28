import React, { useState } from 'react';
import { AskDataBox } from '../components/AskDataBox.tsx';
import {
  Sparkles,
  Brain,
  Bot,
  Send,
  ArrowRight,
  Languages,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
  MapPin,
  TrendingUp,
  RefreshCw,
  ShieldCheck,
  Tag,
  Sliders,
  DollarSign,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const AiAnalysis: React.FC = () => {
  const { language } = useAuth();
  const [activeTab, setActiveTab] = useState<'ask' | 'classifier' | 'interventions' | 'translator'>('ask');

  // Policy Recommendations State
  const [recommendations, setRecommendations] = useState<any | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // District Intervention State
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Gadchiroli');
  const [districtIntervention, setDistrictIntervention] = useState<any | null>(null);
  const [loadingDistrict, setLoadingDistrict] = useState(false);

  // Classification State
  const sampleTraineeQuotes = [
    'पगार खूप कमी होता आणि कामाचे ठिकाण घरापासून ५० किमी लांब होते, म्हणून मी नोकरी सोडली.',
    'I completed Data Entry Operator but company required Advanced Excel VLOOKUP and English typing which was not in ITI.',
    'कंपनीमध्ये CNC मशीन चालवायला शिकवले नाही, फक्त थिअरी झाली. मुलाखतीत मशीन टेस्ट मध्ये नापास झालो.',
    'घरचे लग्नासाठी दबाव टाकत आहेत आणि शहरात एकट्या मुलीला राहण्यासाठी सुरक्षित वसतिगृह नाही.'
  ];
  const [inputText, setInputText] = useState(sampleTraineeQuotes[0]);
  const [classifying, setClassifying] = useState(false);
  const [classResult, setClassResult] = useState<any | null>(null);

  // Translation State
  const [transSource, setTransSource] = useState(
    'Please verify if you completed 6 months of employment at your current firm to receive the post-placement incentive.'
  );
  const [transLang, setTransLang] = useState<'mr' | 'en'>('mr');
  const [translating, setTranslating] = useState(false);
  const [transResult, setTransResult] = useState('');

  // Live Telemetry Sync with Dashboard
  const [summaryMetrics, setSummaryMetrics] = useState<any>(null);

  React.useEffect(() => {
    fetch('/api/analytics/summary')
      .then((r) => r.json())
      .then((data) => setSummaryMetrics(data))
      .catch(() => null);
  }, []);

  const fetchPolicyRecs = async () => {
    setLoadingRecs(true);
    try {
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentDistricts: ['Gadchiroli', 'Nandurbar', 'Palghar'] })
      });
      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleDistrictIntervention = async (district: string) => {
    setSelectedDistrict(district);
    setLoadingDistrict(true);
    try {
      const res = await fetch('/api/ai/district-interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district })
      });
      const data = await res.json();
      setDistrictIntervention(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDistrict(false);
    }
  };

  const handleClassify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    setClassifying(true);
    try {
      const res = await fetch('/api/ai/classify-barrier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });
      const data = await res.json();
      setClassResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setClassifying(false);
    }
  };

  const handleTranslate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!transSource.trim()) return;
    setTranslating(true);
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transSource, targetLanguage: transLang })
      });
      const data = await res.json();
      setTransResult(data.translatedText || data.translated || '');
    } catch (err) {
      console.error(err);
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="space-y-6 text-[#E6E9F0]">
      {/* Header */}
      <div className="bg-[#171B24] border border-[#2B3140] rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7C83E6]/15 border border-[#7C83E6]/30 text-[#7C83E6] flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-semibold text-white">
                {language === 'mr' ? 'AI धोरण सल्लागार केंद्र' : 'AI Policy Advisor Hub'}
              </h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#E8853A]/20 text-[#E8853A] border border-[#E8853A]/30">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-[#8F97A8]">
              {language === 'mr'
                ? 'महाराष्ट्र शासनासाठी नैसर्गिक भाषा संवाद, कौशल्य तूट विश्लेषण व धोरणात्मक उपाययोजना'
                : 'Executive policy intelligence, natural language query, and multilingual trainee feedback NLP'}
            </p>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 bg-[#1F2430] p-1 rounded-lg border border-[#2B3140] overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('ask')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'ask'
                ? 'bg-[#E8853A] text-[#1B1F2A] font-semibold shadow-xs'
                : 'text-[#8F97A8] hover:text-white'
            }`}
          >
            {language === 'mr' ? '१. माहिती संवाद' : '1. Ask the Data'}
          </button>
          <button
            onClick={() => setActiveTab('classifier')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'classifier'
                ? 'bg-[#E8853A] text-[#1B1F2A] font-semibold shadow-xs'
                : 'text-[#8F97A8] hover:text-white'
            }`}
          >
            {language === 'mr' ? '२. अडथळा वर्गीकरण' : '2. Trainee NLP Classifier'}
          </button>
          <button
            onClick={() => {
              setActiveTab('interventions');
              if (!districtIntervention) handleDistrictIntervention(selectedDistrict);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'interventions'
                ? 'bg-[#E8853A] text-[#1B1F2A] font-semibold shadow-xs'
                : 'text-[#8F97A8] hover:text-white'
            }`}
          >
            {language === 'mr' ? '३. जिल्हा पॅकेज' : '3. District Interventions'}
          </button>
          <button
            onClick={() => setActiveTab('translator')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'translator'
                ? 'bg-[#E8853A] text-[#1B1F2A] font-semibold shadow-xs'
                : 'text-[#8F97A8] hover:text-white'
            }`}
          >
            {language === 'mr' ? '४. द्वैभाषिक अनुवाद' : '4. Circular Translator'}
          </button>
        </div>
      </div>

      {/* Live Grounding Telemetry Strip */}
      <div className="bg-[#171B24] border border-[#2B3140] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="font-semibold text-white">Live State Telemetry Grounding:</span>
          <span className="text-[#8F97A8]">AI queries are synchronized directly with live cohort telemetry</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
          <span className="text-white">
            Trainees: <strong className="text-[#E8853A] font-semibold">{summaryMetrics?.totalCertifiedConsented?.toLocaleString('en-IN') || '1,591'}</strong>
          </span>
          <span className="text-white">
            Placement: <strong className="text-[#22C55E] font-semibold">{summaryMetrics?.placementRate || '41'}%</strong>
          </span>
          <span className="text-white">
            6M Retention: <strong className="text-[#F8D84A] font-semibold">{summaryMetrics?.retention6m || '59'}%</strong>
          </span>
          <span className="text-white">
            Avg Wage: <strong className="text-[#7C83E6] font-semibold">₹{(summaryMetrics?.avgWage || 17015).toLocaleString('en-IN')}</strong>
          </span>
          <span className="text-white">
            Completeness: <strong className="text-[#22C55E] font-semibold">{summaryMetrics?.dataCompleteness || '77'}%</strong>
          </span>
        </div>
      </div>

      {/* Tab 1: Ask the Skilling Data */}
      {activeTab === 'ask' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <AskDataBox />

          {/* Quick Query Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#171B24] border border-[#2B3140] rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#7C83E6]">
                <MapPin className="w-4 h-4" />
                <span>Tribal vs Industrial Gap</span>
              </div>
              <p className="text-xs text-[#8F97A8] leading-relaxed">
                Why does Gadchiroli exhibit 32% placement while Sambhajinagar (53%) and Pune (47%) lead?
              </p>
              <div className="pt-2 border-t border-[#2B3140] text-[11px] text-[#22C55E]">
                Gemini grounds answer in {summaryMetrics?.totalCertifiedConsented?.toLocaleString('en-IN') || '1,591'} cohort records
              </div>
            </div>

            <div className="bg-[#171B24] border border-[#2B3140] rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#E8853A]">
                <TrendingUp className="w-4 h-4" />
                <span>12-Month Retention Plateau</span>
              </div>
              <p className="text-xs text-[#8F97A8] leading-relaxed">
                What is the economic return for youth who stay in their job past Month 6?
              </p>
              <div className="pt-2 border-t border-[#2B3140] text-[11px] text-[#22C55E]">
                Cites ₹{(summaryMetrics?.avgWage || 17015).toLocaleString('en-IN')}/mo avg wage &amp; 36% 12M rate
              </div>
            </div>

            <div className="bg-[#171B24] border border-[#2B3140] rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#E55A5A]">
                <AlertTriangle className="w-4 h-4" />
                <span>ITI Grade C Alerts</span>
              </div>
              <p className="text-xs text-[#8F97A8] leading-relaxed">
                Which training institutes exhibit 6-month retention under 45%?
              </p>
              <div className="pt-2 border-t border-[#2B3140] text-[11px] text-[#22C55E]">
                Highlights Solapur and Nanded providers
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Trainee Feedback & Root Cause Classifier */}
      {activeTab === 'classifier' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          {/* Input Panel */}
          <div className="bg-[#171B24] border border-[#2B3140] rounded-xl p-5 space-y-4">
            <div className="border-b border-[#2B3140] pb-3">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#7C83E6]" />
                Trainee Survey Voice &amp; Reason Classifier
              </h3>
              <p className="text-[11px] text-[#8F97A8] mt-0.5">
                Gemini analyzes unstructured Marathi / Hindi / English responses and extracts root causes and missing vocational skills.
              </p>
            </div>

            {/* Quick Sample Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-[#8F97A8] font-medium">Select a realistic survey sample:</span>
              <div className="space-y-1">
                {sampleTraineeQuotes.map((quote, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(quote);
                      setClassResult(null);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors border ${
                      inputText === quote
                        ? 'bg-[#1F2430] text-white border-[#7C83E6]'
                        : 'bg-[#0F1218]/40 text-[#8F97A8] hover:text-[#E6E9F0] border-[#2B3140]'
                    }`}
                  >
                    <span className="line-clamp-1">"{quote}"</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleClassify} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#8F97A8] mb-1">
                  Or enter custom text (मराठी किंवा इंग्रजी):
                </label>
                <textarea
                  rows={3}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="उदा. पगार खूप कमी होता किंवा इंग्रजी संभाषण जमत नव्हते..."
                  className="w-full text-xs p-3 rounded-lg border border-[#2B3140] bg-[#1F2430] text-[#E6E9F0] focus:ring-2 focus:ring-[#E8853A] focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={classifying || !inputText.trim()}
                className="w-full py-2.5 bg-[#E8853A] hover:bg-[#D4762F] text-[#1B1F2A] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {classifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Classify Trainee Response</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Panel */}
          <div className="bg-[#171B24] border border-[#2B3140] rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div>
              <div className="border-b border-[#2B3140] pb-3 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  NLP Output &amp; Policy Routing
                </h3>
                {classResult && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                    Confidence: {Math.round(classResult.confidence * 100)}%
                  </span>
                )}
              </div>

              {classResult ? (
                <div className="mt-4 space-y-4 animate-in fade-in">
                  <div className="p-3.5 rounded-lg bg-[#1F2430] border border-[#2B3140] space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8F97A8]">
                      Standard Taxonomy Category
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#E8853A]">
                        {classResult.category}
                      </span>
                      <span className="text-[11px] text-[#8F97A8]">
                        Language: <strong>{classResult.detectedLanguage || 'Marathi'}</strong>
                      </span>
                    </div>
                  </div>

                  {classResult.skillTags && classResult.skillTags.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-[#8F97A8] font-medium flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-[#7C83E6]" />
                        Missing Vocational Skill Tags:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {classResult.skillTags.map((tag: string, tIdx: number) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-1 rounded-md text-xs bg-[#7C83E6]/15 text-[#7C83E6] border border-[#7C83E6]/30 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 rounded-lg bg-[#1F2430] border border-[#7C83E6]/40 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C83E6]">
                      Automated State Policy Recommendation
                    </span>
                    <p className="text-xs text-[#E6E9F0] leading-relaxed">
                      {classResult.policyAction}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-[#8F97A8] space-y-2">
                  <Bot className="w-8 h-8 mx-auto opacity-40 text-[#7C83E6]" />
                  <p className="text-xs">Click "Classify Trainee Response" to run the live NLP engine.</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#2B3140] flex items-center justify-between text-[11px] text-[#8F97A8]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                Zero personally identifiable information stored
              </span>
              <span>DPDP Act 2023</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: District Interventions Optimizer */}
      {activeTab === 'interventions' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-[#171B24] border border-[#2B3140] rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B3140] pb-3">
              <div>
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#E8853A]" />
                  Cabinet District Intervention Synthesizer
                </h3>
                <p className="text-[11px] text-[#8F97A8]">
                  Select any district to generate tailored remedial budgets, mobile ITI allocations, and placement targets.
                </p>
              </div>

              {/* District Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                {['Gadchiroli', 'Nandurbar', 'Solapur', 'Pune', 'Nanded'].map((dist) => (
                  <button
                    key={dist}
                    onClick={() => handleDistrictIntervention(dist)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedDistrict === dist
                        ? 'bg-[#E8853A] text-[#1B1F2A] font-semibold'
                        : 'bg-[#1F2430] text-[#8F97A8] hover:text-white border border-[#2B3140]'
                    }`}
                  >
                    {dist}
                  </button>
                ))}
              </div>
            </div>

            {loadingDistrict ? (
              <div className="py-12 flex items-center justify-center gap-2 text-xs text-[#8F97A8]">
                <RefreshCw className="w-4 h-4 animate-spin text-[#E8853A]" />
                <span>Synthesizing cabinet intervention package for {selectedDistrict}...</span>
              </div>
            ) : districtIntervention ? (
              <div className="space-y-4 pt-2">
                {/* Headline Metrics for District */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#1F2430] border border-[#2B3140] rounded-lg p-3">
                    <span className="text-[10px] text-[#8F97A8] block">District Profile</span>
                    <span className="text-xs font-semibold text-white">
                      {districtIntervention.district} ({districtIntervention.isTribal ? 'Tribal / Aspirational' : 'Industrial Hub'})
                    </span>
                  </div>
                  <div className="bg-[#1F2430] border border-[#2B3140] rounded-lg p-3">
                    <span className="text-[10px] text-[#8F97A8] block">Placement Rate</span>
                    <span
                      className={`text-xs font-semibold ${
                        districtIntervention.placementRate >= 60 ? 'text-[#22C55E]' : 'text-[#E55A5A]'
                      }`}
                    >
                      {districtIntervention.placementRate}% Verified
                    </span>
                  </div>
                  <div className="bg-[#1F2430] border border-[#2B3140] rounded-lg p-3">
                    <span className="text-[10px] text-[#8F97A8] block">Estimated State Outlay</span>
                    <span className="text-xs font-semibold text-[#E8853A]">
                      {districtIntervention.recommendedPackage?.budgetEstimatedINR || '₹3.8 Crore'}
                    </span>
                  </div>
                  <div className="bg-[#1F2430] border border-[#2B3140] rounded-lg p-3">
                    <span className="text-[10px] text-[#8F97A8] block">Target Cohort</span>
                    <span className="text-xs font-semibold text-white">
                      {districtIntervention.recommendedPackage?.targetTrainees?.toLocaleString() || '1,800'} Youth
                    </span>
                  </div>
                </div>

                {/* Challenge & Package Card */}
                <div className="p-4 rounded-xl bg-[#1F2430] border border-[#7C83E6]/40 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C83E6]">
                      Proposed Package: {districtIntervention.recommendedPackage?.name}
                    </span>
                    <p className="text-xs text-[#8F97A8] mt-1">
                      <strong>Core Systemic Bottleneck:</strong> {districtIntervention.coreChallenge}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#2B3140]">
                    <span className="text-[11px] font-semibold text-white block">
                      Cabinet Action Directives:
                    </span>
                    <div className="space-y-2">
                      {districtIntervention.recommendedPackage?.steps?.map((step: string, sIdx: number) => (
                        <div
                          key={sIdx}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#171B24] border border-[#2B3140] text-xs text-[#E6E9F0]"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#E8853A] text-[#1B1F2A] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Tab 4: Circular & Notification Translator */}
      {activeTab === 'translator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          <div className="bg-[#171B24] border border-[#2B3140] rounded-xl p-5 space-y-4">
            <div className="border-b border-[#2B3140] pb-3">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Languages className="w-4 h-4 text-[#7C83E6]" />
                Official Circular &amp; Follow-up Localization
              </h3>
              <p className="text-[11px] text-[#8F97A8] mt-0.5">
                Translates official government skilling directives and SMS follow-up templates into formal administrative Marathi.
              </p>
            </div>

            <form onSubmit={handleTranslate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#8F97A8] mb-1">
                  Source Text:
                </label>
                <textarea
                  rows={4}
                  value={transSource}
                  onChange={(e) => setTransSource(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-[#2B3140] bg-[#1F2430] text-[#E6E9F0] focus:ring-2 focus:ring-[#E8853A] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8F97A8]">Translate to:</span>
                  <select
                    value={transLang}
                    onChange={(e) => setTransLang(e.target.value as any)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-[#2B3140] bg-[#1F2430] text-white"
                  >
                    <option value="mr">Marathi (मराठी)</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={translating || !transSource.trim()}
                  className="px-4 py-2 bg-[#E8853A] hover:bg-[#D4762F] text-[#1B1F2A] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {translating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
                  <span>{translating ? 'Translating...' : 'Translate'}</span>
                </button>
              </div>
            </form>
          </div>

          <div className="bg-[#171B24] border border-[#2B3140] rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div>
              <div className="border-b border-[#2B3140] pb-3">
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  Localized Official Translation
                </h3>
              </div>

              {transResult ? (
                <div className="mt-4 p-4 rounded-xl bg-[#1F2430] border border-[#7C83E6]/40 text-xs text-[#E6E9F0] space-y-2 animate-in fade-in">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C83E6]">
                    {transLang === 'mr' ? 'मराठी भाषांतर' : 'English Translation'}
                  </span>
                  <p className="text-sm leading-relaxed font-sans">{transResult}</p>
                </div>
              ) : (
                <div className="py-16 text-center text-[#8F97A8]">
                  <Languages className="w-8 h-8 mx-auto opacity-40 text-[#7C83E6] mb-2" />
                  <p className="text-xs">Translation output will appear here.</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#2B3140] text-[11px] text-[#8F97A8]">
              Preserves official scheme terminology: SkillID, ITI, PMKVY, MSIS
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

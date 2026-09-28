import React, { useState } from 'react';
import { Sparkles, Send, Search, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const AskDataBox: React.FC<{ onChartSelect?: (hint: string) => void }> = ({ onChartSelect }) => {
  const { language } = useAuth();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    answer: string;
    chartHint?: string;
    keyStats?: Array<{ label: string; value: string }>;
    suggestedFollowUps?: string[];
  } | null>(null);

  const sampleQuestionsEn = [
    'Why is female placement lower in tribal districts?',
    'Which ITIs should be put on notice for low retention?',
    'What skills do employers demand that are missing in ITI courses?'
  ];

  const sampleQuestionsMr = [
    'आदिवासी जिल्ह्यांत महिलांचे प्लेसमेंट कमी का आहे?',
    'कमी टिकवणुकीमुळे कोणत्या संस्थांना नोटीस द्यावी?',
    'उद्योगांना आवश्यक पण अभ्यासक्रमात नसलेली कौशल्ये कोणती?'
  ];

  const sampleQuestions = language === 'mr' ? sampleQuestionsMr : sampleQuestionsEn;

  const handleAsk = async (qText?: string) => {
    const q = qText || question;
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        if (data.chartHint && onChartSelect) {
          onChartSelect(data.chartHint);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="ask-data-container"
      className="bg-white border border-[#E2E2DE] rounded-[20px] p-4 sm:p-5 shadow-[0_3px_14px_rgba(35,38,45,0.05)] text-[#303030] w-full min-w-0 overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-[#FFF9E9] border border-[#E2E2DE] text-[#303030] flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-[#303030]" />
        </div>
        <div>
          <h2 className="text-sm font-medium text-[#303030]">
            {language === 'mr' ? 'डेटाला नैसर्गिक भाषेत विचारा' : 'Ask Policy Data Assistant'}
          </h2>
          <p className="text-[10px] text-[#74767D]">
            {language === 'mr'
              ? 'जिल्हा, संस्था आणि वेतन ट्रेंडवर थेट विश्लेषण'
              : 'Grounded insights across 36 districts and 280+ ITIs'}
          </p>
        </div>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#74767D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-ask-data"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder={
              language === 'mr'
                ? 'उदा. नंदुरबार जिल्ह्याची ६ महिन्यांची टिकवणूक किती आहे?'
                : 'e.g. Which districts require immediate training intervention?'
            }
            className="w-full pl-9 pr-4 py-2.5 rounded-full bg-[#F1F1EE] border border-[#E2E2DE] text-xs text-[#303030] placeholder-[#9A9A9A] focus:outline-hidden focus:border-[#303030] transition-colors"
          />
        </div>
        <button
          id="btn-submit-ask-data"
          onClick={() => handleAsk()}
          disabled={loading || !question.trim()}
          className="px-4 py-2.5 rounded-full bg-[#303030] text-white hover:bg-[#202020] disabled:opacity-50 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
        >
          <span>{loading ? 'Synthesizing...' : 'Query'}</span>
          <Send className="w-3 h-3" />
        </button>
      </div>

      {/* Sample pills */}
      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
        <span className="text-[10px] uppercase font-medium text-[#74767D] mr-1">
          Suggestions:
        </span>
        {sampleQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => {
              setQuestion(sq);
              handleAsk(sq);
            }}
            className="text-[11px] text-[#74767D] hover:text-[#303030] bg-[#F1F1EE] hover:bg-[#FFF0A8] px-3 py-1 rounded-full border border-[#E2E2DE] transition-colors truncate max-w-[280px]"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Answer container */}
      {result && (
        <div className="mt-4 pt-3 border-t border-[#E2E2DE] space-y-3 animate-in fade-in duration-200">
          <div className="bg-[#FFF9E9] rounded-[14px] p-3 border border-[#E2E2DE]">
            <p className="text-xs text-[#303030] leading-relaxed">{result.answer}</p>
          </div>

          {result.keyStats && result.keyStats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {result.keyStats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[12px] p-2 border border-[#E2E2DE]"
                >
                  <span className="text-[10px] uppercase font-medium text-[#74767D] block truncate">
                    {stat.label}
                  </span>
                  <span className="text-sm font-medium text-[#303030] truncate block">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {result.suggestedFollowUps && result.suggestedFollowUps.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-[#74767D] font-medium block">
                Suggested Follow-up Questions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.suggestedFollowUps.map((fu, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuestion(fu);
                      handleAsk(fu);
                    }}
                    className="text-[11px] text-[#303030] bg-white hover:bg-[#FFF0A8] px-3 py-1 rounded-full border border-[#E2E2DE] transition-colors flex items-center gap-1"
                  >
                    <span>{fu}</span>
                    <ArrowRight className="w-3 h-3 text-[#74767D]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-[#74767D] pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#305B35]" />
              Synthesized with Gemini 2.5 on Maharashtra live outcome tables
            </span>
            <span>DPDP Section 4(2)</span>
          </div>
        </div>
      )}
    </div>
  );
};

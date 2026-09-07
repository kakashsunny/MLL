import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Search, 
  HelpCircle, 
  ShieldAlert, 
  CheckCircle2, 
  Code2, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { ALL_INTERVIEW_TRAPS, MLInterviewTrap } from '../../data/interview/interviewTraps';

export const TrapsView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(ALL_INTERVIEW_TRAPS[0]?.id || null);

  const categories = useMemo(() => {
    return Array.from(new Set(ALL_INTERVIEW_TRAPS.map(t => t.category))).sort();
  }, []);

  const filteredTraps = useMemo(() => {
    return ALL_INTERVIEW_TRAPS.filter(trap => {
      if (selectedCategory !== 'All' && trap.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          trap.trapQuestion.toLowerCase().includes(q) ||
          trap.theTruth.toLowerCase().includes(q) ||
          trap.whyPeopleFail.toLowerCase().includes(q) ||
          trap.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="p-5 bg-white border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-rose-700 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> High-Stakes Interview Edge Cases
            </div>
            <h2 className="text-xl font-black text-[#111111]">
              100+ Common Traps & Edge Cases
            </h2>
            <p className="text-xs text-stone-600 font-sans mt-0.5">
              The counter-intuitive questions that trip up even experienced engineers in FAANG and hedge-fund ML screens.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tricky traps and counter-examples..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F2] border border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#1A42D9] font-mono"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 text-[11px] font-mono uppercase font-bold border border-[#111111] shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-[#111111] text-white'
                : 'bg-[#FAF8F2] text-stone-700 hover:bg-stone-200'
            }`}
          >
            All Traps ({ALL_INTERVIEW_TRAPS.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-[11px] font-mono uppercase font-bold border border-[#111111] shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#FAF8F2] text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Traps List */}
      <div className="space-y-3">
        <div className="text-xs font-mono text-stone-500 px-1">
          Showing {filteredTraps.length} of {ALL_INTERVIEW_TRAPS.length} Edge Cases
        </div>

        {filteredTraps.map(trap => {
          const isExpanded = expandedId === trap.id;

          return (
            <div
              key={trap.id}
              className={`bg-white border transition-all ${
                isExpanded
                  ? 'border-[#111111] shadow-[4px_4px_0px_0px_rgba(225,29,72,1)]'
                  : 'border-[#111111] hover:border-rose-500 shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]'
              }`}
            >
              {/* Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : trap.id)}
                className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5">
                      Trap #{trap.id}
                    </span>
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-stone-100 border border-stone-300 text-stone-700">
                      {trap.category}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#111111] leading-snug">
                    {trap.trapQuestion}
                  </h3>

                  {!isExpanded && (
                    <p className="text-xs text-stone-500 line-clamp-1 font-sans">
                      {trap.theTruth}
                    </p>
                  )}
                </div>

                <div className="p-1 text-stone-400 hover:text-[#111111] shrink-0">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-[#111111] bg-[#FAF8F2] p-5 sm:p-6 space-y-4">
                  {/* Why Candidates Fail vs The Truth */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Why Candidates Fail */}
                    <div className="p-4 bg-rose-50 border border-rose-200 space-y-1.5">
                      <div className="text-[10px] font-mono uppercase font-bold text-rose-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Why 80% of Candidates Fail This
                      </div>
                      <p className="text-xs text-stone-800 leading-relaxed font-sans">
                        {trap.whyPeopleFail}
                      </p>
                    </div>

                    {/* The Truth */}
                    <div className="p-4 bg-emerald-50 border border-emerald-200 space-y-1.5">
                      <div className="text-[10px] font-mono uppercase font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> The Mathematical & Empirical Truth
                      </div>
                      <p className="text-xs text-stone-800 leading-relaxed font-sans">
                        {trap.theTruth}
                      </p>
                    </div>
                  </div>

                  {/* Technical Deep Dive */}
                  <div className="p-4 bg-white border border-[#E5E2D9] space-y-1.5">
                    <div className="text-[10px] font-mono uppercase font-bold text-[#1A42D9]">
                      Technical Mechanics & Verification
                    </div>
                    <p className="text-xs text-stone-800 leading-relaxed font-sans whitespace-pre-line">
                      {trap.technicalDetails}
                    </p>
                  </div>

                  {/* Script: How to Answer in Interview */}
                  <div className="p-4 bg-[#111111] text-white border border-[#111111] space-y-1.5">
                    <div className="text-[10px] font-mono uppercase font-bold text-amber-400 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> How to Word Your Answer to Impress Interviewers
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed font-sans">
                      "{trap.howToAnswerInInterview}"
                    </p>
                  </div>

                  {/* Code Snippet if present */}
                  {trap.codeExample && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono uppercase font-bold text-stone-600 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5" /> Proof of Concept Code
                      </div>
                      <div className="p-3 bg-[#111111] text-[#22C55E] font-mono text-xs overflow-x-auto border border-stone-800">
                        <pre>{trap.codeExample}</pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

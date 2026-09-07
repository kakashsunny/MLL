import React, { useState } from 'react';
import { 
  BookMarked, 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  HelpCircle, 
  AlertCircle, 
  ChevronRight,
  Code2,
  Binary
} from 'lucide-react';
import { GLOSSARY_TERMS } from '../../data/glossaryData';
import { GlossaryTerm } from '../../types';

export const GlossaryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTerm, setActiveTerm] = useState<GlossaryTerm>(GLOSSARY_TERMS[0]);
  const [copied, setCopied] = useState(false);

  const categories = ['All', 'Metrics', 'Optimization', 'Algorithms', 'Deep Learning', 'Modern AI'];

  const filteredTerms = GLOSSARY_TERMS.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.simpleExplanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.technicalDefinition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopyCode = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="glossary_view" className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 select-none bg-[#F7F5EF] text-[#111111]">
      
      {/* 1. Header & Search */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#E5E2D9] pb-6">
        <div>
          <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1A42D9]" />
            <span>Empirical Reference • Mathematical Encyclopedia</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
            Interactive ML Glossary & Formulas
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Intuitive analogies paired with rigorous mathematical equations, visual intuitions, and interview failure modes.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search encyclopedia..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E2D9] rounded text-xs text-[#111111] placeholder:text-stone-400 focus:outline-none focus:border-[#111111] font-mono shadow-xs"
          />
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? 'bg-[#111111] text-white border-[#111111] font-bold shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-50 border-[#E5E2D9]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Main Split: Roster (4 cols) + Exhaustive Anatomy (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 4 cols: Terms Roster */}
        <div className="lg:col-span-4 space-y-2 max-h-[640px] overflow-y-auto pr-1">
          {filteredTerms.map(term => {
            const isSelected = activeTerm.id === term.id;
            return (
              <button
                key={term.id}
                onClick={() => setActiveTerm(term)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-white border-[#111111] shadow-md ring-2 ring-[#111111]/10'
                    : 'bg-white hover:bg-stone-50 border-[#E5E2D9] text-stone-700'
                }`}
              >
                <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">
                  {term.category}
                </div>
                <div className="text-sm font-bold text-[#111111]">
                  {term.term}
                </div>
                <div className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                  {term.simpleExplanation}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right 8 cols: Exhaustive Term Anatomy */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-[#E5E2D9] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            
            <div className="border-b border-[#E5E2D9] pb-4">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#FAF8F2] text-stone-700 border border-[#E5E2D9] font-bold tracking-wider">
                {activeTerm.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] mt-2">
                {activeTerm.term}
              </h2>
            </div>

            {/* 1. Simple Intuitive Explanation */}
            <div className="p-4 rounded bg-[#FAF8F2] border border-[#E5E2D9] space-y-1">
              <span className="text-[10px] font-mono text-[#1A42D9] uppercase font-bold tracking-wider block">
                Plain-English Intuition:
              </span>
              <p className="text-sm text-stone-800 leading-relaxed font-medium">
                "{activeTerm.simpleExplanation}"
              </p>
            </div>

            {/* 2. Technical Definition & Formula */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded bg-[#FAF8F2] border border-[#E5E2D9] space-y-1">
                <span className="text-[10px] font-mono text-stone-500 uppercase font-bold tracking-wider block">
                  Formal Mathematical Definition:
                </span>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {activeTerm.technicalDefinition}
                </p>
              </div>

              <div className="p-4 rounded bg-[#FAF8F2] border border-[#E5E2D9] space-y-1">
                <span className="text-[10px] font-mono text-stone-500 uppercase font-bold tracking-wider block">
                  Formulation:
                </span>
                <div className="p-2.5 rounded bg-white border border-[#E5E2D9] font-mono text-xs text-[#1A42D9] font-bold mt-1">
                  {activeTerm.mathematicalFormula}
                </div>
              </div>
            </div>

            {/* 3. Visual Intuition & Real Application */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded bg-[#FAF8F2] border border-[#E5E2D9] space-y-1">
                <span className="text-[10px] font-mono text-amber-700 uppercase font-bold tracking-wider block">
                  Visual Metaphor:
                </span>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {activeTerm.visualIntuition}
                </p>
              </div>

              <div className="p-4 rounded bg-[#FAF8F2] border border-[#E5E2D9] space-y-1">
                <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold tracking-wider block">
                  Production Application:
                </span>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {activeTerm.example}
                </p>
              </div>
            </div>

            {/* 4. Python Implementation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-stone-500">
                <span className="font-bold uppercase tracking-wider text-[#111111]">Python Implementation Snippet</span>
                <button
                  onClick={() => handleCopyCode(activeTerm.pythonSnippet)}
                  className="flex items-center gap-1 text-stone-600 hover:text-[#111111] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'COPIED' : 'COPY CODE'}</span>
                </button>
              </div>
              <pre className="p-4 rounded bg-[#FAF8F2] border border-[#E5E2D9] text-xs font-mono text-[#111111] overflow-x-auto leading-relaxed">
                <code>{activeTerm.pythonSnippet}</code>
              </pre>
            </div>

            {/* 5. Misconception & Interview Probe */}
            <div className="p-4 rounded bg-rose-50 border border-rose-200 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-800 text-xs font-mono font-bold tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>COMMON MISCONCEPTION BUSTER:</span>
              </div>
              <p className="text-xs text-rose-950 leading-relaxed font-mono">
                {activeTerm.commonMisconception}
              </p>
            </div>

            <div className="p-4 rounded bg-[#FAF8F2] border border-[#E5E2D9] space-y-1">
              <div className="flex items-center gap-1.5 text-[#1A42D9] text-xs font-mono font-bold tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>FAANG INTERVIEW PROBE:</span>
              </div>
              <p className="text-xs text-stone-800 leading-relaxed font-mono">
                "{activeTerm.interviewQuestion}"
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

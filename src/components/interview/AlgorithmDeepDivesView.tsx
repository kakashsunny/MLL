import React, { useState } from 'react';
import { 
  Cpu, 
  Code2, 
  Check, 
  Copy, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  BookOpen, 
  Zap, 
  Sliders, 
  HelpCircle,
  TrendingUp,
  Layers
} from 'lucide-react';
import { ML_ALGORITHMS_DATA } from '../../data/interview/algorithmsData';
import { MLAlgorithmDeepDive } from '../../data/interview/types';

export const AlgorithmDeepDivesView: React.FC = () => {
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>(ML_ALGORITHMS_DATA[0].id);
  const [copied, setCopied] = useState(false);

  const activeAlgo: MLAlgorithmDeepDive = 
    ML_ALGORITHMS_DATA.find(a => a.id === selectedAlgoId) || ML_ALGORITHMS_DATA[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeAlgo.pythonImplementation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Category and Algorithm Pill Bar */}
      <div className="p-4 bg-white border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase font-bold text-stone-500">
            Core ML Algorithms Architecture Deep Dives
          </span>
          <span className="text-[10px] font-mono text-[#1A42D9] font-bold">
            Mathematical Intuition & Production Mechanics
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {ML_ALGORITHMS_DATA.map(algo => (
            <button
              key={algo.id}
              onClick={() => setSelectedAlgoId(algo.id)}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all shrink-0 border border-[#111111] ${
                selectedAlgoId === algo.id
                  ? 'bg-[#111111] text-white shadow-[2px_2px_0px_0px_rgba(26,66,217,1)]'
                  : 'bg-[#FAF8F2] text-stone-700 hover:bg-stone-200'
              }`}
            >
              {algo.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Active Algorithm Deep Dive Layout */}
      <div className="p-6 bg-white border border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] space-y-6">
        {/* Title Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E2D9] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-[#1A42D9] text-white">
                {activeAlgo.category}
              </span>
              <span className="text-[10px] font-mono uppercase font-bold text-stone-400">
                Architectural Breakdown
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#111111]">
              {activeAlgo.name}
            </h2>
          </div>

          <div className="p-2.5 bg-[#FAF8F2] border border-[#E5E2D9] text-xs font-mono text-stone-600">
            <span className="font-bold text-[#111111]">Real-World Scenario: </span>
            {activeAlgo.realWorldExample}
          </div>
        </div>

        {/* Section 1: What it is & How it works */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#FAF8F2] border border-[#E5E2D9] space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-stone-600 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#1A42D9]" /> What It Is
            </div>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-sans">
              {activeAlgo.whatItIs}
            </p>
          </div>

          <div className="p-4 bg-[#FAF8F2] border border-[#E5E2D9] space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-stone-600 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" /> How It Works Step-by-Step
            </div>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-sans">
              {activeAlgo.howItWorks}
            </p>
          </div>
        </div>

        {/* Section 2: Mathematical Intuition & Key Formulas */}
        <div className="p-5 bg-stone-50 border border-[#111111] space-y-4">
          <div className="text-xs font-mono uppercase font-bold text-[#1A42D9] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Mathematical Foundations & Loss Functions
          </div>
          <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-sans">
            {activeAlgo.mathematicalIntuition}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {activeAlgo.formulas.map((form, i) => (
              <div key={i} className="p-3 bg-white border border-[#E5E2D9] space-y-1.5">
                <div className="text-[10px] font-mono uppercase font-bold text-stone-500">
                  {form.name}
                </div>
                <div className="p-2 bg-[#111111] text-[#22C55E] font-mono text-xs rounded-none overflow-x-auto">
                  <code>{form.formula}</code>
                </div>
                <div className="text-[11px] text-stone-600 font-sans">
                  {form.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Advantages vs Disadvantages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50/40 border border-emerald-200 space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Architectural Advantages
            </div>
            <ul className="space-y-1.5 text-xs text-stone-800 font-sans">
              {activeAlgo.advantages.map((adv, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-rose-50/40 border border-rose-200 space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-rose-800 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-600" /> Known Limitations & Drawbacks
            </div>
            <ul className="space-y-1.5 text-xs text-stone-800 font-sans">
              {activeAlgo.disadvantages.map((dis, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                  <span>{dis}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 4: When to Use & When NOT to Use */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white border border-[#E5E2D9] space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-blue-700 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Optimal Use Cases
            </div>
            <ul className="space-y-1.5 text-xs text-stone-700 font-sans">
              {activeAlgo.whenToUse.map((use, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span>{use}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-white border border-[#E5E2D9] space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> When NOT to Use
            </div>
            <ul className="space-y-1.5 text-xs text-stone-700 font-sans">
              {activeAlgo.whenNotToUse.map((nuse, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                  <span>{nuse}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 5: Key Hyperparameters */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase font-bold text-stone-600 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#1A42D9]" /> Key Hyperparameters & Tuning Strategy
          </div>
          <div className="overflow-x-auto border border-[#111111]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#111111] text-white">
                <tr>
                  <th className="p-2.5">Hyperparameter</th>
                  <th className="p-2.5">Default Value</th>
                  <th className="p-2.5">Tuning Impact & Bias-Variance Effect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2D9] bg-white">
                {activeAlgo.hyperparameters.map((hp, i) => (
                  <tr key={i} className="hover:bg-stone-50">
                    <td className="p-2.5 font-bold text-[#111111]">{hp.name}</td>
                    <td className="p-2.5 text-stone-600">{hp.defaultVal}</td>
                    <td className="p-2.5 text-stone-800 font-sans">{hp.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 6: Candidate Mistakes & Interview Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white border border-[#E5E2D9] space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-rose-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Common Candidate Mistakes
            </div>
            <ul className="space-y-1.5 text-xs text-stone-700 font-sans">
              {activeAlgo.commonMistakes.map((mistake, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-white border border-[#E5E2D9] space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-[#1A42D9] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> Questions Asked by FAANG Interviewers
            </div>
            <ul className="space-y-1.5 text-xs text-stone-700 font-sans">
              {activeAlgo.interviewQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1A42D9] mt-1.5 shrink-0" />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 7: Python Implementation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono uppercase font-bold text-stone-600 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-emerald-600" /> Production Python Implementation
            </div>
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 text-[11px] font-mono uppercase font-bold bg-[#FAF8F2] hover:bg-stone-200 border border-[#111111] flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <div className="p-4 bg-[#111111] text-[#22C55E] border border-stone-800 font-mono text-xs overflow-x-auto">
            <pre>{activeAlgo.pythonImplementation}</pre>
          </div>
        </div>

        {/* Section 8: Production Performance Improvements */}
        <div className="p-4 bg-stone-50 border border-[#111111] space-y-2">
          <div className="text-[10px] font-mono uppercase font-bold text-[#1A42D9] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> How to Squeeze Maximum Performance in Production
          </div>
          <ul className="space-y-1 text-xs text-stone-800 font-sans">
            {activeAlgo.howToImprovePerformance.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1A42D9] mt-1.5 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

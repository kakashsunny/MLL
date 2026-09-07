import React, { useState } from 'react';
import { ViewMode, UserProgress } from '../../types';
import { 
  Flame, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  FlaskConical, 
  Terminal, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Sliders,
  Check,
  RotateCcw,
  Zap,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardProps {
  userProgress: UserProgress;
  onSelectView: (view: ViewMode) => void;
  onContinueLearning: () => void;
  onUpdateXP: (amount: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userProgress,
  onSelectView,
  onContinueLearning,
  onUpdateXP
}) => {
  // Daily Challenge State
  const [selectedChallengeOption, setSelectedChallengeOption] = useState<number | null>(null);
  const [isChallengeSubmitted, setIsChallengeSubmitted] = useState(false);
  const [challengeAnsweredCorrectly, setChallengeAnsweredCorrectly] = useState(false);

  const handleChallengeSubmit = (optionIndex: number) => {
    if (isChallengeSubmitted) return;
    setSelectedChallengeOption(optionIndex);
    setIsChallengeSubmitted(true);
    // Correct option is B (index 1): Overfitting (High Variance)
    const isCorrect = optionIndex === 1;
    setChallengeAnsweredCorrectly(isCorrect);
    if (isCorrect) {
      onUpdateXP(250);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const [tutorQuery, setTutorQuery] = useState('');
  const handleTutorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tutorQuery.trim()) {
      onSelectView('tutor');
    }
  };

  const completedCount = userProgress.completedLessons.length;
  const totalLessons = 10;
  const progressPercent = Math.min(100, Math.round((completedCount / totalLessons) * 100));
  const currentLessonNum = Math.min(totalLessons, completedCount + 1);

  const currentLessonTitle = completedCount === 0
    ? "Linear Regression & Ordinary Least Squares"
    : completedCount === 1
    ? "Logistic Regression & Sigmoid Classification"
    : completedCount === 2
    ? "K-Nearest Neighbors & Metric Spaces"
    : "Decision Trees & Recursive Gini Partitioning";

  const currentLessonDesc = completedCount === 0
    ? "Learn how linear models estimate optimal hyperplane coefficients by minimizing residual sum of squares across continuous feature dimensions."
    : completedCount === 1
    ? "Explore how non-linear logit transforms map continuous linear combinations to well-calibrated posterior probabilities."
    : completedCount === 2
    ? "Understand non-parametric instance-based learning, Voronoi tessellations, and inductive bias in distance metrics."
    : "Learn how orthogonal hyperplanes recursively divide feature space to maximize Information Gain and minimize classification entropy.";

  const isTrained = (userProgress.experimentsRunCount || 0) > 0 || completedCount > 0;

  return (
    <div id="dashboard_view" className="p-6 sm:p-10 max-w-7xl mx-auto space-y-10 select-none bg-[#F7F5EF] text-[#111111]">
      
      {/* 1. EDITORIAL HEADER & WELCOME */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E2D9] pb-6">
        <div>
          <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1A42D9]" />
            <span>Learner Workstation • Session Synchronized</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
            Welcome back, Explorer.
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Machine Learning Engine is initialized. Explore first-principles models through visual intuition and code.
          </p>
        </div>

        {/* Clean Editorial Quick Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <button
            onClick={() => onSelectView('lab')}
            className="px-4 py-2.5 rounded-none bg-white hover:bg-stone-50 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-xs font-mono font-bold text-[#111111] flex items-center gap-2 transition-all cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5 text-[#1A42D9]" />
            <span>OPEN LAB</span>
          </button>
          <button
            onClick={() => onSelectView('playground')}
            className="px-4 py-2.5 rounded-none bg-white hover:bg-stone-50 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-xs font-mono font-bold text-[#111111] flex items-center gap-2 transition-all cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-[#1A42D9]" />
            <span>CODE PLAYGROUND</span>
          </button>
        </div>
      </div>

      {/* 2. PRIMARY TWO-COLUMN COMMAND CENTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols): Continue Learning Hero + Active Visual Lab */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Card A: Continue Learning Primary Card */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rounded-none p-6 sm:p-8 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_#111111] transition-all">
            <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#1A42D9] border border-[#111111]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                  Current Curriculum Trajectory
                </span>
              </div>
              <span className="text-xs font-mono text-stone-600 font-bold bg-[#FAF8F2] px-2 py-0.5 border border-[#111111]">
                Lesson {currentLessonNum} of {totalLessons} • Module {completedCount < 3 ? '01' : '02'}
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                {currentLessonTitle}
              </h2>
              <p className="text-sm text-stone-700 leading-relaxed max-w-2xl">
                {currentLessonDesc}
              </p>
            </div>

            {/* Progress Bar & Actions */}
            <div className="mt-8 pt-6 border-t-[2px] border-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-xl font-bold font-mono text-[#111111]">
                  {progressPercent}%
                </div>
                <div className="flex-1 max-w-xs h-3 bg-white border-[2px] border-[#111111] rounded-none overflow-hidden">
                  <div className="h-full bg-[#1A42D9] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-xs font-mono text-stone-500 font-bold">
                  {completedCount === 0 ? 'Foundations Stage' : 'Concept Check Next'}
                </span>
              </div>

              <button 
                onClick={onContinueLearning}
                className="px-7 py-3.5 rounded-none bg-[#111111] hover:bg-[#1A42D9] text-white font-bold text-xs font-mono uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <span>{completedCount === 0 ? 'START FIRST LESSON' : 'CONTINUE LESSON'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card B: Active Experiment Workbench Snapshot */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rounded-none p-6 sm:p-8">
            <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-4 mb-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 block mb-0.5">
                  Workbench Snapshot
                </span>
                <h3 className="text-xl font-black text-[#111111] tracking-tight">
                  Backpropagation & Loss Optimization
                </h3>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono bg-[#FAF8F2] border-[2px] border-[#111111] shadow-[1px_1px_0px_0px_#111111] px-2.5 py-1 rounded-none text-stone-800 font-bold">
                  {isTrained ? 'Epoch 37/100' : 'Epoch 0/100'}
                </span>
                <span className={`text-xs font-mono px-2.5 py-1 rounded-none font-bold border-[2px] shadow-[1px_1px_0px_0px_#111111] ${
                  isTrained 
                    ? 'bg-emerald-50 border-emerald-700 text-emerald-900' 
                    : 'bg-[#FAF8F2] border-[#111111] text-stone-600'
                }`}>
                  {isTrained ? 'Loss: 0.031 ↓' : 'Ready to Run'}
                </span>
              </div>
            </div>

            {/* Simulated Clean Network Canvas */}
            <div className="h-52 w-full bg-[#FAF8F2] border-[2px] border-[#111111] rounded-none p-3 relative overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full max-h-48" viewBox="0 0 700 240">
                {/* Connections */}
                <g stroke="#888888" strokeWidth="1.5">
                  <line x1="80" y1="60" x2="250" y2="40" />
                  <line x1="80" y1="60" x2="250" y2="120" />
                  <line x1="80" y1="120" x2="250" y2="40" />
                  <line x1="80" y1="120" x2="250" y2="120" />
                  <line x1="80" y1="120" x2="250" y2="200" />
                  <line x1="80" y1="180" x2="250" y2="120" />
                  <line x1="80" y1="180" x2="250" y2="200" />

                  <line x1="250" y1="40" x2="450" y2="80" stroke="#1A42D9" strokeWidth="1.5" strokeOpacity="0.6" />
                  <line x1="250" y1="120" x2="450" y2="80" stroke="#1A42D9" strokeWidth="1.5" strokeOpacity="0.8" />
                  <line x1="250" y1="120" x2="450" y2="160" stroke="#1A42D9" strokeWidth="1.5" strokeOpacity="0.7" />
                  <line x1="250" y1="200" x2="450" y2="160" stroke="#1A42D9" strokeWidth="1.5" strokeOpacity="0.5" />

                  <line x1="450" y1="80" x2="620" y2="120" stroke="#1A42D9" strokeWidth="2.5" />
                  <line x1="450" y1="160" x2="620" y2="120" stroke="#1A42D9" strokeWidth="2.5" />
                </g>

                {/* Layer 1 Nodes (Inputs) */}
                <circle cx="80" cy="60" r="10" fill="#FFFFFF" stroke="#111111" strokeWidth="2.5" />
                <circle cx="80" cy="120" r="10" fill="#FFFFFF" stroke="#111111" strokeWidth="2.5" />
                <circle cx="80" cy="180" r="10" fill="#FFFFFF" stroke="#111111" strokeWidth="2.5" />

                {/* Layer 2 Nodes (Hidden 1) */}
                <circle cx="250" cy="40" r="11" fill="#FFFFFF" stroke="#1A42D9" strokeWidth="2.5" />
                <circle cx="250" cy="120" r="11" fill="#1A42D9" fillOpacity="0.2" stroke="#1A42D9" strokeWidth="2.5" />
                <circle cx="250" cy="200" r="11" fill="#FFFFFF" stroke="#1A42D9" strokeWidth="2.5" />

                {/* Layer 3 Nodes (Hidden 2) */}
                <circle cx="450" cy="80" r="12" fill="#1A42D9" fillOpacity="0.25" stroke="#1A42D9" strokeWidth="2.5" />
                <circle cx="450" cy="160" r="12" fill="#FFFFFF" stroke="#1A42D9" strokeWidth="2.5" />

                {/* Layer 4 Output Logit */}
                <circle cx="620" cy="120" r="15" fill="#1A42D9" stroke="#111111" strokeWidth="3" />
              </svg>

              <div className="absolute bottom-3 right-3">
                <button
                  onClick={() => onSelectView('lab')}
                  className="px-3.5 py-1.5 rounded-none bg-white hover:bg-stone-50 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-xs font-mono font-bold text-[#111111] flex items-center gap-1.5 transition-all"
                >
                  <span>Manipulate In Lab</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#1A42D9]" />
                </button>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t-[2px] border-[#111111] text-center">
              <div className="p-2.5 bg-[#FAF8F2] border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
                <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block">Accuracy</span>
                <span className="text-base font-bold font-mono text-[#111111]">{isTrained ? '94.7%' : '0.0%'}</span>
              </div>
              <div className="p-2.5 bg-[#FAF8F2] border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
                <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block">MSE Loss</span>
                <span className="text-base font-bold font-mono text-emerald-800">{isTrained ? '0.012' : '--'}</span>
              </div>
              <div className="p-2.5 bg-[#FAF8F2] border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
                <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block">Weights</span>
                <span className="text-base font-bold font-mono text-[#111111]">12,480</span>
              </div>
              <div className="p-2.5 bg-[#FAF8F2] border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
                <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block">Optimizer</span>
                <span className="text-base font-bold font-mono text-[#1A42D9]">ADAM</span>
              </div>
            </div>
          </div>

          {/* Card C: Learning Roadmap Snapshot */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] rounded-none p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 border-b-[2px] border-[#111111] pb-3">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 block">
                  Skill Trajectory
                </span>
                <h3 className="text-xl font-black text-[#111111] tracking-tight">
                  Machine Learning Foundations
                </h3>
              </div>
              <button 
                onClick={() => onSelectView('roadmap')}
                className="text-xs font-mono text-[#1A42D9] hover:underline font-bold px-2.5 py-1 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] bg-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                View Full Graph →
              </button>
            </div>

            <div className="flex items-center justify-between px-2 overflow-x-auto py-2">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={`w-10 h-10 rounded-none border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] flex items-center justify-center text-xs font-black font-mono ${
                  completedCount >= 1 ? 'bg-emerald-50 text-emerald-800' : 'bg-[#1A42D9] text-white'
                }`}>
                  {completedCount >= 1 ? '✓' : '1'}
                </div>
                <span className="text-[10px] font-mono font-bold text-stone-700">NumPy</span>
              </div>

              <div className="h-[2px] w-8 sm:w-12 bg-[#111111] shrink-0" />

              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={`w-10 h-10 rounded-none border-[2px] border-[#111111] flex items-center justify-center text-xs font-black font-mono ${
                  completedCount >= 2 
                    ? 'bg-emerald-50 text-emerald-800 border-[#111111] shadow-[2px_2px_0px_0px_#111111]' 
                    : completedCount === 1 
                    ? 'bg-[#1A42D9] text-white border-[#111111] shadow-[2px_2px_0px_0px_#111111]' 
                    : 'bg-white border-stone-400 text-stone-600'
                }`}>
                  {completedCount >= 2 ? '✓' : '2'}
                </div>
                <span className="text-[10px] font-mono font-bold text-stone-700">Linear Alg</span>
              </div>

              <div className="h-[2px] w-8 sm:w-12 bg-stone-300 shrink-0" />

              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={`w-10 h-10 rounded-none border-[2px] flex items-center justify-center text-xs font-black font-mono ${
                  completedCount >= 3 
                    ? 'bg-emerald-50 text-emerald-800 border-[#111111] shadow-[2px_2px_0px_0px_#111111]' 
                    : completedCount === 2 
                    ? 'bg-[#1A42D9] text-white border-[#111111] shadow-[2px_2px_0px_0px_#111111]' 
                    : 'bg-white border-stone-400 text-stone-600'
                }`}>
                  {completedCount >= 3 ? '✓' : '3'}
                </div>
                <span className="text-[10px] font-mono font-bold text-stone-700">Regression</span>
              </div>

              <div className="h-[2px] w-8 sm:w-12 bg-stone-300 shrink-0" />

              <div className="flex flex-col items-center gap-1.5 shrink-0 opacity-80">
                <div className="w-10 h-10 rounded-none bg-white border-[2px] border-stone-400 flex items-center justify-center text-stone-600 text-xs font-mono font-bold">
                  4
                </div>
                <span className="text-[10px] font-mono text-stone-600 font-bold">Trees</span>
              </div>

              <div className="h-[2px] w-8 sm:w-12 bg-stone-300 shrink-0" />

              <div className="flex flex-col items-center gap-1.5 shrink-0 opacity-80">
                <div className="w-10 h-10 rounded-none bg-white border-[2px] border-stone-400 flex items-center justify-center text-stone-600 text-xs font-mono font-bold">
                  5
                </div>
                <span className="text-[10px] font-mono text-stone-600 font-bold">Deep Net</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Today's ML Challenge + Socratic Ask Forge + Skill Radar */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Card D: Today's ML Challenge */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] rounded-none p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4 border-b-[2px] border-[#111111] pb-3">
              <div className="flex items-center gap-2 text-[#111111] text-xs font-mono font-bold">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-700" />
                <span className="uppercase tracking-wider">Today’s Challenge</span>
              </div>
              <span className="px-2.5 py-1 rounded-none bg-[#FAF8F2] border-[2px] border-[#111111] text-xs font-mono text-[#1A42D9] font-black shadow-[1px_1px_0px_0px_#111111]">
                +250 XP
              </span>
            </div>

            <h3 className="text-sm font-black text-[#111111] leading-snug mb-2">
              “You trained a classifier with 99% training accuracy and 62% test accuracy. What is happening?”
            </h3>
            <p className="text-xs text-stone-600 mb-4">
              Select the correct diagnosis to verify your mathematical intuition.
            </p>

            {/* Multiple Choice Options */}
            <div className="space-y-2.5">
              {[
                { id: 0, label: 'A. Underfitting (High Bias)' },
                { id: 1, label: 'B. Overfitting (High Variance)' },
                { id: 2, label: 'C. Data normalization artifact' },
                { id: 3, label: 'D. Optimal generalization' },
              ].map((opt) => {
                const isSelected = selectedChallengeOption === opt.id;
                let btnStyle = "bg-white hover:bg-stone-50 border-[#111111] text-stone-800 shadow-[2px_2px_0px_0px_#111111]";
                if (isChallengeSubmitted) {
                  if (opt.id === 1) {
                    btnStyle = "bg-emerald-50 border-emerald-700 text-emerald-950 font-bold shadow-[2px_2px_0px_0px_#111111]";
                  } else if (isSelected && opt.id !== 1) {
                    btnStyle = "bg-rose-50 border-rose-600 text-rose-950 font-bold shadow-[2px_2px_0px_0px_#111111]";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-[#1A42D9]/10 border-[#1A42D9] text-[#1A42D9] font-bold shadow-[3px_3px_0px_0px_#111111] -translate-x-0.5 -translate-y-0.5";
                }

                return (
                  <button
                    key={opt.id}
                    id={`challenge_opt_${opt.id}`}
                    disabled={isChallengeSubmitted}
                    onClick={() => handleChallengeSubmit(opt.id)}
                    className={`w-full p-3 rounded-none border-[2px] text-xs text-left font-bold transition-all flex items-center justify-between active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${btnStyle}`}
                  >
                    <span>{opt.label}</span>
                    {isChallengeSubmitted && opt.id === 1 && (
                      <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation card after submit */}
            {isChallengeSubmitted && (
              <div className="mt-4 p-3.5 rounded-none bg-[#FAF8F2] border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] text-xs leading-relaxed text-stone-800 animate-in fade-in">
                <strong className="block text-[#111111] mb-1 font-black">
                  {challengeAnsweredCorrectly ? '✓ Correct! +250 XP Awarded.' : '✗ Correct Answer: B. Overfitting'}
                </strong>
                When training accuracy is 99% but test accuracy plunges to 62%, the hypothesis function has memorized high-frequency sample variance rather than true manifold geometry.
              </div>
            )}
          </div>

          {/* Card E: Ask Forge AI Socratic Tutor */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] rounded-none p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-3 border-b-[2px] border-[#111111] pb-3">
              <span className="w-2.5 h-2.5 bg-[#1A42D9] border border-[#111111]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                Ask Forge • Socratic Mentor
              </h3>
            </div>

            <div className="p-3.5 bg-[#FAF8F2] rounded-none border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] mb-4">
              <p className="text-xs text-stone-800 italic leading-relaxed font-serif">
                “Think of a Decision Tree as a 20-questions game. At each node, we greedily choose the question that creates the purest partitions.”
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <span className="text-[10px] font-mono text-stone-500 font-bold uppercase tracking-wider block">
                Quick Prompts
              </span>
              <button
                onClick={() => onSelectView('tutor')}
                className="w-full text-left px-3 py-2 rounded-none bg-white hover:bg-stone-50 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-xs text-stone-800 font-medium transition-all"
              >
                Explain Gini impurity with a coin toss analogy
              </button>
              <button
                onClick={() => onSelectView('tutor')}
                className="w-full text-left px-3 py-2 rounded-none bg-white hover:bg-stone-50 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-xs text-stone-800 font-medium transition-all"
              >
                How does Random Forest reduce tree variance?
              </button>
            </div>

            <form onSubmit={handleTutorSubmit} className="relative">
              <input
                type="text"
                placeholder="Ask any ML concept..."
                value={tutorQuery}
                onChange={e => setTutorQuery(e.target.value)}
                className="w-full bg-[#FAF8F2] border-[2px] border-[#111111] rounded-none px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:ring-0 pr-16 font-mono"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 text-[10px] font-mono font-bold text-[#111111] px-2.5 py-1 bg-white border-[2px] border-[#111111] shadow-[1px_1px_0px_0px_#111111] rounded-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                Ask →
              </button>
            </form>
          </div>

          {/* Card F: Concept Retention & Skill Breakdown */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] rounded-none p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600">
                Retention & Mastery
              </h3>
              <span className="text-xs font-mono text-[#1A42D9] font-black bg-[#1A42D9]/10 px-2 py-0.5 border border-[#1A42D9]">
                {completedCount === 0 ? '0.0% Index' : `${Math.min(94.2, (completedCount * 18.5) + 12.4).toFixed(1)}% Index`}
              </span>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1 font-semibold">
                  <span className="text-stone-700">Linear Algebra & Tensors</span>
                  <span className="font-bold text-[#111111]">{completedCount === 0 ? '0%' : `${Math.min(100, completedCount * 25)}%`}</span>
                </div>
                <div className="h-2 w-full bg-white border-[2px] border-[#111111] rounded-none overflow-hidden">
                  <div className="h-full bg-[#111111] transition-all duration-500" style={{ width: completedCount === 0 ? '0%' : `${Math.min(100, completedCount * 25)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1 font-semibold">
                  <span className="text-stone-700">Supervised Classifiers</span>
                  <span className="font-bold text-[#111111]">{completedCount < 2 ? '0%' : `${Math.min(100, (completedCount - 1) * 30)}%`}</span>
                </div>
                <div className="h-2 w-full bg-white border-[2px] border-[#111111] rounded-none overflow-hidden">
                  <div className="h-full bg-[#1A42D9] transition-all duration-500" style={{ width: completedCount < 2 ? '0%' : `${Math.min(100, (completedCount - 1) * 30)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1 font-semibold">
                  <span className="text-stone-700">Loss Functions & Gradients</span>
                  <span className="font-bold text-[#111111]">{completedCount === 0 ? '0%' : `${Math.min(100, completedCount * 22)}%`}</span>
                </div>
                <div className="h-2 w-full bg-white border-[2px] border-[#111111] rounded-none overflow-hidden">
                  <div className="h-full bg-[#111111] transition-all duration-500" style={{ width: completedCount === 0 ? '0%' : `${Math.min(100, completedCount * 22)}%` }} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

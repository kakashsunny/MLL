import React, { useState } from 'react';
import { 
  Compass, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Sliders, 
  BookOpen, 
  Code, 
  Sparkles, 
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { ViewMode } from '../../types';

interface TutorialTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView: (view: ViewMode) => void;
}

interface TourStep {
  title: string;
  badge: string;
  icon: React.ElementType;
  targetView: ViewMode;
  description: string;
  highlights: string[];
  actionPrompt: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to NeuraForge ML Laboratory',
    badge: 'Overview • First Principles',
    icon: Compass,
    targetView: 'dashboard',
    description: 'NeuraForge is an empirical machine learning workbench. Here, you learn ML not by memorizing black-box code, but through physical geometric instruments, zero-copy vectorization, and Socratic mentorship.',
    highlights: [
      'Interactive geometric instruments for regression, classification, and clustering.',
      'Comprehensive curriculum covering Core ML, NumPy strides, Pandas wrangling, and Scikit-Learn pipelines.',
      'Active prediction REPL: test your intuition on code outputs before evaluating.'
    ],
    actionPrompt: 'Let’s explore the physical scientific instrument workbench.'
  },
  {
    title: 'The Physical Scientific ML Lab',
    badge: 'Instrument Workbench • Direct Caliper Manipulation',
    icon: Sliders,
    targetView: 'lab',
    description: 'The ML Lab is styled as a physical scientific instrument console. Rather than clicking through generic browser forms, you can directly grab regression lines, drag decision hyperplanes, and reposition cluster centroids with live loss galvanometer feedback.',
    highlights: [
      'Direct Caliper Dragging: Grab the regression line slope or intercept right on the canvas.',
      'Tactile Slide Potentiometers: Smooth vernier controls for learning rate (η), sample count (N), and noise variance (σ).',
      'Particle Dispenser: Click directly on the manifold to inject empirical data samples and watch the loss surface re-converge.'
    ],
    actionPrompt: 'Next, let’s inspect the multi-track curriculum.'
  },
  {
    title: 'NumPy, Pandas & Scikit-Learn Curriculum',
    badge: 'Curriculum • 4 Core Engineering Tracks',
    icon: BookOpen,
    targetView: 'course',
    description: 'Dive deep into production-grade data science. Switch between 4 tracks: Machine Learning Fundamentals, NumPy Ndarrays & Strides, Pandas Data Wrangling, and Scikit-Learn Leakage-Proof Pipelines.',
    highlights: [
      'NumPy: Memory strides, C vs Fortran order, broadcasting rules, and SVD decomposition.',
      'Pandas: Safe .loc indexing, missingness flags, median cohort imputation, and GroupBy aggregations.',
      'Scikit-Learn: BaseEstimator contracts, atomic ColumnTransformers, and nested cross-validation.'
    ],
    actionPrompt: 'Next, see how the Python REPL evaluates your intuition.'
  },
  {
    title: 'Predict-Then-Run Python Playground',
    badge: 'Active Recall • Interactive REPL',
    icon: Code,
    targetView: 'playground',
    description: 'Passive code reading builds an illusion of competence. The Python Playground forces active recall: you must predict what an array operation or pipeline will output before running the kernel.',
    highlights: [
      'Curated recipes covering self-attention, NumPy broadcasting, Pandas imputation, and Scikit-Learn pipelines.',
      'Prediction challenges with instant pedagogical explanations for incorrect mental models.',
      'AI Code Auditor offering beginner, intermediate, and expert feedback.'
    ],
    actionPrompt: 'Finally, discover your learner profile and badges.'
  },
  {
    title: 'Learner Profile, Socratic AI & Credentials',
    badge: 'Mastery • Socratic Forge AI',
    icon: Cpu,
    targetView: 'dashboard',
    description: 'Track your XP, study streaks, and earn prestigious credentials like "Vector Virtuoso" and "Pipeline Architect". Consult Forge AI whenever an equation or gradient derivation feels opaque.',
    highlights: [
      'Real-time Socratic AI tutor ready to explain edge cases and gradient derivations.',
      'Exportable learning transcripts to showcase your machine learning progress.',
      'You can restart this tutorial walkthrough anytime from the top bar or profile modal.'
    ],
    actionPrompt: 'You are ready to begin exploring NeuraForge!'
  }
];

export const TutorialTour: React.FC<TutorialTourProps> = ({
  isOpen,
  onClose,
  onNavigateView
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIdx];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      onNavigateView(TOUR_STEPS[nextIdx].targetView);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      onNavigateView(TOUR_STEPS[prevIdx].targetView);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="tutorial_tour_modal"
        className="w-full max-w-xl bg-[#FAF8F2] border border-[#E5E2D9] rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E2D9] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#111111] text-white">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-stone-400 font-bold tracking-widest">
                {currentStep.badge}
              </div>
              <div className="text-sm font-bold text-[#111111]">
                Orientation Walkthrough
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-[#1A42D9] bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
              {currentStepIdx + 1} / {TOUR_STEPS.length}
            </span>
            <button
              id="btn_close_tutorial"
              onClick={onClose}
              className="p-1 rounded-md text-stone-400 hover:text-[#111111] hover:bg-stone-100 transition-colors"
              title="Skip Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-[#111111] tracking-tight">
            {currentStep.title}
          </h2>

          <p className="text-sm text-stone-600 leading-relaxed font-sans">
            {currentStep.description}
          </p>

          <div className="p-4 rounded-lg bg-white border border-[#E5E2D9] space-y-2">
            <div className="text-[11px] font-mono uppercase text-stone-400 font-bold tracking-wider">
              Core Capabilities
            </div>
            <ul className="space-y-2 text-xs text-stone-700">
              {currentStep.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-xs font-mono text-stone-500 italic">
            → {currentStep.actionPrompt}
          </div>
        </div>

        {/* Progress Bar & Buttons */}
        <div className="px-6 py-4 border-t border-[#E5E2D9] bg-white flex items-center justify-between">
          <div className="flex gap-1.5 items-center">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentStepIdx(i);
                  onNavigateView(TOUR_STEPS[i].targetView);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStepIdx 
                    ? 'w-6 bg-[#1A42D9]' 
                    : i < currentStepIdx 
                    ? 'w-2 bg-stone-400' 
                    : 'w-2 bg-stone-200'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStepIdx > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-lg border border-[#E5E2D9] text-xs font-mono text-stone-600 hover:bg-stone-50 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-lg bg-[#111111] hover:bg-[#1A42D9] text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>{currentStepIdx === TOUR_STEPS.length - 1 ? 'Start Exploring' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

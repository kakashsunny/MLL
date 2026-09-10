import React, { useState, useMemo } from 'react';
import { ViewMode } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowRight, 
  FlaskConical, 
  RotateCcw,
  Sliders,
  Sparkles,
  ChevronRight,
  TrendingDown,
  Activity,
  Maximize2,
  LogIn,
  UserPlus,
  ShieldCheck,
  User,
  Menu,
  X,
  BookOpen,
  Terminal,
  Trophy,
  Layers,
  Award
} from 'lucide-react';

interface LandingPageProps {
  onSelectView?: (view: ViewMode) => void;
  onEnterPlatform?: (view?: ViewMode) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectView, onEnterPlatform }) => {
  const { user, profile, role, openAuthModal } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleSelect = (view: ViewMode) => {
    if (typeof onSelectView === 'function') {
      onSelectView(view);
    } else if (typeof onEnterPlatform === 'function') {
      onEnterPlatform(view);
    }
  };

  // =========================================================================
  // 1. THE FIRST WOW MOMENT: Interactive Draggable Decision Boundary
  // =========================================================================
  const [boundaryOffset, setBoundaryOffset] = useState<number>(0);
  const [boundarySlope, setBoundarySlope] = useState<number>(-0.85);
  const [isCurved, setIsCurved] = useState<boolean>(false);
  const [isDraggingBoundary, setIsDraggingBoundary] = useState<boolean>(false);

  // 18 Data points in 2D space (x: 0-100, y: 0-100)
  // Class 0 = Cobalt Blue (#1A42D9), Class 1 = Warm Amber (#D97706)
  const initialPoints = useMemo(() => [
    { id: 1, x: 18, y: 24, cls: 0 },
    { id: 2, x: 26, y: 35, cls: 0 },
    { id: 3, x: 32, y: 22, cls: 0 },
    { id: 4, x: 38, y: 42, cls: 0 },
    { id: 5, x: 22, y: 52, cls: 0 },
    { id: 6, x: 44, y: 32, cls: 0 },
    { id: 7, x: 30, y: 64, cls: 0 },
    { id: 8, x: 48, y: 56, cls: 0 },
    { id: 9, x: 14, y: 40, cls: 0 },
    { id: 10, x: 62, y: 58, cls: 1 },
    { id: 11, x: 74, y: 72, cls: 1 },
    { id: 12, x: 82, y: 54, cls: 1 },
    { id: 13, x: 68, y: 82, cls: 1 },
    { id: 14, x: 86, y: 76, cls: 1 },
    { id: 15, x: 58, y: 76, cls: 1 },
    { id: 16, x: 78, y: 38, cls: 1 },
    { id: 17, x: 66, y: 44, cls: 1 },
    { id: 18, x: 90, y: 62, cls: 1 },
  ], []);

  // Compute classification accuracy live based on boundary offset & slope
  const classificationResults = useMemo(() => {
    let correct = 0;
    const evaluated = initialPoints.map(p => {
      // Linear decision boundary: y - 50 = slope * (x - (50 + offset))
      // Predicted class 1 if point is above boundary, 0 if below
      const thresholdY = 50 + boundarySlope * (p.x - (50 + boundaryOffset)) + (isCurved ? Math.sin(p.x * 0.08) * 8 : 0);
      const predictedCls = p.y > thresholdY ? 1 : 0;
      const isCorrect = predictedCls === p.cls;
      if (isCorrect) correct++;
      return { ...p, predictedCls, isCorrect };
    });

    const accuracy = Number(((correct / initialPoints.length) * 100).toFixed(1));
    return { evaluated, correct, total: initialPoints.length, accuracy };
  }, [boundaryOffset, boundarySlope, isCurved, initialPoints]);

  // =========================================================================
  // 2. WATCH IT LEARN SECTION STATE: Gradient Descent, K-Means, Decision Tree
  // =========================================================================
  // Gradient descent simulation
  const [gdStep, setGdStep] = useState<number>(4);
  const gdPath = useMemo(() => [
    { x: 15, y: 20, loss: 0.842 },
    { x: 28, y: 38, loss: 0.518 },
    { x: 42, y: 56, loss: 0.284 },
    { x: 56, y: 68, loss: 0.142 },
    { x: 68, y: 76, loss: 0.065 },
    { x: 76, y: 82, loss: 0.024 },
    { x: 82, y: 85, loss: 0.012 },
  ], []);
  const currentGd = gdPath[Math.min(gdStep, gdPath.length - 1)];

  // K-Means iteration simulation
  const [kmeansIter, setKmeansIter] = useState<number>(2);
  const kmeansCentroids = useMemo(() => {
    if (kmeansIter === 1) {
      return [{ x: 30, y: 30 }, { x: 50, y: 50 }, { x: 70, y: 70 }];
    } else if (kmeansIter === 2) {
      return [{ x: 25, y: 35 }, { x: 48, y: 68 }, { x: 80, y: 45 }];
    } else {
      return [{ x: 22, y: 38 }, { x: 42, y: 75 }, { x: 82, y: 40 }];
    }
  }, [kmeansIter]);

  // Decision Tree active split
  const [activeSplitFeature, setActiveSplitFeature] = useState<'petal_length' | 'petal_width'>('petal_length');

  // =========================================================================
  // 3. BREAK THE MODEL EXPERIMENT STATE
  // =========================================================================
  type BreakMode = 'NONE' | 'NOISE' | 'REMOVE_FEATURES' | 'IMBALANCE' | 'OVERFIT' | 'LEAKAGE';
  const [activeBreakMode, setActiveBreakMode] = useState<BreakMode>('NOISE');

  const breakDetails = {
    NONE: {
      accuracy: 94.2,
      f1: 0.94,
      status: 'Nominal Baseline',
      color: 'text-stone-800',
      reason: 'Standard validation split with i.i.d. Gaussian features and clean labels.',
      warning: 'Model generalizes reliably.'
    },
    NOISE: {
      accuracy: 71.4,
      f1: 0.69,
      status: 'Signal-to-Noise Drop',
      color: 'text-amber-700',
      reason: 'Injected 35% Gaussian noise into primary feature vectors. Margin collapses as variance overwhelms decision boundary.',
      warning: 'Boundary oscillates; high test error.'
    },
    REMOVE_FEATURES: {
      accuracy: 62.8,
      f1: 0.58,
      status: 'Underfitting via Sparsity',
      color: 'text-amber-800',
      reason: 'Eliminated top 2 informative coefficients. Model is constrained to non-informative dimensions.',
      warning: 'High bias; unable to capture underlying distribution.'
    },
    IMBALANCE: {
      accuracy: 89.0,
      f1: 0.41,
      status: 'Accuracy Paradox',
      color: 'text-rose-700',
      reason: 'Class ratio shifted to 95:5. Accuracy appears deceptively high (89%) while minority class recall drops to 12%.',
      warning: 'Accuracy is misleading; F1 score collapsed to 0.41.'
    },
    OVERFIT: {
      accuracy: 53.6,
      f1: 0.51,
      status: 'Memorization Collapse',
      color: 'text-rose-800',
      reason: 'Expanded polynomial degree to 14 with zero regularization. Training loss = 0.000, test loss diverges.',
      warning: 'Zero train loss; catastrophic generalization failure.'
    },
    LEAKAGE: {
      accuracy: 99.8,
      f1: 0.99,
      status: 'Fatal Target Leakage',
      color: 'text-[#1A42D9]',
      reason: 'Target variable inadvertently encoded into feature X3 prior to train/test split. Perfect in test, useless in production.',
      warning: 'Appears perfect (99.8%); 0% useful in the real world.'
    }
  };

  return (
    <div id="editorial_landing" className="min-h-screen bg-[#F7F5EF] text-[#111111] selection:bg-[#1A42D9]/15 selection:text-[#1A42D9]">
      
      {/* =====================================================================
          1. CLEAN EDITORIAL NAVIGATION
      ===================================================================== */}
      <header className="sticky top-0 z-40 bg-[#F7F5EF]/95 backdrop-blur-md border-b border-[#E5E2D9] px-4 sm:px-6 lg:px-12 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Manifesto */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Mobile Hamburger Menu Toggle */}
            <button
              id="landing_mobile_menu_btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-[#E5E2D9] bg-white hover:bg-stone-50 text-stone-700 active:bg-stone-100 transition-colors cursor-pointer shadow-2xs"
              title={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <button 
              onClick={() => handleSelect('landing')}
              className="text-left group"
            >
              <span className="font-extrabold text-base tracking-tight uppercase text-[#111111] group-hover:text-[#1A42D9] transition-colors">
                NEURAFORGE
              </span>
              <span className="block text-[9px] font-mono tracking-widest text-stone-400 uppercase">
                Machine Learning Laboratory
              </span>
            </button>
            
            {/* Primary Editorial Nav Links (Desktop & Laptop) */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 pl-6 border-l border-[#E5E2D9] text-xs font-medium text-stone-600">
              <button 
                onClick={() => handleSelect('course')}
                className="hover:text-[#111111] transition-colors cursor-pointer"
              >
                Learn
              </button>
              <button 
                onClick={() => handleSelect('lab')}
                className="hover:text-[#111111] transition-colors cursor-pointer"
              >
                ML Lab
              </button>
              <button 
                onClick={() => handleSelect('projects')}
                className="hover:text-[#111111] transition-colors cursor-pointer"
              >
                Projects
              </button>
              <button 
                onClick={() => handleSelect('roadmap')}
                className="hover:text-[#111111] transition-colors cursor-pointer"
              >
                Roadmap
              </button>
              <button 
                onClick={() => handleSelect('quiz')}
                className="hover:text-[#111111] transition-colors cursor-pointer"
              >
                Challenges
              </button>
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <button
              onClick={() => handleSelect('tutor')}
              className="hidden sm:inline-flex text-xs font-mono text-stone-600 hover:text-[#1A42D9] transition-colors items-center gap-1.5 px-2 py-1 rounded hover:bg-stone-100"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A42D9]" />
              <span>Forge AI</span>
            </button>

            {user && !user.isAnonymous ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-50 text-[#1A42D9] border border-blue-200">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{role}</span>
                </span>
                <span className="text-xs font-mono font-medium text-stone-700 hidden lg:inline truncate max-w-[120px]">
                  {profile?.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </div>
            ) : (
              <button
                id="landing_auth_btn"
                onClick={() => openAuthModal('login')}
                className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-[#E5E2D9] bg-white hover:bg-stone-50 text-xs font-mono text-stone-800 font-semibold transition-colors cursor-pointer shadow-2xs hover:border-[#111111]"
                title="Sign In to NeuraForge"
              >
                Sign In
              </button>
            )}

            <button
              id="hero_enter_platform_btn"
              onClick={() => handleSelect('dashboard')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#111111] hover:bg-[#1A42D9] text-white text-xs font-semibold tracking-tight transition-all duration-150 inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-2xs"
            >
              <span className="hidden xs:inline">Enter Platform</span>
              <span className="xs:hidden">Enter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Collapsible Menu Drawer */}
        {isMobileMenuOpen && (
          <div 
            id="landing_mobile_menu_dropdown"
            className="md:hidden mt-3 pt-3 border-t border-[#E5E2D9] flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <div className="grid grid-cols-2 gap-1.5 pb-2">
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleSelect('course'); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E5E2D9] text-xs font-medium text-stone-700 hover:text-[#111111] hover:border-stone-400 text-left"
              >
                <BookOpen className="w-4 h-4 text-[#1A42D9]" />
                <span>Learn Curriculum</span>
              </button>
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleSelect('lab'); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E5E2D9] text-xs font-medium text-stone-700 hover:text-[#111111] hover:border-stone-400 text-left"
              >
                <FlaskConical className="w-4 h-4 text-[#1A42D9]" />
                <span>ML Lab</span>
              </button>
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleSelect('projects'); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E5E2D9] text-xs font-medium text-stone-700 hover:text-[#111111] hover:border-stone-400 text-left"
              >
                <Layers className="w-4 h-4 text-[#1A42D9]" />
                <span>Projects</span>
              </button>
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleSelect('quiz'); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E5E2D9] text-xs font-medium text-stone-700 hover:text-[#111111] hover:border-stone-400 text-left"
              >
                <Trophy className="w-4 h-4 text-[#1A42D9]" />
                <span>Challenges</span>
              </button>
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleSelect('roadmap'); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E5E2D9] text-xs font-medium text-stone-700 hover:text-[#111111] hover:border-stone-400 text-left"
              >
                <Activity className="w-4 h-4 text-[#1A42D9]" />
                <span>Roadmap</span>
              </button>
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleSelect('tutor'); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E5E2D9] text-xs font-medium text-stone-700 hover:text-[#111111] hover:border-stone-400 text-left"
              >
                <Sparkles className="w-4 h-4 text-[#1A42D9]" />
                <span>Forge AI</span>
              </button>
            </div>
            
            <div className="pt-2 border-t border-[#E5E2D9] flex items-center justify-between">
              <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
                Full-Stack Machine Learning
              </span>
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleSelect('dashboard'); }}
                className="text-xs font-semibold text-[#1A42D9] hover:underline flex items-center gap-1"
              >
                <span>Go to Workspaces</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================================
          2. HOMEPAGE HERO WITH THE FIRST WOW MOMENT
      ===================================================================== */}
      <section className="relative px-4 sm:px-6 lg:px-12 pt-10 sm:pt-14 lg:pt-16 pb-16 sm:pb-20 max-w-7xl mx-auto border-b border-[#E5E2D9]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Hero Editorial Statement */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#F0EDE4] border border-[#E5E2D9] text-xs font-mono text-stone-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A42D9]" />
              <span>Interactive Machine Learning Studio</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111111] leading-[1.08]">
                MACHINE LEARNING<br />
                SHOULDN’T FEEL<br />
                LIKE A TEXTBOOK.
              </h1>
              <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed pt-2 max-w-xl">
                Learn by seeing, experimenting, coding, and building. From geometric intuition to gradient descent and neural architectures.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
              <button
                id="hero_start_learning_btn"
                onClick={() => handleSelect('course')}
                className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-lg bg-[#111111] hover:bg-[#1A42D9] text-white text-xs sm:text-sm font-bold tracking-tight transition-all duration-150 inline-flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>START LEARNING</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero_explore_lab_btn"
                onClick={() => handleSelect('lab')}
                className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-lg bg-white hover:bg-stone-50 border border-[#E5E2D9] hover:border-[#111111] text-[#111111] text-xs sm:text-sm font-semibold tracking-tight transition-all duration-150 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>EXPLORE ML LAB</span>
                <FlaskConical className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            {/* Footnote specs - clean and aligned */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-stone-500 font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#111111]">Interactive</span>
                <span>Visual Intuition</span>
              </div>
              <div className="h-3 w-px bg-[#E5E2D9]" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#111111]">Pyodide</span>
                <span>In-Browser Kernel</span>
              </div>
              <div className="h-3 w-px bg-[#E5E2D9]" />
              <div>Zero installation required</div>
            </div>
          </div>

          {/* Right Hero Centerpiece: THE FIRST WOW MOMENT (Interactive Decision Boundary) */}
          <div className="lg:col-span-6">
            <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rounded-none p-6 sm:p-8">
              {/* Header inside visualization */}
              <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#1A42D9] border border-[#111111]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                      Linear Decision Boundary
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-stone-500 mt-0.5">
                    Binary classification: Class A vs Class B in ℝ² space
                  </p>
                </div>
                
                {/* Live accuracy callout */}
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
                    Classification Accuracy
                  </span>
                  <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#111111]">
                    {classificationResults.accuracy}%
                  </div>
                </div>
              </div>

              {/* The Interactive Decision Boundary Canvas */}
              <div 
                className="relative w-full h-64 sm:h-72 bg-[#FAF8F2] border-[2px] border-[#111111] rounded-none overflow-hidden select-none cursor-ew-resize touch-none"
                onMouseDown={() => setIsDraggingBoundary(true)}
                onMouseUp={() => setIsDraggingBoundary(false)}
                onMouseLeave={() => setIsDraggingBoundary(false)}
                onMouseMove={(e) => {
                  if (!isDraggingBoundary) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
                  const newOffset = Math.round((relativeX - 50) * 0.8);
                  setBoundaryOffset(Math.max(-30, Math.min(30, newOffset)));
                }}
                onTouchStart={() => setIsDraggingBoundary(true)}
                onTouchEnd={() => setIsDraggingBoundary(false)}
                onTouchMove={(e) => {
                  if (!isDraggingBoundary || !e.touches[0]) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeX = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
                  const newOffset = Math.round((relativeX - 50) * 0.8);
                  setBoundaryOffset(Math.max(-30, Math.min(30, newOffset)));
                }}
              >
                {/* Subtle paper grid */}
                <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    {/* Class A (Blue) and Class B (Gold) region fills */}
                    <linearGradient id="classA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1A42D9" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#1A42D9" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="classB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D97706" stopOpacity="0.02" />
                      <stop offset="100%" stopColor="#D97706" stopOpacity="0.08" />
                    </linearGradient>
                  </defs>

                  {/* Shaded decision half-spaces */}
                  {/* Top-left region */}
                  <polygon 
                    points={`0,0 100,0 100,${50 + boundarySlope * (100 - (50 + boundaryOffset))} 0,${50 + boundarySlope * (0 - (50 + boundaryOffset))}`}
                    fill="url(#classA)" 
                  />
                  {/* Bottom-right region */}
                  <polygon 
                    points={`0,100 100,100 100,${50 + boundarySlope * (100 - (50 + boundaryOffset))} 0,${50 + boundarySlope * (0 - (50 + boundaryOffset))}`}
                    fill="url(#classB)" 
                  />

                  {/* Decision boundary line */}
                  <line 
                    x1="0"
                    y1={50 + boundarySlope * (0 - (50 + boundaryOffset))}
                    x2="100"
                    y2={50 + boundarySlope * (100 - (50 + boundaryOffset))}
                    stroke="#111111"
                    strokeWidth="1.6"
                    strokeDasharray={isCurved ? '3,3' : 'none'}
                  />

                  {/* Data Points */}
                  {classificationResults.evaluated.map(pt => {
                    const isA = pt.cls === 0;
                    return (
                      <g key={pt.id}>
                        {/* Halos for misclassified items */}
                        {!pt.isCorrect && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="5"
                            fill="none"
                            stroke="#EF4444"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                            className="animate-pulse"
                          />
                        )}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isA ? "3" : "3.2"}
                          fill={isA ? "#1A42D9" : "#D97706"}
                          stroke="#FFFFFF"
                          strokeWidth="1.2"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Instruction pill: Drag the boundary */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-[#E5E2D9] px-2.5 py-1 rounded text-[11px] font-mono text-stone-700 shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1A42D9] animate-ping" />
                  <span>Drag the boundary or use the slider below</span>
                </div>

                {/* Class legend inside canvas */}
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm border border-[#E5E2D9] px-2.5 py-1 rounded text-[10px] font-mono text-stone-600 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#1A42D9]" />
                    <span>Class 0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                    <span>Class 1</span>
                  </div>
                </div>
              </div>

              {/* Live interactive controls */}
              <div className="mt-4 pt-3 border-t border-[#E5E2D9] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-stone-500">Decision Threshold ($w \cdot x + b = 0$):</span>
                  <span className="font-mono font-bold text-[#111111]">
                    offset = {boundaryOffset > 0 ? `+${boundaryOffset}` : boundaryOffset}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-mono text-stone-400">-30</span>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    value={boundaryOffset}
                    onChange={(e) => setBoundaryOffset(Number(e.target.value))}
                    className="flex-1 accent-[#1A42D9] cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-stone-400">+30</span>
                </div>

                {/* Fine tuning slope and reset */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBoundarySlope(prev => prev === -0.85 ? -0.45 : -0.85)}
                      className="px-2.5 py-1 rounded text-[11px] font-mono border border-[#E5E2D9] hover:border-[#111111] text-stone-700 bg-white"
                    >
                      Slope: {boundarySlope}
                    </button>
                    <button
                      onClick={() => setIsCurved(prev => !prev)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono border ${
                        isCurved 
                          ? 'border-[#1A42D9] text-[#1A42D9] bg-[#1A42D9]/5 font-bold' 
                          : 'border-[#E5E2D9] text-stone-700 bg-white'
                      }`}
                    >
                      {isCurved ? 'Kernel: Polynomial' : 'Kernel: Linear'}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setBoundaryOffset(0);
                      setBoundarySlope(-0.85);
                      setIsCurved(false);
                    }}
                    className="flex items-center gap-1 text-[11px] font-mono text-stone-500 hover:text-[#111111]"
                    title="Reset boundary"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Real-time metrics breakdown */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t-[2px] border-[#111111] text-center">
                <div className="bg-[#FAF8F2] p-3 rounded-none border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">Classified</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-[#111111]">
                    {classificationResults.correct} / {classificationResults.total}
                  </span>
                </div>
                <div className="bg-[#FAF8F2] p-3 rounded-none border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">Misclassified</span>
                  <span className={`text-sm sm:text-base font-bold font-mono ${
                    classificationResults.total - classificationResults.correct > 0 ? 'text-rose-700' : 'text-stone-700'
                  }`}>
                    {classificationResults.total - classificationResults.correct}
                  </span>
                </div>
                <div className="bg-[#FAF8F2] p-3 rounded-none border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">Empirical Loss ℒ</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-[#1A42D9]">
                    {(1 - classificationResults.accuracy / 100).toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. "DON'T JUST LEARN ML. WATCH IT LEARN." SECTION
      ===================================================================== */}
      <section className="px-6 lg:px-12 py-24 max-w-7xl mx-auto border-b border-[#E5E2D9]">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#1A42D9] block mb-2">
            The Observation Engine
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111111] leading-tight">
            DON’T JUST LEARN ML.<br />
            WATCH IT LEARN.
          </h2>
          <p className="text-stone-600 text-base sm:text-lg mt-4 leading-relaxed font-normal">
            Every core algorithm comes with an interactive, physicalized view. Watch weights converge, centroids migrate, and decision planes slice vector space in real time.
          </p>
        </div>

        {/* Three Large Visual Experiences: Gradient Descent, K-Means, Decision Trees */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Experience 1: GRADIENT DESCENT */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] rounded-none p-6 sm:p-8 flex flex-col justify-between transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_0px_#111111]">
            <div>
              <div className="flex items-center justify-between mb-4 border-b-[2px] border-[#111111] pb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600">
                  01 / Optimization
                </span>
                <span className="text-xs font-mono text-[#1A42D9] font-bold bg-[#1A42D9]/10 px-2 py-0.5 border border-[#1A42D9]">
                  Step {gdStep + 1} / {gdPath.length}
                </span>
              </div>

              <h3 className="text-xl font-black text-[#111111] mb-2 tracking-tight">
                GRADIENT DESCENT
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-5">
                Observe parameter ball roll down the multidimensional error landscape ∇ℒ(θ). Adjust the learning rate to see overshoot vs convergence.
              </p>

              {/* Visual Simulation Canvas */}
              <div className="h-44 w-full bg-[#FAF8F2] border-[2px] border-[#111111] rounded-none p-2 relative overflow-hidden flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Contour rings representing loss surface */}
                  <ellipse cx="85" cy="85" rx="75" ry="50" fill="none" stroke="#E5E2D9" strokeWidth="1" />
                  <ellipse cx="85" cy="85" rx="55" ry="36" fill="none" stroke="#E5E2D9" strokeWidth="1" />
                  <ellipse cx="85" cy="85" rx="35" ry="22" fill="none" stroke="#E5E2D9" strokeWidth="1" />
                  <ellipse cx="85" cy="85" rx="15" ry="9" fill="none" stroke="#E5E2D9" strokeWidth="1.2" />
                  
                  {/* Optimal minimum point */}
                  <circle cx="85" cy="85" r="2.5" fill="#111111" />
                  <text x="76" y="98" fontSize="5" fontFamily="monospace" fill="#71717A">min(θ)</text>

                  {/* Gradient trajectory line */}
                  <polyline
                    points={gdPath.slice(0, gdStep + 1).map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#1A42D9"
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                  />

                  {/* Gradient Steps Markers */}
                  {gdPath.slice(0, gdStep + 1).map((pt, i) => (
                    <circle
                      key={i}
                      cx={pt.x}
                      cy={pt.y}
                      r={i === gdStep ? "3.5" : "2"}
                      fill={i === gdStep ? "#1A42D9" : "#FFFFFF"}
                      stroke="#1A42D9"
                      strokeWidth="1.5"
                    />
                  ))}
                </svg>

                {/* Live loss indicator */}
                <div className="absolute top-2 right-2 bg-white border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] px-2 py-0.5 rounded-none text-[10px] font-mono text-stone-800">
                  Loss: <span className="font-bold text-[#1A42D9]">{currentGd.loss}</span>
                </div>
              </div>

              {/* Step Controls */}
              <div className="flex items-center justify-between mt-4 text-xs font-mono">
                <button
                  onClick={() => setGdStep(prev => (prev + 1) % gdPath.length)}
                  className="px-3 py-1.5 rounded-none bg-white hover:bg-stone-50 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] text-stone-900 font-bold active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  Step Forward (η = 0.05)
                </button>
                <button
                  onClick={() => setGdStep(0)}
                  className="text-stone-500 hover:text-[#111111] font-bold"
                >
                  Reset Ball
                </button>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t-[2px] border-[#111111]">
              <button
                onClick={() => handleSelect('lab')}
                className="w-full py-3 rounded-none bg-[#111111] hover:bg-[#1A42D9] text-white text-xs font-bold font-mono tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <span>OPEN LAB →</span>
              </button>
            </div>
          </div>

          {/* Experience 2: K-MEANS CLUSTERING */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] rounded-none p-6 sm:p-8 flex flex-col justify-between transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_0px_#111111]">
            <div>
              <div className="flex items-center justify-between mb-4 border-b-[2px] border-[#111111] pb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600">
                  02 / Unsupervised
                </span>
                <span className="text-xs font-mono text-[#D97706] font-bold bg-amber-50 px-2 py-0.5 border border-[#D97706]">
                  k = 3 Clusters
                </span>
              </div>

              <h3 className="text-xl font-black text-[#111111] mb-2 tracking-tight">
                K-MEANS CLUSTERING
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-5">
                Watch centroids migrate toward their mathematical center of mass. Toggle iterations to watch cluster boundaries repartition live.
              </p>

              {/* Visual Simulation Canvas */}
              <div className="h-44 w-full bg-[#FAF8F2] border-[2px] border-[#111111] rounded-none p-2 relative overflow-hidden flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Cluster A Points (Blue) */}
                  {[
                    { x: 18, y: 32 }, { x: 22, y: 44 }, { x: 26, y: 36 }, { x: 16, y: 48 }, { x: 28, y: 40 }
                  ].map((p, idx) => (
                    <circle key={`ca-${idx}`} cx={p.x} cy={p.y} r="2.5" fill="#1A42D9" opacity="0.8" />
                  ))}

                  {/* Cluster B Points (Gold) */}
                  {[
                    { x: 40, y: 72 }, { x: 44, y: 82 }, { x: 48, y: 70 }, { x: 38, y: 80 }, { x: 42, y: 64 }
                  ].map((p, idx) => (
                    <circle key={`cb-${idx}`} cx={p.x} cy={p.y} r="2.5" fill="#D97706" opacity="0.8" />
                  ))}

                  {/* Cluster C Points (Dark) */}
                  {[
                    { x: 80, y: 36 }, { x: 84, y: 46 }, { x: 76, y: 42 }, { x: 88, y: 38 }, { x: 82, y: 48 }
                  ].map((p, idx) => (
                    <circle key={`cc-${idx}`} cx={p.x} cy={p.y} r="2.5" fill="#111111" opacity="0.8" />
                  ))}

                  {/* Dynamic Centroids (Crosshairs) */}
                  {kmeansCentroids.map((c, i) => (
                    <g key={`cent-${i}`}>
                      <circle cx={c.x} cy={c.y} r="5" fill="none" stroke={i === 0 ? "#1A42D9" : i === 1 ? "#D97706" : "#111111"} strokeWidth="1.2" />
                      <line x1={c.x - 3} y1={c.y} x2={c.x + 3} y2={c.y} stroke="#111111" strokeWidth="1" />
                      <line x1={c.x} y1={c.y - 3} x2={c.x + 3} y2={c.y + 3} stroke="#111111" strokeWidth="1" />
                    </g>
                  ))}
                </svg>

                {/* Centroid status */}
                <div className="absolute top-2 right-2 bg-white border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] px-2 py-0.5 rounded-none text-[10px] font-mono text-stone-800">
                  Iter {kmeansIter} • Δ &lt; 0.002
                </div>
              </div>

              {/* Step Controls */}
              <div className="flex items-center justify-between mt-4 text-xs font-mono">
                <button
                  onClick={() => setKmeansIter(prev => (prev % 3) + 1)}
                  className="px-3 py-1.5 rounded-none bg-white hover:bg-stone-50 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] text-stone-900 font-bold active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  Step Iteration ({kmeansIter}/3)
                </button>
                <button
                  onClick={() => setKmeansIter(1)}
                  className="text-stone-500 hover:text-[#111111] font-bold"
                >
                  Reset Centroids
                </button>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t-[2px] border-[#111111]">
              <button
                onClick={() => handleSelect('lab')}
                className="w-full py-3 rounded-none bg-[#111111] hover:bg-[#1A42D9] text-white text-xs font-bold font-mono tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <span>OPEN LAB →</span>
              </button>
            </div>
          </div>

          {/* Experience 3: DECISION TREES */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] rounded-none p-6 sm:p-8 flex flex-col justify-between transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_0px_#111111]">
            <div>
              <div className="flex items-center justify-between mb-4 border-b-[2px] border-[#111111] pb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600">
                  03 / Symbolic
                </span>
                <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 border border-emerald-700">
                  Gini: 0.12
                </span>
              </div>

              <h3 className="text-xl font-black text-[#111111] mb-2 tracking-tight">
                DECISION TREES
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-5">
                Understand how feature thresholds recursively partition state space. Compare Information Gain vs Gini Impurity at each branch split.
              </p>

              {/* Visual Simulation Canvas */}
              <div className="h-44 w-full bg-[#FAF8F2] border-[2px] border-[#111111] rounded-none p-3 relative overflow-hidden flex flex-col justify-between">
                {/* Visual Tree Node Hierarchy */}
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-white border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] px-2.5 py-1 rounded-none text-[10px] font-mono font-bold text-[#111111]">
                    [ {activeSplitFeature} &lt; 2.45 cm ]
                  </div>
                  <div className="flex justify-between w-40 text-[9px] font-mono text-stone-500 font-bold">
                    <span>True ↙</span>
                    <span>↘ False</span>
                  </div>
                  <div className="flex justify-between w-44 gap-2">
                    <div className="bg-white border-[2px] border-[#111111] p-1.5 rounded-none text-[9px] font-mono text-center flex-1 shadow-[1px_1px_0px_0px_#111111]">
                      <span className="text-[#1A42D9] font-bold block">Setosa (50/50)</span>
                      <span className="text-stone-500">Gini = 0.00</span>
                    </div>
                    <div className="bg-white border-[2px] border-[#111111] p-1.5 rounded-none text-[9px] font-mono text-center flex-1 shadow-[1px_1px_0px_0px_#111111]">
                      <span className="text-[#D97706] font-bold block">Versicolor (48/54)</span>
                      <span className="text-stone-500">Gini = 0.16</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-stone-600 flex justify-between items-center border-t-[2px] border-[#111111] pt-2">
                  <span>Information Gain: <strong className="text-[#111111]">+0.48 bits</strong></span>
                  <span className="text-emerald-800 font-bold">Pure Leaf Node</span>
                </div>
              </div>

              {/* Step Controls */}
              <div className="flex items-center justify-between mt-4 text-xs font-mono">
                <button
                  onClick={() => setActiveSplitFeature(prev => prev === 'petal_length' ? 'petal_width' : 'petal_length')}
                  className="px-3 py-1.5 rounded-none bg-white hover:bg-stone-50 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] text-stone-900 font-bold active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  Split: {activeSplitFeature}
                </button>
                <span className="text-[11px] font-mono text-stone-500 font-bold">Max Depth: 3</span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t-[2px] border-[#111111]">
              <button
                onClick={() => handleSelect('lab')}
                className="w-full py-3 rounded-none bg-[#111111] hover:bg-[#1A42D9] text-white text-xs font-bold font-mono tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <span>OPEN LAB →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. "BREAK THE MODEL" EXPERIMENT SECTION
      ===================================================================== */}
      <section className="px-6 lg:px-12 py-24 max-w-7xl mx-auto border-b border-[#E5E2D9]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Narrative */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-700 block">
              Stress Testing Lab
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111] leading-tight">
              BREAK THE MODEL.
            </h2>
            <p className="text-stone-600 text-base leading-relaxed">
              Machine learning models don’t crash with stack traces. They fail silently—hallucinating confidence, overfitting noise, or falling into the accuracy paradox.
            </p>
            <p className="text-stone-600 text-sm leading-relaxed">
              We teach you how to stress-test architectures until they crack, so you know how to build production-grade systems that withstand real-world chaos.
            </p>

            {/* Stress Triggers Menu */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-bold block mb-2">
                Select Stress Condition:
              </span>
              {(['NOISE', 'REMOVE_FEATURES', 'IMBALANCE', 'OVERFIT', 'LEAKAGE'] as BreakMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setActiveBreakMode(mode)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-none text-xs font-mono transition-all text-left ${
                    activeBreakMode === mode
                      ? 'bg-white border-[2px] border-[#111111] font-bold text-[#111111] shadow-[3px_3px_0px_0px_#111111] -translate-x-0.5 -translate-y-0.5'
                      : 'bg-[#FAF8F2] hover:bg-white border-[2px] border-[#111111]/30 hover:border-[#111111] text-stone-700'
                  }`}
                >
                  <span className="uppercase font-bold">
                    {mode.replace('_', ' ')}
                  </span>
                  <span className={`text-[11px] font-bold font-mono ${
                    activeBreakMode === mode ? 'text-[#1A42D9]' : 'text-stone-500'
                  }`}>
                    {breakDetails[mode].accuracy}% Acc
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Live Degradation Dashboard */}
          <div className="lg:col-span-7">
            <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rounded-none p-6 sm:p-8">
              <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-bold block">
                    Diagnostic Output
                  </span>
                  <div className="text-xl font-black text-[#111111] tracking-tight">
                    {breakDetails[activeBreakMode].status}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-bold block">
                    Degraded Accuracy
                  </span>
                  <div className={`text-3xl sm:text-4xl font-black font-mono ${breakDetails[activeBreakMode].color}`}>
                    {breakDetails[activeBreakMode].accuracy}%
                  </div>
                </div>
              </div>

              {/* Degradation Progression Ribbon */}
              <div className="mb-6 p-4 rounded-none bg-[#FAF8F2] border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
                <div className="flex items-center justify-between text-xs font-mono text-stone-600 mb-2 font-semibold">
                  <span>Baseline: 94.2%</span>
                  <span>→ Stress Applied</span>
                  <span className="font-bold text-[#111111]">Current: {breakDetails[activeBreakMode].accuracy}%</span>
                </div>
                {/* Visual bar */}
                <div className="h-3 w-full bg-white border-[2px] border-[#111111] rounded-none overflow-hidden">
                  <div 
                    className="h-full bg-[#111111] transition-all duration-300"
                    style={{ width: `${breakDetails[activeBreakMode].accuracy}%` }}
                  />
                </div>
              </div>

              {/* "WHY DID IT FAIL?" Editorial Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                  <span>WHY DID IT FAIL?</span>
                </div>
                
                <p className="text-sm text-stone-800 leading-relaxed bg-[#FAF8F2] p-4 rounded-none border-[2px] border-[#111111]">
                  {breakDetails[activeBreakMode].reason}
                </p>

                <div className="p-3 bg-amber-50 border-[2px] border-amber-600 rounded-none text-xs text-amber-950 font-mono">
                  <strong>Warning:</strong> {breakDetails[activeBreakMode].warning}
                </div>
              </div>

              {/* Action */}
              <div className="mt-6 pt-5 border-t-[2px] border-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-stone-600 font-mono">
                  Full experiment available in Lab
                </span>
                <button
                  onClick={() => handleSelect('experiments')}
                  className="px-5 py-2.5 rounded-none bg-[#111111] hover:bg-[#1A42D9] text-white text-xs font-mono font-bold tracking-tight transition-all inline-flex items-center justify-center gap-2 border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  <span>ENTER EXPERIMENT MODE →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. THE 6-STEP EDITORIAL LEARNING PARADIGM
      ===================================================================== */}
      <section className="px-6 lg:px-12 py-24 max-w-7xl mx-auto border-b border-[#E5E2D9]">
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-stone-500 block mb-2">
            Pedagogy
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            SIX STAGES OF REAL UNDERSTANDING.
          </h2>
          <p className="text-stone-600 text-base mt-3 leading-relaxed">
            No skip steps. Every topic moves from perceptual intuition to mathematical rigor, verified with executable code.
          </p>
        </div>

        {/* 6 Stage Open Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Intuition',
              desc: 'Physical analogies and geometric reasoning before mathematical notation is introduced.',
              metric: 'Spatial mental model'
            },
            {
              step: '02',
              title: 'Visualization',
              desc: 'Live interactive canvases where you manipulate hyperparameters and watch surfaces deform.',
              metric: 'Real-time feedback'
            },
            {
              step: '03',
              title: 'Mathematics',
              desc: 'Vector notation, cost functions, gradients, and proofs presented with clean notation and steps.',
              metric: 'First principles'
            },
            {
              step: '04',
              title: 'Code',
              desc: 'Implement vectorized algorithms from scratch in NumPy, then standard Scikit-Learn / PyTorch.',
              metric: 'Zero-boilerplate Pyodide'
            },
            {
              step: '05',
              title: 'Experiment',
              desc: 'Break the model on purpose: inject noise, test out-of-distribution, and diagnose bias-variance.',
              metric: 'Stress testing'
            },
            {
              step: '06',
              title: 'Challenge',
              desc: 'FAANG-style technical questions, concept checkpoints, and portfolio project milestones.',
              metric: 'Industry ready'
            }
          ].map((item) => (
            <div 
              key={item.step}
              className="bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111] p-6 rounded-none space-y-3 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#111111] transition-all"
            >
              <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-2.5">
                <span className="text-xs font-mono font-bold text-stone-500">
                  STAGE {item.step}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-none bg-[#FAF8F2] text-stone-800 border-[2px] border-[#111111]">
                  {item.metric}
                </span>
              </div>
              <h3 className="text-lg font-black text-[#111111] tracking-tight">
                {item.title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          6. EDITORIAL TESTIMONIAL & FINAL CALL TO ACTION
      ===================================================================== */}
      <section className="px-6 lg:px-12 py-24 max-w-4xl mx-auto text-center">
        <blockquote className="text-2xl sm:text-3xl font-serif text-[#111111] leading-snug italic mb-6">
          “NeuraForge does what no textbook or video course has ever managed: it makes high-dimensional vector spaces, gradient surfaces, and decision boundaries tangible under your fingertips.”
        </blockquote>
        <div className="text-sm font-bold text-[#111111]">Dr. Elena Rostova</div>
        <div className="text-xs text-stone-500 font-mono mt-0.5">
          Senior AI Research Scientist • Ex-DeepMind / Stanford AI Lab
        </div>

        {/* Final CTA Box - Brutalist Card */}
        <div className="mt-16 p-8 sm:p-12 bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rounded-none">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#1A42D9] block mb-2">
            First Principles Machine Learning
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-[#111111] mb-3 tracking-tight">
            Ready to understand Machine Learning from first principles?
          </h3>
          <p className="text-stone-600 text-sm mb-8 max-w-lg mx-auto leading-relaxed">
            Interactive curriculum, visual experimentation lab, and intelligent Socratic feedback. No hand-waving abstractions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="footer_start_learning_btn"
              onClick={() => handleSelect('course')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-none bg-[#111111] hover:bg-[#1A42D9] text-white text-xs font-bold font-mono tracking-wider uppercase transition-all inline-flex items-center justify-center gap-2 border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <span>START LEARNING →</span>
            </button>
            <button
              onClick={() => handleSelect('lab')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-none bg-white hover:bg-stone-50 border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] text-[#111111] text-xs font-bold font-mono tracking-wider uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <span>ENTER THE LAB</span>
            </button>
          </div>
        </div>
      </section>

      {/* Brutalist Responsive Footer for Mobile, Tablet, Laptop, and PC */}
      <footer className="border-t-[3px] border-[#111111] bg-[#FAF8F2] text-xs font-mono text-stone-700">
        {/* Top Status & Specs Strip */}
        <div className="border-b-[2px] border-[#111111] bg-white py-4 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-[11px]">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-emerald-500 border border-[#111111]" />
              <span className="font-bold text-[#111111]">LOCAL WASM RUNTIME:</span>
              <span className="text-stone-600">Pyodide 0.25 • 0ms Server Latency</span>
            </div>
            <div className="flex items-center gap-4 text-stone-500 font-medium">
              <span>IEEE 754 FLOAT64</span>
              <span>•</span>
              <span>OFFLINE FIRST</span>
              <span>•</span>
              <span>CLIENT-SIDE PERSISTENCE</span>
            </div>
          </div>
        </div>

        {/* Main Footer Multi-Column Grid */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
            {/* Col 1: Brand & Philosophy */}
            <div className="sm:col-span-2 md:col-span-3 lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#111111] border border-[#111111]" />
                <span className="text-sm font-black tracking-tight text-[#111111]">
                  NEURAFORGE LABORATORY
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed max-w-sm">
                A rigorous, first-principles learning platform engineered to build genuine mathematical intuition and architectural fluency in machine learning.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
                <span className="w-2 h-2 bg-[#1A42D9]" />
                <span className="text-[10px] font-bold text-[#111111] uppercase tracking-wider">
                  v2.4.0 Engine Standard
                </span>
              </div>
            </div>

            {/* Col 2: Curriculum Tracks */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#111111] border-b-[2px] border-[#111111] pb-1.5">
                Curriculum
              </h4>
              <ul className="space-y-2 text-stone-600">
                <li>
                  <button 
                    onClick={() => handleSelect('course')} 
                    className="hover:text-[#111111] hover:underline text-left py-0.5 min-h-[36px] sm:min-h-0 flex items-center"
                  >
                    Foundations & Calculus
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleSelect('course')} 
                    className="hover:text-[#111111] hover:underline text-left py-0.5 min-h-[36px] sm:min-h-0 flex items-center"
                  >
                    Supervised Learning
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleSelect('course')} 
                    className="hover:text-[#111111] hover:underline text-left py-0.5 min-h-[36px] sm:min-h-0 flex items-center"
                  >
                    Neural Architectures
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleSelect('roadmap')} 
                    className="hover:text-[#111111] hover:underline text-left py-0.5 min-h-[36px] sm:min-h-0 flex items-center"
                  >
                    Full Learning Roadmap
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Visual Simulations */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#111111] border-b-[2px] border-[#111111] pb-1.5">
                Interactive Labs
              </h4>
              <ul className="space-y-2 text-stone-600">
                <li>
                  <button 
                    onClick={() => handleSelect('lab')} 
                    className="hover:text-[#111111] hover:underline text-left py-0.5 min-h-[36px] sm:min-h-0 flex items-center"
                  >
                    Gradient Descent 3D
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleSelect('lab')} 
                    className="hover:text-[#111111] hover:underline text-left py-0.5 min-h-[36px] sm:min-h-0 flex items-center"
                  >
                    K-Means Clustering
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleSelect('lab')} 
                    className="hover:text-[#111111] hover:underline text-left py-0.5 min-h-[36px] sm:min-h-0 flex items-center"
                  >
                    Decision Boundary Canvas
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleSelect('experiments')} 
                    className="hover:text-[#111111] hover:underline text-left py-0.5 min-h-[36px] sm:min-h-0 flex items-center"
                  >
                    Stress Testing & Bias
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Platform Resources */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#111111] border-b-[2px] border-[#111111] pb-1.5">
                Knowledge Base
              </h4>
              <ul className="space-y-2 text-stone-600">
                <li>
                  <button 
                    onClick={() => handleSelect('glossary')} 
                    className="hover:text-[#111111] hover:underline text-left py-0.5 min-h-[36px] sm:min-h-0 flex items-center"
                  >
                    Mathematical Glossary
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleSelect('profile')} 
                    className="hover:text-[#111111] hover:underline text-left py-0.5 min-h-[36px] sm:min-h-0 flex items-center"
                  >
                    Mastery & Progress
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleSelect('dashboard')} 
                    className="hover:text-[#111111] hover:underline text-left py-0.5 min-h-[36px] sm:min-h-0 flex items-center"
                  >
                    Student Dashboard
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright, Device Adaptability, and Credits */}
          <div className="mt-12 pt-8 border-t-[2px] border-[#111111] flex flex-col md:flex-row items-center justify-between gap-4 text-stone-500">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-bold text-[#111111]">© {new Date().getFullYear()} NEURAFORGE LABORATORY</span>
              <span>—</span>
              <span>All educational models run client-side</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
              <span className="text-stone-400">OPTIMIZED FOR: MOBILE • TABLET • LAPTOP • WORKSTATION</span>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-2.5 py-1 bg-white border border-[#111111] text-[#111111] font-bold hover:bg-[#111111] hover:text-white transition-colors"
              >
                ↑ TOP
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Play, 
  RotateCcw, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  Layers, 
  BarChart2, 
  Lightbulb,
  Zap,
  Flame,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface StressTestCase {
  id: string;
  algorithm: string;
  scenarioTitle: string;
  pathology: string;
  symptom: string;
  rootCause: string;
  productionCure: string;
  curves: {
    label: string;
    points: number[];
    isBroken: boolean;
    lossVal: string;
  }[];
}

const STRESS_TESTS: StressTestCase[] = [
  {
    id: 'ols_collinear',
    algorithm: 'Ordinary Least Squares (OLS)',
    scenarioTitle: 'Collinear Features & Singular Inversion',
    pathology: 'Feeding perfectly collinear columns (e.g., Feature 2 = 2.0 × Feature 1) into normal equations.',
    symptom: 'LinearAlgebraError: Singular matrix. Determinant |XᵀX| = 0. Weights explode to ±10¹⁶.',
    rootCause: 'The matrix XᵀX lacks full rank (rank deficiency). The feature space collapses into a lower-dimensional subspace where infinitely many hyperplanes achieve identical training loss.',
    productionCure: 'Apply L2 Regularization (Ridge Regression: (XᵀX + λI)⁻¹Xᵀy) to condition the eigenvalues, or perform PCA dimensionality reduction.',
    curves: [
      { label: 'Normal Features (Conditioned)', points: [2.5, 1.4, 0.8, 0.4, 0.2, 0.15], isBroken: false, lossVal: '0.15' },
      { label: 'Collinear Inversion (Exploding)', points: [2.5, 12.0, 180.0, 4500.0, 99999.0, 99999.0], isBroken: true, lossVal: 'NaN (Overflow)' },
      { label: 'With Ridge L2 Penalty (λ=0.1)', points: [2.5, 1.6, 0.9, 0.5, 0.28, 0.22], isBroken: false, lossVal: '0.22' }
    ]
  },
  {
    id: 'tree_xor',
    algorithm: 'Decision Trees (Cartesian Splits)',
    scenarioTitle: 'Shallow Tree vs. XOR Parity Problem',
    pathology: 'Training axis-aligned orthogonal decision trees on XOR / diagonal checkerboard parity data.',
    symptom: 'Information Gain = 0.00 at root node. A depth-1 or depth-2 tree behaves no better than a random coin toss (50% accuracy).',
    rootCause: 'XOR features have zero individual marginal mutual information with the target label. Any single orthogonal horizontal or vertical split yields equal 50/50 label distributions in both child partitions.',
    productionCure: 'Project features into polynomial interaction space (x₁ · x₂), use oblique decision trees, or utilize non-linear neural representations.',
    curves: [
      { label: 'Standard Linear Data (Depth=2)', points: [0.69, 0.45, 0.28, 0.15, 0.08, 0.05], isBroken: false, lossVal: '95% Acc' },
      { label: 'XOR Parity (Depth=2 Orthogonal)', points: [0.69, 0.69, 0.69, 0.69, 0.69, 0.69], isBroken: true, lossVal: '50% Acc (Stuck)' },
      { label: 'XOR with Interaction Feature (x₁x₂)', points: [0.69, 0.35, 0.12, 0.02, 0.00, 0.00], isBroken: false, lossVal: '100% Acc' }
    ]
  },
  {
    id: 'gd_overshoot',
    algorithm: 'Gradient Descent Optimization',
    scenarioTitle: 'Learning Rate η = 10.0 Catastrophic Divergence',
    pathology: 'Setting the step size η greater than 2 / λ_max, where λ_max is the maximum eigenvalue of the Hessian matrix ∇²J.',
    symptom: 'Weights oscillate between opposing canyon walls with exponentially increasing magnitude until IEEE-754 floating point overflow.',
    rootCause: 'The discrete gradient step overshoots the quadratic curvature basin and evaluates the objective at an altitude higher than the starting position.',
    productionCure: 'Implement Lipschitz learning rate bounds (η < 1/L), Gradient Clipping (clip_norm=1.0), or adaptive optimizers (Adam, RMSProp).',
    curves: [
      { label: 'Optimal η = 0.01', points: [1.8, 1.2, 0.7, 0.35, 0.18, 0.08], isBroken: false, lossVal: '0.08' },
      { label: 'Too High η = 0.25 (Oscillating)', points: [1.8, 0.9, 1.4, 0.6, 1.1, 0.4], isBroken: false, lossVal: '0.40' },
      { label: 'Catastrophic η = 10.0 (Crash)', points: [1.8, 18.0, 320.0, 9999.0, 99999.0, 99999.0], isBroken: true, lossVal: '∞ (Diverged)' }
    ]
  },
  {
    id: 'kmeans_concentric',
    algorithm: 'K-Means Clustering',
    scenarioTitle: 'Concentric Rings & Non-Convex Manifolds',
    pathology: 'Clustering nested bullseye concentric circle distributions using Euclidean distance minimization.',
    symptom: 'Centroids slice right across the rings, severing continuous manifolds into arbitrary geometric pie slices.',
    rootCause: 'K-Means assumes spherical, convex, isotropic Gaussian clusters. Its objective function partitions space into convex Voronoi cells.',
    productionCure: 'Use density-based clustering (DBSCAN), manifold learning (t-SNE/UMAP), or Spectral Clustering with an affinity graph.',
    curves: [
      { label: 'Convex Gaussian Blobs', points: [0.85, 0.55, 0.32, 0.18, 0.10, 0.05], isBroken: false, lossVal: '0.05 Inertia' },
      { label: 'Concentric Rings (K-Means)', points: [0.85, 0.82, 0.79, 0.78, 0.78, 0.78], isBroken: true, lossVal: 'Severed Rings' },
      { label: 'Concentric Rings (DBSCAN)', points: [0.85, 0.40, 0.15, 0.05, 0.01, 0.00], isBroken: false, lossVal: 'Perfect Recovery' }
    ]
  }
];

export const ExperimentMode: React.FC = () => {
  const [activeTest, setActiveTest] = useState<StressTestCase>(STRESS_TESTS[0]);
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [crashed, setCrashed] = useState<boolean>(false);

  const handleCrashSimulation = () => {
    setIsInjecting(true);
    setCrashed(false);
    setTimeout(() => {
      setIsInjecting(false);
      setCrashed(true);
    }, 600);
  };

  return (
    <div id="experiments_view" className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 select-none bg-[#F7F5EF] text-[#111111]">
      
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#E5E2D9] pb-6">
        <div>
          <div className="text-xs font-mono text-amber-700 uppercase tracking-widest mb-1 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Adversarial Testing • Break The Model</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
            Edge Case Injector & Model Stress Lab
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Engineers only truly master machine learning when they know precisely where and why classical algorithms fail.
          </p>
        </div>

        {/* Algorithm Scenario Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {STRESS_TESTS.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTest(t);
                setCrashed(false);
              }}
              className={`px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-all border ${
                activeTest.id === t.id
                  ? 'bg-[#111111] text-white border-[#111111] font-bold shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border-[#E5E2D9]'
              }`}
            >
              {t.algorithm.split(' ')[0]} Stress Test
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive Crash Chamber Banner */}
      <div className="bg-white border-2 border-amber-300 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200 pb-4">
          <div>
            <span className="text-[10px] font-mono text-amber-800 font-bold uppercase tracking-wider block">
              ADVERSARIAL SCENARIO
            </span>
            <h2 className="text-xl font-bold text-[#111111] mt-0.5">
              {activeTest.scenarioTitle}
            </h2>
          </div>

          <button
            onClick={handleCrashSimulation}
            disabled={isInjecting}
            className="px-5 py-2.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-xs shrink-0"
          >
            <Flame className="w-4 h-4 fill-white" />
            <span>{isInjecting ? 'INJECTING PATHOLOGY...' : 'CRASH THE ALGORITHM'}</span>
          </button>
        </div>

        {/* Diagnostic breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
              Injected Pathology:
            </span>
            <p className="text-stone-800 leading-relaxed">{activeTest.pathology}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
              Observed Symptom:
            </span>
            <p className="text-rose-700 font-bold leading-relaxed">{activeTest.symptom}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
              Root Mathematical Cause:
            </span>
            <p className="text-stone-800 leading-relaxed">{activeTest.rootCause}</p>
          </div>
        </div>

        {crashed && (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-300 text-xs text-rose-950 font-mono animate-in fade-in space-y-1">
            <div className="font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>CRITICAL FAILURE SIMULATED IN LIVE RUNTIME</span>
            </div>
            <div>{activeTest.symptom}</div>
          </div>
        )}
      </div>

      {/* 3. Side-by-Side Trajectory Visuals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeTest.curves.map((curve, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-xl p-6 border shadow-xs flex flex-col justify-between space-y-4 ${
              curve.isBroken ? 'border-rose-300' : 'border-[#E5E2D9]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="font-bold text-[#111111]">{curve.label}</span>
                {curve.isBroken && (
                  <span className="text-[10px] text-rose-700 font-bold px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200">
                    FAIL
                  </span>
                )}
              </div>

              {/* Sparkline Canvas */}
              <div className="h-32 w-full bg-[#FAF8F2] rounded border border-[#E5E2D9] p-3 flex items-center justify-center relative">
                <svg className="w-full h-full" viewBox="0 0 100 60">
                  <polyline
                    fill="none"
                    stroke={curve.isBroken ? '#E11D48' : '#1A42D9'}
                    strokeWidth="2.2"
                    points={curve.points
                      .map((val, i) => {
                        const x = (i / (curve.points.length - 1)) * 90 + 5;
                        const clamped = Math.min(10, Math.max(0, val));
                        const y = 55 - (clamped / 10) * 50;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                </svg>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E2D9] flex items-center justify-between text-xs font-mono">
              <span className="text-stone-400">Final Metric:</span>
              <span className={`font-bold ${curve.isBroken ? 'text-rose-700' : 'text-[#111111]'}`}>
                {curve.lossVal}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Production Engineering Cure */}
      <div className="bg-white border border-[#E5E2D9] rounded-xl p-6 shadow-xs flex items-start gap-4">
        <div className="p-3 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 mt-0.5">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">
            PRODUCTION SYSTEM DEFENSE & CURE
          </h3>
          <p className="text-xs text-stone-700 leading-relaxed font-mono">
            {activeTest.productionCure}
          </p>
        </div>
      </div>

    </div>
  );
};

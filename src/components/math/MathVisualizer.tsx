import React, { useState } from 'react';
import { 
  Binary, 
  RotateCcw, 
  Sliders, 
  Compass, 
  Sparkles, 
  Layers, 
  Info,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

type MathTopic = 'dot_product' | 'matrix_transform' | 'gradient_bowl' | 'bayes_theorem';

export const MathVisualizer: React.FC = () => {
  const [topic, setTopic] = useState<MathTopic>('dot_product');

  // Topic 1: Vector Dot Product State
  const [angleA, setAngleA] = useState(30);
  const [angleB, setAngleB] = useState(75);
  const [magnitudeA] = useState(35);
  const [magnitudeB] = useState(35);

  const radA = (angleA * Math.PI) / 180;
  const radB = (angleB * Math.PI) / 180;
  const ax = magnitudeA * Math.cos(radA);
  const ay = magnitudeA * Math.sin(radA);
  const bx = magnitudeB * Math.cos(radB);
  const by = magnitudeB * Math.sin(radB);
  const dotProduct = ax * bx + ay * by;
  const angleBetween = Math.abs(angleA - angleB);

  // Topic 2: 2x2 Matrix Transformation State
  const [matrixA, setMatrixA] = useState(1.2);
  const [matrixB, setMatrixB] = useState(0.4);
  const [matrixC, setMatrixC] = useState(-0.2);
  const [matrixD, setMatrixD] = useState(1.1);

  const p1 = { x: 50, y: 50 };
  const p2 = { x: 50 + matrixA * 25, y: 50 - matrixC * 25 };
  const p3 = { x: 50 + (matrixA + matrixB) * 25, y: 50 - (matrixC + matrixD) * 25 };
  const p4 = { x: 50 + matrixB * 25, y: 50 - matrixD * 25 };
  const determinant = matrixA * matrixD - matrixB * matrixC;

  // Topic 3: Gradient Loss Bowl State
  const [gradStep, setGradStep] = useState(0);
  const [lr, setLr] = useState(0.2);

  // Topic 4: Bayes' Theorem Probability
  const [prior, setPrior] = useState(0.01);
  const [sensitivity, setSensitivity] = useState(0.95);
  const [falsePositive, setFalsePositive] = useState(0.05);
  const pPositive = sensitivity * prior + falsePositive * (1 - prior);
  const posterior = (sensitivity * prior) / (pPositive || 0.0001);

  return (
    <div id="math_visualizer_view" className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 select-none bg-[#F7F5EF] text-[#111111]">
      
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#E5E2D9] pb-6">
        <div>
          <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1A42D9]" />
            <span>Mathematical Intuition Lab • Geometric Proofs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
            Mathematical Foundations Visualizer
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Develop physical intuition for dot products, linear transformations, gradient landscapes, and Bayesian reasoning.
          </p>
        </div>

        {/* Topic Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'dot_product', label: 'Dot Product' },
            { id: 'matrix_transform', label: 'Matrix Transform' },
            { id: 'gradient_bowl', label: 'Gradient Surface' },
            { id: 'bayes_theorem', label: 'Bayes Theorem' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTopic(t.id as MathTopic)}
              className={`px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-all border ${
                topic === t.id
                  ? 'bg-[#111111] text-white border-[#111111] font-bold shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border-[#E5E2D9]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TOPIC 1: VECTOR DOT PRODUCT */}
      {topic === 'dot_product' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white border border-[#E5E2D9] rounded-xl p-6 shadow-xs flex flex-col items-center justify-center relative select-none">
            <div className="w-full h-80 sm:h-96 relative flex items-center justify-center bg-[#FAF8F2] rounded-lg border border-[#E5E2D9]">
              <svg className="w-full h-full" viewBox="-60 -60 120 120">
                {/* Axes */}
                <line x1="-55" y1="0" x2="55" y2="0" stroke="#E5E2D9" strokeWidth="1" />
                <line x1="0" y1="-55" x2="0" y2="55" stroke="#E5E2D9" strokeWidth="1" />
                
                {/* Unit grid circle */}
                <circle cx="0" cy="0" r="35" fill="none" stroke="#D2CDC2" strokeWidth="0.8" strokeDasharray="2,2" />

                {/* Vector A (Dark Ink) */}
                <line x1="0" y1="0" x2={ax} y2={-ay} stroke="#111111" strokeWidth="2.5" />
                <circle cx={ax} cy={-ay} r="3" fill="#111111" />
                <text x={ax + 3} y={-ay - 3} fill="#111111" fontSize="5" fontFamily="monospace" fontWeight="bold">A</text>

                {/* Vector B (Cobalt Blue) */}
                <line x1="0" y1="0" x2={bx} y2={-by} stroke="#1A42D9" strokeWidth="2.5" />
                <circle cx={bx} cy={-by} r="3" fill="#1A42D9" />
                <text x={bx + 3} y={-by - 3} fill="#1A42D9" fontSize="5" fontFamily="monospace" fontWeight="bold">B</text>
              </svg>
            </div>

            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-stone-600 border-t border-[#E5E2D9] pt-4 mt-4 gap-2">
              <span>Formulation: A · B = ‖A‖ ‖B‖ cos(θ)</span>
              <span className={`font-bold ${dotProduct > 0 ? 'text-[#1A42D9]' : 'text-rose-700'}`}>
                Dot Product: {dotProduct.toFixed(1)} {dotProduct === 0 ? '(Orthogonal)' : dotProduct > 0 ? '(Acute Alignment)' : '(Obtuse Opposing)'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="lg:col-span-4 bg-white border border-[#E5E2D9] rounded-xl p-6 shadow-xs space-y-5">
            <div className="text-xs font-mono text-stone-500 font-bold uppercase tracking-wider border-b border-[#E5E2D9] pb-3">
              Vector Controls
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-stone-700 font-semibold">Angle Vector A:</span>
                <span className="font-bold text-[#111111]">{angleA}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={angleA}
                onChange={e => setAngleA(parseInt(e.target.value))}
                className="w-full accent-[#111111] cursor-pointer h-1.5 bg-stone-200 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-stone-700 font-semibold">Angle Vector B:</span>
                <span className="font-bold text-[#1A42D9]">{angleB}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={angleB}
                onChange={e => setAngleB(parseInt(e.target.value))}
                className="w-full accent-[#1A42D9] cursor-pointer h-1.5 bg-stone-200 rounded"
              />
            </div>

            <div className="p-4 rounded bg-[#FAF8F2] border border-[#E5E2D9] text-xs text-stone-700 leading-relaxed font-mono space-y-1.5">
              <div>Angle Between (θ): <b>{angleBetween}°</b></div>
              <div>Cosine(θ): <b>{Math.cos((angleBetween * Math.PI) / 180).toFixed(3)}</b></div>
              <div className="text-[11px] text-stone-500 mt-2 pt-2 border-t border-stone-200 leading-normal">
                Cosine Similarity measures semantic closeness between document and transformer embedding vectors in high-dimensional latent space.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOPIC 2: 2X2 MATRIX TRANSFORMATIONS */}
      {topic === 'matrix_transform' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white border border-[#E5E2D9] rounded-xl p-6 shadow-xs flex flex-col items-center justify-center relative select-none">
            <div className="w-full h-80 sm:h-96 relative flex items-center justify-center bg-[#FAF8F2] rounded-lg border border-[#E5E2D9]">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <line x1="50" y1="0" x2="50" y2="100" stroke="#E5E2D9" strokeWidth="1" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#E5E2D9" strokeWidth="1" />

                {/* Original Unit Square */}
                <polygon points="50,50 75,50 75,25 50,25" fill="#111111" fillOpacity="0.03" stroke="#B0AAA0" strokeWidth="1" strokeDasharray="2,2" />

                {/* Transformed Parallelogram */}
                <polygon
                  points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`}
                  fill="#1A42D9"
                  fillOpacity="0.15"
                  stroke="#1A42D9"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="w-full flex items-center justify-between text-xs font-mono text-stone-600 border-t border-[#E5E2D9] pt-4 mt-4">
              <span>Determinant (Area Scaling):</span>
              <span className="text-[#1A42D9] font-bold">
                det(A) = ad - bc = {determinant.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-[#E5E2D9] rounded-xl p-6 shadow-xs space-y-4">
            <div className="text-xs font-mono text-stone-500 font-bold uppercase tracking-wider border-b border-[#E5E2D9] pb-3">
              Matrix Parameters [[a, b], [c, d]]
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-600 font-mono">a (Scale X): {matrixA}</label>
                <input
                  type="range" min="-2" max="2" step="0.1" value={matrixA}
                  onChange={e => setMatrixA(parseFloat(e.target.value))}
                  className="w-full accent-[#111111] cursor-pointer h-1.5 bg-stone-200 rounded"
                />
              </div>
              <div>
                <label className="text-xs text-stone-600 font-mono">b (Shear X): {matrixB}</label>
                <input
                  type="range" min="-2" max="2" step="0.1" value={matrixB}
                  onChange={e => setMatrixB(parseFloat(e.target.value))}
                  className="w-full accent-[#111111] cursor-pointer h-1.5 bg-stone-200 rounded"
                />
              </div>
              <div>
                <label className="text-xs text-stone-600 font-mono">c (Shear Y): {matrixC}</label>
                <input
                  type="range" min="-2" max="2" step="0.1" value={matrixC}
                  onChange={e => setMatrixC(parseFloat(e.target.value))}
                  className="w-full accent-[#111111] cursor-pointer h-1.5 bg-stone-200 rounded"
                />
              </div>
              <div>
                <label className="text-xs text-stone-600 font-mono">d (Scale Y): {matrixD}</label>
                <input
                  type="range" min="-2" max="2" step="0.1" value={matrixD}
                  onChange={e => setMatrixD(parseFloat(e.target.value))}
                  className="w-full accent-[#111111] cursor-pointer h-1.5 bg-stone-200 rounded"
                />
              </div>
            </div>

            <div className="p-3.5 rounded bg-[#FAF8F2] border border-[#E5E2D9] text-xs text-stone-700 leading-relaxed font-mono">
              Every linear neural layer <code>y = Wx + b</code> is rotating, stretching, and shearing data manifolds in space.
            </div>
          </div>
        </div>
      )}

      {/* TOPIC 3: GRADIENT DESCENT LOSS BOWL */}
      {topic === 'gradient_bowl' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white border border-[#E5E2D9] rounded-xl p-6 shadow-xs flex flex-col items-center justify-center relative select-none">
            <div className="w-full h-80 sm:h-96 relative flex items-center justify-center bg-[#FAF8F2] rounded-lg border border-[#E5E2D9]">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <path
                  d="M 10,68 Q 50,15 90,68"
                  fill="none"
                  stroke="#111111"
                  strokeWidth="2"
                />

                {/* Rolling Parameter Ball */}
                <circle
                  cx={50 + 38 * Math.pow(1 - lr, gradStep)}
                  cy={15 + 0.03 * Math.pow(38 * Math.pow(1 - lr, gradStep), 2) + 20}
                  r="4.5"
                  fill="#1A42D9"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />
              </svg>
            </div>

            <div className="w-full flex items-center justify-between text-xs font-mono text-stone-600 border-t border-[#E5E2D9] pt-4 mt-4">
              <span>Current Iteration: <b>Step {gradStep}</b></span>
              <span className="text-[#1A42D9] font-bold">
                Parameter State: θ = {(50 + 38 * Math.pow(1 - lr, gradStep)).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-[#E5E2D9] rounded-xl p-6 shadow-xs space-y-4">
            <div className="text-xs font-mono text-stone-500 font-bold uppercase tracking-wider border-b border-[#E5E2D9] pb-3">
              Optimizer Controls
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-stone-700 font-semibold">Learning Rate (η):</span>
                <span className="font-bold text-[#1A42D9]">{lr}</span>
              </div>
              <input
                type="range" min="0.05" max="0.6" step="0.05" value={lr}
                onChange={e => setLr(parseFloat(e.target.value))}
                className="w-full accent-[#1A42D9] cursor-pointer h-1.5 bg-stone-200 rounded"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setGradStep(s => s + 1)}
                className="flex-1 py-2.5 rounded bg-[#111111] hover:bg-[#1A42D9] text-white font-bold font-mono text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                Take Step →
              </button>
              <button
                onClick={() => setGradStep(0)}
                className="px-4 py-2.5 rounded bg-white hover:bg-stone-50 border border-[#E5E2D9] text-stone-700 text-xs font-mono"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOPIC 4: BAYES THEOREM */}
      {topic === 'bayes_theorem' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white border border-[#E5E2D9] rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-stone-500 border-b border-[#E5E2D9] pb-3">
              <span className="uppercase tracking-wider font-bold text-[#111111]">BAYESIAN PROBABILITY PARADOX</span>
              <span>P(A|B) = [P(B|A) · P(A)] / P(B)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded bg-[#FAF8F2] border border-[#E5E2D9]">
                <div className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">Prior Rate P(D)</div>
                <div className="text-2xl font-bold text-[#111111] font-mono mt-1">{(prior * 100).toFixed(1)}%</div>
                <div className="text-[10px] text-stone-500 mt-1">1 in 100 population</div>
              </div>

              <div className="p-4 rounded bg-[#FAF8F2] border border-[#E5E2D9]">
                <div className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">Test Sensitivity</div>
                <div className="text-2xl font-bold text-[#111111] font-mono mt-1">{(sensitivity * 100).toFixed(0)}%</div>
                <div className="text-[10px] text-stone-500 mt-1">True positive rate</div>
              </div>

              <div className="p-4 rounded bg-[#FAF8F2] border border-[#1A42D9]">
                <div className="text-[10px] font-mono text-[#1A42D9] uppercase font-bold tracking-wider">Posterior P(D|+)</div>
                <div className="text-3xl font-extrabold text-[#1A42D9] font-mono mt-1">
                  {(posterior * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-stone-500 mt-1">Actual probability given +</div>
              </div>
            </div>

            <div className="p-4 rounded bg-[#FAF8F2] border border-[#E5E2D9] text-xs text-stone-700 leading-relaxed font-mono">
              💡 <b>Why is posterior only {(posterior * 100).toFixed(1)}% despite a 95% accurate diagnostic test?</b>
              <br />
              Because the prior base rate is small (1%), the false positive fraction from the 99% healthy population dominates the true positive cases.
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-[#E5E2D9] rounded-xl p-6 shadow-xs space-y-4">
            <div className="text-xs font-mono text-stone-500 font-bold uppercase tracking-wider border-b border-[#E5E2D9] pb-3">
              Bayesian Sliders
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-stone-700 font-semibold">Prior Base Rate:</span>
                <span className="font-bold text-[#111111]">{(prior * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range" min="0.005" max="0.1" step="0.005" value={prior}
                onChange={e => setPrior(parseFloat(e.target.value))}
                className="w-full accent-[#111111] cursor-pointer h-1.5 bg-stone-200 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-stone-700 font-semibold">False Positive Rate:</span>
                <span className="font-bold text-rose-700">{(falsePositive * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range" min="0.01" max="0.2" step="0.01" value={falsePositive}
                onChange={e => setFalsePositive(parseFloat(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer h-1.5 bg-stone-200 rounded"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Sparkles, 
  Plus, 
  Crosshair, 
  Dot, 
  RefreshCw, 
  Code, 
  Copy, 
  Check, 
  Activity, 
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { 
  algorithmRegistry, 
  Point, 
  ToolMode, 
  InteractiveAlgorithmContext 
} from './registry';
import { explainConcept } from '../../services/geminiService';

export const VisualMLLab: React.FC = () => {
  // 1. Registered Algorithm Selection
  const allAlgorithms = useMemo(() => algorithmRegistry.getAll(), []);
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>('linear_regression');

  const activeAlgo = useMemo(() => {
    return algorithmRegistry.get(selectedAlgoId) || algorithmRegistry.getDefault();
  }, [selectedAlgoId]);

  // 2. Interactive Tool Mode & Global Hyperparameters
  const [toolMode, setToolMode] = useState<ToolMode>('caliper');
  const [noiseLevel, setNoiseLevel] = useState<number>(15);
  const [sampleCount, setSampleCount] = useState<number>(28);

  // 3. Algorithm-Specific Dynamic Parameters
  const [parameters, setParameters] = useState<Record<string, any>>(() => {
    return activeAlgo.getDefaultParameters();
  });

  // When switching algorithms, reset parameters to defaults for that algorithm
  const handleSelectAlgorithm = (id: string) => {
    const algo = algorithmRegistry.get(id);
    if (!algo) return;
    setSelectedAlgoId(id);
    setParameters(algo.getDefaultParameters());
    setManualState({});
    setAiExplanation(null);
    setEpoch(1);
    setStepIndex(1);
  };

  const updateParameter = (key: string, value: any) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  // 4. Manual Caliper Drag Overrides
  const [manualState, setManualState] = useState<Record<string, any>>({});
  const [isDraggingHandle, setIsDraggingHandle] = useState<string | number | null>(null);

  const resetManualState = () => {
    setManualState({});
  };

  // 5. Execution & Animation Loop
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(1);
  const [animSpeed] = useState<0.5 | 1 | 2>(1);
  const [epoch, setEpoch] = useState(25);
  const [showResiduals, setShowResiduals] = useState(true);
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);

  // 6. Crosshair, Probe & Data Points
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [inspectedPoint, setInspectedPoint] = useState<Point | null>(null);
  const [points, setPoints] = useState<Point[]>([]);

  // 7. Code Preview & AI Mentor State
  const [codeFramework, setCodeFramework] = useState<'sklearn' | 'pytorch'>('sklearn');
  const [copiedCode, setCopiedCode] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // 8. Dataset Generation via Active Algorithm
  const generateData = () => {
    const newPoints = activeAlgo.generateDataset(sampleCount, noiseLevel, parameters);
    setPoints(newPoints);
    setManualState({});
    setEpoch(1);
  };

  useEffect(() => {
    generateData();
  }, [selectedAlgoId, sampleCount, noiseLevel]);

  // 9. Compute State and Live Metrics via Active Algorithm
  const computedState = useMemo(() => {
    return activeAlgo.computeState(points, parameters, manualState);
  }, [activeAlgo, points, parameters, manualState]);

  const metrics = useMemo(() => {
    return activeAlgo.computeMetrics(points, computedState, parameters);
  }, [activeAlgo, points, computedState, parameters]);

  // Primary metric for the main galvanometer readout
  const primaryMetric = useMemo(() => {
    return metrics.find(m => m.isPrimary) || metrics[0] || {
      key: 'loss',
      label: 'Loss',
      value: '0.00',
      barPercent: 10
    };
  }, [metrics]);

  // Secondary metrics for sub-readouts
  const secondaryMetrics = useMemo(() => {
    return metrics.filter(m => !m.isPrimary);
  }, [metrics]);

  // 10. Interactive Context Passed to Algorithm Module
  const interactiveContext: InteractiveAlgorithmContext = {
    points,
    setPoints,
    parameters,
    updateParameter,
    toolMode,
    isDraggingHandle,
    setIsDraggingHandle,
    cursorPos,
    inspectedPoint,
    setInspectedPoint,
    epoch,
    isPlaying,
    showResiduals,
    manualState,
    setManualState,
    resetManualState
  };

  // 11. Canvas Interaction Handlers
  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, 100 - ((e.clientY - rect.top) / rect.height) * 100));
    
    setCursorPos({ x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) });

    if (isDraggingHandle !== null && activeAlgo.handleCanvasDrag) {
      activeAlgo.handleCanvasDrag(x, y, interactiveContext, computedState);
    }
  };

  const handleSvgMouseUp = () => {
    setIsDraggingHandle(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDraggingHandle !== null) return;
    if (toolMode !== 'dispense') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = 100 - ((e.clientY - rect.top) / rect.height) * 100;

    const injectedPoint = activeAlgo.onPointInjected(
      { x: rawX, y: rawY },
      points,
      computedState,
      parameters
    );

    setPoints(prev => [...prev, injectedPoint]);
  };

  // 12. Animation Execution Loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setEpoch(prev => {
        const next = prev + 1;
        setStepIndex(s => (s % 4) + 1);
        return next;
      });
    }, 600 / animSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, animSpeed]);

  // 13. Socratic Machine Mentor Request
  const handleAskAIExplanation = async () => {
    setIsExplaining(true);
    setAiExplanation(null);
    try {
      let prompt = `You are Forge AI, an elite scientific mentor. The learner is exploring ${activeAlgo.name} in the Visual ML Lab workbench.\n`;
      prompt += `Current hypothesis: ${activeAlgo.getHypothesisText(parameters, computedState)}\n`;
      prompt += `Metrics:\n${metrics.map(m => `- ${m.label}: ${m.value}`).join('\n')}\n`;
      
      if (activeAlgo.getSocraticPrompt) {
        prompt += activeAlgo.getSocraticPrompt(parameters, metrics, computedState);
      } else {
        prompt += `Provide a concise 2-sentence mathematical intuition of the manifold and describe how altering parameters shifts convergence.`;
      }

      const res = await explainConcept(prompt, 'Scientific ML Workbench State');
      setAiExplanation(res);
    } catch {
      setAiExplanation(activeAlgo.defaultSocraticExplanation || "The model converges along the loss manifold. Adjusting parameters balances model bias against sample variance.");
    } finally {
      setIsExplaining(false);
    }
  };

  // 14. Code Telemetry Generation
  const generatedCode = useMemo(() => {
    return activeAlgo.generateCode(codeFramework, points, parameters, computedState);
  }, [activeAlgo, codeFramework, points, parameters, computedState]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const hasManualAdjustments = Object.keys(manualState).length > 0;

  return (
    <div id="scientific_ml_instrument_bench" className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto select-none">
      
      {/* 1. TOP INSTRUMENT CONSOLE BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E2D9] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1A42D9] animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-stone-500 font-bold">
              MODULAR ALGORITHM INSTRUMENT • 1.0 KHZ KERNEL
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${activeAlgo.badgeColor}`}>
              {activeAlgo.badgeText}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#111111] mt-0.5">
            Physical ML Instrument Workbench
          </h1>
        </div>

        {/* Modular Algorithm Channel Selector */}
        <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-none border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
          {allAlgorithms.map(algo => (
            <button
              key={algo.id}
              onClick={() => handleSelectAlgorithm(algo.id)}
              className={`px-3 py-1.5 rounded-none text-xs font-mono transition-all flex items-center gap-1.5 border-[1.5px] border-[#111111] ${
                selectedAlgoId === algo.id
                  ? 'bg-[#111111] text-white font-bold shadow-[2px_2px_0px_0px_#111111]'
                  : 'bg-white text-stone-700 hover:text-[#111111] hover:bg-stone-50'
              }`}
            >
              <span>{algo.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. UNIFIED INSTRUMENT CHASSIS: EXPANSIVE CANVAS & TACTILE RACKS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CENTER PANORAMIC INSTRUMENT CANVAS (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          <div className="border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rounded-none bg-white overflow-hidden">
            {/* Top Bezel Controls & Vernier Readout */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#FAF8F2] border-b-[2px] border-[#111111] text-xs font-mono">
              {/* Tool Mode Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase text-stone-500 font-bold mr-1">CALIPER:</span>
                <button
                  onClick={() => setToolMode('caliper')}
                  className={`px-2.5 py-1 rounded-none flex items-center gap-1.5 transition-all border-[1.5px] border-[#111111] ${
                    toolMode === 'caliper'
                      ? 'bg-[#111111] text-white font-bold shadow-[1px_1px_0px_0px_#111111]'
                      : 'bg-white text-stone-700 hover:bg-stone-100'
                  }`}
                  title="Directly drag boundary line, margins, or centroids"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Drag Boundary</span>
                </button>

                <button
                  onClick={() => setToolMode('dispense')}
                  className={`px-2.5 py-1 rounded-none flex items-center gap-1.5 transition-all border-[1.5px] border-[#111111] ${
                    toolMode === 'dispense'
                      ? 'bg-[#1A42D9] text-white font-bold shadow-[1px_1px_0px_0px_#111111]'
                      : 'bg-white text-stone-700 hover:bg-stone-100'
                  }`}
                  title="Click anywhere to inject data particles"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Inject Samples</span>
                </button>

                <button
                  onClick={() => setToolMode('probe')}
                  className={`px-2.5 py-1 rounded-none flex items-center gap-1.5 transition-all border-[1.5px] border-[#111111] ${
                    toolMode === 'probe'
                      ? 'bg-amber-600 text-white font-bold shadow-[1px_1px_0px_0px_#111111]'
                      : 'bg-white text-stone-700 hover:bg-stone-100'
                  }`}
                  title="Hover points to inspect coordinates and residuals"
                >
                  <Dot className="w-3.5 h-3.5" />
                  <span>Inspect Probe</span>
                </button>
              </div>

              {/* Vernier Cursor Coordinate Tracker */}
              <div className="flex items-center gap-3 text-stone-600 font-mono text-[11px]">
                {cursorPos ? (
                  <span className="text-[#1A42D9] font-bold bg-white px-2 py-0.5 rounded-none border border-[#111111]">
                    X₁: {cursorPos.x.toFixed(1)} mm • X₂: {cursorPos.y.toFixed(1)} mm
                  </span>
                ) : (
                  <span className="text-stone-500 font-bold">Position probe on manifold</span>
                )}
                <button
                  onClick={generateData}
                  className="p-1.5 text-stone-700 hover:text-[#111111] hover:bg-stone-100 rounded-none border border-[#111111] bg-white shadow-[1px_1px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  title="Regenerate Empirical Samples"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Precision Physical Canvas Screen */}
            <div 
              className="relative w-full h-[460px] sm:h-[500px] bg-[#FAF8F2] overflow-hidden select-none"
              onMouseUp={handleSvgMouseUp}
            >
              {/* Top Vernier Scale Ruler */}
              <div className="absolute top-0 left-0 right-0 h-4 border-b border-[#E5E2D9] flex justify-between px-3 text-[8px] font-mono text-stone-400 pointer-events-none bg-stone-50/40">
                <span>0.00</span>
                <span>20.00</span>
                <span>40.00</span>
                <span>60.00</span>
                <span>80.00</span>
                <span>100.00</span>
              </div>

              {/* Left Vernier Scale Ruler */}
              <div className="absolute top-4 bottom-0 left-0 w-4 border-r border-[#E5E2D9] flex flex-col justify-between py-2 text-[8px] font-mono text-stone-400 pointer-events-none items-center bg-stone-50/40">
                <span>100</span>
                <span>80</span>
                <span>60</span>
                <span>40</span>
                <span>20</span>
                <span>0</span>
              </div>

              <svg 
                ref={svgRef}
                className="w-full h-full pl-4 pt-4 cursor-crosshair" 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
                onMouseMove={handleSvgMouseMove}
                onClick={handleCanvasClick}
              >
                {/* Millimeter Blueprint Coordinate Grid */}
                <defs>
                  <pattern id="millimeterGrid" width="5" height="5" patternUnits="userSpaceOnUse">
                    <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#EAE6DC" strokeWidth="0.3" />
                  </pattern>
                  <pattern id="majorGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#DFD9CB" strokeWidth="0.6" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#millimeterGrid)" />
                <rect width="100" height="100" fill="url(#majorGrid)" />

                {/* Laser Crosshair Line Tracking */}
                {cursorPos && (
                  <g opacity={0.35} pointerEvents="none">
                    <line x1={cursorPos.x} y1="0" x2={cursorPos.x} y2="100" stroke="#1A42D9" strokeWidth="0.4" strokeDasharray="1,1" />
                    <line x1="0" y1={100 - cursorPos.y} x2="100" y2={100 - cursorPos.y} stroke="#1A42D9" strokeWidth="0.4" strokeDasharray="1,1" />
                  </g>
                )}

                {/* MODULAR ALGORITHM RENDERED CANVAS LAYER */}
                {activeAlgo.renderCanvas(interactiveContext, computedState)}

                {/* EMPIRICAL DATA SAMPLES */}
                {points.map((p, i) => {
                  let color = '#111111';
                  if (p.label === 1) color = '#1A42D9';
                  if (p.label === 2) color = '#D97706';
                  if (p.label === 3) color = '#7C3AED';

                  const isInspected = inspectedPoint === p;

                  return (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={100 - p.y}
                      r={isInspected ? 4.2 : (p.isSupportVector ? 3.4 : 2.5)}
                      fill={color}
                      stroke="#FFFFFF"
                      strokeWidth={isInspected ? 1.6 : (p.isSupportVector ? 1.2 : 0.8)}
                      className="hover:scale-150 transition-all cursor-pointer"
                      onMouseEnter={() => {
                        if (toolMode === 'probe') setInspectedPoint(p);
                      }}
                      onMouseLeave={() => {
                        if (toolMode === 'probe') setInspectedPoint(null);
                      }}
                    />
                  );
                })}
              </svg>

              {/* Direct Caliper Adjustment Status Bar */}
              <div className="absolute bottom-2 left-6 right-3 flex items-center justify-between text-[11px] font-mono text-stone-600 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 ${hasManualAdjustments ? 'bg-amber-500' : 'bg-emerald-500'} border border-[#111111]`} />
                  <span className="font-bold">
                    {hasManualAdjustments ? 'MANUAL CALIPER ENGAGED (DRAGGED)' : 'OPTIMAL MODEL CONVERGED'}
                  </span>
                  {hasManualAdjustments && (
                    <button
                      onClick={resetManualState}
                      className="pointer-events-auto text-[10px] text-[#1A42D9] underline font-bold ml-1 hover:text-[#111111] flex items-center gap-1"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Snap back
                    </button>
                  )}
                </div>
                <span className="hidden sm:inline font-bold">N = {points.length} Particles</span>
              </div>
            </div>
          </div>

          {/* Under-Canvas Execution Controller */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111] rounded-none text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <button
                id="btn_lab_train"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-2 rounded-none font-mono font-bold text-xs flex items-center gap-1.5 transition-all border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                  isPlaying 
                    ? 'bg-amber-100 text-amber-950' 
                    : 'bg-[#111111] text-white hover:bg-[#1A42D9]'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                <span>{isPlaying ? 'HOLD' : 'EXECUTE LOOP'}</span>
              </button>

              <button
                onClick={() => setStepIndex(s => (s % 4) + 1)}
                className="px-3.5 py-2 rounded-none bg-white hover:bg-stone-50 text-[#111111] border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-xs font-mono font-bold"
              >
                Step +1 →
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-stone-600 font-bold">
                Phase: <b className="text-[#111111]">{stepIndex}/4</b> • Epoch <b className="text-[#1A42D9]">{epoch}</b>
              </div>

              {/* Residual vector toggle */}
              <button
                onClick={() => setShowResiduals(!showResiduals)}
                className={`px-3 py-1.5 rounded-none text-[11px] font-mono border-[2px] border-[#111111] transition-all shadow-[1px_1px_0px_0px_#111111] ${
                  showResiduals
                    ? 'bg-indigo-50 text-[#1A42D9] font-bold'
                    : 'bg-white text-stone-500'
                }`}
              >
                Residual Vectors {showResiduals ? 'ON' : 'OFF'}
              </button>

              {/* Telemetry Drawer toggle */}
              <button
                onClick={() => setShowTelemetryDrawer(!showTelemetryDrawer)}
                className="px-3 py-1.5 rounded-none text-[11px] font-mono bg-white hover:bg-stone-50 text-[#111111] border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1 font-bold"
              >
                <Code className="w-3.5 h-3.5 text-[#1A42D9]" />
                <span>Code Drawer</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PHYSICAL RACK: POTENTIOMETERS & VU METERS (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. Precision VU Meter Panel (Galvanometer Readout) */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] rounded-none p-6 space-y-4">
            <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3 text-xs font-mono font-bold text-stone-700">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#1A42D9]" />
                GALVANOMETER LOSS VU
              </span>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-700 px-1.5 py-0.5 font-bold uppercase tracking-wider">
                {activeAlgo.category.split(':')[0]}
              </span>
            </div>

            {/* Primary Empirical Loss / Risk Meter */}
            <div className="p-3.5 rounded-none bg-[#FAF8F2] border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
              <div className="flex justify-between text-[10px] font-mono text-stone-500 font-bold uppercase">
                <span>{primaryMetric.label}</span>
                <span>{primaryMetric.unit || 'ℒ(θ)'}</span>
              </div>
              <div className="text-3xl font-black font-mono text-[#111111] mt-0.5 tracking-tight">
                {primaryMetric.value}
              </div>
              
              {/* Dual Analog-Style Bar Gauge */}
              <div className="w-full h-2.5 bg-white border border-[#111111] rounded-none mt-2 overflow-hidden flex">
                <div 
                  className="bg-[#1A42D9] h-full transition-all duration-300"
                  style={{ width: `${primaryMetric.barPercent ?? 45}%` }}
                />
              </div>
            </div>

            {/* Secondary Dual / Triple Metrics Grid */}
            {secondaryMetrics.length > 0 && (
              <div className={`grid ${secondaryMetrics.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2.5`}>
                {secondaryMetrics.map(m => (
                  <div key={m.key} className="p-2.5 rounded-none bg-[#FAF8F2] border-[2px] border-[#111111] shadow-[1px_1px_0px_0px_#111111]">
                    <div className="text-[9px] font-mono text-stone-500 uppercase font-bold truncate" title={m.label}>
                      {m.label}
                    </div>
                    <div className="text-base font-bold font-mono text-[#111111] mt-0.5 truncate">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Live Model Hypothesis Readout */}
            <div className="p-3 rounded-none bg-[#FAF8F2] border-[2px] border-[#111111] text-xs font-mono text-stone-700">
              <div className="text-[9px] uppercase text-stone-500 font-bold mb-0.5">Active Hypothesis:</div>
              <div className="font-bold text-[#111111] text-[11px] break-all">
                {activeAlgo.getHypothesisText(parameters, computedState)}
              </div>
            </div>
          </div>

          {/* 2. Physical Knobs / Slide Potentiometers Panel */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] rounded-none p-6 space-y-4">
            <div className="border-b-[2px] border-[#111111] pb-3 text-xs font-mono font-bold text-stone-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#1A42D9]" />
                POTENTIOMETERS
              </span>
              <span className="text-[10px] text-stone-600 bg-[#FAF8F2] border border-[#111111] px-1.5 py-0.5 uppercase font-bold">{activeAlgo.shortLabel}</span>
            </div>

            {/* Dynamic Registered Algorithm Parameters */}
            {activeAlgo.parameters.map(param => {
              const currentValue = parameters[param.id] ?? param.defaultValue;

              if (param.type === 'slider') {
                return (
                  <div key={param.id}>
                    <div className="flex justify-between text-xs mb-1.5 font-mono">
                      <span className="text-stone-700 font-semibold">{param.label}</span>
                      <span className="font-bold text-[#1A42D9]">
                        {typeof currentValue === 'number' ? currentValue : currentValue}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      value={currentValue}
                      onChange={e => updateParameter(param.id, parseFloat(e.target.value))}
                      className="w-full h-2 bg-stone-200 rounded-none border border-[#111111] appearance-none cursor-pointer accent-[#111111]"
                    />
                    {(param.minLabel || param.maxLabel) && (
                      <div className="flex justify-between text-[9px] font-mono text-stone-400 mt-1">
                        <span>{param.minLabel}</span>
                        <span>{param.maxLabel}</span>
                      </div>
                    )}
                  </div>
                );
              }

              if (param.type === 'toggle') {
                return (
                  <div key={param.id} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-700 font-semibold">{param.label}</span>
                    <button
                      onClick={() => updateParameter(param.id, !currentValue)}
                      className={`px-2.5 py-1 rounded-none text-[11px] font-bold transition-all border-[2px] border-[#111111] shadow-[1px_1px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                        currentValue 
                          ? 'bg-indigo-50 text-[#1A42D9]' 
                          : 'bg-white text-stone-400'
                      }`}
                    >
                      {currentValue ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                );
              }

              if (param.type === 'select' && param.options) {
                return (
                  <div key={param.id}>
                    <label className="block text-xs font-mono font-semibold text-stone-700 mb-1">
                      {param.label}
                    </label>
                    <select
                      value={currentValue}
                      onChange={e => updateParameter(param.id, e.target.value)}
                      className="w-full text-xs font-mono bg-[#FAF8F2] border-[2px] border-[#111111] rounded-none p-2 text-stone-800"
                    >
                      {param.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                );
              }

              return null;
            })}

            {/* Global Potentiometer: Gaussian Noise Variance */}
            <div className="pt-2 border-t-[2px] border-[#111111]">
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-stone-700 font-semibold">Gaussian Noise (σ)</span>
                <span className="font-bold text-stone-900">{noiseLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="2"
                value={noiseLevel}
                onChange={e => setNoiseLevel(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-stone-200 rounded-none border border-[#111111] appearance-none cursor-pointer accent-[#111111]"
              />
              <div className="flex justify-between text-[9px] font-mono text-stone-400 mt-1">
                <span>Deterministic (0%)</span>
                <span>Stochastic (50%)</span>
              </div>
            </div>

            {/* Global Potentiometer: Sample Density */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-stone-700 font-semibold">Sample Density (N)</span>
                <span className="font-bold text-stone-900">{sampleCount}</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="2"
                value={sampleCount}
                onChange={e => setSampleCount(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-stone-200 rounded-none border border-[#111111] appearance-none cursor-pointer accent-[#111111]"
              />
            </div>
          </div>

          {/* 3. Socratic Machine Mentor Widget */}
          <div className="p-5 rounded-none bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono border-b-[2px] border-[#111111] pb-2">
              <span className="text-stone-800 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1A42D9]" />
                SOCRATIC INTUITION
              </span>
              <button
                onClick={handleAskAIExplanation}
                disabled={isExplaining}
                className="text-[10px] text-[#1A42D9] hover:underline font-bold"
              >
                {isExplaining ? 'Deriving...' : 'Ask Forge AI →'}
              </button>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-sans">
              {aiExplanation || activeAlgo.defaultSocraticExplanation || "Dragging caliper handles shifts the model hypothesis. Notice how empirical risk responds in real time on the galvanometer meter."}
            </p>
          </div>
        </div>
      </div>

      {/* 3. SLIDE-OUT CODE TELEMETRY DRAWER */}
      {showTelemetryDrawer && (
        <div className="bg-[#111111] text-stone-200 border border-stone-800 rounded-lg p-4 space-y-3 font-mono animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase text-stone-400 font-bold tracking-wider">
                Production Code Mapping ({activeAlgo.shortLabel})
              </span>
              <div className="flex bg-stone-800 rounded p-0.5 text-[10px]">
                <button
                  onClick={() => setCodeFramework('sklearn')}
                  className={`px-2 py-0.5 rounded ${codeFramework === 'sklearn' ? 'bg-stone-700 text-white font-bold' : 'text-stone-400'}`}
                >
                  scikit-learn
                </button>
                <button
                  onClick={() => setCodeFramework('pytorch')}
                  className={`px-2 py-0.5 rounded ${codeFramework === 'pytorch' ? 'bg-stone-700 text-white font-bold' : 'text-stone-400'}`}
                >
                  PyTorch
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-xs flex items-center gap-1.5 text-stone-300"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => setShowTelemetryDrawer(false)}
                className="text-stone-500 hover:text-stone-300 text-xs px-1.5"
              >
                ✕
              </button>
            </div>
          </div>

          <pre className="text-xs text-stone-300 overflow-x-auto p-2.5 bg-black/40 rounded leading-relaxed font-mono">
            {generatedCode}
          </pre>
        </div>
      )}
    </div>
  );
};

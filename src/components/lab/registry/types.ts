import React from 'react';

export interface Point {
  id?: string;
  x: number;
  y: number;
  label?: number;
  weight?: number;
  isSupportVector?: boolean;
}

export type ToolMode = 'caliper' | 'dispense' | 'probe';

export interface ParameterDefinition<T = any> {
  id: string;
  label: string;
  type: 'slider' | 'select' | 'toggle';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  defaultValue: T;
  options?: { label: string; value: any }[];
  description?: string;
  minLabel?: string;
  maxLabel?: string;
}

export interface AlgorithmMetric {
  key?: string;
  id?: string;
  label: string;
  value: string | number;
  unit?: string;
  description?: string;
  isPrimary?: boolean;
  barPercent?: number; // 0 - 100 for analog meter
  trend?: 'up' | 'down' | 'neutral';
  isGood?: boolean;
}

export interface InteractiveAlgorithmContext {
  points: Point[];
  setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
  parameters: Record<string, any>;
  params?: Record<string, any>;
  updateParameter: (key: string, value: any) => void;
  toolMode: ToolMode;
  isDraggingHandle: string | number | null;
  setIsDraggingHandle: (handle: string | number | null) => void;
  cursorPos: { x: number; y: number } | null;
  inspectedPoint: Point | null;
  setInspectedPoint: (p: Point | null) => void;
  epoch: number;
  isPlaying: boolean;
  showResiduals: boolean;
  manualState: Record<string, any>;
  setManualState: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  resetManualState: () => void;
}

export interface AlgorithmModule {
  id: string;
  name: string;
  shortLabel: string;
  category: 
    | 'Supervised: Regression' 
    | 'Supervised: Classification' 
    | 'Unsupervised: Clustering' 
    | 'Unsupervised: Dimensionality' 
    | 'Deep Learning: Neural Networks' 
    | 'Ensemble Methods';
  badgeText: string;
  badgeColor: string;
  description: string;
  
  // Simple-to-understand educational intuition
  simpleAnalogy?: string; // Real world analogy (e.g. "Like asking your 5 closest friends for movie advice")
  simpleSteps?: string[]; // 3 plain-English steps
  whatToTry?: string[];   // Interactive lab experiments for the user

  // Mathematical hypothesis formula readout
  getHypothesisText: (params: Record<string, any>, state: any) => string;
  
  // 1. Parameter Manipulation
  parameters: ParameterDefinition[];
  getDefaultParameters: () => Record<string, any>;
  
  // 2. Dataset Binding
  generateDataset: (sampleCount: number, noiseLevel: number, params: Record<string, any>) => Point[];
  onPointInjected: (newPoint: { x: number; y: number }, currentPoints: Point[], state: any, params: Record<string, any>) => Point;
  
  // 3. Compute State & Metrics
  computeState: (points: Point[], params: Record<string, any>, manualState: Record<string, any>) => any;
  computeMetrics: (points: Point[], state: any, params: Record<string, any>) => AlgorithmMetric[];
  
  // 4. Interactive Visualization Updates
  renderCanvas: (ctx: InteractiveAlgorithmContext, state: any) => React.ReactNode;
  handleCanvasDrag?: (x: number, y: number, ctx: InteractiveAlgorithmContext, state: any) => void;
  
  // 5. Code Telemetry
  generateCode: (framework: 'sklearn' | 'pytorch', points: Point[], params: Record<string, any>, state: any) => string;
  
  // Socratic Intuition guidance
  getSocraticPrompt?: (params: Record<string, any>, metrics: AlgorithmMetric[], state: any) => string;
  defaultSocraticExplanation?: string;
}

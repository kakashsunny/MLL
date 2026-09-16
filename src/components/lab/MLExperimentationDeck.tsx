import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  Layers, 
  RotateCcw, 
  Play, 
  Pause, 
  Check, 
  Copy, 
  Info, 
  ArrowRight, 
  Cpu, 
  Activity, 
  Zap, 
  Code2, 
  Maximize2,
  TrendingUp,
  Sliders,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { SelfApiKeyButton } from '../common/SelfApiKeyButton';

export type ActivationType = 'relu' | 'sigmoid' | 'tanh' | 'leaky_relu' | 'linear';

export interface ActivationInfo {
  id: ActivationType;
  name: string;
  formula: string;
  derivative: string;
  range: string;
  badgeColor: string;
  borderColor: string;
  textColor: string;
  bgColor: string;
  description: string;
  analogy: string;
  pros: string;
  cons: string;
  evaluate: (z: number) => number;
  gradient: (z: number) => number;
}

export const ACTIVATIONS: Record<ActivationType, ActivationInfo> = {
  relu: {
    id: 'relu',
    name: 'ReLU',
    formula: 'f(z) = max(0, z)',
    derivative: "f'(z) = 1 if z > 0 else 0",
    range: '[0, +∞)',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    borderColor: 'border-amber-600',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    description: 'Rectified Linear Unit zeroes out any negative input and passes positive signals unmodified.',
    analogy: 'Like a one-way electrical diode: current flows forward freely, but reversed current is completely blocked.',
    pros: 'Lightning-fast computation, avoids vanishing gradients for positive inputs.',
    cons: 'Dying ReLU: neurons receiving persistent negative inputs become permanently inactive.',
    evaluate: (z: number) => Math.max(0, z),
    gradient: (z: number) => (z > 0 ? 1 : 0),
  },
  sigmoid: {
    id: 'sigmoid',
    name: 'Sigmoid',
    formula: 'σ(z) = 1 / (1 + e^(-z))',
    derivative: "σ'(z) = σ(z)(1 - σ(z))",
    range: '(0, 1)',
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    borderColor: 'border-sky-600',
    textColor: 'text-sky-700',
    bgColor: 'bg-sky-50',
    description: 'Smooth S-curve that squashes any real value into a normalized probabilistic range between 0 and 1.',
    analogy: 'Like a dimmer switch: smoothly dials brightness from completely off (0) to fully bright (1).',
    pros: 'Interpretable as probabilities; smooth differentiable gradient everywhere.',
    cons: 'Vanishing gradient problem: gradients saturate to near-zero when |z| is large, stalling deep networks.',
    evaluate: (z: number) => 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, z)))),
    gradient: (z: number) => {
      const s = 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, z))));
      return s * (1 - s);
    },
  },
  tanh: {
    id: 'tanh',
    name: 'Tanh',
    formula: 'tanh(z) = (e^z - e^(-z)) / (e^z + e^(-z))',
    derivative: "tanh'(z) = 1 - tanh²(z)",
    range: '(-1, 1)',
    badgeColor: 'bg-violet-100 text-violet-900 border-violet-300',
    borderColor: 'border-violet-600',
    textColor: 'text-violet-700',
    bgColor: 'bg-violet-50',
    description: 'Zero-centered hyperbolic tangent that squashes inputs into (-1, 1) with steeper gradients than Sigmoid.',
    analogy: 'Like a balance scale oscillating around zero: negative evidence tips down to -1, positive tips up to +1.',
    pros: 'Zero-centered outputs prevent zigzagging weight updates during gradient descent.',
    cons: 'Still suffers from gradient saturation at extreme values (though less severely than Sigmoid).',
    evaluate: (z: number) => Math.tanh(Math.max(-10, Math.min(10, z))),
    gradient: (z: number) => {
      const t = Math.tanh(Math.max(-10, Math.min(10, z)));
      return 1 - t * t;
    },
  },
  leaky_relu: {
    id: 'leaky_relu',
    name: 'Leaky ReLU',
    formula: 'f(z) = max(0.1z, z)',
    derivative: "f'(z) = 1 if z > 0 else 0.1",
    range: '(-∞, +∞)',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    borderColor: 'border-emerald-600',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    description: 'Variation of ReLU with a small positive slope for negative inputs to prevent dead neurons.',
    analogy: 'A diode with a tiny intentional leak, ensuring current is never completely trapped.',
    pros: 'Completely eliminates the dying ReLU problem while retaining linear efficiency.',
    cons: 'Introduces a hyperparameter (slope coefficient alpha) that requires tuning.',
    evaluate: (z: number) => (z > 0 ? z : 0.1 * z),
    gradient: (z: number) => (z > 0 ? 1 : 0.1),
  },
  linear: {
    id: 'linear',
    name: 'Linear (Identity)',
    formula: 'f(z) = z',
    derivative: "f'(z) = 1",
    range: '(-∞, +∞)',
    badgeColor: 'bg-stone-100 text-stone-900 border-stone-300',
    borderColor: 'border-stone-500',
    textColor: 'text-stone-700',
    bgColor: 'bg-stone-50',
    description: 'No non-linearity applied. Multiple linear layers collapse into a single flat affine transformation.',
    analogy: 'Looking through multiple clear glass panes: stacking them still leaves a flat clear view.',
    pros: 'Ideal for standard regression output layers predicting unconstrained values.',
    cons: 'Cannot model non-linear boundaries. Even a 100-layer network remains strictly linear!',
    evaluate: (z: number) => z,
    gradient: () => 1,
  },
};

export type DatasetType = 'circles' | 'xor' | 'moons' | 'spiral';

interface DataPoint {
  x: number;
  y: number;
  label: 0 | 1;
}

export const MLExperimentationDeck: React.FC = () => {
  // Architecture configuration
  const [layer1Activation, setLayer1Activation] = useState<ActivationType>('relu');
  const [layer2Activation, setLayer2Activation] = useState<ActivationType>('tanh');
  const [outputActivation, setOutputActivation] = useState<ActivationType>('sigmoid');
  const [useTwoHiddenLayers, setUseTwoHiddenLayers] = useState<boolean>(true);
  const [hiddenLayer1Size, setHiddenLayer1Size] = useState<number>(4);
  const [hiddenLayer2Size, setHiddenLayer2Size] = useState<number>(3);

  // Dataset & training controls
  const [datasetType, setDatasetType] = useState<DatasetType>('circles');
  const [noise, setNoise] = useState<number>(0.15);
  const [learningRate, setLearningRate] = useState<number>(0.1);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainEpoch, setTrainEpoch] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'guide'>('visual');

  // Drag and drop state
  const [draggedActivation, setDraggedActivation] = useState<ActivationType | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  // Neural network weight matrices
  // Layer 1: [2 x hiddenLayer1Size]
  // Layer 2: [hiddenLayer1Size x hiddenLayer2Size] (if active)
  // Output:  [(hiddenLayer2Size or hiddenLayer1Size) x 1]
  const weightsRef = useRef<{
    w1: number[][];
    b1: number[];
    w2: number[][];
    b2: number[];
    wOut: number[][];
    bOut: number[];
  }>({
    w1: [],
    b1: [],
    w2: [],
    b2: [],
    wOut: [],
    bOut: []
  });

  // Helper to reinitialize weights
  const resetWeights = useCallback(() => {
    const initMatrix = (rows: number, cols: number) => {
      return Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => (Math.random() - 0.5) * 1.5)
      );
    };
    const initVector = (len: number) => {
      return Array.from({ length: len }, () => (Math.random() - 0.5) * 0.2);
    };

    weightsRef.current = {
      w1: initMatrix(2, hiddenLayer1Size),
      b1: initVector(hiddenLayer1Size),
      w2: initMatrix(hiddenLayer1Size, hiddenLayer2Size),
      b2: initVector(hiddenLayer2Size),
      wOut: initMatrix(useTwoHiddenLayers ? hiddenLayer2Size : hiddenLayer1Size, 1),
      bOut: initVector(1),
    };
    setTrainEpoch(0);
  }, [hiddenLayer1Size, hiddenLayer2Size, useTwoHiddenLayers]);

  useEffect(() => {
    resetWeights();
  }, [resetWeights]);

  // Synthetic 2D Datasets
  const dataset = useMemo<DataPoint[]>(() => {
    const points: DataPoint[] = [];
    const countPerClass = 50;

    if (datasetType === 'circles') {
      // Inner Circle = Class 1, Outer Ring = Class 0
      for (let i = 0; i < countPerClass; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const r = Math.sqrt(Math.random()) * 0.5 + (Math.random() - 0.5) * noise;
        points.push({
          x: r * Math.cos(theta),
          y: r * Math.sin(theta),
          label: 1,
        });
      }
      for (let i = 0; i < countPerClass; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const r = 0.8 + Math.random() * 0.35 + (Math.random() - 0.5) * noise;
        points.push({
          x: r * Math.cos(theta),
          y: r * Math.sin(theta),
          label: 0,
        });
      }
    } else if (datasetType === 'xor') {
      // 4 Quadrants: Q1 & Q3 = Class 1; Q2 & Q4 = Class 0
      for (let i = 0; i < countPerClass * 2; i++) {
        const quad = i % 4;
        const signX = quad === 0 || quad === 3 ? 1 : -1;
        const signY = quad === 0 || quad === 1 ? 1 : -1;
        const label = quad === 0 || quad === 2 ? 1 : 0;
        const x = signX * (0.3 + Math.random() * 0.6) + (Math.random() - 0.5) * noise;
        const y = signY * (0.3 + Math.random() * 0.6) + (Math.random() - 0.5) * noise;
        points.push({ x, y, label: label as 0 | 1 });
      }
    } else if (datasetType === 'moons') {
      // Two interlocking half-moons
      for (let i = 0; i < countPerClass; i++) {
        const angle = (i / countPerClass) * Math.PI;
        points.push({
          x: Math.cos(angle) * 0.65 + (Math.random() - 0.5) * noise,
          y: Math.sin(angle) * 0.65 - 0.15 + (Math.random() - 0.5) * noise,
          label: 1,
        });
      }
      for (let i = 0; i < countPerClass; i++) {
        const angle = (i / countPerClass) * Math.PI;
        points.push({
          x: 0.65 - Math.cos(angle) * 0.65 + (Math.random() - 0.5) * noise,
          y: 0.15 - Math.sin(angle) * 0.65 + 0.1 + (Math.random() - 0.5) * noise,
          label: 0,
        });
      }
    } else if (datasetType === 'spiral') {
      // Two intertwining spirals
      for (let i = 0; i < countPerClass; i++) {
        const r = (i / countPerClass) * 0.95;
        const theta = 1.75 * i * 0.15;
        points.push({
          x: r * Math.sin(theta) + (Math.random() - 0.5) * noise,
          y: r * Math.cos(theta) + (Math.random() - 0.5) * noise,
          label: 1,
        });
        points.push({
          x: -r * Math.sin(theta) + (Math.random() - 0.5) * noise,
          y: -r * Math.cos(theta) + (Math.random() - 0.5) * noise,
          label: 0,
        });
      }
    }

    return points;
  }, [datasetType, noise]);

  // Forward pass through network
  const forwardPass = useCallback((x1: number, x2: number) => {
    const { w1, b1, w2, b2, wOut, bOut } = weightsRef.current;
    if (!w1.length || !wOut.length) return 0.5;

    const act1 = ACTIVATIONS[layer1Activation].evaluate;
    const act2 = ACTIVATIONS[layer2Activation].evaluate;
    const actOut = ACTIVATIONS[outputActivation].evaluate;

    // Layer 1
    const h1: number[] = [];
    for (let j = 0; j < hiddenLayer1Size; j++) {
      let z = (b1[j] || 0) + x1 * (w1[0]?.[j] || 0) + x2 * (w1[1]?.[j] || 0);
      h1.push(act1(z));
    }

    // Layer 2 (Optional)
    let lastHidden = h1;
    if (useTwoHiddenLayers) {
      const h2: number[] = [];
      for (let k = 0; k < hiddenLayer2Size; k++) {
        let z = b2[k] || 0;
        for (let j = 0; j < hiddenLayer1Size; j++) {
          z += (h1[j] || 0) * (w2[j]?.[k] || 0);
        }
        h2.push(act2(z));
      }
      lastHidden = h2;
    }

    // Output Layer
    let zOut = bOut[0] || 0;
    for (let i = 0; i < lastHidden.length; i++) {
      zOut += (lastHidden[i] || 0) * (wOut[i]?.[0] || 0);
    }

    return actOut(zOut);
  }, [layer1Activation, layer2Activation, outputActivation, useTwoHiddenLayers, hiddenLayer1Size, hiddenLayer2Size]);

  // Train a single backpropagation epoch
  const trainStep = useCallback(() => {
    const { w1, b1, w2, b2, wOut, bOut } = weightsRef.current;
    if (!w1.length || !wOut.length || !dataset.length) return;

    const act1 = ACTIVATIONS[layer1Activation].evaluate;
    const grad1 = ACTIVATIONS[layer1Activation].gradient;
    const act2 = ACTIVATIONS[layer2Activation].evaluate;
    const grad2 = ACTIVATIONS[layer2Activation].gradient;
    const actOut = ACTIVATIONS[outputActivation].evaluate;
    const gradOut = ACTIVATIONS[outputActivation].gradient;

    const lr = learningRate;

    // Mini-batch or stochastic update over sample subset
    for (const pt of dataset) {
      const x1 = pt.x;
      const x2 = pt.y;
      const target = pt.label;

      // 1. Forward pass saving pre-activations
      const z1: number[] = [];
      const a1: number[] = [];
      for (let j = 0; j < hiddenLayer1Size; j++) {
        const val = (b1[j] || 0) + x1 * (w1[0]?.[j] || 0) + x2 * (w1[1]?.[j] || 0);
        z1.push(val);
        a1.push(act1(val));
      }

      const z2: number[] = [];
      const a2: number[] = [];
      let finalHidden = a1;

      if (useTwoHiddenLayers) {
        for (let k = 0; k < hiddenLayer2Size; k++) {
          let val = b2[k] || 0;
          for (let j = 0; j < hiddenLayer1Size; j++) {
            val += (a1[j] || 0) * (w2[j]?.[k] || 0);
          }
          z2.push(val);
          a2.push(act2(val));
        }
        finalHidden = a2;
      }

      let zOut = bOut[0] || 0;
      for (let i = 0; i < finalHidden.length; i++) {
        zOut += (finalHidden[i] || 0) * (wOut[i]?.[0] || 0);
      }
      const yPred = actOut(zOut);

      // 2. Output error derivative dL/dzOut
      const error = yPred - target;
      const dZOut = error * gradOut(zOut);

      // 3. Backprop through Layer 2 / Layer 1
      if (useTwoHiddenLayers) {
        const dZ2: number[] = [];
        for (let k = 0; k < hiddenLayer2Size; k++) {
          const delta = dZOut * (wOut[k]?.[0] || 0) * grad2(z2[k]);
          dZ2.push(delta);
        }

        const dZ1: number[] = [];
        for (let j = 0; j < hiddenLayer1Size; j++) {
          let acc = 0;
          for (let k = 0; k < hiddenLayer2Size; k++) {
            acc += dZ2[k] * (w2[j]?.[k] || 0);
          }
          dZ1.push(acc * grad1(z1[j]));
        }

        // Apply gradients
        for (let k = 0; k < hiddenLayer2Size; k++) {
          wOut[k][0] -= lr * dZOut * a2[k];
        }
        bOut[0] -= lr * dZOut;

        for (let j = 0; j < hiddenLayer1Size; j++) {
          for (let k = 0; k < hiddenLayer2Size; k++) {
            w2[j][k] -= lr * dZ2[k] * a1[j];
          }
        }
        for (let k = 0; k < hiddenLayer2Size; k++) {
          b2[k] -= lr * dZ2[k];
        }

        for (let j = 0; j < hiddenLayer1Size; j++) {
          w1[0][j] -= lr * dZ1[j] * x1;
          w1[1][j] -= lr * dZ1[j] * x2;
          b1[j] -= lr * dZ1[j];
        }
      } else {
        const dZ1: number[] = [];
        for (let j = 0; j < hiddenLayer1Size; j++) {
          const delta = dZOut * (wOut[j]?.[0] || 0) * grad1(z1[j]);
          dZ1.push(delta);
        }

        for (let j = 0; j < hiddenLayer1Size; j++) {
          wOut[j][0] -= lr * dZOut * a1[j];
          w1[0][j] -= lr * dZ1[j] * x1;
          w1[1][j] -= lr * dZ1[j] * x2;
          b1[j] -= lr * dZ1[j];
        }
        bOut[0] -= lr * dZOut;
      }
    }

    setTrainEpoch(prev => prev + 1);
  }, [dataset, hiddenLayer1Size, hiddenLayer2Size, layer1Activation, layer2Activation, learningRate, outputActivation, useTwoHiddenLayers]);

  // Continuous training loop
  useEffect(() => {
    if (!isTraining) return;
    const interval = setInterval(() => {
      for (let i = 0; i < 5; i++) {
        trainStep();
      }
    }, 40);
    return () => clearInterval(interval);
  }, [isTraining, trainStep]);

  // Real-time Loss and Accuracy calculation
  const metrics = useMemo(() => {
    if (!dataset.length) return { loss: 0, accuracy: 0, gradientHealth: 'Optimal' };
    let totalLoss = 0;
    let correct = 0;

    for (const pt of dataset) {
      const pred = forwardPass(pt.x, pt.y);
      // Binary Cross Entropy with clamp
      const p = Math.max(1e-7, Math.min(1 - 1e-7, pred));
      const loss = -(pt.label * Math.log(p) + (1 - pt.label) * Math.log(1 - p));
      totalLoss += loss;

      const predictedClass = pred >= 0.5 ? 1 : 0;
      if (predictedClass === pt.label) correct++;
    }

    const accuracy = Math.round((correct / dataset.length) * 100);
    const avgLoss = Number((totalLoss / dataset.length).toFixed(3));

    // Analyze gradient flow health based on activation configuration
    let gradientHealth = 'High Energy';
    if (layer1Activation === 'sigmoid' && layer2Activation === 'sigmoid' && useTwoHiddenLayers) {
      gradientHealth = 'Vanishing Risk (Sigmoid Stacking)';
    } else if (layer1Activation === 'linear' && (!useTwoHiddenLayers || layer2Activation === 'linear')) {
      gradientHealth = 'Strictly Linear (No Non-Linear Warp)';
    } else if (layer1Activation === 'relu') {
      gradientHealth = 'Robust (Active ReLU Flow)';
    }

    return { loss: avgLoss, accuracy, gradientHealth };
  }, [dataset, forwardPass, layer1Activation, layer2Activation, useTwoHiddenLayers]);

  // Canvas Decision Boundary Renderer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const resolution = 40; // 40x40 decision boundary grid
    const cellW = width / resolution;
    const cellH = height / resolution;

    // Range: [-1.2, 1.2]
    for (let gx = 0; gx < resolution; gx++) {
      for (let gy = 0; gy < resolution; gy++) {
        const x = -1.2 + (gx / (resolution - 1)) * 2.4;
        const y = 1.2 - (gy / (resolution - 1)) * 2.4; // inverted y for canvas
        const pred = forwardPass(x, y);

        // Color interpolate: 0 = Coral (#f87171), 1 = Blue (#38bdf8), 0.5 = Neutral
        const p = Math.max(0, Math.min(1, pred));
        // Soft pastels matching technical blueprint
        const r = Math.round(250 * (1 - p) + 56 * p);
        const g = Math.round(180 * (1 - p) + 189 * p);
        const b = Math.round(180 * (1 - p) + 248 * p);
        const alpha = 0.55 + Math.abs(p - 0.5) * 0.4;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fillRect(gx * cellW, gy * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

    // Draw decision contour (threshold = 0.5)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#111111';

    // Draw coordinate axes
    ctx.strokeStyle = 'rgba(17, 17, 17, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Draw training points
    for (const pt of dataset) {
      const cx = ((pt.x + 1.2) / 2.4) * width;
      const cy = ((-pt.y + 1.2) / 2.4) * height;

      ctx.beginPath();
      ctx.arc(cx, cy, 5.5, 0, 2 * Math.PI);
      if (pt.label === 1) {
        ctx.fillStyle = '#0284c7'; // Sky-600
        ctx.strokeStyle = '#082f49';
      } else {
        ctx.fillStyle = '#ef4444'; // Red-500
        ctx.strokeStyle = '#450a0a';
      }
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    }
  }, [dataset, forwardPass, trainEpoch]);

  // Drag and Drop handlers
  const handleDragStart = (actId: ActivationType) => {
    setDraggedActivation(actId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverTarget !== targetId) {
      setDragOverTarget(targetId);
    }
  };

  const handleDragLeave = () => {
    setDragOverTarget(null);
  };

  const handleDrop = (e: React.DragEvent, targetSlot: 'layer1' | 'layer2' | 'output') => {
    e.preventDefault();
    setDragOverTarget(null);
    if (!draggedActivation) return;

    if (targetSlot === 'layer1') {
      setLayer1Activation(draggedActivation);
    } else if (targetSlot === 'layer2') {
      setLayer2Activation(draggedActivation);
    } else if (targetSlot === 'output') {
      setOutputActivation(draggedActivation);
    }
    setDraggedActivation(null);
  };

  // Direct click slotting (for touchscreens or fast switching)
  const assignActivation = (actId: ActivationType, slot: 'layer1' | 'layer2' | 'output') => {
    if (slot === 'layer1') setLayer1Activation(actId);
    if (slot === 'layer2') setLayer2Activation(actId);
    if (slot === 'output') setOutputActivation(actId);
  };

  // Presets
  const applyPreset = (preset: 'relu_sharp' | 'tanh_smooth' | 'sigmoid_vanish' | 'hybrid' | 'linear_collapse') => {
    setIsTraining(false);
    if (preset === 'relu_sharp') {
      setLayer1Activation('relu');
      setLayer2Activation('relu');
      setOutputActivation('sigmoid');
      setUseTwoHiddenLayers(true);
    } else if (preset === 'tanh_smooth') {
      setLayer1Activation('tanh');
      setLayer2Activation('tanh');
      setOutputActivation('sigmoid');
      setUseTwoHiddenLayers(true);
    } else if (preset === 'sigmoid_vanish') {
      setLayer1Activation('sigmoid');
      setLayer2Activation('sigmoid');
      setOutputActivation('sigmoid');
      setUseTwoHiddenLayers(true);
    } else if (preset === 'hybrid') {
      setLayer1Activation('relu');
      setLayer2Activation('tanh');
      setOutputActivation('sigmoid');
      setUseTwoHiddenLayers(true);
    } else if (preset === 'linear_collapse') {
      setLayer1Activation('linear');
      setLayer2Activation('linear');
      setOutputActivation('linear');
      setUseTwoHiddenLayers(true);
    }
    resetWeights();
  };

  // Generated PyTorch code telemetry
  const generatedPyTorchCode = useMemo(() => {
    const pyAct = (a: ActivationType) => {
      switch (a) {
        case 'relu': return 'nn.ReLU()';
        case 'sigmoid': return 'nn.Sigmoid()';
        case 'tanh': return 'nn.Tanh()';
        case 'leaky_relu': return 'nn.LeakyReLU(negative_slope=0.1)';
        case 'linear': return 'nn.Identity() # Linear passthrough';
      }
    };

    return `# PyTorch Model reflecting current Drag-and-Drop Architecture
import torch
import torch.nn as nn

class CustomExperimentationNet(nn.Module):
    def __init__(self):
        super().__init__()
        layers = [
            nn.Linear(2, ${hiddenLayer1Size}),
            ${pyAct(layer1Activation)},
        ]
        ${useTwoHiddenLayers ? `
        layers.extend([
            nn.Linear(${hiddenLayer1Size}, ${hiddenLayer2Size}),
            ${pyAct(layer2Activation)},
        ])
        layers.append(nn.Linear(${hiddenLayer2Size}, 1))
        ` : `
        layers.append(nn.Linear(${hiddenLayer1Size}, 1))
        `}
        layers.append(${pyAct(outputActivation)})
        self.network = nn.Sequential(*layers)

    def forward(self, x):
        return self.network(x)

# Instantiate and verify forward pass
model = CustomExperimentationNet()
sample_input = torch.randn(8, 2)
output = model(sample_input)
print("Output shape:", output.shape)
`;
  }, [hiddenLayer1Size, hiddenLayer2Size, layer1Activation, layer2Activation, outputActivation, useTwoHiddenLayers]);

  return (
    <div id="ml_experimentation_deck_container" className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="bg-[#FAF8F2] border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-[2px] border-[#111111] pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1A42D9] animate-pulse" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-stone-600 font-bold">
                NEURAL FORGE LABS • REAL-TIME EXPERIMENTATION DECK
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#1A42D9] bg-blue-50 text-[#1A42D9] font-bold">
                Drag-and-Drop Architecture
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#111111] mt-1 flex items-center gap-2">
              <span>ML Experimentation Deck</span>
            </h2>
            <p className="text-xs text-stone-600 font-mono mt-0.5">
              Drag activation function cartridges (ReLU, Sigmoid, Tanh) directly into neural network layers to observe real-time decision boundary warping and gradient telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <SelfApiKeyButton variant="compact" label="AI Key" />
            
            <div className="flex items-center bg-white border-[2px] border-[#111111] p-0.5 shadow-[2px_2px_0px_0px_#111111]">
              <button
                onClick={() => setActiveTab('visual')}
                className={`px-3 py-1 text-xs font-mono font-bold transition-all ${
                  activeTab === 'visual' ? 'bg-[#111111] text-white' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                Visual Lab
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 text-xs font-mono font-bold transition-all ${
                  activeTab === 'code' ? 'bg-[#111111] text-white' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                PyTorch Code
              </button>
              <button
                onClick={() => setActiveTab('guide')}
                className={`px-3 py-1 text-xs font-mono font-bold transition-all ${
                  activeTab === 'guide' ? 'bg-[#111111] text-white' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                Activation Guide
              </button>
            </div>
          </div>
        </div>

        {/* Quick Architecture Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-3.5">
          <span className="text-[11px] font-mono font-bold text-stone-700 uppercase flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-600" /> Presets:
          </span>
          {[
            { id: 'relu_sharp', label: 'All ReLU (Sharp Cuts)', hint: 'Non-linear sharp polyhedrals' },
            { id: 'tanh_smooth', label: 'All Tanh (Smooth)', hint: 'Zero-centered smooth transitions' },
            { id: 'sigmoid_vanish', label: 'All Sigmoid (Vanishing)', hint: 'Saturating gradients' },
            { id: 'hybrid', label: 'Hybrid (ReLU + Tanh + Sigmoid)', hint: 'Best balance' },
            { id: 'linear_collapse', label: 'All Linear (Collapse)', hint: 'Fails non-linear data' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id as any)}
              className="px-2.5 py-1 text-[11px] font-mono border border-stone-300 bg-white hover:border-[#111111] hover:bg-stone-100 text-stone-800 transition-all shadow-xs"
              title={p.hint}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MAIN LAB AREA */}
      {activeTab === 'visual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* LEFT: Activation Function Palette (Draggable Deck) - 4 cols */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#1A42D9]" />
                  <h3 className="font-extrabold text-xs uppercase font-mono tracking-wider text-[#111111]">
                    Activation Cartridges
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-stone-500">Drag or Click to Slot</span>
              </div>

              <p className="text-xs text-stone-600 font-sans leading-relaxed">
                Grab an activation card below and <strong>drag & drop</strong> it into any layer socket, or use the quick slot buttons.
              </p>

              {/* Draggable Cards */}
              <div className="space-y-2.5">
                {(Object.keys(ACTIVATIONS) as ActivationType[]).map(actId => {
                  const act = ACTIVATIONS[actId];
                  const isBeingDragged = draggedActivation === actId;
                  const isPrimaryRequested = actId === 'relu' || actId === 'sigmoid' || actId === 'tanh';

                  return (
                    <div
                      key={actId}
                      draggable
                      onDragStart={() => handleDragStart(actId)}
                      onDragEnd={() => setDraggedActivation(null)}
                      className={`p-3 border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] cursor-grab active:cursor-grabbing transition-all select-none bg-[#FAF8F2] hover:bg-white ${
                        isBeingDragged ? 'opacity-40 scale-95 border-dashed' : ''
                      } ${isPrimaryRequested ? 'ring-1 ring-stone-900' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-sm font-mono text-[#111111]">
                              {act.name}
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${act.badgeColor}`}>
                              {act.range}
                            </span>
                            {isPrimaryRequested && (
                              <span className="text-[9px] font-mono bg-stone-900 text-white px-1 py-0.2 font-bold">
                                CORE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-[#1A42D9] font-bold mt-0.5">
                            {act.formula}
                          </div>
                        </div>

                        {/* Mini visual curve preview */}
                        <svg className="w-14 h-8 bg-white border border-stone-300 shrink-0" viewBox="-2 -2 4 4">
                          <line x1="-2" y1="0" x2="2" y2="0" stroke="#e5e5e5" strokeWidth="0.3" />
                          <line x1="0" y1="-2" x2="0" y2="2" stroke="#e5e5e5" strokeWidth="0.3" />
                          <path
                            d={
                              actId === 'relu'
                                ? 'M -2,0 L 0,0 L 2,2'
                                : actId === 'sigmoid'
                                  ? 'M -2,-0.9 C -0.8,-0.9 -0.5,-0.7 0,0 C 0.5,0.7 0.8,0.9 2,0.9'
                                  : actId === 'tanh'
                                    ? 'M -2,-1.5 C -0.8,-1.5 -0.4,-1.2 0,0 C 0.4,1.2 0.8,1.5 2,1.5'
                                    : actId === 'leaky_relu'
                                      ? 'M -2,-0.2 L 0,0 L 2,2'
                                      : 'M -2,-2 L 2,2'
                            }
                            fill="none"
                            stroke="#1A42D9"
                            strokeWidth="0.5"
                          />
                        </svg>
                      </div>

                      <p className="text-[11px] text-stone-600 mt-1.5 line-clamp-2 leading-tight">
                        {act.description}
                      </p>

                      {/* Quick Assign Buttons */}
                      <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-stone-200">
                        <span className="text-[10px] font-mono text-stone-500 mr-1 font-bold">Slot to:</span>
                        <button
                          onClick={() => assignActivation(actId, 'layer1')}
                          className={`px-1.5 py-0.5 text-[10px] font-mono border transition-all ${
                            layer1Activation === actId
                              ? 'bg-stone-900 text-white font-bold border-stone-900'
                              : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-300'
                          }`}
                        >
                          L1 {layer1Activation === actId && '✓'}
                        </button>
                        {useTwoHiddenLayers && (
                          <button
                            onClick={() => assignActivation(actId, 'layer2')}
                            className={`px-1.5 py-0.5 text-[10px] font-mono border transition-all ${
                              layer2Activation === actId
                                ? 'bg-stone-900 text-white font-bold border-stone-900'
                                : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-300'
                            }`}
                          >
                            L2 {layer2Activation === actId && '✓'}
                          </button>
                        )}
                        <button
                          onClick={() => assignActivation(actId, 'output')}
                          className={`px-1.5 py-0.5 text-[10px] font-mono border transition-all ${
                            outputActivation === actId
                              ? 'bg-stone-900 text-white font-bold border-stone-900'
                              : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-300'
                          }`}
                        >
                          Out {outputActivation === actId && '✓'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Architecture Sizing Controls */}
            <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-stone-800" />
                  <h3 className="font-extrabold text-xs uppercase font-mono tracking-wider text-[#111111]">
                    Layer Topologies
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-stone-700 mb-1">
                    <span>Hidden Layer 1 Neurons:</span>
                    <span className="font-bold text-[#111111]">{hiddenLayer1Size} units</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    step="1"
                    value={hiddenLayer1Size}
                    onChange={e => setHiddenLayer1Size(Number(e.target.value))}
                    className="w-full accent-[#111111]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                  <span className="text-stone-700">Enable Hidden Layer 2:</span>
                  <button
                    onClick={() => setUseTwoHiddenLayers(!useTwoHiddenLayers)}
                    className={`px-2.5 py-0.5 text-xs font-bold border border-[#111111] ${
                      useTwoHiddenLayers ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {useTwoHiddenLayers ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>

                {useTwoHiddenLayers && (
                  <div>
                    <div className="flex justify-between text-stone-700 mb-1">
                      <span>Hidden Layer 2 Neurons:</span>
                      <span className="font-bold text-[#111111]">{hiddenLayer2Size} units</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="5"
                      step="1"
                      value={hiddenLayer2Size}
                      onChange={e => setHiddenLayer2Size(Number(e.target.value))}
                      className="w-full accent-[#111111]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Visual Neural Architecture + Output Boundary - 8 cols */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Real-time Decision Boundary & Metrics */}
            <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] p-4 sm:p-5 space-y-4">
              
              {/* Top Controls Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E2D9] pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-stone-700 uppercase">Dataset Geometry:</span>
                  {[
                    { id: 'circles', label: 'Concentric Rings' },
                    { id: 'xor', label: 'XOR Quadrants' },
                    { id: 'moons', label: 'Two Moons' },
                    { id: 'spiral', label: 'Spirals' },
                  ].map(d => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setDatasetType(d.id as any);
                        resetWeights();
                      }}
                      className={`px-2.5 py-1 text-xs font-mono transition-all border ${
                        datasetType === d.id
                          ? 'bg-[#111111] text-white font-bold border-[#111111]'
                          : 'bg-[#FAF8F2] text-stone-700 hover:bg-stone-200 border-stone-300'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {/* Train / Step Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsTraining(!isTraining)}
                    className={`px-3.5 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${
                      isTraining ? 'bg-amber-400 text-stone-900' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isTraining ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isTraining ? 'Pause Training' : 'Auto Train'}</span>
                  </button>

                  <button
                    onClick={() => trainStep()}
                    className="px-2.5 py-1.5 text-xs font-mono font-bold bg-white hover:bg-stone-100 text-stone-800 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    title="Train 1 step"
                  >
                    Step +1
                  </button>

                  <button
                    onClick={resetWeights}
                    className="p-1.5 text-stone-600 hover:text-[#111111] hover:bg-stone-100 border border-stone-300"
                    title="Re-randomize weights"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Live Canvas + Interactive Drop Sockets Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                
                {/* Visual Canvas (5 cols) */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="relative border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111] bg-stone-50 overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={260}
                      height={260}
                      className="w-[260px] h-[260px] block"
                    />
                    
                    {/* Canvas legend */}
                    <div className="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 border border-stone-400 text-[9px] font-mono text-stone-800 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#0284c7]" /> Class 1
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#ef4444]" /> Class 0
                      </span>
                    </div>

                    {isTraining && (
                      <div className="absolute top-1.5 right-1.5 bg-amber-400 text-stone-900 px-2 py-0.5 text-[9px] font-mono font-bold flex items-center gap-1 animate-pulse border border-[#111111]">
                        <Activity className="w-3 h-3" /> Training Active
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] font-mono text-stone-500 mt-2 text-center">
                    Epoch: <span className="font-bold text-[#111111]">{trainEpoch}</span> • Resolution: 40x40 grid
                  </div>
                </div>

                {/* Live Architecture Drop Sockets (7 cols) */}
                <div className="md:col-span-7 space-y-3">
                  <div className="border border-stone-200 p-2.5 bg-[#FAF8F2]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block mb-1">
                      Interactive Drop Sockets
                    </span>
                    <p className="text-xs text-stone-600 font-sans">
                      Drop activation function cards onto the designated sockets below to immediately alter mathematical transformations:
                    </p>
                  </div>

                  {/* DROP TARGET: Layer 1 */}
                  <div
                    onDragOver={(e) => handleDragOver(e, 'layer1')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'layer1')}
                    className={`p-3 border-[2px] transition-all ${
                      dragOverTarget === 'layer1'
                        ? 'border-[#1A42D9] bg-blue-50/70 border-dashed ring-2 ring-[#1A42D9]'
                        : 'border-[#111111] bg-white'
                    } shadow-[2px_2px_0px_0px_#111111]`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-xs font-mono font-bold text-[#111111]">
                          Hidden Layer 1 Socket ({hiddenLayer1Size} Neurons)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400">DROP HERE</span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-[#FAF8F2] border border-stone-300">
                      <div>
                        <span className="text-xs font-mono font-extrabold text-[#1A42D9] uppercase">
                          {ACTIVATIONS[layer1Activation].name}
                        </span>
                        <span className="text-[10px] font-mono text-stone-600 block">
                          {ACTIVATIONS[layer1Activation].formula}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {(['relu', 'tanh', 'sigmoid'] as ActivationType[]).map(act => (
                          <button
                            key={act}
                            onClick={() => setLayer1Activation(act)}
                            className={`px-1.5 py-0.5 text-[10px] font-mono border ${
                              layer1Activation === act
                                ? 'bg-[#111111] text-white font-bold border-[#111111]'
                                : 'bg-white text-stone-600 hover:bg-stone-100 border-stone-200'
                            }`}
                          >
                            {ACTIVATIONS[act].name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* DROP TARGET: Layer 2 (If active) */}
                  {useTwoHiddenLayers && (
                    <div
                      onDragOver={(e) => handleDragOver(e, 'layer2')}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'layer2')}
                      className={`p-3 border-[2px] transition-all ${
                        dragOverTarget === 'layer2'
                          ? 'border-[#1A42D9] bg-blue-50/70 border-dashed ring-2 ring-[#1A42D9]'
                          : 'border-[#111111] bg-white'
                      } shadow-[2px_2px_0px_0px_#111111]`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-violet-500" />
                          <span className="text-xs font-mono font-bold text-[#111111]">
                            Hidden Layer 2 Socket ({hiddenLayer2Size} Neurons)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-stone-400">DROP HERE</span>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-[#FAF8F2] border border-stone-300">
                        <div>
                          <span className="text-xs font-mono font-extrabold text-violet-700 uppercase">
                            {ACTIVATIONS[layer2Activation].name}
                          </span>
                          <span className="text-[10px] font-mono text-stone-600 block">
                            {ACTIVATIONS[layer2Activation].formula}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {(['tanh', 'relu', 'sigmoid'] as ActivationType[]).map(act => (
                            <button
                              key={act}
                              onClick={() => setLayer2Activation(act)}
                              className={`px-1.5 py-0.5 text-[10px] font-mono border ${
                                layer2Activation === act
                                  ? 'bg-[#111111] text-white font-bold border-[#111111]'
                                  : 'bg-white text-stone-600 hover:bg-stone-100 border-stone-200'
                              }`}
                            >
                              {ACTIVATIONS[act].name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DROP TARGET: Output Layer */}
                  <div
                    onDragOver={(e) => handleDragOver(e, 'output')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'output')}
                    className={`p-3 border-[2px] transition-all ${
                      dragOverTarget === 'output'
                        ? 'border-[#1A42D9] bg-blue-50/70 border-dashed ring-2 ring-[#1A42D9]'
                        : 'border-[#111111] bg-white'
                    } shadow-[2px_2px_0px_0px_#111111]`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-mono font-bold text-[#111111]">
                          Output Layer Socket (1 Neuron • ŷ)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400">DROP HERE</span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-[#FAF8F2] border border-stone-300">
                      <div>
                        <span className="text-xs font-mono font-extrabold text-emerald-700 uppercase">
                          {ACTIVATIONS[outputActivation].name}
                        </span>
                        <span className="text-[10px] font-mono text-stone-600 block">
                          {ACTIVATIONS[outputActivation].formula}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {(['sigmoid', 'linear', 'tanh'] as ActivationType[]).map(act => (
                          <button
                            key={act}
                            onClick={() => setOutputActivation(act)}
                            className={`px-1.5 py-0.5 text-[10px] font-mono border ${
                              outputActivation === act
                                ? 'bg-[#111111] text-white font-bold border-[#111111]'
                                : 'bg-white text-stone-600 hover:bg-stone-100 border-stone-200'
                            }`}
                          >
                            {ACTIVATIONS[act].name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Live Telemetry Meters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E5E2D9]">
                <div className="bg-[#FAF8F2] border border-stone-300 p-3 space-y-1">
                  <div className="text-[10px] uppercase font-mono text-stone-500 font-bold">Accuracy Score</div>
                  <div className="text-2xl font-black font-mono text-[#111111] flex items-baseline gap-1">
                    <span>{metrics.accuracy}%</span>
                    <span className="text-xs text-stone-500 font-normal">correct</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 rounded-none overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${metrics.accuracy}%` }}
                    />
                  </div>
                </div>

                <div className="bg-[#FAF8F2] border border-stone-300 p-3 space-y-1">
                  <div className="text-[10px] uppercase font-mono text-stone-500 font-bold">Binary Cross-Entropy Loss</div>
                  <div className="text-2xl font-black font-mono text-[#111111] flex items-baseline gap-1">
                    <span>{metrics.loss}</span>
                    <span className="text-xs text-stone-500 font-normal">BCE</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 rounded-none overflow-hidden">
                    <div 
                      className="h-full bg-[#1A42D9] transition-all duration-300"
                      style={{ width: `${Math.min(100, metrics.loss * 50)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-[#FAF8F2] border border-stone-300 p-3 space-y-1">
                  <div className="text-[10px] uppercase font-mono text-stone-500 font-bold">Gradient Flow Health</div>
                  <div className="text-xs font-bold font-mono text-stone-800 leading-tight pt-1">
                    {metrics.gradientHealth}
                  </div>
                  <p className="text-[10px] font-sans text-stone-600 leading-snug">
                    {layer1Activation === 'sigmoid' && layer2Activation === 'sigmoid'
                      ? 'Sigmoid gradients decay fast in deep chains.'
                      : 'Non-saturating paths enable rapid parameter convergence.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Socratic Feedback on Current Setup */}
            <div className="bg-amber-50/70 border-[2px] border-amber-800/80 p-4 space-y-2 shadow-[3px_3px_0px_0px_#78350f]">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs font-mono">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>EXPERIMENTATION INTUITION: WHAT YOU ARE SEEING</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed font-sans">
                {layer1Activation === 'relu' && (
                  <>
                    <strong>ReLU Active in Layer 1:</strong> Notice how the decision contours exhibit straight, faceted creases. Because ReLU is piecewise linear ($z$ for positive, $0$ for negative), the network carves decision spaces using straight polyhedral folds.
                  </>
                )}
                {layer1Activation === 'tanh' && (
                  <>
                    <strong>Tanh Active in Layer 1:</strong> The decision boundary flows in smooth, continuous curves. Because Tanh is zero-centered and non-linear everywhere, transitions from Class 0 to Class 1 are gentle and continuous.
                  </>
                )}
                {layer1Activation === 'sigmoid' && (
                  <>
                    <strong>Sigmoid Active in Layer 1:</strong> Observe that training might progress slower than ReLU. Sigmoid derivatives max out at only $0.25$, which progressively diminishes the backpropagated error signal as it passes backwards.
                  </>
                )}
                {layer1Activation === 'linear' && (
                  <>
                    <strong>Linear Passthrough Active:</strong> Notice the network cannot solve circular or XOR shapes! Without a non-linear activation function, all layers collapse into a single linear equation W_2(W_1 x + b_1) + b_2 = W_eff x + b_eff, producing only a straight line.
                  </>
                )}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: Generated Code Telemetry */}
      {activeTab === 'code' && (
        <div className="bg-[#111111] text-stone-200 border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] p-5 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#1A42D9]" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Live PyTorch Implementation (Synchronized)
              </span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedPyTorchCode);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-xs text-white border border-stone-600 flex items-center gap-1.5 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied to Clipboard' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="text-xs leading-relaxed overflow-x-auto p-3 bg-black/50 border border-stone-800 text-emerald-400">
            {generatedPyTorchCode}
          </pre>
        </div>
      )}

      {/* TAB 3: Activation Functions Educational Guide */}
      {activeTab === 'guide' && (
        <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] p-5 space-y-4">
          <div className="border-b border-[#E5E2D9] pb-3">
            <h3 className="text-base font-extrabold font-mono text-[#111111]">
              Activation Functions Compendium: Deep Dive
            </h3>
            <p className="text-xs text-stone-600 font-sans mt-0.5">
              Why do neural networks need non-linear activations? Compare trade-offs between ReLU, Sigmoid, Tanh, and Leaky ReLU.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(ACTIVATIONS) as ActivationType[]).map(actId => {
              const act = ACTIVATIONS[actId];
              return (
                <div key={actId} className="border-[2px] border-[#111111] p-4 bg-[#FAF8F2] space-y-2.5 shadow-[3px_3px_0px_0px_#111111]">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base font-mono text-[#111111]">{act.name}</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 border ${act.badgeColor}`}>
                      Range: {act.range}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-[#1A42D9] bg-white p-2 border border-stone-300">
                    <div><strong>Formula:</strong> {act.formula}</div>
                    <div><strong>Derivative:</strong> {act.derivative}</div>
                  </div>

                  <div className="text-xs text-stone-700 font-sans space-y-1">
                    <p><strong>Everyday Analogy:</strong> {act.analogy}</p>
                    <p className="text-emerald-700"><strong>Pros:</strong> {act.pros}</p>
                    <p className="text-rose-700"><strong>Cons:</strong> {act.cons}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { AlgorithmModule, AlgorithmMetric, InteractiveAlgorithmContext, Point } from '../types';

export interface LogisticRegressionState {
  w1: number;
  w2: number;
  bias: number;
  slope: number;
  intercept: number;
  logitOffset: number;
  threshold: number;
  logLoss: number;
  accuracy: number;
  precision: number;
  recall: number;
  manualHyperplane: { slope: number; intercept: number } | null;
}

export const logisticRegressionModule: AlgorithmModule = {
  id: 'logistic_regression',
  name: 'Logistic Regression & Sigmoid Manifold',
  shortLabel: 'Logistic Regression',
  category: 'Supervised: Classification',
  badgeText: 'Hyperplane • Sigmoid',
  badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  description: 'Models class probabilities through the Bernoulli logit link function with maximum likelihood estimation and adjustable decision thresholds.',

  getHypothesisText: (_params, state: LogisticRegressionState) => {
    return `P(Y=1|X) = σ(${state.w1.toFixed(2)}·x₁ + ${state.w2.toFixed(2)}·x₂ + ${state.bias.toFixed(1)}) ≥ θ(${state.threshold.toFixed(2)})`;
  },

  parameters: [
    {
      id: 'threshold',
      label: 'Decision Threshold (θ)',
      type: 'slider',
      min: 0.10,
      max: 0.90,
      step: 0.02,
      defaultValue: 0.50,
      description: 'Probability boundary cutoff separating Class 0 from Class 1.',
      minLabel: '0.10 (High Recall)',
      maxLabel: '0.90 (High Precision)'
    },
    {
      id: 'regularizationC',
      label: 'Inverse Regularization (C)',
      type: 'slider',
      min: 0.1,
      max: 5.0,
      step: 0.1,
      defaultValue: 1.0,
      description: 'Controls L2 penalty. Smaller C yields stronger regularization and wider margins.',
      minLabel: '0.1 (Heavy Penalty)',
      maxLabel: '5.0 (Flexible)'
    },
    {
      id: 'steepness',
      label: 'Sigmoid Gain / Temperature',
      type: 'slider',
      min: 0.5,
      max: 2.5,
      step: 0.1,
      defaultValue: 1.0,
      description: 'Controls the curvature steepness of the logistic transition zone.'
    }
  ],

  getDefaultParameters: () => ({
    threshold: 0.50,
    regularizationC: 1.0,
    steepness: 1.0
  }),

  generateDataset: (sampleCount: number, noiseLevel: number) => {
    const points: Point[] = [];
    const half = Math.floor(sampleCount / 2);
    const spread = 22 + noiseLevel * 0.35;

    // Class 0 Cluster (Lower-left quadrant)
    for (let i = 0; i < half; i++) {
      const x = 30 + (Math.random() - 0.5) * spread;
      const y = 32 + (Math.random() - 0.5) * spread;
      points.push({
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(5, Math.min(95, y)),
        label: 0
      });
    }

    // Class 1 Cluster (Upper-right quadrant)
    for (let i = 0; i < sampleCount - half; i++) {
      const x = 70 + (Math.random() - 0.5) * spread;
      const y = 68 + (Math.random() - 0.5) * spread;
      points.push({
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(5, Math.min(95, y)),
        label: 1
      });
    }

    return points;
  },

  onPointInjected: (newPoint, _currentPoints, state: LogisticRegressionState, params) => {
    const threshold = params.threshold ?? 0.5;
    const z = (state.w1 * newPoint.x + state.w2 * newPoint.y + state.bias) * (params.steepness ?? 1.0);
    const prob = 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
    return {
      x: Math.round(newPoint.x),
      y: Math.round(newPoint.y),
      label: prob >= threshold ? 1 : 0
    };
  },

  computeState: (points: Point[], params: Record<string, any>, manualState: Record<string, any>): LogisticRegressionState => {
    const threshold = params.threshold ?? 0.5;
    const C = params.regularizationC ?? 1.0;
    const steepness = params.steepness ?? 1.0;

    let slope = -0.9;
    let intercept = 95;

    if (manualState.logisticSlope !== undefined && manualState.logisticIntercept !== undefined) {
      slope = manualState.logisticSlope;
      intercept = manualState.logisticIntercept;
    } else if (points.length > 0) {
      const c0 = { x: 0, y: 0, count: 0 };
      const c1 = { x: 0, y: 0, count: 0 };
      points.forEach(p => {
        if (p.label === 1) {
          c1.x += p.x;
          c1.y += p.y;
          c1.count++;
        } else {
          c0.x += p.x;
          c0.y += p.y;
          c0.count++;
        }
      });

      if (c0.count > 0 && c1.count > 0) {
        const mx0 = c0.x / c0.count;
        const my0 = c0.y / c0.count;
        const mx1 = c1.x / c1.count;
        const my1 = c1.y / c1.count;

        const dx = mx1 - mx0;
        const dy = my1 - my0;
        const midX = (mx0 + mx1) / 2;
        const midY = (my0 + my1) / 2;

        if (Math.abs(dy) > 0.001) {
          slope = -dx / dy;
          slope = (slope * C + (-1.0)) / (C + 1.0);
          intercept = midY - slope * midX;
        }
      }
    }

    const norm = Math.sqrt(slope * slope + 1.0);
    const scale = 0.08 * (1.0 / norm) * (slope < 0 ? 1 : -1);
    const w1 = -slope * scale;
    const w2 = 1.0 * scale;
    const bias = -intercept * scale;

    const logitOffset = Math.log(threshold / (1 - threshold)) / (steepness * 0.05);

    let totalLogLoss = 0;
    let tp = 0, fp = 0, tn = 0, fn = 0;

    points.forEach(p => {
      const z = (w1 * p.x + w2 * p.y + bias) * steepness - (logitOffset * 0.02);
      const prob = 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, z))));
      const y = p.label === 1 ? 1 : 0;

      const eps = 1e-7;
      const pointLoss = -(y * Math.log(prob + eps) + (1 - y) * Math.log(1 - prob + eps));
      totalLogLoss += pointLoss;

      const pred = prob >= threshold ? 1 : 0;
      if (y === 1 && pred === 1) tp++;
      else if (y === 0 && pred === 1) fp++;
      else if (y === 0 && pred === 0) tn++;
      else if (y === 1 && pred === 0) fn++;
    });

    const n = points.length || 1;
    const logLoss = totalLogLoss / n;
    const accuracy = ((tp + tn) / n) * 100;
    const precision = (tp + fp) > 0 ? (tp / (tp + fp)) * 100 : 100;
    const recall = (tp + fn) > 0 ? (tp / (tp + fn)) * 100 : 100;

    return {
      w1,
      w2,
      bias,
      slope,
      intercept,
      logitOffset,
      threshold,
      logLoss,
      accuracy,
      precision,
      recall,
      manualHyperplane: manualState.logisticSlope !== undefined ? { slope, intercept } : null
    };
  },

  computeMetrics: (_points: Point[], state: LogisticRegressionState): AlgorithmMetric[] => {
    return [
      {
        key: 'log_loss',
        label: 'Log-Loss (Cross Entropy)',
        value: state.logLoss.toFixed(3),
        unit: 'nats',
        description: 'Binary Cross-Entropy penalizing confident misclassifications.',
        isPrimary: true,
        barPercent: Math.min(100, Math.max(5, state.logLoss * 60))
      },
      {
        key: 'accuracy',
        label: 'Accuracy',
        value: `${state.accuracy.toFixed(1)}%`,
        description: 'Percentage of samples correctly assigned.'
      },
      {
        key: 'precision',
        label: 'Precision',
        value: `${state.precision.toFixed(1)}%`,
        description: 'True positives divided by all predicted positives.'
      },
      {
        key: 'recall',
        label: 'Recall',
        value: `${state.recall.toFixed(1)}%`,
        description: 'True positives divided by actual condition positives.'
      }
    ];
  },

  handleCanvasDrag: (x: number, y: number, ctx: InteractiveAlgorithmContext, state: LogisticRegressionState) => {
    if (ctx.isDraggingHandle === 'logistic_threshold') {
      const t = Math.max(0.1, Math.min(0.9, (x + y) / 200));
      ctx.updateParameter('threshold', Number(t.toFixed(2)));
    } else if (ctx.isDraggingHandle === 'logistic_slope') {
      const currentInt = state.intercept;
      const newSlope = (y - currentInt) / (x || 1);
      ctx.setManualState(prev => ({
        ...prev,
        logisticSlope: Number(Math.max(-4, Math.min(4, newSlope)).toFixed(3))
      }));
    } else if (ctx.isDraggingHandle === 'logistic_intercept') {
      ctx.setManualState(prev => ({
        ...prev,
        logisticIntercept: Number(Math.max(-20, Math.min(150, y)).toFixed(2))
      }));
    }
  },

  renderCanvas: (ctx: InteractiveAlgorithmContext, state: LogisticRegressionState) => {
    const { slope, intercept, logitOffset, threshold } = state;
    const effectiveIntercept = intercept + (logitOffset * 0.4);

    const yAt0 = effectiveIntercept;
    const yAt100 = slope * 100 + effectiveIntercept;

    const pinX = 50;
    const pinY = slope * pinX + effectiveIntercept;
    const clampedPinY = Math.max(5, Math.min(95, pinY));

    const ringX = 80;
    const ringY = slope * ringX + effectiveIntercept;
    const clampedRingY = Math.max(5, Math.min(95, ringY));

    return (
      <g id="logistic_regression_canvas_elements">
        <defs>
          <linearGradient id="logisticGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D97706" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#1A42D9" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        <rect width="100" height="100" fill="url(#logisticGrad)" pointerEvents="none" />

        <line
          x1="0"
          y1={100 - yAt0}
          x2="100"
          y2={100 - yAt100}
          stroke="#111111"
          strokeWidth="1.8"
          strokeDasharray="3,2"
        />

        <line
          x1={pinX}
          y1={100 - clampedPinY}
          x2={pinX + 8}
          y2={100 - (clampedPinY + 8 * (-1 / (slope || 1)))}
          stroke="#1A42D9"
          strokeWidth="0.8"
          strokeDasharray="1,1"
          opacity={0.6}
        />

        <g
          className="cursor-move"
          onMouseDown={(e) => {
            e.stopPropagation();
            ctx.setIsDraggingHandle('logistic_threshold');
          }}
        >
          <circle
            cx={pinX}
            cy={100 - clampedPinY}
            r="4"
            fill="#111111"
            stroke="#FFFFFF"
            strokeWidth="1.2"
          />
          <text
            x={pinX + 6}
            y={100 - clampedPinY - 3}
            fill="#111111"
            fontSize="3.4"
            fontFamily="monospace"
            fontWeight="bold"
          >
            θ={threshold.toFixed(2)}
          </text>
        </g>

        <g
          className="cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => {
            e.stopPropagation();
            ctx.setIsDraggingHandle('logistic_slope');
          }}
        >
          <circle
            cx={ringX}
            cy={100 - clampedRingY}
            r="3.5"
            fill="#1A42D9"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
          <circle
            cx={ringX}
            cy={100 - clampedRingY}
            r="6"
            fill="none"
            stroke="#1A42D9"
            strokeWidth="0.4"
            strokeDasharray="1,1"
          />
          <text
            x={ringX + 5}
            y={100 - clampedRingY + 6}
            fill="#1A42D9"
            fontSize="3"
            fontFamily="monospace"
            fontWeight="bold"
          >
            w₁/w₂={Math.abs(slope).toFixed(2)}
          </text>
        </g>
      </g>
    );
  },

  generateCode: (framework: 'sklearn' | 'pytorch', points: Point[], params: Record<string, any>) => {
    const sampleSlice = points.slice(0, 6);
    if (framework === 'sklearn') {
      return `# scikit-learn Calibrated Logistic Regression
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import log_loss, accuracy_score
import numpy as np

# 1. Feature Matrix X and Binary Target y
X = np.array([${sampleSlice.map(p => `[${p.x}, ${p.y.toFixed(1)}]`).join(', ')}])
y = np.array([${sampleSlice.map(p => p.label ?? 0).join(', ')}])

# 2. Fit Logistic Estimator with L2 Regularization (C=${params.regularizationC ?? 1.0})
clf = LogisticRegression(C=${params.regularizationC ?? 1.0}, solver='lbfgs', max_iter=200)
clf.fit(X, y)

# 3. Model Parameters & Threshold Calibration (θ=${params.threshold ?? 0.5})
probabilities = clf.predict_proba(X)[:, 1]
custom_predictions = (probabilities >= ${params.threshold ?? 0.5}).astype(int)

print(f"Weights w1, w2: {clf.coef_[0]}")
print(f"Bias b: {clf.intercept_[0]:.3f}")
print(f"Empirical Accuracy: {accuracy_score(y, custom_predictions) * 100:.1f}%")
print(f"Log-Loss: {log_loss(y, probabilities):.3f}")`;
    } else {
      return `# PyTorch Logistic Regression with Sigmoid
import torch
import torch.nn as nn

class LogisticClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear = nn.Linear(in_features=2, out_features=1)
        
    def forward(self, x):
        return torch.sigmoid(self.linear(x))

model = LogisticClassifier()
criterion = nn.BCELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.05)

X_tensor = torch.tensor([${sampleSlice.map(p => `[${p.x}.0, ${p.y.toFixed(1)}]`).join(', ')}], dtype=torch.float32)
y_tensor = torch.tensor([${sampleSlice.map(p => `[${p.label ?? 0}.0]`).join(', ')}], dtype=torch.float32)

optimizer.zero_grad()
outputs = model(X_tensor)
loss = criterion(outputs, y_tensor)
loss.backward()
optimizer.step()

print("PyTorch Convergence Loss:", loss.item())`;
    }
  },

  getSocraticPrompt: (params, metrics) => {
    return `In Logistic Regression with decision threshold θ=${params.threshold} and inverse regularization C=${params.regularizationC}, the current Cross-Entropy Loss is ${metrics[0].value} and Accuracy is ${metrics[1].value}. Explain how shifting the threshold from 0.50 trades False Positives against False Negatives on an ROC curve.`;
  },

  defaultSocraticExplanation: 'Logistic regression fits an S-shaped sigmoid probability manifold. Shifting the threshold slider alters your risk tolerance: lower thresholds catch every positive at the cost of false alarms, whereas higher thresholds demand overwhelming certainty.'
};

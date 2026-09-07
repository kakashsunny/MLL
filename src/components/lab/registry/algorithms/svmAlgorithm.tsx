import React from 'react';
import { AlgorithmModule, AlgorithmMetric, InteractiveAlgorithmContext, ParameterDefinition, Point } from '../types';

export interface SVMState {
  w1: number;
  w2: number;
  bias: number;
  slope: number;
  intercept: number;
  marginWidth: number;
  supportVectors: Point[];
  hingeLoss: number;
  accuracy: number;
  slackSum: number;
}

export const svmModule: AlgorithmModule = {
  id: 'svm',
  name: 'Support Vector Machine (Maximum Margin)',
  shortLabel: 'Support Vector Machine',
  category: 'Supervised: Classification',
  badgeText: 'Max Margin • Hinge Loss',
  badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  description: 'Constructs the unique optimal separating hyperplane that maximizes the geometric margin 2/||w|| to the nearest support vectors while penalizing slack errors via soft-margin parameter C.',

  getHypothesisText: (params, state: SVMState) => {
    return `f(x) = sgn(${state.w1.toFixed(2)}·x₁ + ${state.w2.toFixed(2)}·x₂ + ${state.bias.toFixed(1)}) • Margin γ = ${state.marginWidth.toFixed(1)} mm (C=${params.C ?? 1.0})`;
  },

  parameters: [
    {
      id: 'C',
      label: 'Regularization / Box Constraint (C)',
      type: 'slider',
      min: 0.1,
      max: 10.0,
      step: 0.2,
      defaultValue: 1.0,
      description: 'Trades margin width against margin slack violations. High C forces narrower, hard margins.',
      minLabel: '0.1 (Soft Margin)',
      maxLabel: '10.0 (Hard Margin)'
    },
    {
      id: 'marginScale',
      label: 'Geometric Margin Span (γ)',
      type: 'slider',
      min: 6,
      max: 24,
      step: 1,
      defaultValue: 14,
      description: 'Target geometric corridor separation width between the support vector hyperplanes.'
    },
    {
      id: 'showCorridor',
      label: 'Margin Corridor Fill',
      type: 'toggle',
      defaultValue: true,
      description: 'Displays the soft-margin envelope corridor between the bounding hyperplanes.'
    }
  ],

  getDefaultParameters: () => ({
    C: 1.0,
    marginScale: 14,
    showCorridor: true
  }),

  generateDataset: (sampleCount: number, noiseLevel: number) => {
    const points: Point[] = [];
    const half = Math.floor(sampleCount / 2);
    const noise = noiseLevel * 0.3;

    // Class -1 (Class 0): Lower-left region
    for (let i = 0; i < half; i++) {
      const u = Math.random();
      const v = Math.random();
      const x = 12 + u * 38 + (Math.random() - 0.5) * noise;
      const y = 12 + v * 38 + (Math.random() - 0.5) * noise;
      points.push({
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(5, Math.min(95, y)),
        label: 0 // Target label -1
      });
    }

    // Class +1 (Class 1): Upper-right region
    for (let i = 0; i < sampleCount - half; i++) {
      const u = Math.random();
      const v = Math.random();
      const x = 52 + u * 38 + (Math.random() - 0.5) * noise;
      const y = 52 + v * 38 + (Math.random() - 0.5) * noise;
      points.push({
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(5, Math.min(95, y)),
        label: 1 // Target label +1
      });
    }

    return points;
  },

  onPointInjected: (newPoint, _currentPoints, state: SVMState) => {
    // Decision function: f(x) = w1*x + w2*y + bias
    const score = state.w1 * newPoint.x + state.w2 * newPoint.y + state.bias;
    return {
      x: Math.round(newPoint.x),
      y: Math.round(newPoint.y),
      label: score >= 0 ? 1 : 0
    };
  },

  computeState: (points: Point[], params: Record<string, any>, manualState: Record<string, any>): SVMState => {
    const C = params.C ?? 1.0;
    const baseMargin = params.marginScale ?? 14;

    // Compute effective margin width adjusted by C: High C shrinks allowed margin to avoid slack
    const marginWidth = Math.max(4, baseMargin / Math.sqrt(C));

    // Hyperplane orientation
    let slope = -1.0;
    let intercept = 100;

    if (manualState.svmSlope !== undefined && manualState.svmIntercept !== undefined) {
      slope = manualState.svmSlope;
      intercept = manualState.svmIntercept;
    } else if (points.length > 0) {
      // Find class centers
      let sumX0 = 0, sumY0 = 0, n0 = 0;
      let sumX1 = 0, sumY1 = 0, n1 = 0;
      points.forEach(p => {
        if (p.label === 1) {
          sumX1 += p.x;
          sumY1 += p.y;
          n1++;
        } else {
          sumX0 += p.x;
          sumY0 += p.y;
          n0++;
        }
      });

      if (n0 > 0 && n1 > 0) {
        const mx0 = sumX0 / n0;
        const my0 = sumY0 / n0;
        const mx1 = sumX1 / n1;
        const my1 = sumY1 / n1;

        const dy = my1 - my0;
        const dx = mx1 - mx0;
        if (Math.abs(dy) > 0.01) {
          slope = -dx / dy;
        }
        const midX = (mx0 + mx1) / 2;
        const midY = (my0 + my1) / 2;
        intercept = midY - slope * midX;
      }
    }

    // Normal unit vector perpendicular to boundary line y = slope*x + intercept
    // Line in standard form: -slope*x + y - intercept = 0
    const A = -slope;
    const B = 1.0;
    const norm = Math.hypot(A, B);

    // Margin distance in coordinate units
    const dMargin = marginWidth / 2;

    // Weight vector normalized such that functional margin is 1 at dMargin
    const wScale = 1.0 / (dMargin * norm || 1);
    const w1 = A * wScale;
    const w2 = B * wScale;
    const bias = -intercept * wScale;

    // Identify Support Vectors and compute Hinge Loss
    const supportVectors: Point[] = [];
    let totalHingeLoss = 0;
    let totalSlack = 0;
    let correctCount = 0;

    points.forEach(p => {
      const y_target = p.label === 1 ? 1 : -1;
      const f_x = w1 * p.x + w2 * p.y + bias;
      const marginDistance = y_target * f_x;

      // Hinge loss: L = max(0, 1 - y * f(x))
      const slack = Math.max(0, 1 - marginDistance);
      totalHingeLoss += slack;
      totalSlack += slack;

      if (f_x * y_target > 0) {
        correctCount++;
      }

      // Point is a support vector if it lies on the margin or inside the margin (slack > 0 or close to 1)
      const isSV = Math.abs(marginDistance - 1.0) < 0.45 || slack > 0.05;
      p.isSupportVector = isSV;
      if (isSV) {
        supportVectors.push(p);
      }
    });

    const n = points.length || 1;
    const hingeLoss = totalHingeLoss / n;
    const accuracy = (correctCount / n) * 100;

    return {
      w1,
      w2,
      bias,
      slope,
      intercept,
      marginWidth,
      supportVectors,
      hingeLoss,
      accuracy,
      slackSum: totalSlack
    };
  },

  computeMetrics: (_points: Point[], state: SVMState): AlgorithmMetric[] => {
    return [
      {
        key: 'hinge_loss',
        label: 'Empirical Hinge Loss',
        value: state.hingeLoss.toFixed(3),
        unit: 'loss',
        description: 'Soft-margin convex surrogate loss penalizing points violating the margin boundary.',
        isPrimary: true,
        barPercent: Math.min(100, Math.max(5, state.hingeLoss * 50))
      },
      {
        key: 'margin_width',
        label: 'Margin Bandwidth (2/||w||)',
        value: `${state.marginWidth.toFixed(1)} mm`,
        description: 'Perpendicular geometric distance between positive and negative margin hyperplanes.'
      },
      {
        key: 'support_vector_count',
        label: 'Support Vectors (N_sv)',
        value: `${state.supportVectors.length}`,
        description: 'Data samples defining the dual Lagrangian boundary envelope.'
      },
      {
        key: 'accuracy',
        label: 'Classification Accuracy',
        value: `${state.accuracy.toFixed(1)}%`,
        description: 'Percentage of samples correctly classified on the proper side of the central hyperplane.'
      }
    ];
  },

  handleCanvasDrag: (x: number, y: number, ctx: InteractiveAlgorithmContext, state: SVMState) => {
    if (ctx.isDraggingHandle === 'svm_slope') {
      const currentInt = state.intercept;
      const newSlope = (y - currentInt) / (x || 1);
      ctx.setManualState(prev => ({
        ...prev,
        svmSlope: Number(Math.max(-4, Math.min(4, newSlope)).toFixed(3))
      }));
    } else if (ctx.isDraggingHandle === 'svm_intercept') {
      ctx.setManualState(prev => ({
        ...prev,
        svmIntercept: Number(Math.max(-20, Math.min(150, y)).toFixed(2))
      }));
    } else if (ctx.isDraggingHandle === 'svm_margin') {
      // Adjust margin width by dragging the margin line
      const A = -state.slope;
      const B = 1.0;
      const dist = Math.abs(A * x + B * y - state.intercept) / Math.hypot(A, B);
      ctx.updateParameter('marginScale', Number(Math.max(6, Math.min(30, dist * 2)).toFixed(1)));
    }
  },

  renderCanvas: (ctx: InteractiveAlgorithmContext, state: SVMState) => {
    const { slope, intercept, marginWidth, supportVectors } = state;
    const showCorridor = ctx.parameters.showCorridor ?? true;

    // Calculate normal vector perpendicular to line y = slope*x + intercept
    // Line direction vector is (1, slope). Normal vector is (-slope, 1) / sqrt(1 + slope^2)
    const norm = Math.hypot(-slope, 1);
    const offset = (marginWidth / 2) * (norm); // vertical displacement = (marginWidth / 2) * sqrt(1 + slope^2)

    const yMid0 = intercept;
    const yMid100 = slope * 100 + intercept;

    const yPos0 = intercept + offset;
    const yPos100 = slope * 100 + intercept + offset;

    const yNeg0 = intercept - offset;
    const yNeg100 = slope * 100 + intercept - offset;

    // Pin handle coordinates
    const midX = 50;
    const midY = slope * midX + intercept;
    const clampedMidY = Math.max(5, Math.min(95, midY));

    // Margin drag handle coordinates
    const marginHandleX = 35;
    const marginHandleY = slope * marginHandleX + intercept + offset;
    const clampedMarginY = Math.max(5, Math.min(95, marginHandleY));

    return (
      <g id="svm_canvas_elements">
        {/* Shaded Maximum Margin Corridor */}
        {showCorridor && (
          <polygon
            points={`0,${100 - yPos0} 100,${100 - yPos100} 100,${100 - yNeg100} 0,${100 - yNeg0}`}
            fill="#E11D48"
            fillOpacity="0.08"
          />
        )}

        {/* Positive Margin Hyperplane (w · x + b = +1) */}
        <line
          x1="0"
          y1={100 - yPos0}
          x2="100"
          y2={100 - yPos100}
          stroke="#1A42D9"
          strokeWidth="1.2"
          strokeDasharray="2,2"
          opacity={0.8}
        />

        {/* Central Maximum Margin Separating Hyperplane (w · x + b = 0) */}
        <line
          x1="0"
          y1={100 - yMid0}
          x2="100"
          y2={100 - yMid100}
          stroke="#111111"
          strokeWidth="2.0"
        />

        {/* Negative Margin Hyperplane (w · x + b = -1) */}
        <line
          x1="0"
          y1={100 - yNeg0}
          x2="100"
          y2={100 - yNeg100}
          stroke="#D97706"
          strokeWidth="1.2"
          strokeDasharray="2,2"
          opacity={0.8}
        />

        {/* Support Vector Highlights (Glowing Dual Rings) */}
        {supportVectors.map((sv, i) => (
          <g key={`sv-halo-${i}`} pointerEvents="none">
            <circle
              cx={sv.x}
              cy={100 - sv.y}
              r="6.5"
              fill="none"
              stroke={sv.label === 1 ? '#1A42D9' : '#D97706'}
              strokeWidth="1"
              strokeDasharray="2,1"
              opacity={0.9}
            />
            <circle
              cx={sv.x}
              cy={100 - sv.y}
              r="9"
              fill="none"
              stroke="#E11D48"
              strokeWidth="0.5"
              opacity={0.5}
            />
          </g>
        ))}

        {/* Caliper Handle 1: Central Intercept Pin */}
        <g
          className="cursor-move"
          onMouseDown={(e) => {
            e.stopPropagation();
            ctx.setIsDraggingHandle('svm_intercept');
          }}
        >
          <circle
            cx={midX}
            cy={100 - clampedMidY}
            r="4"
            fill="#111111"
            stroke="#FFFFFF"
            strokeWidth="1.2"
          />
          <text
            x={midX + 5}
            y={100 - clampedMidY - 3}
            fill="#111111"
            fontSize="3.2"
            fontFamily="monospace"
            fontWeight="bold"
          >
            w·x+b=0
          </text>
        </g>

        {/* Caliper Handle 2: Margin Corridor Caliper */}
        <g
          className="cursor-ns-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            ctx.setIsDraggingHandle('svm_margin');
          }}
        >
          <circle
            cx={marginHandleX}
            cy={100 - clampedMarginY}
            r="3.5"
            fill="#E11D48"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
          <text
            x={marginHandleX + 5}
            y={100 - clampedMarginY - 2}
            fill="#E11D48"
            fontSize="2.9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            γ={marginWidth.toFixed(1)}mm
          </text>
        </g>
      </g>
    );
  },

  generateCode: (framework: 'sklearn' | 'pytorch', points: Point[], params: Record<string, any>, state: SVMState) => {
    const C = params.C ?? 1.0;
    const sampleSlice = points.slice(0, 6);

    if (framework === 'sklearn') {
      return `# scikit-learn Linear Support Vector Classifier (C=${C})
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, hinge_loss
import numpy as np

# 1. Feature Matrix X and Binary Labels y in {-1, +1}
X = np.array([${sampleSlice.map(p => `[${p.x}, ${p.y.toFixed(1)}]`).join(', ')}])
y = np.array([${sampleSlice.map(p => (p.label === 1 ? 1 : -1)).join(', ')}])

# 2. Maximum Margin Support Vector Classifier
model = SVC(kernel='linear', C=${C})
model.fit(X, y)

# 3. Support Vector Extraction & Margin Calculation
w = model.coef_[0]
b = model.intercept_[0]
geometric_margin = 2.0 / np.linalg.norm(w)

print(f"Hyperplane Weights (w): {w}")
print(f"Hyperplane Intercept (b): {b:.3f}")
print(f"Number of Support Vectors: {len(model.support_vectors_)}")
print(f"Geometric Margin Width: {geometric_margin:.2f}")`;
    } else {
      return `# PyTorch Soft-Margin SVM via Primal Subgradient Descent
import torch
import torch.nn as nn

# 1. Linear Hyperplane f(x) = w^T x + b
class LinearSVM(nn.Module):
    def __init__(self):
        super().__init__()
        self.w = nn.Parameter(torch.randn(2, 1))
        self.b = nn.Parameter(torch.zeros(1))
        
    def forward(self, x):
        return torch.mm(x, self.w) + self.b

# 2. Soft-Margin Loss: 0.5 * ||w||^2 + C * sum(max(0, 1 - y * f(x)))
def svm_loss(model, outputs, targets, C=${C}):
    l2_reg = 0.5 * torch.sum(model.w ** 2)
    hinge = torch.clamp(1.0 - targets * outputs, min=0.0)
    return l2_reg + C * torch.mean(hinge)

model = LinearSVM()
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

X = torch.tensor([${sampleSlice.map(p => `[${p.x}.0, ${p.y.toFixed(1)}]`).join(', ')}], dtype=torch.float32)
y = torch.tensor([${sampleSlice.map(p => (p.label === 1 ? '[1.0]' : '[-1.0]')).join(', ')}], dtype=torch.float32)

optimizer.zero_grad()
loss = svm_loss(model, model(X), y)
loss.backward()
optimizer.step()

print("PyTorch SVM Primal Loss:", loss.item())`;
    }
  },

  getSocraticPrompt: (params, metrics) => {
    return `In a Support Vector Machine with box constraint C=${params.C}, there are ${metrics[2].value} active support vectors and empirical Hinge Loss is ${metrics[0].value}. Explain the dual optimization problem: why points far from the boundary have Lagrange multipliers α_i = 0, and how parameter C controls the budget for margin violations.`;
  },

  defaultSocraticExplanation: "Support Vector Machines find the widest possible highway between two classes. Only the closest data particles ('support vectors') hold up the margin boundary gutters—all other points have zero influence on the decision boundary."
};

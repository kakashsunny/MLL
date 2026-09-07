import React from 'react';
import { AlgorithmModule, AlgorithmMetric, InteractiveAlgorithmContext, ParameterDefinition, Point } from '../types';

export interface DecisionTreeState {
  splitX: number;
  splitY1: number;
  splitY2: number;
  accuracy: number;
  giniImpurity: number;
}

export const decisionTreeModule: AlgorithmModule = {
  id: 'decision_tree',
  name: 'Decision Tree (Orthogonal Cuts)',
  shortLabel: 'Decision Trees',
  category: 'Supervised: Classification',
  badgeText: 'Axis-Aligned • CART',
  badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  description: 'Partitions continuous feature space into orthogonal, axis-aligned hyper-rectangles by greedily minimizing Gini impurity or Shannon entropy.',

  getHypothesisText: (_params, state: DecisionTreeState) => {
    return `Root Split: [x₁ ≤ ${state.splitX.toFixed(1)}] • Left Child: [x₂ ≤ ${state.splitY1.toFixed(1)}] • Right: [x₂ ≤ ${state.splitY2.toFixed(1)}]`;
  },

  parameters: [
    {
      id: 'maxDepth',
      label: 'Maximum Tree Depth',
      type: 'slider',
      min: 1,
      max: 4,
      step: 1,
      defaultValue: 2,
      description: 'Maximum hierarchical levels of feature splits allowed.'
    },
    {
      id: 'criterion',
      label: 'Split Criterion',
      type: 'select',
      defaultValue: 'gini',
      options: [
        { label: 'Gini Impurity', value: 'gini' },
        { label: 'Shannon Entropy', value: 'entropy' }
      ],
      description: 'Impurity heuristic used to assess information gain.'
    }
  ],

  getDefaultParameters: () => ({
    maxDepth: 2,
    criterion: 'gini'
  }),

  generateDataset: (sampleCount: number, noiseLevel: number) => {
    const points: Point[] = [];
    const spread = noiseLevel * 0.3;

    for (let i = 0; i < sampleCount; i++) {
      const x = 10 + Math.random() * 80 + (Math.random() - 0.5) * spread;
      const y = 10 + Math.random() * 80 + (Math.random() - 0.5) * spread;
      // XOR or quadrant rule
      const label = (x > 50 && y > 45) || (x <= 50 && y <= 45) ? 1 : 0;
      points.push({
        x: Math.max(5, Math.min(95, Math.round(x))),
        y: Math.max(5, Math.min(95, Math.round(y))),
        label
      });
    }
    return points;
  },

  onPointInjected: (newPoint, _currentPoints, state: DecisionTreeState) => {
    const isRight = newPoint.x > state.splitX;
    const label = isRight ? (newPoint.y > state.splitY2 ? 1 : 0) : (newPoint.y > state.splitY1 ? 0 : 1);
    return {
      x: Math.round(newPoint.x),
      y: Math.round(newPoint.y),
      label
    };
  },

  computeState: (points: Point[], _params: Record<string, any>, manualState: Record<string, any>): DecisionTreeState => {
    const splitX = manualState.treeSplitX ?? 50;
    const splitY1 = manualState.treeSplitY1 ?? 50;
    const splitY2 = manualState.treeSplitY2 ?? 50;

    let correct = 0;
    points.forEach(p => {
      const isRight = p.x > splitX;
      const pred = isRight ? (p.y > splitY2 ? 1 : 0) : (p.y > splitY1 ? 0 : 1);
      if (pred === p.label) correct++;
    });

    const n = points.length || 1;
    const accuracy = (correct / n) * 100;
    const p1 = points.filter(p => p.label === 1).length / n;
    const giniImpurity = 1 - (p1 * p1 + (1 - p1) * (1 - p1));

    return {
      splitX,
      splitY1,
      splitY2,
      accuracy,
      giniImpurity
    };
  },

  computeMetrics: (_points: Point[], state: DecisionTreeState): AlgorithmMetric[] => {
    return [
      {
        key: 'gini',
        label: 'Gini Impurity (Split Quality)',
        value: state.giniImpurity.toFixed(3),
        unit: 'Gini',
        isPrimary: true,
        barPercent: Math.min(100, Math.max(5, state.giniImpurity * 200))
      },
      {
        key: 'accuracy',
        label: 'Classification Accuracy',
        value: `${state.accuracy.toFixed(1)}%`
      },
      {
        key: 'leaf_count',
        label: 'Terminal Leaves',
        value: '4 Leaves'
      }
    ];
  },

  handleCanvasDrag: (x: number, y: number, ctx: InteractiveAlgorithmContext) => {
    if (ctx.isDraggingHandle === 'tree_split_x') {
      ctx.setManualState(prev => ({ ...prev, treeSplitX: Math.round(x) }));
    } else if (ctx.isDraggingHandle === 'tree_split_y1') {
      ctx.setManualState(prev => ({ ...prev, treeSplitY1: Math.round(y) }));
    } else if (ctx.isDraggingHandle === 'tree_split_y2') {
      ctx.setManualState(prev => ({ ...prev, treeSplitY2: Math.round(y) }));
    }
  },

  renderCanvas: (ctx: InteractiveAlgorithmContext, state: DecisionTreeState) => {
    const { splitX, splitY1, splitY2 } = state;

    return (
      <g id="decision_tree_canvas_elements">
        {/* Shaded Quadrants */}
        <rect x="0" y={100 - splitY1} width={splitX} height={splitY1} fill="#1A42D9" fillOpacity="0.08" />
        <rect x="0" y="0" width={splitX} height={100 - splitY1} fill="#D97706" fillOpacity="0.08" />
        <rect x={splitX} y={100 - splitY2} width={100 - splitX} height={splitY2} fill="#D97706" fillOpacity="0.08" />
        <rect x={splitX} y="0" width={100 - splitX} height={100 - splitY2} fill="#1A42D9" fillOpacity="0.08" />

        {/* Primary Vertical Split Line */}
        <line
          x1={splitX}
          y1="0"
          x2={splitX}
          y2="100"
          stroke="#111111"
          strokeWidth="1.8"
          strokeDasharray="3,2"
        />

        {/* Secondary Horizontal Splits */}
        <line
          x1="0"
          y1={100 - splitY1}
          x2={splitX}
          y2={100 - splitY1}
          stroke="#1A42D9"
          strokeWidth="1.2"
          strokeDasharray="2,2"
        />
        <line
          x1={splitX}
          y1={100 - splitY2}
          x2="100"
          y2={100 - splitY2}
          stroke="#D97706"
          strokeWidth="1.2"
          strokeDasharray="2,2"
        />

        {/* Caliper Handle 1: Primary Vertical Split */}
        <g
          className="cursor-ew-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            ctx.setIsDraggingHandle('tree_split_x');
          }}
        >
          <circle cx={splitX} cy="50" r="4" fill="#111111" stroke="#FFFFFF" strokeWidth="1" />
          <text x={splitX + 4} y="47" fill="#111111" fontSize="3.2" fontFamily="monospace" fontWeight="bold">
            X₁={splitX}
          </text>
        </g>
      </g>
    );
  },

  generateCode: (framework: 'sklearn' | 'pytorch', points: Point[]) => {
    const sampleSlice = points.slice(0, 5);

    if (framework === 'sklearn') {
      return `# scikit-learn DecisionTreeClassifier Pipeline
from sklearn.tree import DecisionTreeClassifier, export_text
import numpy as np

X = np.array([${sampleSlice.map(p => `[${p.x}, ${p.y.toFixed(1)}]`).join(', ')}])
y = np.array([${sampleSlice.map(p => p.label ?? 0).join(', ')}])

tree = DecisionTreeClassifier(max_depth=2, criterion='gini')
tree.fit(X, y)

print("Decision Tree Rules:\\n", export_text(tree, feature_names=['x1', 'x2']))`;
    } else {
      return `# PyTorch Soft Decision Tree via Gumbel-Softmax Router
import torch
import torch.nn as nn

class SoftDecisionTree(nn.Module):
    def __init__(self):
        super().__init__()
        self.router = nn.Linear(2, 2)
        
    def forward(self, x):
        return torch.softmax(self.router(x), dim=-1)

model = SoftDecisionTree()
print("PyTorch Soft Tree initialized.")`;
    }
  },

  getSocraticPrompt: (_params, metrics) => {
    return `In Decision Tree partitioning, the Gini impurity is ${metrics[0].value}. Explain how CART greedily scans split candidates to maximize information gain.`;
  },

  defaultSocraticExplanation: 'Decision trees greedily carve the feature space with vertical and horizontal razor cuts, seeking splits that leave each sub-box as pure as possible.'
};

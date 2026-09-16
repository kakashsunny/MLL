import React from 'react';
import { AlgorithmModule, AlgorithmMetric, InteractiveAlgorithmContext, Point } from '../types';

export interface KNNState {
  k: number;
  probeX: number;
  probeY: number;
  nearestNeighbors: { point: Point; dist: number; rank: number }[];
  predictedClass: number;
  class0Votes: number;
  class1Votes: number;
  maxRadius: number;
  accuracy: number;
}

export const knnModule: AlgorithmModule = {
  id: 'knn',
  name: 'K-Nearest Neighbors (KNN)',
  shortLabel: 'K-Nearest Neighbors',
  category: 'Supervised: Classification',
  badgeText: 'Instance-Based • Majority Voting',
  badgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
  description: 'Memorizes all training samples. To classify a new query point, it finds the K closest data points by Euclidean distance and lets them vote on the outcome.',

  simpleAnalogy: 'Like asking your 5 closest friends for movie recommendations: whoever has the most votes wins! No complex formulas—just "birds of a feather flock together."',
  simpleSteps: [
    'Place a new target point anywhere on the map.',
    'Measure the physical straight-line distance to every existing point.',
    'Pick the K closest neighbors and count their votes. The majority class wins!'
  ],
  whatToTry: [
    'Drag the yellow probe target around the canvas to see which neighbors get selected in real time.',
    'Change K from 1 to 9. Notice how K=1 makes jagged boundaries sensitive to single outliers, while K=9 creates smooth, stable consensus.',
    'Click on the canvas to add a new point and see how the neighborhood votes shift!'
  ],

  getHypothesisText: (params, state: KNNState) => {
    return `ŷ = argmax_c ∑_{i ∈ N_k(x)} I(y_i = c) • Probe: Class ${state.predictedClass} (${state.class1Votes} Green vs ${state.class0Votes} Coral) [K=${params.k ?? 5}]`;
  },

  parameters: [
    {
      id: 'k',
      label: 'Number of Neighbors (K)',
      type: 'slider',
      min: 1,
      max: 15,
      step: 2, // odd numbers prevent ties
      defaultValue: 5,
      description: 'How many nearest neighbors vote. Small K = high variance / noisy; Large K = smoother consensus.',
      minLabel: 'K=1 (Strict Local)',
      maxLabel: 'K=15 (Broad Consensus)'
    },
    {
      id: 'metric',
      label: 'Distance Metric',
      type: 'select',
      defaultValue: 'euclidean',
      options: [
        { label: 'Euclidean (Straight Line L2)', value: 'euclidean' },
        { label: 'Manhattan (City Block L1)', value: 'manhattan' }
      ],
      description: 'The formula used to calculate distance between data points.'
    },
    {
      id: 'showProbe',
      label: 'Show Real-Time Probe',
      type: 'toggle',
      defaultValue: true,
      description: 'Highlights an interactive target point with lines drawn to its K nearest neighbors.'
    },
    {
      id: 'showBackground',
      label: 'Decision Field Shading',
      type: 'toggle',
      defaultValue: true,
      description: 'Shades the canvas regions based on which class holds the majority vote.'
    }
  ],

  getDefaultParameters: () => ({
    k: 5,
    metric: 'euclidean',
    showProbe: true,
    showBackground: true
  }),

  generateDataset: (sampleCount: number, noiseLevel: number) => {
    const points: Point[] = [];
    const countPerClass = Math.floor(sampleCount / 2);

    // Class 0: Clustered around lower-left (Coral / Red)
    for (let i = 0; i < countPerClass; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const randStd = Math.sqrt(-2 * Math.log(u1 || 0.01)) * Math.cos(2 * Math.PI * u2);
      const x = 32 + randStd * (10 + noiseLevel * 6);
      const y = 38 + (Math.random() - 0.5) * (18 + noiseLevel * 8);
      points.push({
        id: `c0_${i}`,
        x: Math.max(10, Math.min(85, x)),
        y: Math.max(10, Math.min(85, y)),
        label: 0
      });
    }

    // Class 1: Clustered around upper-right (Emerald / Green)
    for (let i = 0; i < countPerClass; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const randStd = Math.sqrt(-2 * Math.log(u1 || 0.01)) * Math.cos(2 * Math.PI * u2);
      const x = 68 + randStd * (10 + noiseLevel * 6);
      const y = 62 + (Math.random() - 0.5) * (18 + noiseLevel * 8);
      points.push({
        id: `c1_${i}`,
        x: Math.max(10, Math.min(85, x)),
        y: Math.max(10, Math.min(85, y)),
        label: 1
      });
    }

    return points;
  },

  onPointInjected: (newPoint, currentPoints) => {
    // Determine label by majority of existing points close by
    const dists = currentPoints.map(p => ({
      d: Math.hypot(p.x - newPoint.x, p.y - newPoint.y),
      label: p.label ?? 0
    })).sort((a, b) => a.d - b.d);

    const vote1 = dists.slice(0, 3).filter(p => p.label === 1).length;
    const label = vote1 >= 2 ? 1 : 0;

    return {
      id: `custom_${Date.now()}`,
      x: Math.round(newPoint.x * 10) / 10,
      y: Math.round(newPoint.y * 10) / 10,
      label
    };
  },

  computeState: (points: Point[], params: Record<string, any>, manualState: Record<string, any>): KNNState => {
    const k = Number(params.k ?? 5);
    const metric = params.metric || 'euclidean';
    const probeX = manualState.probeX ?? 50;
    const probeY = manualState.probeY ?? 50;

    // Calculate distance from probe to all points
    const dists = points.map(p => {
      let dist = 0;
      if (metric === 'manhattan') {
        dist = Math.abs(p.x - probeX) + Math.abs(p.y - probeY);
      } else {
        dist = Math.hypot(p.x - probeX, p.y - probeY);
      }
      return { point: p, dist, rank: 0 };
    });

    dists.sort((a, b) => a.dist - b.dist);
    const nearest = dists.slice(0, Math.min(k, dists.length)).map((d, idx) => ({
      ...d,
      rank: idx + 1
    }));

    const class1Votes = nearest.filter(n => n.point.label === 1).length;
    const class0Votes = nearest.length - class1Votes;
    const predictedClass = class1Votes >= class0Votes ? 1 : 0;
    const maxRadius = nearest.length > 0 ? nearest[nearest.length - 1].dist : 15;

    // Leave-one-out CV accuracy approximation
    let correct = 0;
    for (const p of points) {
      const neighborDists = points
        .filter(other => other.id !== p.id)
        .map(other => ({
          d: Math.hypot(other.x - p.x, other.y - p.y),
          label: other.label ?? 0
        }))
        .sort((a, b) => a.d - b.d)
        .slice(0, k);

      const v1 = neighborDists.filter(n => n.label === 1).length;
      const pred = v1 >= (k / 2) ? 1 : 0;
      if (pred === (p.label ?? 0)) correct++;
    }

    const accuracy = points.length > 0 ? Math.round((correct / points.length) * 100) : 90;

    return {
      k,
      probeX,
      probeY,
      nearestNeighbors: nearest,
      predictedClass,
      class0Votes,
      class1Votes,
      maxRadius,
      accuracy
    };
  },

  computeMetrics: (points: Point[], state: KNNState, params: Record<string, any>): AlgorithmMetric[] => {
    const totalVotes = state.class0Votes + state.class1Votes || 1;
    const confidence = Math.round((Math.max(state.class0Votes, state.class1Votes) / totalVotes) * 100);

    return [
      {
        key: 'accuracy',
        id: 'accuracy',
        label: 'LOO-CV Accuracy',
        value: `${state.accuracy}%`,
        isGood: state.accuracy > 80,
        description: 'Leave-One-Out cross validation score across all training instances.'
      },
      {
        key: 'confidence',
        id: 'confidence',
        label: 'Probe Confidence',
        value: `${confidence}%`,
        isGood: confidence > 70,
        description: `Margin of consensus among the K=${state.k} voting neighbors.`
      },
      {
        key: 'vote_breakdown',
        id: 'vote_breakdown',
        label: 'Vote Ratio',
        value: `${state.class1Votes} : ${state.class0Votes}`,
        isGood: true,
        description: 'Number of Class 1 (Green) vs Class 0 (Coral) neighbor votes.'
      },
      {
        key: 'radius',
        id: 'radius',
        label: 'Horizon Radius',
        value: `${state.maxRadius.toFixed(1)} u`,
        description: 'Distance from target probe to the furthest voting neighbor.'
      }
    ];
  },

  handleCanvasDrag: (x: number, y: number, ctx: InteractiveAlgorithmContext) => {
    ctx.setManualState((prev: Record<string, any>) => ({
      ...prev,
      probeX: Math.max(5, Math.min(95, x)),
      probeY: Math.max(5, Math.min(95, y))
    }));
  },

  renderCanvas: (ctx: InteractiveAlgorithmContext, state: KNNState) => {
    const { points, params } = ctx;
    const showProbe = params.showProbe ?? true;
    const showBackground = params.showBackground ?? true;

    return (
      <g className="knn-visualization">
        {/* Optional background decision guide grid */}
        {showBackground && (
          <g opacity="0.12">
            <rect x="0" y="0" width="100" height="100" fill="#f8fafc" />
            <path
              d="M 10 90 Q 50 50 90 10 L 100 0 L 0 0 Z"
              fill="#ec4899"
              opacity="0.25"
            />
            <path
              d="M 10 90 Q 50 50 90 10 L 100 100 L 0 100 Z"
              fill="#10b981"
              opacity="0.25"
            />
          </g>
        )}

        {/* Neighborhood Radius Bubble around probe */}
        {showProbe && (
          <g>
            <circle
              cx={state.probeX}
              cy={state.probeY}
              r={state.maxRadius}
              fill="rgba(245, 158, 11, 0.08)"
              stroke="#f59e0b"
              strokeWidth="0.8"
              strokeDasharray="2 2"
              className="transition-all duration-150"
            />

            {/* Connecting lines from probe to K nearest neighbors */}
            {state.nearestNeighbors.map((n, idx) => (
              <g key={`line_${idx}`}>
                <line
                  x1={state.probeX}
                  y1={state.probeY}
                  x2={n.point.x}
                  y2={n.point.y}
                  stroke={n.point.label === 1 ? '#059669' : '#e11d48'}
                  strokeWidth="0.8"
                  strokeDasharray="1.5 1.5"
                  opacity="0.85"
                />
                {/* Distance pill badge along line */}
                <circle
                  cx={n.point.x}
                  cy={n.point.y}
                  r="3.2"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.2"
                />
              </g>
            ))}
          </g>
        )}

        {/* Data points */}
        {points.map((p, idx) => {
          const isClass1 = p.label === 1;
          const isNeighbor = state.nearestNeighbors.some(n => (n.point.id && p.id ? n.point.id === p.id : n.point === p));

          return (
            <g key={p.id || `knn_pt_${idx}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isNeighbor ? 2.4 : 1.8}
                fill={isClass1 ? '#10b981' : '#f43f5e'}
                stroke={isNeighbor ? '#ffffff' : 'rgba(0,0,0,0.15)'}
                strokeWidth={isNeighbor ? 1 : 0.4}
                className="transition-all duration-150"
              />
            </g>
          );
        })}

        {/* Interactive Probe Pin (Draggable) */}
        {showProbe && (
          <g
            transform={`translate(${state.probeX}, ${state.probeY})`}
            className="cursor-move select-none"
          >
            {/* Pulsing ring */}
            <circle
              cx="0"
              cy="0"
              r="4.5"
              fill={state.predictedClass === 1 ? '#10b981' : '#f43f5e'}
              stroke="#ffffff"
              strokeWidth="1.2"
              className="drop-shadow-md"
            />
            <circle
              cx="0"
              cy="0"
              r="1.5"
              fill="#ffffff"
            />
            {/* Live readout badge above probe */}
            <g transform="translate(0, -6)">
              <rect
                x="-18"
                y="-7"
                width="36"
                height="7"
                rx="2"
                fill="#1e293b"
                opacity="0.9"
              />
              <text
                x="0"
                y="-2.5"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="3.2"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {state.predictedClass === 1 ? 'CLASS 1 (Green)' : 'CLASS 0 (Coral)'}
              </text>
            </g>
          </g>
        )}
      </g>
    );
  },

  generateCode: (framework: 'sklearn' | 'pytorch', points: Point[], params: Record<string, any>, state: KNNState) => {
    const k = params.k ?? 5;
    const metric = params.metric || 'euclidean';

    if (framework === 'sklearn') {
      return `import numpy as np
from sklearn.neighbors import KNeighborsClassifier

# 1. Prepare 2D features X and discrete labels y
X = np.array([
${points.slice(0, 6).map(p => `    [${p.x.toFixed(1)}, ${p.y.toFixed(1)}]`).join(',\n')}
])
y = np.array([${points.slice(0, 6).map(p => p.label ?? 0).join(', ')}])

# 2. Instantiate and fit K-Nearest Neighbors Classifier
clf = KNeighborsClassifier(
    n_neighbors=${k},
    metric='${metric}',
    weights='uniform'
)
clf.fit(X, y)

# 3. Predict probe point target
probe = np.array([[${state.probeX.toFixed(1)}, ${state.probeY.toFixed(1)}]])
pred_class = clf.predict(probe)[0]
probs = clf.predict_proba(probe)[0]

print(f"Predicted Class: {pred_class} (Probabilities: {probs})")
# Find distances and indices of the ${k} nearest neighbors
distances, indices = clf.kneighbors(probe)
print("Distances to ${k} closest samples:", np.round(distances[0], 2))`;
    }

    return `import torch

# PyTorch Tensor Distance Matrix Implementation
X = torch.tensor([
${points.slice(0, 6).map(p => `    [${p.x.toFixed(1)}, ${p.y.toFixed(1)}]`).join(',\n')}
], dtype=torch.float32)

y = torch.tensor([${points.slice(0, 6).map(p => p.label ?? 0).join(', ')}], dtype=torch.long)
probe = torch.tensor([[${state.probeX.toFixed(1)}, ${state.probeY.toFixed(1)}]], dtype=torch.float32)

# Compute pairwise Euclidean distances: ||x_i - probe||
distances = torch.cdist(probe, X)[0]

# Retrieve Top-K smallest distances
topk_distances, topk_indices = torch.topk(distances, k=${k}, largest=False)
neighbor_labels = y[topk_indices]

# Majority vote via mode
pred_class = torch.mode(neighbor_labels).values.item()
print(f"PyTorch KNN Prediction: Class {pred_class}")`;
  },

  getSocraticPrompt: (params, metrics, state: KNNState) => {
    return `You have set K = ${state.k}. Notice what happens when you move the target probe into boundary zones where votes are split ${state.class1Votes} to ${state.class0Votes}. If K were 1, any single noisy point could flip the entire classification; when K is larger, multiple neighbors must agree, creating a much more stable consensus!`;
  }
};

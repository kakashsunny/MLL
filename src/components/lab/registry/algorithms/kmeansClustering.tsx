import React from 'react';
import { AlgorithmModule, AlgorithmMetric, InteractiveAlgorithmContext, ParameterDefinition, Point } from '../types';

export interface Centroid {
  id: number;
  x: number;
  y: number;
  color: string;
  count: number;
}

export interface KMeansState {
  centroids: Centroid[];
  assignments: number[];
  inertia: number;
  avgDistance: number;
  clusterBalance: string;
}

const CLUSTER_PALETTE = [
  '#1A42D9', // Deep Royal Cobalt
  '#D97706', // Warm Amber
  '#059669', // Emerald Green
  '#7C3AED'  // Violet Indigo
];

export const kmeansModule: AlgorithmModule = {
  id: 'kmeans',
  name: 'K-Means Clustering & Voronoi Partitions',
  shortLabel: 'K-Means Clustering',
  category: 'Unsupervised: Clustering',
  badgeText: 'Voronoi • Lloyd Alg',
  badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  description: 'Iteratively partitions empirical observations into K distinct Voronoi cells by minimizing within-cluster inertia (sum of squared Euclidean distances).',

  getHypothesisText: (params, state: KMeansState) => {
    return `K=${params.clusters ?? 3} Centroids • Total Inertia WCSS = ${state.inertia.toFixed(1)}`;
  },

  parameters: [
    {
      id: 'clusters',
      label: 'Cluster Count (K)',
      type: 'slider',
      min: 2,
      max: 4,
      step: 1,
      defaultValue: 3,
      description: 'Number of Voronoi partitions and cluster centroids to maintain.',
      minLabel: 'K=2',
      maxLabel: 'K=4'
    },
    {
      id: 'showTetherLines',
      label: 'Assignment Tether Rays',
      type: 'toggle',
      defaultValue: true,
      description: 'Draws dashed lines connecting each particle to its assigned centroid.'
    },
    {
      id: 'showVoronoi',
      label: 'Voronoi Bisectors',
      type: 'toggle',
      defaultValue: true,
      description: 'Displays perpendicular bisector boundaries separating adjacent clusters.'
    }
  ],

  getDefaultParameters: () => ({
    clusters: 3,
    showTetherLines: true,
    showVoronoi: true
  }),

  generateDataset: (sampleCount: number, noiseLevel: number, params: Record<string, any>) => {
    const k = params.clusters ?? 3;
    const points: Point[] = [];
    const pointsPerCluster = Math.floor(sampleCount / k);
    const spread = 12 + noiseLevel * 0.3;

    // Anchor origins for clusters
    const origins = [
      { x: 28, y: 30 },
      { x: 72, y: 70 },
      { x: 38, y: 80 },
      { x: 75, y: 25 }
    ];

    for (let c = 0; c < k; c++) {
      const origin = origins[c % origins.length];
      const count = c === k - 1 ? sampleCount - (k - 1) * pointsPerCluster : pointsPerCluster;
      for (let i = 0; i < count; i++) {
        const x = origin.x + (Math.random() - 0.5) * spread;
        const y = origin.y + (Math.random() - 0.5) * spread;
        points.push({
          x: Math.max(5, Math.min(95, x)),
          y: Math.max(5, Math.min(95, y)),
          label: c
        });
      }
    }

    return points;
  },

  onPointInjected: (newPoint, _currentPoints, state: KMeansState) => {
    // Find closest centroid
    let closestIndex = 0;
    let minDist = Infinity;
    state.centroids.forEach((c, idx) => {
      const dist = Math.hypot(newPoint.x - c.x, newPoint.y - c.y);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = idx;
      }
    });

    return {
      x: Math.round(newPoint.x),
      y: Math.round(newPoint.y),
      label: closestIndex
    };
  },

  computeState: (points: Point[], params: Record<string, any>, manualState: Record<string, any>): KMeansState => {
    const k = Math.max(2, Math.min(4, params.clusters ?? 3));

    // Default initial centroid placements
    const defaultCoords = [
      { x: 30, y: 32 },
      { x: 70, y: 68 },
      { x: 40, y: 78 },
      { x: 75, y: 28 }
    ];

    // Load or initialize centroids
    let centroids: Centroid[] = [];
    const manualCentroids = manualState.kmeansCentroids as { x: number; y: number }[] | undefined;

    for (let i = 0; i < k; i++) {
      const coord = (manualCentroids && manualCentroids[i]) ? manualCentroids[i] : defaultCoords[i];
      centroids.push({
        id: i,
        x: coord.x,
        y: coord.y,
        color: CLUSTER_PALETTE[i % CLUSTER_PALETTE.length],
        count: 0
      });
    }

    // Assign points to nearest centroid
    const assignments: number[] = [];
    let totalInertia = 0;
    let totalDist = 0;

    points.forEach((p, idx) => {
      let closestIdx = 0;
      let minSqDist = Infinity;

      centroids.forEach((c, cIdx) => {
        const dx = p.x - c.x;
        const dy = p.y - c.y;
        const sqDist = dx * dx + dy * dy;
        if (sqDist < minSqDist) {
          minSqDist = sqDist;
          closestIdx = cIdx;
        }
      });

      assignments[idx] = closestIdx;
      centroids[closestIdx].count++;
      totalInertia += minSqDist;
      totalDist += Math.sqrt(minSqDist);

      // Keep point label in sync with assignment for proper coloring
      p.label = closestIdx;
    });

    const avgDistance = points.length > 0 ? totalDist / points.length : 0;
    const counts = centroids.map(c => c.count);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    const clusterBalance = maxCount > 0 ? `${Math.round((minCount / maxCount) * 100)}%` : '100%';

    return {
      centroids,
      assignments,
      inertia: totalInertia,
      avgDistance,
      clusterBalance
    };
  },

  computeMetrics: (_points: Point[], state: KMeansState): AlgorithmMetric[] => {
    return [
      {
        key: 'inertia_wcss',
        label: 'Inertia (Within-Cluster SS)',
        value: state.inertia.toFixed(1),
        unit: 'WCSS',
        description: 'Sum of squared Euclidean distances of samples to their closest cluster center.',
        isPrimary: true,
        barPercent: Math.min(100, Math.max(8, (state.inertia / 6000) * 100))
      },
      {
        key: 'avg_radius',
        label: 'Avg Cluster Radius',
        value: `${state.avgDistance.toFixed(1)} mm`,
        description: 'Mean distance from any data particle to its cluster centroid.'
      },
      {
        key: 'cluster_balance',
        label: 'Cluster Balance',
        value: state.clusterBalance,
        description: 'Ratio of smallest cluster size to largest cluster size.'
      }
    ];
  },

  handleCanvasDrag: (x: number, y: number, ctx: InteractiveAlgorithmContext, state: KMeansState) => {
    if (typeof ctx.isDraggingHandle === 'number' || (typeof ctx.isDraggingHandle === 'string' && ctx.isDraggingHandle.startsWith('kmeans_centroid_'))) {
      const idx = typeof ctx.isDraggingHandle === 'number' 
        ? ctx.isDraggingHandle 
        : parseInt(ctx.isDraggingHandle.replace('kmeans_centroid_', ''), 10);

      const updated = state.centroids.map((c, i) => {
        if (i === idx) {
          return { x: Math.round(x), y: Math.round(y) };
        }
        return { x: c.x, y: c.y };
      });

      ctx.setManualState(prev => ({
        ...prev,
        kmeansCentroids: updated
      }));
    }
  },

  renderCanvas: (ctx: InteractiveAlgorithmContext, state: KMeansState) => {
    const { centroids } = state;
    const showTethers = ctx.parameters.showTetherLines ?? true;
    const showVoronoi = ctx.parameters.showVoronoi ?? true;

    // Calculate pairwise bisector lines between centroids for Voronoi preview
    const bisectors: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
    if (showVoronoi && centroids.length >= 2) {
      for (let i = 0; i < centroids.length; i++) {
        for (let j = i + 1; j < centroids.length; j++) {
          const c1 = centroids[i];
          const c2 = centroids[j];
          const mx = (c1.x + c2.x) / 2;
          const my = (c1.y + c2.y) / 2;
          const dx = c2.x - c1.x;
          const dy = c2.y - c1.y;

          if (Math.hypot(dx, dy) > 2) {
            // Perpendicular direction is (-dy, dx)
            const length = 70;
            const norm = Math.hypot(dx, dy);
            const ux = -dy / norm;
            const uy = dx / norm;

            bisectors.push({
              x1: Math.max(-10, Math.min(110, mx - ux * length)),
              y1: Math.max(-10, Math.min(110, my - uy * length)),
              x2: Math.max(-10, Math.min(110, mx + ux * length)),
              y2: Math.max(-10, Math.min(110, my + uy * length)),
              color: '#A8A29E'
            });
          }
        }
      }
    }

    return (
      <g id="kmeans_clustering_canvas_elements">
        {/* Voronoi Partition Bisectors */}
        {bisectors.map((b, bIdx) => (
          <line
            key={`voronoi-${bIdx}`}
            x1={b.x1}
            y1={100 - b.y1}
            x2={b.x2}
            y2={100 - b.y2}
            stroke={b.color}
            strokeWidth="0.8"
            strokeDasharray="3,3"
            opacity={0.7}
          />
        ))}

        {/* Assignment Tether Rays */}
        {showTethers && ctx.points.map((p, pIdx) => {
          const c = centroids[p.label ?? 0];
          if (!c) return null;
          return (
            <line
              key={`tether-${pIdx}`}
              x1={p.x}
              y1={100 - p.y}
              x2={c.x}
              y2={100 - c.y}
              stroke={c.color}
              strokeWidth="0.35"
              strokeDasharray="1,1"
              opacity={0.4}
            />
          );
        })}

        {/* Draggable Centroids (μ_k) with Tactile Reticle */}
        {centroids.map((c, idx) => (
          <g
            key={`centroid-marker-${idx}`}
            className="cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
              e.stopPropagation();
              ctx.setIsDraggingHandle(`kmeans_centroid_${idx}`);
            }}
          >
            {/* Pulsing Outer Calibration Ring */}
            <circle
              cx={c.x}
              cy={100 - c.y}
              r="8.5"
              fill="none"
              stroke={c.color}
              strokeWidth="0.5"
              strokeDasharray="2,1"
              opacity={0.8}
            />

            {/* Target Reticle Crosshair */}
            <line
              x1={c.x - 6}
              y1={100 - c.y}
              x2={c.x + 6}
              y2={100 - c.y}
              stroke={c.color}
              strokeWidth="0.6"
            />
            <line
              x1={c.x}
              y1={100 - c.y - 6}
              x2={c.x}
              y2={100 - c.y + 6}
              stroke={c.color}
              strokeWidth="0.6"
            />

            {/* Solid Centroid Core */}
            <circle
              cx={c.x}
              cy={100 - c.y}
              r="4.5"
              fill={c.color}
              stroke="#FFFFFF"
              strokeWidth="1.2"
            />

            {/* Centroid Tag & Particle Count Callout */}
            <rect
              x={c.x + 6}
              y={100 - c.y - 8}
              width="16"
              height="8"
              rx="2"
              fill="#FFFFFF"
              stroke={c.color}
              strokeWidth="0.6"
              opacity={0.92}
            />
            <text
              x={c.x + 8}
              y={100 - c.y - 2.5}
              fill={c.color}
              fontSize="3.2"
              fontFamily="monospace"
              fontWeight="bold"
            >
              μ{idx + 1} ({c.count})
            </text>
          </g>
        ))}
      </g>
    );
  },

  generateCode: (framework: 'sklearn' | 'pytorch', points: Point[], params: Record<string, any>, state: KMeansState) => {
    const k = params.clusters ?? 3;
    const sampleSlice = points.slice(0, 6);

    if (framework === 'sklearn') {
      return `# scikit-learn K-Means Clustering Pipeline
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import numpy as np

# 1. Empirical Feature Matrix X
X = np.array([${sampleSlice.map(p => `[${p.x}, ${p.y.toFixed(1)}]`).join(', ')}])

# 2. Fit K-Means Estimator with k-means++ seeding
kmeans = KMeans(
    n_clusters=${k},
    init='k-means++',
    n_init=10,
    max_iter=300,
    random_state=42
)
cluster_labels = kmeans.fit_predict(X)

print(f"Optimal Cluster Centers (μ):\\n{kmeans.cluster_centers_}")
print(f"Total Inertia (WCSS): {kmeans.inertia_:.2f}")
if len(X) > ${k}:
    print(f"Silhouette Score: {silhouette_score(X, cluster_labels):.3f}")`;
    } else {
      return `# PyTorch Vectorized K-Means Algorithm Loop
import torch

# 1. Empirical Tensors (N x 2) and Centroids (K x 2)
X = torch.tensor([${sampleSlice.map(p => `[${p.x}.0, ${p.y.toFixed(1)}]`).join(', ')}], dtype=torch.float32)
centroids = torch.tensor([${state.centroids.map(c => `[${c.x}.0, ${c.y}.0]`).join(', ')}], dtype=torch.float32)

# 2. Vectorized Pairwise Euclidean Distance via (a - b)^2 = a^2 - 2ab + b^2
distances = torch.cdist(X, centroids, p=2) # Shape: (N, K)
assignments = torch.argmin(distances, dim=1)

# 3. Compute Within-Cluster Sum of Squares (WCSS)
min_distances = torch.gather(distances, 1, assignments.unsqueeze(1))
inertia = torch.sum(min_distances ** 2)

print("PyTorch Cluster Assignments:", assignments.tolist())
print(f"Empirical Inertia WCSS: {inertia.item():.2f}")`;
    }
  },

  getSocraticPrompt: (params, metrics) => {
    return `In K-Means clustering with K=${params.clusters}, total Inertia is ${metrics[0].value}. Explain Lloyd's algorithm iteration: how alternations between the Voronoi assignment step and the centroid recentering step monotonically reduce the within-cluster sum of squares.`;
  },

  defaultSocraticExplanation: "K-Means alternates between two geometric phases: assigning each data particle to its closest centroid (forming Voronoi partitions), and moving each centroid to the center-of-mass of its assigned particles until equilibrium is reached."
};

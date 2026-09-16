import React from 'react';
import { AlgorithmModule, AlgorithmMetric, InteractiveAlgorithmContext, Point } from '../types';

export interface PCAState {
  meanX: number;
  meanY: number;
  pc1Angle: number;
  pc1Length: number;
  pc2Length: number;
  pc1VarianceRatio: number;
  pc2VarianceRatio: number;
  projectionProgress: number;
  projectedPoints: { origX: number; origY: number; projX: number; projY: number; id: string }[];
}

export const pcaModule: AlgorithmModule = {
  id: 'pca',
  name: 'Principal Component Analysis (PCA)',
  shortLabel: 'Principal Component Analysis',
  category: 'Unsupervised: Dimensionality',
  badgeText: 'Eigenvectors • Dimensionality Reduction',
  badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-300',
  description: 'Finds the orthogonal directions of maximum variance in the data (eigenvectors of covariance matrix). Compresses high-dimensional datasets into fewer dimensions while preserving maximum information.',

  simpleAnalogy: 'Imagine holding a 3D teapot in your hand. If you cast its shadow on a wall, rotating the teapot to make the shadow as wide and detailed as possible captures the most information. That longest axis of shadow is the 1st Principal Component (PC1)!',
  simpleSteps: [
    'Center the data by subtracting the average X and Y from every point.',
    'Calculate which direction has the widest spread (the longest stretch of dots). That is PC1.',
    'Flatten all points onto that single line: 2D data is now safely simplified into 1D with almost zero information lost!'
  ],
  whatToTry: [
    'Drag the "1D Flatten Projection" slider to 100%. Watch the points smoothly collapse onto the blue PC1 line!',
    'Adjust the "Feature Correlation" slider to see the blue PC1 vector rotate to match the spread of the points.',
    'Notice how PC1 explains 85%+ of the entire dataset variance with just 1 number per point!'
  ],

  getHypothesisText: (params, state: PCAState) => {
    return `PC₁ Vector: [${Math.cos(state.pc1Angle).toFixed(2)}, ${Math.sin(state.pc1Angle).toFixed(2)}] • Explained Variance: ${(state.pc1VarianceRatio * 100).toFixed(1)}% (PC₂: ${(state.pc2VarianceRatio * 100).toFixed(1)}%)`;
  },

  parameters: [
    {
      id: 'correlation',
      label: 'Feature Correlation (Covariance)',
      type: 'slider',
      min: -0.9,
      max: 0.9,
      step: 0.1,
      defaultValue: 0.8,
      description: 'Linear association between X and Y coordinates. High correlation = high variance retained in 1st component.',
      minLabel: '-0.9 (Negative)',
      maxLabel: '+0.9 (Positive)'
    },
    {
      id: 'projectionProgress',
      label: '1D Dimension Flattening (Progress)',
      type: 'slider',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 0,
      description: 'Interpolates points from original 2D coordinates to their 1D projection onto PC1.',
      minLabel: '0% (Full 2D)',
      maxLabel: '100% (1D PC1 Projection)'
    },
    {
      id: 'showEigenvectors',
      label: 'Show Eigenvector Axes (PC1 & PC2)',
      type: 'toggle',
      defaultValue: true,
      description: 'Displays orthogonal principal axes radiating from the dataset mean.'
    },
    {
      id: 'showDropLines',
      label: 'Show Projection Drop Lines',
      type: 'toggle',
      defaultValue: true,
      description: 'Draws dashed orthogonal lines connecting each original point to its projection.'
    }
  ],

  getDefaultParameters: () => ({
    correlation: 0.8,
    projectionProgress: 0,
    showEigenvectors: true,
    showDropLines: true
  }),

  generateDataset: (sampleCount: number, noiseLevel: number, params: Record<string, any>) => {
    const points: Point[] = [];
    const r = Number(params.correlation ?? 0.8);

    for (let i = 0; i < sampleCount; i++) {
      // Generate bivariate normal sample with correlation r
      const u1 = Math.max(0.001, Math.random());
      const u2 = Math.random();
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

      // Correlated variables: X = z1, Y = r*z1 + sqrt(1 - r^2)*z2
      const xVal = z1 * 16;
      const yVal = (r * z1 + Math.sqrt(Math.max(0.05, 1 - r * r)) * z2) * 16;

      const px = Math.max(10, Math.min(90, 50 + xVal + (Math.random() - 0.5) * noiseLevel * 4));
      const py = Math.max(10, Math.min(90, 50 + yVal + (Math.random() - 0.5) * noiseLevel * 4));

      points.push({
        id: `pca_${i}`,
        x: px,
        y: py,
        label: 0
      });
    }

    return points;
  },

  onPointInjected: (newPoint) => {
    return {
      id: `custom_pca_${Date.now()}`,
      x: Math.round(newPoint.x * 10) / 10,
      y: Math.round(newPoint.y * 10) / 10,
      label: 0
    };
  },

  computeState: (points: Point[], params: Record<string, any>): PCAState => {
    if (points.length === 0) {
      return {
        meanX: 50,
        meanY: 50,
        pc1Angle: 0.785,
        pc1Length: 30,
        pc2Length: 10,
        pc1VarianceRatio: 0.85,
        pc2VarianceRatio: 0.15,
        projectionProgress: 0,
        projectedPoints: []
      };
    }

    // 1. Mean calculation
    let sumX = 0;
    let sumY = 0;
    for (const p of points) {
      sumX += p.x;
      sumY += p.y;
    }
    const meanX = sumX / points.length;
    const meanY = sumY / points.length;

    // 2. Covariance matrix elements
    let varX = 0;
    let varY = 0;
    let covXY = 0;
    for (const p of points) {
      const dx = p.x - meanX;
      const dy = p.y - meanY;
      varX += dx * dx;
      varY += dy * dy;
      covXY += dx * dy;
    }
    varX /= points.length;
    varY /= points.length;
    covXY /= points.length;

    // 3. 2x2 Covariance Eigenvalues and PC1 angle:
    // angle = 0.5 * atan2(2 * covXY, varX - varY)
    const pc1Angle = 0.5 * Math.atan2(2 * covXY, varX - varY);
    const ux = Math.cos(pc1Angle);
    const uy = Math.sin(pc1Angle);

    // Eigenvalues lambda1, lambda2
    const trace = varX + varY;
    const diff = varX - varY;
    const disc = Math.sqrt(diff * diff + 4 * covXY * covXY);
    const lambda1 = (trace + disc) / 2;
    const lambda2 = Math.max(0.1, (trace - disc) / 2);

    const totalVar = lambda1 + lambda2 || 1;
    const pc1VarianceRatio = Math.min(0.99, lambda1 / totalVar);
    const pc2VarianceRatio = Math.max(0.01, 1 - pc1VarianceRatio);

    const pc1Length = Math.min(38, Math.sqrt(lambda1) * 2);
    const pc2Length = Math.min(22, Math.sqrt(lambda2) * 2);

    const projectionProgress = (Number(params.projectionProgress ?? 0)) / 100;

    // Project points onto PC1 axis
    const projectedPoints = points.map(p => {
      const dx = p.x - meanX;
      const dy = p.y - meanY;
      // Scalar projection dot product
      const scalar = dx * ux + dy * uy;
      const projX = meanX + scalar * ux;
      const projY = meanY + scalar * uy;

      // Current position interpolated between original and projected
      const currentX = p.x + (projX - p.x) * projectionProgress;
      const currentY = p.y + (projY - p.y) * projectionProgress;

      return {
        id: p.id,
        origX: p.x,
        origY: p.y,
        projX,
        projY,
        currentX,
        currentY
      };
    });

    return {
      meanX,
      meanY,
      pc1Angle,
      pc1Length,
      pc2Length,
      pc1VarianceRatio,
      pc2VarianceRatio,
      projectionProgress,
      projectedPoints: projectedPoints as any
    };
  },

  computeMetrics: (points: Point[], state: PCAState, params: Record<string, any>): AlgorithmMetric[] => {
    return [
      {
        key: 'var_pc1',
        id: 'var_pc1',
        label: 'PC1 Explained Variance',
        value: `${(state.pc1VarianceRatio * 100).toFixed(1)}%`,
        isGood: state.pc1VarianceRatio > 0.75,
        description: 'Proportion of total dataset information preserved in the 1st principal component.'
      },
      {
        key: 'var_pc2',
        id: 'var_pc2',
        label: 'PC2 Explained Variance',
        value: `${(state.pc2VarianceRatio * 100).toFixed(1)}%`,
        description: 'Remaining variance contained in the secondary orthogonal direction.'
      },
      {
        key: 'dim_reduction',
        id: 'dim_reduction',
        label: 'Dimension Compression',
        value: '2D → 1D',
        isGood: true,
        description: 'Compressing 2 feature coordinates into 1 scalar coordinate per sample.'
      },
      {
        key: 'loss_info',
        id: 'loss_info',
        label: 'Information Loss',
        value: `${(state.pc2VarianceRatio * 100).toFixed(1)}%`,
        isGood: state.pc2VarianceRatio < 0.2,
        description: 'Residual variance discarded by dropping the 2nd principal component.'
      }
    ];
  },

  renderCanvas: (ctx: InteractiveAlgorithmContext, state: PCAState) => {
    const { params } = ctx;
    const showEigen = params.showEigenvectors ?? true;
    const showDrops = params.showDropLines ?? true;

    const ux = Math.cos(state.pc1Angle);
    const uy = Math.sin(state.pc1Angle);
    // Orthogonal vector for PC2 (-uy, ux)
    const vx = -uy;
    const vy = ux;

    return (
      <g className="pca-visualization">
        {/* PC1 Axis Line across full canvas */}
        {showEigen && (
          <g>
            <line
              x1={state.meanX - ux * 50}
              y1={state.meanY - uy * 50}
              x2={state.meanX + ux * 50}
              y2={state.meanY + uy * 50}
              stroke="#0284c7"
              strokeWidth="0.8"
              strokeDasharray="2 2"
              opacity="0.6"
            />
            {/* PC2 Axis Line */}
            <line
              x1={state.meanX - vx * 30}
              y1={state.meanY - vy * 30}
              x2={state.meanX + vx * 30}
              y2={state.meanY + vy * 30}
              stroke="#9333ea"
              strokeWidth="0.6"
              strokeDasharray="2 2"
              opacity="0.4"
            />
          </g>
        )}

        {/* Dashed projection drop lines from original point to projected point */}
        {showDrops && state.projectedPoints.map((p, idx) => (
          <line
            key={p.id ? `drop_${p.id}` : `drop_${idx}`}
            x1={p.origX}
            y1={p.origY}
            x2={p.projX}
            y2={p.projY}
            stroke="#94a3b8"
            strokeWidth="0.5"
            strokeDasharray="1 1"
            opacity="0.7"
          />
        ))}

        {/* Data points (with smooth interpolation to projected position) */}
        {state.projectedPoints.map((p, idx) => {
          const cx = (p as any).currentX ?? p.origX;
          const cy = (p as any).currentY ?? p.origY;
          return (
            <circle
              key={p.id || `pca_pt_${idx}`}
              cx={cx}
              cy={cy}
              r="2"
              fill="#0284c7"
              stroke="#ffffff"
              strokeWidth="0.6"
              className="transition-all duration-75"
            />
          );
        })}

        {/* Eigenvector Arrows radiating from Center of Mass (Mean) */}
        {showEigen && (
          <g>
            {/* PC1 Primary Vector (Blue Arrow) */}
            <line
              x1={state.meanX}
              y1={state.meanY}
              x2={state.meanX + ux * state.pc1Length}
              y2={state.meanY + uy * state.pc1Length}
              stroke="#0284c7"
              strokeWidth="2"
            />
            <circle
              cx={state.meanX + ux * state.pc1Length}
              cy={state.meanY + uy * state.pc1Length}
              r="2.5"
              fill="#0284c7"
            />

            {/* PC2 Secondary Vector (Purple Arrow) */}
            <line
              x1={state.meanX}
              y1={state.meanY}
              x2={state.meanX + vx * state.pc2Length}
              y2={state.meanY + vy * state.pc2Length}
              stroke="#9333ea"
              strokeWidth="1.6"
            />
            <circle
              cx={state.meanX + vx * state.pc2Length}
              cy={state.meanY + vy * state.pc2Length}
              r="2"
              fill="#9333ea"
            />

            {/* Mean Center Point */}
            <circle
              cx={state.meanX}
              cy={state.meanY}
              r="2.8"
              fill="#e11d48"
              stroke="#ffffff"
              strokeWidth="1"
            />
            <text
              x={state.meanX + 3}
              y={state.meanY - 3}
              fill="#e11d48"
              fontSize="3"
              fontFamily="monospace"
              fontWeight="bold"
            >
              Mean (μ)
            </text>
          </g>
        )}
      </g>
    );
  },

  generateCode: (framework: 'sklearn' | 'pytorch', points: Point[], params: Record<string, any>, state: PCAState) => {
    if (framework === 'sklearn') {
      return `import numpy as np
from sklearn.decomposition import PCA

# 1. 2D Coordinate Matrix X
X = np.array([
${points.slice(0, 6).map(p => `    [${p.x.toFixed(1)}, ${p.y.toFixed(1)}]`).join(',\n')}
])

# 2. Fit PCA to extract First Principal Component
pca = PCA(n_components=1)
X_reduced = pca.fit_transform(X)

print("Original 2D Shape:", X.shape)
print("Compressed 1D Shape:", X_reduced.shape)
print("PC1 Eigenvector Direction:", pca.components_[0])
print(f"Explained Variance Ratio: {pca.explained_variance_ratio_[0] * 100:.1f}%")

# 3. Reconstruct back to 2D approximation
X_reconstructed = pca.inverse_transform(X_reduced)
reconstruction_error = np.mean((X - X_reconstructed) ** 2)
print("Mean Squared Reconstruction Loss:", reconstruction_error)`;
    }

    return `import torch

# PyTorch PCA via Singular Value Decomposition (SVD)
X = torch.tensor([
${points.slice(0, 6).map(p => `    [${p.x.toFixed(1)}, ${p.y.toFixed(1)}]`).join(',\n')}
], dtype=torch.float32)

# Center the data
mean = torch.mean(X, dim=0)
X_centered = X - mean

# Compute SVD: X = U * S * V^T
U, S, V = torch.linalg.svd(X_centered, full_matrices=False)

# First principal component direction (first row of V)
pc1 = V[0]
print("PyTorch PC1 Direction:", pc1)

# Project onto 1D subspace
X_1d = torch.matmul(X_centered, pc1.unsqueeze(1))
print("1D Subspace Coordinates:", X_1d[:4].squeeze())`;
  },

  getSocraticPrompt: (params, metrics, state: PCAState) => {
    return `Look at the blue PC1 arrow! By aligning with the main tilt of the data, the single PC1 component captures ${(state.pc1VarianceRatio * 100).toFixed(1)}% of all the variation in this entire dataset. If you drag the 1D Flattening slider, you can see how compressing 2D points onto this line keeps their relative rankings almost perfectly intact!`;
  }
};

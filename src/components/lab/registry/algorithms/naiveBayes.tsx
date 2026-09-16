import React from 'react';
import { AlgorithmModule, AlgorithmMetric, InteractiveAlgorithmContext, Point } from '../types';

export interface NaiveBayesState {
  mean0: { x: number; y: number };
  var0: { x: number; y: number };
  mean1: { x: number; y: number };
  var1: { x: number; y: number };
  prior1: number;
  prior0: number;
  accuracy: number;
  logLikelihood: number;
}

export const naiveBayesModule: AlgorithmModule = {
  id: 'naive_bayes',
  name: 'Gaussian Naive Bayes',
  shortLabel: 'Naive Bayes',
  category: 'Supervised: Classification',
  badgeText: 'Bayes Theorem • Gaussian Likelihoods',
  badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  description: 'Applies Bayes Theorem with the "naive" conditional independence assumption. Models each feature using Gaussian normal probability bell curves and assigns the class with highest posterior probability.',

  simpleAnalogy: 'Like diagnosing a common cold: if you have a fever (clue 1) and a runny nose (clue 2), Naive Bayes checks how likely each symptom is for both "Cold" and "Flu", then multiplies the odds together. It assumes symptoms act independently!',
  simpleSteps: [
    'Calculate the average and spread (bell curve) for each class separately.',
    'For any new point, calculate the probability height on both bell curves.',
    'Multiply by the base prior probability: whichever class scores higher wins!'
  ],
  whatToTry: [
    'Adjust the "Class 1 Prior Probability" slider: notice how increasing the prior tilts the boundary to favor Green even when points are close to Red!',
    'Toggle "Gaussian Density Contours" on: see the concentric probability rings centered on each cluster.',
    'Click anywhere to add new points and watch the bell curve centers (μ) shift dynamically.'
  ],

  getHypothesisText: (params, state: NaiveBayesState) => {
    return `P(C₁|x) ∝ P(C₁) · 𝒩(x₁; μ₁, σ₁²) · 𝒩(x₂; μ₂, σ₂²) • Prior P(C₁)=${state.prior1.toFixed(2)} • Acc=${state.accuracy}%`;
  },

  parameters: [
    {
      id: 'priorWeight',
      label: 'Class 1 Prior Probability P(C1)',
      type: 'slider',
      min: 0.1,
      max: 0.9,
      step: 0.05,
      defaultValue: 0.5,
      description: 'Prior belief about how common Class 1 is in the population before seeing coordinates.',
      minLabel: '0.1 (Rare)',
      maxLabel: '0.9 (Dominant)'
    },
    {
      id: 'varianceScale',
      label: 'Variance Smoothing (σ Scale)',
      type: 'slider',
      min: 0.5,
      max: 2.0,
      step: 0.1,
      defaultValue: 1.0,
      description: 'Expands or tightens the Gaussian bell curve standard deviation spread.',
      minLabel: '0.5 (Tight Bells)',
      maxLabel: '2.0 (Broad Bells)'
    },
    {
      id: 'showContours',
      label: 'Gaussian Density Contours',
      type: 'toggle',
      defaultValue: true,
      description: 'Renders 1-sigma and 2-sigma probability ellipse contours for each class.'
    },
    {
      id: 'showBoundary',
      label: 'Bayesian Decision Boundary',
      type: 'toggle',
      defaultValue: true,
      description: 'Draws the threshold line where posterior probability P(C1|x) equals P(C0|x).'
    }
  ],

  getDefaultParameters: () => ({
    priorWeight: 0.5,
    varianceScale: 1.0,
    showContours: true,
    showBoundary: true
  }),

  generateDataset: (sampleCount: number, noiseLevel: number) => {
    const points: Point[] = [];
    const n = Math.floor(sampleCount / 2);

    // Class 0: Center around (35, 40)
    for (let i = 0; i < n; i++) {
      const u1 = Math.max(0.001, Math.random());
      const u2 = Math.random();
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
      points.push({
        id: `nb0_${i}`,
        x: Math.max(10, Math.min(85, 34 + z1 * (10 + noiseLevel * 5))),
        y: Math.max(10, Math.min(85, 38 + z2 * (9 + noiseLevel * 5))),
        label: 0
      });
    }

    // Class 1: Center around (68, 65)
    for (let i = 0; i < n; i++) {
      const u1 = Math.max(0.001, Math.random());
      const u2 = Math.random();
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
      points.push({
        id: `nb1_${i}`,
        x: Math.max(15, Math.min(90, 68 + z1 * (11 + noiseLevel * 5))),
        y: Math.max(15, Math.min(90, 64 + z2 * (10 + noiseLevel * 5))),
        label: 1
      });
    }

    return points;
  },

  onPointInjected: (newPoint, currentPoints) => {
    const dist0 = Math.hypot(newPoint.x - 34, newPoint.y - 38);
    const dist1 = Math.hypot(newPoint.x - 68, newPoint.y - 64);
    const label = dist1 < dist0 ? 1 : 0;
    return {
      id: `custom_nb_${Date.now()}`,
      x: Math.round(newPoint.x * 10) / 10,
      y: Math.round(newPoint.y * 10) / 10,
      label
    };
  },

  computeState: (points: Point[], params: Record<string, any>): NaiveBayesState => {
    const prior1 = Number(params.priorWeight ?? 0.5);
    const prior0 = 1 - prior1;
    const varScale = Number(params.varianceScale ?? 1.0);

    const c0Points = points.filter(p => p.label === 0);
    const c1Points = points.filter(p => p.label === 1);

    const getMeanVar = (pts: Point[], defX: number, defY: number) => {
      if (pts.length === 0) return { mean: { x: defX, y: defY }, var: { x: 80, y: 80 } };
      let sx = 0;
      let sy = 0;
      for (const p of pts) {
        sx += p.x;
        sy += p.y;
      }
      const mx = sx / pts.length;
      const my = sy / pts.length;
      let vx = 0;
      let vy = 0;
      for (const p of pts) {
        vx += (p.x - mx) ** 2;
        vy += (p.y - my) ** 2;
      }
      return {
        mean: { x: mx, y: my },
        var: {
          x: Math.max(25, (vx / pts.length) * varScale),
          y: Math.max(25, (vy / pts.length) * varScale)
        }
      };
    };

    const stats0 = getMeanVar(c0Points, 34, 38);
    const stats1 = getMeanVar(c1Points, 68, 64);

    // Compute posterior and accuracy
    let correct = 0;
    let totalLogLikelihood = 0;

    for (const p of points) {
      // Gaussian log-likelihood for Class 0
      const ll0 = -0.5 * Math.log(2 * Math.PI * stats0.var.x) - ((p.x - stats0.mean.x) ** 2) / (2 * stats0.var.x)
                  -0.5 * Math.log(2 * Math.PI * stats0.var.y) - ((p.y - stats0.mean.y) ** 2) / (2 * stats0.var.y)
                  + Math.log(prior0);

      // Gaussian log-likelihood for Class 1
      const ll1 = -0.5 * Math.log(2 * Math.PI * stats1.var.x) - ((p.x - stats1.mean.x) ** 2) / (2 * stats1.var.x)
                  -0.5 * Math.log(2 * Math.PI * stats1.var.y) - ((p.y - stats1.mean.y) ** 2) / (2 * stats1.var.y)
                  + Math.log(prior1);

      const pred = ll1 >= ll0 ? 1 : 0;
      if (pred === (p.label ?? 0)) correct++;
      totalLogLikelihood += (p.label === 1 ? ll1 : ll0);
    }

    const accuracy = points.length > 0 ? Math.round((correct / points.length) * 100) : 92;
    const logLikelihood = points.length > 0 ? totalLogLikelihood / points.length : -1.8;

    return {
      mean0: stats0.mean,
      var0: stats0.var,
      mean1: stats1.mean,
      var1: stats1.var,
      prior1,
      prior0,
      accuracy,
      logLikelihood
    };
  },

  computeMetrics: (points: Point[], state: NaiveBayesState, params: Record<string, any>): AlgorithmMetric[] => {
    return [
      {
        key: 'accuracy',
        id: 'accuracy',
        label: 'Posterior Accuracy',
        value: `${state.accuracy}%`,
        isGood: state.accuracy > 85,
        description: 'Empirical classification accuracy based on argmax P(C_k|x).'
      },
      {
        key: 'prior_odds',
        id: 'prior_odds',
        label: 'Prior Odds Ratio',
        value: `${(state.prior1 / state.prior0).toFixed(2)} : 1`,
        description: 'Relative baseline likelihood ratio P(C1) / P(C0).'
      },
      {
        key: 'log_lik',
        id: 'log_lik',
        label: 'Avg Log-Likelihood',
        value: state.logLikelihood.toFixed(2),
        isGood: state.logLikelihood > -3.0,
        description: 'Log-evidence of observing the sample coordinates under fitted Gaussian kernels.'
      },
      {
        key: 'centers',
        id: 'centers',
        label: 'Gaussian Centers (μ)',
        value: `C0:(${state.mean0.x.toFixed(0)},${state.mean0.y.toFixed(0)}) | C1:(${state.mean1.x.toFixed(0)},${state.mean1.y.toFixed(0)})`,
        description: 'Estimated bivariate normal center means for both classes.'
      }
    ];
  },

  renderCanvas: (ctx: InteractiveAlgorithmContext, state: NaiveBayesState) => {
    const { points, params } = ctx;
    const showContours = params.showContours ?? true;
    const showBoundary = params.showBoundary ?? true;

    const std0x = Math.sqrt(state.var0.x);
    const std0y = Math.sqrt(state.var0.y);
    const std1x = Math.sqrt(state.var1.x);
    const std1y = Math.sqrt(state.var1.y);

    // Approximate linear decision boundary passing between means
    const midX = (state.mean0.x + state.mean1.x) / 2 + (state.prior0 - state.prior1) * 12;
    const midY = (state.mean0.y + state.mean1.y) / 2;
    const dx = state.mean1.x - state.mean0.x;
    const dy = state.mean1.y - state.mean0.y;
    // Perpendicular line vector (-dy, dx)
    const px = -dy;
    const py = dx;
    const norm = Math.hypot(px, py) || 1;
    const ux = px / norm;
    const uy = py / norm;

    return (
      <g className="naive-bayes-visualization">
        {/* Gaussian Probability Contours */}
        {showContours && (
          <g opacity="0.6">
            {/* Class 0 1-sigma & 2-sigma ellipses */}
            <ellipse
              cx={state.mean0.x}
              cy={state.mean0.y}
              rx={std0x * 1.5}
              ry={std0y * 1.5}
              fill="rgba(244, 63, 94, 0.08)"
              stroke="#f43f5e"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />
            <ellipse
              cx={state.mean0.x}
              cy={state.mean0.y}
              rx={std0x * 0.8}
              ry={std0y * 0.8}
              fill="rgba(244, 63, 94, 0.15)"
              stroke="#f43f5e"
              strokeWidth="1"
            />

            {/* Class 1 1-sigma & 2-sigma ellipses */}
            <ellipse
              cx={state.mean1.x}
              cy={state.mean1.y}
              rx={std1x * 1.5}
              ry={std1y * 1.5}
              fill="rgba(16, 185, 129, 0.08)"
              stroke="#10b981"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />
            <ellipse
              cx={state.mean1.x}
              cy={state.mean1.y}
              rx={std1x * 0.8}
              ry={std1y * 0.8}
              fill="rgba(16, 185, 129, 0.15)"
              stroke="#10b981"
              strokeWidth="1"
            />
          </g>
        )}

        {/* Bayesian Decision Boundary Line */}
        {showBoundary && (
          <g>
            <line
              x1={midX - ux * 60}
              y1={midY - uy * 60}
              x2={midX + ux * 60}
              y2={midY + uy * 60}
              stroke="#0f172a"
              strokeWidth="1.2"
              strokeDasharray="3 2"
            />
          </g>
        )}

        {/* Data points */}
        {points.map((p, idx) => {
          const isClass1 = p.label === 1;
          return (
            <circle
              key={p.id || `nb_pt_${idx}`}
              cx={p.x}
              cy={p.y}
              r="2"
              fill={isClass1 ? '#10b981' : '#f43f5e'}
              stroke="#ffffff"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Mean Centroid markers */}
        <circle cx={state.mean0.x} cy={state.mean0.y} r="2.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.2" />
        <circle cx={state.mean1.x} cy={state.mean1.y} r="2.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.2" />
      </g>
    );
  },

  generateCode: (framework: 'sklearn' | 'pytorch', points: Point[], params: Record<string, any>, state: NaiveBayesState) => {
    const prior = params.priorWeight ?? 0.5;

    if (framework === 'sklearn') {
      return `import numpy as np
from sklearn.naive_bayes import GaussianNB

# 1. 2D Coordinates Feature Matrix X and Ground Truth y
X = np.array([
${points.slice(0, 6).map(p => `    [${p.x.toFixed(1)}, ${p.y.toFixed(1)}]`).join(',\n')}
])
y = np.array([${points.slice(0, 6).map(p => p.label ?? 0).join(', ')}])

# 2. Fit Gaussian Naive Bayes with custom Class Priors
gnb = GaussianNB(priors=[${(1 - prior).toFixed(2)}, ${prior.toFixed(2)}])
gnb.fit(X, y)

print("Gaussian Centroid Means (μ):\\n", gnb.theta_)
print("Gaussian Feature Variances (σ²):\\n", gnb.var_)

# 3. Predict Posterior Probabilities for sample point
sample = np.array([[50.0, 50.0]])
probs = gnb.predict_proba(sample)[0]
print(f"Sample P(C0|x)={probs[0]:.3f}, P(C1|x)={probs[1]:.3f}")`;
    }

    return `import torch
import math

# PyTorch Gaussian Naive Bayes Implementation
def gaussian_log_prob(x, mean, var):
    return -0.5 * torch.log(2 * math.pi * var) - ((x - mean) ** 2) / (2 * var)

# Priors
log_prior_0 = math.log(${(1 - prior).toFixed(2)})
log_prior_1 = math.log(${prior.toFixed(2)})

# Means & Variances
mean_0 = torch.tensor([${state.mean0.x.toFixed(1)}, ${state.mean0.y.toFixed(1)}])
var_0 = torch.tensor([${state.var0.x.toFixed(1)}, ${state.var0.y.toFixed(1)}])

mean_1 = torch.tensor([${state.mean1.x.toFixed(1)}, ${state.mean1.y.toFixed(1)}])
var_1 = torch.tensor([${state.var1.x.toFixed(1)}, ${state.var1.y.toFixed(1)}])

sample = torch.tensor([50.0, 50.0])
ll_0 = log_prior_0 + torch.sum(gaussian_log_prob(sample, mean_0, var_0))
ll_1 = log_prior_1 + torch.sum(gaussian_log_prob(sample, mean_1, var_1))

predicted_class = 1 if ll_1 > ll_0 else 0
print(f"PyTorch NB Prediction: Class {predicted_class}")`;
  },

  getSocraticPrompt: (params, metrics, state: NaiveBayesState) => {
    return `Notice how the rings illustrate the bell curve height! Naive Bayes calculates how probable your coordinates are under both the Coral and Green Gaussian distributions, then weights them by the prior probability. Even though it assumes X and Y are independent ("naive"), it runs blazingly fast and delivers ${state.accuracy}% accuracy!`;
  }
};

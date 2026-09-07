import React from 'react';
import { AlgorithmModule, AlgorithmMetric, InteractiveAlgorithmContext, ParameterDefinition, Point } from '../types';

export interface LinearRegressionState {
  slope: number;
  intercept: number;
  optimalSlope: number;
  optimalIntercept: number;
  mse: number;
  mae: number;
  r2: number;
  isManual: boolean;
}

export const linearRegressionModule: AlgorithmModule = {
  id: 'linear_regression',
  name: 'Linear Regression (Ordinary Least Squares)',
  shortLabel: 'Linear Regression',
  category: 'Supervised: Regression',
  badgeText: 'OLS • Closed Form',
  badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  description: 'Minimizes the sum of squared vertical residuals along a continuous 1D hyperplane using normal equations or iterative gradient steps.',

  getHypothesisText: (_params, state: LinearRegressionState) => {
    return `ŷ = (${state.slope.toFixed(2)})·x + (${state.intercept.toFixed(1)}) • R² = ${state.r2.toFixed(3)}`;
  },

  parameters: [
    {
      id: 'learningRate',
      label: 'Learning Rate (η)',
      type: 'slider',
      min: 0.001,
      max: 0.20,
      step: 0.005,
      defaultValue: 0.05,
      description: 'Gradient descent step multiplier per parameter update.'
    }
  ],

  getDefaultParameters: () => ({
    learningRate: 0.05
  }),

  generateDataset: (sampleCount: number, noiseLevel: number) => {
    const points: Point[] = [];
    for (let i = 0; i < sampleCount; i++) {
      const x = 10 + (i / sampleCount) * 80;
      const trueY = 15 + 0.7 * x;
      const noise = (Math.random() - 0.5) * noiseLevel;
      points.push({
        x: Math.round(x * 10) / 10,
        y: Math.max(5, Math.min(95, Math.round((trueY + noise) * 10) / 10))
      });
    }
    return points;
  },

  onPointInjected: (newPoint) => {
    return {
      x: Math.round(newPoint.x),
      y: Math.round(newPoint.y)
    };
  },

  computeState: (points: Point[], _params: Record<string, any>, manualState: Record<string, any>): LinearRegressionState => {
    let optimalSlope = 0.7;
    let optimalIntercept = 15;

    if (points.length > 1) {
      const n = points.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      points.forEach(p => {
        sumX += p.x;
        sumY += p.y;
        sumXY += p.x * p.y;
        sumXX += p.x * p.x;
      });
      const denom = n * sumXX - sumX * sumX;
      if (Math.abs(denom) > 1e-5) {
        optimalSlope = (n * sumXY - sumX * sumY) / denom;
        optimalIntercept = (sumY - optimalSlope * sumX) / n;
      }
    }

    const isManual = manualState.linearSlope !== undefined || manualState.linearIntercept !== undefined;
    const slope = isManual ? (manualState.linearSlope ?? optimalSlope) : optimalSlope;
    const intercept = isManual ? (manualState.linearIntercept ?? optimalIntercept) : optimalIntercept;

    // Metrics computation
    const n = points.length || 1;
    let sumY = 0;
    points.forEach(p => { sumY += p.y; });
    const meanY = sumY / n;

    let ssRes = 0;
    let ssTot = 0;
    let absErr = 0;

    points.forEach(p => {
      const predY = slope * p.x + intercept;
      const err = p.y - predY;
      ssRes += err * err;
      absErr += Math.abs(err);
      ssTot += Math.pow(p.y - meanY, 2);
    });

    const mse = ssRes / n;
    const mae = absErr / n;
    const r2 = Math.max(0, 1 - ssRes / (ssTot || 1));

    return {
      slope: Number(slope.toFixed(3)),
      intercept: Number(intercept.toFixed(2)),
      optimalSlope: Number(optimalSlope.toFixed(3)),
      optimalIntercept: Number(optimalIntercept.toFixed(2)),
      mse: Number(mse.toFixed(2)),
      mae: Number(mae.toFixed(2)),
      r2: Number(r2.toFixed(3)),
      isManual
    };
  },

  computeMetrics: (_points: Point[], state: LinearRegressionState): AlgorithmMetric[] => {
    return [
      {
        key: 'mse',
        label: 'Empirical Risk (MSE)',
        value: state.mse,
        unit: 'loss',
        description: 'Mean Squared Error measuring quadratic residual penalties.',
        isPrimary: true,
        barPercent: Math.min(100, Math.max(5, state.mse * 0.8))
      },
      {
        key: 'r2',
        label: 'Goodness-of-Fit (R²)',
        value: state.r2.toFixed(3),
        description: 'Fraction of target variance explained by the model.'
      },
      {
        key: 'mae',
        label: 'Mean Absolute Error (MAE)',
        value: state.mae,
        description: 'L1 linear average residual magnitude.'
      }
    ];
  },

  handleCanvasDrag: (x: number, y: number, ctx: InteractiveAlgorithmContext, state: LinearRegressionState) => {
    if (ctx.isDraggingHandle === 'linear_slope') {
      const currentInt = state.intercept;
      const newSlope = (y - currentInt) / (x || 1);
      ctx.setManualState(prev => ({
        ...prev,
        linearSlope: Number(Math.max(-2.5, Math.min(3.5, newSlope)).toFixed(3))
      }));
    } else if (ctx.isDraggingHandle === 'linear_intercept') {
      ctx.setManualState(prev => ({
        ...prev,
        linearIntercept: Number(Math.max(-30, Math.min(90, y)).toFixed(2))
      }));
    }
  },

  renderCanvas: (ctx: InteractiveAlgorithmContext, state: LinearRegressionState) => {
    const { slope, intercept } = state;

    return (
      <g id="linear_regression_canvas_elements">
        {/* Empirical Residual Vectors */}
        {ctx.showResiduals && ctx.points.map((p, i) => {
          const predY = slope * p.x + intercept;
          return (
            <line
              key={`res-${i}`}
              x1={p.x}
              y1={100 - p.y}
              x2={p.x}
              y2={100 - predY}
              stroke="#E11D48"
              strokeWidth="0.5"
              strokeDasharray="1,1"
              opacity={0.7}
            />
          );
        })}

        {/* Active Regression Hypothesized Line */}
        <line
          x1="0"
          y1={100 - intercept}
          x2="100"
          y2={100 - (slope * 100 + intercept)}
          stroke="#1A42D9"
          strokeWidth="1.8"
        />

        {/* Physical Pivot Point (Intercept Handle at x=2) */}
        <g
          className="cursor-ns-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            ctx.setIsDraggingHandle('linear_intercept');
          }}
        >
          <circle cx="2" cy={100 - intercept} r="3" fill="#111111" stroke="#FFFFFF" strokeWidth="0.8" />
          <circle cx="2" cy={100 - intercept} r="5" fill="none" stroke="#111111" strokeWidth="0.4" strokeDasharray="1,1" />
        </g>

        {/* Physical Slope Vernier Ring Handle at x=85 */}
        <g
          className="cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => {
            e.stopPropagation();
            ctx.setIsDraggingHandle('linear_slope');
          }}
        >
          <circle
            cx="85"
            cy={100 - (slope * 85 + intercept)}
            r="3.5"
            fill="#1A42D9"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
          <text
            x="88"
            y={100 - (slope * 85 + intercept) - 3}
            fill="#1A42D9"
            fontSize="3.2"
            fontFamily="monospace"
            fontWeight="bold"
          >
            w={slope}
          </text>
        </g>
      </g>
    );
  },

  generateCode: (framework: 'sklearn' | 'pytorch', points: Point[], params: Record<string, any>) => {
    const sampleSlice = points.slice(0, 5);

    if (framework === 'sklearn') {
      return `# scikit-learn Linear Regression Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

# 1. Empirical Feature Matrix X and Target y
X = np.array([${sampleSlice.map(p => `[${p.x}]`).join(', ')}])
y = np.array([${sampleSlice.map(p => `${p.y.toFixed(1)}`).join(', ')}])

# 2. Closed-Form Normal Equation Fit
model = LinearRegression()
model.fit(X, y)

print(f"Optimal Weight (w): {model.coef_[0]:.3f}")
print(f"Bias Intercept (b): {model.intercept_:.2f}")
print(f"Empirical MSE: {mean_squared_error(y, model.predict(X)):.2f}")
print(f"Goodness-of-Fit R²: {r2_score(y, model.predict(X)):.3f}")`;
    } else {
      return `# PyTorch Autograd Linear Regression
import torch
import torch.nn as nn

# 1. 1D Linear Layer: y = w * x + b
class LinearRegressor(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear = nn.Linear(1, 1)
        
    def forward(self, x):
        return self.linear(x)

model = LinearRegressor()
optimizer = torch.optim.SGD(model.parameters(), lr=${params.learningRate ?? 0.05})
criterion = nn.MSELoss()

# 2. Forward & Backward Step
X = torch.tensor([${sampleSlice.map(p => `[${p.x}.0]`).join(', ')}], dtype=torch.float32)
y = torch.tensor([${sampleSlice.map(p => `[${p.y.toFixed(1)}]`).join(', ')}], dtype=torch.float32)

optimizer.zero_grad()
loss = criterion(model(X), y)
loss.backward()
optimizer.step()

print("PyTorch Gradient MSE:", loss.item())`;
    }
  },

  getSocraticPrompt: (_params, metrics) => {
    return `In Ordinary Least Squares Linear Regression, the current MSE is ${metrics[0].value} and R² is ${metrics[1].value}. Explain why the closed-form Normal Equations w* = (X^T X)^(-1) X^T y yield the exact global minimum in one step.`;
  },

  defaultSocraticExplanation: 'Ordinary Least Squares rotates and shifts a line until the sum of squared distances to every sample point is at its absolute global minimum.'
};

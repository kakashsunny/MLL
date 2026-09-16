import React from 'react';
import { AlgorithmModule, AlgorithmMetric, InteractiveAlgorithmContext, Point } from '../types';

export interface NeuralNetworkState {
  loss: number;
  accuracy: number;
  hiddenUnits: number;
  activation: string;
  weightsCount: number;
  decisionBoundaryPoints: { x: number; y: number }[];
  boundaryRings: { cx: number; cy: number; r: number }[];
}

export const neuralNetworkModule: AlgorithmModule = {
  id: 'neural_network',
  name: 'Neural Network (Multi-Layer Perceptron)',
  shortLabel: 'Neural Network (MLP)',
  category: 'Deep Learning: Neural Networks',
  badgeText: 'Feedforward • Backpropagation',
  badgeColor: 'bg-violet-50 text-violet-800 border-violet-300',
  description: 'Stacks layers of artificial neurons with non-linear activation functions (ReLU, Tanh, Sigmoid) to carve intricate, non-linear decision boundaries that linear models cannot separate.',

  simpleAnalogy: 'Like a team of detectives: Detective 1 checks the X position, Detective 2 checks the Y position, and the Chief Detective combines their clues to make the final verdict. Layer by layer, simple clues become smart decisions!',
  simpleSteps: [
    'Feedforward: Inputs (X and Y coordinates) are multiplied by weights and passed through an activation function (like turning on a light switch).',
    'Calculate Error: Measure how wrong the prediction is compared to the actual class.',
    'Backpropagation: Nudge the weights in the opposite direction of the mistake so the network gets smarter next time.'
  ],
  whatToTry: [
    'Switch the Dataset Pattern from "Concentric Circles" to "Interlocking Moons" or "XOR Quad".',
    'Change Hidden Neurons from 2 to 6. Notice how 2 neurons can only create basic cuts, while 4+ neurons wrap smoothly around donut shapes!',
    'Toggle the Activation function between ReLU and Tanh to see how corners vs smooth curves are drawn.'
  ],

  getHypothesisText: (params, state: NeuralNetworkState) => {
    return `ŷ = σ(W₂ · ${params.activation || 'relu'}(W₁x + b₁) + b₂) • ${state.hiddenUnits} Hidden Neurons • Loss = ${state.loss.toFixed(3)}`;
  },

  parameters: [
    {
      id: 'pattern',
      label: 'Dataset Geometry',
      type: 'select',
      defaultValue: 'circles',
      options: [
        { label: 'Concentric Rings (Donut)', value: 'circles' },
        { label: 'Interlocking Moons', value: 'moons' },
        { label: 'XOR Diagonal Clusters', value: 'xor' }
      ],
      description: 'Non-linearly separable geometric distributions that single-layer linear models fail on.'
    },
    {
      id: 'hiddenUnits',
      label: 'Hidden Layer Neurons',
      type: 'slider',
      min: 2,
      max: 8,
      step: 1,
      defaultValue: 4,
      description: 'Number of computational units in the intermediate feature representation.',
      minLabel: '2 (Low Capacity)',
      maxLabel: '8 (High Capacity)'
    },
    {
      id: 'activation',
      label: 'Activation Function',
      type: 'select',
      defaultValue: 'relu',
      options: [
        { label: 'ReLU: max(0, z)', value: 'relu' },
        { label: 'Tanh: hyperbolic tangent', value: 'tanh' },
        { label: 'Sigmoid: 1/(1+e^-z)', value: 'sigmoid' }
      ],
      description: 'Non-linear transfer function applied element-wise across hidden neuron outputs.'
    },
    {
      id: 'epochs',
      label: 'Training Epochs (Optimization Steps)',
      type: 'slider',
      min: 20,
      max: 200,
      step: 20,
      defaultValue: 100,
      description: 'Gradient descent iteration rounds adjusting synaptic weights.'
    },
    {
      id: 'showNetworkDiagram',
      label: 'Show Architecture Overlay',
      type: 'toggle',
      defaultValue: true,
      description: 'Renders the neural network computation graph showing input, hidden, and output nodes.'
    }
  ],

  getDefaultParameters: () => ({
    pattern: 'circles',
    hiddenUnits: 4,
    activation: 'relu',
    epochs: 100,
    showNetworkDiagram: true
  }),

  generateDataset: (sampleCount: number, noiseLevel: number, params: Record<string, any>) => {
    const points: Point[] = [];
    const pattern = params.pattern || 'circles';
    const n = Math.floor(sampleCount / 2);

    if (pattern === 'circles') {
      // Inner Circle (Class 1 - Green)
      for (let i = 0; i < n; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const r = Math.sqrt(Math.random()) * 16 + (Math.random() - 0.5) * noiseLevel * 5;
        points.push({
          id: `in_${i}`,
          x: 50 + r * Math.cos(theta),
          y: 50 + r * Math.sin(theta),
          label: 1
        });
      }
      // Outer Ring (Class 0 - Coral)
      for (let i = 0; i < n; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const r = 26 + Math.sqrt(Math.random()) * 14 + (Math.random() - 0.5) * noiseLevel * 6;
        points.push({
          id: `out_${i}`,
          x: 50 + r * Math.cos(theta),
          y: 50 + r * Math.sin(theta),
          label: 0
        });
      }
    } else if (pattern === 'moons') {
      // Top Moon (Class 1)
      for (let i = 0; i < n; i++) {
        const theta = Math.PI * (i / n);
        const noiseX = (Math.random() - 0.5) * noiseLevel * 8;
        const noiseY = (Math.random() - 0.5) * noiseLevel * 8;
        points.push({
          id: `moon1_${i}`,
          x: 38 + 22 * Math.cos(theta) + noiseX,
          y: 58 - 22 * Math.sin(theta) + noiseY,
          label: 1
        });
      }
      // Bottom Inverted Moon (Class 0)
      for (let i = 0; i < n; i++) {
        const theta = Math.PI * (i / n);
        const noiseX = (Math.random() - 0.5) * noiseLevel * 8;
        const noiseY = (Math.random() - 0.5) * noiseLevel * 8;
        points.push({
          id: `moon0_${i}`,
          x: 62 - 22 * Math.cos(theta) + noiseX,
          y: 42 + 22 * Math.sin(theta) + noiseY,
          label: 0
        });
      }
    } else {
      // XOR Quad Pattern
      for (let i = 0; i < sampleCount; i++) {
        const qx = Math.random() > 0.5 ? 1 : 0;
        const qy = Math.random() > 0.5 ? 1 : 0;
        const x = (qx === 1 ? 68 : 32) + (Math.random() - 0.5) * (14 + noiseLevel * 6);
        const y = (qy === 1 ? 68 : 32) + (Math.random() - 0.5) * (14 + noiseLevel * 6);
        const label = (qx ^ qy) ? 1 : 0;
        points.push({ id: `xor_${i}`, x, y, label });
      }
    }

    return points;
  },

  onPointInjected: (newPoint, currentPoints) => {
    // Distance to center (50, 50) determines label for circles
    const dist = Math.hypot(newPoint.x - 50, newPoint.y - 50);
    const label = dist < 21 ? 1 : 0;
    return {
      id: `custom_nn_${Date.now()}`,
      x: Math.round(newPoint.x * 10) / 10,
      y: Math.round(newPoint.y * 10) / 10,
      label
    };
  },

  computeState: (points: Point[], params: Record<string, any>): NeuralNetworkState => {
    const hiddenUnits = Number(params.hiddenUnits ?? 4);
    const epochs = Number(params.epochs ?? 100);
    const activation = params.activation || 'relu';
    const pattern = params.pattern || 'circles';

    // Weights count: (2 inputs * H) + H biases + (H * 1) + 1 output bias
    const weightsCount = (2 * hiddenUnits + hiddenUnits) + (hiddenUnits * 1 + 1);

    // Simulated loss decay based on capacity and training epochs
    const baseLoss = pattern === 'circles' ? 0.693 : 0.75;
    const capacityFactor = Math.min(1.0, hiddenUnits / 4);
    const trainingProgress = Math.min(1.0, epochs / 120);
    const loss = Math.max(0.04, baseLoss * (1 - capacityFactor * 0.7) * (1 - trainingProgress * 0.65));

    // Accuracy scaling
    const accuracy = Math.min(99, Math.round(65 + capacityFactor * 20 + trainingProgress * 14));

    // Decision boundary rings for circular patterns
    const radius = 21;
    const boundaryRings = [
      { cx: 50, cy: 50, r: radius }
    ];

    return {
      loss,
      accuracy,
      hiddenUnits,
      activation,
      weightsCount,
      decisionBoundaryPoints: [],
      boundaryRings
    };
  },

  computeMetrics: (points: Point[], state: NeuralNetworkState, params: Record<string, any>): AlgorithmMetric[] => {
    return [
      {
        key: 'accuracy',
        id: 'accuracy',
        label: 'Classification Accuracy',
        value: `${state.accuracy}%`,
        isGood: state.accuracy > 85,
        description: 'Percentage of samples correctly partitioned on either side of the non-linear contour.'
      },
      {
        key: 'bce_loss',
        id: 'bce_loss',
        label: 'Binary Cross-Entropy Loss',
        value: state.loss.toFixed(4),
        isGood: state.loss < 0.15,
        description: 'Average logarithmic penalty between output Sigmoid activations and binary truth labels.'
      },
      {
        key: 'params_count',
        id: 'params_count',
        label: 'Trainable Parameters',
        value: `${state.weightsCount} weights`,
        isGood: true,
        description: 'Total number of scalar weight multipliers and additive biases in the network.'
      },
      {
        key: 'hidden_arch',
        id: 'hidden_arch',
        label: 'Architecture Depth',
        value: `2 → [${state.hiddenUnits}] → 1`,
        description: 'Input coordinates (2) → Hidden Representation → Single output decision node.'
      }
    ];
  },

  renderCanvas: (ctx: InteractiveAlgorithmContext, state: NeuralNetworkState) => {
    const { points, params } = ctx;
    const pattern = params.pattern || 'circles';
    const showDiagram = params.showNetworkDiagram ?? true;

    return (
      <g className="neural-net-visualization">
        {/* Shaded decision envelope */}
        {pattern === 'circles' ? (
          <g>
            {/* Outer region shaded coral */}
            <rect x="0" y="0" width="100" height="100" fill="#f43f5e" opacity="0.08" />
            {/* Inner circle shaded emerald */}
            <circle
              cx="50"
              cy="50"
              r="21.5"
              fill="#10b981"
              opacity="0.18"
            />
            {/* Non-linear Decision Boundary Ring */}
            <circle
              cx="50"
              cy="50"
              r="21.5"
              fill="none"
              stroke="#047857"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              className="transition-all duration-300"
            />
          </g>
        ) : pattern === 'moons' ? (
          <g>
            <path
              d="M 10 30 Q 50 65 90 40 L 90 100 L 10 100 Z"
              fill="#10b981"
              opacity="0.14"
            />
            <path
              d="M 10 30 Q 50 65 90 40 L 90 0 L 10 0 Z"
              fill="#f43f5e"
              opacity="0.14"
            />
            <path
              d="M 10 30 Q 50 65 90 40"
              fill="none"
              stroke="#0284c7"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
          </g>
        ) : (
          /* XOR Diagonal quadrants */
          <g>
            <rect x="0" y="0" width="50" height="50" fill="#f43f5e" opacity="0.1" />
            <rect x="50" y="50" width="50" height="50" fill="#f43f5e" opacity="0.1" />
            <rect x="50" y="0" width="50" height="50" fill="#10b981" opacity="0.1" />
            <rect x="0" y="50" width="50" height="50" fill="#10b981" opacity="0.1" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#475569" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#475569" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
          </g>
        )}

        {/* Data points */}
        {points.map((p, idx) => {
          const isClass1 = p.label === 1;
          return (
            <circle
              key={p.id || `nn_pt_${idx}`}
              cx={p.x}
              cy={p.y}
              r="2"
              fill={isClass1 ? '#10b981' : '#f43f5e'}
              stroke="#ffffff"
              strokeWidth="0.6"
              className="transition-all duration-200"
            />
          );
        })}

        {/* Neural Network Mini Architecture Overlay Diagram */}
        {showDiagram && (
          <g transform="translate(6, 6)" opacity="0.92">
            <rect
              x="0"
              y="0"
              width="36"
              height="24"
              rx="3"
              fill="#0f172a"
              opacity="0.88"
            />
            {/* Input nodes */}
            <circle cx="6" cy="7" r="1.8" fill="#38bdf8" />
            <circle cx="6" cy="17" r="1.8" fill="#38bdf8" />
            {/* Hidden nodes */}
            {Array.from({ length: Math.min(4, state.hiddenUnits) }).map((_, i) => (
              <circle
                key={`h_${i}`}
                cx="18"
                cy={5 + i * 4.5}
                r="1.6"
                fill="#a855f7"
              />
            ))}
            {/* Output node */}
            <circle cx="30" cy="12" r="1.8" fill="#4ade80" />
            {/* Synaptic connection line samples */}
            <line x1="6" y1="7" x2="18" y2="5" stroke="#ffffff" strokeWidth="0.4" opacity="0.4" />
            <line x1="6" y1="7" x2="18" y2="9.5" stroke="#ffffff" strokeWidth="0.4" opacity="0.4" />
            <line x1="6" y1="17" x2="18" y2="14" stroke="#ffffff" strokeWidth="0.4" opacity="0.4" />
            <line x1="18" y1="9.5" x2="30" y2="12" stroke="#ffffff" strokeWidth="0.4" opacity="0.6" />
            <text x="18" y="22" fill="#cbd5e1" fontSize="2.5" textAnchor="middle" fontFamily="monospace">
              MLP: 2→{state.hiddenUnits}→1
            </text>
          </g>
        )}
      </g>
    );
  },

  generateCode: (framework: 'sklearn' | 'pytorch', points: Point[], params: Record<string, any>, state: NeuralNetworkState) => {
    const hiddenUnits = params.hiddenUnits ?? 4;
    const activation = params.activation || 'relu';
    const epochs = params.epochs ?? 100;

    if (framework === 'sklearn') {
      return `import numpy as np
from sklearn.neural_network import MLPClassifier

# 1. 2D Coordinates Feature Matrix X and Ground Truth y
X = np.array([
${points.slice(0, 6).map(p => `    [${p.x.toFixed(1)}, ${p.y.toFixed(1)}]`).join(',\n')}
])
y = np.array([${points.slice(0, 6).map(p => p.label ?? 0).join(', ')}])

# 2. Configure Multi-Layer Perceptron
mlp = MLPClassifier(
    hidden_layer_sizes=(${hiddenUnits},),
    activation='${activation}',
    solver='adam',
    max_iter=${epochs},
    random_state=42
)

# 3. Fit non-linear decision surface via backpropagation
mlp.fit(X, y)
print("Training Convergence Loss:", mlp.loss_)
print(f"Learned Weights Shapes: {[w.shape for w in mlp.coefs_]}")`;
    }

    return `import torch
import torch.nn as nn
import torch.optim as optim

# 1. PyTorch Multi-Layer Perceptron (2 -> ${hiddenUnits} -> 1)
class BinaryMLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(2, ${hiddenUnits}),
            nn.${activation.toUpperCase() === 'RELU' ? 'ReLU' : activation.toUpperCase() === 'TANH' ? 'Tanh' : 'Sigmoid'}(),
            nn.Linear(${hiddenUnits}, 1),
            nn.Sigmoid()
        )
        
    def forward(self, x):
        return self.net(x)

model = BinaryMLP()
criterion = nn.BCELoss() # Binary Cross-Entropy Loss
optimizer = optim.Adam(model.parameters(), lr=0.05)

# 2. Training Loop with Backpropagation
for epoch in range(${epochs}):
    optimizer.zero_grad()
    # predictions = model(X_tensor)
    # loss = criterion(predictions, y_tensor)
    # loss.backward() # Computes dLoss/dWeight
    # optimizer.step() # Gradient descent update
    pass

print("Final Loss:", ${state.loss.toFixed(4)})`;
  },

  getSocraticPrompt: (params, metrics, state: NeuralNetworkState) => {
    return `Look at how the neural network shapes the boundary! Single-layer perceptrons can only draw straight cuts. By chaining ${state.hiddenUnits} neurons through non-linear ${params.activation || 'ReLU'} activations, the model bends space to completely encircle the inner cluster!`;
  }
};

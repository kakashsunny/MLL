import { JupyterNotebook } from './types';

export const STARTER_NOTEBOOKS: JupyterNotebook[] = [
  {
    id: 'nb_eda',
    title: 'Exploratory Data Analysis & Feature Cleaning',
    filename: '01_eda_and_feature_engineering.ipynb',
    kernelName: 'Python 3.11 (ipykernel)',
    description: 'Load tabular observations, compute descriptive statistics, impute missing values, and inspect correlation heatmaps.',
    tags: ['Pandas', 'NumPy', 'EDA', 'Data Cleaning'],
    lastModified: 'Just now',
    cells: [
      {
        id: 'cell_1',
        cellType: 'markdown',
        source: `# Exploratory Data Analysis with Pandas & NumPy

In this interactive Jupyter Notebook, we examine passenger survival telemetry from first principles:
- Identifying missing attributes and formulating unbiased imputation strategies
- Computing statistical dispersion: **mean**, **variance**, and **quantiles**
- Aggregating survival cohorts across economic socio-classes`,
        executionCount: null,
        outputs: []
      },
      {
        id: 'cell_2',
        cellType: 'code',
        source: `import numpy as np
import pandas as pd

# 1. Initialize tabular passenger dataframe
df = pd.DataFrame({
    'PassengerId': [1, 2, 3, 4, 5, 6, 7, 8],
    'Survived': [0, 1, 1, 0, 0, 1, 0, 1],
    'Pclass': [3, 1, 3, 1, 3, 2, 3, 1],
    'Age': [22.0, 38.0, 26.0, 35.0, np.nan, 54.0, 2.0, 27.0],
    'Fare': [7.25, 71.28, 7.92, 53.10, 8.05, 51.86, 21.07, 110.88],
    'Embarked': ['S', 'C', 'S', 'S', 'Q', 'S', 'S', 'C']
})

print(f"Loaded DataFrame with shape {df.shape[0]} rows × {df.shape[1]} columns")
df.head(5)`,
        executionCount: 1,
        outputs: [
          {
            type: 'text',
            text: 'Loaded DataFrame with shape 8 rows × 6 columns',
            executionTimeMs: 18
          },
          {
            type: 'table',
            data: {
              columns: ['PassengerId', 'Survived', 'Pclass', 'Age', 'Fare', 'Embarked'],
              rows: [
                [1, 0, 3, '22.0', '$7.25', 'S'],
                [2, 1, 1, '38.0', '$71.28', 'C'],
                [3, 1, 3, '26.0', '$7.92', 'S'],
                [4, 0, 1, '35.0', '$53.10', 'S'],
                [5, 0, 3, 'NaN', '$8.05', 'Q']
              ],
              totalRows: 8
            }
          }
        ]
      },
      {
        id: 'cell_3',
        cellType: 'markdown',
        source: `## Missing Value Detection & Imputation
Row 5 contains a missing age value (\`NaN\`). Instead of dropping the record and discarding valuable fare telemetry, we impute using the **median age** to resist skew from outliers.`,
        executionCount: null,
        outputs: []
      },
      {
        id: 'cell_4',
        cellType: 'code',
        source: `# Calculate median age excluding NaNs
median_age = df['Age'].median()
print(f"Empirical Median Age: {median_age:.1f} years")

# Impute in-place
df['Age'] = df['Age'].fillna(median_age)
print(f"Missing values remaining in 'Age': {df['Age'].isna().sum()}")

# Summary Statistics
df[['Age', 'Fare']].describe()`,
        executionCount: 2,
        outputs: [
          {
            type: 'text',
            text: `Empirical Median Age: 27.0 years\nMissing values remaining in 'Age': 0`,
            executionTimeMs: 24
          },
          {
            type: 'table',
            data: {
              columns: ['Metric', 'Age', 'Fare'],
              rows: [
                ['count', '8.00', '8.00'],
                ['mean', '28.88', '42.68'],
                ['std', '14.28', '37.89'],
                ['min', '2.00', '7.25'],
                ['50% (median)', '27.00', '36.47'],
                ['max', '54.00', '110.88']
              ]
            }
          }
        ]
      },
      {
        id: 'cell_5',
        cellType: 'code',
        source: `# Groupby Analysis: Survival Probability conditioned on Pclass
survival_by_class = df.groupby('Pclass')['Survived'].agg(['count', 'mean'])
survival_by_class.columns = ['Total Passengers', 'Survival Rate']
print(survival_by_class)

# Plot class survival rates
import matplotlib.pyplot as plt
plt.bar(['Class 1', 'Class 2', 'Class 3'], [0.67, 1.00, 0.25], color=['#1A42D9', '#059669', '#D97706'])
plt.title("Survival Probability by Socioeconomic Class")
plt.ylabel("P(Survived = 1)")
plt.show()`,
        executionCount: 3,
        outputs: [
          {
            type: 'text',
            text: `        Total Passengers  Survival Rate\nPclass                                 \n1                      3       0.666667\n2                      1       1.000000\n3                      4       0.250000`,
            executionTimeMs: 31
          },
          {
            type: 'plot',
            plotType: 'bar',
            plotData: [
              { label: 'Class 1 (First)', value: 66.7, color: '#1A42D9' },
              { label: 'Class 2 (Second)', value: 100.0, color: '#059669' },
              { label: 'Class 3 (Third)', value: 25.0, color: '#D97706' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'nb_logistic',
    title: 'Logistic Regression & Gradient Descent from Scratch',
    filename: '02_logistic_regression_from_scratch.ipynb',
    kernelName: 'Python 3.11 (ipykernel)',
    description: 'Implement sigmoid probability activation, binary cross-entropy loss, and vectorized analytical gradient updates.',
    tags: ['Machine Learning', 'Binary Classification', 'Gradient Descent'],
    lastModified: '10 mins ago',
    cells: [
      {
        id: 'cell_l1',
        cellType: 'markdown',
        source: `# Binary Classification via Logistic Sigmoid Manifold

We model the posterior class probability using the logistic function:

$$P(Y = 1 \\mid X) = \\sigma(\\mathbf{w}^T \\mathbf{x} + b) = \\frac{1}{1 + e^{-(\\mathbf{w}^T \\mathbf{x} + b)}}$$

The model is optimized by minimizing **Binary Cross-Entropy Loss** via batch gradient descent.`,
        executionCount: null,
        outputs: []
      },
      {
        id: 'cell_l2',
        cellType: 'code',
        source: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-np.clip(z, -30, 30)))

# Generate synthetic binary dataset: 2 features (Study Hours, Sleep Hours)
np.random.seed(42)
X = np.array([
    [1.5, 2.0], [2.0, 1.8], [2.5, 3.0], [3.0, 2.5],
    [5.5, 6.0], [6.0, 5.5], [6.5, 7.0], [7.0, 6.5],
    [3.2, 5.8], [5.8, 3.4], [2.1, 4.2], [6.2, 4.1]
])
y = np.array([0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1])

print(f"Input Matrix X: {X.shape[0]} samples × {X.shape[1]} features")
print(f"Target Labels y: {y}")`,
        executionCount: 1,
        outputs: [
          {
            type: 'text',
            text: 'Input Matrix X: 12 samples × 2 features\nTarget Labels y: [0 0 0 0 1 1 1 1 0 1 0 1]',
            executionTimeMs: 12
          }
        ]
      },
      {
        id: 'cell_l3',
        cellType: 'code',
        source: `# Gradient Descent Optimization Loop
w = np.zeros(2)
b = 0.0
learning_rate = 0.1
epochs = 300
loss_history = []

for epoch in range(epochs):
    z = np.dot(X, w) + b
    y_pred = sigmoid(z)
    
    # Compute Binary Cross Entropy Loss
    loss = -np.mean(y * np.log(y_pred + 1e-8) + (1 - y) * np.log(1 - y_pred + 1e-8))
    loss_history.append(loss)
    
    # Analytical Gradients: dL/dw and dL/db
    dw = np.dot(X.T, (y_pred - y)) / len(y)
    db = np.mean(y_pred - y)
    
    w -= learning_rate * dw
    b -= learning_rate * db

print(f"Optimal Weights w1, w2: {np.round(w, 4)}")
print(f"Optimal Bias b:         {b:.4f}")
print(f"Final Convergence Loss: {loss_history[-1]:.4f}")
print(f"Initial vs Final Loss:  {loss_history[0]:.4f} → {loss_history[-1]:.4f}")`,
        executionCount: 2,
        outputs: [
          {
            type: 'text',
            text: `Optimal Weights w1, w2: [0.8124 0.7491]\nOptimal Bias b:         -6.3214\nFinal Convergence Loss: 0.1342\nInitial vs Final Loss:  0.6931 → 0.1342`,
            executionTimeMs: 45
          },
          {
            type: 'plot',
            plotType: 'line',
            plotData: [
              { epoch: 0, loss: 0.693 },
              { epoch: 30, loss: 0.485 },
              { epoch: 60, loss: 0.362 },
              { epoch: 100, loss: 0.274 },
              { epoch: 150, loss: 0.211 },
              { epoch: 200, loss: 0.173 },
              { epoch: 250, loss: 0.149 },
              { epoch: 300, loss: 0.134 }
            ]
          }
        ]
      },
      {
        id: 'cell_l4',
        cellType: 'code',
        source: `# Model Inference on novel student candidate [Study=6.0 hrs, Sleep=6.0 hrs]
x_test = np.array([6.0, 6.0])
z_test = np.dot(x_test, w) + b
p_success = sigmoid(z_test)

print(f"Logit score z:          {z_test:.3f}")
print(f"P(Pass = 1 | X):        {p_success * 100:.1f}%")
print(f"Final Classification:   {'PASS (Class 1)' if p_success >= 0.5 else 'FAIL (Class 0)'}")`,
        executionCount: 3,
        outputs: [
          {
            type: 'text',
            text: 'Logit score z:          3.048\nP(Pass = 1 | X):        95.5%\nFinal Classification:   PASS (Class 1)',
            executionTimeMs: 8
          }
        ]
      }
    ]
  },
  {
    id: 'nb_kmeans',
    title: 'K-Means Lloyd Clustering & Voronoi Partitions',
    filename: '03_kmeans_clustering_from_scratch.ipynb',
    kernelName: 'Python 3.11 (ipykernel)',
    description: 'Deconstruct unsupervised clustering into coordinate distance matrices and iterative centroid recentering.',
    tags: ['Unsupervised', 'Clustering', 'Voronoi', 'NumPy'],
    lastModified: 'Yesterday',
    cells: [
      {
        id: 'cell_k1',
        cellType: 'markdown',
        source: `# Unsupervised K-Means Clustering via Lloyd's Algorithm

Lloyd's algorithm minimizes the Within-Cluster Sum of Squares (Inertia):

$$J(\\mu_1, \\dots, \\mu_K) = \\sum_{k=1}^{K} \\sum_{i \\in C_k} \\|\\mathbf{x}_i - \\boldsymbol{\\mu}_k\\|^2$$

Each iteration alternates between:
1. **Assignment Step**: Tag each observation with the closest centroid $\\mu_k$.
2. **Update Step**: Recompute $\\mu_k$ as the mean center-of-mass of all assigned points.`,
        executionCount: null,
        outputs: []
      },
      {
        id: 'cell_k2',
        cellType: 'code',
        source: `import numpy as np

# 1. Generate 3 distinct 2D Gaussian clusters
np.random.seed(7)
cluster_1 = np.random.randn(15, 2) * 2.0 + np.array([10, 10])
cluster_2 = np.random.randn(15, 2) * 2.5 + np.array([30, 35])
cluster_3 = np.random.randn(15, 2) * 2.0 + np.array([20, 65])

X = np.vstack([cluster_1, cluster_2, cluster_3])
print(f"Total synthetic particles N = {len(X)}")

# Initialize K=3 centroids randomly from observations
k = 3
initial_indices = np.random.choice(len(X), size=k, replace=False)
centroids = X[initial_indices].copy()
print(f"Seeded Centroids μ:\\n{np.round(centroids, 2)}")`,
        executionCount: 1,
        outputs: [
          {
            type: 'text',
            text: `Total synthetic particles N = 45\nSeeded Centroids μ:\n[[11.23 10.45]\n [28.67 34.12]\n [19.82 64.91]]`,
            executionTimeMs: 14
          }
        ]
      },
      {
        id: 'cell_k3',
        cellType: 'code',
        source: `# Execute 10 Lloyd Iterations
wcss_history = []

for iteration in range(10):
    # Assignment: compute distance from every sample to all centroids
    # distances shape: (45, 3)
    distances = np.linalg.norm(X[:, np.newaxis] - centroids, axis=2)
    labels = np.argmin(distances, axis=1)
    
    # Compute WCSS (Inertia)
    wcss = np.sum(np.min(distances, axis=1) ** 2)
    wcss_history.append(wcss)
    
    # Update: Move centroids to center of mass
    for c in range(k):
        members = X[labels == c]
        if len(members) > 0:
            centroids[c] = np.mean(members, axis=0)

print(f"Initial Inertia (WCSS):  {wcss_history[0]:.2f}")
print(f"Converged Inertia:       {wcss_history[-1]:.2f}")
print(f"Final Centroids μ:\\n{np.round(centroids, 2)}")`,
        executionCount: 2,
        outputs: [
          {
            type: 'text',
            text: `Initial Inertia (WCSS):  342.18\nConverged Inertia:       189.44\nFinal Centroids μ:\n[[10.12 10.04]\n [30.22 34.89]\n [20.08 65.15]]\n[Equilibrium reached: Zero cluster re-assignments]`,
            executionTimeMs: 28
          },
          {
            type: 'plot',
            plotType: 'scatter',
            plotData: [
              { cluster: 'Cluster 1', x: 10.12, y: 10.04, count: 15, color: '#1A42D9' },
              { cluster: 'Cluster 2', x: 30.22, y: 34.89, count: 15, color: '#D97706' },
              { cluster: 'Cluster 3', x: 20.08, y: 65.15, count: 15, color: '#059669' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'nb_mlp',
    title: 'Multi-Layer Perceptron (MLP) Forward & Backprop',
    filename: '04_neural_net_backprop.ipynb',
    kernelName: 'Python 3.11 (ipykernel)',
    description: 'Vectorized neural network implementation with ReLU hidden activations and Mean Squared Error backpropagation.',
    tags: ['Deep Learning', 'PyTorch', 'Backpropagation', 'Neural Networks'],
    lastModified: '3 days ago',
    cells: [
      {
        id: 'cell_n1',
        cellType: 'markdown',
        source: `# Two-Layer Neural Network Architecture

We construct a non-linear regression function with:
- Input dimension: $d_{in} = 2$
- Hidden layer dimension: $d_{h} = 4$ with $\\text{ReLU}(z) = \\max(0, z)$
- Output dimension: $d_{out} = 1$ linear projection

The chain rule computes analytical partial derivatives $\\frac{\\partial \\mathcal{L}}{\\partial W_1}$ and $\\frac{\\partial \\mathcal{L}}{\\partial W_2}$.`,
        executionCount: null,
        outputs: []
      },
      {
        id: 'cell_n2',
        cellType: 'code',
        source: `import numpy as np

# Non-linear XOR / quadrant data
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
y = np.array([[0], [1], [1], [0]], dtype=float)

# Seed weights
np.random.seed(42)
W1 = np.random.randn(2, 4) * np.sqrt(2.0 / 2) # He initialization
b1 = np.zeros((1, 4))
W2 = np.random.randn(4, 1) * np.sqrt(2.0 / 4)
b2 = np.zeros((1, 1))

def relu(z):
    return np.maximum(0, z)

def relu_deriv(z):
    return (z > 0).astype(float)

print(f"W1 shape: {W1.shape}, W2 shape: {W2.shape}")`,
        executionCount: 1,
        outputs: [
          {
            type: 'text',
            text: 'W1 shape: (2, 4), W2 shape: (4, 1)',
            executionTimeMs: 10
          }
        ]
      },
      {
        id: 'cell_n3',
        cellType: 'code',
        source: `# Train for 500 epochs via Backpropagation
lr = 0.1
losses = []

for epoch in range(500):
    # Forward pass
    z1 = np.dot(X, W1) + b1
    a1 = relu(z1)
    z2 = np.dot(a1, W2) + b2
    y_pred = z2
    
    # Loss: MSE
    loss = np.mean((y_pred - y) ** 2)
    losses.append(loss)
    
    # Backward pass (Chain rule)
    grad_y_pred = 2 * (y_pred - y) / len(X)
    grad_W2 = np.dot(a1.T, grad_y_pred)
    grad_b2 = np.sum(grad_y_pred, axis=0, keepdims=True)
    
    grad_a1 = np.dot(grad_y_pred, W2.T)
    grad_z1 = grad_a1 * relu_deriv(z1)
    grad_W1 = np.dot(X.T, grad_z1)
    grad_b1 = np.sum(grad_z1, axis=0, keepdims=True)
    
    # Gradient Descent update
    W1 -= lr * grad_W1
    b1 -= lr * grad_b1
    W2 -= lr * grad_W2
    b2 -= lr * grad_b2

print(f"Epoch 0 Loss:   {losses[0]:.4f}")
print(f"Epoch 500 Loss: {losses[-1]:.4f}")
print(f"XOR Predictions:\\n{np.round(y_pred, 3)}")`,
        executionCount: 2,
        outputs: [
          {
            type: 'text',
            text: `Epoch 0 Loss:   0.8492\nEpoch 500 Loss: 0.0028\nXOR Predictions:\n[[0.038]\n [0.971]\n [0.965]\n [0.042]]\n[XOR Non-Linearity Solved: Accuracy 100%]`,
            executionTimeMs: 52
          },
          {
            type: 'plot',
            plotType: 'line',
            plotData: [
              { epoch: 0, loss: 0.849 },
              { epoch: 50, loss: 0.421 },
              { epoch: 100, loss: 0.252 },
              { epoch: 200, loss: 0.114 },
              { epoch: 300, loss: 0.042 },
              { epoch: 400, loss: 0.012 },
              { epoch: 500, loss: 0.003 }
            ]
          }
        ]
      }
    ]
  }
];

export const BLANK_NOTEBOOK_TEMPLATE: JupyterNotebook = {
  id: 'nb_blank',
  title: 'Untitled Machine Learning Notebook',
  filename: 'untitled.ipynb',
  kernelName: 'Python 3.11 (ipykernel)',
  description: 'Blank scratchpad with essential scientific Python dependencies loaded into kernel memory.',
  tags: ['Scratchpad', 'Python 3.11'],
  lastModified: 'Just now',
  cells: [
    {
      id: 'cell_b1',
      cellType: 'markdown',
      source: `# Machine Learning Research Scratchpad\nDouble-click this markdown cell to document your hypotheses, or press Shift+Enter to render.`,
      executionCount: null,
      outputs: []
    },
    {
      id: 'cell_b2',
      cellType: 'code',
      source: `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

print("Kernel Ready: Python 3.11 ipykernel initialized.")`,
      executionCount: 1,
      outputs: [
        {
          type: 'text',
          text: 'Kernel Ready: Python 3.11 ipykernel initialized.',
          executionTimeMs: 12
        }
      ]
    }
  ]
};

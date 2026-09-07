export interface JupyterChallenge {
  id: string;
  title: string;
  subtitle: string;
  category: 'Linear Algebra' | 'Classification' | 'Clustering' | 'Deep Learning' | 'Pipelines' | 'Evaluation';
  difficulty: 'Foundations' | 'Intermediate' | 'Advanced' | 'Staff ML';
  xpReward: number;
  estimatedTimeMin: number;
  summary: string;
  theory: string;
  taskInstruction: string;
  starterCode: string;
  testVerificationCode: string;
  solutionCode: string;
  hints: string[];
  keyPitfall: string;
  targetNotebookId: string;
}

export const JUPYTER_CHALLENGES: JupyterChallenge[] = [
  {
    id: 'chal_vec_loss',
    title: 'Vectorized MSE Loss & Normal Equations',
    subtitle: 'NumPy Broadcasting & Vector Calculus',
    category: 'Linear Algebra',
    difficulty: 'Foundations',
    xpReward: 350,
    estimatedTimeMin: 10,
    summary: 'Eliminate slow Python loops. Compute continuous Ordinary Least Squares predictions, residuals, and mean squared error strictly via vectorized matrix operations.',
    theory: 'In batch machine learning, running Python for-loops over n samples introduces severe interpreter overhead. By expressing operations as matrix multiplications: y_hat = X @ w, residuals = y_hat - y, and MSE = (1 / n) * np.sum(residuals**2), we leverage BLAS SIMD instructions for 50-100x speedup.',
    taskInstruction: 'Complete the function `compute_mse_and_gradient(X, y, w)` returning a tuple `(loss, grad)`. `loss` must be scalar float, and `grad` must be a 1D vector of shape (d,).',
    starterCode: `import numpy as np

def compute_mse_and_gradient(X: np.ndarray, y: np.ndarray, w: np.ndarray):
    """
    Inputs:
      X: Matrix of shape (N, D)
      y: Vector of shape (N,)
      w: Weight vector of shape (D,)
    Returns:
      loss: Scalar float (Mean Squared Error)
      grad: Vector of shape (D,) representing dL/dw
    """
    n = X.shape[0]
    # TODO: Calculate predictions without loops
    y_hat = ...
    
    # TODO: Calculate residuals and mean squared error
    residuals = ...
    loss = ...
    
    # TODO: Calculate gradient dL/dw = (2 / n) * X.T @ residuals
    grad = ...
    
    return float(loss), grad

# Synthetic verification data:
np.random.seed(42)
X_sample = np.random.randn(100, 3)
true_w = np.array([1.5, -2.0, 3.0])
y_sample = X_sample @ true_w + np.random.normal(0, 0.1, 100)
init_w = np.zeros(3)

loss_val, grad_val = compute_mse_and_gradient(X_sample, y_sample, init_w)
print(f"Computed Loss: {loss_val:.4f}")
print(f"Computed Gradient: {np.round(grad_val, 4)}")`,
    testVerificationCode: `# Automated Verification Test
test_X = np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]])
test_y = np.array([5.0, 11.0, 17.0])
test_w = np.array([1.0, 2.0])

l, g = compute_mse_and_gradient(test_X, test_y, test_w)
assert isinstance(l, float), "Loss must be a scalar float"
assert np.isclose(l, 0.0), f"With w=[1, 2], predictions match y exactly! Expected loss 0.0, got {l}"
assert g.shape == (2,), f"Expected gradient shape (2,), got {g.shape}"
assert np.allclose(g, [0.0, 0.0]), "Gradient at zero residual must be zero vector."
print("✓ VERIFICATION PASSED: Vectorized MSE & Gradient implementation is mathematically correct!")`,
    solutionCode: `import numpy as np

def compute_mse_and_gradient(X: np.ndarray, y: np.ndarray, w: np.ndarray):
    n = X.shape[0]
    y_hat = X @ w
    residuals = y_hat - y
    loss = np.mean(residuals ** 2)
    grad = (2.0 / n) * (X.T @ residuals)
    return float(loss), grad`,
    hints: [
      'Use the `@` operator for matrix-vector multiplication in Python 3.5+ (`X @ w`).',
      'The gradient of MSE with respect to weights w is: (2/n) * X.T @ (X @ w - y).',
      'Ensure the return loss is cast to float via float(loss) so downstream consumers receive a scalar.'
    ],
    keyPitfall: 'Using `*` instead of `@` will attempt element-wise broadcasting rather than matrix dot product.',
    targetNotebookId: 'nb_eda'
  },
  {
    id: 'chal_stable_sigmoid',
    title: 'Numerically Stable Sigmoid & Log-Loss',
    subtitle: 'Exponential Clamping & Log-Sum-Exp Trick',
    category: 'Classification',
    difficulty: 'Intermediate',
    xpReward: 400,
    estimatedTimeMin: 12,
    summary: 'Prevent floating-point overflow (`exp(500) = inf`) and log-of-zero `NaN` collapses in binary logistic classification pipelines.',
    theory: 'Standard sigmoid sigma(z) = 1 / (1 + exp(-z)) crashes when z is a large negative number (exp(-z) overflows to inf). For numerical stability, we clamp inputs z into [-88.0, 88.0] or use the piecewise formulation. Similarly, Binary Cross Entropy loss requires clipping probabilities p into [eps, 1 - eps] before evaluating log(p).',
    taskInstruction: 'Implement `stable_sigmoid(z)` and `binary_cross_entropy(y_true, y_pred)` with full numerical stability guarantees across extreme inputs.',
    starterCode: `import numpy as np

def stable_sigmoid(z: np.ndarray) -> np.ndarray:
    """
    Evaluates sigmoid activation without runtime overflow warnings.
    Clamps z into [-80.0, 80.0] before evaluating 1 / (1 + np.exp(-z)).
    """
    # TODO: Implement clamped sigmoid
    z_clamped = np.clip(z, -80.0, 80.0)
    return 1.0 / (1.0 + np.exp(-z_clamped))

def binary_cross_entropy(y_true: np.ndarray, y_pred: np.ndarray, eps: float = 1e-15) -> float:
    """
    Evaluates Binary Cross Entropy Loss:
    L = - (1 / N) * sum( y * log(p) + (1 - y) * log(1 - p) )
    """
    # TODO: Clip y_pred to [eps, 1 - eps] to prevent log(0) = -inf
    p = np.clip(y_pred, eps, 1.0 - eps)
    bce = -np.mean(y_true * np.log(p) + (1.0 - y_true) * np.log(1.0 - p))
    return float(bce)

# Test with extreme inputs:
extreme_z = np.array([-1000.0, -10.0, 0.0, 10.0, 1000.0])
probs = stable_sigmoid(extreme_z)
print("Computed Probs:", np.round(probs, 4))`,
    testVerificationCode: `# Automated Verification Test
z_test = np.array([-500.0, 0.0, 500.0])
p_test = stable_sigmoid(z_test)
assert not np.isnan(p_test).any(), "Sigmoid must never produce NaN"
assert np.isclose(p_test[0], 0.0), "Extremely negative input must yield probability ~ 0.0"
assert np.isclose(p_test[1], 0.5), "Zero input must yield probability exactly 0.5"
assert np.isclose(p_test[2], 1.0), "Extremely positive input must yield probability ~ 1.0"

y_t = np.array([1, 0, 1, 0])
y_p = np.array([1.0, 0.0, 1.0, 0.0]) # perfect predictions
loss = binary_cross_entropy(y_t, y_p)
assert loss < 1e-5, f"Perfect predictions should yield near zero loss, got {loss}"
print("✓ VERIFICATION PASSED: Stable Sigmoid & BCE handle floating-point boundaries flawlessly!")`,
    solutionCode: `import numpy as np

def stable_sigmoid(z: np.ndarray) -> np.ndarray:
    z_clamped = np.clip(z, -80.0, 80.0)
    return 1.0 / (1.0 + np.exp(-z_clamped))

def binary_cross_entropy(y_true: np.ndarray, y_pred: np.ndarray, eps: float = 1e-15) -> float:
    p = np.clip(y_pred, eps, 1.0 - eps)
    return float(-np.mean(y_true * np.log(p) + (1.0 - y_true) * np.log(1.0 - p)))`,
    hints: [
      'In float64, np.exp(710) overflows to infinity. Clamping between -80 and 80 avoids both overflow and precision loss.',
      'Always clip predicted probabilities with an epsilon like 1e-15 before computing np.log.'
    ],
    keyPitfall: 'Evaluating np.log(0.0) returns -inf, which propagates through gradients and turns all neural weights into NaN.',
    targetNotebookId: 'nb_logistic'
  },
  {
    id: 'chal_kmeans_dist',
    title: 'Pairwise Distance Matrix for K-Means',
    subtitle: 'Metric Spaces & Voronoi Partitioning',
    category: 'Clustering',
    difficulty: 'Intermediate',
    xpReward: 400,
    estimatedTimeMin: 15,
    summary: 'Vectorize the calculation of squared Euclidean distances between N data points and K cluster centroids in a single tensor operation.',
    theory: 'Given X of shape (N, D) and centroids C of shape (K, D), calculating distances element-by-element takes O(N * K * D) slow Python iterations. By exploiting ||x - c||^2 = ||x||^2 - 2(x . c) + ||c||^2, we compute pairwise squared distances as: X_sq[:, None] - 2 * (X @ C.T) + C_sq[None, :].',
    taskInstruction: 'Implement `compute_pairwise_distances(X, centroids)` returning a matrix of shape (N, K) containing squared Euclidean distances.',
    starterCode: `import numpy as np

def compute_pairwise_distances(X: np.ndarray, centroids: np.ndarray) -> np.ndarray:
    """
    Inputs:
      X: (N, D) feature array
      centroids: (K, D) cluster centers
    Returns:
      dist_matrix: (N, K) array where dist_matrix[i, k] is ||X[i] - centroids[k]||^2
    """
    # TODO: Compute squared norms of samples (N, 1)
    # X_sq = np.sum(X**2, axis=1, keepdims=True)
    
    # TODO: Compute squared norms of centroids (1, K)
    # C_sq = np.sum(centroids**2, axis=1, keepdims=True).T
    
    # TODO: Combine using - 2 * (X @ centroids.T)
    # dists = ...
    
    return np.zeros((X.shape[0], centroids.shape[0]))

# Demo test:
pts = np.array([[0.0, 0.0], [3.0, 4.0]])
cnts = np.array([[0.0, 0.0], [1.0, 1.0]])
print(compute_pairwise_distances(pts, cnts))`,
    testVerificationCode: `# Automated Verification Test
X_test = np.array([[0.0, 0.0], [3.0, 4.0]]) # pt 1 at origin, pt 2 dist 5 from origin
C_test = np.array([[0.0, 0.0], [0.0, 3.0]])

D = compute_pairwise_distances(X_test, C_test)
assert D.shape == (2, 2), f"Expected shape (2, 2), got {D.shape}"
assert np.isclose(D[0, 0], 0.0), "Distance from origin to origin must be 0"
assert np.isclose(D[1, 0], 25.0), "Squared distance for (3, 4) to (0, 0) must be 3^2 + 4^2 = 25"
assert np.isclose(D[1, 1], 10.0), "Squared distance from (3, 4) to (0, 3) must be 3^2 + 1^2 = 10"
print("✓ VERIFICATION PASSED: Pairwise distance vectorization is exact!")`,
    solutionCode: `import numpy as np

def compute_pairwise_distances(X: np.ndarray, centroids: np.ndarray) -> np.ndarray:
    X_sq = np.sum(X**2, axis=1, keepdims=True)
    C_sq = np.sum(centroids**2, axis=1, keepdims=True).T
    dists = X_sq - 2.0 * (X @ centroids.T) + C_sq
    return np.maximum(dists, 0.0) # Numerical clamp against -0.000000001`,
    hints: [
      'Remember (a - b)^2 = a^2 - 2ab + b^2.',
      'Use np.maximum(dists, 0.0) to guard against floating-point precision causing tiny negative numbers like -1e-16.'
    ],
    keyPitfall: 'Omitting keepdims=True when summing along axis 1 will produce a 1D vector instead of a column vector, triggering unintended broadcasting.',
    targetNotebookId: 'nb_kmeans'
  },
  {
    id: 'chal_data_leakage',
    title: 'StandardScaler Without Data Leakage',
    subtitle: 'Empirical Preprocessing Pipeline Integrity',
    category: 'Pipelines',
    difficulty: 'Advanced',
    xpReward: 450,
    estimatedTimeMin: 15,
    summary: 'Build an isolated StandardScaler that fits statistical moments ONLY on training data, preventing subtle metric inflation and test data contamination.',
    theory: 'A classic data science defect is fitting scalers on the full dataset before train_test_split. When test set distribution parameters leak into the training feature representation, validation metrics become unrealistically optimistic, causing silent production degradation.',
    taskInstruction: 'Implement the `ProductionScaler` class with `fit(X)`, `transform(X)`, and `fit_transform(X)` methods. Guard against zero-variance features by setting std to 1.0 when std == 0.',
    starterCode: `import numpy as np

class ProductionScaler:
    def __init__(self):
        self.mean_: np.ndarray | None = None
        self.scale_: np.ndarray | None = None
        self.is_fitted: bool = False

    def fit(self, X: np.ndarray):
        """Computes mean and sample standard deviation per feature column."""
        # TODO: Compute column means (axis=0)
        self.mean_ = np.mean(X, axis=0)
        
        # TODO: Compute column standard deviations
        std = np.std(X, axis=0)
        # Guard against zero-variance constant features:
        std[std == 0.0] = 1.0
        self.scale_ = std
        self.is_fitted = True
        return self

    def transform(self, X: np.ndarray) -> np.ndarray:
        """Applies learned scaling: (X - mean_) / scale_"""
        if not self.is_fitted or self.mean_ is None or self.scale_ is None:
            raise ValueError("Scaler must be fitted before transform.")
        return (X - self.mean_) / self.scale_

    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        return self.fit(X).transform(X)

# Sample run:
X_train = np.array([[1.0, 10.0], [2.0, 20.0], [3.0, 30.0]])
scaler = ProductionScaler()
X_scaled = scaler.fit_transform(X_train)
print("Scaled train mean:", np.round(X_scaled.mean(axis=0), 2))
print("Scaled train std:", np.round(X_scaled.std(axis=0), 2))`,
    testVerificationCode: `# Automated Verification Test
scaler = ProductionScaler()
train_data = np.array([[10.0, 5.0], [20.0, 5.0], [30.0, 5.0]])
# Column 1 has constant value 5.0 (std = 0)
s_train = scaler.fit_transform(train_data)
assert not np.isnan(s_train).any(), "Zero-variance feature must not produce NaN"
assert np.allclose(s_train[:, 0], [-1.2247, 0.0, 1.2247], atol=1e-3)
assert np.allclose(s_train[:, 1], [0.0, 0.0, 0.0]), "Constant feature should be centered to 0"

test_data = np.array([[40.0, 5.0]])
s_test = scaler.transform(test_data)
assert np.isclose(s_test[0, 0], 2.4494, atol=1e-3), "Test transformation must use training mean (20.0) and std (8.16)"
print("✓ VERIFICATION PASSED: ProductionScaler prevents data leakage and handles zero variance!")`,
    solutionCode: `import numpy as np

class ProductionScaler:
    def __init__(self):
        self.mean_ = None
        self.scale_ = None
        self.is_fitted = False

    def fit(self, X: np.ndarray):
        self.mean_ = np.mean(X, axis=0)
        std = np.std(X, axis=0)
        std[std == 0.0] = 1.0
        self.scale_ = std
        self.is_fitted = True
        return self

    def transform(self, X: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            raise ValueError("Must fit before transform")
        return (X - self.mean_) / self.scale_

    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        return self.fit(X).transform(X)`,
    hints: [
      'Never compute std or mean on the test set inside `transform`. Always use `self.mean_` and `self.scale_`.',
      'Replace zero std entries with 1.0 to avoid division by zero while preserving column centering.'
    ],
    keyPitfall: 'Calling `fit` on test data is the most common cause of synthetic benchmark overfitting in Kaggle and production ML.',
    targetNotebookId: 'nb_eda'
  },
  {
    id: 'chal_backprop_mlp',
    title: 'Two-Layer MLP Backpropagation from Scratch',
    subtitle: 'Chain Rule, Gradient Flow & Matrix Transposition',
    category: 'Deep Learning',
    difficulty: 'Staff ML',
    xpReward: 500,
    estimatedTimeMin: 20,
    summary: 'Derive and execute forward and backward tensor propagation through hidden ReLU activations to output logits without autograd frameworks.',
    theory: 'In a 2-layer neural network with input X, weights W1, b1, activation ReLU, weights W2, b2: Z1 = X @ W1 + b1, A1 = max(0, Z1), Z2 = A1 @ W2 + b2. Backpropagating MSE loss dL/dZ2 yields dL/dW2 = A1.T @ dZ2 and dL/dZ1 = (dZ2 @ W2.T) * (Z1 > 0).',
    taskInstruction: 'Complete `mlp_backward(X, y, W1, b1, W2, b2)` returning dictionary of parameter gradients `{"dW1": ..., "db1": ..., "dW2": ..., "db2": ...}`.',
    starterCode: `import numpy as np

def relu(Z):
    return np.maximum(0, Z)

def relu_backward(dA, Z):
    dZ = dA.copy()
    dZ[Z <= 0] = 0
    return dZ

def mlp_forward_backward(X: np.ndarray, y: np.ndarray, W1: np.ndarray, b1: np.ndarray, W2: np.ndarray, b2: np.ndarray):
    """
    Computes forward pass and analytical gradients for MSE loss:
    Loss = (1 / N) * ||y_hat - y||^2
    """
    N = X.shape[0]
    # 1. Forward Pass
    Z1 = X @ W1 + b1
    A1 = relu(Z1)
    Z2 = A1 @ W2 + b2
    y_hat = Z2 # Linear output layer
    
    loss = np.mean((y_hat - y)**2)
    
    # 2. Backward Pass
    # dL/dZ2 = (2 / N) * (y_hat - y)
    dZ2 = (2.0 / N) * (y_hat - y)
    
    # Gradients for layer 2
    dW2 = A1.T @ dZ2
    db2 = np.sum(dZ2, axis=0, keepdims=True)
    
    # Backprop through ReLU
    dA1 = dZ2 @ W2.T
    dZ1 = relu_backward(dA1, Z1)
    
    # Gradients for layer 1
    dW1 = X.T @ dZ1
    db1 = np.sum(dZ1, axis=0, keepdims=True)
    
    return float(loss), {"dW1": dW1, "db1": db1, "dW2": dW2, "db2": db2}

# Run forward-backward
np.random.seed(42)
X_b = np.random.randn(10, 4)
y_b = np.random.randn(10, 1)
W1_b = np.random.randn(4, 8) * 0.1
b1_b = np.zeros((1, 8))
W2_b = np.random.randn(8, 1) * 0.1
b2_b = np.zeros((1, 1))

loss_val, grads = mlp_forward_backward(X_b, y_b, W1_b, b1_b, W2_b, b2_b)
print(f"MLP Loss: {loss_val:.4f}")
print("dW1 Shape:", grads["dW1"].shape)
print("dW2 Shape:", grads["dW2"].shape)`,
    testVerificationCode: `# Automated Verification Test
loss_val, grads = mlp_forward_backward(X_b, y_b, W1_b, b1_b, W2_b, b2_b)
assert grads["dW1"].shape == W1_b.shape, f"dW1 shape {grads['dW1'].shape} must match W1 {W1_b.shape}"
assert grads["dW2"].shape == W2_b.shape, f"dW2 shape {grads['dW2'].shape} must match W2 {W2_b.shape}"
assert grads["db1"].shape == b1_b.shape, "db1 shape mismatch"
assert grads["db2"].shape == b2_b.shape, "db2 shape mismatch"
assert not np.isnan(grads["dW1"]).any(), "Gradients must not contain NaN"
print("✓ VERIFICATION PASSED: Multi-layer backpropagation gradient shapes and chain rule are validated!")`,
    solutionCode: `import numpy as np

def mlp_forward_backward(X, y, W1, b1, W2, b2):
    N = X.shape[0]
    Z1 = X @ W1 + b1
    A1 = np.maximum(0, Z1)
    Z2 = A1 @ W2 + b2
    loss = np.mean((Z2 - y)**2)
    
    dZ2 = (2.0 / N) * (Z2 - y)
    dW2 = A1.T @ dZ2
    db2 = np.sum(dZ2, axis=0, keepdims=True)
    
    dA1 = dZ2 @ W2.T
    dZ1 = dA1 * (Z1 > 0)
    dW1 = X.T @ dZ1
    db1 = np.sum(dZ1, axis=0, keepdims=True)
    
    return float(loss), {"dW1": dW1, "db1": db1, "dW2": dW2, "db2": db2}`,
    hints: [
      'The derivative of ReLU(Z) is 1 for Z > 0 and 0 for Z <= 0.',
      'Remember that matrix gradients invert order during transposition: if Y = A @ B, then dL/dA = dL/dY @ B.T, and dL/dB = A.T @ dL/dY.',
      'Always use keepdims=True when summing bias gradients across axis 0 so shapes stay (1, d).'
    ],
    keyPitfall: 'Forgetting to backpropagate through the ReLU mask results in updating weights of inactive saturated neurons.',
    targetNotebookId: 'nb_mlp'
  }
];

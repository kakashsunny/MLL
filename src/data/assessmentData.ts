import { AssessmentQuizItem, AssessmentCodingItem, AssessmentDebuggingItem } from '../types';

// ============================================================================
// STAGE 1: 20 QUIZ CHALLENGES
// ============================================================================
export const QUIZ_ASSESSMENTS: AssessmentQuizItem[] = [
  {
    id: 'quiz_1',
    title: '1. OLS & Matrix Invertibility',
    category: 'Linear Models',
    difficulty: 'Easy',
    question: 'In Ordinary Least Squares (OLS) regression, the closed-form weight vector is given by w = (X^T X)^(-1) X^T y. Under what condition is the matrix (X^T X) non-invertible (singular)?',
    options: [
      'A. When the number of training samples n is much greater than features p (n >> p)',
      'B. When features exhibit exact collinearity or when the feature count p exceeds sample count n (p > n)',
      'C. When all features are normalized to mean 0 and variance 1',
      'D. When the target variable y follows a Gaussian normal distribution'
    ],
    correctAnswer: 1,
    explanation: 'If features are linearly dependent or if there are more features than data samples (p > n), the design matrix X does not have full column rank, making X^T X rank-deficient and mathematically singular (non-invertible).',
    xpReward: 50
  },
  {
    id: 'quiz_2',
    title: '2. Gradient Descent Learning Rate Stability',
    category: 'Optimization',
    difficulty: 'Easy',
    question: 'During gradient descent optimization, you observe the training loss oscillating violently and growing to positive infinity (+inf). What is the primary root cause and remedy?',
    options: [
      'A. The learning rate is too large; reducing the learning rate will restore convergence stability',
      'B. The dataset needs more polynomial features added',
      'C. The learning rate is too small; increasing it will prevent gradient stagnation',
      'D. The batch size is too large for matrix operations'
    ],
    correctAnswer: 0,
    explanation: 'When the learning rate exceeds 2 / L (where L is the Lipschitz constant of the gradient), gradient descent overshoots the minimum and diverges outward exponentially. Decreasing the learning rate or adopting an adaptive optimizer stabilizes trajectory.',
    xpReward: 50
  },
  {
    id: 'quiz_3',
    title: '3. Ridge (L2) vs Lasso (L1) Geometry',
    category: 'Regularization',
    difficulty: 'Medium',
    question: 'Why does Lasso (L1) regularization produce sparse models with exact zero coefficients, whereas Ridge (L2) only shrinks weights toward zero without setting them to zero?',
    options: [
      'A. Ridge regularization uses non-convex loss functions',
      'B. The L1 norm constraint has sharp corners (diamond in 2D) along coordinate axes where loss contours frequently intersect first',
      'C. Lasso calculates the pseudo-inverse while Ridge uses singular value decomposition',
      'D. L2 penalty is always larger in magnitude than L1 penalty'
    ],
    correctAnswer: 1,
    explanation: 'In parameter space, the L1 ball ||w||_1 <= t has sharp vertices (corners) lying directly on the coordinate axes. The elliptical contours of the MSE loss are mathematically much more likely to touch these corners first, setting the remaining coordinates to exactly zero.',
    xpReward: 50
  },
  {
    id: 'quiz_4',
    title: '4. Logistic Regression & Cross-Entropy',
    category: 'Classification',
    difficulty: 'Easy',
    question: 'Why is Binary Cross-Entropy (Log Loss) used to train Logistic Regression instead of Mean Squared Error (MSE)?',
    options: [
      'A. MSE combined with the non-linear Sigmoid activation yields a non-convex loss landscape with numerous local minima',
      'B. MSE cannot compute gradients for probabilities between 0 and 1',
      'C. Binary Cross-Entropy requires fewer floating point operations than MSE',
      'D. Scikit-Learn disallows MSE on binary labels'
    ],
    correctAnswer: 0,
    explanation: 'Plugging the sigmoid function sigma(z) into quadratic MSE results in a non-convex loss surface with flat plateaus and suboptimal local minima. Cross-Entropy loss is strictly convex with respect to weights w, guaranteeing global convergence via gradient descent.',
    xpReward: 50
  },
  {
    id: 'quiz_5',
    title: '5. Precision vs Recall Trade-off',
    category: 'Evaluation Metrics',
    difficulty: 'Easy',
    question: 'In a medical diagnostics model screening for a fatal but treatable disease where missing an infected patient carries extreme risk, which metric should be prioritized?',
    options: [
      'A. Precision (minimizing false positives)',
      'B. Recall / Sensitivity (minimizing false negatives)',
      'C. Specificity (maximizing true negative rate)',
      'D. Accuracy on raw class distributions'
    ],
    correctAnswer: 1,
    explanation: 'Recall = TP / (TP + FN). When a False Negative means failing to treat a life-threatening illness, recall must be maximized by lowering the classification decision threshold, ensuring virtually zero false negatives even at the expense of false alarms.',
    xpReward: 50
  },
  {
    id: 'quiz_6',
    title: '6. Class Imbalance: ROC-AUC vs PR-AUC',
    category: 'Evaluation Metrics',
    difficulty: 'Medium',
    question: 'When evaluating a fraud detection model where only 0.05% of transactions are fraudulent, why is Precision-Recall AUC (PR-AUC) preferred over ROC-AUC?',
    options: [
      'A. ROC-AUC is only defined for multi-class classification',
      'B. ROC-AUC incorporates False Positive Rate (FP / Total Negatives); with millions of true negatives, FP can explode without noticeably hurting ROC-AUC, presenting an overly optimistic score',
      'C. PR-AUC is immune to threshold changes',
      'D. PR-AUC always outputs higher numeric scores than ROC-AUC'
    ],
    correctAnswer: 1,
    explanation: 'Because Total Negatives (TN + FP) is overwhelmingly large, FPR = FP / (TN + FP) stays near zero even if false positives outnumber true fraud cases by 100:1. PR-AUC focuses exclusively on the positive minority class and exposes precision collapse.',
    xpReward: 50
  },
  {
    id: 'quiz_7',
    title: '7. Decision Tree Splitting Criteria',
    category: 'Tree Ensembles',
    difficulty: 'Medium',
    question: 'What is the maximum Gini Impurity value for a binary classification node containing an equal 50/50 split of positive and negative classes?',
    options: [
      'A. 0.00',
      'B. 0.25',
      'C. 0.50',
      'D. 1.00'
    ],
    correctAnswer: 2,
    explanation: 'Gini Impurity is defined as 1 - sum(p_i^2). For binary classes with p_1 = 0.5 and p_2 = 0.5: Gini = 1 - (0.5^2 + 0.5^2) = 1 - (0.25 + 0.25) = 0.50.',
    xpReward: 50
  },
  {
    id: 'quiz_8',
    title: '8. Random Forest Variance Reduction',
    category: 'Tree Ensembles',
    difficulty: 'Medium',
    question: 'How does Random Forest achieve lower variance than a standard Bagged Decision Tree ensemble?',
    options: [
      'A. By using boosting residuals to reweight samples',
      'B. By enforcing feature subsampling at each node split, de-correlating individual trees so their averaged variance drops faster',
      'C. By pruning all trees to a maximum depth of 2',
      'D. By substituting linear regression models at leaf nodes'
    ],
    correctAnswer: 1,
    explanation: 'Standard bagging averages correlated trees (if one strong predictor dominates, every tree splits on it first). Random Forest randomly selects a subset of features (typically sqrt(p)) at each split, de-correlating the trees and drastically reducing ensemble variance: Var(Mean) = rho * sigma^2 + (1-rho)/B * sigma^2.',
    xpReward: 50
  },
  {
    id: 'quiz_9',
    title: '9. K-Means++ Centroid Initialization',
    category: 'Clustering',
    difficulty: 'Medium',
    question: 'What improvement does the K-Means++ initialization algorithm introduce over standard random uniform initialization?',
    options: [
      'A. It computes PCA on the dataset before assigning initial points',
      'B. It chooses initial centroids iteratively with probability proportional to the squared Euclidean distance from the nearest existing centroid',
      'C. It runs hierarchical agglomerative clustering on 100 samples',
      'D. It sets all centroids to the global dataset mean'
    ],
    correctAnswer: 1,
    explanation: 'K-Means++ samples each subsequent center with probability D(x)^2 / sum(D(x)^2). This mathematically spreads initial centroids apart across separate clusters, avoiding poor local minima and providing an O(log k) competitive ratio guarantee.',
    xpReward: 50
  },
  {
    id: 'quiz_10',
    title: '10. Principal Component Analysis (PCA)',
    category: 'Dimensionality Reduction',
    difficulty: 'Hard',
    question: 'In PCA, what do the eigenvectors and eigenvalues of the centered covariance matrix Sigma = (1/n) X^T X represent?',
    options: [
      'A. Eigenvectors indicate the orthogonal directions of maximal variance; eigenvalues quantify the amount of variance along each respective principal axis',
      'B. Eigenvectors represent the class separation boundaries; eigenvalues represent the misclassification rate',
      'C. Eigenvectors define the polynomial degree of the manifold',
      'D. Eigenvalues represent the optimal learning rates for stochastic optimization'
    ],
    correctAnswer: 0,
    explanation: 'Maximizing the variance of projected coordinates w^T Sigma w subject to ||w||=1 leads directly to the Rayleigh quotient eigenvalue problem: Sigma w = lambda w. Thus, eigenvectors yield the principal component axes, and eigenvalues measure the explained variance.',
    xpReward: 50
  },
  {
    id: 'quiz_11',
    title: '11. Data Leakage in Preprocessing',
    category: 'Model Integrity',
    difficulty: 'Easy',
    question: 'A practitioner executes StandardScaler.fit_transform(X) on the full dataset before calling train_test_split(X, y). What critical issue has occurred?',
    options: [
      'A. High Bias (Underfitting)',
      'B. Data Leakage: information from the test set (mean and variance) leaked into the training pipeline, leading to overly optimistic validation metrics',
      'C. Vanishing Gradient',
      'D. Over-regularization'
    ],
    correctAnswer: 1,
    explanation: 'Fitting the scaler on the entire dataset incorporates test-set distribution statistics (mean and std) into training data. The scaler must strictly be fit ONLY on training data (scaler.fit(X_train)), then used to transform both X_train and X_test.',
    xpReward: 50
  },
  {
    id: 'quiz_12',
    title: '12. Support Vector Machine Soft Margin Slack',
    category: 'Linear Models',
    difficulty: 'Hard',
    question: 'In Soft-Margin SVM, what does the hyperparameter C control in the objective min (1/2)||w||^2 + C * sum(xi_i)?',
    options: [
      'A. The kernel bandwidth gamma',
      'B. The trade-off between margin width and margin violations: high C heavily penalizes slack violations (narrower margin, lower bias, higher variance)',
      'C. The learning rate for dual coordinate descent',
      'D. The number of support vectors permitted'
    ],
    correctAnswer: 1,
    explanation: 'A large C puts heavy penalty on slack variables xi_i (misclassifications and margin intrusions), forcing the optimization to find a narrow margin that correctly classifies almost all points (prone to overfitting). Small C allows more violations for a wider, more robust margin.',
    xpReward: 50
  },
  {
    id: 'quiz_13',
    title: '13. Backpropagation Chain Rule',
    category: 'Deep Learning',
    difficulty: 'Medium',
    question: 'Given an affine transformation z = W x + b followed by scalar activation a = g(z) and scalar loss L. By the matrix calculus chain rule, what is the gradient dL/dW for a batch of activations?',
    options: [
      'A. dL/dW = dL/da * x^T',
      'B. dL/dW = dL/dz @ x^T (where dL/dz = dL/da * g\'(z))',
      'C. dL/dW = W^T @ dL/dz',
      'D. dL/dW = x @ dL/dz'
    ],
    correctAnswer: 1,
    explanation: 'Applying the multivariate chain rule: delta = dL/dz = (dL/da) * g\'(z). Since z_i = sum_j W_ij x_j + b_i, the derivative with respect to W_ij is delta_i * x_j, which in vector form is the outer product dL/dW = delta @ x^T.',
    xpReward: 50
  },
  {
    id: 'quiz_14',
    title: '14. Vanishing Gradient Problem',
    category: 'Deep Learning',
    difficulty: 'Easy',
    question: 'Why does stacking many deep layers with Sigmoid activation functions cause the vanishing gradient problem during backpropagation?',
    options: [
      'A. Sigmoid derivative peaks at 0.25 (when z=0) and drops toward 0 as |z| grows, causing multiplied gradients to decay exponentially toward zero across layers',
      'B. Sigmoid outputs negative values that cancel positive weights',
      'C. Sigmoid causes memory overflow during forward passes',
      'D. Sigmoid does not support automatic differentiation'
    ],
    correctAnswer: 0,
    explanation: 'The derivative of sigmoid is sigma\'(z) = sigma(z)(1 - sigma(z)), with a maximum value of 0.25. By the chain rule, multiplying numbers <= 0.25 across dozens of layers decays the error signal exponentially: 0.25^10 ~ 9.5e-7, freezing earlier layer weights.',
    xpReward: 50
  },
  {
    id: 'quiz_15',
    title: '15. Batch Normalization vs Layer Normalization',
    category: 'Deep Learning',
    difficulty: 'Hard',
    question: 'Why is Layer Normalization generally preferred over Batch Normalization in Recurrent Neural Networks and Transformer architectures?',
    options: [
      'A. Layer Normalization normalizes across features for each single sample independently of batch size and sequence length, avoiding cross-batch dependencies',
      'B. Batch Normalization cannot be accelerated on GPUs',
      'C. Layer Normalization eliminates the need for activation functions',
      'D. Batch Normalization requires double precision floating point numbers'
    ],
    correctAnswer: 0,
    explanation: 'Batch Normalization computes mean and variance along the batch dimension. For variable-length sequences or small batch sizes (common in large LLMs), batch statistics are erratic. LayerNorm computes statistics across hidden dimensions for each sample individually.',
    xpReward: 50
  },
  {
    id: 'quiz_16',
    title: '16. Dropout Regularization at Inference',
    category: 'Deep Learning',
    difficulty: 'Medium',
    question: 'When applying standard (non-inverted) Dropout with probability p during training, what must be done to the weights or activations during test-time evaluation?',
    options: [
      'A. Dropout must continue running with rate p',
      'B. Activations must be multiplied by (1 - p) to match the expected activation magnitude seen during training',
      'C. Weights must be reset to zero',
      'D. The learning rate must be multiplied by p'
    ],
    correctAnswer: 1,
    explanation: 'In standard dropout, only a fraction (1 - p) of units are active during training. During testing, all units are active, so their outputs must be scaled by (1 - p) to maintain expected value consistency (or use inverted dropout during training by dividing by 1-p).',
    xpReward: 50
  },
  {
    id: 'quiz_17',
    title: '17. Numerical Stability of Softmax',
    category: 'Numerical Methods',
    difficulty: 'Medium',
    question: 'Why do production implementations of the Softmax function compute softmax(z - max(z)) instead of naive softmax(z)?',
    options: [
      'A. To force the outputs to sum to 2.0',
      'B. To prevent floating-point overflow (+inf) when np.exp(z) is computed on large logits (e.g., z = 1000)',
      'C. Because subtracting the max changes the mathematical probability distribution',
      'D. To speed up vectorization on TPU hardware'
    ],
    correctAnswer: 1,
    explanation: 'In 64-bit IEEE floating point, exp(710) overflows to inf. By the identity exp(z_i - c) / sum(exp(z_j - c)) = exp(z_i) / sum(exp(z_j)), setting c = max(z) ensures the largest exponent is exp(0) = 1, completely preventing overflow without changing probabilities.',
    xpReward: 50
  },
  {
    id: 'quiz_18',
    title: '18. Transformer Attention Scaling Factor',
    category: 'Transformers & LLMs',
    difficulty: 'Hard',
    question: 'In the Transformer Scaled Dot-Product Attention Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V, why is the dot product divided by sqrt(d_k)?',
    options: [
      'A. To convert the matrix into an orthogonal unitary transform',
      'B. For large projection dimensions d_k, the dot product grows large in magnitude, pushing softmax into regions with extremely small gradients; dividing by sqrt(d_k) preserves variance of 1',
      'C. To ensure the Query matrix matches Key matrix dimensions',
      'D. Because softmax only accepts inputs bounded in [-1, 1]'
    ],
    correctAnswer: 1,
    explanation: 'Assuming independent components of Q and K with mean 0 and variance 1, their dot product has mean 0 and variance d_k. For large d_k (e.g. 64 or 128), dot products grow large, causing softmax to saturate with tiny gradient flow. Dividing by sqrt(d_k) normalizes variance to 1.',
    xpReward: 50
  },
  {
    id: 'quiz_19',
    title: '19. Overfitting Diagnostic from Loss Curves',
    category: 'Model Diagnostics',
    difficulty: 'Easy',
    question: 'You plot training loss and validation loss over 100 epochs. Training loss steadily decreases to near zero, while validation loss decreases initially, plateaus, and starts climbing steeply. What does this signify?',
    options: [
      'A. Underfitting (High Bias) — the model capacity is insufficient',
      'B. Optimal training convergence — continue training for 500 more epochs',
      'C. Overfitting (High Variance) — the model is memorizing noise; early stopping or regularization should be applied',
      'D. Hardware memory corruption'
    ],
    correctAnswer: 2,
    explanation: 'The inflection point where validation loss diverges upward while training loss continues downward is the definitive empirical signature of overfitting. Early stopping should halt training at or near that minimum validation loss checkpoint.',
    xpReward: 50
  },
  {
    id: 'quiz_20',
    title: '20. Production MLOps: Covariate Shift vs Concept Drift',
    category: 'MLOps',
    difficulty: 'Hard',
    question: 'What is the precise distinction between Covariate Shift and Concept Drift in production machine learning systems?',
    options: [
      'A. Covariate Shift refers to P(X) changing while P(Y|X) remains constant; Concept Drift refers to the underlying relationship P(Y|X) changing over time',
      'B. Covariate shift only happens in computer vision; concept drift only happens in NLP',
      'C. Covariate shift is caused by missing values; concept drift is caused by learning rate decay',
      'D. They are mathematically identical terms for database schema updates'
    ],
    correctAnswer: 0,
    explanation: 'Covariate Shift: input distribution P(X) alters (e.g. customer demographics change), but the rule mapping features to target P(Y|X) remains the same. Concept Drift: the conditional target distribution P(Y|X) shifts (e.g. definition of fraudulent purchase changes due to new adversary tactics).',
    xpReward: 50
  }
];

// ============================================================================
// STAGE 2: 20 CODING CHALLENGES
// ============================================================================
export const CODING_ASSESSMENTS: AssessmentCodingItem[] = [
  {
    id: 'code_1',
    title: '1. Vectorized Mean Squared Error (MSE)',
    category: 'Loss Functions',
    difficulty: 'Easy',
    description: 'Implement a vectorized Python function `mean_squared_error(y_true, y_pred)` that computes the scalar MSE between two 1D NumPy arrays without using for-loops.',
    functionSignature: 'def mean_squared_error(y_true, y_pred):',
    starterCode: `import numpy as np

def mean_squared_error(y_true, y_pred):
    """
    Computes Mean Squared Error: (1/n) * sum((y_true - y_pred)^2)
    Args:
        y_true (np.ndarray): Ground truth 1D array
        y_pred (np.ndarray): Predicted values 1D array
    Returns:
        float: Computed MSE loss
    """
    # TODO: Implement vectorized MSE
    pass
`,
    solutionCode: `import numpy as np

def mean_squared_error(y_true, y_pred):
    y_true = np.asarray(y_true, dtype=np.float64)
    y_pred = np.asarray(y_pred, dtype=np.float64)
    return float(np.mean((y_true - y_pred) ** 2))
`,
    hint: 'Use np.mean((y_true - y_pred) ** 2) directly.',
    testCasesDescription: 'Tests with identical arrays (0.0 MSE), simple offsets, and floating point arrays.',
    xpReward: 100
  },
  {
    id: 'code_2',
    title: '2. Numerically Stable Sigmoid',
    category: 'Activation Functions',
    difficulty: 'Easy',
    description: 'Implement `stable_sigmoid(z)` such that it computes 1 / (1 + exp(-z)) without throwing overflow errors when z contains large negative values (e.g., z = -1000).',
    functionSignature: 'def stable_sigmoid(z):',
    starterCode: `import numpy as np

def stable_sigmoid(z):
    """
    Computes numerically stable Sigmoid activation for any input array or scalar.
    For z >= 0: 1 / (1 + exp(-z))
    For z < 0: exp(z) / (1 + exp(z))
    """
    # TODO: Implement piecewise stable sigmoid
    pass
`,
    solutionCode: `import numpy as np

def stable_sigmoid(z):
    z = np.asarray(z, dtype=np.float64)
    # Piecewise implementation prevents exp(1000) overflow
    pos_mask = (z >= 0)
    neg_mask = ~pos_mask
    result = np.empty_like(z)
    result[pos_mask] = 1.0 / (1.0 + np.exp(-z[pos_mask]))
    exp_neg = np.exp(z[neg_mask])
    result[neg_mask] = exp_neg / (1.0 + exp_neg)
    return result
`,
    hint: 'Split computation using np.where or masking: when z < 0, use exp(z) / (1 + exp(z)).',
    testCasesDescription: 'Tests on z = 0 (0.5), large positive z = 100 (1.0), and large negative z = -500 (0.0 without overflow).',
    xpReward: 100
  },
  {
    id: 'code_3',
    title: '3. Min-Max Feature Scaler',
    category: 'Feature Engineering',
    difficulty: 'Easy',
    description: 'Implement `min_max_scale(X)` to normalize a 2D matrix column-wise into the range [0, 1]. If a column has zero variance (max == min), return zeros for that column.',
    functionSignature: 'def min_max_scale(X):',
    starterCode: `import numpy as np

def min_max_scale(X):
    """
    Scales 2D array X column-wise to [0, 1].
    Formula: (X - min) / (max - min)
    """
    # TODO: Implement column-wise min-max scaling
    pass
`,
    solutionCode: `import numpy as np

def min_max_scale(X):
    X = np.asarray(X, dtype=np.float64)
    col_min = np.min(X, axis=0)
    col_max = np.max(X, axis=0)
    diff = col_max - col_min
    diff[diff == 0] = 1.0 # Avoid zero division
    scaled = (X - col_min) / diff
    return scaled
`,
    hint: 'Compute np.min(X, axis=0) and np.max(X, axis=0). Guard against zero range by replacing 0 with 1.',
    testCasesDescription: 'Verifies column-wise bounds [0, 1] on random 2D matrix and zero-variance constant column handling.',
    xpReward: 100
  },
  {
    id: 'code_4',
    title: '4. Standard Z-Score Normalizer',
    category: 'Feature Engineering',
    difficulty: 'Easy',
    description: 'Implement `standard_scaler(X)` that standardizes 2D feature matrix X column-wise to mean 0 and standard deviation 1. Guard against division by zero for constant columns.',
    functionSignature: 'def standard_scaler(X):',
    starterCode: `import numpy as np

def standard_scaler(X):
    """
    Formula: (X - mean) / std
    """
    # TODO: Implement column-wise standardization
    pass
`,
    solutionCode: `import numpy as np

def standard_scaler(X):
    X = np.asarray(X, dtype=np.float64)
    mean = np.mean(X, axis=0)
    std = np.std(X, axis=0)
    std[std == 0] = 1.0
    return (X - mean) / std
`,
    hint: 'Use np.mean(X, axis=0) and np.std(X, axis=0).',
    testCasesDescription: 'Checks that standardized output has column means near 0 and standard deviations near 1.',
    xpReward: 100
  },
  {
    id: 'code_5',
    title: '5. Binary Classification Accuracy',
    category: 'Evaluation Metrics',
    difficulty: 'Easy',
    description: 'Implement `binary_accuracy(y_true, y_pred)` returning the ratio of correct predictions to total predictions as a float between 0.0 and 1.0.',
    functionSignature: 'def binary_accuracy(y_true, y_pred):',
    starterCode: `import numpy as np

def binary_accuracy(y_true, y_pred):
    """
    Computes accuracy = sum(y_true == y_pred) / len(y_true)
    """
    # TODO: Implement binary accuracy
    pass
`,
    solutionCode: `import numpy as np

def binary_accuracy(y_true, y_pred):
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)
    if len(y_true) == 0:
        return 0.0
    return float(np.mean(y_true == y_pred))
`,
    hint: 'np.mean(y_true == y_pred) returns the fraction of matching entries.',
    testCasesDescription: 'Verifies perfect matches (1.0), complete mismatch (0.0), and 50% accuracy vectors.',
    xpReward: 100
  },
  {
    id: 'code_6',
    title: '6. Rectified Linear Unit (ReLU) & Derivative',
    category: 'Deep Learning',
    difficulty: 'Easy',
    description: 'Implement `relu_forward_backward(x)` returning a tuple `(out, grad)` where `out = max(0, x)` and `grad = 1.0 if x > 0 else 0.0`.',
    functionSignature: 'def relu_forward_backward(x):',
    starterCode: `import numpy as np

def relu_forward_backward(x):
    """
    Returns (out, grad) for input array x.
    """
    # TODO: Implement vectorized ReLU and derivative
    pass
`,
    solutionCode: `import numpy as np

def relu_forward_backward(x):
    x = np.asarray(x, dtype=np.float64)
    out = np.maximum(0.0, x)
    grad = (x > 0.0).astype(np.float64)
    return out, grad
`,
    hint: 'Use np.maximum(0, x) for output and (x > 0).astype(float) for gradient.',
    testCasesDescription: 'Tests on positive numbers, negative numbers, and zero boundary.',
    xpReward: 100
  },
  {
    id: 'code_7',
    title: '7. Euclidean Distance Matrix',
    category: 'Linear Algebra',
    difficulty: 'Easy',
    description: 'Implement `pairwise_euclidean_distance(A, B)` computing the pairwise Euclidean distance matrix between matrix A of shape (N, D) and matrix B of shape (M, D). Output shape must be (N, M).',
    functionSignature: 'def pairwise_euclidean_distance(A, B):',
    starterCode: `import numpy as np

def pairwise_euclidean_distance(A, B):
    """
    Computes pairwise distance matrix D of shape (N, M) where D[i, j] = ||A[i] - B[j]||_2
    """
    # TODO: Implement pairwise distance matrix
    pass
`,
    solutionCode: `import numpy as np

def pairwise_euclidean_distance(A, B):
    A = np.asarray(A, dtype=np.float64)
    B = np.asarray(B, dtype=np.float64)
    # Vectorized broadcasting: (N, 1, D) - (1, M, D)
    diff = A[:, np.newaxis, :] - B[np.newaxis, :, :]
    return np.sqrt(np.sum(diff ** 2, axis=-1))
`,
    hint: 'Use broadcasting: A[:, np.newaxis, :] - B[np.newaxis, :, :].',
    testCasesDescription: 'Verifies self-distance matrix diagonal is 0 and cross-distance matches Pythagorean theorem.',
    xpReward: 100
  },
  {
    id: 'code_8',
    title: '8. Binary Cross-Entropy Loss with Log-Clipping',
    category: 'Loss Functions',
    difficulty: 'Medium',
    description: 'Implement `binary_cross_entropy(y_true, y_pred, eps=1e-15)` where loss = - (1/n) * sum(y*log(p) + (1-y)*log(1-p)). Clip predictions to [eps, 1 - eps] to prevent log(0).',
    functionSignature: 'def binary_cross_entropy(y_true, y_pred, eps=1e-15):',
    starterCode: `import numpy as np

def binary_cross_entropy(y_true, y_pred, eps=1e-15):
    """
    Calculates numerically stable BCE loss.
    """
    # TODO: Clip predictions and compute mean BCE
    pass
`,
    solutionCode: `import numpy as np

def binary_cross_entropy(y_true, y_pred, eps=1e-15):
    y_true = np.asarray(y_true, dtype=np.float64)
    y_pred = np.asarray(y_pred, dtype=np.float64)
    y_pred_clipped = np.clip(y_pred, eps, 1.0 - eps)
    loss = -np.mean(y_true * np.log(y_pred_clipped) + (1.0 - y_true) * np.log(1.0 - y_pred_clipped))
    return float(loss)
`,
    hint: 'np.clip(y_pred, eps, 1.0 - eps) prevents log(0) which yields NaN.',
    testCasesDescription: 'Tests with exact labels, edge cases with y_pred=0 and y_pred=1, and symmetric 0.5 probabilities.',
    xpReward: 100
  },
  {
    id: 'code_9',
    title: '9. Linear Regression Gradient Descent Step',
    category: 'Optimization',
    difficulty: 'Medium',
    description: 'Implement `gradient_descent_step(X, y, w, b, lr)` for linear regression y_hat = X @ w + b. Return the updated `(w_next, b_next)` after one batch gradient descent step.',
    functionSignature: 'def gradient_descent_step(X, y, w, b, lr):',
    starterCode: `import numpy as np

def gradient_descent_step(X, y, w, b, lr):
    """
    X: shape (m, n)
    y: shape (m,)
    w: shape (n,)
    b: float
    lr: learning rate
    Returns: (w_updated, b_updated)
    """
    # TODO: Compute gradients dL/dw and dL/db, update parameters
    pass
`,
    solutionCode: `import numpy as np

def gradient_descent_step(X, y, w, b, lr):
    X = np.asarray(X, dtype=np.float64)
    y = np.asarray(y, dtype=np.float64)
    w = np.asarray(w, dtype=np.float64)
    m = X.shape[0]
    
    y_hat = X @ w + b
    error = y_hat - y
    dw = (1.0 / m) * (X.T @ error)
    db = (1.0 / m) * np.sum(error)
    
    w_next = w - lr * dw
    b_next = b - lr * db
    return w_next, float(b_next)
`,
    hint: 'Gradients for MSE (1/2m) sum(error^2): dw = (1/m) X^T @ error, db = (1/m) sum(error).',
    testCasesDescription: 'Verifies gradient reduction after step on synthetic linear data.',
    xpReward: 100
  },
  {
    id: 'code_10',
    title: '10. Numerically Stable Softmax',
    category: 'Deep Learning',
    difficulty: 'Medium',
    description: 'Implement `stable_softmax(Z)` where Z is a 2D array of logits with shape (N, C). Output must have row-wise probabilities summing to 1.0, subtracting row max to avoid overflow.',
    functionSignature: 'def stable_softmax(Z):',
    starterCode: `import numpy as np

def stable_softmax(Z):
    """
    Z: 2D array of shape (N, C)
    Returns: probabilities array of shape (N, C)
    """
    # TODO: Implement stable row-wise softmax
    pass
`,
    solutionCode: `import numpy as np

def stable_softmax(Z):
    Z = np.asarray(Z, dtype=np.float64)
    shift_Z = Z - np.max(Z, axis=1, keepdims=True)
    exp_Z = np.exp(shift_Z)
    return exp_Z / np.sum(exp_Z, axis=1, keepdims=True)
`,
    hint: 'Use keepdims=True on np.max(Z, axis=1) and np.sum(exp_Z, axis=1) for seamless broadcasting.',
    testCasesDescription: 'Tests on large logits (e.g. 1000.0) without throwing RuntimeWarning/inf, verifying sum == 1.0.',
    xpReward: 100
  },
  {
    id: 'code_11',
    title: '11. Precision, Recall & F1-Score',
    category: 'Evaluation Metrics',
    difficulty: 'Medium',
    description: 'Implement `classification_metrics(y_true, y_pred)` returning a dict `{"precision": p, "recall": r, "f1": f1}`. Return 0.0 for metrics when denominator is zero.',
    functionSignature: 'def classification_metrics(y_true, y_pred):',
    starterCode: `import numpy as np

def classification_metrics(y_true, y_pred):
    """
    Computes precision, recall, and f1 score for binary classification.
    """
    # TODO: Compute TP, FP, FN and resulting metrics
    pass
`,
    solutionCode: `import numpy as np

def classification_metrics(y_true, y_pred):
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)
    
    tp = np.sum((y_true == 1) & (y_pred == 1))
    fp = np.sum((y_true == 0) & (y_pred == 1))
    fn = np.sum((y_true == 1) & (y_pred == 0))
    
    precision = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
    recall = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
    f1 = float(2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
    
    return {"precision": precision, "recall": recall, "f1": f1}
`,
    hint: 'Count TP, FP, and FN using boolean mask operations. Check denominators before dividing.',
    testCasesDescription: 'Tests standard confusion cases and zero-division edge cases (all zeros predicted).',
    xpReward: 100
  },
  {
    id: 'code_12',
    title: '12. Gini Impurity for Binary Split',
    category: 'Tree Ensembles',
    difficulty: 'Medium',
    description: 'Implement `gini_impurity(labels)` calculating 1 - sum(p_k^2) for a 1D array of class labels. Return 0.0 if array is empty.',
    functionSignature: 'def gini_impurity(labels):',
    starterCode: `import numpy as np

def gini_impurity(labels):
    """
    Calculates Gini Impurity: 1 - sum(p_i^2)
    """
    # TODO: Calculate class probabilities and Gini impurity
    pass
`,
    solutionCode: `import numpy as np

def gini_impurity(labels):
    labels = np.asarray(labels)
    n = len(labels)
    if n == 0:
        return 0.0
    _, counts = np.unique(labels, return_counts=True)
    probs = counts / n
    return float(1.0 - np.sum(probs ** 2))
`,
    hint: 'Use np.unique(labels, return_counts=True) to extract class counts.',
    testCasesDescription: 'Tests pure node (0.0), balanced binary node (0.50), and multi-class distribution.',
    xpReward: 100
  },
  {
    id: 'code_13',
    title: '13. Ridge L2 Loss with Regularization Penalty',
    category: 'Regularization',
    difficulty: 'Medium',
    description: 'Implement `ridge_loss(X, y, w, alpha)` returning scalar MSE loss + alpha * ||w||_2^2.',
    functionSignature: 'def ridge_loss(X, y, w, alpha):',
    starterCode: `import numpy as np

def ridge_loss(X, y, w, alpha):
    """
    Computes MSE(Xw, y) + alpha * sum(w^2)
    """
    # TODO: Compute combined MSE and L2 penalty
    pass
`,
    solutionCode: `import numpy as np

def ridge_loss(X, y, w, alpha):
    X = np.asarray(X, dtype=np.float64)
    y = np.asarray(y, dtype=np.float64)
    w = np.asarray(w, dtype=np.float64)
    
    mse = np.mean((X @ w - y) ** 2)
    l2_penalty = alpha * np.sum(w ** 2)
    return float(mse + l2_penalty)
`,
    hint: 'Combine np.mean((X @ w - y) ** 2) and alpha * np.sum(w ** 2).',
    testCasesDescription: 'Validates alpha=0 gives pure MSE, and positive alpha penalizes non-zero weights accordingly.',
    xpReward: 100
  },
  {
    id: 'code_14',
    title: '14. K-Means Nearest Centroid Assignment',
    category: 'Clustering',
    difficulty: 'Medium',
    description: 'Implement `assign_clusters(X, centroids)` assigning each point in 2D array X of shape (N, D) to the index of the closest centroid in centroids of shape (K, D). Returns 1D integer array of shape (N,).',
    functionSignature: 'def assign_clusters(X, centroids):',
    starterCode: `import numpy as np

def assign_clusters(X, centroids):
    """
    Returns 1D array of cluster indices [0 .. K-1] for each point in X.
    """
    # TODO: Calculate distance to each centroid and return argmin
    pass
`,
    solutionCode: `import numpy as np

def assign_clusters(X, centroids):
    X = np.asarray(X, dtype=np.float64)
    centroids = np.asarray(centroids, dtype=np.float64)
    # Distance shape: (N, K)
    distances = np.linalg.norm(X[:, np.newaxis, :] - centroids[np.newaxis, :, :], axis=-1)
    return np.argmin(distances, axis=1)
`,
    hint: 'Compute pairwise distances using broadcasting then take np.argmin(distances, axis=1).',
    testCasesDescription: 'Tests assignment of known 2D points to nearest cluster centers.',
    xpReward: 100
  },
  {
    id: 'code_15',
    title: '15. Cosine Similarity Matrix',
    category: 'Linear Algebra',
    difficulty: 'Medium',
    description: 'Implement `cosine_similarity(A, B)` computing the cosine similarity between rows of A of shape (N, D) and rows of B of shape (M, D). If a vector has zero norm, its similarity should be 0.0.',
    functionSignature: 'def cosine_similarity(A, B):',
    starterCode: `import numpy as np

def cosine_similarity(A, B):
    """
    Cosine similarity: (A @ B^T) / (||A|| * ||B||)
    Returns: shape (N, M) matrix
    """
    # TODO: Implement normalized dot product
    pass
`,
    solutionCode: `import numpy as np

def cosine_similarity(A, B):
    A = np.asarray(A, dtype=np.float64)
    B = np.asarray(B, dtype=np.float64)
    
    norm_A = np.linalg.norm(A, axis=1, keepdims=True)
    norm_B = np.linalg.norm(B, axis=1, keepdims=True)
    
    norm_A[norm_A == 0] = 1.0
    norm_B[norm_B == 0] = 1.0
    
    A_norm = A / norm_A
    B_norm = B / norm_B
    return A_norm @ B_norm.T
`,
    hint: 'Normalize A and B along axis=1 with keepdims=True, then take matrix product A_norm @ B_norm.T.',
    testCasesDescription: 'Tests orthogonal vectors (similarity 0.0), parallel vectors (1.0), and opposite vectors (-1.0).',
    xpReward: 100
  },
  {
    id: 'code_16',
    title: '16. OLS Normal Equation Solver',
    category: 'Linear Models',
    difficulty: 'Hard',
    description: 'Implement `ols_normal_equation(X, y)` computing w = (X^T X)^(-1) X^T y using np.linalg.pinv to ensure stability even if X is ill-conditioned. Return 1D array of weights.',
    functionSignature: 'def ols_normal_equation(X, y):',
    starterCode: `import numpy as np

def ols_normal_equation(X, y):
    """
    Solves w in Xw = y via Moore-Penrose pseudo-inverse or Normal Equations.
    """
    # TODO: Implement closed-form OLS solution
    pass
`,
    solutionCode: `import numpy as np

def ols_normal_equation(X, y):
    X = np.asarray(X, dtype=np.float64)
    y = np.asarray(y, dtype=np.float64)
    # Using pinv handles rank-deficient cases safely
    return np.linalg.pinv(X) @ y
`,
    hint: 'np.linalg.pinv(X) @ y directly solves the least squares objective cleanly.',
    testCasesDescription: 'Checks recovered slope and intercept on clean linear data with known coefficients.',
    xpReward: 100
  },
  {
    id: 'code_17',
    title: '17. Lasso Soft-Thresholding Operator',
    category: 'Optimization',
    difficulty: 'Hard',
    description: 'Implement `soft_threshold(v, lambda_val)` defined as sign(v) * max(0, |v| - lambda_val). Vectorized across NumPy arrays.',
    functionSignature: 'def soft_threshold(v, lambda_val):',
    starterCode: `import numpy as np

def soft_threshold(v, lambda_val):
    """
    Soft-thresholding operator S(v, lambda) for L1 proximal optimization.
    """
    # TODO: Implement vectorized soft-thresholding
    pass
`,
    solutionCode: `import numpy as np

def soft_threshold(v, lambda_val):
    v = np.asarray(v, dtype=np.float64)
    return np.sign(v) * np.maximum(0.0, np.abs(v) - lambda_val)
`,
    hint: 'Use np.sign(v) * np.maximum(0.0, np.abs(v) - lambda_val).',
    testCasesDescription: 'Tests values with magnitude less than lambda (set to 0.0) and values above lambda (shrunk toward 0).',
    xpReward: 100
  },
  {
    id: 'code_18',
    title: '18. Dense Layer Backpropagation',
    category: 'Deep Learning',
    difficulty: 'Hard',
    description: 'Implement `dense_backward(dout, X, W)` given upstream gradient dout (shape N, M), forward input X (shape N, D), and weights W (shape D, M). Return tuple `(dX, dW, db)`.',
    functionSignature: 'def dense_backward(dout, X, W):',
    starterCode: `import numpy as np

def dense_backward(dout, X, W):
    """
    Forward was: Out = X @ W + b
    Returns: (dX, dW, db)
    """
    # TODO: Compute gradients dX, dW, and db
    pass
`,
    solutionCode: `import numpy as np

def dense_backward(dout, X, W):
    dout = np.asarray(dout, dtype=np.float64)
    X = np.asarray(X, dtype=np.float64)
    W = np.asarray(W, dtype=np.float64)
    
    dX = dout @ W.T
    dW = X.T @ dout
    db = np.sum(dout, axis=0)
    return dX, dW, db
`,
    hint: 'dX = dout @ W.T, dW = X.T @ dout, db = np.sum(dout, axis=0).',
    testCasesDescription: 'Checks dimension consistency and exact analytic gradient values.',
    xpReward: 100
  },
  {
    id: 'code_19',
    title: '19. K-Means Centroid Recomputation',
    category: 'Clustering',
    difficulty: 'Hard',
    description: 'Implement `recompute_centroids(X, assignments, K)` computing the mean of all points assigned to each cluster k. If a cluster is empty, keep its old coordinates or set to zeros.',
    functionSignature: 'def recompute_centroids(X, assignments, K):',
    starterCode: `import numpy as np

def recompute_centroids(X, assignments, K):
    """
    X: shape (N, D)
    assignments: shape (N,) with values in 0..K-1
    Returns: new_centroids of shape (K, D)
    """
    # TODO: Recompute center of mass for each cluster k in 0..K-1
    pass
`,
    solutionCode: `import numpy as np

def recompute_centroids(X, assignments, K):
    X = np.asarray(X, dtype=np.float64)
    assignments = np.asarray(assignments)
    D = X.shape[1]
    new_centroids = np.zeros((K, D), dtype=np.float64)
    
    for k in range(K):
        cluster_points = X[assignments == k]
        if len(cluster_points) > 0:
            new_centroids[k] = np.mean(cluster_points, axis=0)
        else:
            new_centroids[k] = 0.0
    return new_centroids
`,
    hint: 'Iterate k through 0..K-1, filter X[assignments == k], and calculate np.mean(axis=0).',
    testCasesDescription: 'Tests correct mean calculation for multi-cluster point sets.',
    xpReward: 100
  },
  {
    id: 'code_20',
    title: '20. Scaled Dot-Product Attention',
    category: 'Transformers & LLMs',
    difficulty: 'Hard',
    description: 'Implement `scaled_dot_product_attention(Q, K, V)` where Attention = softmax(Q @ K^T / sqrt(d_k)) @ V. Q, K, V are matrices of shape (seq_len, d_k), (seq_len, d_k), (seq_len, d_v).',
    functionSignature: 'def scaled_dot_product_attention(Q, K, V):',
    starterCode: `import numpy as np

def scaled_dot_product_attention(Q, K, V):
    """
    Q: (seq_len, d_k)
    K: (seq_len, d_k)
    V: (seq_len, d_v)
    Returns: Output matrix of shape (seq_len, d_v)
    """
    # TODO: Implement Attention(Q, K, V) with scaling and stable softmax
    pass
`,
    solutionCode: `import numpy as np

def scaled_dot_product_attention(Q, K, V):
    Q = np.asarray(Q, dtype=np.float64)
    K = np.asarray(K, dtype=np.float64)
    V = np.asarray(V, dtype=np.float64)
    
    d_k = Q.shape[-1]
    scores = (Q @ K.T) / np.sqrt(d_k)
    
    # Numerically stable softmax along the last axis
    shift_scores = scores - np.max(scores, axis=-1, keepdims=True)
    exp_scores = np.exp(shift_scores)
    weights = exp_scores / np.sum(exp_scores, axis=-1, keepdims=True)
    
    return weights @ V
`,
    hint: 'scores = (Q @ K.T) / np.sqrt(d_k), apply stable softmax across rows, then multiply by V.',
    testCasesDescription: 'Verifies attention weights sum to 1.0 along rows and output dimension matches (seq_len, d_v).',
    xpReward: 100
  }
];

// ============================================================================
// STAGE 3: 20 DEBUGGING CHALLENGES
// ============================================================================
export const DEBUGGING_ASSESSMENTS: AssessmentDebuggingItem[] = [
  {
    id: 'debug_1',
    title: '1. Matrix Dimension Mismatch in Forward Pass',
    category: 'Deep Learning',
    difficulty: 'Easy',
    description: 'The author attempted to multiply input batch X (shape: N=100, D=8) with weight matrix W (shape: D=8, M=4), but mistakenly reversed the matrix operands, crashing runtime with ValueError: shapes (8,4) and (100,8) not aligned.',
    bugExplanation: 'Matrix multiplication order matters: W @ X was called instead of X @ W.',
    brokenCode: `import numpy as np

def forward_dense(X, W, b):
    # BUG: W @ X fails because dimensions are (8,4) x (100,8)
    out = W @ X + b
    return out
`,
    fixedCode: `import numpy as np

def forward_dense(X, W, b):
    # Corrected: X (100, 8) @ W (8, 4) produces (100, 4)
    out = X @ W + b
    return out
`,
    hint: 'Change W @ X to X @ W so inner dimensions (N, D) x (D, M) align.',
    testCasesDescription: 'Tests with X of shape (100, 8) and W of shape (8, 4) ensuring valid (100, 4) output.',
    xpReward: 100
  },
  {
    id: 'debug_2',
    title: '2. Inverted Gradient Descent Step',
    category: 'Optimization',
    difficulty: 'Easy',
    description: 'Instead of descending the loss gradient, the developer added the gradient to the weights (w += lr * grad), causing the loss to explode to infinity.',
    bugExplanation: 'Gradient descent requires subtracting the gradient (w -= lr * grad). Adding it causes gradient ascent.',
    brokenCode: `import numpy as np

def update_weights(w, grad, lr):
    # BUG: w += lr * grad causes gradient ascent
    w_updated = w + lr * grad
    return w_updated
`,
    fixedCode: `import numpy as np

def update_weights(w, grad, lr):
    # Corrected: subtract the gradient to minimize loss
    w_updated = w - lr * grad
    return w_updated
`,
    hint: 'Change + to - in the update step.',
    testCasesDescription: 'Validates that updating with positive gradient decreases parameter value.',
    xpReward: 100
  },
  {
    id: 'debug_3',
    title: '3. Softmax Overflow on Large Logits',
    category: 'Numerical Methods',
    difficulty: 'Easy',
    description: 'When logits contain values above 800 (e.g. z = 900), np.exp(z) produces inf, resulting in inf / inf = NaN.',
    bugExplanation: 'Missing max subtraction trick: subtracting np.max(z) from z before np.exp.',
    brokenCode: `import numpy as np

def softmax(z):
    # BUG: exp(900) overflows to +inf causing NaN outputs
    e_z = np.exp(z)
    return e_z / np.sum(e_z)
`,
    fixedCode: `import numpy as np

def softmax(z):
    # Corrected: subtract max(z) for numerical stability
    e_z = np.exp(z - np.max(z))
    return e_z / np.sum(e_z)
`,
    hint: 'Subtract np.max(z) from z inside np.exp().',
    testCasesDescription: 'Tests on z = [900, 950, 1000] ensuring finite probabilities that sum to 1.0.',
    xpReward: 100
  },
  {
    id: 'debug_4',
    title: '4. Data Leakage in Normalization Pipeline',
    category: 'Model Integrity',
    difficulty: 'Medium',
    description: 'The function fit_and_transform_data was computing mean and std across both train and test sets simultaneously, contaminating evaluation integrity.',
    bugExplanation: 'Mean and standard deviation must be computed ONLY on X_train and used to transform both.',
    brokenCode: `import numpy as np

def preprocess_splits(X_train, X_test):
    # BUG: Combined dataset computes mean and std over test set
    X_combined = np.vstack([X_train, X_test])
    mean = np.mean(X_combined, axis=0)
    std = np.std(X_combined, axis=0)
    return (X_train - mean) / std, (X_test - mean) / std
`,
    fixedCode: `import numpy as np

def preprocess_splits(X_train, X_test):
    # Corrected: Fit strictly on X_train only
    mean = np.mean(X_train, axis=0)
    std = np.std(X_train, axis=0)
    std[std == 0] = 1.0
    return (X_train - mean) / std, (X_test - mean) / std
`,
    hint: 'Compute mean and std using only X_train.',
    testCasesDescription: 'Ensures test set statistics do not influence the computed mean/std.',
    xpReward: 100
  },
  {
    id: 'debug_5',
    title: '5. Zero Division in F1-Score',
    category: 'Evaluation Metrics',
    difficulty: 'Easy',
    description: 'When precision + recall == 0 (e.g. model predicted zero positive cases), calculating 2 * (p * r) / (p + r) raises ZeroDivisionError.',
    bugExplanation: 'Missing check for precision + recall == 0.',
    brokenCode: `def compute_f1(precision, recall):
    # BUG: Crashes with ZeroDivisionError when precision = 0 and recall = 0
    return 2.0 * (precision * recall) / (precision + recall)
`,
    fixedCode: `def compute_f1(precision, recall):
    # Corrected: Return 0.0 when denominator is 0
    if precision + recall == 0:
        return 0.0
    return 2.0 * (precision * recall) / (precision + recall)
`,
    hint: 'Return 0.0 if precision + recall == 0.',
    testCasesDescription: 'Verifies precision=0 and recall=0 returns 0.0 without crashing.',
    xpReward: 100
  },
  {
    id: 'debug_6',
    title: '6. NaN Explosion from np.log(0) in BCE',
    category: 'Loss Functions',
    difficulty: 'Medium',
    description: 'When model outputs exact 0.0 or 1.0 predictions, np.log(0) evaluates to -inf, causing BCE to compute NaN.',
    bugExplanation: 'Missing np.clip on predictions to prevent log(0).',
    brokenCode: `import numpy as np

def cross_entropy(y_true, y_pred):
    # BUG: np.log(0.0) returns -inf, causing NaN outputs
    return -np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))
`,
    fixedCode: `import numpy as np

def cross_entropy(y_true, y_pred):
    # Corrected: Clip predictions to [1e-15, 1 - 1e-15]
    eps = 1e-15
    y_pred_clipped = np.clip(y_pred, eps, 1.0 - eps)
    return -np.mean(y_true * np.log(y_pred_clipped) + (1 - y_true) * np.log(1 - y_pred_clipped))
`,
    hint: 'Use np.clip(y_pred, 1e-15, 1 - 1e-15).',
    testCasesDescription: 'Verifies non-NaN output when y_pred contains exact zeros and ones.',
    xpReward: 100
  },
  {
    id: 'debug_7',
    title: '7. Missing Bias Column in Linear Regression',
    category: 'Linear Models',
    difficulty: 'Medium',
    description: 'The linear regression closed-form solver was failing to fit non-zero intercepts because it forgot to prepend a column of ones (bias column) to feature matrix X.',
    bugExplanation: 'Without a column of ones, the model is forced through the origin (0, 0).',
    brokenCode: `import numpy as np

def prepare_design_matrix(X):
    # BUG: Returns raw features without bias column of 1s
    return np.asarray(X, dtype=np.float64)
`,
    fixedCode: `import numpy as np

def prepare_design_matrix(X):
    # Corrected: Prepend column of ones for the intercept term
    X = np.asarray(X, dtype=np.float64)
    ones = np.ones((X.shape[0], 1), dtype=np.float64)
    return np.hstack([ones, X])
`,
    hint: 'Use np.hstack([np.ones((X.shape[0], 1)), X]).',
    testCasesDescription: 'Checks that output has X.shape[1] + 1 columns with first column all ones.',
    xpReward: 100
  },
  {
    id: 'debug_8',
    title: '8. Inverted Decision Tree Gini Formula',
    category: 'Tree Ensembles',
    difficulty: 'Easy',
    description: 'The engineer wrote Gini Impurity as 1 + sum(p^2) instead of 1 - sum(p^2), causing split evaluations to produce inverted impurity scores.',
    bugExplanation: 'Gini formula is 1.0 - sum(p**2).',
    brokenCode: `import numpy as np

def calculate_gini(probs):
    # BUG: Used addition instead of subtraction
    return 1.0 + np.sum(probs ** 2)
`,
    fixedCode: `import numpy as np

def calculate_gini(probs):
    # Corrected: Gini is 1 minus sum of squared probabilities
    return float(1.0 - np.sum(probs ** 2))
`,
    hint: 'Change 1.0 + to 1.0 -.',
    testCasesDescription: 'Checks [0.5, 0.5] yields 0.5 and [1.0, 0.0] yields 0.0.',
    xpReward: 100
  },
  {
    id: 'debug_9',
    title: '9. Unintended In-Place Array Mutation',
    category: 'Python Integrity',
    difficulty: 'Medium',
    description: 'An evaluation function modified the input array in-place with y *= 2, which corrupted the caller ground truth data for subsequent iterations.',
    bugExplanation: 'Mutating arguments in-place violates functional purity and corrupts data.',
    brokenCode: `import numpy as np

def scale_targets(y):
    # BUG: y *= 2 modifies the original array passed by caller
    y *= 2
    return y
`,
    fixedCode: `import numpy as np

def scale_targets(y):
    # Corrected: Create a copy before scaling
    return np.asarray(y, dtype=np.float64) * 2
`,
    hint: 'Return y * 2 without mutating y directly.',
    testCasesDescription: 'Validates original input array values remain unchanged after function call.',
    xpReward: 100
  },
  {
    id: 'debug_10',
    title: '10. 1D vs 2D Broadcasting Error in Loss',
    category: 'Linear Algebra',
    difficulty: 'Medium',
    description: 'y_true was shape (100,) while y_pred was shape (100, 1). Subtracting y_true - y_pred resulted in unintended (100, 100) outer subtraction matrix instead of (100,).',
    bugExplanation: 'Subtracting (100,) from (100, 1) triggers NumPy broadcasting to (100, 100). Both must be flattened or reshaped.',
    brokenCode: `import numpy as np

def compute_residual(y_true, y_pred):
    # BUG: Broadcasting creates (N, N) matrix when shapes are (N,) and (N, 1)
    return y_true - y_pred
`,
    fixedCode: `import numpy as np

def compute_residual(y_true, y_pred):
    # Corrected: Flatten both to 1D before subtraction
    return np.asarray(y_true).ravel() - np.asarray(y_pred).ravel()
`,
    hint: 'Use .ravel() on both arrays before subtraction.',
    testCasesDescription: 'Tests with (100,) and (100, 1) shapes; verifies output is strictly 1D (100,).',
    xpReward: 100
  },
  {
    id: 'debug_11',
    title: '11. K-Means Empty Cluster Crash',
    category: 'Clustering',
    difficulty: 'Hard',
    description: 'When recomputing centroids, if zero points were assigned to cluster k, dividing by count=0 caused NaN centroid coordinates.',
    bugExplanation: 'Must guard against empty cluster assignments by retaining previous centroid or setting to 0.',
    brokenCode: `import numpy as np

def update_single_centroid(points):
    # BUG: np.mean of empty slice produces NaN
    return np.mean(points, axis=0)
`,
    fixedCode: `import numpy as np

def update_single_centroid(points, fallback_centroid):
    # Corrected: Guard against empty cluster
    if len(points) == 0:
        return fallback_centroid
    return np.mean(points, axis=0)
`,
    hint: 'Check if len(points) == 0 and return fallback_centroid.',
    testCasesDescription: 'Verifies empty cluster returns fallback without NaN.',
    xpReward: 100
  },
  {
    id: 'debug_12',
    title: '12. Independent Shuffling of Features and Targets',
    category: 'Model Integrity',
    difficulty: 'Medium',
    description: 'The engineer shuffled X and y independently with separate permutation calls, breaking the correspondence between features and their ground-truth labels.',
    bugExplanation: 'A single permutation index array must be used to shuffle both X and y synchronously.',
    brokenCode: `import numpy as np

def shuffle_dataset(X, y):
    # BUG: Separate permutations destroy the X <-> y mapping
    X_shuffled = np.random.permutation(X)
    y_shuffled = np.random.permutation(y)
    return X_shuffled, y_shuffled
`,
    fixedCode: `import numpy as np

def shuffle_dataset(X, y):
    # Corrected: Use identical permutation indices
    p = np.random.permutation(len(X))
    return X[p], y[p]
`,
    hint: 'Generate one permutation array p = np.random.permutation(len(X)) and index both X[p] and y[p].',
    testCasesDescription: 'Checks that corresponding rows between X and y remain matched.',
    xpReward: 100
  },
  {
    id: 'debug_13',
    title: '13. Dropout Active During Inference Evaluation',
    category: 'Deep Learning',
    difficulty: 'Medium',
    description: 'The forward pass applied dropout unconditionally even when `training=False`, causing inference predictions to be random and non-deterministic.',
    bugExplanation: 'Dropout must be bypassed when training=False.',
    brokenCode: `import numpy as np

def apply_dropout(x, p_drop, training=True):
    # BUG: Drops units even when training is False
    mask = (np.random.rand(*x.shape) >= p_drop) / (1.0 - p_drop)
    return x * mask
`,
    fixedCode: `import numpy as np

def apply_dropout(x, p_drop, training=True):
    # Corrected: Return x untouched when training=False
    if not training or p_drop == 0.0:
        return x
    mask = (np.random.rand(*x.shape) >= p_drop) / (1.0 - p_drop)
    return x * mask
`,
    hint: 'Add `if not training: return x` before applying mask.',
    testCasesDescription: 'Verifies output equals input exactly when training=False.',
    xpReward: 100
  },
  {
    id: 'debug_14',
    title: '14. L2 Regularization Penalizing Bias Weight',
    category: 'Regularization',
    difficulty: 'Medium',
    description: 'In linear regression, regularizing the bias term b restricts the baseline target shift, harming model capacity.',
    bugExplanation: 'Bias term should not be penalized by L2 regularization.',
    brokenCode: `import numpy as np

def l2_penalty_with_bias(w, b, alpha):
    # BUG: Penalizes both weights w and bias b
    return alpha * (np.sum(w ** 2) + b ** 2)
`,
    fixedCode: `import numpy as np

def l2_penalty_with_bias(w, b, alpha):
    # Corrected: Only regularize weights w, do not penalize bias b
    return float(alpha * np.sum(w ** 2))
`,
    hint: 'Exclude b from the penalty sum: return alpha * np.sum(w ** 2).',
    testCasesDescription: 'Ensures changes to bias parameter b do not alter the penalty value.',
    xpReward: 100
  },
  {
    id: 'debug_15',
    title: '15. Missing Batch Normalization Factor in Gradient',
    category: 'Optimization',
    difficulty: 'Hard',
    description: 'The batch gradient descent function forgot to divide the error sum by batch size m (len(X)), making gradient magnitudes scale linearly with batch size and causing divergence on large batches.',
    bugExplanation: 'MSE gradient requires multiplying by 1/m: (1/m) * (X.T @ error).',
    brokenCode: `import numpy as np

def compute_mse_gradient(X, error):
    # BUG: Missing division by sample count m
    return X.T @ error
`,
    fixedCode: `import numpy as np

def compute_mse_gradient(X, error):
    # Corrected: Average gradient over sample count m
    m = X.shape[0]
    return (1.0 / m) * (X.T @ error)
`,
    hint: 'Divide the dot product by m = X.shape[0].',
    testCasesDescription: 'Checks gradient magnitude is invariant to duplicate sample batches.',
    xpReward: 100
  },
  {
    id: 'debug_16',
    title: '16. ReLU Derivative Sign Inversion',
    category: 'Deep Learning',
    difficulty: 'Easy',
    description: 'The ReLU backward function returned 1 for negative values and 0 for positive values, inverting the activation gradient.',
    bugExplanation: 'ReLU gradient should be 1.0 for x > 0 and 0.0 for x <= 0.',
    brokenCode: `import numpy as np

def relu_gradient(x):
    # BUG: Inverted logic: returns 1 for negative values
    return (x < 0).astype(float)
`,
    fixedCode: `import numpy as np

def relu_gradient(x):
    # Corrected: Returns 1 for positive values
    return (x > 0).astype(float)
`,
    hint: 'Change (x < 0) to (x > 0).',
    testCasesDescription: 'Verifies positive inputs receive gradient 1.0 and negative inputs receive gradient 0.0.',
    xpReward: 100
  },
  {
    id: 'debug_17',
    title: '17. Ridge Regularization Square Root Error',
    category: 'Regularization',
    difficulty: 'Easy',
    description: 'The developer computed L2 penalty using np.sqrt(np.sum(w)) instead of sum of squares np.sum(w**2).',
    bugExplanation: 'L2 Ridge penalty is sum of squares of weights (||w||_2^2 = sum(w_i^2)).',
    brokenCode: `import numpy as np

def ridge_penalty(w, alpha):
    # BUG: Used sqrt instead of squared weights
    return alpha * np.sqrt(np.sum(np.abs(w)))
`,
    fixedCode: `import numpy as np

def ridge_penalty(w, alpha):
    # Corrected: Sum of squared weights
    return float(alpha * np.sum(w ** 2))
`,
    hint: 'Replace with alpha * np.sum(w ** 2).',
    testCasesDescription: 'Checks penalty matches alpha * sum(w**2) for known vector.',
    xpReward: 100
  },
  {
    id: 'debug_18',
    title: '18. Unhandled Out-Of-Vocabulary Class in One-Hot',
    category: 'Feature Engineering',
    difficulty: 'Hard',
    description: 'A one-hot encoder crashed with IndexError when an unseen category index >= num_classes appeared in the test set.',
    bugExplanation: 'Indices must be checked or clipped, or assigned an unknown category column.',
    brokenCode: `import numpy as np

def one_hot_encode(indices, num_classes):
    # BUG: If index >= num_classes, crashes with IndexError
    out = np.zeros((len(indices), num_classes))
    for i, idx in enumerate(indices):
        out[i, idx] = 1.0
    return out
`,
    fixedCode: `import numpy as np

def one_hot_encode(indices, num_classes):
    # Corrected: Safely ignore out-of-bounds indices
    out = np.zeros((len(indices), num_classes), dtype=np.float64)
    for i, idx in enumerate(indices):
        if 0 <= idx < num_classes:
            out[i, idx] = 1.0
    return out
`,
    hint: 'Only set out[i, idx] = 1.0 if 0 <= idx < num_classes.',
    testCasesDescription: 'Ensures indices out of range [0, num_classes-1] do not crash and remain all-zeros vector.',
    xpReward: 100
  },
  {
    id: 'debug_19',
    title: '19. MSE Missing Averaging Division by N',
    category: 'Loss Functions',
    difficulty: 'Easy',
    description: 'The loss function computed sum of squared errors (SSE) instead of Mean Squared Error (MSE), causing the loss to scale up directly with batch size.',
    bugExplanation: 'Missing division by n: use np.mean instead of np.sum.',
    brokenCode: `import numpy as np

def mse(y_true, y_pred):
    # BUG: Returns sum instead of mean
    return np.sum((y_true - y_pred) ** 2)
`,
    fixedCode: `import numpy as np

def mse(y_true, y_pred):
    # Corrected: Use np.mean to compute average loss
    return float(np.mean((y_true - y_pred) ** 2))
`,
    hint: 'Change np.sum to np.mean.',
    testCasesDescription: 'Checks that error value is average per sample, not cumulative sum.',
    xpReward: 100
  },
  {
    id: 'debug_20',
    title: '20. Missing Scaling Factor in Attention',
    category: 'Transformers & LLMs',
    difficulty: 'Hard',
    description: 'The author calculated attention scores as Q @ K^T without dividing by sqrt(d_k), causing softmax saturation on high-dimensional vectors.',
    bugExplanation: 'Scaled dot-product attention requires dividing by np.sqrt(d_k) where d_k = Q.shape[-1].',
    brokenCode: `import numpy as np

def compute_attention_scores(Q, K):
    # BUG: Unscaled dot product causes softmax saturation
    return Q @ K.T
`,
    fixedCode: `import numpy as np

def compute_attention_scores(Q, K):
    # Corrected: Scale by sqrt(d_k)
    d_k = Q.shape[-1]
    return (Q @ K.T) / np.sqrt(d_k)
`,
    hint: 'Divide by np.sqrt(Q.shape[-1]).',
    testCasesDescription: 'Checks score scaling factor is exactly 1 / sqrt(d_k).',
    xpReward: 100
  }
];

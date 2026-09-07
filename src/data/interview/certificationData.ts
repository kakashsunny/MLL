export interface QuizQuestion {
  id: string;
  question: string;
  category: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  starterCode: string;
  solutionCode: string;
  testCases: { inputDescription: string; expectedOutput: string }[];
  explanation: string;
}

export interface DebugScenario {
  id: string;
  title: string;
  difficulty: 'Medium' | 'Hard';
  brokenCode: string;
  bugDescription: string;
  bugCategory: 'Data Leakage' | 'Shape Mismatch' | 'Metric Misuse' | 'Numerical Instability' | 'Lookahead Bias';
  fixedCode: string;
  explanation: string;
}

export const CERTIFICATION_QUIZ: QuizQuestion[] = [
  {
    id: 'quiz_01',
    question: 'Why does L1 regularization tend to produce sparse weight vectors with exact zeros, while L2 regularization does not?',
    category: 'Regularization & Math',
    options: [
      'L1 penalty derivative is constant (+1 or -1) even near zero, and its constraint boundary has sharp corners on coordinate axes.',
      'L1 regularization uses an exponential prior distribution that forces all negative weights to zero.',
      'L2 regularization is mathematically equivalent to L1 when learning rate is less than 0.01.',
      'L1 regularization computes gradients using second-order Hessian matrices.'
    ],
    correctIndex: 0,
    explanation: 'The L1 diamond constraint boundary intersects elliptical loss contours at coordinate axes vertices where parameters equal zero. L1 gradient also does not decay as weights approach zero.'
  },
  {
    id: 'quiz_02',
    question: 'When evaluating a fraud detection model with a positive class prevalence of 0.05%, which evaluation metric is MOST informative?',
    category: 'Model Evaluation',
    options: [
      'Accuracy score, because 99.95% accuracy proves high reliability.',
      'Precision-Recall AUC (PR-AUC), because it focuses on minority class true positives vs false alarms without True Negatives inflating the score.',
      'ROC-AUC, because True Negatives depress the False Positive Rate to near zero.',
      'Mean Squared Error between target classes.'
    ],
    correctIndex: 1,
    explanation: 'In severe imbalance, ROC-AUC is misleadingly high because massive True Negatives dwarf False Positives in FPR. PR-AUC directly compares Precision vs Recall.'
  },
  {
    id: 'quiz_03',
    question: 'What is the primary cause of Data Leakage when calculating Target Encoding?',
    category: 'Feature Engineering',
    options: [
      'Using float32 instead of float64 to compute category averages.',
      'Computing target means across the entire dataset before splitting into training and validation folds.',
      'Encoding categories with more than 10 distinct levels.',
      'Normalizing the target variable with MinMaxScaler.'
    ],
    correctIndex: 1,
    explanation: 'Computing target encodings globally incorporates target values from validation and test sets into feature values, creating direct label leakage.'
  },
  {
    id: 'quiz_04',
    question: 'How does XGBoost determine the optimal weight for a tree leaf node?',
    category: 'Ensemble Learning',
    options: [
      'By taking the simple arithmetic mean of training residuals in that leaf.',
      'Analytically via second-order Taylor expansion: w = - sum(g_i) / (sum(h_i) + lambda).',
      'By running 100 gradient descent steps exclusively on the samples in that leaf.',
      'Using the Gini impurity of the parent node.'
    ],
    correctIndex: 1,
    explanation: 'XGBoost uses second-order Taylor expansion where optimal leaf weight w* = -G / (H + lambda), where G is sum of first gradients and H is sum of Hessians.'
  },
  {
    id: 'quiz_05',
    question: 'Why does K-Fold cross-validation fail on time-series price forecasting?',
    category: 'Validation Strategy',
    options: [
      'Because time series data cannot be converted into NumPy arrays.',
      'Because random shuffling trains models on future data points to predict past data points (lookahead leakage).',
      'Because time series data always requires exactly 10 folds.',
      'Because mean squared error cannot be calculated across multiple folds.'
    ],
    correctIndex: 1,
    explanation: 'Random shuffling violates temporal causality and leaks autocorrelation and future trends into past training instances. Use TimeSeriesSplit instead.'
  },
  {
    id: 'quiz_06',
    question: 'In Deep Neural Networks, what is the Dying ReLU problem?',
    category: 'Deep Learning',
    options: [
      'When weights explode to infinity due to a high learning rate.',
      'When neurons output negative values for all inputs, causing gradients to become permanently zero.',
      'When backpropagation takes longer than 24 hours on GPU hardware.',
      'When the softmax denominator evaluates to zero.'
    ],
    correctIndex: 1,
    explanation: 'For x <= 0, the derivative of ReLU is 0. If a large gradient updates weights such that the neuron never activates positively on any training sample, its gradient stays permanently zero.'
  },
  {
    id: 'quiz_07',
    question: 'What is the main computational bottleneck that FlashAttention resolves in Transformers?',
    category: 'Transformers & LLMs',
    options: [
      'High GPU memory bandwidth overhead from repeatedly reading and writing the N x N attention matrix to High Bandwidth Memory (HBM).',
      'Slow matrix multiplication algorithms inside CUDA cores.',
      'Overfitting caused by multi-head attention layers.',
      'Tokenization latency in Python pre-processing.'
    ],
    correctIndex: 0,
    explanation: 'FlashAttention is IO-aware: it computes Softmax incrementally inside fast GPU SRAM using tiling, completely bypassing writing the full N x N matrix to HBM.'
  },
  {
    id: 'quiz_08',
    question: 'Which of the following conditions is required for Mercer Theorem to guarantee a valid SVM kernel?',
    category: 'ML Algorithms',
    options: [
      'The kernel matrix must be asymmetric and strictly diagonal.',
      'The kernel function K(x, z) must be continuous, symmetric, and positive semi-definite.',
      'The kernel function must be bounded strictly between -1 and 0.',
      'The feature space must have fewer than 10 dimensions.'
    ],
    correctIndex: 1,
    explanation: 'Mercer theorem states that any continuous, symmetric, positive semi-definite kernel function corresponds to an inner product in some Hilbert feature space.'
  },
  {
    id: 'quiz_09',
    question: 'In Random Forest, what is the theoretical fraction of training samples that remain Out-of-Bag (OOB) per tree?',
    category: 'Ensemble Learning',
    options: [
      'Exactly 50.0%.',
      'Approximately (1 - 1/N)^N as N approaches infinity, which equals approximately 1/e (approx 36.8%).',
      'Exactly 0% because Random Forest trains on all samples.',
      'Approximately 10% based on K-Fold logic.'
    ],
    correctIndex: 1,
    explanation: 'With bootstrap sampling (drawing N samples with replacement from N items), the probability of an item not being chosen is (1 - 1/N)^N -> 1/e approx 36.8%.'
  },
  {
    id: 'quiz_10',
    question: 'What is the key difference between Covariate Shift and Concept Drift?',
    category: 'MLOps & Monitoring',
    options: [
      'Covariate shift is P(X) changing while P(Y|X) stays fixed; Concept drift is P(Y|X) changing.',
      'Covariate shift only happens in computer vision; Concept drift only happens in NLP.',
      'Covariate shift means the target variable disappears from the database.',
      'Concept drift occurs when training loss evaluates to NaN.'
    ],
    correctIndex: 0,
    explanation: 'In Covariate Shift, the input feature distribution P(X) shifts while the true mapping P(Y|X) remains constant. In Concept Drift, the relationship P(Y|X) itself changes.'
  }
];

export const CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: 'code_01',
    title: 'Implement Vectorized Euclidean Distance Matrix in NumPy',
    difficulty: 'Medium',
    category: 'NumPy & Linear Algebra',
    description: 'Compute the pairwise Euclidean distance matrix between two 2D matrices X of shape (N, D) and Y of shape (M, D) with ZERO Python for-loops using the identity ||x - y||^2 = ||x||^2 + ||y||^2 - 2 * x^T y.',
    starterCode: `import numpy as np

def pairwise_distances(X: np.ndarray, Y: np.ndarray) -> np.ndarray:
    # X shape: (N, D), Y shape: (M, D)
    # Output: (N, M) matrix of pairwise Euclidean distances
    # STRICT RULE: Zero Python for-loops allowed
    pass`,
    solutionCode: `import numpy as np

def pairwise_distances(X: np.ndarray, Y: np.ndarray) -> np.ndarray:
    # ||x - y||^2 = ||x||^2 - 2(x @ y.T) + ||y||^2
    x_norm_sq = np.sum(X ** 2, axis=1, keepdims=True)  # (N, 1)
    y_norm_sq = np.sum(Y ** 2, axis=1, keepdims=True).T # (1, M)
    cross_term = 2 * (X @ Y.T)                         # (N, M)
    
    sq_dist = x_norm_sq - cross_term + y_norm_sq
    # Numerical guard: clamp negative floats to zero before sqrt
    sq_dist = np.maximum(sq_dist, 0.0)
    return np.sqrt(sq_dist)`,
    testCases: [
      { inputDescription: 'X: (3, 2), Y: (4, 2)', expectedOutput: 'Shape (3, 4) with zero distance on self-points' }
    ],
    explanation: 'Uses quadratic expansion and broadcasting to achieve O(N*M*D) C-speed computation with zero Python loop overhead.'
  },
  {
    id: 'code_02',
    title: 'Implement Out-of-Fold Target Encoder with Smoothing',
    difficulty: 'Hard',
    category: 'Feature Engineering',
    description: 'Build a leak-free categorical target encoder that calculates smoothed out-of-fold target averages across K cross-validation splits.',
    starterCode: `import numpy as np
import pandas as pd
from sklearn.model_selection import KFold

def out_of_fold_target_encode(df: pd.DataFrame, cat_col: str, target_col: str, m_smoothing: float = 10.0, n_splits: int = 5) -> np.ndarray:
    # Return encoded 1D numpy array with ZERO target leakage
    pass`,
    solutionCode: `import numpy as np
import pandas as pd
from sklearn.model_selection import KFold

def out_of_fold_target_encode(df: pd.DataFrame, cat_col: str, target_col: str, m_smoothing: float = 10.0, n_splits: int = 5) -> np.ndarray:
    encoded = np.zeros(len(df), dtype=np.float64)
    global_mean = df[target_col].mean()
    kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)
    
    for train_idx, val_idx in kf.split(df):
        train_fold = df.iloc[train_idx]
        val_fold = df.iloc[val_idx]
        
        # Compute category stats on train fold ONLY
        stats = train_fold.groupby(cat_col)[target_col].agg(['count', 'mean'])
        counts = stats['count']
        means = stats['mean']
        
        # Empirical Bayes m-estimate smoothing
        smoothed = (counts * means + m_smoothing * global_mean) / (counts + m_smoothing)
        
        # Map onto validation fold; fill unseen categories with global_mean
        val_encoded = val_fold[cat_col].map(smoothed).fillna(global_mean)
        encoded[val_idx] = val_encoded.values
        
    return encoded`,
    testCases: [
      { inputDescription: 'DataFrame with categorical column and binary target', expectedOutput: 'Array of smoothed out-of-fold target averages' }
    ],
    explanation: 'Out-of-fold encoding strictly calculates target statistics on the training partition of each fold, completely eliminating target leakage.'
  }
];

export const DEBUG_SCENARIOS: DebugScenario[] = [
  {
    id: 'debug_01',
    title: 'The Catastrophic Train-Test Preprocessing Leak',
    difficulty: 'Medium',
    bugCategory: 'Data Leakage',
    brokenCode: `from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

# BROKEN PIPELINE:
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X) # <--- CRITICAL BUG

X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2)
clf = LogisticRegression()
clf.fit(X_train, y_train)`,
    bugDescription: 'Fitting the scaler on the full dataset before splitting leaks the test set mean and standard deviation into the training features.',
    fixedCode: `from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Fit scaler strictly on X_train via Pipeline:
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('clf', LogisticRegression())
])
pipe.fit(X_train, y_train)
score = pipe.score(X_test, y_test)`,
    explanation: 'Wrapping the transformer and model in a Pipeline ensures that the scaler is fitted strictly on X_train during training, and merely transformed on X_test.'
  },
  {
    id: 'debug_02',
    title: 'The Uncalibrated Softmax Temperature NaN Collapse',
    difficulty: 'Hard',
    bugCategory: 'Numerical Instability',
    brokenCode: `import numpy as np

def unnormalized_softmax(logits):
    # BROKEN SOFTMAX:
    exp_vals = np.exp(logits) # <--- Overflow to inf for logits > 710!
    return exp_vals / np.sum(exp_vals, axis=-1, keepdims=True)`,
    bugDescription: 'When logits exceed ~709 in float64, np.exp(logits) overflows to infinity (inf), producing NaN values during division.',
    fixedCode: `import numpy as np

def stable_softmax(logits):
    # Subtract maximum logit per row to bound exponent to <= 0:
    max_logits = np.max(logits, axis=-1, keepdims=True)
    exp_vals = np.exp(logits - max_logits)
    return exp_vals / np.sum(exp_vals, axis=-1, keepdims=True)`,
    explanation: 'Subtracting max(logits) exploits the mathematical invariance softmax(x) = softmax(x - c). The maximum input to np.exp becomes 0, guaranteeing exp <= 1.0 and preventing overflow.'
  }
];

export const CERTIFICATION_CRITERIA = {
  courseName: 'Certified Professional Machine Learning Engineer (CP-MLE)',
  issuer: 'Founder Forge AI',
  organization: 'Sunny Organization',
  foundedBy: 'K. Akash',
  passingScore: 75, // 75% overall passing threshold
  weights: {
    quiz: 0.4,
    coding: 0.35,
    debugging: 0.25
  }
};

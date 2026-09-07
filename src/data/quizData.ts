import { QuizQuestion } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'quiz_daily_01',
    category: 'Model Evaluation',
    type: 'scenario',
    question: 'You trained a binary classifier and obtained 99.1% training accuracy, but test accuracy dropped to 62.4%. What phenomenon are you observing?',
    options: [
      'A. Severe Underfitting (High Bias)',
      'B. Severe Overfitting (High Variance)',
      'C. Data normalization artifact',
      'D. Optimal Bayesian Generalization'
    ],
    correctAnswer: 1,
    whyExplanation: 'A wide divergence between near-perfect in-sample training accuracy (99.1%) and lackluster out-of-sample test accuracy (62.4%) is the textbook symptom of high variance (overfitting), indicating the model memorized idiosyncrasies of the training samples.',
    commonMisconception: 'Many beginners assume that a model with 99% accuracy is inherently great. In reality, without a held-out test set or cross-validation evaluation, training accuracy is completely uninformative.',
    expertInsight: 'Immediate mitigations include increasing L2 regularization, applying Dropout (in deep nets), pruning tree depth, or gathering more diverse data samples.'
  },
  {
    id: 'quiz_code_01',
    category: 'Code Prediction',
    type: 'code_prediction',
    question: 'Review the following Python snippet. What will be the output or behavior?',
    codeSnippet: `from sklearn.linear_model import Ridge
import numpy as np

X = np.array([[1.0], [2.0], [3.0]])
y = np.array([2.0, 4.0, 6.0])

# As alpha -> infinity in Ridge regression
model = Ridge(alpha=1e12)
model.fit(X, y)
print(np.round(model.coef_[0], 4))`,
    options: [
      'A. 2.0000 (Exact true slope)',
      'B. 0.0000 (Weights penalized toward zero)',
      'C. 1e12 (Overflow exception)',
      'D. NaN (Numerical breakdown)'
    ],
    correctAnswer: 1,
    whyExplanation: 'In Ridge regression, the penalty term is λ * ||w||_2^2. When alpha (λ) approaches infinity, the penalty dwarfs the MSE loss term, forcing the optimization to drive the coefficients w to virtually 0.0000.',
    commonMisconception: 'Assuming higher alpha increases the size of the coefficients. Alpha is the penalty factor on weight magnitude; larger alpha shrinks weights toward zero.',
    expertInsight: 'When alpha -> ∞, the model degenerates into a flat constant line predicting the mean of y for all inputs.'
  },
  {
    id: 'quiz_visual_01',
    category: 'Visual Interpretation',
    type: 'visual_interpretation',
    question: 'In a K-Means clustering run on a 2D scatter plot, you observe the Elbow Method graph of inertia (within-cluster sum of squares) vs K flattening out sharply at K=3. What does this elbow point signify?',
    options: [
      'A. K=3 is the point of diminishing returns where adding more clusters yields marginal variance reduction',
      'B. K=3 has zero inertia',
      'C. The algorithm stopped converging',
      'D. The dataset only contains 3 data points'
    ],
    correctAnswer: 0,
    whyExplanation: 'The elbow heuristic identifies the parsimonious sweet spot where adding more clusters begins to fit random intra-cluster noise rather than discovering distinct multimodal distributions.',
    commonMisconception: 'Thinking that the optimal K is where inertia reaches 0. Inertia always hits 0 when K = N (each point is its own cluster), which is useless.',
    expertInsight: 'Combine the Elbow Method with the Silhouette Score (which balances cluster cohesion against separation) for unambiguous model selection.'
  },
  {
    id: 'quiz_debug_01',
    category: 'Debugging',
    type: 'debugging',
    question: 'A junior engineer deployed the following pipeline and discovered test accuracy dropped from 94% in local Jupyter notebook to 51% in production. What critical bug is present?',
    codeSnippet: `from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X) # <-- Look here!

X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2)`,
    options: [
      'A. StandardScaler cannot process 2D matrices',
      'B. Data leakage: scaler calculated mean & variance across the entire dataset before splitting',
      'C. test_size must always be 0.5',
      'D. train_test_split requires integer labels'
    ],
    correctAnswer: 1,
    whyExplanation: 'By calling fit_transform on the whole dataset X before train_test_split, the mean and standard deviation of the test set leaked into the training representation. In production on true unseen data, the model degrades because the leaked statistics are absent.',
    commonMisconception: 'Believing preprocessing is separate from modeling. All transformations (imputation, scaling, encoding) are parameter estimations that MUST be fitted only on training data.',
    expertInsight: 'Always encapsulate transformers and estimators inside a `sklearn.pipeline.Pipeline` or `ColumnTransformer` to prevent leakage mathematically.'
  },
  {
    id: 'quiz_metrics_01',
    category: 'Model Evaluation',
    type: 'scenario',
    question: 'You are designing a fraud detection model for a bank where only 0.05% of transactions are fraudulent. The business team demands you report Model Accuracy. How should you respond?',
    options: [
      'A. Agree, because 99.95% accuracy proves the model works well',
      'B. Refuse and substitute Precision-Recall AUC (PR-AUC), because a dummy classifier predicting "No Fraud" achieves 99.95% accuracy while catching zero fraud',
      'C. Recommend Mean Squared Error instead',
      'D. Recommend K-Means clustering'
    ],
    correctAnswer: 1,
    whyExplanation: 'In extreme class imbalance (99.95% negative class), standard accuracy is deceptive. A trivial majority-class classifier scores 99.95% accuracy with a 0% fraud recall rate. PR-AUC and Recall at fixed False Positive Rates are the true operational metrics.',
    commonMisconception: 'Equating accuracy with business success without checking class distribution.',
    expertInsight: 'In banking, optimize for Recall at a strict False Positive constraint (e.g. max 1% customer friction rate).'
  }
];

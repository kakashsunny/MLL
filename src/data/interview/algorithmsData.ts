import { MLAlgorithmDeepDive } from './types';

export const ML_ALGORITHMS_DATA: MLAlgorithmDeepDive[] = [
  {
    id: 'algo_linear_regression',
    name: 'Linear Regression (OLS)',
    category: 'Supervised',
    whatItIs: 'A foundational supervised regression algorithm that models the linear relationship between a continuous scalar response y and one or more explanatory feature variables X.',
    howItWorks: 'The model estimates coefficients w and intercept b such that y_pred = X*w + b. It minimizes the Residual Sum of Squares (RSS) between true and predicted targets. Can be solved analytically via the Normal Equation w = (X^T X)^(-1) X^T y, or iteratively using Gradient Descent.',
    mathematicalIntuition: 'Geometrically, Ordinary Least Squares (OLS) orthogonalizes the error vector (y - Xw) against the column space span(X). The prediction y_hat is the orthogonal projection of vector y onto the subspace spanned by the feature columns.',
    formulas: [
      { name: 'Model Hypothesis', formula: 'y = Xw + b + epsilon', explanation: 'Assumes linear relationship with zero-mean Gaussian noise epsilon.' },
      { name: 'Cost Function (MSE)', formula: 'J(w) = (1 / 2N) * sum((y_i - (w^T x_i + b))^2)', explanation: 'Mean squared error penalizing large residuals quadratically.' },
      { name: 'Normal Equation', formula: 'w = (X^T X)^(-1) X^T y', explanation: 'Closed-form analytical solution when X^T X is invertible.' }
    ],
    advantages: [
      'Simple, highly interpretable coefficients with explicit economic/physical meaning.',
      'Extremely fast training and microsecond inference latency in production.',
      'Closed-form exact solution available without tuning hyperparameter iterations.',
      'Provides statistical significance tests (t-stats, p-values, confidence intervals).'
    ],
    disadvantages: [
      'Assumes strict linearity between features and targets.',
      'Highly sensitive to outliers because squaring residuals magnifies large errors.',
      'Prone to multicollinearity, which inflates parameter variance and destabilizes interpretation.',
      'Cannot capture complex feature interactions without manual polynomial expansion.'
    ],
    whenToUse: [
      'When baseline simplicity, interpretability, and low latency are paramount.',
      'When the relationship between features and target is known to be predominantly linear.',
      'When regulatory or compliance requirements mandate transparent coefficient attribution.'
    ],
    whenNotToUse: [
      'When complex non-linear patterns or multi-modal feature interactions dominate.',
      'When high-dimensional sparse data causes X^T X to become singular or rank-deficient.'
    ],
    hyperparameters: [
      { name: 'fit_intercept', defaultVal: 'True', impact: 'Whether to calculate the bias offset b.' },
      { name: 'copy_X', defaultVal: 'True', impact: 'If False, overwrites input matrix X in place to conserve memory.' }
    ],
    commonMistakes: [
      'Failing to check residual plots for heteroscedasticity or non-linear curvature.',
      'Including perfectly collinear features (e.g., both Celsius and Fahrenheit), causing matrix singularity.',
      'Assuming high R-squared proves causal relationships between features and outcome.'
    ],
    interviewQuestions: [
      'What are the 5 Gauss-Markov assumptions for OLS to be BLUE (Best Linear Unbiased Estimator)?',
      'What happens when X^T X is not invertible and how does Ridge regression solve it?',
      'Why does Ordinary Least Squares minimize vertical residuals rather than perpendicular Euclidean distances?'
    ],
    realWorldExample: 'Predicting quarterly energy consumption for commercial buildings based on square footage, external temperature, and operating hours.',
    pythonImplementation: `from sklearn.linear_model import LinearRegression
import numpy as np

# Instantiate and fit
model = LinearRegression(fit_intercept=True)
model.fit(X_train, y_train)

# Inspect weights
print("Weights:", model.coef_)
print("Intercept:", model.intercept_)

# Predict
predictions = model.predict(X_test)`,
    howToImprovePerformance: [
      'Apply Log or Box-Cox transformations to right-skewed target variables and continuous features.',
      'Remove high-VIF multicollinear features or apply L2 Ridge regularization.',
      'Identify and Winsorize or remove high-leverage Cook distance outliers.'
    ]
  },
  {
    id: 'algo_logistic_regression',
    name: 'Logistic Regression',
    category: 'Supervised',
    whatItIs: 'A linear classification model that estimates the probability of binary or multi-class outcomes by passing a linear combination of features through a Sigmoid (or Softmax) function.',
    howItWorks: 'Calculates log-odds z = w^T x + b, then maps z to the range (0, 1) via the Sigmoid function sigma(z) = 1 / (1 + exp(-z)). Output represents P(Y=1|X). Trained using Maximum Likelihood Estimation via Binary Cross-Entropy loss optimized with gradient descent or L-BFGS.',
    mathematicalIntuition: 'Models the logarithm of the odds ratio ln(p / (1-p)) as a linear hyperplane. The decision boundary where p = 0.5 corresponds to the linear plane w^T x + b = 0.',
    formulas: [
      { name: 'Sigmoid Function', formula: 'sigma(z) = 1 / (1 + exp(-z))', explanation: 'Maps real line (-inf, +inf) to probability interval (0, 1).' },
      { name: 'Log-Odds Formulation', formula: 'ln(p / (1 - p)) = w^T x + b', explanation: 'Linear combination of features equals the logit (log-odds).' },
      { name: 'Binary Cross-Entropy Loss', formula: 'L(w) = -(1/N) * sum[ y * ln(p) + (1-y) * ln(1-p) ]', explanation: 'Convex negative log-likelihood function.' }
    ],
    advantages: [
      'Outputs well-calibrated probabilities, not just binary classifications.',
      'Computationally fast to train and serve with minimal memory footprint.',
      'Coefficients can be directly exponentiated into odds ratios for clear interpretability.',
      'Convex loss surface guarantees convergence to a global minimum.'
    ],
    disadvantages: [
      'Linear decision boundary cannot separate non-linearly separable classes without feature transformation.',
      'Sensitive to outliers and extreme values.',
      'Struggles when feature count is much greater than sample count without heavy regularization.'
    ],
    whenToUse: [
      'Binary or multi-class classification baselines.',
      'Applications where probability calibration and transparent odds ratios are required (credit scoring, medicine).',
      'Ultra-high-throughput inference services requiring sub-millisecond response times.'
    ],
    whenNotToUse: [
      'Complex tabular or perception tasks where non-linear decision surfaces dominate.'
    ],
    hyperparameters: [
      { name: 'C', defaultVal: '1.0', impact: 'Inverse regularization strength: smaller C increases penalty, reducing overfitting.' },
      { name: 'penalty', defaultVal: '"l2"', impact: 'Chooses regularization type: "l1", "l2", "elasticnet", or None.' },
      { name: 'solver', defaultVal: '"lbfgs"', impact: 'Optimization solver: "lbfgs" for small/medium dense, "saga" for large/sparse L1/ElasticNet.' }
    ],
    commonMistakes: [
      'Interpreting Logistic Regression as a regression algorithm instead of a classification algorithm.',
      'Using the default 0.5 decision threshold on severely imbalanced datasets.',
      'Omitting feature standardization when using L1 or L2 regularization penalties.'
    ],
    interviewQuestions: [
      'Why is MSE not used as the loss function for Logistic Regression?',
      'How does the odds ratio change when a continuous feature increases by 1 unit?',
      'What is the difference between One-vs-Rest and Multinomial Softmax in multi-class Logistic Regression?'
    ],
    realWorldExample: 'Calculating the default risk probability of a loan applicant based on credit score, debt-to-income ratio, and credit inquiries.',
    pythonImplementation: `from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

pipe = make_pipeline(StandardScaler(), LogisticRegression(C=1.0, penalty='l2', solver='lbfgs'))
pipe.fit(X_train, y_train)

# Probability predictions
prob_positive = pipe.predict_proba(X_test)[:, 1]`,
    howToImprovePerformance: [
      'Tune classification threshold using Precision-Recall curve to optimize for business objective.',
      'Engineer interaction terms and polynomial features to introduce non-linear decision boundaries.',
      'Calibrate output probabilities using CalibratedClassifierCV with Platt scaling or isotonic regression.'
    ]
  },
  {
    id: 'algo_random_forest',
    name: 'Random Forest',
    category: 'Ensemble',
    whatItIs: 'A bagging ensemble of decorrelated deep decision trees trained on bootstrap samples with random feature subspace sampling at each split.',
    howItWorks: 'Draws B bootstrap samples (with replacement) from the training set. Trains an unpruned, deep decision tree on each bootstrap sample. At every node split, only a random subset of m features (typically sqrt(p) for classification, p/3 for regression) is considered. Aggregates predictions across all trees via majority voting or averaging.',
    mathematicalIntuition: 'Averaging B identically distributed trees with variance sigma^2 and pairwise correlation rho yields ensemble variance rho*sigma^2 + (1-rho)/B * sigma^2. Random feature selection reduces tree correlation rho, driving ensemble variance lower without increasing individual tree bias.',
    formulas: [
      { name: 'Ensemble Variance', formula: 'Var = rho * sigma^2 + ((1 - rho) / B) * sigma^2', explanation: 'As B approaches infinity, variance approaches rho * sigma^2.' },
      { name: 'Out-Of-Bag Error', formula: 'P(not selected) = (1 - 1/N)^N approx 1/e approx 0.368', explanation: '36.8% of samples are unused per tree, serving as a free validation set.' }
    ],
    advantages: [
      'High accuracy out-of-the-box on tabular data with minimal hyperparameter tuning.',
      'Scale-invariant: requires no feature normalization or standardization.',
      'Built-in Out-of-Bag (OOB) error estimate eliminates the need for a separate validation split.',
      'Provides natural feature importance rankings based on Mean Decrease in Impurity (MDI).'
    ],
    disadvantages: [
      'Larger model size and slower inference speed than linear models or single decision trees.',
      'Cannot extrapolate outside the range of training numerical values for regression.',
      'Default MDI feature importance is biased toward high-cardinality categorical features.'
    ],
    whenToUse: [
      'Tabular classification and regression benchmarks where robust baseline performance is needed.',
      'Datasets with noisy or non-linear features and mixed numerical/categorical attributes.'
    ],
    whenNotToUse: [
      'Ultra-low-latency real-time scoring where tree traversals across 500 trees exceed latency SLA.',
      'High-dimensional sparse text data where linear models or neural representations excel.'
    ],
    hyperparameters: [
      { name: 'n_estimators', defaultVal: '100', impact: 'Number of trees. More trees reduce variance without risk of overfitting.' },
      { name: 'max_features', defaultVal: '"sqrt"', impact: 'Subsampled features per split. Lower values decorrelate trees further.' },
      { name: 'max_depth', defaultVal: 'None', impact: 'Limits tree depth to control individual tree variance and memory footprint.' },
      { name: 'min_samples_leaf', defaultVal: '1', impact: 'Minimum samples required at a leaf node; higher values smooth predictions.' }
    ],
    commonMistakes: [
      'Assuming increasing n_estimators causes overfitting; adding trees only reduces variance.',
      'Relying solely on impurity-based feature importance on high-cardinality features.',
      'Expecting Random Forest to extrapolate linear trends in time-series forecasting.'
    ],
    interviewQuestions: [
      'Why does Random Forest select a random subset of features at each split instead of using all features?',
      'How does Out-of-Bag (OOB) error work mathematically and what proportion of data is OOB?',
      'Can Random Forest overfit as the number of trees approaches infinity?'
    ],
    realWorldExample: 'Predicting customer churn for a telecom company using demographic, call record, and payment history features.',
    pythonImplementation: `from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(
    n_estimators=300,
    max_features='sqrt',
    min_samples_leaf=2,
    oob_score=True,
    n_jobs=-1,
    random_state=42
)
rf.fit(X_train, y_train)
print("OOB Score:", rf.oob_score_)`,
    howToImprovePerformance: [
      'Tune min_samples_leaf and max_features using cross-validation to optimize decorrelation.',
      'Calculate Permutation Feature Importance rather than default MDI to avoid cardinality bias.',
      'Prune unnecessary trees or use tree quantization (e.g. Treelite) to reduce inference latency.'
    ]
  },
  {
    id: 'algo_xgboost',
    name: 'XGBoost (Extreme Gradient Boosting)',
    category: 'Ensemble',
    whatItIs: 'An optimized distributed gradient boosting library implementing second-order Taylor expansions, exact and approximate histogram splitters, and built-in tree regularization.',
    howItWorks: 'Builds shallow trees sequentially. Each tree fits the negative gradient and Hessian of the loss function with respect to current ensemble predictions. Nodes are split to maximize Gain, incorporating L1 (alpha) and L2 (lambda) regularization penalties directly on leaf weights.',
    mathematicalIntuition: 'Approximates the loss objective via second-order Taylor expansion: L_t approx sum[ g_i * f_t(x_i) + 0.5 * h_i * f_t(x_i)^2 ] + Omega(f_t), where g_i is the first derivative (gradient) and h_i is the second derivative (Hessian). This analytical parabolic approximation yields exact optimal leaf weight solutions.',
    formulas: [
      { name: 'Optimal Leaf Weight', formula: 'w_j^* = - sum(g_i) / (sum(h_i) + lambda)', explanation: 'Exact analytical weight for leaf j, regularized by lambda.' },
      { name: 'Gain Split Metric', formula: 'Gain = 0.5 * [ (G_L^2 / (H_L + lambda)) + (G_R^2 / (H_R + lambda)) - (G^2 / (H + lambda)) ] - gamma', explanation: 'Improvement in loss from splitting a node into left and right children.' }
    ],
    advantages: [
      'Consistently state-of-the-art predictive performance on structured tabular benchmarks.',
      'Handles missing values automatically by learning default split directions during training.',
      'Built-in L1 (alpha) and L2 (lambda) penalties prevent overfitting on complex datasets.',
      'Supports GPU acceleration, distributed training, and custom loss functions with gradients.'
    ],
    disadvantages: [
      'High number of hyperparameters requiring systematic tuning (learning rate, depth, subsample, colsample).',
      'Can easily overfit if learning rate is too high or early stopping is omitted.',
      'Inference speed is slower than simple linear models.'
    ],
    whenToUse: [
      'Competitive machine learning and mission-critical production tabular problems.',
      'Datasets with non-linear relationships, mixed feature types, and missing values.'
    ],
    whenNotToUse: [
      'Raw unstructured perceptual data (computer vision, raw audio, natural language) where deep neural networks dominate.'
    ],
    hyperparameters: [
      { name: 'learning_rate (eta)', defaultVal: '0.3', impact: 'Shrinkage factor scaling tree contributions; lower values (0.01-0.05) improve generalization.' },
      { name: 'max_depth', defaultVal: '6', impact: 'Maximum tree depth; lower values prevent high-order feature interaction overfitting.' },
      { name: 'subsample', defaultVal: '1.0', impact: 'Row subsampling ratio per boosting iteration to introduce stochasticity.' },
      { name: 'colsample_bytree', defaultVal: '1.0', impact: 'Feature subsampling ratio per tree to decorrelate base learners.' },
      { name: 'gamma', defaultVal: '0.0', impact: 'Minimum loss reduction required to make a further partition on a leaf node.' }
    ],
    commonMistakes: [
      'Using default learning_rate (0.3) without early stopping, causing rapid overfitting.',
      'Manually one-hot encoding high-cardinality categories into thousands of sparse columns without using histogram methods.',
      'Ignoring scale_pos_weight on imbalanced classification datasets.'
    ],
    interviewQuestions: [
      'Why does XGBoost use second-order Taylor expansion (Hessian) while traditional GBM only uses first-order gradients?',
      'How does XGBoost handle missing values natively during training and inference?',
      'What is the mathematical role of gamma and lambda in the XGBoost gain formula?'
    ],
    realWorldExample: 'Ad click-through rate (CTR) prediction in real-time bidding systems processing millions of queries per second.',
    pythonImplementation: `import xgboost as xgb

model = xgb.XGBClassifier(
    n_estimators=1000,
    learning_rate=0.03,
    max_depth=5,
    subsample=0.8,
    colsample_bytree=0.8,
    tree_method='hist',
    early_stopping_rounds=30,
    eval_metric='logloss',
    random_state=42
)
model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)`,
    howToImprovePerformance: [
      'Enable tree_method="hist" for massive 10x-50x speedups on modern multi-core CPUs and GPUs.',
      'Tune learning_rate down to 0.01-0.03 paired with early stopping over 1000+ trees.',
      'Optimize hyperparameters using Bayesian Optimization (Optuna) on out-of-fold validation splits.'
    ]
  },
  {
    id: 'algo_pca',
    name: 'Principal Component Analysis (PCA)',
    category: 'Dimensionality Reduction',
    whatItIs: 'An unsupervised linear dimensionality reduction technique that orthogonally projects data onto directions of maximal variance.',
    howItWorks: 'Standardizes feature columns to zero mean and unit variance. Computes the empirical covariance matrix Sigma = (1/N) * X^T X. Calculates eigenvectors and eigenvalues of Sigma (or directly computes Singular Value Decomposition X = U S V^T). Sorts eigenvectors by decreasing eigenvalues and projects data onto the top K eigenvectors.',
    mathematicalIntuition: 'Finds an orthogonal coordinate system where the first axis aligns with the direction of greatest data spread, the second axis captures the greatest remaining variance orthogonal to the first, and all resulting components are mutually uncorrelated.',
    formulas: [
      { name: 'Covariance Matrix', formula: 'Sigma = (1 / N) * X^T X', explanation: 'Captures pairwise linear covariance between centered feature columns.' },
      { name: 'Eigen-Decomposition', formula: 'Sigma * v_i = lambda_i * v_i', explanation: 'Eigenvector v_i represents principal direction; eigenvalue lambda_i represents variance along v_i.' },
      { name: 'Explained Variance Ratio', formula: 'EVR_k = lambda_k / sum(lambda_i)', explanation: 'Percentage of total dataset variance captured by component k.' }
    ],
    advantages: [
      'Eliminates multicollinearity completely by transforming features into orthogonal components.',
      'Compresses high-dimensional feature spaces, mitigating the curse of dimensionality.',
      'Enables 2D/3D visual inspection of complex high-dimensional datasets.',
      'Denoises data by discarding trailing low-variance components.'
    ],
    disadvantages: [
      'Components are linear combinations of all original features, making domain interpretation difficult.',
      'Assumes that directions of high variance contain the most informative signal, which may not hold for classification.',
      'Cannot capture complex non-linear manifolds (unlike UMAP or Kernel PCA).'
    ],
    whenToUse: [
      'Pre-processing step to remove severe multicollinearity before fitting linear or logistic regression.',
      'Dimensionality reduction for high-dimensional sensor, genomic, or spectral data.',
      'Visualizing high-dimensional cluster separation in 2D or 3D scatter plots.'
    ],
    whenNotToUse: [
      'When preserving original feature identity and raw coefficient meaning is required for regulatory auditability.',
      'When data lies on an intrinsically non-linear manifold (e.g. Swiss roll).'
    ],
    hyperparameters: [
      { name: 'n_components', defaultVal: 'None', impact: 'Number of components to keep; can be an integer (e.g. 10) or float variance ratio (e.g. 0.95).' },
      { name: 'whiten', defaultVal: 'False', impact: 'If True, scales component vectors to have unit variance, decorrelating and standardizing outputs.' }
    ],
    commonMistakes: [
      'Applying PCA without standardizing features first; high-magnitude features will falsely dominate the principal axes.',
      'Assuming PCA is a supervised technique; PCA has no access to target labels y and may discard variance crucial for separating classes.',
      'Fitting PCA on the entire dataset instead of fitting exclusively on X_train and transforming X_test.'
    ],
    interviewQuestions: [
      'Why is SVD computationally preferred over computing the explicit covariance matrix X^T X in PCA?',
      'Does high variance in PCA guarantee high predictive power for classification?',
      'What is the difference between PCA and Linear Discriminant Analysis (LDA)?'
    ],
    realWorldExample: 'Compressing 50,000 gene expression features into 50 principal components before training a cancer subtype classifier.',
    pythonImplementation: `from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

# Keep 95% of cumulative variance
pca_pipe = make_pipeline(StandardScaler(), PCA(n_components=0.95))
X_reduced = pca_pipe.fit_transform(X_train)

print(f"Retained {X_reduced.shape[1]} components.")`,
    howToImprovePerformance: [
      'Use IncrementalPCA for massive datasets that do not fit into physical RAM.',
      'Plot the Scree Plot (cumulative explained variance vs component count) to identify the variance inflection elbow.',
      'Evaluate KernelPCA with RBF kernel if data exhibits clear non-linear manifold curvature.'
    ]
  },
  {
    id: 'algo_kmeans',
    name: 'K-Means Clustering',
    category: 'Unsupervised',
    whatItIs: 'A centroid-based unsupervised clustering algorithm that partitions N observations into K mutually exclusive spherical clusters.',
    howItWorks: 'Initializes K cluster centroids (typically using K-Means++). Repeatedly iterates two steps until centroid coordinates stabilize: 1. Assignment step: assigns each data point to its nearest centroid based on squared Euclidean distance. 2. Update step: recalculates the coordinates of each centroid as the arithmetic mean of all points assigned to that cluster.',
    mathematicalIntuition: 'Minimizes the within-cluster sum of squares (WCSS), also known as Inertia: J = sum_{k=1}^K sum_{x in C_k} ||x - mu_k||^2. It is an instance of the Expectation-Maximization (EM) algorithm with hard cluster assignments.',
    formulas: [
      { name: 'Inertia (WCSS)', formula: 'J = sum_{k=1}^K sum_{x_i in S_k} ||x_i - mu_k||^2', explanation: 'Total squared Euclidean distance from every point to its assigned centroid.' },
      { name: 'Centroid Update', formula: 'mu_k = (1 / |S_k|) * sum_{x_i in S_k} x_i', explanation: 'New centroid coordinate is the sample mean of cluster members.' }
    ],
    advantages: [
      'Computationally fast with O(N * K * I * D) complexity, easily scaling to millions of samples.',
      'Straightforward geometric intuition and simple implementation.',
      'Centroid vectors provide direct, interpretable cluster prototypes.'
    ],
    disadvantages: [
      'Requires pre-specifying the exact number of clusters K in advance.',
      'Assumes spherical clusters of equal size and variance; fails on irregular, elongated, or crescent shapes.',
      'Sensitive to outliers, which pull cluster centroids away from true density centers.',
      'Convergence depends on centroid initialization; standard random initialization can get stuck in poor local minima.'
    ],
    whenToUse: [
      'Customer segmentation based on demographic and purchasing behavior metrics.',
      'Vector quantization for image compression and codebook generation.',
      'Fast exploratory clustering on large numeric datasets.'
    ],
    whenNotToUse: [
      'Data containing non-spherical geometric patterns (e.g. concentric circles, elongated rings).',
      'Datasets with extreme outliers or heavily imbalanced cluster sizes.'
    ],
    hyperparameters: [
      { name: 'n_clusters (K)', defaultVal: '8', impact: 'The number of clusters to form.' },
      { name: 'init', defaultVal: '"k-means++"', impact: 'Initialization strategy: "k-means++" spreads initial centroids to speed convergence.' },
      { name: 'n_init', defaultVal: '10', impact: 'Number of times the algorithm runs with different centroid seeds; best inertia is kept.' }
    ],
    commonMistakes: [
      'Running K-Means on unstandardized data with disparate feature scales (e.g. Age 0-100 vs Salary 0-1,000,000).',
      'Using K-Means on high-dimensional data without dimensionality reduction, where Euclidean distances lose discriminative power.',
      'Choosing K purely based on minimum inertia (which trivially reaches 0 when K=N).'
    ],
    interviewQuestions: [
      'How does the K-Means++ initialization algorithm work and why is it superior to uniform random initialization?',
      'Why does K-Means converge, and is it guaranteed to reach the global minimum?',
      'What is the difference between K-Means and Gaussian Mixture Models (GMM)?'
    ],
    realWorldExample: 'Grouping delivery addresses into 12 delivery zones to optimize daily van routing and dispatch.',
    pythonImplementation: `from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

pipe = make_pipeline(
    StandardScaler(),
    KMeans(n_clusters=4, init='k-means++', n_init=10, random_state=42)
)
cluster_labels = pipe.fit_predict(X)
centroids = pipe.named_steps['kmeans'].cluster_centers_`,
    howToImprovePerformance: [
      'Use MiniBatchKMeans for multi-gigabyte datasets to compute centroid updates over random mini-batches.',
      'Evaluate optimal K using a combination of the Elbow Method (inertia inflection) and Silhouette Analysis.',
      'Use K-Medoids (PAM) if data contains severe outliers that corrupt mean centroids.'
    ]
  }
];

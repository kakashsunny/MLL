import { LessonContent, CourseModule } from '../../types';

export const ML_ALGORITHMS_LESSONS: LessonContent[] = [
  {
    id: 'ml_algo_01',
    courseId: 'course_ml_algorithms',
    order: 1,
    title: '01 Linear & Polynomial Regression (OLS & Normal Equations)',
    subtitle: 'Ordinary Least Squares, closed-form Normal Equations, and non-linear polynomial expansions',
    oneLineIntuition: 'Ordinary Least Squares rotates and shifts a hyperplane until the sum of squared distances to every sample point is at its global minimum.',
    beginnerExplanation: 'Imagine you want to predict the price of a house from its size. You plot all past sales as dots on a chart. Linear regression draws the single best line through those dots so that the vertical gaps between the dots and your line are as tiny as possible.',
    technicalExplanation: 'Given design matrix X in R^{N x d} and target vector y in R^N, OLS minimizes the residual sum of squares RSS(w) = ||y - Xw||^2. Setting the gradient with respect to w to zero yields the closed-form Normal Equation w* = (X^T X)^(-1) X^T y. Polynomial regression projects features into higher-degree combinations phi(x) = [1, x, x^2, ...] while preserving linear parameter estimation.',
    mathFormula: {
      latex: '\\mathbf{w}^* = (\\mathbf{X}^T \\mathbf{X})^{-1} \\mathbf{X}^T \\mathbf{y}, \\quad \\mathcal{L}(\\mathbf{w}) = \\frac{1}{2N} \\sum_{i=1}^N (\\mathbf{w}^T \\mathbf{x}^{(i)} - y^{(i)})^2',
      explanation: 'Closed-form Normal Equation derived by setting the gradient of Mean Squared Error to zero.'
    },
    visualType: 'linear_regression',
    realWorldExample: 'Estimating building heating load and energy efficiency based on surface area, wall insulation, and glazing ratio.',
    pythonCode: `import numpy as np
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression

# 1. Closed-form OLS via Normal Equation
X = np.array([[1.0], [2.0], [3.0], [4.0]])
y = np.array([2.5, 5.1, 7.4, 9.8])
X_b = np.c_[np.ones((len(X), 1)), X] # Bias intercept term

w_optimal = np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y
print(f"Normal Eq Weights: Intercept={w_optimal[0]:.2f}, Slope={w_optimal[1]:.2f}")

# 2. Polynomial Regression (Degree 2)
poly = PolynomialFeatures(degree=2, include_bias=False)
X_poly = poly.fit_transform(X)
model = LinearRegression().fit(X_poly, y)
print("Polynomial Coefficients (x, x^2):", model.coef_)`,
    codeExplanation: 'Calculates the analytical global minimum via the Normal Equation and demonstrates polynomial feature expansion.',
    commonMistakes: [
      'Inverting (X^T X) when feature count d is huge (O(d^3) complexity; use gradient descent or SVD instead).',
      'Using high-degree polynomials (degree > 5), which causes catastrophic Runge phenomenon oscillations at the edges.',
      'Assuming high R^2 implies causality between independent variables and target outcomes.'
    ],
    interviewQuestions: [
      'Under what exact mathematical conditions is (X^T X) non-invertible, and how do we resolve it?',
      'State the Gauss-Markov Theorem and explain what BLUE (Best Linear Unbiased Estimator) means.'
    ],
    miniChallenge: {
      question: 'What happens to (X^T X) if two feature columns are exact linear multiples of each other?',
      options: ['Determinant is zero (singular/non-invertible)', 'Matrix becomes identity', 'Condition number drops to 1', 'Trace doubles'],
      correctIndex: 0,
      explanation: 'Exact collinearity makes the matrix rank-deficient (determinant = 0), preventing unique inversion.'
    }
  },
  {
    id: 'ml_algo_02',
    courseId: 'course_ml_algorithms',
    order: 2,
    title: '02 Logistic Regression & Softmax Classification',
    subtitle: 'Log-odds logit mapping, Sigmoid curves, Cross-Entropy log loss, and multi-class boundaries',
    oneLineIntuition: 'Logistic regression passes a linear score through a Sigmoid squashing function to map unbounded predictions into calibrated probabilities between 0 and 1.',
    beginnerExplanation: 'If you want to know whether an email is spam, a straight line could predict 150% or -40% (which makes no sense for probability). Logistic regression bends that line into an elegant S-shaped curve so the answer is always a clean probability between 0% and 100%.',
    technicalExplanation: 'The logit link function models the log-odds of the positive class as a linear combination: ln(p / (1 - p)) = w^T x. Solving for p yields the Sigmoid activation sigma(z) = 1 / (1 + exp(-z)). Unlike OLS, parameter estimation has no closed-form solution and is optimized via Maximum Likelihood Estimation (MLE) using Binary Cross-Entropy (Log Loss). For K > 2 classes, Softmax generalizes the distribution.',
    mathFormula: {
      latex: 'P(y=1|\\mathbf{x}) = \\sigma(\\mathbf{w}^T \\mathbf{x}) = \\frac{1}{1 + e^{-\\mathbf{w}^T \\mathbf{x}}}, \\quad \\mathcal{L} = -\\frac{1}{N} \\sum_{i=1}^N \\left[ y_i \\ln \\hat{p}_i + (1-y_i) \\ln(1-\\hat{p}_i) \\right]',
      explanation: 'Sigmoid activation function and Binary Cross-Entropy log-likelihood loss function.'
    },
    visualType: 'logistic_regression',
    realWorldExample: 'Credit card fraud scoring: computing the real-time probability that a transaction is fraudulent before approving payment.',
    pythonCode: `import numpy as np
from sklearn.linear_model import LogisticRegression

# Synthetic binary feature data
X = np.array([[10], [15], [20], [25], [30], [35], [40], [45]])
y = np.array([0, 0, 0, 0, 1, 1, 1, 1])

clf = LogisticRegression()
clf.fit(X, y)

# Decision boundary where probability = 0.5 (w * x + b = 0)
boundary = -clf.intercept_[0] / clf.coef_[0][0]
print(f"Calculated Decision Threshold: X = {boundary:.2f}")

# Predict calibrated probabilities
sample = np.array([[28.0]])
prob = clf.predict_proba(sample)[0][1]
print(f"Probability for X=28: {prob * 100:.1f}%")`,
    codeExplanation: 'Fits logistic sigmoid curve and calculates the exact decision boundary where class odds equal 1:1.',
    commonMistakes: [
      'Using Mean Squared Error (MSE) loss instead of Cross-Entropy (MSE with Sigmoid is non-convex with numerous local minima).',
      'Using 0.5 as a rigid decision threshold when classes are heavily imbalanced (e.g. 99% benign, 1% fraud).',
      'Ignoring feature scaling: features with large scales dominate gradient descent optimization steps.'
    ],
    interviewQuestions: [
      'Why is Mean Squared Error (MSE) a poor loss function for training Logistic Regression?',
      'How does Multi-Class Logistic Regression (One-vs-Rest vs Softmax Cross-Entropy) partition the decision space?'
    ],
    miniChallenge: {
      question: 'At the decision boundary of binary logistic regression (w^T x + b = 0), what is the predicted probability P(y=1)?',
      options: ['0.0', '0.5 (50%)', '1.0', 'Depends on learning rate'],
      correctIndex: 1,
      explanation: 'sigma(0) = 1 / (1 + e^0) = 1 / 2 = 0.5.'
    }
  },
  {
    id: 'ml_algo_03',
    courseId: 'course_ml_algorithms',
    order: 3,
    title: '03 Regularized Linear Models: Ridge, Lasso & ElasticNet',
    subtitle: 'L1 Diamond Sparsity vs L2 Spherical Weight Decay, and multicollinearity shrinkage',
    oneLineIntuition: 'Regularization penalizes overly confident weights: Ridge shrinks coefficients smoothly toward zero; Lasso drives irrelevant weights to absolute zero.',
    beginnerExplanation: 'Imagine an artist painting with 100 brushes. Ridge tells the artist: "Use all brushes, but keep your strokes delicate." Lasso tells the artist: "Only pick the 5 most important brushes and throw the other 95 in the trash."',
    technicalExplanation: 'Overfitting occurs when parameter weights grow excessively large to memorize training noise. Ridge (L2 penalty ||w||_2^2) adds a spherical constraint, producing a closed-form solution w = (X^T X + lambda I)^(-1) X^T y that solves multicollinearity. Lasso (L1 penalty ||w||_1) adds a non-differentiable diamond constraint whose corners touch axes, setting weights to exact zero (automatic feature selection). ElasticNet combines both penalties.',
    mathFormula: {
      latex: '\\mathcal{L}_{\\text{ElasticNet}} = \\frac{1}{2N} \\|\\mathbf{y} - \\mathbf{X}\\mathbf{w}\\|^2 + \\lambda \\left( \\rho \\|\\mathbf{w}\\|_1 + \\frac{1-\\rho}{2} \\|\\mathbf{w}\\|_2^2 \\right)',
      explanation: 'ElasticNet convex objective function combining L1 sparsity and L2 shrinkage with mixing parameter rho.'
    },
    visualType: 'linear_regression',
    realWorldExample: 'Genomic biomarker discovery: identifying 20 causal disease mutations out of 500,000 sequenced DNA markers.',
    pythonCode: `import numpy as np
from sklearn.linear_model import Ridge, Lasso, ElasticNet

# Highly correlated feature matrix
np.random.seed(42)
X = np.random.randn(100, 5)
X[:, 1] = X[:, 0] + np.random.randn(100) * 0.01 # Severe multicollinearity
y = 3 * X[:, 0] + 2 * X[:, 2] + np.random.randn(100) * 0.5

# 1. Ridge (L2 Shrinkage)
ridge = Ridge(alpha=1.0).fit(X, y)
print("Ridge Weights (Shrunk, non-zero):", np.round(ridge.coef_, 3))

# 2. Lasso (L1 Feature Selection)
lasso = Lasso(alpha=0.2).fit(X, y)
print("Lasso Weights (Exact zeros for noise!):", np.round(lasso.coef_, 3))

# 3. ElasticNet (Hybrid)
enet = ElasticNet(alpha=0.1, l1_ratio=0.5).fit(X, y)
print("ElasticNet Weights:", np.round(enet.coef_, 3))`,
    codeExplanation: 'Demonstrates weight shrinkage with Ridge versus sparse feature elimination with Lasso.',
    commonMistakes: [
      'Applying regularization without standardizing features first (StandardScaler is mandatory; otherwise features with larger scales are unfairly penalized!).',
      'Using Lasso when features are heavily correlated: Lasso arbitrarily picks one feature and zeroes out the rest.',
      'Regularizing the intercept bias term b (the bias should remain unpenalized).'
    ],
    interviewQuestions: [
      'Geometrically, why does L1 regularization produce sparse models (exact zeros) while L2 produces non-zero small weights?',
      'Why is (X^T X + lambda I) always invertible in Ridge Regression even if X has collinear columns?'
    ],
    miniChallenge: {
      question: 'Which geometric shape represents the parameter constraint region for L1 (Lasso) regularization in 2D?',
      options: ['A circle', 'A diamond / rotated square', 'A hyperbola', 'A triangle'],
      correctIndex: 1,
      explanation: '|w1| + |w2| <= C forms a diamond with sharp corners on the coordinate axes where w1=0 or w2=0.'
    }
  },
  {
    id: 'ml_algo_04',
    courseId: 'course_ml_algorithms',
    order: 4,
    title: '04 K-Nearest Neighbors (KNN) & Metric Space Learning',
    subtitle: 'Distance metrics (Euclidean, Manhattan, Minkowski), KD-Trees, Ball-Trees & Curse of Dimensionality',
    oneLineIntuition: 'Tell me who your neighbors are, and I will tell you who you are: classify points based on majority vote of the K closest observations.',
    beginnerExplanation: 'If you walk into a neighborhood and see that the 5 closest houses are all painted blue, you can confidently predict that the next house you visit will also be blue.',
    technicalExplanation: 'KNN is a non-parametric, lazy-learning algorithm that memorizes training instances rather than learning explicit weights. Given query point x_q, it computes distance d(x_q, x_i) using Minkowski metric D(x, y) = (sum |x_j - y_j|^p)^(1/p), identifies the K nearest neighbors, and computes majority vote (classification) or mean value (regression). In high dimensions, the Curse of Dimensionality makes all pairwise distances converge to the same value.',
    mathFormula: {
      latex: 'd_p(\\mathbf{x}, \\mathbf{z}) = \\left( \\sum_{j=1}^d |x_j - z_j|^p \\right)^{1/p}, \\quad \\hat{y} = \\arg\\max_c \\sum_{i \\in \\mathcal{N}_K(\\mathbf{x})} \\mathbb{I}(y_i = c)',
      explanation: 'Minkowski distance metric and K-nearest neighbor majority classification rule.'
    },
    visualType: 'knn',
    realWorldExample: 'Content-based movie recommender systems: finding users with the most similar viewing history vectors.',
    pythonCode: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
import numpy as np

# Height (cm) and Weight (kg) for athletic category
X = np.array([[180, 85], [185, 90], [160, 50], [165, 55], [195, 105], [155, 48]])
y = np.array(['Rugby', 'Rugby', 'Gymnast', 'Gymnast', 'Rugby', 'Gymnast'])

# Mandatory: Standardize features!
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# KNN with K=3 and inverse-distance weighting
knn = KNeighborsClassifier(n_neighbors=3, weights='distance')
knn.fit(X_scaled, y)

new_athlete = scaler.transform([[182, 82]])
prediction = knn.predict(new_athlete)
probs = knn.predict_proba(new_athlete)
print(f"Predicted Class: {prediction[0]}, Probabilities: {probs[0]}")`,
    codeExplanation: 'Always scales features before computing distance metrics and evaluates neighborhood voting.',
    commonMistakes: [
      'Failing to standardize features (a feature measured in dollars will overpower a feature measured in meters).',
      'Choosing an even K for binary classification, which causes voting ties.',
      'Using brute-force KNN on millions of rows in production (inference is O(N * d); use KD-Trees or FAISS instead).'
    ],
    interviewQuestions: [
      'How does the Curse of Dimensionality mathematically degrade KNN performance as dimension d -> infinity?',
      'Compare KD-Tree vs Ball-Tree spatial indexing for nearest neighbor queries.'
    ],
    miniChallenge: {
      question: 'What happens to the decision boundary of a KNN model when K=1?',
      options: [
        'Boundary is a smooth straight line',
        'Complex, highly irregular Voronoi boundary prone to severe overfitting',
        'Model underfits and predicts the global mode',
        'Boundary disappears'
      ],
      correctIndex: 1,
      explanation: 'K=1 memorizes training points, creating intricate Voronoi cell boundaries that overfit training noise.'
    }
  },
  {
    id: 'ml_algo_05',
    courseId: 'course_ml_algorithms',
    order: 5,
    title: '05 Support Vector Machines (SVM) & Kernel Methods',
    subtitle: 'Maximum Margin Hyperplanes, Support Vectors, Slack variables C, and the RBF Kernel Trick',
    oneLineIntuition: 'SVM finds the street of maximum possible width that cleanly separates two classes, supported only by the critical borderline points.',
    beginnerExplanation: 'Imagine two rival armies facing each other on a field. Instead of drawing any random line between them, SVM draws the widest possible highway between the two armies. The soldiers standing closest to the highway edges are the "support vectors".',
    technicalExplanation: 'SVM maximizes the geometric margin 2 / ||w|| subject to y_i (w^T x_i + b) >= 1 - xi_i, where xi_i are slack variables penalized by parameter C. In the dual formulation, inputs appear only as dot products <x_i, x_j>. By Mercer Theorem, we replace dot products with kernel functions K(x_i, x_j) = phi(x_i)^T phi(x_j), such as the Radial Basis Function (RBF) kernel K(x, z) = exp(-gamma ||x - z||^2), mapping non-linear data into infinite-dimensional Hilbert space.',
    mathFormula: {
      latex: '\\min_{\\mathbf{w}, b, \\xi} \\frac{1}{2} \\|\\mathbf{w}\\|^2 + C \\sum_{i=1}^N \\xi_i \\quad \\text{s.t.} \\quad y_i(\\mathbf{w}^T \\mathbf{x}_i + b) \\ge 1 - \\xi_i, \\; \\xi_i \\ge 0',
      explanation: 'Soft-margin SVM primal optimization problem balancing margin maximization against slack penalties.'
    },
    visualType: 'svm',
    realWorldExample: 'Cancer tumor classification from micro-array gene expression profiles where sample count is small but features are high-dimensional.',
    pythonCode: `from sklearn.svm import SVC
from sklearn.datasets import make_circles
import numpy as np

# Non-linearly separable concentric circles
X, y = make_circles(n_samples=100, noise=0.1, factor=0.3, random_state=42)

# Linear SVM fails on concentric circles!
linear_svm = SVC(kernel='linear').fit(X, y)
print(f"Linear SVM Accuracy: {linear_svm.score(X, y) * 100:.1f}%")

# RBF Kernel SVM maps to infinite dimensions effortlessly
rbf_svm = SVC(kernel='rbf', C=1.0, gamma='scale').fit(X, y)
print(f"RBF Kernel SVM Accuracy: {rbf_svm.score(X, y) * 100:.1f}%")
print(f"Number of Support Vectors: {len(rbf_svm.support_)}")`,
    codeExplanation: 'Demonstrates the RBF kernel trick resolving non-linear topological boundaries.',
    commonMistakes: [
      'Using RBF SVM without tuning gamma and C (large gamma causes extreme overfitting to individual support points).',
      'Training SVM on large datasets (N > 100,000): quadratic solver complexity O(N^2) to O(N^3) causes training to freeze.',
      'Omitting feature scaling: SVM margin calculation depends strictly on Euclidean distances.'
    ],
    interviewQuestions: [
      'What is the Kernel Trick, and why does Mercer condition allow computing inner products without explicitly projecting vectors?',
      'What happens to the margin and bias-variance tradeoff as parameter C increases?'
    ],
    miniChallenge: {
      question: 'If you have non-support vector data points in the training set and remove them, how does the SVM decision boundary change?',
      options: ['Boundary shifts significantly', 'Boundary does not change at all', 'Margin collapses to zero', 'All weights become zero'],
      correctIndex: 1,
      explanation: 'Only the support vectors determine the optimal hyperplane; removing non-support vectors leaves the boundary completely unchanged.'
    }
  },
  {
    id: 'ml_algo_06',
    courseId: 'course_ml_algorithms',
    order: 6,
    title: '06 Naive Bayes Classifiers & Probabilistic Models',
    subtitle: 'Bayes Theorem, class-conditional independence assumption, Gaussian, Multinomial & Laplace smoothing',
    oneLineIntuition: 'Calculate the probability of a label given observed evidence by assuming all clues are conditionally independent of each other.',
    beginnerExplanation: 'If you see an animal that has feathers, quacks, and swims, you ask: "What is the chance a duck has feathers, quacks, and swims?" Naive Bayes multiplies the probabilities of each clue together to pick the most likely animal.',
    technicalExplanation: 'Naive Bayes applies Bayes theorem P(y|x) = P(y) P(x|y) / P(x) with the "naive" assumption that features are conditionally independent given class y: P(x_1, ..., x_d | y) = prod P(x_j | y). For continuous features, Gaussian NB assumes normal likelihoods. For word frequency counts in NLP, Multinomial NB models token histograms with additive Laplace smoothing alpha to prevent zero-probability crashes.',
    mathFormula: {
      latex: '\\hat{y} = \\arg\\max_c \\left[ \\ln P(y=c) + \\sum_{j=1}^d \\ln P(x_j \\mid y=c) \\right], \\quad P(w_j \\mid c) = \\frac{N_{jc} + \\alpha}{N_c + \\alpha |V|}',
      explanation: 'Log-posterior classification rule and Laplace-smoothed word likelihood formula.'
    },
    visualType: 'naive_bayes',
    realWorldExample: 'Real-time email spam classification and automated customer support ticket triage.',
    pythonCode: `from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import CountVectorizer

documents = [
    "Exclusive lottery winner claim cash prize now",
    "Meeting agenda and quarterly budget report attached",
    "Claim your free gift card and cash reward",
    "Project sprint retrospective notes and action items"
]
labels = ['spam', 'ham', 'spam', 'ham']

# Convert text to word count tokens
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(documents)

# Multinomial Naive Bayes with Laplace smoothing alpha=1.0
nb = MultinomialNB(alpha=1.0)
nb.fit(X, labels)

test_doc = ["Urgent prize cash winner"]
test_vec = vectorizer.transform(test_doc)
print("Prediction:", nb.predict(test_vec)[0])
print("Class Probabilities (ham vs spam):", nb.predict_proba(test_vec)[0])`,
    codeExplanation: 'Multinomial Naive Bayes models discrete word count distributions with Laplace smoothing.',
    commonMistakes: [
      'Allowing unseen vocabulary words to assign zero probability to an entire class (always ensure Laplace smoothing alpha > 0!).',
      'Using Naive Bayes when features are heavily correlated (violating the conditional independence assumption).',
      'Relying on raw Naive Bayes output probabilities as calibrated confidence scores (they tend to be overconfident toward 0 or 1).'
    ],
    interviewQuestions: [
      'Why does Naive Bayes perform surprisingly well on text classification despite its obviously false independence assumption?',
      'How does Laplace smoothing resolve the Zero-Frequency Problem in language modeling?'
    ],
    miniChallenge: {
      question: 'What is the purpose of adding alpha=1 (Laplace smoothing) when estimating word probabilities?',
      options: ['Speeds up model training', 'Prevents zero probabilities from multiplying out the entire likelihood to 0', 'Calculates SVD', 'Normalizes text length'],
      correctIndex: 1,
      explanation: 'If a word was never observed with a class, its probability is 0, which would zero-out the entire product without smoothing.'
    }
  },
  {
    id: 'ml_algo_07',
    courseId: 'course_ml_algorithms',
    order: 7,
    title: '07 Decision Trees & Recursive Partitioning (CART)',
    subtitle: 'Binary recursive splits, Gini Impurity, Shannon Entropy, Information Gain, and cost-complexity pruning',
    oneLineIntuition: 'A Decision Tree plays an optimal game of 20 Questions, partitioning the feature space into hyper-rectangles of pure class labels.',
    beginnerExplanation: 'Think of a doctor diagnosing a patient: "Do you have a fever? Yes. Are you coughing? No. Have you traveled abroad? Yes." Each question splits patients into smaller, more specific diagnostic groups.',
    technicalExplanation: 'The Classification and Regression Tree (CART) algorithm recursively splits feature space by choosing the feature j and split threshold t that maximizes impurity reduction. Common impurity criteria include Gini Impurity G = 1 - sum p_i^2 and Shannon Entropy H = -sum p_i log_2(p_i). Trees can grow until every leaf is pure (zero training error), causing severe overfitting. Cost-complexity pruning uses alpha to penalize tree leaf count.',
    mathFormula: {
      latex: 'G = 1 - \\sum_{k=1}^K p_k^2, \\quad \\Delta I = I_{\\text{parent}} - \\left( \\frac{N_L}{N} I_L + \\frac{N_R}{N} I_R \\right)',
      explanation: 'Gini impurity formula and weighted information gain across child split partitions.'
    },
    visualType: 'decision_tree',
    realWorldExample: 'Medical triage protocols and credit loan underwriting approval checklists.',
    pythonCode: `from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.datasets import load_iris

iris = load_iris()
X, y = iris.data, iris.target

# CART decision tree with max depth constraint to prevent overfitting
tree = DecisionTreeClassifier(criterion='gini', max_depth=3, min_samples_split=5, random_state=42)
tree.fit(X, y)

# Print human-readable ASCII decision tree rules
tree_rules = export_text(tree, feature_names=iris.feature_names)
print("Learned Decision Tree Rules:\n", tree_rules[:400])
print("\nFeature Importances:", dict(zip(iris.feature_names, tree.feature_importances_.round(3))))`,
    codeExplanation: 'Fits a constrained binary decision tree and inspects splits and feature importance scores.',
    commonMistakes: [
      'Letting trees grow with unlimited depth (max_depth=None), creating brittle, memorized leaf partitions.',
      'Assuming decision trees are invariant to data rotation (trees split with axis-aligned horizontal/vertical hyperplanes).',
      'Over-interpreting feature importance: correlated features share credit and dilute each other importance values.'
    ],
    interviewQuestions: [
      'Compare Gini Impurity vs Shannon Entropy: why does Scikit-Learn default to Gini?',
      'Why are Decision Trees considered high-variance, low-bias estimators, and how do Ensembles fix this?'
    ],
    miniChallenge: {
      question: 'What is the Gini Impurity of a leaf node where all samples belong to the exact same class?',
      options: ['0.0 (Pure)', '0.5', '1.0', 'Infinity'],
      correctIndex: 0,
      explanation: 'G = 1 - (1.0)^2 = 0.0. A completely pure node has zero impurity.'
    }
  },
  {
    id: 'ml_algo_08',
    courseId: 'course_ml_algorithms',
    order: 8,
    title: '08 Random Forests & Bagging Ensembles',
    subtitle: 'Bootstrap Aggregating, Out-Of-Bag (OOB) error estimation, and random feature subspace de-correlation',
    oneLineIntuition: 'Wisdom of the Crowd: train hundreds of deep, high-variance decision trees on random subsets of data and features, then average their predictions.',
    beginnerExplanation: 'If you ask one doctor for a diagnosis, they might make a mistake. If you ask 100 independent doctors who all trained on different patient records and average their verdicts, the crowd consensus is remarkably accurate.',
    technicalExplanation: 'Bagging (Bootstrap Aggregation) samples N records with replacement from the training set. Random Forests introduce a second layer of randomness: at each split in each tree, only a random subspace of sqrt(d) features is considered. This de-correlates individual trees. The ensemble variance shrinks as Var(Ensemble) = rho * sigma^2 + ((1-rho)/M) * sigma^2, where rho is tree correlation and M is tree count. Unsampled records (~36.8%) provide free Out-of-Bag (OOB) validation.',
    mathFormula: {
      latex: '\\text{Var}(\\bar{X}) = \\rho \\sigma^2 + \\frac{1-\\rho}{M} \\sigma^2, \\quad \\lim_{M \\to \\infty} \\text{Var}(\\bar{X}) = \\rho \\sigma^2',
      explanation: 'Ensemble variance reduction formula showing dependency on inter-tree correlation rho.'
    },
    visualType: 'random_forest',
    realWorldExample: 'Predicting customer loan default and churn risk across retail banking institutions.',
    pythonCode: `from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=500, n_features=15, n_informative=8, random_state=42)

# Random Forest with OOB scoring enabled
rf = RandomForestClassifier(
    n_estimators=100,
    max_features='sqrt', # Subspace feature randomization
    oob_score=True,     # Free validation score without train/test split!
    n_jobs=-1,
    random_state=42
)
rf.fit(X, y)

print(f"Out-of-Bag (OOB) Accuracy: {rf.oob_score_ * 100:.2f}%")
print("Top 3 Feature Importances:", sorted(rf.feature_importances_, reverse=True)[:3])`,
    codeExplanation: 'Ensemble of de-correlated decision trees evaluated via Out-Of-Bag (OOB) validation.',
    commonMistakes: [
      'Thinking adding more trees to a Random Forest causes overfitting (more trees asymptotically stabilize variance; they do not overfit!).',
      'Forgetting to enable n_jobs=-1 on multi-core systems, leaving training 8x slower than necessary.',
      'Relying on default MDI (Mean Decrease in Impurity) feature importance on high-cardinality features (use Permutation Importance!).'
    ],
    interviewQuestions: [
      'Prove mathematically that approximately 36.8% (1/e) of training observations are left out in each bootstrap sample.',
      'Why does Random Forest select sqrt(d) features at each split instead of using all d features?'
    ],
    miniChallenge: {
      question: 'What is the mathematical limit of the proportion of unique samples drawn in a bootstrap sample as N -> infinity?',
      options: ['50.0%', '63.2% (1 - 1/e)', '75.0%', '100%'],
      correctIndex: 1,
      explanation: 'lim (1 - 1/N)^N = 1/e ~ 0.368, meaning 1 - 0.368 = 63.2% of samples are chosen, and 36.8% remain Out-Of-Bag.'
    }
  },
  {
    id: 'ml_algo_09',
    courseId: 'course_ml_algorithms',
    order: 9,
    title: '09 Gradient Boosted Decision Trees (GBDT, XGBoost, LightGBM)',
    subtitle: 'Gradient descent in function space, residual learning, shrinkage learning rates, and Taylor expansions',
    oneLineIntuition: 'Unlike Random Forests that build trees in parallel, Boosting builds trees sequentially: each new tree is specifically trained to fix the mistakes of all prior trees.',
    beginnerExplanation: 'Imagine an archer shooting at a target. The first arrow lands 4 inches high. The archer does not shoot blindly again; instead, the next shot aims specifically 4 inches lower to correct the error. Boosting iteratively corrects previous mistakes.',
    technicalExplanation: 'Gradient Boosting formulates ensemble training as gradient descent in function space. At step m, the pseudo-residuals r_{im} = - [d L(y_i, F(x_i)) / d F(x_i)] are computed. A shallow regression tree h_m(x) is fitted to these residuals, scaled by learning rate shrinkage eta: F_m(x) = F_{m-1}(x) + eta * h_m(x). XGBoost extends this with second-order Taylor expansions (gradient g_i and hessian h_i) and tree structure regularizers (gamma and lambda).',
    mathFormula: {
      latex: 'F_m(\\mathbf{x}) = F_{m-1}(\\mathbf{x}) + \\eta \\sum_{j=1}^J w_{jm} \\mathbb{I}(\\mathbf{x} \\in R_{jm}), \\quad r_{im} = -\\left[ \\frac{\\partial \\mathcal{L}(y_i, F(\\mathbf{x}_i))}{\\partial F(\\mathbf{x}_i)} \\right]',
      explanation: 'Sequential gradient boosting update equation fitting pseudo-residuals of the loss function.'
    },
    visualType: 'gradient_descent',
    realWorldExample: 'Search engine ranking at Google and Bing, and tabular competition-winning models on Kaggle.',
    pythonCode: `from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=1000, n_features=20, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# High-performance histogram-based gradient boosting (similar to LightGBM)
gbm = HistGradientBoostingClassifier(
    learning_rate=0.05,
    max_iter=100,
    max_leaf_nodes=31,
    early_stopping=True,
    random_state=42
)
gbm.fit(X_train, y_train)

print(f"Test Accuracy: {gbm.score(X_test, y_test) * 100:.2f}%")
print(f"Stopped early at iteration: {gbm.n_iter_}")`,
    codeExplanation: 'Sequentially boosts residual errors with histogram binning and early stopping.',
    commonMistakes: [
      'Using too large of a learning rate (eta > 0.3), which causes the boosting process to overshoot and overfit.',
      'Training thousands of trees without early stopping on an out-of-fold validation set.',
      'Not tuning tree depth: boosting requires shallow trees (depth 3-6); deep trees overfit rapidly.'
    ],
    interviewQuestions: [
      'How does XGBoost utilize the second-order Taylor expansion (Hessian matrix) to optimize tree split finding?',
      'Contrast Random Forests (Bagging) vs Gradient Boosting (Boosting) in terms of bias vs variance reduction.'
    ],
    miniChallenge: {
      question: 'Does increasing the number of trees in Gradient Boosting increase or decrease the risk of overfitting?',
      options: ['Decreases risk', 'Increases risk (unlike Random Forests, Boosting can overfit with too many iterations)', 'Has zero effect', 'Guarantees 100% test accuracy'],
      correctIndex: 1,
      explanation: 'Because Boosting fits residuals sequentially, adding too many trees will eventually memorize noise in the training set.'
    }
  },
  {
    id: 'ml_algo_10',
    courseId: 'course_ml_algorithms',
    order: 10,
    title: '10 K-Means & K-Means++ Clustering',
    subtitle: 'Unsupervised partitioning, Lloyd algorithm, Voronoi tessellation, inertia, and Elbow method',
    oneLineIntuition: 'Group unlabeled data into K tight clusters by repeatedly calculating group centers and re-assigning every point to its closest centroid.',
    beginnerExplanation: 'Imagine placing 3 coffee shops in a city to minimize the walking distance for all residents. You guess 3 starting spots, see which residents are closest to each shop, move each shop to the exact center of its customers, and repeat until the shops stop moving.',
    technicalExplanation: 'K-Means partitions N observations into K clusters S = {S_1, ..., S_K} to minimize within-cluster sum of squares (Inertia): WCSS = sum sum ||x_i - mu_k||^2. Lloyd algorithm alternates between two steps: 1) Assignment step (assign each x to nearest centroid mu_k), and 2) Update step (recalculate mu_k as cluster mean). K-Means++ improves initial seeding by sampling initial centers with probability proportional to squared distance D(x)^2, providing O(log K) competitive bounds.',
    mathFormula: {
      latex: '\\arg\\min_S \\sum_{k=1}^K \\sum_{\\mathbf{x} \\in S_k} \\|\\mathbf{x} - \\boldsymbol{\\mu}_k\\|^2, \\quad P(\\mathbf{x}) = \\frac{D(\\mathbf{x})^2}{\\sum_{\\mathbf{x}\' \\in X} D(\\mathbf{x}\')^2}',
      explanation: 'Inertia objective function and K-Means++ probabilistic centroid initialization formula.'
    },
    visualType: 'kmeans',
    realWorldExample: 'Customer market segmentation: grouping shoppers into behavioral clusters (Budget, Premium, Bargain Hunters).',
    pythonCode: `from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import numpy as np

# Synthetic customer purchase patterns (Spend vs Frequency)
np.random.seed(42)
X = np.vstack([
    np.random.randn(50, 2) + [2, 2],
    np.random.randn(50, 2) + [8, 8],
    np.random.randn(50, 2) + [2, 8]
])

# K-Means with K-Means++ initialization
kmeans = KMeans(n_clusters=3, init='k-means++', n_init=10, random_state=42)
cluster_labels = kmeans.fit_predict(X)

print("Cluster Centroid Coordinates:\n", np.round(kmeans.cluster_centers_, 2))
print(f"Model Inertia (WCSS): {kmeans.inertia_:.2f}")
print(f"Silhouette Score: {silhouette_score(X, cluster_labels):.3f}")`,
    codeExplanation: 'Performs K-Means clustering with k-means++ seeding and calculates inertia and silhouette quality.',
    commonMistakes: [
      'Assuming K-Means can discover non-spherical clusters (it fails completely on concentric rings or elongated spirals).',
      'Using K-Means without feature standardization: features with larger scales distort Euclidean distances.',
      'Selecting K purely by minimizing inertia (inertia always decreases to 0 as K approaches N; use the Elbow method or Silhouette score!).'
    ],
    interviewQuestions: [
      'How does K-Means++ initialization overcome the poor local optima traps of random centroid initialization?',
      'Why does K-Means fail on non-convex or irregularly sized clusters, and which algorithm should you use instead?'
    ],
    miniChallenge: {
      question: 'What is the value of K-Means inertia if the number of clusters K equals the number of data points N?',
      options: ['0.0 (Every point is its own centroid)', '1.0', 'Depends on variance', 'Infinity'],
      correctIndex: 0,
      explanation: 'When K = N, every sample is its own centroid, meaning distance to centroid is 0, so inertia = 0.'
    }
  },
  {
    id: 'ml_algo_11',
    courseId: 'course_ml_algorithms',
    order: 11,
    title: '11 Hierarchical & Density-Based Spatial Clustering (DBSCAN)',
    subtitle: 'Density reachability (epsilon, MinPts), Core vs Border vs Noise points, and Agglomerative dendrograms',
    oneLineIntuition: 'DBSCAN groups points packed tightly together into natural clusters of arbitrary shapes and isolates lone outliers as pure noise.',
    beginnerExplanation: 'Think of islands in an ocean. Anywhere people live close together is part of a town, regardless of whether the town is circular or winding along a river. A hermit living alone on an isolated rock is tagged as noise.',
    technicalExplanation: 'DBSCAN (Density-Based Spatial Clustering of Applications with Noise) parameterizes density with radius epsilon and MinPts. A point is a Core Point if at least MinPts points lie within distance epsilon. Points within epsilon of a core point are density-reachable. Points that are density-reachable but not core are Border Points; all remaining points are Noise (-1). It discovers arbitrary non-convex geometries and does not require pre-specifying K.',
    mathFormula: {
      latex: 'N_\\varepsilon(\\mathbf{p}) = \\{ \\mathbf{q} \\in D \\mid \\text{dist}(\\mathbf{p}, \\mathbf{q}) \\le \\varepsilon \\}, \\quad |N_\\varepsilon(\\mathbf{p})| \\ge \\text{MinPts}',
      explanation: 'Epsilon neighborhood condition defining a core density point.'
    },
    visualType: 'kmeans',
    realWorldExample: 'GPS telematics: clustering millions of vehicle delivery drop-offs into warehouse hubs while ignoring highway drive-bys.',
    pythonCode: `from sklearn.cluster import DBSCAN
from sklearn.datasets import make_moons
import numpy as np

# Interleaving half-moons (K-Means fails completely here!)
X, _ = make_moons(n_samples=200, noise=0.05, random_state=42)

# DBSCAN with epsilon=0.2 and min_samples=5
dbscan = DBSCAN(eps=0.2, min_samples=5)
labels = dbscan.fit_predict(X)

n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
n_noise = list(labels).count(-1)

print(f"Estimated Clusters: {n_clusters}")
print(f"Noise Outlier Points Detected: {n_noise}")`,
    codeExplanation: 'DBSCAN segments non-linear crescent moon clusters and detects outliers without setting K.',
    commonMistakes: [
      'Using DBSCAN when clusters have vastly differing densities (one density threshold eps cannot separate dense and sparse clusters).',
      'Failing to use k-distance graphs to systematically select an appropriate epsilon parameter.',
      'Using Euclidean distance on high-dimensional text embeddings where density contracts.'
    ],
    interviewQuestions: [
      'What is the algorithmic difference between Core, Border, and Noise points in DBSCAN?',
      'How does HDBSCAN extend DBSCAN to handle clusters of varying density hierarchies?'
    ],
    miniChallenge: {
      question: 'What cluster label does Scikit-Learn DBSCAN assign to noise outlier points?',
      options: ['0', '999', '-1', 'None'],
      correctIndex: 2,
      explanation: 'Scikit-Learn marks noise points with label -1.'
    }
  },
  {
    id: 'ml_algo_12',
    courseId: 'course_ml_algorithms',
    order: 12,
    title: '12 Principal Component Analysis (PCA) & Dimensionality Reduction',
    subtitle: 'Orthogonal eigenbasis, covariance matrices, explained variance ratio, and SVD projection',
    oneLineIntuition: 'PCA rotates high-dimensional data so the first new axis captures the widest possible spread of information, letting you discard noisy axes with minimal loss.',
    beginnerExplanation: 'Imagine holding a 3D teapot and projecting its shadow onto a 2D wall. If you orient the teapot sideways, its shadow captures the spout, handle, and body clearly. PCA finds the exact angle that preserves the most detailed shadow.',
    technicalExplanation: 'Given centered data X, the empirical covariance matrix is C = (1/N) X^T X. Eigendecomposition C v_j = lambda_j v_j yields orthogonal eigenvectors v_j (principal components) and eigenvalues lambda_j proportional to variance. Projecting X onto the top k eigenvectors Z = X V_k minimizes reconstruction error ||X - Z V_k^T||^2. In practice, Scikit-Learn computes this directly via Singular Value Decomposition (SVD) of X.',
    mathFormula: {
      latex: '\\mathbf{C} = \\frac{1}{N} \\mathbf{X}^T \\mathbf{X} = \\mathbf{V} \\boldsymbol{\\Lambda} \\mathbf{V}^T, \\quad \\text{Explained Variance Ratio} = \\frac{\\lambda_j}{\\sum_{k=1}^d \\lambda_k}',
      explanation: 'Covariance spectral decomposition and explained variance ratio for component j.'
    },
    visualType: 'pca',
    realWorldExample: 'Facial recognition (Eigenfaces) and financial factor risk modeling across 500 S&P stock returns.',
    pythonCode: `from sklearn.decomposition import PCA
import numpy as np

# 100 samples with 5 correlated features
X = np.random.randn(100, 5)
X[:, 1] = X[:, 0] * 2.0 + np.random.randn(100) * 0.1 # High correlation

# Reduce from 5 dimensions to 2 principal components
pca = PCA(n_components=2)
X_reduced = pca.fit_transform(X)

print("Original Shape:", X.shape)
print("Reduced Shape:", X_reduced.shape)
print("Explained Variance Ratio per PC:", np.round(pca.explained_variance_ratio_, 3))
print(f"Total Variance Preserved: {pca.explained_variance_ratio_.sum() * 100:.1f}%")`,
    codeExplanation: 'PCA projects high-dimensional data onto orthogonal axes of maximum variance.',
    commonMistakes: [
      'Applying PCA without standardizing features (features with larger numeric scales will dominate principal components).',
      'Treating PCA principal components as easily interpretable physical features (components are linear combinations of all features).',
      'Using PCA for non-linear manifold reduction (use t-SNE or UMAP for non-linear visualization).'
    ],
    interviewQuestions: [
      'Prove that the first principal component corresponds to the eigenvector with the largest eigenvalue of the covariance matrix.',
      'How does PCA computed via SVD differ from directly diagonalizing the covariance matrix X^T X?'
    ],
    miniChallenge: {
      question: 'Why must you center data (subtract mean) before computing PCA?',
      options: ['Otherwise the first principal component points toward the data mean rather than direction of maximum variance', 'To prevent division by zero', 'To make eigenvalues complex', 'To reduce memory by half'],
      correctIndex: 0,
      explanation: 'If uncentered, the first principal component will simply describe the vector from the origin to the dataset mean.'
    }
  },
  {
    id: 'ml_algo_13',
    courseId: 'course_ml_algorithms',
    order: 13,
    title: '13 Multi-Layer Perceptrons (MLP) & Backpropagation Mechanics',
    subtitle: 'Feedforward architecture, activation functions (ReLU, GELU), computational graphs & chain rule gradient flow',
    oneLineIntuition: 'Stacked layers of linear dot products interspersed with non-linear activation functions can approximate any continuous mathematical function in the universe.',
    beginnerExplanation: 'Think of a multi-stage assembly line: raw metal enters, stage 1 stamps shapes, stage 2 bends corners, and stage 3 paints. Backpropagation is the supervisor at the end of the line shouting instructions back down the chain to adjust each machine dial.',
    technicalExplanation: 'A Multi-Layer Perceptron (MLP) computes hidden activations a^{(l)} = sigma(W^{(l)} a^{(l-1)} + b^{(l)}). By the Universal Approximation Theorem (Hornik, 1989), a network with a single hidden layer and non-linear activations can approximate any continuous function. Backpropagation applies the multivariate Chain Rule to calculate loss gradients dL / dW^{(l)} in reverse topological order, updating weights via optimizers like Adam or SGD with momentum.',
    mathFormula: {
      latex: '\\frac{\\partial \\mathcal{L}}{\\partial \\mathbf{W}^{(l)}} = \\boldsymbol{\\delta}^{(l)} (\\mathbf{a}^{(l-1)})^T, \\quad \\boldsymbol{\\delta}^{(l)} = ((\\mathbf{W}^{(l+1)})^T \\boldsymbol{\\delta}^{(l+1)}) \\odot \\sigma\'(\\mathbf{z}^{(l)})',
      explanation: 'Backpropagation error vector recurrence and weight gradient matrix product via chain rule.'
    },
    visualType: 'neural_net',
    realWorldExample: 'Speech acoustic modeling and non-linear tabular valuation in automated underwriting engines.',
    pythonCode: `from sklearn.neural_network import MLPClassifier
from sklearn.datasets import make_classification
from sklearn.preprocessing import StandardScaler

X, y = make_classification(n_samples=500, n_features=10, random_state=42)
X_scaled = StandardScaler().fit_transform(X)

# MLP with 2 hidden layers (64 and 32 neurons) using ReLU and Adam
mlp = MLPClassifier(
    hidden_layer_sizes=(64, 32),
    activation='relu',
    solver='adam',
    learning_rate_init=0.01,
    max_iter=200,
    random_state=42
)
mlp.fit(X_scaled, y)

print(f"MLP Convergence Iterations: {mlp.n_iter_}")
print(f"Final Loss: {mlp.loss_:.4f}")
print(f"Model Accuracy: {mlp.score(X_scaled, y) * 100:.2f}%")`,
    codeExplanation: 'Trains an MLP neural network with backpropagation and Adam optimizer.',
    commonMistakes: [
      'Forgetting non-linear activation functions: stacking linear layers W_2(W_1 x) collapses into a single linear layer (W_2 W_1) x!',
      'Vanishing gradients caused by deep architectures using Sigmoid or Tanh (use ReLU, LeakyReLU, or GELU).',
      'Training neural networks without learning rate schedules or weight initialization (He / Xavier init).'
    ],
    interviewQuestions: [
      'What is the Vanishing Gradient Problem, and why did the ReLU activation function revolutionize deep learning?',
      'Explain the momentum and adaptive learning rate mechanics of the Adam optimizer.'
    ],
    miniChallenge: {
      question: 'What happens if you remove all non-linear activation functions from a 100-layer neural network?',
      options: ['It computes non-linear polynomials', 'It collapses mathematically into a single linear regression model', 'It explodes to infinity', 'It trains 100x faster with higher accuracy'],
      correctIndex: 1,
      explanation: 'The composition of linear functions is always strictly linear: W100 * ... * W1 * x = W_total * x.'
    }
  }
];

export const ML_ALGORITHMS_MODULE: CourseModule = {
  id: 'course_ml_algorithms',
  title: 'Core & Advanced Machine Learning Algorithms',
  track: 'Algorithmic Architectures & Modeling',
  description: 'Master all 13 foundational and modern machine learning algorithms from first mathematical principles: Linear & Polynomial Regression, Logistic Regression, Ridge/Lasso/ElasticNet, KNN, SVM, Naive Bayes, Decision Trees, Random Forests, GBDT/XGBoost, K-Means, DBSCAN, PCA, and Multi-Layer Perceptrons.',
  lessons: ML_ALGORITHMS_LESSONS
};

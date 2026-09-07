import { LessonContent, CourseModule } from '../types';
import { NUMPY_MODULE } from './courses/numpyTopics';
import { PANDAS_MODULE } from './courses/pandasTopics';
import { ML_ALGORITHMS_MODULE } from './courses/mlAlgorithmsTopics';

export const COURSE_MODULES: CourseModule[] = [
  {
    id: 'course_ml_fundamentals',
    title: 'Machine Learning Fundamentals',
    track: 'Core ML Track',
    description: 'Master the foundational mechanics of learning systems from first principles.',
    lessons: [
      {
        id: 'ml_fund_01',
        courseId: 'course_ml_fundamentals',
        order: 1,
        title: '01 What is Machine Learning?',
        subtitle: 'From explicit conditional rules to parameter estimation from data',
        oneLineIntuition: 'Instead of writing millions of if-else conditions by hand, we write an algorithm that tunes dials until its guesses match reality.',
        beginnerExplanation: 'Traditional software is like a recipe: a human chef writes exact steps (if salt < 5g, add 2g). Machine learning is like an apprentice tasting 10,000 soups and adjusting the spice dials until every customer is delighted.',
        technicalExplanation: 'A computer program is said to learn from experience E with respect to some class of tasks T and performance measure P, if its performance at tasks in T, as measured by P, improves with experience E (Tom Mitchell, 1997). Formally, we optimize a parameter vector θ to minimize expected empirical loss.',
        mathFormula: {
          latex: 'θ^* = \\arg\\min_{θ} \\frac{1}{N} \\sum_{i=1}^N \\mathcal{L}(f(x^{(i)}; θ), y^{(i)}) + \\lambda \\Omega(θ)',
          explanation: 'Find optimal parameters θ that minimize average prediction loss across N samples, penalized by complexity constraint Ω(θ).'
        },
        visualType: 'linear_regression',
        realWorldExample: 'Spam filters reading email tokens and assigning probabilities rather than brittle rule lists.',
        pythonCode: `# Minimal ML Paradigm in Python
import numpy as np

# Experience (Data): Features X, Ground Truth y
X = np.array([[1.0], [2.0], [3.0], [4.0]])
y = np.array([2.0, 4.0, 6.0, 8.0])

# Model Parameter (The "Dial")
w = 0.0
learning_rate = 0.05

# Optimization Loop (Learning from Experience)
for epoch in range(100):
    predictions = X.dot(w)
    errors = predictions - y
    gradient = (2 / len(X)) * X.T.dot(errors)
    w -= learning_rate * gradient[0]

print(f"Learned parameter w: {w:.4f}") # Converges to 2.0000`,
        codeExplanation: 'The code updates the weight parameter w in the direction opposite to the gradient until the mean squared error is minimized.',
        commonMistakes: [
          'Thinking ML is "magic" rather than numeric numerical optimization.',
          'Assuming more complex models are always better than simple linear models.',
          'Ignoring data distribution shifts between training and production.'
        ],
        interviewQuestions: [
          'What is the fundamental difference between statistical inference and machine learning?',
          'How does the No Free Lunch theorem influence algorithm selection?'
        ],
        miniChallenge: {
          question: 'If an algorithm achieves 0% error on training data but 45% error on new test data, what is primarily happening?',
          options: ['Underfitting (High Bias)', 'Overfitting (High Variance)', 'Zero Noise', 'Optimal Generalization'],
          correctIndex: 1,
          explanation: 'Near-zero training error paired with high test error is the hallmark of overfitting (memorizing noise).'
        }
      },
      {
        id: 'ml_fund_02',
        courseId: 'course_ml_fundamentals',
        order: 2,
        title: '02 Training vs Testing',
        subtitle: 'Generalization bounds and the golden rule of data hygiene',
        oneLineIntuition: 'Never evaluate a student using the exact same questions they had on the practice worksheet.',
        beginnerExplanation: 'If you want to know if someone truly learned how to drive or just memorized the road to their house, you must test them on a road they have never seen before.',
        technicalExplanation: 'We assume data points are drawn i.i.d. (independent and identically distributed) from an unknown underlying data-generating distribution P(X, Y). The true objective is minimizing Out-of-Sample Error (Generalization Error), not In-Sample Empirical Error.',
        mathFormula: {
          latex: 'E_{out}(h) \\le E_{in}(h) + \\mathcal{O}\\left(\\sqrt{\\frac{d_{VC} \\ln(N/d_{VC})}{N}}\\right)',
          explanation: 'Vapnik-Chervonenkis generalization bound: Out-of-sample error is bounded by in-sample error plus a model complexity penalty.'
        },
        visualType: 'logistic_regression',
        realWorldExample: 'Medical diagnostic models that achieve 99% accuracy in one hospital but fail completely in another due to training dataset leakage.',
        pythonCode: `from sklearn.model_selection import train_test_split
import numpy as np

X = np.random.randn(1000, 10)
y = (X[:, 0] + X[:, 1] > 0).astype(int)

# Golden Rule: 80% Train, 20% Test with strict stratification
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

print(f"Training shape: {X_train.shape}, Test shape: {X_test.shape}")`,
        codeExplanation: 'Splitting data before any transformations prevents information leakage from the test distribution.',
        commonMistakes: [
          'Fitting scalers (like StandardScaler) on the whole dataset before splitting.',
          'Using random splits on time-series data instead of chronological splits.',
          'Peeking at test metrics repeatedly to guide manual feature tuning.'
        ],
        interviewQuestions: [
          'Why does data leakage happen during feature preprocessing, and how do Scikit-Learn Pipelines prevent it?',
          'When would K-Fold Cross Validation fail for time-series predictions?'
        ],
        miniChallenge: {
          question: 'You apply StandardScaler().fit_transform(X) on your entire dataset before calling train_test_split. What defect did you introduce?',
          options: ['Syntax Error', 'Data Leakage', 'Underfitting', 'Label Noise'],
          correctIndex: 1,
          explanation: 'The scaler calculated the mean and variance of the test set, leaking future distribution statistics into the training fold.'
        }
      },
      {
        id: 'ml_fund_03',
        courseId: 'course_ml_fundamentals',
        order: 3,
        title: '03 Features & Labels',
        subtitle: 'Representing reality in matrices and vector spaces',
        oneLineIntuition: 'Features are the clues; labels are the answers we want the detective to deduce.',
        beginnerExplanation: 'If you want a computer to estimate house prices, features are the square footage, number of bedrooms, and zip code. The label is the actual closing price.',
        technicalExplanation: 'A sample is represented as a d-dimensional feature vector x in R^d. In supervised learning, each vector has an associated ground-truth target y in Y. Feature representation directly determines the geometric topology of the decision space.',
        mathFormula: {
          latex: '\\mathbf{X} \\in \\mathbb{R}^{N \\times d}, \\quad \\mathbf{y} \\in \\mathbb{R}^N',
          explanation: 'The feature design matrix X has N sample rows and d feature columns; target y is an N-dimensional vector.'
        },
        visualType: 'knn',
        realWorldExample: 'Credit risk modeling: income, debt-to-income ratio, and late payments (features) to predict default probability (label).',
        pythonCode: `import pandas as pd

# Creating a structured feature matrix
data = {
    'sqft': [1200, 1850, 2400, 3100],
    'bedrooms': [2, 3, 3, 4],
    'dist_transit_km': [0.5, 1.2, 3.8, 0.2],
    'price_usd': [350000, 520000, 680000, 890000] # Label
}

df = pd.DataFrame(data)
X = df[['sqft', 'bedrooms', 'dist_transit_km']] # Features
y = df['price_usd']                             # Target Label`,
        codeExplanation: 'Explicit separation of feature columns X and target column y ready for vector matrix operations.',
        commonMistakes: [
          'Including identifiers like user_id or transaction_id as predictive numerical features.',
          'Leaving high-cardinality categorical features unencoded.',
          'Failing to handle collinearity among correlated features.'
        ],
        interviewQuestions: [
          'What is the Curse of Dimensionality, and how does it affect distance-based algorithms like KNN?',
          'How do you handle categorical variables with 100,000 unique categories in high-scale models?'
        ],
        miniChallenge: {
          question: 'If you double the number of dimensions in a feature space without increasing sample count, what happens to the density of the space?',
          options: ['Increases exponentially', 'Stays constant', 'Decreases exponentially (becomes sparse)', 'Becomes purely gaussian'],
          correctIndex: 2,
          explanation: 'The volume of high-dimensional space grows exponentially, causing samples to become extremely sparse.'
        }
      },
      {
        id: 'ml_fund_04',
        courseId: 'course_ml_fundamentals',
        order: 4,
        title: '04 Linear Regression',
        subtitle: 'Ordinary Least Squares, Hyperplanes, and Closed-Form Solutions',
        oneLineIntuition: 'Finding the single straight line (or hyperplane) that minimizes the sum of squared distances to all data points.',
        beginnerExplanation: 'Imagine scattering coins on a table. You lay down a laser ruler so that the total squared distance between every coin and the ruler is as small as mathematically possible.',
        technicalExplanation: 'Linear Regression models the relationship between dependent scalar y and independent vector x via y = w^T x + b + ε. Under Gauss-Markov assumptions, the Ordinary Least Squares (OLS) estimator is BLUE (Best Linear Unbiased Estimator).',
        mathFormula: {
          latex: '\\mathbf{w}^* = (\\mathbf{X}^T \\mathbf{X})^{-1} \\mathbf{X}^T \\mathbf{y}',
          explanation: 'The closed-form Normal Equation for optimal weights minimizing sum of squared residuals.'
        },
        visualType: 'linear_regression',
        realWorldExample: 'Predicting car fuel efficiency (MPG) based on engine displacement and curb weight.',
        pythonCode: `import numpy as np

# Synthetic linear dataset
np.random.seed(42)
X = 2 * np.random.rand(100, 1)
y = 4 + 3 * X + np.random.randn(100, 1) * 0.5

# Add bias intercept column x0 = 1
X_b = np.c_[np.ones((100, 1)), X]

# Compute closed-form Normal Equation: w = (X^T * X)^(-1) * X^T * y
theta_best = np.linalg.inv(X_b.T.dot(X_b)).dot(X_b.T).dot(y)

print(f"Intercept: {theta_best[0][0]:.3f}, Slope: {theta_best[1][0]:.3f}")`,
        codeExplanation: 'Calculates the analytical global minimum directly via matrix multiplication and inversion.',
        commonMistakes: [
          'Using the Normal Equation when feature count d > 10,000 (matrix inversion is O(d^3)).',
          'Not checking for non-linear residual patterns after fitting.',
          'Treating R² as proof of causality.'
        ],
        interviewQuestions: [
          'Derive the Normal Equation from the Mean Squared Error loss function.',
          'Why does Scikit-Learn use SVD instead of np.linalg.inv in LinearRegression?'
        ],
        miniChallenge: {
          question: 'What is the computational complexity of computing (X^T X)^(-1) when X has d features?',
          options: ['O(d)', 'O(d log d)', 'O(d^3)', 'O(2^d)'],
          correctIndex: 2,
          explanation: 'Standard matrix inversion requires approximately O(d^3) arithmetic operations, which becomes intractable for large feature sets.'
        }
      },
      {
        id: 'ml_fund_05',
        courseId: 'course_ml_fundamentals',
        order: 5,
        title: '05 Gradient Descent',
        subtitle: 'The universal optimization engine of modern Artificial Intelligence',
        oneLineIntuition: 'Walking down a foggy mountain by feeling the slope under your feet and stepping in the direction that descends fastest.',
        beginnerExplanation: 'You are blindfolded on a hillside. To find the valley, you feel the slope with your shoes and take a step downhill. Repeat this 1,000 times, and you reach the lowest point.',
        technicalExplanation: 'Gradient Descent is a first-order iterative optimization algorithm for finding a local minimum of a differentiable function. Parameters θ are updated iteratively along the negative gradient direction scaled by learning rate η.',
        mathFormula: {
          latex: '\\theta_{t+1} = \\theta_t - \\eta \\nabla_\\theta J(\\theta_t)',
          explanation: 'Parameter vector at step t+1 is updated by subtracting the gradient multiplied by learning rate η.'
        },
        visualType: 'gradient_descent',
        realWorldExample: 'Training billion-parameter neural networks using Adam/SGD optimizers.',
        pythonCode: `import numpy as np

# Objective: Minimize J(w) = w^2 - 4w + 4 (Minimum at w=2)
def loss_func(w): return w**2 - 4*w + 4
def gradient_func(w): return 2*w - 4

w = 10.0 # Initial guess far away
learning_rate = 0.1
history = [w]

for step in range(25):
    grad = gradient_func(w)
    w = w - learning_rate * grad
    history.append(w)

print(f"Converged w after 25 steps: {w:.5f}") # ~2.00000`,
        codeExplanation: 'Iteratively follows the negative slope until the gradient vanishes to zero at the minimum.',
        commonMistakes: [
          'Setting the learning rate too high, causing catastrophic divergence (loss explodes to NaN).',
          'Setting the learning rate too low, causing training to stall indefinitely.',
          'Failing to normalize features before running gradient descent, leading to elongated canyon contours.'
        ],
        interviewQuestions: [
          'Compare Batch Gradient Descent, Mini-Batch GD, and Stochastic Gradient Descent (SGD).',
          'How does Momentum solve the oscillation problem in ill-conditioned loss surfaces?'
        ],
        miniChallenge: {
          question: 'If your loss suddenly jumps to NaN during training with gradient descent, what is the most likely cause?',
          options: ['Learning rate is too large (exploding weights)', 'Dataset has too many samples', 'Learning rate is too small', 'Model is underfitting'],
          correctIndex: 0,
          explanation: 'An overly large learning rate causes consecutive steps to overshoot the minimum, compounding into numeric overflow.'
        }
      },
      {
        id: 'ml_fund_06',
        courseId: 'course_ml_fundamentals',
        order: 6,
        title: '06 Overfitting & Bias-Variance Tradeoff',
        subtitle: 'The fundamental balancing act of machine learning modeling',
        oneLineIntuition: 'Underfitting is being too naive to see patterns; overfitting is mistaking random noise for universal truth.',
        beginnerExplanation: 'Underfitting: A child thinks all animals with 4 legs are dogs. Overfitting: A child thinks a dog is ONLY a brown animal with 4 legs, a blue collar, and exactly 3 spots on its tail.',
        technicalExplanation: 'Expected prediction error decomposes into three irreducible components: Squared Bias (erroneous inductive assumptions), Variance (sensitivity to small fluctuations in the training set), and Irreducible Error (inherent stochastic noise in data generating process).',
        mathFormula: {
          latex: '\\mathbb{E}[(y - \\hat{f}(x))^2] = \\text{Bias}[\\hat{f}(x)]^2 + \\text{Var}[\\hat{f}(x)] + \\sigma^2',
          explanation: 'Total expected mean squared error equals Bias squared plus Model Variance plus irreducible noise σ².'
        },
        visualType: 'neural_net',
        realWorldExample: 'A stock trading bot that perfectly matches historical prices between 2020 and 2024 but loses all money on the first day of real-world trading.',
        pythonCode: `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
import numpy as np

# True function: sine wave with noise
X = np.sort(np.random.rand(30, 1) * 5, axis=0)
y = np.sin(X).ravel() + np.random.randn(30) * 0.2

# 1. Underfitting: Degree 1 (Straight line)
underfit = LinearRegression().fit(X, y)

# 2. Overfitting: Degree 15 (Wild squiggles memorizing noise)
overfit = make_pipeline(PolynomialFeatures(degree=15), LinearRegression()).fit(X, y)

print("Underfit R2 on train:", underfit.score(X, y))
print("Overfit R2 on train:", overfit.score(X, y)) # Higher on train, disastrous on test!`,
        codeExplanation: 'High-degree polynomials have massive capacity and twist wildly to hit every noise point.',
        commonMistakes: [
          'Judging model quality exclusively by training set accuracy.',
          'Believing that gathering more data fixes high bias (underfitting).',
          'Thinking regularizing will cure an underfitting model.'
        ],
        interviewQuestions: [
          'Prove the Bias-Variance decomposition for Mean Squared Error mathematically.',
          'How does bagging reduce variance without increasing bias?'
        ],
        miniChallenge: {
          question: 'If you increase the depth of a Decision Tree from 3 to 25, how do Bias and Variance typically change?',
          options: ['Bias increases, Variance decreases', 'Bias decreases, Variance increases', 'Both decrease', 'Both increase'],
          correctIndex: 1,
          explanation: 'Greater tree depth increases model flexibility, lowering bias on training data but drastically increasing variance on unseen data.'
        }
      },
      {
        id: 'ml_fund_07',
        courseId: 'course_ml_fundamentals',
        order: 7,
        title: '07 Regularization (L1 & L2)',
        subtitle: 'Lasso, Ridge, Sparsity, and Geometric Constrained Optimization',
        oneLineIntuition: 'Placing a tax on complexity: the model is fined whenever its weights become excessively large.',
        beginnerExplanation: 'If you give a detective 50 clues, an unregularized detective uses every bizarre tiny clue. A regularized detective is penalized for each clue used, forcing them to focus only on decisive evidence.',
        technicalExplanation: 'Regularization adds a penalty term R(w) to the empirical risk objective. L2 (Ridge) adds the squared Euclidean norm ||w||_2^2, shrinking weights smoothly toward zero. L1 (Lasso) adds the Manhattan norm ||w||_1, driving non-essential coefficients exactly to zero due to sharp diamond contours.',
        mathFormula: {
          latex: '\\mathcal{L}_{ElasticNet}(w) = \\text{MSE}(w) + \\lambda_1 \\sum_{j=1}^d |w_j| + \\lambda_2 \\sum_{j=1}^d w_j^2',
          explanation: 'Elastic Net loss combining L1 sparsity penalty and L2 shrinkage penalty weighted by hyperparameter λ.'
        },
        visualType: 'linear_regression',
        realWorldExample: 'Genomics: predicting disease risk across 20,000 genes with only 500 patient samples (L1 Lasso selects the top 15 causal genes).',
        pythonCode: `from sklearn.linear_model import Lasso, Ridge
import numpy as np

X = np.random.randn(50, 10)
# Only first 2 features are genuinely causal
y = 3 * X[:, 0] - 2 * X[:, 1] + np.random.randn(50) * 0.1

# L1 Lasso enforces sparse coefficients (zeros out columns 2-9)
lasso = Lasso(alpha=0.2).fit(X, y)
print("Lasso weights (notice zero sparsity):")
print(np.round(lasso.coef_, 2))`,
        codeExplanation: 'Lasso drives the irrelevant feature weights to exactly 0.00, executing embedded feature selection.',
        commonMistakes: [
          'Applying L1/L2 regularization without scaling features first (unscaled features get penalized unfairly).',
          'Using L1 when features are highly correlated (Lasso arbitrarily picks one and discards others).',
          'Confusing Ridge regression with Ordinary Least Squares.'
        ],
        interviewQuestions: [
          'Geometrically explain why L1 produces sparse coefficients while L2 only shrinks them.',
          'What is the Bayesian interpretation of L1 and L2 regularization?'
        ],
        miniChallenge: {
          question: 'Why does L1 regularization (Lasso) produce exactly zero weights for irrelevant features?',
          options: [
            'Its constraint boundary has sharp diamond corners along the coordinate axes',
            'It squares all negative numbers',
            'It uses gradient ascent instead of descent',
            'It ignores the loss function completely'
          ],
          correctIndex: 0,
          explanation: 'The L1 norm level curves are rhomboids (diamonds) whose corners intersect the loss ellipses directly on the coordinate axes where w_j = 0.'
        }
      },
      {
        id: 'ml_fund_08',
        courseId: 'course_ml_fundamentals',
        order: 8,
        title: '08 Decision Trees',
        subtitle: 'Recursive partitioning, Entropy, Information Gain, and Gini Impurity',
        oneLineIntuition: 'Playing a game of 20 Questions where every question cuts the remaining confusion in half.',
        beginnerExplanation: 'Think of a flow chart: "Is salary > $50k?" If yes, "Is credit score > 700?" If yes, approve loan. Each question splits your data into cleaner, purer buckets.',
        technicalExplanation: 'Decision Trees recursively partition the feature space into axis-aligned hyper-rectangles using greedy heuristic splitting criteria such as Gini Impurity or Shannon Entropy (Information Gain).',
        mathFormula: {
          latex: 'H(S) = -\\sum_{c=1}^C p_c \\log_2(p_c), \\quad IG(S, A) = H(S) - \\sum_{v} \\frac{|S_v|}{|S|} H(S_v)',
          explanation: 'Shannon Entropy H(S) measuring disorder, and Information Gain IG measuring entropy reduction after split on attribute A.'
        },
        visualType: 'decision_tree',
        realWorldExample: 'Emergency room triage: patient heart rate and oxygen level directing immediate priority care.',
        pythonCode: `from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.datasets import load_iris

iris = load_iris()
clf = DecisionTreeClassifier(max_depth=3, criterion='gini')
clf.fit(iris.data, iris.target)

# Display tree logic in readable text rules
print(export_text(clf, feature_names=iris.feature_names))`,
        codeExplanation: 'Fits greedy axis-aligned orthogonal cuts to maximize purity at each parent node.',
        commonMistakes: [
          'Allowing trees to grow unconstrained (max_depth=None), creating 100% memorization.',
          'Not pruning (cost-complexity pruning ccp_alpha).',
          'Assuming Decision Trees can extrapolate linear trends outside training ranges (they output constant step predictions).'
        ],
        interviewQuestions: [
          'Why are Decision Trees sensitive to small variations in training data (high variance)?',
          'How does CART handle continuous numerical features during split evaluation?'
        ],
        miniChallenge: {
          question: 'If a node contains 50 class A samples and 50 class B samples, what is its Gini Impurity?',
          options: ['0.0', '0.5', '1.0', '0.25'],
          correctIndex: 1,
          explanation: 'Gini = 1 - (0.5^2 + 0.5^2) = 1 - (0.25 + 0.25) = 0.5 (maximum impurity for binary classification).'
        }
      },
      {
        id: 'ml_fund_09',
        courseId: 'course_ml_fundamentals',
        order: 9,
        title: '09 Random Forests & Ensembling',
        subtitle: 'Wisdom of the crowd: Bagging, Out-of-Bag Error, and Feature Subsampling',
        oneLineIntuition: 'Instead of asking one biased genius, ask 500 diverse specialists and average their votes.',
        beginnerExplanation: 'One person guessing the weight of an ox might be off by 50 pounds. But the average of 500 independent fairgoers is often accurate to within one single pound.',
        technicalExplanation: 'Random Forests combine Bootstrap Aggregating (Bagging) with random feature subspace selection. By training decorrelated trees on bootstrap samples of the training set, the variance of the ensemble decreases as Var_ens = ρ σ² + (1-ρ)/B σ².',
        mathFormula: {
          latex: '\\text{Var}_{\\text{ensemble}} = \\rho \\sigma^2 + \\frac{1 - \\rho}{B} \\sigma^2',
          explanation: 'Ensemble variance depends on tree correlation ρ and number of trees B. Lower correlation ρ shrinks ensemble variance.'
        },
        visualType: 'decision_tree',
        realWorldExample: 'Kaggle competition winning baselines for tabular datasets.',
        pythonCode: `from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=500, n_features=15, n_informative=8, random_state=42)

# B=100 trees, random subset of features sqrt(d) at each split
rf = RandomForestClassifier(n_estimators=100, max_features='sqrt', oob_score=True)
rf.fit(X, y)

print(f"Out-of-Bag (OOB) Generalization Score: {rf.oob_score_:.4f}")`,
        codeExplanation: 'Trains 100 decorrelated trees and evaluates generalization on out-of-bag samples without a separate validation split.',
        commonMistakes: [
          'Thinking increasing the number of trees (n_estimators) causes overfitting (it stabilizes asymptotic variance).',
          'Forgetting that tree ensembles cannot extrapolate beyond the min/max values seen in training features.',
          'Ignoring feature correlation when interpreting feature importances.'
        ],
        interviewQuestions: [
          'Why does subsampling features at each split decorrelate individual trees better than bagging alone?',
          'What is Out-Of-Bag (OOB) error, and why is it an unbiased estimate of generalization?'
        ],
        miniChallenge: {
          question: 'What percentage of unique training samples does an individual bootstrap sample typically contain?',
          options: ['50%', '~63.2%', '95%', '100%'],
          correctIndex: 1,
          explanation: 'As N -> infinity, the probability a sample is selected in N draws with replacement is 1 - (1 - 1/N)^N ≈ 1 - 1/e ≈ 63.2%.'
        }
      },
      {
        id: 'ml_fund_10',
        courseId: 'course_ml_fundamentals',
        order: 10,
        title: '10 Model Evaluation & Diagnostics',
        subtitle: 'Precision, Recall, F1, ROC-AUC, PR-Curves, and Calibration',
        oneLineIntuition: 'Accuracy is a dangerous illusion when finding needles in a haystack.',
        beginnerExplanation: 'If only 1 in 1,000 credit card swipes is fraud, a lazy model that predicts "NOT FRAUD" every single time has 99.9% accuracy, yet catches zero criminals!',
        technicalExplanation: 'Model evaluation must align with operational cost matrices. The confusion matrix yields Precision = TP/(TP+FP) and Recall = TP/(TP+FN). ROC curves plot TPR against FPR across all decision thresholds; PR curves are strictly preferred under severe class imbalance.',
        mathFormula: {
          latex: 'F_\\beta = (1 + \\beta^2) \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\beta^2 \\text{Precision} + \\text{Recall}}',
          explanation: 'Generalized F-beta score: β=1 weights precision and recall equally; β=2 weights recall higher (e.g. cancer detection).'
        },
        visualType: 'logistic_regression',
        realWorldExample: 'Airport security scanners: calibrated for near 100% recall even if precision requires secondary bag searches.',
        pythonCode: `from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import numpy as np

y_true = np.array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1])
y_probs = np.array([0.05, 0.1, 0.15, 0.2, 0.08, 0.12, 0.85, 0.3, 0.92, 0.78])
y_pred = (y_probs >= 0.5).astype(int)

print("Confusion Matrix:\n", confusion_matrix(y_true, y_pred))
print("ROC-AUC Score:", roc_auc_score(y_true, y_probs))
print(classification_report(y_true, y_pred, target_names=['Normal', 'Anomaly']))`,
        codeExplanation: 'Full diagnostic reporting across precision, recall, f1-score, and threshold-independent ROC-AUC.',
        commonMistakes: [
          'Using accuracy as the primary KPI on imbalanced datasets (e.g. 99:1 ratio).',
          'Deploying a default 0.5 decision threshold without tuning for asymmetric business costs.',
          'Evaluating models on uncalibrated predicted probabilities.'
        ],
        interviewQuestions: [
          'When would you strictly choose the Precision-Recall AUC over ROC-AUC?',
          'How do you choose the optimal decision threshold when a False Negative costs $5,000 and a False Positive costs $10?'
        ],
        miniChallenge: {
          question: 'In a medical cancer screening test, which metric is the most critical to maximize to avoid letting sick patients go untreated?',
          options: ['Precision', 'Recall (Sensitivity)', 'Specificity', 'Accuracy'],
          correctIndex: 1,
          explanation: 'Recall measures the fraction of actual positives detected. High recall minimizes catastrophic False Negatives.'
        }
      }
    ]
  },
  NUMPY_MODULE,
  PANDAS_MODULE,
  ML_ALGORITHMS_MODULE,
  {
    id: 'course_sklearn_mastery',
    title: 'Scikit-Learn Production Pipelines & Estimators',
    track: 'Production ML Engineering Track',
    description: 'Master the Estimator API, ColumnTransformers, leakage-proof Pipelines, and cross-validation.',
    lessons: [
      {
        id: 'sklearn_01',
        courseId: 'course_sklearn_mastery',
        order: 1,
        title: '01 The Unified Estimator API Contract',
        subtitle: 'Fit, transform, predict, and the stateless vs stateful design pattern',
        oneLineIntuition: 'Every machine learning algorithm in scikit-learn adheres to three simple rules: fit learns, transform reshapes, and predict decides.',
        beginnerExplanation: 'Instead of having to learn a completely different set of buttons for 100 different machine learning models, scikit-learn gives them all the exact same steering wheel: call .fit() to train, and .predict() to test.',
        technicalExplanation: 'Scikit-learn defines three primary interfaces: Estimators (implement `fit(X, y)` and store learned parameters with trailing underscores like `coef_`), Transformers (implement `transform(X)` and `fit_transform(X)`), and Predictors (implement `predict(X)` and `predict_proba(X)`). Stateless transformers require no parameters during fit.',
        mathFormula: {
          latex: '\\hat{\\theta} = \\text{Estimator.fit}(X_{train}, y_{train}) \\implies \\hat{y} = \\text{Predictor.predict}(X_{test})',
          explanation: 'Parameter estimation followed by inference evaluation on unseen test samples.'
        },
        visualType: 'logistic_regression',
        realWorldExample: 'Standardizing internal tooling across 50 data science teams at a tech enterprise using a unified API.',
        pythonCode: `from sklearn.base import BaseEstimator, TransformerMixin
import numpy as np

# Creating a production-ready custom transformer
class LogTransformer(BaseEstimator, TransformerMixin):
    def __init__(self, offset=1.0):
        self.offset = offset
        
    def fit(self, X, y=None):
        # Stateless: no parameters to learn from data
        return self
        
    def transform(self, X):
        return np.log1p(np.maximum(0, X + self.offset))

# Test with numpy matrix
X = np.array([[0.0, 10.0], [5.0, 100.0]])
transformer = LogTransformer()
X_trans = transformer.fit_transform(X)
print("Transformed Log Values:\n", np.round(X_trans, 3))`,
        codeExplanation: 'Inheriting from BaseEstimator and TransformerMixin guarantees instant compatibility with GridSearchCV and Pipelines.',
        commonMistakes: [
          'Calling .fit_transform() on the test set (which re-fits parameters on test data!).',
          'Not including trailing underscores for learned parameters (e.g. self.mean_ vs self.mean).',
          'Mutating input array X in-place inside transform instead of returning a fresh copy.'
        ],
        interviewQuestions: [
          'Why does Scikit-Learn distinguish between .fit() and .transform(), and why is fit_transform faster than calling them separately?',
          'How do you write a custom Scikit-Learn transformer that can be safely serialized with pickle or joblib?'
        ],
        miniChallenge: {
          question: 'What is wrong with executing: scaler.fit(X_test); X_test_scaled = scaler.transform(X_test)?',
          options: [
            'It throws a syntax error',
            'It causes data leakage by recalibrating scaling on test distribution instead of training parameters',
            'It creates infinite values',
            'Nothing, this is standard practice'
          ],
          correctIndex: 1,
          explanation: 'The test set must ONLY be transformed using parameters (mean/std) learned strictly from the training set.'
        }
      },
      {
        id: 'sklearn_02',
        courseId: 'course_sklearn_mastery',
        order: 2,
        title: '02 Leakage-Proof Pipelines & ColumnTransformers',
        subtitle: 'Chaining heterogeneous categorical and numerical preprocessors cleanly',
        oneLineIntuition: 'A Pipeline binds preprocessing and modeling into a single atomic object that guarantees zero data leakage.',
        beginnerExplanation: 'Think of a Pipeline as an automated assembly line: dirty raw data goes in one end, goes through washing, peeling, and cutting in exact order, and comes out as a finished pie without any chef having to touch it by hand.',
        technicalExplanation: 'ColumnTransformer maps sub-pipelines to subsets of columns (e.g., OneHotEncoder to categorical features, RobustScaler to numerical features). When combined with Pipeline, calling `pipeline.fit(X_train, y_train)` fits all scalers and encoders on training folds only. During cross-validation, transformers are re-fit inside each CV fold, eliminating leakage.',
        mathFormula: {
          latex: 'f_{pipeline}(x) = f_{model}\\left(\\phi_{num}(x_{num}) \\oplus \\phi_{cat}(x_{cat})\\right)',
          explanation: 'Concatenation of specialized feature transformations passed directly to the final estimator.'
        },
        visualType: 'logistic_regression',
        realWorldExample: 'Bank credit scoring: processing applicant income (numeric) and employment sector (categorical) in one leakage-free pipeline.',
        pythonCode: `from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
import pandas as pd
import numpy as np

# Heterogeneous dataset
X = pd.DataFrame({
    'age': [25, 45, np.nan, 35],
    'income': [50000, 120000, 80000, 75000],
    'country': ['US', 'DE', 'US', 'FR']
})
y = np.array([0, 1, 1, 0])

# Preprocessing pipelines
num_pipe = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

cat_pipe = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('encoder', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer([
    ('num', num_pipe, ['age', 'income']),
    ('cat', cat_pipe, ['country'])
])

# Full model pipeline
full_pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', LogisticRegression())
])

full_pipeline.fit(X, y)
print("Pipeline successfully fitted on heterogeneous features!")`,
        codeExplanation: 'ColumnTransformer cleanly routes numerical and categorical columns to separate pipelines, preventing leakage.',
        commonMistakes: [
          'Pre-encoding categorical columns with pandas get_dummies before cross-validation (causes mismatch if new categories appear in test!).',
          'Using OneHotEncoder without handle_unknown="ignore", which crashes on unseen production categories.',
          'Not using FeatureUnion or ColumnTransformer when dealing with text, numeric, and tabular signals together.'
        ],
        interviewQuestions: [
          'Why does pd.get_dummies() cause severe production defects compared to sklearn OneHotEncoder?',
          'How does wrapping preprocessing in a Pipeline prevent subtle data leakage during K-Fold Cross Validation?'
        ],
        miniChallenge: {
          question: 'If a category exists in the test set that was never seen during training, what setting in OneHotEncoder prevents an exception?',
          options: ['drop="first"', 'handle_unknown="ignore"', 'sparse=True', 'dtype=int'],
          correctIndex: 1,
          explanation: 'handle_unknown="ignore" silently encodes unseen categories as all-zeros across one-hot output vectors.'
        }
      },
      {
        id: 'sklearn_03',
        courseId: 'course_sklearn_mastery',
        order: 3,
        title: '03 Hyperparameter Tuning & Cross-Validation',
        subtitle: 'GridSearchCV, RandomizedSearchCV, StratifiedKFold, and Nested CV',
        oneLineIntuition: 'Tuning hyperparameters without cross-validation is like grading an exam using only the answer key you memorized.',
        beginnerExplanation: 'Instead of guessing whether a model needs 5 trees or 50 trees, we tell the computer to test 20 different combinations across 5 independent practice tests and automatically pick the combination that performed best overall.',
        technicalExplanation: 'GridSearchCV performs exhaustive cartesian search over specified parameter grids. RandomizedSearchCV samples from specified probability distributions (exponentially more efficient for high-dimensional hyperparameter spaces according to Bergstra & Bengio, 2012). StratifiedKFold maintains class proportions in each split.',
        mathFormula: {
          latex: 'CV_{(K)} = \\frac{1}{K} \\sum_{k=1}^K \\mathcal{L}\\left(f_{\\theta}^{(-k)}, D^{(k)}\\right)',
          explanation: 'K-fold cross-validation loss computed by averaging out-of-fold validation scores across all K folds.'
        },
        visualType: 'linear_regression',
        realWorldExample: 'Automated ML hyperparameter tuning in algorithmic trading to avoid backtest overfitting.',
        pythonCode: `from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from scipy.stats import randint, uniform
import numpy as np

# Data
X = np.random.randn(200, 10)
y = np.random.randint(0, 2, size=200)

# Random Search Distribution space
param_dist = {
    'n_estimators': randint(50, 300),
    'max_depth': randint(3, 12),
    'min_samples_split': randint(2, 10)
}

cv_strategy = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

search = RandomizedSearchCV(
    estimator=RandomForestClassifier(random_state=42),
    param_distributions=param_dist,
    n_iter=15,
    cv=cv_strategy,
    scoring='roc_auc',
    n_jobs=-1,
    random_state=42
)

search.fit(X, y)
print("Optimal Hyperparameters:", search.best_params_)
print(f"Mean CV ROC-AUC: {search.best_score_:.4f}")`,
        codeExplanation: 'RandomizedSearchCV searches the continuous parameter space much more effectively than grid search.',
        commonMistakes: [
          'Using plain KFold on imbalanced classification datasets instead of StratifiedKFold.',
          'Reporting the best_score_ from GridSearchCV as your final model generalization performance (Nested CV is required!).',
          'Setting n_jobs=-1 inside both the estimator and the search grid, causing CPU thread contention.'
        ],
        interviewQuestions: [
          'Why does RandomizedSearchCV statistically outperform GridSearchCV for the same computational budget?',
          'What is Nested Cross-Validation, and why is it necessary when tuning hyperparameters to assess unbiased error?'
        ],
        miniChallenge: {
          question: 'If you have 5 hyperparameters and search 4 values for each with 5-fold cross-validation, how many total models will GridSearchCV train?',
          options: ['20 models', '100 models', '1,024 models', '5,120 models (4^5 * 5)'],
          correctIndex: 3,
          explanation: '4^5 = 1,024 parameter combinations * 5 cross-validation folds = 5,120 model trainings.'
        }
      }
    ]
  },
];

export const ML_FUNDAMENTALS_LESSONS: LessonContent[] = COURSE_MODULES[0].lessons;
export const ALL_COURSE_MODULES = COURSE_MODULES;

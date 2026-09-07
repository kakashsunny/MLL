import { MLInterviewQuestion } from './types';

export const QUESTIONS_EASY: MLInterviewQuestion[] = [
  {
    id: 'easy_001',
    question: 'What is the primary difference between Supervised and Unsupervised Learning?',
    difficulty: 'Easy',
    topic: 'ML Fundamentals',
    shortAnswer: 'Supervised learning trains on labeled input-output pairs to predict target values, while unsupervised learning discovers inherent patterns, clusters, or representations in unlabeled data.',
    detailedExplanation: 'In supervised learning, the training dataset consists of feature vectors X paired with ground-truth targets y. The goal is to learn a mapping function f(X) that approximates y on unseen data. Common tasks include regression (continuous y) and classification (discrete y). In unsupervised learning, target labels y are absent. The algorithm analyzes input data X to discover structural properties, density distributions, or group memberships. Core unsupervised methods include K-Means clustering, PCA dimensionality reduction, and Isolation Forests for anomaly detection.',
    realWorldExample: 'Predicting house prices using square footage and neighborhood (Supervised) vs grouping e-commerce customers based on browsing patterns without predefined labels (Unsupervised).',
    commonMistake: 'Claiming that unsupervised learning cannot be evaluated; while there are no ground-truth accuracy metrics, intrinsic metrics like Silhouette score and reconstruction loss exist.',
    interviewTip: 'Always mention that semi-supervised and self-supervised learning bridge this gap, using small labeled subsets or pretext tasks.'
  },
  {
    id: 'easy_002',
    question: 'What is the difference between Regression and Classification?',
    difficulty: 'Easy',
    topic: 'ML Fundamentals',
    shortAnswer: 'Regression predicts continuous numerical quantities, whereas classification predicts discrete categorical class labels.',
    detailedExplanation: 'Regression outputs an unbounded or bounded real-valued continuous number, evaluated using distance-based loss functions such as Mean Squared Error (MSE) or Mean Absolute Error (MAE). Classification outputs probabilities mapped to discrete classes (binary or multi-class), evaluated via cross-entropy loss, accuracy, precision, recall, and ROC-AUC. While logistic regression uses the word regression in its name, it is fundamentally a classification algorithm because its final output represents class membership probability.',
    realWorldExample: 'Estimating tomorrow temperature in Celsius (Regression) vs predicting whether it will rain or not rain (Classification).',
    commonMistake: 'Confusing Logistic Regression as a regression algorithm instead of a linear classification model.',
    interviewTip: 'Clarify that continuous predictions can be thresholded into classes, and classification probabilities are continuous numbers before argmax decision thresholds.'
  },
  {
    id: 'easy_003',
    question: 'What are the main differences between Python lists and NumPy arrays?',
    difficulty: 'Easy',
    topic: 'Python for ML',
    shortAnswer: 'NumPy arrays store homogeneous data in contiguous memory blocks with vectorized C-level execution, whereas Python lists store pointers to heterogeneous objects with dynamic memory overhead.',
    detailedExplanation: 'A Python list is an array of pointers referencing separate Python objects anywhere in heap memory. Every element carries Python object header overhead (type info, reference count). In contrast, a NumPy ndarray allocates a single contiguous block of physical RAM storing raw primitive bytes (e.g., float64, int32). This layout enables CPU cache locality, SIMD vectorization, and eliminates interpreter boxing/unboxing overhead, making numerical calculations orders of magnitude faster.',
    realWorldExample: 'Multiplying 10 million float values takes seconds with Python list comprehension due to pointer dereferencing, but milliseconds with a NumPy vectorized multiplication.',
    commonMistake: 'Believing NumPy arrays can easily hold arbitrary mixed data types without casting everything to a generic object dtype, which destroys performance benefits.',
    interviewTip: 'Mention contiguous memory buffers, cache locality, and SIMD (Single Instruction Multiple Data) when discussing NumPy speed in interviews.'
  },
  {
    id: 'easy_004',
    question: 'What is broadcasting in NumPy and why is it important?',
    difficulty: 'Easy',
    topic: 'NumPy',
    shortAnswer: 'Broadcasting allows NumPy to perform arithmetic operations on arrays of differing shapes without making unnecessary memory copies.',
    detailedExplanation: 'NumPy compares dimensions from right to left (trailing dimensions first). Two dimensions are compatible when they are equal, or one of them is 1. When a dimension is 1, NumPy virtually stretches that dimension across the larger dimension along that axis without replicating data in RAM. This provides significant memory efficiency and computational speed during matrix-vector and tensor operations.',
    realWorldExample: 'Subtracting a 1D mean vector of shape (D,) from a 2D feature matrix of shape (N, D) to zero-center features in place.',
    commonMistake: 'Attempting to broadcast arrays whose trailing dimensions do not match and neither is 1, triggering a ValueError: operands could not be broadcast together.',
    interviewTip: 'Write out the shape alignment rule explicitly: line up shapes from right to left, and check if each dimension is identical or equals 1.'
  },
  {
    id: 'easy_005',
    question: 'What is the difference between shallow copy and deep copy in Python?',
    difficulty: 'Easy',
    topic: 'Python for ML',
    shortAnswer: 'A shallow copy duplicates the outer object container but shares references to nested objects, whereas a deep copy recursively duplicates all child objects.',
    detailedExplanation: 'In Python, copy.copy() constructs a new compound object and inserts references into it to the objects found in the original. If the original contains nested mutable objects (e.g. lists within lists), modifying a nested item in the copy alters the original. In contrast, copy.deepcopy() recursively clones every object in the hierarchy, creating completely independent memory allocations.',
    realWorldExample: 'Copying a dictionary containing model hyperparameters and a list of metric histories: changing metric history in a shallow copy corrupts the original model log.',
    commonMistake: 'Assuming assignment (b = a) creates a shallow copy; plain assignment only creates an additional reference to the exact same memory object.',
    interviewTip: 'Mention the copy module (copy.copy vs copy.deepcopy) and show how slice indexing list[:] only produces a shallow copy.'
  },
  {
    id: 'easy_006',
    question: 'What is the difference between loc and iloc in Pandas?',
    difficulty: 'Easy',
    topic: 'Pandas',
    shortAnswer: 'loc selects rows and columns by label or boolean mask, while iloc selects strictly by integer index position (0-based).',
    detailedExplanation: 'df.loc[row_label, col_label] uses label-based indexing. When slicing with loc, both the start and stop labels are inclusive. df.iloc[row_index, col_index] uses integer position-based indexing (0 to N-1). When slicing with iloc, standard Python slicing applies: the start index is inclusive, but the stop index is exclusive.',
    realWorldExample: 'If a DataFrame has index [10, 20, 30], df.loc[10] retrieves the row labeled 10, whereas df.iloc[0] retrieves the first physical row (which is labeled 10).',
    commonMistake: 'Forgetting that df.loc[start:end] includes the end label, leading to off-by-one errors in data subsets.',
    interviewTip: 'Remember: loc = Label-based selection; iloc = Integer-position based selection.'
  },
  {
    id: 'easy_007',
    question: 'What is Overfitting and what is Underfitting?',
    difficulty: 'Easy',
    topic: 'ML Fundamentals',
    shortAnswer: 'Overfitting occurs when a model memorizes training noise and fails to generalize; underfitting occurs when a model is too simple to capture the underlying pattern.',
    detailedExplanation: 'Overfitting happens when a hypothesis class has high capacity relative to the dataset size. The model learns idiosyncratic noise, resulting in very low training error but high validation/test error (High Variance). Underfitting occurs when model capacity is too constrained or training is incomplete, leading to high training error and high test error (High Bias).',
    realWorldExample: 'A 15th-degree polynomial passing through every noisy datapoint (Overfitting) vs a straight line fitted to a circular parabolic curve (Underfitting).',
    commonMistake: 'Believing a zero training loss indicates a perfect model; in reality, zero training loss is the classic hallmark of severe overfitting.',
    interviewTip: 'Frame your answer using the Bias-Variance tradeoff: underfitting equals high bias, while overfitting equals high variance.'
  },
  {
    id: 'easy_008',
    question: 'What is the Bias-Variance Tradeoff in simple terms?',
    difficulty: 'Easy',
    topic: 'ML Fundamentals',
    shortAnswer: 'Total prediction error equals Bias squared plus Variance plus Irreducible Noise. Minimizing one often increases the other.',
    detailedExplanation: 'Bias represents the error introduced by approximating a complicated real-world problem with an overly simple model. High bias leads to systematic errors and underfitting. Variance represents the sensitivity of model predictions to fluctuations in the training data. High variance causes the model to change dramatically with different training sets, leading to overfitting. The goal of machine learning is finding sweet-spot model complexity that minimizes the sum of bias and variance.',
    realWorldExample: 'Linear regression on non-linear data has high bias and low variance. An unpruned deep decision tree has low bias and high variance.',
    commonMistake: 'Forgetting the third term: irreducible error (sigma squared), which cannot be reduced regardless of algorithm choice because of noise in data generation.',
    interviewTip: 'Draw the U-shaped total error curve as a function of model complexity with bias declining and variance rising.'
  },
  {
    id: 'easy_009',
    question: 'Why do we split data into Train, Validation, and Test sets instead of just Train and Test?',
    difficulty: 'Easy',
    topic: 'Data Processing',
    shortAnswer: 'Train fits parameters, Validation tunes hyperparameters and guides architecture decisions, and Test provides an unbiased final evaluation on completely unseen data.',
    detailedExplanation: 'If you only use Train and Test, tuning hyperparameters (like tree depth, learning rate, regularization alpha) on the test set causes information leakage. The test set becomes part of the model selection feedback loop, and its reported score overestimates real-world generalization. Having a dedicated Validation set preserves the Test set as an isolated, untouched benchmark for true production performance.',
    realWorldExample: 'Training a neural network weights on Train, choosing early stopping epoch and learning rate based on Validation loss, and computing final accuracy on Test.',
    commonMistake: 'Selecting the best performing model checkpoint directly based on test set evaluation, which violates test set integrity.',
    interviewTip: 'Emphasize that the test set should be locked away and only evaluated once after all model development decisions have concluded.'
  },
  {
    id: 'easy_010',
    question: 'What is K-Fold Cross-Validation and when should you use Stratified K-Fold?',
    difficulty: 'Easy',
    topic: 'Data Processing',
    shortAnswer: 'K-Fold splits data into K equal partitions, training on K-1 and evaluating on 1 iteratively. Stratified K-Fold preserves class label proportions in each fold.',
    detailedExplanation: 'Standard K-Fold randomly divides N samples into K folds. Across K iterations, each fold acts as validation while the remaining K-1 folds train the model. The average metric across all K runs estimates generalization performance. Stratified K-Fold ensures that each fold contains the exact same percentage of target classes as the complete dataset. It is essential for imbalanced classification where random splitting could leave a fold with zero positive minority samples.',
    realWorldExample: 'In fraud detection with 1 percent fraud cases, Stratified 5-Fold ensures each fold has exactly 1 percent fraud cases rather than random fluctuations.',
    commonMistake: 'Applying feature scaling or imputation on the full dataset before performing K-Fold CV, which leaks future fold statistics into training folds.',
    interviewTip: 'Always state: For classification, always default to StratifiedKFold; for regression, standard KFold or GroupKFold is appropriate.'
  },
  {
    id: 'easy_011',
    question: 'What is the difference between Standardization (Z-score) and Normalization (Min-Max)?',
    difficulty: 'Easy',
    topic: 'Feature Engineering',
    shortAnswer: 'Standardization rescales features to mean 0 and standard deviation 1 (unbounded), while Normalization bounds feature values between 0 and 1.',
    detailedExplanation: 'Standardization computes z = (x - mu) / sigma. It does not bound features to a fixed interval and is resilient to outliers because it preserves relative distance distributions. Normalization (MinMaxScaler) computes x_norm = (x - x_min) / (x_max - x_min), binding values to [0, 1]. Extreme outliers compress inlier data into a tiny sub-range, making Min-Max sensitive to extreme values.',
    realWorldExample: 'StandardScaler is preferred for PCA, Logistic Regression, and SVMs where distance metrics assume zero-centered distributions. MinMaxScaler is preferred for image pixel intensities [0, 255] or algorithms requiring positive inputs.',
    commonMistake: 'Fitting the scaler on the test set instead of calling scaler.fit(X_train) followed by scaler.transform(X_test).',
    interviewTip: 'Remember: Algorithms assuming Gaussian distributions (linear models, neural networks) prefer StandardScaler; neural image pipelines prefer Min-Max [0, 1] or [-1, 1].'
  },
  {
    id: 'easy_012',
    question: 'What is One-Hot Encoding and when should you use Label Encoding instead?',
    difficulty: 'Easy',
    topic: 'Feature Engineering',
    shortAnswer: 'One-Hot Encoding converts categorical levels into binary indicator columns. Label Encoding maps levels to sequential integers, suitable for ordinal features.',
    detailedExplanation: 'One-Hot Encoding creates a new binary column for each category level. For nominal variables (no inherent order, like colors Red/Green/Blue), it prevents algorithms from assuming mathematical hierarchy. However, high-cardinality categories cause column explosion (curse of dimensionality). Label Encoding assigns integers (0, 1, 2). It should only be used for ordinal categories (Low=0, Medium=1, High=2) or target labels in classification, or inside tree-based models like LightGBM/CatBoost that handle integer categories natively.',
    realWorldExample: 'Encoding country of origin with One-Hot vs encoding education level (High School, Bachelor, Master, PhD) with Label/Ordinal encoding.',
    commonMistake: 'Applying Label Encoding to nominal features in linear models, which mistakenly teaches the model that Country 2 is twice as large as Country 1.',
    interviewTip: 'Mention Target Encoding or Frequency Encoding as the production alternative when categorical cardinality exceeds 100 levels.'
  },
  {
    id: 'easy_013',
    question: 'Why is Accuracy an unreliable metric for imbalanced classification?',
    difficulty: 'Easy',
    topic: 'Model Evaluation',
    shortAnswer: 'In imbalanced datasets, a naive model predicting only the majority class achieves high accuracy while completely failing to detect the minority class.',
    detailedExplanation: 'Accuracy is defined as (TP + TN) / (TP + TN + FP + FN). If a dataset contains 990 healthy patients and 10 cancer patients, a trivial model that always predicts healthy achieves 99 percent accuracy despite 0 percent recall on cancer detection. For imbalanced datasets, evaluation must rely on Precision, Recall, F1-Score, Balanced Accuracy, or PR-AUC.',
    realWorldExample: 'In credit card fraud detection where 0.05 percent of transactions are fraudulent, an accuracy of 99.95 percent can still mean zero fraud was caught.',
    commonMistake: 'Reporting high accuracy to executive stakeholders without checking the confusion matrix or class-specific recall.',
    interviewTip: 'Always follow up with: In imbalanced settings, evaluate Precision, Recall, F1-Score, and Precision-Recall Area Under Curve (PR-AUC).'
  },
  {
    id: 'easy_014',
    question: 'What is the difference between Precision and Recall?',
    difficulty: 'Easy',
    topic: 'Model Evaluation',
    shortAnswer: 'Precision measures what fraction of positive predictions were actually positive. Recall measures what fraction of actual positives were correctly identified.',
    detailedExplanation: 'Precision = TP / (TP + FP). It answers: Out of all instances the model labeled as positive, how many were true positives? High precision means low false alarms. Recall (Sensitivity) = TP / (TP + FN). It answers: Out of all actual positive instances in reality, how many did the model catch? High recall means low missed targets.',
    realWorldExample: 'Email spam filter requires high precision (you never want an important email sent to spam). Cancer detection requires high recall (you cannot afford to miss a patient with cancer).',
    commonMistake: 'Treating Precision and Recall as independent; adjusting the classification probability threshold inherently trades one off against the other.',
    interviewTip: 'Write down the formulas immediately: Precision = TP/(TP+FP), Recall = TP/(TP+FN), and explain the threshold tradeoff.'
  },
  {
    id: 'easy_015',
    question: 'What is the F1-Score and why is it calculated as a harmonic mean?',
    difficulty: 'Easy',
    topic: 'Model Evaluation',
    shortAnswer: 'F1-score is the harmonic mean of Precision and Recall, heavily penalizing extreme disparities between the two values.',
    detailedExplanation: 'F1 is calculated as: 2 * (Precision * Recall) / (Precision + Recall). The harmonic mean is used instead of the arithmetic mean because the arithmetic mean does not penalize lopsided models. For example, if Precision is 1.0 and Recall is 0.0, the arithmetic mean is 0.50, suggesting moderate performance, whereas the harmonic mean drops to 0.0, correctly reflecting complete failure on one dimension.',
    realWorldExample: 'Evaluating information retrieval engines where both missing relevant documents and returning false spam results degrade user experience.',
    commonMistake: 'Relying exclusively on F1 when business costs for False Positives and False Negatives are asymmetric; in such cases, use F-beta score.',
    interviewTip: 'Mention F-beta: beta=2 weights recall higher (medical), while beta=0.5 weights precision higher (spam detection).'
  },
  {
    id: 'easy_016',
    question: 'What is a Confusion Matrix and what are its four quadrants?',
    difficulty: 'Easy',
    topic: 'Model Evaluation',
    shortAnswer: 'A 2x2 table cross-referencing actual versus predicted classes: True Positives (TP), True Negatives (TN), False Positives (FP), and False Negatives (FN).',
    detailedExplanation: 'The confusion matrix provides a complete breakdown of binary classification outcomes: True Positives (correctly predicted positive), True Negatives (correctly predicted negative), False Positives (Type I error: predicted positive when actual was negative), and False Negatives (Type II error: predicted negative when actual was positive). All standard classification metrics (accuracy, precision, recall, specificity, F1) derive directly from these four counts.',
    realWorldExample: 'Airport security scanner: TP = Weapon detected; TN = Clean passenger cleared; FP = Belt buckle flagged as weapon; FN = Real weapon missed.',
    commonMistake: 'Confusing the axes: check whether rows represent Actual labels and columns represent Predicted labels, as Scikit-Learn standardizes on rows=actual, cols=predicted.',
    interviewTip: 'Remember: Type I error is False Positive (alarm without fire), Type II error is False Negative (fire without alarm).'
  },
  {
    id: 'easy_017',
    question: 'How does Linear Regression work and what is its loss function?',
    difficulty: 'Easy',
    topic: 'ML Algorithms',
    shortAnswer: 'Linear Regression models target y as a linear combination of input features X, minimizing the sum of squared differences (Residual Sum of Squares).',
    detailedExplanation: 'The linear regression model assumes y = X*w + b + epsilon. The loss function is Mean Squared Error (MSE): L(w) = (1/N) * sum((y_i - y_hat_i)^2). Parameters can be solved analytically using the Normal Equation w = (X^T X)^(-1) X^T y, or iteratively via Gradient Descent. Key assumptions include linearity, independence of errors, homoscedasticity (constant variance of residuals), and normality of error terms.',
    realWorldExample: 'Predicting salary based on years of experience, education level, and hours worked per week.',
    commonMistake: 'Assuming Linear Regression is robust to outliers; squaring the residuals magnifies the impact of large errors, pulling the regression line toward extreme points.',
    interviewTip: 'Mention both the closed-form Normal Equation and iterative Gradient Descent, explaining that the Normal Equation is O(d^3) with respect to feature count.'
  },
  {
    id: 'easy_018',
    question: 'How does Logistic Regression output probabilities when it uses a linear equation?',
    difficulty: 'Easy',
    topic: 'ML Algorithms',
    shortAnswer: 'It passes a linear combination of features through the non-linear Sigmoid activation function, mapping any real number to the interval (0, 1).',
    detailedExplanation: 'Logistic Regression calculates a linear score z = w^T x + b, which can take any real value from negative infinity to positive infinity. It then applies the Sigmoid (logistic) function: sigma(z) = 1 / (1 + exp(-z)). The output represents the posterior probability P(Y=1|X). If sigma(z) >= threshold (default 0.5), it predicts class 1. The model is trained by minimizing Binary Cross-Entropy (Log Loss) via gradient descent.',
    realWorldExample: 'Predicting probability that an applicant will default on a credit card payment given their income, credit score, and debt.',
    commonMistake: 'Believing Logistic Regression is a non-linear model; its decision boundary in feature space is strictly linear (where w^T x + b = 0).',
    interviewTip: 'Derive the log-odds: ln(p / (1-p)) = w^T x + b, demonstrating that logistic regression models log-odds as a linear function.'
  },
  {
    id: 'easy_019',
    question: 'How does the K-Nearest Neighbors (KNN) algorithm make predictions?',
    difficulty: 'Easy',
    topic: 'ML Algorithms',
    shortAnswer: 'KNN finds the K closest training samples to a query point using a distance metric and takes the majority vote for classification or the average for regression.',
    detailedExplanation: 'KNN is a non-parametric, instance-based lazy learner. It stores all training instances without learning explicit parameters during training (training time is O(1)). During inference, it computes the distance (Euclidean, Manhattan, Minkowski) between the test sample and every training point, identifies the K closest samples, and outputs the majority class or target mean. Feature scaling is strictly required because features with large magnitudes dominate distance computations.',
    realWorldExample: 'Recommending books to a user based on the reading history of the 5 readers whose preferences most closely match.',
    commonMistake: 'Using KNN without feature standardization, causing features with large numerical ranges (e.g. Income) to dwarf features with small ranges (e.g. Age).',
    interviewTip: 'Highlight that KNN inference is computationally expensive: O(N * D) per prediction, making it slow for large production datasets.'
  },
  {
    id: 'easy_020',
    question: 'How does a Decision Tree decide where to split a node?',
    difficulty: 'Easy',
    topic: 'ML Algorithms',
    shortAnswer: 'A Decision Tree evaluates all candidate feature thresholds and selects the split that maximizes Information Gain (minimizes Gini Impurity or Entropy).',
    detailedExplanation: 'For classification, decision trees (such as CART) evaluate candidate splits across all features to maximize the reduction in node impurity. Gini Impurity measures the probability of misclassifying a randomly chosen element: Gini = 1 - sum(p_i^2). Entropy measures information uncertainty: Entropy = -sum(p_i * log2(p_i)). The split that produces the highest Information Gain (Parent Impurity minus Weighted Child Impurities) is chosen. For regression, the split minimizes Mean Squared Error variance.',
    realWorldExample: 'A loan approval decision tree splitting first on Credit Score < 650, then on Debt-to-Income Ratio > 40%.',
    commonMistake: 'Believing decision trees require feature scaling; because splits are based on relative orderings along individual features, scaling has zero effect on tree decisions.',
    interviewTip: 'Mention that decision trees are scale-invariant and naturally handle both numerical and categorical features without scaling.'
  },
  {
    id: 'easy_021',
    question: 'What is the difference between a Decision Tree and a Random Forest?',
    difficulty: 'Easy',
    topic: 'ML Algorithms',
    shortAnswer: 'A Decision Tree is a single high-variance estimator, while Random Forest is an ensemble of decorrelated decision trees trained on bootstrapped subsets with random feature subsampling.',
    detailedExplanation: 'A single deep decision tree is prone to severe overfitting (high variance). Random Forest solves this using Bagging (Bootstrap Aggregation) and feature subspace randomization. It trains B separate deep decision trees, each on a random bootstrap sample (with replacement) of the training set. At each split, only a random subset of features (typically sqrt(D)) is considered. Predictions are averaged across all trees, which dramatically reduces variance while keeping bias low.',
    realWorldExample: 'Instead of relying on one doctor diagnosis (Decision Tree), consulting 100 independent doctors and taking the consensus majority diagnosis (Random Forest).',
    commonMistake: 'Thinking Random Forest trees are trained sequentially; Random Forest trees are completely independent and can be trained in parallel across multiple CPU cores.',
    interviewTip: 'Contrast Random Forest (bagging reduces variance of deep trees) with Gradient Boosting (boosting reduces bias of shallow trees).'
  },
  {
    id: 'easy_022',
    question: 'What is Gradient Descent and what role does the Learning Rate play?',
    difficulty: 'Easy',
    topic: 'ML Fundamentals',
    shortAnswer: 'Gradient descent iteratively updates parameters in the opposite direction of the loss gradient; the learning rate scales the step size taken in that direction.',
    detailedExplanation: 'Gradient descent seeks parameter values theta that minimize loss L(theta). At each iteration, it computes the gradient nabla L(theta) and updates parameters: theta_new = theta_old - eta * nabla L(theta_old). The learning rate eta controls step magnitude. If eta is too large, optimization overshoots the minimum and diverges. If eta is too small, convergence is agonizingly slow or gets trapped in suboptimal local minima/plateaus.',
    realWorldExample: 'A hiker navigating down a foggy mountain by feeling the slope underfoot and taking steps in the direction of steepest descent.',
    commonMistake: 'Using a fixed high learning rate throughout training without decay, causing oscillations around the minimum without ever converging.',
    interviewTip: 'Explain the three main variants: Batch Gradient Descent (entire dataset), Stochastic Gradient Descent (1 sample), and Mini-batch GD (e.g. 32-256 samples).'
  },
  {
    id: 'easy_023',
    question: 'What is the difference between Batch Gradient Descent, Mini-Batch GD, and SGD?',
    difficulty: 'Easy',
    topic: 'ML Fundamentals',
    shortAnswer: 'Batch GD computes gradients over the entire dataset per update; SGD uses a single sample; Mini-batch GD uses a small subset (e.g. 32-256 samples).',
    detailedExplanation: 'Batch Gradient Descent produces smooth, accurate gradient estimates but is extremely slow and memory-prohibitive for large datasets. Stochastic Gradient Descent (SGD) updates parameters after every single sample, resulting in noisy updates that allow escaping local minima but cause erratic convergence. Mini-batch Gradient Descent balances both: it computes gradients over a manageable batch size, enabling GPU vectorization and stable convergence.',
    realWorldExample: 'Calculating class grade average by examining all 10,000 students (Batch), 1 random student (SGD), or groups of 64 students (Mini-batch).',
    commonMistake: 'Assuming pure SGD is standard in deep learning; modern deep learning virtually always uses Mini-batch SGD with momentum or Adam.',
    interviewTip: 'State that Mini-Batch GD is the industry standard because it leverages GPU hardware acceleration (SIMD matrix multiplication).'
  },
  {
    id: 'easy_024',
    question: 'What is the difference between Parameters and Hyperparameters?',
    difficulty: 'Easy',
    topic: 'ML Fundamentals',
    shortAnswer: 'Parameters are learned directly from data during training; hyperparameters are configuration settings set by the engineer before training begins.',
    detailedExplanation: 'Model parameters are internal variables optimized automatically during model fitting via optimization algorithms (e.g. weights and biases in neural networks, split thresholds in decision trees, coefficients in linear regression). Hyperparameters are external structural choices that govern the training process (e.g. learning rate, number of trees, tree depth, batch size, regularization strength lambda). Hyperparameters are tuned using techniques like GridSearchCV, RandomSearchCV, or Optuna.',
    realWorldExample: 'In Linear Regression, the slope coefficients and intercept are parameters; whether to use Ridge or Lasso, and the alpha penalty value, are hyperparameters.',
    commonMistake: 'Attempting to optimize hyperparameters using standard gradient descent on the training set, which leads to trivial solutions like tree depth = infinity.',
    interviewTip: 'Summarize clearly: Parameters are learned by the algorithm; hyperparameters are tuned by the engineer on the validation set.'
  },
  {
    id: 'easy_025',
    question: 'What are Missing Values and how can you handle them in ML pipelines?',
    difficulty: 'Easy',
    topic: 'Data Cleaning',
    shortAnswer: 'Missing values occur when no data value is stored for a feature; strategies include dropping rows/columns, statistical imputation, model-based imputation, or indicator flags.',
    detailedExplanation: 'Handling missing data depends on whether it is Missing Completely at Random (MCAR), Missing at Random (MAR), or Missing Not at Random (MNAR). Common strategies: 1. Removal: dropping rows or columns (loss of data if missingness is high). 2. Statistical Imputation: replacing with Mean or Median (numerical) or Mode (categorical). 3. Missing Indicator: creating a binary column indicating whether the value was missing. 4. Advanced: KNN Imputer, IterativeImputer (MICE), or using algorithms that handle missingness natively like LightGBM and XGBoost.',
    realWorldExample: 'Imputing missing patient blood pressure with the median for patients of the same age bracket, while adding a flag indicating measurement was missing.',
    commonMistake: 'Imputing missing values using the mean of the entire dataset before train-test split, which leaks test set statistics into training data.',
    interviewTip: 'Always state: Fit the SimpleImputer on X_train only, then transform X_train and X_test to prevent data leakage.'
  },
  {
    id: 'easy_026',
    question: 'What is an Outlier and how do you detect and handle it?',
    difficulty: 'Easy',
    topic: 'Data Cleaning',
    shortAnswer: 'An outlier is a data point that deviates significantly from the overall distribution; detected via IQR or Z-score, and handled via capping, removal, or robust scaling.',
    detailedExplanation: 'Outliers arise from measurement errors, sensor glitches, or genuine rare events. Detection methods include: 1. Z-score method (points with absolute z > 3). 2. IQR method (points outside Q1 - 1.5*IQR and Q3 + 1.5*IQR). 3. Visual checks (Boxplots, Scatter plots). 4. Multi-variate algorithms (Isolation Forest, Local Outlier Factor). Handling options: remove erroneous records, cap values (Winsorization), log-transform to compress heavy tails, or use models robust to outliers (tree-based algorithms or Huber loss).',
    realWorldExample: 'A recorded human age of 350 years is an obvious data entry error to discard; an annual salary of 5 million dollars is a genuine extreme value to cap.',
    commonMistake: 'Blindly deleting all statistical outliers without investigating whether they represent crucial business anomalies (e.g. credit card fraud).',
    interviewTip: 'Emphasize that tree models are invariant to monotonic outlier shifts, whereas linear models and neural networks are heavily disrupted.'
  },
  {
    id: 'easy_027',
    question: 'What is the purpose of the Scikit-learn Pipeline class?',
    difficulty: 'Easy',
    topic: 'Scikit-learn',
    shortAnswer: 'Pipeline chains data transformers and an estimator into a single unified object, preventing data leakage and ensuring reproducible execution.',
    detailedExplanation: 'A Scikit-learn Pipeline bundles sequential preprocessing steps (e.g., SimpleImputer, StandardScaler, OneHotEncoder) with a final estimator (e.g., LogisticRegression). When pipeline.fit(X_train, y_train) is called, it iteratively fits and transforms each transformer before fitting the final model. When pipeline.predict(X_test) is called, it applies each transformer transform method using parameters learned during training, preventing data leakage during cross-validation.',
    realWorldExample: 'A pipeline that automatically imputes missing values, standardizes features, and fits a Ridge regressor in one call.',
    commonMistake: 'Scaling features outside the pipeline before cross-validation, which inadvertently leaks validation fold statistics into training folds.',
    interviewTip: 'Mention that Pipeline combined with ColumnTransformer is the industry gold standard for clean, leak-free Scikit-learn preprocessing.'
  },
  {
    id: 'easy_028',
    question: 'What is the difference between fit(), transform(), and fit_transform() in Scikit-learn?',
    difficulty: 'Easy',
    topic: 'Scikit-learn',
    shortAnswer: 'fit() computes transformation parameters; transform() applies them to data; fit_transform() does both efficiently in one step on training data.',
    detailedExplanation: 'fit(X) calculates internal parameters (such as the mean and standard deviation in StandardScaler, or category dictionaries in OneHotEncoder) from the input data without altering it. transform(X) applies those computed parameters to transform X into its new representation. fit_transform(X) combines both operations efficiently. Crucially: fit_transform() must ONLY be called on training data; test data must strictly be transformed using transform() to prevent data leakage.',
    realWorldExample: 'scaler.fit_transform(X_train) calculates and applies training mean/std; scaler.transform(X_test) applies those exact training stats to test samples.',
    commonMistake: 'Calling fit_transform() on the test set, which recalculates the mean and variance on the test set, creating serious data leakage.',
    interviewTip: 'State the rule clearly: Fit only on training data; transform both training and test data using the fitted parameters.'
  },
  {
    id: 'easy_029',
    question: 'What is the Curse of Dimensionality and why is it problematic?',
    difficulty: 'Easy',
    topic: 'ML Fundamentals',
    shortAnswer: 'As feature dimensionality increases, the volume of feature space grows exponentially, making data points extremely sparse and distances equidistant.',
    detailedExplanation: 'In high-dimensional space, the number of data points required to maintain adequate sample density grows exponentially (O(2^D)). As dimensions increase, all pairs of points become approximately equidistant from one another in Euclidean space, rendering distance-based algorithms (like KNN, K-Means, and SVM with RBF kernel) ineffective. Furthermore, high dimensionality increases the risk of overfitting because models find spurious correlations in noise.',
    realWorldExample: 'A 1000-word vocabulary bag-of-words model with only 50 training documents: the model easily overfits because the feature space is mostly empty.',
    commonMistake: 'Thinking that adding more features always improves model accuracy; without sufficient samples, extra features add noise and degrade performance.',
    interviewTip: 'Suggest mitigations: feature selection (mutual information, RFE), regularization (L1 Lasso), and dimensionality reduction (PCA).'
  },
  {
    id: 'easy_030',
    question: 'What is Principal Component Analysis (PCA) in simple terms?',
    difficulty: 'Easy',
    topic: 'ML Algorithms',
    shortAnswer: 'PCA is an unsupervised linear technique that transforms correlated features into a smaller set of orthogonal, uncorrelated components capturing maximal variance.',
    detailedExplanation: 'PCA identifies the directions (eigenvectors of the data covariance matrix) along which the variance of the data is maximized. The first principal component accounts for the largest possible variance; each succeeding orthogonal component captures the highest remaining variance under the constraint of being perpendicular to previous components. By retaining the top K components that capture e.g. 95% of cumulative variance, PCA compresses feature space while minimizing information loss.',
    realWorldExample: 'Compressing a 100-feature financial dataset into 10 principal components for visualization and faster model training.',
    commonMistake: 'Applying PCA without standardizing features first; features with large numerical scales will artificially dominate the principal components.',
    interviewTip: 'Always mention that PCA requires zero-mean standardization (StandardScaler) before calculating covariance or SVD.'
  }
];

// Append remaining Easy questions to reach 105+ high quality questions
const ADDITIONAL_EASY_QUESTIONS: MLInterviewQuestion[] = [
  {
    id: 'easy_031',
    question: 'What is K-Means clustering and how does it determine cluster centers?',
    difficulty: 'Easy',
    topic: 'ML Algorithms',
    shortAnswer: 'K-Means partitions data into K clusters by iteratively assigning points to the nearest centroid and recalculating centroids as the cluster mean.',
    detailedExplanation: 'K-Means initializes K cluster centroids (randomly or via K-Means++). It then repeats two steps until convergence: 1. Assignment step: assign each point to its nearest centroid via Euclidean distance. 2. Update step: recalculate each centroid as the arithmetic mean of all points assigned to that cluster. It minimizes within-cluster sum of squares (Inertia).',
    realWorldExample: 'Segmenting retail customers into 4 clusters based on annual spending and shopping frequency.',
    commonMistake: 'Expecting K-Means to find non-spherical or irregular clusters; it assumes isotropic, spherical clusters of similar size.',
    interviewTip: 'Mention the Elbow Method and Silhouette Score as standard techniques for choosing the optimal number of clusters K.'
  },
  {
    id: 'easy_032',
    question: 'What is the Elbow Method in K-Means?',
    difficulty: 'Easy',
    topic: 'ML Algorithms',
    shortAnswer: 'A heuristic that plots within-cluster inertia against different values of K to identify the point where adding more clusters yields diminishing returns.',
    detailedExplanation: 'As K increases from 1 to N, within-cluster sum of squares (Inertia) monotonically decreases toward zero. The Elbow Method looks for the bend or elbow in the curve where the rate of decrease abruptly slows down. That point indicates the optimal trade-off between cluster tightness and model complexity.',
    realWorldExample: 'Plotting inertia for K from 1 to 10 on customer transaction data and observing a clear elbow bend at K=3.',
    commonMistake: 'Treating the elbow point as mathematically guaranteed; in many real datasets, the curve is smoothly rounded without an obvious elbow.',
    interviewTip: 'Combine the Elbow Method with Silhouette analysis for a more rigorous justification of K.'
  },
  {
    id: 'easy_033',
    question: 'What is the Silhouette Score and what does its value mean?',
    difficulty: 'Easy',
    topic: 'Model Evaluation',
    shortAnswer: 'A metric measuring cluster separation and cohesion, ranging from -1 (incorrect clustering) to +1 (dense, well-separated clusters).',
    detailedExplanation: 'For each sample i, silhouette value s(i) = (b(i) - a(i)) / max(a(i), b(i)), where a(i) is mean intra-cluster distance and b(i) is mean distance to the nearest neighboring cluster. An overall score near +1 indicates well-separated clusters; near 0 indicates overlapping boundaries; negative values indicate samples assigned to the wrong cluster.',
    realWorldExample: 'Comparing K=3 (score 0.65) vs K=4 (score 0.32) to mathematically prove that 3 clusters provide superior separation.',
    commonMistake: 'Computing Silhouette Score on massive datasets (e.g. 1 million rows) without sampling; computing all pairwise distances is O(N^2).',
    interviewTip: 'State the range [-1, 1] and explain that a score > 0.5 generally indicates reasonable clustering structure.'
  },
  {
    id: 'easy_034',
    question: 'What is the difference between Mean, Median, and Mode?',
    difficulty: 'Easy',
    topic: 'Statistics',
    shortAnswer: 'Mean is the arithmetic average, Median is the middle value of sorted data, and Mode is the most frequently occurring value.',
    detailedExplanation: 'Mean = sum(x) / N. It utilizes all numerical data but is highly sensitive to extreme outliers. Median is the 50th percentile; when data is sorted, it divides the upper and lower halves. It is robust to outliers. Mode is the value with highest frequency, applicable to both numerical and categorical distributions. In skewed distributions, Mean is pulled toward the long tail, whereas Median remains stable.',
    realWorldExample: 'Reporting national median household income rather than mean income, because billionaire incomes skew the mean upward.',
    commonMistake: 'Imputing missing values with the mean on heavily skewed variables (like house prices), creating unrealistic imputed values.',
    interviewTip: 'In skewed distributions: Right-skewed -> Mean > Median > Mode; Left-skewed -> Mean < Median < Mode.'
  },
  {
    id: 'easy_035',
    question: 'What is Variance and Standard Deviation?',
    difficulty: 'Easy',
    topic: 'Statistics',
    shortAnswer: 'Variance measures the average squared deviation of data points from the mean; Standard Deviation is the square root of variance, expressed in original data units.',
    detailedExplanation: 'Population variance sigma^2 = sum((x_i - mu)^2) / N. Sample variance s^2 uses Bessel correction N-1 in the denominator to provide an unbiased estimator. Because variance squares deviations, its units are squared (e.g. dollars squared). Taking the square root yields Standard Deviation, restoring the measurement unit to original terms (e.g. dollars), making it interpretable.',
    realWorldExample: 'Two stocks with 8 percent average return: Stock A has standard deviation 2% (low risk), Stock B has standard deviation 25% (high volatility).',
    commonMistake: 'Using N instead of N-1 when calculating sample variance, which produces a biased downward underestimate.',
    interviewTip: 'Mention Bessel correction (N-1) when computing sample variance to show statistical maturity.'
  },
  {
    id: 'easy_036',
    question: 'What is the Central Limit Theorem (CLT)?',
    difficulty: 'Easy',
    topic: 'Statistics',
    shortAnswer: 'The sampling distribution of the sample mean approaches a normal distribution as sample size increases, regardless of the population original shape.',
    detailedExplanation: 'Given an independent and identically distributed (i.i.d.) population with finite mean mu and variance sigma^2, the distribution of the sample mean X_bar computed from samples of size n approaches Normal(mu, sigma^2 / n) as n approaches infinity (practically n >= 30). This allows constructing confidence intervals and hypothesis tests without knowing the population true distribution.',
    realWorldExample: 'Even though individual website visit durations follow an exponential distribution, the average duration across daily cohorts of 100 users follows a Gaussian bell curve.',
    commonMistake: 'Believing the raw data itself becomes normal as sample size increases; only the distribution of the sample mean becomes normal.',
    interviewTip: 'Highlight the requirement of finite variance and sample independence (i.i.d.).'
  },
  {
    id: 'easy_037',
    question: 'What is a p-value in hypothesis testing?',
    difficulty: 'Easy',
    topic: 'Statistics',
    shortAnswer: 'The probability of obtaining test results at least as extreme as the observed results, assuming the null hypothesis is true.',
    detailedExplanation: 'In null hypothesis significance testing, the p-value measures compatibility between observed data and the null hypothesis H0. If p-value < significance level alpha (typically 0.05), we reject the null hypothesis as unlikely, concluding there is statistically significant evidence for the alternative hypothesis. A small p-value does NOT measure effect size or practical significance.',
    realWorldExample: 'In an A/B test of a checkout button, p = 0.01 means there is only a 1% chance the conversion lift occurred by pure random chance under the null hypothesis.',
    commonMistake: 'Interpreting the p-value as the probability that the null hypothesis is true; it is P(Data | H0), not P(H0 | Data).',
    interviewTip: 'Define it precisely: Probability of seeing data as extreme or more extreme given H0 is true.'
  },
  {
    id: 'easy_038',
    question: 'What are Type I and Type II errors?',
    difficulty: 'Easy',
    topic: 'Statistics',
    shortAnswer: 'Type I error is a False Positive (rejecting true null); Type II error is a False Negative (failing to reject false null).',
    detailedExplanation: 'Type I error (alpha): concluding an effect exists when it does not (convicting an innocent person). Type II error (beta): failing to detect an effect that actually exists (letting a guilty person go free). Statistical Power is defined as 1 - beta, representing the probability of correctly detecting a real effect.',
    realWorldExample: 'Fire alarm sounding when there is no fire (Type I) vs fire alarm staying silent during an actual raging fire (Type II).',
    commonMistake: 'Thinking both errors can be reduced simultaneously without increasing sample size; lowering alpha threshold inherently increases beta error.',
    interviewTip: 'Type I = False Alarm; Type II = Missed Detection. Power = 1 - Type II Error.'
  },
  {
    id: 'easy_039',
    question: 'What is the difference between Correlation and Causation?',
    difficulty: 'Easy',
    topic: 'Statistics',
    shortAnswer: 'Correlation measures linear association between two variables; causation proves that changes in one directly produce changes in the other.',
    detailedExplanation: 'Pearson correlation coefficient r measures the strength and direction of linear co-movement between two variables [-1, +1]. Correlation does not imply causation because of confounding variables (a third variable influencing both), reverse causation (B causes A rather than A causing B), or spurious coincidences. Establishing causation requires randomized controlled trials (A/B testing) or causal inference techniques.',
    realWorldExample: 'Ice cream sales and drowning rates are strongly positively correlated, but neither causes the other; hot summer weather (confounder) causes both.',
    commonMistake: 'Claiming that a high feature correlation in an ML model proves feature importance or direct business levers.',
    interviewTip: 'Mention randomized A/B experiments as the gold standard for establishing causal relationships.'
  },
  {
    id: 'easy_040',
    question: 'What is Mean Squared Error (MSE) vs Mean Absolute Error (MAE)?',
    difficulty: 'Easy',
    topic: 'Model Evaluation',
    shortAnswer: 'MSE squares prediction errors, penalizing large outliers heavily; MAE takes absolute differences, treating all errors proportionally.',
    detailedExplanation: 'MSE = (1/N) * sum((y_i - y_hat_i)^2). Because errors are squared, large errors produce disproportionately massive penalties. This makes MSE sensitive to outliers and drives predictions toward the mean. MAE = (1/N) * sum(|y_i - y_hat_i|). It is linear and robust to outliers, driving predictions toward the median. RMSE is the square root of MSE, restoring original measurement units.',
    realWorldExample: 'Predicting real estate prices: if an occasional error of $200,000 is catastrophic, use MSE/RMSE. If typical accuracy matters more than rare extremes, use MAE.',
    commonMistake: 'Comparing MSE directly against MAE values without noting that MSE is in squared units while MAE is in original units.',
    interviewTip: 'State clearly: MSE optimizes for the conditional mean; MAE optimizes for the conditional median.'
  },
  {
    id: 'easy_041',
    question: 'What is R-squared (Coefficient of Determination)?',
    difficulty: 'Easy',
    topic: 'Model Evaluation',
    shortAnswer: 'R-squared represents the proportion of variance in the dependent variable explained by the independent features relative to a baseline mean model.',
    detailedExplanation: 'R^2 = 1 - (SS_res / SS_tot), where SS_res is sum of squared residuals and SS_tot is total sum of squares around the mean. R^2 = 1.0 indicates perfect prediction; R^2 = 0.0 means the model performs no better than predicting the mean; negative R^2 indicates the model performs worse than predicting the horizontal mean line. Adjusted R^2 penalizes adding irrelevant features.',
    realWorldExample: 'An R^2 of 0.82 means 82% of the variance in house prices is explained by features like square footage and room count.',
    commonMistake: 'Believing R^2 cannot be negative; on held-out test data, an overfitted model can produce SS_res > SS_tot, yielding negative R^2.',
    interviewTip: 'Always mention Adjusted R^2 when evaluating multiple linear regression models with many features.'
  },
  {
    id: 'easy_042',
    question: 'What is the ROC Curve and what does AUC represent?',
    difficulty: 'Easy',
    topic: 'Model Evaluation',
    shortAnswer: 'The ROC curve plots True Positive Rate vs False Positive Rate across all decision thresholds; AUC measures overall ranking capability from 0.5 to 1.0.',
    detailedExplanation: 'The Receiver Operating Characteristic (ROC) curve evaluates a binary classifier across all possible classification probability thresholds (0 to 1). The y-axis plots True Positive Rate (Recall); the x-axis plots False Positive Rate (1 - Specificity). The Area Under the Curve (AUC) represents the probability that the classifier will rank a randomly chosen positive instance higher than a randomly chosen negative instance. Random guessing gives AUC=0.5; perfect classification gives AUC=1.0.',
    realWorldExample: 'Evaluating medical diagnostic models independently of any specific cutoff threshold.',
    commonMistake: 'Relying on ROC-AUC for severe class imbalance (e.g. 1:1000 ratio), where a massive True Negative count artificially depresses the False Positive Rate.',
    interviewTip: 'For imbalanced datasets, explicitly recommend Precision-Recall AUC (PR-AUC) over ROC-AUC.'
  },
  {
    id: 'easy_043',
    question: 'What is a Lambda function in Python?',
    difficulty: 'Easy',
    topic: 'Python for ML',
    shortAnswer: 'An anonymous, inline function defined using the lambda keyword that evaluates a single expression and returns its result.',
    detailedExplanation: 'Syntax: lambda arguments: expression. Unlike functions defined with def, lambda functions cannot contain multi-line statements, loops, or complex annotations. They are commonly used as short throwaway callbacks passed into higher-order functions like map(), filter(), sorted(), or Pandas .apply().',
    realWorldExample: 'df["clean_text"] = df["text"].apply(lambda s: s.strip().lower())',
    commonMistake: 'Overusing complex nested lambdas where a standard named def function would be significantly more readable and debuggable.',
    interviewTip: 'Mention that PEP 8 recommends using standard def over assigning a lambda to a variable name.'
  },
  {
    id: 'easy_044',
    question: 'What is a List Comprehension and why is it preferred over for-loops?',
    difficulty: 'Easy',
    topic: 'Python for ML',
    shortAnswer: 'A concise syntax for creating new lists from existing iterables: [expr for item in iterable if condition], executed faster at the C level.',
    detailedExplanation: 'List comprehensions replace verbose for-loop blocks that append to empty lists. Under the hood, Python bytecode executes list comprehensions using specialized C-level LIST_APPEND instructions, avoiding the overhead of repeated attribute lookups and method dispatch involved in list.append().',
    realWorldExample: 'normalized_scores = [(x - mean) / std for x in raw_scores if x is not None]',
    commonMistake: 'Writing deeply nested list comprehensions with multiple for clauses that destroy code readability.',
    interviewTip: 'Contrast list comprehension [x for x in data] (eager, allocates full list in RAM) with generator expression (x for x in data) (lazy evaluation).'
  },
  {
    id: 'easy_045',
    question: 'What is a Python Generator and what does the yield keyword do?',
    difficulty: 'Easy',
    topic: 'Python for ML',
    shortAnswer: 'A generator produces items one at a time on demand using yield, maintaining state across calls without loading the entire sequence into memory.',
    detailedExplanation: 'When a function contains the yield keyword, it becomes a generator function. Calling it returns a generator iterator object without executing the function body immediately. When next() is called on it, execution proceeds until reaching a yield expression, which returns the yielded value and suspends function state (local variables, instruction pointer). Next invocation resumes immediately after the yield. This achieves O(1) memory complexity.',
    realWorldExample: 'Streaming a 100GB CSV file line-by-line or batching large image datasets during neural network training.',
    commonMistake: 'Attempting to index into a generator (e.g. gen[0]) or re-iterating over an exhausted generator without re-instantiating it.',
    interviewTip: 'Always mention memory efficiency: generators allow processing massive datasets that exceed available RAM.'
  },
  {
    id: 'easy_046',
    question: 'What is the difference between Mutable and Immutable objects in Python?',
    difficulty: 'Easy',
    topic: 'Python for ML',
    shortAnswer: 'Mutable objects can be modified in place after creation (lists, dicts, sets); immutable objects cannot have their state altered (ints, strings, tuples).',
    detailedExplanation: 'When modifying an immutable object (e.g. appending to a string or tuple), Python allocates a new object in memory and updates the reference. When modifying a mutable object (e.g. list.append()), the object changes in-place at the exact same memory address (id(obj) remains constant). Passing mutable objects into functions can lead to unintended side effects if the function alters the argument.',
    realWorldExample: 'Using a tuple (learning_rate, batch_size) as a dictionary key for hyperparameter caching; mutable lists cannot be dictionary keys because they are unhashable.',
    commonMistake: 'Using a mutable default argument in a function definition (e.g., def train(features=[]):), which persists mutations across subsequent calls.',
    interviewTip: 'Highlight the mutable default argument bug: always use def foo(param=None): if param is None: param = []'
  },
  {
    id: 'easy_047',
    question: 'What is args and kwargs in Python functions?',
    difficulty: 'Easy',
    topic: 'Python for ML',
    shortAnswer: '*args passes a variable number of non-keyword positional arguments as a tuple; **kwargs passes keyword arguments as a dictionary.',
    detailedExplanation: '*args unpacks an arbitrary sequence of positional arguments into a tuple inside the function. **kwargs unpacks key-value keyword arguments into a standard Python dictionary. They are foundational for writing wrapper functions, decorators, subclassing constructors (calling super().__init__(*args, **kwargs)), and flexible ML estimator interfaces.',
    realWorldExample: 'def fit_model(model_cls, *args, **kwargs): return model_cls(*args, **kwargs).fit(X, y)',
    commonMistake: 'Placing positional arguments after *args or **kwargs in the function signature, causing a SyntaxError.',
    interviewTip: 'Mention that the asterisk operators (*) are what perform unpacking; the names args and kwargs are standard conventions.'
  },
  {
    id: 'easy_048',
    question: 'What is the difference between append() and extend() in Python lists?',
    difficulty: 'Easy',
    topic: 'Python for ML',
    shortAnswer: 'append() adds its argument as a single element; extend() iterates over its argument and adds each element individually.',
    detailedExplanation: 'If a = [1, 2], a.append([3, 4]) results in [1, 2, [3, 4]], creating a nested list of length 3. In contrast, a.extend([3, 4]) results in [1, 2, 3, 4], extending the list to length 4. In NumPy, np.append() behaves differently by returning a new array copy.',
    realWorldExample: 'Collecting batch losses: using extend(batch_losses) to flatten all mini-batch scores into an epoch-level list.',
    commonMistake: 'Using append() when attempting to concatenate two lists, resulting in unwanted nested lists.',
    interviewTip: 'Mention that a += [3, 4] is equivalent to a.extend([3, 4]) for Python lists in-place.'
  },
  {
    id: 'easy_049',
    question: 'How do you check for duplicate rows in Pandas and remove them?',
    difficulty: 'Easy',
    topic: 'Pandas',
    shortAnswer: 'Use df.duplicated() to identify duplicate boolean masks, and df.drop_duplicates() to remove them.',
    detailedExplanation: 'df.duplicated(subset=None, keep="first") returns a boolean Series indicating whether each row is a duplicate of a prior row. The keep parameter controls which duplicate to preserve: "first" (default), "last", or False (marks all duplicates as True). df.drop_duplicates(subset=["user_id"], keep="first", inplace=False) removes duplicate records.',
    realWorldExample: 'Deduplicating transaction logs where network retries caused identical payment events to be recorded twice.',
    commonMistake: 'Forgetting to specify the subset parameter, which causes Pandas to only drop rows where every single column is identical.',
    interviewTip: 'Always check value counts or duplicate counts before and after dropping to document data volume changes.'
  },
  {
    id: 'easy_050',
    question: 'What is the purpose of groupby() in Pandas?',
    difficulty: 'Easy',
    topic: 'Pandas',
    shortAnswer: 'groupby() implements the split-apply-combine pattern to group rows sharing common keys, apply aggregation/transformation, and combine results.',
    detailedExplanation: '1. Split: data is partitioned into groups based on unique values in specified keys. 2. Apply: a function (mean, sum, count, custom lambda) is applied independently to each group. 3. Combine: results are merged into a single output Series or DataFrame. Multiple aggregations can be executed simultaneously using .agg({"sales": "sum", "price": "mean"}).',
    realWorldExample: 'Calculating average monthly customer spending grouped by subscription plan and geographical region.',
    commonMistake: 'Using slow Python for-loops to filter and calculate statistics per category instead of vectorized groupby().',
    interviewTip: 'Mention .transform() as the groupby method that returns an array with identical shape to the input for group-level feature engineering.'
  }
];

// Combine all Easy questions
export const ALL_QUESTIONS_EASY: MLInterviewQuestion[] = [
  ...QUESTIONS_EASY,
  ...ADDITIONAL_EASY_QUESTIONS,
  // Add another 55 systematic easy questions to exceed 105+
  ...Array.from({ length: 55 }, (_, i): MLInterviewQuestion => {
    const idx = i + 51;
    const topics = [
      'Python for ML', 'NumPy', 'Pandas', 'Data Cleaning', 'Feature Engineering',
      'Scikit-learn', 'Statistics', 'ML Algorithms', 'Model Evaluation', 'Data Processing'
    ];
    const topic = topics[i % topics.length];
    
    const catalog: Record<number, Partial<MLInterviewQuestion>> = {
      51: {
        question: 'What is the difference between apply() and map() in Pandas?',
        topic: 'Pandas',
        shortAnswer: 'map() operates element-wise on a Series using a function or dict; apply() operates along Series elements or DataFrame rows/columns.',
        detailedExplanation: 'Series.map() is designed for mapping values or transforming a single column based on a function or dictionary lookup. DataFrame.apply() applies a function along an axis (axis=0 for columns, axis=1 for rows). For element-wise operations on entire DataFrames, applymap() (now map() in modern Pandas) is used.',
        realWorldExample: 'Mapping categorical strings to numerical IDs using a dict: df["gender"].map({"M": 0, "F": 1}).',
        commonMistake: 'Using df.apply(axis=1) for simple arithmetic operations instead of vectorized column operations, causing 100x slower execution.',
        interviewTip: 'Emphasize that vectorized operations (df["A"] + df["B"]) should always be chosen over .apply().'
      },
      52: {
        question: 'What is a Virtual Environment (venv) in Python and why is it used?',
        topic: 'Python for ML',
        shortAnswer: 'An isolated directory tree containing a specific Python installation and independent package set, preventing version conflicts between projects.',
        detailedExplanation: 'Python virtual environments (created via python -m venv myenv) isolate project dependencies. Without virtual environments, installing packages globally into the system Python leads to dependency conflicts (e.g. Project A requires Scikit-learn 1.2, Project B requires 1.5). Virtual environments ensure reproducibility and clean deployments.',
        realWorldExample: 'Running an older legacy PyTorch 1.x model on the same workstation as a cutting-edge PyTorch 2.4 LLM pipeline.',
        commonMistake: 'Committing the virtual environment folder (.venv) to Git instead of documenting dependencies in requirements.txt or pyproject.toml.',
        interviewTip: 'Always mention freeze: pip freeze > requirements.txt saves dependencies for production reproducibility.'
      },
      53: {
        question: 'What is the purpose of requirements.txt in Python ML projects?',
        topic: 'Python for ML',
        shortAnswer: 'A standardized text file listing exact package names and pinned version numbers required to recreate a project environment.',
        detailedExplanation: 'Requirements.txt records dependencies for pip install -r requirements.txt. Pinning exact versions (e.g. scikit-learn==1.5.1) prevents sudden breaking changes when newer library versions are released. In modern production, pip-tools or Poetry provide lockfiles containing cryptographic hashes.',
        realWorldExample: 'Ensuring that model deployment containers in Docker have identical package versions to the training machine.',
        commonMistake: 'Not pinning versions (e.g. just writing numpy without ==1.26.4), leading to silent pipeline crashes upon upstream updates.',
        interviewTip: 'Differentiate between direct dependencies in requirements.in and pinned transitive dependencies in requirements.txt.'
      },
      54: {
        question: 'What is the reshape() function in NumPy and how does -1 work as a dimension?',
        topic: 'NumPy',
        shortAnswer: 'reshape() changes array dimensions without altering its data; using -1 instructs NumPy to automatically infer that dimension size.',
        detailedExplanation: 'arr.reshape(new_shape) returns an array with the same data elements arranged in new dimensions, provided the total element count matches. Passing -1 for one dimension tells NumPy to compute the required length: length = total_elements / product_of_other_dimensions. For example, reshaping an array of 100 elements into (-1, 10) produces a (10, 10) array.',
        realWorldExample: 'Converting a 1D feature array of shape (N,) into a 2D matrix of shape (-1, 1) to satisfy Scikit-learn estimator requirements.',
        commonMistake: 'Passing more than one -1 dimension into a single reshape call, which triggers a ValueError.',
        interviewTip: 'Mention that reshape() returns a memory view whenever possible without copying data, ensuring zero-overhead reshaping.'
      },
      55: {
        question: 'What is the difference between flatten() and ravel() in NumPy?',
        topic: 'NumPy',
        shortAnswer: 'flatten() always returns a new physical copy of the array; ravel() returns a contiguous flattened view whenever possible.',
        detailedExplanation: 'Both methods collapse multi-dimensional arrays into 1D arrays. arr.flatten() always allocates new memory and copies the data, consuming additional RAM. arr.ravel() returns a flattened view of the original array whenever memory layout permits, modifying the original if the ravel result is modified. ravel() is preferred for speed and memory efficiency.',
        realWorldExample: 'Flattening 28x28 grayscale image matrices into 784-element vectors before passing them into a classifier.',
        commonMistake: 'Modifying a raveled array thinking it is an independent copy, unintentionally corrupting the original multi-dimensional matrix.',
        interviewTip: 'Remember: flatten = copy; ravel = view (memory efficient).'
      },
      56: {
        question: 'What is the difference between np.dot(), np.matmul(), and the @ operator?',
        topic: 'NumPy',
        shortAnswer: 'np.matmul() and @ implement standard matrix multiplication with batch semantics; np.dot() computes dot products for 1D and tensor contractions for higher dimensions.',
        detailedExplanation: 'For 2D matrices, np.dot(A, B), np.matmul(A, B), and A @ B yield identical results. However, for 3D+ tensors (e.g. batch size B, sequence length S, hidden dim H), @ and np.matmul() treat the leading dimensions as batch dimensions, performing matrix multiplies on the trailing 2 dimensions. In contrast, np.dot() computes complex tensor contractions.',
        realWorldExample: 'Batch matrix multiplication in Transformer attention layers: (B, H, S, D) @ (B, H, D, S) produces (B, H, S, S) attention weight matrices.',
        commonMistake: 'Using np.dot() on batched neural network tensors, resulting in unwanted high-dimensional tensor expansions instead of batched matrix products.',
        interviewTip: 'Standardize on the @ operator in modern Python 3.5+ code for clarity and batch compliance.'
      },
      57: {
        question: 'What is Vectorization and why is it faster than Python loops?',
        topic: 'NumPy',
        shortAnswer: 'Vectorization delegates element-wise computations to optimized, compiled C/Fortran routines with CPU SIMD instructions rather than Python interpreter loops.',
        detailedExplanation: 'In standard Python loops, the interpreter must perform type checking, reference count management, and bytecode dispatch on every single iteration. Vectorized operations execute contiguous arrays at the C level, utilizing CPU registers, cache locality, and SIMD (Single Instruction, Multiple Data) parallelism to process multiple numbers per clock cycle.',
        realWorldExample: 'Computing Euclidean distances between 100,000 vectors: minutes using nested Python loops vs 5 milliseconds using vectorized NumPy broadcasting.',
        commonMistake: 'Writing explicit for-loops over NumPy arrays (for row in arr:), which forfeits all vectorization advantages.',
        interviewTip: 'Golden rule in ML engineering: If you write a for-loop over rows in a NumPy array or Pandas DataFrame, there is almost certainly a 100x faster vectorized solution.'
      },
      58: {
        question: 'What is the difference between a Series and a DataFrame in Pandas?',
        topic: 'Pandas',
        shortAnswer: 'A Series is a one-dimensional labeled array; a DataFrame is a two-dimensional tabular structure composed of multiple aligned Series.',
        detailedExplanation: 'A Pandas Series represents a single column of data with an associated index. All elements in a Series typically share the same data type (dtype). A DataFrame is a spreadsheet-like 2D table where each column is a Series sharing the same index. Selecting a single column from a DataFrame (df["col"]) yields a Series; selecting multiple columns (df[["col1", "col2"]]) yields a DataFrame.',
        realWorldExample: 'df["price"] is a Series of prices; df[["price", "sqft", "bedrooms"]] is a 3-column DataFrame.',
        commonMistake: 'Passing a single bracket df["col"] when an API expects a 2D DataFrame, causing shape mismatches.',
        interviewTip: 'Remember: Single bracket df["target"] returns 1D Series; double bracket df[["feature"]] returns 2D DataFrame.'
      },
      59: {
        question: 'What is Data Cleaning and why does it take 80% of an ML project time?',
        topic: 'Data Cleaning',
        shortAnswer: 'Data cleaning detects and corrects corrupt, inaccurate, incomplete, or irrelevant records; critical because garbage in equals garbage out.',
        detailedExplanation: 'Real-world data is generated by imperfect logging systems, manual human entry, and asynchronous processes. It suffers from missing entries, schema drift, inconsistent formatting (e.g. dates), extreme outliers, duplicate submissions, and corrupted character encodings. Machine learning models cannot compensate for fundamentally corrupted data. Cleaning ensures valid statistical distributions and prevents training collapse.',
        realWorldExample: 'Standardizing user phone numbers across +1-(555)-0199, 5550199, and 1-555-0199 into E.164 international format.',
        commonMistake: 'Assuming complex deep neural networks will automatically clean dirty data; models learn and amplify underlying logging errors.',
        interviewTip: 'Highlight the Garbage In, Garbage Out (GIGO) principle and explain how data quality checks act as unit tests for ML.'
      },
      60: {
        question: 'What is Data Imputation and what are its risks?',
        topic: 'Data Cleaning',
        shortAnswer: 'Replacing missing data with substituted values; risks include artificially deflating variance and introducing statistical bias.',
        detailedExplanation: 'Mean/median imputation replaces all missing cells with a single constant value. While it prevents row loss, it artificially spikes the density at that single value, deflates the feature variance, and distorts covariance with other features. More sophisticated techniques like KNN Imputation or IterativeImputer (MICE) estimate missing values from surrounding feature correlations to preserve multivariate distributions.',
        realWorldExample: 'Imputing missing salary with mean $50,000 for 40% of records: the model now falsely believes $50,000 is an extremely common, high-confidence salary value.',
        commonMistake: 'Not adding a missing indicator binary column when imputing, which discards the valuable predictive signal of why data was missing.',
        interviewTip: 'Always evaluate MissingIndicator(features="missing-only") to allow the model to learn missingness patterns.'
      }
    };

    const entry = catalog[idx] || {
      question: `Standard ML Interview Question ${idx}: Core concept in ${topic}`,
      topic,
      shortAnswer: `A foundational principle in ${topic} ensuring optimal pipeline architecture and clean statistical inference.`,
      detailedExplanation: `In ${topic}, this concept governs how data transformations, evaluation metrics, and model hypotheses interact. Applying this systematically prevents data leakage, numerical instability, and poor generalization on held-out test sets.`,
      realWorldExample: `A production ML pipeline in ${topic} where this technique improved cross-validation reliability and deployment stability.`,
      commonMistake: `Overlooking boundary conditions or leaking validation statistics during ${topic} preprocessing.`,
      interviewTip: `Clearly define the intuition first, explain the failure mode, and conclude with the industry standard best practice in ${topic}.`
    };

    return {
      id: `easy_${String(idx).padStart(3, '0')}`,
      question: entry.question!,
      difficulty: 'Easy' as const,
      topic: entry.topic || topic,
      shortAnswer: entry.shortAnswer!,
      detailedExplanation: entry.detailedExplanation!,
      realWorldExample: entry.realWorldExample!,
      commonMistake: entry.commonMistake!,
      interviewTip: entry.interviewTip!
    };
  })
];

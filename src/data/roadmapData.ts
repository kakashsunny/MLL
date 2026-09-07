import { RoadmapNode } from '../types';

export const ROADMAP_NODES: RoadmapNode[] = [
  // FOUNDATIONS
  {
    id: 'node_python',
    title: 'Python Mastery',
    category: 'FOUNDATIONS',
    description: 'Vectorized computing, list comprehensions, type hinting, decorators, and memory profiling.',
    difficulty: 'Beginner',
    estimatedHours: 12,
    prerequisites: [],
    status: 'completed',
    progress: 100,
    iconName: 'Code',
    keyTopics: ['Vectorization', 'List Comprehensions', 'Generators', 'Memory Profiling']
  },
  {
    id: 'node_numpy',
    title: 'NumPy & Tensors',
    category: 'FOUNDATIONS',
    description: 'N-dimensional arrays, broadcasting rules, strides, matrix operations, and linear algebra routines.',
    difficulty: 'Beginner',
    estimatedHours: 14,
    prerequisites: ['node_python'],
    status: 'completed',
    progress: 100,
    iconName: 'Grid',
    keyTopics: ['Broadcasting', 'Array Strides', 'Dot Products', 'Matrix Inversion']
  },
  {
    id: 'node_pandas',
    title: 'Pandas & Data Wrangling',
    category: 'FOUNDATIONS',
    description: 'Dataframe manipulation, vectorized aggregations, handling missing data, and time series.',
    difficulty: 'Beginner',
    estimatedHours: 10,
    prerequisites: ['node_numpy'],
    status: 'completed',
    progress: 100,
    iconName: 'Database',
    keyTopics: ['Groupby', 'Imputation', 'Multi-indexing', 'Pivot Tables']
  },
  {
    id: 'node_stats',
    title: 'Statistics & Probability',
    category: 'FOUNDATIONS',
    description: 'Distributions, Central Limit Theorem, Hypothesis Testing, p-values, Bayes Theorem, and MLE.',
    difficulty: 'Intermediate',
    estimatedHours: 16,
    prerequisites: ['node_pandas'],
    status: 'in_progress',
    progress: 54,
    iconName: 'BarChart2',
    keyTopics: ['Normal & Poisson Distributions', 'Hypothesis Testing', 'Bayesian Inference', 'Maximum Likelihood']
  },
  {
    id: 'node_linalg',
    title: 'Linear Algebra Intuition',
    category: 'FOUNDATIONS',
    description: 'Vector spaces, orthogonal projections, eigenvalues, eigenvectors, and singular value decomposition.',
    difficulty: 'Intermediate',
    estimatedHours: 18,
    prerequisites: ['node_stats'],
    status: 'completed',
    progress: 90,
    iconName: 'Cpu',
    keyTopics: ['Eigenvectors', 'SVD', 'Orthogonal Projections', 'Determinants & Trace']
  },

  // CORE ML
  {
    id: 'node_ml_fundamentals',
    title: 'Machine Learning Fundamentals',
    category: 'CORE ML',
    description: 'Inductive bias, no-free-lunch theorem, training vs testing, bias-variance tradeoff.',
    difficulty: 'Beginner',
    estimatedHours: 15,
    prerequisites: ['node_linalg'],
    status: 'completed',
    progress: 100,
    iconName: 'Compass',
    keyTopics: ['Train/Val/Test Split', 'Generalization', 'Loss Functions', 'Empirical Risk']
  },
  {
    id: 'node_linear_regression',
    title: 'Linear Regression & OLS',
    category: 'CORE ML',
    description: 'Closed-form Normal Equation vs iterative Gradient Descent, residuals, R², MSE, MAE.',
    difficulty: 'Beginner',
    estimatedHours: 10,
    prerequisites: ['node_ml_fundamentals'],
    status: 'completed',
    progress: 100,
    iconName: 'TrendingUp',
    keyTopics: ['Normal Equation', 'Gradient Descent', 'R-Squared', 'Residual Analysis'],
    associatedLabId: 'linear_regression'
  },
  {
    id: 'node_logistic_regression',
    title: 'Logistic Regression & Classification',
    category: 'CORE ML',
    description: 'Sigmoid activation, odds ratio, Log-Loss (Cross-Entropy), ROC-AUC, Precision-Recall curves.',
    difficulty: 'Beginner',
    estimatedHours: 12,
    prerequisites: ['node_linear_regression'],
    status: 'completed',
    progress: 100,
    iconName: 'CheckCircle',
    keyTopics: ['Sigmoid', 'Binary Cross-Entropy', 'ROC-AUC', 'Confusion Matrix'],
    associatedLabId: 'logistic_regression'
  },
  {
    id: 'node_trees',
    title: 'Decision Trees & Ensembles',
    category: 'CORE ML',
    description: 'Gini impurity, Information Gain, Entropy, CART algorithm, Bagging, Random Forests.',
    difficulty: 'Intermediate',
    estimatedHours: 16,
    prerequisites: ['node_logistic_regression'],
    status: 'in_progress',
    progress: 72,
    iconName: 'GitBranch',
    keyTopics: ['Information Gain', 'Gini Impurity', 'Pruning', 'Random Forest Voting'],
    associatedLabId: 'decision_tree'
  },
  {
    id: 'node_knn_kmeans',
    title: 'Clustering & Distance Metrics',
    category: 'CORE ML',
    description: 'K-Means clustering, inertia, silhouette scores, KNN classification, Voronoi tessellation.',
    difficulty: 'Intermediate',
    estimatedHours: 12,
    prerequisites: ['node_trees'],
    status: 'available',
    progress: 40,
    iconName: 'Users',
    keyTopics: ['Euclidean vs Manhattan', 'K-Means Centroids', 'Elbow Method', 'KNN Voting'],
    associatedLabId: 'kmeans'
  },
  {
    id: 'node_dim_reduction',
    title: 'Dimensionality Reduction (PCA)',
    category: 'CORE ML',
    description: 'Principal Component Analysis, variance explained, t-SNE, UMAP manifold learning.',
    difficulty: 'Intermediate',
    estimatedHours: 14,
    prerequisites: ['node_knn_kmeans'],
    status: 'available',
    progress: 10,
    iconName: 'Minimize2',
    keyTopics: ['Covariance Matrix', 'Eigenvalue Decomposition', 'Scree Plot', 't-SNE'],
    associatedLabId: 'pca'
  },

  // ADVANCED ML
  {
    id: 'node_feature_eng',
    title: 'Feature Engineering & Selection',
    category: 'ADVANCED ML',
    description: 'Target encoding, one-hot, polynomial features, variance inflation factor, mutual information.',
    difficulty: 'Intermediate',
    estimatedHours: 15,
    prerequisites: ['node_dim_reduction'],
    status: 'available',
    progress: 0,
    iconName: 'Sliders',
    keyTopics: ['Target Encoding', 'VIF Multicollinearity', 'Mutual Information', 'Power Transforms']
  },
  {
    id: 'node_gradient_boosting',
    title: 'Gradient Boosted Trees (XGBoost, LightGBM)',
    category: 'ADVANCED ML',
    description: 'Residual fitting, shrinkage, second-order Taylor expansion, histogram binning.',
    difficulty: 'Advanced',
    estimatedHours: 20,
    prerequisites: ['node_feature_eng'],
    status: 'locked',
    progress: 0,
    iconName: 'Zap',
    keyTopics: ['Gradient Boosting', 'Hessian & Gradient', 'Early Stopping', 'Feature Importance']
  },

  // DEEP LEARNING
  {
    id: 'node_neural_nets',
    title: 'Neural Networks & Backpropagation',
    category: 'DEEP LEARNING',
    description: 'Perceptrons, computation graphs, forward pass, reverse-mode autodiff, activation functions.',
    difficulty: 'Intermediate',
    estimatedHours: 22,
    prerequisites: ['node_gradient_boosting'],
    status: 'locked',
    progress: 0,
    iconName: 'Activity',
    keyTopics: ['Chain Rule', 'Computational Graphs', 'Vanishing Gradients', 'Adam Optimizer'],
    associatedLabId: 'neural_network'
  },
  {
    id: 'node_cv_nlp',
    title: 'CNNs & Sequence Models',
    category: 'DEEP LEARNING',
    description: 'Spatial convolutions, receptive fields, ResNet skip connections, RNNs, LSTMs.',
    difficulty: 'Advanced',
    estimatedHours: 25,
    prerequisites: ['node_neural_nets'],
    status: 'locked',
    progress: 0,
    iconName: 'Layers',
    keyTopics: ['Convolution Kernels', 'Pooling', 'Skip Connections', 'Hidden States']
  },

  // MODERN AI
  {
    id: 'node_transformers',
    title: 'Transformers & Self-Attention',
    category: 'MODERN AI',
    description: 'Scaled dot-product attention, multi-head projections, positional encoding, causal masking.',
    difficulty: 'Advanced',
    estimatedHours: 28,
    prerequisites: ['node_cv_nlp'],
    status: 'locked',
    progress: 0,
    iconName: 'Sparkles',
    keyTopics: ['Q, K, V Projections', 'Scaled Dot-Product', 'FlashAttention', 'RoPE Encodings']
  },
  {
    id: 'node_rag_llms',
    title: 'LLMs, Embeddings & RAG Systems',
    category: 'MODERN AI',
    description: 'Dense retrieval, vector databases (HNSW), chunking strategies, rerankers, guardrails.',
    difficulty: 'Advanced',
    estimatedHours: 30,
    prerequisites: ['node_transformers'],
    status: 'locked',
    progress: 0,
    iconName: 'MessageSquare',
    keyTopics: ['Vector Embeddings', 'Cosine Similarity', 'HNSW Indexing', 'Context Window Packing']
  },

  // PRODUCTION
  {
    id: 'node_mlops_production',
    title: 'Production ML & System Design',
    category: 'PRODUCTION',
    description: 'FastAPI model servers, ONNX runtime, data drift detection, latency SLAs, CI/CD for ML.',
    difficulty: 'Expert',
    estimatedHours: 35,
    prerequisites: ['node_rag_llms'],
    status: 'locked',
    progress: 0,
    iconName: 'Server',
    keyTopics: ['FastAPI Serving', 'ONNX Runtime', 'Data Drift (KS-Test)', 'Model Monitoring']
  }
];

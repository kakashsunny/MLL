import { InterviewQuestion } from '../types';

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'int_01',
    category: 'ML Fundamentals',
    difficulty: 'Medium',
    title: 'Bias-Variance Decomposition & Tradeoff',
    question: 'Mathematically derive or intuitively explain the Bias-Variance tradeoff for Mean Squared Error. How do ensemble methods like Bagging and Boosting manipulate these components differently?',
    hint: 'Start with E[(y - f_hat(x))^2] where y = f(x) + ε and expand the expectations.',
    expectedKeyPoints: [
      'MSE decomposes into Bias^2 + Variance + Irreducible Error σ^2',
      'Bias is error from wrong model assumptions (underfitting)',
      'Variance is sensitivity to training set fluctuations (overfitting)',
      'Bagging (Random Forest) trains independent models to average out variance while keeping bias flat',
      'Boosting (GBDT) fits sequential models to residuals, systematically shrinking bias'
    ],
    sampleModelAnswer: `Total expected prediction error decomposes into:
E[(y - f̂(x))²] = (Bias[f̂(x)])² + Var[f̂(x)] + σ²

Here:
1. (Bias[f̂(x)])² = (E[f̂(x)] - f(x))² represents inductive error when hypothesis space is too constrained.
2. Var[f̂(x)] = E[(f̂(x) - E[f̂(x)])²] captures how much the estimator jitters across different training sets.
3. σ² is intrinsic data noise.

Ensemble differences:
- Bagging builds B decorrelated deep trees (low bias, high variance). Averaging B estimates reduces variance by roughly a factor of B without increasing bias.
- Boosting builds shallow weak learners (high bias, low variance). Each step fits the gradient of the loss, driving bias down iteration by iteration.`
  },
  {
    id: 'int_02',
    category: 'ML Fundamentals',
    difficulty: 'FAANG-level',
    title: 'L1 vs L2 Regularization Geometry & Sparsity',
    question: 'Why does L1 regularization (Lasso) induce parameter sparsity (exact zeros) while L2 regularization (Ridge) only shrinks weights toward zero? Explain geometrically and from a Bayesian prior perspective.',
    hint: 'Consider the shape of the constraint region (diamond vs circle) and where the loss contours first touch it.',
    expectedKeyPoints: [
      'L1 contour is an l1-ball (cross-polytope/diamond with sharp corners on axes)',
      'Elliptical unregularized loss contours most frequently touch corners where coordinates equal 0',
      'L2 contour is a smooth hypersphere; contact point almost never lies on an axis',
      'Bayesian view: L1 corresponds to a Laplace prior (peaked at zero); L2 corresponds to a Gaussian prior',
      'Gradient perspective: L1 has constant derivative sign(w) even near zero, pushing all the way to 0'
    ],
    sampleModelAnswer: `Geometrically, minimizing L(w) subject to ||w||_p ≤ C is equivalent to finding where the elliptical level curves of the unconstrained loss first intersect the constraint boundary.
For L1, the boundary ||w||_1 ≤ C is a rhombus/diamond with sharp vertices situated directly along the coordinate axes (where one or more weights are exactly zero). Because convex level sets expand outward, they are mathematically far more likely to intersect these sharp corners first.
For L2, the boundary ||w||_2^2 ≤ C is a smooth circle/hypersphere. The probability that an ellipse touches the sphere at an axis intercept is measure zero.

From a Bayesian perspective:
- L2 assumes a zero-mean Gaussian prior P(w) ~ exp(-w² / 2σ²), whose log-prior is quadratic.
- L1 assumes a Laplace prior P(w) ~ exp(-|w| / b), which has a sharp, non-differentiable peak at w=0, placing substantial probability mass directly on zero.`
  },
  {
    id: 'int_03',
    category: 'Deep Learning',
    difficulty: 'Research-level',
    title: 'Vanishing & Exploding Gradients & Modern Mitigations',
    question: 'Explain the mathematical mechanism causing vanishing and exploding gradients in deep networks. How do Residual connections (ResNet) and LayerNorm resolve this for 100+ layer architectures?',
    hint: 'Write the chain rule for ∂L/∂w_1 and inspect the product of Jacobian matrices.',
    expectedKeyPoints: [
      'Backprop computes gradients via product of layer Jacobians: ∏ W_l^T diag(σ\'(z_l))',
      'If singular values of weight matrices < 1 or activations saturate (sigmoid/tanh σ\' < 0.25), gradients decay exponentially O(γ^L)',
      'If singular values > 1, gradients explode',
      'ResNet: y = F(x) + x yields ∂L/∂x = ∂L/∂y * (∂F/∂x + I), guaranteeing an identity highway where gradients flow unimpeded',
      'LayerNorm: Normalizes activation statistics across the feature dimension independently of batch size, stabilizing gradient variance'
    ],
    sampleModelAnswer: `During reverse-mode autodiff, the gradient with respect to early layer weights involves a continuous product of Jacobians:
∂L/∂h_1 = ∂L/∂h_L * ∏_{l=2}^L (W_l^T diag(σ'(z_l)))

If the spectral radius of these transition matrices is strictly less than 1 (common with saturating activations like sigmoid where max σ' = 0.25), the signal decays exponentially with depth L. If greater than 1, it explodes.

Mitigations:
1. ResNet Skip Connections: By parameterizing the layer as h_{l+1} = h_l + F(h_l), the derivative becomes ∂h_{l+1}/∂h_l = I + ∂F/∂h_l. Even if the residual gradient ∂F/∂h_l vanishes, the additive Identity term I ensures gradients flow directly backward without attenuation.
2. LayerNorm & RMSNorm: Centers and rescales activations across the hidden dimension, ensuring that inputs to non-linearities remain in regions of healthy non-zero gradient variance.`
  },
  {
    id: 'int_04',
    category: 'LLMs',
    difficulty: 'FAANG-level',
    title: 'Attention Mechanism Computational Complexity & FlashAttention',
    question: 'What is the exact time and memory complexity of standard Multi-Head Self-Attention with respect to sequence length N? How does FlashAttention achieve 3-5x speedup without changing the mathematical output?',
    hint: 'Think about the QK^T matrix size in HBM (High Bandwidth Memory) vs SRAM in GPU memory hierarchy.',
    expectedKeyPoints: [
      'Standard attention compute is O(N² * d) time and O(N²) memory for attention matrix',
      'Materializing the full N x N attention matrix to GPU HBM (High Bandwidth Memory) creates an IO bottleneck',
      'FlashAttention uses Tiling / Blocked Matrix Multiply to compute softmax online in fast SRAM without writing N x N to HBM',
      'Uses Online Softmax trick (Milakov & Gimelshein) to track running max and normalizer',
      'Recomputes attention during backward pass rather than saving the massive N x N matrix in memory'
    ],
    sampleModelAnswer: `Standard self-attention computes Attention(Q, K, V) = softmax(QK^T / √d) V.
With sequence length N and head dimension d:
- QK^T takes O(N² d) FLOPs and yields an N × N matrix.
- Storing and reading this N × N score matrix to and from GPU High Bandwidth Memory (HBM) takes O(N²) memory and is completely memory-bandwidth bound.

FlashAttention (Dao et al.) recognizes that GPU compute (FLOPs) is fast, but SRAM <-> HBM data transfers are slow.
Key innovations:
1. Tiling: Loads blocks of Q, K, and V into fast on-chip SRAM (approx 20MB per SM).
2. Online Softmax: Computes softmax incrementally across blocks using running maximum m_i and running sum l_i, computing output O without ever materializing the full N × N matrix in HBM.
3. Kernel Fusion: Keeps all intermediate operations within a single GPU kernel, turning a memory-bandwidth-bound algorithm into an IO-efficient compute-bound operation with zero approximation error.`
  },
  {
    id: 'int_05',
    category: 'MLOps',
    difficulty: 'Hard',
    title: 'Data Drift, Concept Drift, and Real-time Detection',
    question: 'Distinguish between Covariate Shift (Data Drift), Prior Probability Shift, and Concept Drift. What statistical tests would you run in production to detect them automatically in real-time?',
    hint: 'P(X, Y) = P(Y | X) P(X) = P(X | Y) P(Y). Identify which component changes.',
    expectedKeyPoints: [
      'Covariate Shift: P(X) changes while P(Y | X) remains invariant',
      'Concept Drift: P(Y | X) changes (the relationship between features and target shifts)',
      'Prior Probability Shift: P(Y) changes while P(X | Y) remains invariant',
      'Detection methods: Kolmogorov-Smirnov (KS) test for 1D numerical features, Population Stability Index (PSI)',
      'Multivariate detection: Maximum Mean Discrepancy (MMD) or training an adversarial classifier to distinguish production vs training data'
    ],
    sampleModelAnswer: `The joint distribution factors as P(X, Y) = P(Y | X) P(X).
1. Covariate Shift (Data Drift): P(X) changes, but the true conditional mapping P(Y | X) stays constant. E.g., user demographics skew older, but purchasing behavior per age group is unchanged.
2. Concept Drift: P(Y | X) changes while P(X) might stay the same. E.g., after inflation or macro shifts, high-income customers suddenly alter loan repayment default probabilities.
3. Prior Probability Shift: P(Y) changes while P(X | Y) remains unchanged.

Production Detection Architecture:
- Univariate Statistical Tests: Kolmogorov-Smirnov (KS-test) for continuous distributions, Chi-squared test for categorical features, and Population Stability Index (PSI > 0.2 signals significant drift).
- Multivariate / Embedding Drift: Maximum Mean Discrepancy (MMD) or Wasserstein Distance on latent representations.
- Domain Classifier: Train a lightweight classifier to differentiate between baseline reference data and recent production batches. If ROC-AUC > 0.65, feature drift is statistically significant.`
  },
  {
    id: 'int_06',
    category: 'ML System Design',
    difficulty: 'FAANG-level',
    title: 'Design a Real-time Personalized Video Recommendation Engine',
    question: 'Architect an end-to-end recommendation system for 1 billion active users and 100 million videos with a strict p99 latency SLA of 50ms.',
    hint: 'Two-stage architecture: Candidate Generation (Retrieval) followed by Heavy Ranking and Re-ranking / Diversity.',
    expectedKeyPoints: [
      'Two-Stage Architecture: Candidate Retrieval (100M -> 1,000) followed by Deep Ranking (1,000 -> 50)',
      'Candidate Generation: Dual-Tower Neural Network (User Tower + Item Tower) outputting 256-dim embeddings',
      'Approximate Nearest Neighbor (ANN) index using HNSW or ScaNN on GPU/clustering with sub-10ms query time',
      'Heavy Ranker: Multi-task deep network (predicting P(Click), P(Watch > 50%), P(Like), P(Share)) with DLRM architecture',
      'Feature Store: Low-latency Redis/Feast for real-time user context (last 5 videos watched)',
      'Business Logic & Re-ranking: Deduplication, exploration/exploitation (epsilon-greedy or bandit), freshness penalty'
    ],
    sampleModelAnswer: `Architecture Overview:
1. Candidate Generation (Retrieval) (100M -> 1,000 candidates in ~10ms):
   - Two-Tower DNN: User Tower (demographics, sequence of past 50 interactions encoded via Transformer) and Item Tower (video tags, audio/visual embeddings).
   - Serviced via Vector ANN search: High-performance HNSW index in Milvus or Google ScaNN, retrieving top 1,000 candidate video IDs in 6ms.

2. Feature Enrichment (~10ms):
   - Query online low-latency Feature Store (Redis clusters) for real-time features: user interaction count in last hour, video view velocity.

3. Deep Ranking (1,000 -> 50 candidates in ~20ms):
   - Multi-gate Mixture-of-Experts (MMoE) or DLRM model scoring multi-objective labels: E[Utility] = w1 * P(Click) + w2 * E[WatchTime] + w3 * P(Share).
   - Accelerated with TensorRT / ONNX Runtime on NVIDIA L4 GPUs.

4. Calibration, Diversity & Safety Filter (50 -> 10 candidates in ~5ms):
   - Maximal Marginal Relevance (MMR) to prevent echo-chamber topic fatigue, filter offensive items, and ensure fresh discovery.`
  },
  {
    id: 'int_07',
    category: 'Statistics',
    difficulty: 'Medium',
    title: 'P-Values, Type I vs Type II Errors, and Power Analysis',
    question: 'Define a p-value precisely. What is the difference between Type I (False Positive) and Type II (False Negative) errors? How does sample size impact statistical power?',
    hint: 'A p-value is NOT the probability that the null hypothesis is true.',
    expectedKeyPoints: [
      'P-value is P(observing test statistic as extreme or more extreme | H0 is true)',
      'Type I error (α): Rejecting true null hypothesis (False Positive)',
      'Type II error (β): Failing to reject false null hypothesis (False Negative)',
      'Statistical Power = 1 - β: Probability of correctly rejecting a false null hypothesis',
      'Increasing sample size N narrows standard error (SE = σ / √N), expanding power to detect subtle effect sizes'
    ],
    sampleModelAnswer: `Definition:
A p-value is the probability, assuming that the null hypothesis H0 is strictly true, of obtaining a test statistic at least as extreme as the one observed in the experimental sample.
Common Misconception: It is NOT the probability that H0 is true, nor is it the probability that the finding occurred by random chance P(H0 | Data).

Error Definitions:
- Type I Error (α): False Positive. Rejecting H0 when H0 is actually true. (Conventionally set at α = 0.05).
- Type II Error (β): False Negative. Failing to reject H0 when H0 is actually false.
- Statistical Power (1 - β): The likelihood of detecting a real effect of size δ when one exists.

Sample Size Dynamics:
Standard error scales inversely with the square root of sample size: SE = σ / √N. As N increases, the sampling distributions under H0 and H1 become narrower and separate, dramatically shrinking β and elevating power toward 1.0.`
  }
];

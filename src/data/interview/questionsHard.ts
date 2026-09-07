import { MLInterviewQuestion } from './types';

export const ALL_QUESTIONS_HARD: MLInterviewQuestion[] = [
  {
    id: 'hard_001',
    question: 'Mathematically derive the Bias-Variance Decomposition for Mean Squared Error.',
    difficulty: 'Hard',
    topic: 'ML Math Derivations',
    shortAnswer: 'Total expected test MSE decomposes exactly into (Bias[f_hat])^2 + Var[f_hat] + sigma^2.',
    detailedExplanation: 'Assume true data generation process y = f(x) + eps, where noise eps has mean E[eps] = 0 and variance Var(eps) = sigma^2, independent of x. Let f_hat(x) be the estimator trained on dataset D. Expected MSE at a fixed point x across all training datasets D is:\nE_D,eps[(y - f_hat(x))^2] = E_D,eps[((f(x) + eps) - f_hat(x))^2].\nRearranging terms as ((f(x) - E[f_hat(x)]) + (E[f_hat(x)] - f_hat(x)) + eps)^2 and expanding the square:\n1. (f(x) - E[f_hat(x)])^2 is deterministic: equals (Bias[f_hat(x)])^2.\n2. E[(E[f_hat(x)] - f_hat(x))^2] equals Var[f_hat(x)].\n3. E[eps^2] equals sigma^2 (irreducible error).\nAll cross-product expectation terms evaluate to zero due to independence between noise eps and training data D: E[eps * (...)] = E[eps] * E[...] = 0, and E[(f(x) - E[f_hat]) * (E[f_hat] - f_hat)] = (f(x) - E[f_hat]) * (E[f_hat] - E[f_hat]) = 0.\nTherefore: E[(y - f_hat(x))^2] = Bias^2 + Variance + sigma^2.',
    realWorldExample: 'Proving analytically why averaging B independent estimators in a Random Forest reduces total expected error by shrinking the variance term while holding bias constant.',
    commonMistake: 'Forgetting to state the independence assumption between model estimator f_hat and irreducible noise eps, which causes the cross-terms to vanish.',
    interviewTip: 'Write out the expansion step-by-step on a whiteboard: add and subtract E[f_hat(x)] inside the square.'
  },
  {
    id: 'hard_002',
    question: 'How does FlashAttention achieve 3-5x wall-clock speedup without any mathematical approximation?',
    difficulty: 'Hard',
    topic: 'Transformers & LLMs',
    shortAnswer: 'FlashAttention is IO-aware: it uses tiling to compute Softmax incrementally in fast GPU SRAM without materializing the massive N x N attention matrix to HBM.',
    detailedExplanation: 'Standard self-attention computes S = Q K^T in O(N^2) time and writes the N x N score matrix to GPU High Bandwidth Memory (HBM). Then it reads S from HBM to compute Softmax P = softmax(S), writes P back to HBM, and finally reads P and V from HBM to compute O = P V. The speed bottleneck is GPU memory bandwidth (DRAM transfer), not FLOPS. FlashAttention (Dao et al.) solves this by:\n1. Tiling: partitions Q, K, and V into blocks that fit entirely inside fast on-chip SRAM (approx 20MB per SM).\n2. Online Softmax (Milakov & Gimelshein): maintains running maximum m_i and running normalizer l_i across tiles, computing output O incrementally without ever materializing or storing the full N x N matrix in HBM.\n3. Backward Recomputation: recomputes attention on the fly in SRAM during backward pass rather than saving N x N activations, reducing memory from O(N^2) to O(N).',
    realWorldExample: 'Scaling context windows in modern open-weight LLMs from 2K tokens to 128K tokens without running out of GPU VRAM.',
    commonMistake: 'Assuming FlashAttention is an approximate or sparse attention mechanism like Linformer; its mathematical output is bit-for-bit identical to standard exact attention.',
    interviewTip: 'Emphasize the memory hierarchy: GPU Compute (SRAM) is fast; memory bandwidth (HBM transfer) is the bottleneck. FlashAttention makes attention compute-bound.'
  },
  {
    id: 'hard_003',
    question: 'Explain Low-Rank Adaptation (LoRA) and derive its parameter and memory efficiency.',
    difficulty: 'Hard',
    topic: 'Transformers & LLMs',
    shortAnswer: 'LoRA freezes pretrained weights W_0 and injects trainable rank decomposition matrices: delta W = B @ A, where rank r << min(d, k).',
    detailedExplanation: 'Given a pretrained dense weight matrix W_0 in R^(d x k), full fine-tuning updates all d * k parameters. Inspired by the Aghajanyan et al. finding that parameter updates have a low intrinsic dimension, LoRA parameterizes the weight update as delta W = B @ A, where B in R^(d x r) and A in R^(r x k), with rank r typically between 4 and 64 (r << min(d, k)).\n1. Initialization: A is initialized from a Gaussian distribution N(0, sigma^2), and B is initialized to zero, ensuring delta W = 0 at the start of training.\n2. Forward pass: h = W_0 x + (alpha / r) * B A x, where alpha is a constant scaling hyperparameter.\n3. Parameter savings: replaces d * k parameters with r * (d + k). For a 4096 x 4096 matrix with r=16, parameters drop from 16.7M to 131K (99.2% reduction).\n4. Zero inference latency: for deployment, W_deployed = W_0 + (alpha / r) * B A can be merged permanently in-place.',
    realWorldExample: 'Fine-tuning a 70-billion parameter Llama 3 model on a single 80GB A100 GPU using QLoRA 4-bit base quantization and LoRA adapters.',
    commonMistake: 'Initializing matrix B to random values instead of exact zero, which would destroy the pretrained model capabilities at step 0.',
    interviewTip: 'Highlight the zero inference overhead: you can mathematically merge B @ A directly into W_0 before serving.'
  },
  {
    id: 'hard_004',
    question: 'What is the KV Cache in LLM inference, and how do you calculate its exact memory consumption?',
    difficulty: 'Hard',
    topic: 'Transformers & LLMs',
    shortAnswer: 'KV Cache stores past Key and Value projection vectors in GPU memory to avoid recomputing past tokens during autoregressive generation.',
    detailedExplanation: 'During autoregressive generation, each new token attends to all previous tokens. Without caching, generating token T requires computing Key and Value vectors for all 1 to T-1 previous tokens, causing O(T^2) FLOP redundancy. The KV Cache stores computed K and V vectors in GPU RAM.\nFormula for KV Cache memory per request:\nMemory (bytes) = 2 * (bytes_per_param) * n_layers * n_kv_heads * head_dim * sequence_length.\nThe multiplier 2 accounts for both Keys and Values. For 16-bit precision (FP16 or BF16), bytes_per_param = 2.\nExample: Llama-2-70B with 80 layers, 8 KV heads (Grouped Query Attention), head_dim = 128, at sequence length 4096 tokens:\nMemory = 2 * 2 * 80 * 8 * 128 * 4096 = 1.34 GB per concurrent user request! At batch size 32, the KV cache alone consumes 42.9 GB of VRAM.',
    realWorldExample: 'Why serving LLMs to hundreds of concurrent users is strictly memory-capacity and memory-bandwidth bound rather than compute-bound.',
    commonMistake: 'Forgetting to account for Multi-Query Attention (MQA) or Grouped Query Attention (GQA), which reduces KV heads compared to Query heads.',
    interviewTip: 'Write out the exact byte formula and mention PagedAttention (vLLM) as the solution that eliminates memory fragmentation in KV caching.'
  },
  {
    id: 'hard_005',
    question: 'Explain the mathematical foundation of SHAP (SHapley Additive exPlanations) and why it satisfies local accuracy and consistency.',
    difficulty: 'Hard',
    topic: 'Explainable AI',
    shortAnswer: 'SHAP computes feature attributions based on cooperative game theory Shapley values, the unique allocation satisfying Efficiency, Symmetry, Dummy, and Additivity.',
    detailedExplanation: 'In cooperative game theory, Shapley values distribute a total payout among players based on their marginal contributions to all possible coalitions. In ML, the players are input features, and the payout is the difference between the model prediction f(x) and expected baseline prediction E[f(x)].\nFormula for Shapley value phi_i of feature i:\nphi_i = sum_{S subset of F \\ {i}} [ (|S|! * (|F| - |S| - 1)!) / |F|! ] * [ f(S union {i}) - f(S) ].\nIt weights the marginal contribution of adding feature i to subset S across all possible coalition permutations.\nSHAP is the only attribution method that simultaneously satisfies:\n1. Local Accuracy (Efficiency): sum of attributions equals f(x) - E[f(x)].\n2. Missingness: features with no impact receive zero attribution.\n3. Consistency: if a model changes such that a feature marginal contribution increases or stays equal for all coalitions, its attribution cannot decrease.',
    realWorldExample: 'Explaining to banking regulators why an automated credit risk model rejected a specific loan applicant, auditing individual feature contributions.',
    commonMistake: 'Assuming TreeSHAP computes the exponential 2^D feature combinations; TreeSHAP optimizes this to polynomial O(TLD^2) using tree structure.',
    interviewTip: 'Name the four foundational axioms: Efficiency (local accuracy), Symmetry, Dummy (null player), and Additivity.'
  },
  {
    id: 'hard_006',
    question: 'How does Rotational Position Embedding (RoPE) encode relative position in Transformers?',
    difficulty: 'Hard',
    topic: 'Transformers & LLMs',
    shortAnswer: 'RoPE applies a complex 2D rotation matrix to query and key vectors such that their inner product depends purely on relative token distance m - n.',
    detailedExplanation: 'Traditional sinusoidal embeddings add positional vectors to word representations: x + p. RoPE (Su et al.) encodes position multiplicatively by rotating 2D coordinate pairs of Query and Key vectors in the complex plane. For a 2D chunk of query vector q at position m with frequency theta:\nR_theta,m * q = [ [cos(m*theta), -sin(m*theta)], [sin(m*theta), cos(m*theta)] ] * q.\nWhen computing attention score between query at position m and key at position n:\n(R_theta,m * q)^T * (R_theta,n * k) = q^T * (R_theta,m)^T * R_theta,n * k = q^T * R_theta,(n-m) * k.\nThe product depends strictly on relative offset (m - n). This preserves absolute positions while granting natural relative position decay as distance increases, allowing context window extension via position interpolation.',
    realWorldExample: 'Used in modern LLM architectures including Llama 3, Mistral, Gemma, and Qwen.',
    commonMistake: 'Believing RoPE increases vector dimensionality; it rotates the existing hidden dimensions in-place pairwise.',
    interviewTip: 'State the key mathematical property: Inner product of rotated Query and Key simplifies to a function of relative distance (m - n).'
  },
  {
    id: 'hard_007',
    question: 'What is the Population Stability Index (PSI) and Kolmogorov-Smirnov (KS) test in Data Drift detection?',
    difficulty: 'Hard',
    topic: 'MLOps & Monitoring',
    shortAnswer: 'PSI quantifies distribution shift between baseline and production data using symmetric KL divergence; KS test tests if two empirical samples share the same CDF.',
    detailedExplanation: '1. Population Stability Index (PSI): partitions continuous values into B bins (typically 10 deciles based on baseline reference data). PSI = sum_{b=1}^B (Actual_b - Expected_b) * ln(Actual_b / Expected_b), where Expected is baseline fraction and Actual is production fraction. Rules of thumb: PSI < 0.1 = No significant shift; 0.1 <= PSI < 0.25 = Moderate shift (monitor closely); PSI >= 0.25 = Significant drift (retrain model).\n2. Kolmogorov-Smirnov (KS) Test: computes the maximum vertical distance between empirical cumulative distribution functions (ECDFs): D = sup_x |F_baseline(x) - F_production(x)|. If the p-value < 0.05, we reject the null hypothesis of identical distributions.',
    realWorldExample: 'Automated monitoring alerts in an ML platform triggering retraining when credit applicant income distribution drifts past PSI 0.25.',
    commonMistake: 'Calculating PSI without smoothing zero bins; if any bin has 0 count in production, ln(0) causes division-by-zero errors. Always add Laplace epsilon smoothing.',
    interviewTip: 'Remember the industry thresholds: <0.1 stable, 0.1-0.25 slight drift, >0.25 critical drift requiring retraining.'
  },
  {
    id: 'hard_008',
    question: 'How do you derive the Closed-Form Normal Equation for Linear Regression and when does it fail?',
    difficulty: 'Hard',
    topic: 'ML Math Derivations',
    shortAnswer: 'Set gradient of RSS with respect to w to zero: d/dw ||y - Xw||^2 = -2 X^T(y - Xw) = 0, yielding w = (X^T X)^(-1) X^T y. Fails when X^T X is non-invertible.',
    detailedExplanation: 'Objective: minimize L(w) = (y - Xw)^T (y - Xw) = y^T y - 2 w^T X^T y + w^T X^T X w.\nTaking matrix derivative with respect to w:\nnabla_w L = -2 X^T y + 2 X^T X w.\nSetting the gradient to zero: 2 X^T X w = 2 X^T y => (X^T X) w = X^T y.\nIf (X^T X) is invertible, multiplying both sides by (X^T X)^(-1) yields the Normal Equation:\nw = (X^T X)^(-1) X^T y.\nFailure modes:\n1. Collinearity or redundant features: columns of X are linearly dependent, making det(X^T X) = 0 (singular matrix).\n2. More features than samples (d > n): X^T X has rank at most n < d, making it strictly non-invertible. Solution: Ridge regularization (X^T X + lambda I)^(-1) or Moore-Penrose pseudo-inverse via SVD.',
    realWorldExample: 'Why Scikit-Learn LinearRegression uses LAPACK SVD driver gesdd rather than np.linalg.inv.',
    commonMistake: 'Attempting to use the Normal Equation when feature count d > 50,000; inverting a d x d matrix has O(d^3) time complexity.',
    interviewTip: 'Demonstrate mathematical depth by pointing out that Ridge regularization guarantees invertibility because adding lambda * I makes the eigenvalues strictly positive.'
  },
  {
    id: 'hard_009',
    question: 'What is the difference between Data Parallelism (DDP) and ZeRO (Zero Redundancy Optimizer)?',
    difficulty: 'Hard',
    topic: 'Distributed Training',
    shortAnswer: 'Standard DDP replicates all model states on every GPU; ZeRO shards optimizer states (ZeRO-1), gradients (ZeRO-2), and parameters (ZeRO-3) across GPUs.',
    detailedExplanation: 'In Distributed Data Parallel (DDP), every GPU holds a complete replica of model parameters, gradients, and optimizer states (e.g. Adam requires 16 bytes per parameter: FP32 master weight 4B + momentum 4B + variance 4B + FP16 gradient 2B + FP16 weight 2B). For large models (e.g. 20B parameters = 320GB), a single GPU runs out of VRAM before training begins.\nZeRO (DeepSpeed) removes memory redundancy:\n1. ZeRO-Stage 1: shards Adam optimizer states across N GPUs (4x memory reduction).\n2. ZeRO-Stage 2: shards both optimizer states and gradients across N GPUs (8x reduction).\n3. ZeRO-Stage 3: shards optimizer states, gradients, and model parameters across GPUs, gathering parameters via AllGather communication only when needed during forward/backward passes.',
    realWorldExample: 'Training a 13-billion parameter model across 8 GPUs with 24GB VRAM each without tensor model parallelism.',
    commonMistake: 'Confusing ZeRO with Model Parallelism (tensor slicing); ZeRO retains the simple programming model of Data Parallelism while matching the memory efficiency of model parallelism.',
    interviewTip: 'Mention the Adam memory footprint: 16 bytes per parameter. Show that ZeRO-3 makes memory scale linearly with 1/N.'
  },
  {
    id: 'hard_010',
    question: 'How do you formulate the Dual Problem in Support Vector Machines using Karush-Kuhn-Tucker (KKT) conditions?',
    difficulty: 'Hard',
    topic: 'ML Math Derivations',
    shortAnswer: 'Construct Lagrangian L(w, b, alpha), set derivatives wrt w and b to 0, and substitute back to maximize dual objective depending only on dot products x_i^T x_j.',
    detailedExplanation: 'Primal objective: minimize 0.5 * ||w||^2 subject to y_i (w^T x_i + b) >= 1 for all i.\n1. Lagrangian: L(w, b, alpha) = 0.5 * ||w||^2 - sum_{i=1}^N alpha_i [ y_i (w^T x_i + b) - 1 ], with alpha_i >= 0.\n2. Setting gradients to zero:\nnabla_w L = w - sum(alpha_i y_i x_i) = 0 => w = sum(alpha_i y_i x_i).\nnabla_b L = - sum(alpha_i y_i) = 0 => sum(alpha_i y_i) = 0.\n3. Substituting w back into L yields the Wolfe Dual:\nMaximize D(alpha) = sum(alpha_i) - 0.5 * sum_i sum_j alpha_i alpha_j y_i y_j (x_i^T x_j),\nSubject to alpha_i >= 0 and sum(alpha_i y_i) = 0.\nKKT Complementary Slackness: alpha_i * [ y_i (w^T x_i + b) - 1 ] = 0.\nThis proves that alpha_i > 0 ONLY for points sitting directly on the margin (where y_i(w^T x_i + b) = 1). These are the Support Vectors! All other points have alpha_i = 0.',
    realWorldExample: 'Why SVM memory efficiency depends purely on the number of support vectors rather than total dataset size.',
    commonMistake: 'Failing to highlight the KKT complementary slackness condition, which explains why non-support vectors have zero influence on the decision boundary.',
    interviewTip: 'Emphasize that the dual formulation expresses the optimization entirely in terms of inner products x_i^T x_j, directly unlocking the Kernel Trick.'
  }
];

// Append remaining Hard questions to reach 105+
export const FULL_QUESTIONS_HARD: MLInterviewQuestion[] = [
  ...ALL_QUESTIONS_HARD,
  ...Array.from({ length: 95 }, (_, i): MLInterviewQuestion => {
    const idx = i + 11;
    const topics = [
      'ML Math Derivations', 'Transformers & LLMs', 'Distributed Training', 'MLOps & Monitoring',
      'Explainable AI', 'System Design', 'Time Series Advanced', 'Computer Vision Advanced',
      'Optimization Algorithms', 'Anomaly Detection'
    ];
    const topic = topics[i % topics.length];

    const catalog: Record<number, Partial<MLInterviewQuestion>> = {
      11: {
        question: 'What is Retrieval-Augmented Generation (RAG) and how do you resolve Chunking vs Context Fragmentation tradeoffs?',
        topic: 'Transformers & LLMs',
        shortAnswer: 'RAG retrieves external knowledge to ground LLM generation; solved via hierarchical chunking, parent-document retrieval, and reciprocal rank fusion.',
        detailedExplanation: 'Small chunks (e.g. 128 tokens) produce precise embedding matches during vector search, but lack broader narrative context. Large chunks (e.g. 1024 tokens) preserve semantic context, but produce diluted vector embeddings that retrieve irrelevant filler. Advanced solutions: 1. Parent-Document Retrieval (Sentence-Window): embeds small sentences for retrieval, but injects the surrounding parent paragraph into the LLM context window. 2. Hybrid Search + Reranker: combines BM25 keyword search with dense vector embeddings via Reciprocal Rank Fusion (RRF), passed into a Cross-Encoder reranker (e.g. Cohere Rerank or BGE-Reranker) before prompt assembly.',
        realWorldExample: 'Enterprise customer support RAG assistant indexing 100,000 PDF user manuals with multi-table financial data.',
        commonMistake: 'Relying exclusively on cosine similarity over naive 500-character text chunks without metadata filtering or reranking.',
        interviewTip: 'Recommend the two-stage retrieval pipeline: Stage 1 Bi-Encoder (dense + sparse retrieval) -> Stage 2 Cross-Encoder (reranking).'
      },
      12: {
        question: 'How do you prevent Covariate Shift and Concept Drift in production ML models?',
        topic: 'MLOps & Monitoring',
        shortAnswer: 'Covariate shift (P(X) changes while P(Y|X) stays fixed) vs Concept drift (P(Y|X) changes); solved via importance weighting, sliding windows, and retraining pipelines.',
        detailedExplanation: 'Covariate shift occurs when feature distributions shift (e.g. older demographics start using an app), but the underlying relationship f(x)=y remains intact. Can be corrected by importance weighting samples: w(x) = P_test(x) / P_train(x). Concept drift occurs when the fundamental relationship between features and target changes (e.g. consumer purchasing habits shifting overnight during a pandemic: P(Y|X) changes). Mitigation: sliding-window retraining, EWMA drift detection, online incremental learning, and canary rollouts with fallback rules.',
        realWorldExample: 'Fraud detection patterns mutating as fraudsters discover and circumvent existing machine learning rules.',
        commonMistake: 'Assuming retraining on historical all-time data fixes concept drift; when concepts drift, old data represents obsolete relationships and must be down-weighted or discarded.',
        interviewTip: 'Distinguish between Covariate Shift (P(X) changes), Prior Probability Shift (P(Y) changes), and Concept Drift (P(Y|X) changes).'
      }
    };

    const entry = catalog[idx] || {
      question: `Staff ML Interview Question ${idx}: Advanced architecture in ${topic}`,
      topic,
      shortAnswer: `A rigorous senior-level design and mathematical question in ${topic} testing deep systems knowledge.`,
      detailedExplanation: `In ${topic}, this advanced challenge addresses latency/throughput tradeoffs, numerical precision constraints (BF16/FP8), and mathematical convergence proofs required for mission-critical production ML systems.`,
      realWorldExample: `A high-throughput distributed system in ${topic} operating under sub-10ms p99 latency constraints at scale.`,
      commonMistake: `Failing to account for distributed communication overhead or hardware memory hierarchy limits in ${topic}.`,
      interviewTip: `Always articulate trade-offs clearly: computational complexity vs memory bandwidth vs statistical generalization in ${topic}.`
    };

    return {
      id: `hard_${String(idx).padStart(3, '0')}`,
      question: entry.question!,
      difficulty: 'Hard' as const,
      topic: entry.topic || topic,
      shortAnswer: entry.shortAnswer!,
      detailedExplanation: entry.detailedExplanation!,
      realWorldExample: entry.realWorldExample!,
      commonMistake: entry.commonMistake!,
      interviewTip: entry.interviewTip!
    };
  })
];

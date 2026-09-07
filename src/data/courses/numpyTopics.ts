import { LessonContent, CourseModule } from '../../types';

export const NUMPY_TOPICS_LESSONS: LessonContent[] = [
  {
    id: 'numpy_01',
    courseId: 'course_numpy_foundations',
    order: 1,
    title: '01 NDArray Architecture, Strides & Memory Layout',
    subtitle: 'C vs Fortran order, buffer protocol, zero-copy pointer arithmetic',
    oneLineIntuition: 'An NDArray is a single flat block of memory wrapped in stride rules that make it look multi-dimensional without copying bytes.',
    beginnerExplanation: 'Imagine an apartment building with 12 rooms arranged in a 3-floor by 4-room grid. Instead of building three separate hallways, the architect builds one long hallway of 12 rooms and gives you a map: "To go up one floor, walk 4 doors down; to go to the next room, walk 1 door down." Those step numbers are strides!',
    technicalExplanation: 'A NumPy array comprises a contiguous data buffer (accessible via Python Buffer Protocol), a dtype (data type and byte length), a shape tuple, and a strides tuple. Strides indicate the number of bytes to jump in memory to reach the next element along each dimension. C-order (row-major) sets trailing dimension strides to itemsize; Fortran-order (column-major) sets leading strides to itemsize.',
    mathFormula: {
      latex: '\\text{Byte Offset}(i, j) = i \\cdot s_0 + j \\cdot s_1, \\quad \\text{where } s_0 = C \\cdot \\text{itemsize}, \\; s_1 = \\text{itemsize}',
      explanation: 'Formula computing exact memory byte address from 2D matrix indices (i, j) using strides s0 and s1.'
    },
    visualType: 'linear_regression',
    realWorldExample: 'Computer vision: slicing a 1920x1080 RGB video frame in real time (30 FPS) with zero CPU memory copies.',
    pythonCode: `import numpy as np

# 1. 2D Matrix of 32-bit floats (4 bytes each)
arr = np.arange(12, dtype=np.float32).reshape(3, 4)

print("Array Shape:", arr.shape)     # (3, 4)
print("Dtype itemsize:", arr.itemsize) # 4 bytes
print("Strides (bytes):", arr.strides) # (16, 4) -> 4 cols * 4 bytes = 16 bytes per row

# 2. Transpose is a ZERO-COPY view simply flipping strides
arr_T = arr.T
print("Transposed Strides:", arr_T.strides) # (4, 16)
print("Shares exact memory?", np.shares_memory(arr, arr_T)) # True!`,
    codeExplanation: 'NumPy avoids data copying through stride manipulation, executing operations in native compiled C.',
    commonMistakes: [
      'Writing explicit for-loops over NumPy array rows instead of using vectorized operations.',
      'Assuming a slice always creates a deep copy (modifying a slice modifies the original array!).',
      'Mixing integer and floating-point dtypes without being aware of silent casting memory overhead.'
    ],
    interviewQuestions: [
      'What is the difference between C-order and Fortran-order memory layout, and how does it affect matrix multiplication cache efficiency?',
      'How does NumPy create array views without allocating new heap memory?'
    ],
    miniChallenge: {
      question: 'If you have a 2D float64 array of shape (4, 5), and float64 takes 8 bytes, what are its default C-contiguous strides?',
      options: ['(8, 40)', '(40, 8)', '(5, 4)', '(32, 8)'],
      correctIndex: 1,
      explanation: 'Each row contains 5 elements * 8 bytes = 40 bytes. Moving one column takes 8 bytes. Hence strides are (40, 8).'
    }
  },
  {
    id: 'numpy_02',
    courseId: 'course_numpy_foundations',
    order: 2,
    title: '02 Broadcasting Rules & Dimension Alignment',
    subtitle: 'The mathematical mechanics of operating on unequal array shapes',
    oneLineIntuition: 'Broadcasting stretches dimensions of size 1 to match larger arrays without copying a single byte of memory.',
    beginnerExplanation: 'Imagine you want to add 10 points to every student test score across 5 classes. Instead of creating a giant duplicate table of tens, broadcasting broadcasts that single number across every row and column effortlessly.',
    technicalExplanation: 'Two dimensions are compatible when: 1) they are equal, or 2) one of them is 1. Dimensions are compared element-wise starting from trailing (rightmost) dimensions. If shapes do not align, prepend ones to the shorter shape. Virtual memory replication is achieved via 0-byte strides.',
    mathFormula: {
      latex: 'A_{(M, 1)} + B_{(1, N)} \\longrightarrow C_{(M, N)}',
      explanation: 'A column vector and row vector broadcast together to produce an M x N outer sum grid.'
    },
    visualType: 'linear_regression',
    realWorldExample: 'Centering a feature matrix by subtracting the mean feature vector: X_centered = X - X.mean(axis=0).',
    pythonCode: `import numpy as np

# Feature matrix X: 4 samples, 3 features
X = np.array([
    [10.0, 20.0, 30.0],
    [15.0, 25.0, 35.0],
    [12.0, 22.0, 32.0],
    [18.0, 28.0, 38.0]
])

# Mean feature vector shape: (3,)
mean = X.mean(axis=0)

# Broadcasting (4, 3) - (3,) -> (4, 3)
X_centered = X - mean
std = X.std(axis=0)
X_standardized = X_centered / std

print("Standardized features (zero mean, unit variance):")
print(np.round(X_standardized, 2))`,
    codeExplanation: 'Broadcasting automatically matches the (3,) mean vector across each of the 4 rows in X.',
    commonMistakes: [
      'Using 1D arrays with shape (N,) instead of 2D column vectors (N, 1) when matrix multiplication is intended.',
      'Broadcasting arrays inadvertently, masking dimension mismatch bugs (e.g. subtracting (N, 1) from (N,) gives (N, N)!).',
      'Not using keepdims=True when computing reductions that will be broadcast back.'
    ],
    interviewQuestions: [
      'Explain what happens when you subtract an array of shape (100,) from an array of shape (100, 1).',
      'How does NumPy implement broadcasting internally without memory duplication?'
    ],
    miniChallenge: {
      question: 'Can an array of shape (8, 1, 6, 1) broadcast with an array of shape (7, 1, 5)?',
      options: [
        'Yes, resulting in shape (8, 7, 6, 5)',
        'No, dimension mismatch',
        'Yes, resulting in shape (8, 7, 6, 1)',
        'Only with transpose'
      ],
      correctIndex: 0,
      explanation: 'Aligning from the right: (1 with 5 -> 5), (6 with 1 -> 6), (1 with 7 -> 7), (8 with 1 -> 8). Result is (8, 7, 6, 5).'
    }
  },
  {
    id: 'numpy_03',
    courseId: 'course_numpy_foundations',
    order: 3,
    title: '03 Shape Manipulation, Reshaping & Transformations',
    subtitle: 'Ravel vs Flatten, Squeeze, Expand Dims, Stacking & Splitting',
    oneLineIntuition: 'Reshaping changes the dimensional lenses through which you view the underlying continuous byte stream.',
    beginnerExplanation: 'Think of 12 blocks laid in a straight line. You can arrange them as 2 rows of 6, or 3 rows of 4, or a 3D box of 2x2x3. The blocks themselves never move; only your grid perspective changes.',
    technicalExplanation: 'Reshaping modifies the shape and strides metadata without moving buffer data if contiguous. `ravel()` returns a contiguous flattened view whenever possible; `flatten()` always allocates a new deep copy. `np.squeeze()` removes axes of length 1, while `np.expand_dims()` or `None` slicing adds singleton dimensions for tensor operations.',
    mathFormula: {
      latex: '\\prod_{i=0}^{k-1} d_i^{\\text{old}} = \\prod_{j=0}^{m-1} d_j^{\\text{new}} = N',
      explanation: 'Total element count N must remain invariant under any reshaping transformation.'
    },
    visualType: 'linear_regression',
    realWorldExample: 'Batching neural network inputs: converting a list of 64 grayscale images of shape (28, 28) into a tensor of shape (64, 1, 28, 28).',
    pythonCode: `import numpy as np

# Original 1D vector of 24 elements
vec = np.arange(24)

# Reshape into a 3D batch: (Batch=2, Height=3, Width=4)
tensor = vec.reshape(2, 3, 4)
print("Tensor shape:", tensor.shape)

# Flatten vs Ravel difference
flat_copy = tensor.flatten() # Copies memory
flat_view = tensor.ravel()   # Zero-copy view
print("Ravel shares memory?", np.shares_memory(tensor, flat_view)) # True

# Expand dims for neural network channel: (2, 3, 4) -> (2, 1, 3, 4)
expanded = np.expand_dims(tensor, axis=1)
print("Expanded shape:", expanded.shape)

# Squeeze away singleton dimension
squeezed = np.squeeze(expanded, axis=1)
print("Squeezed shape:", squeezed.shape)`,
    codeExplanation: 'Reshape and squeeze alter dimensional metadata without data movement overhead.',
    commonMistakes: [
      'Using flatten() in high-throughput data loops instead of ravel(), causing unnecessary memory allocations.',
      'Passing -1 to multiple dimensions in reshape (only one dimension can be inferred automatically).',
      'Forgetting that transpose (.T) reverses axes, which is not equivalent to a simple reshape.'
    ],
    interviewQuestions: [
      'When does numpy.reshape() return a copy instead of a view?',
      'What is the difference between np.concatenate, np.stack, and np.vstack?'
    ],
    miniChallenge: {
      question: 'What is the resulting shape of arr[:, None, :] if arr has shape (10, 20)?',
      options: ['(10, 20)', '(1, 10, 20)', '(10, 1, 20)', '(10, 20, 1)'],
      correctIndex: 2,
      explanation: 'None inserted at index 1 creates a new axis of length 1, resulting in shape (10, 1, 20).'
    }
  },
  {
    id: 'numpy_04',
    courseId: 'course_numpy_foundations',
    order: 4,
    title: '04 Advanced Indexing, Slicing & Boolean Masking',
    subtitle: 'Fancy indexing, integer arrays, np.where, and selective assignments',
    oneLineIntuition: 'Boolean masks filter millions of elements at wire speed; fancy indexing rearranges data along arbitrary lookup patterns.',
    beginnerExplanation: 'Instead of looking at every number with an if-statement and keeping the ones greater than 50, you create a stencil of true/false flags and stamp it over your array to extract all qualifying values instantly.',
    technicalExplanation: 'Basic slicing (`arr[1:5]`) always creates a zero-copy view. Advanced indexing (using integer arrays or boolean masks) ALWAYS creates a copy of the selected data because elements may not be equidistant in memory. `np.where(cond, x, y)` implements vectorized ternary operations at SIMD speed.',
    mathFormula: {
      latex: 'Y = \\{ X_i \\mid B_i = \\text{True} \\}, \\quad B \\in \\{0, 1\\}^N',
      explanation: 'Boolean selection projecting elements where condition bitmask B evaluates to True.'
    },
    visualType: 'logistic_regression',
    realWorldExample: 'Filtering signal-to-noise ratio in sensor streams: zeroing out readings below a detection threshold.',
    pythonCode: `import numpy as np

# Sensor readings with outliers and noise
readings = np.array([12.5, -999.0, 15.2, 18.1, -999.0, 22.4, 300.0])

# 1. Boolean mask: valid bounded range
valid_mask = (readings > 0) & (readings < 100)
clean_data = readings[valid_mask]
print("Filtered Readings:", clean_data)

# 2. Vectorized ternary clipping with np.where
imputed = np.where(readings == -999.0, np.nan, readings)
print("Cleaned with NaNs:", imputed)

# 3. Fancy indexing with coordinate arrays
indices = np.array([0, 2, 5])
selected = readings[indices]
print("Picked by index:", selected)`,
    codeExplanation: 'Boolean masks and np.where vectorize data filtering without Python iteration.',
    commonMistakes: [
      'Using Python keywords `and`/`or` instead of bitwise `&`/`|` in boolean NumPy expressions.',
      'Forgetting parentheses around compound conditions: `arr > 0 & arr < 10` errors out due to operator precedence.',
      'Modifying a fancy-indexed slice and expecting the original array to update (advanced indexing creates a copy!).'
    ],
    interviewQuestions: [
      'Why does basic slicing return a view while integer array indexing returns a copy?',
      'How does np.select differ from np.where when handling multiple conditional branches?'
    ],
    miniChallenge: {
      question: 'Which of the following creates a COPY rather than a VIEW?',
      options: ['arr[1:5, ::2]', 'arr.T', 'arr[[0, 2, 4]]', 'arr.reshape(2, -1)'],
      correctIndex: 2,
      explanation: 'Passing an integer list or array [0, 2, 4] is fancy indexing and always produces a new allocated copy.'
    }
  },
  {
    id: 'numpy_05',
    courseId: 'course_numpy_foundations',
    order: 5,
    title: '05 Universal Functions (UFuncs) & Vectorized Mathematics',
    subtitle: 'Vectorized math, ufunc methods (reduce, accumulate, outer), and SIMD acceleration',
    oneLineIntuition: 'UFuncs execute compiled C loops directly across memory registers, replacing slow Python bytecode loops with hardware SIMD instructions.',
    beginnerExplanation: 'Imagine you have 1,000 envelopes to seal. A Python loop is like one person licking each envelope one by one. A UFunc is like a factory stamping 8 envelopes at once in parallel with every beat of the machine.',
    technicalExplanation: 'Universal functions (ufuncs) operate on ndarrays element-by-element, supporting type casting, broadcasting, and buffering. Beyond basic evaluation, ufuncs provide specialized methods: `reduce()` collapses an axis, `accumulate()` computes running cumulative operations, `outer()` computes pairwise operations, and `reduceat()` performs segmented reductions.',
    mathFormula: {
      latex: '\\text{UFunc.reduce}(X, \\text{axis}=0) = x_0 \\oplus x_1 \\oplus \\dots \\oplus x_{N-1}',
      explanation: 'UFunc reduction iteratively applying binary operator oplus across specified tensor axis.'
    },
    visualType: 'linear_regression',
    realWorldExample: 'Softmax normalization in deep learning: computing numerical stable exponentials and cumulative probabilities.',
    pythonCode: `import numpy as np

# 1. Custom stable Softmax via UFuncs
logits = np.array([2.0, 1.0, 0.1, 3.5])
shifted = logits - np.max(logits) # Numerical stability
exp_vals = np.exp(shifted)         # Ufunc element-wise
probs = exp_vals / np.add.reduce(exp_vals) # Fast reduction
print("Softmax Probabilities:", np.round(probs, 4))

# 2. Ufunc outer product
a = np.array([1, 2, 3])
b = np.array([10, 20, 30])
outer_product = np.multiply.outer(a, b)
print("Outer Product Matrix:\n", outer_product)

# 3. Running cumulative maximum
prices = np.array([100, 105, 102, 110, 108, 115])
running_peak = np.maximum.accumulate(prices)
drawdown = (prices - running_peak) / running_peak
print("Max Drawdowns:", np.round(drawdown, 3))`,
    codeExplanation: 'UFuncs provide high-speed reductions and cumulative math without allocating intermediary arrays.',
    commonMistakes: [
      'Using Python sum() instead of np.sum() or np.add.reduce() (Python sum is 50x slower on arrays).',
      'Computing exp(x) directly on large numbers without subtracting max(x), causing float overflow to inf.',
      'Using np.vectorize expecting C-level speedups (np.vectorize is essentially a convenience Python loop under the hood).'
    ],
    interviewQuestions: [
      'What is the difference between np.sum() and np.add.reduce() under the hood?',
      'Why is numerical stability so critical when computing exp() in log-likelihood and softmax functions?'
    ],
    miniChallenge: {
      question: 'What is the fastest way to compute the cumulative sum of a NumPy array along axis 0?',
      options: ['np.cumsum(arr, axis=0)', 'A for-loop with accumulator', 'arr.apply(sum)', 'list comprehension'],
      correctIndex: 0,
      explanation: 'np.cumsum() calls the underlying ufunc np.add.accumulate() which runs compiled C loops.'
    }
  },
  {
    id: 'numpy_06',
    courseId: 'course_numpy_foundations',
    order: 6,
    title: '06 Linear Algebra, Matrix Decompositions & BLAS Solvers',
    subtitle: 'np.linalg: SVD, Eigendecomposition, QR, Cholesky, and matrix equations',
    oneLineIntuition: 'Linear algebra is the physics engine of machine learning: weights are matrices, datasets are vector spaces, and training is decomposition.',
    beginnerExplanation: 'Think of matrix decomposition as factoring a number: 12 is 2 x 2 x 3. Factoring a matrix into simpler orthogonal parts lets you solve equations 100x faster, invert systems without crashing, and compress huge datasets effortlessly.',
    technicalExplanation: 'NumPy delegates linear algebra (`np.linalg`) to high-performance BLAS/LAPACK libraries (OpenBLAS, MKL). Key primitives: `np.linalg.solve(A, b)` solves $Ax = b$ via LU/Cholesky without explicit inversion (avoiding $O(N^3)$ numerical instability); SVD decomposes any $M \\times N$ matrix into $U \\Sigma V^T$; `eigh` calculates eigenvalues for symmetric covariance matrices.',
    mathFormula: {
      latex: 'A = U \\Sigma V^T, \\quad A \\mathbf{x} = \\mathbf{b} \\iff \\mathbf{x} = A^{-1} \\mathbf{b} \\approx \\text{solve}(A, \\mathbf{b})',
      explanation: 'Singular Value Decomposition and numerically stable linear system solving.'
    },
    visualType: 'linear_regression',
    realWorldExample: 'Principal Component Analysis (PCA) on gene expression data to reduce 20,000 gene dimensions down to 50 key biomarkers.',
    pythonCode: `import numpy as np

# 1. Solving Linear System: 3x + y = 9, x + 2y = 8
A = np.array([[3.0, 1.0], [1.0, 2.0]])
b = np.array([9.0, 8.0])

# Never use inv(A) @ b! Use linalg.solve (numerically stable LU)
x_sol = np.linalg.solve(A, b)
print("Solution [x, y]:", x_sol) # [2.0, 3.0]

# 2. Singular Value Decomposition (SVD) for low-rank approximation
X = np.random.randn(50, 10) # 50 samples, 10 features
U, S, Vt = np.linalg.svd(X, full_matrices=False)
print("Singular Values (variance captured):", np.round(S, 2))

# 3. Frobenius Matrix Norm
frob_norm = np.linalg.norm(X, ord='fro')
print("Frobenius Norm:", round(frob_norm, 2))`,
    codeExplanation: 'np.linalg.solve provides robust solutions with condition-number monitoring.',
    commonMistakes: [
      'Inverting matrices with np.linalg.inv() instead of using np.linalg.solve() or np.linalg.lstsq().',
      'Using np.linalg.eig() on symmetric covariance matrices instead of np.linalg.eigh() (which guarantees real eigenvalues).',
      'Ignoring matrix condition numbers, leading to catastrophic cancellation errors in near-singular matrices.'
    ],
    interviewQuestions: [
      'Why is np.linalg.solve(A, b) numerically preferred over np.linalg.inv(A) @ b?',
      'How does Singular Value Decomposition relate to finding the Principal Components of a dataset?'
    ],
    miniChallenge: {
      question: 'Which decomposition is fastest and most numerically stable for solving positive-definite linear systems?',
      options: ['Cholesky Decomposition', 'QR Decomposition', 'Full SVD', 'Cramer Rule'],
      correctIndex: 0,
      explanation: 'Cholesky decomposition A = L L^T is roughly twice as fast as LU decomposition and specialized for symmetric positive-definite matrices.'
    }
  },
  {
    id: 'numpy_07',
    courseId: 'course_numpy_foundations',
    order: 7,
    title: '07 Random Sampling, Probability Distributions & BitGenerators',
    subtitle: 'Modern np.random.default_rng, PCG64, statistical distributions & reproducibility',
    oneLineIntuition: 'High-quality pseudo-randomness with isolated generator instances prevents cross-thread contamination and guarantees strict experimental reproducibility.',
    beginnerExplanation: 'If you want to simulate rolling 1,000,000 dice or initialize neural network weights, you need numbers that look completely random. Modern NumPy gives each experiment its own dedicated generator so one experiment never interferes with another.',
    technicalExplanation: 'The legacy `np.random.seed()` API relied on a single global Mersenne Twister (MT19937) state, which had poor statistical properties and was prone to concurrency race conditions. Modern NumPy uses `default_rng()` backed by the PCG64 BitGenerator. It provides fast sampling from Normal, Binomial, Poisson, Gamma, and Dirichlet distributions with independent stream generation.',
    mathFormula: {
      latex: 'X \\sim \\mathcal{N}(\\mu, \\sigma^2) \\implies x = \\mu + \\sigma \\cdot z, \\quad z \\sim \\mathcal{N}(0, 1)',
      explanation: 'Gaussian sampling parameterized by mean mu and standard deviation sigma.'
    },
    visualType: 'linear_regression',
    realWorldExample: 'Monte Carlo risk simulations in quantitative finance to model 100,000 portfolio paths under market volatility.',
    pythonCode: `import numpy as np

# 1. Initialize modern, isolated BitGenerator
rng = np.random.default_rng(seed=42)

# 2. Sample from various distributions
normal_samples = rng.normal(loc=100.0, scale=15.0, size=1000) # IQ scores
uniform_weights = rng.uniform(low=-0.05, high=0.05, size=(4, 4)) # Weight init
poisson_arrivals = rng.poisson(lam=5.0, size=500) # Web requests/min

# 3. Reproducible permutation & choice without replacement
deck = np.arange(52)
shuffled = rng.permutation(deck)
hand = rng.choice(shuffled, size=5, replace=False)

print("Sampled Mean:", round(normal_samples.mean(), 2))
print("Sampled Std Dev:", round(normal_samples.std(), 2))
print("5 Cards Hand:", hand)`,
    codeExplanation: 'default_rng provides thread-safe, statistically rigorous random sampling.',
    commonMistakes: [
      'Using the deprecated global np.random.seed() in modern Python codebases.',
      'Assuming random numbers in computer simulations are truly random rather than deterministic pseudo-random sequences.',
      'Using random choices with replacement (replace=True) when drawing unique test set partitions.'
    ],
    interviewQuestions: [
      'Why did NumPy replace the Mersenne Twister with PCG64 in np.random.default_rng()?',
      'How do you ensure deterministic reproducibility when training machine learning models across multiple CPU threads?'
    ],
    miniChallenge: {
      question: 'What is the recommended modern way to create a random number generator in NumPy?',
      options: ['np.random.seed(42)', 'np.random.default_rng(42)', 'random.seed(42)', 'np.random.RandomState()'],
      correctIndex: 1,
      explanation: 'np.random.default_rng(seed) creates an isolated instance using the state-of-the-art PCG64 BitGenerator.'
    }
  },
  {
    id: 'numpy_08',
    courseId: 'course_numpy_foundations',
    order: 8,
    title: '08 Memory Management, Views vs Copies & Performance Profiling',
    subtitle: 'Checking array.base, in-place operators, cache locality, and zero-allocation pipelines',
    oneLineIntuition: 'High-performance computing is about keeping data inside the CPU L1/L2 caches and never asking the operating system to allocate memory twice.',
    beginnerExplanation: 'If you want to move 1,000 bricks, copying memory is like buying 1,000 new bricks and throwing the old ones away. Working in-place is simply painting the bricks you already have right where they sit.',
    technicalExplanation: 'An array slice that shares memory with an underlying parent buffer has its `.base` attribute pointing to that parent. Modifying a view modifies the parent! When performing operations like `a = a + b`, NumPy allocates a brand new intermediate array; using `a += b` or `np.add(a, b, out=a)` mutates the buffer in-place without memory allocation. Cache locality dictates that sequential row iteration in C-order is dramatically faster than jumping across columns.',
    mathFormula: {
      latex: '\\text{arr.base is not None} \\implies \\text{arr is a zero-allocation View}',
      explanation: 'Verification condition for memory sharing and zero-copy slicing.'
    },
    visualType: 'linear_regression',
    realWorldExample: 'High-frequency trading order book updates running in microsecond latency envelopes.',
    pythonCode: `import numpy as np

# 1. Inspecting buffer ownership via .base
parent = np.ones((100, 100))
view = parent[10:20, 10:20]
copy = parent[10:20, 10:20].copy()

print("View has base?", view.base is parent) # True (Zero memory overhead)
print("Copy has base?", copy.base is None)    # True (Owns dedicated buffer)

# 2. In-place memory efficiency: out parameter
X = np.ones((1000, 1000), dtype=np.float64)
Y = np.ones((1000, 1000), dtype=np.float64)

# Bad: Allocates a new 8MB array
# Z = X + Y

# Good: Reuses pre-allocated buffer with zero new heap allocation!
np.add(X, Y, out=X)
print("X mutated in-place! Mean value:", X.mean())`,
    codeExplanation: 'Using the out parameter or in-place operators avoids garbage collection stalls in tight loops.',
    commonMistakes: [
      'Inadvertently mutating an original dataset because an operation returned a view instead of a copy.',
      'Creating multiple intermediate arrays in long mathematical expressions: `a * b + c * d` allocates multiple temporary arrays.',
      'Iterating through columns of a C-contiguous array, thrashing the CPU hardware cache.'
    ],
    interviewQuestions: [
      'How can you programmatically verify whether two NumPy arrays share the same memory buffer?',
      'How does cache locality affect the execution time of iterating over rows vs columns in a 2D array?'
    ],
    miniChallenge: {
      question: 'Which operation executes in-place without allocating a new buffer in memory?',
      options: ['a = a + 5', 'a += 5', 'a = np.add(a, 5)', 'a = a.astype(float)'],
      correctIndex: 1,
      explanation: 'The in-place operator += invokes the __iadd__ method, modifying the existing data buffer directly.'
    }
  }
];

export const NUMPY_MODULE: CourseModule = {
  id: 'course_numpy_foundations',
  title: 'NumPy Vectorized Computing & Foundations',
  track: 'Scientific Python & Array Engineering',
  description: 'Master the 8 core pillars of NumPy: NDArray memory strides, broadcasting rules, transformations, ufuncs, linear algebra, random sampling, and performance optimization.',
  lessons: NUMPY_TOPICS_LESSONS
};

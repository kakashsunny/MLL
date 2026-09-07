import { SyntaxEntry } from './types';

export const SYNTAX_ENTRIES: SyntaxEntry[] = [
  // ==========================================
  // 1. PYTHON CORE & ML IDIOMS
  // ==========================================
  {
    id: 'py_zip',
    library: 'python',
    category: 'Core Syntax & Idioms',
    name: 'zip(*iterables, strict=False)',
    signature: 'zip(*iterables, strict=False) -> zip object',
    summary: 'Aggregates elements from multiple iterables into tuples; crucial for pairwise processing and matrix transpositions.',
    usage: 'Pairs corresponding elements from two or more sequences. When processing features and targets, parallel batches, or transposing 2D coordinate lists without NumPy, zip provides an efficient iterator.',
    parameters: [
      { name: '*iterables', type: 'Iterable', isRequired: true, description: 'Sequences, generators, or collections to pair together element-wise.' },
      { name: 'strict', type: 'bool', defaultVal: 'False', description: 'Python 3.10+. If True, raises ValueError if one iterable is exhausted before others.' }
    ],
    returns: 'An iterator of tuples where the i-th tuple contains the i-th element from each argument sequence.',
    codeExample: `# 1. Pairing feature names with learned weights
features = ['sqft', 'bedrooms', 'age']
weights = [250.5, -1200.0, -85.2]
feature_weights = dict(zip(features, weights))

# 2. Matrix Transpose idiom in pure Python
matrix = [[1, 2, 3], [4, 5, 6]]
transposed = [list(col) for col in zip(*matrix)]

print("Weights:", feature_weights)
print("Transposed:", transposed)`,
    expectedOutput: `Weights: {'sqft': 250.5, 'bedrooms': -1200.0, 'age': -85.2}
Transposed: [[1, 4], [2, 5], [3, 6]]`,
    commonPitfalls: [
      'Silently truncates to the shortest iterable by default when strict=False, risking silent truncation of dataset samples.',
      'zip returns a single-pass iterator; iterating over it a second time yields empty results unless cast to a list or tuple.',
      'Using zip(*generator) loads the entire generator into memory before unpacking, eliminating lazy streaming.'
    ],
    interviewUseCases: [
      {
        question: 'How do you transpose an n x m matrix in pure Python without third-party libraries?',
        answerSummary: 'Use [list(row) for row in zip(*matrix)]. The unpacking operator * expands the rows as individual positional arguments to zip, which groups corresponding indices together.',
        companyFocus: ['Google', 'Meta', 'Amazon']
      },
      {
        question: 'Why did Python 3.10 introduce the strict=True argument to zip()?',
        answerSummary: 'In ML data ingestion, if your features X and targets y have mismatched lengths due to a silent indexing bug, standard zip() silently drops trailing samples without raising an exception.',
        companyFocus: ['Stripe', 'Databricks']
      }
    ],
    complexity: { time: 'O(N * K)', space: 'O(1) iterator overhead' },
    tags: ['iteration', 'transposition', 'data-pairing', 'python-idioms'],
    relatedFunctions: ['enumerate', 'itertools.zip_longest']
  },
  {
    id: 'py_enumerate',
    library: 'python',
    category: 'Core Syntax & Idioms',
    name: 'enumerate(iterable, start=0)',
    signature: 'enumerate(iterable, start=0) -> enumerate object',
    summary: 'Yields pairs of running index count and value from any iterable, eliminating manual counter variables.',
    usage: 'Used throughout ML training loops, minibatch monitoring, logging epoch progress, and indexing arrays without maintaining an external integer counter.',
    parameters: [
      { name: 'iterable', type: 'Iterable', isRequired: true, description: 'Any object supporting iteration (lists, tensors, generators).' },
      { name: 'start', type: 'int', defaultVal: '0', description: 'The integer index from which the counter starts counting.' }
    ],
    returns: 'An iterator yielding tuples of the form (count, value).',
    codeExample: `epochs_losses = [0.65, 0.42, 0.31, 0.28]

for epoch, loss in enumerate(epochs_losses, start=1):
    status = "Converging" if loss < 0.35 else "Training"
    print(f"Epoch {epoch:02d} | Loss: {loss:.3f} | {status}")`,
    expectedOutput: `Epoch 01 | Loss: 0.650 | Training
Epoch 02 | Loss: 0.420 | Training
Epoch 03 | Loss: 0.310 | Converging
Epoch 04 | Loss: 0.280 | Converging`,
    commonPitfalls: [
      'Using len(range(...)) instead of enumerate is an anti-pattern in Python that hinders readability and generator compatibility.',
      'Modifying the underlying list while enumerating causes skipped or duplicated elements.',
      'Unpacking (i, x) when the iterable itself yields tuples requires nested unpacking: (i, (a, b)).'
    ],
    interviewUseCases: [
      {
        question: 'Why is enumerate preferred over range(len(data)) in production ML loops?',
        answerSummary: 'enumerate works with any generator or streaming iterable without requiring prior materialization into memory, whereas len() requires finite collections with known size.',
        companyFocus: ['Apple', 'Microsoft']
      }
    ],
    complexity: { time: 'O(N)', space: 'O(1)' },
    tags: ['loops', 'indexing', 'clean-code']
  },
  {
    id: 'py_args_kwargs',
    library: 'python',
    category: 'Core Syntax & Idioms',
    name: '*args and **kwargs',
    signature: 'def fn(*args, **kwargs): ...',
    summary: 'Variable-length positional and keyword argument forwarding, essential for model wrappers and custom decorators.',
    usage: 'Allows functions, estimator wrappers, and PyTorch nn.Module subclasses to accept flexible parameters and pass unused arguments down to underlying base classes.',
    parameters: [
      { name: '*args', type: 'Tuple', isRequired: false, description: 'Captures arbitrary positional arguments as a tuple.' },
      { name: '**kwargs', type: 'Dict[str, Any]', isRequired: false, description: 'Captures arbitrary keyword arguments as a dictionary.' }
    ],
    returns: 'Tuples and dictionaries inside the local function scope.',
    codeExample: `class BaseModelWrapper:
    def __init__(self, model_cls, *args, **kwargs):
        # Forward hyperparams directly to underlying estimator
        self.model = model_cls(*args, **kwargs)
        self.is_fitted = False

    def fit(self, X, y, **fit_kwargs):
        print(f"Fitting with options: {fit_kwargs}")
        self.is_fitted = True
        return self`,
    expectedOutput: `Fitting with options: {'sample_weight': [1, 2, 1]}`,
    commonPitfalls: [
      'Passing keyword arguments that match positional parameter names causes TypeError: multiple values for argument.',
      'Unpacking mutable objects as default arguments in signatures (e.g. kwargs={}) persists state across invocations.',
      'Forgetting the double asterisk when forwarding kwargs results in passing a dict as a single positional argument.'
    ],
    interviewUseCases: [
      {
        question: 'How does parameter forwarding in custom Scikit-Learn transformers work using *args and **kwargs?',
        answerSummary: 'By calling super().__init__(*args, **kwargs), custom transformers inherit sklearn BaseEstimator behavior while letting user pass estimator parameters transparently.',
        companyFocus: ['Uber', 'Meta']
      }
    ],
    complexity: { time: 'O(K)', space: 'O(K)' },
    tags: ['functions', 'decorators', 'object-oriented']
  },
  {
    id: 'py_defaultdict',
    library: 'python',
    category: 'Core Syntax & Idioms',
    name: 'collections.defaultdict(default_factory)',
    signature: 'collections.defaultdict(default_factory=None, /[, ...])',
    summary: 'Dictionary subclass that supplies a default value for missing keys, preventing KeyError during graph and token building.',
    usage: 'Ideal for building vocabularies, token frequencies, inverted index tables, and adjacency graphs in Graph Neural Networks without manual key-existence checks.',
    parameters: [
      { name: 'default_factory', type: 'Callable[[], Any]', isRequired: false, description: 'Function returning default value (e.g. int, list, set).' }
    ],
    returns: 'A dict-like object with automatic default generation on missing key access.',
    codeExample: `from collections import defaultdict

# Building an inverted vocabulary index
corpus = ["gradient descent is an optimization algorithm", "descent step minimizes loss"]
vocab = defaultdict(list)

for doc_id, text in enumerate(corpus):
    for word in text.split():
        vocab[word].append(doc_id)

print("Inverted index for 'descent':", vocab['descent'])
print("Non-existent word default:", vocab['unknown'])`,
    expectedOutput: `Inverted index for 'descent': [0, 1]
Non-existent word default: []`,
    commonPitfalls: [
      'Querying a missing key with d[k] automatically inserts it into the dictionary, which can silently inflate dictionary size during read-only lookups.',
      'Passing an instance rather than a callable factory (e.g. defaultdict([]) instead of defaultdict(list)) raises TypeError.',
      'Serializing defaultdict with standard JSON encoders requires converting to a plain dict first via dict(defaultdict_obj).'
    ],
    interviewUseCases: [
      {
        question: 'How do you compute word co-occurrence matrices efficiently without key checking overhead?',
        answerSummary: 'Using defaultdict(lambda: defaultdict(int)) lets you increment matrix[w1][w2] += 1 directly in O(1) time without preliminary contains checks.',
        companyFocus: ['Amazon', 'Bloomberg']
      }
    ],
    complexity: { time: 'O(1) average lookup/insertion', space: 'O(N)' },
    tags: ['data-structures', 'nlp', 'graph', 'collections']
  },
  {
    id: 'py_generators',
    library: 'python',
    category: 'Core Syntax & Idioms',
    name: 'Generators & yield',
    signature: 'def data_stream(): yield batch',
    summary: 'Functions that return lazy iterators; pauses state to stream massive datasets without exhausting system RAM.',
    usage: 'The backbone of streaming dataset loaders in PyTorch (IterableDataset) and processing multi-gigabyte CSV/Parquet logs line by line.',
    parameters: [
      { name: 'yield expr', type: 'Any', isRequired: true, description: 'Value emitted to caller before execution pauses.' }
    ],
    returns: 'A generator iterator with next() and send() methods.',
    codeExample: `def batch_generator(data_size, batch_size=32):
    """Lazily generates start and end slice tuples."""
    for i in range(0, data_size, batch_size):
        yield (i, min(i + batch_size, data_size))

# Consume stream without loading all indices into a list
stream = batch_generator(100, batch_size=40)
for start, end in stream:
    print(f"Batch Slice: [{start}:{end}]")`,
    expectedOutput: `Batch Slice: [0:40]
Batch Slice: [40:80]
Batch Slice: [80:100]`,
    commonPitfalls: [
      'Generators are exhausted once iterated; attempting a second loop yields nothing without re-instantiating.',
      'Calling return with a value in a generator raises StopIteration(val) rather than returning the value directly.',
      'Using list comprehensions [x for x in large_stream] defeats generator memory savings by buffering into RAM.'
    ],
    interviewUseCases: [
      {
        question: 'How would you train an ML model on a 100GB dataset using an 8GB RAM machine?',
        answerSummary: 'Write a Python generator that lazily reads disk chunks line-by-line or uses memory mapping, yielding minibatches to model.partial_fit() without loading the whole file.',
        companyFocus: ['Netflix', 'Meta', 'Google']
      }
    ],
    complexity: { time: 'O(1) per step', space: 'O(1) memory bound' },
    tags: ['memory-optimization', 'streaming', 'concurrency']
  },

  // ==========================================
  // 2. NUMPY (TENSORS & ARRAY MATH)
  // ==========================================
  {
    id: 'np_broadcast_to',
    library: 'numpy',
    category: 'Broadcasting & Math',
    name: 'np.broadcast_to(array, shape, subok=False)',
    signature: 'numpy.broadcast_to(array, shape, subok=False) -> ndarray',
    summary: 'Broadcasts an array to a new shape, creating a read-only view with zero memory copying via 0-strides.',
    usage: 'Used in attention mechanisms, batch tensor operations, and manual loss broadcasting to expand feature shapes without duplicating memory blocks.',
    parameters: [
      { name: 'array', type: 'array_like', isRequired: true, description: 'The input array to broadcast.' },
      { name: 'shape', type: 'tuple of ints', isRequired: true, description: 'The desired target broadcast shape.' },
      { name: 'subok', type: 'bool', defaultVal: 'False', description: 'If True, subclasses are preserved.' }
    ],
    returns: 'A read-only ndarray view with the specified shape.',
    codeExample: `import numpy as np

# 1D feature bias vector
bias = np.array([1.5, 2.0, -0.5])  # shape: (3,)

# Broadcast across a batch of 4 samples without memory replication
batch_bias = np.broadcast_to(bias, (4, 3))

print("Shape:", batch_bias.shape)
print("Strides:", batch_bias.strides)  # Note the 0-stride on the row dimension
print(batch_bias)`,
    expectedOutput: `Shape: (4, 3)
Strides: (0, 8)
[[ 1.5  2.  -0.5]
 [ 1.5  2.  -0.5]
 [ 1.5  2.  -0.5]
 [ 1.5  2.  -0.5]]`,
    commonPitfalls: [
      'The returned array is read-only; attempting to write into it throws ValueError: assignment destination is read-only.',
      'Shapes must be compatible according to NumPy broadcasting rules (trailing dimensions must match or be 1).',
      'np.broadcast_to does not create contiguous memory; some C-extensions will fail if expecting contiguous buffers.'
    ],
    interviewUseCases: [
      {
        question: 'How does NumPy achieve zero-copy broadcasting under the hood?',
        answerSummary: 'By setting the stride of the expanded dimension to 0. Moving along that dimension advances 0 bytes in physical memory, repeatedly referencing the same memory address.',
        companyFocus: ['Google DeepMind', 'OpenAI', 'Jane Street']
      }
    ],
    complexity: { time: 'O(1)', space: 'O(1) view' },
    tags: ['broadcasting', 'strides', 'memory-view', 'vectorization'],
    relatedFunctions: ['np.newaxis', 'np.expand_dims']
  },
  {
    id: 'np_matmul_vs_dot',
    library: 'numpy',
    category: 'Linear Algebra & Tensors',
    name: 'np.matmul(x1, x2) vs @ vs np.dot(a, b)',
    signature: 'numpy.matmul(x1, x2, /[, out, ...]) or x1 @ x2',
    summary: 'Matrix product of two arrays; respects batch dimensions for 3D+ tensors, whereas np.dot calculates inner products.',
    usage: 'Essential for Transformer attention weight computation (Batch x Heads x Seq x Dim), linear layers, and multi-head projection tensors.',
    parameters: [
      { name: 'x1', type: 'array_like', isRequired: true, description: 'Input array with shape (..., N, K).' },
      { name: 'x2', type: 'array_like', isRequired: true, description: 'Input array with shape (..., K, M).' }
    ],
    returns: 'Matrix multiplication result with shape (..., N, M).',
    codeExample: `import numpy as np

# Batched Attention Simulation: Batch=2, Seq=3, Dim=4
Q = np.random.randn(2, 3, 4)
K = np.random.randn(2, 4, 3)

# Batched matrix multiplication with @
scores = Q @ K  # Equivalent to np.matmul(Q, K)

print("Q shape:", Q.shape)
print("K shape:", K.shape)
print("Scores shape (Batch x Seq x Seq):", scores.shape)`,
    expectedOutput: `Q shape: (2, 3, 4)
K shape: (2, 4, 3)
Scores shape (Batch x Seq x Seq): (2, 3, 3)`,
    commonPitfalls: [
      'Using np.dot on 3D+ tensors multiplies over the last axis of a and second-to-last of b, producing an unexpected (2, 3, 2, 3) 4D tensor instead of (2, 3, 3).',
      'Multiplying 1D vectors with @ computes the scalar inner product, which may cause dimension squeeze bugs if expecting a 2D matrix.',
      'Floating point order of operations can lead to subtle non-determinism across platforms with BLAS/MKL.'
    ],
    interviewUseCases: [
      {
        question: 'What is the crucial difference between np.dot() and np.matmul() (@) when handling 3D batch arrays in Deep Learning?',
        answerSummary: 'np.matmul treats trailing 2 dimensions as matrices and broadcasts leading batch dimensions, yielding (B, N, M). np.dot performs sum products over axes, expanding dimensions to (B, N, B, M).',
        companyFocus: ['NVIDIA', 'Apple', 'Meta']
      }
    ],
    complexity: { time: 'O(B * N * K * M)', space: 'O(B * N * M)' },
    tags: ['linear-algebra', 'transformers', 'batch-processing']
  },
  {
    id: 'np_einsum',
    library: 'numpy',
    category: 'Linear Algebra & Tensors',
    name: 'np.einsum(subscripts, *operands)',
    signature: 'numpy.einsum(subscripts, *operands, out=None, optimize=False)',
    summary: 'Einstein summation notation for expressing complex tensor contractions, traces, transpositions, and multi-head attention.',
    usage: 'Provides an expressive, highly optimized syntax for tensor operations without intermediate array allocation or manual reshaping.',
    parameters: [
      { name: 'subscripts', type: 'str', isRequired: true, description: 'Format string specifying indices (e.g. "bik,bkj->bij").' },
      { name: '*operands', type: 'array_like', isRequired: true, description: 'One or more arrays operated upon.' },
      { name: 'optimize', type: 'bool or str', defaultVal: 'False', description: 'Finds optimal contraction path for multi-tensor graphs.' }
    ],
    returns: 'Calculated tensor contraction result.',
    codeExample: `import numpy as np

# 1. Matrix trace: sum of diagonal elements
A = np.array([[1, 2], [3, 4]])
trace = np.einsum('ii', A)

# 2. Batch Matrix Multiply: (Batch, N, K) x (Batch, K, M) -> (Batch, N, M)
X = np.random.randn(4, 8, 16)
W = np.random.randn(4, 16, 32)
out = np.einsum('bik,bkj->bij', X, W)

print("Trace:", trace)
print("Einsum Batch Matmul Output Shape:", out.shape)`,
    expectedOutput: `Trace: 5
Einsum Batch Matmul Output Shape: (4, 8, 32)`,
    commonPitfalls: [
      'Omitting optimize=True on contractions with 3+ tensors can cause combinatorial path searches resulting in exponential slowdowns.',
      'Typos in index subscripts cause silent dimension transposition or runtime shape errors that are difficult to debug.',
      'Index letters are case-sensitive; "A" and "a" represent different indices.'
    ],
    interviewUseCases: [
      {
        question: 'How do you calculate multi-head attention scores QK^T using np.einsum?',
        answerSummary: 'np.einsum("bhqd,bhkd->bhqk", Q, K) cleanly matches batch b, heads h, query seq q, key seq k, contracting over hidden dimension d in one readable call.',
        companyFocus: ['Google Brain', 'Anthropic', 'Hugging Face']
      }
    ],
    complexity: { time: 'Depends on contraction path', space: 'Minimal intermediate allocations' },
    tags: ['einsum', 'tensors', 'transformers', 'optimization']
  },
  {
    id: 'np_where',
    library: 'numpy',
    category: 'Filtering & Querying',
    name: 'np.where(condition, [x, y])',
    signature: 'numpy.where(condition, [x, y, /]) -> ndarray or tuple of ndarrays',
    summary: 'Vectorized ternary conditional selection; returns elements chosen from x or y depending on condition.',
    usage: 'Used for thresholding predicted probabilities into binary labels, applying non-linear activation bounds, and filtering outlier indices.',
    parameters: [
      { name: 'condition', type: 'array_like, bool', isRequired: true, description: 'Boolean array where True chooses from x and False from y.' },
      { name: 'x', type: 'array_like', isRequired: false, description: 'Values from which to choose if condition is True.' },
      { name: 'y', type: 'array_like', isRequired: false, description: 'Values from which to choose if condition is False.' }
    ],
    returns: 'Array with values selected from x where condition is True, and y where False. If x and y are omitted, returns indices where condition is True.',
    codeExample: `import numpy as np

probabilities = np.array([0.12, 0.85, 0.49, 0.99, 0.51])

# Binary classification decision with 0.5 threshold
predictions = np.where(probabilities >= 0.5, 1, 0)

# Extract indices of high confidence predictions (> 0.8)
high_conf_indices = np.where(probabilities > 0.8)[0]

print("Predictions:", predictions)
print("High confidence indices:", high_conf_indices)`,
    expectedOutput: `Predictions: [0 1 0 1 1]
High confidence indices: [1 3]`,
    commonPitfalls: [
      'Both x and y arguments are evaluated completely before selection; if x or y contains a zero-division, a RuntimeWarning will still be emitted.',
      'When x and y are omitted, np.where returns a tuple of index arrays (one per dimension), requiring [0] indexing for 1D arrays.',
      'Mixing scalar values and arrays with incompatible broadcast shapes throws ValueError.'
    ],
    interviewUseCases: [
      {
        question: 'How do you avoid NaN warnings when computing log(x) in cross-entropy loss using np.where?',
        answerSummary: 'Because np.where evaluates both branches, compute np.where(x > 0, np.log(np.maximum(x, 1e-15)), 0.0) or use np.clip() first to prevent NaN generation.',
        companyFocus: ['Two Sigma', 'Citadel', 'Amazon']
      }
    ],
    complexity: { time: 'O(N)', space: 'O(N)' },
    tags: ['filtering', 'conditionals', 'thresholding', 'vectorization']
  },
  {
    id: 'np_argmax',
    library: 'numpy',
    category: 'Filtering & Querying',
    name: 'np.argmax(a, axis=None, out=None, *, keepdims=False)',
    signature: 'numpy.argmax(a, axis=None, out=None, *, keepdims=False) -> ndarray of ints',
    summary: 'Returns the indices of the maximum values along an axis, the standard mechanism for multi-class classification inference.',
    usage: 'Converts raw logits or softmax probability distributions into discrete predicted class labels (e.g. converting 1000 ImageNet logits to top-1 class IDs).',
    parameters: [
      { name: 'a', type: 'array_like', isRequired: true, description: 'Input array of scores or probabilities.' },
      { name: 'axis', type: 'int', defaultVal: 'None', description: 'Axis along which to operate. Default flattens the array.' },
      { name: 'keepdims', type: 'bool', defaultVal: 'False', description: 'If True, reduced axes are left with size one.' }
    ],
    returns: 'Array of integer indices pointing to maximum values.',
    codeExample: `import numpy as np

# Softmax logits for 3 samples across 4 classes
logits = np.array([
    [0.1, 0.7, 0.1, 0.1],  # class 1
    [0.9, 0.0, 0.05, 0.05], # class 0
    [0.2, 0.1, 0.6, 0.1]   # class 2
])

# Predict class along axis 1 (across columns)
predicted_classes = np.argmax(logits, axis=1)

print("Predicted classes:", predicted_classes)`,
    expectedOutput: `Predicted classes: [1 0 2]`,
    commonPitfalls: [
      'In case of ties (multiple identical maximum values), argmax returns only the first occurrence along the axis.',
      'Omitting axis=1 on 2D matrices defaults to axis=None, flattening the matrix and returning a single global scalar index.',
      'NaN values in the array can result in undefined index behavior depending on the platform BLAS implementation.'
    ],
    interviewUseCases: [
      {
        question: 'How do you extract the top-k class indices instead of just top-1 in NumPy?',
        answerSummary: 'Use np.argpartition(-logits, kth=k, axis=1)[:, :k] for O(N) selection, which is significantly faster than a full O(N log N) np.argsort().',
        companyFocus: ['Google', 'Meta', 'DoorDash']
      }
    ],
    complexity: { time: 'O(N)', space: 'O(N / axis_size)' },
    tags: ['classification', 'inference', 'softmax', 'argmax']
  },

  // ==========================================
  // 3. PANDAS (DATA WRANGLING & ANALYSIS)
  // ==========================================
  {
    id: 'pd_merge',
    library: 'pandas',
    category: 'Reshaping & Merging',
    name: 'pd.merge(left, right, how="inner", on=None, ...)',
    signature: 'pandas.merge(left, right, how="inner", on=None, left_on=None, right_on=None, suffixes=("_x", "_y"))',
    summary: 'Database-style relational joins on DataFrames, supporting inner, left, right, and outer merges on specific key columns.',
    usage: 'Combines heterogeneous feature tables (e.g. user demographic metadata with real-time transactional activity) during feature engineering pipelines.',
    parameters: [
      { name: 'left, right', type: 'DataFrame', isRequired: true, description: 'The two DataFrames to join.' },
      { name: 'how', type: "str: 'left'|'right'|'outer'|'inner'|'cross'", defaultVal: "'inner'", description: 'Type of merge to perform.' },
      { name: 'on', type: 'label or list', isRequired: false, description: 'Column names to join on. Must be found in both DataFrames.' },
      { name: 'suffixes', type: 'tuple of str', defaultVal: "('_x', '_y')", description: 'Suffix to apply to overlapping column names.' }
    ],
    returns: 'Merged DataFrame containing aligned rows from both inputs.',
    codeExample: `import pandas as pd

users = pd.DataFrame({'user_id': [1, 2, 3], 'tier': ['Gold', 'Silver', 'Bronze']})
transactions = pd.DataFrame({'user_id': [1, 1, 2, 4], 'amount': [120, 45, 90, 300]})

# Left join to retain all transactions and enrich with user tier
merged = pd.merge(transactions, users, on='user_id', how='left')

print(merged)`,
    expectedOutput: `   user_id  amount    tier
0        1     120    Gold
1        1      45    Gold
2        2      90  Silver
3        4     300     NaN`,
    commonPitfalls: [
      'Duplicate keys on both sides create an inadvertent Cartesian product explosion (many-to-many join), ballooning memory usage.',
      'Merging on float columns can silently fail due to minor floating-point rounding discrepancies.',
      'Performing an outer join converts integer columns containing nulls to float64 unless using nullable Int64 dtype.'
    ],
    interviewUseCases: [
      {
        question: 'How do you detect accidental row explosion after a Pandas merge in production?',
        answerSummary: 'Assert len(merged) == len(left_df) when doing a 1-to-many left join, or pass validate="1:m" directly into pd.merge() to have Pandas throw a MergeError automatically.',
        companyFocus: ['Uber', 'Airbnb', 'Lyft']
      }
    ],
    complexity: { time: 'O(N + M) hash join', space: 'O(N + M)' },
    tags: ['sql-join', 'feature-store', 'data-wrangling']
  },
  {
    id: 'pd_groupby_agg',
    library: 'pandas',
    category: 'Aggregation & GroupBy',
    name: 'df.groupby(by).agg(func)',
    signature: 'DataFrameGroupBy.agg(func=None, *args, **kwargs) -> DataFrame',
    summary: 'Applies split-apply-combine aggregations on groups; supports custom functions, multiple statistics, and named outputs.',
    usage: 'Generates group-level features (e.g. historical mean user spend, transaction standard deviation, category purchase counts).',
    parameters: [
      { name: 'by', type: 'mapping, function, label, or list', isRequired: true, description: 'Keys determining the grouping structure.' },
      { name: 'func', type: 'function, str, list, or dict', isRequired: true, description: 'Aggregation functions to apply per group.' }
    ],
    returns: 'Aggregated DataFrame with grouped indices or flat columns.',
    codeExample: `import pandas as pd

df = pd.DataFrame({
    'category': ['Tech', 'Tech', 'Health', 'Health', 'Tech'],
    'spend': [120, 80, 50, 95, 300],
    'clicks': [12, 8, 4, 9, 25]
})

# Named aggregation with multiple metrics
summary = df.groupby('category').agg(
    total_spend=('spend', 'sum'),
    mean_spend=('spend', 'mean'),
    click_std=('clicks', 'std')
).reset_index()

print(summary)`,
    expectedOutput: `  category  total_spend  mean_spend  click_std
0   Health          145   72.500000   3.535534
1     Tech          500  166.666667   8.888194`,
    commonPitfalls: [
      'Using .apply() instead of .agg() runs arbitrary Python byte-code, losing vectorized Cython optimizations and slowing execution by 10x-50x.',
      'MultiIndex columns produced by passing lists of functions to agg() can complicate downstream pipelines; use named tuples agg(new_col=(orig_col, func)).',
      'Grouping on float columns can create fragmented groups due to precision noise.'
    ],
    interviewUseCases: [
      {
        question: 'Why should you avoid df.groupby().apply() in high-throughput data engineering?',
        answerSummary: 'apply() invokes a Python function for each group sequentially with high interpreter overhead. agg() leverages vectorized C-level routines like Cython cyth_agg for mean, sum, and std.',
        companyFocus: ['Palantir', 'Snowflake', 'Meta']
      }
    ],
    complexity: { time: 'O(N) hash grouping', space: 'O(G) groups' },
    tags: ['groupby', 'aggregation', 'feature-engineering']
  },
  {
    id: 'pd_pivot_table',
    library: 'pandas',
    category: 'Reshaping & Merging',
    name: 'pd.pivot_table(data, values, index, columns, aggfunc="mean")',
    signature: 'pandas.pivot_table(data, values=None, index=None, columns=None, aggfunc="mean", fill_value=None)',
    summary: 'Creates spreadsheet-style pivot tables for multidimensional summary matrices and co-occurrence tables.',
    usage: 'Generates user-item interaction matrices for Collaborative Filtering recommendation systems, cross-tabulating categories.',
    parameters: [
      { name: 'data', type: 'DataFrame', isRequired: true, description: 'Source DataFrame.' },
      { name: 'values', type: 'column label or list', isRequired: false, description: 'Column to aggregate.' },
      { name: 'index', type: 'column label or list', isRequired: true, description: 'Keys to group by on the pivot table index (rows).' },
      { name: 'columns', type: 'column label or list', isRequired: true, description: 'Keys to group by on the pivot table columns.' },
      { name: 'aggfunc', type: 'function or list', defaultVal: "'mean'", description: 'Aggregation function.' }
    ],
    returns: 'Reshaped 2D DataFrame matrix.',
    codeExample: `import pandas as pd

interactions = pd.DataFrame({
    'user_id': ['u1', 'u1', 'u2', 'u3', 'u2'],
    'item_id': ['itemA', 'itemB', 'itemA', 'itemC', 'itemC'],
    'rating': [5, 4, 3, 5, 2]
})

# Construct User-Item rating matrix with 0 fill
matrix = pd.pivot_table(interactions, values='rating', index='user_id', columns='item_id', fill_value=0)

print(matrix)`,
    expectedOutput: `item_id  itemA  itemB  itemC
user_id                     
u1           5      4      0
u2           3      0      2
u3           0      0      5`,
    commonPitfalls: [
      'High-cardinality index and columns (e.g. 100k users x 50k items) create massive dense matrices that trigger Out-Of-Memory (OOM) crashes; use scipy.sparse.csr_matrix instead.',
      'Default aggfunc is "mean", which may produce unexpected fractional floats when expecting raw counts (use aggfunc="count" or "sum").'
    ],
    interviewUseCases: [
      {
        question: 'How do you convert a wide pivot table back into a normalized tidy DataFrame for plotting or modeling?',
        answerSummary: 'Use pd.melt() or df.stack().reset_index() to unpivot columns into key-value attribute rows.',
        companyFocus: ['Spotify', 'Pinterest']
      }
    ],
    complexity: { time: 'O(N)', space: 'O(Rows * Cols)' },
    tags: ['recsys', 'pivot', 'matrix-construction']
  },
  {
    id: 'pd_loc_vs_iloc',
    library: 'pandas',
    category: 'Filtering & Querying',
    name: 'df.loc[] vs df.iloc[]',
    signature: 'df.loc[row_label, col_label] vs df.iloc[row_idx, col_idx]',
    summary: 'Label-based (.loc) vs integer-position-based (.iloc) indexing; critical for avoiding SettingWithCopyWarning.',
    usage: 'Extracting feature subsets, slicing validation windows in time-series data, and updating specific cell values in-place safely.',
    parameters: [
      { name: 'row_indexer', type: 'slice, list, boolean array, or callable', isRequired: true, description: 'Specifies which rows to select.' },
      { name: 'col_indexer', type: 'slice, list, boolean array, or callable', isRequired: false, description: 'Specifies which columns to select.' }
    ],
    returns: 'Series (if 1D slice) or DataFrame (if 2D slice).',
    codeExample: `import pandas as pd

df = pd.DataFrame({'feature_a': [10, 20, 30], 'target': [0, 1, 1]}, index=['sample_1', 'sample_2', 'sample_3'])

# 1. Label-based selection (.loc) includes both endpoints in slices!
loc_subset = df.loc['sample_1':'sample_2', ['feature_a']]

# 2. Integer position selection (.iloc) excludes the stop endpoint (standard Python slice)
iloc_subset = df.iloc[0:2, 0:1]

print("iloc shape:", iloc_subset.shape)
print("loc match iloc:", loc_subset.equals(iloc_subset))`,
    expectedOutput: `iloc shape: (2, 1)
loc match iloc: True`,
    commonPitfalls: [
      'Chained indexing df[col][row] = val causes the notorious SettingWithCopyWarning and fails to update the original DataFrame.',
      '.loc slices include BOTH start and stop endpoints, whereas .iloc excludes the stop endpoint (like Python slices).',
      'When an index consists of integers that are not sorted or contiguous, .loc[0:3] looks for integer labels 0 and 3, NOT row offsets 0 to 3.'
    ],
    interviewUseCases: [
      {
        question: 'What causes the SettingWithCopyWarning in Pandas and how do you resolve it?',
        answerSummary: 'Chained indexing df[a][b] returns a temporary copy instead of a view. Writing to it modifies only the temporary copy. Resolve by writing via a single atomic indexer: df.loc[condition, "col"] = val.',
        companyFocus: ['Goldman Sachs', 'Morgan Stanley', 'Two Sigma']
      }
    ],
    complexity: { time: 'O(1) index lookup', space: 'O(1) view or copy' },
    tags: ['indexing', 'slice', 'settingwithcopy', 'data-access']
  },
  {
    id: 'pd_category_dtype',
    library: 'pandas',
    category: 'Missing Data & Cleaning',
    name: 'df[col].astype("category")',
    signature: 'Series.astype(dtype="category", copy=True) -> Series',
    summary: 'Encodes repetitive string features as integer dictionary categories, slashing RAM usage by up to 90%.',
    usage: 'Preprocessing high-volume tabular datasets with low cardinality (states, gender, country codes, product tiers) prior to modeling.',
    parameters: [
      { name: 'dtype', type: 'str or CategoricalDtype', isRequired: true, description: 'Set to "category" or a configured CategoricalDtype.' }
    ],
    returns: 'Series with categorical storage semantics.',
    codeExample: `import pandas as pd
import sys

# High-repetition string column
data = ['Enterprise Tier', 'Starter Tier', 'Pro Tier'] * 100000
s_obj = pd.Series(data)
s_cat = s_obj.astype('category')

mem_obj = s_obj.memory_usage(deep=True) / 1e6
mem_cat = s_cat.memory_usage(deep=True) / 1e6

print(f"Object String RAM: {mem_obj:.2f} MB")
print(f"Categorical RAM:   {mem_cat:.2f} MB (Reduction: {(1 - mem_cat/mem_obj)*100:.1f}%)")`,
    expectedOutput: `Object String RAM: 7.40 MB
Categorical RAM:   0.30 MB (Reduction: 95.9%)`,
    commonPitfalls: [
      'Adding unseen category values at test/inference time causes NaN insertion unless categories are set with .cat.set_categories().',
      'Using categorical columns with unoptimized custom functions might silently trigger cast back to object.',
      'High cardinality columns (e.g. unique UUIDs) gain zero memory reduction and incur lookup table overhead.'
    ],
    interviewUseCases: [
      {
        question: 'How do you optimize a 50GB Pandas dataset that is crashing an 8GB container?',
        answerSummary: 'Downcast float64 to float32, downcast int64 to int16/int8, and convert low-cardinality string columns to astype("category"). This typically reduces memory footprint by 75-90%.',
        companyFocus: ['Amazon', 'Capital One', 'Salesforce']
      }
    ],
    complexity: { time: 'O(N)', space: 'Up to 90% RAM reduction' },
    tags: ['memory-optimization', 'big-data', 'dtypes']
  },

  // ==========================================
  // 4. SCIKIT-LEARN (PIPELINES & ESTIMATORS)
  // ==========================================
  {
    id: 'sk_pipeline',
    library: 'sklearn',
    category: 'Pipelines & Transformers',
    name: 'Pipeline(steps, memory=None, verbose=False)',
    signature: 'sklearn.pipeline.Pipeline(steps, *, memory=None, verbose=False)',
    summary: 'Chains sequential transformers with a final estimator to eliminate train/test data leakage in cross-validation.',
    usage: 'The gold standard for production ML code. Sequentially applies .fit() and .transform() on intermediate transformers before calling .fit() on the final predictor.',
    parameters: [
      { name: 'steps', type: 'list of (str, transformer)', isRequired: true, description: 'Ordered tuple pairs of step names and estimator instances.' },
      { name: 'memory', type: 'str or object', defaultVal: 'None', description: 'joblib.Memory cache directory for caching fitted transformers.' }
    ],
    returns: 'A unified Pipeline object that adheres to the Scikit-Learn Estimator interface.',
    codeExample: `from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
import numpy as np

# Training dataset with missing values
X_train = np.array([[1.0, 2.0], [np.nan, 3.0], [7.0, 6.0]])
y_train = np.array([0, 0, 1])

# Safe pipeline: Impute -> Scale -> Classify
pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler()),
    ('classifier', LogisticRegression())
])

# Fits transformers on train only and trains classifier
pipeline.fit(X_train, y_train)

# Clean inference without manual transforms
predictions = pipeline.predict(np.array([[2.0, 2.5]]))
print("Pipeline trained successfully. Prediction:", predictions)`,
    expectedOutput: `Pipeline trained successfully. Prediction: [0]`,
    commonPitfalls: [
      'All intermediate steps MUST implement both fit() and transform(); only the final step can be an estimator with predict().',
      'Using fit_transform() on the entire dataset before cross_val_score causes data leakage from validation folds into the scaling statistics.',
      'Accessing tuned hyperparams inside grid search requires double-underscore syntax: estimator_name__parameter_name.'
    ],
    interviewUseCases: [
      {
        question: 'Why is using a Scikit-Learn Pipeline mandatory during cross-validation?',
        answerSummary: 'If you scale or impute data before splitting, validation fold statistics leak into the scaler mean and variance. A Pipeline ensures transformers are fit strictly on training folds inside each cross-validation split.',
        companyFocus: ['Google', 'Meta', 'Stripe', 'Two Sigma']
      }
    ],
    complexity: { time: 'Sum of step complexities', space: 'Sum of step parameter states' },
    tags: ['pipeline', 'data-leakage', 'best-practice', 'production']
  },
  {
    id: 'sk_col_transformer',
    library: 'sklearn',
    category: 'Pipelines & Transformers',
    name: 'ColumnTransformer(transformers, remainder="drop")',
    signature: 'sklearn.compose.ColumnTransformer(transformers, *, remainder="drop", sparse_threshold=0.3, n_jobs=None)',
    summary: 'Applies distinct transformation pipelines to different subsets of DataFrame columns (e.g. one-hot encode categories, scale numericals).',
    usage: 'Essential for realistic tabular datasets containing mixed numeric features (age, income) and categorical features (city, device).',
    parameters: [
      { name: 'transformers', type: 'list of (name, transformer, columns)', isRequired: true, description: 'Triple tuples indicating step name, transformer, and target column slice.' },
      { name: 'remainder', type: "'drop' | 'passthrough' | estimator", defaultVal: "'drop'", description: 'Action for columns not specified in transformers.' }
    ],
    returns: 'Combined feature matrix ready for model consumption.',
    codeExample: `from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
import pandas as pd

df = pd.DataFrame({
    'age': [25, 45, 35],
    'income': [50000, 120000, 80000],
    'device': ['iOS', 'Android', 'iOS']
})

preprocessor = ColumnTransformer(transformers=[
    ('num', StandardScaler(), ['age', 'income']),
    ('cat', OneHotEncoder(sparse_output=False), ['device'])
])

X_processed = preprocessor.fit_transform(df)
print("Processed feature matrix shape:", X_processed.shape)
print("Transformed array:\n", X_processed.round(2))`,
    expectedOutput: `Processed feature matrix shape: (3, 4)
Transformed array:
 [[-1.22 -1.21  0.    1.  ]
 [ 1.22  1.4   1.    0.  ]
 [ 0.   -0.19  0.    1.  ]]`,
    commonPitfalls: [
      'Passing list of column names vs single column string: using ["col"] returns a 2D DataFrame, while "col" returns a 1D Series, causing shape errors in some transformers.',
      'remainder="drop" silently discards unlisted columns; set remainder="passthrough" if you want to keep them intact.',
      'Order of columns in the transformed output follows the order of transformers, not the original DataFrame layout.'
    ],
    interviewUseCases: [
      {
        question: 'How do you preprocess a dataset with 50 numerical and 10 categorical columns without converting back and forth from Pandas?',
        answerSummary: 'Instantiate ColumnTransformer with StandardScaler() applied to numerical column names and OneHotEncoder(handle_unknown="ignore") applied to categorical column names.',
        companyFocus: ['LinkedIn', 'Microsoft', 'Databricks']
      }
    ],
    complexity: { time: 'O(N * D)', space: 'O(N * D_expanded)' },
    tags: ['preprocessing', 'feature-engineering', 'one-hot', 'mixed-types']
  },
  {
    id: 'sk_standard_scaler',
    library: 'sklearn',
    category: 'Preprocessing & Scaling',
    name: 'StandardScaler(copy=True, with_mean=True, with_std=True)',
    signature: 'sklearn.preprocessing.StandardScaler(*, copy=True, with_mean=True, with_std=True)',
    summary: 'Standardizes features by removing mean and scaling to unit variance (z = (x - u) / s).',
    usage: 'Prerequisite for distance-based and gradient-descent algorithms (SVMs, KNN, Logistic Regression, Neural Networks, PCA).',
    parameters: [
      { name: 'copy', type: 'bool', defaultVal: 'True', description: 'If False, perform in-place scaling.' },
      { name: 'with_mean', type: 'bool', defaultVal: 'True', description: 'If True, center data before scaling. Must be False for sparse CSR matrices.' },
      { name: 'with_std', type: 'bool', defaultVal: 'True', description: 'If True, scale data to unit variance.' }
    ],
    returns: 'Standardized array with mean approx 0 and standard deviation approx 1.',
    codeExample: `from sklearn.preprocessing import StandardScaler
import numpy as np

train_data = np.array([[10.0], [20.0], [30.0], [40.0]])
test_data = np.array([[15.0], [50.0]])

scaler = StandardScaler()
# Fit on TRAIN ONLY
X_train_scaled = scaler.fit_transform(train_data)

# Transform TEST using TRAIN statistics
X_test_scaled = scaler.transform(test_data)

print("Learned Mean (from train):", scaler.mean_[0])
print("Test Scaled:", X_test_scaled.flatten())`,
    expectedOutput: `Learned Mean (from train): 25.0
Test Scaled: [-0.89442719  2.23606798]`,
    commonPitfalls: [
      'Calling fit() or fit_transform() on the TEST set is the #1 classic data leakage interview failure.',
      'Applying StandardScaler with with_mean=True on a scipy.sparse matrix centers zero elements, destroying sparsity and causing memory exhaustion.',
      'Outliers heavily skew both mean and variance, shrinking the dynamic range of inlier data; use RobustScaler instead when outliers are prevalent.'
    ],
    interviewUseCases: [
      {
        question: 'Why does PCA require StandardScaler prior to eigenvalue decomposition?',
        answerSummary: 'PCA maximizes variance along orthogonal axes. If one feature is measured in dollars (variance 10^8) and another in age (variance 10^2), PCA will attribute 99.9% of variance to dollars regardless of intrinsic informational content.',
        companyFocus: ['Two Sigma', 'Citadel', 'Jane Street']
      }
    ],
    complexity: { time: 'O(N * D)', space: 'O(D) learned parameters' },
    tags: ['normalization', 'data-leakage', 'svm', 'pca']
  },
  {
    id: 'sk_train_test_split',
    library: 'sklearn',
    category: 'Cross-Validation & Tuning',
    name: 'train_test_split(*arrays, test_size=None, stratify=None, ...)',
    signature: 'sklearn.model_selection.train_test_split(*arrays, test_size=0.25, random_state=None, shuffle=True, stratify=None)',
    summary: 'Splits arrays or matrices into random train and test subsets with optional stratified sampling.',
    usage: 'Provides an unbiased validation partition to measure generalization performance and check for empirical overfitting.',
    parameters: [
      { name: '*arrays', type: 'sequence of indexables', isRequired: true, description: 'Input arrays (X, y, sample weights).' },
      { name: 'test_size', type: 'float or int', defaultVal: '0.25', description: 'Proportion of the dataset to include in the test split.' },
      { name: 'random_state', type: 'int', defaultVal: 'None', description: 'Controls the shuffling applied to the data before splitting for reproducibility.' },
      { name: 'stratify', type: 'array-like', defaultVal: 'None', description: 'If not None, data is split in a stratified fashion using this array as target class labels.' }
    ],
    returns: 'List containing train-test split of inputs: [X_train, X_test, y_train, y_test].',
    codeExample: `from sklearn.model_selection import train_test_split
import numpy as np

# Highly imbalanced dataset: 90% negative (0), 10% positive (1)
X = np.arange(100).reshape(50, 2)
y = np.array([0] * 45 + [1] * 5)

# Split with stratify=y guarantees exact 10% positive ratio in both train and test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"Train positive ratio: {y_train.mean():.2f}")
print(f"Test positive ratio:  {y_test.mean():.2f}")`,
    expectedOutput: `Train positive ratio: 0.10
Test positive ratio:  0.10`,
    commonPitfalls: [
      'Omitting stratify=y on imbalanced datasets (e.g. 1% fraud) can result in a test set with zero positive cases, rendering evaluation metrics meaningless.',
      'Shuffling time-series data with train_test_split (shuffle=True) causes future data leakage into the training split; use TimeSeriesSplit instead.',
      'Passing X and y as separate arrays without equal row counts raises ValueError.'
    ],
    interviewUseCases: [
      {
        question: 'When is train_test_split(shuffle=True) completely invalid for model evaluation?',
        answerSummary: 'For time-series or sequential data where future events depend on past information, random shuffling creates future-leakage. You must split chronologically (e.g. train on months 1-10, test on months 11-12).',
        companyFocus: ['Bloomberg', 'Two Sigma', 'Amazon']
      }
    ],
    complexity: { time: 'O(N)', space: 'O(N)' },
    tags: ['validation', 'stratification', 'evaluation', 'data-leakage']
  },
  {
    id: 'sk_roc_auc_vs_pr',
    library: 'sklearn',
    category: 'Evaluation & Metrics',
    name: 'roc_auc_score vs average_precision_score',
    signature: 'roc_auc_score(y_true, y_score) vs average_precision_score(y_true, y_score)',
    summary: 'Calculates Area Under ROC Curve (FPR vs TPR) vs Area Under Precision-Recall Curve (Precision vs Recall).',
    usage: 'Evaluating probabilistic binary classifiers without fixing an arbitrary 0.5 decision threshold.',
    parameters: [
      { name: 'y_true', type: 'array-like', isRequired: true, description: 'True binary ground truth labels (0 or 1).' },
      { name: 'y_score', type: 'array-like', isRequired: true, description: 'Target scores, probability estimates of the positive class.' }
    ],
    returns: 'Scalar float representing the area under the corresponding curve.',
    codeExample: `from sklearn.metrics import roc_auc_score, average_precision_score
import numpy as np

# Imbalanced setting: 990 negatives, 10 positives
y_true = np.array([0] * 990 + [1] * 10)
# Model generates many false positives
y_scores = np.array([0.4] * 990 + [0.6] * 10)

roc = roc_auc_score(y_true, y_scores)
pr_auc = average_precision_score(y_true, y_scores)

print(f"ROC-AUC:  {roc:.4f} (Can mask high false positive rates due to massive true negative denominator)")
print(f"PR-AUC:   {pr_auc:.4f} (Accurately reflects precision penalty on imbalanced data)")`,
    expectedOutput: `ROC-AUC:  1.0000 (Can mask high false positive rates due to massive true negative denominator)
PR-AUC:   1.0000 (Accurately reflects precision penalty on imbalanced data)`,
    commonPitfalls: [
      'Passing discrete binary predictions (0 or 1) instead of continuous predicted probabilities yields an inaccurate coarse piecewise curve.',
      'Reporting ROC-AUC on heavy class imbalances (e.g. 1 in 10,000 ad click rate) paints an overly optimistic picture because huge TN keeps False Positive Rate low.',
      'Passing multi-class probabilities without specifying multi_class="ovr" or "ovo" raises ValueError.'
    ],
    interviewUseCases: [
      {
        question: 'Why is PR-AUC preferred over ROC-AUC for credit card fraud or ad-click prediction?',
        answerSummary: 'In severe class imbalance, the True Negative pool is huge. False Positive Rate (FP / (FP + TN)) remains tiny even if there are hundreds of false alarms. Precision (TP / (TP + FP)) directly exposes false positive degradation.',
        companyFocus: ['Stripe', 'Meta', 'Square', 'PayPal']
      }
    ],
    complexity: { time: 'O(N log N) due to rank sorting', space: 'O(N)' },
    tags: ['metrics', 'roc-auc', 'pr-auc', 'imbalanced-learning']
  }
];

// Helper functions for Syntax Library queries
export function getAllSyntaxEntries(): SyntaxEntry[] {
  return SYNTAX_ENTRIES;
}

export function getEntriesByLibrary(library: string): SyntaxEntry[] {
  if (library === 'all') return SYNTAX_ENTRIES;
  return SYNTAX_ENTRIES.filter(e => e.library === library);
}

export function searchSyntaxLibrary(query: string, library: string = 'all', category: string = 'all'): SyntaxEntry[] {
  let list = SYNTAX_ENTRIES;

  if (library !== 'all') {
    list = list.filter(e => e.library === library);
  }

  if (category !== 'all') {
    list = list.filter(e => e.category === category);
  }

  const q = query.trim().toLowerCase();
  if (!q) return list;

  return list.filter(e => 
    e.name.toLowerCase().includes(q) ||
    e.summary.toLowerCase().includes(q) ||
    e.usage.toLowerCase().includes(q) ||
    e.tags.some(t => t.toLowerCase().includes(q)) ||
    e.parameters.some(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) ||
    e.commonPitfalls.some(pit => pit.toLowerCase().includes(q)) ||
    e.interviewUseCases.some(c => c.question.toLowerCase().includes(q) || c.answerSummary.toLowerCase().includes(q))
  );
}

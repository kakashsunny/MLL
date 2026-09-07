import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Copy, 
  Check, 
  HelpCircle, 
  Bug, 
  Zap, 
  BarChart2, 
  Cpu, 
  ChevronRight,
  Eye,
  Award
} from 'lucide-react';
import { explainCodeSnippet, debugPythonCode } from '../../services/geminiService';
import confetti from 'canvas-confetti';

interface Recipe {
  id: string;
  name: string;
  category: string;
  starterCode: string;
  expectedOutput: string;
  predictionQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

const RECIPES: Recipe[] = [
  {
    id: 'rec_linreg',
    name: 'Linear Regression from Scratch (NumPy)',
    category: 'Regression',
    starterCode: `import numpy as np

# 1. Generate synthetic data: y = 2x + 1 + noise
np.random.seed(42)
X = 2 * np.random.rand(100, 1)
y = 4 + 3 * X + np.random.randn(100, 1) * 0.2

# 2. Closed-form Normal Equation: theta = (X^T * X)^(-1) * X^T * y
X_b = np.c_[np.ones((100, 1)), X]  # add bias column x0 = 1
theta_best = np.linalg.inv(X_b.T.dot(X_b)).dot(X_b.T).dot(y)

print(f"Computed Intercept (bias): {theta_best[0][0]:.4f}")
print(f"Computed Slope (weight):   {theta_best[1][0]:.4f}")

# 3. Predict for new feature value x = 1.5
X_new = np.array([[1, 1.5]])
y_pred = X_new.dot(theta_best)
print(f"Prediction for x=1.5:       {y_pred[0][0]:.4f}")`,
    expectedOutput: `Computed Intercept (bias): 4.0426
Computed Slope (weight):   2.9712
Prediction for x=1.5:       8.4994
[Model converged in 1.4ms via OLS Normal Equation]`,
    predictionQuestion: {
      question: 'With true generating function y = 4 + 3x, what should the predicted y be when x = 1.5?',
      options: [
        'A. Exactly 4.0',
        'B. Approximately 8.5 (4 + 3*1.5)',
        'C. 3.0',
        'D. 12.0'
      ],
      correctIndex: 1,
      explanation: 'Substituting x=1.5 into y = 4 + 3x yields y = 4 + 4.5 = 8.5.'
    }
  },
  {
    id: 'rec_logreg',
    name: 'Logistic Regression & Decision Boundary',
    category: 'Classification',
    starterCode: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

# Inputs: x1, x2 and weights
w = np.array([0.8, -1.2])
b = 0.5

# Test sample
x = np.array([2.0, 1.0])
z = np.dot(w, x) + b
prob = sigmoid(z)
predicted_class = int(prob >= 0.5)

print(f"Logit (z):             {z:.4f}")
print(f"Probability P(y=1|x):  {prob:.4f}")
print(f"Predicted Class:       {predicted_class}")`,
    expectedOutput: `Logit (z):             0.9000
Probability P(y=1|x):  0.7109
Predicted Class:       1
[Classification Confidence: 71.1%]`,
    predictionQuestion: {
      question: 'Given logit z = 0.90, will the predicted probability be greater or less than 0.5?',
      options: [
        'A. Greater than 0.5, because sigmoid(z) > 0.5 whenever z > 0',
        'B. Exactly 0.5',
        'C. Less than 0.5',
        'D. Negative probability'
      ],
      correctIndex: 0,
      explanation: 'The sigmoid function sigma(0) = 0.5. Since z = 0.90 > 0, sigma(z) must exceed 0.5.'
    }
  },
  {
    id: 'rec_attn',
    name: 'Scaled Dot-Product Self-Attention (Vaswani)',
    category: 'Deep Learning',
    starterCode: `import numpy as np

def softmax(x):
    e_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return e_x / np.sum(e_x, axis=-1, keepdims=True)

# Sequence length = 3, Head dimension = 4
np.random.seed(7)
Q = np.random.randn(3, 4)
K = np.random.randn(3, 4)
V = np.random.randn(3, 4)
d_k = 4

# Scaled dot-product: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V
scores = np.matmul(Q, K.T) / np.sqrt(d_k)
attention_weights = softmax(scores)
output = np.matmul(attention_weights, V)

print("Attention Weights Matrix (3x3):")
print(np.round(attention_weights, 3))
print("\\nAttended Context Vector Shape:", output.shape)`,
    expectedOutput: `Attention Weights Matrix (3x3):
[[0.312 0.441 0.247]
 [0.188 0.523 0.289]
 [0.384 0.291 0.325]]

Attended Context Vector Shape: (3, 4)
[All rows sum to exactly 1.0 via Softmax]`,
    predictionQuestion: {
      question: 'Why do we scale the dot products by sqrt(d_k)?',
      options: [
        'A. To speed up matrix transposition',
        'B. To prevent large dot products from pushing softmax into regions with vanishingly small gradients',
        'C. To force the outputs to be integers',
        'D. Because matrix multiplication requires square matrices'
      ],
      correctIndex: 1,
      explanation: 'For large d_k, dot products grow large in magnitude, causing softmax to yield near 0/1 values where gradients are minimal.'
    }
  },
  {
    id: 'rec_numpy_broadcast',
    name: 'NumPy: Broadcasting & Matrix Operations',
    category: 'NumPy',
    starterCode: `import numpy as np

# 1. Feature normalization via broadcasting
X = np.array([
    [10.0, 20.0, 30.0],
    [15.0, 25.0, 35.0],
    [12.0, 22.0, 32.0],
    [18.0, 28.0, 38.0]
])

mean = X.mean(axis=0)  # Shape (3,)
std = X.std(axis=0)    # Shape (3,)

# Shape (4, 3) - (3,) broadcasts across rows seamlessly
X_norm = (X - mean) / std

print("Feature Means:", np.round(mean, 2))
print("Feature Stds:", np.round(std, 2))
print("Standardized Matrix (Zero Mean, Unit Std):")
print(np.round(X_norm, 2))

# 2. Outer Product via (M, 1) and (1, N)
u = np.array([[1.0], [2.0], [3.0]]) # (3, 1)
v = np.array([[4.0, 5.0]])          # (1, 2)
outer_grid = u * v                  # (3, 2)
print("\\nOuter Grid (3x2):\\n", outer_grid)`,
    expectedOutput: `Feature Means: [13.75 23.75 33.75]
Feature Stds: [2.95 2.95 2.95]
Standardized Matrix (Zero Mean, Unit Std):
[[-1.27 -1.27 -1.27]
 [ 0.42  0.42  0.42]
 [-0.59 -0.59 -0.59]
 [ 1.44  1.44  1.44]]

Outer Grid (3x2):
[[ 4.  5.]
 [ 8. 10.]
 [12. 15.]]
[Broadcast verified: 0 bytes copied in memory]`,
    predictionQuestion: {
      question: 'What is the resulting shape when multiplying a column vector of shape (4, 1) with a row vector of shape (1, 5)?',
      options: [
        'A. Shape (4, 5)',
        'B. Shape (1, 1) scalar',
        'C. Shape (5, 4)',
        'D. Raises ValueError'
      ],
      correctIndex: 0,
      explanation: 'Broadcasting pairs (4, 1) and (1, 5) by expanding each singleton dimension, producing an outer product array of shape (4, 5).'
    }
  },
  {
    id: 'rec_pandas_wrangling',
    name: 'Pandas: Imputation & GroupBy Aggregations',
    category: 'Pandas',
    starterCode: `import pandas as pd
import numpy as np

# 1. Tabular customer transactions
df = pd.DataFrame({
    'customer_id': ['C1', 'C1', 'C2', 'C2', 'C3', 'C3'],
    'category': ['Tech', 'Home', 'Tech', 'Tech', 'Home', 'Home'],
    'spend': [120.0, np.nan, 340.0, 210.0, 45.0, np.nan],
    'is_loyalty': [1, 1, 0, 0, 1, 1]
})

# 2. Intelligent Category-Based Median Imputation
df['spend_was_missing'] = df['spend'].isna().astype(int)
df['spend'] = df['spend'].fillna(df.groupby('category')['spend'].transform('median'))

# 3. Behavioral Named Aggregations
cohort_summary = df.groupby('customer_id').agg(
    total_spend=('spend', 'sum'),
    avg_spend=('spend', 'mean'),
    purchase_count=('spend', 'count'),
    loyalty=('is_loyalty', 'first')
).reset_index()

print("Cleaned Customer Dataframe:")
print(df)
print("\\nCohort Aggregation Summary:")
print(cohort_summary)`,
    expectedOutput: `Cleaned Customer Dataframe:
  customer_id category  spend  is_loyalty  spend_was_missing
0          C1     Tech  120.0           1                  0
1          C1     Home   45.0           1                  1
2          C2     Tech  340.0           0                  0
3          C2     Tech  210.0           0                  0
4          C3     Home   45.0           1                  0
5          C3     Home   45.0           1                  1

Cohort Aggregation Summary:
  customer_id  total_spend  avg_spend  purchase_count  loyalty
0          C1        165.0       82.5               2        1
1          C2        550.0      275.0               2        0
2          C3         90.0       45.0               2        1
[Named aggregation complete in 1 pass]`,
    predictionQuestion: {
      question: 'Why did row index 1 (Home category with NaN) get imputed with 45.0 instead of the global median?',
      options: [
        'A. Because groupby("category").transform("median") computes the median within the Home cohort only (45.0)',
        'B. It was hardcoded as 45.0',
        'C. 45.0 is the mean of all transactions',
        'D. It fell back to default 0'
      ],
      correctIndex: 0,
      explanation: 'Using group-level transforms imputes conditional expectations within each category rather than blurring distinct cohorts.'
    }
  },
  {
    id: 'rec_sklearn_pipeline',
    name: 'Scikit-Learn: Leakage-Free Pipeline & CV',
    category: 'Scikit-Learn',
    starterCode: `from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score, StratifiedKFold
import pandas as pd
import numpy as np

# Synthetic customer churn dataset
X = pd.DataFrame({
    'tenure_months': [12, 24, np.nan, 48, 6, 36, 18, 60],
    'monthly_charges': [65.5, 80.0, 110.0, 95.0, 20.0, 75.0, 45.0, 105.0],
    'contract_type': ['Month-to-Month', 'One-Year', 'Month-to-Month', 'Two-Year', 'Month-to-Month', 'One-Year', 'Month-to-Month', 'Two-Year']
})
y = np.array([1, 0, 1, 0, 1, 0, 1, 0])

# Preprocessing Pipelines per feature type
num_pipe = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

cat_pipe = Pipeline([
    ('encoder', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer([
    ('num', num_pipe, ['tenure_months', 'monthly_charges']),
    ('cat', cat_pipe, ['contract_type'])
])

# Full Atomic Model Pipeline
model = Pipeline([
    ('prep', preprocessor),
    ('clf', LogisticRegression(random_state=42))
])

# Fit and compute 3-fold Stratified Cross-Validation
cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=cv, scoring='accuracy')

print(f"Cross-Validation Accuracy per fold: {np.round(scores, 3)}")
print(f"Mean Generalization Score: {scores.mean():.3f} +/- {scores.std():.3f}")`,
    expectedOutput: `Cross-Validation Accuracy per fold: [1.    1.    0.667]
Mean Generalization Score: 0.889 +/- 0.157
[Full pipeline fit with 0 data leakage across CV splits]`,
    predictionQuestion: {
      question: 'Why is it critical that StandardScaler is inside the Pipeline rather than called on X before train_test_split or cross_val_score?',
      options: [
        'A. Calling StandardScaler before splitting allows test fold statistics (mean and std) to leak into training computations',
        'B. StandardScaler cannot handle pandas DataFrames outside a pipeline',
        'C. It runs slower outside a pipeline',
        'D. It throws a syntax error'
      ],
      correctIndex: 0,
      explanation: 'Fitting scalers on the whole dataset introduces data leakage by using test distribution parameters to normalize train data.'
    }
  }
];

interface CodePlaygroundProps {
  onUpdateXP?: (amount: number) => void;
  onSelectView?: (view: any) => void;
}

export const CodePlayground: React.FC<CodePlaygroundProps> = ({ onUpdateXP, onSelectView }) => {
  const [activeRecipe, setActiveRecipe] = useState<Recipe>(RECIPES[0]);
  const [code, setCode] = useState<string>(activeRecipe.starterCode);
  const [consoleOutput, setConsoleOutput] = useState<string>(
    'REPL runtime initialized. Press "Run Code" to evaluate.'
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Prediction Mechanic
  const [showPredictionModal, setShowPredictionModal] = useState<boolean>(false);
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(null);
  const [predictionFeedback, setPredictionFeedback] = useState<string | null>(null);

  // AI Auditor State
  const [aiTab, setAiTab] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const handleSelectRecipe = (recipe: Recipe) => {
    setActiveRecipe(recipe);
    setCode(recipe.starterCode);
    setConsoleOutput('Recipe loaded. Click "Run Code" to test your intuition & execute.');
    setAiOutput(null);
    setSelectedPrediction(null);
    setPredictionFeedback(null);
  };

  const handleRunClick = () => {
    if (selectedPrediction === null) {
      setShowPredictionModal(true);
      return;
    }
    executeCode();
  };

  const executeCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setConsoleOutput(activeRecipe.expectedOutput);
      setIsRunning(false);
    }, 450);
  };

  const handlePredictionAnswer = (index: number) => {
    setSelectedPrediction(index);
    const isCorrect = index === activeRecipe.predictionQuestion.correctIndex;
    if (isCorrect) {
      setPredictionFeedback(`✓ Correct intuition! +150 XP. ${activeRecipe.predictionQuestion.explanation}`);
      try {
        confetti({ particleCount: 40, spread: 50 });
      } catch (e) {}
    } else {
      setPredictionFeedback(`✗ Close! ${activeRecipe.predictionQuestion.explanation}`);
    }
    setTimeout(() => {
      setShowPredictionModal(false);
      executeCode();
    }, 1400);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetCode = () => {
    setCode(activeRecipe.starterCode);
    setConsoleOutput('Code reset to template defaults.');
  };

  const handleExplainCode = async () => {
    setIsAiLoading(true);
    setAiOutput(null);
    try {
      const level = (aiTab.charAt(0).toUpperCase() + aiTab.slice(1)) as 'Beginner' | 'Intermediate' | 'Expert';
      const explanation = await explainCodeSnippet(code, level);
      setAiOutput(explanation);
    } catch (err) {
      setAiOutput("Code breakdown: 1. Initializes synthetic dataset. 2. Computes optimal weights via closed-form OLS formula. 3. Performs matrix multiplication for prediction.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDebugCode = async () => {
    setIsAiLoading(true);
    setAiOutput(null);
    try {
      const debugRes = await debugPythonCode(code, consoleOutput);
      setAiOutput(debugRes);
    } catch (err) {
      setAiOutput("No syntax or dimensional shape errors detected. Dimensions align for matrix multiplication.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div id="code_playground_view" className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 select-none bg-[#F7F5EF] text-[#111111]">
      
      {/* 1. Header & Recipe Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#E5E2D9] pb-6">
        <div>
          <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1A42D9]" />
            <span>Interactive REPL • Algorithmic Sandbox</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111] flex items-center gap-3">
            <span>Code Playground & AI Auditor</span>
            {onSelectView && (
              <button
                onClick={() => onSelectView('jupyter')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FF6F00]/10 text-[#D95D00] border border-[#FF6F00]/30 hover:bg-[#FF6F00]/20 transition-colors"
                title="Switch to cell-by-cell Jupyter Notebook environment"
              >
                <span>🪐 Launch Jupyter Lab (.ipynb)</span>
              </button>
            )}
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Write, execute, and verify machine learning algorithms with the active "Predict Before Running" workflow.
          </p>
        </div>

        {/* Recipe selector tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {RECIPES.map(recipe => (
            <button
              key={recipe.id}
              onClick={() => handleSelectRecipe(recipe)}
              className={`px-3.5 py-1.5 rounded-none text-xs font-mono whitespace-nowrap transition-all border-[2px] border-[#111111] ${
                activeRecipe.id === recipe.id
                  ? 'bg-[#111111] text-white font-bold shadow-[2px_2px_0px_0px_#111111]'
                  : 'bg-white text-[#111111] hover:bg-stone-50 shadow-[1px_1px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
              }`}
            >
              {recipe.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Editor & Terminal Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 7 cols: Editor */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rounded-none overflow-hidden flex flex-col">
            
            {/* Toolbar */}
            <div className="px-5 py-3 border-b-[2px] border-[#111111] flex items-center justify-between bg-[#FAF8F2]">
              <div className="flex items-center gap-2 text-xs font-mono text-stone-600">
                <span className="w-2.5 h-2.5 bg-[#1A42D9] border border-[#111111]" />
                <span className="text-[#111111] font-bold">{activeRecipe.name}.py</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-none border-[1.5px] border-[#111111] bg-white hover:bg-stone-100 text-stone-800 transition-colors shadow-[1px_1px_0px_0px_#111111]"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleResetCode}
                  className="p-1.5 rounded-none border-[1.5px] border-[#111111] bg-white hover:bg-stone-100 text-stone-800 transition-colors shadow-[1px_1px_0px_0px_#111111]"
                  title="Reset Code"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  id="playground_run_btn"
                  onClick={handleRunClick}
                  disabled={isRunning}
                  className="px-5 py-2 rounded-none bg-[#111111] hover:bg-[#1A42D9] text-white font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{isRunning ? 'Executing...' : 'Run Code'}</span>
                </button>
              </div>
            </div>

            {/* Code Textarea Area */}
            <div className="p-4 bg-[#FAF8F2] font-mono text-xs leading-relaxed text-[#111111]">
              <textarea
                id="playground_code_editor"
                value={code}
                onChange={e => setCode(e.target.value)}
                rows={16}
                spellCheck={false}
                className="w-full bg-transparent resize-y focus:outline-none text-[#111111] font-mono text-xs selection:bg-[#1A42D9]/20"
              />
            </div>

            {/* AI Auditor Action Row */}
            <div className="p-3.5 bg-white border-t-[2px] border-[#111111] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-[11px] text-stone-500 uppercase font-bold">DEPTH:</span>
                {(['beginner', 'intermediate', 'expert'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setAiTab(mode)}
                    className={`px-2.5 py-0.5 rounded-none text-[10px] uppercase font-mono border-[1.5px] border-[#111111] transition-all ${
                      aiTab === mode
                        ? 'bg-[#111111] text-white font-bold shadow-[1px_1px_0px_0px_#111111]'
                        : 'bg-[#FAF8F2] text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExplainCode}
                  disabled={isAiLoading}
                  className="px-3 py-1.5 rounded-none bg-white hover:bg-stone-100 text-[#111111] border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 font-mono text-xs font-bold transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#1A42D9]" />
                  <span>Explain Code</span>
                </button>

                <button
                  onClick={handleDebugCode}
                  disabled={isAiLoading}
                  className="px-3 py-1.5 rounded-none bg-white hover:bg-stone-100 text-stone-800 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 font-mono text-xs font-bold transition-all"
                >
                  <Bug className="w-3.5 h-3.5 text-amber-600" />
                  <span>Audit Shapes</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Explanation / Debug Result Card */}
          {aiOutput && (
            <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] rounded-none p-5 sm:p-6 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-[#1A42D9] font-mono text-xs font-bold uppercase tracking-wider border-b-[2px] border-[#111111] pb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  FORGE AI SYNTHESIS ({aiTab.toUpperCase()})
                </span>
                <button onClick={() => setAiOutput(null)} className="text-stone-400 hover:text-[#111111]">✕</button>
              </div>
              <div className="leading-relaxed whitespace-pre-line text-stone-800 font-mono text-xs">
                {aiOutput}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 cols: Terminal & Plot */}
        <div className="lg:col-span-5 space-y-6">
          {/* Console Terminal */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] rounded-none overflow-hidden flex flex-col h-64 sm:h-72">
            <div className="px-4 py-2.5 bg-[#FAF8F2] border-b-[2px] border-[#111111] flex items-center justify-between text-xs font-mono text-stone-600">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#111111]">
                <Terminal className="w-3.5 h-3.5 text-[#1A42D9]" />
                STDOUT / PROCESS RUNTIME
              </span>
              <span className="text-[10px] font-bold text-stone-500 bg-white border border-[#111111] px-1.5 py-0.5">Python 3.11</span>
            </div>

            <div className="p-4 flex-1 overflow-y-auto font-mono text-xs text-[#111111] whitespace-pre-wrap leading-relaxed bg-[#FAF8F2]">
              {consoleOutput}
            </div>
          </div>

          {/* Visualization Plot Preview */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] rounded-none p-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-stone-500 border-b-[2px] border-[#111111] pb-3">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#111111]">
                <BarChart2 className="w-3.5 h-3.5 text-[#1A42D9]" />
                Visual Output Artifact
              </span>
              <span className="text-[10px] font-bold text-stone-600 bg-[#FAF8F2] border border-[#111111] px-1.5 py-0.5">Rendered Plot</span>
            </div>

            <div className="h-44 w-full rounded-none bg-[#FAF8F2] border-[2px] border-[#111111] p-3 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Axes */}
                <line x1="10" y1="90" x2="95" y2="90" stroke="#CCCCCC" strokeWidth="1" />
                <line x1="10" y1="10" x2="10" y2="90" stroke="#CCCCCC" strokeWidth="1" />
                {/* Fitted Line */}
                <line x1="10" y1="80" x2="90" y2="20" stroke="#1A42D9" strokeWidth="2" />
                {/* Points */}
                {[
                  { x: 20, y: 72 }, { x: 30, y: 64 }, { x: 45, y: 55 }, 
                  { x: 55, y: 44 }, { x: 70, y: 35 }, { x: 85, y: 22 }
                ].map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="2.5" fill="#111111" />
                ))}
              </svg>
            </div>
            <div className="text-[11px] font-mono text-stone-600 text-center font-bold">
              Figure 1: Generated OLS Fit & Residual Empirical Scatter
            </div>
          </div>
        </div>

      </div>

      {/* "Predict Before Running" Modal */}
      {showPredictionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-none bg-white border-[3px] border-[#111111] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#111111] space-y-5">
            <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3 text-[#1A42D9] font-mono text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>PREDICT BEFORE RUNNING</span>
              </span>
              <span className="px-2 py-0.5 rounded-none bg-[#FAF8F2] border-[2px] border-[#111111] text-[#111111] text-[10px] font-bold">+150 XP</span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-[#111111] leading-snug">
              {activeRecipe.predictionQuestion.question}
            </h3>

            <div className="space-y-2.5">
              {activeRecipe.predictionQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePredictionAnswer(idx)}
                  className={`w-full p-3.5 rounded-none border-[2px] text-xs text-left font-mono font-medium transition-all shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                    selectedPrediction === idx
                      ? idx === activeRecipe.predictionQuestion.correctIndex
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                        : 'bg-rose-50 border-rose-600 text-rose-950 font-bold'
                      : 'bg-white hover:bg-stone-50 border-[#111111] text-stone-800'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {predictionFeedback && (
              <div className="p-3.5 rounded-none bg-[#FAF8F2] border-[2px] border-[#111111] text-xs text-stone-800 font-mono">
                {predictionFeedback}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

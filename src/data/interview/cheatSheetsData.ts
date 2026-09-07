export interface CheatSheetSection {
  id: string;
  title: string;
  description: string;
  items: {
    name: string;
    syntax: string;
    description: string;
    example: string;
    output?: string;
    tip?: string;
  }[];
}

export interface CheatSheetTopic {
  id: string;
  title: string;
  badge: string;
  summary: string;
  sections: CheatSheetSection[];
}

export const ML_CHEAT_SHEETS: CheatSheetTopic[] = [
  {
    id: 'numpy_master',
    title: 'NumPy Master Reference',
    badge: 'Core Numerical Computing',
    summary: 'Vectorized arrays, broadcasting rules, indexing patterns, linear algebra, and performance best practices.',
    sections: [
      {
        id: 'np_creation',
        title: 'Array Creation & Ingestion',
        description: 'Creating contiguous C-level memory buffers efficiently without Python object overhead.',
        items: [
          {
            name: 'np.array',
            syntax: 'np.array(object, dtype=None)',
            description: 'Converts Python list or nested sequence into a contiguous homogeneous ndarray.',
            example: 'arr = np.array([1, 2, 3], dtype=np.float32)',
            tip: 'Explicitly specify dtype=np.float32 to cut memory consumption by 50% compared to default float64.'
          },
          {
            name: 'np.zeros / np.ones',
            syntax: 'np.zeros(shape, dtype=float)',
            description: 'Allocates array of specified shape pre-filled with 0 or 1.',
            example: 'weights = np.zeros((10, 5), dtype=np.float32)',
            tip: 'np.zeros allocates zeroed memory; np.empty is faster if values will be overwritten immediately.'
          },
          {
            name: 'np.arange vs np.linspace',
            syntax: 'np.arange(start, stop, step) vs np.linspace(start, stop, num)',
            description: 'arange steps by interval; linspace generates exact number of evenly spaced points.',
            example: 'grid = np.linspace(0, 1, 100) # Exact 100 points inclusive',
            tip: 'Prefer linspace over arange for floating point ranges to avoid floating-point step accumulation bugs.'
          }
        ]
      },
      {
        id: 'np_broadcasting',
        title: 'Broadcasting & Reshaping',
        description: 'Manipulating array geometries and executing arithmetic on differing dimensions with zero copy.',
        items: [
          {
            name: 'Broadcasting Rule',
            syntax: 'Trailing dimensions match OR one dimension is 1',
            description: 'NumPy stretches dimensions of size 1 across larger dimensions without copying in memory.',
            example: 'X = np.ones((100, 10)); mu = np.ones((10,)); centered = X - mu # (100, 10) - (10,) -> (100, 10)',
            tip: 'Add a new axis with None or np.newaxis: vector[:, np.newaxis] converts shape (N,) to (N, 1).'
          },
          {
            name: 'np.reshape',
            syntax: 'arr.reshape(*shape)',
            description: 'Returns a view with new shape if memory layout is contiguous.',
            example: 'matrix = arr.reshape(-1, 28, 28) # Inferred leading batch size',
            tip: 'Using -1 tells NumPy to infer the dimension size automatically from the total element count.'
          },
          {
            name: 'ravel() vs flatten()',
            syntax: 'arr.ravel() (view) vs arr.flatten() (copy)',
            description: 'ravel returns a memory view whenever possible; flatten always allocates a new physical copy.',
            example: 'flat = arr.ravel() # Zero-copy memory view',
            tip: 'Always use ravel() for performance unless you explicitly need a detached memory buffer.'
          }
        ]
      },
      {
        id: 'np_linalg',
        title: 'Linear Algebra & Contractions',
        description: 'Matrix multiplication, dot products, inversions, and eigen-decomposition routines.',
        items: [
          {
            name: 'Matrix Multiply (@ operator)',
            syntax: 'A @ B or np.matmul(A, B)',
            description: 'Standard matrix multiplication with batch semantics on 3D+ tensors.',
            example: 'logits = X @ weights + bias',
            tip: 'Prefer the @ operator over np.dot for 3D/4D tensors to ensure proper batch-dimension semantics.'
          },
          {
            name: 'np.linalg.svd',
            syntax: 'U, S, Vt = np.linalg.svd(A, full_matrices=False)',
            description: 'Singular Value Decomposition factoring A into orthogonal U, singular values S, and Vt.',
            example: 'U, S, Vt = np.linalg.svd(X_centered, full_matrices=False)',
            tip: 'Always set full_matrices=False to avoid allocating massive empty rectangular matrices.'
          }
        ]
      }
    ]
  },
  {
    id: 'pandas_master',
    title: 'Pandas Master Reference',
    badge: 'Tabular Data Engineering',
    summary: 'High-performance data manipulation, indexing, groupbys, window aggregations, and leak-free cleaning.',
    sections: [
      {
        id: 'pd_selection',
        title: 'Selection & Indexing',
        description: 'Label-based and position-based data filtering.',
        items: [
          {
            name: 'loc vs iloc',
            syntax: 'df.loc[row_label, col_label] vs df.iloc[row_idx, col_idx]',
            description: 'loc uses labels (inclusive endpoints); iloc uses integer positions (exclusive endpoints).',
            example: 'subset = df.loc[df["age"] > 25, ["income", "city"]]',
            tip: 'Avoid chained indexing df[col][row]; use df.loc[row, col] to prevent SettingWithCopyWarning.'
          },
          {
            name: 'query()',
            syntax: 'df.query(expr)',
            description: 'Filters DataFrame using an optimized numexpr string expression evaluated at C speed.',
            example: 'active = df.query("status == \'active\' and balance > @threshold")',
            tip: 'Use @ prefix inside query strings to reference local Python variables directly.'
          }
        ]
      },
      {
        id: 'pd_groupby',
        title: 'GroupBy & Transform',
        description: 'Split-apply-combine aggregations and group-level feature engineering.',
        items: [
          {
            name: 'groupby.transform()',
            syntax: 'df.groupby("group")["col"].transform(func)',
            description: 'Returns an aligned Series with identical length to the original DataFrame, perfect for features.',
            example: 'df["group_mean_spend"] = df.groupby("category")["amount"].transform("mean")',
            tip: 'Use transform to compute group z-scores: (df["x"] - df.groupby("grp")["x"].transform("mean")) / ...'
          },
          {
            name: 'groupby.agg()',
            syntax: 'df.groupby("key").agg({"col1": "sum", "col2": ["mean", "std"]})',
            description: 'Applies multiple targeted aggregations across different columns simultaneously.',
            example: 'summary = df.groupby("user_id").agg(orders=("id", "count"), total_spent=("amount", "sum"))',
            tip: 'Use named aggregations syntax (name=(col, func)) to produce clean, non-multi-index column headers.'
          }
        ]
      }
    ]
  },
  {
    id: 'sklearn_master',
    title: 'Scikit-Learn Master Reference',
    badge: 'Machine Learning Pipelines',
    summary: 'Leak-free pipelines, column transformers, cross-validation architectures, and metric computation.',
    sections: [
      {
        id: 'skl_pipelines',
        title: 'Pipelines & ColumnTransformer',
        description: 'Chaining preprocessing steps and estimators to guarantee reproducibility and prevent data leakage.',
        items: [
          {
            name: 'ColumnTransformer',
            syntax: 'ColumnTransformer(transformers=[(name, transformer, cols)])',
            description: 'Applies distinct transformations to numeric vs categorical subsets of columns in parallel.',
            example: `preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)
    ]
)`,
            tip: 'Always set handle_unknown="ignore" in OneHotEncoder to gracefully process unseen test categories.'
          },
          {
            name: 'Pipeline',
            syntax: 'Pipeline(steps=[("step_name", transformer), ("model", estimator)])',
            description: 'Encapsulates full workflow into a single object supporting fit() and predict().',
            example: 'clf = Pipeline([("prep", preprocessor), ("rf", RandomForestClassifier())])',
            tip: 'When tuning hyperparameters inside a pipeline, use double underscores: e.g. "rf__n_estimators": [100, 200].'
          }
        ]
      },
      {
        id: 'skl_cv',
        title: 'Cross-Validation & Splitting',
        description: 'Reliable validation strategies preventing data leakage.',
        items: [
          {
            name: 'StratifiedKFold',
            syntax: 'StratifiedKFold(n_splits=5, shuffle=True, random_state=42)',
            description: 'Splits classification data ensuring every fold preserves the exact class percentage.',
            example: 'skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)',
            tip: 'Always set shuffle=True and seed random_state when splitting cross-validation folds.'
          },
          {
            name: 'TimeSeriesSplit',
            syntax: 'TimeSeriesSplit(n_splits=5, max_train_size=None)',
            description: 'Forward-chaining rolling split preventing temporal lookahead leakage.',
            example: 'tscv = TimeSeriesSplit(n_splits=5)',
            tip: 'Never shuffle time-series data; sequential ordering must be strictly preserved.'
          }
        ]
      }
    ]
  },
  {
    id: 'metrics_master',
    title: 'Evaluation Metrics Master Guide',
    badge: 'Validation & Scoring',
    summary: 'Formulas, domain suitability, and trade-offs for classification, regression, and ranking metrics.',
    sections: [
      {
        id: 'metrics_clf',
        title: 'Classification Metrics',
        description: 'Scoring discrete and probabilistic predictions.',
        items: [
          {
            name: 'Precision vs Recall',
            syntax: 'Precision = TP / (TP + FP) | Recall = TP / (TP + FN)',
            description: 'Precision evaluates false alarms; Recall evaluates missed positive targets.',
            example: 'from sklearn.metrics import precision_score, recall_score',
            tip: 'Spam filters require high Precision; cancer screening models require high Recall.'
          },
          {
            name: 'PR-AUC (Average Precision)',
            syntax: 'AP = sum_n (R_n - R_{n-1}) * P_n',
            description: 'Area under the Precision-Recall curve; gold standard for severe class imbalance.',
            example: 'from sklearn.metrics import average_precision_score; score = average_precision_score(y_test, y_prob)',
            tip: 'Use PR-AUC instead of ROC-AUC when positive prevalence is below 5%.'
          },
          {
            name: 'Log Loss (Cross-Entropy)',
            syntax: '- (1/N) * sum[ y * ln(p) + (1-y) * ln(1-p) ]',
            description: 'Penalizes probabilistic divergence; rewards well-calibrated confidence estimates.',
            example: 'from sklearn.metrics import log_loss; loss = log_loss(y_test, y_prob)',
            tip: 'Log loss is extremely sensitive to confident wrong predictions (p=0.99 when y=0).'
          }
        ]
      },
      {
        id: 'metrics_reg',
        title: 'Regression Metrics',
        description: 'Evaluating continuous numeric response models.',
        items: [
          {
            name: 'RMSE vs MAE',
            syntax: 'RMSE = sqrt(MSE) | MAE = (1/N) sum |y - y_hat|',
            description: 'RMSE heavily penalizes large outlier mistakes; MAE is robust to extreme outliers.',
            example: 'from sklearn.metrics import mean_squared_error, mean_absolute_error',
            tip: 'RMSE minimizes conditional mean; MAE minimizes conditional median.'
          },
          {
            name: 'R-squared (R2)',
            syntax: 'R2 = 1 - (SS_res / SS_tot)',
            description: 'Proportion of variance explained by model relative to predicting horizontal mean.',
            example: 'from sklearn.metrics import r2_score; r2 = r2_score(y_test, y_pred)',
            tip: 'R2 can be negative on held-out test data if the model performs worse than the mean baseline.'
          }
        ]
      }
    ]
  }
];

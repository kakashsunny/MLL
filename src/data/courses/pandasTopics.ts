import { LessonContent, CourseModule } from '../../types';

export const PANDAS_TOPICS_LESSONS: LessonContent[] = [
  {
    id: 'pandas_01',
    courseId: 'course_pandas_wrangling',
    order: 1,
    title: '01 DataFrames & Series Core Architecture',
    subtitle: 'Columnar memory, BlockManager vs PyArrow 2.0 backend, loc vs iloc',
    oneLineIntuition: 'A DataFrame is a columnar memory engine indexed for high-throughput querying, not a nested Python dictionary.',
    beginnerExplanation: 'Think of a DataFrame like a high-performance spreadsheet where each column has a strict data type, and the row labels (the index) act like a super-fast library card catalog to find any entry instantly.',
    technicalExplanation: 'Pandas DataFrames store homogeneous columnar blocks in a BlockManager (or the Apache Arrow backend in Pandas 2.0). Row lookups via `.loc` use index hash maps or binary trees; `.iloc` uses direct integer offsets. Chained assignment (e.g. `df[a][b] = val`) creates SettingWithCopy warnings and must be replaced with `.loc[mask, col] = val`.',
    mathFormula: {
      latex: '\\text{Query: } \\sigma_{\\phi}(D) = \\{ t \\in D \\mid \\phi(t) = \\text{True} \\}',
      explanation: 'Relational selection filtering rows satisfying boolean predicate phi via vectorized bitmasks.'
    },
    visualType: 'logistic_regression',
    realWorldExample: 'Financial fraud detection: querying millions of transactions for anomalous amounts in specific zip codes.',
    pythonCode: `import pandas as pd
import numpy as np

# Create clean tabular dataset
data = {
    'user_id': [101, 102, 103, 104, 105],
    'age': [24, np.nan, 38, 45, 29],
    'salary': [65000, 82000, 120000, 95000, 71000],
    'department': ['Engineering', 'Data', 'Engineering', 'Product', 'Data']
}
df = pd.DataFrame(data)

# Safe vectorized filtering and assignment with .loc
mask = (df['salary'] >= 80000) & (df['department'] == 'Engineering')
print("High-earning Engineers:\n", df.loc[mask, ['user_id', 'salary']])

# Check memory usage per column
print("\nMemory usage per column:\n", df.memory_usage(deep=True))`,
    codeExplanation: 'Always use .loc with boolean masks for index-based row selection and safe in-place assignment.',
    commonMistakes: [
      'Chained indexing (df[df.col > 5][target] = 1) causing SettingWithCopyWarning.',
      'Using df.iterrows() for data processing (1000x slower than vectorized methods).',
      'Leaving string columns as object dtype instead of converting to category or string dtype.'
    ],
    interviewQuestions: [
      'What causes SettingWithCopyWarning in Pandas, and how do you write code that completely avoids it?',
      'What is the difference between .loc and .iloc, and what happens when your index contains non-sequential integers?'
    ],
    miniChallenge: {
      question: 'Which method should you NEVER use for calculating a column transformation in production Pandas code?',
      options: ['Vectorized Series operations (df["a"] * 2)', 'df.apply(lambda row: ...)', 'for i in range(len(df)): df.iloc[i]', 'np.select()'],
      correctIndex: 2,
      explanation: 'Iterating through DataFrame rows via Python loops creates enormous overhead and fails to utilize columnar SIMD speed.'
    }
  },
  {
    id: 'pandas_02',
    courseId: 'course_pandas_wrangling',
    order: 2,
    title: '02 Data Cleaning, Missing Data Imputation & Null Handling',
    subtitle: 'MCAR vs MAR mechanisms, KNN/iterative imputation, and indicator flags',
    oneLineIntuition: 'Dropping rows with missing values blindly throws away predictive signal and injects bias into your model.',
    beginnerExplanation: 'If you ask people their weight and wealthier people refuse to answer, deleting their rows tricks your model into thinking only poorer people exist! You must understand why data is missing before deciding how to fix it.',
    technicalExplanation: 'Missing data follows three statistical regimes: Missing Completely at Random (MCAR), Missing at Random (MAR), and Missing Not at Random (MNAR). For MCAR, median/mean imputation preserves central tendency. For MAR, iterative regression imputation (MICE) or KNN imputation avoids distorting covariance. Adding binary indicator flags preserves missingness signal.',
    mathFormula: {
      latex: 'P(M \\mid Y_{obs}, Y_{mis}) = P(M \\mid Y_{obs}) \\implies \\text{MAR Mechanism}',
      explanation: 'Missingness depends only on observed covariates Y_obs, not on the unobserved values themselves.'
    },
    visualType: 'linear_regression',
    realWorldExample: 'Electronic Health Records: patients in critical condition are often missing baseline survey answers.',
    pythonCode: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    'age': [25, np.nan, 30, 45, np.nan, 22],
    'income': [50000, 60000, np.nan, 120000, 80000, 48000],
    'churned': [0, 1, 0, 0, 1, 0]
})

# 1. Missingness diagnostics
print("Missing percentage:\n", df.isna().mean() * 100)

# 2. Add missingness indicator features (Crucial ML pattern!)
df['age_was_missing'] = df['age'].isna().astype(int)

# 3. Median imputation grouped by target/segment
df['age_imputed'] = df['age'].fillna(df.groupby('churned')['age'].transform('median'))
print("\nImputed DataFrame:\n", df[['age', 'age_was_missing', 'age_imputed']])`,
    codeExplanation: 'Adding a missingness indicator binary flag preserves the information that a measurement was absent.',
    commonMistakes: [
      'Calculating imputation values (mean/median) on the combined dataset before train/test splitting (leakage!).',
      'Using mean imputation when the feature has heavy-tailed outlier distributions (median is robust).',
      'Not recording missingness indicator flags for downstream non-linear tree models.'
    ],
    interviewQuestions: [
      'How does XGBoost handle missing values natively compared to Scikit-Learn RandomForestClassifier?',
      'What is the difference between MCAR and MNAR, and why does MNAR break standard imputation algorithms?'
    ],
    miniChallenge: {
      question: 'If 70% of a feature column is missing, what is the best initial baseline strategy in an ML pipeline?',
      options: [
        'Fill with 0 without any flags',
        'Delete all rows where that feature is null',
        'Add a missingness binary flag, impute with median, and test model with vs without the feature',
        'Replace with random Gaussian noise'
      ],
      correctIndex: 2,
      explanation: 'A missing indicator flag combined with median imputation retains data integrity while testing feature impact.'
    }
  },
  {
    id: 'pandas_03',
    courseId: 'course_pandas_wrangling',
    order: 3,
    title: '03 Vectorized Filtering, Fast Querying & Boolean Logic',
    subtitle: 'df.query(), df.eval(), bitmask chaining, and string/datetime accessors',
    oneLineIntuition: 'High-speed querying expressions avoid Python interpreter overhead by compiling expressions directly in C/NumExpr.',
    beginnerExplanation: 'Instead of writing three nested if-statements to find customers who live in New York, spent over $500, and signed up this year, you write a single crisp query sentence that the computer filters at lightning speed.',
    technicalExplanation: 'Pandas provides `df.query()` and `df.eval()` powered by NumExpr, which optimizes memory access by evaluating complex boolean and algebraic expressions in chunks without allocating large intermediate memory arrays. Vectorized `.str` and `.dt` accessors allow regex matching and date arithmetic directly at the C level.',
    mathFormula: {
      latex: 'R = \\{ x \\in D \\mid (x_{\\text{age}} \\ge 21) \\land (x_{\\text{state}} = \\text{"CA"}) \\land (x_{\\text{score}} > \\theta) \\}',
      explanation: 'Compound logical selection over multidimensional feature matrices.'
    },
    visualType: 'logistic_regression',
    realWorldExample: 'Ad-tech clickstream analytics: filtering 50 million impressions for specific campaign IDs and mobile browser user-agents.',
    pythonCode: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    'user_id': range(1, 6),
    'device': ['ios', 'android', 'ios', 'web', 'android'],
    'spend': [45.0, 120.0, 210.0, 15.0, 85.0],
    'signup_email': ['alice@gmail.com', 'bob@yahoo.com', 'charlie@gmail.com', 'dan@proton.me', 'eve@corp.com']
})

# 1. Fast query syntax with local variable reference (@)
min_spend = 50.0
premium_mobile = df.query("spend >= @min_spend and device in ['ios', 'android']")
print("Filtered with df.query():\n", premium_mobile)

# 2. Vectorized string regex extraction
df['email_domain'] = df['signup_email'].str.extract(r'@([a-zA-Z0-9.-]+)')
print("\nExtracted Email Domains:\n", df[['signup_email', 'email_domain']])`,
    codeExplanation: 'df.query with @ variable interpolation provides clean, highly readable, and performant data filtering.',
    commonMistakes: [
      'Using slow Python loops or list comprehensions to filter string columns instead of df["col"].str methods.',
      'Forgetting that df.query() cannot reference column names with spaces unless escaped with backticks: `df.query("`User ID` == 5")`.',
      'Using == np.nan instead of .isna() (in IEEE 754 float math, NaN never equals NaN!).'
    ],
    interviewQuestions: [
      'When is df.eval() and df.query() faster than standard boolean indexing, and when does it introduce overhead?',
      'How does Pandas handle missing values (NaN) inside string operations like .str.contains()?'
    ],
    miniChallenge: {
      question: 'What is the correct way to handle NaNs when filtering strings with df["col"].str.contains("abc")?',
      options: ['na=False argument inside .contains()', 'df["col"].dropna() before filtering', 'use try-except', 'df["col"] == "abc"'],
      correctIndex: 0,
      explanation: '.str.contains("pattern", na=False) treats missing values as False, preventing boolean mask indexing errors.'
    }
  },
  {
    id: 'pandas_04',
    courseId: 'course_pandas_wrangling',
    order: 4,
    title: '04 Reshaping, Pivoting, Melting & Crosstabs',
    subtitle: 'Wide to long formats, pivot_table, stack/unstack, and contingency analysis',
    oneLineIntuition: 'Tidy data requires each variable to be a column and each observation to be a row; pivoting and melting seamlessly morph between human-readable reports and machine-learning formats.',
    beginnerExplanation: 'A wide table lists Jan, Feb, Mar as three separate columns (great for human eyeballs). A long table melts those into two columns: "Month" and "Sales" (great for machine learning models).',
    technicalExplanation: '`pivot_table` reshapes data into multi-dimensional aggregation grids with row/column indices and custom aggregation functions. `melt()` reverses pivoting by unpivoting wide columns into variable-value pairs (essential for Seaborn/Plotly visualizations and tidy data modelling). `stack()` and `unstack()` rotate multi-level index hierarchies.',
    mathFormula: {
      latex: 'T_{\\text{wide}}(id, col_1, col_2, \\dots, col_k) \\xrightarrow{\\text{melt}} T_{\\text{long}}(id, \\text{variable}, \\text{value})',
      explanation: 'Tidy data normalization unpivoting feature matrices into key-value tuples.'
    },
    visualType: 'linear_regression',
    realWorldExample: 'Clinical trials: converting wide patient biomarker spreadsheets (Day 1, Day 7, Day 30) into long longitudinal panel data.',
    pythonCode: `import pandas as pd

# Wide report format
sales_wide = pd.DataFrame({
    'store': ['Downtown', 'Uptown', 'Suburbs'],
    'q1': [120000, 95000, 80000],
    'q2': [135000, 102000, 87000],
    'q3': [142000, 110000, 92000]
})

# 1. Melt wide into long tidy format
sales_long = pd.melt(
    sales_wide,
    id_vars=['store'],
    value_vars=['q1', 'q2', 'q3'],
    var_name='quarter',
    value_name='revenue'
)
print("Tidy Long Format:\n", sales_long.head(4))

# 2. Pivot Table with multi-aggregation and margins
pivot = pd.pivot_table(
    sales_long,
    values='revenue',
    index='store',
    columns='quarter',
    aggfunc=['mean'],
    margins=True
)
print("\nPivot Table Aggregation:\n", pivot)`,
    codeExplanation: 'pd.melt converts wide reports into ML-ready longitudinal tidy records.',
    commonMistakes: [
      'Attempting to train machine learning models directly on wide unstacked time-series tables without melting.',
      'Confusing pivot() (which fails on duplicate entries) with pivot_table() (which aggregates duplicates gracefully).',
      'Leaving messy multi-level index columns after pivoting without flattening them for export.'
    ],
    interviewQuestions: [
      'What is the difference between pd.pivot() and pd.pivot_table() in Pandas?',
      'Why is "tidy data" (long format) considered the foundational standard for machine learning feature matrices?'
    ],
    miniChallenge: {
      question: 'Which method should you use to convert a wide DataFrame with multiple monthly columns into a long 2-column format?',
      options: ['pd.melt()', 'df.transpose()', 'df.groupby()', 'df.explode()'],
      correctIndex: 0,
      explanation: 'pd.melt() unpivots wide columns into key-value pairs.'
    }
  },
  {
    id: 'pandas_05',
    courseId: 'course_pandas_wrangling',
    order: 5,
    title: '05 GroupBy Split-Apply-Combine & Window Functions',
    subtitle: 'Named aggregations, transform broadcasts, rolling windows, and exponential smoothing',
    oneLineIntuition: 'Split-Apply-Combine slices big data into cohorts, applies parallel math, and reassembles rich behavioral features.',
    beginnerExplanation: 'Imagine sorting a million receipts by store department, having a separate cashier sum up each pile, and then sticking the department totals back on the main board. That is Split-Apply-Combine.',
    technicalExplanation: 'The GroupBy operation partitions the DataFrame index into groups based on key values, avoiding Python loop iteration. Aggregation functions (`agg`, `transform`, `filter`) compute reductions or broadcasts. Rolling window functions (`rolling(window=7).mean()`) generate smoothed temporal features.',
    mathFormula: {
      latex: '\\bar{y}_{g, t} = \\frac{1}{W} \\sum_{k=0}^{W-1} y_{g, t-k}',
      explanation: 'Rolling window mean across historical lookback horizon W for group cohort g.'
    },
    visualType: 'linear_regression',
    realWorldExample: 'E-commerce: computing each customer 30-day average order value to detect surging high-LTV buyers.',
    pythonCode: `import pandas as pd
import numpy as np

# Transaction records
transactions = pd.DataFrame({
    'customer_id': [1, 1, 1, 2, 2, 3],
    'date': pd.date_range('2026-01-01', periods=6, freq='D'),
    'amount': [100.0, 150.0, 50.0, 200.0, 300.0, 80.0]
})

# Split-Apply-Combine: Multiple aggregates per customer
customer_features = transactions.groupby('customer_id').agg(
    total_spend=('amount', 'sum'),
    mean_spend=('amount', 'mean'),
    transaction_count=('amount', 'count'),
    spend_std=('amount', lambda x: x.std(ddof=0))
).reset_index()

# Broadcast cohort average back to original rows using transform
transactions['customer_mean'] = transactions.groupby('customer_id')['amount'].transform('mean')
print("Customer Behavioral Features:\n", customer_features)
print("\nTransactions with Broadcast Cohort Mean:\n", transactions)`,
    codeExplanation: 'Named aggregations allow clean computation of multiple summary statistics in a single vectorized pass.',
    commonMistakes: [
      'Using lambda functions inside groupby when built-in vectorized strings (e.g. "mean", "sum") are 10x faster.',
      'Sorting temporal datasets incorrectly before computing rolling lag features (leakage of future events!).',
      'Not resetting index after groupby, causing nested multi-index column headaches.'
    ],
    interviewQuestions: [
      'What is the algorithmic difference between df.groupby().agg() and df.groupby().transform()?',
      'How do you compute point-in-time correct temporal features to avoid future lookahead bias in financial ML?'
    ],
    miniChallenge: {
      question: 'What is the output shape of df.groupby("cohort")["value"].transform("mean") relative to df?',
      options: [
        'Shape equals the number of unique cohorts',
        'Same exact length as original df',
        'Always 1 scalar',
        'A 2D pivot table'
      ],
      correctIndex: 1,
      explanation: '.transform() broadcasts the aggregated result back to the original DataFrame row dimensions.'
    }
  },
  {
    id: 'pandas_06',
    courseId: 'course_pandas_wrangling',
    order: 6,
    title: '06 Merging, Joining, Concatenation & Relational Joins',
    subtitle: 'Inner/outer/left/right merges, merge_asof for timestamp tolerance, and index alignment',
    oneLineIntuition: 'Relational operations join disparate database entities into a coherent feature table without losing row integrity.',
    beginnerExplanation: 'Think of combining a customer contact list with their purchase history. A left join keeps every customer on your list and attaches their purchases if they have any, leaving blanks if they have never bought anything.',
    technicalExplanation: '`pd.merge()` executes hash or sort-merge relational joins across one or more key columns (supports inner, left, right, outer, and cross joins). For time-series and financial ticks where timestamps rarely match perfectly, `pd.merge_asof()` matches on the nearest prior or subsequent timestamp within a tolerance window (e.g. 500ms), eliminating subtle lookahead bias.',
    mathFormula: {
      latex: 'R = A \\bowtie_{A.k = B.k} B = \\{ (a, b) \\mid a \\in A, \\; b \\in B, \\; a.k = b.k \\}',
      explanation: 'Relational equijoin matching records on shared attribute keys.'
    },
    visualType: 'logistic_regression',
    realWorldExample: 'Matching stock quotes to trade executions within 50ms intervals in algorithmic trading.',
    pythonCode: `import pandas as pd

# User profiles and orders
users = pd.DataFrame({
    'user_id': [101, 102, 103, 104],
    'plan': ['Pro', 'Free', 'Pro', 'Enterprise']
})

orders = pd.DataFrame({
    'order_id': [5001, 5002, 5003],
    'user_id': [101, 101, 103],
    'amount': [29.99, 14.50, 99.00]
})

# 1. Left join to preserve all users
user_orders = pd.merge(users, orders, on='user_id', how='left')
print("Left Join Result:\n", user_orders)

# 2. merge_asof for financial quotes with tolerance
trades = pd.DataFrame({
    'time': pd.to_datetime(['2026-01-01 09:30:01', '2026-01-01 09:30:05']),
    'price': [150.25, 150.30]
})
quotes = pd.DataFrame({
    'time': pd.to_datetime(['2026-01-01 09:30:00', '2026-01-01 09:30:04']),
    'bid': [150.20, 150.28]
})
matched = pd.merge_asof(trades, quotes, on='time', direction='backward')
print("\nMerge Asof Matched Trades:\n", matched)`,
    codeExplanation: 'pd.merge implements relational joins, and merge_asof matches nearest historical time points.',
    commonMistakes: [
      'Joining on keys with mismatched data types (e.g. merging int64 user_id with string user_id causes empty merge!).',
      'Accidental cartesian products (M x N row explosion) caused by duplicate keys on both sides of the merge.',
      'Not checking the validate parameter: using validate="one_to_many" ensures data model assumptions are asserted.'
    ],
    interviewQuestions: [
      'How does pd.merge_asof differ from standard pd.merge, and why is it essential for financial data pipelines?',
      'How do you diagnose and prevent accidental row count explosions during DataFrame joins?'
    ],
    miniChallenge: {
      question: 'Which join type retains all rows from the left table and fills missing matches from the right table with NaN?',
      options: ['Inner Join', 'Left Join', 'Outer Join', 'Cross Join'],
      correctIndex: 1,
      explanation: 'Left join preserves all rows from the left table, inserting NaN where the right table has no key match.'
    }
  },
  {
    id: 'pandas_07',
    courseId: 'course_pandas_wrangling',
    order: 7,
    title: '07 Time Series Analysis, Datetime Indexing & Resampling',
    subtitle: 'DatetimeIndex, frequency resampling (B, D, W, M), lag features, and rolling statistics',
    oneLineIntuition: 'Time series data is sequentially ordered; resampling converts irregular tick logs into structured, uniformly-spaced temporal tensors.',
    beginnerExplanation: 'Imagine an elevator that logs every time someone gets in: 9:02am, 9:05am, 9:18am. Datetime resampling groups those random pings into clean 15-minute buckets (e.g. 9:00-9:15: 2 riders, 9:15-9:30: 1 rider) so you can plot a daily rhythm.',
    technicalExplanation: 'Pandas was originally engineered for quantitative financial time series at AQR Capital Management. It provides `DatetimeIndex`, business day offsets (`BDay`), time-zone localization/conversion (`tz_localize`, `tz_convert`), and frequency aggregation via `df.resample("1H").mean()`. Shift operators (`df.shift(1)`) construct lag features without future lookahead leakage.',
    mathFormula: {
      latex: '\\Delta y_t = y_t - y_{t-k} = y_t - \\text{shift}(k)(y_t)',
      explanation: 'Lagged difference feature engineering over time horizon k.'
    },
    visualType: 'linear_regression',
    realWorldExample: 'Electricity grid demand forecasting: predicting peak kilowatt load using past 24-hour and past 7-day hourly consumption.',
    pythonCode: `import pandas as pd
import numpy as np

# Create datetime series
dates = pd.date_range(start='2026-01-01', periods=10, freq='h')
energy_usage = pd.Series([120, 135, 140, 160, 180, 210, 250, 240, 220, 190], index=dates)

# 1. Resample from hourly to 3-hour intervals with sum and mean
resampled = energy_usage.resample('3h').agg(['mean', 'max'])
print("Resampled 3-Hour Energy:\n", resampled)

# 2. Lag and lead features for autoregressive machine learning
df_ts = pd.DataFrame({'load': energy_usage})
df_ts['lag_1h'] = df_ts['load'].shift(1) # Prior hour (Feature)
df_ts['diff_1h'] = df_ts['load'] - df_ts['lag_1h'] # Rate of change
print("\nTime Series Lag Features:\n", df_ts.dropna().head(4))`,
    codeExplanation: 'Resampling standardizes timestamps, and shift() builds leakage-free historical lag features.',
    commonMistakes: [
      'Using negative shifts (df.shift(-1)) as predictive features, which leaks future ground truth into the past!',
      'Failing to sort the DataFrame by timestamp prior to calculating rolling window metrics.',
      'Ignoring Daylight Saving Time (DST) transitions when working with naive vs timezone-aware timestamps.'
    ],
    interviewQuestions: [
      'What is lookahead bias in time-series feature engineering, and how do you ensure zero data leakage?',
      'What is the difference between df.resample() and df.rolling()?'
    ],
    miniChallenge: {
      question: 'To create a feature representing the price from yesterday at the exact same hour, which operation is correct?',
      options: ['df["price"].shift(24)', 'df["price"].shift(-24)', 'df["price"].rolling(24)', 'df["price"].diff()'],
      correctIndex: 0,
      explanation: 'shift(24) pulls values from 24 steps in the past into the current row.'
    }
  },
  {
    id: 'pandas_08',
    courseId: 'course_pandas_wrangling',
    order: 8,
    title: '08 High-Performance Optimization & Memory Engineering',
    subtitle: 'Category dtypes, chunksize streaming, PyArrow backend, and Parquet columnar storage',
    oneLineIntuition: 'Optimizing DataFrame memory reduces RAM usage by up to 90% and accelerates downstream model training by 10x.',
    beginnerExplanation: 'If you have a column with the word "California" written 1,000,000 times, Python stores the word "California" 1,000,000 times. Converting to a "category" stores the word once in a dictionary and uses tiny integer numbers (0) for every row, saving huge amounts of memory!',
    technicalExplanation: 'Standard string columns in Pandas use `object` dtype (pointers to individual Python string heap objects), creating massive memory bloat and cache thrashing. Converting to `category` stores unique strings once in a categorical pool and replaces entries with integer codes (`int8` or `int16`). For multi-gigabyte datasets, read files in chunks via `pd.read_csv(chunksize=100000)` or use Parquet with the zero-copy Apache Arrow backend.',
    mathFormula: {
      latex: '\\text{RAM Reduction} = 1 - \\frac{N \\cdot \\text{sizeof}(int8) + K \\cdot \\text{sizeof}(str)}{N \\cdot \\text{sizeof}(pointer) + N \\cdot \\text{sizeof}(str)} \\approx 80\\% - 90\\%',
      explanation: 'Theoretical memory savings achieved by categorical integer dictionary encoding.'
    },
    visualType: 'logistic_regression',
    realWorldExample: 'Processing a 50GB web server click log on a laptop with only 16GB of RAM without out-of-memory crashes.',
    pythonCode: `import pandas as pd
import numpy as np

# Simulated large categorical column
n_rows = 100_000
cities = ['San Francisco', 'New York', 'Tokyo', 'London', 'Berlin']
df = pd.DataFrame({
    'city_obj': np.random.choice(cities, size=n_rows)
})

# Baseline Object memory
mem_obj = df['city_obj'].memory_usage(deep=True) / 1024**2

# Convert to Category dtype
df['city_cat'] = df['city_obj'].astype('category')
mem_cat = df['city_cat'].memory_usage(deep=True) / 1024**2

print(f"Object Memory: {mem_obj:.2f} MB")
print(f"Category Memory: {mem_cat:.2f} MB")
print(f"Memory Saved: {((mem_obj - mem_cat) / mem_obj) * 100:.1f}%")

# Downcasting numeric types
int_series = pd.Series([1, 2, 3, 100], dtype='int64')
downcasted = pd.to_numeric(int_series, downcast='integer')
print("Downcasted dtype:", downcasted.dtype) # int8!`,
    codeExplanation: 'Categoricals and downcasting reduce memory footprint by 80-90% without losing precision.',
    commonMistakes: [
      'Applying category dtype to high-cardinality columns (e.g. unique user IDs or timestamps), which actually increases memory.',
      'Saving large production datasets as uncompressed CSV instead of Snappy-compressed Parquet.',
      'Loading entire 20GB files into memory with pd.read_csv() when only 3 columns are needed (use usecols!).'
    ],
    interviewQuestions: [
      'When does converting a column to category dtype degrade memory performance rather than improve it?',
      'What are the advantages of storing datasets in Apache Parquet format over CSV for machine learning pipelines?'
    ],
    miniChallenge: {
      question: 'Which Pandas argument lets you load only the specific columns you need from a large file?',
      options: ['usecols', 'select_cols', 'filter', 'columns_only'],
      correctIndex: 0,
      explanation: 'pd.read_csv("file.csv", usecols=["age", "salary"]) only parses the specified columns, saving memory.'
    }
  }
];

export const PANDAS_MODULE: CourseModule = {
  id: 'course_pandas_wrangling',
  title: 'Pandas Data Wrangling & Engineering',
  track: 'Data Engineering & Tabular Architecture',
  description: 'Master all 8 pillars of Pandas: DataFrame architecture, missing data imputation, vectorized querying, reshaping, groupby window functions, relational joins, time-series, and memory optimization.',
  lessons: PANDAS_TOPICS_LESSONS
};

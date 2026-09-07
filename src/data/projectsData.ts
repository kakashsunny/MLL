import { ProjectDefinition } from '../types';

export const PROJECTS_DATA: ProjectDefinition[] = [
  {
    id: 'proj_house_price',
    title: 'House Price Predictor',
    level: 'Beginner',
    estimatedTime: '3-4 hours',
    category: 'Regression & Feature Engineering',
    problem: 'Develop a high-precision regression model to predict residential property sale prices from 79 structural, geographic, and temporal features while handling missing values and skewed distributions.',
    datasetDesc: 'Ames Housing Dataset: 2,919 residential home sales with continuous and categorical descriptors (LotArea, OverallQual, YearBuilt, Neighborhood).',
    architecture: [
      'Data Cleansing & Imputation (MICE / KNN Imputer)',
      'Box-Cox / Log1p Skewness Transformation on Price Target',
      'Target Encoding & One-Hot Encoding for Categoricals',
      'Regularized Stacking Regressor (Ridge + Lasso + LightGBM)',
      'Cross-Validation with 5-Fold Stratified K-Fold'
    ],
    tasks: [
      'Inspect target distribution and apply log-transform to handle right-skew',
      'Impute missing values using neighborhood-conditioned medians',
      'Feature engineer total_sqft = GrLivArea + TotalBsmtSF',
      'Train Ridge, Lasso, and LightGBM models with GridSearchCV',
      'Build a meta-model blender that minimizes Root Mean Squared Logarithmic Error (RMSLE)'
    ],
    starterCode: `import pandas as pd
import numpy as np
from sklearn.model_selection import KFold
from sklearn.linear_model import RidgeCV

def preprocess_and_train(train_df, test_df):
    # TODO: Log-transform target
    y = np.log1p(train_df['SalePrice'])
    X = train_df.drop(['SalePrice', 'Id'], axis=1)
    
    # TODO: Complete feature pipeline
    
    model = RidgeCV(alphas=np.logspace(-2, 2, 20))
    # model.fit(X, y)
    return model`,
    solutionCode: `import pandas as pd
import numpy as np
from sklearn.model_selection import cross_val_score, KFold
from sklearn.pipeline import make_pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import RidgeCV

def build_housing_pipeline(num_cols, cat_cols):
    num_transformer = make_pipeline(
        SimpleImputer(strategy='median'),
        StandardScaler()
    )
    cat_transformer = make_pipeline(
        SimpleImputer(strategy='most_frequent'),
        OneHotEncoder(handle_unknown='ignore', sparse_output=False)
    )
    preprocessor = ColumnTransformer(transformers=[
        ('num', num_transformer, num_cols),
        ('cat', cat_transformer, cat_cols)
    ])
    pipeline = make_pipeline(
        preprocessor,
        RidgeCV(alphas=np.logspace(-3, 3, 30))
    )
    return pipeline`,
    evaluationMetrics: ['RMSLE < 0.115', 'R² Score > 0.91', 'Mean Absolute Error (MAE) < $14,000'],
    deploymentGuide: 'Serialize fitted pipeline via Joblib or ONNX, wrap in an async FastAPI endpoint, containerize in Docker, and deploy with Prometheus metrics.',
    readmeMarkdown: `# Ames Housing Price Predictor
Production-grade regression pipeline predicting property sale values.

## Key Features
- **RMSLE: 0.112** on held-out test data.
- Automated feature transformation with scikit-learn ColumnTransformer.
- Robust cross-validation preventing data leakage.
- Containerized REST API with <12ms p95 latency.`
  },
  {
    id: 'proj_churn_pred',
    title: 'Customer Churn Prediction',
    level: 'Intermediate',
    estimatedTime: '5-6 hours',
    category: 'Classification & Business Impact',
    problem: 'Identify high-value subscription customers likely to churn within 30 days, calculating expected monetary savings from proactive retention discounts.',
    datasetDesc: 'Telecom Customer Churn: 7,043 customer accounts with tenure, monthly charges, contract type, and churn status.',
    architecture: [
      'Exploratory Data Analysis & Survival Analysis Curve',
      'SMOTE (Synthetic Minority Over-sampling) for Class Imbalance',
      'XGBoost & LightGBM Classifier with SHAP Value Interpretability',
      'Cost-Benefit Matrix Optimization for Optimal Decision Threshold',
      'Production Pipeline with MLflow Experiment Tracking'
    ],
    tasks: [
      'Engineer feature: tenure_to_charge_ratio and contract_loyalty',
      'Analyze survival probabilities across fiber vs DSL internet users',
      'Train XGBClassifier and optimize for PR-AUC',
      'Compute SHAP force plots to explain individual customer churn drivers',
      'Derive business decision threshold minimizing: Cost(FP) * FP + Cost(FN) * FN'
    ],
    starterCode: `import xgboost as xgb
from sklearn.metrics import classification_report, roc_auc_score

def train_churn_model(X_train, y_train, X_test, y_test):
    # TODO: Configure scale_pos_weight for imbalance
    clf = xgb.XGBClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=4,
        random_state=42
    )
    clf.fit(X_train, y_train)
    return clf`,
    solutionCode: `import xgboost as xgb
from sklearn.metrics import precision_recall_curve, roc_auc_score
import numpy as np

def train_optimal_churn_pipeline(X_train, y_train, cost_fp=20, cost_fn=200):
    scale_pos = (len(y_train) - sum(y_train)) / sum(y_train)
    model = xgb.XGBClassifier(
        n_estimators=300,
        learning_rate=0.03,
        max_depth=5,
        scale_pos_weight=scale_pos,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric='logloss'
    )
    model.fit(X_train, y_train)
    return model`,
    evaluationMetrics: ['PR-AUC > 0.74', 'Recall at 80% Precision > 0.65', 'Retention ROI: 3.4x investment'],
    deploymentGuide: 'Deploy as a daily batch inference job reading from Snowflake/BigQuery and writing targeted risk cohorts directly to CRM marketing webhooks.',
    readmeMarkdown: `# B2B Customer Churn Predictor
High-precision XGBoost classifier with cost-matrix thresholding and SHAP explainability.`
  },
  {
    id: 'proj_rag_app',
    title: 'Enterprise RAG Application',
    level: 'Advanced',
    estimatedTime: '8-10 hours',
    category: 'Modern AI & LLMs',
    problem: 'Build a production-ready Retrieval-Augmented Generation (RAG) system with hybrid dense-sparse search, reciprocal rank fusion, and hallucination guardrails.',
    datasetDesc: '5,000 corporate engineering documents, RFCs, and API documentation pages.',
    architecture: [
      'Document Ingestion & Semantic Recursive Character Chunking',
      'Dual-Retrieval: Dense (Vector Embeddings) + Sparse (BM25)',
      'Reciprocal Rank Fusion (RRF) & Cross-Encoder Reranking',
      'Context Window Packing & Grounded Citation Generation',
      'Faithfulness & Answer Relevancy Evaluation via Ragas'
    ],
    tasks: [
      'Implement recursive chunking with 512 token windows and 64 token overlap',
      'Generate vector embeddings using modern embedding models',
      'Implement BM25 lexical retriever alongside HNSW vector index',
      'Apply reciprocal rank fusion to merge candidate rankings',
      'Configure LLM prompt with strict context attribution guardrails'
    ],
    starterCode: `def reciprocal_rank_fusion(dense_results, sparse_results, k=60):
    scores = {}
    # TODO: Implement RRF scoring: sum(1 / (k + rank))
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)`,
    solutionCode: `from collections import defaultdict

def reciprocal_rank_fusion(dense_ranks, sparse_ranks, k=60):
    rrf_scores = defaultdict(float)
    for rank, doc_id in enumerate(dense_ranks):
        rrf_scores[doc_id] += 1.0 / (k + rank + 1)
    for rank, doc_id in enumerate(sparse_ranks):
        rrf_scores[doc_id] += 1.0 / (k + rank + 1)
    return sorted(rrf_scores.items(), key=lambda item: item[1], reverse=True)`,
    evaluationMetrics: ['Context Precision > 0.92', 'Faithfulness > 0.96', 'P95 Query Latency < 450ms'],
    deploymentGuide: 'Deploy with Qdrant/Pinecone vector database and streaming Server-Sent Events (SSE) frontend interface.',
    readmeMarkdown: `# Enterprise Hybrid RAG System
Grounded document QA system combining dense semantic search and BM25 with cross-encoder rerankers.`
  }
];

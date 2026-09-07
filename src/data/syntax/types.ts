export type SyntaxLibrary = 'python' | 'numpy' | 'pandas' | 'sklearn';

export type SyntaxCategory = 
  | 'Core Syntax & Idioms'
  | 'Array Creation & Indexing'
  | 'Broadcasting & Math'
  | 'Linear Algebra & Tensors'
  | 'DataFrames & Series'
  | 'Filtering & Querying'
  | 'Aggregation & GroupBy'
  | 'Reshaping & Merging'
  | 'Missing Data & Cleaning'
  | 'Preprocessing & Scaling'
  | 'Model Training & Estimators'
  | 'Pipelines & Transformers'
  | 'Evaluation & Metrics'
  | 'Cross-Validation & Tuning';

export interface SyntaxParameter {
  name: string;
  type: string;
  defaultVal?: string;
  description: string;
  isRequired?: boolean;
}

export interface SyntaxInterviewCase {
  question: string;
  answerSummary: string;
  companyFocus?: string[];
}

export interface SyntaxEntry {
  id: string;
  library: SyntaxLibrary;
  category: SyntaxCategory;
  name: string;
  signature: string;
  summary: string;
  usage: string;
  parameters: SyntaxParameter[];
  returns: string;
  codeExample: string;
  expectedOutput: string;
  commonPitfalls: string[];
  interviewUseCases: SyntaxInterviewCase[];
  complexity?: {
    time: string;
    space: string;
  };
  tags: string[];
  relatedFunctions?: string[];
}

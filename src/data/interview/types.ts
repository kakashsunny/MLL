// Machine Learning Interview Platform Types

export interface MLInterviewQuestion {
  id: string;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  shortAnswer: string;
  detailedExplanation: string;
  realWorldExample: string;
  commonMistake: string;
  interviewTip: string;
  codeSnippet?: string;
}

export interface MLCodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'NumPy' | 'Pandas' | 'Data Cleaning' | 'Feature Engineering' | 'Scikit-learn' | 'Statistics' | 'Algorithms' | 'Evaluation' | 'Preprocessing' | 'Debugging';
  description: string;
  task: string;
  initialCode: string;
  solutionCode: string;
  explanation: string;
  testCase?: string;
  expectedOutput: string;
}

export interface MLInterviewTrap {
  id: string;
  trapQuestion: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  whyPeopleFail: string;
  theTruth: string;
  technicalDetails: string;
  howToAnswerInInterview: string;
  codeExample?: string;
}

export interface MLAlgorithmDeepDive {
  id: string;
  name: string;
  category: 'Supervised' | 'Unsupervised' | 'Ensemble' | 'Dimensionality Reduction';
  whatItIs: string;
  howItWorks: string;
  mathematicalIntuition: string;
  formulas: { name: string; formula: string; explanation: string }[];
  advantages: string[];
  disadvantages: string[];
  whenToUse: string[];
  whenNotToUse: string[];
  hyperparameters: { name: string; defaultVal: string; impact: string }[];
  commonMistakes: string[];
  interviewQuestions: string[];
  realWorldExample: string;
  pythonImplementation: string;
  howToImprovePerformance: string[];
}

export interface MLSystemDesign {
  id: string;
  title: string;
  domain: string;
  difficulty: 'Medium' | 'Hard';
  requirements: { functional: string[]; nonFunctional: string[] };
  data: string;
  features: string[];
  model: string;
  training: string;
  evaluation: string;
  deployment: string;
  scaling: string;
  monitoring: string;
  failureCases: string[];
  tradeoffs: string[];
}

export interface MLCaseStudy {
  id: string;
  title: string;
  industry: string;
  businessProblem: string;
  dataEngineering: string;
  featureEngineering: string;
  modelSelection: string;
  validationStrategy: string;
  productionDeployment: string;
  businessImpact: string;
  lessonsLearned: string;
}

export interface MLSyntaxEntry {
  id: string;
  library: 'NumPy' | 'Pandas' | 'Scikit-learn' | 'Python';
  category: string;
  functionName: string;
  syntax: string;
  parameters: string;
  example: string;
  output: string;
  useCase: string;
  commonMistake: string;
}

export interface MLCertificateRecord {
  certificateId: string;
  learnerName: string;
  courseName: string;
  completionDate: string;
  assessmentStatus: string;
  verificationId: string;
  issuer: 'Founder Forge AI';
  foundedBy: 'K. Akash';
  organization: 'Sunny Organization';
  quizScore: number;
  codingScore: number;
  debuggingScore: number;
  overallScore: number;
  completedTopics: number;
  totalTopics: number;
}

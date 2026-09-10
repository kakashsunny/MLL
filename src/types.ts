export type ViewMode = 
  | 'landing'
  | 'dashboard'
  | 'course'
  | 'lab'
  | 'pandas_lab'
  | 'jupyter'
  | 'playground'
  | 'datasets'
  | 'experiments'
  | 'tutor'
  | 'syntax'
  | 'interview'
  | 'projects'
  | 'roadmap'
  | 'math'
  | 'glossary'
  | 'quiz'
  | 'certificate'
  | 'analytics'
  | 'profile'
  | 'admin';

export type UserLevel = 'ML Explorer' | 'Model Builder' | 'Algorithm Architect' | 'Deep Learning Engineer' | 'AI Systems Engineer';

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  email: string;
  title: string;
  organization: string;
  bio: string;
  avatar: string;
  targetRole: 'Machine Learning Engineer' | 'Data Scientist' | 'AI Research Scientist' | 'Quantitative Strategist' | 'MLOps Engineer' | 'Deep Learning Specialist' | string;
  experienceTier: 'Beginner' | 'Practitioner' | 'Advanced Researcher' | 'Principal Architect';
  weeklyGoalHours: number;
  preferredStack: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  joinedDate: string;
}

export interface UserProgress {
  xp: number;
  level: UserLevel;
  streakDays: number;
  completedLessons: string[];
  completedQuizzes: string[];
  completedCodingChallenges?: string[];
  completedDebuggingChallenges?: string[];
  assessmentScores?: {
    quizzes: Record<string, number>;
    coding: Record<string, boolean>;
    debugging: Record<string, boolean>;
  };
  certificateClaimed?: boolean;
  certificateClaimedAt?: string;
  certificateId?: string;
  certificateRecipientName?: string;
  completedProjects: string[];
  completedChallenges: string[];
  lastActiveDate: string;
  lastLoginTimestamp?: number;
  lastLoginDate?: string;
  bookmarkedTopics: string[];
  conceptMastery: Record<string, number>; // topic -> percentage 0-100
  learningHours: number;
  quizAccuracy: number;
  experimentsRunCount?: number;
}

export interface AssessmentQuizItem {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  xpReward: number;
}

export interface AssessmentCodingItem {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  functionSignature: string;
  starterCode: string;
  solutionCode: string;
  hint: string;
  testCasesDescription: string;
  xpReward: number;
}

export interface AssessmentDebuggingItem {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  bugExplanation: string;
  brokenCode: string;
  fixedCode: string;
  hint: string;
  testCasesDescription: string;
  xpReward: number;
}

export interface RoadmapNode {
  id: string;
  title: string;
  category: 'FOUNDATIONS' | 'CORE ML' | 'ADVANCED ML' | 'DEEP LEARNING' | 'MODERN AI' | 'PRODUCTION' | string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  estimatedHours: number;
  prerequisites: string[];
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  progress: number;
  progressPercent?: number;
  xpReward?: number;
  iconName: string;
  keyTopics: string[];
  associatedLabId?: string;
  associatedCourseId?: string;
}

export interface LessonContent {
  id: string;
  courseId: string;
  title: string;
  subtitle: string;
  order: number;
  duration?: string;
  xpReward?: number;
  visualDescription?: string;
  intuitionMetaphor?: string;
  contentExplanation?: string;
  codeSnippet?: string;
  oneLineIntuition: string;
  beginnerExplanation: string;
  technicalExplanation: string;
  mathFormula?: {
    latex: string;
    explanation: string;
  };
  visualType: 'linear_regression' | 'logistic_regression' | 'neural_net' | 'decision_tree' | 'gradient_descent' | 'kmeans' | 'knn' | 'random_forest' | 'svm' | 'naive_bayes' | 'pca' | string;
  realWorldExample: string;
  pythonCode: string;
  codeExplanation: string;
  commonMistakes: string[];
  interviewQuestions: string[];
  miniChallenge: {
    question: string;
    options: string[];
    correctIndex: number;
    correctOption?: number;
    explanation: string;
  };
}

export interface CourseModule {
  id: string;
  title: string;
  track: string;
  description: string;
  lessons: LessonContent[];
}

export type AlgorithmType = 
  | 'linear_regression'
  | 'logistic_regression'
  | 'knn'
  | 'kmeans'
  | 'decision_tree'
  | 'random_forest'
  | 'svm'
  | 'naive_bayes'
  | 'pca'
  | 'gradient_descent'
  | 'neural_network';

export interface LabParameters {
  learningRate: number;
  epochs: number;
  noise: number;
  sampleCount: number;
  regularization: number;
  kValue?: number;
  treeDepth?: number;
  batchSize?: number;
  activation?: 'relu' | 'sigmoid' | 'tanh' | 'linear';
}

export interface LabMetrics {
  mse?: number;
  mae?: number;
  r2?: number;
  accuracy?: number;
  loss?: number;
  epoch?: number;
  weight?: number;
  bias?: number;
  iterations?: number;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'code_prediction' | 'output_prediction' | 'visual_interpretation' | 'debugging' | 'scenario';
  category: string;
  question: string;
  codeSnippet?: string;
  visualData?: any;
  options: string[];
  correctAnswer: number;
  correctOption?: number;
  xpReward?: number;
  explanation?: string;
  whyExplanation: string;
  commonMisconception: string;
  expertInsight: string;
}

export interface InterviewQuestion {
  id: string;
  category: 'ML Fundamentals' | 'Statistics' | 'Probability' | 'Python' | 'Deep Learning' | 'NLP' | 'Computer Vision' | 'LLMs' | 'MLOps' | 'ML System Design';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'FAANG-level' | 'Research-level';
  title: string;
  question: string;
  hint: string;
  expectedKeyPoints: string[];
  sampleModelAnswer: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  category: string;
  simpleExplanation: string;
  technicalDefinition: string;
  mathematicalFormula?: string;
  visualIntuition: string;
  example: string;
  pythonSnippet: string;
  commonMisconception: string;
  interviewQuestion: string;
}

export interface ProjectDefinition {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Industry';
  estimatedTime: string;
  category: string;
  problem: string;
  datasetDesc: string;
  architecture: string[];
  tasks: string[];
  starterCode: string;
  solutionCode: string;
  evaluationMetrics: string[];
  deploymentGuide: string;
  readmeMarkdown: string;
}

export interface DatasetItem {
  id: string;
  name: string;
  description: string;
  category: string;
  rows: number;
  columns: string[];
  dataTypes: Record<string, string>;
  previewData: Record<string, any>[];
  missingValues: Record<string, number>;
  correlations: { featA: string; featB: string; value: number }[];
  targetColumn: string;
}

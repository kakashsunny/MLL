import { UserProgress, UserProfile } from '../types';

const STORAGE_KEY = 'neuraforge_user_state_v2';
const PROFILE_STORAGE_KEY = 'neuraforge_user_profile_v2';

export const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_guest',
  name: 'ML Practitioner',
  handle: '@learner_ml',
  email: 'learner@neuraforge.ai',
  title: 'ML Explorer',
  organization: 'NeuraForge Research Laboratory',
  bio: 'Exploring first-principles mathematical learning, vector optimization with NumPy & Pandas, and regularized ensemble architectures.',
  avatar: '🧠',
  targetRole: 'Machine Learning Engineer',
  experienceTier: 'Beginner',
  weeklyGoalHours: 5,
  preferredStack: ['NumPy', 'Pandas', 'Scikit-Learn'],
  githubUrl: 'https://github.com',
  linkedinUrl: 'https://linkedin.com',
  joinedDate: new Date().toISOString().split('T')[0]
};

export const getStoredProfile = (): UserProfile => {
  try {
    const data = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (data) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load profile from localStorage', e);
  }
  return DEFAULT_PROFILE;
};

export const saveStoredProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage', e);
  }
};

export const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  level: 'ML Explorer',
  streakDays: 1,
  completedLessons: [],
  completedQuizzes: [],
  completedCodingChallenges: [],
  completedDebuggingChallenges: [],
  assessmentScores: {
    quizzes: {},
    coding: {},
    debugging: {}
  },
  certificateClaimed: false,
  completedProjects: [],
  completedChallenges: [],
  lastActiveDate: new Date().toISOString().split('T')[0],
  bookmarkedTopics: [],
  conceptMastery: {
    'Python & NumPy': 0,
    'Linear Regression': 0,
    'Gradient Descent': 0,
    'Overfitting & Regularization': 0,
    'Decision Trees': 0,
    'Statistics & Probability': 0,
    'Neural Networks': 0,
    'Deep Learning': 0,
    'Transformers & LLMs': 0,
    'MLOps': 0
  },
  learningHours: 0,
  quizAccuracy: 0
};

export const getStoredProgress = (): UserProgress => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Clean up legacy template artifact only if matching original hardcoded mock
      if (parsed.xp === 12840 && parsed.completedLessons?.length === 7) {
        parsed.xp = 0;
        parsed.level = 'ML Explorer';
        parsed.streakDays = 1;
        parsed.completedLessons = [];
        parsed.completedQuizzes = [];
        parsed.completedProjects = [];
        parsed.completedChallenges = [];
      }
      return { 
        ...DEFAULT_PROGRESS, 
        ...parsed,
        completedCodingChallenges: parsed.completedCodingChallenges || [],
        completedDebuggingChallenges: parsed.completedDebuggingChallenges || [],
        assessmentScores: parsed.assessmentScores || { quizzes: {}, coding: {}, debugging: {} }
      };
    }
  } catch (e) {
    console.error('Failed to load progress from localStorage', e);
  }
  return DEFAULT_PROGRESS;
};

export const saveProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
};

export const checkAndUpdateDailyStreak = (): UserProgress => {
  const current = getStoredProgress();
  const today = new Date().toISOString().split('T')[0];
  const lastActive = current.lastActiveDate;

  let streak = typeof current.streakDays === 'number' && current.streakDays > 0 ? current.streakDays : 1;

  if (!lastActive) {
    streak = 1;
  } else if (lastActive === today) {
    // Already active today; retain streak
    if (streak <= 0) streak = 1;
  } else {
    const last = new Date(lastActive + 'T00:00:00');
    const now = new Date(today + 'T00:00:00');
    const diffTime = now.getTime() - last.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak = streak + 1;
    } else if (diffDays > 1) {
      streak = 1;
    } else {
      // Negative or same day clock jitter
      if (streak <= 0) streak = 1;
    }
  }

  const updated: UserProgress = {
    ...current,
    streakDays: streak,
    lastActiveDate: today
  };
  saveProgress(updated);
  return updated;
};

export const addXP = (amount: number): UserProgress => {
  const current = checkAndUpdateDailyStreak();
  const newXP = Math.max(0, (current.xp || 0) + amount);
  let newLevel = current.level;
  if (newXP >= 25000) newLevel = 'AI Systems Engineer';
  else if (newXP >= 18000) newLevel = 'Deep Learning Engineer';
  else if (newXP >= 12000) newLevel = 'Algorithm Architect';
  else if (newXP >= 6000) newLevel = 'Model Builder';

  const updated: UserProgress = {
    ...current,
    xp: newXP,
    level: newLevel
  };
  saveProgress(updated);
  return updated;
};

export const recordQuizCompletion = (
  questionId: string, 
  isCorrect: boolean, 
  scoreValue: number = 100, 
  xpReward: number = 50
): UserProgress => {
  const current = checkAndUpdateDailyStreak();
  const completed = new Set(current.completedQuizzes || []);
  completed.add(questionId);

  const prevScores = current.assessmentScores?.quizzes || {};
  const newScores = { ...prevScores, [questionId]: scoreValue };

  const prevXP = current.xp || 0;
  const isFirstTime = !current.completedQuizzes.includes(questionId);
  const earnedXP = isFirstTime && isCorrect ? xpReward : 0;
  const newXP = prevXP + earnedXP;

  let newLevel = current.level;
  if (newXP >= 25000) newLevel = 'AI Systems Engineer';
  else if (newXP >= 18000) newLevel = 'Deep Learning Engineer';
  else if (newXP >= 12000) newLevel = 'Algorithm Architect';
  else if (newXP >= 6000) newLevel = 'Model Builder';

  const updated: UserProgress = {
    ...current,
    xp: newXP,
    level: newLevel,
    completedQuizzes: Array.from(completed),
    assessmentScores: {
      ...(current.assessmentScores || { quizzes: {}, coding: {}, debugging: {} }),
      quizzes: newScores
    }
  };
  saveProgress(updated);
  return updated;
};

export const recordCodingCompletion = (
  challengeId: string, 
  xpReward: number = 100
): UserProgress => {
  const current = checkAndUpdateDailyStreak();
  const completed = new Set(current.completedCodingChallenges || []);
  const isFirstTime = !completed.has(challengeId);
  completed.add(challengeId);

  const prevCodingScores = current.assessmentScores?.coding || {};
  const newCodingScores = { ...prevCodingScores, [challengeId]: true };

  const newXP = (current.xp || 0) + (isFirstTime ? xpReward : 0);
  let newLevel = current.level;
  if (newXP >= 25000) newLevel = 'AI Systems Engineer';
  else if (newXP >= 18000) newLevel = 'Deep Learning Engineer';
  else if (newXP >= 12000) newLevel = 'Algorithm Architect';
  else if (newXP >= 6000) newLevel = 'Model Builder';

  const updated: UserProgress = {
    ...current,
    xp: newXP,
    level: newLevel,
    completedCodingChallenges: Array.from(completed),
    assessmentScores: {
      ...(current.assessmentScores || { quizzes: {}, coding: {}, debugging: {} }),
      coding: newCodingScores
    }
  };
  saveProgress(updated);
  return updated;
};

export const recordDebuggingCompletion = (
  challengeId: string, 
  xpReward: number = 100
): UserProgress => {
  const current = checkAndUpdateDailyStreak();
  const completed = new Set(current.completedDebuggingChallenges || []);
  const isFirstTime = !completed.has(challengeId);
  completed.add(challengeId);

  const prevDebuggingScores = current.assessmentScores?.debugging || {};
  const newDebuggingScores = { ...prevDebuggingScores, [challengeId]: true };

  const newXP = (current.xp || 0) + (isFirstTime ? xpReward : 0);
  let newLevel = current.level;
  if (newXP >= 25000) newLevel = 'AI Systems Engineer';
  else if (newXP >= 18000) newLevel = 'Deep Learning Engineer';
  else if (newXP >= 12000) newLevel = 'Algorithm Architect';
  else if (newXP >= 6000) newLevel = 'Model Builder';

  const updated: UserProgress = {
    ...current,
    xp: newXP,
    level: newLevel,
    completedDebuggingChallenges: Array.from(completed),
    assessmentScores: {
      ...(current.assessmentScores || { quizzes: {}, coding: {}, debugging: {} }),
      debugging: newDebuggingScores
    }
  };
  saveProgress(updated);
  return updated;
};

export const claimCertificateRecord = (certificateId: string): UserProgress => {
  const current = checkAndUpdateDailyStreak();
  const updated: UserProgress = {
    ...current,
    certificateClaimed: true,
    certificateClaimedAt: new Date().toISOString(),
    certificateId
  };
  saveProgress(updated);
  return updated;
};

export const markLessonComplete = (lessonId: string): UserProgress => {
  const current = checkAndUpdateDailyStreak();
  if (!current.completedLessons.includes(lessonId)) {
    const updated: UserProgress = {
      ...current,
      xp: (current.xp || 0) + 150,
      completedLessons: [...current.completedLessons, lessonId]
    };
    saveProgress(updated);
    return updated;
  }
  return current;
};

export const markChallengeComplete = (challengeId: string, xpReward: number = 350): UserProgress => {
  const current = checkAndUpdateDailyStreak();
  const challenges = current.completedChallenges || [];
  if (!challenges.includes(challengeId)) {
    const newXP = (current.xp || 0) + xpReward;
    let newLevel = current.level;
    if (newXP >= 25000) newLevel = 'AI Systems Engineer';
    else if (newXP >= 18000) newLevel = 'Deep Learning Engineer';
    else if (newXP >= 12000) newLevel = 'Algorithm Architect';
    else if (newXP >= 6000) newLevel = 'Model Builder';

    const updated: UserProgress = {
      ...current,
      xp: newXP,
      level: newLevel,
      completedChallenges: [...challenges, challengeId]
    };
    saveProgress(updated);
    return updated;
  }
  return current;
};

export const loadUserProgress = (): UserProgress => {
  return checkAndUpdateDailyStreak();
};
export const saveUserProgress = saveProgress;
export const awardXP = addXP;

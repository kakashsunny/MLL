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
  streakDays: 0,
  completedLessons: [],
  completedQuizzes: [],
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
      // Clean up legacy hardcoded 12 days and default 12840 XP
      if (parsed.streakDays === 12) {
        parsed.streakDays = 0;
      }
      if (parsed.xp === 12840 && parsed.completedLessons?.length === 7) {
        parsed.xp = 0;
        parsed.level = 'ML Explorer';
        parsed.completedLessons = [];
        parsed.completedQuizzes = [];
        parsed.completedProjects = [];
        parsed.completedChallenges = [];
      }
      return { ...DEFAULT_PROGRESS, ...parsed };
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

export const addXP = (amount: number): UserProgress => {
  const current = getStoredProgress();
  const newXP = current.xp + amount;
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

export const markLessonComplete = (lessonId: string): UserProgress => {
  const current = getStoredProgress();
  if (!current.completedLessons.includes(lessonId)) {
    const updated: UserProgress = {
      ...current,
      xp: current.xp + 150,
      completedLessons: [...current.completedLessons, lessonId]
    };
    saveProgress(updated);
    return updated;
  }
  return current;
};

export const loadUserProgress = getStoredProgress;
export const saveUserProgress = saveProgress;
export const awardXP = addXP;

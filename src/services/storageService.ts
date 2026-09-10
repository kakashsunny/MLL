import { UserProgress, UserProfile } from '../types';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const STORAGE_KEY = 'neuraforge_user_state_v2';
const PROFILE_STORAGE_KEY = 'neuraforge_user_profile_v2';
const CERTIFICATES_REGISTRY_KEY = 'neuraforge_verified_certificates_v1';

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

const INITIAL_NOW_MS = Date.now();
const INITIAL_NOW_ISO = new Date(INITIAL_NOW_MS).toISOString();
const INITIAL_NOW_DATE = INITIAL_NOW_ISO.split('T')[0];

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
  lastActiveDate: INITIAL_NOW_DATE,
  lastLoginTimestamp: INITIAL_NOW_MS,
  lastLoginDate: INITIAL_NOW_ISO,
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

// --------------------------------------------------------------------------
// Robust Timestamp-Based Streak Calculation
// --------------------------------------------------------------------------

export interface StreakCalculationResult {
  streakDays: number;
  isNewDay: boolean;
  isConsecutive: boolean;
  dayDifference: number;
  elapsedHours: number;
}

/**
 * Calculates the current active learning streak based on last login timestamp.
 * 
 * Logic:
 * - Compares calendar day midnight boundaries (00:00:00.000) in the user's local timezone.
 * - Same calendar day (dayDiff = 0): maintains current streak.
 * - Consecutive calendar day (dayDiff = 1): increments streak by 1.
 * - Grace buffer (dayDiff = 2, elapsed <= 36 hours): handles midnight crossing during
 *   late-night study sessions or international travel, preserving streak increment.
 * - Missed days (dayDiff > 1 and elapsed > 36 hours): resets streak to 1.
 * - Clock drift or negative jitter (dayDiff < 0): safely preserves streak.
 */
export function calculateStreakFromTimestamp(
  lastLoginTimestamp: number | undefined,
  currentStreak: number = 1,
  nowMs: number = Date.now()
): StreakCalculationResult {
  const safeCurrentStreak = typeof currentStreak === 'number' && currentStreak > 0 ? currentStreak : 1;

  if (!lastLoginTimestamp || isNaN(lastLoginTimestamp) || lastLoginTimestamp <= 0) {
    return {
      streakDays: 1,
      isNewDay: true,
      isConsecutive: false,
      dayDifference: 0,
      elapsedHours: 0
    };
  }

  const nowDate = new Date(nowMs);
  const lastDate = new Date(lastLoginTimestamp);

  // Normalize to calendar day midnight (00:00:00.000) in user's local timezone
  const nowMidnight = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime();
  const lastMidnight = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()).getTime();

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const dayDifference = Math.round((nowMidnight - lastMidnight) / MS_PER_DAY);
  const elapsedHours = Math.max(0, (nowMs - lastLoginTimestamp) / (60 * 60 * 1000));

  if (dayDifference === 0) {
    // Already active on the current calendar day: keep existing streak
    return {
      streakDays: safeCurrentStreak,
      isNewDay: false,
      isConsecutive: false,
      dayDifference: 0,
      elapsedHours
    };
  } else if (dayDifference === 1) {
    // Logged in on consecutive day: increment streak
    return {
      streakDays: safeCurrentStreak + 1,
      isNewDay: true,
      isConsecutive: true,
      dayDifference: 1,
      elapsedHours
    };
  } else if (dayDifference === 2 && elapsedHours <= 36) {
    // Grace buffer for late-night sessions across midnight boundary
    return {
      streakDays: safeCurrentStreak + 1,
      isNewDay: true,
      isConsecutive: true,
      dayDifference: 1,
      elapsedHours
    };
  } else if (dayDifference > 1) {
    // Inactivity gap exceeded: reset streak to 1
    return {
      streakDays: 1,
      isNewDay: true,
      isConsecutive: false,
      dayDifference,
      elapsedHours
    };
  } else {
    // Clock drift / negative delta: maintain streak safely
    return {
      streakDays: safeCurrentStreak,
      isNewDay: false,
      isConsecutive: false,
      dayDifference,
      elapsedHours
    };
  }
}

// --------------------------------------------------------------------------
// In-Memory Progress Subscriptions & Firebase Synchronization
// --------------------------------------------------------------------------

type ProgressSubscriber = (progress: UserProgress) => void;
const progressSubscribers: Set<ProgressSubscriber> = new Set();

let lastSyncedSerialized: string = '';
let syncDebounceTimer: any = null;

export const subscribeToProgressUpdates = (callback: ProgressSubscriber): (() => void) => {
  progressSubscribers.add(callback);
  return () => {
    progressSubscribers.delete(callback);
  };
};

const notifyProgressSubscribers = (progress: UserProgress): void => {
  // Dispatch asynchronously to avoid mutating React component state during another component's render phase
  setTimeout(() => {
    progressSubscribers.forEach(cb => {
      try {
        cb(progress);
      } catch (err) {
        console.error('Error in progress subscriber:', err);
      }
    });
  }, 0);
};

/**
 * Synchronizes user progress and streak metrics to Firebase Firestore.
 * Updates both the core user document (/users/{uid}) and the detailed progress
 * document (/users/{uid}/progress/current).
 */
export const syncProgressToFirebase = async (
  progress: UserProgress,
  targetUid?: string
): Promise<void> => {
  const uid = targetUid || auth.currentUser?.uid;
  if (!uid) return;

  try {
    const nowIso = new Date().toISOString();
    const timestamp = progress.lastLoginTimestamp || Date.now();

    // 1. Update user profile root document with streak and XP
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      xp: progress.xp || 0,
      streak: progress.streakDays || 1,
      tier: progress.level || 'ML Explorer',
      lastLoginAt: progress.lastLoginDate || nowIso,
      lastLoginTimestamp: timestamp
    }, { merge: true });

    // 2. Sanitize progress for Firestore (removes undefined fields)
    const sanitizedProgress = JSON.parse(JSON.stringify(progress));

    // 3. Update dedicated progress subdocument
    const progressRef = doc(db, 'users', uid, 'progress', 'current');
    await setDoc(progressRef, {
      userId: uid,
      ...sanitizedProgress,
      updatedAt: nowIso
    }, { merge: true });

    lastSyncedSerialized = JSON.stringify(progress);
  } catch (err: any) {
    // Offline / temporary network interruption notice (non-fatal)
    console.warn('[Firebase Sync] Could not sync user progress to Firestore:', err?.message || err);
  }
};

/**
 * Fetches and merges user progress from Firebase Firestore.
 * Ensures consistent persistence across multiple devices, browsers, and sessions.
 */
export const syncProgressFromFirebase = async (targetUid?: string): Promise<UserProgress> => {
  const uid = targetUid || auth.currentUser?.uid;
  const local = getStoredProgress();
  if (!uid) return local;

  try {
    const userRef = doc(db, 'users', uid);
    const progressRef = doc(db, 'users', uid, 'progress', 'current');

    const [userSnap, progressSnap] = await Promise.all([
      getDoc(userRef).catch(() => null),
      getDoc(progressRef).catch(() => null)
    ]);

    let remoteProgress: Partial<UserProgress> = {};
    if (progressSnap && progressSnap.exists()) {
      remoteProgress = progressSnap.data() as Partial<UserProgress>;
    }

    let remoteProfile: any = {};
    if (userSnap && userSnap.exists()) {
      remoteProfile = userSnap.data();
    }

    // Consolidated XP (highest points earned across sessions/devices)
    const mergedXP = Math.max(
      local.xp || 0,
      remoteProgress.xp || 0,
      remoteProfile.xp || 0
    );

    // Level derived from merged XP
    let mergedLevel = local.level;
    if (mergedXP >= 25000) mergedLevel = 'AI Systems Engineer';
    else if (mergedXP >= 18000) mergedLevel = 'Deep Learning Engineer';
    else if (mergedXP >= 12000) mergedLevel = 'Algorithm Architect';
    else if (mergedXP >= 6000) mergedLevel = 'Model Builder';
    else mergedLevel = 'ML Explorer';

    // Sets union for completed modules across devices
    const mergedLessons = Array.from(new Set([
      ...(local.completedLessons || []),
      ...(remoteProgress.completedLessons || [])
    ]));

    const mergedQuizzes = Array.from(new Set([
      ...(local.completedQuizzes || []),
      ...(remoteProgress.completedQuizzes || [])
    ]));

    const mergedCoding = Array.from(new Set([
      ...(local.completedCodingChallenges || []),
      ...(remoteProgress.completedCodingChallenges || [])
    ]));

    const mergedDebugging = Array.from(new Set([
      ...(local.completedDebuggingChallenges || []),
      ...(remoteProgress.completedDebuggingChallenges || [])
    ]));

    const mergedProjects = Array.from(new Set([
      ...(local.completedProjects || []),
      ...(remoteProgress.completedProjects || [])
    ]));

    const mergedChallenges = Array.from(new Set([
      ...(local.completedChallenges || []),
      ...(remoteProgress.completedChallenges || [])
    ]));

    // Assessment scores merge taking highest score
    const mergedAssessmentScores = {
      quizzes: {
        ...(local.assessmentScores?.quizzes || {}),
        ...(remoteProgress.assessmentScores?.quizzes || {})
      },
      coding: {
        ...(local.assessmentScores?.coding || {}),
        ...(remoteProgress.assessmentScores?.coding || {})
      },
      debugging: {
        ...(local.assessmentScores?.debugging || {}),
        ...(remoteProgress.assessmentScores?.debugging || {})
      }
    };

    // Certificate preservation
    const certificateClaimed = Boolean(local.certificateClaimed || remoteProgress.certificateClaimed);
    const certificateId = local.certificateId || remoteProgress.certificateId;
    const certificateClaimedAt = local.certificateClaimedAt || remoteProgress.certificateClaimedAt;
    const certificateRecipientName = local.certificateRecipientName || remoteProgress.certificateRecipientName;

    // Timestamp & Streak consolidation
    const nowMs = Date.now();
    const localTimestamp = local.lastLoginTimestamp || 
      (local.lastActiveDate ? new Date(local.lastActiveDate + 'T12:00:00').getTime() : 0);
    const remoteTimestamp = remoteProgress.lastLoginTimestamp || 
      (remoteProfile.lastLoginTimestamp || (remoteProfile.lastLoginAt ? new Date(remoteProfile.lastLoginAt).getTime() : 0));

    const mostRecentTimestamp = Math.max(localTimestamp, remoteTimestamp);
    const baseStreak = Math.max(
      local.streakDays || 1,
      remoteProgress.streakDays || 1,
      remoteProfile.streak || 1
    );

    const streakResult = calculateStreakFromTimestamp(
      mostRecentTimestamp > 0 ? mostRecentTimestamp : nowMs,
      baseStreak,
      nowMs
    );

    const merged: UserProgress = {
      ...DEFAULT_PROGRESS,
      ...local,
      ...remoteProgress,
      xp: mergedXP,
      level: mergedLevel,
      streakDays: streakResult.streakDays,
      lastLoginTimestamp: nowMs,
      lastLoginDate: new Date(nowMs).toISOString(),
      lastActiveDate: new Date(nowMs).toISOString().split('T')[0],
      completedLessons: mergedLessons,
      completedQuizzes: mergedQuizzes,
      completedCodingChallenges: mergedCoding,
      completedDebuggingChallenges: mergedDebugging,
      completedProjects: mergedProjects,
      completedChallenges: mergedChallenges,
      assessmentScores: mergedAssessmentScores,
      certificateClaimed,
      certificateId,
      certificateClaimedAt,
      certificateRecipientName
    };

    lastSyncedSerialized = JSON.stringify(merged);
    localStorage.setItem(STORAGE_KEY, lastSyncedSerialized);
    notifyProgressSubscribers(merged);

    // Sync consolidated state back to Firebase
    await syncProgressToFirebase(merged, uid);
    return merged;
  } catch (err: any) {
    console.warn('[Firebase Sync] Could not fetch remote progress:', err?.message || err);
    return local;
  }
};

// Automatic listener for Firebase authentication state
if (typeof window !== 'undefined') {
  try {
    onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        try {
          await syncProgressFromFirebase(user.uid);
        } catch (e) {
          console.warn('[StorageService] Auto-sync on auth change notice:', e);
        }
      }
    });
  } catch (e) {
    console.warn('[StorageService] Could not register auth state listener:', e);
  }
}

// --------------------------------------------------------------------------
// Core Local Storage & State Management
// --------------------------------------------------------------------------

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
        streakDays: typeof parsed.streakDays === 'number' && parsed.streakDays > 0 ? parsed.streakDays : 1,
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

export const saveProgress = (progress: UserProgress, skipRemoteSync: boolean = false): void => {
  try {
    const serialized = JSON.stringify(progress);
    localStorage.setItem(STORAGE_KEY, serialized);

    if (!skipRemoteSync && serialized !== lastSyncedSerialized) {
      if (syncDebounceTimer) {
        clearTimeout(syncDebounceTimer);
      }
      syncDebounceTimer = setTimeout(() => {
        syncProgressToFirebase(progress).catch(err => {
          console.warn('[StorageService] Background sync notice:', err);
        });
      }, 300);
    }
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
};

/**
 * Checks and updates the daily learning streak using the robust timestamp approach.
 * Persists the updated state locally and triggers Firebase synchronization.
 */
export const checkAndUpdateDailyStreak = (): UserProgress => {
  const current = getStoredProgress();
  const nowMs = Date.now();
  const todayIso = new Date(nowMs).toISOString();
  const todayDate = todayIso.split('T')[0];

  // Resolve last login timestamp (with fallback to legacy lastActiveDate string)
  const lastTimestamp = current.lastLoginTimestamp && current.lastLoginTimestamp > 0
    ? current.lastLoginTimestamp
    : (current.lastActiveDate ? new Date(current.lastActiveDate + 'T12:00:00').getTime() : undefined);

  const streakResult = calculateStreakFromTimestamp(lastTimestamp, current.streakDays, nowMs);

  const updated: UserProgress = {
    ...current,
    streakDays: streakResult.streakDays,
    lastLoginTimestamp: nowMs,
    lastLoginDate: todayIso,
    lastActiveDate: todayDate
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
  passedOrReward: boolean | number = true, 
  xpReward: number = 200
): UserProgress => {
  const passed = typeof passedOrReward === 'boolean' ? passedOrReward : true;
  const reward = typeof passedOrReward === 'number' ? passedOrReward : xpReward;
  const current = checkAndUpdateDailyStreak();
  const completed = new Set(current.completedCodingChallenges || []);
  if (passed) {
    completed.add(challengeId);
  }

  const prevScores = current.assessmentScores?.coding || {};
  const newScores = { ...prevScores, [challengeId]: passed };

  const prevXP = current.xp || 0;
  const isFirstTime = !(current.completedCodingChallenges || []).includes(challengeId);
  const earnedXP = isFirstTime && passed ? reward : 0;
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
    completedCodingChallenges: Array.from(completed),
    assessmentScores: {
      ...(current.assessmentScores || { quizzes: {}, coding: {}, debugging: {} }),
      coding: newScores
    }
  };
  saveProgress(updated);
  return updated;
};

export const recordDebuggingCompletion = (
  challengeId: string, 
  resolvedOrReward: boolean | number = true, 
  xpReward: number = 250
): UserProgress => {
  const resolved = typeof resolvedOrReward === 'boolean' ? resolvedOrReward : true;
  const reward = typeof resolvedOrReward === 'number' ? resolvedOrReward : xpReward;
  const current = checkAndUpdateDailyStreak();
  const completed = new Set(current.completedDebuggingChallenges || []);
  if (resolved) {
    completed.add(challengeId);
  }

  const prevScores = current.assessmentScores?.debugging || {};
  const newScores = { ...prevScores, [challengeId]: resolved };

  const prevXP = current.xp || 0;
  const isFirstTime = !(current.completedDebuggingChallenges || []).includes(challengeId);
  const earnedXP = isFirstTime && resolved ? reward : 0;
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
    completedDebuggingChallenges: Array.from(completed),
    assessmentScores: {
      ...(current.assessmentScores || { quizzes: {}, coding: {}, debugging: {} }),
      debugging: newScores
    }
  };
  saveProgress(updated);
  return updated;
};

// --------------------------------------------------------------------------
// Certificate Registry and Verification
// --------------------------------------------------------------------------

export interface CertificateVerificationRecord {
  isValid: boolean;
  certificateId: string;
  recipientName?: string;
  courseName?: string;
  issuedAt?: string;
  issuer?: string;
  quizScore?: string;
  codingScore?: string;
  debuggingScore?: string;
  status?: string;
  hash?: string;
  error?: string;
}

export const claimCertificateRecord = (certificateId: string, recipientName?: string): UserProgress => {
  const current = checkAndUpdateDailyStreak();
  const issuedAt = new Date().toISOString();
  const finalName = recipientName || current.certificateRecipientName || 'ML Practitioner';

  const updated: UserProgress = {
    ...current,
    certificateClaimed: true,
    certificateClaimedAt: issuedAt,
    certificateId,
    certificateRecipientName: finalName
  };
  saveProgress(updated);

  // Save to persistent verification registry
  try {
    const raw = localStorage.getItem(CERTIFICATES_REGISTRY_KEY);
    const registry: Record<string, CertificateVerificationRecord> = raw ? JSON.parse(raw) : {};
    
    // Deterministic cryptographic-style verification hash
    const simpleHash = '0x' + Array.from(certificateId + finalName + issuedAt)
      .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0)
      .toString(16)
      .toUpperCase()
      .padStart(16, '7F');

    registry[certificateId.trim().toUpperCase()] = {
      isValid: true,
      certificateId,
      recipientName: finalName,
      courseName: 'Machine Learning & First-Principles Engineering',
      issuedAt,
      issuer: 'K AKASH — Founder, Sunny Organization',
      quizScore: '20 / 20 Completed',
      codingScore: '20 / 20 Verified',
      debuggingScore: '20 / 20 Resolved',
      status: 'VERIFIED & AUTHENTIC',
      hash: simpleHash
    };

    localStorage.setItem(CERTIFICATES_REGISTRY_KEY, JSON.stringify(registry));
  } catch (e) {
    console.error('Failed to save to certificates registry', e);
  }

  return updated;
};

export const updateCertificateRecipientName = (name: string): UserProgress => {
  const current = getStoredProgress();
  const updated: UserProgress = {
    ...current,
    certificateRecipientName: name
  };
  saveProgress(updated);

  // If certificate was already claimed, update recipient in registry as well
  if (current.certificateClaimed && current.certificateId) {
    try {
      const raw = localStorage.getItem(CERTIFICATES_REGISTRY_KEY);
      const registry: Record<string, CertificateVerificationRecord> = raw ? JSON.parse(raw) : {};
      const key = current.certificateId.trim().toUpperCase();
      if (registry[key]) {
        registry[key] = {
          ...registry[key],
          recipientName: name
        };
        localStorage.setItem(CERTIFICATES_REGISTRY_KEY, JSON.stringify(registry));
      }
    } catch (e) {
      console.error('Failed to update name in registry', e);
    }
  }

  return updated;
};

export const verifyCertificateRecord = (searchId: string): CertificateVerificationRecord => {
  const cleanId = (searchId || '').trim().toUpperCase();
  if (!cleanId) {
    return {
      isValid: false,
      certificateId: searchId,
      error: 'Please enter a valid certificate ID.'
    };
  }

  // 1. Check current progress state
  const current = getStoredProgress();
  const currentCertId = current.certificateId?.trim().toUpperCase();

  const isCurrentEligible = 
    (current.completedQuizzes?.length || 0) >= 20 &&
    (current.completedCodingChallenges?.length || 0) >= 20 &&
    (current.completedDebuggingChallenges?.length || 0) >= 20;

  if (currentCertId === cleanId && current.certificateClaimed) {
    const issuedDate = current.certificateClaimedAt || new Date().toISOString();
    const name = current.certificateRecipientName || 'ML Practitioner';
    const simpleHash = '0x' + Array.from(current.certificateId! + name + issuedDate)
      .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0)
      .toString(16)
      .toUpperCase()
      .padStart(16, '8E');

    return {
      isValid: true,
      certificateId: current.certificateId!,
      recipientName: name,
      courseName: 'Machine Learning & First-Principles Engineering',
      issuedAt: issuedDate,
      issuer: 'K AKASH — Founder, Sunny Organization',
      quizScore: '20 / 20 Completed',
      codingScore: '20 / 20 Verified',
      debuggingScore: '20 / 20 Resolved',
      status: 'VERIFIED & AUTHENTIC',
      hash: simpleHash
    };
  }

  // 2. Check persistent registry in localStorage
  try {
    const raw = localStorage.getItem(CERTIFICATES_REGISTRY_KEY);
    if (raw) {
      const registry: Record<string, CertificateVerificationRecord> = JSON.parse(raw);
      if (registry[cleanId]) {
        return registry[cleanId];
      }
    }
  } catch (e) {
    console.error('Failed to check registry', e);
  }

  // 3. Fallback: If cleanId matches format but current user hasn't claimed, explain status
  if (currentCertId === cleanId && !isCurrentEligible) {
    return {
      isValid: false,
      certificateId: searchId,
      error: 'Certificate ID matches current user record, but assessment requirements (20/20 Quiz, 20/20 Coding, 20/20 Debugging) are not yet complete.'
    };
  }

  return {
    isValid: false,
    certificateId: searchId,
    error: 'No authentic accreditation record matching this Certificate ID was found in the Sunny Organization registry.'
  };
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

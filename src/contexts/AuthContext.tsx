import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  googleProvider, 
  firebaseSignOut, 
  signInAnonymously, 
  updateProfile as firebaseUpdateProfile, 
  sendPasswordResetEmail, 
  syncUserProfile, 
  fetchUserProfile, 
  updateUserRole, 
  updateUserStats,
  recordSystemAuditLog, 
  testFirestoreConnection, 
  UserProfile, 
  UserRole, 
  RolePermissions, 
  ROLE_PERMISSIONS 
} from '../services/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  getStoredProgress, 
  saveUserProgress, 
  checkAndUpdateDailyStreak,
  syncProgressFromFirebase
} from '../services/storageService';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  role: UserRole;
  permissions: RolePermissions;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
  loginWithGoogleRedirect: () => Promise<void>;
  sendResetPasswordEmail: (email: string) => Promise<void>;
  loginAsGuest: (role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  changeRole: (newRole: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
  syncStats: (newXp: number, newStreak: number) => Promise<void>;
}

const getInitialProfile = (): UserProfile => {
  const local = getStoredProgress();
  return {
    id: 'guest_demo',
    email: 'researcher@neuraforge.ai',
    displayName: 'Guest Explorer',
    role: 'researcher',
    xp: local.xp || 0,
    streak: Math.max(local.streakDays || 0, 1),
    tier: local.level || 'ML Explorer',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(getInitialProfile());
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Verify Firestore and check for OAuth redirect result on mount
  useEffect(() => {
    testFirestoreConnection();

    // Check if user just returned from a Google Redirect authentication (ideal for Vercel/mobile)
    getRedirectResult(auth)
      .then(async (cred) => {
        if (cred && cred.user) {
          try {
            const syncedProgress = await syncProgressFromFirebase(cred.user.uid);
            const synced = await syncUserProfile(cred.user, undefined, undefined, syncedProgress.xp, syncedProgress.streakDays);
            setProfile(synced);
            recordSystemAuditLog(cred.user.uid, cred.user.email || '', synced.role, 'LOGIN_GOOGLE_REDIRECT', 'Google OAuth redirect authentication completed');
            setIsAuthModalOpen(false);
          } catch (e) {
            console.warn('Redirect profile sync error:', e);
          }
        }
      })
      .catch((err) => {
        console.warn('OAuth redirect check error:', err);
      });
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const syncedProgress = await syncProgressFromFirebase(currentUser.uid);
          const synced = await syncUserProfile(currentUser, undefined, undefined, syncedProgress.xp, syncedProgress.streakDays);
          setProfile(synced);
        } catch (err) {
          console.warn('Profile sync fallback:', err);
          const local = checkAndUpdateDailyStreak();
          setProfile({
            id: currentUser.uid,
            email: currentUser.email || 'user@neuraforge.ai',
            displayName: currentUser.displayName || 'ML Practitioner',
            role: 'researcher',
            xp: local.xp || 0,
            streak: Math.max(local.streakDays || 0, 1),
            tier: local.level || 'ML Explorer',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          });
        }
      } else {
        // Fallback default state so the app is immediately exploratory
        setProfile(getInitialProfile());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const userProfile = await syncUserProfile(cred.user);
      setProfile(userProfile);
      recordSystemAuditLog(cred.user.uid, email, userProfile.role, 'LOGIN_EMAIL', 'User authenticated via Email');
      setIsAuthModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string, role: UserRole = 'researcher') => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await firebaseUpdateProfile(cred.user, { displayName: name });
      const userProfile = await syncUserProfile(cred.user, role, name);
      setProfile(userProfile);
      recordSystemAuditLog(cred.user.uid, email, role, 'SIGNUP_EMAIL', `User registered account as ${role}`);
      setIsAuthModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (role?: UserRole) => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const userProfile = await syncUserProfile(cred.user, role);
      setProfile(userProfile);
      recordSystemAuditLog(cred.user.uid, cred.user.email || '', userProfile.role, 'LOGIN_GOOGLE', 'Google OAuth authentication');
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.warn('Google sign-in attempt:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogleRedirect = async () => {
    setLoading(true);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      console.warn('Google redirect sign-in attempt:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendResetPasswordEmail = async (emailToReset: string) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, emailToReset);
      recordSystemAuditLog(user?.uid || 'anonymous', emailToReset, 'student', 'PASSWORD_RESET', 'Password reset email requested');
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = async (role: UserRole = 'researcher') => {
    setLoading(true);
    try {
      let currentAuthUser = auth.currentUser;
      if (!currentAuthUser) {
        const cred = await signInAnonymously(auth);
        currentAuthUser = cred.user;
      }
      const userProfile = await syncUserProfile(currentAuthUser, role, `Guest (${role.toUpperCase()})`);
      setProfile(userProfile);
      setIsAuthModalOpen(false);
    } catch (e) {
      // Local demo fallback if network is restricted
      setProfile({
        ...getInitialProfile(),
        id: `guest_${Date.now()}`,
        displayName: `Guest ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        role
      });
      setIsAuthModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (user) {
        recordSystemAuditLog(user.uid, user.email || 'user', profile?.role || 'student', 'LOGOUT', 'User signed out');
      }
      await firebaseSignOut(auth);
      setProfile(getInitialProfile());
    } catch (e) {
      console.warn('Logout warning:', e);
      setProfile(getInitialProfile());
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (newRole: UserRole) => {
    if (!profile) return;
    const updated = { ...profile, role: newRole };
    setProfile(updated);
    if (user && !user.isAnonymous) {
      try {
        await updateUserRole(user.uid, newRole);
        recordSystemAuditLog(user.uid, user.email || '', newRole, 'ROLE_OVERRIDE', `Role altered to ${newRole}`);
      } catch (err) {
        console.warn('Role update notice:', err);
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const p = await fetchUserProfile(user.uid);
      if (p) setProfile(p);
    }
  };

  const syncStats = useCallback(async (newXp: number, newStreak: number) => {
    setProfile(prev => {
      if (!prev) return null;
      if (prev.xp === newXp && prev.streak === newStreak) return prev;
      return {
        ...prev,
        xp: newXp,
        streak: newStreak,
        tier: newXp >= 18000 ? 'Deep Learning Engineer' : newXp >= 12000 ? 'Algorithm Architect' : newXp >= 6000 ? 'Model Builder' : 'ML Explorer'
      };
    });

    if (user && !user.isAnonymous) {
      try {
        await updateUserStats(user.uid, newXp, newStreak);
      } catch (err) {
        console.warn('Stats sync to Firestore notice:', err);
      }
    }
  }, [user]);

  const activeRole: UserRole = profile?.role || 'student';
  const permissions = ROLE_PERMISSIONS[activeRole];

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: activeRole,
        permissions,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        loginWithGoogleRedirect,
        sendResetPasswordEmail,
        loginAsGuest,
        logout,
        changeRole,
        refreshProfile,
        syncStats
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

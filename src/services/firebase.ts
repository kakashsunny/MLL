import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInAnonymously,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  getDocs, 
  getDocFromServer,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Project ID constant for diagnostics and console links
export const FIREBASE_PROJECT_ID = 
  import.meta.env.VITE_FIREBASE_PROJECT_ID || 
  firebaseConfigJson?.projectId || 
  'gen-lang-client-0928069600';

// Initialize Firebase App with JSON config and Vercel/Vite env overrides
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson?.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson?.authDomain,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson?.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson?.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson?.appId
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore (utilizing dedicated databaseId if provided)
const firestoreDbId = import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson?.firestoreDatabaseId;
export const db = firestoreDbId 
  ? getFirestore(app, firestoreDbId)
  : getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Connection verification test per Firebase integration standard
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Connection verified successfully.');
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline or Firestore config needs attention:', error.message);
    }
    return false;
  }
}

// User Authorization Roles
export type UserRole = 'admin' | 'researcher' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  xp: number;
  streak: number;
  tier: string;
  createdAt: string;
  lastLoginAt: string;
  isAnonymous?: boolean;
}

// Role Permissions Definitions
export interface RolePermissions {
  canAccessAdminPanel: boolean;
  canManageUsers: boolean;
  canRunGeminiPro: boolean;
  canExportNotebooks: boolean;
  canDeployModels: boolean;
  canAuditSystem: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canAccessAdminPanel: true,
    canManageUsers: true,
    canRunGeminiPro: true,
    canExportNotebooks: true,
    canDeployModels: true,
    canAuditSystem: true
  },
  researcher: {
    canAccessAdminPanel: false,
    canManageUsers: false,
    canRunGeminiPro: true,
    canExportNotebooks: true,
    canDeployModels: true,
    canAuditSystem: false
  },
  student: {
    canAccessAdminPanel: false,
    canManageUsers: false,
    canRunGeminiPro: false,
    canExportNotebooks: true,
    canDeployModels: false,
    canAuditSystem: false
  }
};

// Auth and Database Operations
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

export async function syncUserProfile(
  user: FirebaseUser, 
  customRole?: UserRole, 
  initialDisplayName?: string,
  localXp?: number,
  localStreak?: number
): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', user.uid);
  const existing = await fetchUserProfile(user.uid);

  const now = new Date().toISOString();
  const mergedXp = Math.max(existing?.xp ?? 0, localXp ?? 0);
  const mergedStreak = Math.max(existing?.streak ?? 0, localStreak ?? 0, 1);

  const profile: UserProfile = {
    id: user.uid,
    email: user.email || (user.isAnonymous ? `guest_${user.uid.slice(0, 6)}@neuraforge.ai` : 'user@neuraforge.ai'),
    displayName: initialDisplayName || user.displayName || existing?.displayName || (user.isAnonymous ? 'Guest Explorer' : 'ML Practitioner'),
    photoURL: user.photoURL || existing?.photoURL || undefined,
    role: customRole || existing?.role || (user.email?.includes('admin') ? 'admin' : 'researcher'),
    xp: mergedXp,
    streak: mergedStreak,
    tier: existing?.tier || (mergedXp >= 18000 ? 'Deep Learning Engineer' : mergedXp >= 12000 ? 'Algorithm Architect' : mergedXp >= 6000 ? 'Model Builder' : 'ML Explorer'),
    createdAt: existing?.createdAt || now,
    lastLoginAt: now,
    isAnonymous: user.isAnonymous
  };

  try {
    await setDoc(userDocRef, profile, { merge: true });
  } catch (err) {
    console.warn('Could not persist profile to Firestore (may be offline or awaiting rules):', err);
  }

  return profile;
}

export async function updateUserStats(uid: string, xp: number, streak: number): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      xp,
      streak,
      lastLoginAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Could not update user stats in Firestore:', err);
  }
}

export async function updateUserRole(uid: string, newRole: UserRole): Promise<void> {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, { role: newRole });
}

export async function recordSystemAuditLog(
  actorId: string,
  actorEmail: string,
  actorRole: string,
  action: string,
  details: string
): Promise<void> {
  try {
    const logsCol = collection(db, 'audit_logs');
    await addDoc(logsCol, {
      actorId,
      actorEmail,
      actorRole,
      action,
      details,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('Audit log write error:', err);
  }
}

export async function fetchSystemAuditLogs(): Promise<any[]> {
  try {
    const logsCol = collection(db, 'audit_logs');
    const snap = await getDocs(logsCol);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Could not fetch audit logs:', err);
    return [];
  }
}

// Export Auth Methods
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  googleProvider,
  firebaseSignOut,
  onAuthStateChanged,
  signInAnonymously,
  updateProfile,
  sendPasswordResetEmail
};

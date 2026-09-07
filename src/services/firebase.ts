import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
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

// Initialize Firebase App
const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore (utilizing dedicated databaseId if provided)
export const db = firebaseConfigJson.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
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
  initialDisplayName?: string
): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', user.uid);
  const existing = await fetchUserProfile(user.uid);

  const now = new Date().toISOString();
  const profile: UserProfile = {
    id: user.uid,
    email: user.email || (user.isAnonymous ? `guest_${user.uid.slice(0, 6)}@neuraforge.ai` : 'user@neuraforge.ai'),
    displayName: initialDisplayName || user.displayName || existing?.displayName || (user.isAnonymous ? 'Guest Explorer' : 'ML Practitioner'),
    photoURL: user.photoURL || existing?.photoURL || undefined,
    role: customRole || existing?.role || (user.email?.includes('admin') ? 'admin' : 'researcher'),
    xp: existing?.xp ?? 0,
    streak: existing?.streak ?? 0,
    tier: existing?.tier || 'ML Explorer',
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
  googleProvider,
  firebaseSignOut,
  onAuthStateChanged,
  signInAnonymously,
  updateProfile,
  sendPasswordResetEmail
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../services/firebase';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  LogIn,
  UserPlus
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    loginWithEmail, 
    signupWithEmail, 
    loginWithGoogle, 
    sendResetPasswordEmail,
    loginAsGuest,
    loading 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('researcher');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync mode whenever authModalMode or modal open state changes
  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode);
      setError(null);
      setSuccessMessage(null);
    }
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const formatAuthError = (err: any): string => {
    if (!err) return 'Authentication encountered an issue.';
    const code = err.code || '';
    const msg = err.message || '';

    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Incorrect email or password. Please verify your credentials or register a new account.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'This email address is already in use. Please sign in or use a different email.';
    }
    if (code === 'auth/weak-password') {
      return 'Password should be at least 6 characters long.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please provide a valid email format (e.g., user@domain.com).';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in window was closed before finishing. Please try again.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Google sign-in popup was blocked by browser. Please allow popups or use Email sign-in.';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'Firebase domain authorization in progress. You can explore immediately using the Guest role buttons below.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Network connection problem. Please check your connectivity and retry.';
    }
    return msg || 'Authentication operation failed.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
      } else if (mode === 'signup') {
        await signupWithEmail(
          email.trim(), 
          password, 
          displayName.trim() || 'ML Practitioner', 
          selectedRole
        );
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          setError('Please enter your email address to receive reset instructions.');
          return;
        }
        await sendResetPasswordEmail(email.trim());
        setSuccessMessage(`Password reset link dispatched to ${email.trim()}. Check your inbox.`);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(formatAuthError(err));
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setSuccessMessage(null);
    try {
      await loginWithGoogle(selectedRole);
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(formatAuthError(err));
    }
  };

  const handleGuestQuickStart = async (role: UserRole) => {
    setError(null);
    try {
      await loginAsGuest(role);
    } catch (err: any) {
      console.error(err);
      setError(formatAuthError(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="firebase_auth_modal"
        className="bg-white border border-[#E5E2D9] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E2D9] bg-[#FAF8F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1A42D9]/10 border border-[#1A42D9]/20 flex items-center justify-center text-[#1A42D9]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-stone-900 uppercase tracking-wider">
                {mode === 'login' 
                  ? 'Sign In to NeuraForge' 
                  : mode === 'signup' 
                  ? 'Create Research Account' 
                  : 'Reset Password'}
              </h2>
              <p className="text-[11px] font-mono text-stone-500">
                Firebase Authentication & Role Access
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot' && (
          <div className="flex border-b border-[#E5E2D9] bg-[#F4F1E8]">
            <button
              id="auth_tab_login_btn"
              onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
              className={`flex-1 py-3 text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'login' 
                  ? 'border-b-2 border-[#1A42D9] text-[#1A42D9] bg-white' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              id="auth_tab_signup_btn"
              onClick={() => { setMode('signup'); setError(null); setSuccessMessage(null); }}
              className={`flex-1 py-3 text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'signup' 
                  ? 'border-b-2 border-[#1A42D9] text-[#1A42D9] bg-white' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        )}

        <div className="overflow-y-auto flex-1">
          {/* Success Banner */}
          {successMessage && (
            <div className="m-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="m-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="space-y-1">
                <span className="font-medium block">{error}</span>
                {error.includes('popup was blocked') && (
                  <span className="text-[11px] text-rose-700 block">
                    Tip: Look at the top right of your address bar to allow pop-ups for this site.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1">
                  Full Name / Researcher Alias
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    id="auth_input_name"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Dr. Ada Lovelace"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E5E2D9] text-xs font-mono bg-[#FAF9F5] focus:bg-white focus:outline-none focus:border-[#1A42D9] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-bold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  id="auth_input_email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="researcher@lab.org"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E5E2D9] text-xs font-mono bg-[#FAF9F5] focus:bg-white focus:outline-none focus:border-[#1A42D9] transition-colors"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono font-bold text-stone-700">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(null); setSuccessMessage(null); }}
                      className="text-[11px] font-mono text-[#1A42D9] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    id="auth_input_password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 rounded-xl border border-[#E5E2D9] text-xs font-mono bg-[#FAF9F5] focus:bg-white focus:outline-none focus:border-[#1A42D9] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-[10px] font-mono text-stone-400 mt-1">
                    Minimum 6 characters for secure authentication.
                  </p>
                )}
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1">
                  Choose Platform Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['student', 'researcher', 'admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`py-2 px-1 rounded-lg text-[11px] font-mono capitalize border transition-all text-center ${
                        selectedRole === r
                          ? 'border-[#1A42D9] bg-blue-50 text-[#1A42D9] font-bold shadow-2xs'
                          : 'border-[#E5E2D9] bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] font-mono text-stone-400 mt-1">
                  {selectedRole === 'admin' 
                    ? '• Admin: Audit log access, RBAC controls & full Gemini access' 
                    : selectedRole === 'researcher' 
                    ? '• Researcher: Full access to Gemini Pro, ML Labs & Notebooks' 
                    : '• Student: Foundational curriculum & visual learning labs'}
                </p>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              id="auth_submit_btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#1A42D9] hover:bg-[#1535B0] text-white text-xs font-mono font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login' 
                      ? 'Log In' 
                      : mode === 'signup' 
                      ? 'Create Account' 
                      : 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
                className="w-full py-2 text-xs font-mono text-stone-600 hover:text-stone-900 transition-colors text-center"
              >
                ← Back to Log In
              </button>
            )}
          </form>

          {/* Social Auth & Quick Fallbacks (only on login or signup) */}
          {mode !== 'forgot' && (
            <>
              {/* Divider */}
              <div className="px-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-[10px] font-mono uppercase text-stone-400">or continue with</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              <div className="p-6 pt-3 space-y-3">
                {/* Google Sign In / Sign Up */}
                <button
                  id="auth_google_btn"
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full py-2.5 px-3 rounded-xl border border-[#E5E2D9] bg-white hover:bg-stone-50 text-stone-800 text-xs font-mono font-medium flex items-center justify-center gap-2.5 transition-colors shadow-2xs hover:border-stone-300 disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}</span>
                </button>

                {/* Instant Role Explorer / Guest Fallback */}
                <div className="pt-2 border-t border-[#EAE7DD]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-stone-500 font-bold uppercase tracking-wider">
                      Instant Guest Role Testing
                    </span>
                    <span className="text-[9px] font-mono text-stone-400">
                      No password required
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleGuestQuickStart('admin')}
                      className="py-1 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[10px] font-mono font-bold border border-amber-200 transition-colors"
                      title="Test platform as System Administrator"
                    >
                      ⚡ Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGuestQuickStart('researcher')}
                      className="py-1 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1A42D9] text-[10px] font-mono font-bold border border-blue-200 transition-colors"
                      title="Test platform as ML Researcher"
                    >
                      ⚡ Researcher
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGuestQuickStart('student')}
                      className="py-1 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200 transition-colors"
                      title="Test platform as Student"
                    >
                      ⚡ Student
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


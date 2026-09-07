import React, { useState, useRef, useEffect } from 'react';
import { ViewMode, UserProgress } from '../../types';
import { getStoredProfile } from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Flame, 
  Sparkles, 
  Search, 
  Terminal, 
  FlaskConical, 
  Compass,
  ShieldCheck,
  LogIn,
  UserPlus,
  UserCheck,
  LogOut,
  User,
  ChevronDown,
  Menu
} from 'lucide-react';

interface TopBarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  userProgress: UserProgress;
  onOpenSearch: () => void;
  onDailyChallengeClick?: () => void;
  onReturnToLanding?: () => void;
  onOpenProfile?: () => void;
  onRestartTutorial?: () => void;
  onToggleMobile?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onSelectView,
  userProgress,
  onOpenSearch,
  onDailyChallengeClick,
  onReturnToLanding,
  onOpenProfile,
  onRestartTutorial,
  onToggleMobile
}) => {
  const { user, profile, role, permissions, openAuthModal, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const streak = Math.max(userProgress?.streakDays || 0, profile?.streak || 0, 1);
  const xp = Math.max(userProgress?.xp || 0, profile?.xp || 0);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header 
      id="app_top_bar"
      className="h-14 border-b border-[#E5E2D9] bg-[#F7F5EF]/95 backdrop-blur-md sticky top-0 z-20 px-3 sm:px-8 flex items-center justify-between select-none"
    >
      {/* View Title / Breadcrumb + Mobile Menu Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleMobile && (
          <button
            onClick={onToggleMobile}
            className="lg:hidden p-1.5 rounded-lg border border-[#E5E2D9] bg-white hover:bg-stone-50 text-stone-700 cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <button 
          onClick={onReturnToLanding}
          className="text-xs font-mono font-bold uppercase tracking-widest text-[#111111] hover:text-[#1A42D9] transition-colors cursor-pointer"
        >
          NEURAFORGE
        </button>
        <span className="text-stone-300 font-mono">/</span>
        <span className="text-xs font-mono font-medium text-stone-600 capitalize truncate max-w-[120px] sm:max-w-none">
          {currentView === 'course' ? 'Curriculum' : currentView === 'pandas_lab' ? 'Pandas Lab' : currentView === 'jupyter' ? 'Jupyter Lab' : currentView.replace('_', ' ')}
        </span>
      </div>

      {/* Right Action Icons & User Stats */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Daily Challenge Indicator */}
        {onDailyChallengeClick && (
          <button
            id="topbar_daily_challenge_btn"
            onClick={onDailyChallengeClick}
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded bg-[#F0EDE4] border border-[#E5E2D9] hover:border-amber-500 text-stone-800 hover:text-amber-700 text-xs font-medium transition-all cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-mono text-[11px] uppercase tracking-wider">Daily Challenge</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          </button>
        )}

        {/* Global Search Shortcut Button */}
        <button
          id="topbar_search_btn"
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-white border border-[#E5E2D9] hover:border-[#111111] rounded text-stone-600 hover:text-[#111111] transition-colors cursor-pointer shadow-2xs"
        >
          <Search className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-xs font-mono uppercase tracking-tighter hidden md:inline">Find</span>
          <kbd className="px-1 py-0.2 bg-[#F7F5EF] rounded text-[9px] text-stone-500 font-mono border border-[#E5E2D9]">
            ⌘K
          </kbd>
        </button>

        {/* Streak Counter */}
        <div 
          id="topbar_streak_badge"
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-white border border-[#E5E2D9] rounded font-mono text-xs font-bold text-amber-600 shadow-2xs"
          title="Daily Study Streak"
        >
          <span>🔥</span>
          <span>{streak}</span>
          <span className="text-[10px] text-stone-400 font-normal hidden sm:inline">DAYS</span>
        </div>

        {/* XP Counter */}
        <div 
          id="topbar_xp_badge"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E2D9] rounded text-xs font-mono text-[#1A42D9] font-semibold shadow-2xs"
          title="Total Experience"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#1A42D9]" />
          <span>{xp.toLocaleString()}</span>
          <span className="text-stone-400 text-[10px]">XP</span>
        </div>

        {/* Restart Tutorial Button */}
        {onRestartTutorial && (
          <button
            id="topbar_restart_tutorial_btn"
            title="Restart Guided Tutorial"
            onClick={onRestartTutorial}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-stone-50 border border-[#E5E2D9] text-xs font-mono text-stone-700 hover:text-[#111111] transition-colors shadow-2xs"
          >
            <Compass className="w-3.5 h-3.5 text-[#1A42D9]" />
            <span className="font-medium">Restart Tutorial</span>
          </button>
        )}

        {/* Role & Auth Status */}
        <div className="flex items-center gap-2 pl-1" ref={userMenuRef}>
          <button
            id="topbar_role_badge"
            onClick={() => onSelectView('admin')}
            title="Open Security & Authorization Center (RBAC)"
            className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border transition-colors ${
              role === 'admin' 
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' 
                : role === 'researcher' 
                ? 'bg-blue-50 text-[#1A42D9] border-blue-200 hover:bg-blue-100' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{role}</span>
          </button>

          {user && !user.isAnonymous ? (
            <div className="relative">
              <button
                id="topbar_user_profile_btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 border border-[#E5E2D9] text-xs font-mono text-stone-800 transition-colors shadow-2xs cursor-pointer"
                title={`Signed in as ${user.email || profile?.displayName}`}
              >
                <div className="w-5 h-5 rounded-full bg-[#1A42D9]/10 text-[#1A42D9] font-bold flex items-center justify-center text-[10px]">
                  {(profile?.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline text-[11px] font-medium truncate max-w-[110px]">
                  {profile?.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div 
                  id="topbar_user_dropdown"
                  className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E2D9] rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3.5 py-2 border-b border-[#E5E2D9]">
                    <div className="text-xs font-bold text-stone-900 truncate">
                      {profile?.displayName || 'ML Practitioner'}
                    </div>
                    <div className="text-[10px] font-mono text-stone-500 truncate">
                      {user.email}
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-50 text-[#1A42D9] border border-blue-200">
                        {role} tier
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onOpenProfile) onOpenProfile();
                        else onSelectView('profile');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-mono text-stone-700 hover:bg-[#FAF8F2] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span>Learner Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onSelectView('admin');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-mono text-stone-700 hover:bg-[#FAF8F2] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                      <span>Security & RBAC Matrix</span>
                    </button>
                  </div>

                  <div className="border-t border-[#E5E2D9] pt-1">
                    <button
                      id="topbar_signout_btn"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-mono text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                id="topbar_login_btn"
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 border border-[#E5E2D9] text-xs font-mono text-stone-700 hover:text-[#111111] transition-colors shadow-2xs cursor-pointer"
                title="Log In with Email or Google"
              >
                <LogIn className="w-3.5 h-3.5 text-stone-600" />
                <span className="text-[11px] font-semibold">Log In</span>
              </button>

              <button
                id="topbar_signup_btn"
                onClick={() => openAuthModal('signup')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1A42D9] hover:bg-[#1535B0] text-white text-xs font-mono font-bold transition-colors shadow-2xs cursor-pointer"
                title="Create Account with Email or Google"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="text-[11px]">Sign Up</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Launch & Controls */}
        <div className="flex items-center gap-1.5 border-l border-[#E5E2D9] pl-3">
          <button
            id="topbar_open_lab_btn"
            title="Open ML Lab"
            onClick={() => onSelectView('lab')}
            className={`p-1.5 rounded hover:bg-white border text-stone-600 hover:text-[#1A42D9] transition-colors ${
              currentView === 'lab' ? 'bg-white border-[#111111] text-[#1A42D9]' : 'border-transparent'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
          </button>

          <button
            id="topbar_open_playground_btn"
            title="Open Code Playground"
            onClick={() => onSelectView('playground')}
            className={`p-1.5 rounded hover:bg-white border text-stone-600 hover:text-[#1A42D9] transition-colors ${
              currentView === 'playground' ? 'bg-white border-[#111111] text-[#1A42D9]' : 'border-transparent'
            }`}
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* User Profile Avatar */}
          <button 
            id="topbar_profile_avatar"
            onClick={() => {
              if (onOpenProfile) onOpenProfile();
              else onSelectView('profile');
            }}
            title={`Learner Profile: ${getStoredProfile().name}`}
            className="w-7 h-7 rounded bg-[#FAF8F2] border border-[#E5E2D9] text-base flex items-center justify-center hover:border-[#1A42D9] transition-all ml-0.5 shadow-2xs"
          >
            {getStoredProfile().avatar || '🧠'}
          </button>
        </div>
      </div>
    </header>
  );
};

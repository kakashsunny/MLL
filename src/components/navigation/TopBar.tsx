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
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft,
  LayoutDashboard,
  BookOpen,
  Table,
  Code2,
  Trophy,
  Award,
  Layers
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
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
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
  onToggleMobile,
  isSidebarCollapsed = false,
  onToggleSidebar
}) => {
  const { user, profile, role, permissions, openAuthModal, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const streak = Math.max(userProgress?.streakDays || 0, profile?.streak || 0, 1);
  const xp = Math.max(userProgress?.xp || 0, profile?.xp || 0);

  // Format numbers cleanly for small screens (e.g., 6.4k)
  const formatCompactXP = (val: number) => {
    if (val >= 10000) return `${(val / 1000).toFixed(1)}k`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toString();
  };

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

  // Quick navigation items for mobile & tablet quick-switch bar
  const quickTabs: { view: ViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { view: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { view: 'course', label: 'Learn', icon: BookOpen },
    { view: 'lab', label: 'ML Lab', icon: FlaskConical },
    { view: 'pandas_lab', label: 'Pandas', icon: Table },
    { view: 'jupyter', label: 'Jupyter', icon: Code2 },
    { view: 'playground', label: 'Playground', icon: Terminal },
    { view: 'projects', label: 'Projects', icon: Layers },
    { view: 'quiz', label: 'Challenges', icon: Trophy },
    { view: 'certificate', label: 'Certificates', icon: Award }
  ];

  const getViewDisplayName = (mode: ViewMode): string => {
    switch (mode) {
      case 'landing': return 'Home';
      case 'dashboard': return 'Overview';
      case 'course': return 'Curriculum';
      case 'lab': return 'Visual ML Lab';
      case 'pandas_lab': return 'Pandas Lab';
      case 'jupyter': return 'Jupyter Notebook';
      case 'playground': return 'Code Playground';
      case 'certificate': return 'Certifications';
      case 'projects': return 'Project Arena';
      case 'roadmap': return 'Learning Path';
      case 'quiz': return 'Skill Challenges';
      case 'math': return 'Math Engine';
      case 'tutor': return 'Forge AI Tutor';
      case 'datasets': return 'Dataset Hub';
      case 'interview': return 'Tech Interview';
      case 'syntax': return 'Syntax Vault';
      case 'experiments': return 'Experiments';
      case 'glossary': return 'ML Glossary';
      case 'profile': return 'Learner Profile';
      case 'admin': return 'RBAC Security';
      default: return String(mode).replace('_', ' ');
    }
  };

  return (
    <div className="sticky top-0 z-20 flex flex-col select-none">
      {/* Primary Top Navigation Bar */}
      <header 
        id="app_top_bar"
        className="h-14 border-b border-[#E5E2D9] bg-[#F7F5EF]/95 backdrop-blur-md px-2.5 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between transition-all"
      >
        {/* Left Section: Navigation Menu Button + Brand & Breadcrumb */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {/* Navigation Menu Toggle Button */}
          <button
            id="topbar_menu_btn"
            onClick={() => {
              if (window.innerWidth >= 1024) {
                if (onToggleSidebar) onToggleSidebar();
              } else {
                if (onToggleMobile) onToggleMobile();
              }
            }}
            className="p-2 rounded-lg border border-[#E5E2D9] bg-white hover:bg-stone-50 text-stone-700 active:bg-stone-100 transition-colors cursor-pointer shadow-2xs flex-shrink-0"
            title="Toggle Navigation Menu (⌘B)"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Brand Logo & Tag */}
          <button 
            onClick={onReturnToLanding}
            className="flex items-center gap-1.5 group cursor-pointer flex-shrink-0 text-left"
            title="Return to Home"
          >
            <div className="w-6 h-6 rounded bg-[#111111] text-white flex items-center justify-center font-mono font-bold text-xs group-hover:bg-[#1A42D9] transition-colors">
              N
            </div>
            <span className="text-xs sm:text-sm font-mono font-extrabold uppercase tracking-widest text-[#111111] group-hover:text-[#1A42D9] transition-colors hidden xs:inline">
              NEURAFORGE
            </span>
          </button>

          {/* Hierarchy Breadcrumb */}
          <div className="flex items-center gap-1.5 min-w-0 pl-1">
            <span className="text-stone-300 font-mono text-xs">/</span>
            
            {/* Desktop & Laptop full breadcrumb category */}
            <span className="hidden xl:inline text-stone-400 text-xs font-mono uppercase tracking-wider">
              {currentView === 'course' || currentView === 'lab' || currentView === 'pandas_lab' || currentView === 'jupyter' ? 'Curriculum & Labs' : 'Platform'}
            </span>
            <span className="hidden xl:inline text-stone-300 font-mono text-xs">/</span>

            {/* Active View Indicator */}
            <span className="text-xs font-mono font-bold text-stone-800 capitalize truncate max-w-[110px] sm:max-w-[160px] md:max-w-none">
              {getViewDisplayName(currentView)}
            </span>
          </div>
        </div>

        {/* Right Section: Search, Gamification stats, Auth & User controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 flex-shrink-0">
          
          {/* Daily Challenge Indicator (Visible on laptops & desktops) */}
          {onDailyChallengeClick && (
            <button
              id="topbar_daily_challenge_btn"
              onClick={onDailyChallengeClick}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F0EDE4] border border-[#E5E2D9] hover:border-amber-500 text-stone-800 hover:text-amber-700 text-xs font-medium transition-all cursor-pointer shadow-2xs"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-mono text-[11px] uppercase tracking-wider hidden xl:inline">Daily Challenge</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </button>
          )}

          {/* Global Search Shortcut Button - Optimized for Mobile, Tablet, Laptop, Desktop */}
          <button
            id="topbar_search_btn"
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-2.5 sm:py-1 bg-white border border-[#E5E2D9] hover:border-[#111111] rounded-lg text-stone-600 hover:text-[#111111] transition-colors cursor-pointer shadow-2xs"
            title="Search concepts and labs (⌘K / Ctrl+K)"
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-stone-500" />
            <span className="text-xs font-mono uppercase tracking-tight hidden md:inline">Find</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 bg-[#F7F5EF] rounded text-[9px] text-stone-500 font-mono border border-[#E5E2D9]">
              ⌘K
            </kbd>
          </button>

          {/* Streak Counter - Responsive across all sizes */}
          <div 
            id="topbar_streak_badge"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-white border border-[#E5E2D9] rounded-lg font-mono text-xs font-bold text-amber-600 shadow-2xs"
            title={`${streak} Day Study Streak`}
          >
            <span className="text-sm leading-none">🔥</span>
            <span>{streak}</span>
            <span className="text-[10px] text-stone-400 font-normal hidden sm:inline">
              <span className="hidden md:inline">DAYS</span>
              <span className="md:hidden">d</span>
            </span>
          </div>

          {/* XP Counter - Compact on tablets, full on laptops & desktops */}
          <div 
            id="topbar_xp_badge"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E2D9] rounded-lg text-xs font-mono text-[#1A42D9] font-bold shadow-2xs"
            title={`Total Experience: ${xp.toLocaleString()} XP`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1A42D9]" />
            <span className="hidden md:inline">{xp.toLocaleString()}</span>
            <span className="md:hidden">{formatCompactXP(xp)}</span>
            <span className="text-stone-400 text-[10px] font-normal">XP</span>
          </div>

          {/* Guided Tutorial Reset (Desktop only, 2xl) */}
          {onRestartTutorial && (
            <button
              id="topbar_restart_tutorial_btn"
              title="Restart Guided Interactive Tutorial"
              onClick={onRestartTutorial}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 border border-[#E5E2D9] text-xs font-mono text-stone-700 hover:text-[#111111] transition-colors shadow-2xs cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#1A42D9]" />
              <span className="font-medium">Tutorial</span>
            </button>
          )}

          {/* Role & Auth Status */}
          <div className="flex items-center gap-1.5 pl-0.5 sm:pl-1" ref={userMenuRef}>
            {/* RBAC Role Badge - Visible on tablet, laptop & desktop */}
            <button
              id="topbar_role_badge"
              onClick={() => onSelectView('admin')}
              title="Open Security & RBAC Access Matrix"
              className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
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
                  className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-lg bg-white hover:bg-stone-50 border border-[#E5E2D9] text-xs font-mono text-stone-800 transition-colors shadow-2xs cursor-pointer"
                  title={`Signed in as ${user.email || profile?.displayName}`}
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-[#1A42D9]/10 text-[#1A42D9] font-bold flex items-center justify-center text-xs sm:text-[10px]">
                    {(profile?.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline text-[11px] font-medium truncate max-w-[100px]">
                    {profile?.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Account'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-stone-400 hidden sm:inline" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div 
                    id="topbar_user_dropdown"
                    className="absolute right-0 mt-2 w-64 bg-white border border-[#E5E2D9] rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-4 py-2.5 border-b border-[#E5E2D9]">
                      <div className="text-xs font-bold text-stone-900 truncate">
                        {profile?.displayName || 'ML Practitioner'}
                      </div>
                      <div className="text-[10px] font-mono text-stone-500 truncate mt-0.5">
                        {user.email}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-blue-50 text-[#1A42D9] border border-blue-200 font-bold">
                          {role} role
                        </span>
                        <span className="text-[9px] font-mono text-stone-400">
                          {xp.toLocaleString()} XP
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
                        className="w-full text-left px-4 py-2 text-xs font-mono text-stone-700 hover:bg-[#FAF8F2] flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-stone-400" />
                        <span>Learner Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSelectView('admin');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-mono text-stone-700 hover:bg-[#FAF8F2] flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-stone-400" />
                        <span>Security & Access (RBAC)</span>
                      </button>

                      {onRestartTutorial && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onRestartTutorial();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-mono text-stone-700 hover:bg-[#FAF8F2] flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Compass className="w-4 h-4 text-stone-400" />
                          <span>Restart Guided Tour</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-[#E5E2D9] pt-1">
                      <button
                        id="topbar_signout_btn"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-mono text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5">
                {/* Responsive Sign In / Up */}
                <button
                  id="topbar_login_btn"
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-50 border border-[#E5E2D9] text-xs font-mono text-stone-700 hover:text-[#111111] transition-colors shadow-2xs cursor-pointer"
                  title="Log In with Email or Google"
                >
                  <LogIn className="w-3.5 h-3.5 text-stone-600" />
                  <span className="text-[11px] font-semibold">Sign In</span>
                </button>

                <button
                  id="topbar_signup_btn"
                  onClick={() => openAuthModal('signup')}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1A42D9] hover:bg-[#1535B0] text-white text-xs font-mono font-bold transition-colors shadow-2xs cursor-pointer"
                  title="Create Account with Email or Google"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Sign Up</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Launch & Controls (Tablet, Laptop & Desktop) */}
          <div className="hidden sm:flex items-center gap-1 border-l border-[#E5E2D9] pl-2 sm:pl-2.5">
            <button
              id="topbar_open_lab_btn"
              title="Open ML Lab"
              onClick={() => onSelectView('lab')}
              className={`p-1.5 rounded-lg hover:bg-white border transition-colors cursor-pointer ${
                currentView === 'lab' ? 'bg-white border-[#111111] text-[#1A42D9] shadow-2xs' : 'border-transparent text-stone-600 hover:text-[#1A42D9]'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
            </button>

            <button
              id="topbar_open_playground_btn"
              title="Open Code Playground"
              onClick={() => onSelectView('playground')}
              className={`p-1.5 rounded-lg hover:bg-white border transition-colors cursor-pointer ${
                currentView === 'playground' ? 'bg-white border-[#111111] text-[#1A42D9] shadow-2xs' : 'border-transparent text-stone-600 hover:text-[#1A42D9]'
              }`}
            >
              <Terminal className="w-4 h-4" />
            </button>

            {/* Profile Avatar Quick Link */}
            <button 
              id="topbar_profile_avatar"
              onClick={() => {
                if (onOpenProfile) onOpenProfile();
                else onSelectView('profile');
              }}
              title={`Learner Profile: ${getStoredProfile().name}`}
              className="w-7 h-7 rounded-lg bg-[#FAF8F2] border border-[#E5E2D9] text-sm flex items-center justify-center hover:border-[#1A42D9] transition-all ml-0.5 shadow-2xs cursor-pointer"
            >
              {getStoredProfile().avatar || '🧠'}
            </button>
          </div>
        </div>
      </header>

      {/* Responsive Horizontal Quick-Switch Sub-Navbar for Mobile & Tablet (lg:hidden) */}
      <nav 
        id="mobile_tablet_quick_subnav"
        aria-label="Quick Workspaces Navigation"
        className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF8F2] border-b border-[#E5E2D9] overflow-x-auto scrollbar-none select-none text-xs font-mono"
      >
        {quickTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentView === tab.view;
          return (
            <button
              key={tab.view}
              onClick={() => onSelectView(tab.view)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full flex-shrink-0 transition-all cursor-pointer text-[11px] ${
                isActive
                  ? 'bg-[#111111] text-white font-bold shadow-2xs'
                  : 'bg-white border border-[#E5E2D9] text-stone-600 hover:text-[#111111] hover:border-stone-400'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-stone-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

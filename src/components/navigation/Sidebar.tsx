import React from 'react';
import { 
  ViewMode, 
  UserProgress 
} from '../../types';
import { getStoredProfile } from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  FlaskConical, 
  Terminal, 
  Database, 
  GitFork, 
  Briefcase, 
  Sparkles, 
  MessageSquareCode, 
  Binary, 
  BookMarked, 
  Flame, 
  CheckCircle2, 
  Search,
  Sliders,
  Table,
  User,
  Code2,
  ShieldCheck,
  Award,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  userProgress?: UserProgress;
  onOpenSearch?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  streakCount?: number;
  onOpenProfile?: () => void;
  onRestartTutorial?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onToggleMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  userProgress,
  onOpenSearch,
  onOpenProfile,
  onRestartTutorial,
  isMobileOpen = false,
  onCloseMobile,
  onToggleMobile
}) => {
  const { role, user, profile, openAuthModal } = useAuth();
  const currentXP = Math.max(userProgress?.xp || 0, profile?.xp || 0);
  const currentLevel = userProgress?.level || 'ML Explorer';
  const currentStreak = Math.max(userProgress?.streakDays || 0, profile?.streak || 0, 1);

  const coreNav: { id: ViewMode; label: string; icon: any; tag?: string }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'course', label: 'Learn', icon: BookOpen, tag: 'Active' },
    { id: 'lab', label: 'ML Lab', icon: FlaskConical, tag: 'Signature' },
    { id: 'pandas_lab', label: 'Pandas Lab', icon: Table, tag: 'New' },
    { id: 'jupyter', label: 'Jupyter Lab', icon: Code2, tag: 'Notebook' },
    { id: 'playground', label: 'Playground', icon: Terminal },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'roadmap', label: 'Roadmap', icon: GitFork },
    { id: 'quiz', label: 'Challenges', icon: CheckCircle2 },
  ];

  const toolsNav: { id: ViewMode; label: string; icon: any; tag?: string }[] = [
    { id: 'syntax', label: 'Syntax Library', icon: BookOpen, tag: 'NEW' },
    { id: 'certificate', label: 'Certificates', icon: Award, tag: 'PDF/PNG' },
    { id: 'experiments', label: 'Break The Model', icon: Sliders },
    { id: 'tutor', label: 'Ask Forge (AI)', icon: MessageSquareCode, tag: 'Socratic' },
    { id: 'math', label: 'Math Visualizer', icon: Binary },
    { id: 'datasets', label: 'Dataset Explorer', icon: Database },
    { id: 'glossary', label: 'ML Glossary', icon: BookMarked },
    { id: 'interview', label: 'Interview Prep', icon: Sparkles, tag: '300+ Qs' },
    { id: 'admin', label: 'Security & RBAC', icon: ShieldCheck, tag: role.toUpperCase() },
    { id: 'profile', label: 'Learner Profile', icon: User, tag: 'Usable' },
  ];

  const userProfile = getStoredProfile();
  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || userProfile.name;
  const displayTitle = user ? (profile?.tier || 'Researcher') : 'Guest Explorer';

  const renderNavList = (onItemClick?: () => void) => (
    <>
      {/* Search trigger */}
      {onOpenSearch && (
        <div className="px-4 pt-3 pb-1 flex-shrink-0">
          <button
            id="sidebar_search_btn"
            onClick={() => {
              if (onItemClick) onItemClick();
              onOpenSearch();
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded bg-white hover:bg-stone-50 border border-[#E5E2D9] hover:border-[#111111] text-stone-500 hover:text-[#111111] transition-colors text-xs cursor-pointer shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-[11px] font-mono tracking-tight">Search concepts...</span>
            </span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F7F5EF] text-stone-500 border border-[#E5E2D9]">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation Section: CORE */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        <div>
          <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-stone-400 font-semibold">
            Curriculum & Labs
          </div>
          <div className="space-y-0.5">
            {coreNav.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav_item_${item.id}`}
                  onClick={() => {
                    onSelectView(item.id);
                    if (onItemClick) onItemClick();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                    isActive 
                      ? 'bg-white text-[#111111] font-bold border border-[#E5E2D9] shadow-xs' 
                      : 'text-stone-600 hover:text-[#111111] hover:bg-stone-100/60 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#1A42D9]' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.tag && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                      isActive
                        ? 'bg-[#1A42D9]/10 text-[#1A42D9] font-bold'
                        : 'bg-stone-200/60 text-stone-600'
                    }`}>
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-stone-400 font-semibold">
            Experiments & Tools
          </div>
          <div className="space-y-0.5">
            {toolsNav.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav_item_${item.id}`}
                  onClick={() => {
                    onSelectView(item.id);
                    if (onItemClick) onItemClick();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                    isActive 
                      ? 'bg-white text-[#111111] font-bold border border-[#E5E2D9] shadow-xs' 
                      : 'text-stone-600 hover:text-[#111111] hover:bg-stone-100/60 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#1A42D9]' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.tag && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                      isActive
                        ? 'bg-[#1A42D9]/10 text-[#1A42D9] font-bold'
                        : 'bg-stone-200/60 text-stone-600'
                    }`}>
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Learner Profile Card in Sidebar - FULLY VISIBLE & PADDED */}
      <div className="p-3 border-t border-[#E5E2D9] bg-white space-y-2 flex-shrink-0">
        <div 
          id="user_status_card"
          onClick={() => {
            if (onOpenProfile) onOpenProfile();
            else onSelectView('profile');
            if (onItemClick) onItemClick();
          }}
          className="cursor-pointer group select-none"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-md bg-[#FAF8F2] border border-[#E5E2D9] flex items-center justify-center text-sm shadow-2xs flex-shrink-0">
                {user ? '🔬' : userProfile.avatar}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#111111] group-hover:text-[#1A42D9] transition-colors truncate max-w-[120px]">
                  {displayName}
                </p>
                <p className="text-[10px] text-stone-400 font-mono truncate max-w-[120px]">{displayTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-amber-600 text-xs font-mono font-bold flex-shrink-0">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>{currentStreak}d</span>
            </div>
          </div>

          {/* Level progress bar */}
          <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <div 
              className="h-full bg-[#1A42D9] transition-all duration-500" 
              style={{ width: `${Math.min(100, (currentXP % 6000) / 60)}%` }} 
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-stone-500 font-mono">
              {currentXP.toLocaleString()} XP
            </span>
            <span className="text-[10px] text-[#111111] font-mono font-semibold">
              {currentLevel}
            </span>
          </div>
        </div>

        {/* Auth & Role Status */}
        <div className="p-2 bg-[#FAF8F2] border border-[#E5E2D9] rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
              role === 'admin' ? 'bg-amber-500' : role === 'researcher' ? 'bg-[#1A42D9]' : 'bg-emerald-500'
            }`} />
            <div className="truncate text-left">
              <div className="text-[10px] font-mono font-bold text-stone-800 uppercase tracking-wider truncate">
                {role} Role
              </div>
              <div className="text-[9px] font-mono text-stone-500 truncate max-w-[110px]">
                {user ? (user.email || 'Authenticated') : 'Guest Session'}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              openAuthModal('login');
              if (onItemClick) onItemClick();
            }}
            className="text-[10px] font-mono text-[#1A42D9] hover:underline font-bold px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors flex-shrink-0 cursor-pointer"
            title="Change Account or Test Roles"
          >
            Auth ⚙
          </button>
        </div>

        {/* Quick Restart Tutorial Button in Sidebar */}
        {onRestartTutorial && (
          <button
            onClick={() => {
              onRestartTutorial();
              if (onItemClick) onItemClick();
            }}
            className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 hover:bg-[#111111] hover:text-white border border-[#E5E2D9] text-[11px] font-mono text-stone-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>↺ Restart Tutorial</span>
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Editorial Sidebar - pinned neatly inside view container */}
      <aside 
        id="desktop_sidebar"
        className="hidden lg:flex flex-col w-64 border-r border-[#E5E2D9] bg-[#FAF8F2] h-full flex-shrink-0 z-30 select-none"
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#E5E2D9] flex items-center justify-between flex-shrink-0">
          <button 
            id="brand_logo_btn"
            onClick={() => onSelectView('landing')} 
            className="flex items-center gap-2.5 text-left group transition-all cursor-pointer"
          >
            <div className="w-5 h-5 bg-[#111111] rounded-none flex items-center justify-center text-white font-mono text-[10px] font-bold">
              N
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight uppercase text-[#111111] group-hover:text-[#1A42D9] transition-colors">
                NEURAFORGE
              </span>
              <span className="text-[9px] block text-stone-400 font-mono tracking-widest uppercase">LABORATORY</span>
            </div>
          </button>
        </div>

        {renderNavList()}
      </aside>

      {/* Mobile & Tablet Slide-over Navigation Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer Sidebar */}
          <aside className="relative flex flex-col w-72 max-w-[85vw] bg-[#FAF8F2] h-full border-r border-[#E5E2D9] z-10 shadow-2xl pb-10">
            <div className="p-4 border-b border-[#E5E2D9] flex items-center justify-between flex-shrink-0">
              <button 
                onClick={() => {
                  onSelectView('landing');
                  if (onCloseMobile) onCloseMobile();
                }} 
                className="flex items-center gap-2.5 text-left group transition-all"
              >
                <div className="w-5 h-5 bg-[#111111] rounded-none flex items-center justify-center text-white font-mono text-[10px] font-bold">
                  N
                </div>
                <div>
                  <span className="text-sm font-extrabold tracking-tight uppercase text-[#111111]">
                    NEURAFORGE
                  </span>
                  <span className="text-[9px] block text-stone-400 font-mono tracking-widest uppercase">LABORATORY</span>
                </div>
              </button>
              <button 
                onClick={onCloseMobile}
                className="p-1.5 text-stone-500 hover:text-[#111111] rounded-md hover:bg-stone-200/60 transition-colors"
                title="Close Navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {renderNavList(onCloseMobile)}
          </aside>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav 
        id="mobile_bottom_nav"
        className="lg:hidden fixed bottom-7 left-0 right-0 z-30 bg-[#FAF8F2]/95 backdrop-blur-md border-t border-[#E5E2D9] px-2 py-1.5 flex items-center justify-around select-none"
      >
        <button
          onClick={() => onSelectView('landing')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium cursor-pointer ${
            currentView === 'landing' ? 'text-[#1A42D9] font-bold' : 'text-stone-500'
          }`}
        >
          <span>Home</span>
        </button>

        <button
          onClick={() => onSelectView('dashboard')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium cursor-pointer ${
            currentView === 'dashboard' ? 'text-[#1A42D9] font-bold' : 'text-stone-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => onSelectView('course')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium cursor-pointer ${
            currentView === 'course' ? 'text-[#1A42D9] font-bold' : 'text-stone-500'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Learn</span>
        </button>

        <button
          onClick={() => onSelectView('lab')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium cursor-pointer ${
            currentView === 'lab' ? 'text-[#1A42D9] font-bold' : 'text-stone-500'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>ML Lab</span>
        </button>

        <button
          onClick={() => onSelectView('playground')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium cursor-pointer ${
            currentView === 'playground' ? 'text-[#1A42D9] font-bold' : 'text-stone-500'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Code</span>
        </button>

        <button
          onClick={() => {
            if (onToggleMobile) onToggleMobile();
          }}
          className="flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium text-stone-500 hover:text-[#1A42D9] cursor-pointer"
        >
          <Menu className="w-4 h-4" />
          <span>Menu</span>
        </button>
      </nav>
    </>
  );
};

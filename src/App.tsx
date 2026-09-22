import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ViewMode, UserProgress } from './types';
import { 
  getStoredProgress,
  checkAndUpdateDailyStreak,
  saveUserProgress,
  awardXP, 
  markLessonComplete, 
  DEFAULT_PROGRESS,
  subscribeToProgressUpdates
} from './services/storageService';
import { Sidebar } from './components/navigation/Sidebar';
import { TopBar } from './components/navigation/TopBar';
import { LandingPage } from './components/landing/LandingPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Dynamic lazy-loaded views for zero-cost initial landing bundle and reduced TBT
const Dashboard = lazy(() => import('./components/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const VisualMLLab = lazy(() => import('./components/lab/VisualMLLab').then(m => ({ default: m.VisualMLLab })));
const PandasLab = lazy(() => import('./components/pandas/PandasLab').then(m => ({ default: m.PandasLab })));
const JupyterLab = lazy(() => import('./components/jupyter/JupyterLab').then(m => ({ default: m.JupyterLab })));
const CodePlayground = lazy(() => import('./components/playground/CodePlayground').then(m => ({ default: m.CodePlayground })));
const CourseViewer = lazy(() => import('./components/course/CourseViewer').then(m => ({ default: m.CourseViewer })));
const ForgeAITutor = lazy(() => import('./components/tutor/ForgeAITutor').then(m => ({ default: m.ForgeAITutor })));
const MathVisualizer = lazy(() => import('./components/math/MathVisualizer').then(m => ({ default: m.MathVisualizer })));
const DatasetExplorer = lazy(() => import('./components/datasets/DatasetExplorer').then(m => ({ default: m.DatasetExplorer })));
const InterviewSimulator = lazy(() => import('./components/interview/InterviewSimulator').then(m => ({ default: m.InterviewSimulator })));
const ProjectArena = lazy(() => import('./components/projects/ProjectArena').then(m => ({ default: m.ProjectArena })));
const RoadmapView = lazy(() => import('./components/roadmap/RoadmapView').then(m => ({ default: m.RoadmapView })));
const ExperimentMode = lazy(() => import('./components/experiments/ExperimentMode').then(m => ({ default: m.ExperimentMode })));
const GlossaryView = lazy(() => import('./components/glossary/GlossaryView').then(m => ({ default: m.GlossaryView })));
const QuizCenter = lazy(() => import('./components/quiz/QuizCenter').then(m => ({ default: m.QuizCenter })));
const SyntaxLibraryView = lazy(() => import('./components/syntax/SyntaxLibraryView').then(m => ({ default: m.SyntaxLibraryView })));
const UserProfilePage = lazy(() => import('./components/profile/UserProfilePage').then(m => ({ default: m.UserProfilePage })));
const AdminAuthorizationPanel = lazy(() => import('./components/admin/AdminAuthorizationPanel').then(m => ({ default: m.AdminAuthorizationPanel })));
const CertificateView = lazy(() => import('./components/certificate/CertificateView').then(m => ({ default: m.CertificateView })));

// Lazy-loaded auxiliary dialogs and modals
const CommandPalette = lazy(() => import('./components/navigation/CommandPalette').then(m => ({ default: m.CommandPalette })));
const UserProfileModal = lazy(() => import('./components/profile/UserProfileModal').then(m => ({ default: m.UserProfileModal })));
const TutorialTour = lazy(() => import('./components/tutorial/TutorialTour').then(m => ({ default: m.TutorialTour })));
const AuthModal = lazy(() => import('./components/auth/AuthModal').then(m => ({ default: m.AuthModal })));

const ViewLoader: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-stone-600 font-mono text-xs gap-3">
    <div className="w-6 h-6 border-2 border-[#1A42D9] border-t-transparent rounded-full animate-spin" />
    <span className="text-stone-600 font-medium">Loading workspace module...</span>
  </div>
);

const AppContent: React.FC = () => {
  const { syncStats } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('verify') || params.get('certificateId')) {
        return 'certificate';
      }
    }
    return 'landing';
  });
  const [userProgress, setUserProgress] = useState<UserProgress>(() => getStoredProgress());
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('neuraforge_sidebar_collapsed') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('neuraforge_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Daily streak validation and stats sync on mount
  useEffect(() => {
    const fresh = checkAndUpdateDailyStreak();
    setUserProgress(fresh);
    if (syncStats) {
      syncStats(fresh.xp, fresh.streakDays);
    }
  }, []);

  // Subscribe to background progress updates (e.g. remote Firebase cloud sync)
  useEffect(() => {
    const unsubscribe = subscribeToProgressUpdates((latest) => {
      setUserProgress(prev => {
        if (
          prev.xp !== latest.xp ||
          prev.streakDays !== latest.streakDays ||
          prev.completedLessons.length !== latest.completedLessons.length ||
          prev.completedQuizzes.length !== latest.completedQuizzes.length ||
          (prev.completedCodingChallenges?.length || 0) !== (latest.completedCodingChallenges?.length || 0) ||
          (prev.completedDebuggingChallenges?.length || 0) !== (latest.completedDebuggingChallenges?.length || 0) ||
          prev.certificateClaimed !== latest.certificateClaimed
        ) {
          return latest;
        }
        return prev;
      });
      if (syncStats) {
        syncStats(latest.xp, latest.streakDays);
      }
    });
    return () => unsubscribe();
  }, []);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K for Search, Cmd+B / Ctrl+B for Sidebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpdateXP = (amount: number) => {
    const updated = awardXP(amount);
    setUserProgress({ ...updated });
    if (syncStats) {
      syncStats(updated.xp, updated.streakDays);
    }
  };

  const handleCompleteLesson = (lessonId: string) => {
    const updated = markLessonComplete(lessonId);
    setUserProgress({ ...updated });
    if (syncStats) {
      syncStats(updated.xp, updated.streakDays);
    }
  };

  return (
    <div id="neuraforge_app_root" className="min-h-screen bg-[#F7F5EF] text-[#111111] flex flex-col font-sans selection:bg-[#1A42D9]/15 selection:text-[#1A42D9]">
      {/* If Landing view, render full-bleed Landing Page with easy jump into the OS */}
      {currentView === 'landing' ? (
        <LandingPage 
          onSelectView={setCurrentView}
          onEnterPlatform={targetView => setCurrentView(targetView || 'dashboard')} 
        />
      ) : (
        <div className="flex h-[calc(100vh-1.75rem)] overflow-hidden">
          {/* Main Navigation Sidebar */}
          <Sidebar
            currentView={currentView}
            onSelectView={(view) => {
              setCurrentView(view);
              setIsMobileMenuOpen(false);
            }}
            userProgress={userProgress}
            onOpenSearch={() => setCommandPaletteOpen(true)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
            streakCount={userProgress.streakDays}
            onOpenProfile={() => setIsProfileOpen(true)}
            onRestartTutorial={() => setIsTourOpen(true)}
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            onToggleMobile={() => setIsMobileMenuOpen(prev => !prev)}
          />

          {/* Core Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F7F5EF]">
            {/* Global TopBar */}
            <TopBar
              currentView={currentView}
              userProgress={userProgress}
              onSelectView={setCurrentView}
              onOpenSearch={() => setCommandPaletteOpen(true)}
              onReturnToLanding={() => setCurrentView('landing')}
              onDailyChallengeClick={() => setCurrentView('dashboard')}
              onOpenProfile={() => setIsProfileOpen(true)}
              onRestartTutorial={() => setIsTourOpen(true)}
              onToggleMobile={() => setIsMobileMenuOpen(prev => !prev)}
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={handleToggleSidebar}
            />

            {/* View Port Router */}
            <main className="flex-1 overflow-y-auto bg-[#F7F5EF] pb-10">
              <Suspense fallback={<ViewLoader />}>
                {currentView === 'dashboard' && (
                  <Dashboard
                    userProgress={userProgress}
                    onSelectView={setCurrentView}
                    onContinueLearning={() => setCurrentView('course')}
                    onUpdateXP={handleUpdateXP}
                  />
                )}

                {currentView === 'lab' && (
                  <VisualMLLab />
                )}

                {currentView === 'pandas_lab' && (
                  <PandasLab />
                )}

                {currentView === 'jupyter' && (
                  <JupyterLab 
                    onUpdateXP={handleUpdateXP}
                    userProgress={userProgress}
                    onSelectView={setCurrentView}
                  />
                )}

                {currentView === 'certificate' && (
                  <CertificateView
                    userProgress={userProgress}
                    onSelectView={setCurrentView}
                    onUpdateXP={handleUpdateXP}
                    onProgressUpdate={(updated) => {
                      setUserProgress({ ...updated });
                      if (syncStats) {
                        syncStats(updated.xp, updated.streakDays);
                      }
                    }}
                  />
                )}

                {currentView === 'playground' && (
                  <CodePlayground onUpdateXP={handleUpdateXP} onSelectView={setCurrentView} />
                )}

                {currentView === 'course' && (
                  <CourseViewer
                    userProgress={userProgress}
                    onUpdateXP={handleUpdateXP}
                    onCompleteLesson={handleCompleteLesson}
                  />
                )}

                {currentView === 'tutor' && (
                  <ForgeAITutor />
                )}

                {currentView === 'math' && (
                  <MathVisualizer />
                )}

                {currentView === 'datasets' && (
                  <DatasetExplorer />
                )}

                {currentView === 'interview' && (
                  <InterviewSimulator onUpdateXP={handleUpdateXP} />
                )}

                {currentView === 'projects' && (
                  <ProjectArena />
                )}

                {currentView === 'roadmap' && (
                  <RoadmapView onSelectView={setCurrentView} />
                )}

                {currentView === 'experiments' && (
                  <ExperimentMode />
                )}

                {currentView === 'glossary' && (
                  <GlossaryView />
                )}

                {currentView === 'syntax' && (
                  <SyntaxLibraryView onSelectView={setCurrentView} />
                )}

                {currentView === 'quiz' && (
                  <QuizCenter onUpdateXP={handleUpdateXP} onSelectView={setCurrentView} />
                )}

                {currentView === 'profile' && (
                  <UserProfilePage
                    userProgress={userProgress}
                    onSelectView={setCurrentView}
                    onRestartTutorial={() => setIsTourOpen(true)}
                    onResetProgress={() => {
                      const fresh: UserProgress = {
                        ...DEFAULT_PROGRESS,
                        xp: 0,
                        streakDays: 1,
                        completedLessons: [],
                        level: 'ML Explorer'
                      };
                      saveUserProgress(fresh);
                      setUserProgress(fresh);
                    }}
                  />
                )}

                {currentView === 'admin' && (
                  <AdminAuthorizationPanel />
                )}
              </Suspense>
            </main>
          </div>
        </div>
      )}

      {/* Editorial Bottom Status Bar - Responsive across Mobile, Tablet, Laptop, PC */}
      {currentView !== 'landing' && (
        <footer 
          id="editorial_status_bar"
          className="fixed bottom-0 left-0 right-0 min-h-7 bg-white border-t-[2px] border-[#111111] flex flex-wrap items-center px-3 sm:px-4 py-1 sm:py-0 justify-between z-40 select-none text-[9px] sm:text-[10px] text-stone-700 font-mono shadow-[0_-2px_0px_0px_rgba(17,17,17,0.08)]"
        >
          {/* Left section: Engine sync & Kernel info */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-none bg-[#1A42D9] border border-[#111111]" />
              <span className="uppercase tracking-wider text-[#111111] font-bold">
                ENGINE SYNCED
              </span>
            </div>
            <div className="h-3 w-px bg-[#111111] hidden xs:block" />
            <span className="hidden sm:inline text-stone-600">
              Interactive Kernel: Pyodide v0.24 • Scikit-Learn
            </span>
            <span className="sm:hidden text-stone-500 truncate max-w-[120px]">
              Pyodide Kernel
            </span>
          </div>

          {/* Right section: Responsive device indicators & runtime info */}
          <div className="flex items-center gap-2 sm:gap-4 font-bold">
            <button 
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#FAF8F2] border border-[#111111] hover:bg-[#111111] hover:text-white transition-colors cursor-pointer"
            >
              <span>⌘K PALETTE</span>
            </button>
            <span className="hidden lg:inline text-stone-500 font-normal">
              NeuraForge Runtime 2.4
            </span>
            <span className="text-[#111111] uppercase tracking-wider">
              <span className="hidden sm:inline">UNDERSTAND THE MACHINE</span>
              <span className="sm:hidden">NEURAFORGE</span>
            </span>
          </div>
        </footer>
      )}

      {/* Lazy-loaded Dialogs & Modals inside Suspense */}
      <Suspense fallback={null}>
        {/* Global Command Palette (⌘K) */}
        {commandPaletteOpen && (
          <CommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
            onSelectView={view => {
              setCurrentView(view);
              setCommandPaletteOpen(false);
            }}
          />
        )}

        {/* User Profile Modal */}
        {isProfileOpen && (
          <UserProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            userProgress={userProgress}
            onOpenFullProfile={() => {
              setIsProfileOpen(false);
              setCurrentView('profile');
            }}
            onRestartTutorial={() => {
              setIsProfileOpen(false);
              setIsTourOpen(true);
            }}
            onResetProgress={() => {
              const fresh: UserProgress = {
                ...DEFAULT_PROGRESS,
                xp: 0,
                streakDays: 0,
                completedLessons: [],
                level: 'ML Explorer'
              };
              saveUserProgress(fresh);
              setUserProgress(fresh);
            }}
          />
        )}

        {/* Interactive Tutorial Tour */}
        {isTourOpen && (
          <TutorialTour
            isOpen={isTourOpen}
            onClose={() => setIsTourOpen(false)}
            onNavigateView={view => setCurrentView(view)}
          />
        )}

        {/* Firebase Authentication & Role Selection Modal */}
        <AuthModal />
      </Suspense>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

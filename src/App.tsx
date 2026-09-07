import React, { useState, useEffect } from 'react';
import { ViewMode, UserProgress } from './types';
import { loadUserProgress, saveUserProgress, awardXP, markLessonComplete, DEFAULT_PROGRESS } from './services/storageService';
import { Sidebar } from './components/navigation/Sidebar';
import { TopBar } from './components/navigation/TopBar';
import { CommandPalette } from './components/navigation/CommandPalette';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { TutorialTour } from './components/tutorial/TutorialTour';

// Views
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { VisualMLLab } from './components/lab/VisualMLLab';
import { PandasLab } from './components/pandas/PandasLab';
import { JupyterLab } from './components/jupyter/JupyterLab';
import { CodePlayground } from './components/playground/CodePlayground';
import { CourseViewer } from './components/course/CourseViewer';
import { ForgeAITutor } from './components/tutor/ForgeAITutor';
import { MathVisualizer } from './components/math/MathVisualizer';
import { DatasetExplorer } from './components/datasets/DatasetExplorer';
import { InterviewSimulator } from './components/interview/InterviewSimulator';
import { ProjectArena } from './components/projects/ProjectArena';
import { RoadmapView } from './components/roadmap/RoadmapView';
import { ExperimentMode } from './components/experiments/ExperimentMode';
import { GlossaryView } from './components/glossary/GlossaryView';
import { QuizCenter } from './components/quiz/QuizCenter';
import { SyntaxLibraryView } from './components/syntax/SyntaxLibraryView';
import { UserProfilePage } from './components/profile/UserProfilePage';
import { AdminAuthorizationPanel } from './components/admin/AdminAuthorizationPanel';
import { CertificateView } from './components/certificate/CertificateView';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthModal } from './components/auth/AuthModal';

const AppContent: React.FC = () => {
  const { syncStats } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [userProgress, setUserProgress] = useState<UserProgress>(loadUserProgress());
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync progress to localStorage
  useEffect(() => {
    saveUserProgress(userProgress);
  }, [userProgress]);

  // Daily streak validation and sync on initial load
  useEffect(() => {
    const fresh = loadUserProgress();
    setUserProgress(fresh);
    if (syncStats) {
      syncStats(fresh.xp, fresh.streakDays);
    }
  }, []);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
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
            onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
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
            />

            {/* View Port Router */}
            <main className="flex-1 overflow-y-auto bg-[#F7F5EF] pb-10">
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

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectView={view => {
          setCurrentView(view);
          setCommandPaletteOpen(false);
        }}
      />

      {/* User Profile Modal */}
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

      {/* Interactive Tutorial Tour */}
      <TutorialTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateView={view => setCurrentView(view)}
      />

      {/* Firebase Authentication & Role Selection Modal */}
      <AuthModal />
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

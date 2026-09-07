import React, { useState, useEffect } from 'react';
import { 
  User, 
  Award, 
  Flame, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Download, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Binary, 
  ExternalLink, 
  Edit3, 
  Save, 
  RotateCcw, 
  Clock, 
  Target, 
  Check, 
  Share2, 
  Calendar, 
  BarChart3, 
  BookMarked,
  ArrowRight,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { UserProgress, UserProfile, ViewMode } from '../../types';
import { getStoredProfile, saveStoredProfile } from '../../services/storageService';
import { COURSE_MODULES } from '../../data/courseData';
import confetti from 'canvas-confetti';

interface UserProfilePageProps {
  userProgress: UserProgress;
  onSelectView: (view: ViewMode) => void;
  onResetProgress?: () => void;
  onRestartTutorial?: () => void;
}

const AVATAR_OPTIONS = ['🧠', '⚡', '🔬', '📐', '🚀', '🤖', '🎯', '🔮'];

const ROLE_OPTIONS = [
  'Machine Learning Engineer',
  'Data Scientist',
  'AI Research Scientist',
  'Quantitative Strategist',
  'MLOps Engineer',
  'Deep Learning Specialist'
];

const EXPERIENCE_TIERS = [
  'Beginner',
  'Practitioner',
  'Advanced Researcher',
  'Principal Architect'
];

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  userProgress,
  onSelectView,
  onResetProgress,
  onRestartTutorial
}) => {
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [savedAlert, setSavedAlert] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'curriculum' | 'credential' | 'settings'>('overview');
  const [confirmReset, setConfirmReset] = useState(false);

  // Form states
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [email, setEmail] = useState(profile.email);
  const [title, setTitle] = useState(profile.title);
  const [organization, setOrganization] = useState(profile.organization);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [targetRole, setTargetRole] = useState(profile.targetRole);
  const [experienceTier, setExperienceTier] = useState(profile.experienceTier);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(profile.weeklyGoalHours);
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl || '');

  // Calculate total lessons across all modules
  const allModules = COURSE_MODULES;
  const totalLessonsCount = allModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessonsCount = userProgress.completedLessons.length;
  const overallProgressPercent = Math.min(100, Math.round((completedLessonsCount / totalLessonsCount) * 100));

  // Module breakdown stats
  const moduleStats = allModules.map(module => {
    const completedInModule = module.lessons.filter(l => userProgress.completedLessons.includes(l.id)).length;
    const totalInModule = module.lessons.length;
    const pct = Math.round((completedInModule / totalInModule) * 100);
    return {
      id: module.id,
      title: module.title,
      track: module.track,
      completed: completedInModule,
      total: totalInModule,
      percent: pct,
      lessons: module.lessons
    };
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name,
      handle,
      email,
      title,
      organization,
      bio,
      avatar,
      targetRole,
      experienceTier: experienceTier as any,
      weeklyGoalHours: Number(weeklyGoalHours),
      githubUrl,
      linkedinUrl
    };
    saveStoredProfile(updated);
    setProfile(updated);
    setIsEditing(false);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
    try {
      confetti({ particleCount: 35, spread: 60 });
    } catch (err) {}
  };

  const handleExportTranscript = () => {
    const data = {
      profile: {
        name: profile.name,
        handle: profile.handle,
        email: profile.email,
        title: profile.title,
        organization: profile.organization,
        targetRole: profile.targetRole,
        experienceTier: profile.experienceTier
      },
      learningStats: {
        totalXp: userProgress.xp,
        level: userProgress.level,
        streakDays: userProgress.streakDays,
        learningHours: userProgress.learningHours,
        quizAccuracy: `${userProgress.quizAccuracy}%`,
        completedLessonsCount,
        totalLessonsCount,
        overallCompletionRate: `${overallProgressPercent}%`,
        completedLessonIds: userProgress.completedLessons
      },
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuraforge_profile_transcript_${profile.handle.replace('@', '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const badges = [
    {
      id: 'b1',
      title: 'Vector Virtuoso',
      track: 'NumPy Foundations',
      icon: Binary,
      earned: userProgress.completedLessons.some(l => l.startsWith('numpy')),
      description: 'Mastered SIMD strides, broadcasting rules, and zero-copy slicing.'
    },
    {
      id: 'b2',
      title: 'Data Wrangler',
      track: 'Pandas Wrangling',
      icon: Layers,
      earned: userProgress.completedLessons.some(l => l.startsWith('pandas')),
      description: 'Engineered clean features using GroupBy, imputation, and time-series.'
    },
    {
      id: 'b3',
      title: 'Algorithm Architect',
      track: 'Core ML Algorithms',
      icon: Cpu,
      earned: userProgress.completedLessons.some(l => l.startsWith('ml_algo')),
      description: 'Implemented first-principles OLS, SVM kernels, Trees, and MLPs.'
    },
    {
      id: 'b4',
      title: 'Pipeline Master',
      track: 'Scikit-Learn Mastery',
      icon: Sliders,
      earned: userProgress.completedLessons.some(l => l.startsWith('sklearn')),
      description: 'Built atomic ColumnTransformer pipelines with zero data leakage.'
    },
    {
      id: 'b5',
      title: 'First Convergence',
      track: 'ML Scientific Lab',
      icon: Sparkles,
      earned: userProgress.xp >= 1000,
      description: 'Minimally adjusted gradient loss surface on the instrument console.'
    },
    {
      id: 'b6',
      title: 'Socratic Scholar',
      track: 'Forge AI',
      icon: ShieldCheck,
      earned: true,
      description: 'Engaged Forge AI to dissect algorithmic loss boundaries.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-[#E5E2D9] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#1A42D9]/5 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        {savedAlert && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile successfully synchronized and persisted to local memory.</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#FAF8F2] border-2 border-[#E5E2D9] flex items-center justify-center text-4xl sm:text-5xl shadow-inner select-none">
                {profile.avatar}
              </div>
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#1A42D9] text-white text-[10px] font-mono font-bold">
                PRO
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#111111]">
                  {profile.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono text-xs">
                  {profile.handle}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#1A42D9] font-mono text-xs font-bold">
                  {userProgress.level}
                </span>
              </div>

              <p className="text-sm font-medium text-stone-700 flex items-center gap-2">
                <span>{profile.title}</span>
                <span className="text-stone-300">•</span>
                <span className="text-stone-500">{profile.organization}</span>
              </p>

              <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
                {profile.bio}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-stone-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#1A42D9]" />
                  <span>Target: <strong>{profile.targetRole}</strong></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Fellow since {profile.joinedDate}</span>
                </span>
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#1A42D9] hover:underline">
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2.5 items-end justify-start">
            <button
              onClick={() => setIsEditing(prev => !prev)}
              className="px-4 py-2 rounded-xl bg-[#111111] text-white hover:bg-stone-800 text-xs font-mono font-bold flex items-center gap-2 transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Close Editor' : 'Edit Profile'}</span>
            </button>

            <button
              onClick={handleExportTranscript}
              className="px-4 py-2 rounded-xl bg-white border border-[#E5E2D9] hover:bg-stone-50 text-stone-700 text-xs font-mono font-medium flex items-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Export Record</span>
            </button>
          </div>
        </div>

        {/* Quick metrics bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[#E5E2D9]">
          <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#E5E2D9]">
            <div className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">Total XP</div>
            <div className="text-xl font-bold font-mono text-[#111111] mt-0.5">
              {userProgress.xp.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#E5E2D9]">
            <div className="text-[11px] font-mono text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Active Streak</span>
            </div>
            <div className="text-xl font-bold font-mono text-amber-700 mt-0.5">
              {userProgress.streakDays} Days
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#E5E2D9]">
            <div className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">Lessons Finished</div>
            <div className="text-xl font-bold font-mono text-[#1A42D9] mt-0.5">
              {completedLessonsCount} / {totalLessonsCount}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#E5E2D9]">
            <div className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">Weekly Commitment</div>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
              {profile.weeklyGoalHours}h / week
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form Drawer */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="bg-white border-2 border-[#1A42D9]/40 rounded-2xl p-6 sm:p-8 shadow-md space-y-6 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-4">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#1A42D9]" />
              <h2 className="text-lg font-bold font-serif text-[#111111]">Update Professional Profile</h2>
            </div>
            <span className="text-xs font-mono text-stone-400">All fields save locally</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-stone-700 mb-2">Choose Avatar Emblem</label>
              <div className="flex flex-wrap gap-2.5">
                {AVATAR_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAvatar(opt)}
                    className={`w-11 h-11 rounded-xl text-2xl flex items-center justify-center transition-all ${
                      avatar === opt
                        ? 'bg-[#1A42D9] text-white scale-110 shadow-sm'
                        : 'bg-[#FAF8F2] hover:bg-stone-100 border border-[#E5E2D9]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] text-sm focus:outline-hidden focus:border-[#1A42D9] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1">Handle / Username</label>
                <input
                  type="text"
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] text-sm focus:outline-hidden focus:border-[#1A42D9] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1">Professional Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] text-sm focus:outline-hidden focus:border-[#1A42D9]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1">Organization / Lab</label>
                <input
                  type="text"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] text-sm focus:outline-hidden focus:border-[#1A42D9]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1">Target Engineering Role</label>
                <select
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] text-sm bg-white focus:outline-hidden focus:border-[#1A42D9]"
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1">Experience Tier</label>
                <select
                  value={experienceTier}
                  onChange={e => setExperienceTier(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] text-sm bg-white focus:outline-hidden focus:border-[#1A42D9]"
                >
                  {EXPERIENCE_TIERS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1">Weekly Target Hours</label>
                <input
                  type="number"
                  min="2"
                  max="60"
                  value={weeklyGoalHours}
                  onChange={e => setWeeklyGoalHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] text-sm focus:outline-hidden focus:border-[#1A42D9] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-stone-700 mb-1">Bio / Research Focus</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] text-sm focus:outline-hidden focus:border-[#1A42D9] leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1">GitHub Profile URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] text-sm focus:outline-hidden focus:border-[#1A42D9] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={e => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] text-sm focus:outline-hidden focus:border-[#1A42D9] font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E2D9]">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl border border-[#E5E2D9] text-stone-600 hover:bg-stone-50 text-xs font-mono font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#1A42D9] hover:bg-blue-700 text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Persist Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E5E2D9] gap-2 overflow-x-auto select-none">
        {[
          { id: 'overview', label: 'Curriculum & Progress', icon: BookOpen },
          { id: 'curriculum', label: 'All 4 Pillars Breakdown', icon: BarChart3 },
          { id: 'credential', label: 'Official Credential Card', icon: Award },
          { id: 'settings', label: 'Study System & Data', icon: Sliders }
        ].map(tab => {
          const Icon = tab.icon;
          const active = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-mono text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? 'border-[#1A42D9] text-[#1A42D9]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Curriculum & Progress */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Overall completion banner */}
          <div className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold font-serif text-[#111111]">Overall ML Mastery Progress</h3>
                <p className="text-xs text-stone-500 font-mono mt-0.5">
                  {completedLessonsCount} of {totalLessonsCount} lessons validated across NumPy, Pandas, Scikit-Learn & ML Algorithms
                </p>
              </div>
              <span className="text-xl font-bold font-mono text-[#1A42D9]">
                {overallProgressPercent}%
              </span>
            </div>

            <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200 mt-3">
              <div
                className="h-full bg-gradient-to-r from-[#1A42D9] to-emerald-500 transition-all duration-700"
                style={{ width: `${overallProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moduleStats.map(mod => (
              <div key={mod.id} className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-stone-400 mb-1">
                    <span className="uppercase font-bold tracking-wider text-[#1A42D9]">{mod.track}</span>
                    <span>{mod.completed} / {mod.total} Done</span>
                  </div>
                  <h4 className="text-base font-bold font-serif text-[#111111]">
                    {mod.title}
                  </h4>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200 mt-3">
                    <div
                      className="h-full bg-[#1A42D9] transition-all duration-500"
                      style={{ width: `${mod.percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E5E2D9]">
                  <span className="text-xs font-mono font-bold text-stone-700">
                    {mod.percent}% Mastered
                  </span>
                  <button
                    onClick={() => onSelectView('course')}
                    className="px-3 py-1.5 rounded-lg bg-[#FAF8F2] hover:bg-stone-100 border border-[#E5E2D9] text-xs font-mono text-[#111111] flex items-center gap-1.5 transition-colors"
                  >
                    <span>Explore Track</span>
                    <ArrowRight className="w-3 h-3 text-[#1A42D9]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Badges Section */}
          <div className="bg-white border border-[#E5E2D9] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#1A42D9]" />
                <h3 className="text-sm font-bold font-serif text-[#111111]">Earned Honors & Competencies</h3>
              </div>
              <span className="text-xs font-mono text-stone-400">
                {badges.filter(b => b.earned).length} / {badges.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {badges.map(b => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.id}
                    className={`p-4 rounded-xl border transition-all ${
                      b.earned
                        ? 'bg-[#FAF8F2] border-[#E5E2D9] text-[#111111]'
                        : 'bg-stone-50/60 border-dashed border-stone-200 text-stone-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        b.earned ? 'bg-[#1A42D9] text-white' : 'bg-stone-200 text-stone-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{b.title}</div>
                        <div className="text-[10px] font-mono text-stone-500">{b.track}</div>
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-stone-600">
                      {b.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Detailed All 4 Pillars Breakdown */}
      {selectedTab === 'curriculum' && (
        <div className="space-y-6">
          {moduleStats.map(mod => (
            <div key={mod.id} className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E2D9] pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A42D9]">
                    {mod.track}
                  </span>
                  <h3 className="text-base font-bold font-serif text-[#111111]">
                    {mod.title}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-stone-800">
                    {mod.completed} / {mod.total} Lessons Completed
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {mod.lessons.map(l => {
                  const isDone = userProgress.completedLessons.includes(l.id);
                  return (
                    <div
                      key={l.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        isDone
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                          : 'bg-[#FAF8F2] border-[#E5E2D9] text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-stone-300 shrink-0" />
                        )}
                        <span className="truncate font-medium">{l.title}</span>
                      </div>
                      <button
                        onClick={() => onSelectView('course')}
                        className="text-[11px] font-mono text-[#1A42D9] hover:underline shrink-0"
                      >
                        {isDone ? 'Review' : 'Start'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Official Credential Card */}
      {selectedTab === 'credential' && (
        <div className="space-y-6">
          <div className="bg-[#111111] text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden border border-stone-800">
            {/* Background accent geometry */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#1A42D9]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-800 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white text-[#111111] rounded-xl flex items-center justify-center font-serif text-lg font-bold">
                    N
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-stone-400">
                      NEURAFORGE ACADEMIC REPOSITORY
                    </div>
                    <div className="text-sm font-bold tracking-wider">
                      VERIFIED MACHINE LEARNING CREDENTIAL
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-[10px] text-stone-400">
                  <div>REGISTRY ID: NF-{profile.id.toUpperCase()}</div>
                  <div className="text-emerald-400 font-bold">STATUS: ACCREDITED</div>
                </div>
              </div>

              {/* Recipient statement */}
              <div className="space-y-2 py-4">
                <div className="text-xs font-mono uppercase tracking-wider text-stone-400">
                  THIS CERTIFIES THAT
                </div>
                <div className="text-3xl sm:text-4xl font-serif font-bold text-white">
                  {profile.name}
                </div>
                <p className="text-xs sm:text-sm text-stone-300 font-light max-w-2xl leading-relaxed">
                  Has demonstrated verified competence in high-performance array computing, relational tabular wrangling with Pandas, mathematical machine learning derivations, and Scikit-Learn pipeline architecture.
                </p>
              </div>

              {/* Pillars verified */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-stone-800 text-xs font-mono">
                <div>
                  <div className="text-stone-400">NumPy Engine</div>
                  <div className="text-white font-bold mt-1">SIMD & Strides</div>
                </div>
                <div>
                  <div className="text-stone-400">Pandas Engine</div>
                  <div className="text-white font-bold mt-1">Tabular & Imputation</div>
                </div>
                <div>
                  <div className="text-stone-400">Core Algorithms</div>
                  <div className="text-white font-bold mt-1">13 First Principles</div>
                </div>
                <div>
                  <div className="text-stone-400">Experience Tier</div>
                  <div className="text-amber-400 font-bold mt-1">{profile.experienceTier}</div>
                </div>
              </div>

              {/* Signatures & actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-[11px] font-mono text-stone-500">
                  <span>Cryptographic Fingerprint: </span>
                  <span className="text-stone-400">0x7f8a9...b4c2e (Sha-256)</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Shareable link copied to clipboard!');
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-mono text-white flex items-center gap-2 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </button>

                  <button
                    onClick={handleExportTranscript}
                    className="px-4 py-2 rounded-xl bg-[#1A42D9] hover:bg-blue-600 text-xs font-mono font-bold text-white flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Transcript</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Study System & Data */}
      {selectedTab === 'settings' && (
        <div className="bg-white border border-[#E5E2D9] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-4">
            <div>
              <h3 className="text-base font-bold font-serif text-[#111111]">Study System Diagnostics & Data</h3>
              <p className="text-xs text-stone-500 font-mono mt-0.5">Manage learning memory and interactive tutorial states</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#FAF8F2] border border-[#E5E2D9] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold font-mono text-[#111111]">Interactive Platform Tutorial</h4>
                <p className="text-xs text-stone-500 mt-0.5">Restart the step-by-step walkthrough across the laboratory console.</p>
              </div>
              {onRestartTutorial && (
                <button
                  onClick={onRestartTutorial}
                  className="px-3.5 py-2 rounded-lg bg-white border border-[#E5E2D9] hover:bg-stone-100 text-xs font-mono font-medium text-stone-700 transition-colors"
                >
                  Restart Tour
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold font-mono text-amber-900">Download Complete Learning State</h4>
                <p className="text-xs text-amber-700 mt-0.5">Export all progress, custom weights, and transcript data as JSON.</p>
              </div>
              <button
                onClick={handleExportTranscript}
                className="px-3.5 py-2 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-xs font-mono font-bold text-amber-900 transition-colors"
              >
                Export JSON
              </button>
            </div>

            <div className="p-4 rounded-xl bg-red-50/50 border border-red-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold font-mono text-red-900">Reset All Learning Records</h4>
                <p className="text-xs text-red-700 mt-0.5">Clear completed lessons and reset XP counter to zero.</p>
              </div>
              {confirmReset ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (onResetProgress) onResetProgress();
                      setConfirmReset(false);
                      alert('Progress reset to baseline.');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs font-mono font-bold transition-colors"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-mono text-stone-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="px-3.5 py-2 rounded-lg bg-white border border-red-300 hover:bg-red-50 text-xs font-mono font-bold text-red-700 transition-colors"
                >
                  Reset Progress
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

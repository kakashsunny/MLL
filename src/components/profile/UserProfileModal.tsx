import React, { useState, useEffect } from 'react';
import { 
  User, 
  Award, 
  Flame, 
  RotateCcw, 
  BookOpen, 
  X, 
  CheckCircle2, 
  Sparkles,
  Download,
  ShieldCheck,
  Cpu,
  Layers,
  Binary,
  Edit3,
  ExternalLink,
  Target,
  Sliders,
  Check
} from 'lucide-react';
import { UserProgress, UserProfile } from '../../types';
import { getStoredProfile, saveStoredProfile } from '../../services/storageService';
import { COURSE_MODULES } from '../../data/courseData';
import confetti from 'canvas-confetti';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProgress: UserProgress;
  onRestartTutorial: () => void;
  onResetProgress?: () => void;
  onOpenFullProfile?: () => void;
}

const AVATAR_CHOICES = ['🧠', '⚡', '🔬', '📐', '🚀', '🤖', '🎯', '🔮'];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProgress,
  onRestartTutorial,
  onResetProgress,
  onOpenFullProfile
}) => {
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [savedBadge, setSavedBadge] = useState(false);

  // Form states
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [title, setTitle] = useState(profile.title);
  const [targetRole, setTargetRole] = useState(profile.targetRole);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(profile.weeklyGoalHours);
  const [avatar, setAvatar] = useState(profile.avatar);

  useEffect(() => {
    if (isOpen) {
      const p = getStoredProfile();
      setProfile(p);
      setName(p.name);
      setHandle(p.handle);
      setTitle(p.title);
      setTargetRole(p.targetRole);
      setWeeklyGoalHours(p.weeklyGoalHours);
      setAvatar(p.avatar);
      setIsEditing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allModules = COURSE_MODULES;
  const totalLessonsCount = allModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = userProgress.completedLessons.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalLessonsCount) * 100));

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
      description: 'Derived and trained first-principles regression, trees, and neural nets.'
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
      earned: userProgress.xp >= 100,
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

  const handleSaveModalProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name,
      handle,
      title,
      targetRole,
      weeklyGoalHours: Number(weeklyGoalHours),
      avatar
    };
    saveStoredProfile(updated);
    setProfile(updated);
    setIsEditing(false);
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2500);
    try {
      confetti({ particleCount: 30, spread: 50 });
    } catch (err) {}
  };

  const handleExportTranscript = () => {
    const data = {
      user: profile.name,
      handle: profile.handle,
      title: profile.title,
      targetRole: profile.targetRole,
      exportedAt: new Date().toISOString(),
      xp: userProgress.xp,
      level: userProgress.level,
      streakDays: userProgress.streakDays,
      completedLessons: userProgress.completedLessons,
      completionRate: `${progressPercent}%`
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuraforge_transcript_${profile.handle.replace('@', '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="user_profile_modal"
        className="w-full max-w-2xl bg-[#FAF8F2] border border-[#E5E2D9] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E5E2D9] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#FAF8F2] border border-[#E5E2D9] text-2xl flex items-center justify-center select-none shadow-xs">
              {profile.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#111111] tracking-tight">
                  {profile.name}
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-50 text-[#1A42D9] font-bold border border-blue-200">
                  {userProgress.level}
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  {profile.handle}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-mono">
                {profile.title} • {profile.organization}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenFullProfile && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullProfile();
                }}
                className="text-xs font-mono text-[#1A42D9] hover:underline flex items-center gap-1 mr-2"
              >
                <span>Full Page View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {savedBadge && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile updated and saved to local memory!</span>
            </div>
          )}

          {/* Edit toggle button & mini form */}
          {isEditing ? (
            <form onSubmit={handleSaveModalProfile} className="p-4 rounded-xl bg-white border border-[#1A42D9] space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-xs font-mono font-bold text-[#1A42D9]">Quick Edit Profile</span>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-stone-400 hover:text-stone-600"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-stone-600 mb-1">Avatar Emblem</label>
                <div className="flex gap-2">
                  {AVATAR_CHOICES.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvatar(a)}
                      className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center ${
                        avatar === a ? 'bg-[#1A42D9] text-white shadow-xs' : 'bg-stone-100'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-stone-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-stone-600 mb-1">Handle</label>
                  <input
                    type="text"
                    value={handle}
                    onChange={e => setHandle(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-stone-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-stone-600 mb-1">Target Role</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#1A42D9] text-white text-xs font-mono font-bold shadow-xs hover:bg-blue-700"
                >
                  Save Profile
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between bg-white border border-[#E5E2D9] p-3 rounded-xl">
              <div className="flex items-center gap-3 text-xs text-stone-600 font-mono">
                <span>Target: <strong>{profile.targetRole}</strong></span>
                <span>•</span>
                <span>Goal: <strong>{profile.weeklyGoalHours}h/wk</strong></span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-mono flex items-center gap-1.5"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Profile</span>
              </button>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-[#E5E2D9] p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center gap-2 text-stone-500 mb-1">
                <Award className="w-4 h-4 text-[#1A42D9]" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Total XP</span>
              </div>
              <div className="text-xl font-bold font-mono text-[#111111]">
                {userProgress.xp.toLocaleString()}
              </div>
            </div>

            <div className="bg-white border border-[#E5E2D9] p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center gap-2 text-stone-500 mb-1">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Day Streak</span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-700">
                {userProgress.streakDays} Days
              </div>
            </div>

            <div className="bg-white border border-[#E5E2D9] p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center gap-2 text-stone-500 mb-1">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Mastered</span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-700">
                {progressPercent}%
              </div>
            </div>
          </div>

          {/* Curriculum Breakdown */}
          <div className="bg-white border border-[#E5E2D9] rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-stone-700 uppercase">Core Curriculum Progress</span>
              <span className="text-stone-500">{completedCount} of {totalLessonsCount} Completed</span>
            </div>

            <div className="space-y-2">
              {allModules.map(mod => {
                const completedInMod = mod.lessons.filter(l => userProgress.completedLessons.includes(l.id)).length;
                const pct = Math.round((completedInMod / mod.lessons.length) * 100);
                return (
                  <div key={mod.id} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-stone-700 font-medium truncate max-w-[70%]">{mod.title}</span>
                      <span className="text-stone-500">{completedInMod}/{mod.lessons.length} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1A42D9] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badges Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
                Honors & Competencies ({badges.filter(b => b.earned).length}/{badges.length})
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {badges.map(badge => {
                const Icon = badge.icon;
                return (
                  <div 
                    key={badge.id}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between ${
                      badge.earned 
                        ? 'bg-white border-[#E5E2D9] text-[#111111]' 
                        : 'bg-stone-50 border-dashed border-stone-200 text-stone-400 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`p-1.5 rounded-md ${badge.earned ? 'bg-[#1A42D9] text-white' : 'bg-stone-200 text-stone-400'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold truncate">{badge.title}</span>
                      </div>
                      <p className="text-[10px] text-stone-500 leading-tight">
                        {badge.description}
                      </p>
                    </div>
                    {badge.earned && (
                      <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-mono font-bold mt-2">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>UNLOCKED</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#E5E2D9] bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportTranscript}
              className="px-3 py-1.5 rounded-lg border border-[#E5E2D9] hover:bg-stone-50 text-xs font-mono text-stone-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Transcript</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onRestartTutorial();
              }}
              className="px-3 py-1.5 rounded-lg border border-[#E5E2D9] hover:bg-stone-50 text-xs font-mono text-stone-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>Restart Tour</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onResetProgress && (
              confirmReset ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onResetProgress();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-2 py-1 text-xs font-mono text-stone-500"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="text-xs font-mono text-red-600 hover:underline px-2"
                >
                  Reset Progress
                </button>
              )
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#111111] text-white hover:bg-stone-800 text-xs font-mono font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

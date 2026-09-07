import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ArrowRight, 
  Play, 
  Copy, 
  Check, 
  Sliders, 
  Flame, 
  Lightbulb,
  MessageSquareCode,
  Send,
  HelpCircle,
  Eye,
  BrainCircuit,
  AlertTriangle,
  Zap,
  Code
} from 'lucide-react';
import { ALL_COURSE_MODULES } from '../../data/courseData';
import { LessonContent, UserProgress } from '../../types';
import { askAITutor } from '../../services/geminiService';
import confetti from 'canvas-confetti';

interface CourseViewerProps {
  userProgress: UserProgress;
  onUpdateXP: (amount: number) => void;
  onCompleteLesson: (lessonId: string) => void;
}

export const CourseViewer: React.FC<CourseViewerProps> = ({
  userProgress,
  onUpdateXP,
  onCompleteLesson
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>('course_ml_fundamentals');
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const currentModule = ALL_COURSE_MODULES.find(m => m.id === selectedModuleId) || ALL_COURSE_MODULES[0];
  const activeLessons = currentModule.lessons;
  const currentLesson: LessonContent = activeLessons[currentLessonIndex] || activeLessons[0];

  // Interactive slider inside lesson
  const [sliderVal, setSliderVal] = useState(0.05);
  const [copiedCode, setCopiedCode] = useState(false);

  // Break the Model interactive state
  const [brokenState, setBrokenState] = useState<string | null>(null);

  // Challenge selection state
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  // AI Tutor Side Panel State
  const [aiChat, setAiChat] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: `Greetings. I'm Forge AI, your Socratic mentor for "${currentLesson.title}". Ask me about geometric intuition, mathematical derivations, or boundary failure cases.`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleSelectModule = (modId: string) => {
    setSelectedModuleId(modId);
    setCurrentLessonIndex(0);
    setSelectedAnswer(null);
    setChallengeCompleted(false);
    setBrokenState(null);
    const mod = ALL_COURSE_MODULES.find(m => m.id === modId) || ALL_COURSE_MODULES[0];
    setAiChat([
      {
        role: 'assistant',
        text: `Track switched to "${mod.title}". Loaded: "${mod.lessons[0].title}". Where would you like to begin?`
      }
    ]);
  };

  const handleSelectLesson = (idx: number) => {
    setCurrentLessonIndex(idx);
    setSelectedAnswer(null);
    setChallengeCompleted(false);
    setBrokenState(null);
    setAiChat([
      {
        role: 'assistant',
        text: `Lesson loaded: "${activeLessons[idx].title}". Where would you like to begin exploring?`
      }
    ]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentLesson.pythonCode || currentLesson.codeSnippet || '');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAnswerChallenge = (index: number) => {
    if (challengeCompleted) return;
    setSelectedAnswer(index);
    setChallengeCompleted(true);
    const correctIdx = currentLesson.miniChallenge.correctIndex ?? currentLesson.miniChallenge.correctOption ?? 0;
    const isCorrect = index === correctIdx;
    if (isCorrect) {
      onUpdateXP(100);
      try {
        confetti({ particleCount: 40, spread: 50 });
      } catch (e) {}
    }
  };

  const handleFinishLesson = () => {
    onCompleteLesson(currentLesson.id);
    onUpdateXP(200);
    try {
      confetti({ particleCount: 70, spread: 70 });
    } catch (e) {}
    if (currentLessonIndex < activeLessons.length - 1) {
      handleSelectLesson(currentLessonIndex + 1);
    }
  };

  const sendTutorMessage = async (query: string) => {
    if (!query.trim() || isAiLoading) return;
    const userMsg = query.trim();
    setInputQuery('');
    setAiChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiLoading(true);

    try {
      const response = await askAITutor(
        userMsg,
        currentLesson.title,
        currentLesson.technicalExplanation || currentLesson.beginnerExplanation,
        'socratic'
      );
      setAiChat(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (err) {
      setAiChat(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Consider the geometry: if gradients are orthogonal to the loss contour, which directional step maximizes the reduction in residual variance?`
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div id="course_viewer_layout" className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden bg-[#F7F5EF] text-[#111111]">
      
      {/* 1. Left Sidebar: Curriculum Trajectory */}
      <div className="w-full lg:w-80 border-r-[3px] border-[#111111] bg-white flex flex-col shrink-0">
        <div className="p-4 border-b-[2px] border-[#111111] bg-[#FAF8F2]">
          <div className="text-[10px] uppercase font-mono text-stone-500 font-bold tracking-widest mb-1.5">
            Select Track
          </div>
          
          {/* Module Switcher Buttons */}
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {ALL_COURSE_MODULES.map(mod => {
              const labelMap: Record<string, string> = {
                course_ml_fundamentals: 'Core ML',
                course_numpy_foundations: 'NumPy',
                course_pandas_wrangling: 'Pandas',
                course_ml_algorithms: 'ML Algos',
                course_sklearn_mastery: 'Scikit-Learn'
              };
              const label = labelMap[mod.id] || mod.title.split(' ')[0];
              return (
                <button
                  key={mod.id}
                  onClick={() => handleSelectModule(mod.id)}
                  className={`px-2.5 py-1.5 rounded-none text-[11px] font-mono text-left transition-all border-[1.5px] border-[#111111] ${
                    selectedModuleId === mod.id
                      ? 'bg-[#111111] text-white font-bold shadow-[2px_2px_0px_0px_#111111]'
                      : 'bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="truncate font-bold">{label}</div>
                  <div className={`text-[9px] ${selectedModuleId === mod.id ? 'text-stone-300' : 'text-stone-500'}`}>
                    {mod.lessons.length} lessons
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-sm font-bold font-mono text-[#111111] tracking-tight">
            {currentModule.title}
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-stone-600 mt-1.5">
            <span>Lesson {currentLessonIndex + 1} of {activeLessons.length}</span>
            <span className="text-[#1A42D9] font-bold bg-white px-2 py-0.5 border border-[#111111]">
              {Math.round((activeLessons.filter(l => userProgress.completedLessons.includes(l.id)).length / activeLessons.length) * 100)}% Done
            </span>
          </div>
        </div>

        {/* Lesson List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {activeLessons.map((lesson, idx) => {
            const isCurrent = idx === currentLessonIndex;
            const isDone = userProgress.completedLessons.includes(lesson.id);

            return (
              <button
                key={lesson.id}
                id={`lesson_item_${lesson.id}`}
                onClick={() => handleSelectLesson(idx)}
                className={`w-full flex items-start gap-3 p-3 rounded-none text-left transition-all border-[2px] border-[#111111] ${
                  isCurrent
                    ? 'bg-[#FAF8F2] font-bold shadow-[3px_3px_0px_0px_#111111]'
                    : 'bg-white hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <span className="w-4 h-4 rounded-none border-2 border-[#1A42D9] flex items-center justify-center bg-white">
                      <span className="w-1.5 h-1.5 rounded-none bg-[#1A42D9]" />
                    </span>
                  ) : (
                    <Circle className="w-4 h-4 text-stone-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono text-stone-500 font-bold">
                    {String(idx + 1).padStart(2, '0')} • {lesson.duration || '15 min'}
                  </div>
                  <div className="text-xs font-semibold truncate text-[#111111]">
                    {lesson.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Center Lesson Flow: 7 Pedagogical Stages */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 max-w-4xl mx-auto">
        
        {/* Lesson Heading Card */}
        <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rounded-none p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-3 text-xs font-mono text-stone-500">
            <span className="px-2.5 py-1 rounded-none bg-[#FAF8F2] border-[1.5px] border-[#111111] text-[#1A42D9] font-bold shadow-[1px_1px_0px_0px_#111111]">
              STAGE {currentLessonIndex + 1}
            </span>
            <span>•</span>
            <span>{currentLesson.duration || '15 min'}</span>
            <span>•</span>
            <span className="text-amber-800 font-bold">+{currentLesson.xpReward || 150} XP</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
            {currentLesson.title}
          </h1>
          <p className="text-base text-stone-600 leading-relaxed max-w-2xl">
            {currentLesson.subtitle}
          </p>
        </div>

        {/* 1. REAL-WORLD HOOK */}
        <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rounded-none p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-stone-700 border-b-[2px] border-[#111111] pb-3">
            <span className="w-2.5 h-2.5 bg-[#1A42D9] border border-[#111111]" />
            <span>1. Real-World Hook • Why This Matters</span>
          </div>
          <p className="text-sm text-stone-800 leading-relaxed">
            {currentLesson.realWorldExample || currentLesson.oneLineIntuition}
          </p>
        </div>

        {/* 2. THE BIG INTUITION & VISUAL METAPHOR */}
        <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rounded-none p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-stone-700 border-b-[2px] border-[#111111] pb-3">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>2. The Big Intuition • Visual Metaphor</span>
          </div>
          
          <div className="p-4 rounded-none bg-[#FAF8F2] border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
            <p className="text-sm italic text-stone-900 leading-relaxed font-serif">
              "{currentLesson.oneLineIntuition}"
            </p>
          </div>

          <p className="text-sm text-stone-800 leading-relaxed">
            {currentLesson.beginnerExplanation || currentLesson.visualDescription}
          </p>
        </div>

        {/* 3. INTERACTIVE EXPERIMENT (Touch the concept) */}
        <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rounded-none p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
              <Eye className="w-4 h-4 text-[#1A42D9]" />
              <span>3. Interactive Experiment • Touch The Geometry</span>
            </div>
            <span className="text-xs font-mono font-bold text-stone-500 bg-[#FAF8F2] px-2 py-0.5 border border-[#111111]">Live SVG Canvas</span>
          </div>

          <div className="h-64 sm:h-72 w-full rounded-none bg-[#FAF8F2] border-[2px] border-[#111111] p-4 flex flex-col items-center justify-center relative select-none overflow-hidden">
            {/* Dynamic visual representation based on visualType */}
            {currentLesson.visualType === 'logistic_regression' ? (
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <line x1="10" y1="90" x2="90" y2="90" stroke="#E5E2D9" strokeWidth="1" />
                <line x1="10" y1="10" x2="10" y2="90" stroke="#E5E2D9" strokeWidth="1" />
                <line x1="10" y1="50" x2="90" y2="50" stroke="#E5E2D9" strokeDasharray="2,2" strokeWidth="0.8" />
                {/* Sigmoid Curve */}
                <path
                  d={`M 15 88 Q ${50 - sliderVal * 40} 85 50 50 T 85 12`}
                  fill="none"
                  stroke="#1A42D9"
                  strokeWidth="2.2"
                />
                {/* Decision threshold line */}
                <line x1={50 + (sliderVal - 0.25) * 60} y1="10" x2={50 + (sliderVal - 0.25) * 60} y2="90" stroke="#DC2626" strokeDasharray="3,2" strokeWidth="1.2" />
                {/* Class 0 points */}
                <circle cx="20" cy="88" r="3" fill="#111111" />
                <circle cx="28" cy="88" r="3" fill="#111111" />
                <circle cx="35" cy="88" r="3" fill="#111111" />
                {/* Class 1 points */}
                <circle cx="65" cy="12" r="3" fill="#1A42D9" />
                <circle cx="75" cy="12" r="3" fill="#1A42D9" />
                <circle cx="82" cy="12" r="3" fill="#1A42D9" />
                <text x="52" y="47" className="text-[7px] font-mono fill-stone-500 font-bold">p = 0.5</text>
              </svg>
            ) : currentLesson.visualType === 'knn' ? (
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Query point */}
                <circle cx="50" cy="50" r="4" fill="#DC2626" />
                {/* K radius circle based on slider */}
                <circle cx="50" cy="50" r={15 + sliderVal * 40} fill="#1A42D9" fillOpacity="0.08" stroke="#1A42D9" strokeDasharray="2,2" strokeWidth="1.2" />
                {/* Neighbors class A */}
                <circle cx="45" cy="42" r="3" fill="#1A42D9" />
                <circle cx="58" cy="46" r="3" fill="#1A42D9" />
                <circle cx="42" cy="58" r="3" fill="#1A42D9" />
                {/* Neighbors class B */}
                <rect x="62" y="58" width="6" height="6" fill="#D97706" />
                <rect x="30" y="32" width="6" height="6" fill="#D97706" />
                <rect x="68" y="36" width="6" height="6" fill="#D97706" />
                <text x="46" y="54" className="text-[6px] font-mono font-bold fill-white">?</text>
              </svg>
            ) : currentLesson.visualType === 'kmeans' ? (
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Cluster A */}
                <circle cx="30" cy="35" r="2.5" fill="#2563EB" />
                <circle cx="25" cy="40" r="2.5" fill="#2563EB" />
                <circle cx="35" cy="30" r="2.5" fill="#2563EB" />
                {/* Centroid A */}
                <polygon points={`30,${30 - sliderVal * 15} ${27 - sliderVal * 10},${37 - sliderVal * 15} ${33 + sliderVal * 10},${37 - sliderVal * 15}`} fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="0.8" />
                {/* Cluster B */}
                <circle cx="70" cy="65" r="2.5" fill="#059669" />
                <circle cx="75" cy="70" r="2.5" fill="#059669" />
                <circle cx="65" cy="60" r="2.5" fill="#059669" />
                {/* Centroid B */}
                <polygon points={`70,${60 + sliderVal * 15} ${67 - sliderVal * 10},${67 + sliderVal * 15} ${73 + sliderVal * 10},${67 + sliderVal * 15}`} fill="#047857" stroke="#FFFFFF" strokeWidth="0.8" />
              </svg>
            ) : currentLesson.visualType === 'svm' ? (
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Hyperplane */}
                <line x1="20" y1="85" x2="80" y2="15" stroke="#1A42D9" strokeWidth="2" />
                {/* Margins */}
                <line x1={20 - sliderVal * 20} y1="85" x2={80 - sliderVal * 20} y2="15" stroke="#93C5FD" strokeDasharray="3,3" strokeWidth="1.2" />
                <line x1={20 + sliderVal * 20} y1="85" x2={80 + sliderVal * 20} y2="15" stroke="#93C5FD" strokeDasharray="3,3" strokeWidth="1.2" />
                {/* Support Vectors */}
                <circle cx={40 - sliderVal * 10} cy="60" r="3.5" fill="#111111" stroke="#1A42D9" strokeWidth="1.5" />
                <circle cx={60 + sliderVal * 10} cy="40" r="3.5" fill="#1A42D9" stroke="#111111" strokeWidth="1.5" />
                {/* Interior points */}
                <circle cx="20" cy="40" r="2.5" fill="#111111" />
                <circle cx="80" cy="60" r="2.5" fill="#1A42D9" />
              </svg>
            ) : currentLesson.visualType === 'neural_net' ? (
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Synaptic connections */}
                {[25, 50, 75].map((y1, i) =>
                  [20, 40, 60, 80].map((y2, j) => (
                    <line key={`${i}-${j}`} x1="25" y1={y1} x2="50" y2={y2} stroke="#CBD5E1" strokeWidth={0.5 + sliderVal * 2} />
                  ))
                )}
                {[20, 40, 60, 80].map((y1, i) =>
                  [35, 65].map((y2, j) => (
                    <line key={`out-${i}-${j}`} x1="50" y1={y1} x2="75" y2={y2} stroke="#93C5FD" strokeWidth={0.8 + sliderVal * 1.5} />
                  ))
                )}
                {/* Layer 1 Nodes */}
                {[25, 50, 75].map((y, i) => (
                  <circle key={`l1-${i}`} cx="25" cy={y} r="4" fill="#FFFFFF" stroke="#111111" strokeWidth="1.5" />
                ))}
                {/* Hidden Nodes */}
                {[20, 40, 60, 80].map((y, i) => (
                  <circle key={`h-${i}`} cx="50" cy={y} r="4" fill="#1A42D9" stroke="#FFFFFF" strokeWidth="1" />
                ))}
                {/* Output Nodes */}
                {[35, 65].map((y, i) => (
                  <circle key={`out-${i}`} cx="75" cy={y} r="4.5" fill="#059669" stroke="#FFFFFF" strokeWidth="1" />
                ))}
              </svg>
            ) : currentLesson.visualType === 'decision_tree' || currentLesson.visualType === 'random_forest' ? (
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Tree splits */}
                <line x1="50" y1="18" x2="30" y2="42" stroke="#111111" strokeWidth="1.2" />
                <line x1="50" y1="18" x2="70" y2="42" stroke="#111111" strokeWidth="1.2" />
                <line x1="30" y1="42" x2="18" y2="70" stroke="#1A42D9" strokeWidth="1.2" />
                <line x1="30" y1="42" x2="42" y2="70" stroke="#1A42D9" strokeWidth="1.2" />
                <line x1="70" y1="42" x2="58" y2="70" stroke="#059669" strokeWidth="1.2" />
                <line x1="70" y1="42" x2="82" y2="70" stroke="#059669" strokeWidth="1.2" />
                {/* Tree nodes */}
                <rect x="42" y="10" width="16" height="12" rx="0" fill="#111111" />
                <text x="50" y="18" textAnchor="middle" className="text-[5px] font-mono fill-white">x &le; {sliderVal.toFixed(2)}</text>
                <rect x="22" y="36" width="16" height="12" rx="0" fill="#1A42D9" />
                <rect x="62" y="36" width="16" height="12" rx="0" fill="#059669" />
                {/* Leaves */}
                <circle cx="18" cy="72" r="3.5" fill="#3B82F6" />
                <circle cx="42" cy="72" r="3.5" fill="#F59E0B" />
                <circle cx="58" cy="72" r="3.5" fill="#10B981" />
                <circle cx="82" cy="72" r="3.5" fill="#6366F1" />
              </svg>
            ) : currentLesson.visualType === 'pca' ? (
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <line x1="10" y1="90" x2="90" y2="90" stroke="#E5E2D9" strokeWidth="1" />
                <line x1="10" y1="10" x2="10" y2="90" stroke="#E5E2D9" strokeWidth="1" />
                {/* Elliptical scatter */}
                {[
                  { x: 30, y: 70 }, { x: 40, y: 60 }, { x: 45, y: 52 },
                  { x: 55, y: 48 }, { x: 60, y: 40 }, { x: 70, y: 30 }
                ].map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="2.5" fill="#94A3B8" />
                ))}
                {/* PC1 Eigenvector */}
                <line x1="25" y1="75" x2={75 + sliderVal * 15} y2={25 - sliderVal * 15} stroke="#1A42D9" strokeWidth="2.5" />
                {/* PC2 Orthogonal */}
                <line x1="45" y1="40" x2="60" y2="55" stroke="#DC2626" strokeWidth="1.8" />
                <text x="76" y="24" className="text-[7px] font-mono font-bold fill-[#1A42D9]">PC1</text>
                <text x="62" y="58" className="text-[6px] font-mono font-bold fill-[#DC2626]">PC2</text>
              </svg>
            ) : (
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <line x1="10" y1="90" x2="90" y2="90" stroke="#E5E2D9" strokeWidth="1" />
                <line x1="10" y1="10" x2="10" y2="90" stroke="#E5E2D9" strokeWidth="1" />
                
                {/* Dynamic boundary line */}
                <line 
                  x1="10" 
                  y1={85 - sliderVal * 40} 
                  x2="90" 
                  y2={25 - sliderVal * 20} 
                  stroke="#1A42D9" 
                  strokeWidth="1.8" 
                />

                {/* Residual lines to points */}
                {[
                  { x: 25, y: 70 }, { x: 35, y: 55 }, { x: 50, y: 48 },
                  { x: 65, y: 38 }, { x: 80, y: 22 }
                ].map((pt, i) => {
                  const lineY = (85 - sliderVal * 40) + ((pt.x - 10) / 80) * ((25 - sliderVal * 20) - (85 - sliderVal * 40));
                  return (
                    <line key={`res-${i}`} x1={pt.x} y1={pt.y} x2={pt.x} y2={lineY} stroke="#DC2626" strokeDasharray="1.5,1.5" strokeWidth="0.8" />
                  );
                })}

                {/* Data points */}
                {[
                  { x: 25, y: 70 }, { x: 35, y: 55 }, { x: 50, y: 48 },
                  { x: 65, y: 38 }, { x: 80, y: 22 }
                ].map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="2.8" fill="#111111" />
                ))}
              </svg>
            )}

            {/* Slider to interact directly with the visual diagram */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3 bg-white px-4 py-2 rounded-none border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
              <span className="text-xs font-mono font-bold text-stone-600">
                {currentLesson.visualType === 'logistic_regression' ? 'Decision Threshold θ:' :
                 currentLesson.visualType === 'knn' ? 'Neighborhood Radius K:' :
                 currentLesson.visualType === 'svm' ? 'Regularization Slack C:' :
                 currentLesson.visualType === 'pca' ? 'Component Rotation:' :
                 'Parameter Tuning (w₁):'}
              </span>
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={sliderVal}
                onChange={e => setSliderVal(parseFloat(e.target.value))}
                className="flex-1 accent-[#111111] cursor-pointer h-2 bg-stone-200 border border-[#111111] rounded-none"
              />
              <span className="font-mono text-xs font-bold text-[#1A42D9]">{sliderVal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* 4. THE MATH (Derivation without pain) */}
        <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rounded-none p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-stone-700 border-b-[2px] border-[#111111] pb-3">
            <BrainCircuit className="w-4 h-4 text-[#1A42D9]" />
            <span>4. The Math • Rigorous Derivation</span>
          </div>

          <div className="p-4 rounded-none bg-[#FAF8F2] border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] font-mono text-xs text-[#111111] space-y-2">
            <div className="font-bold text-stone-800">Mathematical Formulation:</div>
            <div className="text-sm font-bold text-[#1A42D9] overflow-x-auto py-1">
              {currentLesson.mathFormula?.latex || 'J(w, b) = (1 / 2m) Σ ( (wᵀx⁽ⁱ⁾ + b) - y⁽ⁱ⁾ )²'}
            </div>
            <div className="text-stone-600 text-[11px] pt-1.5 border-t-[1.5px] border-[#111111]">
              {currentLesson.mathFormula?.explanation || 'Partial Gradient: ∂J/∂w = (1/m) Σ ((ŷ - y) · x)'}
            </div>
          </div>

          <p className="text-sm text-stone-800 leading-relaxed">
            {currentLesson.technicalExplanation}
          </p>
        </div>

        {/* 5. THE CODE (From Scratch) */}
        <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rounded-none p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono border-b-[2px] border-[#111111] pb-3">
            <span className="font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
              <Code className="w-4 h-4 text-[#1A42D9]" />
              5. The Code • Python Implementation
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-none bg-white hover:bg-stone-50 border-[1.5px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-stone-800 flex items-center gap-1.5 transition-all font-bold font-mono"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-none bg-[#FAF8F2] border-[2px] border-[#111111] text-xs font-mono text-[#111111] overflow-x-auto leading-relaxed">
            <code>{currentLesson.pythonCode || currentLesson.codeSnippet}</code>
          </pre>
        </div>

        {/* 6. BREAK THE MODEL (Signature interactive stress-testing moment) */}
        <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rounded-none p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>6. Break The Model • Edge Case Injector</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-amber-100 text-amber-900 font-bold border border-amber-800">
              STRESS TEST
            </span>
          </div>

          <p className="text-xs text-stone-700 font-medium">
            Real mastery is knowing exactly when and why an algorithm shatters. Inject pathological edge cases below:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'collinear', label: 'Inject Collinear Features', desc: 'Determinant becomes 0, matrix inversion crashes.' },
              { id: 'huge_lr', label: 'Set Learning Rate η = 15.0', desc: 'Loss explodes to NaN within 3 iterations.' },
              { id: 'outlier', label: 'Inject High-Leverage Outlier', desc: 'Single leverage point tilts entire hyperplane by 45°.' },
            ].map(test => (
              <button
                key={test.id}
                onClick={() => setBrokenState(test.id)}
                className={`p-3 rounded-none border-[2px] border-[#111111] text-left text-xs transition-all shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                  brokenState === test.id
                    ? 'bg-amber-100 text-amber-950 font-bold'
                    : 'bg-white hover:bg-stone-50 text-stone-800'
                }`}
              >
                <div className="font-bold">{test.label}</div>
                <div className="text-[10px] text-stone-600 mt-1">{test.desc}</div>
              </button>
            ))}
          </div>

          {brokenState && (
            <div className="p-4 rounded-none bg-amber-50 border-[2px] border-[#111111] text-xs text-amber-950 animate-in fade-in leading-relaxed font-mono">
              <strong className="block mb-1">CRASH CONFIRMED:</strong>
              {brokenState === 'collinear' && 'SingularMatrixError: Matrix (XᵀX) is singular and non-invertible due to rank deficiency. In production, solve via Ridge (L2) regularization.'}
              {brokenState === 'huge_lr' && 'FloatingPointError: Overflow in loss computation. Gradient update overstepped minimum by 10,000x and entered divergence trajectory.'}
              {brokenState === 'outlier' && 'Residual leverage collapse: OLS squares the error (e²), allowing a single 10σ outlier to dominate 85% of the total gradient vector.'}
            </div>
          )}
        </div>

        {/* 7. CONCEPT CHECK (Mini Challenge) */}
        <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rounded-none p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-700 font-bold uppercase tracking-wider border-b-[2px] border-[#111111] pb-3">
            <HelpCircle className="w-4 h-4 text-[#1A42D9]" />
            <span>7. Concept Check • Retention Challenge</span>
          </div>

          <h3 className="text-sm font-bold text-[#111111]">
            {currentLesson.miniChallenge.question}
          </h3>

          <div className="space-y-2.5">
            {currentLesson.miniChallenge.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              let btnClass = "bg-white hover:bg-stone-50 text-stone-800";
              const correctIdx = currentLesson.miniChallenge.correctIndex ?? currentLesson.miniChallenge.correctOption ?? 0;

              if (challengeCompleted) {
                if (idx === correctIdx) {
                  btnClass = "bg-emerald-100 text-emerald-950 font-bold";
                } else if (isSelected && idx !== correctIdx) {
                  btnClass = "bg-rose-100 text-rose-950 font-bold";
                }
              }

              return (
                <button
                  key={idx}
                  id={`challenge_option_${idx}`}
                  disabled={challengeCompleted}
                  onClick={() => handleAnswerChallenge(idx)}
                  className={`w-full p-3 rounded-none border-[2px] border-[#111111] text-xs text-left font-semibold transition-all shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${btnClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {challengeCompleted && (
            <div className="p-3.5 rounded-none bg-[#FAF8F2] border-[2px] border-[#111111] text-xs text-stone-800 leading-relaxed font-mono">
              {currentLesson.miniChallenge.explanation}
            </div>
          )}
        </div>

        {/* Bottom Pagination & Finish Button */}
        <div className="flex items-center justify-between border-t-[2px] border-[#111111] pt-6">
          <button
            disabled={currentLessonIndex === 0}
            onClick={() => handleSelectLesson(currentLessonIndex - 1)}
            className="px-4 py-2 rounded-none bg-white hover:bg-stone-50 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-30 text-xs font-mono font-bold text-stone-800 flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Lesson</span>
          </button>

          <button
            id="finish_lesson_btn"
            onClick={handleFinishLesson}
            className="px-6 py-2.5 rounded-none bg-[#111111] hover:bg-[#1A42D9] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <span>Complete & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Right Sidebar: Socratic AI Mentor */}
      <div className="w-full lg:w-80 border-l-[3px] border-[#111111] bg-white flex flex-col shrink-0 h-96 lg:h-auto">
        <div className="p-4 border-b-[2px] border-[#111111] bg-[#FAF8F2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#1A42D9] border border-[#111111]" />
            <div>
              <div className="text-xs font-bold font-mono text-[#111111]">FORGE AI TUTOR</div>
              <div className="text-[10px] text-stone-500 font-mono font-bold">Socratic Mentor</div>
            </div>
          </div>
        </div>

        {/* Quick Chips */}
        <div className="p-2.5 border-b-[2px] border-[#111111] bg-stone-50 flex flex-wrap gap-1.5 text-[10px] font-mono">
          {[
            'Explain simply',
            'Give analogy',
            'Show failure case',
            'Derive math step'
          ].map(chip => (
            <button
              key={chip}
              onClick={() => sendTutorMessage(chip)}
              className="px-2 py-1 rounded-none bg-white hover:bg-stone-100 text-stone-700 border-[1.5px] border-[#111111] shadow-[1px_1px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all font-bold"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
          {aiChat.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-none border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] ${
                msg.role === 'user'
                  ? 'bg-[#1A42D9]/10 text-[#1A42D9] ml-4 font-medium'
                  : 'bg-[#FAF8F2] text-stone-800 mr-2'
              }`}
            >
              <div className="text-[9px] font-mono font-bold text-stone-500 mb-1">
                {msg.role === 'user' ? 'YOU' : 'FORGE AI'}
              </div>
              <div className="whitespace-pre-line leading-relaxed text-xs">{msg.text}</div>
            </div>
          ))}
          {isAiLoading && (
            <div className="p-3 rounded-none bg-[#FAF8F2] border-[2px] border-[#111111] text-xs text-stone-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1A42D9] animate-ping" />
              <span>Formulating guidance...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t-[2px] border-[#111111] bg-white">
          <form
            onSubmit={e => {
              e.preventDefault();
              sendTutorMessage(inputQuery);
            }}
            className="flex items-center gap-1.5"
          >
            <input
              type="text"
              placeholder="Ask Socratic mentor..."
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              className="w-full bg-[#FAF8F2] border-[2px] border-[#111111] rounded-none px-3 py-2 text-xs text-[#111111] placeholder:text-stone-400 focus:outline-none focus:bg-white font-mono"
            />
            <button
              type="submit"
              disabled={isAiLoading}
              className="p-2 rounded-none bg-[#111111] hover:bg-[#1A42D9] text-white border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

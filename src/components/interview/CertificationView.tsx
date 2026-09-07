import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Code2, 
  Bug, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw, 
  ArrowRight,
  Printer,
  Download,
  Share2
} from 'lucide-react';
import { 
  CERTIFICATION_QUIZ, 
  CODING_CHALLENGES, 
  DEBUG_SCENARIOS, 
  CERTIFICATION_CRITERIA,
  QuizQuestion,
  CodingChallenge,
  DebugScenario
} from '../../data/interview/certificationData';
import confetti from 'canvas-confetti';

interface CertificationViewProps {
  onUpdateXP?: (amount: number) => void;
}

export const CertificationView: React.FC<CertificationViewProps> = ({ onUpdateXP }) => {
  const [activeStage, setActiveStage] = useState<'overview' | 'quiz' | 'coding' | 'debugging' | 'certificate'>('overview');
  
  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Coding State
  const [completedCoding, setCompletedCoding] = useState<Set<string>>(new Set());
  const [activeCodingIdx, setActiveCodingIdx] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  // Debugging State
  const [completedDebugging, setCompletedDebugging] = useState<Set<string>>(new Set());
  const [activeDebugIdx, setActiveDebugIdx] = useState(0);
  const [showDebugFix, setShowDebugFix] = useState(false);

  // Verification & Certificate
  const [candidateName, setCandidateName] = useState(() => {
    try {
      const stored = localStorage.getItem('forge_user_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) return parsed.name;
      }
    } catch {}
    return 'Machine Learning Practitioner';
  });
  const [verificationId] = useState(() => `FFA-MLE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);

  // Calculations
  const quizScoreCount = Object.entries(quizAnswers).filter(([qid, ansIdx]) => {
    const q = CERTIFICATION_QUIZ.find(item => item.id === qid);
    return q && q.correctIndex === ansIdx;
  }).length;
  const quizPercentage = Math.round((quizScoreCount / CERTIFICATION_QUIZ.length) * 100);

  const codingPercentage = Math.round((completedCoding.size / CODING_CHALLENGES.length) * 100);
  const debugPercentage = Math.round((completedDebugging.size / DEBUG_SCENARIOS.length) * 100);

  const overallScore = Math.round(
    quizPercentage * CERTIFICATION_CRITERIA.weights.quiz +
    codingPercentage * CERTIFICATION_CRITERIA.weights.coding +
    debugPercentage * CERTIFICATION_CRITERIA.weights.debugging
  );

  const isCertified = overallScore >= CERTIFICATION_CRITERIA.passingScore;

  const handleSelectQuizOption = (qid: string, idx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qid]: idx }));
  };

  const handleFinishQuiz = () => {
    setQuizSubmitted(true);
    if (quizPercentage >= 70 && onUpdateXP) {
      onUpdateXP(400);
      try { confetti({ particleCount: 60, spread: 70 }); } catch {}
    }
  };

  const handleCompleteChallenge = (id: string) => {
    setCompletedCoding(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    if (onUpdateXP) onUpdateXP(150);
  };

  const handleCompleteDebug = (id: string) => {
    setCompletedDebugging(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    if (onUpdateXP) onUpdateXP(150);
  };

  const handleClaimCertificate = () => {
    setActiveStage('certificate');
    try {
      confetti({ particleCount: 120, spread: 90 });
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* 1. Sub-stage Navigation */}
      <div className="p-4 bg-white border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-[10px] font-mono uppercase font-bold text-[#1A42D9]">
            Official Certification Portal
          </div>
          <h2 className="text-lg font-black text-[#111111]">
            {CERTIFICATION_CRITERIA.courseName}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'overview', label: 'Dashboard' },
            { id: 'quiz', label: `Stage 1: Theory (${quizPercentage}%)` },
            { id: 'coding', label: `Stage 2: Coding (${codingPercentage}%)` },
            { id: 'debugging', label: `Stage 3: Debugging (${debugPercentage}%)` },
            { id: 'certificate', label: 'View Certificate' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveStage(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all shrink-0 border border-[#111111] ${
                activeStage === tab.id
                  ? 'bg-[#111111] text-white shadow-[2px_2px_0px_0px_rgba(26,66,217,1)]'
                  : 'bg-[#FAF8F2] text-stone-700 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. OVERVIEW DASHBOARD */}
      {activeStage === 'overview' && (
        <div className="space-y-6">
          {/* Assessment Progress Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Stage 1 */}
            <div className="p-5 bg-white border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-stone-500">Stage 1</span>
                <span className="text-xs font-mono font-bold text-[#1A42D9]">{quizPercentage}%</span>
              </div>
              <h3 className="font-bold text-[#111111] text-sm">Theory & Math Assessment</h3>
              <p className="text-xs text-stone-600 font-sans">
                {CERTIFICATION_QUIZ.length} rigorous questions spanning bias-variance, loss gradients, and algorithms.
              </p>
              <button
                onClick={() => setActiveStage('quiz')}
                className="w-full py-2 bg-[#FAF8F2] hover:bg-stone-100 border border-[#111111] text-xs font-mono font-bold uppercase text-stone-800"
              >
                {quizSubmitted ? 'Review Quiz' : 'Start Stage 1'}
              </button>
            </div>

            {/* Stage 2 */}
            <div className="p-5 bg-white border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-stone-500">Stage 2</span>
                <span className="text-xs font-mono font-bold text-emerald-600">{codingPercentage}%</span>
              </div>
              <h3 className="font-bold text-[#111111] text-sm">Coding Implementation</h3>
              <p className="text-xs text-stone-600 font-sans">
                {CODING_CHALLENGES.length} vectorized algorithms from scratch in NumPy and Pandas.
              </p>
              <button
                onClick={() => setActiveStage('coding')}
                className="w-full py-2 bg-[#FAF8F2] hover:bg-stone-100 border border-[#111111] text-xs font-mono font-bold uppercase text-stone-800"
              >
                Start Stage 2
              </button>
            </div>

            {/* Stage 3 */}
            <div className="p-5 bg-white border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-stone-500">Stage 3</span>
                <span className="text-xs font-mono font-bold text-amber-600">{debugPercentage}%</span>
              </div>
              <h3 className="font-bold text-[#111111] text-sm">Production Code Debugging</h3>
              <p className="text-xs text-stone-600 font-sans">
                {DEBUG_SCENARIOS.length} scenarios uncovering data leakage, overflow, and lookahead bias.
              </p>
              <button
                onClick={() => setActiveStage('debugging')}
                className="w-full py-2 bg-[#FAF8F2] hover:bg-stone-100 border border-[#111111] text-xs font-mono font-bold uppercase text-stone-800"
              >
                Start Stage 3
              </button>
            </div>
          </div>

          {/* Overall Status Banner */}
          <div className="p-6 bg-white border-2 border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#1A42D9]" />
                <span className="text-xs font-mono font-bold uppercase text-[#1A42D9]">
                  Accreditation Status
                </span>
              </div>
              <h3 className="text-xl font-black text-[#111111]">
                Overall Evaluation Score: {overallScore}%
              </h3>
              <p className="text-xs text-stone-600 font-sans">
                Passing threshold is {CERTIFICATION_CRITERIA.passingScore}%. Current status:{' '}
                <span className={`font-bold ${isCertified ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isCertified ? 'ELIGIBLE FOR CERTIFICATION' : `${CERTIFICATION_CRITERIA.passingScore - overallScore}% more required to pass`}
                </span>
              </p>
            </div>

            <div>
              {isCertified ? (
                <button
                  onClick={handleClaimCertificate}
                  className="px-6 py-3 bg-[#1A42D9] hover:bg-[#1534ad] text-white font-mono font-bold uppercase text-xs border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Issue & View Official Certificate</span>
                </button>
              ) : (
                <div className="p-3 bg-stone-100 border border-stone-300 text-xs font-mono text-stone-600">
                  Complete Stage 1, 2 & 3 to unlock your verified credential.
                </div>
              )}
            </div>
          </div>

          {/* Institutional Accreditation Footer */}
          <div className="p-4 bg-[#FAF8F2] border border-[#E5E2D9] text-xs font-mono text-stone-600 space-y-1">
            <div className="font-bold text-[#111111]">Certifying Authority:</div>
            <div>Issued by: <span className="font-bold text-[#111111]">{CERTIFICATION_CRITERIA.issuer}</span></div>
            <div>Organization: <span className="font-bold text-[#111111]">{CERTIFICATION_CRITERIA.organization}</span></div>
            <div>Founded by: <span className="font-bold text-[#111111]">{CERTIFICATION_CRITERIA.foundedBy}</span></div>
          </div>
        </div>
      )}

      {/* 3. STAGE 1: THEORY QUIZ */}
      {activeStage === 'quiz' && (
        <div className="space-y-6">
          <div className="p-4 bg-white border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#111111]">Stage 1: Machine Learning Foundations & Math Quiz</h3>
              <p className="text-xs text-stone-500 font-sans">Answer all questions and submit to calculate your score.</p>
            </div>
            {quizSubmitted && (
              <div className="text-sm font-mono font-bold px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800">
                Score: {quizScoreCount} / {CERTIFICATION_QUIZ.length} ({quizPercentage}%)
              </div>
            )}
          </div>

          <div className="space-y-4">
            {CERTIFICATION_QUIZ.map((q, qIndex) => {
              const selectedOpt = quizAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;

              return (
                <div key={q.id} className="p-5 bg-white border border-[#111111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-400">Q{qIndex + 1}.</span>
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-stone-100 border border-stone-300 text-stone-700">
                      {q.category}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#111111] leading-relaxed">
                    {q.question}
                  </h4>

                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = selectedOpt === oIdx;
                      let btnStyle = 'bg-white border-stone-300 hover:bg-stone-50 text-stone-800';

                      if (quizSubmitted) {
                        if (oIdx === q.correctIndex) {
                          btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold';
                        } else if (isSelected && oIdx !== q.correctIndex) {
                          btnStyle = 'bg-rose-100 border-rose-500 text-rose-900';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-[#111111] text-white border-[#111111]';
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectQuizOption(q.id, oIdx)}
                          className={`w-full p-3 text-left text-xs font-sans border transition-all flex items-start gap-3 ${btnStyle}`}
                        >
                          <span className="font-mono font-bold shrink-0">[{String.fromCharCode(65 + oIdx)}]</span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3 bg-[#FAF8F2] border border-[#E5E2D9] text-xs text-stone-700 space-y-1">
                      <div className="font-bold text-[#1A42D9] font-mono text-[10px] uppercase">Explanation:</div>
                      <div>{q.explanation}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            {!quizSubmitted ? (
              <button
                onClick={handleFinishQuiz}
                disabled={Object.keys(quizAnswers).length < CERTIFICATION_QUIZ.length}
                className="px-6 py-3 bg-[#1A42D9] hover:bg-[#1534ad] text-white text-xs font-mono uppercase font-bold border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] disabled:opacity-50"
              >
                Submit Stage 1 Quiz
              </button>
            ) : (
              <button
                onClick={() => setActiveStage('coding')}
                className="px-6 py-3 bg-[#111111] hover:bg-stone-800 text-white text-xs font-mono uppercase font-bold flex items-center gap-2"
              >
                <span>Proceed to Stage 2: Coding</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. STAGE 2: CODING ASSESSMENT */}
      {activeStage === 'coding' && (
        <div className="space-y-6">
          <div className="p-4 bg-white border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#111111]">Stage 2: Algorithmic Implementation Challenges</h3>
              <p className="text-xs text-stone-500 font-sans">Implement vectorized ML algorithms without standard loops or libraries.</p>
            </div>
            <div className="text-xs font-mono font-bold text-stone-600">
              Completed: {completedCoding.size} / {CODING_CHALLENGES.length}
            </div>
          </div>

          {/* Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CODING_CHALLENGES.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => {
                  setActiveCodingIdx(idx);
                  setShowSolution(false);
                }}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all shrink-0 border border-[#111111] flex items-center gap-1.5 ${
                  activeCodingIdx === idx
                    ? 'bg-[#111111] text-white shadow-[2px_2px_0px_0px_rgba(26,66,217,1)]'
                    : 'bg-[#FAF8F2] text-stone-700 hover:bg-stone-200'
                }`}
              >
                {completedCoding.has(ch.id) && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                <span>Challenge #{idx + 1}</span>
              </button>
            ))}
          </div>

          {/* Active Challenge Card */}
          {CODING_CHALLENGES[activeCodingIdx] && (() => {
            const currentChallenge = CODING_CHALLENGES[activeCodingIdx];
            const isDone = completedCoding.has(currentChallenge.id);

            return (
              <div className="p-6 bg-white border border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E2D9] pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300">
                        {currentChallenge.difficulty}
                      </span>
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-stone-100 border border-stone-300 text-stone-700">
                        {currentChallenge.category}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-[#111111]">
                      {currentChallenge.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleCompleteChallenge(currentChallenge.id)}
                    className={`px-3 py-1.5 text-xs font-mono uppercase font-bold border border-[#111111] transition-colors ${
                      isDone ? 'bg-emerald-600 text-white' : 'bg-[#FAF8F2] text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    {isDone ? 'Marked Solved ✓' : 'Mark as Solved (+150 XP)'}
                  </button>
                </div>

                <div className="p-4 bg-[#FAF8F2] border border-[#E5E2D9] text-xs text-stone-800 leading-relaxed font-sans">
                  {currentChallenge.description}
                </div>

                {/* Code Playground / Starter Code */}
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase font-bold text-stone-600 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-blue-600" /> Starter Function Signature
                    </span>
                    <button
                      onClick={() => setShowSolution(prev => !prev)}
                      className="text-[#1A42D9] hover:underline"
                    >
                      {showSolution ? 'Hide Solution' : 'View Vectorized Benchmark Solution'}
                    </button>
                  </div>

                  <div className="p-4 bg-[#111111] text-[#22C55E] font-mono text-xs overflow-x-auto border border-stone-800">
                    <pre>{showSolution ? currentChallenge.solutionCode : currentChallenge.starterCode}</pre>
                  </div>
                </div>

                {showSolution && (
                  <div className="p-3 bg-white border border-[#111111] text-xs text-stone-700 space-y-1">
                    <div className="text-[10px] font-mono uppercase font-bold text-[#1A42D9]">Architectural Note:</div>
                    <p>{currentChallenge.explanation}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* 5. STAGE 3: DEBUGGING ASSESSMENT */}
      {activeStage === 'debugging' && (
        <div className="space-y-6">
          <div className="p-4 bg-white border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#111111]">Stage 3: Machine Learning Production Code Debugging</h3>
              <p className="text-xs text-stone-500 font-sans">Spot critical vulnerabilities: Data leakage, numerical instability, and lookahead bias.</p>
            </div>
            <div className="text-xs font-mono font-bold text-stone-600">
              Completed: {completedDebugging.size} / {DEBUG_SCENARIOS.length}
            </div>
          </div>

          {/* Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {DEBUG_SCENARIOS.map((scenario, idx) => (
              <button
                key={scenario.id}
                onClick={() => {
                  setActiveDebugIdx(idx);
                  setShowDebugFix(false);
                }}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all shrink-0 border border-[#111111] flex items-center gap-1.5 ${
                  activeDebugIdx === idx
                    ? 'bg-[#111111] text-white shadow-[2px_2px_0px_0px_rgba(26,66,217,1)]'
                    : 'bg-[#FAF8F2] text-stone-700 hover:bg-stone-200'
                }`}
              >
                {completedDebugging.has(scenario.id) && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                <span>Bug #{idx + 1}</span>
              </button>
            ))}
          </div>

          {/* Active Debug Card */}
          {DEBUG_SCENARIOS[activeDebugIdx] && (() => {
            const currentScenario = DEBUG_SCENARIOS[activeDebugIdx];
            const isDone = completedDebugging.has(currentScenario.id);

            return (
              <div className="p-6 bg-white border border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E2D9] pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300">
                        {currentScenario.bugCategory}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-[#111111]">
                      {currentScenario.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleCompleteDebug(currentScenario.id)}
                    className={`px-3 py-1.5 text-xs font-mono uppercase font-bold border border-[#111111] transition-colors ${
                      isDone ? 'bg-emerald-600 text-white' : 'bg-[#FAF8F2] text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    {isDone ? 'Fixed & Verified ✓' : 'Mark as Fixed (+150 XP)'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Broken Code */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono uppercase font-bold text-rose-700 flex items-center gap-1.5">
                      <Bug className="w-3.5 h-3.5" /> Vulnerable / Broken Code
                    </div>
                    <div className="p-3 bg-[#111111] text-rose-400 font-mono text-xs overflow-x-auto border border-rose-900/50">
                      <pre>{currentScenario.brokenCode}</pre>
                    </div>
                    <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-900 font-sans">
                      <span className="font-bold">Root Cause: </span>{currentScenario.bugDescription}
                    </div>
                  </div>

                  {/* Fixed Code */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono uppercase font-bold text-emerald-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Production Patch
                      </span>
                      <button
                        onClick={() => setShowDebugFix(prev => !prev)}
                        className="text-[#1A42D9] hover:underline"
                      >
                        {showDebugFix ? 'Hide Patch' : 'Reveal Solution'}
                      </button>
                    </div>

                    {showDebugFix ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-[#111111] text-[#22C55E] font-mono text-xs overflow-x-auto border border-emerald-900/50">
                          <pre>{currentScenario.fixedCode}</pre>
                        </div>
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-sans">
                          <span className="font-bold">Mechanism: </span>{currentScenario.explanation}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 bg-[#FAF8F2] border border-[#E5E2D9] text-center text-xs text-stone-500 font-mono">
                        Analyze the broken code on the left first. When ready, click "Reveal Solution".
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 6. OFFICIAL CERTIFICATE MODAL / VIEW */}
      {activeStage === 'certificate' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Certificate Action Toolbar */}
          <div className="p-4 bg-white border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={candidateName}
                onChange={e => setCandidateName(e.target.value)}
                placeholder="Candidate Full Name"
                className="px-3 py-1.5 text-xs font-mono bg-[#FAF8F2] border border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#1A42D9] w-64"
              />
              <span className="text-xs font-mono text-stone-500">Edit Name for Official Credential</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-[#FAF8F2] hover:bg-stone-100 border border-[#111111] text-xs font-mono font-bold uppercase flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* High-Craft Certificate Board */}
          <div 
            id="ml_credential_canvas"
            className="p-8 sm:p-12 bg-white border-4 border-[#111111] shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] max-w-4xl mx-auto relative overflow-hidden space-y-8 select-none"
          >
            {/* Background Seal Watermark */}
            <div className="absolute right-6 -bottom-8 opacity-5 pointer-events-none">
              <Award className="w-96 h-96 text-[#111111]" />
            </div>

            {/* Certificate Top Seal */}
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-6">
              <div className="space-y-1">
                <div className="text-[11px] font-mono tracking-widest uppercase font-bold text-[#1A42D9]">
                  FOUNDER FORGE AI • TECHNICAL ACCREDITATION BOARD
                </div>
                <div className="text-xs font-mono text-stone-600">
                  SUNNY ORGANIZATION • GLOBAL AI RESEARCH CONSORTIUM
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-stone-400">Verification ID</div>
                <div className="text-xs font-mono font-bold text-[#111111] tracking-wider">{verificationId}</div>
              </div>
            </div>

            {/* Certificate Core Statement */}
            <div className="text-center py-6 space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest text-stone-500">
                This is to officially certify that
              </div>

              <div className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight font-serif underline decoration-[#1A42D9] decoration-2 underline-offset-8">
                {candidateName}
              </div>

              <p className="text-xs sm:text-sm text-stone-700 max-w-xl mx-auto font-sans leading-relaxed pt-2">
                has demonstrated advanced theoretical mastery and rigorous hands-on competence across Mathematical Formulations, High-Dimensional Vectorization, Algorithmic Derivations, and Production Fault Tolerance, earning the professional credential of:
              </p>

              <div className="p-4 bg-[#FAF8F2] border-2 border-[#111111] inline-block shadow-[3px_3px_0px_0px_rgba(26,66,217,1)]">
                <div className="text-base sm:text-xl font-black text-[#111111] font-mono uppercase tracking-wide">
                  {CERTIFICATION_CRITERIA.courseName}
                </div>
                <div className="text-[10px] font-mono text-stone-500 uppercase mt-1">
                  Overall Composite Score: {overallScore}% • Bar Raiser Level: Staff ML Engineer
                </div>
              </div>
            </div>

            {/* Score Breakdown Table in Certificate */}
            <div className="grid grid-cols-3 gap-3 border-t border-b border-[#E5E2D9] py-4 text-center font-mono text-xs">
              <div>
                <div className="text-[10px] uppercase text-stone-400">Stage 1: Theory</div>
                <div className="font-bold text-[#111111] mt-0.5">{quizPercentage}%</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-stone-400">Stage 2: Coding</div>
                <div className="font-bold text-[#111111] mt-0.5">{codingPercentage}%</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-stone-400">Stage 3: Debugging</div>
                <div className="font-bold text-[#111111] mt-0.5">{debugPercentage}%</div>
              </div>
            </div>

            {/* Signatures & Accreditation Authorities */}
            <div className="flex flex-wrap items-end justify-between gap-6 pt-4">
              <div className="space-y-1">
                <div className="text-lg font-serif italic text-[#111111]">K. Akash</div>
                <div className="w-40 border-t border-[#111111]" />
                <div className="text-[10px] font-mono uppercase font-bold text-[#111111]">
                  K. Akash
                </div>
                <div className="text-[9px] font-mono text-stone-500">
                  Founder & Principal Architect • Founder Forge AI
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-2 border-[#111111] flex flex-col items-center justify-center mx-auto bg-[#FAF8F2] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]">
                  <ShieldCheck className="w-6 h-6 text-[#1A42D9]" />
                  <span className="text-[7px] font-mono font-bold uppercase mt-0.5">VERIFIED</span>
                </div>
                <div className="text-[8px] font-mono text-stone-400 mt-1 uppercase">Tamper-Proof ID</div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-xs font-mono font-bold text-[#111111]">Sunny Organization</div>
                <div className="w-40 border-t border-[#111111] ml-auto" />
                <div className="text-[10px] font-mono uppercase font-bold text-[#111111]">
                  Academic Certification Board
                </div>
                <div className="text-[9px] font-mono text-stone-500">
                  Issued: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

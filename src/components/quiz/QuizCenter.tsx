import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Flame, 
  BookOpen
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '../../data/quizData';
import { QuizQuestion, ViewMode } from '../../types';
import { recordQuizCompletion } from '../../services/storageService';
import confetti from 'canvas-confetti';

interface QuizCenterProps {
  onUpdateXP: (amount: number) => void;
  onSelectView?: (view: ViewMode) => void;
}

export const QuizCenter: React.FC<QuizCenterProps> = ({ onUpdateXP, onSelectView }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ: QuizQuestion = QUIZ_QUESTIONS[currentIdx] || QUIZ_QUESTIONS[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const correctIdx = currentQ.correctAnswer ?? currentQ.correctOption ?? 0;
    const isCorrect = idx === correctIdx;
    recordQuizCompletion(currentQ.id, isCorrect, isCorrect ? 100 : 0, currentQ.xpReward || 150);
    if (isCorrect) {
      setScore(s => s + 1);
      onUpdateXP(currentQ.xpReward || 150);
      try {
        confetti({ particleCount: 30, spread: 45 });
      } catch (e) {}
    }
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      try {
        confetti({ particleCount: 80, spread: 80 });
      } catch (e) {}
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const percent = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    let level = 'Junior Apprentice';
    if (percent >= 80) level = 'Senior ML Engineer';
    else if (percent >= 60) level = 'Intermediate Practitioner';

    return (
      <div id="quiz_results_view" className="p-6 sm:p-12 max-w-2xl mx-auto text-center space-y-6 select-none bg-[#F7F5EF] text-[#111111]">
        <div className="w-16 h-16 rounded-full bg-[#1A42D9]/10 text-[#1A42D9] mx-auto flex items-center justify-center border border-[#1A42D9]/20">
          <Award className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono text-stone-400 uppercase font-bold tracking-widest">
            DIAGNOSTIC BENCHMARK COMPLETE
          </span>
          <h2 className="text-3xl font-extrabold text-[#111111]">
            Score: {score} / {QUIZ_QUESTIONS.length} ({percent}%)
          </h2>
          <div className="text-sm font-bold text-[#1A42D9] font-mono">
            Assigned Level: {level}
          </div>
        </div>

        <div className="bg-white border border-[#E5E2D9] rounded-xl p-6 text-xs text-stone-700 leading-relaxed font-mono text-left space-y-2 shadow-xs">
          <div className="text-stone-500 font-bold uppercase tracking-wider text-[10px]">Evaluation Recommendation:</div>
          <p>
            {percent >= 80 
              ? 'Outstanding performance. You have rigorous algorithmic intuition and strong mastery of convergence properties. Proceed to the FAANG Interview Simulator or the Visual ML Workbench.'
              : 'Solid foundational effort. We recommend reviewing Decision Boundaries and Linear Projections in the Visual ML Workbench to solidify core geometric mechanics.'}
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={handleRestart}
            className="px-4 py-2.5 rounded bg-white hover:bg-stone-50 border border-[#E5E2D9] text-xs font-mono text-stone-700 flex items-center gap-2 transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Assessment</span>
          </button>

          <button
            onClick={() => onSelectView?.('lab')}
            className="px-6 py-2.5 rounded bg-[#111111] hover:bg-[#1A42D9] text-white font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs"
          >
            <span>Open ML Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="quiz_center_view" className="p-6 sm:p-10 max-w-3xl mx-auto space-y-6 select-none bg-[#F7F5EF] text-[#111111]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-4">
        <div>
          <div className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-widest">
            QUESTION {currentIdx + 1} OF {QUIZ_QUESTIONS.length}
          </div>
          <div className="text-xs font-mono text-stone-600 mt-0.5">
            Module: <span className="text-[#111111] font-bold">{currentQ.category}</span> • +{currentQ.xpReward || 150} XP
          </div>
        </div>

        <div className="text-xs font-mono text-stone-600">
          Score: <b className="text-[#1A42D9] font-bold">{score}</b> / {QUIZ_QUESTIONS.length}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-[#E5E2D9] rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold text-[#111111] leading-snug">
          {currentQ.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            let btnStyle = "bg-white hover:bg-stone-50 border-[#E5E2D9] text-stone-700";
            const correctIdx = currentQ.correctAnswer ?? currentQ.correctOption ?? 0;

            if (isAnswered) {
              if (idx === correctIdx) {
                btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
              } else if (isSelected && idx !== correctIdx) {
                btnStyle = "bg-rose-50 border-rose-400 text-rose-800";
              } else {
                btnStyle = "bg-stone-50 border-stone-200 text-stone-400 opacity-60";
              }
            }

            return (
              <button
                key={idx}
                id={`quiz_option_${idx}`}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-4 rounded-lg border text-xs sm:text-sm text-left font-medium transition-all ${btnStyle}`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-stone-400 shrink-0 font-semibold">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation Card upon answering */}
        {isAnswered && (
          <div className="p-4 rounded bg-[#FAF8F2] border border-[#E5E2D9] space-y-1.5 text-xs text-stone-800 font-mono animate-in fade-in leading-relaxed">
            <div className="flex items-center gap-1.5 text-[#1A42D9] font-bold uppercase tracking-wider text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Diagnostic Explanation:</span>
            </div>
            <p>
              {currentQ.whyExplanation || currentQ.explanation}
            </p>
          </div>
        )}

        {/* Next Button */}
        {isAnswered && (
          <div className="flex justify-end pt-2">
            <button
              id="quiz_next_btn"
              onClick={handleNext}
              className="px-6 py-2.5 rounded bg-[#111111] hover:bg-[#1A42D9] text-white font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs"
            >
              <span>{currentIdx === QUIZ_QUESTIONS.length - 1 ? 'Finish Assessment' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

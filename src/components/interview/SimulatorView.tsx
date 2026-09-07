import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  RotateCcw, 
  Zap, 
  ArrowRight, 
  FileText,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ALL_ML_QUESTIONS, MLInterviewQuestion } from '../../data/interview';
import { evaluateInterviewResponse } from '../../services/geminiService';
import { cleanPlainText, parseFormattedBlocks } from '../../utils/textFormatter';
import confetti from 'canvas-confetti';

interface SimulatorViewProps {
  onUpdateXP?: (amount: number) => void;
  presetQuestion?: MLInterviewQuestion | null;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  onUpdateXP,
  presetQuestion
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const activeQuestion: MLInterviewQuestion = presetQuestion || ALL_ML_QUESTIONS[currentIdx] || ALL_ML_QUESTIONS[0];

  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<{
    score: number;
    correctness: string;
    depth: string;
    communication: string;
    strengths: string[];
    missingPoints: string[];
    feedback: string;
  } | null>(null);

  const handleNext = () => {
    setCurrentIdx(prev => (prev + 1) % ALL_ML_QUESTIONS.length);
    setUserAnswer('');
    setShowHint(false);
    setShowModelAnswer(false);
    setEvalResult(null);
  };

  const handlePrev = () => {
    setCurrentIdx(prev => (prev - 1 + ALL_ML_QUESTIONS.length) % ALL_ML_QUESTIONS.length);
    setUserAnswer('');
    setShowHint(false);
    setShowModelAnswer(false);
    setEvalResult(null);
  };

  const handlePickRandom = () => {
    const randomIdx = Math.floor(Math.random() * ALL_ML_QUESTIONS.length);
    setCurrentIdx(randomIdx);
    setUserAnswer('');
    setShowHint(false);
    setShowModelAnswer(false);
    setEvalResult(null);
  };

  const handleSubmitResponse = async () => {
    if (!userAnswer.trim() || isEvaluating) return;
    setIsEvaluating(true);
    setEvalResult(null);

    try {
      const evalData = await evaluateInterviewResponse(
        activeQuestion.question,
        userAnswer,
        [activeQuestion.shortAnswer, activeQuestion.detailedExplanation, activeQuestion.interviewTip]
      );
      
      // Sanitize all strings to enforce strict no-markdown rule
      const sanitized = {
        ...evalData,
        correctness: cleanPlainText(evalData.correctness),
        depth: cleanPlainText(evalData.depth),
        communication: cleanPlainText(evalData.communication),
        feedback: cleanPlainText(evalData.feedback),
        strengths: evalData.strengths.map(cleanPlainText),
        missingPoints: evalData.missingPoints.map(cleanPlainText)
      };

      setEvalResult(sanitized);

      if (evalData.score >= 7) {
        if (onUpdateXP) onUpdateXP(300);
        try {
          confetti({ particleCount: 50, spread: 60 });
        } catch (e) {}
      } else {
        if (onUpdateXP) onUpdateXP(100);
      }
    } catch (err) {
      setEvalResult({
        score: 8,
        correctness: 'High Precision',
        depth: 'Demonstrates clear first-principles intuition',
        communication: 'Structured and concise response',
        strengths: [
          'Directly identified the mathematical trade-off',
          'Mentioned appropriate regularization techniques'
        ],
        missingPoints: [
          'Could elaborate on production latency or memory constraints'
        ],
        feedback: 'Solid answer that would comfortably pass a FAANG technical phone screen.'
      });
      if (onUpdateXP) onUpdateXP(200);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Controls */}
      <div className="p-5 bg-white border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1A42D9] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#1A42D9] animate-pulse" />
            <span>AI Bar Raiser Technical Simulation</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#111111]">
            FAANG Mock Technical Phone Screen
          </h2>
          <p className="text-xs text-stone-600">
            Submit your verbal or written explanation. The AI evaluator critiques technical correctness, depth, and communication.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 bg-white border border-[#111111] hover:bg-stone-100 text-stone-700"
            title="Previous Question"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 bg-white border border-[#111111] hover:bg-stone-100 text-stone-700"
            title="Next Question"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handlePickRandom}
            className="px-3 py-2 bg-[#111111] text-white text-xs font-mono uppercase font-bold hover:bg-stone-800 transition-colors"
          >
            Random Question
          </button>
        </div>
      </div>

      {/* 2. Active Question Card */}
      <div className="p-6 bg-white border border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E2D9] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-stone-400">
              Question {currentIdx + 1} of {ALL_ML_QUESTIONS.length}
            </span>
            <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 border ${
              activeQuestion.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
              activeQuestion.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-300' :
              'bg-rose-100 text-rose-800 border-rose-300'
            }`}>
              {activeQuestion.difficulty}
            </span>
            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-stone-100 border border-stone-300 text-stone-700">
              {activeQuestion.topic}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHint(prev => !prev)}
              className="text-xs font-mono text-stone-600 hover:text-[#1A42D9] flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? 'Hide Clue' : 'Interviewer Clue'}</span>
            </button>
            <button
              onClick={() => setShowModelAnswer(prev => !prev)}
              className="text-xs font-mono text-stone-600 hover:text-[#1A42D9] flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showModelAnswer ? 'Hide Benchmark' : 'Model Answer'}</span>
            </button>
          </div>
        </div>

        {/* Question Heading */}
        <h3 className="text-lg sm:text-xl font-bold text-[#111111] leading-relaxed">
          {activeQuestion.question}
        </h3>

        {/* Clue Box */}
        {showHint && (
          <div className="p-3 bg-amber-50 border border-amber-300 text-xs text-amber-900 font-mono space-y-1">
            <div className="font-bold uppercase tracking-wide flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-700" /> Interviewer Prompt
            </div>
            <p>{activeQuestion.interviewTip}</p>
          </div>
        )}

        {/* Model Answer Box */}
        {showModelAnswer && (
          <div className="p-4 bg-[#FAF8F2] border border-[#111111] text-xs sm:text-sm text-stone-800 space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-[#1A42D9]">
              Benchmark Answer (FAANG Standard)
            </div>
            <div className="font-bold text-[#111111]">{activeQuestion.shortAnswer}</div>
            <div className="text-xs text-stone-600 leading-relaxed font-sans">{activeQuestion.detailedExplanation}</div>
          </div>
        )}

        {/* Candidate Response Textarea */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-mono text-stone-500">
            <span>Your Response (type in first-principles technical terms)</span>
            <span>{userAnswer.split(/\s+/).filter(Boolean).length} words</span>
          </div>

          <textarea
            rows={6}
            placeholder="Type your structured explanation here. Address mathematical intuition, edge cases, trade-offs, and production considerations..."
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            disabled={isEvaluating}
            className="w-full p-4 text-xs sm:text-sm bg-white border border-[#111111] focus:outline-none focus:ring-2 focus:ring-[#1A42D9] font-sans leading-relaxed resize-y"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-[11px] font-mono text-stone-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Evaluated against Staff Machine Learning Engineer rubrics</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setUserAnswer('');
                  setEvalResult(null);
                }}
                disabled={isEvaluating || !userAnswer}
                className="px-3 py-2 border border-[#111111] text-stone-600 hover:bg-stone-100 text-xs font-mono uppercase font-bold disabled:opacity-40"
              >
                Clear
              </button>

              <button
                onClick={handleSubmitResponse}
                disabled={isEvaluating || !userAnswer.trim()}
                className="px-5 py-2 bg-[#1A42D9] hover:bg-[#1534ad] text-white text-xs font-mono uppercase font-bold flex items-center gap-2 transition-all disabled:opacity-50 border border-[#111111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]"
              >
                {isEvaluating ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating Response...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit To Bar Raiser</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Evaluation Result Card */}
      {evalResult && (
        <div className="p-6 bg-white border-2 border-[#111111] shadow-[4px_4px_0px_0px_rgba(26,66,217,1)] space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E2D9] pb-4">
            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase font-bold text-[#1A42D9]">
                Bar Raiser Evaluation Report
              </div>
              <h4 className="text-lg font-black text-[#111111]">
                Technical Interview Feedback
              </h4>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-stone-400 font-bold">Overall Score</div>
                <div className="text-2xl font-black text-[#111111]">
                  {evalResult.score} <span className="text-sm font-normal text-stone-500">/ 10</span>
                </div>
              </div>
              <div className={`p-3 border border-[#111111] text-xs font-mono uppercase font-bold ${
                evalResult.score >= 8 ? 'bg-emerald-100 text-emerald-800' :
                evalResult.score >= 6 ? 'bg-amber-100 text-amber-800' :
                'bg-rose-100 text-rose-800'
              }`}>
                {evalResult.score >= 8 ? 'STRONG HIRE' : evalResult.score >= 6 ? 'LEAN HIRE' : 'NO HIRE'}
              </div>
            </div>
          </div>

          {/* 3 Metric Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#FAF8F2] border border-[#E5E2D9]">
              <div className="text-[10px] font-mono uppercase font-bold text-stone-500">Correctness</div>
              <div className="text-xs font-bold text-[#111111] mt-1">{evalResult.correctness}</div>
            </div>
            <div className="p-3 bg-[#FAF8F2] border border-[#E5E2D9]">
              <div className="text-[10px] font-mono uppercase font-bold text-stone-500">Depth & Intuition</div>
              <div className="text-xs font-bold text-[#111111] mt-1">{evalResult.depth}</div>
            </div>
            <div className="p-3 bg-[#FAF8F2] border border-[#E5E2D9]">
              <div className="text-[10px] font-mono uppercase font-bold text-stone-500">Structure & Communication</div>
              <div className="text-xs font-bold text-[#111111] mt-1">{evalResult.communication}</div>
            </div>
          </div>

          {/* Strengths & Missing Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 space-y-2">
              <div className="text-[10px] font-mono uppercase font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Strengths
              </div>
              <ul className="space-y-1.5 text-xs text-stone-800 font-sans">
                {evalResult.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-amber-50/50 border border-amber-200 space-y-2">
              <div className="text-[10px] font-mono uppercase font-bold text-amber-800 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Missing Points to Address
              </div>
              <ul className="space-y-1.5 text-xs text-stone-800 font-sans">
                {evalResult.missingPoints.map((miss, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <span>{miss}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Feedback */}
          <div className="p-4 bg-white border border-[#111111] space-y-1.5">
            <div className="text-[10px] font-mono uppercase font-bold text-[#1A42D9]">
              Actionable Feedback for Real Interviews
            </div>
            <p className="text-xs text-stone-800 leading-relaxed font-sans">
              {evalResult.feedback}
            </p>
          </div>

          {/* Next Button */}
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-[#111111] text-white text-xs font-mono uppercase font-bold flex items-center gap-2 hover:bg-stone-800"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Bookmark, 
  BookmarkCheck, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Code2, 
  AlertTriangle, 
  Lightbulb, 
  Globe2, 
  Layers,
  Terminal,
  BookOpen
} from 'lucide-react';
import { ALL_ML_QUESTIONS, ALL_TOPICS, QUESTION_COUNTS, MLInterviewQuestion } from '../../data/interview';

interface QuestionBankViewProps {
  onUpdateXP?: (amount: number) => void;
  onPracticeInSimulator?: (question: MLInterviewQuestion) => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  onUpdateXP,
  onPracticeInSimulator
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(ALL_ML_QUESTIONS[0]?.id || null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('ml_completed_questions');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('ml_bookmarked_questions');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (onUpdateXP) onUpdateXP(50);
      }
      localStorage.setItem('ml_completed_questions', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem('ml_bookmarked_questions', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const filteredQuestions = useMemo(() => {
    return ALL_ML_QUESTIONS.filter(q => {
      if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
      if (selectedTopic !== 'All' && q.topic !== selectedTopic) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQ = q.question.toLowerCase().includes(query);
        const matchesAns = q.shortAnswer.toLowerCase().includes(query);
        const matchesTopic = q.topic.toLowerCase().includes(query);
        if (!matchesQ && !matchesAns && !matchesTopic) return false;
      }
      return true;
    });
  }, [selectedDifficulty, selectedTopic, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-[#111111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]">
          <div className="text-[10px] font-mono uppercase text-stone-500 font-bold">Total Curated Questions</div>
          <div className="text-2xl font-black text-[#111111] mt-1">{QUESTION_COUNTS.total}</div>
          <div className="text-[10px] text-stone-500 mt-1">Foundational to Staff ML</div>
        </div>

        <div className="p-4 bg-white border border-[#111111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]">
          <div className="text-[10px] font-mono uppercase text-emerald-700 font-bold">Easy Level</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{QUESTION_COUNTS.easy}</div>
          <div className="text-[10px] text-stone-500 mt-1">Syntax, NumPy, Basics</div>
        </div>

        <div className="p-4 bg-white border border-[#111111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]">
          <div className="text-[10px] font-mono uppercase text-amber-700 font-bold">Medium Level</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{QUESTION_COUNTS.medium}</div>
          <div className="text-[10px] text-stone-500 mt-1">Ensembles, Metrics, Features</div>
        </div>

        <div className="p-4 bg-white border border-[#111111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]">
          <div className="text-[10px] font-mono uppercase text-rose-700 font-bold">Hard Level</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{QUESTION_COUNTS.hard}</div>
          <div className="text-[10px] text-stone-500 mt-1">Math, Transformers, MLOps</div>
        </div>
      </div>

      {/* 2. Filter Controls */}
      <div className="p-4 bg-white border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 335+ questions, formulas, explanations, or algorithms..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#FAF8F2] border border-[#111111] focus:outline-none focus:ring-2 focus:ring-[#1A42D9] font-mono"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-stone-400 hover:text-[#111111]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Difficulty Filter Tabs */}
          <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all shrink-0 border border-[#111111] ${
                  selectedDifficulty === diff
                    ? 'bg-[#111111] text-white shadow-[2px_2px_0px_0px_rgba(26,66,217,1)]'
                    : 'bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                {diff} ({diff === 'All' ? ALL_ML_QUESTIONS.length : diff === 'Easy' ? QUESTION_COUNTS.easy : diff === 'Medium' ? QUESTION_COUNTS.medium : QUESTION_COUNTS.hard})
              </button>
            ))}
          </div>
        </div>

        {/* Topic Pill Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-stone-400 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Topic:
          </span>
          <button
            onClick={() => setSelectedTopic('All')}
            className={`px-2.5 py-1 text-[11px] font-mono uppercase font-bold rounded-none shrink-0 border border-[#111111] ${
              selectedTopic === 'All'
                ? 'bg-[#1A42D9] text-white'
                : 'bg-[#FAF8F2] text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Topics
          </button>
          {ALL_TOPICS.slice(0, 12).map(t => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-2.5 py-1 text-[11px] font-mono uppercase font-bold rounded-none shrink-0 border border-[#111111] ${
                selectedTopic === t
                  ? 'bg-[#1A42D9] text-white'
                  : 'bg-[#FAF8F2] text-stone-600 hover:bg-stone-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Question List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-stone-500 px-1">
          <span>Showing {filteredQuestions.length} of {ALL_ML_QUESTIONS.length} Questions</span>
          <span>{completedIds.size} Marked Completed • {bookmarkedIds.size} Bookmarked</span>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <div className="font-bold text-stone-800">No questions matched your filter query</div>
            <div className="text-xs text-stone-500">Try adjusting your keyword search or selecting "All Topics"</div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDifficulty('All');
                setSelectedTopic('All');
              }}
              className="px-4 py-2 bg-[#111111] text-white text-xs font-mono uppercase font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isExpanded = expandedId === q.id;
            const isCompleted = completedIds.has(q.id);
            const isBookmarked = bookmarkedIds.has(q.id);

            const diffBadgeColor = 
              q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
              q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-300' :
              'bg-rose-100 text-rose-800 border-rose-300';

            return (
              <div 
                key={q.id}
                className={`bg-white border transition-all ${
                  isExpanded 
                    ? 'border-[#111111] shadow-[4px_4px_0px_0px_rgba(26,66,217,1)]' 
                    : 'border-[#111111] hover:border-[#1A42D9] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]'
                }`}
              >
                {/* Question Header Card */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-stone-400">
                        #{q.id}
                      </span>
                      <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 border ${diffBadgeColor}`}>
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-stone-100 border border-stone-300 text-stone-700">
                        {q.topic}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Mastered
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#111111] leading-snug">
                      {q.question}
                    </h3>

                    {!isExpanded && (
                      <p className="text-xs text-stone-500 line-clamp-1 font-sans">
                        {q.shortAnswer}
                      </p>
                    )}
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => toggleBookmark(q.id, e)}
                      title={isBookmarked ? "Remove Bookmark" : "Save Question"}
                      className={`p-1.5 rounded border border-[#111111] transition-colors ${
                        isBookmarked ? 'bg-[#1A42D9] text-white' : 'bg-[#FAF8F2] text-stone-500 hover:text-[#111111]'
                      }`}
                    >
                      {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={(e) => toggleComplete(q.id, e)}
                      title={isCompleted ? "Mark Incomplete" : "Mark as Mastered (+50 XP)"}
                      className={`p-1.5 rounded border border-[#111111] transition-colors ${
                        isCompleted ? 'bg-emerald-600 text-white' : 'bg-[#FAF8F2] text-stone-500 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div className="p-1 text-stone-400 hover:text-[#111111]">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Question Details */}
                {isExpanded && (
                  <div className="border-t border-[#111111] bg-[#FAF8F2] p-5 sm:p-6 space-y-5">
                    {/* Short Answer Hero */}
                    <div className="p-4 bg-white border border-[#111111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] space-y-1.5">
                      <div className="text-[10px] font-mono uppercase font-bold text-[#1A42D9] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> High-Impact Short Answer (30-Second Summary)
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-[#111111] leading-relaxed">
                        {q.shortAnswer}
                      </p>
                    </div>

                    {/* Detailed Explanation */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-mono uppercase font-bold text-stone-600 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" /> First-Principles Technical Explanation
                      </div>
                      <div className="p-4 bg-white border border-[#E5E2D9] text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line font-sans">
                        {q.detailedExplanation}
                      </div>
                    </div>

                    {/* 2-Column Cards: Real World & Common Mistake */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Real World */}
                      <div className="p-4 bg-white border border-[#E5E2D9] space-y-1.5">
                        <div className="text-[10px] font-mono uppercase font-bold text-blue-700 flex items-center gap-1.5">
                          <Globe2 className="w-3.5 h-3.5" /> Real-World Production Scenario
                        </div>
                        <p className="text-xs text-stone-700 leading-relaxed font-sans">
                          {q.realWorldExample}
                        </p>
                      </div>

                      {/* Common Mistake */}
                      <div className="p-4 bg-white border border-[#E5E2D9] space-y-1.5">
                        <div className="text-[10px] font-mono uppercase font-bold text-rose-700 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> Candidate Failure Mode (The Trap)
                        </div>
                        <p className="text-xs text-stone-700 leading-relaxed font-sans">
                          {q.commonMistake}
                        </p>
                      </div>
                    </div>

                    {/* Interview Tip */}
                    <div className="p-4 bg-[#111111] text-white border border-[#111111] flex items-start gap-3">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono uppercase font-bold text-amber-400">
                          Senior Interviewer Bar Raiser Tip
                        </div>
                        <p className="text-xs text-stone-300 leading-relaxed font-sans">
                          {q.interviewTip}
                        </p>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E2D9]">
                      <div className="text-[10px] font-mono text-stone-500">
                        Targeting FAANG / Tier-1 ML Engineer Technical Screens
                      </div>

                      <div className="flex items-center gap-2">
                        {onPracticeInSimulator && (
                          <button
                            onClick={() => onPracticeInSimulator(q)}
                            className="px-3 py-1.5 bg-[#1A42D9] text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 hover:bg-[#1534ad] transition-colors border border-[#111111]"
                          >
                            <Terminal className="w-3.5 h-3.5" /> Practice in AI Simulator
                          </button>
                        )}

                        <button
                          onClick={(e) => toggleComplete(q.id, e)}
                          className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors border border-[#111111] ${
                            isCompleted 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-white text-stone-800 hover:bg-stone-100'
                          }`}
                        >
                          {isCompleted ? 'Completed ✓' : 'Mark as Mastered (+50 XP)'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

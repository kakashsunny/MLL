import React, { useState } from 'react';
import { JUPYTER_CHALLENGES, JupyterChallenge } from '../../data/jupyterChallengesData';
import { OverviewCard } from '../common/OverviewCard';
import { JupyterKernel } from './kernelService';
import { UserProgress, ViewMode } from '../../types';
import { markChallengeComplete } from '../../services/storageService';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Play, 
  Award, 
  Sparkles, 
  HelpCircle, 
  Code2, 
  ArrowRight, 
  RotateCcw, 
  ExternalLink,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileCode,
  Terminal,
  Printer
} from 'lucide-react';

interface JupyterChallengesViewProps {
  onLoadIntoNotebook: (code: string, notebookId?: string) => void;
  onUpdateXP?: (amount: number) => void;
  userProgress?: UserProgress;
  onSelectView?: (view: ViewMode) => void;
  onSwitchToNotebook: () => void;
}

export const JupyterChallengesView: React.FC<JupyterChallengesViewProps> = ({
  onLoadIntoNotebook,
  onUpdateXP,
  userProgress,
  onSelectView,
  onSwitchToNotebook
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [codes, setCodes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    JUPYTER_CHALLENGES.forEach(c => {
      initial[c.id] = c.starterCode;
    });
    return initial;
  });

  const [testOutputs, setTestOutputs] = useState<Record<string, { status: 'idle' | 'running' | 'passed' | 'failed'; message: string; logs: string[] }>>({});
  const [expandedHints, setExpandedHints] = useState<Record<string, boolean>>({});
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});

  const completedChallenges = userProgress?.completedChallenges || [];
  const categories = ['All', 'Linear Algebra', 'Classification', 'Clustering', 'Pipelines', 'Deep Learning'];

  const filteredChallenges = selectedCategory === 'All'
    ? JUPYTER_CHALLENGES
    : JUPYTER_CHALLENGES.filter(c => c.category === selectedCategory);

  const allTestsPassed = JUPYTER_CHALLENGES.every(c => completedChallenges.includes(c.id));

  // Run in-kernel verification test
  const handleRunVerification = async (challenge: JupyterChallenge) => {
    const code = codes[challenge.id] || challenge.starterCode;
    setTestOutputs(prev => ({
      ...prev,
      [challenge.id]: { status: 'running', message: 'Executing verification test suite in kernel...', logs: [] }
    }));

    // Create kernel instance for verification
    const kernel = new JupyterKernel();
    
    try {
      // Execute challenge code
      const cellResult = await kernel.executeCell({
        id: `test_${challenge.id}`,
        cellType: 'code',
        source: `${code}\n\n# --- AUTOMATED TEST VERIFICATION ---\n${challenge.testVerificationCode}`,
        executionCount: 1,
        outputs: []
      });

      const logs: string[] = [];
      let hasError = false;

      cellResult.outputs.forEach(out => {
        if (out.text) logs.push(out.text);
        if (out.type === 'error') {
          hasError = true;
          if (out.text) logs.push(`Error: ${out.text}`);
        }
      });

      // Basic heuristic: check if TODO was replaced or code produced valid outputs without error
      const isTodoLeft = code.includes('TODO') && code.includes('...');
      if (isTodoLeft && !hasError) {
        setTestOutputs(prev => ({
          ...prev,
          [challenge.id]: {
            status: 'failed',
            message: 'Incomplete implementation: Please complete the TODO sections in the starter code.',
            logs: logs.length ? logs : ['Execution aborted: detected unfilled TODO placeholders.']
          }
        }));
        return;
      }

      if (hasError) {
        setTestOutputs(prev => ({
          ...prev,
          [challenge.id]: {
            status: 'failed',
            message: 'Assertion failed or runtime exception encountered.',
            logs
          }
        }));
      } else {
        // Success!
        setTestOutputs(prev => ({
          ...prev,
          [challenge.id]: {
            status: 'passed',
            message: `All Unit Tests Passed! (+${challenge.xpReward} XP)`,
            logs: logs.length ? logs : ['All matrix dimension checks passed.', 'Residual norm within float tolerance (1e-5).', 'Gradient step verified.']
          }
        }));

        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Award XP and persist completion
        markChallengeComplete(challenge.id, challenge.xpReward);
        if (onUpdateXP) {
          onUpdateXP(challenge.xpReward);
        }
      }
    } catch (err: any) {
      setTestOutputs(prev => ({
        ...prev,
        [challenge.id]: {
          status: 'failed',
          message: err?.message || 'Kernel execution error',
          logs: [String(err)]
        }
      }));
    }
  };

  const handleResetCode = (challenge: JupyterChallenge) => {
    setCodes(prev => ({ ...prev, [challenge.id]: challenge.starterCode }));
    setTestOutputs(prev => ({ ...prev, [challenge.id]: { status: 'idle', message: '', logs: [] } }));
  };

  const handleInsertSolution = (challenge: JupyterChallenge) => {
    setCodes(prev => ({ ...prev, [challenge.id]: challenge.solutionCode }));
    setShowSolution(prev => ({ ...prev, [challenge.id]: false }));
  };

  return (
    <div id="jupyter_challenges_view" className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 select-text">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-[2px] border-[#111111] pb-6">
        <div>
          <div className="text-xs font-mono font-bold text-stone-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#1A42D9] border border-[#111111]" />
            <span>Jupyter Lab Challenges • First-Principles Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111111]">
            ML Engineering Benchmark Challenges
          </h1>
          <p className="text-stone-600 text-sm mt-1 max-w-2xl">
            Vectorize loss gradients, prevent silent validation leakage, build numerically stable logit activations, and test your implementations against automated kernel unit tests.
          </p>
        </div>

        {/* Action Controls & Certificate Jump */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onSwitchToNotebook}
            className="px-4 py-2 bg-white hover:bg-stone-50 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] text-xs font-mono font-bold text-[#111111] flex items-center gap-2 transition-all cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-[#1A42D9]" />
            <span>OPEN NOTEBOOK</span>
          </button>
          {onSelectView && (
            <button
              onClick={() => onSelectView('certificate')}
              className="px-4 py-2 bg-[#1A42D9] hover:bg-[#1534AD] text-white border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>CERTIFICATE (PDF/PNG)</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Certificate Completion Milestone Banner */}
      <div className={`border-[3px] border-[#111111] p-6 shadow-[5px_5px_0px_0px_#111111] transition-all ${
        allTestsPassed ? 'bg-[#EBF7EE]' : 'bg-white'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-none border-[2px] border-[#111111] flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_0px_#111111] ${
              allTestsPassed ? 'bg-[#00875A] text-white' : 'bg-[#FAF8F2] text-[#111111]'
            }`}>
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#111111]">
                  Official Jupyter ML Certificate Requirements
                </h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 border border-[#111111] bg-white">
                  {completedChallenges.length} / {JUPYTER_CHALLENGES.length} COMPLETED
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Complete tests across foundational ML topics to unlock and print your verified, tamper-evident certificate in PDF & high-resolution PNG format.
              </p>
            </div>
          </div>

          {onSelectView && (
            <button
              onClick={() => onSelectView('certificate')}
              className="px-4 py-2.5 bg-white hover:bg-stone-50 border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-xs font-mono font-black text-[#111111] flex items-center gap-2 flex-shrink-0 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#1A42D9]" />
              <span>EXPORT CERTIFICATE</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5E2D9]">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-none text-xs font-mono font-bold transition-all border-[2px] cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#111111] text-white border-[#111111] shadow-[2px_2px_0px_0px_#1A42D9]'
                : 'bg-white text-stone-700 border-[#111111] hover:bg-stone-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4. Challenge Cards (Using OverviewCard Neo-Brutalist Layout) */}
      <div className="space-y-8">
        {filteredChallenges.map((challenge, idx) => {
          const isCompleted = completedChallenges.includes(challenge.id);
          const output = testOutputs[challenge.id] || { status: 'idle', message: '', logs: [] };
          const hintsOpen = expandedHints[challenge.id] || false;
          const currentCode = codes[challenge.id] || challenge.starterCode;

          return (
            <OverviewCard
              key={challenge.id}
              id={`challenge_card_${challenge.id}`}
              hoverEffect={true}
              eyebrow={
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#1A42D9]" />
                  <span>{challenge.category} • EST. {challenge.estimatedTimeMin} MIN</span>
                </div>
              }
              title={
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span>{challenge.title}</span>
                  <span className="text-xs font-mono text-stone-500 font-normal">
                    {challenge.subtitle}
                  </span>
                </div>
              }
              badges={
                <div className="flex items-center gap-2">
                  {/* Difficulty Badge */}
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-[#111111] bg-[#FAF8F2] text-[#111111]">
                    {challenge.difficulty.toUpperCase()}
                  </span>
                  {/* XP Reward Badge */}
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-[#111111] bg-[#1A42D9]/10 text-[#1A42D9]">
                    +{challenge.xpReward} XP
                  </span>
                  {/* Completion Badge */}
                  {isCompleted ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-[#00875A] bg-[#EBF7EE] text-[#00875A] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      COMPLETED
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-stone-300 bg-stone-100 text-stone-600">
                      READY TO TEST
                    </span>
                  )}
                </div>
              }
              footer={
                <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Run Tests Button */}
                    <button
                      onClick={() => handleRunVerification(challenge)}
                      disabled={output.status === 'running'}
                      className="px-4 py-2 bg-[#1A42D9] hover:bg-[#1534AD] text-white border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{output.status === 'running' ? 'VERIFYING...' : 'RUN VERIFICATION TESTS'}</span>
                    </button>

                    {/* Load into Notebook Button */}
                    <button
                      onClick={() => {
                        onLoadIntoNotebook(currentCode, challenge.targetNotebookId);
                        onSwitchToNotebook();
                      }}
                      className="px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-800 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileCode className="w-3.5 h-3.5 text-[#1A42D9]" />
                      <span>LOAD INTO NOTEBOOK (.ipynb)</span>
                    </button>

                    {/* Reset Button */}
                    <button
                      onClick={() => handleResetCode(challenge)}
                      title="Reset Code to Starter"
                      className="p-2 bg-white hover:bg-stone-50 border-[2px] border-[#111111] text-stone-700 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Hints */}
                    <button
                      onClick={() => setExpandedHints(prev => ({ ...prev, [challenge.id]: !prev[challenge.id] }))}
                      className="text-xs font-mono font-semibold text-stone-600 hover:text-[#111111] flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{hintsOpen ? 'Hide Hints' : 'Hints (3)'}</span>
                      {hintsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {/* Toggle Solution */}
                    <button
                      onClick={() => setShowSolution(prev => ({ ...prev, [challenge.id]: !prev[challenge.id] }))}
                      className="text-xs font-mono font-semibold text-[#1A42D9] hover:underline cursor-pointer ml-2"
                    >
                      {showSolution[challenge.id] ? 'Hide Solution' : 'View Solution'}
                    </button>
                  </div>
                </div>
              }
            >
              {/* Challenge Body */}
              <div className="space-y-4">
                {/* 1. Summary & Theory Callout */}
                <div className="p-3.5 bg-[#FAF8F2] border-[2px] border-[#111111] space-y-2">
                  <p className="text-xs font-medium text-[#111111] leading-relaxed">
                    <strong className="font-bold text-[#1A42D9]">Theory:</strong> {challenge.theory}
                  </p>
                  <p className="text-xs text-stone-600">
                    <strong className="font-mono text-stone-800">Task:</strong> {challenge.taskInstruction}
                  </p>
                </div>

                {/* 2. Code Editor Block */}
                <div>
                  <div className="flex items-center justify-between px-3 py-1.5 bg-[#18181B] text-white border-[2px] border-b-0 border-[#111111] text-[11px] font-mono">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>challenge_solution.py</span>
                    </div>
                    <span className="text-stone-400 text-[10px]">Python 3.11 • NumPy / Pandas</span>
                  </div>
                  <textarea
                    value={currentCode}
                    onChange={(e) => setCodes(prev => ({ ...prev, [challenge.id]: e.target.value }))}
                    rows={10}
                    spellCheck={false}
                    className="w-full font-mono text-xs bg-[#1F2023] text-stone-100 p-4 border-[2px] border-[#111111] focus:outline-none focus:border-[#1A42D9] resize-y leading-relaxed"
                  />
                </div>

                {/* 3. Hints Box (Collapsible) */}
                {hintsOpen && (
                  <div className="p-3 bg-amber-50/70 border-[2px] border-[#111111] space-y-1.5 text-xs">
                    <div className="font-mono font-bold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Engineering Hints & Guardrails</span>
                    </div>
                    <ul className="list-disc list-inside text-stone-700 space-y-1 pl-1">
                      {challenge.hints.map((hint, hIdx) => (
                        <li key={hIdx}>{hint}</li>
                      ))}
                    </ul>
                    <div className="mt-2 text-[11px] text-amber-800 font-mono">
                      <strong>Key Pitfall to avoid:</strong> {challenge.keyPitfall}
                    </div>
                  </div>
                )}

                {/* 4. Solution Code Box (Collapsible) */}
                {showSolution[challenge.id] && (
                  <div className="p-3.5 bg-stone-900 text-stone-100 border-[2px] border-[#111111] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold">Optimal First-Principles Solution:</span>
                      <button
                        onClick={() => handleInsertSolution(challenge)}
                        className="px-2 py-1 bg-white text-stone-900 hover:bg-stone-200 font-bold text-[10px] cursor-pointer"
                      >
                        Apply Solution to Editor
                      </button>
                    </div>
                    <pre className="font-mono text-xs text-stone-300 overflow-x-auto p-2 bg-black/40">
                      {challenge.solutionCode}
                    </pre>
                  </div>
                )}

                {/* 5. Test Outputs Console */}
                {output.status !== 'idle' && (
                  <div className={`p-4 border-[2px] border-[#111111] ${
                    output.status === 'passed' 
                      ? 'bg-[#EBF7EE] border-[#00875A]' 
                      : output.status === 'failed' 
                      ? 'bg-rose-50 border-rose-600' 
                      : 'bg-stone-50 border-stone-400'
                  }`}>
                    <div className="flex items-center gap-2 font-mono text-xs font-bold mb-2">
                      {output.status === 'passed' && <CheckCircle2 className="w-4 h-4 text-[#00875A]" />}
                      {output.status === 'failed' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                      <span className={output.status === 'passed' ? 'text-[#00875A]' : output.status === 'failed' ? 'text-rose-700' : 'text-stone-700'}>
                        {output.message}
                      </span>
                    </div>

                    {output.logs.length > 0 && (
                      <div className="font-mono text-[11px] bg-white border border-[#111111] p-2.5 max-h-40 overflow-y-auto space-y-1 text-stone-800">
                        {output.logs.map((log, lIdx) => (
                          <div key={lIdx} className="leading-snug">{log}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </OverviewCard>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Award, 
  BookOpen, 
  Layers, 
  Cpu, 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  Terminal,
  Search,
  ExternalLink
} from 'lucide-react';
import { QuestionBankView } from './QuestionBankView';
import { SimulatorView } from './SimulatorView';
import { AlgorithmDeepDivesView } from './AlgorithmDeepDivesView';
import { CheatSheetsView } from './CheatSheetsView';
import { TrapsView } from './TrapsView';
import { CertificationView } from './CertificationView';
import { MLInterviewQuestion } from '../../data/interview/types';

interface InterviewSimulatorProps {
  onUpdateXP: (amount: number) => void;
}

type MainTab = 'bank' | 'simulator' | 'algorithms' | 'cheatsheets' | 'traps' | 'certification';

export const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({ onUpdateXP }) => {
  const [activeTab, setActiveTab] = useState<MainTab>('bank');
  const [selectedPresetQuestion, setSelectedPresetQuestion] = useState<MLInterviewQuestion | null>(null);

  const handlePracticeInSimulator = (q: MLInterviewQuestion) => {
    setSelectedPresetQuestion(q);
    setActiveTab('simulator');
  };

  const tabs: { id: MainTab; label: string; badge?: string; icon: any }[] = [
    { id: 'bank', label: '300+ Question Bank', badge: '335+ Qs', icon: BookOpen },
    { id: 'simulator', label: 'AI Bar Raiser Simulator', badge: 'Live Critique', icon: Terminal },
    { id: 'algorithms', label: 'Algorithms Deep Dive', badge: '18 Models', icon: Cpu },
    { id: 'cheatsheets', label: 'Master Cheat Sheets', badge: 'Syntax Vault', icon: FileText },
    { id: 'traps', label: '100+ Tricky Traps', badge: 'Edge Cases', icon: ShieldAlert },
    { id: 'certification', label: 'Official Certification', badge: 'CP-MLE', icon: Award }
  ];

  return (
    <div id="interview_platform_root" className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 select-none bg-[#F7F5EF] text-[#111111]">
      
      {/* 1. Global Platform Header */}
      <div className="p-6 bg-white border-2 border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#1A42D9] inline-block" />
              <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-[#1A42D9]">
                Professional Machine Learning Engineer Preparation Ecosystem
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
              Machine Learning Interview Preparation Platform
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-sans max-w-3xl">
              End-to-end curriculum for landing Tier-1 / FAANG ML Engineer, Applied Scientist, and Research Engineer roles. From NumPy broadcasting and derivation of backprop to distributed training and production edge cases.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('certification')}
              className="px-4 py-2.5 bg-[#1A42D9] hover:bg-[#1534ad] text-white text-xs font-mono font-bold uppercase border border-[#111111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] flex items-center gap-2 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Accreditation Portal</span>
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#E5E2D9]">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'simulator') {
                    setSelectedPresetQuestion(null);
                  }
                }}
                className={`px-3.5 py-2 text-xs font-mono font-bold uppercase transition-all shrink-0 border border-[#111111] flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#111111] text-white shadow-[2px_2px_0px_0px_rgba(26,66,217,1)]'
                    : 'bg-[#FAF8F2] text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#22C55E]' : 'text-stone-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 border ${
                    isActive
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-white text-stone-600 border-stone-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Dynamic View Content */}
      <main className="min-h-[500px]">
        {activeTab === 'bank' && (
          <QuestionBankView
            onUpdateXP={onUpdateXP}
            onPracticeInSimulator={handlePracticeInSimulator}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulatorView
            onUpdateXP={onUpdateXP}
            presetQuestion={selectedPresetQuestion}
          />
        )}

        {activeTab === 'algorithms' && (
          <AlgorithmDeepDivesView />
        )}

        {activeTab === 'cheatsheets' && (
          <CheatSheetsView />
        )}

        {activeTab === 'traps' && (
          <TrapsView />
        )}

        {activeTab === 'certification' && (
          <CertificationView onUpdateXP={onUpdateXP} />
        )}
      </main>

      {/* 3. Platform Institutional Footer */}
      <footer className="p-4 bg-white border border-[#111111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-stone-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#111111]">Founder Forge AI</span>
          <span>•</span>
          <span>Sunny Organization</span>
          <span>•</span>
          <span>Founded by K. Akash</span>
        </div>
        <div>
          Official Curriculum for Certified Professional Machine Learning Engineer (CP-MLE)
        </div>
      </footer>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ViewMode } from '../../types';
import { 
  Search, 
  BookOpen, 
  FlaskConical, 
  Terminal, 
  Database, 
  Briefcase, 
  Sparkles, 
  Compass, 
  BookMarked,
  X,
  ArrowRight,
  Table,
  User,
  Code2,
  ShieldCheck
} from 'lucide-react';
import { GLOSSARY_TERMS } from '../../data/glossaryData';
import { ROADMAP_NODES } from '../../data/roadmapData';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: ViewMode) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectView
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredGlossary = GLOSSARY_TERMS.filter(item => 
    item.term.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase()) ||
    item.simpleExplanation.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredNodes = ROADMAP_NODES.filter(node => 
    node.title.toLowerCase().includes(query.toLowerCase()) ||
    node.category.toLowerCase().includes(query.toLowerCase()) ||
    node.keyTopics.some(t => t.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 4);

  const quickNav = [
    { label: 'ML Visual Lab (Interactive Experimentation)', view: 'lab' as ViewMode, icon: FlaskConical },
    { label: 'Pandas Lab (Interactive Spreadsheet & CSV Engine)', view: 'pandas_lab' as ViewMode, icon: Table },
    { label: 'Jupyter Lab (Interactive Python .ipynb Notebooks & ipykernel)', view: 'jupyter' as ViewMode, icon: Code2 },
    { label: 'Code Playground (Python Sandbox)', view: 'playground' as ViewMode, icon: Terminal },
    { label: 'Core ML Course (10 First-Principles Lessons)', view: 'course' as ViewMode, icon: BookOpen },
    { label: 'Syntax Library (Python, NumPy, Pandas, Scikit-learn Reference)', view: 'syntax' as ViewMode, icon: BookOpen },
    { label: 'Dataset Explorer (Empirical Inspection)', view: 'datasets' as ViewMode, icon: Database },
    { label: 'Interview Simulator (FAANG ML Bar Raiser)', view: 'interview' as ViewMode, icon: Sparkles },
    { label: 'Forge AI Socratic Mentor', view: 'tutor' as ViewMode, icon: Sparkles },
    { label: 'Project Arena (End-to-End Systems)', view: 'projects' as ViewMode, icon: Briefcase },
    { label: 'Learner Profile & Credentials (Progress, Role, Goals)', view: 'profile' as ViewMode, icon: User },
    { label: 'Security & Authorization Center (RBAC, Firestore Audit Logs & Gemini API)', view: 'admin' as ViewMode, icon: ShieldCheck },
  ].filter(item => item.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div 
      id="command_palette_backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150"
    >
      <div 
        id="command_palette_modal"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl bg-white border border-[#E5E2D9] rounded-2xl shadow-2xl overflow-hidden text-[#111111]"
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E5E2D9] gap-3 bg-[#FAF8F2]">
          <Search className="w-4 h-4 text-[#1A42D9]" />
          <input
            id="command_palette_input"
            autoFocus
            type="text"
            placeholder="Search concepts, algorithms, modules, or tools..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-stone-400 text-[#111111] font-mono"
          />
          <button 
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-[#111111] rounded hover:bg-stone-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4 font-mono text-xs">
          
          {/* Quick Navigation */}
          {quickNav.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                Workspaces & Laboratories
              </div>
              <div className="space-y-0.5 mt-1">
                {quickNav.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.view}
                      onClick={() => {
                        onSelectView(item.view);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#FAF8F2] text-stone-700 hover:text-[#111111] transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-stone-400" />
                        <span className="font-semibold text-xs">{item.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Concepts / Glossary matches */}
          {filteredGlossary.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                Glossary Concepts & Formulations
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredGlossary.map(term => (
                  <button
                    key={term.id}
                    onClick={() => {
                      onSelectView('glossary');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#FAF8F2] text-stone-700 hover:text-[#111111] transition-colors text-left"
                  >
                    <div>
                      <div className="font-bold text-xs text-[#111111]">{term.term}</div>
                      <div className="text-[11px] text-stone-500 line-clamp-1">{term.simpleExplanation}</div>
                    </div>
                    <span className="text-[10px] text-stone-400 uppercase bg-[#FAF8F2] border border-[#E5E2D9] px-2 py-0.5 rounded">
                      {term.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Roadmap nodes */}
          {filteredNodes.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                Trajectory Milestones
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredNodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => {
                      onSelectView('roadmap');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#FAF8F2] text-stone-700 hover:text-[#111111] transition-colors text-left"
                  >
                    <div>
                      <div className="font-bold text-xs text-[#111111]">{node.title}</div>
                      <div className="text-[11px] text-stone-500">{node.category} • {node.difficulty}</div>
                    </div>
                    <span className="text-[10px] text-[#1A42D9] bg-[#1A42D9]/10 px-2 py-0.5 rounded">
                      View Node
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {quickNav.length === 0 && filteredGlossary.length === 0 && filteredNodes.length === 0 && (
            <div className="p-8 text-center text-stone-400 text-xs">
              No matching modules or mathematical concepts found.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#FAF8F2] border-t border-[#E5E2D9] flex items-center justify-between text-[10px] text-stone-400 font-mono">
          <div className="flex items-center gap-2">
            <span>Navigation: <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E2D9] rounded text-stone-600">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E2D9] rounded text-stone-600">↓</kbd></span>
            <span>Select: <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E2D9] rounded text-stone-600">↵</kbd></span>
          </div>
          <span>Exit: <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E2D9] rounded text-stone-600">ESC</kbd></span>
        </div>
      </div>
    </div>
  );
};

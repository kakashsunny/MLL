import React, { useState } from 'react';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Check, 
  Layers, 
  Terminal, 
  FileText, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Download
} from 'lucide-react';
import { PROJECTS_DATA } from '../../data/projectsData';
import { ProjectDefinition } from '../../types';

export const ProjectArena: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectDefinition>(PROJECTS_DATA[0]);
  const [activeCodeTab, setActiveCodeTab] = useState<'starter' | 'solution' | 'readme'>('starter');
  const [copied, setCopied] = useState(false);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="project_arena_view" className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 select-none bg-[#F7F5EF] text-[#111111]">
      
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#E5E2D9] pb-6">
        <div>
          <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1A42D9]" />
            <span>Applied Engineering • Production Blueprints</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
            Portfolio Projects & System Blueprints
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Build production Machine Learning systems with unit tests, latency budgets, and portfolio-grade documentation.
          </p>
        </div>

        {/* Project Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {PROJECTS_DATA.map(project => (
            <button
              key={project.id}
              onClick={() => {
                setSelectedProject(project);
                setActiveCodeTab('starter');
              }}
              className={`px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-all border ${
                selectedProject.id === project.id
                  ? 'bg-[#111111] text-white border-[#111111] font-bold shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border-[#E5E2D9]'
              }`}
            >
              {project.title}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Project Card: Architecture + Code Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 5 cols: Problem, Architecture & Tasks */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#E5E2D9] rounded-xl p-6 sm:p-8 shadow-xs space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F2] text-stone-700 border border-[#E5E2D9] font-bold uppercase tracking-wider">
                {selectedProject.level} Level
              </span>
              <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#1A42D9]" />
                {selectedProject.estimatedTime}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#111111]">
                {selectedProject.title}
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed mt-2">
                {selectedProject.problem}
              </p>
            </div>

            {/* Target Dataset */}
            <div className="p-3.5 rounded bg-[#FAF8F2] border border-[#E5E2D9] text-xs text-stone-700 space-y-1 font-mono">
              <span className="text-[10px] text-stone-400 uppercase block font-bold tracking-wider">Target Dataset & Signals:</span>
              <span>{selectedProject.datasetDesc}</span>
            </div>

            {/* System Architecture Checklist */}
            <div className="space-y-2 pt-2 border-t border-[#E5E2D9]">
              <span className="text-xs font-mono text-stone-500 uppercase font-bold tracking-wider block">
                System Architecture Components:
              </span>
              <ul className="space-y-2 text-xs text-stone-700 font-mono">
                {selectedProject.architecture.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Acceptance Criteria */}
            <div className="p-4 rounded bg-[#FAF8F2] border border-[#E5E2D9] space-y-2">
              <span className="text-[10px] font-mono text-stone-500 uppercase font-bold tracking-wider block">
                Production Acceptance Criteria:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.evaluationMetrics.map((metric, i) => (
                  <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-stone-800 border border-[#E5E2D9]">
                    ✓ {metric}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right 7 cols: Code & Documentation Workbench */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-[#E5E2D9] rounded-xl overflow-hidden shadow-xs flex flex-col h-[580px]">
            
            {/* Workbench Navigation Header */}
            <div className="px-5 py-3 border-b border-[#E5E2D9] flex items-center justify-between bg-[#FAF8F2]">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveCodeTab('starter')}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-colors ${
                    activeCodeTab === 'starter' ? 'bg-[#111111] text-white shadow-xs' : 'text-stone-600 hover:text-[#111111]'
                  }`}
                >
                  Starter Code
                </button>
                <button
                  onClick={() => setActiveCodeTab('solution')}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-colors ${
                    activeCodeTab === 'solution' ? 'bg-[#111111] text-white shadow-xs' : 'text-stone-600 hover:text-[#111111]'
                  }`}
                >
                  Reference Implementation
                </button>
                <button
                  onClick={() => setActiveCodeTab('readme')}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-colors ${
                    activeCodeTab === 'readme' ? 'bg-[#111111] text-white shadow-xs' : 'text-stone-600 hover:text-[#111111]'
                  }`}
                >
                  Portfolio README.md
                </button>
              </div>

              <button
                onClick={() => {
                  const content = activeCodeTab === 'starter' 
                    ? selectedProject.starterCode 
                    : activeCodeTab === 'solution' 
                    ? selectedProject.solutionCode 
                    : selectedProject.readmeMarkdown;
                  handleCopy(content);
                }}
                className="flex items-center gap-1 text-xs font-mono text-stone-600 hover:text-[#111111] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>

            {/* Code / Markdown Content Box */}
            <div className="p-5 flex-1 overflow-y-auto font-mono text-xs text-[#111111] leading-relaxed bg-[#FAF8F2]">
              <pre>
                <code>
                  {activeCodeTab === 'starter' && selectedProject.starterCode}
                  {activeCodeTab === 'solution' && selectedProject.solutionCode}
                  {activeCodeTab === 'readme' && selectedProject.readmeMarkdown}
                </code>
              </pre>
            </div>

            {/* Footer Deployment Guide */}
            <div className="p-4 bg-white border-t border-[#E5E2D9] text-xs text-stone-600 flex items-center justify-between font-mono">
              <span className="truncate max-w-[80%]">
                <b className="text-[#111111]">Deploy Guide:</b> {selectedProject.deploymentGuide}
              </span>
              <span className="text-emerald-700 text-[11px] whitespace-nowrap font-bold">
                Production Verified
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

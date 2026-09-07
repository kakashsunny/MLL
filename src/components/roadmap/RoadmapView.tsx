import React, { useState } from 'react';
import { 
  GitFork, 
  CheckCircle2, 
  Circle, 
  Lock, 
  Clock, 
  ArrowRight, 
  Layers, 
  BookOpen,
  Filter,
  Sparkles,
  Award,
  Compass,
  TrendingUp,
  Activity
} from 'lucide-react';
import { ROADMAP_NODES } from '../../data/roadmapData';
import { RoadmapNode, ViewMode } from '../../types';

interface RoadmapViewProps {
  onSelectView?: (view: ViewMode) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ onSelectView }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeNode, setActiveNode] = useState<RoadmapNode>(ROADMAP_NODES[7]); // Decision Trees

  const filters = [
    'All',
    'Foundations',
    'Core ML',
    'Advanced ML',
    'Deep Learning',
    'Modern AI',
    'Production'
  ];

  const filteredNodes = selectedFilter === 'All'
    ? ROADMAP_NODES
    : ROADMAP_NODES.filter(n => n.category === selectedFilter);

  return (
    <div id="roadmap_view" className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 select-none bg-[#F7F5EF] text-[#111111]">
      
      {/* 1. Header & Research Trajectory Overview */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#E5E2D9] pb-6">
        <div>
          <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1A42D9]" />
            <span>Curriculum Trajectory • Mastery Graph</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
            Skill Tree & Research Trajectory
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            An empirical path from numerical linear algebra to distributed foundation models and production MLOps.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {filters.map(filt => (
            <button
              key={filt}
              onClick={() => setSelectedFilter(filt)}
              className={`px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-all border ${
                selectedFilter === filt
                  ? 'bg-[#111111] text-white border-[#111111] font-bold shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border-[#E5E2D9]'
              }`}
            >
              {filt}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Intelligent Recommendation: "What should I learn next?" */}
      <div className="bg-white border-[3px] border-[#111111] rounded-none p-5 sm:p-6 shadow-[6px_6px_0px_0px_#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-none bg-[#1A42D9] text-white shrink-0 mt-0.5 border-[2px] border-[#111111]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A42D9]">
              RECOMMENDED NEXT TRAJECTORY
            </div>
            <h3 className="text-sm font-bold text-[#111111] mt-0.5">
              Decision Trees & Recursive Entropy Partitioning
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Based on your mastery of Linear Algebra and Supervised Classifiers, this node unlocks Ensemble Forests and Gradient Boosting.
            </p>
          </div>
        </div>

        <button
          onClick={() => onSelectView?.('course')}
          className="px-4 py-2 rounded-none bg-[#111111] hover:bg-[#1A42D9] text-white text-xs font-mono font-bold uppercase tracking-wider shrink-0 transition-all border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-2"
        >
          <span>CONTINUE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Main Grid: Nodes Matrix (8 cols) + Node Detail Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Skill Nodes Matrix (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredNodes.map(node => {
            const isSelected = activeNode.id === node.id;
            const isCompleted = node.status === 'completed';
            const isInProgress = (node.status as string) === 'in_progress' || (node.status as string) === 'current';
            const isAvailable = node.status === 'available';
            const isLocked = node.status === 'locked';

            return (
              <div
                key={node.id}
                onClick={() => setActiveNode(node)}
                className={`p-5 rounded-none border-[3px] border-[#111111] cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white shadow-[6px_6px_0px_0px_#111111] -translate-x-0.5 -translate-y-0.5'
                    : isCompleted
                    ? 'bg-white shadow-[4px_4px_0px_0px_#111111] hover:shadow-[6px_6px_0px_0px_#111111]'
                    : isInProgress
                    ? 'bg-white shadow-[4px_4px_0px_0px_#1A42D9] hover:shadow-[6px_6px_0px_0px_#111111]'
                    : isAvailable
                    ? 'bg-white shadow-[4px_4px_0px_0px_#111111] hover:shadow-[6px_6px_0px_0px_#111111]'
                    : 'bg-[#F4F1E8] opacity-75 shadow-[2px_2px_0px_0px_#111111]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                    <span className="text-stone-500 uppercase tracking-wider font-bold">{node.category}</span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 border border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mastered</span>
                      </span>
                    )}
                    {isInProgress && (
                      <span className="flex items-center gap-1 text-[#1A42D9] font-bold bg-blue-50 px-1.5 py-0.5 border border-[#1A42D9]">
                        <Circle className="w-2.5 h-2.5 fill-[#1A42D9]" />
                        <span>Active ({node.progressPercent ?? node.progress ?? 0}%)</span>
                      </span>
                    )}
                    {isAvailable && (
                      <span className="text-stone-600 font-bold bg-[#FAF8F2] px-1.5 py-0.5 border border-stone-400">Ready</span>
                    )}
                    {isLocked && (
                      <span className="flex items-center gap-1 text-stone-500 font-medium">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#111111] mb-1">
                    {node.title}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {node.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-stone-600 mt-5 pt-3 border-t-[2px] border-[#111111]">
                  <span className="flex items-center gap-1 font-bold">
                    <Clock className="w-3 h-3" />
                    {node.estimatedHours}h
                  </span>
                  <span className="text-amber-800 font-bold">
                    +{node.xpReward || 250} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Node Inspector Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border-[3px] border-[#111111] rounded-none p-6 shadow-[6px_6px_0px_0px_#111111] space-y-5 sticky top-24">
            
            <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-[#FAF8F2] text-stone-800 border-[1.5px] border-[#111111] font-bold uppercase tracking-wider shadow-[1px_1px_0px_0px_#111111]">
                {activeNode.category}
              </span>
              <span className="text-xs font-mono font-bold text-stone-600">
                {activeNode.estimatedHours} Hours Required
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#111111]">
                {activeNode.title}
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed mt-2">
                {activeNode.description}
              </p>
            </div>

            {/* Confidence & Retention Rating */}
            <div className="p-3.5 bg-[#FAF8F2] rounded-none border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-stone-700 font-bold">Skill Confidence Level:</span>
                <span className="font-bold text-[#111111]">
                  {activeNode.status === 'completed' ? '98% (Retained)' : activeNode.status === 'in_progress' ? '72% (In Training)' : '0% (Uninitiated)'}
                </span>
              </div>
              <div className="w-full h-2 bg-stone-200 rounded-none border border-[#111111] overflow-hidden">
                <div 
                  className={`h-full ${
                    activeNode.status === 'completed' ? 'bg-emerald-600 w-[98%]' : activeNode.status === 'in_progress' ? 'bg-[#1A42D9] w-[72%]' : 'w-0'
                  }`} 
                />
              </div>
            </div>

            {/* Prerequisites */}
            {activeNode.prerequisites && activeNode.prerequisites.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-stone-500 uppercase font-bold tracking-wider block">
                  Prerequisites Required:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeNode.prerequisites.map(prereq => (
                    <span key={prereq} className="text-[11px] font-mono px-2 py-0.5 rounded-none bg-[#FAF8F2] text-stone-800 border-[1.5px] border-[#111111] font-bold">
                      ✓ {prereq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Topics */}
            {activeNode.keyTopics && (
              <div className="space-y-2 pt-2 border-t-[2px] border-[#111111]">
                <span className="text-xs font-mono text-stone-700 uppercase font-bold tracking-wider block">
                  Syllabus & Core Competencies:
                </span>
                <ul className="space-y-1.5 text-xs text-stone-800 font-mono">
                  {activeNode.keyTopics.map((topic, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#1A42D9] font-bold">0{idx + 1}.</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action CTA */}
            <button
              onClick={() => onSelectView?.('course')}
              className="w-full py-3 px-4 rounded-none bg-[#111111] hover:bg-[#1A42D9] text-white font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <span>LAUNCH LESSON</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

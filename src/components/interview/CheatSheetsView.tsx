import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Copy, 
  Check, 
  Sparkles, 
  Terminal, 
  BookOpen, 
  Lightbulb, 
  Layers 
} from 'lucide-react';
import { ML_CHEAT_SHEETS, CheatSheetTopic } from '../../data/interview/cheatSheetsData';

export const CheatSheetsView: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(ML_CHEAT_SHEETS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const activeTopic: CheatSheetTopic = 
    ML_CHEAT_SHEETS.find(t => t.id === selectedTopicId) || ML_CHEAT_SHEETS[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Topic Switcher */}
      <div className="p-5 bg-white border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-[#1A42D9]">
              Developer Syntax & Formula Vault
            </div>
            <h2 className="text-xl font-black text-[#111111]">
              Machine Learning Production Cheat Sheets
            </h2>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search syntax, functions, formulas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F2] border border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#1A42D9] font-mono"
            />
          </div>
        </div>

        {/* Topic Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {ML_CHEAT_SHEETS.map(topic => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopicId(topic.id)}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all shrink-0 border border-[#111111] ${
                selectedTopicId === topic.id
                  ? 'bg-[#111111] text-white shadow-[2px_2px_0px_0px_rgba(26,66,217,1)]'
                  : 'bg-[#FAF8F2] text-stone-700 hover:bg-stone-200'
              }`}
            >
              {topic.title}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Active Cheat Sheet Content */}
      <div className="space-y-6">
        {activeTopic.sections.map(sec => {
          const items = sec.items.filter(item => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
              item.name.toLowerCase().includes(q) ||
              item.syntax.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q) ||
              item.example.toLowerCase().includes(q)
            );
          });

          if (items.length === 0) return null;

          return (
            <div key={sec.id} className="p-6 bg-white border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] space-y-4">
              <div className="border-b border-[#E5E2D9] pb-3 space-y-1">
                <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#1A42D9]" />
                  <span>{sec.title}</span>
                </h3>
                <p className="text-xs text-stone-500 font-sans">
                  {sec.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {items.map((item, idx) => {
                  const itemId = `${sec.id}_${idx}`;
                  const isCopied = copiedIndex === itemId;

                  return (
                    <div key={idx} className="p-4 bg-[#FAF8F2] border border-[#E5E2D9] space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-[#111111] bg-white px-2 py-0.5 border border-[#111111]">
                          {item.name}
                        </span>

                        <button
                          onClick={() => handleCopy(item.example, itemId)}
                          className="px-2 py-1 text-[10px] font-mono uppercase font-bold bg-white hover:bg-stone-100 border border-[#111111] flex items-center gap-1"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {/* Syntax Box */}
                      <div className="p-2 bg-white border border-stone-300 font-mono text-xs text-stone-900 overflow-x-auto">
                        <code>{item.syntax}</code>
                      </div>

                      {/* Explanation */}
                      <p className="text-xs text-stone-700 font-sans leading-relaxed">
                        {item.description}
                      </p>

                      {/* Example */}
                      <div className="p-3 bg-[#111111] text-[#22C55E] font-mono text-xs overflow-x-auto border border-stone-800">
                        <pre>{item.example}</pre>
                      </div>

                      {/* Tip */}
                      {item.tip && (
                        <div className="p-2 bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 font-sans flex items-start gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span><span className="font-bold">Bar Raiser Pro Tip: </span>{item.tip}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

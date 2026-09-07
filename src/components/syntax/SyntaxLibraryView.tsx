import React, { useState, useMemo } from 'react';
import { 
  getAllSyntaxEntries, 
  searchSyntaxLibrary 
} from '../../data/syntax/syntaxLibraryData';
import { SyntaxEntry, SyntaxLibrary } from '../../data/syntax/types';
import { ViewMode } from '../../types';
import { 
  Search, 
  BookOpen, 
  Copy, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Terminal, 
  ExternalLink, 
  Layers, 
  Clock, 
  Database, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  HelpCircle, 
  Sliders, 
  Send, 
  Bot, 
  Key, 
  Lightbulb, 
  Tag 
} from 'lucide-react';
import { askAITutor, getCustomGeminiKey, setCustomGeminiKey } from '../../services/geminiService';
import { cleanPlainText } from '../../utils/textFormatter';

interface SyntaxLibraryViewProps {
  onSelectView?: (view: ViewMode) => void;
  onLoadCodeInPlayground?: (code: string) => void;
}

export const SyntaxLibraryView: React.FC<SyntaxLibraryViewProps> = ({ 
  onSelectView, 
  onLoadCodeInPlayground 
}) => {
  const [selectedLibrary, setSelectedLibrary] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Dynamic AI interaction state for specific syntax entries
  const [aiActiveEntryId, setAiActiveEntryId] = useState<string | null>(null);
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponses, setAiResponses] = useState<Record<string, { prompt: string; response: string }[]>>({});

  // API Key modal
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>(getCustomGeminiKey());
  const [keySavedMessage, setKeySavedMessage] = useState<string>('');

  const allEntries = useMemo(() => getAllSyntaxEntries(), []);

  // Filter categories dynamically based on selected library
  const availableCategories = useMemo(() => {
    const list = selectedLibrary === 'all' 
      ? allEntries 
      : allEntries.filter(e => e.library === selectedLibrary);
    const set = new Set<string>();
    list.forEach(e => set.add(e.category));
    return ['all', ...Array.from(set)];
  }, [allEntries, selectedLibrary]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return searchSyntaxLibrary(searchQuery, selectedLibrary, selectedCategory);
  }, [searchQuery, selectedLibrary, selectedCategory]);

  // Count by library
  const libraryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allEntries.length,
      python: allEntries.filter(e => e.library === 'python').length,
      numpy: allEntries.filter(e => e.library === 'numpy').length,
      pandas: allEntries.filter(e => e.library === 'pandas').length,
      sklearn: allEntries.filter(e => e.library === 'sklearn').length
    };
    return counts;
  }, [allEntries]);

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id]
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenPlayground = (code: string) => {
    if (onLoadCodeInPlayground) {
      onLoadCodeInPlayground(code);
    }
    if (onSelectView) {
      onSelectView('playground');
    }
  };

  // Dynamic AI Query for an Entry
  const handleAskAI = async (entry: SyntaxEntry, promptQuestion?: string) => {
    const question = promptQuestion || aiCustomPrompt || `Explain how ${entry.name} operates internally in memory and how it is questioned in FAANG ML interviews.`;
    if (!question.trim()) return;

    setAiLoading(true);
    setAiActiveEntryId(entry.id);

    try {
      const response = await askAITutor(
        question,
        `${entry.name} (${entry.library})`,
        `The learner is reviewing the Syntax Library entry:
Function: ${entry.name}
Signature: ${entry.signature}
Library: ${entry.library}
Summary: ${entry.summary}
Parameters: ${JSON.stringify(entry.parameters)}
Common Pitfalls: ${JSON.stringify(entry.commonPitfalls)}

Provide a dynamic, highly technical, clear response with concrete memory models and first-principles intuition. Do not use markdown headers # or bold asterisks **. Use plain text uppercase section headers.`,
        'Socratic Teach'
      );

      setAiResponses(prev => {
        const existing = prev[entry.id] || [];
        return {
          ...prev,
          [entry.id]: [...existing, { prompt: question, response: cleanPlainText(response) }]
        };
      });
      setAiCustomPrompt('');
    } catch (err) {
      setAiResponses(prev => {
        const existing = prev[entry.id] || [];
        return {
          ...prev,
          [entry.id]: [
            ...existing,
            {
              prompt: question,
              response: `MEMORY & IMPLEMENTATION MECHANICS FOR ${entry.name.toUpperCase()}\n\n1. Vectorized Memory Execution:\nUnder the hood, this function maps operations across contiguous buffer strides without allocating intermediate Python PyObject wrappers.\n\n2. Complexity:\nTime: ${entry.complexity?.time || 'O(N)'}\nSpace: ${entry.complexity?.space || 'O(1)'}\n\n3. Interview Focal Point:\nBe prepared to explain when this triggers a 0-copy view versus an expensive deep buffer copy.`
            }
          ]
        };
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    setCustomGeminiKey(tempApiKey);
    setKeySavedMessage(tempApiKey.trim() ? '✓ Custom Gemini API Key saved and active!' : '✓ Reset to NeuraForge gateway key.');
    setTimeout(() => {
      setKeySavedMessage('');
      setShowKeyModal(false);
    }, 1200);
  };

  const getLibraryBadgeStyle = (lib: SyntaxLibrary) => {
    switch (lib) {
      case 'python':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'numpy':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'pandas':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'sklearn':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  const getLibraryLabel = (lib: SyntaxLibrary) => {
    switch (lib) {
      case 'python':
        return 'Python Core';
      case 'numpy':
        return 'NumPy';
      case 'pandas':
        return 'Pandas';
      case 'sklearn':
        return 'Scikit-Learn';
      default:
        return lib;
    }
  };

  return (
    <div id="syntax_library_page" className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen text-[#111111] space-y-6 select-text pb-24">
      {/* 1. Header & Search Banner */}
      <div className="bg-white border-2 border-[#111111] p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 bg-[#1A42D9] border border-[#111111]" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-stone-500">
                NeuraForge Reference Engine • 0-Copy & Interview Mechanics
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
              Syntax Library
            </h1>
            <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-3xl leading-relaxed">
              Exhaustive technical reference for <span className="font-semibold text-[#111111]">Python, NumPy, Pandas, and Scikit-learn</span>. 
              Designed for ML engineers and interview candidates, with memory layout pitfalls, parameter schemas, and company-verified interview use cases.
            </p>
          </div>

          {/* Quick Actions / API Key status */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="syntax_key_config_btn"
              onClick={() => {
                setTempApiKey(getCustomGeminiKey());
                setShowKeyModal(true);
              }}
              className="px-3.5 py-2 text-xs font-mono font-bold border border-[#111111] bg-[#FAF8F2] hover:bg-[#111111] hover:text-white transition-all flex items-center gap-2 shadow-xs"
            >
              <Key className="w-3.5 h-3.5 text-[#1A42D9]" />
              <span>{getCustomGeminiKey() ? 'Custom API Key Active' : 'Configure Gemini API Key'}</span>
            </button>

            {onSelectView && (
              <button
                id="syntax_open_tutor_btn"
                onClick={() => onSelectView('tutor')}
                className="px-4 py-2 text-xs font-mono font-bold border-2 border-[#111111] bg-[#111111] text-white hover:bg-[#1A42D9] hover:border-[#1A42D9] transition-all flex items-center gap-2 shadow-xs"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask Forge AI Mentor</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 space-y-4 pt-6 border-t border-[#E5E2D9]">
          <div className="flex flex-col md:flex-row items-stretch gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                id="syntax_search_input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search functions, parameters, memory pitfalls, interview questions (e.g. 'broadcasting', 'reshape', 'fit_transform')..."
                className="w-full pl-10 pr-10 py-2.5 bg-[#FAF8F2] border border-[#111111] font-mono text-xs sm:text-sm text-[#111111] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1A42D9]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-stone-400 hover:text-[#111111]"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="w-full md:w-64">
              <select
                id="syntax_category_select"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full py-2.5 px-3 bg-[#FAF8F2] border border-[#111111] font-mono text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#1A42D9]"
              >
                <option value="all">All Categories ({filteredEntries.length})</option>
                {availableCategories.filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Library Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Libraries', count: libraryCounts.all },
              { id: 'python', label: 'Python Core', count: libraryCounts.python },
              { id: 'numpy', label: 'NumPy', count: libraryCounts.numpy },
              { id: 'pandas', label: 'Pandas', count: libraryCounts.pandas },
              { id: 'sklearn', label: 'Scikit-Learn', count: libraryCounts.sklearn },
            ].map(tab => {
              const active = selectedLibrary === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`syntax_tab_${tab.id}`}
                  onClick={() => {
                    setSelectedLibrary(tab.id);
                    setSelectedCategory('all');
                  }}
                  className={`px-4 py-2 font-mono text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-2 ${
                    active
                      ? 'bg-[#111111] text-white border-[#111111] shadow-[2px_2px_0px_0px_rgba(26,66,217,1)]'
                      : 'bg-white text-stone-700 border-stone-300 hover:border-[#111111] hover:bg-stone-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Results Header */}
      <div className="flex items-center justify-between text-xs font-mono text-stone-500 px-1">
        <div>
          Showing <span className="font-bold text-[#111111]">{filteredEntries.length}</span> documented syntax definitions
          {searchQuery && <span> matching "<span className="text-[#1A42D9] font-bold">{searchQuery}</span>"</span>}
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Contiguous 0-Copy
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Deep Allocating Copy
          </span>
        </div>
      </div>

      {/* 3. Empty State */}
      {filteredEntries.length === 0 && (
        <div className="bg-white border-2 border-dashed border-stone-300 p-12 text-center space-y-4">
          <HelpCircle className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-lg font-bold text-[#111111]">No Syntax Entries Found</h3>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            No functions matched your query "{searchQuery}". Try searching by library, parameter name, or general keyword (e.g., "broadcasting", "reshape", "fit").
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLibrary('all');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-[#111111] text-white font-mono text-xs font-bold hover:bg-[#1A42D9] transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* 4. Entries Grid / Cards */}
      <div className="space-y-6">
        {filteredEntries.map(entry => {
          const isExpanded = expandedCards[entry.id] !== false; // expanded by default
          const aiHistory = aiResponses[entry.id] || [];

          return (
            <div
              key={entry.id}
              id={`syntax_card_${entry.id}`}
              className="bg-white border-2 border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] overflow-hidden transition-all"
            >
              {/* Card Header */}
              <div className="p-5 sm:p-6 border-b border-[#E5E2D9] bg-[#FAF8F2] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider border rounded-xs ${getLibraryBadgeStyle(entry.library)}`}>
                      {getLibraryLabel(entry.library)}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-mono text-stone-600 bg-white border border-stone-300 rounded-xs">
                      {entry.category}
                    </span>
                    {entry.complexity && (
                      <span className="px-2 py-0.5 text-[10px] font-mono text-stone-500 bg-stone-100 border border-stone-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        Time: {entry.complexity.time} | Space: {entry.complexity.space}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-mono font-extrabold text-[#111111] tracking-tight">
                    {entry.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <code className="text-xs sm:text-sm font-mono text-[#1A42D9] font-bold break-all bg-white px-2 py-1 border border-blue-100">
                      {entry.signature}
                    </code>
                    <button
                      id={`copy_sig_${entry.id}`}
                      onClick={() => copyToClipboard(entry.signature, `sig_${entry.id}`)}
                      title="Copy Signature"
                      className="p-1.5 hover:bg-stone-200 text-stone-600 transition-colors"
                    >
                      {copiedId === `sig_${entry.id}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 self-start md:self-center">
                  <button
                    id={`syntax_ask_ai_${entry.id}`}
                    onClick={() => {
                      if (aiActiveEntryId === entry.id) {
                        setAiActiveEntryId(null);
                      } else {
                        setAiActiveEntryId(entry.id);
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-mono font-bold border flex items-center gap-1.5 transition-all ${
                      aiActiveEntryId === entry.id
                        ? 'bg-[#1A42D9] text-white border-[#1A42D9]'
                        : 'bg-white text-stone-700 border-[#111111] hover:bg-stone-50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Dynamic AI Mentor</span>
                  </button>

                  <button
                    onClick={() => handleOpenPlayground(entry.codeExample)}
                    title="Load snippet in Playground"
                    className="px-3 py-1.5 text-xs font-mono font-bold border border-[#111111] bg-white text-stone-800 hover:bg-[#111111] hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Playground</span>
                  </button>

                  <button
                    onClick={() => toggleExpand(entry.id)}
                    className="p-1.5 text-stone-500 hover:text-[#111111] hover:bg-stone-200 transition-colors"
                    title={isExpanded ? 'Collapse card' : 'Expand card'}
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Summary & Practical Usage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#FAF8F2] border border-[#E5E2D9] space-y-1.5">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A42D9]">
                        Core Objective & Mechanics
                      </div>
                      <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                        {entry.summary}
                      </p>
                    </div>

                    <div className="p-4 bg-[#FAF8F2] border border-[#E5E2D9] space-y-1.5">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700">
                        Production ML Usage Scenario
                      </div>
                      <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                        {entry.usage}
                      </p>
                    </div>
                  </div>

                  {/* Parameters Table */}
                  {entry.parameters && entry.parameters.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-stone-500" />
                        <span>Parameters & Keyword Arguments</span>
                      </div>
                      <div className="overflow-x-auto border border-[#E5E2D9]">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-[#FAF8F2] border-b border-[#E5E2D9] text-stone-600">
                            <tr>
                              <th className="p-2.5 font-bold">Parameter</th>
                              <th className="p-2.5 font-bold">Type</th>
                              <th className="p-2.5 font-bold">Default</th>
                              <th className="p-2.5 font-bold">Status</th>
                              <th className="p-2.5 font-bold">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5E2D9]">
                            {entry.parameters.map((param, pIdx) => (
                              <tr key={pIdx} className="hover:bg-stone-50">
                                <td className="p-2.5 font-bold text-[#111111]">{param.name}</td>
                                <td className="p-2.5 text-blue-700">{param.type}</td>
                                <td className="p-2.5 text-stone-500">{param.defaultVal || 'None'}</td>
                                <td className="p-2.5">
                                  {param.isRequired ? (
                                    <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5">Required</span>
                                  ) : (
                                    <span className="text-[10px] text-stone-500 bg-stone-100 border border-stone-200 px-1.5 py-0.5">Optional</span>
                                  )}
                                </td>
                                <td className="p-2.5 font-sans text-stone-700 leading-normal">{param.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Code Example & Output */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-stone-600">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-3.5 h-3.5 text-stone-500" />
                        <span>Production Code Example</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(entry.codeExample, `code_${entry.id}`)}
                        className="flex items-center gap-1 text-[11px] text-stone-600 hover:text-[#111111] font-mono"
                      >
                        {copiedId === `code_${entry.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === `code_${entry.id}` ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    </div>

                    <div className="rounded-none bg-[#111111] text-[#E5E2D9] p-4 font-mono text-xs overflow-x-auto border-2 border-[#111111]">
                      <pre className="text-emerald-400 font-mono leading-relaxed">{entry.codeExample}</pre>
                    </div>

                    {entry.expectedOutput && (
                      <div className="bg-[#FAF8F2] border border-[#E5E2D9] p-3 text-xs font-mono space-y-1">
                        <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Terminal Output:</div>
                        <pre className="text-stone-700 whitespace-pre-wrap leading-relaxed">{entry.expectedOutput}</pre>
                      </div>
                    )}
                  </div>

                  {/* Common Pitfalls & Traps (High Importance) */}
                  {entry.commonPitfalls && entry.commonPitfalls.length > 0 && (
                    <div className="p-4 bg-amber-50/70 border border-amber-300 space-y-2">
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Common Engineering Pitfalls & Memory Traps</span>
                      </div>
                      <ul className="space-y-1.5 pl-5 list-disc text-xs sm:text-sm text-amber-950">
                        {entry.commonPitfalls.map((pit, pIdx) => (
                          <li key={pIdx} className="leading-relaxed">{pit}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Interview-Focused Use Cases */}
                  {entry.interviewUseCases && entry.interviewUseCases.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>Interview Scenarios & First-Principles Defense</span>
                      </div>
                      <div className="space-y-3">
                        {entry.interviewUseCases.map((ic, iIdx) => (
                          <div key={iIdx} className="p-4 bg-white border border-[#111111] space-y-2 shadow-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-mono text-xs font-bold text-[#1A42D9]">
                                Q{iIdx + 1}: {ic.question}
                              </span>
                              {ic.companyFocus && (
                                <div className="flex items-center gap-1">
                                  {ic.companyFocus.map((co, cIdx) => (
                                    <span key={cIdx} className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#FAF8F2] border border-[#E5E2D9] text-stone-700">
                                      {co}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-xs sm:text-sm text-stone-800 leading-relaxed pl-2 border-l-2 border-[#1A42D9]">
                              <span className="font-mono font-bold text-stone-600">Model Answer: </span>
                              {ic.answerSummary}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {entry.tags && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E5E2D9]">
                      <Tag className="w-3 h-3 text-stone-400" />
                      {entry.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 text-[10px] font-mono text-stone-600 bg-[#FAF8F2] border border-[#E5E2D9]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 5. In-Line Dynamic AI Interaction Drawer */}
                  {aiActiveEntryId === entry.id && (
                    <div className="mt-4 p-5 bg-[#FAF8F2] border-2 border-[#1A42D9] space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-[#1A42D9]" />
                          <span className="font-mono text-xs font-bold uppercase text-[#111111]">
                            Dynamic Forge AI Mentor • Live Interaction for {entry.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-stone-500">
                          Powered by Gemini Live Gateway
                        </span>
                      </div>

                      {/* Previous conversation turns for this entry */}
                      {aiHistory.length > 0 && (
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                          {aiHistory.map((item, idx) => (
                            <div key={idx} className="space-y-2">
                              <div className="p-3 bg-white border border-stone-300 text-xs font-mono text-[#111111]">
                                <span className="font-bold text-[#1A42D9]">YOU: </span>
                                {item.prompt}
                              </div>
                              <div className="p-4 bg-white border border-[#111111] text-xs sm:text-sm text-stone-800 font-mono whitespace-pre-wrap leading-relaxed shadow-xs">
                                <div className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Forge AI Insight:</div>
                                {item.response}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quick Prompt Presets */}
                      <div className="flex flex-wrap gap-2 text-xs font-mono">
                        <button
                          onClick={() => handleAskAI(entry, `Explain how ${entry.name} behaves with negative indexing or axis=-1 in memory.`)}
                          disabled={aiLoading}
                          className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-[#111111] text-stone-700 disabled:opacity-50"
                        >
                          Axis=-1 & Shape Intuition
                        </button>
                        <button
                          onClick={() => handleAskAI(entry, `Does ${entry.name} return a view or copy? Explain with C-contiguous pointers.`)}
                          disabled={aiLoading}
                          className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-[#111111] text-stone-700 disabled:opacity-50"
                        >
                          0-Copy View vs Deep Copy
                        </button>
                        <button
                          onClick={() => handleAskAI(entry, `Quiz me on ${entry.name} with a tough FAANG coding problem.`)}
                          disabled={aiLoading}
                          className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-[#111111] text-stone-700 disabled:opacity-50"
                        >
                          Simulate Interview Question
                        </button>
                      </div>

                      {/* Custom Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={aiCustomPrompt}
                          onChange={e => setAiCustomPrompt(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              handleAskAI(entry);
                            }
                          }}
                          placeholder={`Ask anything about ${entry.name} (e.g. "What happens if shapes don't broadcast?", "Compare to torch equivalent")...`}
                          className="flex-1 px-3 py-2 bg-white border border-[#111111] text-xs font-mono text-[#111111] placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#1A42D9]"
                        />
                        <button
                          onClick={() => handleAskAI(entry)}
                          disabled={aiLoading || !aiCustomPrompt.trim()}
                          className="px-4 py-2 bg-[#111111] hover:bg-[#1A42D9] text-white font-mono text-xs font-bold disabled:opacity-40 flex items-center gap-1 transition-colors"
                        >
                          {aiLoading ? <span>Reasoning...</span> : <><Send className="w-3 h-3" /><span>Ask</span></>}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 6. Custom Gemini Key Dialog */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#111111] shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#1A42D9]" />
                <h3 className="font-extrabold text-base text-[#111111]">Gemini API Key Configuration</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-stone-400 hover:text-[#111111] font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              NeuraForge includes a built-in Gemini AI Gateway. You can also paste your own Google Gemini API key here. Your key is stored strictly in your browser’s local storage and passed securely via proxy headers.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-stone-700">Gemini API Key</label>
              <input
                type="password"
                value={tempApiKey}
                onChange={e => setTempApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 bg-[#FAF8F2] border border-[#111111] font-mono text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#1A42D9]"
              />
            </div>

            {keySavedMessage && (
              <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2">
                {keySavedMessage}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setTempApiKey('');
                  setCustomGeminiKey('');
                  setKeySavedMessage('✓ Reset to platform default gateway.');
                  setTimeout(() => {
                    setKeySavedMessage('');
                    setShowKeyModal(false);
                  }, 1000);
                }}
                className="text-xs font-mono text-stone-500 hover:text-red-600 underline"
              >
                Clear / Use Default
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-1.5 text-xs font-mono border border-stone-300 text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveApiKey}
                  className="px-4 py-1.5 text-xs font-mono font-bold bg-[#111111] text-white hover:bg-[#1A42D9] transition-colors"
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

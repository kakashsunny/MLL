import React, { useState, useRef, useEffect } from 'react';
import { NotebookCell, CellType } from './types';
import { CellOutputRenderer } from './CellOutputRenderer';
import { 
  Play, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  Check, 
  Code, 
  FileText, 
  RotateCcw,
  Maximize2,
  Edit3
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface NotebookCellViewProps {
  cell: NotebookCell;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateSource: (newSource: string) => void;
  onExecute: () => void;
  onChangeType: (type: CellType) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onAskAI: (code: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const NotebookCellView: React.FC<NotebookCellViewProps> = ({
  cell,
  index,
  isSelected,
  onSelect,
  onUpdateSource,
  onExecute,
  onChangeType,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onAskAI,
  canMoveUp,
  canMoveDown
}) => {
  const [isEditingMarkdown, setIsEditingMarkdown] = useState(cell.cellType === 'markdown' && !cell.source);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(48, textareaRef.current.scrollHeight)}px`;
    }
  }, [cell.source, isEditingMarkdown, cell.cellType]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift+Enter to run cell
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      if (cell.cellType === 'markdown') {
        setIsEditingMarkdown(false);
      } else {
        onExecute();
      }
    } else if (e.key === 'Tab') {
      // Indent 4 spaces
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newSource = cell.source.substring(0, start) + '    ' + cell.source.substring(end);
      onUpdateSource(newSource);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cell.source);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      id={`jupyter_cell_${cell.id}`}
      onClick={onSelect}
      className={`relative group rounded-xl transition-all duration-150 border ${
        isSelected 
          ? 'border-[#1A42D9] shadow-md ring-1 ring-[#1A42D9]/20 bg-white' 
          : 'border-[#E5E2D9] hover:border-stone-400 bg-white/80'
      }`}
    >
      {/* Active Cell Left Accent Bar */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl transition-colors ${
          isSelected ? 'bg-[#1A42D9]' : 'bg-transparent group-hover:bg-stone-200'
        }`}
      />

      {/* Cell Header / Quick Controls Bar (Visible on Hover or when Selected) */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#F0ECE1] bg-[#FAF8F2] rounded-t-xl text-[11px] font-mono text-stone-500">
        <div className="flex items-center gap-2">
          {/* Cell Type Tag */}
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            cell.cellType === 'code' ? 'bg-blue-50 text-[#1A42D9] border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {cell.cellType}
          </span>
          <span className="text-stone-400">Cell #{index + 1}</span>
        </div>

        {/* Hover Action Buttons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {cell.cellType === 'code' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExecute();
              }}
              title="Run Cell (Shift + Enter)"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1A42D9] hover:bg-[#1535B0] text-white text-[11px] font-medium transition-colors shadow-2xs"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run</span>
            </button>
          )}

          {cell.cellType === 'markdown' && !isEditingMarkdown && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingMarkdown(true);
              }}
              title="Edit Markdown"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}

          {cell.cellType === 'markdown' && isEditingMarkdown && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingMarkdown(false);
              }}
              title="Render Markdown (Shift + Enter)"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-colors"
            >
              <Check className="w-3 h-3" />
              <span>Render</span>
            </button>
          )}

          {/* Type Toggle Switcher */}
          <select
            value={cell.cellType}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const newType = e.target.value as CellType;
              onChangeType(newType);
              if (newType === 'markdown') setIsEditingMarkdown(false);
            }}
            className="text-[11px] font-mono bg-white border border-[#E0DCCF] rounded px-1.5 py-0.5 text-stone-600 focus:outline-none"
          >
            <option value="code">Code</option>
            <option value="markdown">Markdown</option>
          </select>

          {/* Ask AI / Explain */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAskAI(cell.source);
            }}
            title="Ask Forge AI about this cell"
            className="p-1 hover:bg-blue-50 text-stone-500 hover:text-[#1A42D9] rounded transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {/* Move Up */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={!canMoveUp}
            title="Move Cell Up"
            className="p-1 hover:bg-stone-200 disabled:opacity-30 text-stone-500 rounded transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* Move Down */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={!canMoveDown}
            title="Move Cell Down"
            className="p-1 hover:bg-stone-200 disabled:opacity-30 text-stone-500 rounded transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Copy */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            title="Copy cell code"
            className="p-1 hover:bg-stone-200 text-stone-500 rounded transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete cell"
            className="p-1 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Cell Body */}
      <div className="p-3 sm:p-4">
        {cell.cellType === 'code' ? (
          <div className="flex items-start gap-3">
            {/* Gutter: In [n]: */}
            <div className="w-16 flex-shrink-0 text-right font-mono text-xs text-[#1A42D9] select-none pt-1 font-bold">
              {cell.isExecuting ? (
                <span className="animate-pulse text-amber-600 font-bold">In [*]:</span>
              ) : (
                `In [${cell.executionCount !== null ? cell.executionCount : ' '}]:`
              )}
            </div>

            {/* Code Input Textarea */}
            <div className="flex-1 min-w-0 bg-[#FBF9F5] border border-[#E5E2D9] rounded-lg p-2.5 focus-within:border-[#1A42D9] focus-within:ring-1 focus-within:ring-[#1A42D9]/20 transition-all">
              <textarea
                ref={textareaRef}
                value={cell.source}
                onChange={(e) => onUpdateSource(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="# Enter Python code here (Shift + Enter to run)..."
                spellCheck={false}
                rows={1}
                className="w-full bg-transparent font-mono text-xs sm:text-[13px] text-stone-900 resize-none focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        ) : (
          /* Markdown Cell Rendering / Editing */
          <div className="flex items-start gap-3">
            <div className="w-16 flex-shrink-0 text-right font-mono text-[11px] text-stone-400 select-none pt-1">
              [MD]:
            </div>
            <div className="flex-1 min-w-0">
              {isEditingMarkdown ? (
                <div className="bg-[#FAF8F2] border border-amber-300 rounded-lg p-2.5">
                  <textarea
                    ref={textareaRef}
                    value={cell.source}
                    onChange={(e) => onUpdateSource(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="# Markdown heading\nEnter narrative explanations here..."
                    spellCheck={false}
                    rows={2}
                    className="w-full bg-transparent font-mono text-xs sm:text-[13px] text-stone-900 resize-none focus:outline-none leading-relaxed"
                  />
                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-amber-200/60 text-[10px] font-mono text-stone-400">
                    <span>Markdown supported: # headers, **bold**, `code`, $$equations$$</span>
                    <button
                      onClick={() => setIsEditingMarkdown(false)}
                      className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded font-medium"
                    >
                      Done (Shift+Enter)
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onDoubleClick={() => setIsEditingMarkdown(true)}
                  title="Double-click to edit markdown"
                  className="prose prose-stone max-w-none px-2 py-1 cursor-text hover:bg-stone-50/50 rounded-lg transition-colors text-stone-800"
                >
                  {cell.source.trim() ? (
                    <div className="markdown-body">
                      <ReactMarkdown>{cell.source}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="text-stone-400 italic text-xs font-mono">Empty markdown cell (double-click to edit)</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cell Output Area */}
        {cell.cellType === 'code' && (
          <CellOutputRenderer 
            outputs={cell.outputs} 
            executionCount={cell.executionCount} 
          />
        )}
      </div>
    </div>
  );
};

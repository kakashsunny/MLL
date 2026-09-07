import React, { useState, useRef, useEffect, useMemo } from 'react';
import { JupyterNotebook, NotebookCell, CellType } from './types';
import { STARTER_NOTEBOOKS, BLANK_NOTEBOOK_TEMPLATE } from './notebookData';
import { JupyterKernel, exportToIpynbFormat, exportToPythonScript } from './kernelService';
import { NotebookCellView } from './NotebookCellView';
import { VariableInspector } from './VariableInspector';
import { 
  Play, 
  RotateCcw, 
  Plus, 
  Download, 
  FileCode, 
  Layers, 
  Sparkles, 
  Save, 
  Trash2, 
  ChevronDown, 
  FileText, 
  Cpu, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Code2,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Terminal
} from 'lucide-react';
import { explainCodeSnippet } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';

export const JupyterLab: React.FC = () => {
  // Available Notebooks
  const [notebooks, setNotebooks] = useState<JupyterNotebook[]>(STARTER_NOTEBOOKS);
  const [activeNotebookId, setActiveNotebookId] = useState<string>(STARTER_NOTEBOOKS[0].id);

  // Active Notebook Object
  const activeNotebook = useMemo(() => {
    return notebooks.find(nb => nb.id === activeNotebookId) || notebooks[0];
  }, [notebooks, activeNotebookId]);

  // Selected Cell
  const [selectedCellId, setSelectedCellId] = useState<string>(() => activeNotebook.cells[0]?.id || '');

  // Kernel Instance (persisted across cell runs)
  const kernelRef = useRef<JupyterKernel>(new JupyterKernel());
  const [isKernelBusy, setIsKernelBusy] = useState(false);
  const [variableInspectorOpen, setVariableInspectorOpen] = useState(false);
  const [variables, setVariables] = useState(() => kernelRef.current.getVariables());

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Socratic Mentor Drawer State
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeAiCellCode, setActiveAiCellCode] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync variables after cell execution
  const refreshVariables = () => {
    setVariables(kernelRef.current.getVariables());
  };

  // Helper to update cells in active notebook
  const updateActiveNotebookCells = (updateFn: (cells: NotebookCell[]) => NotebookCell[]) => {
    setNotebooks(prev => prev.map(nb => {
      if (nb.id === activeNotebook.id) {
        const updatedCells = updateFn(nb.cells);
        return {
          ...nb,
          cells: updatedCells,
          lastModified: 'Just now'
        };
      }
      return nb;
    }));
  };

  // Run a specific cell
  const handleExecuteCell = async (cellId: string, autoSelectNext: boolean = true) => {
    const cell = activeNotebook.cells.find(c => c.id === cellId);
    if (!cell) return;

    if (cell.cellType === 'markdown') {
      // Markdown cells just render
      updateActiveNotebookCells(cells => 
        cells.map(c => c.id === cellId ? { ...c, isEditingMarkdown: false } : c)
      );
      if (autoSelectNext) selectNextCell(cellId);
      return;
    }

    setIsKernelBusy(true);

    // Set cell executing indicator
    updateActiveNotebookCells(cells => 
      cells.map(c => c.id === cellId ? { ...c, isExecuting: true } : c)
    );

    try {
      const { executionCount, outputs } = await kernelRef.current.executeCell(cell);
      
      updateActiveNotebookCells(cells => 
        cells.map(c => c.id === cellId ? { 
          ...c, 
          executionCount, 
          outputs, 
          isExecuting: false 
        } : c)
      );

      refreshVariables();
      if (autoSelectNext) {
        selectNextCell(cellId);
      }
    } catch (err: any) {
      updateActiveNotebookCells(cells => 
        cells.map(c => c.id === cellId ? { 
          ...c, 
          isExecuting: false,
          outputs: [{ type: 'error', text: String(err) }]
        } : c)
      );
    } finally {
      setIsKernelBusy(false);
    }
  };

  // Run all cells sequentially
  const handleRunAllCells = async () => {
    setIsKernelBusy(true);
    kernelRef.current.reset();

    for (const cell of activeNotebook.cells) {
      if (cell.cellType === 'code') {
        updateActiveNotebookCells(cells => 
          cells.map(c => c.id === cell.id ? { ...c, isExecuting: true } : c)
        );
        const { executionCount, outputs } = await kernelRef.current.executeCell(cell);
        updateActiveNotebookCells(cells => 
          cells.map(c => c.id === cell.id ? { 
            ...c, 
            executionCount, 
            outputs, 
            isExecuting: false 
          } : c)
        );
      }
    }

    refreshVariables();
    setIsKernelBusy(false);
    showToast('Executed all notebook cells successfully');
  };

  // Restart Kernel
  const handleRestartKernel = () => {
    kernelRef.current.reset();
    refreshVariables();
    showToast('Python 3.11 kernel restarted (Memory cleared)');
  };

  // Clear all outputs
  const handleClearAllOutputs = () => {
    updateActiveNotebookCells(cells => 
      cells.map(c => ({ ...c, outputs: [], executionCount: null }))
    );
    showToast('Cleared all cell outputs');
  };

  // Select or create next cell
  const selectNextCell = (currentCellId: string) => {
    const currentIndex = activeNotebook.cells.findIndex(c => c.id === currentCellId);
    if (currentIndex !== -1 && currentIndex < activeNotebook.cells.length - 1) {
      setSelectedCellId(activeNotebook.cells[currentIndex + 1].id);
    } else {
      // If at the end, append a new code cell!
      handleAddCell('code', currentCellId);
    }
  };

  // Add cell
  const handleAddCell = (cellType: CellType = 'code', afterCellId?: string) => {
    const newCell: NotebookCell = {
      id: `cell_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      cellType,
      source: cellType === 'code' ? '' : '# New Markdown Section\n',
      executionCount: null,
      outputs: []
    };

    updateActiveNotebookCells(cells => {
      if (!afterCellId) {
        return [...cells, newCell];
      }
      const index = cells.findIndex(c => c.id === afterCellId);
      if (index === -1) return [...cells, newCell];
      const newCells = [...cells];
      newCells.splice(index + 1, 0, newCell);
      return newCells;
    });

    setSelectedCellId(newCell.id);
  };

  // Delete cell
  const handleDeleteCell = (cellId: string) => {
    if (activeNotebook.cells.length <= 1) {
      showToast('Cannot delete the only remaining cell');
      return;
    }
    const currentIndex = activeNotebook.cells.findIndex(c => c.id === cellId);
    const nextSelectIndex = currentIndex > 0 ? currentIndex - 1 : 1;
    const nextSelectId = activeNotebook.cells[nextSelectIndex]?.id || '';

    updateActiveNotebookCells(cells => cells.filter(c => c.id !== cellId));
    setSelectedCellId(nextSelectId);
  };

  // Move cell
  const handleMoveCell = (cellId: string, direction: 'up' | 'down') => {
    updateActiveNotebookCells(cells => {
      const index = cells.findIndex(c => c.id === cellId);
      if (index === -1) return cells;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= cells.length) return cells;

      const newCells = [...cells];
      const [moved] = newCells.splice(index, 1);
      newCells.splice(targetIndex, 0, moved);
      return newCells;
    });
  };

  // Duplicate cell
  const handleDuplicateCell = (cellId: string) => {
    const target = activeNotebook.cells.find(c => c.id === cellId);
    if (!target) return;

    const dupCell: NotebookCell = {
      ...target,
      id: `cell_${Date.now()}_dup`,
      executionCount: null,
      outputs: []
    };

    updateActiveNotebookCells(cells => {
      const index = cells.findIndex(c => c.id === cellId);
      const newCells = [...cells];
      newCells.splice(index + 1, 0, dupCell);
      return newCells;
    });

    setSelectedCellId(dupCell.id);
  };

  // Ask AI about cell
  const handleAskAI = async (codeSnippet: string) => {
    setActiveAiCellCode(codeSnippet);
    setAiDrawerOpen(true);
    setAiLoading(true);

    try {
      const explanation = await explainCodeSnippet(codeSnippet || '# Empty cell');
      setAiExplanation(explanation);
    } catch {
      setAiExplanation('Examines the mathematical formulations and execution tensor graph.');
    } finally {
      setAiLoading(false);
    }
  };

  // Export .ipynb
  const handleDownloadIpynb = () => {
    const jsonStr = exportToIpynbFormat(activeNotebook);
    const blob = new Blob([jsonStr], { type: 'application/x-ipynb+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeNotebook.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${activeNotebook.filename} (Jupyter v4.5 JSON)`);
  };

  // Export .py script
  const handleDownloadPython = () => {
    const pyStr = exportToPythonScript(activeNotebook);
    const blob = new Blob([pyStr], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeNotebook.filename.replace('.ipynb', '.py');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported standalone ${activeNotebook.filename.replace('.ipynb', '.py')}`);
  };

  // Create new blank notebook
  const handleCreateBlankNotebook = () => {
    const newNb: JupyterNotebook = {
      ...BLANK_NOTEBOOK_TEMPLATE,
      id: `nb_${Date.now()}`,
      filename: `untitled_${notebooks.length + 1}.ipynb`,
      cells: [
        {
          id: `cell_${Date.now()}_1`,
          cellType: 'markdown',
          source: `# New Machine Learning Notebook\nDocumenting observations and empirical iterations.`,
          executionCount: null,
          outputs: []
        },
        {
          id: `cell_${Date.now()}_2`,
          cellType: 'code',
          source: `import numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\nprint("Jupyter Kernel Active.")`,
          executionCount: 1,
          outputs: []
        }
      ]
    };

    setNotebooks(prev => [...prev, newNb]);
    setActiveNotebookId(newNb.id);
    setSelectedCellId(newNb.cells[0].id);
    kernelRef.current.reset();
    refreshVariables();
    showToast('Created new blank Jupyter Notebook');
  };

  return (
    <div id="jupyter_lab_container" className="flex flex-col h-full bg-[#F7F5EF] overflow-hidden select-text">
      {/* 1. Global Jupyter Top Header */}
      <header className="border-b border-[#E5E2D9] bg-white px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs z-20">
        <div className="flex items-center gap-3">
          {/* Jupyter Brand Logo Mark */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF6F00]/10 border border-[#FF6F00]/30 flex items-center justify-center text-[#FF6F00] font-black text-sm">
              🪐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-stone-900 tracking-tight">
                  JupyterLab
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1A42D9]/10 text-[#1A42D9] border border-[#1A42D9]/20 font-semibold">
                  v4.1.0 • ipykernel
                </span>
              </div>
              <div className="text-[11px] font-mono text-stone-500 font-semibold flex items-center gap-1.5">
                <span className="text-stone-800">{activeNotebook.filename}</span>
                <span className="text-stone-300">•</span>
                <span className="text-[10px] text-stone-400">Last saved: {activeNotebook.lastModified}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notebook Switcher & Kernel Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notebook Dropdown */}
          <div className="relative">
            <select
              value={activeNotebookId}
              onChange={(e) => {
                if (e.target.value === '__new__') {
                  handleCreateBlankNotebook();
                } else {
                  setActiveNotebookId(e.target.value);
                  const nb = notebooks.find(n => n.id === e.target.value);
                  if (nb && nb.cells[0]) setSelectedCellId(nb.cells[0].id);
                  kernelRef.current.reset();
                  refreshVariables();
                }
              }}
              className="text-xs font-mono font-medium bg-[#FAF9F5] border border-[#E0DCCF] rounded-lg px-3 py-1.5 text-stone-800 focus:outline-none focus:border-[#1A42D9] cursor-pointer"
            >
              <optgroup label="Curated ML Lab Notebooks">
                {notebooks.map(nb => (
                  <option key={nb.id} value={nb.id}>
                    {nb.filename}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Actions">
                <option value="__new__">+ New Blank Notebook (.ipynb)</option>
              </optgroup>
            </select>
          </div>

          {/* Kernel Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#E5E2D9] bg-[#FAF9F5] text-[11px] font-mono">
            <span 
              className={`w-2 h-2 rounded-full ${
                isKernelBusy ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
              }`} 
            />
            <span className="text-stone-600 font-medium">
              {isKernelBusy ? 'Kernel Busy' : 'Python 3 (Idle)'}
            </span>
          </div>

          {/* Variable Inspector Toggle */}
          <button
            onClick={() => setVariableInspectorOpen(prev => !prev)}
            title="Toggle Variable Inspector"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
              variableInspectorOpen 
                ? 'bg-[#1A42D9] text-white border-[#1A42D9]' 
                : 'bg-white border-[#E0DCCF] text-stone-700 hover:bg-[#FAF9F5]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Variables</span>
            <span className="px-1 py-0.2 rounded text-[10px] bg-white/20">
              {variables.length}
            </span>
          </button>
        </div>
      </header>

      {/* 2. Classic Jupyter Interactive Action Toolbar */}
      <div className="border-b border-[#E5E2D9] bg-[#FAF9F5] px-4 sm:px-6 py-1.5 flex items-center justify-between gap-2 overflow-x-auto select-none">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Save Button */}
          <button
            onClick={() => showToast('Saved notebook checkpoint')}
            title="Save and Checkpoint (Ctrl + S)"
            className="p-1.5 hover:bg-stone-200 rounded text-stone-700 transition-colors"
          >
            <Save className="w-4 h-4" />
          </button>

          {/* Add Code Cell (+) */}
          <button
            onClick={() => handleAddCell('code', selectedCellId)}
            title="Insert Code Cell Below"
            className="flex items-center gap-1 px-2.5 py-1 hover:bg-stone-200 rounded text-xs font-mono font-medium text-stone-700 transition-colors border border-[#E0DCCF] bg-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>

          {/* Add Markdown Cell (+) */}
          <button
            onClick={() => handleAddCell('markdown', selectedCellId)}
            title="Insert Markdown Cell Below"
            className="flex items-center gap-1 px-2.5 py-1 hover:bg-stone-200 rounded text-xs font-mono font-medium text-stone-700 transition-colors border border-[#E0DCCF] bg-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Markdown</span>
          </button>

          <div className="h-4 w-px bg-stone-300 mx-1" />

          {/* Run Selected Cell */}
          <button
            onClick={() => handleExecuteCell(selectedCellId)}
            title="Run Active Cell and Select Next (Shift + Enter)"
            className="flex items-center gap-1.5 px-3 py-1 bg-[#1A42D9] hover:bg-[#1535B0] text-white rounded text-xs font-mono font-medium transition-colors shadow-2xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run</span>
          </button>

          {/* Run All Cells */}
          <button
            onClick={handleRunAllCells}
            title="Restart Kernel and Run All Cells"
            className="flex items-center gap-1 px-2.5 py-1 hover:bg-stone-200 rounded text-xs font-mono font-medium text-stone-700 transition-colors"
          >
            <span>Run All</span>
          </button>

          {/* Restart Kernel */}
          <button
            onClick={handleRestartKernel}
            title="Restart Python Kernel"
            className="p-1.5 hover:bg-stone-200 rounded text-stone-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Clear Outputs */}
          <button
            onClick={handleClearAllOutputs}
            title="Clear All Outputs"
            className="px-2 py-1 hover:bg-stone-200 rounded text-xs font-mono text-stone-600 transition-colors"
          >
            Clear Outputs
          </button>
        </div>

        {/* Right Toolbar Actions: Export / AI */}
        <div className="flex items-center gap-2">
          {/* Ask AI Mentor */}
          <button
            onClick={() => {
              const activeCell = activeNotebook.cells.find(c => c.id === selectedCellId);
              handleAskAI(activeCell?.source || '');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Ask Forge AI</span>
          </button>

          {/* Download .ipynb */}
          <button
            onClick={handleDownloadIpynb}
            title="Download official Jupyter Notebook file (.ipynb)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium bg-white hover:bg-stone-100 text-stone-800 border border-[#E0DCCF] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#1A42D9]" />
            <span className="hidden sm:inline">Export .ipynb</span>
          </button>

          {/* Export .py */}
          <button
            onClick={handleDownloadPython}
            title="Export runnable Python script (.py)"
            className="p-1.5 hover:bg-stone-200 rounded text-stone-700 transition-colors border border-[#E0DCCF] bg-white"
          >
            <FileCode className="w-4 h-4 text-stone-600" />
          </button>
        </div>
      </div>

      {/* 3. Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-mono animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4. Main Body: Notebook Workspace Canvas + Variable Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Notebook Cells Flow Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4">
          {/* Notebook Title Banner */}
          <div className="bg-white border border-[#E5E2D9] rounded-xl p-5 mb-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE7DD] pb-3 mb-3">
              <div>
                <h1 className="text-lg sm:text-xl font-bold font-mono text-stone-900">
                  {activeNotebook.title}
                </h1>
                <p className="text-xs text-stone-500 font-sans mt-0.5">
                  {activeNotebook.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeNotebook.tags.map((tag, tIdx) => (
                  <span 
                    key={`tag-${tIdx}`}
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-stone-100 text-stone-600 border border-stone-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-stone-400">
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-[#1A42D9]" />
                <span>{activeNotebook.cells.length} cells in current graph</span>
              </div>
              <span className="text-[11px]">Kernel: {activeNotebook.kernelName}</span>
            </div>
          </div>

          {/* Cell Stack */}
          {activeNotebook.cells.map((cell, idx) => (
            <NotebookCellView
              key={cell.id}
              cell={cell}
              index={idx}
              isSelected={selectedCellId === cell.id}
              onSelect={() => setSelectedCellId(cell.id)}
              onUpdateSource={(newSource) => {
                updateActiveNotebookCells(cells => 
                  cells.map(c => c.id === cell.id ? { ...c, source: newSource } : c)
                );
              }}
              onExecute={() => handleExecuteCell(cell.id, true)}
              onChangeType={(newType) => {
                updateActiveNotebookCells(cells => 
                  cells.map(c => c.id === cell.id ? { ...c, cellType: newType } : c)
                );
              }}
              onDelete={() => handleDeleteCell(cell.id)}
              onMoveUp={() => handleMoveCell(cell.id, 'up')}
              onMoveDown={() => handleMoveCell(cell.id, 'down')}
              onDuplicate={() => handleDuplicateCell(cell.id)}
              onAskAI={(code) => handleAskAI(code)}
              canMoveUp={idx > 0}
              canMoveDown={idx < activeNotebook.cells.length - 1}
            />
          ))}

          {/* Bottom Add Cell Quick Bar */}
          <div className="flex items-center justify-center gap-3 py-6 border-2 border-dashed border-stone-200 rounded-xl hover:border-stone-300 transition-colors">
            <span className="text-xs font-mono text-stone-400">Append Cell:</span>
            <button
              onClick={() => handleAddCell('code')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#E0DCCF] text-xs font-mono font-medium text-stone-700 hover:bg-[#FAF9F5] shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#1A42D9]" />
              <span>+ Code Cell</span>
            </button>
            <button
              onClick={() => handleAddCell('markdown')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#E0DCCF] text-xs font-mono font-medium text-stone-700 hover:bg-[#FAF9F5] shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-700" />
              <span>+ Markdown Cell</span>
            </button>
          </div>
        </div>

        {/* Variable Inspector Side Panel */}
        <VariableInspector
          variables={variables}
          isOpen={variableInspectorOpen}
          onClose={() => setVariableInspectorOpen(false)}
          onRefresh={refreshVariables}
        />
      </div>

      {/* 5. AI Socratic Code Explainer Side Drawer */}
      {aiDrawerOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white border-l border-[#E5E2D9] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E2D9] bg-[#FAF8F2]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-mono font-bold text-stone-900">
                Forge AI Socratic Mentor
              </h3>
            </div>
            <button
              onClick={() => setAiDrawerOpen(false)}
              className="p-1 hover:bg-stone-200 rounded text-stone-500 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeAiCellCode && (
              <div>
                <span className="text-[11px] font-mono text-stone-400 block mb-1">
                  Active Cell Snippet:
                </span>
                <pre className="text-[11px] font-mono bg-[#FAF9F5] p-2.5 rounded-lg border border-[#EAE7DD] text-stone-800 overflow-x-auto max-h-32">
                  {activeAiCellCode}
                </pre>
              </div>
            )}

            {aiLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-[#1A42D9] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono text-stone-500">
                  Deconstructing algorithmic principles...
                </span>
              </div>
            ) : (
              <div className="prose prose-stone text-xs leading-relaxed text-stone-800">
                <div className="markdown-body">
                  <ReactMarkdown>{aiExplanation}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#E5E2D9] bg-[#FAF9F5]">
            <button
              onClick={() => setAiDrawerOpen(false)}
              className="w-full py-2 bg-[#1A42D9] hover:bg-[#1535B0] text-white rounded-lg text-xs font-mono font-medium transition-colors"
            >
              Back to Notebook
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { KernelVariable } from './types';
import { Layers, X, Database, RefreshCw, Cpu } from 'lucide-react';

interface VariableInspectorProps {
  variables: KernelVariable[];
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const VariableInspector: React.FC<VariableInspectorProps> = ({
  variables,
  isOpen,
  onClose,
  onRefresh
}) => {
  if (!isOpen) return null;

  return (
    <div className="w-80 border-l border-[#E5E2D9] bg-[#FAF9F5] flex flex-col h-full shadow-lg z-10 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E2D9] bg-[#F4F1E8]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#1A42D9]" />
          <h3 className="text-xs font-mono font-bold text-stone-800 uppercase tracking-wider">
            Kernel Variables
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            title="Refresh memory table"
            className="p-1 hover:bg-stone-200 text-stone-500 rounded transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-200 text-stone-500 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Memory Status Bar */}
      <div className="px-4 py-2 bg-stone-100/70 border-b border-[#E5E2D9] flex items-center justify-between text-[10px] font-mono text-stone-500">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-emerald-600" />
          <span>RAM: ~142 MB / 8.0 GB</span>
        </div>
        <span>{variables.length} active symbols</span>
      </div>

      {/* Variables List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {variables.length === 0 ? (
          <div className="text-center py-8 text-stone-400 font-mono text-xs">
            No user variables registered in kernel memory yet. Run a code cell to populate memory.
          </div>
        ) : (
          variables.map((v, i) => (
            <div 
              key={`var-${v.name}-${i}`} 
              className="bg-white border border-[#E5E2D9] rounded-lg p-2.5 shadow-2xs hover:border-stone-400 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-stone-900">{v.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${
                  v.type === 'DataFrame' 
                    ? 'bg-blue-50 text-[#1A42D9] border border-blue-200' 
                    : v.type === 'ndarray' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-stone-100 text-stone-600'
                }`}>
                  {v.type}
                </span>
              </div>
              {v.shape && (
                <div className="text-[10px] font-mono text-stone-400 mt-1">
                  shape: <span className="text-stone-600 font-medium">{v.shape}</span>
                </div>
              )}
              <div className="text-[11px] font-mono text-stone-500 truncate mt-1 bg-[#FAF9F5] p-1 rounded border border-[#EFECE3]">
                {v.preview}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

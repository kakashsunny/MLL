import React from 'react';
import { CellOutput } from './types';
import { Table, BarChart2, CheckCircle2, Clock } from 'lucide-react';

interface CellOutputRendererProps {
  outputs: CellOutput[];
  executionCount: number | null;
}

export const CellOutputRenderer: React.FC<CellOutputRendererProps> = ({ outputs, executionCount }) => {
  if (!outputs || outputs.length === 0) return null;

  return (
    <div className="flex flex-col space-y-3 pt-2">
      {outputs.map((output, idx) => {
        if (output.type === 'text') {
          return (
            <div key={`out-text-${idx}`} className="flex items-start gap-3 group">
              <div className="w-16 flex-shrink-0 text-right font-mono text-[11px] text-amber-700 select-none pt-0.5 font-bold">
                {idx === 0 ? `Out [${executionCount || ' '}]:` : ''}
              </div>
              <div className="flex-1 overflow-x-auto">
                <pre className="font-mono text-xs text-stone-800 whitespace-pre-wrap leading-relaxed bg-[#FAF9F5] p-2.5 rounded-lg border border-[#EAE7DD]">
                  {output.text}
                </pre>
                {output.executionTimeMs && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-stone-400 mt-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>executed in {output.executionTimeMs}ms on Python 3.11</span>
                  </div>
                )}
              </div>
            </div>
          );
        }

        if (output.type === 'table' && output.data) {
          return (
            <div key={`out-table-${idx}`} className="flex items-start gap-3">
              <div className="w-16 flex-shrink-0 text-right font-mono text-[11px] text-amber-700 select-none pt-2 font-bold">
                Out [{executionCount || ' '}]:
              </div>
              <div className="flex-1 overflow-x-auto border border-[#E5E2D9] rounded-lg shadow-2xs bg-white">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#F9F8F3] border-b border-[#E5E2D9] text-[11px] font-mono text-stone-500">
                  <div className="flex items-center gap-1.5 font-bold text-stone-700">
                    <Table className="w-3.5 h-3.5 text-[#1A42D9]" />
                    <span>pandas.DataFrame ({output.data.totalRows || output.data.rows.length} rows × {output.data.columns.length} columns)</span>
                  </div>
                  <span className="text-[10px] text-stone-400">ipython HTML representation</span>
                </div>
                <table className="w-full text-left font-mono text-xs divide-y divide-[#EAE7DD]">
                  <thead>
                    <tr className="bg-[#FAF9F5] divide-x divide-[#EAE7DD]">
                      <th className="px-3 py-2 text-[11px] font-semibold text-stone-400 w-10 text-center">#</th>
                      {output.data.columns.map((col, cIdx) => (
                        <th key={`col-${cIdx}`} className="px-3 py-2 text-stone-700 font-bold tracking-tight">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE7DD] bg-white">
                    {output.data.rows.map((row, rIdx) => (
                      <tr key={`row-${rIdx}`} className="hover:bg-[#F8F7F0] transition-colors divide-x divide-[#EAE7DD]">
                        <td className="px-3 py-1.5 text-[11px] text-stone-400 font-mono text-center select-none bg-[#FAF9F5]">
                          {rIdx}
                        </td>
                        {row.map((val, vIdx) => {
                          const isNaNVal = String(val) === 'NaN';
                          return (
                            <td 
                              key={`cell-${rIdx}-${vIdx}`} 
                              className={`px-3 py-1.5 text-stone-800 ${isNaNVal ? 'text-rose-600 font-bold bg-rose-50/50' : ''}`}
                            >
                              {String(val)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        if (output.type === 'plot') {
          return (
            <div key={`out-plot-${idx}`} className="flex items-start gap-3">
              <div className="w-16 flex-shrink-0 text-right font-mono text-[11px] text-amber-700 select-none pt-2 font-bold">
                Out [{executionCount || ' '}]:
              </div>
              <div className="flex-1 bg-white p-4 rounded-xl border border-[#E5E2D9] shadow-2xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EAE7DD]">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-[#1A42D9]" />
                    <span className="text-xs font-mono font-bold text-stone-800">
                      matplotlib.pyplot inline figure (DPI 100)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    vector graphic render
                  </span>
                </div>

                {/* Plot Type 1: Line chart (Loss curves) */}
                {output.plotType === 'line' && output.plotData && (
                  <div className="h-52 w-full flex flex-col justify-end pt-4">
                    <div className="text-[11px] font-mono text-stone-500 mb-2 font-semibold">
                      Convergence Trajectory: Binary Cross-Entropy Loss over Epochs
                    </div>
                    <svg viewBox="0 0 400 160" className="w-full h-44 bg-[#FAF9F5] rounded-lg border border-[#EAE7DD] p-2">
                      {/* Grid lines */}
                      <line x1="40" y1="20" x2="380" y2="20" stroke="#E5E2D9" strokeDasharray="3,3" />
                      <line x1="40" y1="60" x2="380" y2="60" stroke="#E5E2D9" strokeDasharray="3,3" />
                      <line x1="40" y1="100" x2="380" y2="100" stroke="#E5E2D9" strokeDasharray="3,3" />
                      <line x1="40" y1="140" x2="380" y2="140" stroke="#111111" strokeWidth="1.2" />
                      <line x1="40" y1="20" x2="40" y2="140" stroke="#111111" strokeWidth="1.2" />

                      {/* Axis Labels */}
                      <text x="35" y="24" textAnchor="end" fontSize="8" fill="#888" fontFamily="monospace">0.8</text>
                      <text x="35" y="80" textAnchor="end" fontSize="8" fill="#888" fontFamily="monospace">0.4</text>
                      <text x="35" y="140" textAnchor="end" fontSize="8" fill="#888" fontFamily="monospace">0.0</text>
                      <text x="40" y="152" textAnchor="middle" fontSize="8" fill="#888" fontFamily="monospace">0</text>
                      <text x="210" y="152" textAnchor="middle" fontSize="8" fill="#888" fontFamily="monospace">Epochs</text>
                      <text x="380" y="152" textAnchor="middle" fontSize="8" fill="#888" fontFamily="monospace">500</text>

                      {/* Loss curve line */}
                      {(() => {
                        const pts = output.plotData;
                        const maxLoss = 0.9;
                        const coords = pts.map((p: any, pIdx: number) => {
                          const x = 40 + (pIdx / (pts.length - 1)) * 340;
                          const y = 140 - (p.loss / maxLoss) * 120;
                          return `${x},${y}`;
                        }).join(' ');

                        return (
                          <>
                            <polyline
                              fill="none"
                              stroke="#1A42D9"
                              strokeWidth="2.5"
                              points={coords}
                            />
                            {pts.map((p: any, pIdx: number) => {
                              const cx = 40 + (pIdx / (pts.length - 1)) * 340;
                              const cy = 140 - (p.loss / maxLoss) * 120;
                              return (
                                <circle
                                  key={`pt-${pIdx}`}
                                  cx={cx}
                                  cy={cy}
                                  r="3"
                                  fill="#FFFFFF"
                                  stroke="#1A42D9"
                                  strokeWidth="2"
                                />
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                )}

                {/* Plot Type 2: Bar chart */}
                {output.plotType === 'bar' && output.plotData && (
                  <div className="h-48 w-full flex flex-col justify-end pt-2">
                    <div className="text-[11px] font-mono text-stone-500 mb-2 font-semibold">
                      Survival Probability % by Passenger Class
                    </div>
                    <div className="flex items-end gap-6 h-36 border-b border-l border-[#111111] px-4 pb-0 bg-[#FAF9F5] rounded-lg">
                      {output.plotData.map((bar: any, bIdx: number) => (
                        <div key={`bar-${bIdx}`} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <span className="text-[11px] font-mono font-bold text-stone-700">
                            {bar.value.toFixed(1)}%
                          </span>
                          <div 
                            className="w-full rounded-t-md transition-all duration-500"
                            style={{ 
                              height: `${Math.max(8, (bar.value / 100) * 110)}px`,
                              backgroundColor: bar.color || '#1A42D9' 
                            }}
                          />
                          <span className="text-[10px] font-mono text-stone-500 truncate max-w-[90px] mt-1">
                            {bar.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Plot Type 3: Scatter plot (Clusters) */}
                {output.plotType === 'scatter' && output.plotData && (
                  <div className="h-52 w-full flex flex-col justify-end pt-2">
                    <div className="text-[11px] font-mono text-stone-500 mb-2 font-semibold">
                      2D Cluster Centroids & Spatial Dispersion (Lloyd Convergence)
                    </div>
                    <svg viewBox="0 0 400 160" className="w-full h-44 bg-[#FAF9F5] rounded-lg border border-[#EAE7DD]">
                      {/* Grid */}
                      <line x1="30" y1="130" x2="380" y2="130" stroke="#111111" strokeWidth="1" />
                      <line x1="30" y1="20" x2="30" y2="130" stroke="#111111" strokeWidth="1" />

                      {output.plotData.map((c: any, cIdx: number) => {
                        const cx = 30 + (c.x / 40) * 320;
                        const cy = 130 - (c.y / 80) * 100;
                        return (
                          <g key={`cluster-pt-${cIdx}`}>
                            <circle cx={cx} cy={cy} r="14" fill={c.color} fillOpacity="0.18" />
                            <circle cx={cx} cy={cy} r="6" fill={c.color} stroke="#FFFFFF" strokeWidth="1.5" />
                            <text x={cx + 9} y={cy + 3} fontSize="9" fontFamily="monospace" fill={c.color} fontWeight="bold">
                              {c.cluster} (μ)
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Database, 
  Upload, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Play, 
  Sliders, 
  Layers, 
  TrendingUp,
  Sparkles,
  RefreshCw,
  Table
} from 'lucide-react';
import { BUILTIN_DATASETS } from '../../data/datasetsData';
import { DatasetItem } from '../../types';

export const DatasetExplorer: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = useState<DatasetItem>(BUILTIN_DATASETS[0]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(BUILTIN_DATASETS[0].columns.slice(0, 4));
  const [scalingMethod, setScalingMethod] = useState<'none' | 'standard' | 'minmax'>('standard');
  const [testSplit, setTestSplit] = useState<number>(0.2);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [modelResult, setModelResult] = useState<{ metricName: string; score: number; trainTime: string } | null>(null);

  const handleSelectDataset = (dataset: DatasetItem) => {
    setSelectedDataset(dataset);
    setSelectedFeatures(dataset.columns.slice(0, 4));
    setModelResult(null);
  };

  const toggleFeature = (col: string) => {
    if (selectedFeatures.includes(col)) {
      if (selectedFeatures.length > 1) {
        setSelectedFeatures(selectedFeatures.filter(f => f !== col));
      }
    } else {
      setSelectedFeatures([...selectedFeatures, col]);
    }
  };

  const handleRunBaselineModel = () => {
    setIsTraining(true);
    setModelResult(null);
    setTimeout(() => {
      const isClassification = selectedDataset.category.includes('Classification');
      setModelResult({
        metricName: isClassification ? 'Validation Accuracy' : 'Test R² Score',
        score: isClassification 
          ? Number((82.4 + (selectedFeatures.length * 1.5) - (scalingMethod === 'none' ? 4 : 0)).toFixed(1))
          : Number((0.64 + (selectedFeatures.length * 0.04) + (scalingMethod === 'standard' ? 0.05 : 0)).toFixed(3)),
        trainTime: '18ms'
      });
      setIsTraining(false);
    }, 600);
  };

  return (
    <div id="dataset_explorer_view" className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 select-none bg-[#F7F5EF] text-[#111111]">
      
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#E5E2D9] pb-6">
        <div>
          <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1A42D9]" />
            <span>Empirical Data Laboratory • Feature Engineering</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
            Dataset Explorer & Preprocessing Studio
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Audit feature distributions, null distributions, Pearson correlation matrices, and evaluate baseline estimators.
          </p>
        </div>

        {/* Dataset Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {BUILTIN_DATASETS.map(dataset => (
            <button
              key={dataset.id}
              onClick={() => handleSelectDataset(dataset)}
              className={`px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-all border ${
                selectedDataset.id === dataset.id
                  ? 'bg-[#111111] text-white border-[#111111] font-bold shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border-[#E5E2D9]'
              }`}
            >
              {dataset.name.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Dataset Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E2D9] rounded-xl p-5 shadow-xs">
          <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Total Rows (Samples)</div>
          <div className="text-2xl font-extrabold text-[#111111] font-mono mt-1">
            {selectedDataset.rows.toLocaleString()}
          </div>
        </div>

        <div className="bg-white border border-[#E5E2D9] rounded-xl p-5 shadow-xs">
          <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Features Count</div>
          <div className="text-2xl font-extrabold text-[#1A42D9] font-mono mt-1">
            {selectedDataset.columns.length}
          </div>
        </div>

        <div className="bg-white border border-[#E5E2D9] rounded-xl p-5 shadow-xs">
          <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Task Modality</div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
            {selectedDataset.category}
          </div>
        </div>

        <div className="bg-white border border-[#E5E2D9] rounded-xl p-5 shadow-xs">
          <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Target Variable</div>
          <div className="text-2xl font-extrabold text-[#111111] font-mono mt-1 truncate">
            {selectedDataset.targetColumn}
          </div>
        </div>
      </div>

      {/* 3. Main Data Grid: Raw Preview + Preprocessing Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 8 cols: Raw Records Table + Correlation Matrix */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-[#E5E2D9] rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-[#E5E2D9] flex items-center justify-between bg-[#FAF8F2]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#111111]">
                <Table className="w-4 h-4 text-[#1A42D9]" />
                <span className="uppercase tracking-wider">Raw Samples Preview (First 6 Records)</span>
              </div>
              <span className="text-[11px] font-mono text-stone-400">
                {selectedDataset.previewData.length} records shown
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F2] border-b border-[#E5E2D9] text-[11px] font-mono text-stone-500">
                  <tr>
                    {selectedDataset.columns.map(col => (
                      <th key={col} className="px-4 py-3 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-stone-800">{col}</span>
                          <span className="text-[9px] text-stone-400">({selectedDataset.dataTypes[col]})</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono text-xs">
                  {selectedDataset.previewData.map((row, i) => (
                    <tr key={i} className="hover:bg-stone-50 transition-colors">
                      {selectedDataset.columns.map(col => (
                        <td key={col} className="px-4 py-3 whitespace-nowrap text-stone-700">
                          {String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Correlation Insights */}
          <div className="bg-white border border-[#E5E2D9] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-xs font-mono font-bold border-b border-[#E5E2D9] pb-3">
              <span className="flex items-center gap-2 text-stone-600 uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-[#1A42D9]" />
                Top Pearson Correlations (r)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedDataset.correlations.map((corr, idx) => (
                <div key={idx} className="p-3 rounded bg-[#FAF8F2] border border-[#E5E2D9] flex items-center justify-between">
                  <div className="text-xs font-mono">
                    <span className="text-[#111111] font-semibold">{corr.featA}</span>
                    <span className="text-stone-400 mx-2">↔</span>
                    <span className="text-stone-600">{corr.featB}</span>
                  </div>
                  <span className={`font-mono text-xs font-bold ${corr.value > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {corr.value > 0 ? `+${corr.value}` : corr.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 cols: Feature Selection, Scaling & Model Fitting */}
        <div className="lg:col-span-4 bg-white border border-[#E5E2D9] rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between text-xs font-mono text-stone-500 font-bold border-b border-[#E5E2D9] pb-3">
            <span className="flex items-center gap-2 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-[#1A42D9]" />
              Feature Engineering Pipeline
            </span>
          </div>

          {/* Feature Checkboxes */}
          <div>
            <div className="text-xs text-stone-700 font-mono mb-2 font-semibold">Active Features in X Matrix:</div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {selectedDataset.columns.filter(c => c !== selectedDataset.targetColumn).map(col => (
                <label key={col} className="flex items-center justify-between p-2 rounded hover:bg-stone-50 cursor-pointer text-xs text-stone-700 font-mono border border-transparent hover:border-stone-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(col)}
                      onChange={() => toggleFeature(col)}
                      className="rounded accent-[#1A42D9]"
                    />
                    <span>{col}</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">
                    {selectedDataset.missingValues[col] > 0 ? `${selectedDataset.missingValues[col]} nulls` : 'clean'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Scaling Selection */}
          <div>
            <div className="text-xs text-stone-700 font-mono mb-2 font-semibold">Normalization Strategy:</div>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              {(['none', 'standard', 'minmax'] as const).map(method => (
                <button
                  key={method}
                  onClick={() => setScalingMethod(method)}
                  className={`py-2 rounded capitalize border transition-all ${
                    scalingMethod === method
                      ? 'bg-[#111111] text-white border-[#111111] font-bold shadow-xs'
                      : 'bg-white border-[#E5E2D9] text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Train/Test Split */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-stone-700 font-semibold">Holdout Validation Split:</span>
              <span className="text-[#1A42D9] font-bold">{(testSplit * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.4"
              step="0.05"
              value={testSplit}
              onChange={e => setTestSplit(parseFloat(e.target.value))}
              className="w-full accent-[#1A42D9] cursor-pointer h-1.5 bg-stone-200 rounded"
            />
          </div>

          {/* Model Fit Button */}
          <button
            onClick={handleRunBaselineModel}
            disabled={isTraining}
            className="w-full py-3 px-4 rounded bg-[#111111] hover:bg-[#1A42D9] disabled:opacity-50 text-white font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isTraining ? 'Training Estimator...' : 'Fit Baseline Estimator'}</span>
          </button>

          {/* Evaluation Result */}
          {modelResult && (
            <div className="p-4 rounded bg-[#FAF8F2] border border-[#E5E2D9] space-y-1 animate-in fade-in">
              <div className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">{modelResult.metricName}</div>
              <div className="text-2xl font-extrabold text-[#1A42D9] font-mono">
                {modelResult.score} {modelResult.metricName.includes('Accuracy') && '%'}
              </div>
              <div className="text-[10px] font-mono text-stone-400">
                Fit latency: {modelResult.trainTime} across {selectedFeatures.length} features
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

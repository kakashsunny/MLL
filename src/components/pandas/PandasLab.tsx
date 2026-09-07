import React, { useState, useRef, useMemo } from 'react';
import { 
  Table, 
  Upload, 
  Download, 
  RotateCcw, 
  Undo2, 
  Filter, 
  Sliders, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Code, 
  Copy, 
  Check, 
  Search, 
  Plus, 
  Trash2, 
  ArrowUpDown, 
  BarChart3, 
  Layers, 
  Sparkles, 
  HelpCircle,
  Database,
  ChevronRight,
  ChevronLeft,
  X,
  FileSpreadsheet,
  Edit2
} from 'lucide-react';
import { 
  DataFrameState, 
  DType, 
  SAMPLE_PANDAS_DATASETS, 
  createDataFrameFromCSV, 
  exportDataFrameToCSV, 
  dfDropNA, 
  dfFillNA, 
  dfSortValues, 
  dfQuery, 
  dfDropColumns, 
  dfRenameColumn, 
  dfAstype, 
  dfEditCell, 
  dfResetToOriginal, 
  dfUndoLast, 
  computeSummaryStatistics, 
  computeGroupBy,
  isNullValue
} from '../../services/mockPandas';

type ActiveTab = 'sheet' | 'info' | 'describe' | 'groupby' | 'code';

export const PandasLab: React.FC = () => {
  // Main DataFrame State (initialized with Titanic passenger registry)
  const [df, setDf] = useState<DataFrameState>(() => 
    createDataFrameFromCSV(SAMPLE_PANDAS_DATASETS[0].csv, SAMPLE_PANDAS_DATASETS[0].name)
  );

  // Active View Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('sheet');

  // Search & Pagination in Spreadsheet
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Cell In-Place Editing State
  const [editingCell, setEditingCell] = useState<{ rowIdx: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Drag and Drop Overlay State
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active Tool Modal / Panel State
  const [activeTool, setActiveTool] = useState<'filter' | 'fillna' | 'dropna' | 'sort' | 'rename' | 'astype' | null>(null);

  // Filter Tool State
  const [filterCol, setFilterCol] = useState<string>('');
  const [filterOp, setFilterOp] = useState<'==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'isna' | 'notna'>('==');
  const [filterVal, setFilterVal] = useState<string>('');

  // FillNA Tool State
  const [fillCol, setFillCol] = useState<string>('');
  const [fillStrategy, setFillStrategy] = useState<'mean' | 'median' | 'mode' | 'ffill' | 'bfill' | 'constant'>('median');
  const [fillCustomVal, setFillCustomVal] = useState<string>('');

  // DropNA Tool State
  const [dropHow, setDropHow] = useState<'any' | 'all'>('any');
  const [dropSubset, setDropSubset] = useState<string[]>([]);

  // Rename Tool State
  const [renameTargetCol, setRenameTargetCol] = useState<string>('');
  const [renameNewName, setRenameNewName] = useState<string>('');

  // Astype Tool State
  const [castCol, setCastCol] = useState<string>('');
  const [castNewDtype, setCastNewDtype] = useState<DType>('int64');

  // GroupBy State
  const [groupByCatCol, setGroupByCatCol] = useState<string>('');
  const [groupByNumCol, setGroupByNumCol] = useState<string>('');
  const [groupByFunc, setGroupByFunc] = useState<'mean' | 'sum' | 'count' | 'min' | 'max'>('mean');

  // Code Copy State
  const [copiedCode, setCopiedCode] = useState(false);

  // Initialize column defaults when df changes
  React.useEffect(() => {
    if (df.columns.length > 0) {
      if (!filterCol || !df.columns.includes(filterCol)) setFilterCol(df.columns[0]);
      if (!fillCol || !df.columns.includes(fillCol)) setFillCol(df.columns[0]);
      if (!renameTargetCol || !df.columns.includes(renameTargetCol)) setRenameTargetCol(df.columns[0]);
      if (!castCol || !df.columns.includes(castCol)) setCastCol(df.columns[0]);
      
      // Auto-pick categorical and numeric for GroupBy
      const cat = df.columns.find(c => df.dtypes[c] === 'object' || df.dtypes[c] === 'bool') || df.columns[0];
      const num = df.columns.find(c => df.dtypes[c] === 'int64' || df.dtypes[c] === 'float64') || df.columns[1] || df.columns[0];
      setGroupByCatCol(cat);
      setGroupByNumCol(num);
    }
  }, [df.columns, df.dtypes]);

  // File Upload Handler (Native file input)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readUploadedFile(file);
    e.target.value = '';
  };

  // Process File Reader
  const readUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const newDf = createDataFrameFromCSV(content, file.name);
        setDf(newDf);
        setCurrentPage(1);
        setSearchQuery('');
        setActiveTool(null);
      }
    };
    reader.readAsText(file);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readUploadedFile(file);
    }
  };

  // Switch to Sample Dataset
  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_PANDAS_DATASETS.find(s => s.id === sampleId);
    if (sample) {
      setDf(createDataFrameFromCSV(sample.csv, sample.name));
      setCurrentPage(1);
      setSearchQuery('');
      setActiveTool(null);
    }
  };

  // Filtered Rows for Search
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return df.rows;
    const q = searchQuery.toLowerCase();
    return df.rows.filter(row => 
      df.columns.some(col => String(row[col] ?? '').toLowerCase().includes(q))
    );
  }, [df.rows, df.columns, searchQuery]);

  // Paginated Rows
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Handle In-Place Cell Edit Submit
  const handleCommitCellEdit = () => {
    if (!editingCell) return;
    setDf(prev => dfEditCell(prev, editingCell.rowIdx, editingCell.col, editValue));
    setEditingCell(null);
    setEditValue('');
  };

  // Summary Statistics (df.describe)
  const summaryStats = useMemo(() => computeSummaryStatistics(df), [df]);

  // GroupBy Result (df.groupby)
  const groupByData = useMemo(() => {
    if (!groupByCatCol || !groupByNumCol) return [];
    return computeGroupBy(df, groupByCatCol, groupByNumCol, groupByFunc);
  }, [df, groupByCatCol, groupByNumCol, groupByFunc]);

  // Generated Python Code Script
  const generatedScript = useMemo(() => {
    const lines = [
      '# NeuraForge Pandas Processing Pipeline',
      'import pandas as pd',
      'import numpy as np',
      '',
      `# 1. Ingest Dataset`,
      `df = pd.read_csv('${df.name}')`,
      ''
    ];

    if (df.history.length > 1) {
      lines.push('# 2. Applied Data Transformations');
      df.history.slice(1).forEach((item, i) => {
        lines.push(`# Step ${i + 1}: ${item.description}`);
        lines.push(item.code);
        lines.push('');
      });
    }

    lines.push('# 3. Verification & Live Profiling');
    lines.push('print("Shape:", df.shape)');
    lines.push('print("Dtypes:\\n", df.dtypes)');
    lines.push('print("Missing values:\\n", df.isna().sum())');
    lines.push('print("\\nFirst 5 rows:\\n", df.head())');

    return lines.join('\n');
  }, [df]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Export Modified CSV
  const handleExportCSV = () => {
    const csvContent = exportDataFrameToCSV(df);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cleaned_${df.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Group dtypes by count
  const dtypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(df.dtypes).forEach(col => {
      const dt = df.dtypes[col];
      counts[dt] = (counts[dt] || 0) + 1;
    });
    return counts;
  }, [df.dtypes]);

  // Color mapping for dtypes
  const getDtypeBadgeColor = (dtype: DType) => {
    switch (dtype) {
      case 'int64':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'float64':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'bool':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'datetime64':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div 
      id="pandas_lab_workbench"
      className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto select-none"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Input for CSV Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.tsv,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Drag & Drop Visual Indicator Overlay */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 pointer-events-none">
          <div className="bg-white border-2 border-dashed border-[#1A42D9] rounded-xl p-10 text-center space-y-3 max-w-md shadow-2xl">
            <Upload className="w-12 h-12 text-[#1A42D9] mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-[#111111]">Drop CSV File Here</h3>
            <p className="text-xs font-mono text-stone-500">
              NeuraForge will parse, infer dtypes, and populate the interactive spreadsheet.
            </p>
          </div>
        </div>
      )}

      {/* 1. TOP HEADER & TELEMETRY RIBBON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E2D9] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-stone-500 font-bold">
              PANDAS SPREADSHEET ENGINE • IN-MEMORY DATAFRAME
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-xl font-bold tracking-tight text-[#111111]">
              Pandas Lab
            </h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-stone-100 text-stone-700 border border-stone-200 truncate max-w-xs">
              {df.name}
            </span>
          </div>
        </div>

        {/* Dataset Quick Switcher & Primary Ingestion Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sample Datasets Dropdown */}
          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-[#E5E2D9] text-xs font-mono">
            <Database className="w-3.5 h-3.5 text-stone-400" />
            <select
              id="select_sample_dataset"
              onChange={e => handleLoadSample(e.target.value)}
              value=""
              className="bg-transparent border-none text-stone-700 text-xs font-mono cursor-pointer focus:outline-hidden"
            >
              <option value="" disabled>Load Sample CSV...</option>
              {SAMPLE_PANDAS_DATASETS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Upload Button */}
          <button
            id="btn_upload_csv"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E2D9] hover:border-[#111111] hover:bg-stone-50 text-xs font-mono font-bold text-[#111111] flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Upload any CSV file from your disk"
          >
            <Upload className="w-3.5 h-3.5 text-[#1A42D9]" />
            <span>Upload CSV</span>
          </button>

          {/* Export CSV */}
          <button
            id="btn_export_csv"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E2D9] hover:bg-stone-50 text-xs font-mono font-medium text-stone-700 flex items-center gap-1.5 transition-colors"
            title="Download transformed DataFrame as CSV"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export CSV</span>
          </button>

          {/* Undo Button */}
          <button
            id="btn_undo_pandas"
            onClick={() => setDf(prev => dfUndoLast(prev))}
            disabled={df.snapshots.length === 0}
            className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors ${
              df.snapshots.length > 0
                ? 'bg-white border-[#E5E2D9] text-stone-700 hover:bg-stone-50'
                : 'bg-stone-50 border-stone-200 text-stone-300 cursor-not-allowed'
            }`}
            title="Undo last transformation"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Reset to Original Button */}
          <button
            id="btn_reset_pandas"
            onClick={() => setDf(prev => dfResetToOriginal(prev))}
            className="p-1.5 rounded-lg bg-white border border-[#E5E2D9] hover:bg-stone-50 text-stone-700 text-xs transition-colors"
            title="Reset dataset to raw uploaded state"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. LIVE TELEMETRY CARDS: SHAPE, DTYPES, NULL COUNTS & MEMORY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Live df.shape */}
        <div className="p-3.5 rounded-lg bg-white border border-[#E5E2D9] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Live df.shape</span>
            <Table className="w-3.5 h-3.5 text-[#1A42D9]" />
          </div>
          <div className="mt-1">
            <div className="text-2xl font-bold font-mono text-[#111111] tracking-tight">
              ({df.shape[0]}, {df.shape[1]})
            </div>
            <div className="text-[10px] font-mono text-stone-500 mt-0.5">
              {df.shape[0]} rows × {df.shape[1]} columns
            </div>
          </div>
        </div>

        {/* Missing / Null Cells Count */}
        <div className="p-3.5 rounded-lg bg-white border border-[#E5E2D9] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Null Values</span>
            {df.totalNulls > 0 ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </div>
          <div className="mt-1">
            <div className="text-2xl font-bold font-mono text-[#111111] tracking-tight flex items-baseline gap-1.5">
              <span>{df.totalNulls}</span>
              <span className="text-xs font-normal text-stone-400">
                ({df.shape[0] * df.shape[1] > 0 ? ((df.totalNulls / (df.shape[0] * df.shape[1])) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="text-[10px] font-mono text-stone-500 mt-0.5">
              {df.totalNulls > 0 ? 'Requires imputation or drop' : 'Clean (No missing cells)'}
            </div>
          </div>
        </div>

        {/* Inferred Column Dtypes Count */}
        <div className="p-3.5 rounded-lg bg-white border border-[#E5E2D9] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Inferred Dtypes</span>
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-1">
            <div className="text-xs font-mono font-bold text-[#111111] flex flex-wrap gap-1 mt-1">
              {Object.entries(dtypeCounts).map(([dtype, count]) => (
                <span key={dtype} className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-[10px]">
                  {count} {dtype}
                </span>
              ))}
            </div>
            <div className="text-[10px] font-mono text-stone-400 mt-1">
              Deep type inference
            </div>
          </div>
        </div>

        {/* In-Memory Footprint */}
        <div className="p-3.5 rounded-lg bg-white border border-[#E5E2D9] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Memory Usage</span>
            <FileSpreadsheet className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <div className="mt-1">
            <div className="text-2xl font-bold font-mono text-[#111111] tracking-tight">
              {df.memoryUsageKb} <span className="text-xs font-normal text-stone-400">KB</span>
            </div>
            <div className="text-[10px] font-mono text-stone-500 mt-0.5">
              {df.history.length} transformation steps recorded
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE PANDAS OPERATION SHELF */}
      <div className="p-3 bg-white border border-[#E5E2D9] rounded-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E2D9] pb-2 text-xs font-mono">
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase font-mono text-stone-400 font-bold mr-1">
              TRANSFORM:
            </span>

            {/* Filter Button */}
            <button
              id="tool_filter_btn"
              onClick={() => setActiveTool(activeTool === 'filter' ? null : 'filter')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
                activeTool === 'filter' ? 'bg-[#111111] text-white font-bold' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>Query (Filter)</span>
            </button>

            {/* Fill NA Button */}
            <button
              id="tool_fillna_btn"
              onClick={() => setActiveTool(activeTool === 'fillna' ? null : 'fillna')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
                activeTool === 'fillna' ? 'bg-[#111111] text-white font-bold' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#1A42D9]" />
              <span>Fill NA</span>
            </button>

            {/* Drop NA Button */}
            <button
              id="tool_dropna_btn"
              onClick={() => setActiveTool(activeTool === 'dropna' ? null : 'dropna')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
                activeTool === 'dropna' ? 'bg-[#111111] text-white font-bold' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <Trash2 className="w-3 h-3 text-rose-600" />
              <span>Drop NA</span>
            </button>

            {/* Sort Button */}
            <button
              id="tool_sort_btn"
              onClick={() => setActiveTool(activeTool === 'sort' ? null : 'sort')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
                activeTool === 'sort' ? 'bg-[#111111] text-white font-bold' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort</span>
            </button>

            {/* Rename Column Button */}
            <button
              id="tool_rename_btn"
              onClick={() => setActiveTool(activeTool === 'rename' ? null : 'rename')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
                activeTool === 'rename' ? 'bg-[#111111] text-white font-bold' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <Edit2 className="w-3 h-3" />
              <span>Rename Col</span>
            </button>

            {/* Cast Dtype Button */}
            <button
              id="tool_astype_btn"
              onClick={() => setActiveTool(activeTool === 'astype' ? null : 'astype')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
                activeTool === 'astype' ? 'bg-[#111111] text-white font-bold' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>astype</span>
            </button>
          </div>

          {/* Active Operation History Pill */}
          <div className="text-[11px] font-mono text-stone-500 flex items-center gap-1">
            <span className="text-stone-400">Last action:</span>
            <span className="font-semibold text-[#111111] truncate max-w-xs">
              {df.history[df.history.length - 1]?.code || 'df = pd.read_csv(...)'}
            </span>
          </div>
        </div>

        {/* Dynamic Tool Configuration Forms */}
        {activeTool === 'filter' && (
          <div className="p-3 bg-[#FAF8F2] border border-[#E5E2D9] rounded-lg flex flex-wrap items-center gap-2 text-xs font-mono animate-in fade-in duration-150">
            <span className="text-stone-500 font-bold">df[df[</span>
            <select
              value={filterCol}
              onChange={e => setFilterCol(e.target.value)}
              className="bg-white border border-[#E5E2D9] px-2 py-1 rounded"
            >
              {df.columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filterOp}
              onChange={e => setFilterOp(e.target.value as any)}
              className="bg-white border border-[#E5E2D9] px-2 py-1 rounded"
            >
              <option value="==">==</option>
              <option value="!=">!=</option>
              <option value=">">&gt;</option>
              <option value="<">&lt;</option>
              <option value=">=">&gt;=</option>
              <option value="<=">&lt;=</option>
              <option value="contains">contains</option>
              <option value="isna">isna()</option>
              <option value="notna">notna()</option>
            </select>
            {filterOp !== 'isna' && filterOp !== 'notna' && (
              <input
                type="text"
                value={filterVal}
                onChange={e => setFilterVal(e.target.value)}
                placeholder="Target value..."
                className="bg-white border border-[#E5E2D9] px-2 py-1 rounded text-xs"
              />
            )}
            <span className="text-stone-500 font-bold">]</span>
            <button
              onClick={() => {
                setDf(prev => dfQuery(prev, filterCol, filterOp, filterVal));
                setActiveTool(null);
                setCurrentPage(1);
              }}
              className="px-3 py-1 rounded bg-[#111111] text-white font-bold hover:bg-[#1A42D9] transition-colors ml-auto"
            >
              Apply Filter
            </button>
          </div>
        )}

        {activeTool === 'fillna' && (
          <div className="p-3 bg-[#FAF8F2] border border-[#E5E2D9] rounded-lg flex flex-wrap items-center gap-2 text-xs font-mono animate-in fade-in duration-150">
            <span className="text-stone-500 font-bold">df['</span>
            <select
              value={fillCol}
              onChange={e => setFillCol(e.target.value)}
              className="bg-white border border-[#E5E2D9] px-2 py-1 rounded"
            >
              {df.columns.map(c => (
                <option key={c} value={c}>
                  {c} ({df.nullCounts[c]} nulls)
                </option>
              ))}
            </select>
            <span className="text-stone-500 font-bold">'].fillna(strategy=</span>
            <select
              value={fillStrategy}
              onChange={e => setFillStrategy(e.target.value as any)}
              className="bg-white border border-[#E5E2D9] px-2 py-1 rounded font-bold text-[#1A42D9]"
            >
              <option value="median">median() [Robust to outliers]</option>
              <option value="mean">mean() [Average value]</option>
              <option value="mode">mode() [Most frequent value]</option>
              <option value="ffill">ffill() [Forward fill]</option>
              <option value="bfill">bfill() [Backward fill]</option>
              <option value="constant">constant [Custom value]</option>
            </select>
            <span className="text-stone-500 font-bold">)</span>
            {fillStrategy === 'constant' && (
              <input
                type="text"
                value={fillCustomVal}
                onChange={e => setFillCustomVal(e.target.value)}
                placeholder="Replacement value..."
                className="bg-white border border-[#E5E2D9] px-2 py-1 rounded"
              />
            )}
            <button
              onClick={() => {
                setDf(prev => dfFillNA(prev, fillCol, fillStrategy, fillCustomVal));
                setActiveTool(null);
              }}
              className="px-3 py-1 rounded bg-[#111111] text-white font-bold hover:bg-[#1A42D9] transition-colors ml-auto"
            >
              Impute Missing Values
            </button>
          </div>
        )}

        {activeTool === 'dropna' && (
          <div className="p-3 bg-[#FAF8F2] border border-[#E5E2D9] rounded-lg flex flex-wrap items-center gap-3 text-xs font-mono animate-in fade-in duration-150">
            <span className="text-stone-500 font-bold">df.dropna(how=</span>
            <select
              value={dropHow}
              onChange={e => setDropHow(e.target.value as any)}
              className="bg-white border border-[#E5E2D9] px-2 py-1 rounded"
            >
              <option value="any">'any' (Drop if ANY column is null)</option>
              <option value="all">'all' (Drop only if ALL columns are null)</option>
            </select>
            <span className="text-stone-500 font-bold">)</span>
            <div className="flex items-center gap-1.5 text-stone-500">
              <span>Limit to subset:</span>
              <div className="flex flex-wrap gap-1">
                {df.columns.map(c => {
                  const isChecked = dropSubset.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => {
                        setDropSubset(prev => 
                          isChecked ? prev.filter(x => x !== c) : [...prev, c]
                        );
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] border ${
                        isChecked 
                          ? 'bg-[#111111] text-white border-[#111111]' 
                          : 'bg-white text-stone-600 border-stone-200'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => {
                setDf(prev => dfDropNA(prev, dropHow, dropSubset));
                setActiveTool(null);
                setCurrentPage(1);
              }}
              className="px-3 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors ml-auto"
            >
              Execute DropNA
            </button>
          </div>
        )}

        {activeTool === 'sort' && (
          <div className="p-3 bg-[#FAF8F2] border border-[#E5E2D9] rounded-lg flex flex-wrap items-center gap-2 text-xs font-mono animate-in fade-in duration-150">
            <span className="text-stone-500 font-bold">df.sort_values(by='</span>
            <select
              value={filterCol}
              onChange={e => setFilterCol(e.target.value)}
              className="bg-white border border-[#E5E2D9] px-2 py-1 rounded"
            >
              {df.columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="text-stone-500 font-bold">', ascending=</span>
            <button
              onClick={() => {
                setDf(prev => dfSortValues(prev, filterCol, true));
                setActiveTool(null);
              }}
              className="px-2.5 py-1 rounded bg-white border border-[#E5E2D9] hover:bg-stone-50 text-[#111111] font-bold"
            >
              True (Ascending ↑)
            </button>
            <button
              onClick={() => {
                setDf(prev => dfSortValues(prev, filterCol, false));
                setActiveTool(null);
              }}
              className="px-2.5 py-1 rounded bg-white border border-[#E5E2D9] hover:bg-stone-50 text-[#111111] font-bold"
            >
              False (Descending ↓)
            </button>
          </div>
        )}

        {activeTool === 'rename' && (
          <div className="p-3 bg-[#FAF8F2] border border-[#E5E2D9] rounded-lg flex flex-wrap items-center gap-2 text-xs font-mono animate-in fade-in duration-150">
            <span className="text-stone-500 font-bold">df.rename(columns={'{'}'</span>
            <select
              value={renameTargetCol}
              onChange={e => {
                setRenameTargetCol(e.target.value);
                setRenameNewName(e.target.value);
              }}
              className="bg-white border border-[#E5E2D9] px-2 py-1 rounded"
            >
              {df.columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="text-stone-500 font-bold">': '</span>
            <input
              type="text"
              value={renameNewName}
              onChange={e => setRenameNewName(e.target.value)}
              placeholder="new_column_name"
              className="bg-white border border-[#E5E2D9] px-2 py-1 rounded"
            />
            <span className="text-stone-500 font-bold">{'}'})</span>
            <button
              onClick={() => {
                if (renameNewName.trim()) {
                  setDf(prev => dfRenameColumn(prev, renameTargetCol, renameNewName));
                  setActiveTool(null);
                }
              }}
              className="px-3 py-1 rounded bg-[#111111] text-white font-bold hover:bg-[#1A42D9] transition-colors ml-auto"
            >
              Apply Rename
            </button>
          </div>
        )}

        {activeTool === 'astype' && (
          <div className="p-3 bg-[#FAF8F2] border border-[#E5E2D9] rounded-lg flex flex-wrap items-center gap-2 text-xs font-mono animate-in fade-in duration-150">
            <span className="text-stone-500 font-bold">df['</span>
            <select
              value={castCol}
              onChange={e => setCastCol(e.target.value)}
              className="bg-white border border-[#E5E2D9] px-2 py-1 rounded"
            >
              {df.columns.map(c => <option key={c} value={c}>{c} ({df.dtypes[c]})</option>)}
            </select>
            <span className="text-stone-500 font-bold">'] = df['{castCol}'].astype('</span>
            <select
              value={castNewDtype}
              onChange={e => setCastNewDtype(e.target.value as any)}
              className="bg-white border border-[#E5E2D9] px-2 py-1 rounded font-bold text-[#1A42D9]"
            >
              <option value="int64">int64 (Integer)</option>
              <option value="float64">float64 (Floating-point)</option>
              <option value="object">object (String / Text)</option>
              <option value="bool">bool (Boolean)</option>
              <option value="datetime64">datetime64 (Timestamp)</option>
            </select>
            <span className="text-stone-500 font-bold">')</span>
            <button
              onClick={() => {
                setDf(prev => dfAstype(prev, castCol, castNewDtype));
                setActiveTool(null);
              }}
              className="px-3 py-1 rounded bg-[#111111] text-white font-bold hover:bg-[#1A42D9] transition-colors ml-auto"
            >
              Cast DType
            </button>
          </div>
        )}
      </div>

      {/* 4. WORKBENCH SUB-VIEW TABS */}
      <div className="flex items-center justify-between border-b border-[#E5E2D9]">
        <div className="flex items-center gap-1">
          <button
            id="tab_sheet_view"
            onClick={() => setActiveTab('sheet')}
            className={`px-3 py-2 text-xs font-mono font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'sheet'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-stone-500 hover:text-[#111111]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Interactive Sheet</span>
          </button>

          <button
            id="tab_info_view"
            onClick={() => setActiveTab('info')}
            className={`px-3 py-2 text-xs font-mono font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'info'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-stone-500 hover:text-[#111111]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Column Profiling (df.info)</span>
          </button>

          <button
            id="tab_describe_view"
            onClick={() => setActiveTab('describe')}
            className={`px-3 py-2 text-xs font-mono font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'describe'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-stone-500 hover:text-[#111111]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Statistics (df.describe)</span>
          </button>

          <button
            id="tab_groupby_view"
            onClick={() => setActiveTab('groupby')}
            className={`px-3 py-2 text-xs font-mono font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'groupby'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-stone-500 hover:text-[#111111]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>GroupBy Cohorts</span>
          </button>

          <button
            id="tab_code_view"
            onClick={() => setActiveTab('code')}
            className={`px-3 py-2 text-xs font-mono font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'code'
                ? 'border-[#1A42D9] text-[#1A42D9]'
                : 'border-transparent text-stone-500 hover:text-[#111111]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Python Script</span>
          </button>
        </div>

        {/* Quick Search in Sheet */}
        {activeTab === 'sheet' && (
          <div className="flex items-center gap-2 pb-1">
            <div className="relative">
              <Search className="w-3 h-3 text-stone-400 absolute left-2 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search values..."
                className="pl-7 pr-3 py-1 bg-white border border-[#E5E2D9] rounded text-xs font-mono w-44 focus:outline-hidden focus:border-[#111111]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1.5 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. ACTIVE TAB VIEWPORT */}
      {/* TAB 1: SPREADSHEET GRID */}
      {activeTab === 'sheet' && (
        <div className="space-y-3">
          <div className="w-full overflow-x-auto bg-white border border-[#E5E2D9] rounded-lg shadow-2xs max-h-[550px]">
            <table className="w-full text-left border-collapse font-mono text-xs">
              {/* Sticky Table Header */}
              <thead className="bg-[#FAF8F2] sticky top-0 z-10 border-b border-[#E5E2D9]">
                <tr>
                  {/* Row Index Column Header */}
                  <th className="p-2.5 px-3 border-r border-[#E5E2D9] text-stone-400 font-normal w-12 text-center select-none bg-[#FAF8F2]">
                    #
                  </th>
                  {/* Dynamic DataFrame Column Headers */}
                  {df.columns.map(col => {
                    const dt = df.dtypes[col];
                    const nullCount = df.nullCounts[col] || 0;
                    return (
                      <th 
                        key={col} 
                        className="p-2.5 px-3 border-r border-[#E5E2D9] text-stone-800 font-semibold min-w-[140px] select-none group"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="truncate" title={col}>{col}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Dtype Badge */}
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${getDtypeBadgeColor(dt)}`}>
                              {dt}
                            </span>
                            {/* Drop Column Button */}
                            <button
                              onClick={() => setDf(prev => dfDropColumns(prev, [col]))}
                              className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-600 transition-opacity"
                              title={`Drop column '${col}'`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Column Null Indicator Bar */}
                        <div className="flex items-center justify-between text-[9px] text-stone-400 mt-1 font-normal">
                          <span>
                            {nullCount > 0 ? (
                              <span className="text-amber-700 font-semibold">{nullCount} null</span>
                            ) : (
                              '0 null'
                            )}
                          </span>
                          <button
                            onClick={() => setDf(prev => dfSortValues(prev, col, true))}
                            className="hover:text-[#111111]"
                            title="Sort Ascending"
                          >
                            ↑↓
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Table Body with In-Place Cell Editing */}
              <tbody className="divide-y divide-[#E5E2D9]">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={df.columns.length + 1} className="p-8 text-center text-stone-400 font-mono">
                      No rows match the query or search filter.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, rowIdx) => {
                    const globalRowIndex = (currentPage - 1) * pageSize + rowIdx;
                    return (
                      <tr 
                        key={globalRowIndex} 
                        className="hover:bg-stone-50/70 transition-colors group"
                      >
                        {/* Row Index */}
                        <td className="p-2 border-r border-[#E5E2D9] text-center text-stone-400 font-mono select-none bg-stone-50/40 text-[11px]">
                          {globalRowIndex}
                        </td>

                        {/* Cell Values */}
                        {df.columns.map(col => {
                          const val = row[col];
                          const isNull = isNullValue(val);
                          const isEditing = editingCell?.rowIdx === globalRowIndex && editingCell?.col === col;

                          return (
                            <td
                              key={col}
                              className={`p-2 px-3 border-r border-[#E5E2D9] truncate max-w-xs transition-colors ${
                                isNull ? 'bg-amber-50/40 text-amber-800' : 'text-stone-800'
                              }`}
                              onDoubleClick={() => {
                                setEditingCell({ rowIdx: globalRowIndex, col });
                                setEditValue(val === null || val === undefined ? '' : String(val));
                              }}
                            >
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  onBlur={handleCommitCellEdit}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleCommitCellEdit();
                                    if (e.key === 'Escape') setEditingCell(null);
                                  }}
                                  autoFocus
                                  className="w-full bg-white border border-[#1A42D9] px-1.5 py-0.5 rounded text-xs font-mono outline-hidden"
                                />
                              ) : (
                                <div className="flex items-center justify-between group/cell">
                                  {isNull ? (
                                    <span className="text-[10px] italic text-amber-700/80 bg-amber-100/50 px-1.5 py-0.5 rounded border border-amber-200">
                                      NaN
                                    </span>
                                  ) : (
                                    <span>{String(val)}</span>
                                  )}
                                  <button
                                    onClick={() => {
                                      setEditingCell({ rowIdx: globalRowIndex, col });
                                      setEditValue(val === null || val === undefined ? '' : String(val));
                                    }}
                                    className="opacity-0 group-hover/cell:opacity-100 text-stone-400 hover:text-[#111111] ml-1"
                                    title="Edit cell value"
                                  >
                                    <Edit2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Spreadsheet Footer Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-stone-500 px-1">
            <div className="flex items-center gap-2">
              <span>
                Showing {filteredRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length} rows
              </span>
              {searchQuery && (
                <span className="text-stone-400">
                  (filtered from {df.rows.length} total)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Page Size Selector */}
              <div className="flex items-center gap-1">
                <span>Page size:</span>
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-[#E5E2D9] px-2 py-0.5 rounded text-xs font-mono cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Page Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded bg-white border border-[#E5E2D9] disabled:opacity-40 hover:bg-stone-50"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-bold text-[#111111]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded bg-white border border-[#E5E2D9] disabled:opacity-40 hover:bg-stone-50"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COLUMN PROFILING & DTYPES (df.info()) */}
      {activeTab === 'info' && (
        <div className="bg-white border border-[#E5E2D9] rounded-lg p-4 space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#111111]">
                DataFrame Summary Profile (df.info())
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                RangeIndex: {df.shape[0]} entries • {df.shape[1]} data columns • Memory: {df.memoryUsageKb} KB
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-[#E5E2D9]">
              <thead>
                <tr className="text-stone-400 font-bold uppercase text-[10px]">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Column</th>
                  <th className="py-2 px-3">Non-Null Count</th>
                  <th className="py-2 px-3">Null Count</th>
                  <th className="py-2 px-3">Completeness</th>
                  <th className="py-2 px-3">Dtype</th>
                  <th className="py-2 px-3">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2D9]">
                {df.columns.map((col, idx) => {
                  const nullCount = df.nullCounts[col] || 0;
                  const nonNullCount = df.shape[0] - nullCount;
                  const pct = df.shape[0] > 0 ? (nonNullCount / df.shape[0]) * 100 : 100;
                  const dt = df.dtypes[col];

                  return (
                    <tr key={col} className="hover:bg-stone-50/70">
                      <td className="py-2.5 px-3 text-stone-400">{idx}</td>
                      <td className="py-2.5 px-3 font-bold text-[#111111]">{col}</td>
                      <td className="py-2.5 px-3 text-stone-700">{nonNullCount} non-null</td>
                      <td className="py-2.5 px-3">
                        {nullCount > 0 ? (
                          <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {nullCount} ({((nullCount / df.shape[0]) * 100).toFixed(1)}%)
                          </span>
                        ) : (
                          <span className="text-stone-400">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 w-36">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${pct === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                          <span className="text-[10px] text-stone-500">{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getDtypeBadgeColor(dt)}`}>
                          {dt}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 text-[11px]">
                          {nullCount > 0 && (
                            <button
                              onClick={() => {
                                setFillCol(col);
                                setActiveTool('fillna');
                                setActiveTab('sheet');
                              }}
                              className="text-[#1A42D9] hover:underline font-bold"
                            >
                              Impute →
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setCastCol(col);
                              setActiveTool('astype');
                              setActiveTab('sheet');
                            }}
                            className="text-stone-500 hover:text-[#111111] ml-2"
                          >
                            Cast
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STATISTICAL SUMMARY (df.describe()) */}
      {activeTab === 'describe' && (
        <div className="bg-white border border-[#E5E2D9] rounded-lg p-4 space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#111111]">
                Empirical Summary Statistics (df.describe())
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Parametric and non-parametric percentiles across numerical features
              </p>
            </div>
            <span className="text-[10px] text-stone-400">
              {summaryStats.length} numeric columns profiled
            </span>
          </div>

          {summaryStats.length === 0 ? (
            <div className="p-8 text-center text-stone-400">
              No numeric columns (int64/float64) available in this dataset.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-[#E5E2D9]">
                <thead>
                  <tr className="text-stone-400 font-bold uppercase text-[10px]">
                    <th className="py-2 px-3">Metric</th>
                    {summaryStats.map(s => (
                      <th key={s.column} className="py-2 px-3 font-semibold text-[#111111]">
                        {s.column}
                        <span className="block text-[9px] text-stone-400 font-normal">({s.dtype})</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E2D9] text-stone-800">
                  <tr className="hover:bg-stone-50/50">
                    <td className="py-2 px-3 font-bold text-stone-500">count</td>
                    {summaryStats.map(s => <td key={s.column} className="py-2 px-3">{s.count}</td>)}
                  </tr>
                  <tr className="hover:bg-stone-50/50">
                    <td className="py-2 px-3 font-bold text-stone-500">mean</td>
                    {summaryStats.map(s => <td key={s.column} className="py-2 px-3 text-[#1A42D9] font-bold">{s.mean}</td>)}
                  </tr>
                  <tr className="hover:bg-stone-50/50">
                    <td className="py-2 px-3 font-bold text-stone-500">std (σ)</td>
                    {summaryStats.map(s => <td key={s.column} className="py-2 px-3">{s.std}</td>)}
                  </tr>
                  <tr className="hover:bg-stone-50/50">
                    <td className="py-2 px-3 font-bold text-stone-500">min</td>
                    {summaryStats.map(s => <td key={s.column} className="py-2 px-3">{s.min}</td>)}
                  </tr>
                  <tr className="hover:bg-stone-50/50">
                    <td className="py-2 px-3 font-bold text-stone-500">25% (Q1)</td>
                    {summaryStats.map(s => <td key={s.column} className="py-2 px-3">{s.p25}</td>)}
                  </tr>
                  <tr className="hover:bg-stone-50/50">
                    <td className="py-2 px-3 font-bold text-stone-500">50% (Median)</td>
                    {summaryStats.map(s => <td key={s.column} className="py-2 px-3 font-bold text-emerald-700">{s.median}</td>)}
                  </tr>
                  <tr className="hover:bg-stone-50/50">
                    <td className="py-2 px-3 font-bold text-stone-500">75% (Q3)</td>
                    {summaryStats.map(s => <td key={s.column} className="py-2 px-3">{s.p75}</td>)}
                  </tr>
                  <tr className="hover:bg-stone-50/50">
                    <td className="py-2 px-3 font-bold text-stone-500">max</td>
                    {summaryStats.map(s => <td key={s.column} className="py-2 px-3">{s.max}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GROUPBY COHORTS (df.groupby()) */}
      {activeTab === 'groupby' && (
        <div className="bg-white border border-[#E5E2D9] rounded-lg p-4 space-y-4 font-mono">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E2D9] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#111111]">
                Categorical Aggregation Engine (df.groupby())
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Split-Apply-Combine pattern on arbitrary dimensions
              </p>
            </div>

            {/* GroupBy Configuration Selectors */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-stone-400 font-bold">df.groupby('</span>
              <select
                value={groupByCatCol}
                onChange={e => setGroupByCatCol(e.target.value)}
                className="bg-stone-50 border border-[#E5E2D9] px-2 py-1 rounded"
              >
                {df.columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="text-stone-400 font-bold">')['</span>
              <select
                value={groupByNumCol}
                onChange={e => setGroupByNumCol(e.target.value)}
                className="bg-stone-50 border border-[#E5E2D9] px-2 py-1 rounded"
              >
                {df.columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="text-stone-400 font-bold">'].</span>
              <select
                value={groupByFunc}
                onChange={e => setGroupByFunc(e.target.value as any)}
                className="bg-stone-50 border border-[#E5E2D9] px-2 py-1 rounded text-[#1A42D9] font-bold"
              >
                <option value="mean">mean()</option>
                <option value="sum">sum()</option>
                <option value="count">count()</option>
                <option value="min">min()</option>
                <option value="max">max()</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-[#E5E2D9]">
              <thead>
                <tr className="text-stone-400 uppercase font-bold text-[10px]">
                  <th className="py-2 px-3">{groupByCatCol} (Cohort)</th>
                  <th className="py-2 px-3">Count (N)</th>
                  <th className="py-2 px-3">{groupByFunc}({groupByNumCol})</th>
                  <th className="py-2 px-3">Distribution Bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2D9]">
                {groupByData.map(item => {
                  const maxVal = Math.max(...groupByData.map(d => d.aggValue), 1);
                  const barPct = Math.max(5, Math.min(100, (item.aggValue / maxVal) * 100));

                  return (
                    <tr key={item.groupValue} className="hover:bg-stone-50/70">
                      <td className="py-2 px-3 font-bold text-[#111111]">{item.groupValue}</td>
                      <td className="py-2 px-3 text-stone-500">{item.count} samples</td>
                      <td className="py-2 px-3 font-bold text-[#1A42D9]">{item.aggValue}</td>
                      <td className="py-2 px-3 w-44">
                        <div className="w-32 h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#1A42D9]" style={{ width: `${barPct}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PYTHON SCRIPT REPRODUCER */}
      {activeTab === 'code' && (
        <div className="bg-[#111111] text-stone-200 border border-stone-800 rounded-lg p-4 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase text-stone-400 font-bold tracking-wider">
                Reproducible Python Pandas Script
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Executable
              </span>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-xs flex items-center gap-1.5 text-stone-300 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Script'}</span>
            </button>
          </div>

          <pre className="text-xs text-stone-300 overflow-x-auto p-3 bg-black/40 rounded leading-relaxed">
            {generatedScript}
          </pre>

          <div className="p-3 rounded bg-stone-900 border border-stone-800 text-xs text-stone-400 space-y-1 font-sans">
            <div className="font-mono text-stone-300 font-bold text-[11px] uppercase">
              Pro-Tip: Modern Pandas 2.0+ Best Practices
            </div>
            <p>
              • Notice how method chaining and direct column assignment avoid the dreaded <code className="font-mono text-amber-300">SettingWithCopyWarning</code>.
            </p>
            <p>
              • In-place mutation (<code className="font-mono text-stone-300">inplace=True</code>) is discouraged in modern pandas; re-assigning <code className="font-mono text-stone-300">df = df.operation()</code> enables cleaner memory optimization and lazy execution.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

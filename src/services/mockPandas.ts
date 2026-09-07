export type DType = 'int64' | 'float64' | 'object' | 'bool' | 'datetime64';

export interface TransformationHistoryItem {
  id: string;
  action: string;
  code: string;
  description: string;
  timestamp: number;
}

export interface DataFrameState {
  name: string;
  columns: string[];
  rows: Record<string, any>[];
  originalRows: Record<string, any>[];
  originalColumns: string[];
  dtypes: Record<string, DType>;
  shape: [number, number]; // [rows, columns]
  nullCounts: Record<string, number>;
  totalNulls: number;
  memoryUsageKb: number;
  history: TransformationHistoryItem[];
  snapshots: { rows: Record<string, any>[]; columns: string[]; dtypes: Record<string, DType> }[];
}

export interface SummaryStatItem {
  column: string;
  dtype: DType;
  count: number;
  mean: number | null;
  std: number | null;
  min: number | null;
  p25: number | null;
  median: number | null;
  p75: number | null;
  max: number | null;
}

export interface GroupByResult {
  groupValue: string;
  count: number;
  aggValue: number;
}

// Helper: Check if value is null / NaN
export const isNullValue = (val: any): boolean => {
  if (val === null || val === undefined) return true;
  if (typeof val === 'string') {
    const trimmed = val.trim().toLowerCase();
    return trimmed === '' || trimmed === 'nan' || trimmed === 'null' || trimmed === 'na' || trimmed === 'none' || trimmed === '-';
  }
  if (typeof val === 'number' && isNaN(val)) return true;
  return false;
};

// Helper: Infer dtype of an array of values
export const inferDtype = (values: any[]): DType => {
  const nonNulls = values.filter(v => !isNullValue(v));
  if (nonNulls.length === 0) return 'object';

  let allInt = true;
  let allFloat = true;
  let allBool = true;
  let allDate = true;

  const intRegex = /^-?\d+$/;
  const floatRegex = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/;
  const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/;

  for (const v of nonNulls) {
    const s = String(v).trim();
    if (typeof v === 'boolean' || s.toLowerCase() === 'true' || s.toLowerCase() === 'false') {
      // boolean check
    } else {
      allBool = false;
    }

    if (!intRegex.test(s)) allInt = false;
    if (!floatRegex.test(s)) allFloat = false;
    if (!dateRegex.test(s)) allDate = false;
  }

  if (allBool) return 'bool';
  if (allInt) return 'int64';
  if (allFloat) return 'float64';
  if (allDate) return 'datetime64';
  return 'object';
};

// Helper: Cast raw value based on inferred DType
export const castValue = (val: any, dtype: DType): any => {
  if (isNullValue(val)) return null;
  if (dtype === 'int64') {
    const parsed = parseInt(String(val), 10);
    return isNaN(parsed) ? null : parsed;
  }
  if (dtype === 'float64') {
    const parsed = parseFloat(String(val));
    return isNaN(parsed) ? null : Number(parsed.toFixed(4));
  }
  if (dtype === 'bool') {
    const s = String(val).trim().toLowerCase();
    return s === 'true' || s === '1';
  }
  return String(val).trim();
};

// Robust CSV Line Parser handling quotes and commas
export const parseCSVLine = (line: string): string[] => {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
};

// Compute metadata (null counts, shape, memory, dtypes)
export const computeDataFrameMetadata = (
  rows: Record<string, any>[],
  columns: string[],
  overrideDtypes?: Record<string, DType>
) => {
  const shape: [number, number] = [rows.length, columns.length];
  const nullCounts: Record<string, number> = {};
  const dtypes: Record<string, DType> = { ...overrideDtypes };
  let totalNulls = 0;

  columns.forEach(col => {
    let nullCount = 0;
    const values: any[] = [];

    rows.forEach(r => {
      const val = r[col];
      if (isNullValue(val)) {
        nullCount++;
      } else {
        values.push(val);
      }
    });

    nullCounts[col] = nullCount;
    totalNulls += nullCount;

    if (!dtypes[col]) {
      dtypes[col] = inferDtype(values);
    }
  });

  // Calculate approximate memory usage in KB
  // int64 = 8 bytes, float64 = 8 bytes, bool = 1 byte, object ~ 16 bytes
  let bytes = 0;
  columns.forEach(col => {
    const dt = dtypes[col];
    const unitBytes = dt === 'int64' || dt === 'float64' || dt === 'datetime64' ? 8 : dt === 'bool' ? 1 : 16;
    bytes += rows.length * unitBytes + col.length;
  });
  const memoryUsageKb = Number((bytes / 1024).toFixed(2));

  return { shape, nullCounts, totalNulls, dtypes, memoryUsageKb };
};

// Create DataFrameState from raw CSV text
export const createDataFrameFromCSV = (csvText: string, datasetName: string = 'uploaded_data.csv'): DataFrameState => {
  const rawLines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (rawLines.length === 0) {
    return {
      name: datasetName,
      columns: [],
      rows: [],
      originalRows: [],
      originalColumns: [],
      dtypes: {},
      shape: [0, 0],
      nullCounts: {},
      totalNulls: 0,
      memoryUsageKb: 0,
      history: [],
      snapshots: []
    };
  }

  const headerLine = rawLines[0];
  const columns = parseCSVLine(headerLine).map((col, idx) => col || `col_${idx + 1}`);

  const rows: Record<string, any>[] = [];
  for (let i = 1; i < rawLines.length; i++) {
    const fields = parseCSVLine(rawLines[i]);
    const rowObj: Record<string, any> = {};
    columns.forEach((col, cIdx) => {
      rowObj[col] = cIdx < fields.length ? fields[cIdx] : null;
    });
    rows.push(rowObj);
  }

  const { shape, nullCounts, totalNulls, dtypes, memoryUsageKb } = computeDataFrameMetadata(rows, columns);

  // Cast values according to inferred dtypes
  const typedRows = rows.map(r => {
    const newRow: Record<string, any> = {};
    columns.forEach(c => {
      newRow[c] = castValue(r[c], dtypes[c]);
    });
    return newRow;
  });

  return {
    name: datasetName,
    columns,
    rows: typedRows,
    originalRows: JSON.parse(JSON.stringify(typedRows)),
    originalColumns: [...columns],
    dtypes,
    shape,
    nullCounts,
    totalNulls,
    memoryUsageKb,
    history: [
      {
        id: 'init',
        action: 'read_csv',
        code: `df = pd.read_csv('${datasetName}')`,
        description: `Loaded ${datasetName} with ${shape[0]} rows and ${shape[1]} columns`,
        timestamp: Date.now()
      }
    ],
    snapshots: []
  };
};

// Convert DataFrame to downloadable CSV string
export const exportDataFrameToCSV = (df: DataFrameState): string => {
  const header = df.columns.map(c => `"${c.replace(/"/g, '""')}"`).join(',');
  const lines = df.rows.map(row => {
    return df.columns.map(col => {
      const val = row[col];
      if (isNullValue(val)) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',');
  });
  return [header, ...lines].join('\n');
};

// --- Mock Pandas Transformation Functions ---

// 1. dropna
export const dfDropNA = (
  df: DataFrameState,
  how: 'any' | 'all' = 'any',
  subset?: string[]
): DataFrameState => {
  const targetCols = subset && subset.length > 0 ? subset : df.columns;
  const filteredRows = df.rows.filter(row => {
    if (how === 'any') {
      return !targetCols.some(col => isNullValue(row[col]));
    } else {
      return !targetCols.every(col => isNullValue(row[col]));
    }
  });

  const { shape, nullCounts, totalNulls, memoryUsageKb } = computeDataFrameMetadata(filteredRows, df.columns, df.dtypes);
  const droppedCount = df.rows.length - filteredRows.length;
  
  const subsetArg = subset && subset.length > 0 ? `, subset=${JSON.stringify(subset)}` : '';
  const howArg = how !== 'any' ? `, how='${how}'` : '';
  const code = `df = df.dropna(${subsetArg ? subsetArg.slice(2) : ''}${howArg ? (subsetArg ? howArg : howArg.slice(2)) : ''})`;

  return {
    ...df,
    rows: filteredRows,
    shape,
    nullCounts,
    totalNulls,
    memoryUsageKb,
    history: [
      ...df.history,
      {
        id: `dropna_${Date.now()}`,
        action: 'dropna',
        code,
        description: `Dropped ${droppedCount} rows with missing values (${how} strategy)`,
        timestamp: Date.now()
      }
    ],
    snapshots: [...df.snapshots, { rows: df.rows, columns: df.columns, dtypes: df.dtypes }]
  };
};

// 2. fillna
export const dfFillNA = (
  df: DataFrameState,
  column: string,
  strategy: 'mean' | 'median' | 'mode' | 'ffill' | 'bfill' | 'constant',
  constantValue?: any
): DataFrameState => {
  const values = df.rows.map(r => r[column]).filter(v => !isNullValue(v));
  let fillTarget: any = constantValue ?? 'Unknown';

  if (strategy === 'mean') {
    const numValues = values.map(Number).filter(n => !isNaN(n));
    const mean = numValues.length > 0 ? numValues.reduce((a, b) => a + b, 0) / numValues.length : 0;
    fillTarget = Number(mean.toFixed(2));
  } else if (strategy === 'median') {
    const numValues = values.map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
    const mid = Math.floor(numValues.length / 2);
    fillTarget = numValues.length % 2 !== 0 ? numValues[mid] : Number(((numValues[mid - 1] + numValues[mid]) / 2).toFixed(2));
  } else if (strategy === 'mode') {
    const counts: Record<string, number> = {};
    values.forEach(v => { counts[String(v)] = (counts[String(v)] || 0) + 1; });
    let maxC = -1;
    let modeVal: any = values[0] || 'Unknown';
    Object.entries(counts).forEach(([k, count]) => {
      if (count > maxC) {
        maxC = count;
        modeVal = k;
      }
    });
    fillTarget = df.dtypes[column] === 'int64' || df.dtypes[column] === 'float64' ? Number(modeVal) : modeVal;
  }

  const updatedRows = df.rows.map((row, idx) => {
    if (!isNullValue(row[column])) return row;

    let newVal = fillTarget;
    if (strategy === 'ffill') {
      for (let i = idx - 1; i >= 0; i--) {
        if (!isNullValue(df.rows[i][column])) {
          newVal = df.rows[i][column];
          break;
        }
      }
    } else if (strategy === 'bfill') {
      for (let i = idx + 1; i < df.rows.length; i++) {
        if (!isNullValue(df.rows[i][column])) {
          newVal = df.rows[i][column];
          break;
        }
      }
    }

    return { ...row, [column]: newVal };
  });

  const { shape, nullCounts, totalNulls, memoryUsageKb } = computeDataFrameMetadata(updatedRows, df.columns, df.dtypes);

  let pyCode = `df['${column}'] = df['${column}'].fillna(${JSON.stringify(fillTarget)})`;
  if (strategy === 'mean') {
    pyCode = `df['${column}'] = df['${column}'].fillna(df['${column}'].mean())`;
  } else if (strategy === 'median') {
    pyCode = `df['${column}'] = df['${column}'].fillna(df['${column}'].median())`;
  } else if (strategy === 'ffill' || strategy === 'bfill') {
    pyCode = `df['${column}'] = df['${column}'].${strategy}()`;
  }

  return {
    ...df,
    rows: updatedRows,
    shape,
    nullCounts,
    totalNulls,
    memoryUsageKb,
    history: [
      ...df.history,
      {
        id: `fillna_${Date.now()}`,
        action: 'fillna',
        code: pyCode,
        description: `Imputed missing values in '${column}' using ${strategy} (${fillTarget})`,
        timestamp: Date.now()
      }
    ],
    snapshots: [...df.snapshots, { rows: df.rows, columns: df.columns, dtypes: df.dtypes }]
  };
};

// 3. sort_values
export const dfSortValues = (
  df: DataFrameState,
  by: string,
  ascending: boolean = true
): DataFrameState => {
  const sorted = [...df.rows].sort((a, b) => {
    const valA = a[by];
    const valB = b[by];
    if (isNullValue(valA)) return 1;
    if (isNullValue(valB)) return -1;
    if (valA < valB) return ascending ? -1 : 1;
    if (valA > valB) return ascending ? 1 : -1;
    return 0;
  });

  const code = `df = df.sort_values(by='${by}', ascending=${ascending ? 'True' : 'False'})`;

  return {
    ...df,
    rows: sorted,
    history: [
      ...df.history,
      {
        id: `sort_${Date.now()}`,
        action: 'sort_values',
        code,
        description: `Sorted rows by '${by}' (${ascending ? 'ascending' : 'descending'})`,
        timestamp: Date.now()
      }
    ],
    snapshots: [...df.snapshots, { rows: df.rows, columns: df.columns, dtypes: df.dtypes }]
  };
};

// 4. query / filter
export const dfQuery = (
  df: DataFrameState,
  column: string,
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'isna' | 'notna',
  targetValue: any
): DataFrameState => {
  const filtered = df.rows.filter(row => {
    const val = row[column];
    if (operator === 'isna') return isNullValue(val);
    if (operator === 'notna') return !isNullValue(val);

    if (isNullValue(val)) return false;

    if (operator === 'contains') {
      return String(val).toLowerCase().includes(String(targetValue).toLowerCase());
    }

    const numVal = Number(val);
    const numTarget = Number(targetValue);
    const isNumComparison = !isNaN(numVal) && !isNaN(numTarget);

    if (isNumComparison) {
      if (operator === '==') return numVal === numTarget;
      if (operator === '!=') return numVal !== numTarget;
      if (operator === '>') return numVal > numTarget;
      if (operator === '<') return numVal < numTarget;
      if (operator === '>=') return numVal >= numTarget;
      if (operator === '<=') return numVal <= numTarget;
    } else {
      if (operator === '==') return String(val).toLowerCase() === String(targetValue).toLowerCase();
      if (operator === '!=') return String(val).toLowerCase() !== String(targetValue).toLowerCase();
    }
    return false;
  });

  const { shape, nullCounts, totalNulls, memoryUsageKb } = computeDataFrameMetadata(filtered, df.columns, df.dtypes);

  let pyCode = `df = df[df['${column}'] ${operator} ${JSON.stringify(targetValue)}]`;
  if (operator === 'isna') pyCode = `df = df[df['${column}'].isna()]`;
  if (operator === 'notna') pyCode = `df = df[df['${column}'].notna()]`;
  if (operator === 'contains') pyCode = `df = df[df['${column}'].str.contains('${targetValue}', na=False)]`;

  return {
    ...df,
    rows: filtered,
    shape,
    nullCounts,
    totalNulls,
    memoryUsageKb,
    history: [
      ...df.history,
      {
        id: `filter_${Date.now()}`,
        action: 'query',
        code: pyCode,
        description: `Filtered where '${column}' ${operator} ${targetValue ?? ''} (${filtered.length} rows remain)`,
        timestamp: Date.now()
      }
    ],
    snapshots: [...df.snapshots, { rows: df.rows, columns: df.columns, dtypes: df.dtypes }]
  };
};

// 5. drop columns
export const dfDropColumns = (df: DataFrameState, columnsToDrop: string[]): DataFrameState => {
  const newColumns = df.columns.filter(c => !columnsToDrop.includes(c));
  const newRows = df.rows.map(row => {
    const copy = { ...row };
    columnsToDrop.forEach(c => delete copy[c]);
    return copy;
  });

  const newDtypes: Record<string, DType> = {};
  newColumns.forEach(c => { newDtypes[c] = df.dtypes[c]; });

  const { shape, nullCounts, totalNulls, memoryUsageKb } = computeDataFrameMetadata(newRows, newColumns, newDtypes);

  return {
    ...df,
    columns: newColumns,
    rows: newRows,
    dtypes: newDtypes,
    shape,
    nullCounts,
    totalNulls,
    memoryUsageKb,
    history: [
      ...df.history,
      {
        id: `drop_${Date.now()}`,
        action: 'drop',
        code: `df = df.drop(columns=${JSON.stringify(columnsToDrop)})`,
        description: `Dropped column(s): ${columnsToDrop.join(', ')}`,
        timestamp: Date.now()
      }
    ],
    snapshots: [...df.snapshots, { rows: df.rows, columns: df.columns, dtypes: df.dtypes }]
  };
};

// 6. rename column
export const dfRenameColumn = (df: DataFrameState, oldName: string, newName: string): DataFrameState => {
  if (!newName.trim() || oldName === newName) return df;
  const cleanNewName = newName.trim();

  const newColumns = df.columns.map(c => c === oldName ? cleanNewName : c);
  const newRows = df.rows.map(row => {
    const copy: Record<string, any> = {};
    Object.keys(row).forEach(k => {
      copy[k === oldName ? cleanNewName : k] = row[k];
    });
    return copy;
  });

  const newDtypes: Record<string, DType> = {};
  newColumns.forEach(c => {
    newDtypes[c] = c === cleanNewName ? df.dtypes[oldName] : df.dtypes[c];
  });

  const { shape, nullCounts, totalNulls, memoryUsageKb } = computeDataFrameMetadata(newRows, newColumns, newDtypes);

  return {
    ...df,
    columns: newColumns,
    rows: newRows,
    dtypes: newDtypes,
    shape,
    nullCounts,
    totalNulls,
    memoryUsageKb,
    history: [
      ...df.history,
      {
        id: `rename_${Date.now()}`,
        action: 'rename',
        code: `df = df.rename(columns={'${oldName}': '${cleanNewName}'})`,
        description: `Renamed '${oldName}' → '${cleanNewName}'`,
        timestamp: Date.now()
      }
    ],
    snapshots: [...df.snapshots, { rows: df.rows, columns: df.columns, dtypes: df.dtypes }]
  };
};

// 7. astype (type cast)
export const dfAstype = (df: DataFrameState, column: string, newDtype: DType): DataFrameState => {
  const updatedRows = df.rows.map(row => ({
    ...row,
    [column]: castValue(row[column], newDtype)
  }));

  const newDtypes = { ...df.dtypes, [column]: newDtype };
  const { shape, nullCounts, totalNulls, memoryUsageKb } = computeDataFrameMetadata(updatedRows, df.columns, newDtypes);

  return {
    ...df,
    rows: updatedRows,
    dtypes: newDtypes,
    shape,
    nullCounts,
    totalNulls,
    memoryUsageKb,
    history: [
      ...df.history,
      {
        id: `astype_${Date.now()}`,
        action: 'astype',
        code: `df['${column}'] = df['${column}'].astype('${newDtype}')`,
        description: `Cast column '${column}' to ${newDtype}`,
        timestamp: Date.now()
      }
    ],
    snapshots: [...df.snapshots, { rows: df.rows, columns: df.columns, dtypes: df.dtypes }]
  };
};

// 8. edit cell directly (spreadsheet inline edit)
export const dfEditCell = (df: DataFrameState, rowIndex: number, column: string, newValue: any): DataFrameState => {
  if (rowIndex < 0 || rowIndex >= df.rows.length) return df;
  const currentVal = df.rows[rowIndex][column];
  if (currentVal === newValue) return df;

  const targetDtype = df.dtypes[column];
  const casted = castValue(newValue, targetDtype);

  const updatedRows = [...df.rows];
  updatedRows[rowIndex] = { ...updatedRows[rowIndex], [column]: casted };

  const { shape, nullCounts, totalNulls, memoryUsageKb } = computeDataFrameMetadata(updatedRows, df.columns, df.dtypes);

  return {
    ...df,
    rows: updatedRows,
    shape,
    nullCounts,
    totalNulls,
    memoryUsageKb,
    history: [
      ...df.history,
      {
        id: `loc_${Date.now()}`,
        action: 'loc',
        code: `df.loc[${rowIndex}, '${column}'] = ${JSON.stringify(casted)}`,
        description: `Updated cell [${rowIndex}, '${column}'] = ${casted}`,
        timestamp: Date.now()
      }
    ],
    snapshots: [...df.snapshots, { rows: df.rows, columns: df.columns, dtypes: df.dtypes }]
  };
};

// 9. Reset to original uploaded state
export const dfResetToOriginal = (df: DataFrameState): DataFrameState => {
  const { shape, nullCounts, totalNulls, dtypes, memoryUsageKb } = computeDataFrameMetadata(
    df.originalRows,
    df.originalColumns
  );

  return {
    ...df,
    columns: [...df.originalColumns],
    rows: JSON.parse(JSON.stringify(df.originalRows)),
    dtypes,
    shape,
    nullCounts,
    totalNulls,
    memoryUsageKb,
    history: [
      {
        id: `reset_${Date.now()}`,
        action: 'reset',
        code: `# Re-read raw dataset\ndf = pd.read_csv('${df.name}')`,
        description: `Reset dataset to original state (${df.originalRows.length} rows, ${df.originalColumns.length} cols)`,
        timestamp: Date.now()
      }
    ],
    snapshots: []
  };
};

// 10. Undo last operation
export const dfUndoLast = (df: DataFrameState): DataFrameState => {
  if (df.snapshots.length === 0) return df;
  const previousSnapshot = df.snapshots[df.snapshots.length - 1];
  const remainingSnapshots = df.snapshots.slice(0, -1);
  const remainingHistory = df.history.slice(0, -1);

  const { shape, nullCounts, totalNulls, memoryUsageKb } = computeDataFrameMetadata(
    previousSnapshot.rows,
    previousSnapshot.columns,
    previousSnapshot.dtypes
  );

  return {
    ...df,
    columns: previousSnapshot.columns,
    rows: previousSnapshot.rows,
    dtypes: previousSnapshot.dtypes,
    shape,
    nullCounts,
    totalNulls,
    memoryUsageKb,
    history: remainingHistory,
    snapshots: remainingSnapshots
  };
};

// Compute df.describe() summary statistics for numerical columns
export const computeSummaryStatistics = (df: DataFrameState): SummaryStatItem[] => {
  const numericCols = df.columns.filter(c => df.dtypes[c] === 'int64' || df.dtypes[c] === 'float64');

  return numericCols.map(col => {
    const rawVals = df.rows.map(r => r[col]).filter(v => !isNullValue(v)).map(Number).filter(n => !isNaN(n));
    if (rawVals.length === 0) {
      return {
        column: col,
        dtype: df.dtypes[col],
        count: 0,
        mean: null,
        std: null,
        min: null,
        p25: null,
        median: null,
        p75: null,
        max: null
      };
    }

    const sorted = [...rawVals].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const mean = sum / count;

    // Variance & Std Dev (sample standard deviation ddof=1)
    const variance = count > 1 ? sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (count - 1) : 0;
    const std = Math.sqrt(variance);

    const getPercentile = (p: number) => {
      const idx = p * (count - 1);
      const low = Math.floor(idx);
      const high = Math.ceil(idx);
      const weight = idx - low;
      return sorted[low] * (1 - weight) + sorted[high] * weight;
    };

    return {
      column: col,
      dtype: df.dtypes[col],
      count,
      mean: Number(mean.toFixed(2)),
      std: Number(std.toFixed(2)),
      min: Number(sorted[0].toFixed(2)),
      p25: Number(getPercentile(0.25).toFixed(2)),
      median: Number(getPercentile(0.50).toFixed(2)),
      p75: Number(getPercentile(0.75).toFixed(2)),
      max: Number(sorted[count - 1].toFixed(2))
    };
  });
};

// Compute GroupBy aggregation
export const computeGroupBy = (
  df: DataFrameState,
  groupCol: string,
  aggCol: string,
  func: 'mean' | 'sum' | 'count' | 'min' | 'max'
): GroupByResult[] => {
  const groups: Record<string, number[]> = {};

  df.rows.forEach(row => {
    const groupKey = isNullValue(row[groupCol]) ? '(Null/Missing)' : String(row[groupCol]);
    const numVal = Number(row[aggCol]);
    if (!groups[groupKey]) groups[groupKey] = [];
    if (!isNullValue(row[aggCol]) && !isNaN(numVal)) {
      groups[groupKey].push(numVal);
    }
  });

  return Object.entries(groups).map(([key, vals]) => {
    let agg = 0;
    if (vals.length > 0) {
      if (func === 'count') agg = vals.length;
      else if (func === 'sum') agg = vals.reduce((a, b) => a + b, 0);
      else if (func === 'mean') agg = vals.reduce((a, b) => a + b, 0) / vals.length;
      else if (func === 'min') agg = Math.min(...vals);
      else if (func === 'max') agg = Math.max(...vals);
    }
    return {
      groupValue: key,
      count: vals.length,
      aggValue: Number(agg.toFixed(2))
    };
  }).sort((a, b) => b.count - a.count);
};

// Curated Sample CSV Datasets for Instant Prototyping
export const SAMPLE_PANDAS_DATASETS: { id: string; name: string; description: string; csv: string }[] = [
  {
    id: 'titanic',
    name: 'Titanic Passenger Registry',
    description: 'Classic survival dataset with missing age, cabins, mixed dtypes, and rich demographics.',
    csv: `PassengerId,Survived,Pclass,Name,Sex,Age,SibSp,Parch,Fare,Cabin,Embarked
1,0,3,"Braund, Mr. Owen Harris",male,22,1,0,7.25,,S
2,1,1,"Cumings, Mrs. John Bradley",female,38,1,0,71.2833,C85,C
3,1,3,"Heikkinen, Miss. Laina",female,26,0,0,7.925,,S
4,1,1,"Futrelle, Mrs. Jacques Heath",female,35,1,0,53.1,C123,S
5,0,3,"Allen, Mr. William Henry",male,35,0,0,8.05,,S
6,0,3,"Moran, Mr. James",male,,0,0,8.4583,,Q
7,0,1,"McCarthy, Mr. Timothy J",male,54,0,0,51.8625,E46,S
8,0,3,"Palsson, Master. Gosta Leonard",male,2,3,1,21.075,,S
9,1,3,"Johnson, Mrs. Oscar W",female,27,0,2,11.1333,,S
10,1,2,"Nasser, Mrs. Nicholas",female,14,1,0,30.0708,,C
11,1,3,"Sandstrom, Miss. Marguerite Rut",female,4,1,1,16.7,G6,S
12,1,1,"Bonnell, Miss. Elizabeth",female,58,0,0,26.55,C103,S
13,0,3,"Saundercock, Mr. William Henry",male,20,0,0,8.05,,S
14,0,3,"Andersson, Mr. Anders Johan",male,39,1,5,31.275,,S
15,0,3,"Vestrom, Miss. Hulda Amanda Adolfina",female,14,0,0,7.8542,,S
16,1,2,"Hewlett, Mrs. Mary D",female,55,0,0,16.0,,S
17,0,3,"Rice, Master. Eugene",male,2,4,1,29.125,,Q
18,1,2,"Williams, Mr. Charles Eugene",male,,0,0,13.0,,S
19,0,3,"Vander Planke, Mrs. Julius",female,31,1,0,18.0,,S
20,1,3,"Masselmani, Mrs. Fatima",female,,0,0,7.225,,C
21,0,2,"Fynney, Mr. Joseph J",male,35,0,0,26.0,,S
22,1,2,"Beesley, Mr. Lawrence",male,34,0,0,13.0,D56,S
23,1,3,"McGowan, Miss. Anna",female,15,0,0,8.0292,,Q
24,1,1,"Sloper, Mr. William Thompson",male,28,0,0,35.5,A6,S
25,0,3,"Palsson, Miss. Torborg Danira",female,8,3,1,21.075,,S`
  },
  {
    id: 'housing',
    name: 'Real Estate Housing Appraisals',
    description: 'Residential property metrics with square footage, year built, prices, and garage status.',
    csv: `HouseId,Neighborhood,Bedrooms,Bathrooms,SquareFeet,YearBuilt,SalePrice,HasGarage,Condition
101,Northridge,3,2,1850,2005,345000,true,Excellent
102,Downtown,2,1,1120,1985,260000,false,Good
103,Suburbs,4,3,2600,2012,485000,true,Fair
104,WestEnd,3,2,1750,1995,310000,true,Good
105,Northridge,5,4,3400,2018,650000,true,Excellent
106,Downtown,1,1,780,1970,185000,false,Fair
107,Suburbs,3,2,1920,,335000,true,Good
108,WestEnd,4,2.5,2300,2008,410000,true,Good
109,Northridge,4,3,2850,2015,520000,,Excellent
110,Downtown,2,1.5,1300,1990,290000,false,Excellent
111,Suburbs,3,2,1650,2000,295000,true,Good
112,WestEnd,2,1,1200,1980,240000,false,Fair
113,Northridge,5,3.5,3100,2017,590000,true,Excellent
114,Suburbs,4,2.5,2450,2009,430000,true,Good
115,Downtown,3,2,1600,2003,350000,true,Good`
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Transactions & Cohorts',
    description: 'Customer order revenue, order dates, discount coupons (with nulls), and fulfillment status.',
    csv: `OrderID,OrderDate,CustomerTier,OrderAmount,DiscountCode,PaymentMethod,Status,Rating
ORD-8001,2026-08-01,VIP,185.50,SUMMER20,CreditCard,Delivered,5
ORD-8002,2026-08-01,Standard,45.00,,PayPal,Delivered,4
ORD-8003,2026-08-02,Standard,68.25,WELCOME10,CreditCard,Delivered,5
ORD-8004,2026-08-02,Premium,320.00,VIP30,ApplePay,Delivered,5
ORD-8005,2026-08-03,Standard,24.50,,CreditCard,Returned,2
ORD-8006,2026-08-03,VIP,140.00,SUMMER20,PayPal,Delivered,4
ORD-8007,2026-08-04,Standard,92.00,,CreditCard,InTransit,
ORD-8008,2026-08-04,Standard,55.00,WELCOME10,GooglePay,Delivered,3
ORD-8009,2026-08-05,Premium,210.00,,ApplePay,Delivered,5
ORD-8010,2026-08-05,Standard,33.75,,CreditCard,Cancelled,1
ORD-8011,2026-08-06,VIP,415.00,VIP30,CreditCard,Delivered,5
ORD-8012,2026-08-06,Standard,74.50,,PayPal,InTransit,
ORD-8013,2026-08-07,Premium,180.00,SUMMER20,ApplePay,Delivered,4
ORD-8014,2026-08-07,Standard,58.00,,CreditCard,Delivered,4
ORD-8015,2026-08-08,VIP,290.00,VIP30,CreditCard,Delivered,5`
  },
  {
    id: 'iris',
    name: 'Fisher Iris Morphometry',
    description: 'Multivariate biological dataset containing sepal and petal dimensions across 3 plant species.',
    csv: `SepalLength,SepalWidth,PetalLength,PetalWidth,Species
5.1,3.5,1.4,0.2,setosa
4.9,3.0,1.4,0.2,setosa
4.7,3.2,1.3,0.2,setosa
4.6,3.1,1.5,0.2,setosa
5.0,3.6,1.4,0.2,setosa
7.0,3.2,4.7,1.4,versicolor
6.4,3.2,4.5,1.5,versicolor
6.9,3.1,4.9,1.5,versicolor
5.5,2.3,4.0,1.3,versicolor
6.5,2.8,4.6,1.5,versicolor
6.3,3.3,6.0,2.5,virginica
5.8,2.7,5.1,1.9,virginica
7.1,3.0,5.9,2.1,virginica
6.3,2.9,5.6,1.8,virginica
6.5,3.0,5.8,2.2,virginica`
  }
];

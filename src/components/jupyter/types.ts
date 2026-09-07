export type CellType = 'code' | 'markdown';

export interface CellOutput {
  type: 'text' | 'table' | 'plot' | 'error';
  text?: string;
  data?: {
    columns: string[];
    rows: (string | number)[][];
    totalRows?: number;
  };
  plotType?: 'scatter' | 'line' | 'bar';
  plotData?: any;
  executionTimeMs?: number;
}

export interface NotebookCell {
  id: string;
  cellType: CellType;
  source: string;
  executionCount: number | null;
  outputs: CellOutput[];
  isExecuting?: boolean;
  isEditingMarkdown?: boolean;
}

export interface JupyterNotebook {
  id: string;
  title: string;
  filename: string;
  kernelName: string;
  description: string;
  tags: string[];
  cells: NotebookCell[];
  lastModified: string;
}

export interface KernelVariable {
  name: string;
  type: string;
  shape?: string;
  preview: string;
}

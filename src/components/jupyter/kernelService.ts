import { NotebookCell, CellOutput, KernelVariable, JupyterNotebook } from './types';

interface KernelMemory {
  variables: Map<string, KernelVariable>;
  executionCounter: number;
}

export class JupyterKernel {
  private memory: KernelMemory = {
    variables: new Map(),
    executionCounter: 1
  };

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.memory = {
      variables: new Map([
        ['np', { name: 'np', type: 'module', preview: '<module numpy 1.26.4>' }],
        ['pd', { name: 'pd', type: 'module', preview: '<module pandas 2.2.1>' }],
        ['plt', { name: 'plt', type: 'module', preview: '<module matplotlib.pyplot>' }]
      ]),
      executionCounter: 1
    };
  }

  public getVariables(): KernelVariable[] {
    return Array.from(this.memory.variables.values());
  }

  public getExecutionCounter(): number {
    return this.memory.executionCounter;
  }

  public async executeCell(cell: NotebookCell): Promise<{ executionCount: number; outputs: CellOutput[] }> {
    const execCount = this.memory.executionCounter++;
    const code = cell.source.trim();
    const outputs: CellOutput[] = [];

    const startTime = performance.now();

    // 1. Check for standard library / syntax patterns
    if (!code) {
      return { executionCount: execCount, outputs: [] };
    }

    // Inspect variable assignments to register in memory
    const lines = code.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      // Detect simple assignments: var = value
      const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
      if (match && !trimmed.startsWith('def ') && !trimmed.startsWith('class ')) {
        const varName = match[1];
        const valExpr = match[2];

        let type = 'object';
        let shape: string | undefined = undefined;
        let preview = valExpr.slice(0, 40);

        if (valExpr.includes('pd.DataFrame')) {
          type = 'DataFrame';
          shape = '(8, 6)';
          preview = 'DataFrame with tabular records';
        } else if (valExpr.includes('np.array') || valExpr.includes('np.zeros') || valExpr.includes('np.random')) {
          type = 'ndarray';
          shape = valExpr.includes('zeros(2)') ? '(2,)' : '(12, 2)';
          preview = 'float64 array';
        } else if (!isNaN(Number(valExpr))) {
          type = Number.isInteger(Number(valExpr)) ? 'int' : 'float';
          preview = valExpr;
        } else if (valExpr.startsWith('[') && valExpr.endsWith(']')) {
          type = 'list';
          preview = `list of items`;
        }

        this.memory.variables.set(varName, {
          name: varName,
          type,
          shape,
          preview
        });
      }
    });

    // 2. Synthesize Execution Outputs based on cell contents
    let stdoutText = '';

    // Check for DataFrame head / describe
    if (code.includes('df.head') || (code.includes('df') && !code.includes('=') && lines[lines.length - 1].trim() === 'df')) {
      if (code.includes('print(')) {
        stdoutText += 'Loaded DataFrame with shape 8 rows × 6 columns\n';
      }
      outputs.push({
        type: 'table',
        data: {
          columns: ['PassengerId', 'Survived', 'Pclass', 'Age', 'Fare', 'Embarked'],
          rows: [
            [1, 0, 3, '22.0', '$7.25', 'S'],
            [2, 1, 1, '38.0', '$71.28', 'C'],
            [3, 1, 3, '26.0', '$7.92', 'S'],
            [4, 0, 1, '35.0', '$53.10', 'S'],
            [5, 0, 3, 'NaN', '$8.05', 'Q']
          ],
          totalRows: 8
        }
      });
    } else if (code.includes('df.describe') || code.includes("['Age', 'Fare'].describe")) {
      stdoutText += "Empirical Median Age: 27.0 years\nMissing values remaining in 'Age': 0\n";
      outputs.push({
        type: 'table',
        data: {
          columns: ['Metric', 'Age', 'Fare'],
          rows: [
            ['count', '8.00', '8.00'],
            ['mean', '28.88', '42.68'],
            ['std', '14.28', '37.89'],
            ['min', '2.00', '7.25'],
            ['50% (median)', '27.00', '36.47'],
            ['max', '54.00', '110.88']
          ]
        }
      });
    } else if (code.includes('groupby') && code.includes('plt.bar')) {
      stdoutText += `        Total Passengers  Survival Rate\nPclass                                 \n1                      3       0.666667\n2                      1       1.000000\n3                      4       0.250000\n`;
      outputs.push({
        type: 'plot',
        plotType: 'bar',
        plotData: [
          { label: 'Class 1 (First)', value: 66.7, color: '#1A42D9' },
          { label: 'Class 2 (Second)', value: 100.0, color: '#059669' },
          { label: 'Class 3 (Third)', value: 25.0, color: '#D97706' }
        ]
      });
    } else if (code.includes('loss_history') || code.includes('plt.plot') || code.includes('epochs')) {
      if (code.includes('logistic') || code.includes('sigmoid') || code.includes('bce')) {
        stdoutText += `Optimal Weights w1, w2: [0.8124 0.7491]\nOptimal Bias b:         -6.3214\nFinal Convergence Loss: 0.1342\nInitial vs Final Loss:  0.6931 → 0.1342\n`;
        outputs.push({
          type: 'plot',
          plotType: 'line',
          plotData: [
            { epoch: 0, loss: 0.693 },
            { epoch: 30, loss: 0.485 },
            { epoch: 60, loss: 0.362 },
            { epoch: 100, loss: 0.274 },
            { epoch: 150, loss: 0.211 },
            { epoch: 200, loss: 0.173 },
            { epoch: 250, loss: 0.149 },
            { epoch: 300, loss: 0.134 }
          ]
        });
      } else if (code.includes('W1') || code.includes('relu') || code.includes('backward')) {
        stdoutText += `Epoch 0 Loss:   0.8492\nEpoch 500 Loss: 0.0028\nXOR Predictions:\n[[0.038]\n [0.971]\n [0.965]\n [0.042]]\n[XOR Non-Linearity Solved: Accuracy 100%]\n`;
        outputs.push({
          type: 'plot',
          plotType: 'line',
          plotData: [
            { epoch: 0, loss: 0.849 },
            { epoch: 50, loss: 0.421 },
            { epoch: 100, loss: 0.252 },
            { epoch: 200, loss: 0.114 },
            { epoch: 300, loss: 0.042 },
            { epoch: 400, loss: 0.012 },
            { epoch: 500, loss: 0.003 }
          ]
        });
      }
    } else if (code.includes('centroids') && code.includes('distances')) {
      stdoutText += `Initial Inertia (WCSS):  342.18\nConverged Inertia:       189.44\nFinal Centroids μ:\n[[10.12 10.04]\n [30.22 34.89]\n [20.08 65.15]]\n[Equilibrium reached: Zero cluster re-assignments]\n`;
      outputs.push({
        type: 'plot',
        plotType: 'scatter',
        plotData: [
          { cluster: 'Cluster 1', x: 10.12, y: 10.04, count: 15, color: '#1A42D9' },
          { cluster: 'Cluster 2', x: 30.22, y: 34.89, count: 15, color: '#D97706' },
          { cluster: 'Cluster 3', x: 20.08, y: 65.15, count: 15, color: '#059669' }
        ]
      });
    } else {
      // General python print statement handler
      const printRegex = /print\((?:f?["'](.*?)["']|(.*?))\)/g;
      let match;
      const foundPrints: string[] = [];

      while ((match = printRegex.exec(code)) !== null) {
        let content = match[1] || match[2] || '';
        // Evaluate simple arithmetic or expressions inside prints
        content = content.replace(/\{([^}]+)\}/g, (_m, expr) => {
          try {
            if (expr.includes('.shape')) return '(12, 2)';
            if (expr.includes('len(')) return '12';
            if (expr.includes('sum()')) return '0';
            return expr;
          } catch {
            return expr;
          }
        });
        foundPrints.push(content);
      }

      if (foundPrints.length > 0) {
        stdoutText = foundPrints.join('\n');
      } else {
        // Evaluate trailing expression if any
        const lastLine = lines[lines.length - 1].trim();
        if (lastLine && !lastLine.startsWith('#') && !lastLine.includes('=')) {
          stdoutText = `Out [${execCount}]: ${lastLine}`;
        } else {
          stdoutText = `[Cell executed successfully]`;
        }
      }
    }

    const elapsed = Math.round(performance.now() - startTime + Math.random() * 20 + 10);

    if (stdoutText.trim()) {
      outputs.unshift({
        type: 'text',
        text: stdoutText.trim(),
        executionTimeMs: elapsed
      });
    }

    return {
      executionCount: execCount,
      outputs
    };
  }
}

/**
 * Serializes the notebook into the official Jupyter Notebook JSON format (.ipynb v4.5)
 */
export function exportToIpynbFormat(notebook: JupyterNotebook): string {
  const ipynbObj = {
    cells: notebook.cells.map(cell => ({
      cell_type: cell.cellType,
      metadata: {},
      source: cell.source.split('\n').map((l, i, arr) => i < arr.length - 1 ? l + '\n' : l),
      execution_count: cell.cellType === 'code' ? cell.executionCount : null,
      outputs: cell.outputs.map(out => {
        if (out.type === 'table' && out.data) {
          return {
            output_type: 'execute_result',
            execution_count: cell.executionCount,
            data: {
              'text/plain': out.data.columns.join(' | ') + '\n' + out.data.rows.map(r => r.join(' | ')).join('\n'),
              'text/html': `<table border="1" class="dataframe"><thead><tr style="text-align: right;">${out.data.columns.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${out.data.rows.map(r => `<tr>${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table>`
            },
            metadata: {}
          };
        } else {
          return {
            output_type: 'stream',
            name: 'stdout',
            text: (out.text || '').split('\n').map((l, i, arr) => i < arr.length - 1 ? l + '\n' : l)
          };
        }
      })
    })),
    metadata: {
      kernelspec: {
        display_name: notebook.kernelName,
        language: 'python',
        name: 'python3'
      },
      language_info: {
        name: 'python',
        version: '3.11.8',
        mimetype: 'text/x-python',
        codemirror_mode: {
          name: 'ipython',
          version: 3
        },
        file_extension: '.py'
      }
    },
    nbformat: 4,
    nbformat_minor: 5
  };

  return JSON.stringify(ipynbObj, null, 2);
}

/**
 * Exports all code cells as a standalone runnable Python script (.py)
 */
export function exportToPythonScript(notebook: JupyterNotebook): string {
  const header = `#!/usr/bin/env python\n# coding: utf-8\n# Auto-generated by NeuraForge JupyterLab: ${notebook.title}\n\n`;
  const body = notebook.cells
    .map(cell => {
      if (cell.cellType === 'markdown') {
        return `# In[Markdown]:\n` + cell.source.split('\n').map(l => `# ${l}`).join('\n') + '\n';
      } else {
        return `# In[${cell.executionCount || ' '}]:\n${cell.source}\n`;
      }
    })
    .join('\n\n');

  return header + body;
}

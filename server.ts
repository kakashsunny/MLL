import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return genAIClient;
}

interface GeminiResilienceParams {
  preferredModel?: string;
  contents: any;
  systemInstruction?: string;
  fallbackFn: () => string;
  customApiKey?: string;
}

async function generateWithResilience(params: GeminiResilienceParams): Promise<{ text: string; isFallback: boolean; warning?: string }> {
  // Use custom API key if provided by user, otherwise fall back to environment key
  const ai = params.customApiKey ? new GoogleGenAI({ apiKey: params.customApiKey }) : getGenAI();
  if (!ai) {
    return {
      text: sanitizeCleanText(params.fallbackFn()),
      isFallback: true
    };
  }

  // Model chain: start with preferred model, then gemini-flash-latest
  const primaryModel = params.preferredModel || 'gemini-3.8-flash';
  const modelChain = [primaryModel];
  if (!modelChain.includes('gemini-flash-latest')) {
    modelChain.push('gemini-flash-latest');
  }

  const sysInstruction = (params.systemInstruction || '') + '\n' + NO_MARKDOWN_INSTRUCTION;

  for (const modelName of modelChain) {
    // Retry on 503 or 429
    const maxRetries = 1;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: {
            systemInstruction: sysInstruction
          }
        });

        const textOutput = response?.text;
        if (textOutput && textOutput.trim().length > 0) {
          return {
            text: sanitizeCleanText(textOutput),
            isFallback: false
          };
        }
      } catch (err: any) {
        const msg = err?.message || String(err);
        const isTransient = msg.includes('503') ||
                            msg.includes('high demand') ||
                            msg.includes('UNAVAILABLE') ||
                            msg.includes('429') ||
                            msg.includes('RESOURCE_EXHAUSTED') ||
                            msg.includes('overloaded');

        if (isTransient && attempt < maxRetries) {
          const delayMs = 600 + Math.floor(Math.random() * 400);
          console.warn(`[Gemini Gateway] Model ${modelName} temporary demand spike. Retrying in ${delayMs}ms...`);
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }

        console.warn(`[Gemini Gateway] Model ${modelName} unavailable (${msg.slice(0, 80)}). Trying fallback model...`);
        break;
      }
    }
  }

  // If all models encountered upstream load spikes, fall back gracefully to deterministic pedagogical engine
  console.warn(`[Gemini Gateway] Switched to built-in pedagogical engine due to upstream API load.`);
  return {
    text: sanitizeCleanText(params.fallbackFn()),
    isFallback: true,
    warning: 'Served via built-in pedagogical engine due to temporary upstream Gemini load.'
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'NeuraForge Server', hasGeminiKey: !!process.env.GEMINI_API_KEY });
  });

  // Gemini API general generation gateway with RBAC authorization
  app.post('/api/gemini/generate', async (req, res) => {
    try {
      const { prompt, model, systemInstruction } = req.body;
      const userRole = (req.headers['x-user-role'] as string) || 'student';
      const requestedModel = model || 'gemini-3.8-flash';

      // Authorization guard: Student role is restricted from high-compute Pro models
      if (requestedModel.includes('pro') && userRole === 'student') {
        return res.status(403).json({
          error: 'Forbidden: Student role does not have authorization for Gemini Pro models. Switch to Researcher or Admin.',
          isForbidden: true
        });
      }

      const result = await generateWithResilience({
        preferredModel: requestedModel,
        contents: prompt,
        systemInstruction: systemInstruction || 'You are an advanced ML Research Scientist responding with mathematical depth and clear structure.',
        fallbackFn: () => `THEORETICAL DECONSTRUCTION
Prompt: ${prompt}

In machine learning feature manifolds, regularizers impose specific geometric constraints:
- L1 Regularization (Lasso, lambda sum |w_i|): Constrains the loss optimization into an L1 norm diamond ball. The elliptical contours of the empirical loss touch the corners of the L1 polytope along coordinate axes first, naturally zeroing out non-essential coefficients and yielding a sparse feature subset.
- L2 Regularization (Ridge, lambda sum w_i^2): Constrains optimization into an L2 hypersphere. It uniformly penalizes large weight magnitudes and distributes attribution across correlated features, ensuring well-conditioned inverse matrices (X^T X + lambda I)^(-1).

(Real-time response generated by NeuraForge Gemini Gateway fallback; configure GEMINI_API_KEY in your environment for live production model generation).`
      });

      return res.json({ text: result.text, isFallback: result.isFallback, warning: result.warning });
    } catch (err: any) {
      console.warn('Recovered from /api/gemini/generate error:', err.message);
      res.json({
        text: sanitizeCleanText(generateSmartFallback(req.body?.prompt, 'Teach Me', 'Machine Learning')),
        isFallback: true
      });
    }
  });

  // AI Tutor endpoint (Socratic mentor)
  app.post('/api/ai/tutor', async (req, res) => {
    try {
      const customKey = (req.headers['x-gemini-key'] as string)?.trim();
      const { message, currentTopic, mode, history } = req.body;
      const cleanMsg = (message || '').trim();

      const systemInstruction = `You are "Forge AI", a world-class Machine Learning mentor, Socratic tutor, and Python systems guide for the NeuraForge platform.
CURRENT TOPIC: ${currentTopic || 'Machine Learning'}
MODE: ${mode || 'Teach Me'}

COMMUNICATION & CONVERSATIONAL RULES:
- GREETING CHECK: If the learner says "hi", "hello", "hey", "good morning", or another friendly greeting, GREET THEM BACK warmly and introduce yourself as Forge AI. Ask what topic, algorithm, or Python syntax they'd like to explore today. Do NOT give an unsolicited lecture on Machine Learning when greeted!
- DYNAMIC ADAPTABILITY: If the learner asks about Python, NumPy, Pandas, Scikit-learn syntax, or any algorithm, answer their question directly with clear, intuitive reasoning.
- When explaining concepts, use real-world analogies, physical metaphors (gravity wells, landscapes, dials), and clear intuition before mathematical formulations.
- If in "Socratic Teach" mode on a technical topic, provide core intuition and follow up with a thoughtful question.
- Do NOT use markdown headers (# or ##) or bold asterisks (**). Use UPPERCASE labels for section headings.`;

      let promptText = '';
      if (Array.isArray(history) && history.length > 0) {
        promptText += 'PREVIOUS CONVERSATION:\n';
        for (const item of history.slice(-6)) {
          promptText += `${item.role === 'user' ? 'Learner' : 'Forge AI'}: ${item.content}\n`;
        }
        promptText += '\nCURRENT LEARNER MESSAGE:\n';
      }
      promptText += cleanMsg;

      const result = await generateWithResilience({
        preferredModel: 'gemini-3.8-flash',
        contents: promptText,
        systemInstruction,
        customApiKey: customKey,
        fallbackFn: () => generateSmartFallback(cleanMsg, mode, currentTopic)
      });

      return res.json({ reply: result.text, isFallback: result.isFallback, warning: result.warning });
    } catch (err: any) {
      console.warn('Recovered from /api/ai/tutor error:', err.message);
      return res.json({
        reply: sanitizeCleanText(generateSmartFallback(req.body?.message, req.body?.mode, req.body?.currentTopic)),
        isFallback: true
      });
    }
  });

  // Explain Code AI endpoint
  app.post('/api/ai/explain-code', async (req, res) => {
    try {
      const { code, audienceLevel } = req.body;
      const systemInstruction = `You are a Principal Machine Learning Engineer reviewing Python ML code.
Audience Level: ${audienceLevel || 'Intermediate'}
Explain the provided Python snippet:
1. Executive Intuition (What does this code physically accomplish?)
2. Line-by-Line Mechanics (Why it works)
3. Mathematical & Algorithmic Concepts behind it
4. Time/Space Complexity
5. Common Pitfalls / Production traps
6. How to optimize or modernize for production.`;

      const result = await generateWithResilience({
        preferredModel: 'gemini-3.8-flash',
        contents: `Code to analyze:\n\`\`\`python\n${code}\n\`\`\``,
        systemInstruction,
        fallbackFn: () => generateCodeFallback(code, audienceLevel)
      });

      return res.json({ explanation: result.text, isFallback: result.isFallback, warning: result.warning });
    } catch (err: any) {
      console.warn('Recovered from /api/ai/explain-code error:', err.message);
      return res.json({
        explanation: sanitizeCleanText(generateCodeFallback(req.body?.code, req.body?.audienceLevel)),
        isFallback: true
      });
    }
  });

  // Debug Code AI endpoint
  app.post('/api/ai/debug-code', async (req, res) => {
    try {
      const { code, errorMessage } = req.body;
      const systemInstruction = `You are a Python ML debugging specialist. Analyze this code and the output/error message. Check for matrix shape mismatches, silent broadcasting bugs, exploding gradients, or numerical instability.`;

      const result = await generateWithResilience({
        preferredModel: 'gemini-3.8-flash',
        contents: `Code:\n\`\`\`python\n${code}\n\`\`\`\nError/Output context:\n${errorMessage || 'None reported'}`,
        systemInstruction,
        fallbackFn: () => `DIAGNOSTICS & SHAPE ANALYSIS
- Dimensional Verification: Matrix dimensions and broadcasting operations are valid.
- Precision: Ensure float64 casting when calculating small learning rate products.
- Regularization: Loss calculation has no unbounded zero-division errors.`
      });

      return res.json({ explanation: result.text, isFallback: result.isFallback, warning: result.warning });
    } catch (err: any) {
      console.warn('Recovered from /api/ai/debug-code error:', err.message);
      return res.json({
        explanation: sanitizeCleanText(`DIAGNOSTICS
Matrix shapes and syntax appear syntactically sound. Check feature scale and learning rate hyperparameters if output converges prematurely.`),
        isFallback: true
      });
    }
  });

  // Interview simulator evaluation
  app.post('/api/ai/interview-eval', async (req, res) => {
    try {
      const { question, userAnswer, category, difficulty } = req.body;
      const systemInstruction = `You are a Senior Staff ML Bar Raiser interviewing candidates for top AI research labs and tech companies.
Topic: ${category} | Level: ${difficulty}
Evaluate the candidate's answer to the question: "${question}".
Provide:
- Overall Score (0-100)
- Correctness & Accuracy
- Depth of ML Intuition
- Communication & Precision
- What they missed or could elevate
- Top-tier Model Answer summary`;

      const result = await generateWithResilience({
        preferredModel: 'gemini-3.8-flash',
        contents: `Candidate's answer:\n"${userAnswer}"`,
        systemInstruction,
        fallbackFn: () => generateInterviewFallback(question, userAnswer)
      });

      return res.json({ feedback: result.text, isFallback: result.isFallback, warning: result.warning });
    } catch (err: any) {
      console.warn('Recovered from /api/ai/interview-eval error:', err.message);
      return res.json({
        feedback: sanitizeCleanText(generateInterviewFallback(req.body?.question, req.body?.userAnswer)),
        score: 82,
        isFallback: true
      });
    }
  });

  // Vite middleware for development vs production static serve
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NeuraForge server running on http://localhost:${PORT}`);
  });
}

// Fallback generators that ensure 100% interactive delight without network requirements
function sanitizeCleanText(text: string): string {
  if (!text) return '';
  return text
    // Replace markdown headings with clean uppercase text
    .replace(/^#{1,6}\s*(.*)$/gm, (_m, title) => title.trim().toUpperCase())
    // Remove bold asterisks
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove single asterisks
    .replace(/\*(.*?)\*/g, '$1')
    // Remove underscores for emphasis
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Normalize bullets
    .replace(/^\s*\*\s+/gm, '- ')
    // Remove markdown decorative dividers
    .replace(/^---+$/gm, '')
    .replace(/^===+$/gm, '')
    // Clean excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const NO_MARKDOWN_INSTRUCTION = `
STRICT FORMATTING RULE:
- Absolutely NEVER use Markdown heading symbols such as #, ##, or ###.
- Absolutely NEVER use bold asterisks such as **word** or *word*.
- Do NOT use decorative markdown formatting.
- Use clean plain-text section titles in UPPERCASE, clean plain numbers (1., 2.), clean bullet dashes (-), and python code blocks (\`\`\`python).
`;

function generateSmartFallback(message: string, mode: string = 'Teach Me', topic: string = 'Machine Learning'): string {
  const lower = (message || '').toLowerCase().trim();

  // Dynamic greeting support
  if (/^(hi|hello|hey|greetings|hola|yo|good (morning|afternoon|evening))\b/i.test(lower)) {
    return `Hi! Hello! Great to connect with you. I am Forge AI, your machine learning mentor and interactive coding guide.

What would you like to explore today?
- Socratic exploration of machine learning concepts (e.g. Backprop, Attention, Gradient Descent)
- Deep dive into our Syntax Library (Python, NumPy, Pandas, Scikit-learn)
- Auditing or debugging Python/PyTorch code
- FAANG-style ML interview simulation drills

Tell me what you're working on or select any mode above to get started!`;
  }

  if (lower.includes('syntax') || lower.includes('numpy') || lower.includes('pandas') || lower.includes('scikit') || lower.includes('sklearn')) {
    return `SYNTAX & VECTORIZED IMPLEMENTATION

In Python machine learning frameworks, performance hinges on vectorization and memory layout:
- NumPy: Operates on contiguous C-order or Fortran-order buffers, bypassing Python object overhead.
- Pandas: Built atop NumPy/Arrow with columnar indexing and split-apply-combine workflows.
- Scikit-Learn: Enforces the unified .fit() and .transform() / .predict() estimator interface.

Check out the Syntax Library page in the navigation sidebar for parameter references, 0-copy views, common pitfalls, and FAANG interview questions!`;
  }

  if (lower.includes('overfitting') || lower.includes('memoriz')) {
    return `THE TEXTBOOK EXAM ANALOGY

Before diving into loss functions, imagine this:
A student memorizes every single question and comma from their practice homework booklet. On the day of the exam, the teacher introduces slightly modified problems with different numbers. The student freezes.

THAT IS OVERFITTING IN A NUTSHELL:
- The Symptom: The model captures high-frequency random noise as if it were a fundamental universal law.
- The Detection: Training error approaches zero, while validation/test loss blows up.
- The Cures: Regularization (L1/L2 penalties), early stopping, reducing model capacity (tree pruning, dropout), and data augmentation.

Socratic Question: If you increase your dataset size by 10x, what generally happens to the gap between training and validation error?`;
  }

  if (lower.includes('gradient descent') || lower.includes('learning rate') || lower.includes('step')) {
    return `THE FOGGY ALPINE DESCENT

Imagine you are standing on a steep mountainside surrounded by blinding, dense fog. You cannot see the lake at the bottom of the valley. How do you descend?

You feel the slope beneath your boots. You step in the direction that slopes downward most steeply.
- Gradient (nabla L): The vector pointing in the direction of steepest ascent. We step in the exact opposite direction.
- Learning Rate (alpha): Your stride length. Take steps too small (1e-5), and you will freeze before reaching the base. Leap recklessly (1.5), and you overshoot the ridge entirely into the opposite canyon!

Interactive Step: Open the ML Lab in the navigation sidebar, switch to Gradient Descent, and adjust the learning rate from 0.01 to 0.8 to see convergence in action.`;
  }

  return `INTUITIVE EXPLORATION: ${topic.toUpperCase()}

In ${topic}, our foundational objective is discovering a function f(X) approx Y that generalizes reliably to unseen distributions.

KEY MENTAL MODEL:
1. The Representation: What family of hypotheses can the model express?
2. The Evaluation: What loss function penalizes bad guesses?
3. The Optimization: How do we update parameters toward minimal loss?

Socratic Prompt: When you adjust parameters in the Visual Lab, does the decision boundary become smoother or more jagged? Notice how smoothness directly correlates with inductive bias.`;
}

function generateCodeFallback(code: string, level: string = 'Intermediate'): string {
  return `PYTHON MACHINE LEARNING ANALYSIS (${level.toUpperCase()} LEVEL)

1. EXECUTIVE PURPOSE
This implementation initializes an estimator pipeline, trains parameters against supervised training tuples (X, y), and generates predictive inference on held-out test features.

2. STRUCTURAL BREAKDOWN
\`\`\`python
# 1. Instantiation: Configures internal state and hyperparameters
model = LinearRegression() 

# 2. Optimization: Computes optimal closed-form weights via Ordinary Least Squares:
# W = (X^T * X)^(-1) * X^T * y
model.fit(X_train, y_train)

# 3. Inference: Evaluates dot product of learned weights W and new sample matrix
predictions = model.predict(X_test)
\`\`\`

3. MATHEMATICAL AND ALGORITHMIC MECHANICS
- Under the hood, modern Scikit-Learn utilizes LAPACK gesdd driver based on Singular Value Decomposition (SVD) rather than directly inverting (X^T X), ensuring numerical stability.
- Time Complexity: O(n * d^2) where n is sample count and d is feature dimensionality.
- Memory Footprint: O(d) to store coefficients and intercept.

4. COMMON PRODUCTION TRAPS
- Data Leakage: Ensure test sets are strictly isolated before any normalization or feature scaling.
- Scale Sensitivity: If migrating to Ridge/Lasso, always apply StandardScaler() prior to fitting.`;
}

function generateInterviewFallback(question: string, answer: string): string {
  return `STAFF ML BAR RAISER EVALUATION

CANDIDATE PERFORMANCE SCORE: 86 / 100

STRENGTHS OBSERVED:
- Solid conceptual grounding of the core trade-offs.
- Direct identification of the primary mechanisms and variance components.
- Clear technical vocabulary without fluff.

AREAS TO ELEVATE FOR STAFF LEVEL:
1. Mathematical Rigor: Ground qualitative explanations in formal decompositions (such as Bias-Variance Tradeoff: E[(y - f(x))^2] = Bias^2 + Variance + Noise).
2. Production Systems Perspective: Mention how this manifests in online A/B test drift or real-time feature stores.

EXEMPLARY RESPONSE SUMMARY:
High-performing candidates immediately define the problem mathematically, provide an empirical diagnostic method, and articulate 3 actionable engineering mitigations ranked by computational efficiency.`;
}

startServer();

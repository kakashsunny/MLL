import { GlossaryTerm } from '../types';

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'glossary_accuracy',
    term: 'Accuracy',
    category: 'Metrics',
    simpleExplanation: 'The percentage of all predictions that were right.',
    technicalDefinition: 'Ratio of correctly classified instances (True Positives + True Negatives) to total instances evaluated: (TP + TN) / (TP + TN + FP + FN).',
    mathematicalFormula: '\\text{Accuracy} = \\frac{TP + TN}{TP + TN + FP + FN}',
    visualIntuition: 'A bullseye board where any dart hitting the target counts as success, regardless of color.',
    example: 'A model correctly classifying 94 out of 100 images as cats or dogs.',
    pythonSnippet: 'from sklearn.metrics import accuracy_score\nacc = accuracy_score(y_true, y_pred)',
    commonMisconception: 'Assuming high accuracy means a model is good. On imbalanced data (99% negative class), predicting all negative yields 99% accuracy while having zero utility.',
    interviewQuestion: 'When is accuracy an actively dangerous metric to report to stakeholders?'
  },
  {
    id: 'glossary_precision',
    term: 'Precision (Positive Predictive Value)',
    category: 'Metrics',
    simpleExplanation: 'Of all the times the model cried wolf, how often was there actually a wolf?',
    technicalDefinition: 'Fraction of relevant instances among retrieved instances: TP / (TP + FP). Measures the trustworthiness of positive predictions.',
    mathematicalFormula: '\\text{Precision} = \\frac{TP}{TP + FP}',
    visualIntuition: 'A net with fine mesh: everything caught in it is truly what you were fishing for, even if some fish swam past.',
    example: 'Spam filters: when an email lands in Spam, you want near 100% precision so important boss emails do not get lost.',
    pythonSnippet: 'from sklearn.metrics import precision_score\nprec = precision_score(y_true, y_pred)',
    commonMisconception: 'Confusing precision with recall. Precision cares only about the quality of the positive calls, not how many actual positives were missed.',
    interviewQuestion: 'What is the operational tradeoff between Precision and Recall when tuning classification decision thresholds?'
  },
  {
    id: 'glossary_recall',
    term: 'Recall (Sensitivity / True Positive Rate)',
    category: 'Metrics',
    simpleExplanation: 'Of all the actual wolves out in the woods, how many did the model find?',
    technicalDefinition: 'Fraction of total relevant instances successfully retrieved: TP / (TP + FN). Measures the model\'s ability to detect positive events.',
    mathematicalFormula: '\\text{Recall} = \\frac{TP}{TP + FN}',
    visualIntuition: 'A giant dragnet sweeping across the entire lake floor ensuring no fish escape, even if it catches seaweed and drift logs too.',
    example: 'Cancer screening: catching every patient with early tumors even if some healthy patients receive harmless follow-up checks.',
    pythonSnippet: 'from sklearn.metrics import recall_score\nrec = recall_score(y_true, y_pred)',
    commonMisconception: 'Believing you can maximize recall without hurting precision. Lowering threshold to 0.001 gives 100% recall, but tanks precision.',
    interviewQuestion: 'In what industries or domains is Recall significantly more critical than Precision?'
  },
  {
    id: 'glossary_f1',
    term: 'F1-Score',
    category: 'Metrics',
    simpleExplanation: 'The harmonic mean between precision and recall, balancing both into a single scorecard.',
    technicalDefinition: 'Harmonic mean of precision and recall: 2 * (P * R) / (P + R). Gives equal weight to precision and recall while heavily penalizing extreme disparities.',
    mathematicalFormula: 'F_1 = 2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}',
    visualIntuition: 'The point where two ropes pull with equal tension without one snapping.',
    example: 'Search engine relevance: ranking retrieved documents balancing relevance against completeness.',
    pythonSnippet: 'from sklearn.metrics import f1_score\nf1 = f1_score(y_true, y_pred)',
    commonMisconception: 'Using the arithmetic mean (P + R) / 2 instead of harmonic mean. Harmonic mean punishes a model with 100% recall and 0% precision by pulling F1 down to 0.',
    interviewQuestion: 'Why do we use the Harmonic Mean rather than the Arithmetic Mean to calculate F1?'
  },
  {
    id: 'glossary_gradient_descent',
    term: 'Gradient Descent',
    category: 'Optimization',
    simpleExplanation: 'Taking repeated small steps downhill along the steepest slope to reach the bottom of the valley.',
    technicalDefinition: 'First-order iterative optimization algorithm that updates parameter vector θ in the opposite direction of the gradient of the objective function ∇J(θ) scaled by learning rate η.',
    mathematicalFormula: '\\theta_{t+1} = \\theta_t - \\eta \\nabla_\\theta J(\\theta_t)',
    visualIntuition: 'A marble rolling down a bowl, picking up speed toward the lowest center point.',
    example: 'Adjusting weights in a 10-layer neural network after backpropagating error signals.',
    pythonSnippet: 'w = w - learning_rate * dL_dw',
    commonMisconception: 'Assuming gradient descent always finds the global minimum. On non-convex loss surfaces, it can get stuck in saddle points or poor local minima without momentum/stochasticity.',
    interviewQuestion: 'Explain why feature scaling (e.g. StandardScaler) is essential for efficient convergence in Gradient Descent.'
  },
  {
    id: 'glossary_backpropagation',
    term: 'Backpropagation',
    category: 'Deep Learning',
    simpleExplanation: 'Passing the blame backward from the output layer to the input layer so every dial knows how to adjust.',
    technicalDefinition: 'Efficient computation of the gradient of the loss function with respect to all weights in a neural network using reverse-mode automatic differentiation and the calculus chain rule.',
    mathematicalFormula: '\\frac{\\partial L}{\\partial w_{ij}^{(l)}} = \\delta_j^{(l)} a_i^{(l-1)}, \\quad \\delta_j^{(l)} = \\left( \\sum_k \\delta_k^{(l+1)} w_{jk}^{(l+1)} \\right) \\sigma\'(z_j^{(l)})',
    visualIntuition: 'A chain of dominoes falling backward: error flowing along connection pathways.',
    example: 'Computing gradients in PyTorch with loss.backward().',
    pythonSnippet: '# In PyTorch: \noptimizer.zero_grad()\nloss.backward()\noptimizer.step()',
    commonMisconception: 'Believing backprop is an optimization algorithm. Backpropagation ONLY computes gradients; an optimizer (like SGD or Adam) uses those gradients to update weights.',
    interviewQuestion: 'What is the computational complexity of the backward pass compared to the forward pass?'
  },
  {
    id: 'glossary_entropy',
    term: 'Entropy & Information Gain',
    category: 'Algorithms',
    simpleExplanation: 'Entropy is how messy or surprised you are. Information gain is how much cleaner things get after asking a question.',
    technicalDefinition: 'Shannon entropy H(S) quantifies the average uncertainty or information content in a probability distribution. Information gain is the reduction in entropy achieved by partitioning a dataset on an attribute.',
    mathematicalFormula: 'H(S) = -\\sum_{c=1}^C p_c \\log_2(p_c)',
    visualIntuition: 'A jar of 50 red marbles and 50 blue marbles (high entropy) vs a jar of 100 red marbles (zero entropy).',
    example: 'A Decision Tree deciding whether to split on "Age > 30" or "Salary > $60k".',
    pythonSnippet: 'import scipy.stats\nentropy = scipy.stats.entropy([0.5, 0.5], base=2) # 1.0 bit',
    commonMisconception: 'Confusing Entropy with Gini Impurity. Both measure node impurity, but Entropy uses logarithms (making it slightly slower to compute in raw CPU cycles).',
    interviewQuestion: 'Why do decision tree algorithms naturally favor features with high cardinality when using Information Gain, and how does Gain Ratio fix this?'
  },
  {
    id: 'glossary_attention',
    term: 'Self-Attention',
    category: 'Modern AI',
    simpleExplanation: 'Every word in a sentence looks at every other word to decide who it needs to listen to.',
    technicalDefinition: 'A mechanism that computes a dynamic weighted representation of an input sequence by comparing Queries (Q) against Keys (K) to produce attention weights applied to Values (V).',
    mathematicalFormula: '\\text{Attention}(Q, K, V) = \\text{softmax}\\left( \\frac{QK^T}{\\sqrt{d_k}} \\right) V',
    visualIntuition: 'A spiderweb of spotlight beams illuminating words that are semantically connected (like "bank" pointing to "river").',
    example: 'GPT-4 or BERT understanding whether "apple" refers to a fruit or a corporation based on context.',
    pythonSnippet: 'import torch.nn.functional as F\nscores = (Q @ K.transpose(-2, -1)) / (d_k ** 0.5)\nweights = F.softmax(scores, dim=-1)\noutput = weights @ V',
    commonMisconception: 'Thinking attention is an RNN. Attention processes all sequence positions in parallel simultaneously, which is why it requires Positional Encodings.',
    interviewQuestion: 'Why is the scaling factor 1/√d_k necessary inside the softmax of the scaled dot-product attention?'
  }
];

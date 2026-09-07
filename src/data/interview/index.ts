import { ALL_QUESTIONS_EASY } from './questionsEasy';
import { FULL_QUESTIONS_MEDIUM } from './questionsMedium';
import { FULL_QUESTIONS_HARD } from './questionsHard';
import { MLInterviewQuestion } from './types';

export const ALL_ML_QUESTIONS: MLInterviewQuestion[] = [
  ...ALL_QUESTIONS_EASY,
  ...FULL_QUESTIONS_MEDIUM,
  ...FULL_QUESTIONS_HARD
];

export const QUESTION_COUNTS = {
  total: ALL_ML_QUESTIONS.length,
  easy: ALL_QUESTIONS_EASY.length,
  medium: FULL_QUESTIONS_MEDIUM.length,
  hard: FULL_QUESTIONS_HARD.length
};

export const ALL_TOPICS: string[] = Array.from(
  new Set(ALL_ML_QUESTIONS.map(q => q.topic))
).sort();

export function getQuestionsByDifficulty(diff: 'Easy' | 'Medium' | 'Hard'): MLInterviewQuestion[] {
  return ALL_ML_QUESTIONS.filter(q => q.difficulty === diff);
}

export function getQuestionsByTopic(topic: string): MLInterviewQuestion[] {
  return ALL_ML_QUESTIONS.filter(q => q.topic.toLowerCase() === topic.toLowerCase());
}

export function searchQuestions(query: string): MLInterviewQuestion[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_ML_QUESTIONS;
  return ALL_ML_QUESTIONS.filter(
    item =>
      item.question.toLowerCase().includes(q) ||
      item.shortAnswer.toLowerCase().includes(q) ||
      item.topic.toLowerCase().includes(q) ||
      item.detailedExplanation.toLowerCase().includes(q)
  );
}

export * from './types';
export * from './questionsEasy';
export * from './questionsMedium';
export * from './questionsHard';

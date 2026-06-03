// src/lib/quiz.ts
import type { Question, CategorySlug } from './schema';

export function isCorrect(question: Question, selected: number[]): boolean {
  const correct = Array.isArray(question.correct) ? question.correct : [question.correct];
  if (selected.length !== correct.length) return false;
  const a = [...selected].sort((x, y) => x - y);
  const b = [...correct].sort((x, y) => x - y);
  return a.every((v, i) => v === b[i]);
}

export function filterByCategory(questions: Question[], category: CategorySlug): Question[] {
  return questions.filter((q) => q.category === category);
}

export interface SessionResult {
  total: number;
  correctCount: number;
  wrongIds: string[];
}

// answers: questionId -> 選択されたインデックス配列
export function scoreSession(questions: Question[], answers: Record<string, number[]>): SessionResult {
  let correctCount = 0;
  const wrongIds: string[] = [];
  for (const q of questions) {
    const sel = answers[q.id] ?? [];
    if (isCorrect(q, sel)) correctCount++;
    else wrongIds.push(q.id);
  }
  return { total: questions.length, correctCount, wrongIds };
}

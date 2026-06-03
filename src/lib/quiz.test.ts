import { describe, it, expect } from 'vitest';
import { isCorrect, filterByCategory, scoreSession } from './quiz';
import type { Question } from './schema';

const base: Question = {
  id: 'q1', category: 'fundamentals', subTopic: 't', difficulty: 'easy', tags: [],
  question: 'q', options: ['a', 'b', 'c'], isMultiple: false, correct: 1,
  explanation: 'e', reference: 'https://example.com', relatedMaterials: [],
};

describe('isCorrect', () => {
  it('single answer: matching index is correct', () => {
    expect(isCorrect(base, [1])).toBe(true);
  });
  it('single answer: wrong index is incorrect', () => {
    expect(isCorrect(base, [0])).toBe(false);
  });
  it('multiple answer: exact set is correct regardless of order', () => {
    const m: Question = { ...base, isMultiple: true, correct: [0, 2] };
    expect(isCorrect(m, [2, 0])).toBe(true);
  });
  it('multiple answer: partial selection is incorrect', () => {
    const m: Question = { ...base, isMultiple: true, correct: [0, 2] };
    expect(isCorrect(m, [0])).toBe(false);
  });
});

describe('filterByCategory', () => {
  it('returns only questions of the given category', () => {
    const qs: Question[] = [base, { ...base, id: 'q2', category: 'improve-output' }];
    expect(filterByCategory(qs, 'fundamentals').map((q) => q.id)).toEqual(['q1']);
  });
});

describe('scoreSession', () => {
  it('counts correct answers', () => {
    const qs: Question[] = [base, { ...base, id: 'q2', correct: 0 }];
    const answers = { q1: [1], q2: [2] }; // q1 correct, q2 wrong
    const r = scoreSession(qs, answers);
    expect(r.total).toBe(2);
    expect(r.correctCount).toBe(1);
    expect(r.wrongIds).toEqual(['q2']);
  });
});

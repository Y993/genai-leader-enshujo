import { describe, it, expect } from 'vitest';
import { ALL_QUESTIONS } from './index';

describe('question dataset integrity', () => {
  it('loads without schema errors', () => {
    expect(ALL_QUESTIONS.length).toBeGreaterThan(0);
  });
  it('has unique ids', () => {
    const ids = ALL_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('fundamentals has 12 questions', () => {
    expect(ALL_QUESTIONS.filter((q) => q.category === 'fundamentals').length).toBe(12);
  });
  it('has 40 questions in total', () => {
    expect(ALL_QUESTIONS.length).toBe(40);
  });
  it('matches target counts per category', () => {
    const count = (c: string) => ALL_QUESTIONS.filter((q) => q.category === c).length;
    expect(count('google-cloud-offerings')).toBe(14);
    expect(count('improve-output')).toBe(8);
    expect(count('business-strategy')).toBe(6);
  });
});

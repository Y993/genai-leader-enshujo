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
  it('fundamentals has 24 questions', () => {
    expect(ALL_QUESTIONS.filter((q) => q.category === 'fundamentals').length).toBe(24);
  });
  it('has 80 questions in total', () => {
    expect(ALL_QUESTIONS.length).toBe(80);
  });
  it('matches target counts per category', () => {
    const count = (c: string) => ALL_QUESTIONS.filter((q) => q.category === c).length;
    expect(count('google-cloud-offerings')).toBe(28);
    expect(count('improve-output')).toBe(16);
    expect(count('business-strategy')).toBe(12);
  });
});

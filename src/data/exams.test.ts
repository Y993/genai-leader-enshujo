import { describe, it, expect } from 'vitest';
import { EXAMS, getExam, getCategory } from './exams';

describe('EXAMS', () => {
  it('has genai-leader (4 cats) and ace (5 cats)', () => {
    expect(getExam('genai-leader')?.categories.length).toBe(4);
    expect(getExam('ace')?.categories.length).toBe(5);
  });
  it('each exam weights sum to 100', () => {
    for (const e of EXAMS) {
      expect(e.categories.reduce((s, c) => s + c.weightPercent, 0)).toBe(100);
    }
  });
  it('category slugs are unique within an exam and intros non-empty', () => {
    for (const e of EXAMS) {
      const slugs = e.categories.map((c) => c.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
      for (const c of e.categories) expect(c.intro.length).toBeGreaterThan(20);
    }
  });
  it('getCategory resolves by exam+slug', () => {
    expect(getCategory('genai-leader', 'fundamentals')?.titleJa).toBeTruthy();
    expect(getCategory('ace', 'setup-environment')?.titleJa).toBeTruthy();
    expect(getCategory('ace', 'nope')).toBeUndefined();
  });
});

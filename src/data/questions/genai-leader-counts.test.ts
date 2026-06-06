import { describe, it, expect } from 'vitest';
import { questionsFor } from './index';

describe('GenAI Leader question counts (secret 演習ページ内容のガード)', () => {
  it('4分野が 24/28/16/12（計80問）である', () => {
    expect(questionsFor('genai-leader', 'fundamentals').length).toBe(24);
    expect(questionsFor('genai-leader', 'google-cloud-offerings').length).toBe(28);
    expect(questionsFor('genai-leader', 'improve-output').length).toBe(16);
    expect(questionsFor('genai-leader', 'business-strategy').length).toBe(12);

    const total = ['fundamentals', 'google-cloud-offerings', 'improve-output', 'business-strategy']
      .reduce((s, c) => s + questionsFor('genai-leader', c).length, 0);
    expect(total).toBe(80);
  });
});

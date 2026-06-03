import { describe, it, expect } from 'vitest';
import { QuestionSchema, validateQuestions } from './schema';

const valid = {
  id: 'fund-001',
  category: 'fundamentals',
  subTopic: 'LLMの基礎',
  difficulty: 'easy',
  tags: ['llm'],
  question: '大規模言語モデル(LLM)の説明として最も適切なものはどれですか？',
  options: ['膨大なテキストで学習した言語モデル', '画像分類専用モデル', '表計算ソフト', '物理シミュレータ'],
  isMultiple: false,
  correct: 0,
  explanation: 'LLMは膨大なテキストコーパスで学習した言語モデル。他は生成AIのLLMではない。',
  reference: 'https://cloud.google.com/learn/what-is-generative-ai',
  relatedMaterials: [],
};

describe('QuestionSchema', () => {
  it('accepts a valid single-answer question', () => {
    expect(() => QuestionSchema.parse(valid)).not.toThrow();
  });

  it('rejects a correct index out of range', () => {
    expect(() => QuestionSchema.parse({ ...valid, correct: 9 })).toThrow();
  });

  it('rejects fewer than 2 options', () => {
    expect(() => QuestionSchema.parse({ ...valid, options: ['only one'] })).toThrow();
  });

  it('accepts a multiple-answer question with array correct', () => {
    const multi = { ...valid, isMultiple: true, correct: [0, 1] };
    expect(() => QuestionSchema.parse(multi)).not.toThrow();
  });

  it('rejects array correct when isMultiple is false', () => {
    expect(() => QuestionSchema.parse({ ...valid, correct: [0, 1] })).toThrow();
  });
});

describe('validateQuestions', () => {
  it('throws with the offending id when a question is invalid', () => {
    const bad = [{ ...valid, id: 'bad-1', correct: 99 }];
    expect(() => validateQuestions(bad, 'fundamentals')).toThrow(/bad-1/);
  });
  it('throws when category does not match the file', () => {
    expect(() => validateQuestions([valid], 'improve-output')).toThrow(/category/i);
  });
});

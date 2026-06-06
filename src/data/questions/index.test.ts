import { describe, it, expect } from 'vitest';
import { ALL_QUESTIONS, QUESTIONS_BY_EXAM, questionsFor } from './index';

describe('question dataset integrity', () => {
  it('loads without schema errors', () => {
    expect(ALL_QUESTIONS.length).toBeGreaterThan(0);
  });
  it('has unique ids across all exams', () => {
    const ids = ALL_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('genai-leader still has 80 questions', () => {
    expect(QUESTIONS_BY_EXAM['genai-leader'].length).toBe(80);
  });
  it('every question carries its examId', () => {
    expect(ALL_QUESTIONS.every((q) => q.examId === 'genai-leader' || q.examId === 'ace')).toBe(true);
  });
  it('questionsFor filters by exam+category', () => {
    expect(questionsFor('genai-leader', 'fundamentals').length).toBe(24);
  });
  it('ace has 241 questions', () => {
    expect(QUESTIONS_BY_EXAM['ace'].length).toBe(241);
  });
  it('ace category counts match the plan', () => {
    expect(questionsFor('ace', 'setup-environment').length).toBe(42);
    expect(questionsFor('ace', 'plan-configure').length).toBe(42);
    expect(questionsFor('ace', 'deploy-implement').length).toBe(60);
    expect(questionsFor('ace', 'operate').length).toBe(48);
    expect(questionsFor('ace', 'access-security').length).toBe(49);
  });
  it('has 321 questions in total', () => {
    expect(ALL_QUESTIONS.length).toBe(321);
  });
});

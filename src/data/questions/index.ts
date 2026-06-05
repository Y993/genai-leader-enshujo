// src/data/questions/index.ts
import { validateQuestions, type Question } from '../../lib/schema';
import { getExam } from '../exams';

import glFund from './genai-leader/fundamentals.json';
import glGco from './genai-leader/google-cloud-offerings.json';
import glImp from './genai-leader/improve-output.json';
import glBiz from './genai-leader/business-strategy.json';
import aceSetup from './ace/setup-environment.json';
import acePlan from './ace/plan-configure.json';
import aceDeploy from './ace/deploy-implement.json';
import aceOps from './ace/operate.json';
import aceSec from './ace/access-security.json';

function build(examSlug: string, catSlug: string, raw: unknown): Question[] {
  const validCats = getExam(examSlug)!.categories.map((c) => c.slug);
  return validateQuestions(raw as unknown[], examSlug, catSlug, validCats);
}

export const QUESTIONS_BY_EXAM: Record<string, Question[]> = {
  'genai-leader': [
    ...build('genai-leader', 'fundamentals', glFund),
    ...build('genai-leader', 'google-cloud-offerings', glGco),
    ...build('genai-leader', 'improve-output', glImp),
    ...build('genai-leader', 'business-strategy', glBiz),
  ],
  ace: [
    ...build('ace', 'setup-environment', aceSetup),
    ...build('ace', 'plan-configure', acePlan),
    ...build('ace', 'deploy-implement', aceDeploy),
    ...build('ace', 'operate', aceOps),
    ...build('ace', 'access-security', aceSec),
  ],
};

export const ALL_QUESTIONS: Question[] = Object.values(QUESTIONS_BY_EXAM).flat();

export function questionsFor(examSlug: string, catSlug: string): Question[] {
  return (QUESTIONS_BY_EXAM[examSlug] ?? []).filter((q) => q.category === catSlug);
}

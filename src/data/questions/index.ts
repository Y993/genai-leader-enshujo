// src/data/questions/index.ts
import { validateQuestions, type Question } from '../../lib/schema';
import fundamentals from './fundamentals.json';
import googleCloudOfferings from './google-cloud-offerings.json';
import improveOutput from './improve-output.json';
import businessStrategy from './business-strategy.json';

export const ALL_QUESTIONS: Question[] = [
  ...validateQuestions(fundamentals as unknown[], 'fundamentals'),
  ...validateQuestions(googleCloudOfferings as unknown[], 'google-cloud-offerings'),
  ...validateQuestions(improveOutput as unknown[], 'improve-output'),
  ...validateQuestions(businessStrategy as unknown[], 'business-strategy'),
];

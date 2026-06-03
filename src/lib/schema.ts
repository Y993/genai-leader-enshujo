// src/lib/schema.ts
import { z } from 'zod';

export const CATEGORY_SLUGS = [
  'fundamentals',
  'google-cloud-offerings',
  'improve-output',
  'business-strategy',
] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const QuestionSchema = z
  .object({
    id: z.string().min(1),
    category: z.enum(CATEGORY_SLUGS),
    subTopic: z.string().min(1),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    tags: z.array(z.string()).default([]),
    question: z.string().min(1),
    options: z.array(z.string().min(1)).min(2),
    isMultiple: z.boolean(),
    correct: z.union([z.number().int(), z.array(z.number().int()).min(1)]),
    explanation: z.string().min(1),
    reference: z.url(),
    relatedMaterials: z
      .array(z.object({ label: z.string(), url: z.url() }))
      .default([]),
  })
  .superRefine((q, ctx) => {
    const indices = Array.isArray(q.correct) ? q.correct : [q.correct];
    for (const i of indices) {
      if (i < 0 || i >= q.options.length) {
        ctx.addIssue({ code: 'custom', message: `correct index ${i} out of range` });
      }
    }
    if (q.isMultiple && !Array.isArray(q.correct)) {
      ctx.addIssue({ code: 'custom', message: 'isMultiple=true requires correct to be an array' });
    }
    if (!q.isMultiple && Array.isArray(q.correct)) {
      ctx.addIssue({ code: 'custom', message: 'isMultiple=false requires correct to be a number' });
    }
  });

export type Question = z.infer<typeof QuestionSchema>;

// 1ファイル分(=1カテゴリ)の配列を検証。失敗時は id 付きで throw（ビルドを止める）。
export function validateQuestions(raw: unknown[], expectedCategory: CategorySlug): Question[] {
  return raw.map((item, index) => {
    const result = QuestionSchema.safeParse(item);
    if (!result.success) {
      const id = (item as { id?: string })?.id ?? `index ${index}`;
      throw new Error(`Invalid question (${id}): ${result.error.issues.map((i) => i.message).join('; ')}`);
    }
    if (result.data.category !== expectedCategory) {
      throw new Error(`Question ${result.data.id} has category "${result.data.category}" but file expects "${expectedCategory}"`);
    }
    return result.data;
  });
}

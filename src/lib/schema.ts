// src/lib/schema.ts
import { z } from 'zod';

export const QuestionSchema = z
  .object({
    id: z.string().min(1),
    category: z.string().min(1),
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

// examId は読み込み時(index.ts)にディレクトリから注入する（JSONには書かない）。
export type Question = z.infer<typeof QuestionSchema> & { examId: string };

// 1ファイル分(=1カテゴリ)の配列を検証。examId を注入し、失敗時は id 付きで throw（ビルドを止める）。
export function validateQuestions(
  raw: unknown[],
  examId: string,
  expectedCategory: string,
  validCategories: readonly string[],
): Question[] {
  return raw.map((item, index) => {
    const result = QuestionSchema.safeParse(item);
    if (!result.success) {
      const id = (item as { id?: string })?.id ?? `index ${index}`;
      throw new Error(`Invalid question (${id}): ${result.error.issues.map((i) => i.message).join('; ')}`);
    }
    if (result.data.category !== expectedCategory) {
      throw new Error(`Question ${result.data.id} has category "${result.data.category}" but file expects "${expectedCategory}"`);
    }
    if (!validCategories.includes(result.data.category)) {
      throw new Error(`Question ${result.data.id} category "${result.data.category}" is not in exam "${examId}"`);
    }
    return { ...result.data, examId };
  });
}

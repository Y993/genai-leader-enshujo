// src/lib/progress.ts
export interface Progress {
  version: 1;
  answers: Record<string, boolean>; // questionId -> 最後の解答が正解だったか
}

export function emptyProgress(): Progress {
  return { version: 1, answers: {} };
}

export function recordAnswer(p: Progress, questionId: string, correct: boolean): Progress {
  return { ...p, answers: { ...p.answers, [questionId]: correct } };
}

export interface CategoryStats {
  answered: number;
  correct: number;
  total: number;
  rate: number; // correct / answered（answered=0 のとき 0）
}

export function categoryStats(p: Progress, questionIds: string[]): CategoryStats {
  let answered = 0;
  let correct = 0;
  for (const id of questionIds) {
    if (id in p.answers) {
      answered++;
      if (p.answers[id]) correct++;
    }
  }
  return { answered, correct, total: questionIds.length, rate: answered === 0 ? 0 : correct / answered };
}

export function serialize(p: Progress): string {
  return JSON.stringify(p);
}

export function deserialize(raw: string): Progress {
  try {
    const obj = JSON.parse(raw);
    if (obj && obj.version === 1 && typeof obj.answers === 'object') return obj as Progress;
  } catch {
    /* fallthrough */
  }
  return emptyProgress();
}

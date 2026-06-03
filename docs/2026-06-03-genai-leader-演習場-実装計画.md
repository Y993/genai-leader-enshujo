# GenAI Leader 演習場（フェーズ0）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Google Cloud「Generative AI Leader」認定の日本語・無料・即時フィードバック型クイズサイト（約40問・公式4分野）を Astro で静的生成し、GitHub Pages に無料公開する（フェーズ0）。

**Architecture:** Astro による静的サイト生成。問題は JSON データとして presentation から分離し、Zod でビルド時バリデーション。問題本文・解説は静的 HTML に焼き込んで SEO を最大化し、回答の即時判定・進捗保存のみクライアント側 island（vanilla TypeScript）で実装。純ロジック（採点・フィルタ・進捗）は Vitest で TDD。GitHub Actions が build & deploy を自動化。

**Tech Stack:** Astro 5 / TypeScript / Zod / Vitest / @astrojs/sitemap / GitHub Pages / GitHub Actions。フレームワークランタイムは持たない（クイズは vanilla TS island）。

**前提パラメータ（実行前に確定）:**
- GitHub リポジトリ名: `genai-leader-enshujo`（アカウント `Y993`、**public**）
- 公開URL: `https://Y993.github.io/genai-leader-enshujo/`
- Astro `site`: `https://Y993.github.io` / `base`: `/genai-leader-enshujo`
- 開発ローカル: `C:\Users\yuma1\.claude\projects\GCP-enshu`（このフォルダを git リポジトリ化。`docs/` は要件定義書・本計画を含む）
- Node.js: v20 以上

**参照スペック:** `docs/2026-06-03-genai-leader-演習場-要件定義.md`

> **コミットについて:** 本フォルダはまだ git リポジトリではない。Task 1 で `git init` する。コミットメッセージ末尾には `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` を付与する。GitHub への push は Task 3 でリモート作成後に行う。

> **UIの見た目について:** `.astro` の見た目（スタイル・レイアウト）を作る Task（10, 12, 13, 14）では **`frontend-design` スキルを必ず呼び出して**マークアップ/CSS を生成すること（CLAUDE.md ルール）。本計画にはコンパイル可能な機能スケルトンを記載するが、視覚デザインは frontend-design で仕上げる。

---

## ファイル構成（全体像）

```
GCP-enshu/                              ← git リポジトリ root
├── package.json
├── astro.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── .gitignore
├── .github/workflows/deploy.yml        ← Task 3
├── docs/                               ← 要件定義書・本計画（既存）
├── public/
│   ├── robots.txt                      ← Task 2
│   └── og-default.png                  ← Task 9（暫定。frontend-designで差替可）
└── src/
    ├── lib/
    │   ├── schema.ts                   ← Task 4: Zod スキーマ＋loadQuestions()
    │   ├── schema.test.ts
    │   ├── quiz.ts                      ← Task 6: 採点・フィルタ（純関数）
    │   ├── quiz.test.ts
    │   ├── progress.ts                 ← Task 7: 進捗状態（純関数）
    │   ├── progress.test.ts
    │   ├── storage.ts                  ← Task 7: localStorage 薄ラッパ
    │   └── url.ts                       ← Task 2: withBase() ヘルパ
    ├── data/
    │   ├── categories.ts               ← Task 5: 4分野メタ
    │   ├── categories.test.ts
    │   └── questions/
    │       ├── fundamentals.json        ← Task 8a
    │       ├── google-cloud-offerings.json ← Task 8b
    │       ├── improve-output.json      ← Task 8b
    │       └── business-strategy.json   ← Task 8b
    ├── layouts/
    │   └── BaseLayout.astro            ← Task 9: SEO meta/OGP/構造化データ
    ├── components/
    │   ├── Quiz.astro                  ← Task 10: 問題集UI＋client island
    │   └── RelatedMaterials.astro      ← Task 11: アフィリエイト枠（空）
    └── pages/
        ├── index.astro                 ← Task 13: トップ
        ├── categories/[slug].astro     ← Task 12: カテゴリ動的ページ
        ├── about.astro                 ← Task 14
        ├── privacy.astro               ← Task 14
        ├── disclosure.astro            ← Task 14
        └── contact.astro               ← Task 14
```

---

## Task 1: プロジェクト初期化とツールチェーン

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`

- [ ] **Step 1: git 初期化（既存 docs/ を保持）**

Run（PowerShell, GCP-enshu 内）:
```
git init -b main
```
Expected: `Initialized empty Git repository`。`docs/` 配下の既存2ファイルは保持される。

- [ ] **Step 2: Astro 最小プロジェクトを既存フォルダに作成**

Run:
```
npm create astro@latest -- --template minimal --no-install --no-git --typescript strict --yes .
```
Expected: カレント(`.`)に `package.json` / `astro.config.mjs` / `tsconfig.json` / `src/pages/index.astro` 等が生成。`--no-git` で既存 git を壊さない。

- [ ] **Step 3: 依存を追加インストール**

Run:
```
npm install
npm install -D vitest @astrojs/sitemap zod
```
Expected: `node_modules/` 生成、エラーなし。

- [ ] **Step 4: `vitest.config.ts` を作成**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 5: `package.json` に test スクリプトを追加**

`scripts` に以下を追記（既存の `dev`/`build`/`preview` は残す）:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: `.gitignore` を確認・補強**

`.gitignore` に以下が含まれることを確認（なければ追記）:
```
node_modules/
dist/
.astro/
```

- [ ] **Step 7: ビルドが通ることを確認**

Run:
```
npm run build
```
Expected: `dist/` が生成され、エラーなく完了。

- [ ] **Step 8: テストランナーが動くことを確認（テスト0件でOK）**

Run:
```
npm test
```
Expected: `No test files found` もしくは 0 passed で正常終了。

- [ ] **Step 9: Commit**

```
git add -A
git commit -m "chore: scaffold Astro project with Vitest, Zod, sitemap

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Astro 設定（site/base/sitemap）・robots・URLヘルパ

**Files:**
- Modify: `astro.config.mjs`
- Create: `public/robots.txt`, `src/lib/url.ts`, `src/lib/url.test.ts`

- [ ] **Step 1: `src/lib/url.test.ts` を書く（失敗するテスト）**

```ts
import { describe, it, expect } from 'vitest';
import { withBase } from './url';

describe('withBase', () => {
  it('prefixes the base path and avoids double slashes', () => {
    expect(withBase('/categories/fundamentals/', '/genai-leader-enshujo')).toBe(
      '/genai-leader-enshujo/categories/fundamentals/'
    );
  });
  it('handles base without trailing slash and path with leading slash', () => {
    expect(withBase('/about/', '/genai-leader-enshujo')).toBe('/genai-leader-enshujo/about/');
  });
  it('treats empty/root base as no prefix', () => {
    expect(withBase('/about/', '')).toBe('/about/');
    expect(withBase('/about/', '/')).toBe('/about/');
  });
});
```

- [ ] **Step 2: テスト失敗を確認**

Run: `npx vitest run src/lib/url.test.ts`
Expected: FAIL（`withBase` 未定義）

- [ ] **Step 3: `src/lib/url.ts` を実装**

```ts
// src/lib/url.ts
// 内部リンク用: GitHub Pages のサブパス(base)を安全に前置する。
export function withBase(path: string, base: string = import.meta.env.BASE_URL): string {
  const normalizedBase = (base === '/' ? '' : base).replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
```

- [ ] **Step 4: テスト成功を確認**

Run: `npx vitest run src/lib/url.test.ts`
Expected: PASS（3 tests）

- [ ] **Step 5: `astro.config.mjs` を更新**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://Y993.github.io',
  base: '/genai-leader-enshujo',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
```

- [ ] **Step 6: `public/robots.txt` を作成**

```
User-agent: *
Allow: /

Sitemap: https://Y993.github.io/genai-leader-enshujo/sitemap-index.xml
```

- [ ] **Step 7: ビルドで sitemap が生成されることを確認**

Run: `npm run build`
Expected: `dist/sitemap-index.xml` と `dist/sitemap-0.xml` が生成される。

- [ ] **Step 8: Commit**

```
git add -A
git commit -m "feat: configure site/base, sitemap, robots, and withBase helper

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: GitHub リポジトリ作成と Pages 自動デプロイ

**Files:**
- Create: `.github/workflows/deploy.yml`

> 前提: `gh` CLI がログイン済みであること（未ログインならユーザーに `! gh auth login` を依頼）。

- [ ] **Step 1: public リポジトリを作成して push**

Run:
```
gh repo create genai-leader-enshujo --public --source=. --remote=origin --push
```
Expected: リモート `origin` 作成、`main` が push される。

- [ ] **Step 2: デプロイ workflow を作成**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: GitHub Pages のソースを「GitHub Actions」に設定**

Run:
```
gh api -X POST repos/Y993/genai-leader-enshujo/pages -f build_type=workflow
```
Expected: 201 もしくは既存なら 409（その場合は次の Step で build_type を更新）。409 のときは:
```
gh api -X PUT repos/Y993/genai-leader-enshujo/pages -f build_type=workflow
```

- [ ] **Step 4: workflow を push してデプロイを起動**

```
git add -A
git commit -m "ci: add GitHub Pages deploy workflow

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git push
```

- [ ] **Step 5: デプロイ成功を確認**

Run:
```
gh run watch
```
Expected: workflow が success。完了後 `https://Y993.github.io/genai-leader-enshujo/` がスケルトンページを返す（最小テンプレートの index）。

---

## Task 4: 問題データの Zod スキーマとローダ（データ整合性 TDD）

**Files:**
- Create: `src/lib/schema.ts`, `src/lib/schema.test.ts`

- [ ] **Step 1: `src/lib/schema.test.ts` を書く（失敗するテスト）**

```ts
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
```

- [ ] **Step 2: テスト失敗を確認**

Run: `npx vitest run src/lib/schema.test.ts`
Expected: FAIL（モジュール未実装）

- [ ] **Step 3: `src/lib/schema.ts` を実装**

```ts
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
    reference: z.string().url(),
    relatedMaterials: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
      .default([]),
  })
  .superRefine((q, ctx) => {
    const indices = Array.isArray(q.correct) ? q.correct : [q.correct];
    for (const i of indices) {
      if (i < 0 || i >= q.options.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `correct index ${i} out of range` });
      }
    }
    if (q.isMultiple && !Array.isArray(q.correct)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'isMultiple=true requires correct to be an array' });
    }
    if (!q.isMultiple && Array.isArray(q.correct)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'isMultiple=false requires correct to be a number' });
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
```

- [ ] **Step 4: テスト成功を確認**

Run: `npx vitest run src/lib/schema.test.ts`
Expected: PASS（7 tests）

- [ ] **Step 5: Commit**

```
git add -A
git commit -m "feat: add Zod question schema and validator

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: カテゴリメタデータ

**Files:**
- Create: `src/data/categories.ts`, `src/data/categories.test.ts`

- [ ] **Step 1: `src/data/categories.test.ts` を書く（失敗するテスト）**

```ts
import { describe, it, expect } from 'vitest';
import { CATEGORIES, getCategory } from './categories';
import { CATEGORY_SLUGS } from '../lib/schema';

describe('CATEGORIES', () => {
  it('defines exactly the 4 official slugs', () => {
    expect(CATEGORIES.map((c) => c.slug).sort()).toEqual([...CATEGORY_SLUGS].sort());
  });
  it('weights sum to 100', () => {
    expect(CATEGORIES.reduce((s, c) => s + c.weightPercent, 0)).toBe(100);
  });
  it('every category has a non-empty Japanese title and intro', () => {
    for (const c of CATEGORIES) {
      expect(c.titleJa.length).toBeGreaterThan(0);
      expect(c.intro.length).toBeGreaterThan(20);
      expect(c.targetCount).toBeGreaterThan(0);
    }
  });
});

describe('getCategory', () => {
  it('returns the category for a known slug', () => {
    expect(getCategory('fundamentals')?.slug).toBe('fundamentals');
  });
  it('returns undefined for an unknown slug', () => {
    expect(getCategory('nope')).toBeUndefined();
  });
});
```

- [ ] **Step 2: テスト失敗を確認**

Run: `npx vitest run src/data/categories.test.ts`
Expected: FAIL（モジュール未実装）

- [ ] **Step 3: `src/data/categories.ts` を実装**

```ts
// src/data/categories.ts
import type { CategorySlug } from '../lib/schema';

export interface Category {
  slug: CategorySlug;
  titleJa: string;
  titleEn: string;
  weightPercent: number;
  targetCount: number; // フェーズ0の目標問題数（合計40）
  intro: string;       // SEO用の導入解説（オリジナル日本語本文）
}

export const CATEGORIES: Category[] = [
  {
    slug: 'fundamentals',
    titleJa: '生成AIの基礎',
    titleEn: 'Fundamentals of gen AI',
    weightPercent: 30,
    targetCount: 12,
    intro:
      '生成AIの基礎では、大規模言語モデル(LLM)や基盤モデル、トークン、埋め込みといった中核概念と、生成AIが従来の機械学習と何が違うのかを問います。この分野は試験全体の約30%を占め、用語の正確な理解が得点の土台になります。',
  },
  {
    slug: 'google-cloud-offerings',
    titleJa: 'Google Cloud の生成AI製品',
    titleEn: "Google Cloud's gen AI offerings",
    weightPercent: 35,
    targetCount: 14,
    intro:
      'この分野では、Vertex AI や Gemini、Model Garden、Agent Builder など、Google Cloud が提供する生成AI関連サービスの役割と使い分けを問います。試験全体の約35%と最大の比重を持ち、各製品が「何を解決するのか」を結びつけて覚えることが重要です。',
  },
  {
    slug: 'improve-output',
    titleJa: '生成AI出力を改善する手法',
    titleEn: 'Techniques to improve gen AI model output',
    weightPercent: 20,
    targetCount: 8,
    intro:
      'プロンプトエンジニアリング、グラウンディング、RAG(検索拡張生成)、ファインチューニングなど、LLMの限界(ハルシネーション等)を補い出力品質を高める手法を問う分野です。試験全体の約20%を占めます。',
  },
  {
    slug: 'business-strategy',
    titleJa: '成功する生成AIソリューションのビジネス戦略',
    titleEn: 'Business strategies for a successful gen AI solution',
    weightPercent: 15,
    targetCount: 6,
    intro:
      '責任あるAI、セキュリティ、ガバナンス、コストや導入推進など、生成AIをビジネスで安全かつ効果的に活用するためのGoogle推奨プラクティスを問う分野です。試験全体の約15%を占めます。',
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
```

- [ ] **Step 4: テスト成功を確認**

Run: `npx vitest run src/data/categories.test.ts`
Expected: PASS（5 tests）

- [ ] **Step 5: Commit**

```
git add -A
git commit -m "feat: add category metadata for the 4 official domains

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: クイズ採点・フィルタロジック（純関数 TDD）

**Files:**
- Create: `src/lib/quiz.ts`, `src/lib/quiz.test.ts`

- [ ] **Step 1: `src/lib/quiz.test.ts` を書く（失敗するテスト）**

```ts
import { describe, it, expect } from 'vitest';
import { isCorrect, filterByCategory, scoreSession } from './quiz';
import type { Question } from './schema';

const base: Question = {
  id: 'q1', category: 'fundamentals', subTopic: 't', difficulty: 'easy', tags: [],
  question: 'q', options: ['a', 'b', 'c'], isMultiple: false, correct: 1,
  explanation: 'e', reference: 'https://example.com', relatedMaterials: [],
};

describe('isCorrect', () => {
  it('single answer: matching index is correct', () => {
    expect(isCorrect(base, [1])).toBe(true);
  });
  it('single answer: wrong index is incorrect', () => {
    expect(isCorrect(base, [0])).toBe(false);
  });
  it('multiple answer: exact set is correct regardless of order', () => {
    const m: Question = { ...base, isMultiple: true, correct: [0, 2] };
    expect(isCorrect(m, [2, 0])).toBe(true);
  });
  it('multiple answer: partial selection is incorrect', () => {
    const m: Question = { ...base, isMultiple: true, correct: [0, 2] };
    expect(isCorrect(m, [0])).toBe(false);
  });
});

describe('filterByCategory', () => {
  it('returns only questions of the given category', () => {
    const qs: Question[] = [base, { ...base, id: 'q2', category: 'improve-output' }];
    expect(filterByCategory(qs, 'fundamentals').map((q) => q.id)).toEqual(['q1']);
  });
});

describe('scoreSession', () => {
  it('counts correct answers', () => {
    const qs: Question[] = [base, { ...base, id: 'q2', correct: 0 }];
    const answers = { q1: [1], q2: [2] }; // q1 correct, q2 wrong
    const r = scoreSession(qs, answers);
    expect(r.total).toBe(2);
    expect(r.correctCount).toBe(1);
    expect(r.wrongIds).toEqual(['q2']);
  });
});
```

- [ ] **Step 2: テスト失敗を確認**

Run: `npx vitest run src/lib/quiz.test.ts`
Expected: FAIL（モジュール未実装）

- [ ] **Step 3: `src/lib/quiz.ts` を実装**

```ts
// src/lib/quiz.ts
import type { Question, CategorySlug } from './schema';

export function isCorrect(question: Question, selected: number[]): boolean {
  const correct = Array.isArray(question.correct) ? question.correct : [question.correct];
  if (selected.length !== correct.length) return false;
  const a = [...selected].sort((x, y) => x - y);
  const b = [...correct].sort((x, y) => x - y);
  return a.every((v, i) => v === b[i]);
}

export function filterByCategory(questions: Question[], category: CategorySlug): Question[] {
  return questions.filter((q) => q.category === category);
}

export interface SessionResult {
  total: number;
  correctCount: number;
  wrongIds: string[];
}

// answers: questionId -> 選択されたインデックス配列
export function scoreSession(questions: Question[], answers: Record<string, number[]>): SessionResult {
  let correctCount = 0;
  const wrongIds: string[] = [];
  for (const q of questions) {
    const sel = answers[q.id] ?? [];
    if (isCorrect(q, sel)) correctCount++;
    else wrongIds.push(q.id);
  }
  return { total: questions.length, correctCount, wrongIds };
}
```

- [ ] **Step 4: テスト成功を確認**

Run: `npx vitest run src/lib/quiz.test.ts`
Expected: PASS（7 tests）

- [ ] **Step 5: Commit**

```
git add -A
git commit -m "feat: add quiz scoring and filtering logic

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: 進捗状態（純関数 TDD）と localStorage ラッパ

**Files:**
- Create: `src/lib/progress.ts`, `src/lib/progress.test.ts`, `src/lib/storage.ts`

- [ ] **Step 1: `src/lib/progress.test.ts` を書く（失敗するテスト）**

```ts
import { describe, it, expect } from 'vitest';
import { emptyProgress, recordAnswer, categoryStats, serialize, deserialize } from './progress';

describe('progress', () => {
  it('records an answer and counts correctness per question', () => {
    let p = emptyProgress();
    p = recordAnswer(p, 'fund-001', true);
    p = recordAnswer(p, 'fund-002', false);
    expect(p.answers['fund-001']).toBe(true);
    expect(p.answers['fund-002']).toBe(false);
  });

  it('latest answer for the same question overrides the previous', () => {
    let p = emptyProgress();
    p = recordAnswer(p, 'fund-001', false);
    p = recordAnswer(p, 'fund-001', true);
    expect(p.answers['fund-001']).toBe(true);
  });

  it('categoryStats computes answered/correct/rate over the given question ids', () => {
    let p = emptyProgress();
    p = recordAnswer(p, 'a', true);
    p = recordAnswer(p, 'b', false);
    const stats = categoryStats(p, ['a', 'b', 'c']);
    expect(stats).toEqual({ answered: 2, correct: 1, total: 3, rate: 0.5 });
  });

  it('serialize/deserialize round-trips', () => {
    let p = emptyProgress();
    p = recordAnswer(p, 'a', true);
    expect(deserialize(serialize(p))).toEqual(p);
  });

  it('deserialize returns empty progress on malformed input', () => {
    expect(deserialize('not json')).toEqual(emptyProgress());
  });
});
```

- [ ] **Step 2: テスト失敗を確認**

Run: `npx vitest run src/lib/progress.test.ts`
Expected: FAIL（モジュール未実装）

- [ ] **Step 3: `src/lib/progress.ts` を実装**

```ts
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
```

- [ ] **Step 4: テスト成功を確認**

Run: `npx vitest run src/lib/progress.test.ts`
Expected: PASS（5 tests）

- [ ] **Step 5: `src/lib/storage.ts` を実装（薄ラッパ・テスト対象外）**

```ts
// src/lib/storage.ts
import { type Progress, emptyProgress, serialize, deserialize } from './progress';

const KEY = 'genai-leader-enshujo:progress:v1';

export function loadProgress(): Progress {
  if (typeof localStorage === 'undefined') return emptyProgress();
  const raw = localStorage.getItem(KEY);
  return raw ? deserialize(raw) : emptyProgress();
}

export function saveProgress(p: Progress): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEY, serialize(p));
}
```

- [ ] **Step 6: 型チェックとテストを通す**

Run: `npm run build` および `npx vitest run src/lib/progress.test.ts`
Expected: ビルド成功、テスト PASS

- [ ] **Step 7: Commit**

```
git add -A
git commit -m "feat: add progress tracking logic and localStorage wrapper

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8a: 問題データ（fundamentals 12問）＋整合テスト【縦切り検証】

**Files:**
- Create: `src/data/questions/fundamentals.json`, `src/data/questions/index.ts`, `src/data/questions/index.test.ts`

**作問の品質基準（全カテゴリ共通・厳守）:**
- 公式問題の転載は禁止。**公式試験ガイド/Study Guideの分野・概念に基づくオリジナル作問**。
- 各問に `reference`（`cloud.google.com` 等の公式ドキュメントURL）を必ず付与。
- `explanation` は「なぜ正解か」だけでなく「なぜ他の選択肢が誤りか」まで日本語で記述。
- `id` は `<prefix>-NNN` 形式（fundamentals→`fund`, google-cloud-offerings→`gco`, improve-output→`imp`, business-strategy→`biz`）。
- `difficulty` は易/中/難をバランス良く（目安: easy 4 / medium 6 / hard 2 程度）。
- 選択肢は4つを基本とし、紛らわしい誤答（distractor）を用意。

- [ ] **Step 1: `src/data/questions/fundamentals.json` を作成（12問）**

下記を**テンプレート**として、同形式で計12問を作問する（このうち2問を雛形として提示。残り10問を品質基準に沿って追加）:

```json
[
  {
    "id": "fund-001",
    "category": "fundamentals",
    "subTopic": "LLMの基礎",
    "difficulty": "easy",
    "tags": ["llm", "foundation-model"],
    "question": "大規模言語モデル(LLM)を最もよく説明しているものはどれですか？",
    "options": [
      "膨大なテキストデータで事前学習され、次に来る語を予測することで文章を生成するモデル",
      "画像を分類することだけに特化したモデル",
      "構造化データの集計を行う表計算エンジン",
      "物理現象を数値計算するシミュレータ"
    ],
    "isMultiple": false,
    "correct": 0,
    "explanation": "LLMは膨大なテキストで事前学習し、文脈から次の語を確率的に予測して文章を生成する基盤モデルです。画像分類専用(選択肢2)、集計エンジン(3)、物理シミュレータ(4)はいずれも生成AIのLLMの説明ではありません。",
    "reference": "https://cloud.google.com/learn/what-is-generative-ai",
    "relatedMaterials": []
  },
  {
    "id": "fund-002",
    "category": "fundamentals",
    "subTopic": "ハルシネーション",
    "difficulty": "medium",
    "tags": ["hallucination", "limitation"],
    "question": "生成AIにおける『ハルシネーション』の説明として正しいものを2つ選んでください。",
    "options": [
      "事実に基づかないもっともらしい誤情報をモデルが生成すること",
      "学習データに存在しない内容を、あたかも正しいかのように出力すること",
      "モデルの推論速度が低下する現象",
      "GPUのメモリが不足してジョブが失敗すること"
    ],
    "isMultiple": true,
    "correct": [0, 1],
    "explanation": "ハルシネーションは、モデルが事実と異なる情報をもっともらしく生成する現象を指します(選択肢1・2)。推論速度の低下(3)やメモリ不足(4)はインフラ上の問題であり、ハルシネーションとは無関係です。",
    "reference": "https://cloud.google.com/discover/what-are-ai-hallucinations",
    "relatedMaterials": []
  }
]
```

- [ ] **Step 2: `src/data/questions/index.ts` を作成（全カテゴリ集約ローダ）**

```ts
// src/data/questions/index.ts
import { validateQuestions, type Question } from '../../lib/schema';
import fundamentals from './fundamentals.json';
// 注: 他カテゴリのimportは Task 8b で追加する。
//   import googleCloudOfferings from './google-cloud-offerings.json';
//   import improveOutput from './improve-output.json';
//   import businessStrategy from './business-strategy.json';

export const ALL_QUESTIONS: Question[] = [
  ...validateQuestions(fundamentals as unknown[], 'fundamentals'),
  // ...validateQuestions(googleCloudOfferings as unknown[], 'google-cloud-offerings'),
  // ...validateQuestions(improveOutput as unknown[], 'improve-output'),
  // ...validateQuestions(businessStrategy as unknown[], 'business-strategy'),
];
```

> `tsconfig.json` に `"resolveJsonModule": true` が必要（Astro strict テンプレートでは既定で有効。無効なら `compilerOptions` に追記）。

- [ ] **Step 3: `src/data/questions/index.test.ts` を書く（整合テスト）**

```ts
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
  it('fundamentals has 12 questions', () => {
    expect(ALL_QUESTIONS.filter((q) => q.category === 'fundamentals').length).toBe(12);
  });
});
```

- [ ] **Step 4: テストとビルドを通す**

Run: `npx vitest run src/data/questions/index.test.ts` および `npm run build`
Expected: PASS（3 tests）、ビルド成功。整合エラーがあれば `validateQuestions` が id 付きで停止するので修正。

- [ ] **Step 5: Commit**

```
git add -A
git commit -m "feat: add fundamentals questions (12) with integrity tests

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8b: 残り3カテゴリの問題データ（合計28問）

**Files:**
- Create: `src/data/questions/google-cloud-offerings.json`（14問）, `src/data/questions/improve-output.json`（8問）, `src/data/questions/business-strategy.json`（6問）
- Modify: `src/data/questions/index.ts`, `src/data/questions/index.test.ts`

- [ ] **Step 1: 3つの JSON を Task 8a の品質基準・テンプレート形式で作問**

各ファイルは Task 8a と同じスキーマ。id プレフィックスは `gco-`/`imp-`/`biz-`。`category` は各ファイルのカテゴリに一致させる（不一致は `validateQuestions` が停止）。

- [ ] **Step 2: `src/data/questions/index.ts` の3つの import とコメントアウトを有効化**

Task 8a の `index.ts` のコメントアウト4行（import 3本＋validateQuestions 3行）を有効化する。

- [ ] **Step 3: `index.test.ts` に総数とカテゴリ別件数の検証を追加**

```ts
  it('has 40 questions in total', () => {
    expect(ALL_QUESTIONS.length).toBe(40);
  });
  it('matches target counts per category', () => {
    const count = (c: string) => ALL_QUESTIONS.filter((q) => q.category === c).length;
    expect(count('google-cloud-offerings')).toBe(14);
    expect(count('improve-output')).toBe(8);
    expect(count('business-strategy')).toBe(6);
  });
```

- [ ] **Step 4: テストとビルドを通す**

Run: `npm test` および `npm run build`
Expected: 全テスト PASS（合計40問・id一意・カテゴリ別件数一致）、ビルド成功。

- [ ] **Step 5: Commit**

```
git add -A
git commit -m "feat: add remaining 28 questions across 3 categories (40 total)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: BaseLayout（SEO メタ・OGP・構造化データ）

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `public/og-default.png`

- [ ] **Step 1: 暫定の OGP 画像を用意**

`public/og-default.png`（1200x630）を仮で配置。後で frontend-design による正式版に差し替え可。最低限プレースホルダ画像でよい。

- [ ] **Step 2: `src/layouts/BaseLayout.astro` を実装**

```astro
---
// src/layouts/BaseLayout.astro
import { withBase } from '../lib/url';
export interface Props {
  title: string;
  description: string;
  path: string; // 例: '/categories/fundamentals/'
}
const { title, description, path } = Astro.props;
const siteName = 'GenAI Leader 演習場';
const canonical = new URL(withBase(path), Astro.site).toString();
const ogImage = new URL(withBase('/og-default.png'), Astro.site).toString();
---
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} | {siteName}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={`${title} | ${siteName}`} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:site_name" content={siteName} />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body>
    <header><a href={withBase('/')}>{siteName}</a></header>
    <main>
      <slot />
    </main>
    <footer>
      <nav>
        <a href={withBase('/about/')}>運営者情報</a>
        <a href={withBase('/privacy/')}>プライバシーポリシー</a>
        <a href={withBase('/disclosure/')}>広告に関する表記</a>
        <a href={withBase('/contact/')}>お問い合わせ</a>
      </nav>
      <p>このサイトは Google Cloud / Google とは無関係の非公式の学習サイトです。</p>
    </footer>
  </body>
</html>
```

- [ ] **Step 3: ビルドで HTML に title/description/canonical が出力されることを確認**

一時的に `src/pages/index.astro` を BaseLayout 利用に変更してビルドし、`dist/index.html` に `<title>` と `<link rel="canonical">` が含まれることを確認（このindexは Task 13 で正式版に置換）。

Run: `npm run build`
Expected: ビルド成功。`dist/index.html` に meta 群が出力。

- [ ] **Step 4: Commit**

```
git add -A
git commit -m "feat: add BaseLayout with SEO meta, OGP, and footer nav

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

> **デザイン注記:** 本 Task のマークアップは機能スケルトン。`<head>` 構造はそのまま使い、`<header>/<footer>/<main>` の見た目は **Task 12/13 で frontend-design スキルにより仕上げる**。

---

## Task 10: Quiz コンポーネント（問題集UI＋即時フィードバック island）

**Files:**
- Create: `src/components/Quiz.astro`

> **このTaskは `frontend-design` スキルを呼び出してUIを作る。** 以下は island のロジック契約（必ず満たすこと）。

- [ ] **Step 1: frontend-design スキルを呼び出し、要件を渡してUIを生成**

要件: モバイルファースト／1問ずつ表示／選択肢クリックで選択→「答え合わせ」で即時に正誤＋`explanation` を展開→「次の問題」で進む／カテゴリ末尾に結果（正答数・正答率・誤答のみ再挑戦ボタン）／キーボード操作・コントラスト配慮。

- [ ] **Step 2: `Quiz.astro` を実装（サーバ側で全問の本文・選択肢・解説をHTMLに描画）**

サーバ側 frontmatter で props `questions: Question[]` を受け取り、**全問題の question/options/explanation を初期HTMLに出力**（SEOのため。CSSで初期は1問のみ表示）。各問題要素に `data-question-id` / `data-correct`（JSON）/ `data-multiple` を持たせる。

```astro
---
// src/components/Quiz.astro
import type { Question } from '../lib/schema';
export interface Props { questions: Question[] }
const { questions } = Astro.props;
---
<section class="quiz" data-quiz>
  {questions.map((q, i) => (
    <article class="quiz-item" data-question-id={q.id}
             data-correct={JSON.stringify(Array.isArray(q.correct) ? q.correct : [q.correct])}
             data-multiple={String(q.isMultiple)} hidden={i !== 0}>
      <p class="quiz-question">{q.question}</p>
      <ul class="quiz-options">
        {q.options.map((opt, idx) => (
          <li><button type="button" class="quiz-option" data-index={idx}>{opt}</button></li>
        ))}
      </ul>
      <div class="quiz-explanation" hidden>
        <p>{q.explanation}</p>
        <p><a href={q.reference} target="_blank" rel="noopener noreferrer">出典</a></p>
      </div>
      <button type="button" class="quiz-check">答え合わせ</button>
      <button type="button" class="quiz-next" hidden>次の問題</button>
    </article>
  ))}
  <div class="quiz-result" data-result hidden></div>
</section>

<script>
  import { isCorrect } from '../lib/quiz';
  import { loadProgress, saveProgress } from '../lib/storage';
  import { recordAnswer } from '../lib/progress';

  // 各 [data-quiz] を初期化
  document.querySelectorAll<HTMLElement>('[data-quiz]').forEach((root) => {
    const items = Array.from(root.querySelectorAll<HTMLElement>('.quiz-item'));
    let current = 0;
    let progress = loadProgress();
    let correctCount = 0;
    const wrongIds: string[] = [];

    items.forEach((item) => {
      const selected = new Set<number>();
      const multiple = item.dataset.multiple === 'true';
      const correct: number[] = JSON.parse(item.dataset.correct || '[]');
      const qid = item.dataset.questionId!;
      const optionButtons = item.querySelectorAll<HTMLButtonElement>('.quiz-option');
      const checkBtn = item.querySelector<HTMLButtonElement>('.quiz-check')!;
      const nextBtn = item.querySelector<HTMLButtonElement>('.quiz-next')!;
      const explanation = item.querySelector<HTMLElement>('.quiz-explanation')!;

      optionButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.dataset.index);
          if (!multiple) { selected.clear(); optionButtons.forEach((b) => b.classList.remove('is-selected')); }
          if (selected.has(idx)) { selected.delete(idx); btn.classList.remove('is-selected'); }
          else { selected.add(idx); btn.classList.add('is-selected'); }
        });
      });

      checkBtn.addEventListener('click', () => {
        const sel = Array.from(selected);
        const ok = isCorrect({ correct, isMultiple: multiple } as any, sel);
        optionButtons.forEach((b) => {
          const i = Number(b.dataset.index);
          if (correct.includes(i)) b.classList.add('is-correct');
          else if (selected.has(i)) b.classList.add('is-wrong');
        });
        explanation.hidden = false;
        checkBtn.hidden = true;
        nextBtn.hidden = false;
        if (ok) correctCount++; else wrongIds.push(qid);
        progress = recordAnswer(progress, qid, ok);
        saveProgress(progress);
      });

      nextBtn.addEventListener('click', () => {
        item.hidden = true;
        current++;
        if (current < items.length) items[current].hidden = false;
        else showResult();
      });
    });

    function showResult() {
      const result = root.querySelector<HTMLElement>('[data-result]')!;
      const rate = Math.round((correctCount / items.length) * 100);
      result.hidden = false;
      result.innerHTML = `<p>正答 ${correctCount} / ${items.length}（${rate}%）</p>` +
        (wrongIds.length ? `<button type="button" data-retry-wrong>誤答だけ再挑戦</button>` : '');
      result.querySelector('[data-retry-wrong]')?.addEventListener('click', () => {
        items.forEach((it) => { it.hidden = !wrongIds.includes(it.dataset.questionId!); });
        // 状態をリセットして誤答のみ再挑戦
        correctCount = 0; wrongIds.length = 0; current = items.findIndex((it) => !it.hidden);
        result.hidden = true;
      });
    }
  });
</script>
```

> 注: island から `src/lib/quiz.ts` `progress.ts` `storage.ts` を import することで、TDD 済みロジックを再利用する（DRY）。`isCorrect` には最小形 `{correct, isMultiple}` を渡す（型は `as any` で吸収。挙動は `correct`/`isMultiple` のみ参照）。

- [ ] **Step 3: ビルドで全問の本文がHTMLに含まれることを確認（SEO検証）**

Run: `npm run build`
その後 `dist/` 内のカテゴリページ（Task 12 完了後）に各 `question` テキストが含まれることを確認。本Task時点では `Quiz.astro` 単体のビルド成功を確認。
Expected: ビルド成功、TypeScript エラーなし。

- [ ] **Step 4: Commit**

```
git add -A
git commit -m "feat: add Quiz component with immediate-feedback island

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 11: RelatedMaterials（アフィリエイト枠・フェーズ0は空）

**Files:**
- Create: `src/components/RelatedMaterials.astro`

- [ ] **Step 1: `RelatedMaterials.astro` を実装**

```astro
---
// src/components/RelatedMaterials.astro
// フェーズ0: スロットのみ。materials が空なら何も描画しない。
// フェーズ2でアフィリエイトリンク（label, url）を流し込む。
export interface Props { materials?: { label: string; url: string }[] }
const { materials = [] } = Astro.props;
---
{materials.length > 0 && (
  <aside class="related-materials" aria-label="関連教材">
    <h2>関連教材</h2>
    <ul>
      {materials.map((m) => (
        <li><a href={m.url} target="_blank" rel="sponsored noopener noreferrer">{m.label}</a></li>
      ))}
    </ul>
  </aside>
)}
```

- [ ] **Step 2: ビルド確認**

Run: `npm run build`
Expected: 成功（空配列なら何も出力されない）。

- [ ] **Step 3: Commit**

```
git add -A
git commit -m "feat: add empty RelatedMaterials affiliate slot (phase 0)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 12: カテゴリ動的ページ `/categories/[slug]/`

**Files:**
- Create: `src/pages/categories/[slug].astro`

> **このTaskは `frontend-design` スキルでページ見た目を仕上げる。**

- [ ] **Step 1: `src/pages/categories/[slug].astro` を実装**

```astro
---
// src/pages/categories/[slug].astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import Quiz from '../../components/Quiz.astro';
import RelatedMaterials from '../../components/RelatedMaterials.astro';
import { CATEGORIES, getCategory } from '../../data/categories';
import { ALL_QUESTIONS } from '../../data/questions';
import { filterByCategory } from '../../lib/quiz';

export function getStaticPaths() {
  return CATEGORIES.map((c) => ({ params: { slug: c.slug } }));
}

const { slug } = Astro.params;
const category = getCategory(slug!)!;
const questions = filterByCategory(ALL_QUESTIONS, category.slug);
const title = `${category.titleJa}の問題集`;
const description = `${category.titleJa}（Generative AI Leader）の無料・日本語の練習問題${questions.length}問。即時に正誤と解説を確認できます。`;
---
<BaseLayout title={title} description={description} path={`/categories/${category.slug}/`}>
  <h1>{title}</h1>
  <p>{category.intro}</p>
  <Quiz questions={questions} />
  <RelatedMaterials />
</BaseLayout>

<!-- 構造化データ: クイズ問題(SEO) -->
<script type="application/ld+json" set:html={JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  'name': title,
  'about': { '@type': 'Thing', 'name': 'Google Cloud Generative AI Leader' },
  'hasPart': questions.map((q) => ({
    '@type': 'Question',
    'eduQuestionType': 'Multiple choice',
    'text': q.question,
    'acceptedAnswer': { '@type': 'Answer', 'text': (Array.isArray(q.correct) ? q.correct : [q.correct]).map((i) => q.options[i]).join(' / ') },
  })),
})} />
```

- [ ] **Step 2: 4カテゴリページが生成され、本文がHTMLに含まれることを確認**

Run: `npm run build`
Expected: `dist/categories/fundamentals/index.html` 他4つが生成。各HTMLに `category.intro` と各 `question` テキストが含まれる（SEO要件充足）。

- [ ] **Step 3: ローカルプレビューで挙動確認**

Run: `npm run preview`
ブラウザで `http://localhost:4321/genai-leader-enshujo/categories/fundamentals/` を開き、選択→答え合わせ→解説表示→次の問題→結果、を手動確認。
Expected: 即時フィードバックが機能。リロードで進捗保持（localStorage）。

- [ ] **Step 4: Commit**

```
git add -A
git commit -m "feat: add category quiz pages with intro and Quiz schema

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 13: トップページ `/`

**Files:**
- Modify/Create: `src/pages/index.astro`

> **このTaskは `frontend-design` スキルでトップの見た目を仕上げる。**

- [ ] **Step 1: `src/pages/index.astro` を実装**

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import { CATEGORIES } from '../data/categories';
import { ALL_QUESTIONS } from '../data/questions';
import { withBase } from '../lib/url';
const total = ALL_QUESTIONS.length;
const title = 'Generative AI Leader 無料問題集・模擬試験（日本語）';
const description = `Google Cloud「Generative AI Leader」認定の無料・日本語の練習問題${total}問。公式4分野を即時フィードバックで演習できます。`;
---
<BaseLayout title={title} description={description} path="/">
  <h1>GenAI Leader 演習場</h1>
  <p>{description}</p>
  <ul class="category-list">
    {CATEGORIES.map((c) => (
      <li>
        <a href={withBase(`/categories/${c.slug}/`)}>
          <span class="cat-title">{c.titleJa}</span>
          <span class="cat-meta">全{c.targetCount}問・出題比率{c.weightPercent}%</span>
        </a>
        <span class="cat-progress" data-category-progress={c.slug}></span>
      </li>
    ))}
  </ul>
</BaseLayout>

<script>
  import { loadProgress, categoryStats } from '../lib/storage';
  import { ALL_QUESTIONS } from '../data/questions';
  // 全体進捗をカテゴリごとに表示（localStorageベース）
  const p = loadProgress();
  document.querySelectorAll<HTMLElement>('[data-category-progress]').forEach((el) => {
    const slug = el.dataset.categoryProgress!;
    const ids = ALL_QUESTIONS.filter((q) => q.category === slug).map((q) => q.id);
    const s = categoryStats(p, ids);
    el.textContent = s.answered > 0 ? `進捗 ${s.answered}/${s.total}・正答率 ${Math.round(s.rate * 100)}%` : '未着手';
  });
</script>
```

> 注: `storage.ts` から `categoryStats` も re-export する必要がある。`src/lib/storage.ts` 末尾に `export { categoryStats } from './progress';` を追加すること（DRY）。

- [ ] **Step 2: ビルドと表示確認**

Run: `npm run build` → `npm run preview`
`http://localhost:4321/genai-leader-enshujo/` を開き、4カテゴリへのリンクと進捗表示を確認。
Expected: トップから各カテゴリへ遷移でき、進捗が反映される。

- [ ] **Step 3: Commit**

```
git add -A
git commit -m "feat: add top page with category links and progress

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 14: 法務・ユーティリティページ（スロット）

**Files:**
- Create: `src/pages/about.astro`, `src/pages/privacy.astro`, `src/pages/disclosure.astro`, `src/pages/contact.astro`

> **このTaskは `frontend-design` スキルで見た目を整える。** 本文はフェーズ0では最小スタブ＋「準備中」とし、フェーズ2で正式記入。

- [ ] **Step 1: 4ページを BaseLayout 利用のスタブで作成**

各ページは以下の形（`about.astro` の例。title/description/path/見出しを各ページ用に変える）:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="運営者情報" description="GenAI Leader 演習場の運営者情報。" path="/about/">
  <h1>運営者情報</h1>
  <p>本サイトは Generative AI Leader 認定の学習を支援する非公式の個人運営サイトです。詳細は準備中です。</p>
</BaseLayout>
```

- `privacy.astro`: title「プライバシーポリシー」path `/privacy/`。Cookie・アクセス解析・広告（将来のAdSense/アフィリエイト）に関する記載枠を「準備中」で用意。
- `disclosure.astro`: title「広告に関する表記」path `/disclosure/`。アフィリエイト開示の枠を「準備中」で用意。
- `contact.astro`: title「お問い合わせ」path `/contact/`。連絡手段（メール or フォーム）を「準備中」で用意。

- [ ] **Step 2: ビルド確認（全ページ生成・フッタリンクが有効）**

Run: `npm run build`
Expected: `dist/about/`, `/privacy/`, `/disclosure/`, `/contact/` が生成され、フッタの4リンクが 404 にならない。

- [ ] **Step 3: Commit**

```
git add -A
git commit -m "feat: add legal/utility page stubs (about/privacy/disclosure/contact)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 15: 最終統合・本番デプロイ・検証

**Files:** （変更なし。検証のみ）

- [ ] **Step 1: 全テストとビルドを通す**

Run: `npm test` および `npm run build`
Expected: 全テスト PASS（schema/quiz/progress/categories/dataset 整合・40問）、ビルド成功。

- [ ] **Step 2: SEO 成果物の確認**

`dist/` に対し以下を確認:
- 各カテゴリ `index.html` に `question` 本文・`intro`・`<title>`・`canonical`・`og:` 群・`application/ld+json`(Quiz) が含まれる
- `dist/sitemap-index.xml` に全ページURLが含まれる
- `dist/robots.txt` が存在

- [ ] **Step 3: push して本番デプロイ**

```
git push
gh run watch
```
Expected: Actions success。

- [ ] **Step 4: 本番URLで最終確認**

`https://Y993.github.io/genai-leader-enshujo/` を開き、トップ→各カテゴリ→クイズ即時FB→結果→進捗保持、フッタ4ページ、を確認。
Expected: 全動作 OK。

- [ ] **Step 5: Google Search Console 登録（手動・ユーザー作業）**

ユーザーに依頼: Search Console に `https://Y993.github.io/genai-leader-enshujo/` を URL プレフィックスで登録し、`sitemap-index.xml` を送信。（github.io はドメイン所有確認が HTML ファイル法で可能。手順はユーザーに案内）

- [ ] **Step 6: 完了コミット（必要なら）とフェーズ0クローズ**

Run:
```
git status
```
Expected: clean。`superpowers:finishing-a-development-branch` で完了処理を検討。

---

## Self-Review（計画著者によるスペック突合）

**スペック網羅性チェック（要件定義書 各セクション → 対応タスク）:**
- §3 情報設計/ページ構成 → Task 12（カテゴリ）, 13（トップ）, 14（法務）, 2（sitemap/robots）
- §4 問題スキーマ（category/tags/difficulty/relatedMaterials） → Task 4（schema）, 8a/8b（データ）, 11（relatedMaterials枠）
- §5 体験（即時FB・進捗・誤答再挑戦・モバイル・a11y） → Task 6, 7, 10, 12
- §6 SEO（本文焼込・meta/OGP/canonical・構造化データ・sitemap・内部リンク） → Task 2, 9, 12, 13
- §7 技術（Astro/JSON分離/Pages/Actions/JSON編集運用） → Task 1, 2, 3, 4, 8
- §8 マネタイズ枠 → Task 11（空スロット）
- §9.5 コスト ¥0/public → Task 3（public 作成）
- §10 法務スロット → Task 14
- §11 リスク（出典付与/オリジナル作問） → Task 8a 品質基準＋Task 4 `reference` 必須
- 将来拡張（横断/模試/難易度） → Task 4 で `tags`/`difficulty` を保持（データ構造で担保）

**プレースホルダ走査:** 問題本文の「残りN問を作問」は、スキーマ・完全な雛形2問・受入基準（`validateQuestions` 通過＋件数テスト＋`reference` 必須）で具体化済み。コードステップは全て実コードを記載。

**型整合:** `Question`/`CategorySlug`（schema.ts）, `Progress`/`categoryStats`（progress.ts）, `isCorrect`/`filterByCategory`/`scoreSession`（quiz.ts）, `withBase`（url.ts）は定義タスクと利用タスクで名称一致を確認済み。`storage.ts` からの `categoryStats` re-export を Task 13 で明記。

---

## 実行ハンドオフ

実行時は以下のいずれかで進める:
1. **Subagent-Driven（推奨）**: タスクごとに新しいサブエージェントを割り当て、タスク間でレビュー（`superpowers:subagent-driven-development`）
2. **Inline 実行**: 本セッションでチェックポイントを挟みながら実行（`superpowers:executing-plans`）

# GenAI Leader 演習場 — プロジェクトメモ（Claude 用）

GCP「Generative AI Leader」認定の日本語・無料 問題集サイト。静的サイト（Astro 6 + GitHub Pages）。
公開: https://y993.github.io/genai-leader-enshujo/ ／ リポジトリ: `Y993/genai-leader-enshujo`（public）

## 設計の正典
- 要件定義: `docs/2026-06-03-genai-leader-演習場-要件定義.md`
- 実装計画: `docs/2026-06-03-genai-leader-演習場-実装計画.md`

## 開発コマンド
- `npm test` … Vitest（純ロジックのテスト）
- `npm run build` … 本番ビルド。**ビルド時に Zod で全問検証**（不正データはここで停止）
- `npm run preview` … http://localhost:4321/genai-leader-enshujo/

## 重要な約束ごと
- **Node.js は 22.12 以上が必須**（Astro 6）。CI の `withastro/action` には `node-version: 22` を指定すること（外すと EBADENGINE でデプロイ失敗）。
- 問題は `src/data/questions/<category>.json`。`category` は4分野slugに一致（不一致は `validateQuestions` が停止）。`id` プレフィックスは `fund`/`gco`/`imp`/`biz`。
- `reference` は**実在する**公式URL。HTTP 200 でも中身がエラーの **soft-404 に注意**（本文確認まで行う）。
- クイズUIは `src/styles/global.css`（frontend-design 製）の体系に合わせる: 解説表示は `data-visible` 属性、選択肢は `.quiz-option__letter` 子要素、ボタンは `btn btn-primary quiz-check` 等の合成、内部リンクは `withBase()`。
- `dist/` はコミットしない。HTML 生成は `frontend-design` スキル経由（ユーザーの全体ルール）。
- マネタイズ枠と法務ページ（about/privacy/disclosure/contact）は「準備中」スタブ。フェーズ2で記入。

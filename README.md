# GenAI Leader 演習場

Google Cloud **Generative AI Leader** 認定のための、日本語・無料の練習問題集（非公式の学習サイト）。

🔗 **https://y993.github.io/genai-leader-enshujo/**

公式4分野（生成AIの基礎／Google Cloud の生成AI製品／生成AI出力を改善する手法／成功する生成AIソリューションのビジネス戦略）の練習問題を、**即時フィードバック**（その場で正誤＋日本語解説）で解けます。進捗はブラウザの localStorage に保存されます。

> 本サイトは Google / Google Cloud とは無関係の非公式サイトです。

## 技術構成

- [Astro](https://astro.build/) による静的サイト生成（**Node.js ≥ 22.12 が必要**）
- 問題は JSON データ（`src/data/questions/`）で管理し、ビルド時に [Zod](https://zod.dev/) で検証
- 採点・進捗ロジックは TypeScript の純関数 ＋ [Vitest](https://vitest.dev/) でテスト
- GitHub Pages へ GitHub Actions で自動デプロイ

## ローカル開発

```bash
npm install
npm run dev        # 開発サーバ（http://localhost:4321/genai-leader-enshujo/）
npm test           # ユニットテスト（Vitest）
npm run build      # 本番ビルド（dist/ を生成。ビルド時に全問をZod検証）
npm run preview    # ビルド結果をローカル配信
```

ベースパスは `/genai-leader-enshujo`。内部リンクは `src/lib/url.ts` の `withBase()` を使うこと。

## 問題の追加・編集

1. `src/data/questions/<category>.json` を編集
   - `<category>` = `fundamentals` / `google-cloud-offerings` / `improve-output` / `business-strategy`
2. スキーマは `src/lib/schema.ts`。`id` は `<prefix>-NNN`（`fund` / `gco` / `imp` / `biz`）
3. `reference` は**実在する公式ドキュメントURL**、`explanation` は「なぜ正解か／なぜ他が誤りか」まで記述
4. `npm test` と `npm run build` が通ることを確認（ビルド時に Zod がデータを検証し、不正なら停止）
5. `main` に push すると GitHub Actions が自動でビルド＆公開

## デプロイ

`.github/workflows/deploy.yml`（`withastro/action`、**`node-version: 22` 指定**）。`main` への push で自動デプロイされます。

## ライセンス / 注意

学習目的の個人運営サイトです。問題文・解説はオリジナル作成で、公式試験問題の転載ではありません。

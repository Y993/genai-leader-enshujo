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

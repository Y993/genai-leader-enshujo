// src/data/exams.ts
// 試験(exam)メタの正典。exam → category の構造を一元管理する。
export interface ExamCategory {
  slug: string;
  titleJa: string;
  titleEn: string;
  weightPercent: number; // 各試験内で合計100
  intro: string;
}
export interface Exam {
  id: string;
  slug: string;        // URLプレフィックス
  titleJa: string;     // 正式名
  shortJa: string;     // 短縮名（カード等）
  tagline: string;     // 一言
  description: string; // 試験トップのSEO説明
  categories: ExamCategory[];
}

const GENAI_LEADER: Exam = {
  id: 'genai-leader',
  slug: 'genai-leader',
  titleJa: 'Generative AI Leader',
  shortJa: 'GenAI Leader',
  tagline: '生成AIの基礎から Google Cloud 製品・活用戦略まで',
  description:
    'Google Cloud「Generative AI Leader」認定試験の無料・日本語練習問題集。公式4分野を即時フィードバックで演習できます。',
  categories: [
    {
      slug: 'fundamentals',
      titleJa: '生成AIの基礎',
      titleEn: 'Fundamentals of gen AI',
      weightPercent: 30,
      intro:
        '生成AIの基礎では、大規模言語モデル(LLM)や基盤モデル、トークン、埋め込みといった中核概念と、生成AIが従来の機械学習と何が違うのかを問います。この分野は試験全体の約30%を占め、用語の正確な理解が得点の土台になります。',
    },
    {
      slug: 'google-cloud-offerings',
      titleJa: 'Google Cloud の生成AI製品',
      titleEn: "Google Cloud's gen AI offerings",
      weightPercent: 35,
      intro:
        'この分野では、Vertex AI や Gemini、Model Garden、Agent Builder など、Google Cloud が提供する生成AI関連サービスの役割と使い分けを問います。試験全体の約35%と最大の比重を持ち、各製品が「何を解決するのか」を結びつけて覚えることが重要です。',
    },
    {
      slug: 'improve-output',
      titleJa: '生成AI出力を改善する手法',
      titleEn: 'Techniques to improve gen AI model output',
      weightPercent: 20,
      intro:
        'プロンプトエンジニアリング、グラウンディング、RAG(検索拡張生成)、ファインチューニングなど、LLMの限界(ハルシネーション等)を補い出力品質を高める手法を問う分野です。試験全体の約20%を占めます。',
    },
    {
      slug: 'business-strategy',
      titleJa: '成功する生成AIソリューションのビジネス戦略',
      titleEn: 'Business strategies for a successful gen AI solution',
      weightPercent: 15,
      intro:
        '責任あるAI、セキュリティ、ガバナンス、コストや導入推進など、生成AIをビジネスで安全かつ効果的に活用するためのGoogle推奨プラクティスを問う分野です。試験全体の約15%を占めます。',
    },
  ],
};

const ACE: Exam = {
  id: 'ace',
  slug: 'ace',
  titleJa: 'Associate Cloud Engineer',
  shortJa: 'ACE',
  tagline: 'Google Cloud の構築・デプロイ・運用・セキュリティ',
  description:
    'Google Cloud「Associate Cloud Engineer (ACE)」認定試験の無料・日本語練習問題集。公式5分野を即時フィードバックで演習できます。',
  categories: [
    {
      slug: 'setup-environment',
      titleJa: 'クラウド環境のセットアップ',
      titleEn: 'Setting up a cloud solution environment',
      weightPercent: 17.5,
      intro:
        'プロジェクトや課金、IAMの初期設定、Cloud SDK/gcloud CLI の準備など、Google Cloud を使い始めるための環境構築を問う分野です。（解説は作問時に拡充）',
    },
    {
      slug: 'plan-configure',
      titleJa: 'クラウドソリューションの計画と構成',
      titleEn: 'Planning and configuring a cloud solution',
      weightPercent: 17.5,
      intro:
        'コンピューティング・ストレージ・ネットワークの選定や見積もり、要件に応じたリソース構成の計画を問う分野です。（解説は作問時に拡充）',
    },
    {
      slug: 'deploy-implement',
      titleJa: 'クラウドソリューションのデプロイと実装',
      titleEn: 'Deploying and implementing a cloud solution',
      weightPercent: 25,
      intro:
        'Compute Engine・GKE・Cloud Run・App Engine などへのデプロイと、データ・ネットワークの実装を問う、比重最大の分野です。（解説は作問時に拡充）',
    },
    {
      slug: 'operate',
      titleJa: 'クラウドソリューションの運用',
      titleEn: 'Ensuring successful operation of a cloud solution',
      weightPercent: 20,
      intro:
        'リソースの監視・ロギング、スケーリング、コスト管理、リソースの管理・保守など、運用フェーズの実務を問う分野です。（解説は作問時に拡充）',
    },
    {
      slug: 'access-security',
      titleJa: 'アクセスとセキュリティの構成',
      titleEn: 'Configuring access and security',
      weightPercent: 20,
      intro:
        'IAM ロール・サービスアカウント・最小権限の原則など、アクセス制御とセキュリティの構成を問う分野です。（解説は作問時に拡充）',
    },
  ],
};

export const EXAMS: Exam[] = [GENAI_LEADER, ACE];

export function getExam(slug: string): Exam | undefined {
  return EXAMS.find((e) => e.slug === slug);
}

export function getCategory(examSlug: string, catSlug: string): ExamCategory | undefined {
  return getExam(examSlug)?.categories.find((c) => c.slug === catSlug);
}

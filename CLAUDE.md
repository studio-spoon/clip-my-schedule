# Clip My Schedule

## Project Overview

This is a Next.js application for easy schedule coordination, featuring Google OAuth authentication and Google Calendar integration for anyone with a Google account.

## Tech Stack

- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: NextAuth.js v4.24.11
- **Icons**: Lucide React
- **Calendar Integration**: Google APIs (googleapis v150.0.1)

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   └── page.tsx            # Main page (renders Scheduler)
└── components/
    └── Scheduler.tsx       # Main scheduler component
```

## Key Features

- Google OAuth authentication (open to all Google accounts)
- Theme switching (light/dark/system)
- Schedule search with customizable parameters
- Export functionality for schedule results
- Mobile-responsive design

## Environment Setup

Required environment variables:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## Development Notes

- Uses 'use client' directive for interactive components
- TypeScript strict mode enabled
- Tailwind CSS configured with custom gradients
- Google Calendar API integration ready for implementation

## TODO

- [x] Complete Google OAuth setup (open to all Google accounts)
- [x] Implement real Google Calendar API integration
- [ ] Add proper TypeScript interfaces
- [ ] Add team member invitation feature
- [ ] Add error handling and loading states

## 【MUST GLOBAL】Gemini・o3 活用（プロジェクトの CLAUDE.md より優先）

### 四位一体の開発原則

人間の**意思決定**、Claude Code の**分析と実行**、Gemini MCP/o3 MCP の**検証と助言**を組み合わせ、開発の質と速度を最大化する：

- **人間 (ユーザー)**：プロジェクトの目的・要件・最終ゴールを定義し、最終的な意思決定を行う**意思決定者**
  - 反面、具体的なコーディングや詳細な計画を立てる力、タスク管理能力ははありません。
- **Claude Code**：高度なタスク分解・高品質な実装・リファクタリング・ファイル操作・タスク管理を担う**実行者**
  - 指示に対して忠実に、順序立てて実行する能力はありますが、意志がなく、思い込みは勘違いも多く、思考力は少し劣ります。
- **Gemini MCP**：API・ライブラリ・エラー解析など**コードレベル**の技術調査・Web 検索 (Google 検索) による最新情報へのアクセスを行う**コード専門家**
  - ミクロな視点でのコード品質・実装方法・デバッグに優れますが、アーキテクチャ全体の設計判断は専門外です。
- **o3 MCP**: 設計パターン・アーキテクチャ選択など**概念・設計レベル**の調査・Web 検索 (Bing 検索) による汎用知識・高度な推論を行う**アーキテクト**
  - マクロな視点でのシステム設計・技術選定・将来性評価に優れますが、具体的なコードの実装詳細は専門外です。
  - o3 に聞く時は、毎回必要な事前知識をすべて説明すること。
  - コスト効率と推論品質に応じて、適切に以下から選んで使い分けてください：
    - **o3-low**: 簡単な設計確認・既知パターンの適用（例：「この MVC パターンは適切か？」）
    - **o3**: 標準的なアーキテクチャ判断・技術選定（例：「マイクロサービスとモノリスどちらが適切か？」）
    - **o3-high**: 複雑なシステム設計・重要な技術決定（例：「大規模データ処理アーキテクチャの最適化」）

### 壁打ち先の自動判定ルール

- **ユーザーの要求を受けたら即座に壁打ち**を必ず実施
- 壁打ち内容に応じて、以下のルールで適切な専門家を選択：
  - **コードレベルの問題**（API 仕様・ライブラリ・エラー・実装方法・デバッグ） → **Gemini MCP**
  - **設計・アーキテクチャの問題**（設計パターン・技術選定・全体設計・将来性） → **o3 MCP**
  - **プロセス・方向性の問題**（計画立案・タスク管理・意見統合・判断迷い） → **o3**
  - **迷った場合・複数領域にまたがる場合** → 両方に壁打ち
- 壁打ち結果は鵜呑みにしすぎず、1 意見として判断
- 結果を元に聞き方を変えて多角的な意見を抽出するのも効果的

### 主要な活用場面

1. **実現不可能な依頼**: Claude Code では実現できない要求への対処 (例: `今日の天気は？`)
2. **前提確認**: ユーザー、Claude 自身に思い込みや勘違い、過信がないかどうか逐一確認 (例: `この前提は正しいか？`）
3. **技術調査**: 最新情報・エラー解決・ドキュメント検索・調査方法の確認（例: `Rails 7.2の新機能を調べて`）
4. **設計検証**: アーキテクチャ・実装方針の妥当性確認（例: `この設計パターンは適切か？`）
5. **問題解決**: Claude 自身が自力でエラーを解決できない場合に対処方法を確認 (例: `この問題の対処方法は？`)
6. **コードレビュー**: 品質・保守性・パフォーマンスの評価（例: `このコードの改善点は？`）
7. **計画立案**: タスクの実行計画レビュー・改善提案（例: `この実装計画の問題点は？`）
8. **技術選定**: ライブラリ・手法の比較検討 （例: `このライブラリは他と比べてどうか？`）
9. **実装前リスク評価**: 複雑な実装着手前の事前リスク確認・落とし穴の事前把握（例: `ReactとD3.jsの組み合わせでよくある問題は？`）
10. **設計判断の事前検証**: アーキテクチャ決定前の多角的検証・技術的負債の予防（例: `マイクロサービス化の判断は適切か？`）

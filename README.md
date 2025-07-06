# Time Clipper

## 概要

Googleカレンダー連携による、空き時間候補リスト作成アプリです。
自分自身のみならず、チームメンバーの空き時間を素早く検索・共有し、効率的な会議設定をサポートします。

## 主な機能

- 🔐 **Google OAuth 認証** - 誰でも利用可能な Google アカウントログイン
- 📅 **スケジュール検索** - 複数メンバーの空き時間を一括検索
- 🎨 **テーマ切り替え** - ライト/ダーク/システム連動
- 📱 **レスポンシブデザイン** - PC・スマホ対応
- 📋 **結果エクスポート** - 検索結果をテキストでコピー
- ⚙️ **カスタム設定** - 時間帯・所要時間・バッファ時間の調整

## 技術スタック

- **フレームワーク**: Next.js 15.3.5 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **認証**: NextAuth.js v4.24.11
- **アイコン**: Lucide React
- **カレンダー連携**: Google APIs

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下を設定してください：

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 3. Google OAuth 設定

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. **APIs & Services > Credentials**で OAuth 2.0 クライアント ID を作成
3. 承認済みリダイレクト URI に追加：
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# リント実行
npm run lint
```

## 使用方法

1. **ログイン**: Google アカウントでログイン
2. **参加者選択**: 空き時間を確認したいメンバーを選択
3. **条件設定**: 開催時期・時間帯・所要時間を設定
4. **検索実行**: 空き時間を検索ボタンをクリック
5. **結果確認**: 検索結果をテキストでコピーして共有

## プロジェクト構成

```
src/
├── app/
│   ├── layout.tsx          # ルートレイアウト・メタデータ
│   └── page.tsx            # メインページ
└── components/
    └── Scheduler.tsx       # スケジューラーコンポーネント
```

## 開発ガイド

- **Client Component**: インタラクティブな機能は`'use client'`必須
- **TypeScript**: 厳格モードで型安全性を確保
- **Tailwind CSS**: グラデーションとダークモード対応
- **レスポンシブ**: モバイルファースト設計

## TODO

- [ ] Google OAuth 認証の完全実装
- [ ] Google Calendar API 連携
- [ ] TypeScript インターフェース改善
- [ ] ドメイン制限の実装
- [ ] エラーハンドリング強化
- [ ] ローディング状態の改善

## サポート

開発に関する質問やバグ報告は、プロジェクトの Issues ページまでお願いします。

---

© 2025 [STUDIO SPOON](https://studio-spoon.co.jp/). All rights reserved.

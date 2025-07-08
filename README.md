# Time Clipper

**Google カレンダーの空き時間をパッと把握するアプリ**

Google カレンダー連携で自分とチームの空き時間をサッと把握。メールやりとりにおける会議設定に活用できるプレーンテキストコピーで、打ち合わせ調整を効率化する WEB アプリです

[🚀 **公開サイト**](https://time-clipper.netlify.app/) • [💡 **すぐに使う**](https://time-clipper.netlify.app/app/)

---

## ✨ 機能

**🔐 Google OAuth 認証**
任意の Google アカウントでセキュアにログイン

**📅 スマートスケジュール検索**
複数のチームメンバーの空き時間を複合検索

**🎨 美しいインターフェース**
ライト/ダークモード対応のクリーンでレスポンシブなデザイン

**📋 結果のエクスポート**
空き時間をワンクリックでコピー・共有

**⚙️ 柔軟な設定**
時間範囲、期間、バッファ時間をカスタマイズ可能

---

## 🚀 クイックスタート

### 公開環境

[time-clipper.netlify.app](https://time-clipper.netlify.app/)で今すぐお試しください。

### 開発環境

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

`.env.local`を設定:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

---

## 🛠️ 技術スタック

- **Next.js 15** - App Router
- **TypeScript**
- **Tailwind CSS**
- **NextAuth.js** - 認証機能
- **Google APIs** - カレンダー連携

---

## 💡 使い方

1. **サインイン** - Google アカウントでログイン
2. **選択** - 必要に応じて含めるチームメンバーを選択
3. **設定** - 希望の時間範囲と期間を設定
4. **取得** - 空き時間を瞬時に表示
5. **共有** - 結果をチームと共有

---

## 🤝 貢献

❤️ [STUDIO SPOON](https://studio-spoon.co.jp/) によって制作

質問やフィードバックは、issue を開くかチームまでお気軽にお声かけください。

---

_会議調整をシンプルに。_

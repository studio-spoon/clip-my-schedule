# Time Clipper

**完璧な会議時間を見つけるスマートな方法**

Google Calendar連携でスケジュール調整を簡単に。チームの空き時間を数秒で発見できます。

[🚀 **今すぐ試す**](https://time-clipper.netlify.app/) • [💡 **詳細を見る**](#features)

---

## ✨ 機能

**🔐 Google OAuth認証**  
任意のGoogleアカウントでセキュアにログイン

**📅 スマートスケジュール検索**  
複数のチームメンバーの空き時間を瞬時に発見

**🎨 美しいインターフェース**  
ライト/ダークモード対応のクリーンでレスポンシブなデザイン

**📋 結果のエクスポート**  
空き時間をワンクリックでコピー・共有

**⚙️ 柔軟な設定**  
時間範囲、期間、バッファー時間をカスタマイズ可能

---

## 🚀 クイックスタート

### ライブデモ
[time-clipper.netlify.app](https://time-clipper.netlify.app/)で今すぐお試しください。

### ローカル開発

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

- **Next.js 15** - App Router対応のReactフレームワーク
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - モダンなスタイリング
- **NextAuth.js** - 認証機能
- **Google APIs** - カレンダー連携

---

## 💡 使い方

1. **サインイン** - Googleアカウントでログイン
2. **選択** - 含めるチームメンバーを選択
3. **設定** - 希望の時間範囲と期間を設定
4. **取得** - 空き時間を瞬時に表示
5. **共有** - 結果をチームと共有

---

## 🤝 貢献

❤️ [STUDIO SPOON](https://studio-spoon.co.jp/) によって制作

質問やフィードバックは、issueを開くかチームまでお気軽にお声かけください。

---

*会議調整をシンプルに、一つずつスケジュールを整理します。*
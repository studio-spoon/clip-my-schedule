# テーマシステム設計ドキュメント

## 概要

Time Clipperのテーマシステムは、ライトテーマとダークテーマを柔軟に切り替えられる構造的で効率的な設計となっています。

## アーキテクチャ

### 1. CSSカスタムプロパティ

**ファイル:** `src/app/globals.css`

```css
/* Light Theme */
.light-theme {
  /* Basic Colors */
  --primary: #3b82f6;
  --background: #ffffff;
  --foreground: #0f172a;
  
  /* Prose & Content Colors */
  --prose-headings: #111827;
  --prose-body: #374151;
  --prose-border: #e5e7eb;
  
  /* Form Controls */
  --form-color-scheme: light;
  --form-icon-filter: invert(0.8);
  
  /* ... その他のカラー定義 */
}

/* Dark Theme */
.dark-theme {
  /* Basic Colors */
  --primary: #3b82f6;
  --background: #111827;
  --foreground: #f9fafb;
  
  /* Prose & Content Colors */
  --prose-headings: #f9fafb;
  --prose-body: #d1d5db;
  --prose-border: #374151;
  
  /* Form Controls */
  --form-color-scheme: dark;
  --form-icon-filter: invert(0.2);
  
  /* ... その他のカラー定義 */
}
```

### 2. テーマフック

**ファイル:** `src/hooks/useTheme.ts`

```typescript
export function useTheme(defaultTheme: Theme = 'light'): UseThemeReturn {
  // テーマの管理とlocalStorageへの永続化
  // bodyクラスの動的切り替え
}
```

### 3. テーマコンテキスト

**ファイル:** `src/contexts/ThemeProvider.tsx`

```typescript
export function ThemeProvider({ children, defaultTheme = 'light' }) {
  // グローバルなテーマ状態の管理
}

export function useThemeContext() {
  // テーマコンテキストへのアクセス
}
```

## 使用方法

### 基本的な使い方

#### 1. 個別コンポーネントでのテーマ適用

```typescript
import { useTheme } from '@/hooks/useTheme'

function MyComponent() {
  const { applyTheme } = useTheme('light')
  
  useEffect(() => {
    applyTheme('dark') // 強制的にダークテーマを適用
  }, [])
}
```

#### 2. テーマ切り替えボタン

```typescript
import ThemeToggle from '@/components/ThemeToggle'

function Header() {
  return (
    <header>
      <ThemeToggle />
    </header>
  )
}
```

#### 3. テーマを強制する高次コンポーネント

```typescript
import { LightThemeComponent, DarkThemeComponent } from '@/components/ThemeAwareComponent'

function App() {
  return (
    <div>
      <LightThemeComponent>
        <LandingPage />
      </LightThemeComponent>
      
      <DarkThemeComponent>
        <AppInterface />
      </DarkThemeComponent>
    </div>
  )
}
```

### 高度な使い方

#### 1. カスタムテーマプロバイダー

```typescript
import { ThemeProvider } from '@/contexts/ThemeProvider'

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <MyApp />
    </ThemeProvider>
  )
}
```

#### 2. テーマに応じた条件付きレンダリング

```typescript
import { useThemeContext } from '@/contexts/ThemeProvider'

function ConditionalComponent() {
  const { theme } = useThemeContext()
  
  return (
    <div>
      {theme === 'light' ? <LightIcon /> : <DarkIcon />}
    </div>
  )
}
```

## カラーパレット

### 共通カラー

- **Primary:** `#3b82f6` (ブルー)
- **Accent:** `#8b5cf6` (パープル)
- **Success:** `#10b981` (グリーン)
- **Warning:** `#f59e0b` (オレンジ)
- **Error:** `#ef4444` (レッド)
- **Info:** `#06b6d4` (シアン)

### ライトテーマ

- **Background:** `#ffffff`
- **Foreground:** `#0f172a`
- **Card:** `#ffffff`
- **Border:** `#e2e8f0`
- **Muted:** `#f8fafc`

### ダークテーマ

- **Background:** `#111827`
- **Foreground:** `#f9fafb`
- **Card:** `#1f2937`
- **Border:** `#4b5563`
- **Muted:** `#374151`

## ユーティリティクラス

**ファイル:** `src/styles/theme-utils.css`

```css
.btn-primary { /* プライマリボタン */ }
.card { /* カードコンポーネント */ }
.input { /* 入力フィールド */ }
.text-muted { /* ミュートテキスト */ }
.gradient-primary { /* プライマリグラデーション */ }
```

## コンポーネント例

### 現在の実装

1. **LandingPage**: デフォルトでライトテーマ
2. **Scheduler**: デフォルトでダークテーマ
3. **ThemeToggle**: テーマ切り替えボタン

### テーマ切り替えの実装例

```typescript
// ヘッダーにテーマ切り替えボタンを追加
function AppHeader() {
  return (
    <header>
      <div>アプリ名</div>
      <ThemeToggle />
    </header>
  )
}
```

## 特徴

### ✅ 実装済み機能

- [x] ライト/ダークテーマの定義
- [x] カスタムプロパティによる一元管理
- [x] フック・コンテキストによる状態管理
- [x] localStorageによる設定永続化
- [x] 滑らかなテーマ切り替えアニメーション
- [x] コンポーネント単位でのテーマ強制適用
- [x] 高次コンポーネントによるテーマラッピング

### 🔄 拡張可能性

- [ ] システムテーマの自動検出
- [ ] 追加カラーテーマの定義
- [ ] テーマプリセット機能
- [ ] CSS-in-JSライブラリとの統合

## 設計状況レポート

### ✅ 完了済み

1. **カスタムプロパティの完全定義**
   - light-theme と dark-theme の完全相互補完
   - prose要素専用変数の追加（--prose-headings, --prose-body, --prose-border）
   - フォーム要素専用変数の追加（--form-color-scheme, --form-icon-filter）

2. **ハードコード色の解決**
   - globals.css内の10個のハードコード色をカスタムプロパティに変換
   - レガシーテーマシステムの整理（.dark と @theme inline）
   - フォーム要素のテーマ対応完了

3. **テーマシステムの統合**
   - useTheme フックによる統一管理
   - ThemeProvider コンテキストでのグローバル状態
   - ThemeToggle コンポーネントでのUI切り替え

### ⚠️ 要対応（コンポーネントレベル）

現在、以下のコンポーネントでハードコードされたTailwindクラスが残存：

1. **LandingPage.tsx** - 105個（最優先）
2. **MyPage.tsx** - 64個（高優先）
3. **MemberSelection.tsx** - 38個（高優先）
4. **ScheduleForm.tsx** - 30個（中優先）
5. **その他14ファイル** - 合計128個

これらは段階的に新しいカスタムプロパティベースのスタイリングに移行する必要があります。

## 注意事項

1. **パフォーマンス**: テーマ切り替え時のレンダリング最適化のため、必要に応じてReact.memoを使用
2. **アクセシビリティ**: ハイコントラストモードの対応を検討
3. **互換性**: 古いブラウザでのカスタムプロパティ対応確認が必要
4. **段階的移行**: コンポーネントのハードコード色は優先度に基づいて段階的に更新
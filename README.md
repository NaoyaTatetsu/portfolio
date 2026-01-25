# Portfolio Website

個人ポートフォリオサイトです。Next.jsを使用して構築されており、多言語対応（日本語・英語）とダークモード対応を備えています。

## 技術スタック

- **Framework**: [Next.js](https://nextjs.org/) 16.0.1 (App Router)
- **Language**: TypeScript 5
- **Runtime**: React 19.2.0
- **Styling**: Tailwind CSS 4
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/) 4.5.0
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) 0.4.6
- **Icons**: [react-icons](https://react-icons.github.io/react-icons/) 5.5.0
- **Linting/Formatting**: [Biome](https://biomejs.dev/) 2.3.4
- **React Compiler**: babel-plugin-react-compiler 1.0.0

## 機能

- 🌐 多言語対応（日本語・英語）
- 🌓 ダークモード対応
- 📱 レスポンシブデザイン
- 📝 ブログ機能
- 📰 お知らせ機能
- 👤 プロフィールページ
- 🏢 履歴書ページ
- 📧 お問い合わせページ

## セットアップ

### 必要な環境

- Node.js 24.7.0（[mise](https://mise.jdx.dev/)を使用して自動インストール可能）
- pnpm 10.14.0（推奨）

### インストール

1. リポジトリをクローン

```bash
git clone <repository-url>
cd portfolio
```

2. 依存関係をインストール

```bash
pnpm install
```

3. 開発サーバーを起動

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認できます。

## 開発コマンド

```bash
# 開発サーバーを起動
pnpm dev

# プロダクションビルド
pnpm build

# プロダクションサーバーを起動
pnpm start

# リントチェック
pnpm lint

# リントチェックと自動修正
pnpm lint:fix

# コードフォーマット
pnpm format
```

## プロジェクト構造

```
portfolio/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # 多言語対応のルーティング
│   │   │   ├── blog/          # ブログページ
│   │   │   ├── contact/       # お問い合わせページ
│   │   │   ├── experience/    # 履歴書ページ
│   │   │   ├── news/          # お知らせページ
│   │   │   ├── profile/       # プロフィールページ
│   │   │   └── page.tsx       # ホームページ
│   │   ├── layout.tsx         # ルートレイアウト
│   │   └── globals.css        # グローバルスタイル
│   ├── components/            # 再利用可能なコンポーネント
│   │   ├── Header.tsx         # ヘッダーコンポーネント
│   │   ├── Footer.tsx         # フッターコンポーネント
│   │   ├── ThemeProvider.tsx  # テーマプロバイダー
│   │   └── TypingText.tsx     # タイピングアニメーションコンポーネント
│   ├── i18n/                  # 国際化設定
│   │   ├── request.ts        # i18nリクエスト設定
│   │   └── routing.ts        # ルーティング設定
│   └── proxy.ts               # Next.jsプロキシ（旧middleware）
├── messages/                  # 翻訳ファイル
│   ├── en.json               # 英語翻訳
│   └── ja.json               # 日本語翻訳
├── public/                    # 静的ファイル
├── next.config.ts            # Next.js設定
├── biome.json                # Biome設定
├── mise.toml                 # mise設定（Node.jsバージョン管理）
└── package.json              # 依存関係とスクリプト
```

## 多言語対応

このプロジェクトは `next-intl` を使用して多言語対応を実装しています。

- 対応言語: 日本語（`ja`）、英語（`en`）
- 翻訳ファイル: `messages/ja.json`、`messages/en.json`
- URL構造: `/{locale}/...`（例: `/ja/profile`、`/en/profile`）

新しい翻訳キーを追加する場合は、`messages/ja.json` と `messages/en.json` の両方に追加してください。

# ポートフォリオサイト

個人ポートフォリオサイトです。Astro を使用して構築されており、多言語対応（日本語・英語）とダークモード対応を備えています。**クライアント JS はゼロバンドル**で、テーマ切替とアニメーション用のインラインスクリプト数 KB のみを配信します。

## 技術スタック

- **Framework**: [Astro](https://astro.build/) 7（静的出力）
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4（`@tailwindcss/vite` 経由）
- **Internationalization**: `src/pages/[locale]/` の動的ルート + `getStaticPaths()`
- **Content**: Astro Content Collections（`glob` ローダー）
- **Icons**: [astro-icon](https://www.astroicon.dev/) + Iconify（`heroicons`, `fa6-brands`）。ビルド時にインライン展開
- **Fonts**: [Fontsource](https://fontsource.org/) Geist / Geist Mono（self-host）
- **Linting/Formatting**: [Biome](https://biomejs.dev/) 2.4.16
- **Hosting**: Vercel（静的配信）

## 機能

- 🌐 多言語対応（日本語・英語）
- 🌓 ダークモード対応（読み込み時のちらつきなし）
- 📱 レスポンシブデザイン
- 📝 ブログ機能
- 👤 プロフィールページ
- 🏢 履歴書ページ
- ⚡ クライアント JS バンドルゼロ

## パフォーマンス

Lighthouse / PageSpeed Insights 向けに最適化しています:

- **レンダリングブロッキング CSS なし** — 全 CSS を各ページの `<head>` にインライン化（`astro.config.mjs` の `build.inlineStylesheets: "always"`）
- **フォントの preload** — Geist / Geist Mono を使うページだけが、必要なサブセットのみを `Base.astro` の `head` スロット経由で preload（HTML → CSS → フォントのリクエストチェーンを回避）
- **アセット最適化** — 背景のノイズテクスチャはパレット PNG（約 15KB）、トップページのアイコンは表示サイズに合わせた WebP（約 14KB）
- **SEO** — 全ページにロケール別の `<meta name="description">` を出力（`messages/` の `site.description`）

## セットアップ

### 必要な環境

- Node.js 24.7.0（[mise](https://mise.jdx.dev/)を使用して自動インストール可能）
- pnpm 10.14.0（必須。npm/yarn は `engines` でブロック済み）

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

ブラウザで [http://localhost:4321](http://localhost:4321) を開いて確認できます。

## 開発コマンド

```bash
# 開発サーバーを起動
pnpm dev

# 型チェック + プロダクションビルド（dist/ に出力）
pnpm build

# ビルド済みの dist/ をローカル配信
pnpm preview

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
│   ├── pages/
│   │   ├── [locale]/           # 多言語対応のルーティング（getStaticPaths）
│   │   │   ├── blog/
│   │   │   │   ├── index.astro # ブログ一覧
│   │   │   │   └── [slug].astro# ブログ詳細
│   │   │   ├── experience.astro# 履歴書ページ
│   │   │   ├── profile.astro   # プロフィールページ
│   │   │   └── index.astro     # ホームページ
│   │   └── 404.astro
│   ├── layouts/
│   │   └── Base.astro          # html/head/body、テーマスクリプト、head スロット、Header、Footer
│   ├── components/
│   │   ├── Header.astro        # ナビ、テーマ切替、言語切替
│   │   ├── Footer.astro
│   │   ├── Tilt.astro          # 3D ホバーエフェクト
│   │   ├── TypingText.astro    # タイピングアニメーション
│   │   └── AboutCard.astro
│   ├── i18n/
│   │   └── ui.ts               # ロケール定義、型付き文言、ヘルパー
│   ├── styles/
│   │   └── global.css          # Tailwind エントリ + カスタム CSS
│   └── content.config.ts       # ブログのコンテンツコレクション
├── content/blog/{locale}/{year}/{slug}.md
├── messages/                   # 翻訳ファイル
│   ├── en.json                 # 英語翻訳
│   └── ja.json                 # 日本語翻訳
├── public/                     # 静的ファイル
├── astro.config.mjs
├── vercel.json                 # ルートリダイレクト + セキュリティヘッダー
├── biome.json                  # Biome設定
├── mise.toml                   # mise設定（Node.jsバージョン管理）
└── package.json                # 依存関係とスクリプト
```

## 多言語対応

- 対応言語: 日本語（`ja`）、英語（`en`）
- 翻訳ファイル: `messages/ja.json`、`messages/en.json`
- URL構造: `/{locale}/...`（例: `/ja/profile`、`/en/profile`）
- `/` は `vercel.json` の設定で `/en` にリダイレクトされます

新しい翻訳キーを追加する場合は、`messages/ja.json` と `messages/en.json` の両方に追加し、`src/i18n/ui.ts` の `Messages` インターフェースも更新してください。

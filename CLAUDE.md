# CLAUDE.md

個人ポートフォリオサイト。Next.js 16 (App Router) + React 19 + TypeScript。日英2言語対応・ダークモード対応。Vercel にデプロイ。

## コマンド

パッケージマネージャーは **pnpm 固定**(engines で npm/yarn をブロック済み)。Node 24 / pnpm は mise で管理(`mise.toml`)。

```bash
pnpm dev          # 開発サーバー起動(ユーザーに確認してから起動すること)
pnpm build        # 本番ビルド
pnpm lint         # Biome チェック(ESLint/Prettier は不使用)
pnpm lint:fix     # Biome 自動修正
pnpm format       # Biome フォーマット
```

テストフレームワークは導入していない。動作確認はビルドとブラウザで行う。

## Git 運用

- ベースブランチは `develop`。PR は `develop` に向ける
- 作業は `update/*` `fix/*` などのトピックブランチで行う

## アーキテクチャ

### ルーティング / i18n(next-intl)

- ロケールは `en` / `ja`(`src/i18n/routing.ts`)。URL は常にプレフィックス付き(`/en/...`, `/ja/...`)、自動検出は無効
- ミドルウェアは `src/proxy.ts`(Next.js 16 では `middleware.ts` ではなく `proxy.ts`)
- UI 文言は `messages/{en,ja}.json`。ページからは `getTranslations()` で参照。配列データ(profile の項目や experience のタイムライン)は `t.raw()` で取得する
- 全ページが `src/app/[locale]/` 配下。静的生成のため各動的ルートで `generateStaticParams()` を定義

### レイアウト構造

- `src/app/layout.tsx`(ルート): `<html>`/`<body>` と ThemeProvider。next-themes がインライン script を挿入するため、言語切替で再レンダリングされる `[locale]` セグメントの**外**に置く必要がある
- `src/app/[locale]/layout.tsx`: Header / Footer と `<main>`。Header は `fixed` で高さ 64px(`h-16`)のため、main に `pt-16` を確保している。各ページはさらに独自の `pt-*` を持つ

### テーマ(next-themes)

- `.dark` クラスが `<html>` に付与される。Tailwind の `dark:` バリアントは `globals.css` の `@custom-variant dark` で連動
- 色は `globals.css` の CSS 変数 `--background` / `--foreground` で定義(ライト `#ffffff` / ダーク `#18181b` = zinc-900)

### スタイリング(Tailwind CSS v4)

- 設定ファイルなし。`src/app/globals.css` の `@theme inline` で定義する CSS-first 構成
- 背景は `body` に `public/noise.png`(400x400)を 200px でタイル表示するノイズテクスチャ。ライト/ダークとも同じ画像で、背景色だけ切り替わる
- Biome の CSS リントで `@theme` 等の未知 at-rule 警告は無効化済み

### ブログ

- 記事は `content/blog/{locale}/{year}/{slug}.md`。slug は日付形式(例 `20250901`)で、先頭4桁を年ディレクトリとして解決する(`src/lib/blog.ts`)
- gray-matter で frontmatter(title / date / excerpt)、remark + remark-gfm で HTML 化。ビルド時に静的生成

## 注意点

- **コードを実装・変更した後は必ず `pnpm lint` を実行し、エラー・警告が無くなるまで修正する**(まず `pnpm lint:fix` で自動修正し、残りは手で直す)
- 開発サーバーは勝手に起動しない(ユーザーが自分の端末で管理している)。起動が必要なら先に確認する
- `next dev` は Turbopack の永続キャッシュ(`.next/dev`)が稀に古い CSS を配信し続けることがある。コード変更が反映されない場合は `.next` を削除して再起動する
- React Compiler 有効(`next.config.ts` の `reactCompiler: true`)。手動の `useMemo`/`useCallback` は基本不要

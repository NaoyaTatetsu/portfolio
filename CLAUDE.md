# CLAUDE.md

個人ポートフォリオサイト。Astro 7 + TypeScript。日英2言語対応・ダークモード対応。Cloudflare Workers に静的配信(https://p-jihyo.jp)。

**クライアント JS はゼロバンドル**(React なし)。インタラクティブな箇所だけ Astro コンポーネント内の `<script>` にバニラ JS で書く。これは移行時の主目的なので、React やその他 UI フレームワークを持ち込まないこと。

## コマンド

パッケージマネージャーは **pnpm 固定**(engines で npm/yarn をブロック済み)。Node 24 / pnpm は mise で管理(`mise.toml`)。

```bash
pnpm dev          # 開発サーバー起動(ユーザーに確認してから起動すること)
pnpm build        # astro check + 本番ビルド(dist/ に出力)
pnpm preview      # ビルド済み dist/ をローカル配信
pnpm lint         # Biome チェック(ESLint/Prettier は不使用)
pnpm lint:fix     # Biome 自動修正
pnpm format       # Biome フォーマット
pnpm test:e2e     # Playwright E2E テスト(ビルド + preview を自動起動)
```

E2E テストは Playwright(`e2e/`)。ビルド済み `dist/` を `astro preview` のポート **4322**(開発サーバーと衝突しない)で配信してテストする。ユニットテストは導入していない。

CI では `lint-and-build` と独立した `e2e` ジョブで回す。ビルドは `playwright.config.ts` の `webServer` が自前で行うのでワークフロー側では走らせない。どちらも develop の ruleset で必須チェックにしている。

## Git 運用

- ベースブランチは `develop`。PR は `develop` に向ける
- 作業は `update/*` `fix/*` などのトピックブランチで行う

### 依存更新(Renovate)

- Dependabot は廃止。Mend の Renovate GitHub App が `renovate.json5` を読んで PR を起票する(npm + GitHub Actions + mise)。起票のスケジュール窓は設けず、量は `config:recommended` の `prHourlyLimit: 2` / `prConcurrentLimit: 10` で抑える
- patch / minor / digest は CI(`lint-and-build` と `e2e`)が全て green になった時点で Renovate が自動マージする。major はラベル `major` が付き、必ず人がレビューする
- 自動マージは GitHub ネイティブの auto-merge ではなく Renovate 自身が行う(`platformAutomerge: false`)。develop の ruleset は Renovate App を bypass actor(`pull_request` モード)に含めており、レビュー必須ルールをすり抜けられるため、ネイティブ auto-merge だと CI 完了前にマージされうる
- Node / pnpm のバージョンは `mise.toml` / `package.json` の `engines`・`packageManager` / 各ワークフローの `node-version`・pnpm `version` に分散している。Renovate はこれらを `Node.js` / `pnpm` グループとして**1つの PR にまとめて**上げるので、全箇所が同時に動く。バージョンを増やす場所を追加したときは、Renovate が拾えているか(mise マネージャの対象か等)を確認する

## アーキテクチャ

### ルーティング / i18n

- ロケールは `en` / `ja`(`src/i18n/ui.ts`)。URL は常にプレフィックス付き(`/en/...`, `/ja/...`)、自動検出は無効
- Astro 組み込みの i18n 機能(フォルダ分割)は使わず、`src/pages/[locale]/` の動的ルート + 各ページの `getStaticPaths()`(`localeParams()`)で解決する。ページファイルをロケールごとに複製せずに済み、ミドルウェア不要で静的出力のみに収まる
- UI 文言は `messages/{en,ja}.json`。`getMessages(locale)` で型付きオブジェクトとして取得する(`src/i18n/ui.ts` の `Messages` インターフェースが唯一の型定義。JSON にキーを足したらここも更新する)
- ルート `/` → `/en` のリダイレクトは `public/_redirects` の 308(Cloudflare のエッジが返す)。`astro.config.mjs` に `redirects` を書いてはいけない。静的出力では meta refresh の `dist/index.html` が生成され、静的アセットが `_redirects` より優先されてしまう
- セキュリティヘッダーは `public/_headers`。`www` → apex のリダイレクトは Cloudflare の Redirect Rule(リポジトリ外)

### レイアウト

- `src/layouts/Base.astro` が `<html>`/`<head>`/`<body>` と Header / `<main>` / Footer を持つ。全ページがこれを使う
- Header は `fixed` で高さ 64px(`h-16`)のため、`<main>` に `pt-16` を確保している。各ページはさらに独自の `pt-*` を持つ

### テーマ

- `.dark` / `.light` クラスが `<html>` に付く。Tailwind の `dark:` バリアントは `global.css` の `@custom-variant dark` で連動
- `Base.astro` の `<head>` にある `is:inline` スクリプトが初回ペイント前に同期実行してクラスを確定させる。**これを外したり非同期にしたりするとダークモードで白フラッシュが出る**
- localStorage のキーは `"theme"`(値は `"light"` / `"dark"`)。next-themes 時代と同じキーなので既存訪問者の設定を引き継げる。変更しないこと
- 既定はダーク。OS 設定への追従は無効(旧 `enableSystem={false}` 相当)
- 切替ロジックは `Header.astro` の `<script>`。切替中だけ `transition:none` を差し込んでいる(旧 `disableTransitionOnChange` 相当)
- 言語切替は `<a>` によるフルナビゲーション。SPA 的に差し替えるとテーマクラスの再適用が1フレーム遅れて白が描画されるため、この形を維持すること
- 色は `global.css` の CSS 変数 `--background` / `--foreground` で定義(ライト `#ffffff` / ダーク `#18181b` = zinc-900)

### スタイリング(Tailwind CSS v4)

- 設定ファイルなし。`src/styles/global.css` の `@theme inline` で定義する CSS-first 構成。Vite プラグイン(`@tailwindcss/vite`)経由で読み込む
- `body` の既定フォントは Arial のまま。`font-sans` / `font-mono` を当てた箇所だけ Geist になる(Fontsource で self-host)
- 背景は `body` に `public/noise.png`(400x400)を 200px でタイル表示するノイズテクスチャ。ライト/ダークとも同じ画像で、背景色だけ切り替わる

### アイコン

- `astro-icon` + `@iconify-json/heroicons` / `@iconify-json/fa6-brands`。ビルド時に SVG としてインライン展開されるのでランタイム JS はゼロ
- 使い方: `<Icon name="heroicons:home" class="w-5 h-5" />`

### ブログ

- 記事は `content/blog/{locale}/{year}/{slug}.md`。frontmatter は title / date / excerpt
- Astro Content Collections の `glob` ローダーで読む(`src/content.config.ts`)。生成される id は `en/2025/20250901` の形なので、先頭のロケールで絞り込み、末尾を slug として扱う
- スキーマの `z` は `astro:content` からではなく `zod` から直接 import する(前者は Astro 7 で非推奨)
- Markdown → HTML は Astro 組み込み(GFM は既定で有効)

## 注意点

- **コードを実装・変更した後は必ず `pnpm lint` と `pnpm build` を実行し、エラー・警告が無くなるまで修正する**(まず `pnpm lint:fix` で自動修正し、残りは手で直す)。`pnpm build` は `astro check` を含むので型チェックも兼ねる
- Biome は `.astro` のテンプレート部分を解析しないため、フロントマターの変数が「未使用」に誤検知される。`biome.json` の overrides で `.astro` のみ `noUnusedVariables` / `noUnusedImports` を無効化している。`.astro` の型チェックは `astro check` が担当する
- 開発サーバーは勝手に起動しない(ユーザーが自分の端末で管理している)。起動が必要なら先に確認する
- 静的ホスティングのため 404 は `src/pages/404.astro` の1枚のみ。ロケール別の出し分けはできず既定ロケール(en)で表示される
- `/{locale}/contact` はページ未作成のため意図的に 404 する(トップからのリンクは残してある)

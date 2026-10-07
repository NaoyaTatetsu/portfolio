// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";

// i18n は Astro 組み込みのフォルダ分割ではなく src/pages/[locale]/ の
// 動的ルート + getStaticPaths() で扱う。ページファイルをロケールごとに
// 複製せずに済み、静的出力のみで完結する（ミドルウェア不要）。
export default defineConfig({
  // ルート / から /en へのリダイレクトは public/_redirects で定義する
  // （Cloudflare Workers がエッジで 308 を返す）。
  // ここに redirects を書くと静的出力では meta refresh の HTML
  // （dist/index.html）が生成され、静的アセットが _redirects の
  // ルールより優先されて 200 + meta refresh が返ってしまうため書かない。
  // アイコンはビルド時に SVG としてインライン展開される（クライアント JS ゼロ）
  // Expressive Code: コードブロックにファイル名（```toml title="x.toml"）を出す。
  // テーマはサイトと同じく <html> の .dark / .light クラスで切り替え、OS 設定には追従しない
  integrations: [
    icon(),
    expressiveCode({
      themes: ["github-dark", "github-light"],
      themeCssSelector: (theme) => `.${theme.type}`,
      useDarkModeMediaQuery: false,
      // build.inlineStylesheets と同じ理由で、外部 CSS ファイルにせず <style> で埋め込む
      emitExternalStylesheet: false,
      // 記事本文（16px 固定）に合わせて Zenn と同じ実寸にする
      styleOverrides: {
        codeFontSize: "14.4px",
        uiFontSize: "13px",
      },
    }),
  ],
  build: {
    // CSS を外部ファイルにせず各ページの <head> に <style> として埋め込む。
    // 既定の "auto" では約 4KB 超の CSS が外部ファイルになり、
    // レンダリングブロッキングとして LCP/FCP を遅らせるため（PageSpeed Insights 指摘）
    inlineStylesheets: "always",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

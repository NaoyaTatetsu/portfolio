// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
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
  integrations: [icon()],
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

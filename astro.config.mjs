// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import icon from "astro-icon";

// i18n は Astro 組み込みのフォルダ分割ではなく src/pages/[locale]/ の
// 動的ルート + getStaticPaths() で扱う。ページファイルをロケールごとに
// 複製せずに済み、静的出力のみで完結する（ミドルウェア不要）。
export default defineConfig({
  // ルート / は vercel.json の 308 リダイレクトで /en に送る。
  // ここでの redirects は astro preview / 他ホスト向けのフォールバック
  // （静的出力では meta refresh の HTML が生成される）。
  redirects: {
    "/": "/en",
  },
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

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typescript: {
    // TypeScript 7 (ネイティブ実装) は従来の JS コンパイラ API を提供しないため、
    // Next.js 内蔵の型チェックが動作しない。型チェックは `tsc --noEmit` で別途行う。
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
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
  async redirects() {
    return [
      {
        source: "/:locale(en|ja)/profile",
        destination: "/:locale",
        permanent: false,
      },
      {
        source: "/:locale(en|ja)/news",
        destination: "/:locale",
        permanent: false,
      },
      {
        source: "/:locale(en|ja)/news/:id",
        destination: "/:locale",
        permanent: false,
      },
      {
        source: "/:locale(en|ja)/blog",
        destination: "/:locale",
        permanent: false,
      },
      {
        source: "/:locale(en|ja)/experience",
        destination: "/:locale",
        permanent: false,
      },
      {
        source: "/:locale(en|ja)/contact",
        destination: "/:locale",
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);

import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
// astro:content からの z の再エクスポートは Astro 7 で非推奨のため zod を直接使う
import { z } from "zod";

// 記事は content/blog/{locale}/{year}/{slug}.md に置く。
// glob ローダーが生成する id は "en/2025/20250901" の形になるため、
// ページ側では先頭のロケールで絞り込み、末尾を slug として扱う。
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    excerpt: z.string(),
  }),
});

export const collections = { blog };

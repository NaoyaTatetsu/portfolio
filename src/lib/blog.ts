import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

export interface BlogPost extends BlogPostMeta {
  contentHtml: string;
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function getYearDirs(localeDir: string): string[] {
  if (!fs.existsSync(localeDir)) {
    return [];
  }
  return fs
    .readdirSync(localeDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(localeDir, entry.name));
}

function getPostFilePaths(locale: string): string[] {
  const localeDir = path.join(BLOG_DIR, locale);
  return getYearDirs(localeDir).flatMap((yearDir) =>
    fs
      .readdirSync(yearDir)
      .filter((file) => file.endsWith(".md"))
      .map((file) => path.join(yearDir, file)),
  );
}

function getPostFilePath(locale: string, slug: string): string {
  const year = slug.slice(0, 4);
  return path.join(BLOG_DIR, locale, year, `${slug}.md`);
}

export function getAllBlogPosts(locale: string): BlogPostMeta[] {
  const posts = getPostFilePaths(locale).map((filePath) => {
    const { data } = matter(fs.readFileSync(filePath, "utf8"));
    return {
      slug: path.basename(filePath, ".md"),
      title: data.title as string,
      date: data.date as string,
      excerpt: data.excerpt as string,
    };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getBlogPostBySlug(
  locale: string,
  slug: string,
): Promise<BlogPost | null> {
  const filePath = getPostFilePath(locale, slug);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const { data, content } = matter(fs.readFileSync(filePath, "utf8"));
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml)
    .process(content);

  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    excerpt: data.excerpt as string,
    contentHtml: processed.toString(),
  };
}

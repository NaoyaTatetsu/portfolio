import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getAllBlogPosts } from "@/lib/blog";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("pages");

  const posts = getAllBlogPosts(locale);

  return (
    <div className="w-full px-4 self-start pt-7">
      <div className="max-w-7xl mx-auto">
        <div className="text-3xl mb-14 text-center font-bold">{t("blog")}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex flex-col rounded-xl border border-zinc-200 dark:border-[#323a4a] bg-white dark:bg-[#242a38] shadow-sm hover:shadow-md dark:shadow-black/30 transition-shadow p-5"
            >
              <div className="text-lg font-semibold mb-2">{post.title}</div>
              <div className="text-sm mb-3 text-zinc-500 dark:text-zinc-400">
                {post.date}
              </div>
              <div className="text-sm opacity-80 line-clamp-3">
                {post.excerpt}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

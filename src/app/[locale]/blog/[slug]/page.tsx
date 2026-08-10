import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog";

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllBlogPosts(locale).map((post) => ({ locale, slug: post.slug })),
  );
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  const post = await getBlogPostBySlug(locale, slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="w-full px-4 self-start pt-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center">
          <article className="mb-8 w-full max-w-3xl">
            <h1 className="text-xl font-bold mb-4">{post.title}</h1>
            <div className="text-sm mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
              {post.date}
            </div>
            <div
              className="prose prose-zinc dark:prose-invert max-w-none prose-pre:bg-[#ebedf1] prose-pre:text-[#3d4450] dark:prose-pre:bg-[#2d3444] dark:prose-pre:text-[#cdd3de]"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: content is authored by us, not user input
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </article>
        </div>
      </div>
    </div>
  );
}

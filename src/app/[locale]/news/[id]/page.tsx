import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

interface NewsItem {
  title: string;
  content: string;
  date: string;
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tNews = await getTranslations("news");

  const newsItems: NewsItem[] = tNews.raw("items") as NewsItem[];
  const newsIndex = parseInt(id, 10);

  if (isNaN(newsIndex) || newsIndex < 0 || newsIndex >= newsItems.length) {
    notFound();
  }

  const newsItem = newsItems[newsIndex];

  return (
    <div className="w-full px-4 self-start pt-24">
      <div className="max-w-4xl mx-auto">
        <article className="pb-8 mb-8">
          <h1 className="text-xl font-bold mb-4">{newsItem.title}</h1>
          <div className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            {newsItem.date}
          </div>
          <div className="mb-4">{newsItem.content}</div>
        </article>
      </div>
    </div>
  );
}

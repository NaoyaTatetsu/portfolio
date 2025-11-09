import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

interface NewsItem {
  title: string;
  content: string;
  date: string;
}

export default async function NewsPage({ params }: PageProps) {
  await params;
  const t = await getTranslations("pages");
  const tNews = await getTranslations("news");

  const newsItems: NewsItem[] = tNews.raw("items") as NewsItem[];

  return (
    <div className="w-full px-4 self-start pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-2xl mb-8 text-center font-bold">{t("news")}</div>
        <div className="space-y-6">
          {newsItems.map((item, index) => (
            <Link
              key={`${item.title}-${index}`}
              href={`/news/${index}`}
              className="flex items-center justify-between border-b border-gray-200 pb-6 transition-colors p-4 -m-4 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <div className="flex-1">
                <div className="text-lg font-semibold mb-2">{item.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  {item.date}
                </div>
              </div>
              <div className="ml-4 text-gray-400 dark:text-gray-500 font-black text-2xl">
                ➔
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

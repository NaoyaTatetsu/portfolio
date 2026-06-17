"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

interface NewsItem {
  title: string;
  content: string;
  date: string;
}

export default function NewsScreen() {
  const tPages = useTranslations("pages");
  const tNews = useTranslations("news");
  const items = tNews.raw("items") as NewsItem[];
  const [selected, setSelected] = useState<number | null>(null);

  if (selected !== null && items[selected]) {
    const item = items[selected];
    return (
      <div className="w-full h-full overflow-auto px-6 py-5 text-zinc-900 dark:text-zinc-100">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="text-sm mb-3 text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back
        </button>
        <article>
          <h1 className="text-lg font-bold mb-2">{item.title}</h1>
          <div className="text-xs text-zinc-500 mb-4">{item.date}</div>
          <p className="text-sm leading-relaxed">{item.content}</p>
        </article>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto px-6 py-5 text-zinc-900 dark:text-zinc-100">
      <h1 className="text-xl font-bold mb-4">{tPages("news")}</h1>
      <ul className="flex flex-col gap-3">
        {items.map((item, index) => (
          <li key={item.title}>
            <button
              type="button"
              onClick={() => setSelected(index)}
              className="w-full text-left border-b border-zinc-200 dark:border-zinc-800 pb-3 hover:opacity-70 transition-opacity"
            >
              <div className="text-sm font-semibold">{item.title}</div>
              <div className="text-xs text-zinc-500">{item.date}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="w-full px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">{t("title")}</h2>
        <p className="mb-8">{t("description")}</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}

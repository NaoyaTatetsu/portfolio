"use client";

import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Link, routing, usePathname, useRouter } from "@/i18n/routing";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const switchLocale = (locale: string) => {
    router.replace(pathname, { locale });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getLocaleFlag = (locale: string) => {
    switch (locale) {
      case "en":
        return "🇺🇸";
      case "ja":
        return "🇯🇵";
      default:
        return locale;
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 dark:border-b dark:border-zinc-800 dark:bg-zinc-900/60 dark:backdrop-blur-sm"
      style={{
        backgroundColor: mounted && theme === "light" ? "#ffffff" : undefined,
        borderBottom: mounted && theme === "light" ? "none" : undefined,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <Link
            href="/"
            className="text-2xl hover:opacity-70 transition-opacity"
            aria-label="Home"
          >
            🏠
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              aria-label="Toggle theme"
            >
              {mounted ? (theme === "dark" ? "🌙" : "☀️") : "🌙"}
            </button>
            <div className="flex gap-2">
              {routing.locales.map((locale) => (
                <button
                  type="button"
                  key={locale}
                  onClick={() => switchLocale(locale)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    currentLocale === locale
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {getLocaleFlag(locale)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

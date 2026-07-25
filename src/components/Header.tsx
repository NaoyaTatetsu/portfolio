"use client";

import {
  ChevronDownIcon,
  HomeIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Link, routing, usePathname, useRouter } from "@/i18n/routing";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // メニュー外クリックとEscキーで閉じる
  useEffect(() => {
    if (!langOpen) return;

    const onMouseDown = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLangOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [langOpen]);

  const switchLocale = (locale: string) => {
    setLangOpen(false);
    router.replace(pathname, { locale });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getLocaleLabel = (locale: string) => {
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
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <Link
            href="/"
            className="hover:opacity-70 transition-opacity"
            aria-label="Home"
          >
            <HomeIcon className="w-7 h-7" />
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              aria-label="Toggle theme"
            >
              {mounted && theme === "light" ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangOpen((open) => !open)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                aria-label="Switch language"
              >
                {getLocaleLabel(currentLocale)}
                <ChevronDownIcon
                  className={`w-3.5 h-3.5 transition-transform ${langOpen ? "rotate-180" : ""}`}
                />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 min-w-full overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm shadow-lg">
                  {routing.locales
                    .filter((locale) => locale !== currentLocale)
                    .map((locale) => (
                      <button
                        type="button"
                        key={locale}
                        onClick={() => switchLocale(locale)}
                        className="block w-full px-3 py-1.5 text-sm font-medium text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      >
                        {getLocaleLabel(locale)}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

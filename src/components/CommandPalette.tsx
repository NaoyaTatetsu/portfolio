"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "@/i18n/routing";

interface Command {
  id: string;
  label: string;
  icon: string;
  external?: boolean;
  run: () => void;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const t = useTranslations("palette");
  const tHome = useTranslations("home");

  const commands: Command[] = useMemo(
    () => [
      {
        id: "home",
        label: tHome("title"),
        icon: "🏠",
        run: () => router.push("/"),
      },
      {
        id: "profile",
        label: tHome("profile"),
        icon: "👤",
        run: () => router.push("/profile"),
      },
      {
        id: "news",
        label: tHome("news"),
        icon: "📰",
        run: () => router.push("/news"),
      },
      {
        id: "experience",
        label: tHome("experience"),
        icon: "🏢",
        run: () => router.push("/experience"),
      },
      {
        id: "theme",
        label: t("toggleTheme"),
        icon: "🌓",
        run: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
      {
        id: "locale",
        label: t("switchLocale"),
        icon: "🌐",
        run: () =>
          router.replace(pathname, { locale: locale === "ja" ? "en" : "ja" }),
      },
      {
        id: "github",
        label: "GitHub",
        icon: "🐙",
        external: true,
        run: () =>
          window.open("https://github.com/NaoyaTatetsu", "_blank", "noopener"),
      },
      {
        id: "x",
        label: "X (Twitter)",
        icon: "🐦",
        external: true,
        run: () => window.open("https://x.com/tttnaobi", "_blank", "noopener"),
      },
    ],
    [router, pathname, locale, theme, setTheme, t, tHome],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((cmd) =>
      `${cmd.label} ${cmd.id}`.toLowerCase().includes(q),
    );
  }, [commands, query]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      inputRef.current?.focus();
    }
  }, [open]);

  const runCommand = (cmd: Command) => {
    setOpen(false);
    cmd.run();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((prev) => (prev + 1) % Math.max(filtered.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected(
        (prev) =>
          (prev - 1 + Math.max(filtered.length, 1)) %
          Math.max(filtered.length, 1),
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[selected];
      if (cmd) runCommand(cmd);
    }
  };

  if (!open) return null;

  return (
    /* biome-ignore lint/a11y/useKeyWithClickEvents: Escapeキーで閉じられる */
    <div
      className="fixed inset-0 z-100 flex items-start justify-center bg-black/50 p-4 pt-[15vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: クリック伝播の停止のみ */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: クリック伝播の停止のみ */}
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900/95 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-zinc-700/60 px-4">
          <span className="font-mono text-emerald-400">❯</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t("placeholder")}
            className="w-full bg-transparent py-3 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            aria-label={t("placeholder")}
          />
          <kbd className="rounded border border-zinc-700 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
            ESC
          </kbd>
        </div>
        <ul className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center font-mono text-sm text-zinc-500">
              {t("noResults")}
            </li>
          )}
          {filtered.map((cmd, i) => (
            <li key={cmd.id}>
              <button
                type="button"
                onMouseEnter={() => setSelected(i)}
                onClick={() => runCommand(cmd)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  i === selected ? "bg-zinc-800 text-zinc-100" : "text-zinc-400"
                }`}
              >
                <span>{cmd.icon}</span>
                <span>{cmd.label}</span>
                {cmd.external && (
                  <span className="ml-auto text-zinc-600">↗</span>
                )}
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-zinc-700/60 px-4 py-2 font-mono text-[10px] text-zinc-500">
          ↑↓ navigate · ↵ run · esc close
        </div>
      </div>
    </div>
  );
}
